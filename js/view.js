// =============================================================================
// js/view.js - V42.0 UI Library (Clean, Optimized & Componentized)
// =============================================================================

window.ui = window.ui || {};
window.view = window.view || {};
window.act = window.act || {};

window.ui = {
    // =============================================================================
    // 1. 原子元件 (Atoms)
    // =============================================================================
    component: {
        btn: (opts) => {
            const themeClass = { 'correct': 'u-btn-correct', 'danger': 'u-btn-danger', 'normal': 'u-btn-normal', 'ghost': 'u-btn-ghost', 'paper': 'u-btn-paper' }[opts.theme] || 'u-btn-normal';
            const sizeClass = opts.size ? `u-btn-${opts.size}` : '';
            const action = opts.disabled ? '' : (opts.action ? `onclick="${opts.action}"` : '');
            return `<button ${opts.id ? `id="${opts.id}"` : ''} class="u-btn ${themeClass} ${sizeClass}" style="${opts.style || ''}" ${action} ${opts.disabled ? 'disabled' : ''}>
                ${opts.icon ? `<span style="margin-right:4px;">${opts.icon}</span>` : ''}${opts.label||''}
            </button>`;
        },
        
        pillBtn: (opts) => ui.component.btn({ ...opts, size: opts.size || 'sm', style: `border-radius: 50px; padding: 4px 12px; white-space: nowrap; ${opts.style||''}` }),

        pill: (text, color, id, type = 'solid') => {
            let style = type === 'solid' ? `background: ${color}; color: #fff; border: none;` :
                        type === 'hollow' ? `border: 1px solid ${color}; color: ${color}; background: transparent; padding: 1px 6px; font-size: 0.75rem;` :
                        `border-color: ${color}; color: ${color}; background: rgba(0,0,0,0.05);`;
            return `<span ${id ? `id="${id}"` : ''} class="u-pill" style="${style}">${text}</span>`;
        },
        
        avatar: (id, action, imgContent) => `<div id="${id}" class="u-avatar" ${action ? `onclick="${action}" style="cursor:pointer;"` : ''}>${imgContent}</div>`,

        sprite: ({ src, action, width='auto', height='auto', style='', id }) => 
            `<img ${id ? `id="${id}"` : ''} src="${src}" ${action ? `onclick="${action}"` : ''} class="u-sprite" style="display:block; object-fit:contain; -webkit-user-drag: none; width:${width}; height:${height}; ${action ? 'cursor:pointer;' : 'cursor:default;'} ${style}">`,
        
        segment: (options, currentVal, onAction) => options.map(opt => {
            const isActive = currentVal === opt.val;
            return ui.component.pillBtn({ 
                label: opt.label, 
                theme: isActive ? 'correct' : 'normal', 
                style: `flex:1; margin:2px; ${isActive ? 'box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);' : ''}`, 
                action: onAction.includes('(') ? onAction : `${onAction}('${opt.val}')` 
            });
        }).join(''),

        badge: (text, colorVar = '--text-muted', bgVar = '--bg-box') => 
            `<span style="display:inline-flex; align-items:center; padding:2px 8px; border-radius:var(--radius-full); font-size:0.7rem; font-weight:700; color:var(${colorVar}); background:var(${bgVar}); border:1px solid var(${colorVar}); opacity:0.8;">${text}</span>`
    },

    // =============================================================================
    // 2. 容器 (Containers)
    // =============================================================================
    container: {
        box: (content, style='') => `<div class="u-box" style="${style}">${content}</div>`,
        bar: (content, style='') => `<div class="u-bar" style="${style}">${content}</div>`
    },

    // =============================================================================
    // 3. 佈局模板 (Layouts)
    // =============================================================================
    layout: {
        page: (opts) => {
            const backBtnHtml = opts.back ? ui.component.btn({ label: '返回', icon: '↵', theme: 'normal', action: typeof opts.back === 'string' ? opts.back : "act.navigate('main')", style: 'padding: 6px 12px; font-size:0.9rem; border-radius:8px;' }) : '';
            const headerBgStyle = opts.headerBg ? `background:${opts.headerBg}; border-bottom:1px solid var(--border);` : `background:transparent;`;
            
            return `<div style="display:flex; flex-direction:column; height:100%; overflow:hidden; background:var(--bg-panel);">
                <div style="flex-shrink:0; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 15px; ${headerBgStyle}">
                    <div style="font-size:1.2rem; font-weight:bold; color:var(--text);">${opts.title || ''}</div>
                    ${backBtnHtml}
                </div>
                ${opts.fixedTop ? `<div style="flex-shrink:0;">${opts.fixedTop}</div>` : ''}
                <div style="flex:1; overflow-y:auto; overflow-x:hidden; position:relative; z-index:10; padding-bottom: 20px;">${opts.body || ''}</div>
                ${opts.footer ? `<div style="flex-shrink:0; padding:10px;">${opts.footer}</div>` : ''}
            </div>`;
        },

        flexRow: (content, gap='10px', justify='space-between') => `<div style="display:flex; align-items:center; justify-content:${justify}; gap:${gap}; width:100%;">${content}</div>`,
        grid: (content, cols='2', gap='10px') => `<div style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:${gap}; width:100%;">${content}</div>`,

        scrollX: (options, currentVal, actionName) => {
            const buttons = options.map(opt => ui.component.pillBtn({ label: opt, theme: opt === currentVal ? 'normal' : 'ghost', style: 'flex-shrink:0;', action: `${actionName}('${opt}')` })).join('');
            // 使用 .u-scroll-list 取代原本的 inline style
            return `<div class="u-scroll-list" style="-webkit-overflow-scrolling:touch;">${buttons}</div>`;
        },

        drawer: (isOpen, contentHtml, onToggle, opts = {}) => {
            const bgColor = opts.color || '#222';
            const dir = opts.dir || 'bottom';
            const isFixedHandle = opts.fixedHandle || false; 
            const wrapperStyle = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 200; pointer-events: none; overflow: hidden;`;
            let handleBaseStyle = `background: ${bgColor}; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; box-shadow: var(--shadow-sm); user-select: none; width: 60px; height: 40px; border-radius: 8px 8px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none; pointer-events: auto; z-index: 202;`;
            let drawerBaseStyle = `position: absolute; background: ${bgColor}; box-shadow: var(--shadow-lg); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: auto; display: flex; flex-direction: column; z-index: 201; overflow: visible;`;
            
            let finalHandleStyle = handleBaseStyle + 'position: absolute; right: 0; ';
            let finalDrawerStyle = drawerBaseStyle;

            if (dir === 'right') {
                finalDrawerStyle += `bottom: 0; right: 0; width: 100%; height: 220px; transform: translateX(${isOpen ? '0%' : '100%'}); border-top: 2px solid rgba(255,255,255,0.1);`;
                finalHandleStyle += isFixedHandle ? `bottom: 220px;` : `bottom: 100%;`; 
            } else {
                const h = opts.height || '35%';
                finalDrawerStyle += `bottom: 0; left: 0; width: 100%; height: ${h}; transform: translateY(${isOpen ? '0%' : '100%'}); border-top: 1px solid rgba(255,255,255,0.1);`;
                finalHandleStyle += isFixedHandle ? `bottom: ${h};` : `bottom: 100%;`;
            }

            const icon = isOpen ? (opts.iconOpen || '▼') : (opts.iconClose || '▲');
            const handleHtml = `<div onclick="event.preventDefault(); event.stopPropagation(); ${onToggle}" style="${finalHandleStyle}">${icon}</div>`;
            const bodyContent = `<div style="width:100%; height:100%; overflow-y:auto; padding:15px; box-sizing:border-box;">${contentHtml}</div>`;
            
            return isFixedHandle 
                ? `<div class="u-drawer-wrapper" style="${wrapperStyle}">${handleHtml}<div class="u-drawer-body" style="${finalDrawerStyle}">${bodyContent}</div></div>`
                : `<div class="u-drawer-wrapper" style="${wrapperStyle}"><div class="u-drawer-body" style="${finalDrawerStyle}">${handleHtml}${bodyContent}</div></div>`;
        },
        
        scroller: (header, body, id='') => `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; overflow:hidden; position:relative;">
                <div style="flex-shrink:0; z-index:2;">${header}</div>
                <div id="${id}" style="flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; padding-bottom:80px;">${body}</div>
            </div>`,

        pageHeader: (title, rightHtml = '') => 
            `<div style="display:flex; align-items:center; justify-content:space-between; padding:12px 15px; background:var(--bg-card, #fff); border-bottom:1px solid var(--border, #e5e7eb); flex-shrink:0;">
                <div style="font-weight:800; font-size:1.1rem; color:var(--text);">${title}</div>
                <div>${rightHtml}</div>
            </div>`,

        empty: (text = '暫無資料', icon = '📭') => 
            // 使用 .ui-empty 與 .ui-empty-icon
            `<div class="ui-empty">
                <div class="ui-empty-icon">${icon}</div>
                ${text}
            </div>`,

        filterBar: (cats, currentCat, action, rightHtml = '') => 
            `<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <div style="flex:1; overflow:hidden;">
                    ${ui.container.bar(ui.layout.scrollX(cats, currentCat, action), 'width:100%;')}
                </div>
                ${rightHtml ? `<div style="flex-shrink:0;">${rightHtml}</div>` : ''}
            </div>`
    },

    // =============================================================================
    // 4. 輸入元件 (Inputs)
    // =============================================================================
    input: {
        text: (val, placeholder, onInput, id) => `<input type="text" id="${id||''}" class="inp" value="${val||''}" placeholder="${placeholder||''}" oninput="${onInput}">`,

        number: (val, onInput, digit=4, id) => `<input type="text" inputmode="numeric" pattern="[0-9]*" id="${id||''}" class="inp inp-num" value="${val !== undefined ? val : ''}" maxlength="${digit}" style="width: 100px; text-align:center; font-weight:bold; letter-spacing:1px;" oninput="this.value=this.value.replace(/[^0-9]/g,''); ${onInput}">`,
        
        textarea: (val, placeholder, onInput, id) => `<textarea id="${id||''}" class="inp" rows="3" placeholder="${placeholder||''}" oninput="${onInput}">${val||''}</textarea>`,

        datetime: (val, onChange, id) => `<input type="datetime-local" id="${id||''}" class="inp" value="${val||''}" onchange="${onChange}" style="width:100%;">`,

        select: (options, currentVal, onChange, id) => {
            const optsHtml = options.map(opt => `<option value="${opt.val||opt.value}" ${ (opt.val||opt.value) == currentVal ? 'selected' : ''}>${opt.label}</option>`).join('');
            return `<select id="${id||''}" onchange="${onChange}" style="width:100%; padding:8px; border-radius:8px; border:1px solid var(--border-input); background:var(--bg-input); outline:none; font-size:0.9rem;">${optsHtml}</select>`;
        },

        // 修復：不再使用 Regex 吃字，原汁原味輸出 label
        toggleRow: ({ id, label, icon = '', checked, onChange, locked = false }) => {
            if (locked) {
                return `
                <div style="padding:12px; color:var(--text-ghost); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                    <span style="display:flex; align-items:center; gap:5px;">${icon ? icon + ' ' : ''}🔒 ${label}</span>
                    <span style="font-size:0.8rem; background:var(--bg-box); padding:2px 8px; border-radius:var(--radius-sm);">未解鎖</span>
                </div>`;
            }
            return `
            <div class="u-toggle-row ${checked ? 'on' : ''}" onclick="const c=this.querySelector('input'); c.checked=!c.checked; c.dispatchEvent(new Event('change')); this.classList.toggle('on');">
                <div class="toggle-track"></div>
                ${icon ? `<div style="font-size:1.2rem; margin-left:8px;">${icon}</div>` : ''}
                <div class="toggle-label">${label}</div>
                <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} onchange="${onChange}" style="display:none;" onclick="event.stopPropagation();">
            </div>`;
        },

        field: (label, inputHtml, hint = '') => 
            `<div class="input-group">
                <label class="section-title">${label}</label>
                ${inputHtml}
                ${hint ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${hint}</div>` : ''}
            </div>`
    },

    // =============================================================================
    // 5. 進度元件 
    // =============================================================================
    progress: {
        bar: (curr, max, label, customStyle) => {
            const pct = Math.min(100, Math.max(0, (curr / max) * 100));
            const displayText = label || `${curr} / ${max}`;
            return `
            <div class="u-progress" style="${customStyle||''}">
                <div class="u-progress-bar" style="width:${pct}%;"></div>
                <div class="u-progress-text">${displayText}</div>
            </div>`;
        },
        
        stepWizard: (currStep, totalSteps) => {
            let html = '<div style="display:flex; align-items:center; justify-content:space-between; width:100%; margin-top:8px;">';
            for (let i = 1; i <= totalSteps; i++) {
                let ballColor = i <= currStep ? 'var(--color-correct)' : 'rgba(0,0,0,0.1)';
                html += `<div style="width:12px; height:12px; background:${ballColor}; border-radius:50%; flex-shrink:0; z-index:2; transition:background 0.3s;"></div>`;
                if (i < totalSteps) {
                    let lineColor = i < currStep ? 'var(--color-correct)' : 'rgba(0,0,0,0.1)';
                    html += `<div style="flex:1; height:4px; background:${lineColor}; margin:0 -2px; z-index:1; transition:background 0.3s;"></div>`;
                }
            }
            return html + '</div>';
        }
    },

    // =============================================================================
    // 6. 智能卡片系統 (Cards)
    // =============================================================================
    card: {
        row: (opts) => {
            const borderStyle = opts.themeColor ? `border-left-color: ${opts.themeColor};` : '';
            return `
            <div class="std-card" ${opts.onClick ? `onclick="${opts.onClick}"` : ''} style="flex-direction:row; justify-content:space-between; ${borderStyle} ${opts.style||''}">
                <div class="card-icon">${opts.iconHtml || '📄'}</div>
                
                <div class="card-col-center">
                    <div style="font-weight:bold; font-size:1rem; color:var(--text); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${opts.title}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${opts.subTitle || ''}</div>
                </div>
                <div style="flex-shrink:0;">${opts.rightHtml || ''}</div>
            </div>`;
        },

        task: (t, isHistory = false) => {
            let leftHtml = '';
            const checkboxStyle = "width:24px; height:24px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer; margin-right:12px; background:var(--bg-card); transition:all 0.2s;";
            
            if (isHistory) {
                const isSuccess = t.status === 'success' || t.done;
                const color = isSuccess ? 'var(--color-correct)' : 'var(--color-danger)';
                const icon = isSuccess ? '✓' : '✕';
                leftHtml = `<div style="font-size:1.4rem; color:${color}; width:24px; text-align:center; font-weight:bold; flex-shrink:0; margin-right:12px;">${icon}</div>`;
            } else {
                leftHtml = `
                <div class="chk ${t.done?'checked':''}" 
                     style="${checkboxStyle}" 
                     onclick="event.stopPropagation(); act.toggleTask('${t.id}')">
                     ${t.done ? '<span style="font-size:16px; font-weight:bold;">✓</span>' : ''}
                </div>`;
            }

            let badges = '';
            if (t.importance >= 3) badges += ui.component.pill('🔥', '#ef6c00', '', 'hollow');
            if (t.urgency >= 3) badges += ui.component.pill('⚡', 'var(--color-danger)', '', 'hollow');
            if (t.recurrence) badges += ui.component.pill('🔁', 'var(--color-info)', '', 'hollow');
            let skillIcons = (t.attrs && t.attrs.length > 0) ? `<span style="font-size:0.9rem; margin-left:4px; opacity:0.8;">${t.attrs.map(a => '💪').join('')}</span>` : '';
            const pinHtml = t.pinned ? `<span style="margin-left:auto; font-size:1rem; color:#5d4037;">📌</span>` : `<span style="margin-left:auto;"></span>`;

            const titleRow = `
                <div style="display:flex; align-items:center; gap:6px; width:100%;">
                    <span class="task-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60%; font-weight:bold; color:var(--text);">${t.title}</span>
                    ${badges} ${skillIcons} ${pinHtml}
                </div>`;
            
            let progressRow = '';
            if (!isHistory) { 
                let innerContent = '';
                if (t.type === 'count') {
                    innerContent = ui.progress.bar(t.curr, t.target);
                } else if (t.subs && t.subs.length > 0) {
                    const doneCount = t.subs.filter(s => s.done).length;
                    innerContent = ui.progress.stepWizard(doneCount, t.subs.length);
                }
                
                if (innerContent) {
                    progressRow = `<div style="margin-top:6px; width:100%; cursor:default;" onclick="event.stopPropagation();">${innerContent}</div>`;
                }
            }
            
            const rightHtml = isHistory 
                ? '' 
                : ui.component.btn({ 
                    label:'⚙️', theme:'ghost', action:`event.stopPropagation(); act.editTask('${t.id}')`, style:'padding:0 5px; color:var(--text-ghost); flex-shrink:0;' 
                  });

            let subtaskHtml = '';
            
            if (t.type === 'count') {
                subtaskHtml = `
                <div style="margin-top:8px; border-top:1px dashed var(--border); padding-top:8px; display:flex; justify-content:space-between; align-items:center; cursor:default;" onclick="event.stopPropagation();">
                    <span style="font-weight:bold; color:var(--color-gold-dark);">目前進度: ${t.curr} / ${t.target}</span>
                    <button class="u-btn u-btn-sm u-btn-correct" onclick="event.stopPropagation(); act.incrementTask('${t.id}')">
                        +1 次數
                    </button>
                </div>`;
            } 
            else if (t.subs && t.subs.length > 0) {
                subtaskHtml = `<div style="margin-top:8px; border-top:1px dashed var(--border); padding-top:8px; cursor:default;" onclick="event.stopPropagation();">`;
                t.subs.forEach((sub, idx) => {
                    const isSubDone = sub.done;
                    const textStyle = isSubDone ? 'text-decoration:line-through; color:var(--text-ghost);' : 'color:var(--text-muted);';
                    subtaskHtml += `
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; cursor:pointer; padding:6px 4px; border-radius:4px; transition:background 0.2s;" 
                         onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'" onclick="event.stopPropagation(); act.toggleSubtask('${t.id}', ${idx})">
                        <div class="chk ${isSubDone?'checked':''}" style="width:18px; height:18px; border:1px solid ${isSubDone?'var(--color-correct)':'var(--text-ghost)'}; border-radius:4px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${isSubDone ? '<span style="color:#fff; font-size:12px; font-weight:bold;">✓</span>' : ''}
                        </div>
                        <div style="font-size:0.9rem; ${textStyle} flex:1; user-select:none;">${sub.text}</div>
                    </div>`;
                });
                subtaskHtml += `</div>`;
            }

            const dateValue = isHistory ? (t.finishTime || '未知') : (t.deadline || '');
            const dateDisplay = dateValue ? `<div style="text-align:right; font-size:0.8rem; color:var(--text-ghost); margin-top:8px;">📅 ${dateValue}</div>` : '';
            const isExpanded = window.TempState && window.TempState.expandedTaskId === t.id;
            const expandStyle = isExpanded ? 'display:block;' : 'display:none;';

            return `
            <div class="task-card ${t.done?'status-done':''}" onclick="view.toggleCardExpand('${t.id}')">
                <div class="task-main-row"> 
                    ${leftHtml}
                    <div class="task-content">
                        ${titleRow}
                        ${progressRow} 
                    </div>
                    <div>${rightHtml}</div>
                </div>
                <div id="expand-${t.id}" style="${expandStyle} padding-top:10px; margin-top:10px; font-size:0.9rem; border-top:1px dashed var(--border); color:var(--text-muted); padding-left: 36px;">
                    ${t.desc ? `<div style="margin-bottom:8px; line-height:1.4;">${t.desc}</div>` : ''} 
                    ${subtaskHtml}
                    ${dateDisplay}
                </div>
            </div>`;
        },

        poster: (opts) => {
            const badgeHtml = opts.badge ? `<span style="background:${opts.border}; color:#000; padding:2px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">${opts.badge}</span>` : '';
            return `
            <div onclick="${opts.onClick||''}" style="flex:1; border:2px solid ${opts.border}; border-radius:10px; padding:15px; background:${opts.bg}; text-align:left; position:relative; min-height:160px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h3 style="margin:0; color:${opts.color}; font-size:1.1rem;">${opts.title}</h3>
                        ${badgeHtml}
                    </div>
                    <p style="font-size:0.9rem; color:#555; margin-bottom:15px; line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${opts.desc}</p>
                </div>
                <div style="font-size:1.4rem; font-weight:bold; color:${opts.color}; text-align:right;">${opts.price}</div>
            </div>`;
        },

        vertical: (opts) => {
            const mediaHtml = opts.imgPath 
                ? `<div class="card-img-area"><img src="${opts.imgPath}" style="height:80px; object-fit:contain;"></div>` 
                : (opts.iconHtml ? `<div class="card-img-area" style="font-size:3rem;">${opts.iconHtml}</div>` : '');
            
            return `
            <div class="card-vertical" style="${opts.style||''}" onclick="${opts.onClick||''}">
                ${mediaHtml}
                <div class="card-info-area" style="text-align:center; margin-bottom:10px;">
                    <div style="font-weight:bold; color:var(--text);">${opts.title}</div>
                    ${opts.subTitle !== undefined ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px; font-weight:bold;">${opts.subTitle}</div>` : ''}
                    ${opts.stock !== undefined ? `<div style="font-size:0.75rem; color:var(--text-ghost); margin-top:2px;">庫存: ${opts.stock}</div>` : ''}
                </div>
                <div style="width:100%;">
                    ${opts.actionBtnHtml || '<button class="u-btn u-btn-normal" style="width:100%;">購買</button>'}
                </div>
            </div>`;
        }
    },

    // =============================================================================
    // 6. 視窗工廠 (Modals)
    // =============================================================================
    modal: {
        layers: { 'panel': 'm-panel', 'overlay': 'm-overlay', 'system': 'm-system', 'quick': 'm-panel' },
        
        render: (title, bodyHtml, footHtml, layer = 'overlay') => {
            const targetId = ui.modal.layers[layer] || ui.modal.layers['overlay'];
            let modal = document.getElementById(targetId);
            if (!modal) {
                modal = document.createElement('div'); modal.id = targetId; modal.className = 'mask';
                modal.style.zIndex = layer === 'system' ? '9999' : (layer === 'overlay' ? '9500' : '9000');
                modal.innerHTML = `<div class="modal"><div class="m-head"><span class="m-title"></span>${ui.component.btn({ label:'✕', theme:'ghost', style:'padding:0 8px; border:none;', action:`ui.modal.close('${targetId}')` })}</div><div class="m-body"></div><div class="m-foot"></div></div>`;
                document.body.appendChild(modal);
            }
            modal.querySelector('.m-title').innerText = title; 
            modal.querySelector('.m-body').innerHTML = bodyHtml;
            const foot = modal.querySelector('.m-foot'); 
            if (footHtml) { foot.innerHTML = footHtml; foot.style.display = 'flex'; } else { foot.style.display = 'none'; }
            
            modal.style.display = 'flex'; 
            requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('active')));
        },
        
        close: (id) => {
            const modal = document.getElementById(id || 'm-overlay');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => { if(!modal.classList.contains('active')) modal.style.display = 'none'; }, 200);
            }
        },

        footRow: (cancelAction, confirmAction, confirmLabel = '確定', confirmTheme = 'correct', cancelLabel = '取消') => 
            `${ui.component.btn({label:cancelLabel, theme:'ghost', style:'flex:1;', action:cancelAction})}
             ${ui.component.btn({label:confirmLabel, theme:confirmTheme, style:'flex:2;', action:confirmAction})}`,

        centeredBody: (icon, title, desc, extraHtml = '') => `
            <div style="text-align:center; padding:10px;">
                <div style="font-size:3.5rem; margin-bottom:10px; filter:drop-shadow(var(--shadow-sm));">${icon}</div>
                <h3 style="color:var(--text); margin-bottom:5px;">${title}</h3>
                ${desc ? `<p style="color:var(--text-muted); font-size:0.9rem;">${desc}</p>` : ''}
                ${extraHtml ? `<div style="margin-top:15px;">${extraHtml}</div>` : ''}
            </div>`
    }
};


// =============================================================================
// 7. 全域橋接 (Bridge) & 工具函式
// =============================================================================
if (window.EventBus) {
    window.EventBus.on(window.EVENTS.System.MODAL_CLOSE, (layerName) => {
        const map = { 'panel': 'm-panel', 'overlay': 'm-overlay', 'system': 'm-system' };
        const targetId = map[layerName] || layerName || 'm-overlay';
        ui.modal.close(targetId); 
    });
};

view.getPriorityInfo = (importance, urgency) => {
    if (importance >= 3 && urgency >= 3) return { color: 'var(--color-danger)', label: '🔥 危機', border: 'var(--color-danger)' };
    if (importance >= 3) return { color: 'var(--color-info)', label: '💎 願景', border: 'var(--color-info)' };
    if (urgency >= 3) return { color: '#ef6c00', label: '⚡ 突發', border: '#ef6c00' };
    return { color: 'var(--text-muted)', label: '🍂 雜務', border: 'var(--text-muted)' };
};

view.toggleCardExpand = function(id) {
    if (!window.TempState) return;
    if (window.TempState.expandedTaskId === id) {
        window.TempState.expandedTaskId = null;
    } else {
        window.TempState.expandedTaskId = id;
    }
    if (window.taskView && taskView.render) taskView.render();
};

view.showToast = (msg) => {
    const old = document.querySelector('.u-toast'); if(old) old.remove();
    const toast = document.createElement('div'); 
    toast.className = 'u-toast'; 
    toast.innerHTML = msg;       
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 300); 
    }, 2000);
};
act.toast = view.showToast;

// ✅ [Bug 2 修復] 訂閱全域 TOAST 事件，讓 Engine 層的通知能被顯示
if (window.EventBus && window.EVENTS) {
    window.EventBus.on(window.EVENTS.System.TOAST, (msg) => view.showToast(msg));
}

window.view.renderSystemModal = (type, msg, defVal = '') => {
    let title = '系統提示';
    let body = `<div style="padding:20px; font-size:1.1rem; color:var(--text); text-align:center;">${msg}</div>`;
    let foot = '';
    
    if (type === 'alert') {
        title = '⚠️ 提示';
        foot = ui.component.btn({label:'確定', theme:'normal', style:'width:100%;', action:"ui.modal.close('m-system')"});
    } else if (type === 'confirm') {
        title = '❓ 確認';
        foot = ui.modal.footRow("act.handleSysConfirm(false)", "act.handleSysConfirm(true)");
    } else if (type === 'prompt') {
        title = '✏️ 輸入';
        body += `<div style="padding:0 20px;">${ui.input.text(defVal, '', '', 'sys-univ-input')}</div>`;
        foot = ui.modal.footRow("ui.modal.close('m-system')", "act.handleSysConfirm('prompt_submit')");
    }
    ui.modal.render(title, body, foot, 'system');
};

// ==========================================
// [Part 3] Implementation (具體渲染邏輯)
// ==========================================
view.initHUD = (data) => {
    let container = document.getElementById('hud');
    if (!container) {
        container = document.createElement('div');
        container.id = 'hud';
        document.getElementById('app-frame').appendChild(container);
    }

    container.innerHTML = `
        <div class="hud-left">
            ${ui.component.avatar('hud-avatar', "act.navigate('stats')", '⏳')}
            <div class="hud-info">
                <div id="hud-name" class="hud-name">---</div>
                <div class="hud-lv-row">
                    <div class="hud-lv-txt">Lv.<span id="hud-lv">1</span></div>
                    <div id="hud-exp-container" style="flex:1"></div>
                </div>
            </div>
        </div>
        <div class="hud-right">
            <div class="res-row" onclick="act.openPayment()" style="display:flex; gap:4px; cursor:pointer;">
                ${ui.component.badge('💎 <span id="hud-gem-free">0</span>', '--color-info', '--color-info-soft')}
                ${ui.component.badge('💠 <span id="hud-gem-paid">0</span>', '--color-info', '--color-info-soft')}
            </div>
            <div class="res-row" style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">
                ${ui.component.badge('💰 <span id="hud-gold">0</span>', '--color-gold', '--color-gold-soft')}
                <button onclick="view.renderSettings()" style="background:none; border:none; color:var(--color-gold); font-size:1.5rem; cursor:pointer; font-weight:bold;">≡</button>
            </div>
        </div>`;

    view.updateHUD(data);
};

view.updateHUD = (data) => {
    if (!data) data = window.GlobalState || {};
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };
    
    setText('hud-name', data.name || 'Commander');
    setText('hud-lv', data.lv || 1);
    setText('hud-gem-free', data.freeGem || 0);
    setText('hud-gem-paid', data.paidGem || 0);
    setText('hud-gold', data.gold || 0);

    const expContainer = document.getElementById('hud-exp-container');
    if (expContainer) expContainer.innerHTML = ui.progress.bar(data.exp || 0, (data.lv || 1) * 100);
    
    if (window.Assets && Assets.getCharImgTag) {
        const avEl = document.getElementById('hud-avatar');
        if (avEl) avEl.innerHTML = window.Assets.getCharImgTag('hud-avatar-img', 'width:100%;height:100%;object-fit:cover;');
    }
};

view.renderMain = () => {
    const container = document.getElementById('page-main');
    if (!container) return;
    const isBasic = window.GlobalState?.settings?.mode === 'basic';

    const btnStyle3D = `
        width: 48px; height: 48px; border-radius: var(--radius-md); font-size: 1.6rem; padding: 0; 
        display: flex; align-items: center; justify-content: center; background: var(--bg-card); 
        border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); 
        transition: transform var(--t-fast) var(--ease-bounce), box-shadow var(--t-fast); margin-bottom: 8px; cursor: pointer;
    `;
    
    const quickButtonsHtml = [
        { icon: '📜', action: "act.openquickModal('quick')", show: true },
        { icon: '👗', action: "act.navigate('avatar')", show: !isBasic },
        { icon: '❓', action: "act.showQA()", show: !isBasic }
    ].filter(b => b.show).map(b => `<div onclick="${b.action}" style="${btnStyle3D}" onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='var(--shadow-xs)';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)';">${b.icon}</div>`).join('');

    let charImg = window.Assets?.getCharImgTag ? window.Assets.getCharImgTag('main-char-img', 'height: 100%; width: auto; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));') : '<div style="font-size:6rem;">🦸</div>';

    const storyBtn = !isBasic ? ui.component.btn({
        label: '🌀 進入劇情模式', theme: 'correct', action: 'act.enterStoryMode()',
        style: `width: 240px; padding: 12px; border-radius: var(--radius-full); font-size: 1.1rem;`
    }) : '';

    container.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
            <div style="position: absolute; top: 20px; right: 14px; z-index: 50; display: flex; flex-direction: column;">
                ${quickButtonsHtml}
            </div>
            <div style="width: 100%; height: 75%; display: flex; align-items: flex-end; justify-content: center; transform: translateY(40px); position: relative; z-index: 10; pointer-events: none;">
                 <div style="height: 100%; width: auto; display: flex; align-items: flex-end; pointer-events: none;">${charImg}</div>
                 <div onclick="act.navigate('stats')" style="position: absolute; bottom: 0; left: 30%; width: 40%; height: 90%; cursor: pointer; pointer-events: auto; z-index: 20;"></div>
            </div>
            <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 100; width: auto; display: flex; justify-content: center;">
                ${storyBtn}
            </div>
        </div>
    `;
};

view.renderNavbar = (targetPageId) => {
    let container = document.getElementById('navbar');
    if (!container) {
        container = document.createElement('div');
        container.id = 'navbar';
        document.getElementById('app-frame').appendChild(container);
    }

    const navItems = [
        { id: 'task', icon: '📋', label: '任務', action: "act.goToTaskRoot()" }, 
        { id: 'main', icon: '🏠', label: '大廳', action: "act.navigate('main')" },
        { id: 'shop', icon: '🛒', label: '商店', action: "act.navigate('shop')" }
    ];

    const activeId = targetPageId || window.TempState?.currentView || (document.querySelector('.page.active')?.id.replace('page-', '')) || 'main';

    container.innerHTML = navItems.map(item => {
        const isActive = item.id === activeId ? 'active' : '';
        return `
            <button class="nav-item ${isActive}" id="nav-${item.id}" onclick="${item.action}">
                <span style="font-size: 1.4rem; display: block; margin-bottom: 2px;">${item.icon}</span> 
                <span style="font-size: 0.7rem; font-weight: bold;">${item.label}</span>
            </button>`;
    }).join('');
};

view.render = (targetPageId) => {
    if (!window.GlobalState) return;
    
    const activePageId = targetPageId || window.TempState?.currentView || (document.querySelector('.page.active')?.id.replace('page-', '')) || 'main';

    if (view.initHUD) view.initHUD(window.GlobalState);
    if (view.renderNavbar) view.renderNavbar(activePageId); 

    if (activePageId === 'main' && view.renderMain) {
        view.renderMain();
    }
};