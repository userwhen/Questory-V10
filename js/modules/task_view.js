/* js/modules/task_view.js - V51.7 Ultimate Smooth Edition */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Task = {
    // ============================================================
    // 1. 主列表渲染
    // ============================================================
    render: function(resetTab = false) {
        window.SQ.Temp = window.SQ.Temp || {};
        if (resetTab) window.SQ.Temp.taskTab = 'list';
        else if (!window.SQ.Temp.taskTab) window.SQ.Temp.taskTab = 'list';
        window.SQ.Temp.currentView = 'task';
        const page = document.getElementById('page-task');
        if (!page) return;
        
        const scrollBox = document.getElementById('task-scroll-area');
        let currentScrollY = scrollBox && !resetTab ? scrollBox.scrollTop : (window.SQ.Temp.mainListScrollY || 0);

        const isList = window.SQ.Temp.taskTab === 'list'; 
        const segmentHtml = [{ label: '📋 任務列表', val: 'list' }, { label: '🏆 榮譽成就', val: 'ach' }].map(opt => ui.atom.buttonBase({
            label: opt.label, theme: window.SQ.Temp.taskTab === opt.val ? 'correct' : 'normal',
            style: `flex:1; margin:2px; ${window.SQ.Temp.taskTab === opt.val ? 'box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);' : ''}`,
            action: 'switchTaskTab', actionVal: opt.val
        })).join('');

        let contentHtml = '';
        if (isList) {
            const currentCat = window.SQ.Temp.filterCategory || '全部';
            const allCats = ['全部', ...((window.SQ.State.taskCats || []).filter(c => c !== '全部'))];
            const filterBtns = allCats.map(c => ui.atom.buttonBase({ label: c, theme: c === currentCat ? 'normal' : 'ghost', style: 'flex-shrink:0; border-radius:50px; padding:4px 12px;', action: 'setTaskFilter', actionVal: c })).join('');
            const filterArea = `<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;"><div style="flex:1; overflow:hidden;"><div class="u-scroll-list">${filterBtns}</div></div><div style="flex-shrink:0;">${ui.atom.buttonBase({ label:'📜 歷史', theme:'normal', size:'sm', action:'navigate', actionVal:'history' })}</div></div>`;
            const tasks = window.SQ.Engine.Task.getSortedTasks(currentCat);
            const listItems = tasks.length === 0 ? `<div class="ui-empty"><div class="ui-empty-icon">📭</div>暫無任務</div>` : `<div>${tasks.map(t => ui.smart.taskCard(t, false)).join('')}</div>`;
            contentHtml = filterArea + `<div style="padding-bottom:100px;">${listItems}</div>`;
        } else {
            if (window.SQ.View.Ach && window.SQ.View.Ach.renderList) contentHtml = `<div>${window.SQ.View.Ach.renderList()}</div>`;
        }

        const fabHtml = ui.atom.buttonBase({ label: '＋', theme: isList ? 'correct' : 'normal', style: `position:absolute; bottom:25px; right:25px; width:60px; height:60px; border-radius:50%; font-size:2rem; box-shadow:var(--shadow-lg); z-index:10; ${!isList ? 'background:var(--color-gold); border:none; color:var(--text);' : ''}`, action: isList ? 'editTask' : 'openCreateCustomAch', actionId: isList ? 'null' : '' });
        
        page.innerHTML = `<div style="display:flex; flex-direction:column; height:100%; position:relative; overflow:hidden;"><div style="flex-shrink:0; padding:10px 0;"><div style="display:flex; background:var(--bg-box); border-radius:50px; padding:4px; margin:10px 15px;">${segmentHtml}</div></div><div id="task-scroll-area" style="flex:1; overflow-y:auto; padding:0 10px; width:100%; box-sizing:border-box;">${contentHtml}</div>${fabHtml}</div>`;
        const newScrollBox = document.getElementById('task-scroll-area');
        if (newScrollBox) newScrollBox.scrollTop = currentScrollY;
    },

    renderHistoryPage: function() { 
        const container = document.getElementById('page-history'); if(!container) return;
        const history = window.SQ.State.history || [];
        const listHtml = history.length === 0 ? `<div class="ui-empty"><div class="ui-empty-icon">📜</div>無歷史紀錄</div>` : `<div style="padding: 14px;">` + [...history].reverse().map(t => ui.smart.taskCard(t, true)).join('') + `</div>`;
        container.innerHTML = `<div style="display:flex; flex-direction:column; height:100%; overflow:hidden; background:var(--bg-panel);">${ui.composer.pageHeader({title: '📜 歷史紀錄', backAction: 'navigate', backActionVal: 'task', style: 'background:var(--bg-card);'})}<div style="flex:1; overflow-y:auto; overflow-x:hidden; position:relative; z-index:10; padding-bottom: 20px;">${listHtml}</div></div>`;
    },

    // ============================================================
    // 2. 編輯表單 (整合完整功能 + 局部 ID)
    // ============================================================
    renderCreateTaskForm: function(taskId) {
        if (taskId === 'null') taskId = null;
        if (window.SQ.Temp.importedTaskData) { window.SQ.Temp.editingTask = { ...window.SQ.Temp.importedTaskData, id: null, attrs: [], target: 10, pinned: false, calories: 0, deadline: '', subRule: 'all', recurrence: '' }; window.SQ.Temp.importedTaskData = null; taskId = null; }
        
        const cur = window.SQ.Temp.editingTask;
        if (!cur || (taskId && cur.id !== taskId) || (taskId === null && cur.id !== null)) {
            if (taskId === null) window.SQ.Temp.editingTask = { id: null, title: '', desc: '', importance: 1, urgency: 1, type: 'normal', attrs: [], cat: '每日', target: 10, subs: [], pinned: false, calories: 0, deadline: '', subRule: 'all', recurrence: '' };
            else { const t = window.SQ.State.tasks.find(x => x.id === taskId); if (t) window.SQ.Temp.editingTask = JSON.parse(JSON.stringify(t)); }
        }
        
        const data = window.SQ.Temp.editingTask;
        data.importance = parseInt(data.importance) || 1; data.urgency = parseInt(data.urgency) || 1; if (!data.attrs) data.attrs = [];
        const isCount = data.type === 'count';

        // 表單本體
        let bodyHtml = `
            <div style="display:flex; align-items:flex-end; gap:10px;">
                <div style="flex:1;">${ui.composer.formField({label:'任務名稱', inputHtml: ui.atom.inputBase({type: 'text', val: data.title, placeholder: "要做什麼呢？", action: "updateTaskField", actionId: "title"})})}</div>
                <div style="margin-bottom:14px;">${ui.atom.buttonBase({ id: 'btn-pin-toggle', label: '📌', theme: 'ghost', action: 'toggleTaskPin', style: `font-size:1.4rem; padding:0 8px; border:none; opacity:${data.pinned ? '1' : '0.3'}; transition:all 0.2s;` })}</div>
            </div>
            ${ui.composer.formField({label:'詳細說明', inputHtml: ui.atom.inputBase({type: 'textarea', val: data.desc, placeholder: "備註...", action: "updateTaskField", actionId: "desc"})})}`;

        // 分類 (具備 cat-sel-btn 類別以供局部更新)
        const catButtons = (window.SQ.State.taskCats || ['每日', '運動', '工作']).map(c => {
            const isActive = data.cat === c;
            return `<button type="button" id="cat-btn-${c}" class="u-btn u-btn-sm ${isActive ? 'u-btn-correct' : 'u-btn-normal'} cat-sel-btn" 
                style="flex-shrink:0; margin-right:5px; border-radius:50px; padding:4px 12px; white-space:nowrap; ${isActive ? 'box-shadow:var(--shadow-inner);' : ''}" 
                data-action="updateTaskCategory" data-val="${c}">${c}</button>`;
        }).join('');

        bodyHtml += `<div style="margin-bottom:15px;"><label class="section-title">分類</label><div style="display:flex; align-items:center; width:100%;"><div class="u-scroll-x" id="cat-scroll-container" style="flex:1; overflow-x:auto; display:flex; align-items:center; background:var(--bg-box); border-radius:30px; padding:4px;">${catButtons}</div><div style="flex-shrink:0;">${ui.atom.buttonBase({label:'+', size:'sm', theme:'normal', action:'addNewCategory', style:'margin-left:5px; height:32px; width:32px; padding:0; border-radius:50%;'})}</div></div></div>`;

        // 熱量 (DLC)
        if (data.cat === '運動' && ((window.SQ.State.unlocks && window.SQ.State.unlocks.feature_cal) || (window.SQ.State.settings && window.SQ.State.settings.calMode))) {
            bodyHtml += `<div class="u-box" style="margin-bottom:15px; background:var(--color-gold-soft); border:1px dashed var(--color-gold); display:flex; justify-content:space-between; align-items:center; padding:12px;"><span style="font-weight:bold; color:var(--color-gold-dark); flex-shrink:0;">🔥 消耗熱量</span><div style="display:flex; align-items:center; gap:5px;">${ui.atom.inputBase({ type: 'number', val: data.calories, action: "updateTaskField", actionId: "calories", style: "width:70px; background:rgba(255,255,255,0.7); border:none; padding:6px; font-weight:bold; color:var(--text); outline:none;" })}<span style="font-size:0.9rem; color:var(--color-gold-dark); font-weight:bold;">Kcal</span></div></div>`;
        }

        // 計次與子任務
        const rightSettingHtml = !isCount ? `
            <div style="display:flex; gap:10px;">
                <label style="display:flex; align-items:center; color:var(--text-muted); cursor:pointer;"><input type="radio" name="subRule" ${data.subRule==='all'?'checked':''} data-change="updateTaskField" data-id="subRule" value="all"><span style="margin-left:4px; font-size:0.8rem;">全部</span></label>
                <label style="display:flex; align-items:center; color:var(--text-muted); cursor:pointer;"><input type="radio" name="subRule" ${data.subRule==='any'?'checked':''} data-change="updateTaskField" data-id="subRule" value="any"><span style="margin-left:4px; font-size:0.8rem;">擇一</span></label>
            </div>` : `<div style="display:flex; align-items:center; gap:5px;">${ui.atom.inputBase({type: 'number', val: data.target, action: "updateTaskField", actionId: "target", style: 'width:50px;'})}<span style="font-size:0.9rem; color:var(--text-muted);">次</span></div>`;

        bodyHtml += `
            <div class="u-box" style="padding:12px; margin-bottom:15px; background:var(--bg-elevated);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; background:rgba(0,0,0,0.05); border-radius:20px; padding:2px;">
                        ${ui.atom.buttonBase({label:'📝 一般', theme:!isCount?'correct':'ghost', action:"updateTaskField", actionId:"type", actionVal:"normal", style:'border-radius:50px; padding:4px 12px;'})}
                        ${ui.atom.buttonBase({label:'🔢 計次', theme:isCount?'correct':'ghost', action:"updateTaskField", actionId:"type", actionVal:"count", style:'border-radius:50px; padding:4px 12px;'})}
                    </div>
                    ${rightSettingHtml}
                </div>
                ${!isCount ? `<div style="margin-top:12px; border-top:1px dashed var(--border); padding-top:12px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><div style="font-size:0.85rem; font-weight:bold; color:var(--text-muted);">🔨 子任務</div>${ui.atom.buttonBase({label:'+ 新增步驟', theme:'paper', size:'sm', action:'addSubtask'})}</div>${(data.subs || []).map((s, i) => `<div style="display:flex; gap:5px; margin-bottom:6px; align-items:center;">${ui.atom.inputBase({type:'text', val: s.text, placeholder: `步驟 ${i+1}`, action: "updateSubtaskText", actionId: i})}${ui.atom.buttonBase({label:'✕', theme:'ghost', size:'sm', style:'color:var(--color-danger); border:none;', action:'removeSubtask', actionVal: i})}</div>`).join('')}</div>` : ''}
            </div>`;

        // 綁定技能 (局部 ID)
        const skillHtml = (window.SQ.State.skills || []).map(s => {
            const active = data.attrs.includes(s.name);
            const style = active ? 'border:1px solid var(--color-correct); background:var(--color-correct-soft); color:var(--color-correct-dark); font-weight:bold;' : 'border:1px solid var(--border); opacity:0.7;';
            return `<button type="button" id="skill-btn-${s.name}" class="u-btn u-btn-sm skill-sel-btn" style="${style} margin-right:5px; margin-bottom:5px; border-radius:12px;" data-action="toggleTaskSkill" data-id="${s.name}"> ${window.SQ.State.attrs?.[s.parent]?.icon || '❓'} ${s.name}</button>`;
        }).join('');
        bodyHtml += `<div style="margin-bottom:15px;"><label class="section-title">📚 綁定技能</label><div class="u-box" style="padding:10px; display:flex; flex-wrap:wrap; min-height:50px;">${skillHtml || '<span style="color:var(--text-ghost); font-size:0.8rem; width:100%; text-align:center;">無可用技能</span>'}</div></div>`;

        // 矩陣與預覽
        const comboInfo = view.getPriorityInfo(data.importance, data.urgency);
        bodyHtml += `
            <div id="matrix-box" class="u-box" style="padding:12px; margin-bottom:15px; border-left: 4px solid ${comboInfo.border};">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="font-weight:bold; font-size:0.9rem; color:var(--text);">📊 價值評估</span><div id="matrix-tag-preview" style="font-size:0.85rem; color:var(--text-muted);">...</div></div>
                <div>重要性: <b id="val-imp">${data.importance}</b><input type="range" min="1" max="4" value="${data.importance}" style="width:100%;" data-input="updateTaskField" data-id="importance"></div>
                <div style="margin-top:10px;">緊急性: <b id="val-urg">${data.urgency}</b><input type="range" min="1" max="4" value="${data.urgency}" style="width:100%;" data-input="updateTaskField" data-id="urgency"></div>
            </div>`;

        // 循環設定
        bodyHtml += `<div style="display:flex; gap:10px; align-items:flex-end;"><div style="flex: 1;">${ui.composer.formField({label:'📅 到期', inputHtml: ui.atom.inputBase({type: 'datetime-local', val: data.deadline, action: "updateTaskField", actionId: "deadline"})})}</div><div style="flex: 1;">${ui.composer.formField({label:'🔄 循環', inputHtml: ui.atom.inputBase({type: 'select', val: data.recurrence, action: "updateTaskField", actionId: "recurrence", options: [{val:'', label:'不重複'}, {val:'daily', label:'每天'}, {val:'weekly', label:'每週'}, {val:'monthly', label:'每月'}, {val:'yearly', label:'每年'}]})})}</div></div>`;

        const footHtml = taskId ? `${ui.atom.buttonBase({label:'刪除', theme:'danger', action:'deleteTask', actionId: taskId})} ${ui.atom.buttonBase({label:'複製', theme:'normal', action:'copyTask', actionId: taskId})} ${ui.atom.buttonBase({label:'保存', theme:'correct', style:'flex:1;', action:'submitTask'})}` : ui.atom.buttonBase({label:'新增任務', theme:'correct', style:'width:100%;', action:'submitTask'});

        ui.modal.render(taskId ? '編輯任務' : '新增任務', bodyHtml, footHtml, 'overlay');
        this.updateMatrixPreview();
    },

    // ============================================================
    // 3. 局部更新邏輯 (解決抽動的核心)
    // ============================================================
    updateCategoryUI: function(cat) {
        if (!window.SQ.Temp.editingTask) return;
        const oldCat = window.SQ.Temp.editingTask.cat;
        window.SQ.Temp.editingTask.cat = cat;

        if (oldCat === '運動' || cat === '運動') {
            this.renderCreateTaskForm(window.SQ.Temp.editingTask.id);
            return;
        }

        document.querySelectorAll('.cat-sel-btn').forEach(btn => {
            btn.classList.remove('u-btn-correct'); btn.classList.add('u-btn-normal'); btn.style.boxShadow = 'none';
        });
        const target = document.getElementById(`cat-btn-${cat}`);
        if (target) { target.classList.remove('u-btn-normal'); target.classList.add('u-btn-correct'); target.style.boxShadow = 'var(--shadow-inner)'; }
    },

    toggleSkillUI: function(skillName) {
        const t = window.SQ.Temp.editingTask;
        if (!t) return;
        if (!t.attrs) t.attrs = [];
        const idx = t.attrs.indexOf(skillName);
        let isActive = false;
        if (idx === -1) {
            if (t.attrs.length >= 3) { if(window.SQ.Actions.toast)window.SQ.Actions.toast("⚠️ 最多綁定 3 個技能"); return; }
            t.attrs.push(skillName); isActive = true;
        } else {
            t.attrs.splice(idx, 1); isActive = false;
        }
        const btn = document.getElementById(`skill-btn-${skillName}`);
        if (btn) {
            if (isActive) {
                btn.style.border = '1px solid var(--color-correct)'; btn.style.background = 'var(--color-correct-soft)'; btn.style.color = 'var(--color-correct-dark)'; btn.style.fontWeight = 'bold'; btn.style.opacity = '1';
            } else {
                btn.style.border = '1px solid var(--border)'; btn.style.background = ''; btn.style.color = ''; btn.style.fontWeight = ''; btn.style.opacity = '0.7';
            }
        }
    },

    updateField: function(f, v) {
        if (!window.SQ.Temp.editingTask) return;
        if (['importance', 'urgency', 'calories', 'target'].includes(f)) v = parseInt(v) || 0;
        window.SQ.Temp.editingTask[f] = v;

        if (f === 'importance' || f === 'urgency') {
            const valEl = document.getElementById(`val-${f === 'importance' ? 'imp' : 'urg'}`);
            if(valEl) valEl.innerText = v;
            this.updateMatrixPreview();
            return;
        }
        if (['type', 'subRule'].includes(f)) setTimeout(() => this.renderCreateTaskForm(window.SQ.Temp.editingTask.id), 0);
    },

    updateMatrixPreview: function() {
        const t = window.SQ.Temp.editingTask; 
        if (!t) return;
        const box = document.getElementById('matrix-tag-preview'); 
        if (!box) return;

        // 🌟 修復 1：明確指向 SQ.View.Main 拿取 priority 顏色
        const info = window.SQ.View.Main.getPriorityInfo(t.importance, t.urgency);
        const matrixBox = document.getElementById('matrix-box');
        if (matrixBox) matrixBox.style.borderLeftColor = info.border;

        // 🌟 修復 2：明確指向 SQ.Engine.Task 拿取獎勵計算
        if(window.SQ.Engine.Task) {
            const calcFunc = window.SQ.Engine.Task.previewRewards || window.SQ.Engine.Task.calculateRewards;
            if (typeof calcFunc === 'function') {
                const r = calcFunc(t.importance, t.urgency);
                box.innerHTML = `<span style="color:${info.color}; font-weight:bold; margin-right:5px;">${info.label}</span> <span style="color:var(--text-ghost);">💰${r.gold} ✨${r.exp}</span>`;
            }
        }
    }
};

// ============================================================
// 4. 轉接器橋樑 (Adapters)
// ============================================================
window.SQ.Actions.updateTaskField = (f, v) => window.SQ.View.Task.updateField(f, v);
window.SQ.Actions.updateTaskCategory = (c) => window.SQ.View.Task.updateCategoryUI(c);
window.SQ.Actions.toggleTaskSkill = (s) => window.SQ.View.Task.toggleSkillUI(s);
window.SQ.Actions.toggleTaskPin = () => {
    if(!window.SQ.Temp.editingTask) return;
    const s = !window.SQ.Temp.editingTask.pinned;
    window.SQ.Temp.editingTask.pinned = s;
    const btn = document.getElementById('btn-pin-toggle');
    if(btn) btn.style.opacity = s ? '1' : '0.3';
};