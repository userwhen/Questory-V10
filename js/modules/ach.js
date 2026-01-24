/* js/modules/ach.js - V33.0 (Logic Engine) */
window.AchEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        if (!gs.achievements) gs.achievements = [];
        console.log("🏆 AchEngine Initialized.");
    },

    // 1. 核心排序 (未完成 > 簽到 > 已完成)
    getSortedAchievements: function() {
        if (!window.GlobalState || !window.GlobalState.achievements) return [];
        let achs = window.GlobalState.achievements;
        
        // 排序邏輯：簽到優先 -> 可領取優先 -> 未完成 -> 已完成
        return [...achs].sort((a,b) => { 
            if (a.type === 'check_in' && !a.done) return -1;
            if (b.type === 'check_in' && !b.done) return 1;
            const aReady = a.curr >= a.targetVal && !a.done;
            const bReady = b.curr >= b.targetVal && !b.done;
            if (aReady && !bReady) return -1;
            if (!aReady && bReady) return 1;
            if (a.done && !b.done) return 1;
            if (!a.done && b.done) return -1;
            return 0; 
        });
    },

    // 2. 簽到邏輯
    doCheckIn: function(id) {
        const ach = window.GlobalState.achievements.find(a => a.id === id);
        // 檢查日期 (防止重複簽到)
        const today = new Date().toDateString();
        if(ach && (!ach.done || ach.lastCheckIn !== today)) {
            ach.done = true; 
            ach.curr = (ach.curr || 0) + 1;
            ach.lastCheckIn = today; // 標記日期
            this.claimAchievement(id); 
        }
    },

    // 3. 領取獎勵
    claimAchievement: function(id) {
        const ach = window.GlobalState.achievements.find(a => a.id === id);
        if (!ach) return;
        
        const r = ach.reward || {};
        const gs = window.GlobalState;
        
        if(r.gold) gs.gold = (gs.gold||0) + r.gold;
        if(r.exp) gs.exp = (gs.exp||0) + r.exp;
        if(r.freeGem) gs.freeGem = (gs.freeGem||0) + r.freeGem;

        if (ach.type === 'check_in') {
            // 簽到只標記 done，不標記 claimed (因為明天還能簽)
            ach.done = true;
            EventBus.emit(EVENTS.System.TOAST, `簽到成功！獲得: 💰${r.gold||0}`);
        } else {
            ach.done = true;      
            ach.claimed = true;   
            ach.date = Date.now(); 
            EventBus.emit(EVENTS.System.TOAST, `成就達成！獲得: 💰${r.gold||0}`);
        }
        
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.Stats.UPDATED); // 更新 HUD
        EventBus.emit(EVENTS.Ach.UPDATED);   // 更新列表
    },

    // 4. 提交/保存成就 (新增/編輯)
    submitAchievement: function() {
        const data = window.TempState.editingAch;
        if (!data || !data.title) {
            EventBus.emit(EVENTS.System.TOAST, "請輸入標題");
            return;
        }
        
        const gs = window.GlobalState;
        const isEdit = !!data.id;
        const newId = isEdit ? data.id : `ach_${Date.now()}`;
        const targetVal = parseInt(data.targetVal) || 1;

        let ach = isEdit ? gs.achievements.find(a => a.id === newId) : {
            id: newId, curr: 0, done: false, claimed: false
        };

        if (!ach && isEdit) return;

        Object.assign(ach, {
            title: data.title,
            desc: data.desc,
            type: data.type,
            targetKey: data.targetKey || '',
            targetVal: targetVal,
            isSystem: !!data.isSystem,
            reward: { 
                gold: parseInt(data.reward?.gold) || 0, 
                exp: parseInt(data.reward?.exp) || 0,
                freeGem: parseInt(data.reward?.freeGem) || 0
            }
        });

        if (!isEdit) gs.achievements.unshift(ach);
        
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay');
        EventBus.emit(EVENTS.System.TOAST, "已保存");
        EventBus.emit(EVENTS.Ach.UPDATED);
    },

    deleteAchievement: function(id) {
        window.GlobalState.achievements = window.GlobalState.achievements.filter(a => a.id !== id);
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay'); // 關閉編輯窗 (如果有的話)
        EventBus.emit(EVENTS.System.TOAST, "🗑️ 成就已刪除");
        EventBus.emit(EVENTS.Ach.UPDATED);
    },

    // 5. 監聽器 (Listener Logic) - 檢查條件是否達成
    checkConditions: function(eventType, payload) {
        const gs = window.GlobalState;
        if(!gs.achievements) return;

        let changed = false;
        gs.achievements.forEach(ach => {
            if(ach.done) return;

            // A. 任務完成次數監聽
            if (ach.type === 'task_count' && eventType === 'TASK_COMPLETED') {
                // 如果有指定關鍵字 (targetKey)，檢查分類或標題
                if (ach.targetKey) {
                    const task = payload.task;
                    if (task.cat.includes(ach.targetKey) || task.title.includes(ach.targetKey)) {
                        ach.curr++;
                        changed = true;
                    }
                } else {
                    // 沒指定關鍵字，任意任務都算
                    ach.curr++;
                    changed = true;
                }
            }

            // B. 屬性等級監聽
            if (ach.type === 'attr_lv' && eventType === 'STATS_UPDATED') {
                const key = ach.targetKey?.toUpperCase(); // 例如 'STR'
                if (gs.attrs && gs.attrs[key]) {
                    const nowLv = gs.attrs[key].v;
                    if (nowLv > ach.curr) {
                        ach.curr = nowLv;
                        changed = true;
                    }
                }
            }
        });

        if(changed) {
            if(window.App) App.saveData();
            EventBus.emit(EVENTS.Ach.UPDATED);
        }
    }
};