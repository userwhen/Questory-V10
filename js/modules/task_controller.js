/* js/modules/task_controller.js - V51.0 Pure CSP Controller */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Task = {
	_initialized: false,
    init: function() {
        const E = window.SQ.Events;
        if (!window.SQ.EventBus || !E) return;

        Object.assign(window.SQ.Actions, {
            goToTaskRoot: () => {
                window.SQ.Temp.taskTab = 'list';
                if (window.SQ.Temp.currentView === 'task') refreshPage();
                else window.SQ.Actions.navigate('task');
            },

            editTask: (id) => {
                if (id === null) window.SQ.Temp.editingTask = null; 
                window.SQ.EventBus.emit(E.Task.EDIT_MODE, { taskId: id });
            },
            
            submitTask: () => {
                const temp = window.SQ.Temp.editingTask;
                if (!temp || !temp.title) return window.SQ.Actions.toast("⚠️ 標題必填");
                if (temp.id) {
                    window.SQ.Engine.Task.updateTask(temp);
                    window.SQ.Actions.toast("✅ 已更新");
                } else {
                    window.SQ.Engine.Task.addTask(temp);
                    window.SQ.Actions.toast("✅ 已新增");
                }
                if(window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
            },

            deleteTask: (id) => {
                const doDelete = () => {
                    window.SQ.Engine.Task.deleteTask(id);
                    if(window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
                    window.SQ.Actions.toast('🗑️ 已刪除');
                };
                if(window.sys && sys.confirm) sys.confirm('確定刪除？', doDelete);
                else if(confirm('確定刪除？')) doDelete();
            },

            toggleTask: function(id) { window.SQ.Engine.Task.resolveTask(id); },
            resolveTask: (id) => { window.SQ.Engine.Task.resolveTask(id); },
            incrementTask: (id) => { window.SQ.Engine.Task.incrementTask(id); },
            toggleSubtask: (taskId, subIdx) => window.SQ.Engine.Task.toggleSubtask(taskId, subIdx),

            copyTask: (id) => {
                const t = window.SQ.State.tasks.find(x => x.id === id);
                if(t) {
                    const copy = JSON.parse(JSON.stringify(t));
                    delete copy.id; copy.title += " (副本)";
                    window.SQ.Engine.Task.addTask(copy);
                    window.SQ.Actions.toast("已複製");
                }
            },

            // --- 子任務操作 ---
            addSubtask: () => {
                const t = window.SQ.Temp.editingTask;
                if(t) { t.subs = t.subs || []; t.subs.push({text:'', done:false}); window.SQ.EventBus.emit(E.Task.FORM_UPDATE); }
            },
            removeSubtask: (idx) => {
                const t = window.SQ.Temp.editingTask;
                if(t && t.subs) { t.subs.splice(idx, 1); window.SQ.EventBus.emit(E.Task.FORM_UPDATE); }
            },
            // [V51] 此處只更新狀態，不發送 FORM_UPDATE，完美避免輸入框失焦
            updateSubtaskText: (idx, val) => {
                const t = window.SQ.Temp.editingTask;
                if(t && t.subs && t.subs[idx]) t.subs[idx].text = val;
            },

            switchTaskTab: (tab) => {
                window.SQ.Temp.taskTab = tab;
                window.SQ.EventBus.emit(E.Task.UPDATED);
            },
            setTaskFilter: (cat) => {
                window.SQ.Temp.filterCategory = cat;
                window.SQ.EventBus.emit(E.Task.UPDATED);
            },
            setAchFilter: (cat) => {
                window.SQ.Temp.achFilter = cat;
                window.SQ.EventBus.emit(E.Task.UPDATED);
            },
            
            addNewCategory: () => {
                const cb = (name) => {
                    if (name && name.trim()) {
                        const newCat = name.trim();
                        const gs = window.SQ.State;
                        const defaults = ['每日', '運動', '工作'];
                        
                        if (!gs.taskCats) gs.taskCats = [...defaults];
                        else {
                            defaults.forEach(d => { if(!gs.taskCats.includes(d)) gs.taskCats.push(d); });
                        }
                        
                        if (!gs.taskCats.includes(newCat)) {
                            gs.taskCats.push(newCat);
                            if (window.SQ.Temp.editingTask) {
                                window.SQ.Temp.editingTask.cat = newCat;
                                window.SQ.EventBus.emit(E.Task.FORM_UPDATE);
                            } else {
                                window.SQ.EventBus.emit(E.Task.UPDATED);
                            }
                            window.SQ.Actions.toast(`已新增分類：${newCat}`);
                        } else {
                            window.SQ.Actions.toast("分類已存在");
                        }
                    }
                };
                if(window.sys && window.sys.prompt) window.sys.prompt("新分類名稱：", "", cb);
                else cb(prompt("新分類名稱："));
            }
        });

        const refreshPage = () => {
            if (window.SQ.Temp.currentView === 'task') {
                if (window.SQ.View.Task && window.SQ.View.Task.render) window.SQ.View.Task.render();
            }
            if (window.SQ.Temp.currentView === 'history') {
                if (window.SQ.View.Task && window.SQ.View.Task.renderHistoryPage) window.SQ.View.Task.renderHistoryPage();
            }
        };

        window.SQ.EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'task') {
                if (!window.SQ.Temp.taskTab) window.SQ.Temp.taskTab = 'list';
                refreshPage();
            }
            if (pageId === 'history') refreshPage();
        });

        window.SQ.EventBus.on(E.Task.CREATED, refreshPage);
        window.SQ.EventBus.on(E.Task.UPDATED, refreshPage);
        window.SQ.EventBus.on(E.Task.DELETED, refreshPage);
        window.SQ.EventBus.on(E.Task.COMPLETED, refreshPage);
        window.SQ.EventBus.on(E.Ach.UPDATED, refreshPage);

        window.SQ.EventBus.on(E.Task.EDIT_MODE, (data) => {
            if (window.SQ.View.Task && window.SQ.View.Task.renderCreateTaskForm) {
                window.SQ.View.Task.renderCreateTaskForm(data.taskId);
            }
        });
        window.SQ.EventBus.on(E.Task.FORM_UPDATE, () => {
            if (window.SQ.View.Task && window.SQ.View.Task.renderCreateTaskForm && window.SQ.Temp.editingTask) {
                window.SQ.View.Task.renderCreateTaskForm(window.SQ.Temp.editingTask.id);
            }
        });

        console.log("✅ TaskController V51.0 Loaded");
    }
};
window.TaskController = window.SQ.Controller.Task;