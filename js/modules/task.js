/* js/modules/task.js - V33.6 (Hybrid Ultimate Engine) */
window.TaskEngine = {
    // 1. 初始化
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        
        // 補齊資料結構
        if (!gs.taskCats) gs.taskCats = ['每日', '運動', '工作', '待辦', '願望'];
        if (!gs.settings) gs.settings = { calMode: false, strict: false };
        if (!gs.cal) gs.cal = { today: 0, logs: [] };
        
        // 檢查換日
        const today = new Date().toDateString();
        if (gs.lastLoginDate !== today) {
            this.archiveTasks();
            if(gs.tasks) {
                gs.tasks.forEach(t => {
                    // 每日任務或設定為每日重複的任務重置
                    if (t.cat === '每日' || t.recurrence === 'daily') {
                        t.done = false; 
                        t.doneTime = null; 
                        if (t.type === 'count') t.curr = 0;
                        if (t.subs) t.subs.forEach(s => s.done = false);
                    }
                });
            }
            // 重置熱量
            gs.cal.today = 0;
            gs.lastLoginDate = today;
            if(window.App) App.saveData();
        }
    },

    archiveTasks: function() {
        const gs = window.GlobalState;
        if (!gs.tasks) return;
        const now = Date.now();
        const keep = [];
        gs.tasks.forEach(t => {
            const isDone = t.done && t.cat !== '每日' && !t.recurrence;
            const isExpired = !t.done && t.deadline && new Date(t.deadline).getTime() < now;
            if (isDone || isExpired) gs.history.unshift(t);
            else keep.push(t);
        });
        if (gs.history.length > 50) gs.history = gs.history.slice(0, 50);
        gs.tasks = keep;
    },

    getSortedTasks: function(isHistory, cat) {
        const tasks = isHistory ? (window.GlobalState.history || []) : (window.GlobalState.tasks || []);
        if (isHistory) return tasks;

        const now = new Date();
        const todayStr = now.toDateString();
        // 判斷是否為「今天完成」
        const isDoneToday = (t) => t.done && t.doneTime && new Date(t.doneTime).toDateString() === todayStr;

        let filtered = tasks.filter(t => {
            if (cat && cat !== '全部' && t.cat !== cat) return false;
            // 顯示邏輯：未完成 OR 每日任務 OR 今天剛完成的
            if (!t.done) return true;
            if (t.cat === '每日') return true;
            if (isDoneToday(t)) return true;
            return false;
        });
        
        return filtered.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.done !== b.done) return a.done ? 1 : -1;
            const wA = (parseInt(a.importance||1) * 1.5) + (parseInt(a.urgency||1) * 0.5);
            const wB = (parseInt(b.importance||1) * 1.5) + (parseInt(b.urgency||1) * 0.5);
            return wB - wA;
        });
    },

    calculateRewards: function(imp, urg) {
        const base = 10;
        const mult = (parseInt(imp||1) * 1.5) + (parseInt(urg||1) * 0.5);
        return { gold: Math.floor(base * mult), exp: Math.floor(base * mult) };
    },

    // 2. 核心操作 (Actions)

    submitTask: function() {
        const temp = window.TempState.editingTask;
        if (!temp || !temp.title) {
            EventBus.emit(EVENTS.System.TOAST, "標題必填 ⚠️");
            return;
        }

        const gs = window.GlobalState;
        const isNew = !temp.id;
        let task = isNew ? null : gs.tasks.find(t => t.id === temp.id);

        if (!task) {
            task = { id: 't_' + Date.now(), createDate: Date.now(), done: false };
            gs.tasks.push(task);
        }

        // 完整欄位映射 (包含 V25 的 burn, subRule)
        Object.assign(task, {
            title: temp.title,
            desc: temp.desc,
            cat: temp.cat,
            type: temp.type,
            target: parseInt(temp.target) || 1,
            curr: temp.curr || 0,
            burn: (temp.cat === '運動') ? (parseInt(temp.calories) || 0) : 0, // 熱量欄位
            importance: parseInt(temp.importance) || 1,
            urgency: parseInt(temp.urgency) || 1,
            attrs: [...(temp.attrs || [])], // 技能綁定
            subs: JSON.parse(JSON.stringify(temp.subs || [])),
            pinned: temp.pinned || false,
            deadline: temp.deadline,
            recurrence: temp.recurrence,
            subRule: temp.subRule || 'all'
        });

        if(window.App) App.saveData();
        EventBus.emit(isNew ? EVENTS.Task.CREATED : EVENTS.Task.UPDATED, { task });
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay');
        EventBus.emit(EVENTS.System.TOAST, isNew ? "任務已新增 ✨" : "任務已保存 ✅");
    },

    // 複雜的完成邏輯 (包含嚴格模式與熱量)
    resolveTask: function(taskId) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if (!task) return;

        // 子任務檢查規則
        if (!task.done && task.subs && task.subs.length > 0 && task.type !== 'count') {
            const doneCount = task.subs.filter(s => s.done).length;
            const rule = task.subRule || 'all';
            if (rule === 'all' && doneCount < task.subs.length) { 
                EventBus.emit(EVENTS.System.TOAST, "🔒 請先完成所有步驟"); return; 
            }
            if (rule === 'any' && doneCount === 0) { 
                EventBus.emit(EVENTS.System.TOAST, "🔒 請至少完成一個步驟"); return; 
            }
        }

        task.done = !task.done;

        if (task.done) {
            // [A] 完成任務
            task.doneTime = Date.now();
            const r = this.calculateRewards(task.importance, task.urgency);
            task.lastReward = r; // 記錄獎勵以便回滾

            gs.gold += r.gold;
            gs.exp += r.exp;

            // 分配屬性經驗 (如果有綁定技能)
            if (task.attrs && task.attrs.length > 0 && window.StatsEngine) {
                StatsEngine.distributeExp(r.exp, task.attrs);
                task.attrs.forEach(name => StatsEngine.addSkillProficiency(name));
            }

            // 熱量扣除
            if (gs.settings.calMode && task.burn > 0) {
                gs.cal.today -= task.burn;
                gs.cal.logs.unshift(`${new Date().toTimeString().substring(0,5)} 運動: ${task.title} -${task.burn}`);
                if (gs.cal.logs.length > 50) gs.cal.logs.pop();
            }

            if(window.StatsEngine) StatsEngine.checkLevelUp();
            EventBus.emit(EVENTS.System.TOAST, `完成！+${r.gold}💰 +${r.exp}✨`);

        } else {
            // [B] 取消任務 (回滾邏輯)
            task.doneTime = null;
            if (task.lastReward) {
                const r = task.lastReward;
                const isStrict = gs.settings.strict;

                // 嚴格模式：直接扣，不管是否負債
                if (isStrict) { 
                    gs.gold -= r.gold; 
                } else { 
                    gs.gold = Math.max(0, gs.gold - r.gold); 
                }
                
                // 經驗值回滾
                gs.exp = Math.max(0, gs.exp - r.exp);

                // 熱量回滾
                if (gs.settings.calMode && task.burn > 0) {
                    gs.cal.today += task.burn;
                    // 嘗試移除 log
                    const targetStr = `-${task.burn}`;
                    const idx = gs.cal.logs.findIndex(l => l.includes(task.title) && l.includes(targetStr));
                    if(idx !== -1) gs.cal.logs.splice(idx, 1);
                }

                const msg = isStrict ? " (已扣除/負債)" : " (已回收)";
                EventBus.emit(EVENTS.System.TOAST, `已取消${msg}`);
                task.lastReward = null;
            } else {
                EventBus.emit(EVENTS.System.TOAST, "已取消");
            }
        }

        if(window.App) App.saveData();
        EventBus.emit(EVENTS.Task.COMPLETED, { task });
        EventBus.emit(EVENTS.Stats.UPDATED); // 更新 HUD
    },

    deleteTask: function(id) {
        const gs = window.GlobalState;
        gs.tasks = gs.tasks.filter(t => t.id !== id);
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.Task.DELETED, { id });
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay');
        EventBus.emit(EVENTS.System.TOAST, "任務已刪除 🗑️");
    },

    // 計次任務增加
    incrementTask: function(id) {
        const gs = window.GlobalState;
        const t = gs.tasks.find(x => x.id === id);
        if (!t || t.done || t.type !== 'count') return;

        t.curr = (t.curr || 0) + 1;
        
        // 達標自動完成
        if (t.curr >= t.target) {
            t.curr = t.target;
            this.resolveTask(id);
        } else {
            if(window.App) App.saveData();
            EventBus.emit(EVENTS.Task.UPDATED);
        }
    },

    // 複製任務
    copyTask: function(id) {
        const gs = window.GlobalState;
        const temp = gs.tasks.find(t => t.id === id) || window.TempState.editingTask;
        if (!temp) return;

        const newTask = JSON.parse(JSON.stringify(temp));
        newTask.id = 't_' + Date.now();
        newTask.title = temp.title + " (副本)";
        newTask.done = false;
        newTask.doneTime = null;
        newTask.curr = 0;
        if (newTask.subs) newTask.subs.forEach(s => s.done = false);
        
        gs.tasks.unshift(newTask);
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.Task.CREATED);
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay');
        EventBus.emit(EVENTS.System.TOAST, "任務已複製");
    },

    // 子任務切換 (直接操作)
    toggleSubtask: function(taskId, subIdx) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if (!task || !task.subs[subIdx]) return;

        task.subs[subIdx].done = !task.subs[subIdx].done;
        
        if(window.App) App.saveData();
        // 這裡發送 UPDATED 即可，不需要 COMPLETED
        EventBus.emit(EVENTS.Task.UPDATED);
    }
};