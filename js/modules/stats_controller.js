/* js/modules/stats_controller.js - V34.Final Controller */
window.StatsController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 註冊 act 指令
        Object.assign(window.act, {
            // 切換分頁
            switchStatsTab: (tab) => { 
                window.TempState.statsTab = tab; 
                if (window.statsView) statsView.render(); 
            },
            
            // 打開新增視窗
            openAddSkill: () => {
                if (window.statsView) statsView.renderSkillModal(null);
            },
            
            // 打開編輯視窗
            editSkill: (name) => {
                const skill = window.GlobalState.skills.find(s => s.name === name);
                if (skill && window.statsView) statsView.renderSkillModal(skill);
            },
            
            // 提交技能 (新增/修改)
            submitNewSkill: () => {
                const nameInput = document.getElementById('skill-name-input');
                const attrSelect = document.getElementById('skill-attr-select');
                if (!nameInput || !attrSelect) return;
                
                const name = nameInput.value.trim();
                const parent = attrSelect.value;
                const editId = window.TempState.editSkillId;

                if (!name) {
                    act.toast("❌ 請輸入技能名稱");
                    return;
                }

                // 呼叫 Engine
                if (window.StatsEngine && StatsEngine.saveSkill) {
                    const success = StatsEngine.saveSkill(name, parent, editId);
                    
                    if (success) {
                        act.toast(editId ? "✅ 修改成功" : "✅ 新增成功");
                        
                        // [關鍵] 明確關閉 overlay 視窗
                        if (window.ui && window.ui.modal) {
                            ui.modal.close('m-overlay');
                        } else {
                            document.getElementById('m-overlay')?.classList.remove('active');
                        }
                        
                        // 刷新介面
                        if (window.statsView) statsView.render();
                    } else {
                        act.toast("❌ 保存失敗 (名稱可能重複)");
                    }
                }
            }
        });

        // B. 監聽全域事件
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'stats' && window.statsView) statsView.render();
        });

        EventBus.on(E.Stats.UPDATED, () => {
            if (window.TempState.currentView === 'stats' && window.statsView) {
                statsView.render();
            }
        });

        console.log("✅ StatsController (V34) Ready");
    }
};