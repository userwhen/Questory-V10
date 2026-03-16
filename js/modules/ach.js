/* js/modules/ach.js - V40.1 Fixed (Daily Check-In Added) */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Ach = {
    init: function() {
        const gs = window.SQ.State;
        if (!gs) return;
        if (!gs.achievements) gs.achievements = [];
        if (!gs.milestones) gs.milestones = [];

        // 官方「累積登入」成就
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
                isUpgradeable: true
            });
        }

        // ✅ [新增] 官方「每日打卡」成就 - 這是 check_in 類型的來源
        let dailyCheckIn = gs.achievements.find(a => a.id === 'sys_daily_checkin');
        if (!dailyCheckIn) {
            gs.achievements.push({
                id: 'sys_daily_checkin',
                title: '📅 每日打卡',
                desc: '今天記得登入打卡！',
                type: 'check_in',
                curr: 0,
                target: 1,
                done: false,
                claimed: false,
                isSystem: true
            });
        }
		gs.stats = gs.stats || {};
        // 如果是 0 或者沒有紀錄，就當作是第 1 天
        if (typeof gs.stats.loginDays !== 'number' || gs.stats.loginDays === 0) {
            gs.stats.loginDays = 1; 
        }
        if (typeof gs.loginStreak !== 'number' || gs.loginStreak === 0) {
            gs.loginStreak = 1; 
        }

        // 強制把現在的天數推給進度條
        if (typeof this.onLoginUpdated === 'function') {
            this.onLoginUpdated(gs.stats.loginDays, gs.loginStreak);
        }

        // ✅ [新增] 監聽換日事件... (原本的程式碼)
        if (window.SQ.EventBus && window.SQ.Events && window.SQ.Events.System.DAILY_RESET) {
            window.SQ.EventBus.on(window.SQ.Events.System.DAILY_RESET, () => {
                const checkIn = (window.SQ.State.achievements || [])
                    .find(a => a.id === 'sys_daily_checkin');
                if (checkIn) {
                    checkIn.done = false;
                    checkIn.claimed = false;
                }
                
                // 系統底層天數照算，但不再這裡自動推動進度條
                const gs = window.SQ.State;
                gs.stats = gs.stats || {};
                gs.stats.loginDays = (gs.stats.loginDays || 0) + 1; 

                // 通知畫面更新按鈕狀態
                if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Ach.UPDATED);
            });
        }
    },

    // 2. 監聽任務完成 (自動化積累)
    onTaskCompleted: function(task, impact) {
        const val = (typeof impact === 'number') ? impact : 1;
        const gs = window.SQ.State;
        const targets = [...(gs.milestones || []), ...(gs.achievements || [])];
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
                ms.curr = (ms.curr || 0) + val;
                anyUpdate = true;
                if (ms.curr >= ms.target) this._unlockMilestone(ms);
            }
        });

        if (anyUpdate) this._saveAndNotify();
    },

    // [新增] 處理任務取消完成 (倒扣進度)
    onTaskUndone: function(task, impact) {
        const val = (typeof impact === 'number') ? impact : 1;
        const gs = window.SQ.State;
        const targets = [...(gs.milestones || []), ...(gs.achievements || [])];
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
                ms.curr = (ms.curr || 0) - val;
                if (ms.curr < 0) ms.curr = 0;
                if (ms.done && ms.curr < ms.target) ms.done = false;
                anyUpdate = true;
            }
        });

        if (anyUpdate) this._saveAndNotify();
    },

    // [新增] 監聽計時器完成 (專注/番茄鐘成就)
    onTimerCompleted: function(mode, minutes) {
        const gs = window.SQ.State;
        const targets = [...(gs.milestones || []), ...(gs.achievements || [])];
        let anyUpdate = false;

        targets.forEach(ms => {
            if (ms.done) return;
            let isMatch = false;
            let valToAdd = 0;
            if (ms.targetType === 'focus_time') { isMatch = true; valToAdd = minutes; }
            else if (ms.targetType === 'pomodoro' && mode === 'pomodoro') { isMatch = true; valToAdd = 1; }
            if (isMatch && valToAdd > 0) {
                ms.curr = (ms.curr || 0) + valToAdd;
                anyUpdate = true;
                if (ms.curr >= ms.target) this._unlockMilestone(ms);
            }
        });

        if (anyUpdate) this._saveAndNotify();
    },

    // 內部：達成瞬間
    _unlockMilestone: function(ms) {
        ms.curr = ms.target;
        ms.done = true;
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `🎉 目標達成：${ms.title}`);
        }
    },

    // 3. 領取獎勵並歸檔
    claimReward: function(id) {
        const gs = window.SQ.State;
        let ms = gs.milestones.find(m => m.id === id) || gs.achievements.find(m => m.id === id);

        if (!ms) return { success: false, msg: "找不到目標" };
        if (!ms.done) return { success: false, msg: "目標尚未達成" };
        if (ms.claimed) return { success: false, msg: "已經領取過了" };

        const reward = ms.reward || { gold: 0, exp: 0 };
        gs.gold = (gs.gold || 0) + reward.gold;
        if (window.SQ.Engine.Stats && window.SQ.Engine.Stats.addPlayerExp) {
            window.SQ.Engine.Stats.addPlayerExp(reward.exp);
        } else {
            gs.exp = (gs.exp || 0) + reward.exp;
        }

        if (ms.isUpgradeable && ms.tier !== 'S') {
            const nextTierMap = { 'C': 'B', 'B': 'A', 'A': 'S' };
            const nextTier = nextTierMap[ms.tier];
            const newConfig = this._getTierConfig(nextTier, ms.targetType);
            ms.tier = nextTier;
            ms.target = newConfig.target;
            ms.reward = newConfig.reward;
            const unit = this._getUnitString(ms.targetType);
            ms.desc = `累積完成 ${newConfig.target} ${unit}`;
            ms.done = (ms.curr >= ms.target);
        } else {
            ms.claimed = true;
            ms.finishDate = Date.now();
        }

        this._saveAndNotify();
        return { success: true, reward: reward };
    },

    // 4. 數值矩陣
    _getTierConfig: function(tier, targetType) {
        const targets = {
            'tag':          { 'S': 1000, 'A': 500,  'B': 200,  'C': 50 },
            'attr':         { 'S': 1000, 'A': 500,  'B': 200,  'C': 50 },
            'focus_time':   { 'S': 6000, 'A': 3000, 'B': 1200, 'C': 300 },
            'pomodoro':     { 'S': 250,  'A': 100,  'B': 40,   'C': 10 },
            'login_days':   { 'S': 365,  'A': 100,  'B': 30,   'C': 7 },
            'login_streak': { 'S': 50,   'A': 21,   'B': 7,    'C': 3 }
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
        gs.milestones.push({
            id: 'ms_' + Date.now(),
            title: data.title,
            desc: `累積完成 ${config.target} ${unit}`,
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
            isUpgradeable: data.isUpgradeable || false
        });
        this._saveAndNotify();
    },

    updateMilestone: function(data) {
        const gs = window.SQ.State;
        if (!gs.milestones) return;
        const ms = gs.milestones.find(m => m.id === data.id);
        if (ms) {
            ms.title = data.title;
            ms.isUpgradeable = data.isUpgradeable || false;
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
        if (gs.milestones) {
            gs.milestones = gs.milestones.filter(m => m.id !== id);
            this._saveAndNotify();
        }
    },

        getSortedAchievements: function() {
        const gs = window.SQ.State;
        const list = [
            ...(gs.milestones || []),
            ...(gs.achievements || [])
        ];
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