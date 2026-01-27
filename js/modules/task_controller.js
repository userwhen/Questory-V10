/* js/modules/task_controller.js - V36.Final (Merged) */
window.TaskController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act (對外接口)
        Object.assign(window.act, {
            // 基本 CRUD
            submitTask: function() {
    // 1. 取得正在編輯的資料
    const taskData = window.TempState.editingTask;

    // 2. [新增] 檢查標題是否存在且不為空白
    if (!taskData || !taskData.title || taskData.title.trim() === "") {
        if (window.act && window.act.toast) {
            window.act.toast("⚠️ 請輸入任務名稱！");
        } else {
            alert("⚠️ 請輸入任務名稱！");
        }
        if (navigator.vibrate) navigator.vibrate(200);
        return; // ⛔ 阻擋
    }

    // 3. [補回] 原本的存檔邏輯 (如果被刪掉的話要補回來，否則任務無法儲存)
    // 假設您的 TaskEngine 負責處理資料，這裡需要呼叫它
    if (window.TaskEngine) {
        // 判斷是新增還是修改
        if (taskData.id) {
            window.TaskEngine.updateTask(taskData);
            window.act.toast("✅ 任務已更新");
        } else {
            window.TaskEngine.addTask(taskData);
            window.act.toast("✅ 任務已新增");
        }
    } else {
        // 如果沒有 TaskEngine，使用 GlobalState 直接操作的備案
        const gs = window.GlobalState;
        if (taskData.id) {
            const idx = gs.tasks.findIndex(t => t.id === taskData.id);
            if (idx !== -1) gs.tasks[idx] = JSON.parse(JSON.stringify(taskData));
        } else {
            taskData.id = Date.now().toString(36);
            taskData.createdAt = new Date().toISOString();
            gs.tasks.push(JSON.parse(JSON.stringify(taskData)));
        }
        if (window.App && window.App.saveData) window.App.saveData();
    }

    // 4. 關閉視窗並重繪
    ui.modal.close('m-overlay');
    if (window.taskView) window.taskView.render();

},
            
            // [修正] 使用 sys.confirm 取代原生 confirm
            deleteTask: (id) => {
                sys.confirm('確定要刪除這個任務嗎？此操作無法復原。', () => {
                    const gs = window.GlobalState;
                    const idx = gs.tasks.findIndex(t => t.id === id);
                    if (idx !== -1) {
                        gs.tasks.splice(idx, 1);
                        App.saveData(); 
                        ui.modal.close('m-overlay'); // 關閉可能開啟的編輯視窗
                        if (window.taskView) taskView.render(false);
                        act.toast('🗑️ 任務已刪除');
                    }
                });
            },
            
            resolveTask: (id) => TaskEngine.resolveTask(id),
            toggleTask: (id) => {
                const t = window.GlobalState.tasks.find(x => x.id === id);
                if (!t) return;
                
                // 如果是計次任務，且尚未達成目標，點擊 Checkbox 視為 "計次+1"
                if (t.type === 'count' && !t.done) {
                    act.incrementTask(id);
                } else {
                    // 否則 (一般任務 或 計次已滿想取消)，視為 "切換完成狀態"
                    TaskEngine.resolveTask(id);
                }
            },
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
            toggleSubtask: (id, idx) => TaskEngine.toggleSubtask(id, idx),
            incrementTask: (id) => TaskEngine.incrementTask(id),

            // 分類與過濾
            switchTaskTab: (tab) => {
    window.TempState.taskTab = tab;
    
    // [關鍵修正] 強制關閉所有子頁面，顯示主任務頁面
    ['page-history', 'page-milestone'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none'; // 隱藏子頁面
    });
    
    const taskPage = document.getElementById('page-task');
    if(taskPage) taskPage.style.display = 'block'; // 顯示主頁面

    taskView.render();
},
            setTaskFilter: (cat) => { window.TempState.filterCategory = cat; taskView.render(); },
            setAchFilter: (cat) => { window.TempState.achFilter = cat; taskView.render(); },
            addNewCategory: () => {
                sys.prompt("請輸入新分類名稱：", "", (name) => {
                    if (name && name.trim()) {
                        const newCat = name.trim();
                        if (!window.GlobalState.taskCats) window.GlobalState.taskCats = ['每日', '工作'];
                        
                        // 避免重複添加
                        if (!window.GlobalState.taskCats.includes(newCat)) {
                            window.GlobalState.taskCats.push(newCat);
                        }

                        // 如果正在編輯模式
                        if (window.TempState.editingTask) {
                            // 關鍵：先將當前編輯中的任務分類切換過去，避免重繪後跳回舊分類
                            window.TempState.editingTask.cat = newCat;
                            // 強制重繪表單，這樣新的標籤按鈕才會生成出來
                            taskView.renderCreateTaskForm(window.TempState.editingTask.id);
                            act.toast(`已新增並切換至分類：${newCat}`);
                        } else {
                            // 如果是在列表頁，刷新列表
                            taskView.render();
                        }
                    }
                });
            }
        });

        // B. 核心監聽
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'task') taskView.render(); // 這裡通常是 false，Navbar 點擊時會由 act.navigate 觸發 true
            if (pageId === 'history' && taskView.renderHistoryPage) taskView.renderHistoryPage();
            if (pageId === 'milestone' && taskView.renderMilestonePage) taskView.renderMilestonePage();
        });

        const refresh = () => { if(window.TempState.currentView === 'tasks') taskView.render(); };
        
        EventBus.on(E.Task.CREATED, refresh);
        EventBus.on(E.Task.UPDATED, refresh);
        EventBus.on(E.Task.DELETED, refresh);
        EventBus.on(E.Task.COMPLETED, refresh);

        EventBus.on(E.Task.EDIT_MODE, (data) => taskView.renderCreateTaskForm(data.taskId));

        console.log("✅ TaskController (完整版) 啟動");
    }
};