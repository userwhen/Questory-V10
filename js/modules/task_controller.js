/* js/modules/task_controller.js - V41.0 Fixed (Engine Bridge) */
window.TaskController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        Object.assign(window.act, {
            
            goToTaskRoot: () => {
                window.TempState.taskTab = 'list';
                if (window.TempState.currentView === 'task') {
                    refreshPage();
                } else {
                    window.act.navigate('task');
                }
            },

            // --- 核心 CRUD ---
            editTask: (id) => {
                if (id === null) {
                    window.TempState.editingTask = null; 
                }
                window.EventBus.emit(E.Task.EDIT_MODE, { taskId: id });
            },
            
            submitTask: () => {
                const temp = window.TempState.editingTask;
                if (!temp || !temp.title) return window.act.toast("⚠️ 標題必填");
                if (temp.id) {
                    TaskEngine.updateTask(temp);
                    window.act.toast("✅ 已更新");
                } else {
                    TaskEngine.addTask(temp);
                    window.act.toast("✅ 已新增");
                }
                if(window.act.closeModal) window.act.closeModal('overlay');
            },

            deleteTask: (id) => {
                const doDelete = () => {
                    TaskEngine.deleteTask(id);
                    if(window.act.closeModal) window.act.closeModal('overlay');
                    window.act.toast('🗑️ 已刪除');
                };
                if(window.sys && sys.confirm) sys.confirm('確定刪除？', doDelete);
                else if(confirm('確定刪除？')) doDelete();
            },

            // --- 狀態操作 (核心修復) ---
            toggleTask: function(id) {
                // [修復] 直接呼叫 Engine 處理所有邏輯 (金幣、歷史、Impact計算)
                // 這樣能確保 task.doneTime 被正確寫入，且獎勵發放正確
                TaskEngine.resolveTask(id);
            },

            resolveTask: (id) => { TaskEngine.resolveTask(id); },
			incrementTask: (id) => { TaskEngine.incrementTask(id); },
            toggleSubtask: (taskId, subIdx) => TaskEngine.toggleSubtask(taskId, subIdx),

            copyTask: (id) => {
                const t = window.GlobalState.tasks.find(x => x.id === id);
                if(t) {
                    const copy = JSON.parse(JSON.stringify(t));
                    delete copy.id; copy.title += " (副本)";
                    TaskEngine.addTask(copy);
                    window.act.toast("已複製");
                }
            },

            togglePin: () => {
                if(window.TempState.editingTask) {
                    window.TempState.editingTask.pinned = !window.TempState.editingTask.pinned;
                    window.EventBus.emit(E.Task.FORM_UPDATE);
                }
            },

            // --- 編輯預覽 ---
            updateEditField: (field, val) => {
                if (!window.TempState.editingTask) return;
                window.TempState.editingTask[field] = val;
                
                if (field === 'type') {
                    if (val === 'count') {
                        window.TempState.editingTask.subs = [];
                        if(!window.TempState.editingTask.target) window.TempState.editingTask.target = 10;
                    } else {
                        window.TempState.editingTask.target = 1; 
                        if(!window.TempState.editingTask.subs) window.TempState.editingTask.subs = [];
                    }
                    window.EventBus.emit(E.Task.FORM_UPDATE);
                    return;
                }

                if (field === 'importance' || field === 'urgency') {
                    const imp = parseInt(window.TempState.editingTask.importance) || 1;
                    const urg = parseInt(window.TempState.editingTask.urgency) || 1;
                    const r = TaskEngine.previewRewards(imp, urg);
                    
                    const elGold = document.getElementById('preview-gold');
                    const elExp = document.getElementById('preview-exp');
                    if (elGold) elGold.innerText = r.gold;
                    if (elExp) elExp.innerText = r.exp;
                    
                    if (window.taskView && window.taskView.updateMatrixPreview) {
                        window.taskView.updateMatrixPreview();
                    }
                }
            },

            // --- 子任務 ---
            addSubtask: () => {
                const t = window.TempState.editingTask;
                if(t) { t.subs = t.subs || []; t.subs.push({text:'', done:false}); window.EventBus.emit(E.Task.FORM_UPDATE); }
            },
            removeSubtask: (idx) => {
                const t = window.TempState.editingTask;
                if(t && t.subs) { t.subs.splice(idx, 1); window.EventBus.emit(E.Task.FORM_UPDATE); }
            },
            updateSubtaskText: (idx, val) => {
                const t = window.TempState.editingTask;
                if(t && t.subs && t.subs[idx]) t.subs[idx].text = val;
            },

            // --- 導航與過濾 ---
            switchTaskTab: (tab) => {
                window.TempState.taskTab = tab;
                window.EventBus.emit(E.Task.UPDATED);
            },
            setTaskFilter: (cat) => {
                window.TempState.filterCategory = cat;
                window.EventBus.emit(E.Task.UPDATED);
            },
            setAchFilter: (cat) => {
                window.TempState.achFilter = cat;
                window.EventBus.emit(E.Task.UPDATED);
            },
            
            addNewCategory: () => {
                const cb = (name) => {
                    if (name && name.trim()) {
                        const newCat = name.trim();
                        const gs = window.GlobalState;
                        const defaults = ['每日', '運動', '工作'];
                        
                        if (!gs.taskCats) gs.taskCats = [...defaults];
                        else {
                            defaults.forEach(d => {
                                if(!gs.taskCats.includes(d)) gs.taskCats.push(d);
                            });
                        }
                        
                        if (!gs.taskCats.includes(newCat)) {
                            gs.taskCats.push(newCat);
                            if (window.TempState.editingTask) {
                                window.TempState.editingTask.cat = newCat;
                                window.EventBus.emit(E.Task.FORM_UPDATE);
                            } else {
                                window.EventBus.emit(E.Task.UPDATED);
                            }
                            window.act.toast(`已新增分類：${newCat}`);
                        } else {
                            window.act.toast("分類已存在");
                        }
                    }
                };
                if(window.sys && window.sys.prompt) window.sys.prompt("新分類名稱：", "", cb);
                else cb(prompt("新分類名稱："));
            }
        });

        const refreshPage = () => {
            if (window.TempState.currentView === 'task') {
                if (window.taskView && taskView.render) {
                    taskView.render();
                }
            }
            if (window.TempState.currentView === 'history') {
                if (window.taskView && taskView.renderHistoryPage) {
                    taskView.renderHistoryPage();
                }
            }
        };

        // 監聽
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'task') {
                if (!window.TempState.taskTab) window.TempState.taskTab = 'list';
                refreshPage();
            }
            if (pageId === 'history') refreshPage();
        });

        EventBus.on(E.Task.CREATED, refreshPage);
        EventBus.on(E.Task.UPDATED, refreshPage);
        EventBus.on(E.Task.DELETED, refreshPage);
        EventBus.on(E.Task.COMPLETED, refreshPage);
        EventBus.on(E.Ach.UPDATED, refreshPage);

        EventBus.on(E.Task.EDIT_MODE, (data) => {
            if (window.taskView && taskView.renderCreateTaskForm) {
                taskView.renderCreateTaskForm(data.taskId);
            }
        });
        EventBus.on(E.Task.FORM_UPDATE, () => {
            if (window.taskView && taskView.renderCreateTaskForm && window.TempState.editingTask) {
                taskView.renderCreateTaskForm(window.TempState.editingTask.id);
            }
        });

        console.log("✅ TaskController V41.0 Fixed (Engine Bridge).");
    }
};