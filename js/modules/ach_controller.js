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
                if (!data || !data.title) return window.SQ.Actions.toast("⚠️ 請輸入目標名稱");
                
                if (data.id) {
                    window.SQ.Engine.Ach.updateMilestone({
                        id: data.id,
                        title: data.title,
                        targetType: data.targetType,
                        targetValue: data.targetValue,
                        tier: data.tier
                    });
                    window.SQ.Actions.toast("✅ 目標已更新！");
                } else {
                    window.SQ.Engine.Ach.createMilestone({
                        title: data.title,
                        targetType: data.targetType,
                        targetValue: data.targetValue,
                        tier: data.tier
                    });
                    window.SQ.Actions.toast("✅ 目標已建立！");
                }
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
                } else {
                    window.SQ.Actions.toast(`❌ ${result.msg}`);
                }
            },

            // D. 刪除
            deleteAchievement: (id) => {
                const doDelete = () => {
                    window.SQ.Engine.Ach.deleteMilestone(id);
                    if (window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
                    window.SQ.Actions.toast('🗑️ 已刪除');
                };
                if(window.sys && sys.confirm) sys.confirm('確定放棄此目標？', doDelete);
            },

            // E. [Fix] 補回簽到功能
            checkInAch: (id) => {
                const ach = window.SQ.State.milestones.find(m => m.id === id);
                if (ach && ach.type === 'check_in') {
                    ach.done = true;
                    ach.finishDate = Date.now();
                    // 呼叫引擎存檔並發送刷新 UI 的訊號
                    if (window.SQ.Engine.Ach._saveAndNotify) {
                        window.SQ.Engine.Ach._saveAndNotify();
                    }
                    window.SQ.Actions.toast("✅ 今日簽到成功！");
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

        console.log("✅ AchController V40.2 Fixed (checkInAch Added).");
    }
};
window.AchController = window.SQ.Controller.Ach;