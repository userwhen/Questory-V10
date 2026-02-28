/* js/modules/ach.js - V40.0 Gamification Engine */
window.AchEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        // 統一存放在 achievements，若有舊的 milestones 則在 getSorted 時合併
        if (!gs.achievements) gs.achievements = [];
        // 如果你需要兼容舊存檔的 milestones 陣列，可以在這裡做遷移，或者保持雙軌並行
        if (!gs.milestones) gs.milestones = []; 
    },

    // 2. 監聽任務完成 (自動化積累)
    onTaskCompleted: function(task, impact) {
        // [修復 ACH-1] 補上防呆，確保 impact 必為數字，避免 NaN 壞檔
        const val = (typeof impact === 'number') ? impact : 1;
        
        const gs = window.GlobalState;
        const targets = gs.milestones || []; 
        let anyUpdate = false;

        targets.forEach(ms => {
            if (ms.done) return; 

            let isMatch = false;
            if (ms.targetType === 'tag' && task.cat === ms.targetValue) isMatch = true;
            else if (ms.targetType === 'attr' && task.attrs && task.attrs.includes(ms.targetValue)) isMatch = true;
            else if (ms.targetType === 'challenge') {
                const imp = parseInt(task.importance || 1);
                const urg = parseInt(task.urgency || 1);
                if (imp >= 3 && urg >= 3) isMatch = true;
            }

            if (isMatch) {
                // 使用安全過濾後的 val
                ms.curr = (ms.curr || 0) + val; 
                anyUpdate = true;
                
                if (ms.curr >= ms.target) {
                    this._unlockMilestone(ms);
                }
            }
        });

        if (anyUpdate) this._saveAndNotify();
    },
	
	// [新增] 處理任務取消完成 (倒扣進度)
    onTaskUndone: function(task, impact) {
        // [防呆] 確保 val 是一個數字，如果是 undefined 則預設為 1
        const val = (typeof impact === 'number') ? impact : 1;
        
        const gs = window.GlobalState;
        const targets = gs.milestones || [];
        let anyUpdate = false;

        targets.forEach(ms => {
            if (ms.claimed) return;

            let isMatch = false;
            if (ms.targetType === 'tag' && task.cat === ms.targetValue) isMatch = true;
            else if (ms.targetType === 'attr' && task.attrs && task.attrs.includes(ms.targetValue)) isMatch = true;
            else if (ms.targetType === 'challenge') {
                const imp = parseInt(task.importance || 1);
                const urg = parseInt(task.urgency || 1);
                if (imp >= 3 && urg >= 3) isMatch = true;
            }

            if (isMatch) {
                // [修正] 使用 val 進行運算，保證不會 NaN
                ms.curr = (ms.curr || 0) - val;
                
                // 歸零防呆
                if (ms.curr < 0) ms.curr = 0;
                
                // 如果之前已經判定完成，現在因為倒扣變得不完成了
                if (ms.done && ms.curr < ms.target) {
                    ms.done = false;
                }
                anyUpdate = true;
            }
        });

        if (anyUpdate) this._saveAndNotify();
    },

    // 內部：達成瞬間 (還沒領獎)
    _unlockMilestone: function(ms) {
        ms.curr = ms.target; // 避免溢出
        ms.done = true;      // 標記為達成 (此時應顯示「領取」按鈕)
        
        if (window.EventBus) {
            window.EventBus.emit(window.EVENTS.System.TOAST, `🎉 目標達成：${ms.title}`);
        }
    },

    // 3. [新增] 領取獎勵並歸檔 (Claim & Archive)
    claimReward: function(id) {
        const gs = window.GlobalState;
        const ms = gs.milestones.find(m => m.id === id);
        
        if (!ms) return { success: false, msg: "找不到目標" };
        if (!ms.done) return { success: false, msg: "目標尚未達成" };
        if (ms.claimed) return { success: false, msg: "已經領取過了" };

        // A. 發放獎勵
        const reward = ms.reward || { gold: 0, exp: 0 };
        gs.gold = (gs.gold || 0) + reward.gold;
        
        // ✅ [Bug 4 修復] 改用 StatsEngine 增加經驗值，確保會觸發升級檢查與 UI 更新
        if (window.StatsEngine && window.StatsEngine.addPlayerExp) {
            window.StatsEngine.addPlayerExp(reward.exp);
        } else {
            gs.exp = (gs.exp || 0) + reward.exp;
        }

        // B. 狀態流轉 -> 歸檔
        ms.claimed = true; // 標記為已領取 (View 層會根據此屬性將其移至「殿堂」)
        ms.finishDate = Date.now(); // 紀錄榮譽時刻

        // C. (可選) 歷史紀錄連動
        // 如果希望「達成成就」這件事也寫入 History，可以在這裡 push gs.history
        
        this._saveAndNotify();
        return { success: true, reward: reward };
    },

    // 4. 建立新目標 (Factory)
    _getTierConfig: function(tier) {
        const tierConfig = {
            'S': { target: 1000, reward: { gold: 500, exp: 1000 } },
            'A': { target: 500,  reward: { gold: 200, exp: 400 } },
            'B': { target: 200,  reward: { gold: 80,  exp: 150 } },
            'C': { target: 50,   reward: { gold: 20,  exp: 50 } }
        };
        return tierConfig[tier] || tierConfig['C'];
    },

    createMilestone: function(data) {
        const gs = window.GlobalState;
        if (!gs.milestones) gs.milestones = [];

        const config = this._getTierConfig(data.tier);

        const newMs = {
            id: 'ms_' + Date.now(),
            title: data.title,
            desc: `累積 ${config.target} 點影響力`, // 預設描述
            type: 'progress',
            targetType: data.targetType,
            targetValue: data.targetValue,
            tier: data.tier,
            
            curr: 0,
            target: config.target,
            reward: config.reward,

            done: false,
            claimed: false,
            startDate: Date.now(),
            finishDate: null
        };

        gs.milestones.push(newMs);
        this._saveAndNotify();
    },

    // [新增] 5. 更新現有目標
    updateMilestone: function(data) {
        const gs = window.GlobalState;
        if (!gs.milestones) return;

        const ms = gs.milestones.find(m => m.id === data.id);
        if (ms) {
            // 更新基本欄位
            ms.title = data.title;
            ms.targetType = data.targetType;
            ms.targetValue = data.targetValue;
            
            // 如果層級改變，重新計算目標與獎勵
            if (ms.tier !== data.tier) {
                const config = this._getTierConfig(data.tier);
                ms.tier = data.tier;
                ms.target = config.target;
                ms.reward = config.reward;
                // 順便更新描述 (如果使用者沒改過描述的話，這裡簡單處理直接覆蓋)
                ms.desc = `累積 ${config.target} 點影響力`;
            }
            
            // 重新檢查是否達成 (以防目標值變低了)
            if (ms.curr >= ms.target && !ms.done) {
                this._unlockMilestone(ms);
            }

            this._saveAndNotify();
        }
    },

    deleteMilestone: function(id) {
        const gs = window.GlobalState;
        if(gs.milestones) {
            gs.milestones = gs.milestones.filter(m => m.id !== id);
            this._saveAndNotify();
        }
    },

    // View Helper: 統一輸出接口
    getSortedAchievements: function() {
        const gs = window.GlobalState;
        // 這裡將 milestones (玩家自訂) 與 achievements (系統成就) 視為同一種資料格式輸出
        // 但為了區分邏輯，我們之後在 View 層可以用 .type 或 .isSystem 來過濾
        const list = [
            ...(gs.milestones || []),
            ...(gs.achievements || [])
        ];
        
        // 排序：可領取 > 進行中 > 已歸檔
        return list.sort((a, b) => {
            const scoreA = (a.done && !a.claimed) ? 2 : (!a.done ? 1 : 0);
            const scoreB = (b.done && !b.claimed) ? 2 : (!b.done ? 1 : 0);
            return scoreB - scoreA;
        });
    },

    _saveAndNotify: function() {
        if (window.App && window.App.saveData) App.saveData();
        if (window.EventBus) window.EventBus.emit(window.EVENTS.Ach.UPDATED);
    }
};