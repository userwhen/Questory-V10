/* js/modules/task_controller.js - V40.5 Fixed (Nav Nuke & Cat Guard) */
window.TaskController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        Object.assign(window.act, {
            
            goToTaskRoot: () => {
                // 1. 強制重置 Tab 狀態
                window.TempState.taskTab = 'list';
                
                // 2. 執行導航
                // 如果已經在 task 頁面，act.navigate 內的 Router 可能會因為頁面 ID 相同而不動作
                // 所以我們這裡手動判斷：
                if (window.TempState.currentView === 'task') {
                    // 如果已經在任務頁，直接強制刷新視圖
                    refreshPage();
                } else {
                    // 如果在其他頁面，走正常導航流程
                    window.act.navigate('task');
                }
            },
			// --- 核心 CRUD ---
			editTask: (id) => {
                // 如果 id 是 null (代表點擊了 FAB 新增)
                // 強制清空暫存的編輯物件，確保 View 重新初始化預設值
                if (id === null) {
                    window.TempState.editingTask = null; 
                }
                // 發送事件
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

            // --- 狀態操作 ---
            toggleTask: (id) => {
                // [新增] 1. 樂觀更新：立刻改變視覺樣式 (不等待 Engine)
                const cardEl = document.getElementById(`task-card-${id}`);
                const checkEl = document.getElementById(`check-btn-${id}`);
                
                if (cardEl) {
                    // 加上完成的 class (假設 CSS 有寫 .done 樣式)
                    cardEl.classList.toggle('task-done'); 
                    cardEl.style.opacity = '0.5'; // 暫時變淡，讓使用者知道有點到
                }
                if (checkEl) {
                    checkEl.innerHTML = '⏳'; // 變成沙漏或勾勾
                }

                // 2. 正常呼叫 Engine (這會觸發真正的數據運算和存檔)
                // 運算完後 EventBus 會觸發 task:updated，接著 render() 會把正確的最終狀態畫上去
                const t = window.GlobalState.tasks.find(x => x.id === id);
                if (!t) return;
                
                // 為了讓動畫跑一下，可以稍微延遲真正的刷新 (選配)
                setTimeout(() => {
                    if (t.type === 'count' && !t.done) TaskEngine.incrementTask(id);
                    else TaskEngine.resolveTask(id);
                }, 100); // 100ms 延遲讓視覺過渡更順
            },

            resolveTask: (id) => { TaskEngine.resolveTask(id); },
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
            
            // [Fix 2] 分類防護：確保預設分類不消失
            addNewCategory: () => {
                const cb = (name) => {
                    if (name && name.trim()) {
                        const newCat = name.trim();
                        const gs = window.GlobalState;
                        const defaults = ['每日', '運動', '工作'];
                        
                        // 1. 初始化或修復 taskCats
                        if (!gs.taskCats) gs.taskCats = [...defaults];
                        else {
                            // 強制補回缺失的預設分類
                            defaults.forEach(d => {
                                if(!gs.taskCats.includes(d)) gs.taskCats.push(d);
                            });
                        }
                        
                        // 2. 新增自訂分類
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
            // 只有當前視圖是 'task' 時才重繪，避免在其他頁面浪費資源
            // 注意：這裡必須用 'task' (單數)，對應 Router 的 ID
            if (window.TempState.currentView === 'task') {
                if (window.taskView && taskView.render) {
                    console.log("🔄 TaskController: 刷新 TaskView");
                    taskView.render();
                }
            }
             // 同時處理歷史頁面
            if (window.TempState.currentView === 'history') {
                if (window.taskView && taskView.renderHistoryPage) {
                    taskView.renderHistoryPage();
                }
            }
        };

        // 1. 監聽導航 (Router 切換完後通知)
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'task') {
                // 確保進入時初始化 Tab
                if (!window.TempState.taskTab) window.TempState.taskTab = 'list';
                refreshPage();
            }
            if (pageId === 'history') {
                refreshPage();
            }
        });

        // 2. 監聽數據變更 (新增/修改/刪除/完成) -> 自動刷新
        EventBus.on(E.Task.CREATED, refreshPage);
        EventBus.on(E.Task.UPDATED, refreshPage);
        EventBus.on(E.Task.DELETED, refreshPage);
        EventBus.on(E.Task.COMPLETED, refreshPage);
        
        // 3. 監聽成就更新 (因為任務頁面有成就列表)
        EventBus.on(E.Ach.UPDATED, refreshPage);

        // 4. 監聽編輯表單刷新
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

        console.log("✅ TaskController V41.0 Loaded (Clean & Router Synced).");
    }
};