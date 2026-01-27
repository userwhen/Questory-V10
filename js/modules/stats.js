/* js/modules/stats.js - V34.Final (Complete & Restored) */
window.StatsEngine = {
    // =========================================================================
    // 1. 初始化與資料修復
    // =========================================================================
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        // 屬性白名單
        const defaults = {
            STR: { name: '體能', icon: '💪' },
            INT: { name: '思考', icon: '🧠' },
            AGI: { name: '技術', icon: '🛠️' },
            CHR: { name: '魅力', icon: '✨' },
            VIT: { name: '創造', icon: '🎨' },
            LUK: { name: '經營', icon: '💼' }
        };

        // 資料結構補齊
        if (!gs.attrs) gs.attrs = {};
        Object.keys(defaults).forEach(k => {
            if (!gs.attrs[k]) gs.attrs[k] = { ...defaults[k], v: 1, exp: 0 };
            else {
                // 更新顯示名稱與圖標 (防舊存檔過期)
                gs.attrs[k].name = defaults[k].name;
                gs.attrs[k].icon = defaults[k].icon;
            }
        });

        if (!gs.skills) gs.skills = [];
        if (!gs.archivedSkills) gs.archivedSkills = [];
        if (!gs.cal) gs.cal = { today: 0, logs: [] };
        
        // 補齊玩家等級經驗 (如果沒有)
        if (typeof gs.lv === 'undefined') gs.lv = 1;
        if (typeof gs.exp === 'undefined') gs.exp = 0;

        console.log("📊 StatsEngine (V34 Complete) Initialized.");
    },

    // =========================================================================
    // 2. 核心邏輯 (經驗值、升級)
    // =========================================================================
    
    // [補回] 檢查並執行玩家升級
    checkLevelUp: () => {
        const gs = window.GlobalState;
        const max = gs.lv * 100; // 簡易公式：Lv * 100 為升級所需經驗
        if (gs.exp >= max) {
            gs.exp -= max;
            gs.lv++;
            act.toast(`🆙 升級！Lv.${gs.lv}`);
            
            // 遞迴檢查 (防止一次獲得大量經驗連升兩級的情況)
            StatsEngine.checkLevelUp();
        }
        if(window.App) App.saveData();
    },

    // 經驗值分配 (屬性經驗)
    distributeExp: function(totalExp, skillNames) {
        const gs = window.GlobalState;
        if (!skillNames || !skillNames.length) return;
        
        const expPerAttr = Math.floor(totalExp / skillNames.length);
        
        skillNames.forEach(name => {
            // 先找現役技能，再找大師技能
            const skill = gs.skills.find(s => s.name === name) || gs.archivedSkills.find(s => s.name === name);
            
            if (skill && skill.parent) {
                const parentKey = skill.parent.toUpperCase();
                const attr = gs.attrs[parentKey];
                
                if (attr) {
                    attr.exp += expPerAttr;
                    // 屬性升級邏輯
                    const max = attr.v * 100;
                    if (attr.exp >= max) {
                        attr.exp -= max;
                        attr.v++;
                        if(window.act) act.toast(`🎉 ${attr.name} 升級至 Lv.${attr.v}`);
                    }
                }
            }
        });
        
        // 同步增加玩家總經驗
        gs.exp += Math.floor(totalExp * 0.5); // 屬性經驗的一半轉為玩家經驗
        StatsEngine.checkLevelUp();
        
        if(window.App) App.saveData();
        if(window.EventBus) EventBus.emit(window.EVENTS.Stats.UPDATED);
    },

    // [補回] 技能熟練度增加
    addSkillProficiency: (skillName, exp = 1) => {
        const gs = window.GlobalState;
        if (!gs.skills) gs.skills = [];
        
        let skill = gs.skills.find(s => s.name === skillName);
        
        // 自動學習新技能
        if (!skill) {
            // 預設綁定到 STR，或者需要更複雜的邏輯去猜測
            skill = { name: skillName, parent: 'STR', lv: 1, exp: 0 };
            gs.skills.push(skill);
            act.toast(`💡 習得新技能 [${skillName}]`);
        }
        
        skill.exp += exp;
        const max = skill.lv * 10; // 簡易公式
        
        if (skill.exp >= max) {
            skill.exp = 0;
            skill.lv++;
            act.toast(`💡 技能 [${skill.name}] Lv.${skill.lv}！`);
            
            // Lv.10 自動大師化
            if (skill.lv >= 10) {
                StatsEngine.archiveSkill(skill);
            }
        }
        if(window.EventBus) EventBus.emit(window.EVENTS.Stats.UPDATED);
    },

    // [補回] 技能大師化 (Archive)
    archiveSkill: (skill) => {
        const gs = window.GlobalState;
        const idx = gs.skills.findIndex(s => s.name === skill.name);
        
        if (idx !== -1) {
            gs.skills.splice(idx, 1);
            gs.archivedSkills.push(skill);
            
            // 顯示彈窗
            if(window.act && act.alert) act.alert(`🎉 恭喜！\n技能 [${skill.name}] 已大師化！\n屬性加成將永久保留。`);
            
            // 檢查成就是否有關聯
            const ach = gs.achievements ? gs.achievements.find(a => a.targetKey === skill.name) : null;
            if (ach && !ach.done) {
                ach.curr = ach.targetVal;
                // 注意：這裡不設 done=true，交給 AchEngine 自動檢查
            }
            
            if (window.view && view.renderStats) view.renderStats();
        }
    },
    
    // [補回] 經驗倒扣 (懲罰用)
    deductExp: (totalExp, skillNames) => {
       const gs = window.GlobalState;
       if (!skillNames || !skillNames.length) return;
       const expPerAttr = Math.floor(totalExp / skillNames.length);

       skillNames.forEach(name => {
           let skill = gs.skills.find(s => s.name === name);
           if (skill && skill.parent) {
               const pKey = skill.parent.toUpperCase();
               if (gs.attrs[pKey]) {
                   const attr = gs.attrs[pKey];
                   attr.exp -= expPerAttr;
                   // 降級邏輯
                   while (attr.exp < 0 && attr.v > 1) {
                       attr.v--;
                       attr.exp += (attr.v * 100);
                   }
                   if (attr.v === 1 && attr.exp < 0) attr.exp = 0;
               }
           }
       });
       if(window.EventBus) EventBus.emit(window.EVENTS.Stats.UPDATED);
    },

    // =========================================================================
    // 3. UI 互動與表單 (Skill Modal)
    // =========================================================================

    // [補回] 開啟新增視窗
    openAddSkill: () => {
        const limit = 10;
        if (window.GlobalState.skills.length >= limit) return act.toast(`技能已達上限 (${limit})`);
        window.TempState.editSkillId = null;
        StatsEngine.renderSkillModal('新增技能');
    },

    // [補回] 開啟編輯視窗
    editSkill: (name) => {
        const s = window.GlobalState.skills.find(k => k.name === name);
        if(!s) return;
        window.TempState.editSkillId = name;
        StatsEngine.renderSkillModal('編輯技能', s);
    },

    // [補回] 渲染 Modal 內容
    renderSkillModal: (title, skill = null) => {
        const gs = window.GlobalState;
        const attrOptions = Object.keys(gs.attrs).map(k => 
            `<option value="${k}" ${skill && skill.parent && skill.parent.toUpperCase()===k ? 'selected' : ''}>${gs.attrs[k].name}</option>`
        ).join('');

        const bodyHtml = `
            <div style="margin-bottom:15px;">
                <label style="display:block; color:#888; font-size:0.8rem; margin-bottom:5px;">技能名稱</label>
                ${ui.input.text(skill ? skill.name : '', "例如: 程式設計", '', 'skill-input-name')}
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; color:#888; font-size:0.8rem; margin-bottom:5px;">綁定屬性</label>
                <select id="skill-input-attr" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc; background:#fff;">
                    ${attrOptions}
                </select>
            </div>
        `;

        let footHtml = '';
        if (skill) {
            footHtml = `
                ${ui.component.btn({label:'刪除', theme:'danger', action:'act.deleteSkill()'})}
                ${ui.component.btn({label:'保存', theme:'correct', style:'flex:1;', action:'act.submitNewSkill()'})}
            `;
        } else {
            footHtml = ui.component.btn({label:'新增', theme:'correct', style:'width:100%', action:'act.submitNewSkill()'});
        }

        ui.modal.render(title, bodyHtml, footHtml, 'panel');
    },

    // [補回] 提交技能 (新增/修改)
    submitNewSkill: () => {
        const elName = document.getElementById('skill-input-name');
        const elAttr = document.getElementById('skill-input-attr');
        if(!elName || !elAttr) return;

        const name = elName.value.trim();
        const attr = elAttr.value; 
        if(!name) return act.toast("請輸入名稱");
        
        const gs = window.GlobalState;
        
        // 檢查重複 (排除自己)
        const exists = gs.skills.find(s => s.name === name && s.name !== window.TempState.editSkillId);
        if(exists) return act.toast("技能名稱重複");
        
        if(window.TempState.editSkillId) {
            // --- 編輯模式 ---
            const skill = gs.skills.find(s => s.name === window.TempState.editSkillId);
            if(skill) {
                const oldName = skill.name;
                skill.name = name; 
                skill.parent = attr;
                
                // 連動更新任務綁定
                gs.tasks.forEach(t => {
                    if(t.attrs && t.attrs.includes(oldName)) {
                        t.attrs = t.attrs.map(n => n === oldName ? name : n);
                    }
                });
            }
        } else {
            // --- 新增模式 ---
            gs.skills.push({ name: name, parent: attr, lv: 1, exp: 0 });
            
            // 自動建立對應成就
            const achId = 'mst_' + Date.now();
            if(!gs.achievements) gs.achievements = [];
            gs.achievements.unshift({ 
                id: achId, title: `成為${name}大師!`, desc: `將 ${name} 升至 Lv.10`, 
                type: 'attr_lv', targetKey: name, targetVal: 10, 
                reward: { freeGem: 50, exp: 500 }, done: false, isSystem: true, curr: 1,
                claimed: false 
            });
            act.toast(`新增技能「${name}」`);
        }
        
        App.saveData(); 
        ui.modal.close('m-panel'); 
        if(window.view && view.renderStats) view.renderStats(); 
    },

    // [補回] 刪除技能
    deleteSkill: () => {
        const name = window.TempState.editSkillId;
        if(!name) return;
        
        sys.confirm(`確定刪除 [${name}]?`, () => {
            window.GlobalState.skills = window.GlobalState.skills.filter(s => s.name !== name);
            // 清理任務綁定
            window.GlobalState.tasks.forEach(t => {
                if(t.attrs && t.attrs.includes(name)) t.attrs = t.attrs.filter(n => n !== name);
            });
            
            ui.modal.close('m-panel'); 
            App.saveData(); 
            if(window.view && view.renderStats) view.renderStats();
            act.toast("已刪除");
        });
    }
};

// 橋接 act (供 HTML 或 Controller 呼叫)
window.act = window.act || {};
window.act.submitNewSkill = StatsEngine.submitNewSkill;
window.act.deleteSkill = StatsEngine.deleteSkill;