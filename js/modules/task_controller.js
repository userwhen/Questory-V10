/* js/modules/task_controller.js - V33.6 (Complete Controller) */
window.TaskController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act (對外接口)
        Object.assign(window.act, {
            // 基本 CRUD
            submitTask: () => TaskEngine.submitTask(),
            deleteTask: (id) => { if(confirm("確定刪除?")) TaskEngine.deleteTask(id); },
            resolveTask: (id) => TaskEngine.resolveTask(id),
            toggleTask: (id) => TaskEngine.resolveTask(id),
            editTask: (id) => EventBus.emit(E.Task.EDIT_MODE, { taskId: id }),
            copyTask: (id) => TaskEngine.copyTask(id),
            
            // 子任務與計次
            addSubtask: () => {
                const t = window.TempState.editingTask;
                if(t) { t.subs = t.subs || []; t.subs.push({text:'', done:false}); taskView.renderCreateTaskForm(t.id); }
            },
            removeSubtask: (idx) => {
                const t = window.TempState.editingTask;
                if(t && t.subs) { t.subs.splice(idx, 1); taskView.renderCreateTaskForm(t.id); }
            },
            updateSubtaskText: (idx, val) => {
                const t = window.TempState.editingTask;
                if(t && t.subs[idx]) t.subs[idx].text = val;
            },
            toggleSubtask: (id, idx) => TaskEngine.toggleSubtask(id, idx), // 列表頁直接切換
            incrementTask: (id) => TaskEngine.incrementTask(id),

            // 分類與過濾
            switchTaskTab: (tab) => { window.TempState.taskTab = tab; taskView.render(); },
            setTaskFilter: (cat) => { window.TempState.filterCategory = cat; taskView.render(); },
            setAchFilter: (cat) => { window.TempState.achFilter = cat; taskView.render(); },
            addNewCategory: () => {
                const name = prompt("請輸入新分類名稱：");
                if(name && name.trim()) {
                    window.GlobalState.taskCats.push(name.trim());
                    // 如果正在編輯，自動切換過去
                    if(window.TempState.editingTask) {
                        window.taskView.updateCategory(name.trim());
                    } else {
                        taskView.render(); // 刷新列表 filter
                    }
                }
            }
        });

        // B. 核心監聽
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'task') taskView.render();
            if (pageId === 'history' && taskView.renderHistoryPage) taskView.renderHistoryPage();
            if (pageId === 'milestone' && taskView.renderMilestonePage) taskView.renderMilestonePage();
        });

        const refresh = () => { if(window.TempState.currentView === 'tasks') taskView.render(); };
        
        EventBus.on(E.Task.CREATED, refresh);
        EventBus.on(E.Task.UPDATED, refresh);
        EventBus.on(E.Task.DELETED, refresh);
        EventBus.on(E.Task.COMPLETED, refresh);

        EventBus.on(E.Task.EDIT_MODE, (data) => taskView.renderCreateTaskForm(data.taskId));

        // 監聽鍵盤 (表單互動優化) - 選配
        // ...

        console.log("✅ TaskController (完整版) 啟動");
    }
};