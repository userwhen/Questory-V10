/* js/modules/stats.js - V42.0 XP Logic Fix */
window.StatsEngine = {
    // =========================================
    // 1. 初始化
    // =========================================
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        const defaults = {
            STR: { name: '體能', icon: '💪' }, INT: { name: '思考', icon: '🧠' },
            AGI: { name: '技術', icon: '🛠️' }, CHR: { name: '魅力', icon: '✨' },
            VIT: { name: '創造', icon: '🎨' }, LUK: { name: '經營', icon: '💼' }
        };

        if (!gs.attrs) gs.attrs = {};
        const validKeys = Object.keys(defaults);
        
        Object.keys(gs.attrs).forEach(k => {
            if (k === 'DEX' && !gs.attrs.AGI) gs.attrs.AGI = gs.attrs.DEX;
            if (k === 'LUC' && !gs.attrs.LUK) gs.attrs.LUK = gs.attrs.LUC;
            if (!validKeys.includes(k)) delete gs.attrs[k];
        });

        validKeys.forEach(k => {
            if (!gs.attrs[k]) gs.attrs[k] = { ...defaults[k], v: 1, exp: 0 };
            else { gs.attrs[k].name = defaults[k].name; gs.attrs[k].icon = defaults[k].icon; }
        });

        if (!gs.skills) gs.skills = [];
        if (!gs.archivedSkills) gs.archivedSkills = [];
        if (typeof gs.lv === 'undefined') gs.lv = 1;
        if (typeof gs.exp === 'undefined') gs.exp = 0;

        console.log("📊 StatsEngine V42.0 XP Logic Fixed.");
    },

    // =========================================
    // 2. 核心邏輯：任務完成與取消
    // =========================================
	// [A] 任務完成
    onTaskCompleted: function(task, impact = 1) {
        // 1. 檢查人物升級 (經驗值由 TaskEngine 增加，這裡只檢查門檻)
        this.checkLevelUp(); 

        // 2. 增加技能熟練度 + 同步增加主屬性經驗
        if (task.attrs && task.attrs.length > 0) {
            task.attrs.forEach(attrName => {
                // 如果是技能名稱 (例如 "跑酷")，這裡會去加技能經驗
                // 如果是屬性名稱 (例如 "STR")，這裡也會處理
                this.addSkillProficiency(attrName, impact);
            });
        }

        this._saveAndNotify();
    },

    // [B] 任務取消
    onTaskUndone: function(task, impact) {
        const val = (typeof impact === 'number') ? impact : 1;

        // 倒扣技能與屬性經驗
        if (task.attrs && task.attrs.length > 0) {
            task.attrs.forEach(attrName => {
                this._reduceSkillProficiency(attrName, val); 
            });
        }
        this._saveAndNotify();
    },

    // =========================================
    // 3. 數值計算 Helper
    // =========================================

    checkLevelUp: function() {
        const gs = window.GlobalState;
        const max = gs.lv * 100;
        if (gs.exp >= max) {
            gs.exp -= max;
            gs.lv++;
            if(window.EventBus) {
                window.EventBus.emit(window.EVENTS.System.TOAST, `🆙 玩家等級提升！Lv.${gs.lv}`);
                window.EventBus.emit(window.EVENTS.Stats.LEVEL_UP);
            }
            this.checkLevelUp(); 
        }
    },

    // [關鍵修改] 增加技能經驗 -> 同步增加主屬性經驗
    addSkillProficiency: function(name, amount = 1) {
        const gs = window.GlobalState;
        
        // 1. 判斷是否為技能
        const skillIndex = gs.skills.findIndex(s => s.name === name);
        
        if (skillIndex > -1) {
            // --- 是技能 ---
            const skill = gs.skills[skillIndex];
            
            // A. 增加技能經驗
            skill.exp += amount;
            const max = skill.lv * 10; 
            
            // 技能升級判定
            if (skill.exp >= max) {
                skill.exp = 0;
                skill.lv++;
                if(window.EventBus) window.EventBus.emit(window.EVENTS.System.TOAST, `💡 技能 [${skill.name}] 升至 Lv.${skill.lv}`);
                
                if (skill.lv >= 10 && !skill.isMaxed) {
                    skill.isMaxed = true;
                    if(window.EventBus && window.EVENTS.Stats.SKILL_MAXED) {
                        window.EventBus.emit(window.EVENTS.Stats.SKILL_MAXED, skill);
                    }
                    this.archiveSkill(skill.name);
                }
            }

            // B. [新增] 同步增加主屬性經驗
            if (skill.parent && gs.attrs[skill.parent]) {
                this._addAttributeExp(skill.parent, amount);
            }

        } else {
            // --- 不是技能，可能是直接指定屬性 (如 STR) ---
            if (gs.attrs[name]) {
                this._addAttributeExp(name, amount);
            }
        }
    },

    // [內部] 增加屬性經驗並檢查升級
    _addAttributeExp: function(attrKey, amount) {
        const gs = window.GlobalState;
        const attr = gs.attrs[attrKey];
        if (!attr) return;

        attr.exp += amount;
        
        // 屬性升級公式: Lv * 100 (假設)
        const max = attr.v * 100;
        
        if (attr.exp >= max) {
            attr.exp -= max;
            attr.v++;
            if(window.EventBus) window.EventBus.emit(window.EVENTS.System.TOAST, `🎉 ${attr.name} 提升至 Lv.${attr.v}`);
            
            // 遞迴檢查 (防止一次加太多)
            if (attr.exp >= attr.v * 100) this._addAttributeExp(attrKey, 0);
        }
    },

    // [關鍵修改] 減少技能經驗 -> 同步減少主屬性經驗
    _reduceSkillProficiency: function(name, amount) {
        const gs = window.GlobalState;
        const skill = gs.skills.find(s => s.name === name);
        
        if (skill) {
            // 是技能
            skill.exp -= amount;
            while (skill.exp < 0 && skill.lv > 1) {
                skill.lv--;
                skill.exp += (skill.lv * 10); 
            }
            if (skill.exp < 0) skill.exp = 0;

            // 同步扣除主屬性
            if (skill.parent && gs.attrs[skill.parent]) {
                this._reduceAttributeExp(skill.parent, amount);
            }
        } else {
            // 是屬性
            if (gs.attrs[name]) {
                this._reduceAttributeExp(name, amount);
            }
        }
    },

    _reduceAttributeExp: function(attrKey, amount) {
        const gs = window.GlobalState;
        const attr = gs.attrs[attrKey];
        if (!attr) return;

        attr.exp -= amount;
        // 降級邏輯
        while (attr.exp < 0 && attr.v > 1) {
            attr.v--;
            attr.exp += (attr.v * 100);
        }
        if (attr.exp < 0) attr.exp = 0;
    },

    archiveSkill: function(skillName) {
        const gs = window.GlobalState;
        const idx = gs.skills.findIndex(s => s.name === skillName);
        
        if (idx !== -1) {
            const skill = gs.skills[idx];
            gs.skills.splice(idx, 1);
            gs.archivedSkills.push(skill);
            
            if(window.act.alert) window.act.alert(`🎉 恭喜！技能 [${skill.name}] 已達到大師級！\n它將被移至榮譽殿堂。`);
            this._saveAndNotify();
        }
    },

    // =========================================
    // 4. 管理與其他 (CRUD)
    // =========================================
    saveSkill: function(name, parentAttr, editId = null) {
        const gs = window.GlobalState;
        const exists = gs.skills.find(s => s.name === name && s.name !== editId);
        if (exists) return { success: false, msg: "技能名稱重複" };

        if (editId) {
            const skill = gs.skills.find(s => s.name === editId);
            if (skill) {
                const oldName = skill.name;
                skill.name = name;
                skill.parent = parentAttr;
                gs.tasks.forEach(t => {
                    if (t.attrs && t.attrs.includes(oldName)) {
                        t.attrs = t.attrs.map(n => n === oldName ? name : n);
                    }
                });
            }
        } else {
            if (gs.skills.length >= 10) return { success: false, msg: "技能數量已達上限" };
            gs.skills.push({ name: name, parent: parentAttr, lv: 1, exp: 0 });
        }

        this._saveAndNotify();
        return { success: true };
    },

    deleteSkill: function(name) {
        const gs = window.GlobalState;
        gs.skills = gs.skills.filter(s => s.name !== name);
        gs.tasks.forEach(t => {
            if (t.attrs && t.attrs.includes(name)) {
                t.attrs = t.attrs.filter(n => n !== name);
            }
        });
        this._saveAndNotify();
    },

    // 嚴格模式懲罰 (仍保留)
    deductExp: function(totalExp, skillNames) {
        const gs = window.GlobalState;
        const isStrict = gs.unlocks && gs.unlocks.strict_mode; 
        if (!isStrict) return;

        if (skillNames && skillNames.length > 0) {
            const expPerAttr = Math.floor(totalExp / skillNames.length);
            skillNames.forEach(name => {
                this._reduceSkillProficiency(name, expPerAttr);
            });
        }

        const playerLoss = Math.floor(totalExp * 0.5);
        gs.exp -= playerLoss;
        while (gs.exp < 0 && gs.lv > 1) {
            gs.lv--;
            gs.exp += (gs.lv * 100);
            if(window.EventBus) window.EventBus.emit(window.EVENTS.System.TOAST, `💔 慘痛教訓... 降級至 Lv.${gs.lv}`);
        }
        if (gs.lv === 1 && gs.exp < 0) gs.exp = 0;

        this._saveAndNotify();
    },

    _saveAndNotify: function() {
        if (window.App && window.App.saveData) App.saveData();
        if (window.EventBus) window.EventBus.emit(window.EVENTS.Stats.UPDATED);
    }
};