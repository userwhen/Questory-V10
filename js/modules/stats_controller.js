/* js/modules/stats_controller.js - V39.0 Stats Controller */
/* 負責：處理 UI 事件、技能表單提交 */

window.StatsController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // ============================
        // A. 擴充 window.act
        // ============================
        Object.assign(window.act, {
            
            // 1. 打開新增視窗 (View 呼叫)
            openAddSkill: function() {
                // 通知 View 渲染空表單 (editId = null)
                window.TempState.editSkillId = null;
                // 注意：這裡假設 View 有一個 renderSkillModal 方法
                // 我們發送 SKILL_EDIT_MODE 事件讓 View 去處理
                window.EventBus.emit(E.Stats.SKILL_EDIT_MODE, { skill: null });
            },

            // 2. 打開編輯視窗
            editSkill: function(name) {
                const skill = window.GlobalState.skills.find(s => s.name === name);
                if (!skill) return;
                window.TempState.editSkillId = name;
                window.EventBus.emit(E.Stats.SKILL_EDIT_MODE, { skill: skill });
            },

            // 3. 提交技能 (表單按鈕呼叫)
            submitNewSkill: function() {
                // 從 DOM 獲取數據
                const nameInput = document.getElementById('skill-name-input');
                const attrSelect = document.getElementById('skill-attr-select');
                
                if (!nameInput || !attrSelect) {
                    console.error("DOM Element not found for skill submit");
                    return;
                }

                const name = nameInput.value.trim();
                const parent = attrSelect.value;
                const editId = window.TempState.editSkillId;

                if (!name) {
                    window.act.toast("❌ 請輸入技能名稱");
                    return;
                }

                // 呼叫 Engine 處理邏輯
                const result = StatsEngine.saveSkill(name, parent, editId);

                if (result.success) {
                    window.act.toast(editId ? "✅ 修改成功" : "✅ 新增成功");
                    if (window.act.closeModal) window.act.closeModal('overlay'); // 或 m-panel
                } else {
                    window.act.toast(`❌ ${result.msg}`);
                }
            },

            // 4. 刪除技能
            deleteSkill: function() {
                const name = window.TempState.editSkillId;
                if (!name) return;

                const confirmFunc = (window.sys && sys.confirm) ? sys.confirm : confirm;
                if (confirmFunc(`確定要刪除技能 [${name}] 嗎？`)) {
                    StatsEngine.deleteSkill(name);
                    if (window.act.closeModal) window.act.closeModal('overlay');
                    window.act.toast("🗑️ 技能已刪除");
                }
            },
            
            // 5. 切換 Stats 分頁 (如果有 Skill Tree / Radar 切換需求)
            switchStatsTab: function(tab) {
                window.TempState.statsTab = tab;
                window.EventBus.emit(E.Stats.UPDATED);
            }
        });

        // ============================
        // B. 事件監聽
        // ============================

        // 監聽導航：刷新
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'stats') {
                if (window.statsView && window.statsView.render) {
                    window.statsView.render();
                }
            }
        });

        // 監聽數據變更：刷新
        EventBus.on(E.Stats.UPDATED, () => {
            if (window.TempState.currentView === 'stats' && window.statsView) {
                window.statsView.render();
            }
        });

        console.log("✅ StatsController V39.0 Loaded.");
    }
};