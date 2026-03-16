/* www/js/modules/calendar.js - V2.1 */
/* 行事曆整合：寫入系統行事曆 + 截止日推播通知 */
/* 插件需求: @capacitor-community/calendar */
/* 修復紀錄:
 *   V2.1 - [Fix A] _writeToCalendar 回傳 boolean 時也儲存 eventId (避免刪除失敗)
 *        - [Fix B] _completeTask 改為呼叫正確的 resolveTask (原本錯寫成 toggleTask)
 *        - [Fix C] 非 Capacitor 環境的模擬模式也會正確儲存 calendarEventId
 */

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
            
            // 👇 [新增] 網頁測試環境的模擬 Log
            if (!window.Capacitor || !Capacitor.Plugins?.CapacitorCalendar) {
                console.log(`[Calendar] (模擬) 玩家手動取消同步，已刪除行事曆事件 ID: ${task.calendarEventId}`);
                console.log(`[Calendar] (模擬) 已取消該任務的推播通知`);
            } 
            // 👇 下面維持原本的真機執行邏輯
            else {
                // 1. 從系統行事曆刪除
                if (task.calendarEventId) {
                    try {
                        if (Capacitor.Plugins.CapacitorCalendar.deleteEventById) {
                            await Capacitor.Plugins.CapacitorCalendar.deleteEventById({ id: task.calendarEventId });
                        } else if (Capacitor.Plugins.CapacitorCalendar.deleteEventsById) {
                            await Capacitor.Plugins.CapacitorCalendar.deleteEventsById({ ids: [task.calendarEventId] });
                        }
                        console.log('[Calendar] 已刪除行事曆事件 ID:', task.calendarEventId);
                    } catch(e) { console.warn('[Calendar] 刪除行事曆事件失敗:', e); }
                }

                // 2. 取消排程的推播通知
                if (Capacitor.Plugins?.LocalNotifications) {
                    try {
                        const baseId = this._taskNotifId(task.id);
                        await Capacitor.Plugins.LocalNotifications.cancel({
                            notifications: [{ id: baseId }, { id: baseId + 1 }]
                        });
                    } catch(e) { console.warn('[Calendar] 取消推播通知失敗:', e); }
                }
            }

            // 3. 更新系統狀態
            const stateTask = (window.SQ.State?.tasks || []).find(t => t.id === task.id);
            if (stateTask) {
                stateTask.calendarSynced  = false;
                stateTask.calendarSyncTime = null;
                stateTask.calendarEventId  = null;
            }
            if (window.App) App.saveData();
            
            // 觸發 UI 更新 (讓按鈕馬上變回 🗓️ 且顏色變淡)
            if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Task.UPDATED);
            
            window.SQ.Actions?.toast('🗓️ 已取消行事曆同步並移除紀錄');
            window.SQ.Audio?.play('toggle_off');
            return false;
        }

        const results = { calendar: false, notification: false };

        // 1. 寫入系統行事曆
        results.calendar = await this._writeToCalendar(task);

        // 2. 排程推播通知
        results.notification = await this._scheduleDeadlineNotification(task);

        // 3. 記錄已同步
        if (results.calendar || results.notification) {
            const stateTask = (window.SQ.State?.tasks || []).find(t => t.id === task.id);
            if (stateTask) {
                stateTask.calendarSynced   = true;
                stateTask.calendarSyncTime = Date.now();

                // ✅ [Fix A] 同時處理字串 ID 和 boolean 兩種回傳值
                // _writeToCalendar 在 App 環境回傳 eventId (字串/數字)
                // 在非 App 環境回傳 true (boolean)，此時存入模擬 ID 供測試用
                if (typeof results.calendar === 'string' || typeof results.calendar === 'number') {
                    stateTask.calendarEventId = String(results.calendar);
                } else if (results.calendar === true) {
                    // 非 Capacitor 環境 (網頁測試)：存入模擬 ID，讓「取消同步」流程也能跑通
                    stateTask.calendarEventId = 'mock_' + task.id;
                }
            } else {
                task.calendarSynced   = true;
                task.calendarSyncTime = Date.now();
                if (typeof results.calendar === 'string' || typeof results.calendar === 'number') {
                    task.calendarEventId = String(results.calendar);
                }
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

    //任務完成時：移動行事曆事件到今天，並取消未來的推播通知//

    markAsDoneInCalendar: async function(task) {
        // 👇 新增這段：針對電腦網頁測試環境的模擬輸出
        if (!window.Capacitor || !Capacitor.Plugins?.CapacitorCalendar) {
            if (task.calendarSynced) {
                console.log(`[Calendar] (模擬) 已取消未來的推播通知`);
                console.log(`[Calendar] (模擬) 行事曆事件已移動並標記為完成`);
            }
            return;
        }
        
        // 1. 取消推播通知 (避免未來還跳通知)
        if (Capacitor.Plugins?.LocalNotifications) {
            try {
                const baseId = this._taskNotifId(task.id);
                await Capacitor.Plugins.LocalNotifications.cancel({
                    notifications: [{ id: baseId }, { id: baseId + 1 }]
                });
                console.log('[Calendar] 已取消未來的推播通知');
            } catch(e) { console.warn('[Calendar] 取消通知失敗:', e); }
        }

        // 2. 處理行事曆事件的「移動與改名」
        if (!task.calendarSynced || !Capacitor.Plugins?.CapacitorCalendar) return;

        try {
            const { CapacitorCalendar } = Capacitor.Plugins;

            // 為了雙平台穩定性，我們用「先刪除舊事件，再建立新事件」來達成完美的「移動」效果
            if (task.calendarEventId) {
                if (CapacitorCalendar.deleteEventById) {
                    await CapacitorCalendar.deleteEventById({ id: task.calendarEventId }).catch(() => {});
                } else if (CapacitorCalendar.deleteEventsById) {
                    await CapacitorCalendar.deleteEventsById({ ids: [task.calendarEventId] }).catch(() => {});
                }
            }

            // 在「現在」建立一個已完成的紀錄 (佔用 30 分鐘區塊)
            const now = new Date();
            const end = new Date(now.getTime() + 30 * 60 * 1000); 
            
            const result = await CapacitorCalendar.createEvent({
                title:     `✓ ${task.title}`,
                location:  '',
                notes:     `完成時間：${now.toLocaleString()}\n分類：${task.cat || '未分類'}\n獎勵：+${task.lastReward?.gold || 0}💰 +${task.lastReward?.exp || 0}✨`,
                startDate: now.getTime(),
                endDate:   end.getTime(),
                isAllDay:  false, // 變成有明確時間點的紀錄
            });

            // 存下新的事件 ID，確保資料連貫
            if (result && (result.eventId || result.id)) {
                task.calendarEventId = String(result.eventId || result.id);
            }
            console.log('[Calendar] 行事曆事件已移動並標記為完成');

        } catch (e) {
            console.warn('[Calendar] 行事曆更新失敗:', e);
        }
    },

    /**
     * 開啟同步確認視窗
     */
    openSyncModal: function() {
        const tasks = window.SQ.State?.tasks || [];
        const now   = new Date();
        now.setHours(0, 0, 0, 0);

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
        if (!window.Capacitor || !Capacitor.Plugins?.CapacitorCalendar) {
            console.log('[Calendar] 非 App 環境，模擬寫入:', task.title);
            return true; // 回傳 boolean，addTask 會存入模擬 ID
        }

        try {
            const { CapacitorCalendar } = Capacitor.Plugins;

            // 確認寫入權限
            const perm = await CapacitorCalendar.requestWriteOnlyCalendarAccess?.()
                      || await CapacitorCalendar.requestAllPermissions?.();
            if (!perm?.result?.includes('granted') && !perm?.granted) {
                console.warn('[Calendar] 無行事曆寫入權限');
                return false;
            }

            const deadline = new Date(task.deadline);
            const endTime  = new Date(task.deadline);
            endTime.setHours(23, 59, 0, 0);
            deadline.setHours(0, 0, 0, 0);

            const result = await CapacitorCalendar.createEvent({
                title:     `[Questory] ${task.title}`,
                location:  '',
                notes:     task.desc || '來自 Questory 的任務',
                startDate: deadline.getTime(),
                endDate:   endTime.getTime(),
                isAllDay:  true,
            });

            // ✅ 依照 CapacitorCalendar 不同版本的回傳格式，依序嘗試
            if (result && result.eventId) return String(result.eventId);
            if (result && result.id)      return String(result.id);
            if (typeof result === 'string' && result.length > 0) return result;

            // 找不到 ID：寫入成功但無法刪除，回傳 true
            console.warn('[Calendar] createEvent 成功但未回傳 eventId，result:', result);
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

            const notifyHour   = s.notifyDailyHour   ?? 9;
            const notifyMinute = s.notifyDailyMinute  ?? 0;

            const notifyAt = new Date(task.deadline);
            notifyAt.setHours(notifyHour, notifyMinute, 0, 0);

            const now = new Date();
            const baseId = this._taskNotifId(task.id);
            const notifications = [];

            if (notifyAt > now) {
                notifications.push({
                    id:        baseId,
                    title:     '⏰ 任務截止提醒',
                    body:      `「${task.title}」今天到期了！`,
                    schedule:  { at: notifyAt },
                    sound:     'default',
                    smallIcon: 'ic_notification',
                    channelId: 'quest-deadline',
                    actionTypeId: 'TASK_ACTION',
                    extra:     { taskId: task.id }
                });
            }

            const dayBefore = new Date(notifyAt);
            dayBefore.setDate(dayBefore.getDate() - 1);
            if (dayBefore > now) {
                notifications.push({
                    id:        baseId + 1,
                    title:     '📋 明天截止提醒',
                    body:      `「${task.title}」明天到期，記得完成！`,
                    schedule:  { at: dayBefore },
                    sound:     'default',
                    smallIcon: 'ic_notification',
                    channelId: 'quest-deadline',
                    extra:     { taskId: task.id }
                });
            }

            if (notifications.length === 0) return true;

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
            <div data-task-row="${t.id}" style="display:flex; align-items:center; gap:12px;
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

        overlay.addEventListener('click', (e) => {
            const doneId = e.target.dataset.syncDone;
            const skipId = e.target.dataset.syncSkip;

            if (doneId) {
                this._completeTask(doneId);
                overlay.querySelector(`[data-task-row="${doneId}"]`)?.remove();
                this._checkEmpty(overlay);
            }
            if (skipId) {
                overlay.querySelector(`[data-task-row="${skipId}"]`)?.remove();
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

    // ✅ [Fix B] 改為呼叫正確的 resolveTask（原本錯用了不存在的 toggleTask）
    _completeTask: function(taskId) {
        const task = (window.SQ.State?.tasks || []).find(t => t.id === taskId);
        if (!task || task.done) return;

        if (window.SQ.Engine?.Task?.resolveTask) {
            window.SQ.Engine.Task.resolveTask(taskId);
        } else {
            console.warn('[Calendar] 找不到 SQ.Engine.Task.resolveTask');
        }
        window.SQ.Audio?.feedback('taskComplete');
    },

    // 把 task id 轉成穩定的數字 ID
    _taskNotifId: function(taskId) {
        let hash = 5000;
        for (let i = 0; i < taskId.length; i++) {
            hash = ((hash << 5) - hash) + taskId.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % 90000 + 5000;
    },
};