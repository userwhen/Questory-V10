/* js/modules/stats_controller.js - V45.0 Source Fix (Auto-Init) */
window.StatsController = {
    // =========================================
    // 1. 初始化 (系統啟動時執行)
    // =========================================
    init: function() {
        // [源頭修復] 強制啟動引擎初始化
        // 這行代碼會檢查 GlobalState，如果發現缺了 STR/INT，會當場補齊。
        // 確保後續 View 讀取時，數據絕對是完整的。
        if (window.StatsEngine && StatsEngine.init) {
            console.log("⚙️ StatsController: 呼叫引擎執行數據完整性檢查...");
            StatsEngine.init(); 
        }

        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 註冊 act 行為 (供 View 呼叫)
        Object.assign(window.act, {
            openAddSkill: () => {
                if (window.statsView && statsView.renderSkillModal) {
                    statsView.renderSkillModal(null);
                }
            },
            editSkill: (skillName) => {
                if (window.statsView && statsView.renderSkillModal) {
                    statsView.renderSkillModal(skillName);
                }
            },
            saveSkill: () => {
                const data = window.TempState.editingSkill;
                if (!data || !data.name) return act.toast("⚠️ 請輸入技能名稱");

                const result = StatsEngine.saveSkill(data.name, data.parent, data.editId);
                if (result.success) {
                    act.closeModal('overlay');
                    act.toast("✅ 技能已儲存");
                } else {
                    act.toast(`❌ ${result.msg}`);
                }
            },
            deleteSkill: (name) => {
                const doDelete = () => {
                    StatsEngine.deleteSkill(name);
                    act.closeModal('overlay');
                    act.toast("🗑️ 技能已刪除");
                };
                if(window.sys && sys.confirm) {
                    sys.confirm(`確定要刪除技能 [${name}] 嗎？`, doDelete);
                } else if(confirm(`確定要刪除技能 [${name}] 嗎？`)) {
                    doDelete();
                }
            },
            
            switchStatsTab: function(tab) {
                window.TempState.statsTab = tab;
                window.EventBus.emit(window.EVENTS.Stats.UPDATED);
            }
        });

        // ============================
        // B. 事件監聽 (Event Listeners)
        // ============================

        // 1. 任務完成 -> 加分
        EventBus.on(E.Task.COMPLETED, (payload) => {
            if (payload && payload.task) {
                StatsEngine.onTaskCompleted(payload.task, payload.impact);
            }
        });

        // 2. 任務取消 -> 倒扣
        EventBus.on(E.Task.UNCOMPLETED, (payload) => {
            if (payload && payload.task) {
                StatsEngine.onTaskUndone(payload.task, payload.impact);
            }
        });

        // 3. 編輯模式
        EventBus.on(E.Stats.SKILL_EDIT_MODE, (data) => {
            if (window.statsView && statsView.renderSkillModal) {
                statsView.renderSkillModal(data ? data.skill : null);
            }
        });

        // 4. 頁面導航渲染 (防止白畫面)
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'stats') {
                if (window.statsView && statsView.render) {
                    statsView.render();
                }
            }
        });

        // 5. 數據更新刷新
        const refreshStats = () => {
            if (window.TempState.currentView === 'stats' && window.statsView) {
                statsView.render();
            }
        };
        EventBus.on(E.Stats.UPDATED, refreshStats);
        EventBus.on(E.Stats.LEVEL_UP, refreshStats);

        console.log("✅ StatsController V45.0 Loaded (Auto-Init Active).");
    }
};