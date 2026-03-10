/* www/js/modules/calendar.js - V2.0 */
/* 行事曆整合：寫入系統行事曆 + 截止日推播通知 */
/* 插件需求（之後一口氣安裝）: @capacitor-community/calendar */

window.SQ = window.SQ || {};
window.SQ.Calendar = {

    // ── 公開 API ──────────────────────────────────────────

    /**
     * 將任務寫入系統行事曆 + 排程推播通知
     * @param {object} task - 完整 task 物件
     */
    addTask: async function(task) {
        // Pro 功能鎖
        if (window.SQ.Sub) {
            const check = window.SQ.Sub.canUseCalendar();
            if (!check.ok) {
                window.SQ.Sub.showUpgradePrompt(check.reason);
                return false;
            }
        }

        if (!task.deadline) {
            window.SQ.Actions?.toast('❌ 此任務沒有截止日');
            return false;
        }

        // 如果已同步，再次點擊 → 取消同步
        if (task.calendarSynced) {
            const stateTask = (window.SQ.State?.tasks || []).find(t => t.id === task.id);
            if (stateTask) {
                stateTask.calendarSynced = false;
                stateTask.calendarSyncTime = null;
            }
            if (window.App) App.saveData();
            window.SQ.Actions?.toast('🗓️ 已取消行事曆同步');
            window.SQ.Audio?.play('toggle_off');
            return false;
        }

        const results = { calendar: false, notification: false };

        // 1. 寫入系統行事曆
        results.calendar = await this._writeToCalendar(task);

        // 2. 排程推播通知（依玩家設定時間）
        results.notification = await this._scheduleDeadlineNotification(task);

        // 3. 記錄已同步：直接從 State 找 task 確保寫到原物件
        if (results.calendar || results.notification) {
            const stateTask = (window.SQ.State?.tasks || []).find(t => t.id === task.id);
            if (stateTask) {
                stateTask.calendarSynced = true;
                stateTask.calendarSyncTime = Date.now();
            } else {
                // 備用：直接改傳入的參考
                task.calendarSynced = true;
                task.calendarSyncTime = Date.now();
            }
            if (window.App) App.saveData();
        }

        // 4. 回饋訊息
        if (results.calendar && results.notification) {
            window.SQ.Actions?.toast('📅 已加入行事曆並設定提醒');
        } else if (results.calendar) {
            window.SQ.Actions?.toast('📅 已加入行事曆');
        } else if (results.notification) {
            window.SQ.Actions?.toast('🔔 已設定截止日提醒');
        } else {
            window.SQ.Actions?.toast('⚠️ 寫入失敗，請確認權限');
        }

        window.SQ.Audio?.play('save');
        return results.calendar || results.notification;
    },

    /**
     * 被動記錄：任務完成時自動寫入行事曆（當歷史紀錄）
     * 在 task.js 的 resolveTask 完成後呼叫
     */
    logCompleted: async function(task) {
        if (!task || !task.done) return;

        // 非 Capacitor 環境：靜默跳過（不 toast，避免干擾）
        if (!window.Capacitor || !Capacitor.Plugins?.CapacitorCalendar) {
            console.log('[Calendar] logCompleted 模擬:', task.title);
            return;
        }

        try {
            const { CapacitorCalendar } = Capacitor.Plugins;
            const now = new Date();
            const end = new Date(now.getTime() + 30 * 60 * 1000); // 完成時間 + 30 分鐘

            await CapacitorCalendar.createEvent({
                title:    `✓ ${task.title}`,
                location: '',
                notes:    `Questory 任務完成紀錄
分類：${task.cat || '未分類'}
獎勵：+${task.lastReward?.gold || 0}💰 +${task.lastReward?.exp || 0}✨`,
                startDate: now.getTime(),
                endDate:   end.getTime(),
                isAllDay:  false,
            });
        } catch (e) {
            // 靜默失敗，不影響主流程
            console.warn('[Calendar] logCompleted 失敗:', e);
        }
    },

    /**
     * 開啟同步確認視窗（手動同步時呼叫）
     * 掃描所有已同步任務，找出截止日已過且未完成的
     */
    openSyncModal: function() {
        const tasks = window.SQ.State?.tasks || [];
        const now   = new Date();
        now.setHours(0, 0, 0, 0);

        // 找出：已寫入行事曆 + 截止日已過 + 尚未完成
        const pendingTasks = tasks.filter(t =>
            t.calendarSynced &&
            !t.done &&
            t.deadline &&
            new Date(t.deadline) <= now
        );

        if (pendingTasks.length === 0) {
            window.SQ.Actions?.toast('✅ 沒有待確認的任務');
            return;
        }

        this._renderSyncModal(pendingTasks);
    },

    // ── 私有：寫入系統行事曆 ──────────────────────────────

    _writeToCalendar: async function(task) {
        // 非 Capacitor 環境：模擬成功（讓網頁也能測試流程）
        if (!window.Capacitor || !Capacitor.Plugins?.CapacitorCalendar) {
            console.log('[Calendar] 非 App 環境，模擬寫入:', task.title);
            return true;
        }

        try {
            const { CapacitorCalendar } = Capacitor.Plugins;

            // 確認權限
            const perm = await CapacitorCalendar.requestWriteOnlyCalendarAccess?.()
                      || await CapacitorCalendar.requestAllPermissions?.();
            if (!perm?.result?.includes('granted') && !perm?.granted) {
                console.warn('[Calendar] 無行事曆寫入權限');
                return false;
            }

            const deadline = new Date(task.deadline);
            // 設定為截止日當天 23:59
            const endTime = new Date(task.deadline);
            endTime.setHours(23, 59, 0, 0);
            deadline.setHours(0, 0, 0, 0);

            await CapacitorCalendar.createEvent({
                title:    `[Questory] ${task.title}`,
                location: '',
                notes:    task.desc || `來自 Questory 的任務`,
                startDate: deadline.getTime(),
                endDate:   endTime.getTime(),
                isAllDay:  true,
            });

            return true;
        } catch (e) {
            console.error('[Calendar] 寫入失敗:', e);
            return false;
        }
    },

    // ── 私有：排程推播通知 ────────────────────────────────

    _scheduleDeadlineNotification: async function(task) {
        if (!window.Capacitor || !Capacitor.Plugins?.LocalNotifications) {
            console.log('[Calendar] 非 App 環境，模擬通知排程:', task.title);
            return true;
        }

        try {
            const { LocalNotifications } = Capacitor.Plugins;
            const s = window.SQ.State?.settings || {};

            const deadline = new Date(task.deadline);
            const notifications = [];

            // 依玩家設定的通知時間（每日提醒時間）計算提醒點
            const notifyHour   = s.notifyDailyHour   ?? 9;
            const notifyMinute = s.notifyDailyMinute  ?? 0;

            // 截止當天的設定時間提醒
            const notifyAt = new Date(task.deadline);
            notifyAt.setHours(notifyHour, notifyMinute, 0, 0);

            const now = new Date();

            // 生成唯一 ID（用 task id hash 避免重複）
            const baseId = this._taskNotifId(task.id);

            // 當天提醒（如果還沒過）
            if (notifyAt > now) {
                notifications.push({
                    id:    baseId,
                    title: '⏰ 任務截止提醒',
                    body:  `「${task.title}」今天到期了！`,
                    schedule: { at: notifyAt },
                    sound:    'default',
                    smallIcon: 'ic_notification',
                    channelId: 'quest-deadline',
                    extra: { taskId: task.id }
                });
            }

            // 前一天提醒（截止日的前一天同樣時間）
            const dayBefore = new Date(notifyAt);
            dayBefore.setDate(dayBefore.getDate() - 1);
            if (dayBefore > now) {
                notifications.push({
                    id:    baseId + 1,
                    title: '📋 明天截止提醒',
                    body:  `「${task.title}」明天到期，記得完成！`,
                    schedule: { at: dayBefore },
                    sound:    'default',
                    smallIcon: 'ic_notification',
                    channelId: 'quest-deadline',
                    extra: { taskId: task.id }
                });
            }

            if (notifications.length === 0) {
                console.log('[Calendar] 截止日已過，不排程通知');
                return true;
            }

            await LocalNotifications.schedule({ notifications });
            return true;

        } catch (e) {
            console.error('[Calendar] 通知排程失敗:', e);
            return false;
        }
    },

    // ── 私有：同步確認視窗 ────────────────────────────────

    _renderSyncModal: function(pendingTasks) {
        const overlay = document.createElement('div');
        overlay.id = 'sq-cal-sync';
        overlay.style.cssText = `
            position:fixed; inset:0; z-index:10500;
            background:rgba(8,8,16,0.95);
            display:flex; flex-direction:column;
            align-items:center; justify-content:flex-start;
            padding:24px 20px; overflow-y:auto;
        `;

        const taskRows = pendingTasks.map(t => `
            <div style="display:flex; align-items:center; gap:12px;
                        padding:12px; border-radius:12px; margin-bottom:8px;
                        background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:0.92rem; font-weight:700; color:#fff;
                                white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${t.title}
                    </div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-top:2px;">
                        📅 ${t.deadline}
                    </div>
                </div>
                <div style="display:flex; gap:6px; flex-shrink:0;">
                    <button data-sync-done="${t.id}"
                            style="padding:6px 14px; border-radius:50px; border:none; cursor:pointer;
                                   background:#4caf87; color:#fff; font-size:0.82rem; font-weight:700;">
                        ✓ 完成
                    </button>
                    <button data-sync-skip="${t.id}"
                            style="padding:6px 12px; border-radius:50px; border:none; cursor:pointer;
                                   background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);
                                   font-size:0.82rem;">
                        跳過
                    </button>
                </div>
            </div>
        `).join('');

        overlay.innerHTML = `
            <div style="width:100%; max-width:400px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                    <div>
                        <div style="font-size:1.1rem; font-weight:800; color:#fff;">📅 行事曆同步</div>
                        <div style="font-size:0.8rem; color:rgba(255,255,255,0.4); margin-top:2px;">
                            以下任務已到截止日，完成了嗎？
                        </div>
                    </div>
                    <button id="sq-cal-close"
                            style="background:rgba(255,255,255,0.07); border:none; border-radius:50%;
                                   width:36px; height:36px; cursor:pointer; color:rgba(255,255,255,0.4);
                                   font-size:1.1rem;">✕</button>
                </div>
                <div id="sq-cal-list">${taskRows}</div>
                <button id="sq-cal-done-all"
                        style="width:100%; margin-top:12px; padding:13px; border-radius:50px;
                               border:none; cursor:pointer; background:var(--color-gold, #f0a500);
                               color:#111; font-weight:700; font-size:0.95rem;">
                    全部完成 ✓
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // 事件委派
        overlay.addEventListener('click', (e) => {
            const doneId = e.target.dataset.syncDone;
            const skipId = e.target.dataset.syncSkip;

            if (doneId) {
                this._completeTask(doneId);
                e.target.closest('[style*="display:flex"]')?.remove();
                this._checkEmpty(overlay);
            }
            if (skipId) {
                e.target.closest('[style*="display:flex"]')?.remove();
                this._checkEmpty(overlay);
            }
            if (e.target.id === 'sq-cal-close') {
                overlay.remove();
            }
            if (e.target.id === 'sq-cal-done-all') {
                pendingTasks.forEach(t => this._completeTask(t.id));
                overlay.remove();
                window.SQ.Actions?.toast(`✅ ${pendingTasks.length} 個任務已完成！`);
                window.SQ.Audio?.feedback('achievement');
            }
        });
    },

    _checkEmpty: function(overlay) {
        const list = overlay.querySelector('#sq-cal-list');
        if (list && list.children.length === 0) {
            overlay.remove();
            window.SQ.Actions?.toast('✅ 同步完成');
        }
    },

    _completeTask: function(taskId) {
        const task = (window.SQ.State?.tasks || []).find(t => t.id === taskId);
        if (!task || task.done) return;
        if (window.SQ.Engine?.Task?.toggleTask) {
            window.SQ.Engine.Task.toggleTask(taskId);
        }
        window.SQ.Audio?.feedback('taskComplete');
    },

    // 把 task id 轉成穩定的數字 ID（LocalNotifications 需要 int）
    _taskNotifId: function(taskId) {
        let hash = 5000;
        for (let i = 0; i < taskId.length; i++) {
            hash = ((hash << 5) - hash) + taskId.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % 90000 + 5000; // 5000–95000 範圍，避免跟其他通知衝突
    },
};
