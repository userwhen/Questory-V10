/* js/modules/stats_controller.js - V45.0 Source Fix (Auto-Init) */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Stats = {
	_initialized: false,
    init: function() {
        // [源頭修復] 強制啟動引擎初始化
        // 這行代碼會檢查 GlobalState，如果發現缺了 STR/INT，會當場補齊。
        // 確保後續 View 讀取時，數據絕對是完整的。
        if (window.SQ.Engine.Stats && window.SQ.Engine.Stats.init) {
            console.log("⚙️ StatsController: 呼叫引擎執行數據完整性檢查...");
            window.SQ.Engine.Stats.init(); 
        }

        const E = window.SQ.Events;
        if (!window.SQ.EventBus || !E) return;

        // A. 註冊 act 行為 (供 View 呼叫)
        Object.assign(window.SQ.Actions, {
            openAddSkill: () => {
                if (window.SQ.View.Stats && window.SQ.View.Stats.renderSkillModal) {
                    window.SQ.View.Stats.renderSkillModal(null);
                }
            },
            editSkill: (skillName) => {
                if (window.SQ.View.Stats && window.SQ.View.Stats.renderSkillModal) {
                    window.SQ.View.Stats.renderSkillModal(skillName);
                }
            },
            saveSkill: () => {
                const data = window.SQ.Temp.editingSkill;
                if (!data || !data.name) returnwindow.SQ.Actions.toast("⚠️ 請輸入技能名稱");

                const result = window.SQ.Engine.Stats.saveSkill(data.name, data.parent, data.editId);
                if (result.success) {
                   window.SQ.Actions.closeModal('overlay');
                   window.SQ.Actions.toast("✅ 技能已儲存");
                } else {
                   window.SQ.Actions.toast(`❌ ${result.msg}`);
                }
            },
            deleteSkill: (name) => {
                const doDelete = () => {
                    window.SQ.Engine.Stats.deleteSkill(name);
                   window.SQ.Actions.closeModal('overlay');
                   window.SQ.Actions.toast("🗑️ 技能已刪除");
                };
                if(window.sys && sys.confirm) {
                    sys.confirm(`確定要刪除技能 [${name}] 嗎？`, doDelete);
                } else if(confirm(`確定要刪除技能 [${name}] 嗎？`)) {
                    doDelete();
                }
            },
            
            switchStatsTab: function(tab) {
                // 如果想切換到熱量分頁，先檢查設定開關
                if (tab === 'cal') {
                    const gs = window.SQ.State;
                    const isCalEnabled = (gs.settings && gs.settings.calMode);
                    if (!isCalEnabled) {
                        if(window.SQ.Actions.toast) window.SQ.Actions.toast("⚠️ 請先至設定開啟「熱量監控」模式");
                        return; // 阻止切換
                    }
                }
                
                window.SQ.Temp.statsTab = tab;
                window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            }
        });

        // ============================
        // B. 事件監聽 (Event Listeners)
        // ============================

        // 1. 任務完成 -> 加分
        window.SQ.EventBus.on(E.Task.COMPLETED, (payload) => {
            if (payload && payload.task) {
                window.SQ.Engine.Stats.onTaskCompleted(payload.task, payload.impact);
            }
        });

        // 2. 任務取消 -> 倒扣
        window.SQ.EventBus.on(E.Task.UNCOMPLETED, (payload) => {
            if (payload && payload.task) {
                window.SQ.Engine.Stats.onTaskUndone(payload.task, payload.impact);
            }
        });

        // 3. 編輯模式
        window.SQ.EventBus.on(E.Stats.SKILL_EDIT_MODE, (data) => {
            if (window.SQ.View.Stats && window.SQ.View.Stats.renderSkillModal) {
                window.SQ.View.Stats.renderSkillModal(data ? data.skill : null);
            }
        });

        // 4. 頁面導航渲染 (防止白畫面)
        window.SQ.EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'stats') {
                if (window.SQ.View.Stats && window.SQ.View.Stats.render) {
                    window.SQ.View.Stats.render();
                }
            }
        });

        // 5. 數據更新刷新
        const refreshStats = () => {
            if (window.SQ.Temp.currentView === 'stats' && window.SQ.View.Stats) {
                window.SQ.View.Stats.render();
            }
        };
        window.SQ.EventBus.on(E.Stats.UPDATED, refreshStats);
        window.SQ.EventBus.on(E.Stats.LEVEL_UP, refreshStats);

        console.log("✅ StatsController V45.0 Loaded (Auto-Init Active).");
    }
};
window.StatsController = window.SQ.Controller.Stats;