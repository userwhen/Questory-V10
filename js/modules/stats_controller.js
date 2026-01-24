/* js/modules/stats_controller.js - Stats Controller */
window.StatsController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act
        Object.assign(window.act, {
            switchStatsTab: (tab) => { 
                window.TempState.statsTab = tab; 
                statsView.render(); 
            },
            openAddSkill: () => statsView.renderSkillModal(null),
            editSkill: (name) => {
                const skill = window.GlobalState.skills.find(s => s.name === name);
                statsView.renderSkillModal(skill);
            },
            submitNewSkill: () => {
                // 從 DOM 獲取值 (因為 View 裡是直接寫 HTML，沒綁定 oninput)
                const nameInp = document.getElementById('skill-name-input');
                const attrSel = document.getElementById('skill-attr-select');
                if (nameInp && attrSel) {
                    const name = nameInp.value.trim();
                    if(!name) return EventBus.emit(E.System.TOAST, "請輸入技能名稱");
                    StatsEngine.submitNewSkill(name, attrSel.value);
                }
            }
        });

        // B. 監聽導航
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'stats') {
                statsView.render();
            }
        });

        // C. 監聽數據更新
        EventBus.on(E.Stats.UPDATED, () => {
            // 刷新 HUD (金幣/等級)
            if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
            
            // 如果當前在數值頁，刷新內容
            if (window.TempState.currentView === 'stats') {
                statsView.render();
            }
        });

        console.log("✅ StatsController (數值) 模組就緒");
    }
};