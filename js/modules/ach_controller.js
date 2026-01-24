/* js/modules/ach_controller.js - Ach Controller */
window.AchController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act
        Object.assign(window.act, {
            // CRUD
            submitAchievement: () => AchEngine.submitAchievement(),
            deleteAchievement: (id) => {
                if(confirm("確定刪除此成就？")) AchEngine.deleteAchievement(id);
            },
            editAchievement: (id) => window.EventBus.emit(E.Ach.EDIT_MODE, { achId: id }),
            createAch: () => window.EventBus.emit(E.Ach.EDIT_MODE, { achId: null }), // 給 FAB 用的
            
            // 操作
            doCheckIn: (id) => AchEngine.doCheckIn(id),
            claim: (id) => AchEngine.claimAchievement(id),
            editAch: (id) => window.EventBus.emit(E.Ach.EDIT_MODE, { achId: id })
        });

        // B. 監聽導航
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'milestone') {
                achView.renderMilestonePage();
            }
        });

        // C. 監聽編輯模式
        EventBus.on(E.Ach.EDIT_MODE, (data) => {
            achView.renderCreateAchForm(data.achId);
        });

        // D. 監聽數據變動 (自動檢查條件)
        EventBus.on(E.Task.COMPLETED, (data) => {
            AchEngine.checkConditions('TASK_COMPLETED', data);
        });
        EventBus.on(E.Stats.UPDATED, () => {
            AchEngine.checkConditions('STATS_UPDATED', {});
        });

        // E. 監聽自身更新 (刷新列表)
        EventBus.on(E.Ach.UPDATED, () => {
            // 如果當前在任務頁面 (顯示成就Tab)，需要重繪
            if (window.TempState.currentView === 'tasks' && window.TempState.taskTab === 'ach') {
                if(window.view && view.renderTasks) view.renderTasks();
            }
        });

        console.log("✅ AchController (成就) 模組就緒");
    }
};