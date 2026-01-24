/* js/modules/stats.js - Stats Logic Engine */
window.StatsEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        const defaults = {
            STR: { name: '體能', icon: '💪' },
            INT: { name: '思考', icon: '🧠' },
            AGI: { name: '技術', icon: '🛠️' },
            CHR: { name: '魅力', icon: '✨' },
            VIT: { name: '創造', icon: '🎨' },
            LUK: { name: '經營', icon: '💼' }
        };

        if (!gs.attrs) gs.attrs = {};
        
        // 補齊屬性資料
        Object.keys(defaults).forEach(k => {
            if (!gs.attrs[k]) {
                gs.attrs[k] = { ...defaults[k], v: 1, exp: 0 };
            } else {
                // 更新名稱與圖標 (防止舊存檔資料過期)
                gs.attrs[k].name = defaults[k].name;
                gs.attrs[k].icon = defaults[k].icon;
                if (typeof gs.attrs[k].v === 'undefined') gs.attrs[k].v = 1;
            }
        });

        if (!gs.skills) gs.skills = [];
        if (!gs.archivedSkills) gs.archivedSkills = [];
        if (!gs.cal) gs.cal = { today: 0, logs: [] };
        
        // 玩家等級初始化
        gs.lv = gs.lv || 1;
        gs.exp = gs.exp || 0;
        
        console.log("📊 StatsEngine (Logic) Initialized.");
    },

    // 核心運算：經驗值分配
    distributeExp: function(totalExp, skillNames) {
        const gs = window.GlobalState;
        if (!skillNames || skillNames.length === 0) return;
        
        const expPerAttr = Math.floor(totalExp / skillNames.length);
        
        skillNames.forEach(name => {
            // 尋找技能 (包括已封存的)
            const skill = gs.skills.find(s => s.name === name) || gs.archivedSkills.find(s => s.name === name);
            if (skill && skill.parent) {
                const pKey = skill.parent.toUpperCase();
                if (gs.attrs[pKey]) {
                    const attr = gs.attrs[pKey];
                    attr.exp += expPerAttr;
                    
                    // 屬性升級邏輯
                    const max = attr.v * 100;
                    if (attr.exp >= max) {
                        attr.exp -= max;
                        attr.v++;
                        EventBus.emit(EVENTS.System.TOAST, `🎉 ${attr.name} 提升至 Lv.${attr.v}！`);
                    }
                }
            }
        });
        
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.Stats.UPDATED);
    },

    // 核心運算：技能熟練度
    addSkillProficiency: function(skillName) {
        const gs = window.GlobalState;
        const idx = gs.skills.findIndex(s => s.name === skillName);
        
        if (idx > -1) {
            const skill = gs.skills[idx];
            skill.exp += 1;
            const max = skill.lv * 10;
            
            if (skill.exp >= max) {
                skill.exp = 0;
                skill.lv++;
                if (skill.lv >= 10) {
                    // 大師化：移至封存區
                    gs.skills.splice(idx, 1);
                    gs.archivedSkills.push(skill);
                    EventBus.emit(EVENTS.System.TOAST, `🌟 技能 [${skill.name}] 已達到大師級！`);
                } else {
                    EventBus.emit(EVENTS.System.TOAST, `💡 技能 [${skill.name}] 升級至 Lv.${skill.lv}！`);
                }
            }
            if(window.App) App.saveData();
            EventBus.emit(EVENTS.Stats.UPDATED);
        }
    },

    // 核心運算：新增/編輯技能
    submitNewSkill: function(name, attrKey) {
        const gs = window.GlobalState;
        const editId = window.TempState.editSkillId;

        if (editId) {
            const skill = gs.skills.find(s => s.name === editId);
            if (skill) { skill.name = name; skill.parent = attrKey; }
        } else {
            // 檢查重複
            if (gs.skills.some(s => s.name === name)) {
                EventBus.emit(EVENTS.System.TOAST, "⚠️ 技能名稱已存在");
                return;
            }
            gs.skills.push({ name: name, parent: attrKey, lv: 1, exp: 0 });
        }

        if(window.App) App.saveData();
        EventBus.emit(EVENTS.Stats.UPDATED);
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay');
    },

    // 核心運算：等級檢查 (與 MainController 連動)
    checkLevelUp: function() {
        const gs = window.GlobalState;
        const nextExp = gs.lv * 100;
        if (gs.exp >= nextExp) {
            gs.exp -= nextExp;
            gs.lv++;
            gs.freeGem = (gs.freeGem || 0) + 10; // 升級送鑽石
            EventBus.emit(EVENTS.System.TOAST, `🆙 玩家等級提升至 Lv.${gs.lv}！(+10💎)`);
            EventBus.emit(EVENTS.Stats.UPDATED);
        }
    }
};