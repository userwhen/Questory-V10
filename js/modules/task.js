/* js/modules/task.js - V37.0 Ultimate (V25 Logic + V36 Architecture) */
window.TaskEngine = {
    // =========================================
    // 1. 初始化與讀取 (Initialization)
    // =========================================
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        // V25: 補齊基礎資料結構
        if (!gs.taskCats) gs.taskCats = ['每日', '運動', '工作', '待辦', '願望'];
        if (!gs.settings) gs.settings = { calMode: false, strict: false };
        if (!gs.cal) gs.cal = { today: 0, logs: [] }; // V25 熱量系統

        const today = new Date().toDateString();
        
        // V25: 每日任務重置邏輯
        if (gs.lastLoginDate !== today) {
            console.log("📅 新的一天！每日任務與熱量已重置");
            if (gs.tasks) {
                gs.tasks.forEach(t => {
                    if (t.cat === '每日' || t.recurrence === 'daily') {
                        t.done = false;
                        t.doneTime = null;
                        if (t.type === 'count') t.curr = 0;
                        if (t.subs) t.subs.forEach(s => s.done = false);
                    }
                });
            }
            // 重置熱量
            if (gs.cal) { gs.cal.today = 0; gs.cal.logs = []; } // 這裡可以選擇是否清空 logs
            
            gs.lastLoginDate = today;
            if (window.App) App.saveData();
        }
    },

    getSortedTasks: function(isHistory, cat) {
        // V25: 排序與過濾邏輯
        const tasks = isHistory ? (window.GlobalState.history || []) : (window.GlobalState.tasks || []);
        if (isHistory) return tasks; // 歷史紀錄直接回傳

        const now = new Date();
        const todayStr = now.toDateString();
        const isDoneToday = (t) => t.done && t.doneTime && new Date(t.doneTime).toDateString() === todayStr;

        let filtered = tasks.filter(t => {
            if (cat && cat !== '全部' && t.cat !== cat) return false;
            // 顯示：未完成 OR 每日任務 OR 今天剛完成的
            if (!t.done) return true;
            if (t.cat === '每日') return true;
            if (isDoneToday(t)) return true;
            return false;
        });
        
        return filtered.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.done !== b.done) return a.done ? 1 : -1;
            // V25: 權重公式 (重要性 1.5 + 緊急性 0.5)
            const wA = (parseInt(a.importance||1) * 1.5) + (parseInt(a.urgency||1) * 0.5);
            const wB = (parseInt(b.importance||1) * 1.5) + (parseInt(b.urgency||1) * 0.5);
            return wB - wA;
        });
    },

    // =========================================
    // 2. 核心操作 (CRUD Actions) - 供 Controller 呼叫
    // =========================================

    // [V36 要求] 新增任務
    addTask: function(temp) {
        const gs = window.GlobalState;
        
        // V25: 建立任務結構
        const newTask = { 
            id: 't_' + Date.now(), 
            createDate: Date.now(), 
            done: false 
        };

        // V25: 欄位賦值 (包含熱量與屬性)
        Object.assign(newTask, {
            title: temp.title,
            desc: temp.desc,
            cat: temp.cat,
            type: temp.type,
            target: parseInt(temp.target) || 1,
            curr: temp.curr || 0,
            // V25 特有邏輯：只有運動分類才記錄熱量
            burn: (temp.cat === '運動') ? (parseInt(temp.calories) || 0) : 0,
            importance: parseInt(temp.importance) || 1,
            urgency: parseInt(temp.urgency) || 1,
            attrs: [...(temp.attrs || [])], // 技能屬性
            subs: temp.subs ? JSON.parse(JSON.stringify(temp.subs)) : [],
            pinned: temp.pinned || false,
            deadline: temp.deadline,
            recurrence: temp.recurrence,
            subRule: temp.subRule || 'all'
        });

        gs.tasks.push(newTask);
        this._saveAndNotify(EVENTS.Task.CREATED, newTask);
    },

    // [V36 要求] 更新任務
    updateTask: function(temp) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === temp.id);

        if (task) {
            // V25: 欄位更新
            Object.assign(task, {
                title: temp.title,
                desc: temp.desc,
                cat: temp.cat,
                type: temp.type,
                target: parseInt(temp.target) || 1,
                // curr 不覆蓋，以免重置計數
                burn: (temp.cat === '運動') ? (parseInt(temp.calories) || 0) : 0,
                importance: parseInt(temp.importance) || 1,
                urgency: parseInt(temp.urgency) || 1,
                attrs: [...(temp.attrs || [])],
                subs: temp.subs ? JSON.parse(JSON.stringify(temp.subs)) : [],
                pinned: temp.pinned || false,
                deadline: temp.deadline,
                recurrence: temp.recurrence,
                subRule: temp.subRule || 'all'
            });

            this._saveAndNotify(EVENTS.Task.UPDATED, task);
        }
    },

    // [V36 要求] 完成/取消任務 (包含 V25 的複雜運算)
    resolveTask: function(taskId) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        if (!task) return;

        // V25: 子任務擋修檢查
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
            // [A] 任務完成：發獎勵
            task.doneTime = Date.now();
            const r = this.previewRewards(task.importance, task.urgency);
            task.lastReward = r; // 記錄獎勵以便回滾

            gs.gold = (gs.gold || 0) + r.gold;
            gs.exp = (gs.exp || 0) + r.exp;

            // V25: 屬性經驗分配
            if (task.attrs && task.attrs.length > 0 && window.StatsEngine) {
                StatsEngine.distributeExp(r.exp, task.attrs);
                task.attrs.forEach(name => StatsEngine.addSkillProficiency(name));
            }

            // V25: 熱量扣除與紀錄
            if (gs.settings.calMode && task.burn > 0) {
                gs.cal.today -= task.burn;
                const timeStr = new Date().toTimeString().substring(0, 5);
                gs.cal.logs.unshift(`${timeStr} 運動: ${task.title} -${task.burn}`);
                if (gs.cal.logs.length > 50) gs.cal.logs.pop();
            }

            if (window.StatsEngine) StatsEngine.checkLevelUp();
            EventBus.emit(EVENTS.System.TOAST, `完成！+${r.gold}💰 +${r.exp}✨`);

        } else {
            // [B] 任務取消：回滾/懲罰
            task.doneTime = null;
            if (task.lastReward) {
                const r = task.lastReward;
                const isStrict = gs.settings.strict;

                // V25: 嚴格模式邏輯
                if (isStrict) { 
                    gs.gold -= r.gold; 
                } else { 
                    gs.gold = Math.max(0, gs.gold - r.gold); 
                }
                
                // 經驗值回滾
                gs.exp -= r.exp;
                if (!isStrict) gs.exp = Math.max(0, gs.exp); // 非嚴格模式不扣到負
                
                // 屬性經驗回滾
                if (task.attrs && window.StatsEngine && StatsEngine.deductExp) {
                    StatsEngine.deductExp(r.exp, task.attrs);
                }

                // V25: 熱量 Log 回滾 (精確刪除)
                if (gs.settings.calMode && task.burn > 0) {
                    gs.cal.today += task.burn;
                    const targetStr = `-${task.burn}`;
                    const idx = gs.cal.logs.findIndex(l => l.includes(task.title) && l.includes(targetStr));
                    if (idx !== -1) gs.cal.logs.splice(idx, 1);
                }

                const msg = isStrict ? " (已扣除/負債)" : " (已回收)";
                EventBus.emit(EVENTS.System.TOAST, `已取消${msg}`);
                task.lastReward = null;
            } else {
                EventBus.emit(EVENTS.System.TOAST, "已取消");
            }
        }

        // 通知更新：HUD (金幣經驗) 與 任務列表
        this._saveAndNotify(EVENTS.Task.COMPLETED, task);
        EventBus.emit(EVENTS.Stats.UPDATED);
    },

    // [V36 要求] 計次增加
    incrementTask: function(id) {
        const gs = window.GlobalState;
        const t = gs.tasks.find(x => x.id === id);
        if (!t || t.done || t.type !== 'count') return;

        t.curr = (t.curr || 0) + 1;
        if (t.curr >= t.target) {
            t.curr = t.target;
            this.resolveTask(id);
        } else {
            this._saveAndNotify(EVENTS.Task.UPDATED, t);
        }
    },

    // [V36 要求] 複製任務
    copyTask: function(id) {
        const gs = window.GlobalState;
        // 嘗試從列表中找，找不到則找編輯暫存
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
        this._saveAndNotify(EVENTS.Task.CREATED, newTask);
        EventBus.emit(EVENTS.System.TOAST, "任務已複製");
    },

    // [V36 要求] 切換子任務 (列表模式用)
    toggleSubtask: function(taskId, subIdx) {
        const gs = window.GlobalState;
        const task = gs.tasks.find(t => t.id === taskId);
        
        // V25: 確保資料存在
        if (!task || !task.subs || !task.subs[subIdx]) return;

        task.subs[subIdx].done = !task.subs[subIdx].done;
        
        // 只需要發送更新事件，不用重繪整個 CreateForm (那是 Controller 的工作)
        this._saveAndNotify(EVENTS.Task.UPDATED, task);
    },

    // =========================================
    // 3. 輔助運算 (Helpers)
    // =========================================
    
    // V25: 獎勵計算公式
    previewRewards: function(imp, urg) {
        const base = 10;
        // 使用 V25 的 1.5 / 0.5 權重
        const w = (parseInt(imp||1) * 1.5) + (parseInt(urg||1) * 0.5);
        return { gold: Math.floor(base * w), exp: Math.floor(base * w) };
    },

    // 內部工具：存檔並發送事件
    _saveAndNotify: function(event, data) {
        if (window.App) App.saveData();
        if (window.EventBus && window.EVENTS) {
            EventBus.emit(event, { task: data });
        }
    }
};