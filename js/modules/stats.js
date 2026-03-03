/* js/modules/stats.js - V42.0 XP Logic Fix */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Stats = {
    // =========================================
    // 1. 初始化
    // =========================================
    init: function() {
        const gs = window.SQ.State;
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
        // 玩家經驗已經由 addPlayerExp 處理，這裡專注於技能與屬性即可
        if (task.attrs && task.attrs.length > 0) {
            task.attrs.forEach(attrName => {
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
	addPlayerExp: function(amount) {
        const gs = window.SQ.State;
        if (!gs) return;
        
        gs.exp = (gs.exp || 0) + amount;
        this.checkLevelUp(); // 增加經驗後立刻強制檢查
        this._saveAndNotify();
    },
	
    checkLevelUp: function() {
        const gs = window.SQ.State;
        if (!gs) return;

        let leveledUp = false;
        
        // 使用 while 處理單次獲得大量經驗值導致的「連續升級」
        while (gs.exp >= (gs.lv * 100)) {
            let max = gs.lv * 100;
            gs.exp -= max;
            gs.lv++;
            leveledUp = true;
            
            if(window.SQ.EventBus) {
                window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `🆙 玩家等級提升！Lv.${gs.lv}`);
            }
        }

        if (leveledUp && window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.Stats.LEVEL_UP);
        }
    },

    // [新增] 玩家經驗倒扣與降級邏輯 (供 TaskEngine 呼叫)
    reducePlayerExp: function(amount, isStrict) {
        const gs = window.SQ.State;
        
        // 先直接扣除
        gs.exp -= amount;

        if (isStrict) {
            // --- 嚴格模式：允許降級 (De-level) ---
            // 當經驗值變負數，且等級 > 1 時，執行降級回補
            while (gs.exp < 0 && gs.lv > 1) {
                gs.lv--;
                gs.exp += (gs.lv * 100); // 補回上一級的經驗池
                
                if(window.SQ.EventBus) {
                    window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `📉 經驗回收... 等級降回 Lv.${gs.lv}`);
                }
            }
            // 最低底限：Lv.1 0 exp (不能變成 Lv.0 或 Lv.1 的負經驗)
            if (gs.lv === 1 && gs.exp < 0) gs.exp = 0;

        } else {
            // --- 一般模式：保護等級 (Safe Floor) ---
            // 如果扣到負數，直接歸零，不降級
            if (gs.exp < 0) {
                gs.exp = 0;
            }
        }
        
        this._saveAndNotify();
    },

    addSkillProficiency: function(name, amount = 1) {
        const gs = window.SQ.State;
        const skillIndex = gs.skills.findIndex(s => s.name === name);
        
        if (skillIndex > -1) {
            const skill = gs.skills[skillIndex];
            
            // [新增] 更新最後修煉時間 (用於蜘蛛網判定)
            skill.lastUsed = Date.now();

            skill.exp += amount;
            const max = skill.lv * 10; 
            
            if (skill.exp >= max) {
                skill.exp = 0;
                skill.lv++;
                if(window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `💡 技能 [${skill.name}] 升至 Lv.${skill.lv}`);
                
                if (skill.lv >= 10 && !skill.isMaxed) {
                    skill.isMaxed = true;
                    if(window.SQ.EventBus && window.SQ.Events.Stats.SKILL_MAXED) {
                        window.SQ.EventBus.emit(window.SQ.Events.Stats.SKILL_MAXED, skill);
                    }
                    this.archiveSkill(skill.name);
                }
            }
            if (skill.parent && gs.attrs[skill.parent]) {
                this._addAttributeExp(skill.parent, amount);
            }
        } else {
            if (gs.attrs[name]) {
                this._addAttributeExp(name, amount);
            }
        }
    },

    // [內部] 增加屬性經驗並檢查升級
    _addAttributeExp: function(attrKey, amount) {
    const gs = window.SQ.State;
    const attr = gs.attrs[attrKey];
    if (!attr) return;

    attr.exp += amount;
    
    // 使用 while 處理連續升級
    // 注意：升級後 attr.v 變大，下一級門檻 (attr.v * 100) 也會變高
    let nextLevelCap = attr.v * 100;
    
    while (attr.exp >= nextLevelCap) {
        attr.exp -= nextLevelCap;
        attr.v++;
        if(window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `🎉 ${attr.name} 提升至 Lv.${attr.v}`);
        
        // 更新下一級門檻
        nextLevelCap = attr.v * 100;
    }
},

    // [關鍵修改] 減少技能經驗 -> 同步減少主屬性經驗
    _reduceSkillProficiency: function(name, amount) {
        const gs = window.SQ.State;
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
        const gs = window.SQ.State;
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
        const gs = window.SQ.State;
        const idx = gs.skills.findIndex(s => s.name === skillName);
        
        if (idx !== -1) {
            const skill = gs.skills[idx];
            gs.skills.splice(idx, 1);
            gs.archivedSkills.push(skill);
            
            if(window.SQ.Actions.alert) window.SQ.Actions.alert(`🎉 恭喜！技能 [${skill.name}] 已達到大師級！\n它將被移至榮譽殿堂。`);
            this._saveAndNotify();
        }
    },

    // =========================================
    // 4. 管理與其他 (CRUD)
    // =========================================
    saveSkill: function(name, parentAttr, editId = null) {
        const gs = window.SQ.State;
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
        const gs = window.SQ.State;
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
        const gs = window.SQ.State;
        // 1. 檢查變數 (新版 DLC 變數 + 設定開關)
        const isStrict = gs.unlocks && gs.unlocks.feature_strict && gs.settings.strictMode;
        if (!isStrict) return;

        // 2. 扣除技能經驗
        if (skillNames && skillNames.length > 0) {
            const expPerAttr = Math.floor(totalExp / skillNames.length);
            skillNames.forEach(name => {
                this._reduceSkillProficiency(name, expPerAttr);
            });
        }
        
        // 3. 扣除玩家經驗 (呼叫共用的 helper 處理降級)
        this.reducePlayerExp(Math.floor(totalExp * 0.5));
    },

    _saveAndNotify: function() {
        if (window.App && window.App.saveData) App.saveData();
        if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
    }
};