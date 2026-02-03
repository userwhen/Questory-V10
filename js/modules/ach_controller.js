/* js/modules/ach_controller.js - V40.1 Fixed (Listener Added) */
window.AchController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        Object.assign(window.act, {
            // A. 開啟建立表單 (發送訊號)
            openCreateCustomAch: () => {
                // 初始化暫存物件
                window.TempState.editingAch = {
                    title: '',
                    targetType: 'tag', 
                    targetValue: '運動',
                    tier: 'C'          
                };
                console.log("📡 發送成就編輯訊號..."); // Debug
                window.EventBus.emit(E.Ach.EDIT_MODE);
            },

            // B. 提交建立
            submitMilestone: () => {
                const data = window.TempState.editingAch;
                if (!data || !data.title) return window.act.toast("⚠️ 請輸入目標名稱");
                
                AchEngine.createMilestone({
                    title: data.title,
                    targetType: data.targetType,
                    targetValue: data.targetValue,
                    tier: data.tier
                });

                if (window.act.closeModal) window.act.closeModal('overlay');
                window.act.toast("✅ 目標已建立！");
            },

            // C. 領取獎勵
            claimReward: (id) => {
                const result = AchEngine.claimReward(id);
                if (result.success) {
                    const r = result.reward;
                    window.act.toast(`🎉 領取成功！ +${r.gold}💰 +${r.exp}✨`);
                } else {
                    window.act.toast(`❌ ${result.msg}`);
                }
            },

            // D. 刪除
            deleteAchievement: (id) => {
                const doDelete = () => {
                    AchEngine.deleteMilestone(id);
                    if (window.act.closeModal) window.act.closeModal('overlay');
                    window.act.toast('🗑️ 已刪除');
                };
                if(window.sys && sys.confirm) sys.confirm('確定放棄此目標？', doDelete);
            }
        });

        // ============================
        // 事件監聽 (Receiver)
        // ============================

        // 1. [補回這個缺失的部分] 監聽編輯模式 -> 呼叫 View 打開視窗
        EventBus.on(E.Ach.EDIT_MODE, () => {
            console.log("📥 收到成就編輯訊號，呼叫 View...");
            if (window.achView && achView.renderCreateAchForm) {
                // 傳入 null 代表新增模式
                achView.renderCreateAchForm(null);
            } else {
                console.error("❌ achView.renderCreateAchForm 未定義");
            }
        });

        // 2. 任務完成 -> 觸發 Engine 計算
        EventBus.on(E.Task.COMPLETED, (payload) => {
            if (payload && payload.task) {
                AchEngine.onTaskCompleted(payload.task, payload.impact);
            }
        });

        // 3. 導航監聽
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'milestone') {
                if (window.achView && achView.renderMilestonePage) {
                    achView.renderMilestonePage();
                }
            }
            if (pageId === 'task' && window.TempState.taskTab === 'ach') {
                 window.EventBus.emit(E.Ach.UPDATED);
            }
        });

        console.log("✅ AchController V40.1 Loaded (FAB Listener Fixed).");
    }
};