/* js/modules/task_view.js - V38.5 Separated (Full Form Logic) */
window.taskView = {
    // =========================================
    // 1. 主列表渲染 (Render Main List)
    // =========================================
    render: function(resetTab = false) {
        if (resetTab) window.TempState.taskTab = 'list';
        else if (!window.TempState.taskTab) window.TempState.taskTab = 'list';
        
        window.TempState.currentView = 'task';
        const page = document.getElementById('page-task');
        if (!page) return;
        
        // [關鍵優化 1] 獲取當前捲軸位置 (如果捲動容器存在)
        const scrollBox = document.getElementById('task-scroll-area');
        let currentScrollY = 0;
        if (scrollBox && !resetTab) {
            currentScrollY = scrollBox.scrollTop;
            window.TempState.mainListScrollY = currentScrollY;
        } else if (window.TempState.mainListScrollY) {
            currentScrollY = window.TempState.mainListScrollY;
        }

        const isList = window.TempState.taskTab === 'list';
        const headerHtml = ui.tabs.sliding('📋 任務列表', '🏆 榮譽成就', isList, "act.switchTaskTab('list')", "act.switchTaskTab('ach')");
        
        let contentHtml = '';

        if (isList) {
            // [A] 任務列表
            const userCats = (window.GlobalState.taskCats && window.GlobalState.taskCats.length > 0) ? window.GlobalState.taskCats.filter(c => c !== '全部') : ['每日', '運動', '工作'];
            const currentCat = window.TempState.filterCategory || '全部';
            const allCats = ['全部', ...userCats];
            
            const tasks = TaskEngine.getSortedTasks(currentCat);
            
            const filterArea = `<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;"><div style="flex:1; overflow:hidden;">${ui.container.bar(ui.tabs.scrollX(allCats, currentCat, "act.setTaskFilter"), 'width:100%;')}</div><div style="flex-shrink:0;">${ui.component.btn({ label:'📜 歷史', theme:'normal', size:'sm', action:"act.navigate('history')" })}</div></div>`;
            
            const listItems = tasks.length === 0 
                ? `<div style="text-align:center;color:#888;padding:40px;">📭 暫無任務</div>` 
                : `<div>${tasks.map(t => ui.card.task(t, false)).join('')}</div>`; 
            
            contentHtml = filterArea + `<div style="padding-bottom:100px;">${listItems}</div>`;

        } else {
            // [B] 成就列表
            if (window.achView && achView.renderList) {
                // [修改] 這裡的 hallBtn 根據你的需求，如果是空字串就保留空字串
                const hallBtn = ``; 
                // [修改] 移除 class="u-fade-in"
                contentHtml = hallBtn + `<div>${achView.renderList()}</div>`;
            } else {
                contentHtml = "<div>AchView module not loaded</div>";
            }
        }

        // FAB 按鈕
        const fabBg = !isList ? 'background:gold; border:none; color:#333;' : '';
        const fabAction = isList ? "act.editTask(null)" : "act.openCreateCustomAch()"; 
        const fabHtml = ui.component.btn({ label: '＋', theme: isList ? 'correct' : 'normal', style: `position:absolute; bottom:25px; right:25px; width:60px; height:60px; border-radius:50%; font-size:2rem; box-shadow:0 4px 12px rgba(0,0,0,0.4); z-index:10; ${fabBg}`, action: fabAction });
        
        // 寫入 DOM
        page.innerHTML = `<div style="display:flex; flex-direction:column; height:100%; position:relative; overflow:hidden;"><div style="flex-shrink:0; padding:10px 0;">${headerHtml}</div><div id="task-scroll-area" style="flex:1; overflow-y:auto; padding:0 10px; width:100%; box-sizing:border-box; scroll-behavior: auto;">${contentHtml}</div>${fabHtml}</div>`;
        
        // [關鍵優化 3] 同步瞬間恢復捲軸 (移除 setTimeout)
        // 使用 requestAnimationFrame 確保在瀏覽器繪製下一幀前設定好捲軸
        const newScrollBox = document.getElementById('task-scroll-area');
        if (newScrollBox) {
            newScrollBox.scrollTop = currentScrollY;
        }
    },

    // 歷史頁面 (保留)
    renderHistoryPage: function() { 
        const container = document.getElementById('page-history'); if(!container) return;
        const headerHtml = ui.container.bar(`<div style="display:flex; justify-content:space-between; align-items:center; width:100%;"><h2 style="margin:0; font-size:1.2rem; color:#5d4037;">📜 歷史紀錄</h2>${ui.component.btn({label:'↩ 返回', theme:'normal', size:'sm', action:"act.navigate('task')"})}</div>`, 'padding:15px; background:#f5f5f5; border-bottom:1px solid #e0e0e0; width:100%; box-sizing:border-box;');
        const history = window.GlobalState.history || [];
        const listHtml = history.length === 0 ? `<div style="text-align:center;color:#888;padding:50px;">📜 無歷史紀錄</div>` : `<div style="padding: 10px;">` + [...history].reverse().map(t => ui.card.task(t, true)).join('') + `</div>`;
        container.innerHTML = `<div style="height:100%; width:100%; overflow:hidden;">${ui.layout.scroller(headerHtml, listHtml, 'history-list-area')}</div>`;
    },

    // =========================================================================
    // 2. [補全] 編輯表單 (Edit Form) - 這是上次缺失的重要部分
    // =========================================================================
    renderCreateTaskForm: function(taskId) {
        const gs = window.GlobalState;
        
        // 外部導入數據處理
        if (window.TempState.importedTaskData) {
            window.TempState.editingTask = {
                ...window.TempState.importedTaskData,
                id: null,
                attrs: [], target: 10, pinned: false, calories: 0, deadline: '', subRule: 'all', recurrence: ''
            };
            window.TempState.importedTaskData = null;
            taskId = null;
        }

        // 記憶分類捲動位置
        const oldScrollBox = document.getElementById('cat-scroll-container');
        if (oldScrollBox) window.TempState.editScrollX = oldScrollBox.scrollLeft;

        const currentTemp = window.TempState.editingTask;
        
        // [邏輯確認] 
        // 由於 Controller 把 editingTask 設為 null 了，這裡的 currentTemp 就是 null
        // needInit 會變成 true，進而執行下方的預設值初始化
        const needInit = !currentTemp || (taskId && currentTemp.id !== taskId) || (taskId === null && currentTemp.id !== null);
        
        if (needInit) {
            if (taskId === null) {
                // 這裡會建立乾淨的預設值
                window.TempState.editingTask = { id: null, title: '', desc: '', importance: 2, urgency: 2, type: 'normal', attrs: [], cat: '每日', target: 10, subs: [], pinned: false, calories: 0, deadline: '', subRule: 'all', recurrence: '' };
            } else {
                const task = gs.tasks.find(t => t.id === taskId);
                if (task) window.TempState.editingTask = JSON.parse(JSON.stringify(task));
            }
        }
        
        const data = window.TempState.editingTask;
        if (!data.attrs) data.attrs = [];
        const isCount = data.type === 'count';

        // --- 表單 HTML 建構 ---
        let bodyHtml = `
        <div style="margin-bottom:15px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="flex:1;">
                    <label style="font-size:0.8rem; color:#888;">任務名稱</label>
                    ${ui.input.text(data.title, "要做什麼呢？", "taskView.updateField('title', this.value)")}
                </div>
                <div style="padding-top:20px;">
                    ${ui.component.btn({ id: 'btn-pin-toggle', label: '📌', theme: 'ghost', action: `taskView.togglePin()`, style: `font-size:1.4rem; padding:0 8px; opacity:${data.pinned ? '1' : '0.3'}; transition:all 0.2s;` })}
                </div>
            </div>
        </div>
        <div style="margin-bottom:15px;"><label style="font-size:0.8rem; color:#888;">詳細說明</label>${ui.input.textarea(data.desc, "備註...", "taskView.updateField('desc', this.value)")}</div>`;

        // 分類
        const defaultCats = ['每日', '運動', '工作'];
        const catButtons = (gs.taskCats && gs.taskCats.length > 0 ? gs.taskCats : defaultCats).map(c => {
            const isActive = data.cat === c;
            return `<button type="button" id="cat-btn-${c}" class="u-btn u-btn-sm ${isActive ? 'u-btn-correct' : 'u-btn-normal'}" 
                style="flex-shrink:0; margin-right:5px; border-radius:50px; padding:4px 12px; white-space:nowrap; ${isActive ? 'box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);' : ''}" 
                onclick="taskView.updateCategory('${c}')">${c}</button>`;
        }).join('');

        let caloriesInput = '';
        if (data.cat === '運動') {
            caloriesInput = `<div style="display:flex; align-items:center; gap:5px; background:#fff3e0; padding:2px 8px; border-radius:15px; border:1px solid #ffe0b2; margin-left:10px; flex-shrink:0;"><span style="font-size:0.9rem;">🔥</span>${ui.input.number(data.calories, "taskView.updateField('calories', parseInt(this.value)||0)", 4)}<span style="font-size:0.8rem; color:#f57c00;">Kcal</span></div>`;
        }

        bodyHtml += `
        <div style="margin-bottom:15px;">
            <label style="font-size:0.8rem; color:#888; margin-bottom:5px; display:block;">分類</label>
            <div style="display:flex; align-items:center; width:100%;">
                <div class="u-scroll-x" id="cat-scroll-container" style="flex:1; overflow-x:auto; display:flex; align-items:center; background:rgba(0,0,0,0.05); border-radius:30px; padding:4px;">
                    ${catButtons}
                </div>
                <div style="flex-shrink:0; display:flex; align-items:center;">
                    ${caloriesInput}
                    ${ui.component.btn({label:'+', size:'sm', theme:'normal', action:'taskView.handleAddCategory()', style:'margin-left:5px; height:32px; width:32px; padding:0; border-radius:50%;'})}
                </div>
            </div>
        </div>`;

        let rightSettingHtml = !isCount ? 
            `<div style="display:flex; gap:10px;"><label style="display:flex; align-items:center;"><input type="radio" ${data.subRule==='all'?'checked':''} onclick="taskView.updateField('subRule', 'all')"><span style="margin-left:4px; font-size:0.8rem;">全部</span></label><label style="display:flex; align-items:center;"><input type="radio" ${data.subRule==='any'?'checked':''} onclick="taskView.updateField('subRule', 'any')"><span style="margin-left:4px; font-size:0.8rem;">擇一</span></label></div>` : 
            `<div style="display:flex; align-items:center; gap:5px;">${ui.input.number(data.target, "taskView.updateField('target', this.value)", 2)}<span style="font-size:0.9rem;">次</span></div>`;

        bodyHtml += `
        <div class="u-box" style="padding:10px; margin-bottom:15px; background:#f9f9f9; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; background:#eee; border-radius:20px; padding:2px;">
                    ${ui.component.pillBtn({label:'📝 一般', theme:!isCount?'correct':'ghost', action:"taskView.updateField('type', 'normal')"})}
                    ${ui.component.pillBtn({label:'🔢 計次', theme:isCount?'correct':'ghost', action:"taskView.updateField('type', 'count')"})}
                </div>
                ${rightSettingHtml}
            </div>
            ${!isCount ? `
            <div style="margin-top:10px; border-top:1px dashed #ddd; padding-top:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="font-size:0.85rem; font-weight:bold; color:#666;">🔨 子任務</div>
                    <button type="button" class="u-btn u-btn-sm u-btn-paper" onclick="act.addSubtask()">+ 新增步驟</button>
                </div>
                ${(data.subs || []).map((s, i) => `
                <div style="display:flex; gap:5px; margin-bottom:5px; align-items:center;">
                    ${ui.input.text(s.text, `步驟 ${i+1}`, `act.updateSubtaskText(${i}, this.value)`)}
                    <button type="button" class="u-btn u-btn-ghost u-btn-sm" style="color:#d32f2f;" onclick="act.removeSubtask(${i})">✕</button>
                </div>`).join('')}
            </div>` : ''}
        </div>`;

        // 技能
        const skillHtml = (gs.skills || []).map(s => {
            const active = data.attrs.includes(s.name);
            const style = active ? 'border:1px solid #4caf50; background:#e8f5e9; color:#2e7d32; font-weight:bold;' : 'border:1px solid #ccc; opacity:0.7;';
            return `<button type="button" class="u-btn u-btn-sm" id="skill-btn-${s.name}" style="${style} margin-right:5px; margin-bottom:5px; border-radius:12px;" onclick="taskView.toggleSkill('${s.name}')"> ${window.GlobalState.attrs?.[s.parent]?.icon || '❓'} ${s.name}</button>`;
        }).join('');
        bodyHtml += `<div style="margin-bottom:15px;"><label style="font-size:0.8rem; color:#888;">📚 綁定技能</label><div class="u-box" style="padding:10px; background:#fff; border:1px solid #e0e0e0; border-radius:8px; display:flex; flex-wrap:wrap; min-height:50px;">${skillHtml || '<span style="color:#888;font-size:0.8rem; width:100%; text-align:center;">無可用技能，請至屬性頁新增</span>'}</div></div>`;

        // 矩陣 & 日期
        const getLabelColor = (val) => val >= 3 ? (val===4?'#d32f2f':'#ef6c00') : (val===2?'#1976d2':'#555');
        let borderSideColor = '#757575'; 
        if(data.importance>=3 && data.urgency>=3) borderSideColor="#d32f2f"; else if(data.importance>=3) borderSideColor="#0288d1"; else if(data.urgency>=3) borderSideColor="#ef6c00";
        
        bodyHtml += `<div id="matrix-box" class="u-box" style="padding:10px; margin-bottom:15px; border-left: 4px solid ${borderSideColor}; background:#fff; transition: border-left-color 0.3s ease;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="font-weight:bold; font-size:0.9rem;">📊 價值評估</span><div id="matrix-tag-preview" style="font-size:0.85rem; color:#666;">...</div></div>
            <div style="margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#666;"><span id="lbl-imp" style="color:${getLabelColor(data.importance)}; font-weight:bold;">重要性</span> <b id="val-imp">${data.importance}</b></div><input type="range" min="1" max="4" value="${data.importance}" style="width:100%; accent-color:#0288d1;" oninput="taskView.updateField('importance', parseInt(this.value));"></div>
            <div><div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#666;"><span id="lbl-urg" style="color:${getLabelColor(data.urgency)}; font-weight:bold;">緊急性</span> <b id="val-urg">${data.urgency}</b></div><input type="range" min="1" max="4" value="${data.urgency}" style="width:100%; accent-color:#d32f2f;" oninput="taskView.updateField('urgency', parseInt(this.value));"></div>
        </div>`;

        const commonInputStyle = "width:100%; height:40px; padding:0 8px; border-radius:8px; border:1px solid #ccc; background:#fff; box-sizing:border-box; font-size:0.9rem;";
        const recurrenceOpts = [{val:'', label:'不重複'}, {val:'daily', label:'每天'}, {val:'weekly', label:'每週'}, {val:'monthly', label:'每月'}, {val:'yearly', label:'每年'}];
        bodyHtml += `<div style="margin-bottom:15px; display:flex; gap:10px; align-items:flex-end;"><div style="flex: 1 1 0; min-width: 0;"> <label style="font-size:0.8rem; color:#888; display:block; margin-bottom:4px;">📅 到期時間</label> <input type="datetime-local" class="inp" value="${data.deadline||''}" onchange="taskView.updateField('deadline', this.value)" style="${commonInputStyle}"> </div><div style="flex: 1 1 0; min-width: 0;"> <label style="font-size:0.8rem; color:#888; display:block; margin-bottom:4px;">🔄 循環</label> <select onchange="taskView.updateField('recurrence', this.value)" style="${commonInputStyle} outline:none;">${recurrenceOpts.map(o => `<option value="${o.val}" ${o.val===(data.recurrence||'')?'selected':''}>${o.label}</option>`).join('')}</select> </div></div>`;

        const footHtml = taskId ? `${ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteTask('${taskId}')`})} ${ui.component.btn({label:'複製', theme:'normal', action:`act.copyTask('${taskId}')`})} ${ui.component.btn({label:'保存', theme:'correct', style:'flex:1;', action:'act.submitTask()'})}` : ui.component.btn({label:'新增任務', theme:'correct', style:'width:100%;', action:'act.submitTask()'});

        ui.modal.render(taskId ? '編輯任務' : '新增任務', bodyHtml, footHtml, 'overlay');
        
        // 渲染完後立刻更新預覽
        this.updateMatrixPreview();

        // 自動捲動到分類
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
                const color = val >= 3 ? (val===4?'#d32f2f':'#ef6c00') : (val===2?'#1976d2':'#555');
                lblEl.style.color = color;
            }
            const box = document.getElementById('matrix-box');
            if(box) {
                const t = window.TempState.editingTask;
                let c = '#757575';
                if(t.importance>=3 && t.urgency>=3) c="#d32f2f";
                else if(t.importance>=3) c="#0288d1";
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
            setTimeout(() => { if(window.TempState.editingTask) this.renderCreateTaskForm(window.TempState.editingTask.id); }, 500);
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
                targetBtn.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
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
                btn.style.border = '1px solid #4caf50';
                btn.style.background = '#e8f5e9';
                btn.style.color = '#2e7d32';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.border = '1px solid #ccc';
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
                let label = "🍂 雜務"; let color = "#757575";
                if(t.importance>=3 && t.urgency>=3) { label="🔥 危機"; color="#d32f2f"; }
                else if(t.importance>=3) { label="💎 願景"; color="#0288d1"; }
                else if(t.urgency>=3) { label="⚡ 突發"; color="#ef6c00"; }
                box.innerHTML = `<span style="color:${color}; font-weight:bold; margin-right:5px;">${label}</span> <span style="color:#aaa;">💰${r.gold} ✨${r.exp}</span>`;
            } else {
                box.innerHTML = `<span style="color:#aaa;">預覽不可用</span>`;
            }
        }
    }
};

// 安全橋接 (保留舊版行為)
window.view = window.view || {};
Object.assign(window.view, window.taskView);