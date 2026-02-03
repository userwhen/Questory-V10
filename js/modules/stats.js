/* js/modules/stats.js - V39.0 Stats Engine (Logic & Ghost Killer) */
/* 負責：屬性計算、經驗分配、技能管理、幽靈資料清除 */

window.StatsEngine = {
    // =========================================
    // 1. 初始化與資料修復 (Ghost Killer)
    // =========================================
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        // 1. 定義標準白名單 (Whitelist)
        const defaults = {
            STR: { name: '體能', icon: '💪', desc: '影響運動與勞動效率' },
            INT: { name: '思考', icon: '🧠', desc: '影響學習與規劃能力' },
            AGI: { name: '技術', icon: '🛠️', desc: '影響操作與反應速度' },
            CHR: { name: '魅力', icon: '✨', desc: '影響社交與互動結果' },
            VIT: { name: '創造', icon: '🎨', desc: '影響藝術與創作靈感' },
            LUK: { name: '經營', icon: '💼', desc: '影響財富與資源管理' }
        };

        // 2. 資料結構修復
        if (!gs.attrs) gs.attrs = {};
        
        // [Ghost Killer] 刪除幽靈資料 (不在白名單內的 Key 全部殺掉)
        const validKeys = Object.keys(defaults);
        Object.keys(gs.attrs).forEach(currentKey => {
            // 自動修正舊版 Key (例如 DEX -> AGI)
            if (currentKey === 'DEX' && !gs.attrs.AGI) gs.attrs.AGI = gs.attrs.DEX;
            if (currentKey === 'LUC' && !gs.attrs.LUK) gs.attrs.LUK = gs.attrs.LUC;

            if (!validKeys.includes(currentKey)) {
                console.warn(`👻 Ghost Killer: Removing invalid attribute [${currentKey}]`);
                delete gs.attrs[currentKey];
            }
        });

        // [补全] 補齊缺失資料 (保留等級，只補 ICON 和 Name)
        validKeys.forEach(k => {
            if (!gs.attrs[k]) {
                // 新建 Lv.1
                gs.attrs[k] = { ...defaults[k], v: 1, exp: 0 };
            } else {
                // 更新顯示資料 (Icon/Name) 但保留數值
                gs.attrs[k].name = defaults[k].name;
                gs.attrs[k].icon = defaults[k].icon;
                if (typeof gs.attrs[k].v === 'undefined') gs.attrs[k].v = 1;
                if (typeof gs.attrs[k].exp === 'undefined') gs.attrs[k].exp = 0;
            }
        });

        // 3. 技能與其他初始化
        if (!gs.skills) gs.skills = [];
        if (!gs.archivedSkills) gs.archivedSkills = [];
        if (typeof gs.lv === 'undefined') gs.lv = 1;
        if (typeof gs.exp === 'undefined') gs.exp = 0;

        console.log("📊 StatsEngine V39 Initialized (Ghosts Cleared).");
    },

    // =========================================
    // 2. 經驗值與升級邏輯
    // =========================================

    // 分配經驗 (Task 完成時呼叫)
    distributeExp: function(totalExp, skillNames) {
        const gs = window.GlobalState;
        
        // 1. 分配給屬性 (Attributes)
        if (skillNames && skillNames.length > 0) {
            const expPerAttr = Math.floor(totalExp / skillNames.length);
            
            skillNames.forEach(name => {
                // 查找技能 (包含已大師化的) 以確定對應屬性
                const skill = gs.skills.find(s => s.name === name) || gs.archivedSkills.find(s => s.name === name);
                
                // 如果找不到技能物件，但它本身就是屬性名稱 (相容舊版)
                let parentKey = skill ? skill.parent : (gs.attrs[name] ? name : null);

                if (parentKey && gs.attrs[parentKey]) {
                    const attr = gs.attrs[parentKey];
                    attr.exp += expPerAttr;
                    
                    // 屬性升級檢查
                    const max = attr.v * 100;
                    if (attr.exp >= max) {
                        attr.exp -= max;
                        attr.v++;
                        if(window.EventBus) window.EventBus.emit(window.EVENTS.System.TOAST, `🎉 ${attr.name} 提升至 Lv.${attr.v}`);
                    }
                }
            });
        }

        // 2. 分配給玩家本體 (Player Level) - 50% 比例
        // 無論有沒有綁定屬性，玩家本體都會獲得經驗
        const playerExpGain = Math.floor(totalExp * 0.5);
        if (playerExpGain > 0) {
            gs.exp += playerExpGain;
            this.checkLevelUp();
        }

        this._saveAndNotify();
    },

    // 檢查玩家升級
    checkLevelUp: function() {
        const gs = window.GlobalState;
        const max = gs.lv * 100; // 簡易公式
        if (gs.exp >= max) {
            gs.exp -= max;
            gs.lv++;
            if(window.EventBus) {
                window.EventBus.emit(window.EVENTS.System.TOAST, `🆙 玩家等級提升！Lv.${gs.lv}`);
                window.EventBus.emit(window.EVENTS.Stats.LEVEL_UP); // 觸發特效
            }
            // 遞迴檢查 (防止連升多級)
            this.checkLevelUp();
        }
    },

    // 增加技能熟練度
    addSkillProficiency: function(skillName, amount = 1) {
        const gs = window.GlobalState;
        const skillIndex = gs.skills.findIndex(s => s.name === skillName);
        
        if (skillIndex > -1) {
            const skill = gs.skills[skillIndex];
            skill.exp += amount;
            const max = skill.lv * 10; 
            
            if (skill.exp >= max) {
                skill.exp = 0;
                skill.lv++;
                if(window.EventBus) window.EventBus.emit(window.EVENTS.System.TOAST, `💡 技能 [${skill.name}] 升至 Lv.${skill.lv}`);
                
                // Lv.10 自動大師化
                if (skill.lv >= 10) {
                    this.archiveSkill(skill.name);
                }
            }
            this._saveAndNotify();
        }
    },

    // 技能大師化 (Archive)
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
    // 3. 懲罰機制 (Strict Mode)
    // =========================================
    deductExp: function(totalExp, skillNames) {
        const gs = window.GlobalState;
        const isStrict = gs.unlocks && gs.unlocks.strict_mode; // DLC 檢查

        // 1. 扣除屬性經驗
        if (skillNames && skillNames.length > 0) {
            const expPerAttr = Math.floor(totalExp / skillNames.length);
            skillNames.forEach(name => {
                const skill = gs.skills.find(s => s.name === name);
                let parentKey = skill ? skill.parent : (gs.attrs[name] ? name : null);
                
                if (parentKey && gs.attrs[parentKey]) {
                    const attr = gs.attrs[parentKey];
                    attr.exp -= expPerAttr;
                    
                    // 降級邏輯 (僅在嚴格模式下允許降級)
                    if (isStrict) {
                        while (attr.exp < 0 && attr.v > 1) {
                            attr.v--;
                            attr.exp += (attr.v * 100);
                        }
                    }
                    // 非嚴格模式，底限為 0
                    if (attr.exp < 0) attr.exp = 0;
                }
            });
        }

        // 2. 扣除玩家經驗 (Strict Mode Logic)
        if (isStrict) {
            const playerLoss = Math.floor(totalExp * 0.5);
            gs.exp -= playerLoss;
            while (gs.exp < 0 && gs.lv > 1) {
                gs.lv--;
                gs.exp += (gs.lv * 100);
                if(window.EventBus) window.EventBus.emit(window.EVENTS.System.TOAST, `💔 慘痛教訓... 降級至 Lv.${gs.lv}`);
            }
            if (gs.lv === 1 && gs.exp < 0) gs.exp = 0;
        }

        this._saveAndNotify();
    },

    // =========================================
    // 4. CRUD (技能管理)
    // =========================================
    
    // 新增/修改技能
    // editId: 如果有值代表修改，null 代表新增
    saveSkill: function(name, parentAttr, editId = null) {
        const gs = window.GlobalState;
        
        // 檢查重複 (排除自己)
        const exists = gs.skills.find(s => s.name === name && s.name !== editId);
        if (exists) return { success: false, msg: "技能名稱重複" };

        if (editId) {
            // 修改
            const skill = gs.skills.find(s => s.name === editId);
            if (skill) {
                const oldName = skill.name;
                skill.name = name;
                skill.parent = parentAttr;
                
                // 連動更新 Task 的屬性綁定
                gs.tasks.forEach(t => {
                    if (t.attrs && t.attrs.includes(oldName)) {
                        t.attrs = t.attrs.map(n => n === oldName ? name : n);
                    }
                });
            }
        } else {
            // 新增 (上限 10)
            if (gs.skills.length >= 10) return { success: false, msg: "技能數量已達上限" };
            
            gs.skills.push({ name: name, parent: parentAttr, lv: 1, exp: 0 });
        }

        this._saveAndNotify();
        return { success: true };
    },

    deleteSkill: function(name) {
        const gs = window.GlobalState;
        gs.skills = gs.skills.filter(s => s.name !== name);
        
        // 清理 Task 綁定
        gs.tasks.forEach(t => {
            if (t.attrs && t.attrs.includes(name)) {
                t.attrs = t.attrs.filter(n => n !== name);
            }
        });

        this._saveAndNotify();
    },

    _saveAndNotify: function() {
        if (window.App && window.App.saveData) App.saveData();
        if (window.EventBus) window.EventBus.emit(window.EVENTS.Stats.UPDATED);
    }
};