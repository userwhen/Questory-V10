/* js/modules/task_view.js - V42.0 UI System Upgrade */
window.taskView = {
    // =========================================
    // 1. 主列表渲染 (Render Main List)
    // =========================================
    render: function(resetTab = false) {
        window.TempState = window.TempState || {};

        if (resetTab) window.TempState.taskTab = 'list';
        else if (!window.TempState.taskTab) window.TempState.taskTab = 'list';
        
        window.TempState.currentView = 'task';
        const page = document.getElementById('page-task');
        if (!page) return;
        
        const scrollBox = document.getElementById('task-scroll-area');
        let currentScrollY = 0;
        if (scrollBox && !resetTab) {
            currentScrollY = scrollBox.scrollTop;
            window.TempState.mainListScrollY = currentScrollY;
        } else if (window.TempState.mainListScrollY) {
            currentScrollY = window.TempState.mainListScrollY;
        }

        const isList = window.TempState.taskTab === 'list';
		const segmentHtml = ui.component.segment([
		{ label: '📋 任務列表', val: 'list' },
		{ label: '🏆 榮譽成就', val: 'ach' }
		], window.TempState.taskTab, "act.switchTaskTab");
		const headerHtml = `<div style="display:flex; background:rgba(0,0,0,0.07); border-radius:50px; padding:4px; margin:10px 15px;">${segmentHtml}</div>`;
        
        let contentHtml = '';

        if (isList) {
            const userCats = (window.GlobalState.taskCats && window.GlobalState.taskCats.length > 0) ? window.GlobalState.taskCats.filter(c => c !== '全部') : ['每日', '運動', '工作'];
            const currentCat = window.TempState.filterCategory || '全部';
            const allCats = ['全部', ...userCats];
            
            const tasks = TaskEngine.getSortedTasks(currentCat);
            
            // [優化] 使用共用的 filterBar
            const filterArea = ui.layout.filterBar(
                allCats, currentCat, "act.setTaskFilter",
                ui.component.btn({ label:'📜 歷史', theme:'normal', size:'sm', action:"act.navigate('history')" })
            );
            
            // [優化] 使用共用的 empty
            const listItems = tasks.length === 0 
                ? ui.layout.empty('📭 暫無任務', '📭')
                : `<div>${tasks.map(t => ui.card.task(t, false)).join('')}</div>`; 
            
            contentHtml = filterArea + `<div style="padding-bottom:100px;">${listItems}</div>`;

        } else {
            if (window.achView && achView.renderList) {
                contentHtml = `<div>${achView.renderList()}</div>`;
            } else {
                contentHtml = "<div>AchView module not loaded</div>";
            }
        }

        // [優化] FAB 按鈕加上了陰影庫的陰影
        const fabBg = !isList ? 'background:var(--color-gold); border:none; color:var(--text);' : '';
        const fabAction = isList ? "act.editTask(null)" : "act.openCreateCustomAch()"; 
        const fabHtml = ui.component.btn({ 
            label: '＋', theme: isList ? 'correct' : 'normal', 
            style: `position:absolute; bottom:25px; right:25px; width:60px; height:60px; border-radius:50%; font-size:2rem; box-shadow:var(--shadow-lg); z-index:10; ${fabBg}`, 
            action: fabAction 
        });
        
        page.innerHTML = `<div style="display:flex; flex-direction:column; height:100%; position:relative; overflow:hidden;"><div style="flex-shrink:0; padding:10px 0;">${headerHtml}</div><div id="task-scroll-area" style="flex:1; overflow-y:auto; padding:0 10px; width:100%; box-sizing:border-box; scroll-behavior: auto;">${contentHtml}</div>${fabHtml}</div>`;
        
        const newScrollBox = document.getElementById('task-scroll-area');
        if (newScrollBox) {
            newScrollBox.scrollTop = currentScrollY;
        }
    },

    renderHistoryPage: function() { 
        const container = document.getElementById('page-history'); if(!container) return;
        
        // [優化] 使用共用的 pageHeader
        const headerHtml = ui.layout.pageHeader(
            '📜 歷史紀錄',
            ui.component.btn({label:'↩ 返回', theme:'normal', size:'sm', action:"act.navigate('task')"})
        );
        
        const history = window.GlobalState.history || [];
        const listHtml = history.length === 0 
            ? ui.layout.empty('📜 無歷史紀錄', '📜') 
            : `<div style="padding: 14px;">` + [...history].reverse().map(t => ui.card.task(t, true)).join('') + `</div>`;
            
        // [優化] 直接使用 flex 排版，取代舊的 scroller
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; background:var(--bg-panel);">
                ${headerHtml}
                <div style="flex:1; overflow-y:auto;">${listHtml}</div>
            </div>`;
    },

    // =========================================================================
    // 2. 編輯表單 (Edit Form)
    // =========================================================================
    renderCreateTaskForm: function(taskId) {
        const gs = window.GlobalState;
        
        if (window.TempState.importedTaskData) {
            window.TempState.editingTask = {
                ...window.TempState.importedTaskData,
                id: null, attrs: [], target: 10, pinned: false, calories: 0, deadline: '', subRule: 'all', recurrence: ''
            };
            window.TempState.importedTaskData = null;
            taskId = null;
        }

        const oldScrollBox = document.getElementById('cat-scroll-container');
        if (oldScrollBox) window.TempState.editScrollX = oldScrollBox.scrollLeft;

        const currentTemp = window.TempState.editingTask;
        const needInit = !currentTemp || (taskId && currentTemp.id !== taskId) || (taskId === null && currentTemp.id !== null);
        
        if (needInit) {
            if (taskId === null) {
                window.TempState.editingTask = { id: null, title: '', desc: '', importance: 1, urgency: 1, type: 'normal', attrs: [], cat: '每日', target: 10, subs: [], pinned: false, calories: 0, deadline: '', subRule: 'all', recurrence: '' };
            } else {
                const task = gs.tasks.find(t => t.id === taskId);
                if (task) window.TempState.editingTask = JSON.parse(JSON.stringify(task));
            }
        }
        
        const data = window.TempState.editingTask;
        
        data.importance = (data.importance === undefined || data.importance === null) ? 1 : (parseInt(data.importance) || 1);
        data.urgency = (data.urgency === undefined || data.urgency === null) ? 1 : (parseInt(data.urgency) || 1);
        if (!data.attrs) data.attrs = [];
        const isCount = data.type === 'count';

        // [優化] 使用共用的 input field
        const titleInput = ui.input.text(data.title, "要做什麼呢？", "taskView.updateField('title', this.value)");
        const pinBtn = ui.component.btn({ id: 'btn-pin-toggle', label: '📌', theme: 'ghost', action: `taskView.togglePin()`, style: `font-size:1.4rem; padding:0 8px; border:none; opacity:${data.pinned ? '1' : '0.3'}; transition:all 0.2s;` });
        
        let bodyHtml = `
        <div style="display:flex; align-items:flex-end; gap:10px;">
            <div style="flex:1;">${ui.input.field('任務名稱', titleInput)}</div>
            <div style="margin-bottom:14px;">${pinBtn}</div>
        </div>
        ${ui.input.field('詳細說明', ui.input.textarea(data.desc, "備註...", "taskView.updateField('desc', this.value)"))}`;

        const defaultCats = ['每日', '運動', '工作'];
        const catButtons = (gs.taskCats && gs.taskCats.length > 0 ? gs.taskCats : defaultCats).map(c => {
            const isActive = data.cat === c;
            return `<button type="button" id="cat-btn-${c}" class="u-btn u-btn-sm ${isActive ? 'u-btn-correct' : 'u-btn-normal'}" 
                style="flex-shrink:0; margin-right:5px; border-radius:50px; padding:4px 12px; white-space:nowrap; ${isActive ? 'box-shadow:var(--shadow-inner);' : ''}" 
                onclick="taskView.updateCategory('${c}')">${c}</button>`;
        }).join('');

        let caloriesInput = '';
        const isCalActive = (gs.unlocks && gs.unlocks.feature_cal) || (gs.settings && gs.settings.calMode);
        if (data.cat === '運動' && isCalActive) {
            caloriesInput = `<div style="display:flex; align-items:center; gap:5px; background:var(--color-gold-soft); padding:2px 8px; border-radius:15px; border:1px solid rgba(245,166,35,0.3); margin-left:10px; flex-shrink:0;"><span style="font-size:0.9rem;">🔥</span>${ui.input.number(data.calories, "taskView.updateField('calories', parseInt(this.value)||0)", 4)}<span style="font-size:0.8rem; color:var(--color-gold-dark);">Kcal</span></div>`;
        }

        bodyHtml += `
        <div style="margin-bottom:15px;">
            <label class="section-title">分類</label>
            <div style="display:flex; align-items:center; width:100%;">
                <div class="u-scroll-x" id="cat-scroll-container" style="flex:1; overflow-x:auto; display:flex; align-items:center; background:var(--bg-box); border-radius:30px; padding:4px;">
                    ${catButtons}
                </div>
                <div style="flex-shrink:0; display:flex; align-items:center;">
                    ${caloriesInput}
                    ${ui.component.btn({label:'+', size:'sm', theme:'normal', action:'taskView.handleAddCategory()', style:'margin-left:5px; height:32px; width:32px; padding:0; border-radius:50%;'})}
                </div>
            </div>
        </div>`;

        let rightSettingHtml = !isCount ? 
            `<div style="display:flex; gap:10px;"><label style="display:flex; align-items:center; color:var(--text-muted);"><input type="radio" ${data.subRule==='all'?'checked':''} onclick="taskView.updateField('subRule', 'all')"><span style="margin-left:4px; font-size:0.8rem;">全部</span></label><label style="display:flex; align-items:center; color:var(--text-muted);"><input type="radio" ${data.subRule==='any'?'checked':''} onclick="taskView.updateField('subRule', 'any')"><span style="margin-left:4px; font-size:0.8rem;">擇一</span></label></div>` : 
            `<div style="display:flex; align-items:center; gap:5px;">${ui.input.number(data.target, "taskView.updateField('target', this.value)", 2)}<span style="font-size:0.9rem; color:var(--text-muted);">次</span></div>`;

        // [優化] 使用 CSS 變數管理盒子顏色
        bodyHtml += `
        <div class="u-box" style="padding:12px; margin-bottom:15px; background:var(--bg-elevated);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; background:rgba(0,0,0,0.05); border-radius:20px; padding:2px;">
                    ${ui.component.pillBtn({label:'📝 一般', theme:!isCount?'correct':'ghost', action:"taskView.updateField('type', 'normal')"})}
                    ${ui.component.pillBtn({label:'🔢 計次', theme:isCount?'correct':'ghost', action:"taskView.updateField('type', 'count')"})}
                </div>
                ${rightSettingHtml}
            </div>
            ${!isCount ? `
            <div style="margin-top:12px; border-top:1px dashed var(--border); padding-top:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="font-size:0.85rem; font-weight:bold; color:var(--text-muted);">🔨 子任務</div>
                    ${ui.component.btn({label:'+ 新增步驟', theme:'paper', size:'sm', action:'act.addSubtask()'})}
                </div>
                ${(data.subs || []).map((s, i) => `
                <div style="display:flex; gap:5px; margin-bottom:6px; align-items:center;">
                    ${ui.input.text(s.text, `步驟 ${i+1}`, `act.updateSubtaskText(${i}, this.value)`)}
                    ${ui.component.btn({label:'✕', theme:'ghost', size:'sm', style:'color:var(--color-danger); border:none;', action:`act.removeSubtask(${i})`})}
                </div>`).join('')}
            </div>` : ''}
        </div>`;

        const skillHtml = (gs.skills || []).map(s => {
            const active = data.attrs.includes(s.name);
            const style = active ? 'border:1px solid var(--color-correct); background:var(--color-correct-soft); color:var(--color-correct-dark); font-weight:bold;' : 'border:1px solid var(--border); opacity:0.7;';
            return `<button type="button" class="u-btn u-btn-sm" id="skill-btn-${s.name}" style="${style} margin-right:5px; margin-bottom:5px; border-radius:12px;" onclick="taskView.toggleSkill('${s.name}')"> ${window.GlobalState.attrs?.[s.parent]?.icon || '❓'} ${s.name}</button>`;
        }).join('');
        bodyHtml += `<div style="margin-bottom:15px;"><label class="section-title">📚 綁定技能</label><div class="u-box" style="padding:10px; display:flex; flex-wrap:wrap; min-height:50px;">${skillHtml || '<span style="color:var(--text-ghost); font-size:0.8rem; width:100%; text-align:center;">無可用技能，請至屬性頁新增</span>'}</div></div>`;

        // 價值評估矩陣的顏色動態計算
        const getLabelColor = (val) => val >= 3 ? (val===4?'var(--color-danger)':'#ef6c00') : (val===2?'var(--color-info)':'var(--text-muted)');
        let borderSideColor = 'var(--text-muted)'; 
        if(data.importance>=3 && data.urgency>=3) borderSideColor="var(--color-danger)"; 
        else if(data.importance>=3) borderSideColor="var(--color-info)"; 
        else if(data.urgency>=3) borderSideColor="#ef6c00";
        
        bodyHtml += `
        <div id="matrix-box" class="u-box" style="padding:12px; margin-bottom:15px; border-left: 4px solid ${borderSideColor}; transition: border-left-color 0.3s ease;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="font-weight:bold; font-size:0.9rem; color:var(--text);">📊 價值評估</span>
                <div id="matrix-tag-preview" style="font-size:0.85rem; color:var(--text-muted);">...</div>
            </div>
            <div style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                    <span id="lbl-imp" style="color:${getLabelColor(data.importance)}; font-weight:bold;">重要性</span> 
                    <b id="val-imp" style="color:var(--text-2);">${data.importance}</b>
                </div>
                <input type="range" min="1" max="4" value="${data.importance}" style="width:100%; accent-color:var(--color-info);" oninput="taskView.updateField('importance', parseInt(this.value));">
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                    <span id="lbl-urg" style="color:${getLabelColor(data.urgency)}; font-weight:bold;">緊急性</span> 
                    <b id="val-urg" style="color:var(--text-2);">${data.urgency}</b>
                </div>
                <input type="range" min="1" max="4" value="${data.urgency}" style="width:100%; accent-color:var(--color-danger);" oninput="taskView.updateField('urgency', parseInt(this.value));">
            </div>
        </div>`;

        const recurrenceOpts = [{val:'', label:'不重複'}, {val:'daily', label:'每天'}, {val:'weekly', label:'每週'}, {val:'monthly', label:'每月'}, {val:'yearly', label:'每年'}];
        bodyHtml += `
        <div style="display:flex; gap:10px; align-items:flex-end;">
            <div style="flex: 1 1 0; min-width: 0;"> 
                ${ui.input.field('📅 到期時間', ui.input.datetime(data.deadline, "taskView.updateField('deadline', this.value)"))}
            </div>
            <div style="flex: 1 1 0; min-width: 0;"> 
                ${ui.input.field('🔄 循環', ui.input.select(recurrenceOpts, data.recurrence, "taskView.updateField('recurrence', this.value)"))}
            </div>
        </div>`;

        // [優化] 底部按鈕統一調用 (雖然有複製按鈕，手動排版維持一致性)
        const footHtml = taskId 
            ? `${ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteTask('${taskId}')`})} 
               ${ui.component.btn({label:'複製', theme:'normal', action:`act.copyTask('${taskId}')`})} 
               ${ui.component.btn({label:'保存', theme:'correct', style:'flex:1;', action:'act.submitTask()'})}` 
            : ui.component.btn({label:'新增任務', theme:'correct', style:'width:100%;', action:'act.submitTask()'});

        ui.modal.render(taskId ? '編輯任務' : '新增任務', bodyHtml, footHtml, 'overlay');
        
        this.updateMatrixPreview();

        setTimeout(() => {
            const newScrollContainer = document.getElementById('cat-scroll-container');
            if (newScrollContainer) {
                if (typeof window.TempState.editScrollX === 'number') {
                    newScrollContainer.scrollLeft = window.TempState.editScrollX;
                } else {
                    const d = window.TempState.editingTask;
                    const activeBtn = document.getElementById(`cat-btn-${d.cat}`);
                    if (activeBtn) {
                        const scrollLeft = activeBtn.offsetLeft - (newScrollContainer.clientWidth / 2) + (activeBtn.clientWidth / 2);
                        newScrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
                }
            }
        }, 0);
    },

    updateField: function(field, val) {
        if (!window.TempState.editingTask) return;
        if (field === 'importance' || field === 'urgency') val = parseInt(val);
        window.TempState.editingTask[field] = val;

        if (field === 'importance' || field === 'urgency') {
            const valEl = document.getElementById(field === 'importance' ? 'val-imp' : 'val-urg');
            const lblEl = document.getElementById(field === 'importance' ? 'lbl-imp' : 'lbl-urg');
            if(valEl) valEl.innerText = val;
            if(lblEl) {
                const color = val >= 3 ? (val===4?'var(--color-danger)':'#ef6c00') : (val===2?'var(--color-info)':'var(--text-muted)');
                lblEl.style.color = color;
            }
            const box = document.getElementById('matrix-box');
            if(box) {
                const t = window.TempState.editingTask;
                let c = 'var(--text-muted)';
                if(t.importance>=3 && t.urgency>=3) c="var(--color-danger)";
                else if(t.importance>=3) c="var(--color-info)";
                else if(t.urgency>=3) c="#ef6c00";
                box.style.borderLeftColor = c;
            }
            this.updateMatrixPreview();
            return; 
        }
        if (['type', 'subRule'].includes(field)) setTimeout(() => this.renderCreateTaskForm(window.TempState.editingTask.id), 0);
    },

    togglePin: function() {
        if (!window.TempState.editingTask) return;
        const newState = !window.TempState.editingTask.pinned;
        window.TempState.editingTask.pinned = newState;
        const btn = document.getElementById('btn-pin-toggle');
        if(btn) btn.style.opacity = newState ? '1' : '0.3';
    },

    handleAddCategory: function() {
        if (window.act && window.act.addNewCategory) {
            act.addNewCategory(); 
            setTimeout(() => { if(window.TempState.editingTask) this.renderCreateTaskForm(window.TempState.editingTask.id); }, 0);
        }
    },

    updateCategory: function(cat) {
        if (!window.TempState.editingTask) return;
        const oldCat = window.TempState.editingTask.cat;
        window.TempState.editingTask.cat = cat;
        if (oldCat === '運動' || cat === '運動') setTimeout(() => this.renderCreateTaskForm(window.TempState.editingTask.id), 0);
        else {
            document.querySelectorAll('.modal .u-scroll-x button').forEach(btn => {
                btn.className = 'u-btn u-btn-sm u-btn-normal';
                btn.style.boxShadow = 'none';
            });
            const targetBtn = document.getElementById(`cat-btn-${cat}`);
            if(targetBtn) {
                targetBtn.className = 'u-btn u-btn-sm u-btn-correct';
                targetBtn.style.boxShadow = 'var(--shadow-inner)';
            }
        }
    },

    toggleSkill: function(skillName) {
        if (!window.TempState.editingTask) return;
        const t = window.TempState.editingTask;
        if (!t.attrs) t.attrs = [];
        const idx = t.attrs.indexOf(skillName);
        let isActive = false;
        if (idx === -1) {
            if (t.attrs.length >= 3) return act.toast("⚠️ 最多綁定 3 個技能");
            t.attrs.push(skillName);
            isActive = true;
        } else {
            t.attrs.splice(idx, 1);
            isActive = false;
        }
        const btn = document.getElementById(`skill-btn-${skillName}`);
        if (btn) {
            if (isActive) {
                btn.style.border = '1px solid var(--color-correct)';
                btn.style.background = 'var(--color-correct-soft)';
                btn.style.color = 'var(--color-correct-dark)';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.border = '1px solid var(--border)';
                btn.style.background = '';
                btn.style.color = '';
                btn.style.fontWeight = '';
                btn.style.opacity = '0.7';
            }
            btn.blur();
        }
    },

    updateMatrixPreview: function() {
        const t = window.TempState?.editingTask;
        const box = document.getElementById('matrix-tag-preview');
        if(box && t && window.TaskEngine) {
            const calcFunc = TaskEngine.previewRewards || TaskEngine.calculateRewards;
            
            if (typeof calcFunc === 'function') {
                const r = calcFunc(t.importance, t.urgency);
                let label = "🍂 雜務"; let color = "var(--text-muted)";
                if(t.importance>=3 && t.urgency>=3) { label="🔥 危機"; color="var(--color-danger)"; }
                else if(t.importance>=3) { label="💎 願景"; color="var(--color-info)"; }
                else if(t.urgency>=3) { label="⚡ 突發"; color="#ef6c00"; }
                box.innerHTML = `<span style="color:${color}; font-weight:bold; margin-right:5px;">${label}</span> <span style="color:var(--text-ghost);">💰${r.gold} ✨${r.exp}</span>`;
            } else {
                box.innerHTML = `<span style="color:var(--text-ghost);">預覽不可用</span>`;
            }
        }
    }
};