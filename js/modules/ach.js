/* js/modules/ach.js - V40.0 Gamification Engine */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Ach = {
    init: function() {
        const gs = window.SQ.State;
        if (!gs) return;
        if (!gs.achievements) gs.achievements = [];
        if (!gs.milestones) gs.milestones = []; 

        // 👈 新增：確保官方「累積登入」成就永遠存在
        let loginAch = gs.achievements.find(a => a.id === 'sys_login_days');
        if (!loginAch) {
            const config = this._getTierConfig('C', 'login_days');
            gs.achievements.push({
                id: 'sys_login_days',
                title: '👣 冒險足跡',
                desc: `累積登入 ${config.target} 天`,
                type: 'progress',
                targetType: 'login_days',
                tier: 'C',
                curr: (gs.stats && gs.stats.loginDays) ? gs.stats.loginDays : 0,
                target: config.target,
                reward: config.reward,
                done: false,
                claimed: false,
                isSystem: true,
                isUpgradeable: true // 標記為可自動升級的成就
            });
        }
    },

    // 2. 監聽任務完成 (自動化積累)
    onTaskCompleted: function(task, impact) {
        // [修復 ACH-1] 補上防呆，確保 impact 必為數字，避免 NaN 壞檔
        const val = (typeof impact === 'number') ? impact : 1;
        
        const gs = window.SQ.State;
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
        
        const gs = window.SQ.State;
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
	// [新增] 監聽計時器完成 (專注/番茄鐘成就)
    onTimerCompleted: function(mode, minutes) {
        const gs = window.SQ.State;
        const targets = gs.milestones || [];
        let anyUpdate = false;

        targets.forEach(ms => {
            if (ms.done) return;

            let isMatch = false;
            let valToAdd = 0;

            if (ms.targetType === 'focus_time') {
                isMatch = true;
                valToAdd = minutes; // 累積分鐘數
            } else if (ms.targetType === 'pomodoro' && mode === 'pomodoro') {
                isMatch = true;
                valToAdd = 1; // 完成一次循環，累積 1 顆番茄
            }

            if (isMatch && valToAdd > 0) {
                ms.curr = (ms.curr || 0) + valToAdd;
                anyUpdate = true;
                if (ms.curr >= ms.target) this._unlockMilestone(ms);
            }
        });

        if (anyUpdate) this._saveAndNotify();
    },

    // 內部：達成瞬間 (還沒領獎)
    _unlockMilestone: function(ms) {
        ms.curr = ms.target; // 避免溢出
        ms.done = true;      // 標記為達成 (此時應顯示「領取」按鈕)
        
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `🎉 目標達成：${ms.title}`);
        }
    },

    // 3. [新增] 領取獎勵並歸檔 (Claim & Archive)
    claimReward: function(id) {
        const gs = window.SQ.State;
        // 同時在玩家目標與官方成就中尋找
        let ms = gs.milestones.find(m => m.id === id) || gs.achievements.find(m => m.id === id);
        
        if (!ms) return { success: false, msg: "找不到目標" };
        if (!ms.done) return { success: false, msg: "目標尚未達成" };
        if (ms.claimed) return { success: false, msg: "已經領取過了" };

        // A. 發放獎勵
        const reward = ms.reward || { gold: 0, exp: 0 };
        gs.gold = (gs.gold || 0) + reward.gold;
        if (window.SQ.Engine.Stats && window.SQ.Engine.Stats.addPlayerExp) {
            window.SQ.Engine.Stats.addPlayerExp(reward.exp);
        } else {
            gs.exp = (gs.exp || 0) + reward.exp;
        }

        // B. 自動升階邏輯 (Auto-Leveling)
        if (ms.isUpgradeable && ms.tier !== 'S') {
            const nextTierMap = { 'C': 'B', 'B': 'A', 'A': 'S' };
            const nextTier = nextTierMap[ms.tier];
            const newConfig = this._getTierConfig(nextTier, ms.targetType);

            ms.tier = nextTier;
            ms.target = newConfig.target;
            ms.reward = newConfig.reward;
            const unit = this._getUnitString(ms.targetType);
            ms.desc = `累積完成 ${newConfig.target} ${unit}`; // 👈 修正：動態抓取單位 (分鐘/顆/天/點)

            // 如果玩家很猛，已經超過了下一階的目標，就直接設為達成
            ms.done = (ms.curr >= ms.target); 
            // 💡 關鍵：不要標記為 claimed，讓它繼續留在畫面上挑戰下一階！
        } else {
            // 一般成就，或是已經 S 級封頂的成就 -> 正常歸檔
            ms.claimed = true; 
            ms.finishDate = Date.now();
        }

        this._saveAndNotify();
        return { success: true, reward: reward };
    },

    // 4. 建立新目標 (Factory) 與 數值矩陣
    _getTierConfig: function(tier, targetType) {
        // 數值矩陣：根據不同目標類型，給予不同的肝度要求
        const targets = {
            'tag':          { 'S': 1000, 'A': 500,  'B': 200,  'C': 50 },
            'attr':         { 'S': 1000, 'A': 500,  'B': 200,  'C': 50 },
            'focus_time':   { 'S': 6000, 'A': 3000, 'B': 1200, 'C': 300 }, // 分鐘
            'pomodoro':     { 'S': 250,  'A': 100,  'B': 40,   'C': 10 },  // 顆
            'login_days':   { 'S': 365,  'A': 100,  'B': 30,   'C': 7 },   // 累積天數
            'login_streak': { 'S': 50,   'A': 21,   'B': 7,    'C': 3 }    // 連續天數
        };

        const rewards = {
            'S': { gold: 500, exp: 1000 },
            'A': { gold: 200, exp: 400 },
            'B': { gold: 80,  exp: 150 },
            'C': { gold: 20,  exp: 50 }
        };

        const tType = targets[targetType] ? targetType : 'tag';
        return {
            target: targets[tType][tier] || targets[tType]['C'],
            reward: rewards[tier] || rewards['C']
        };
    },

    // 動態取得單位文字的 Helper
    _getUnitString: function(type) {
        if (type === 'focus_time') return '分鐘';
        if (type === 'pomodoro') return '顆番茄';
        if (type === 'login_days' || type === 'login_streak') return '天';
        return '點 Impact';
    },

    createMilestone: function(data) {
        const gs = window.SQ.State;
        if (!gs.milestones) gs.milestones = [];

        const config = this._getTierConfig(data.tier, data.targetType);
        const unit = this._getUnitString(data.targetType);

        const newMs = {
            id: 'ms_' + Date.now(),
            title: data.title,
            desc: `累積完成 ${config.target} ${unit}`, // 動態描述
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
            finishDate: null,
            isUpgradeable: data.isUpgradeable || false // 👈 新增：接收玩家表單的設定
        };
        gs.milestones.push(newMs);
        this._saveAndNotify();
    },

    updateMilestone: function(data) {
        const gs = window.SQ.State;
        if (!gs.milestones) return;

        const ms = gs.milestones.find(m => m.id === data.id);
        if (ms) {
            ms.title = data.title;
            ms.isUpgradeable = data.isUpgradeable || false; // 👈 新增：支援編輯時修改
            
            // 只要層級或目標類型有改，就必須重新計算矩陣數值！
            if (ms.tier !== data.tier || ms.targetType !== data.targetType) {
                const config = this._getTierConfig(data.tier, data.targetType);
                ms.tier = data.tier;
                ms.targetType = data.targetType;
                ms.targetValue = data.targetValue;
                ms.target = config.target;
                ms.reward = config.reward;
                
                const unit = this._getUnitString(data.targetType);
                ms.desc = `累積完成 ${config.target} ${unit}`;
            }
            
            if (ms.curr >= ms.target && !ms.done) this._unlockMilestone(ms);
            this._saveAndNotify();
        }
    },

    deleteMilestone: function(id) {
        const gs = window.SQ.State;
        if(gs.milestones) {
            gs.milestones = gs.milestones.filter(m => m.id !== id);
            this._saveAndNotify();
        }
    },

    // =========================================
    // 新增：登入與連續打卡系統
    // =========================================
    checkDailyLogin: function() {
        const gs = window.SQ.State;
        if (!gs) return;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;

        if (!gs.stats) gs.stats = {};
        if (gs.stats.lastLoginDate === todayStr) return; // 今天已經檢查過了

        // 檢查是否連續 (昨天有登入)
        const yesterday = new Date(now.getTime() - 86400000);
        const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;

        gs.stats.loginDays = (gs.stats.loginDays || 0) + 1; // 總天數永遠 +1

        if (gs.stats.lastLoginDate === yesterdayStr) {
            gs.stats.loginStreak = (gs.stats.loginStreak || 0) + 1; // 連續天數 +1
        } else {
            gs.stats.loginStreak = 1; // 斷了，重置為 1
        }

        gs.stats.lastLoginDate = todayStr;

        // 發送廣播給成就系統
        if (window.SQ.EventBus) window.SQ.EventBus.emit('LOGIN_UPDATED', {
            total: gs.stats.loginDays,
            streak: gs.stats.loginStreak
        });

        if (window.App) App.saveData();
    },

    onLoginUpdated: function(totalDays, streakDays) {
        const gs = window.SQ.State;
        const targets = [...(gs.milestones || []), ...(gs.achievements || [])];
        let anyUpdate = false;

        targets.forEach(ms => {
            if (ms.done) return;
            if (ms.targetType === 'login_days') {
                ms.curr = totalDays; // 累積天數
                anyUpdate = true;
                if (ms.curr >= ms.target) this._unlockMilestone(ms);
            } else if (ms.targetType === 'login_streak') {
                ms.curr = streakDays; // 連續天數 (斷掉會跟著掉下來)
                anyUpdate = true;
                // 如果目前因為斷掉而掉出目標值，且還沒領取，就要取消它的完成狀態
                if (ms.curr < ms.target && ms.done) ms.done = false;
                if (ms.curr >= ms.target) this._unlockMilestone(ms);
            }
        });
        if (anyUpdate) this._saveAndNotify();
    },

    // View Helper: 統一輸出接口
    getSortedAchievements: function() {
        const gs = window.SQ.State;
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
        if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Ach.UPDATED);
    }
};
window.AchEngine = window.SQ.Engine.Ach;