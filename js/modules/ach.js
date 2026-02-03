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
        const gs = window.GlobalState;
        // 我們主要監聽「玩家自訂的里程碑」(通常存放在 milestones 或 type='progress' 的 achievements)
        // 這裡假設我們統一操作 milestones 陣列作為「進行中」的目標
        const targets = gs.milestones || []; 
        let anyUpdate = false;

        targets.forEach(ms => {
            if (ms.done) return; // 已達成的就不再累積

            let isMatch = false;
            // A. 判定邏輯
            if (ms.targetType === 'tag' && task.cat === ms.targetValue) isMatch = true;
            else if (ms.targetType === 'attr' && task.attrs && task.attrs.includes(ms.targetValue)) isMatch = true;
            else if (ms.targetType === 'challenge') {
                const imp = parseInt(task.importance || 1);
                const urg = parseInt(task.urgency || 1);
                // 挑戰：高重要且高緊急 (3以上)
                if (imp >= 3 && urg >= 3) isMatch = true;
            }

            // B. 積累邏輯
            if (isMatch) {
                ms.curr = (ms.curr || 0) + impact; // 累積 Impact 值
                anyUpdate = true;
                
                // C. 達成判定
                if (ms.curr >= ms.target) {
                    this._unlockMilestone(ms);
                }
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
        gs.exp = (gs.exp || 0) + reward.exp;

        // B. 狀態流轉 -> 歸檔
        ms.claimed = true; // 標記為已領取 (View 層會根據此屬性將其移至「殿堂」)
        ms.finishDate = Date.now(); // 紀錄榮譽時刻

        // C. (可選) 歷史紀錄連動
        // 如果希望「達成成就」這件事也寫入 History，可以在這裡 push gs.history
        
        this._saveAndNotify();
        return { success: true, reward: reward };
    },

    // 4. 建立新目標 (Factory)
    createMilestone: function(data) {
        const gs = window.GlobalState;
        if (!gs.milestones) gs.milestones = [];

        // 自動判定數值與獎勵 (S/A/B/C)
        const tierConfig = {
            'S': { target: 1000, reward: { gold: 500, exp: 1000 } }, // 傳奇
            'A': { target: 500,  reward: { gold: 200, exp: 400 } },  // 史詩
            'B': { target: 200,  reward: { gold: 80,  exp: 150 } },  // 稀有
            'C': { target: 50,   reward: { gold: 20,  exp: 50 } }    // 普通
        };

        const config = tierConfig[data.tier] || tierConfig['C'];

        const newMs = {
            id: 'ms_' + Date.now(),
            title: data.title,
            desc: `累積 ${config.target} 點影響力`,
            type: 'progress',    // 類型：進度條
            targetType: data.targetType, // tag, attr, challenge
            targetValue: data.targetValue,
            tier: data.tier,     // S, A, B, C
            
            // 數值設定
            curr: 0,
            target: config.target,
            reward: config.reward, // 寫入獎勵

            // 狀態
            done: false,
            claimed: false,
            startDate: Date.now(),
            finishDate: null
        };

        gs.milestones.push(newMs);
        this._saveAndNotify();
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