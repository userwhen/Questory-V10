/* js/modules/ach_controller.js - V40.2 (Fixed checkInAch Action) */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Ach = {
    _initialized: false,
    init: function() {
        const E = window.SQ.Events;
        if (!window.SQ.EventBus || !E) return;

        Object.assign(window.SQ.Actions, {
            // A. 開啟建立表單
            openCreateCustomAch: () => {
                window.SQ.Temp.editingAch = JSON.parse(JSON.stringify({
                    id: null,
                    title: '',
                    targetType: 'tag', 
                    targetValue: '運動',
                    tier: 'C'          
                }));
                window.SQ.EventBus.emit(window.SQ.Events.Ach.EDIT_MODE);
            },

            // B. 提交建立/更新
            submitMilestone: () => {
                const data = window.SQ.Temp.editingAch;
                if (!data || !data.title) {
                    window.SQ.Audio?.feedback('taskUndo'); // 👈 新增：防呆失敗音效
                    return window.SQ.Actions.toast("⚠️ 請輸入目標名稱");
                }
                
                if (data.id) {
                    window.SQ.Engine.Ach.updateMilestone({
                        id: data.id,
                        title: data.title,
                        targetType: data.targetType,
                        targetValue: data.targetValue,
                        tier: data.tier,
						isUpgradeable: data.isUpgradeable // 👈 補上這行
                    });
                    window.SQ.Actions.toast("✅ 目標已更新！");
                } else {
                    window.SQ.Engine.Ach.createMilestone({
                        title: data.title,
                        targetType: data.targetType,
                        targetValue: data.targetValue,
                        tier: data.tier,
						isUpgradeable: data.isUpgradeable // 👈 補上這行
                    });
                    window.SQ.Actions.toast("✅ 目標已建立！");
                }
                window.SQ.Audio?.play('save'); // 👈 新增：儲存成功音效
                if (window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
            },
            
            editAch: (id) => {
                if (window.SQ.View.Ach && window.SQ.View.Ach.renderCreateAchForm) {
                    window.SQ.View.Ach.renderCreateAchForm(id);
                }
            },

            // C. 領取獎勵
            claimReward: (id) => {
                const result = window.SQ.Engine.Ach.claimReward(id);
				if (result.success) {
					const r = result.reward;
					window.SQ.Actions.toast(`🎉 領取成功！ +${r.gold}💰 +${r.exp}✨`);
					window.SQ.Audio?.feedback('achievement'); // 👈 新增這行 (成就達成音效)
				} else {
					window.SQ.Actions.toast(`❌ ${result.msg}`);
					window.SQ.Audio?.feedback('taskUndo'); // 👈 新增這行 (領取失敗音效)
				}
            },

            // D. 刪除
            deleteAchievement: (id) => {
                const doDelete = () => {
                    window.SQ.Engine.Ach.deleteMilestone(id);
                    window.SQ.Audio?.play('delete');
                    if (window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
                    window.SQ.Actions.toast('🗑️ 已刪除');
                };
                if(window.sys && sys.confirm) sys.confirm('確定放棄此目標？', doDelete);
            },

            // E. [Fix] 補回簽到功能
            checkInAch: (id) => {
                const gs = window.SQ.State || {};
                const achList = gs.achievements || [];
                const msList = gs.milestones || [];
                const ach = achList.find(m => m.id === id) || msList.find(m => m.id === id);
                            
                if (ach && ach.type === 'check_in') {
                    ach.done = true;
                    ach.finishDate = Date.now();
                    
                    // 1. 發送每日打卡獎勵
                    const reward = ach.reward || { gold: 20, exp: 10 };
                    gs.gold = (gs.gold || 0) + reward.gold;
                    
                    if (window.SQ.Engine && window.SQ.Engine.Stats && typeof window.SQ.Engine.Stats.addPlayerExp === 'function') {
                        window.SQ.Engine.Stats.addPlayerExp(reward.exp);
                    } else {
                        gs.exp = (gs.exp || 0) + reward.exp;
                    }

                    // 🌟 2. [選項 B 核心] 在按下去的這一刻，手動推進「冒險足跡」的進度！
                    const targets = [...msList, ...achList];
                    targets.forEach(ms => {
                        if (ms.done) return;
                        // 只要是登入天數或連續登入的成就，就在打卡時 +1
                        if (ms.targetType === 'login_days' || ms.targetType === 'login_streak') {
                            ms.curr = (ms.curr || 0) + 1;
                            
                            // 檢查是否達成目標 (0/7 -> 7/7)
                            if (ms.curr >= ms.target) {
                                ms.curr = ms.target;
                                ms.done = true;
                                if (window.SQ.Actions && window.SQ.Actions.toast) {
                                    setTimeout(() => window.SQ.Actions.toast(`🎉 目標達成：${ms.title}`), 500);
                                }
                            }
                        }
                    });

                    // 3. 存檔與通知
                    if (window.SQ.Engine && window.SQ.Engine.Ach && typeof window.SQ.Engine.Ach._saveAndNotify === 'function') {
                        window.SQ.Engine.Ach._saveAndNotify();
                    }

                    // 4. 畫面與音效回饋
                    if (window.SQ.Actions && typeof window.SQ.Actions.toast === 'function') {
                        window.SQ.Actions.toast(`🎁 領取成功！ +${reward.gold}💰 +${reward.exp}✨`);
                    }
                    if (window.SQ.Audio && typeof window.SQ.Audio.feedback === 'function') {
                        window.SQ.Audio.feedback('taskComplete');
                    }
                    
                    // 5. 更新上方資源列
                    if (window.view && typeof window.view.updateHUD === 'function') {
                        window.view.updateHUD(gs);
                    } else if (window.view && typeof window.view.initHUD === 'function') {
                        window.view.initHUD(gs);
                    }
                } else {
                    console.warn("⚠️ 打卡失敗：找不到目標，或型別不是 check_in");
                }
            }
        });

        // ============================
        // 事件監聽 (Receiver)
        // ============================
        window.SQ.EventBus.on(E.Ach.EDIT_MODE, () => {
            if (window.SQ.View.Ach && window.SQ.View.Ach.renderCreateAchForm) {
                window.SQ.View.Ach.renderCreateAchForm(null);
            }
        });

        window.SQ.EventBus.on(E.Task.COMPLETED, (payload) => {
            if (payload && payload.task) {
                window.SQ.Engine.Ach.onTaskCompleted(payload.task, payload.impact);
            }
        });

        window.SQ.EventBus.on(E.Task.UNCOMPLETED, (payload) => {
            if (payload && payload.task) {
                window.SQ.Engine.Ach.onTaskUndone(payload.task, payload.impact);
            }
        });

        window.SQ.EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'milestone') {
                if (window.SQ.View.Ach && window.SQ.View.Ach.renderMilestonePage) {
                    window.SQ.View.Ach.renderMilestonePage();
                }
            }
        });
		window.SQ.EventBus.on('TIMER_COMPLETED', (data) => {
            if (window.SQ.Engine.Ach.onTimerCompleted) {
                window.SQ.Engine.Ach.onTimerCompleted(data.mode, data.minutes);
            }
        });
		
        console.log("✅ AchController V40.2 Fixed (checkInAch Added).");
    }
};
window.AchController = window.SQ.Controller.Ach;