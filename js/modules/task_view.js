/* js/modules/task_view.js - V33.6 (Hybrid Ultimate View) */
window.taskView = {
    // 1. 主列表渲染 (整合了任務與成就 Tab)
    render: function() {
        window.TempState.currentView = 'tasks';
        const page = document.getElementById('page-task');
        if (!page) return;

        // 復原卷軸位置
        const oldScrollBox = document.getElementById('task-scroll-area');
        if (oldScrollBox) window.TempState.mainListScrollY = oldScrollBox.scrollTop;

        const currentTab = window.TempState.taskTab || 'list';
        const isList = currentTab === 'list';

        // Header: 使用 ui.tabs.sliding
        const headerHtml = ui.container.bar(
            ui.tabs.sliding('📋 任務列表', '🏆 榮譽成就', isList, "act.switchTaskTab('list')", "act.switchTaskTab('ach')"),
            'margin-bottom:10px;'
        );

        let contentHtml = '';

        if (isList) {
            // --- 任務列表 ---
            const currentCat = window.TempState.filterCategory || '全部';
            const allCats = ['全部', ...(window.GlobalState.taskCats || []).filter(c => c !== '全部')];
            const tasks = TaskEngine.getSortedTasks(false, currentCat);

            // 分類過濾器
            const filterHtml = ui.container.bar(
                ui.tabs.scrollX(allCats, currentCat, "act.setTaskFilter") +
                ui.component.btn({ label:'📜 歷史', theme:'normal', size:'sm', style:'margin-left:5px;', action:"act.navigate('history')" })
            , 'display:flex; align-items:center; gap:5px; margin-bottom:10px;');

            const listItems = tasks.length === 0 
                ? `<div style="text-align:center;color:#888;padding:40px;">📭 暫無任務</div>`
                : tasks.map(t => ui.card.task(t)).join('');

            contentHtml = filterHtml + `<div style="padding-bottom:100px;">${listItems}</div>`;

        } else {
            // --- 成就列表 ---
            const currentAchCat = window.TempState.achFilter || '全部';
            const achCats = ['全部', '每日', '里程碑', '官方'];
            const achs = window.GlobalState.achievements || [];
            
            // 成就過濾邏輯
            const displayAchs = achs.filter(a => {
                if(currentAchCat==='每日') return a.type==='check_in';
                if(currentAchCat==='里程碑') return a.type!=='check_in' && !a.isSystem;
                if(currentAchCat==='官方') return a.isSystem;
                return true;
            });

            // 這裡使用 IIFE 封裝 tab 切換 action
            const achTabHtml = ui.tabs.scrollX(achCats, currentAchCat, "act.setAchFilter");
            const achToolbar = ui.container.bar(achTabHtml + ui.component.btn({label:'🏆 殿堂', theme:'normal', size:'sm', style:'margin-left:5px;', action:"act.navigate('milestone')"}), 'display:flex; align-items:center; margin-bottom:10px;');

            const achListItems = displayAchs.length === 0
                ? `<div style="text-align:center;color:#888;padding:40px;">暫無成就</div>`
                : displayAchs.map(a => ui.card.achievement(a)).join('');

            contentHtml = achToolbar + `<div style="padding-bottom:100px;">${achListItems}</div>`;
        }

        // FAB 按鈕
        const fabAction = isList ? "act.editTask(null)" : "view.renderCreateAchForm(null)"; // 注意：需要補 act.createAch
        const fabHtml = ui.component.btn({
            label: isList ? '＋' : '🌟', theme: isList ? 'correct' : 'normal',
            style: `position:absolute; bottom:25px; right:25px; width:60px; height:60px; border-radius:50%; font-size:2rem; box-shadow:0 4px 12px rgba(0,0,0,0.4); z-index:10; ${!isList?'background:gold; border:none;':''}`,
            action: fabAction
        });

        page.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; position:relative;">
                <div style="padding:10px;">${headerHtml}</div>
                <div id="task-scroll-area" style="flex:1; overflow-y:auto; padding:0 10px;">
                    ${contentHtml}
                </div>
                ${fabHtml}
            </div>
        `;

        // 恢復捲動
        setTimeout(() => {
            const scrollBox = document.getElementById('task-scroll-area');
            if (scrollBox && window.TempState.mainListScrollY) scrollBox.scrollTop = window.TempState.mainListScrollY;
        }, 0);
    },
	
	renderHistoryPage: function() {
    const container = document.getElementById('page-history');
    if(!container) return;

    // A. 標題列
    const headerHtml = ui.container.bar(`
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <h2 style="margin:0; font-size:1.2rem; color:#5d4037;">📜 歷史紀錄</h2>
            ${ui.component.btn({label:'↩ 返回', theme:'normal', size:'sm', action:"act.navigate('task')"})}
        </div>
    `, 'padding:15px; background:#f5f5f5; border-bottom:1px solid #e0e0e0;');

    // B. 資料準備 (讀取 GlobalState.history)
    const history = window.GlobalState.history || [];
    const sortedHistory = [...history].reverse(); // 最新的在上面

    // C. 列表內容
    let listHtml = '';
    if (sortedHistory.length === 0) {
        listHtml = `<div style="text-align:center;color:#888;padding:50px;">📜 無歷史紀錄</div>`;
    } else {
        // 使用 ui.card.task (傳入 true 代表唯讀模式)
        listHtml = `<div style="padding: 10px;">` + sortedHistory.map(t => {
            return ui.card.task(t, true); 
        }).join('') + `</div>`;
    }

    // D. 寫入 DOM
    container.innerHTML = ui.layout.scroller(headerHtml, listHtml + '<div style="height:50px;"></div>');
    
    // 隱藏 FAB
    if(window.view && view.hideFab) view.hideFab();
	},

    // 2. 編輯表單 (復刻 V25 高度互動版)
    renderCreateTaskForm: function(taskId) {
        const gs = window.GlobalState;
        // 初始化暫存
        if (!window.TempState.editingTask || (taskId && window.TempState.editingTask.id !== taskId)) {
            const task = taskId ? gs.tasks.find(t => t.id === taskId) : null;
            window.TempState.editingTask = task ? JSON.parse(JSON.stringify(task)) : { 
                id: null, title: '', desc: '', importance: 2, urgency: 2, 
                type: 'normal', attrs: [], cat: '每日', target: 10, subs: [], 
                pinned: false, calories: 0, deadline: '', subRule: 'all' 
            };
        }
        const data = window.TempState.editingTask;
        const isCount = data.type === 'count';

        // --- A. 標題與置頂 ---
        let bodyHtml = `
            <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:15px;">
                <div style="flex:1;">
                    <label style="font-size:0.8rem; color:#888;">任務名稱</label>
                    ${ui.input.text(data.title, "要做什麼呢？", "taskView.updateField('title', this.value)")}
                </div>
                ${ui.component.btn({
                    label: '📌', theme: data.pinned ? 'correct' : 'ghost',
                    style: `width:40px; height:40px; padding:0; ${!data.pinned ? 'opacity:0.3' : ''}`,
                    action: `taskView.updateField('pinned', !${data.pinned})`
                })}
            </div>
            <div style="margin-bottom:15px;">
                ${ui.input.textarea(data.desc, "詳細說明...", "taskView.updateField('desc', this.value)")}
            </div>
        `;

        // --- B. 分類與熱量 (動態顯示) ---
        // 構建分類按鈕條
        const catBtns = (gs.taskCats || ['預設']).map(c => ui.component.pillBtn({
            label: c, theme: data.cat === c ? 'correct' : 'normal',
            action: `taskView.updateCategory('${c}')`
        })).join('');
        
        let caloriesInput = '';
        if (data.cat === '運動') {
            caloriesInput = `
                <div style="display:flex; align-items:center; gap:5px; background:#fff3e0; padding:5px 10px; border-radius:15px; margin-top:10px;">
                    <span>🔥 消耗:</span>
                    ${ui.input.number(data.calories || 0, "taskView.updateField('calories', parseInt(this.value)||0)", 4)}
                    <span style="color:#f57c00;">Kcal</span>
                </div>
            `;
        }

        bodyHtml += ui.container.box(`
            <label style="font-size:0.8rem; color:#888;">分類</label>
            <div style="display:flex; gap:5px; overflow-x:auto; padding-bottom:5px;">
                ${catBtns} ${ui.component.btn({label:'+', size:'sm', theme:'ghost', action:'act.addNewCategory()'})}
            </div>
            ${caloriesInput}
        `, 'margin-bottom:15px;');

        // --- C. 類型與設定 (計次/子任務) ---
        // 子任務規則 Radio
        const ruleHtml = `
            <div style="display:flex; align-items:center; gap:10px; font-size:0.85rem;">
                <span>規則:</span>
                <label><input type="radio" name="sub_rule" ${data.subRule==='all'?'checked':''} onclick="taskView.updateField('subRule', 'all')"> 全部</label>
                <label><input type="radio" name="sub_rule" ${data.subRule==='any'?'checked':''} onclick="taskView.updateField('subRule', 'any')"> 擇一</label>
            </div>
        `;
        
        // 類型切換 UI
        const typeHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; background:#eee; border-radius:20px; padding:2px;">
                    ${ui.component.pillBtn({label:'📝 一般', theme:!isCount?'correct':'ghost', action:"taskView.updateField('type', 'normal')"})}
                    ${ui.component.pillBtn({label:'🔢 計次', theme:isCount?'correct':'ghost', action:"taskView.updateField('type', 'count')"})}
                </div>
                ${!isCount ? ruleHtml : `<div>目標: ${ui.input.number(data.target, "taskView.updateField('target', this.value)", 2)} 次</div>`}
            </div>
        `;

        // 子任務列表
        let subsHtml = '';
        if (!isCount) {
            const list = (data.subs || []).map((s, i) => `
                <div style="display:flex; gap:5px; margin-bottom:5px; align-items:center;">
                    ${ui.input.text(s.text, `步驟 ${i+1}`, `act.updateSubtaskText(${i}, this.value)`)}
                    <button class="u-btn u-btn-ghost" style="color:red; padding:0 5px;" onclick="act.removeSubtask(${i})">✕</button>
                </div>`).join('');
            subsHtml = `
                <div style="border-top:1px dashed #ddd; padding-top:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span>子任務</span>
                        ${ui.component.btn({label:'+ 步驟', size:'sm', theme:'paper', action:'act.addSubtask()'})}
                    </div>
                    ${list || '<div style="text-align:center; color:#ccc; font-size:0.8rem;">尚無步驟</div>'}
                </div>
            `;
        }

        bodyHtml += ui.container.box(typeHtml + subsHtml, 'margin-bottom:15px;');

        // --- D. 技能綁定 ---
        const skillBtns = (gs.skills || []).map(s => {
            const active = data.attrs.includes(s.name);
            const icon = window.GlobalState.attrs?.[s.parent?.toUpperCase()]?.icon || '❓';
            // 手動樣式
            const style = active 
                ? 'border:1px solid var(--color-acc); background:#e0f2f1; color:var(--color-acc); opacity:1;' 
                : 'border:1px solid #ccc; opacity:0.6;';
            
            return `<button class="u-btn u-btn-sm" style="${style} margin-right:5px; margin-bottom:5px; border-radius:12px;"
                onclick="taskView.toggleSkill('${s.name}')">${icon} ${s.name}</button>`;
        }).join('');

        bodyHtml += ui.container.box(`
            <label style="font-size:0.8rem; color:#888;">綁定技能</label>
            <div style="display:flex; flex-wrap:wrap; margin-top:5px;">
                ${skillBtns || '<span style="color:#ccc; font-size:0.8rem;">無可用技能 (請至屬性頁新增)</span>'}
            </div>
        `, 'margin-bottom:15px;');

        // --- E. 價值矩陣 ---
        bodyHtml += ui.container.box(`
            <div style="display:flex; justify-content:space-between;">
                <b>價值評估</b>
                <div id="matrix-tag-preview" style="font-size:0.85rem;"></div>
            </div>
            <div style="margin:10px 0;">
                <div style="font-size:0.8rem; color:#666;">重要性: <b id="val-imp">${data.importance}</b></div>
                <input type="range" min="1" max="4" value="${data.importance}" style="width:100%; accent-color:var(--color-acc);" oninput="taskView.updateField('importance', parseInt(this.value))">
            </div>
            <div>
                <div style="font-size:0.8rem; color:#666;">緊急性: <b id="val-urg">${data.urgency}</b></div>
                <input type="range" min="1" max="4" value="${data.urgency}" style="width:100%; accent-color:var(--color-danger);" oninput="taskView.updateField('urgency', parseInt(this.value))">
            </div>
        `, 'margin-bottom:15px; border-left:4px solid gold;');

        // --- F. 到期日 ---
        bodyHtml += `<div style="margin-bottom:15px;">
            <label style="font-size:0.8rem; color:#888;">📅 到期時間</label>
            ${ui.input.datetime(data.deadline, "taskView.updateField('deadline', this.value)")}
        </div>`;

        // Footer
        const footHtml = taskId 
            ? `
                ${ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteTask('${taskId}')`})}
                ${ui.component.btn({label:'複製', theme:'normal', action:`act.copyTask('${taskId}')`})}
                ${ui.component.btn({label:'保存', theme:'correct', style:'flex:1;', action:'act.submitTask()'})}
              `
            : ui.component.btn({label:'新增任務', theme:'correct', style:'width:100%;', action:'act.submitTask()'});

        ui.modal.render(taskId ? '編輯任務' : '新增任務', bodyHtml, footHtml, 'overlay');
        this.updateMatrixPreview(); // 初始化預覽文字
    },

    // 3. 輔助函式
    updateField: function(field, val) {
        if (!window.TempState.editingTask) return;
        window.TempState.editingTask[field] = val;

        // 數值顯示更新
        if(field === 'importance' || field === 'urgency') {
            const el = document.getElementById(`val-${field.substring(0,3)}`);
            if(el) el.innerText = val;
            this.updateMatrixPreview();
            return; 
        }
        
        // 結構性重繪 (類型、分類等)
        if(['type', 'subRule', 'pinned'].includes(field)) {
            // 使用 setTimeout 避免點擊事件衝突
            setTimeout(() => this.renderCreateTaskForm(window.TempState.editingTask.id), 0);
        }
    },

    updateCategory: function(cat) {
        if (!window.TempState.editingTask) return;
        const oldCat = window.TempState.editingTask.cat;
        window.TempState.editingTask.cat = cat;
        // 如果切換涉及「運動」(顯示/隱藏熱量)，需要重繪
        if (oldCat === '運動' || cat === '運動') {
            setTimeout(() => this.renderCreateTaskForm(window.TempState.editingTask.id), 0);
        } else {
            // 否則只重繪按鈕狀態 (這裡偷懶直接重繪整個表單，保證一致性)
            setTimeout(() => this.renderCreateTaskForm(window.TempState.editingTask.id), 0);
        }
    },

    toggleSkill: function(skillName) {
        if (!window.TempState.editingTask) return;
        const t = window.TempState.editingTask;
        if (!t.attrs) t.attrs = [];
        const idx = t.attrs.indexOf(skillName);
        
        if (idx === -1) {
            if (t.attrs.length >= 3) return act.toast("⚠️ 最多綁定 3 個技能");
            t.attrs.push(skillName);
        } else {
            t.attrs.splice(idx, 1);
        }
        // 重繪以更新按鈕樣式
        setTimeout(() => this.renderCreateTaskForm(t.id), 0);
    },

    updateMatrixPreview: function() {
        const t = window.TempState?.editingTask;
        const box = document.getElementById('matrix-tag-preview');
        if(box && t && window.TaskEngine) {
            const r = TaskEngine.calculateRewards(t.importance, t.urgency);
            let label = "🍂 雜務"; let color = "#757575";
            if(t.importance>=3 && t.urgency>=3) { label="🔥 危機"; color="#d32f2f"; }
            else if(t.importance>=3) { label="💎 願景"; color="#0288d1"; }
            else if(t.urgency>=3) { label="⚡ 突發"; color="#ef6c00"; }
            box.innerHTML = `<span style="color:${color}; font-weight:bold; margin-right:5px;">${label}</span> <span style="color:#aaa;">💰${r.gold} ✨${r.exp}</span>`;
        }
    }
};