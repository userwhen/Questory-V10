/* js/modules/task_controller.js - V52.0 Pure CSP Controller */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Task = {
	_initialized: false,
    init: function() {
        const E = window.SQ.Events;
        if (!window.SQ.EventBus || !E) return;

        Object.assign(window.SQ.Actions, {
            // ── 行事曆 ────────────────────────────────────────
            addTaskToCalendar: async (id) => {
                const task = (window.SQ.State?.tasks || []).find(t => t.id === id);
                if (!task) return;
                if (!window.SQ.Calendar) {
                    window.SQ.Actions.toast('❌ 行事曆模組未載入');
                    return;
                }
                await window.SQ.Calendar.addTask(task);
                if (window.SQ.View.Task?.render) window.SQ.View.Task.render();
            },

            openCalendarSync: () => {
                if (!window.SQ.Calendar) {
                    window.SQ.Actions.toast('❌ 行事曆模組未載入');
                    return;
                }
                window.SQ.Calendar.openSyncModal();
            },

            // ─────────────────────────────────────────────────────
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
                if (!temp || !temp.title) {
                    window.SQ.Audio?.feedback('taskUndo'); // 👈 新增：防呆失敗音效
                    return window.SQ.Actions.toast("⚠️ 標題必填");
                }
                if (temp.id) {
                    window.SQ.Engine.Task.updateTask(temp);
                    window.SQ.Actions.toast("✅ 已更新");
                } else {
                    window.SQ.Engine.Task.addTask(temp);
                    window.SQ.Actions.toast("✅ 已新增");
                }
                
                window.SQ.Audio?.play('save'); // 👈 新增：儲存成功音效
                
                window.SQ.Temp.editingTask = null; 
                if(window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
            },
			// 【task_controller.js】新增這段
			clearTaskForm: () => {
				const doClear = () => {
					// 重置資料
					window.SQ.Temp.editingTask = { 
						id: null, title: '', desc: '', importance: 1, urgency: 1, 
						type: 'normal', attrs: [], cat: '每日', target: 10, 
						subs: [], pinned: false, calories: 0, deadline: '', 
						subRule: 'all', recurrence: '' 
					};
					// 通知畫面更新
					window.SQ.EventBus.emit(window.SQ.Events.Task.FORM_UPDATE);
					
					// 確保關閉確認視窗 (對應層級為 system)
					if(window.SQ.Actions && window.SQ.Actions.closeModal) {
						window.SQ.Actions.closeModal('m-system');
					}
				};

				// 使用內建的 confirm 視窗
				if (window.sys && window.sys.confirm) {
					window.sys.confirm('確定要清空所有內容嗎？<br><span style="font-size:0.85rem; color:var(--text-muted);">（未保存的資料將遺失）</span>', doClear);
				} else {
					doClear(); // 防呆備案
				}
			},            
            deleteTask: (id) => {
                const doDelete = () => {
                    window.SQ.Engine.Task.deleteTask(id);
                    window.SQ.Audio?.play('delete'); // 👈 新增：刪除音效 (由於步驟一的修改，現在聽起來會是舒服的登登聲)
                    if(window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
                    window.SQ.Actions.toast('🗑️ 已刪除');
                };
                if(window.sys && sys.confirm) sys.confirm('確定刪除？', doDelete);
                else if(confirm('確定刪除？')) doDelete();
            },

            toggleTask: function(id) { 
				window.SQ.Engine.Task.resolveTask(id);
				window.SQ.Audio?.feedback('taskComplete'); // 👈 修正並新增這行
			},
            resolveTask: (id) => { window.SQ.Engine.Task.resolveTask(id); },
            incrementTask: (id) => { 
				window.SQ.Engine.Task.incrementTask(id); 
				window.SQ.Audio?.feedback('click'); // 👈 新增這行 (輕巧點擊音)
			},
            toggleSubtask: (taskId, subIdx) => {
				window.SQ.Engine.Task.toggleSubtask(taskId, subIdx);
				window.SQ.Audio?.feedback('toggle_on'); // 👈 新增這行 (開關音效)
			},

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
                        
                        // 【task_controller.js】找到 addNewCategory 的這段並替換：
						if (!gs.taskCats.includes(newCat)) {
							// 🌟 修正：只計算「預設以外」的自訂分類數量
							const customCatsCount = gs.taskCats.filter(c => !defaults.includes(c)).length;

							// 訂閱功能鎖：如果不是 Pro，且自訂分類 >= 3，就擋下
							if (window.SQ.Sub && typeof window.SQ.Sub.isPro === 'function' && !window.SQ.Sub.isPro()) {
								if (customCatsCount >= 3) {
									window.SQ.Actions.toast(`⚠️ 免費版最多只能新增 3 個自訂分類`);
									setTimeout(() => {
										if (window.SQ.Sub.showUpgradePrompt) window.SQ.Sub.showUpgradePrompt('解鎖更多分類額度');
									}, 300); // 確保不跟原視窗衝突
									return;
								}
							}

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
            },
			promptDeleteCategory: (cat) => {
				const defaults = ['每日', '運動', '工作'];
				if (defaults.includes(cat)) {
					return window.SQ.Actions.toast("⚠️ 預設分類無法刪除");
				}
				const doDelete = () => {
					window.SQ.State.taskCats = window.SQ.State.taskCats.filter(c => c !== cat);
					// 如果目前正在編輯的任務剛好是這個分類，把它退回每日
					if (window.SQ.Temp.editingTask && window.SQ.Temp.editingTask.cat === cat) {
						window.SQ.Temp.editingTask.cat = '每日';
					}
					window.SQ.Actions.toast(`🗑️ 已刪除分類：${cat}`);
					window.SQ.EventBus.emit(window.SQ.Events.Task.FORM_UPDATE);
					if(window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('m-system');
				};
				if (window.sys && window.sys.confirm) {
					window.sys.confirm(`確定要刪除「${cat}」嗎？<br><span style="font-size:0.8rem; color:var(--text-muted);">（屬於此分類的任務不會被刪除）</span>`, doDelete);
				} else {
					doDelete();
				}
			},
			
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