/* js/modules/task.js - V42.1 Fixed (Daily Reset Interface) */
window.TaskEngine = {
    // 1. 初始化
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return; // 現在 main.js 順序對了，這裡就不會被擋下

        if (!gs.tasks) gs.tasks = [];
        if (!gs.history) gs.history = [];
        if (!gs.taskCats) gs.taskCats = ['每日', '運動', '工作', '待辦', '願望'];
        if (!gs.cal) gs.cal = { today: 0, logs: [] };
        
        // 注意：這裡不再執行重置檢查，改由 Core 統一呼叫 resetDaily
    },

    // [新增] 2. 每日重置接口 (供 Core.js 呼叫)
    resetDaily: function() {
        const gs = window.GlobalState;
        if (!gs || !gs.tasks) return;

        console.log("📅 [TaskEngine] 執行每日重置...");
        
        // 重置每日任務狀態
        gs.tasks.forEach(t => {
            if (t.cat === '每日' || t.recurrence === 'daily') {
                t.done = false;
                t.doneTime = null;
                if (t.type === 'count') t.curr = 0;
                if (t.subs) t.subs.forEach(s => s.done = false);
            }
        });

        // 重置今日熱量
        if (gs.cal) {
            gs.cal.today = 0;
            gs.cal.logs = []; 
        }
        
        // 儲存變更
        this._saveAndNotify(window.EVENTS.Task.UPDATED);
    },

    // =========================================
    // 2. 讀取與排序
    // =========================================
    getSortedTasks: function(categoryFilter) {
        const tasks = window.GlobalState.tasks || [];
        const now = new Date();
        const todayStr = now.toDateString();

        let filtered = tasks.filter(t => {
            if (categoryFilter && categoryFilter !== '全部' && t.cat !== categoryFilter) return false;
            
            // 顯示規則：
            // 1. 未完成的顯示
            // 2. 每日任務 (不管完成沒) 都顯示
            // 3. 今天剛完成的非每日任務 -> 顯示 (讓你有機會看到並反悔)
            // 4. 以前完成的非每日任務 -> 隱藏 (去歷史紀錄看)
            
            if (!t.done) return true;
            if (t.cat === '每日' || t.recurrence === 'daily') return true;
            if (t.doneTime && new Date(t.doneTime).toDateString() === todayStr) return true;
            
            return false;
        });
        
        return filtered.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.done !== b.done) return a.done ? 1 : -1;
            
            const impA = (parseInt(a.importance||1) * 1.5) + (parseInt(a.urgency||1) * 0.5);
            const impB = (parseInt(b.importance||1) * 1.5) + (parseInt(b.urgency||1) * 0.5);
            return impB - impA;
        });
    },

    // =========================================
    // 3. 核心 CRUD
    // =========================================
    addTask: function(temp) {
        const gs = window.GlobalState;
        const newTask = { 
            id: 't_' + Date.now(), 
            createDate: Date.now(), 
            done: false, 
            status: 'active' 
        };
        Object.assign(newTask, {
            title: temp.title,
            desc: temp.desc,
            cat: temp.cat,
            type: temp.type || 'normal',
            target: parseInt(temp.target) || 1,
            curr: 0,
            calories: (parseInt(temp.calories) || 0),
            importance: parseInt(temp.importance) || 1,
            urgency: parseInt(temp.urgency) || 1,
            attrs: [...(temp.attrs || [])],
            subs: temp.subs ? JSON.parse(JSON.stringify(temp.subs)) : [],
            pinned: temp.pinned || false,
            deadline: temp.deadline,
            recurrence: temp.recurrence,
            subRule: temp.subRule || 'all'
        });

        gs.tasks.unshift(newTask);
        this._saveAndNotify(window.EVENTS.Task.CREATED, newTask);
    },

    updateTask: function(temp) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === temp.id);
        if (task) {
            task.title = temp.title;
            task.desc = temp.desc;
            task.cat = temp.cat;
            task.type = temp.type;
            task.target = parseInt(temp.target) || 1;
            task.calories = parseInt(temp.calories) || 0;
            task.importance = parseInt(temp.importance) || 1;
            task.urgency = parseInt(temp.urgency) || 1;
            task.attrs = [...(temp.attrs || [])];
            task.subs = temp.subs ? JSON.parse(JSON.stringify(temp.subs)) : [];
            task.pinned = temp.pinned;
            task.deadline = temp.deadline;
            task.recurrence = temp.recurrence;
            task.subRule = temp.subRule;

            this._saveAndNotify(window.EVENTS.Task.UPDATED, task);
        }
    },

    deleteTask: function(id) {
        const gs = window.GlobalState;
        gs.tasks = gs.tasks.filter(t => t.id !== id);
        this._saveAndNotify(window.EVENTS.Task.DELETED, { id });
    },

    // =========================================
    // 4. 業務邏輯 (完成/取消)
    // =========================================
    resolveTask: function(taskId) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if (!task) return;

        // A. 擋修檢查
        if (!task.done && task.subs && task.subs.length > 0 && task.type !== 'count') {
            const doneCount = task.subs.filter(s => s.done).length;
            const rule = task.subRule || 'all';
            if (rule === 'all' && doneCount < task.subs.length) { 
                return window.EventBus.emit(window.EVENTS.System.TOAST, "🔒 請先完成所有步驟"); 
            }
            if (rule === 'any' && doneCount === 0) { 
                return window.EventBus.emit(window.EVENTS.System.TOAST, "🔒 請至少完成一個步驟"); 
            }
        }

        task.done = !task.done;
        
        // Impact 計算
        const imp = parseInt(task.importance||1);
        const urg = parseInt(task.urgency||1);
        const base = 10;
        const w = (imp * 1.5) + (urg * 0.5);
        const rewards = { gold: Math.floor(base * w), exp: Math.floor(base * w) };
        const impact = Math.floor(w);
		
        // 檢查是否為嚴格模式 (安全讀取設定)
        const isStrict = gs.unlocks && gs.unlocks.feature_strict && gs.settings && gs.settings.strictMode;

        if (task.done) {
            // ==========================================
            // --- 完成任務 ---
            // ==========================================
            task.doneTime = Date.now();
            task.status = 'completed';
            task.lastReward = rewards;

            gs.gold = (gs.gold || 0) + rewards.gold;
            
            // [關鍵修復] 直接呼叫 StatsEngine 增加經驗值並確保觸發升級
            if (window.StatsEngine && StatsEngine.addPlayerExp) {
                StatsEngine.addPlayerExp(rewards.exp);
            } else {
                gs.exp = (gs.exp || 0) + rewards.exp; // 備用方案
            }

            // 熱量扣除
			const isCalActive = (gs.unlocks && gs.unlocks.feature_cal) || (gs.settings && gs.settings.calMode);
            if (isCalActive && task.calories > 0) {
                gs.cal.today -= task.calories; 
                const timeStr = new Date().toTimeString().substring(0, 5);
                gs.cal.logs.unshift(`${timeStr} ${task.title} -${task.calories}`);
                if (gs.cal.logs.length > 30) gs.cal.logs.pop();
            }

            // 寫入歷史
            const historyEntry = JSON.parse(JSON.stringify(task));
            historyEntry.doneImpact = impact; 
            gs.history.push(historyEntry);

            window.EventBus.emit(window.EVENTS.Task.COMPLETED, { task: task, impact: impact, gained: rewards });
            window.EventBus.emit(window.EVENTS.System.TOAST, `完成！+${rewards.gold}💰 +${rewards.exp}✨`);

        } else {
            // ==========================================
            // --- 取消任務 (回收獎勵) ---
            // ==========================================
            const oldDoneTime = task.doneTime;
            task.doneTime = null;
            task.status = 'active';

            if (task.lastReward) {
                const r = task.lastReward;

                // 金幣回收
                if (isStrict) {
                    gs.gold -= r.gold; 
                } else {
                    gs.gold = Math.max(0, gs.gold - r.gold); 
                }

                // 經驗回收
                if(window.StatsEngine && StatsEngine.reducePlayerExp) {
                    StatsEngine.reducePlayerExp(r.exp, isStrict);
                } else {
                    gs.exp = Math.max(0, gs.exp - r.exp);
                }

                // 熱量回滾 (修復：取消任務應該是加回熱量 +=)
                const isCalActive = (gs.unlocks && gs.unlocks.feature_cal) || (gs.settings && gs.settings.calMode);
                if (isCalActive && task.calories > 0) {
                    gs.cal.today += task.calories; 
                    const targetLog = `-${task.calories}`;
                    const idx = gs.cal.logs.findIndex(l => l.includes(task.title) && l.includes(targetLog));
                    if (idx !== -1) gs.cal.logs.splice(idx, 1);
                }

                // 從歷史紀錄移除
                if (gs.history && gs.history.length > 0) {
                    const hIdx = gs.history.findIndex(h => h.id === task.id && h.doneTime === oldDoneTime);
                    if (hIdx !== -1) gs.history.splice(hIdx, 1);
                }

                window.EventBus.emit(window.EVENTS.System.TOAST, isStrict ? "已撤銷 (⚠️ 獎勵全數回收)" : "已撤銷");
                task.lastReward = null;
            }
            
            // [關鍵修復] 正確發送 UNCOMPLETED 事件，不再發錯成 COMPLETED
            window.EventBus.emit(window.EVENTS.Task.UNCOMPLETED, { task: task, impact: impact });
        }

        // 統一存檔與 UI 更新
        if (window.App && window.App.saveData) App.saveData(); 
        
        if (window.EventBus) {
            window.EventBus.emit(window.EVENTS.Stats.UPDATED);
            window.EventBus.emit(window.EVENTS.Task.UPDATED);
        }
    },

    incrementTask: function(id) {
        const gs = window.GlobalState;
        const t = gs.tasks.find(x => x.id === id);
        if (!t || t.done || t.type !== 'count') return;
        t.curr = (t.curr || 0) + 1;
        if (t.curr >= t.target) {
            t.curr = t.target;
            this.resolveTask(id);
        } else {
            this._saveAndNotify(window.EVENTS.Task.UPDATED, t);
        }
    },

    toggleSubtask: function(taskId, subIdx) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if (task && task.subs && task.subs[subIdx]) {
            task.subs[subIdx].done = !task.subs[subIdx].done;
            this._saveAndNotify(window.EVENTS.Task.UPDATED, task);
        }
    },

    // =========================================
    // 5. 數據聚合 (History Summary)
    // =========================================
    getHistorySummary: function() {
        const gs = window.GlobalState;
        const history = gs.history || [];
        const dailyMap = {};

        history.forEach(task => {
            const d = new Date(task.doneTime);
            if(isNaN(d.getTime())) return;
            const dateStr = d.toISOString().split('T')[0];

            if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = {
                    date: dateStr,
                    totalImpact: 0,
                    totalExp: 0,
                    tasks: [],
                    attrCounts: {}
                };
            }

            const day = dailyMap[dateStr];
            day.tasks.push(task);
            
            if (task.status === 'completed') {
                day.totalImpact += (task.doneImpact || 0);
                day.totalExp += (task.lastReward ? task.lastReward.exp : 0);
            }

            if (task.attrs && task.attrs.length) {
                task.attrs.forEach(attr => {
                    day.attrCounts[attr] = (day.attrCounts[attr] || 0) + 1;
                });
            }
        });

        const resultList = Object.values(dailyMap).map(day => {
            const completedTasks = day.tasks.filter(t => t.status === 'completed');
            completedTasks.sort((a, b) => (b.doneImpact || 0) - (a.doneImpact || 0));
            const mvpTask = completedTasks.length > 0 ? completedTasks[0] : null;

            let maxAttr = 'NONE';
            let maxCount = -1;
            for (const [attr, count] of Object.entries(day.attrCounts)) {
                if (count > maxCount) { maxCount = count; maxAttr = attr; }
            }
            if (maxAttr === 'NONE') maxAttr = 'STR';

            let rank = 'C';
            if (day.totalImpact > 50) rank = 'S';
            else if (day.totalImpact > 30) rank = 'A';
            else if (day.totalImpact > 15) rank = 'B';

            return {
                date: day.date,
                rank: rank,
                totalImpact: day.totalImpact,
                totalExp: day.totalExp,
                mainAttr: maxAttr,
                tasks: day.tasks,
                mvpTask: mvpTask
            };
        });

        return resultList.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    previewRewards: function(imp, urg) {
        const i = parseInt(imp || 1);
        const u = parseInt(urg || 1);
        const base = 10;
        const w = (i * 1.5) + (u * 0.5);
        return { 
            gold: Math.floor(base * w), 
            exp: Math.floor(base * w) 
        };
    },

    _saveAndNotify: function(event, data) {
        if (window.App && window.App.saveData) App.saveData();
        if (window.EventBus) window.EventBus.emit(event, data);
    }
};