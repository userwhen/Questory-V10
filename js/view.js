/* js/view.js - V35.Final UI Library (Complete Collection) */

window.ui = window.ui || {};
window.view = window.view || {};
window.act = window.act || {};
window.ui = {
    // =============================================================================
    // 1. 原子元件 (Atoms)
    // =============================================================================
    component: {
        // 通用按鈕
        btn: (opts) => {
            const themeMap = { 'correct': 'u-btn-correct', 'danger': 'u-btn-danger', 'normal': 'u-btn-normal', 'ghost': 'u-btn-ghost', 'paper': 'u-btn-paper' };
            const themeClass = themeMap[opts.theme] || 'u-btn-normal';
            const sizeClass = opts.size ? `u-btn-${opts.size}` : '';
            const disabledAttr = opts.disabled ? 'disabled' : '';
            const idAttr = opts.id ? `id="${opts.id}"` : '';
            const action = opts.disabled ? '' : (opts.action ? `onclick="${opts.action}"` : '');
            const iconHtml = opts.icon ? `<span style="margin-right:4px;">${opts.icon}</span>` : '';
            return `<button ${idAttr} class="u-btn ${themeClass} ${sizeClass}" style="${opts.style || ''}" ${action} ${disabledAttr}>${iconHtml}${opts.label||''}</button>`;
        },
        
        pillBtn: (opts) => {
            return ui.component.btn({ ...opts, size: opts.size || 'sm', style: `border-radius: 50px; padding: 4px 12px; white-space: nowrap; ${opts.style||''}` });
        },

        // 狀態標籤 (Tag) - 支援空心模式 (hollow)
        pill: (text, color, id, type = 'solid') => {
            const idAttr = id ? `id="${id}"` : '';
            // solid: 實心, hollow: 空心(只有邊框), soft: 淺底色(舊版)
            let style = '';
            if (type === 'solid') style = `background: ${color}; color: #fff; border: none;`;
            else if (type === 'hollow') style = `border: 1px solid ${color}; color: ${color}; background: transparent; padding: 1px 6px; font-size: 0.75rem;`;
            else style = `border-color: ${color}; color: ${color}; background: rgba(0,0,0,0.05);`;
            
            return `<span ${idAttr} class="u-pill" style="${style}">${text}</span>`;
        },
        
        // 頭像 (Avatar)
        avatar: (id, action, imgContent) => {
            const clickAttr = action ? `onclick="${action}"` : '';
            const cursor = action ? 'cursor:pointer;' : '';
            return `<div id="${id}" class="u-avatar" ${clickAttr} style="${cursor}">${imgContent}</div>`;
        },

        // 立繪/圖片按鈕 (Sprite)
        sprite: ({ src, action, width, height, style, id }) => {
            const idAttr = id ? `id="${id}"` : '';
            const clickAttr = action ? `onclick="${action}"` : '';
            const cursorStyle = action ? 'cursor: pointer;' : 'cursor: default;';
            const sizeStyle = `width:${width || 'auto'}; height:${height || 'auto'};`;
            return `<img ${idAttr} src="${src}" ${clickAttr} class="u-sprite" style="display:block; object-fit:contain; -webkit-user-drag: none; ${sizeStyle} ${cursorStyle} ${style||''}" onmousedown="if(this.onclick) this.style.transform='scale(0.95)'" onmouseup="if(this.onclick) this.style.transform='scale(1)'" onmouseleave="if(this.onclick) this.style.transform='scale(1)'">`;
        },
        
        // 分段切換器 (Segment)
        segment: (options, currentVal, onAction) => {
            return options.map(opt => {
                const isActive = currentVal === opt.val;
                const actionCall = onAction.includes('(') ? onAction : `${onAction}('${opt.val}')`;
                return ui.component.pillBtn({ label: opt.label, theme: isActive ? 'correct' : 'normal', style: `flex:1; margin:2px; ${isActive ? 'box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);' : ''}`, action: actionCall });
            }).join('');
        },
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
        // [V35核心] 萬用頁面模板
        page: (opts) => {
            let backBtnHtml = '';
            if (opts.back) {
                const action = typeof opts.back === 'string' ? opts.back : "act.navigate('main')";
                backBtnHtml = ui.component.btn({ label: '返回', icon: '↵', theme: 'normal', action: action, style: 'padding: 6px 12px; font-size:0.9rem; border-radius:8px;' });
            }
            const topBarHtml = `<div style="flex-shrink:0; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 15px; background:transparent;"><div style="font-size:1.2rem; font-weight:bold; color:#3e2723;">${opts.title || ''}</div>${backBtnHtml}</div>`;

            return `<div style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
                ${topBarHtml}
                ${opts.fixedTop ? `<div style="flex-shrink:0;">${opts.fixedTop}</div>` : ''}
                <div style="flex:1; overflow-y:auto; overflow-x:hidden; position:relative; z-index:10; padding-bottom: 20px;">${opts.body || ''}</div>
                ${opts.footer ? `<div style="flex-shrink:0; padding:10px;">${opts.footer}</div>` : ''}
            </div>`;
        },

        // Flex 橫向佈局 (工具類)
        flexRow: (content, gap='10px', justify='space-between') => 
            `<div style="display:flex; align-items:center; justify-content:${justify}; gap:${gap}; width:100%;">${content}</div>`,
        
        // Grid 網格佈局 (工具類)
        grid: (content, cols='2', gap='10px') => 
            `<div style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:${gap}; width:100%;">${content}</div>`,

        // 橫向捲動區 (ScrollX)
        scrollX: (options, currentVal, actionName) => {
            const buttons = options.map(opt => ui.component.pillBtn({ label: opt, theme: opt === currentVal ? 'normal' : 'ghost', style: 'flex-shrink:0; margin-right:5px;', action: `${actionName}('${opt}')` })).join('');
            return `<div style="display:flex; overflow-x:auto; padding-bottom:5px; -webkit-overflow-scrolling:touch; gap:5px;">${buttons}</div>`;
        },

        // [V35.31] 萬用抽屜 (固定把手 + 獨立滑動層)
        drawer: (isOpen, contentHtml, onToggle, opts = {}) => {
            const bgColor = opts.color || '#222';
            const dir = opts.dir || 'bottom';
            const isFixedHandle = opts.fixedHandle || false; 

            const wrapperStyle = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 200; pointer-events: none; overflow: hidden;`;

            let handleBaseStyle = `
                background: ${bgColor}; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
                font-size: 1.2rem; font-weight: bold; box-shadow: 0 -2px 5px rgba(0,0,0,0.2); user-select: none;
                width: 60px; height: 40px; border-radius: 8px 8px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none;
                pointer-events: auto; z-index: 202; 
            `;

            let drawerBaseStyle = `
                position: absolute; background: ${bgColor}; box-shadow: 0 0 15px rgba(0,0,0,0.5);
                transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: auto;
                display: flex; flex-direction: column; z-index: 201; overflow: visible; 
            `;
            
            let finalHandleStyle = handleBaseStyle + 'position: absolute; right: 0; ';
            let finalDrawerStyle = drawerBaseStyle;

            if (dir === 'right') {
                finalDrawerStyle += `bottom: 0; right: 0; width: 100%; height: 220px; transform: translateX(${isOpen ? '0%' : '100%'}); border-top: 2px solid #555;`;
                if (isFixedHandle) finalHandleStyle += `bottom: 220px;`; else finalHandleStyle += `bottom: 100%;`; 
            } else {
                const h = opts.height || '35%';
                finalDrawerStyle += `bottom: 0; left: 0; width: 100%; height: ${h}; transform: translateY(${isOpen ? '0%' : '100%'}); border-top: 1px solid rgba(255,255,255,0.1);`;
                if (isFixedHandle) finalHandleStyle += `bottom: ${h};`; else finalHandleStyle += `bottom: 100%;`;
            }

            const icon = isOpen ? (opts.iconOpen || '▼') : (opts.iconClose || '▲');
            const handleHtml = `<div onclick="event.preventDefault(); event.stopPropagation(); ${onToggle}" style="${finalHandleStyle}">${icon}</div>`;
            const bodyContent = `<div style="width:100%; height:100%; overflow-y:auto; padding:15px; box-sizing:border-box;">${contentHtml}</div>`;
            
            if (isFixedHandle) {
                return `<div class="u-drawer-wrapper" style="${wrapperStyle}">${handleHtml}<div class="u-drawer-body" style="${finalDrawerStyle}">${bodyContent}</div></div>`;
            } else {
                return `<div class="u-drawer-wrapper" style="${wrapperStyle}"><div class="u-drawer-body" style="${finalDrawerStyle}">${handleHtml}${bodyContent}</div></div>`;
            }
        },
        
        // 舊版容器 (保留相容性)
        scroller: (header, body, id='') => `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; overflow:hidden; position:relative;">
                <div style="flex-shrink:0; z-index:2;">${header}</div>
                <div id="${id}" style="flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; padding-bottom:80px;">${body}</div>
            </div>`
    },

    // =============================================================================
    // 4. 輸入元件 (Inputs)
    // =============================================================================
    input: {
        text: (val, placeholder, onInput, id) => `<input type="text" id="${id||''}" class="inp" value="${val||''}" placeholder="${placeholder||''}" oninput="${onInput}">`,

        // [客製化] 純數字輸入框 (限制位數)
        number: (val, onInput, digit=4, id) => {
            const safeVal = val !== undefined ? val : '';
            return `<input type="text" inputmode="numeric" pattern="[0-9]*" id="${id||''}" class="inp inp-num" value="${safeVal}" maxlength="${digit}" style="width: 100px; text-align:center; font-weight:bold; letter-spacing:1px;" oninput="this.value=this.value.replace(/[^0-9]/g,''); ${onInput}">`;
        },
        
        textarea: (val, placeholder, onInput, id) => `<textarea id="${id||''}" class="inp" rows="3" placeholder="${placeholder||''}" oninput="${onInput}">${val||''}</textarea>`,

        datetime: (val, onChange, id) => `<input type="datetime-local" id="${id||''}" class="inp" value="${val||''}" onchange="${onChange}" style="width:100%;">`,

        select: (options, currentVal, onChange, id) => {
            const optsHtml = options.map(opt => `<option value="${opt.val||opt.value}" ${ (opt.val||opt.value) == currentVal ? 'selected' : ''}>${opt.label}</option>`).join('');
            return `<select id="${id||''}" onchange="${onChange}" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc; background:#fff; outline:none; font-size:0.9rem;">${optsHtml}</select>`;
        },

        // 開關列 (Settings Toggle)
        toggleRow: ({ id, label, icon = '', checked, onChange }) => {
            return `
            <div class="u-toggle-row" onclick="const c=this.querySelector('input'); c.checked=!c.checked; c.dispatchEvent(new Event('change'));" 
                 style="display:flex; align-items:center; gap:12px; padding:12px; background:rgba(255,255,255,0.6); border-radius:10px; cursor:pointer; margin-bottom:8px; border:1px solid rgba(0,0,0,0.05);">
                <div style="width:20px; height:20px; border:2px solid ${checked ? 'var(--color-gold)' : '#bbb'}; border-radius:4px; display:flex; align-items:center; justify-content:center; background:${checked ? 'var(--color-gold)' : '#fff'};">
                    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} onchange="${onChange}" style="display:none;" onclick="event.stopPropagation();">
                    ${checked ? '<span style="color:white; font-size:14px; font-weight:bold;">✓</span>' : ''}
                </div>
                <div style="font-size:1.2rem;">${icon}</div>
                <div style="font-size:0.95rem; font-weight:bold; color:#444; flex:1;">${label}</div>
                <div style="font-size:0.75rem; color:${checked ? 'var(--color-gold)' : '#999'}; font-weight:bold;">${checked ? 'ON' : 'OFF'}</div>
            </div>`;
        }
    },

    // =============================================================================
    // 5. 進度元件 (修正版)
    // =============================================================================
    progress: {
        // [修復 VIEW-4] 擴充參數簽名，支援文字與自訂樣式，移除參數列的等號預設值，改在內部處理
        bar: (curr, max, label, customStyle) => {
            const safeLabel = label || '';
            const safeStyle = customStyle || '';
            const pct = Math.min(100, Math.max(0, (curr / max) * 100));
            const displayText = safeLabel || `${curr} / ${max}`;
            return `
            <div class="u-progress" style="height:18px; background:#e0e0e0; border-radius:10px; position:relative; overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,0.1); ${safeStyle}">
                <div style="width:${pct}%; height:100%; background:var(--color-correct, #4caf50); transition:width 0.3s ease;"></div>
                <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:11px; color:#333; font-weight:bold; letter-spacing:0.5px; text-shadow: 0 0 2px rgba(255,255,255,0.8);">
                    ${displayText}
                </div>
            </div>`;
        },
        
        stepWizard: (currStep, totalSteps) => {
            let html = '<div style="display:flex; align-items:center; justify-content:space-between; width:100%; margin-top:8px;">';
            for (let i = 1; i <= totalSteps; i++) {
                let ballColor = i <= currStep ? 'var(--color-correct, #4caf50)' : '#e0e0e0';
                html += `<div style="width:12px; height:12px; background:${ballColor}; border-radius:50%; flex-shrink:0; z-index:2; transition:background 0.3s;"></div>`;
                if (i < totalSteps) {
                    let lineColor = i < currStep ? 'var(--color-correct, #4caf50)' : '#e0e0e0';
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
            const clickAttr = opts.onClick ? `onclick="${opts.onClick}"` : '';
            const cursorStyle = opts.onClick ? 'cursor:pointer;' : '';
            const borderStyle = opts.themeColor ? `border-left: 4px solid ${opts.themeColor};` : '';
            return `
            <div class="task-card" ${clickAttr} style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; background: #fff; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); ${borderStyle} ${opts.style||''} ${cursorStyle}">
                <div style="width:40px; height:40px; background:#f5f5f5; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">${opts.iconHtml || '📄'}</div>
                <div style="flex:1; display:flex; flex-direction:column; justify-content:center; overflow:hidden;">
                    <div style="font-weight:bold; font-size:1rem; color:#333; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${opts.title}</div>
                    <div style="font-size:0.85rem; color:#666;">${opts.subTitle || ''}</div>
                </div>
                <div style="flex-shrink:0;">${opts.rightHtml || ''}</div>
            </div>`;
        },

        task: (t, isHistory = false) => {
            // --- A. 左側 Checkbox ([修正 2] 統一使用標準樣式) ---
            let leftHtml = '';
            const checkboxStyle = "width:24px; height:24px; border:2px solid #bbb; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer; margin-right:12px; background:#fff; transition:all 0.2s;";
            
            if (isHistory) {
                const isSuccess = t.status === 'success' || t.done;
                const color = isSuccess ? '#4caf50' : '#f44336';
                const icon = isSuccess ? '✓' : '✕';
                leftHtml = `<div style="font-size:1.4rem; color:${color}; width:24px; text-align:center; font-weight:bold; flex-shrink:0; margin-right:12px;">${icon}</div>`;
            } else {
                const activeStyle = t.done ? "background:#4caf50; border-color:#4caf50; color:#fff;" : "";
                leftHtml = `
                <div class="chk ${t.done?'checked':''}" 
                     style="${checkboxStyle} ${activeStyle}" 
                     onclick="event.stopPropagation(); act.toggleTask('${t.id}')">
                     ${t.done ? '<span style="font-size:16px; font-weight:bold;">✓</span>' : ''}
                </div>`;
            }

            // --- B. 標題與標籤 ---
            let badges = '';
            if (t.importance >= 3) badges += ui.component.pill('🔥', '#ef6c00', '', 'hollow');
            if (t.urgency >= 3) badges += ui.component.pill('⚡', '#d32f2f', '', 'hollow');
            if (t.recurrence) badges += ui.component.pill('🔁', '#1976d2', '', 'hollow');
            let skillIcons = (t.attrs && t.attrs.length > 0) ? `<span style="font-size:0.9rem; margin-left:4px; opacity:0.8;">${t.attrs.map(a => '💪').join('')}</span>` : '';
            const pinHtml = t.pinned ? `<span style="margin-left:auto; font-size:1rem; color:#5d4037;">📌</span>` : `<span style="margin-left:auto;"></span>`;

            const titleRow = `
                <div style="display:flex; align-items:center; gap:6px; width:100%;">
                    <span class="task-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60%; font-weight:bold; color:#333;">${t.title}</span>
                    ${badges} ${skillIcons} ${pinHtml}
                </div>`;
            
            // --- C. 進度條 (含防護罩) ---
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
    
    // --- [關鍵修復] rightHtml 定義在這裡，確保不被任何 if 包住 ---
    const rightHtml = isHistory 
        ? '' 
        : ui.component.btn({ 
            label:'⚙️', 
            theme:'ghost', 
            action:`event.stopPropagation(); act.editTask('${t.id}')`, // 防止冒泡
            style:'padding:0 5px; color:#999; flex-shrink:0;' 
          });

    // --- D. 展開區 (子任務/計數器) ---
    let subtaskHtml = '';
    
    // 互斥顯示：如果是計次，顯示+1按鈕；否則顯示子任務
    if (t.type === 'count') {
        // 計次模式的操作區
        subtaskHtml = `
        <div style="margin-top:8px; border-top:1px dashed #eee; padding-top:8px; display:flex; justify-content:space-between; align-items:center; cursor:default;" onclick="event.stopPropagation();">
            <span style="font-weight:bold; color:#f57f17;">目前進度: ${t.curr} / ${t.target}</span>
            <button class="u-btn u-btn-sm u-btn-correct" onclick="event.stopPropagation(); act.toggleTask('${t.id}')">
                +1 次數
            </button>
        </div>`;
    } 
    else if (t.subs && t.subs.length > 0) {
        // 子任務模式的操作區
        subtaskHtml = `<div style="margin-top:8px; border-top:1px dashed #eee; padding-top:8px; cursor:default;" onclick="event.stopPropagation();">`;
        t.subs.forEach((sub, idx) => {
            const isSubDone = sub.done;
            const textStyle = isSubDone ? 'text-decoration:line-through; color:#aaa;' : 'color:#555;';
            
            subtaskHtml += `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; cursor:pointer; padding:6px 4px; border-radius:4px; transition:background 0.2s;" 
                 onmouseover="this.style.background='rgba(0,0,0,0.05)'"
                 onmouseout="this.style.background='transparent'"
                 onclick="event.stopPropagation(); act.toggleSubtask('${t.id}', ${idx})">
                
                <div style="width:18px; height:18px; border:1px solid ${isSubDone?'#4caf50':'#999'}; background:${isSubDone?'#4caf50':'#fff'}; border-radius:4px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    ${isSubDone ? '<span style="color:#fff; font-size:12px; font-weight:bold;">✓</span>' : ''}
                </div>
                
                <div style="font-size:0.9rem; ${textStyle} flex:1; user-select:none;">${sub.text}</div>
            </div>`;
        });
        subtaskHtml += `</div>`;
    }

            const dateValue = isHistory ? (t.finishTime || '未知') : (t.deadline || '');
            const dateDisplay = dateValue ? `<div style="text-align:right; font-size:0.8rem; color:#aaa; margin-top:8px;">📅 ${dateValue}</div>` : '';

            // --- E. 展開狀態控制 ---
            // 讀取 TempState.expandedTaskId 決定是否展開
            const isExpanded = window.TempState.expandedTaskId === t.id;
            const expandStyle = isExpanded ? 'display:block;' : 'display:none;';

            return `
            <div class="task-card ${t.done?'status-done':''}" onclick="view.toggleCardExpand('${t.id}')" style="background:#fff; padding:12px; border-radius:12px; margin-bottom:10px; box-shadow:0 2px 5px rgba(0,0,0,0.05); transition:all 0.2s;">
                <div class="task-main-row" style="display:flex; align-items: flex-start; width:100%;"> 
                    ${leftHtml}
                    <div class="task-content" style="flex:1; min-width:0;">
                        ${titleRow}
                        ${progressRow} 
                    </div>
                    <div>${rightHtml}</div>
                </div>
                <div id="expand-${t.id}" style="${expandStyle} padding-top:10px; margin-top:10px; font-size:0.9rem; color:#666; padding-left: 36px;">
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
                    <p style="font-size:0.9rem; color:#555; margin-bottom:15px; line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                        ${opts.desc}
                    </p>
                </div>
                <div style="font-size:1.4rem; font-weight:bold; color:${opts.color}; text-align:right;">
                    ${opts.price}
                </div>
            </div>`;
        },

        achievement: (ach, isHistory) => {
    // 1. 基礎數據計算
    const current = ach.current || 0;
    const target = ach.target || 1;
    const isDone = current >= target;

    // 2. 左側獎盃圖示
    const leftIcon = `<div style="width:40px; height:40px; background:#fff8e1; color:gold; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; margin-right:12px; border:1px solid #ffe082;">🏆</div>`;

    // 3. 按鈕邏輯 (兩段式：完成 -> 領取)
    let btnHtml = '';
    
    if (isHistory) {
        btnHtml = `<span style="color:#fbc02d; font-weight:bold; font-size:0.8rem;">已入殿堂</span>`;
    } else {
        if (!isDone) {
            // 未完成 (灰色，無鎖頭)
            btnHtml = `<button disabled style="background:#f5f5f5; color:#bbb; border:none; padding:5px 12px; border-radius:15px; font-size:0.8rem; letter-spacing:1px;">未完成</button>`;
        } else {
            // 已完成 (綠色) -> 點擊變黃色
            btnHtml = `<button id="btn-ach-${ach.id}" onclick="event.stopPropagation(); act.preClaimAch('${ach.id}', this)" style="background:var(--color-correct, #4caf50); color:#fff; border:none; padding:5px 15px; border-radius:15px; font-size:0.8rem; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">✅ 完成</button>`;
        }
    }

    // 4. [修改] 替換成 Step Wizard 進度條
    // 注意：這裡直接呼叫 ui.progress.stepWizard
    const progressHtml = ui.progress.stepWizard(current, target);

    // 5. 組合 HTML
    // [修改] 在 style 中補回 background:#fff; 以及 box-shadow
    return `
    <div class="u-card" style="background:#fff; margin-bottom:10px; border-left:4px solid ${isDone ? '#4caf50' : '#ccc'}; padding:12px; cursor:pointer; border-radius:12px; box-shadow:0 2px 5px rgba(0,0,0,0.05);" onclick="view.toggleCardExpand('${ach.id}')">
        
        <div style="display:flex; align-items:center;">
            ${leftIcon}
            <div style="flex:1; margin-right: 10px;">
                <div style="font-weight:bold; font-size:1rem; margin-bottom:4px; color:#333;">${ach.title}</div>
                
                <div style="margin-top:5px;">
                    ${progressHtml}
                </div>
                
                <div style="font-size:0.75rem; color:#888; margin-top:4px; text-align:right;">${current} / ${target}</div>
            </div>
            <div style="flex-shrink:0; align-self:center;">${btnHtml}</div>
        </div>

        <div id="expand-${ach.id}" style="display:none; padding-top:10px; border-top:1px dashed #eee; margin-top:10px; font-size:0.9rem; color:#666; padding-left: 52px;">
            <div style="margin-bottom:5px;">${ach.desc}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#d4af37; font-size:0.85rem; font-weight:bold;">✨ 獎勵: ${ach.rewards?.gold || 0} G</span>
                ${!isHistory ? ui.component.btn({label:'⚙️', theme:'ghost', size:'sm', action:`act.editAch('${ach.id}')`}) : ''}
            </div>
        </div>
    </div>`;
},

        vertical: (opts) => {
            const imgHtml = opts.imgPath ? `<div class="card-img-area"><img src="${opts.imgPath}" style="height:80px; object-fit:contain;"></div>` : '';
            const stockHtml = opts.stock !== undefined ? `<div style="font-size:0.75rem; color:#888; margin-top:2px;">庫存: ${opts.stock}</div>` : '';
            return `
            <div class="card-vertical" style="${opts.style||''}" onclick="${opts.onClick||''}">
                ${imgHtml}
                <div class="card-info-area">
                    <div style="font-weight:bold;">${opts.title}</div>
                    ${stockHtml}
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
        // [修復 QUICK-V1] 註冊開放圖層字典，包含 quick 並映射到 panel
        layers: { 'panel': 'm-panel', 'overlay': 'm-overlay', 'system': 'm-system', 'quick': 'm-panel' },
        
        render: (title, bodyHtml, footHtml, layer = 'overlay') => {
            // 使用註冊字典讀取目標
            const targetId = ui.modal.layers[layer] || ui.modal.layers['overlay'];
            let modal = document.getElementById(targetId);
            if (!modal) {
                modal = document.createElement('div'); modal.id = targetId; modal.className = 'mask';
                if (layer === 'system') modal.style.zIndex = '9999'; 
                else if (layer === 'overlay') modal.style.zIndex = '9500'; 
                else modal.style.zIndex = '9000';
                modal.innerHTML = `<div class="modal"><div class="m-head"><span class="m-title"></span>${ui.component.btn({ label:'✕', theme:'ghost', style:'padding:0 8px;', action:`ui.modal.close('${targetId}')` })}</div><div class="m-body"></div><div class="m-foot"></div></div>`;
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
            const targetId = id || 'm-overlay';
            const modal = document.getElementById(targetId);
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => { if(!modal.classList.contains('active')) modal.style.display = 'none'; }, 50);
            }
        }
    },
    
    // =============================================================================
    // 7. 舊版相容區
    // =============================================================================
    tabs: {
        sliding: (label1, label2, isLeft, act1, act2) => {
            return `<div style="display:flex; background:rgba(0,0,0,0.1); border-radius:50px; padding:4px; margin:10px 15px;">
                ${ui.component.pillBtn({label:label1, theme:isLeft?'correct':'ghost', style:'flex:1;', action:act1})}
                ${ui.component.pillBtn({label:label2, theme:!isLeft?'correct':'ghost', style:'flex:1;', action:act2})}
            </div>`;
        },
        scrollX: (options, currentVal, actionName) => ui.layout.scrollX(options, currentVal, actionName)
    }
};


// =============================================================================
// 7. 全域橋接 (Bridge)
// =============================================================================
if (window.EventBus) {
    window.EventBus.on(window.EVENTS.System.MODAL_CLOSE, (layerName) => {
        // 傳進來的可能是 'overlay'，但 DOM ID 是 'm-overlay'
        const map = { 'panel': 'm-panel', 'overlay': 'm-overlay', 'system': 'm-system' };
        // 如果傳進來的是 'overlay' 就轉成 'm-overlay'，否則就用原值 (容錯)
        const targetId = map[layerName] || layerName || 'm-overlay';
        
        console.log("🎯 View 關閉視窗, 目標 ID:", targetId);
        ui.modal.close(targetId); 
    });
};

view.toggleCardExpand = function(id) {
    // 1. 修改狀態 (State)
    if (window.TempState.expandedTaskId === id) {
        window.TempState.expandedTaskId = null; // 如果已經展開，就收起
    } else {
        window.TempState.expandedTaskId = id;   // 否則展開
    }

    // 2. 驅動視圖更新 (Render)
    // 這會觸發 taskView.render()，它會根據 expandedTaskId 決定渲染出來的 HTML 是開還是關
    if (window.taskView && taskView.render) {
        taskView.render();
    }
};

view.showToast = (msg) => {
    const old = document.querySelector('.u-toast'); if(old) old.remove();
    const toast = document.createElement('div'); 
    toast.className = 'u-toast show';
    // 確保 toast 層級最高
    toast.style.zIndex = '10000';
    toast.innerHTML = ui.component.pill(msg, 'rgba(f3f6f4)', '', true);
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
};
act.toast = view.showToast;

window.view.renderSystemModal = (type, msg, defVal = '') => {
    let title = '系統提示';
    let body = `<div style="padding:20px; font-size:1.1rem; color:#333; text-align:center;">${msg}</div>`;
    let foot = '';
    
    // Alert
    if (type === 'alert') {
        title = '⚠️ 提示';
        foot = ui.component.btn({label:'確定', theme:'normal', style:'width:100%;', action:"ui.modal.close('m-system')"});
    }
    // Confirm
    else if (type === 'confirm') {
        title = '❓ 確認';
        foot = `
            ${ui.component.btn({label:'取消', theme:'ghost', style:'flex:1;', action:"act.handleSysConfirm(false)"})}
            ${ui.component.btn({label:'確定', theme:'correct', style:'flex:1;', action:"act.handleSysConfirm(true)"})}
        `;
    }
    // Prompt
    else if (type === 'prompt') {
        title = '✏️ 輸入';
        body += `<div style="padding:0 20px;">${ui.input.text(defVal, '', '', 'sys-univ-input')}</div>`;
        foot = `
            ${ui.component.btn({label:'取消', theme:'ghost', style:'flex:1;', action:"ui.modal.close('m-system')"})}
            ${ui.component.btn({label:'確定', theme:'correct', style:'flex:1;', action:"act.handleSysConfirm('prompt_submit')"})}
        `;
    }

    ui.modal.render(title, body, foot, 'system');
};

// ==========================================
// [Part 3] Implementation (具體渲染邏輯)
// ==========================================
// --- HUD 渲染邏輯 ---
view.initHUD = (data) => {
    let container = document.getElementById('hud');
    if (!container) {
        container = document.createElement('div');
        container.id = 'hud';
        document.getElementById('app-frame').appendChild(container);
    }

    // [修復] 這裡補回了 hud-gem-paid (付費鑽石) 的結構
    container.innerHTML = `
        <div class="hud-left">
            ${ui.component.avatar('hud-avatar', "act.navigate('stats')", '⏳')}
            <div class="hud-info">
                <div class="hud-name">---</div>
                <div class="hud-lv-row">
                    <div class="hud-lv-txt">Lv.<span id="hud-lv">1</span></div>
                    <div id="hud-exp-container" style="flex:1"></div>
                </div>
            </div>
        </div>
        <div class="hud-right">
            <div class="res-row" onclick="act.openPayment()">
                ${ui.component.pill('💎 0', '#b3e5fc', 'hud-gem-free')}
                ${ui.component.pill('💠 0', '#e1bee7', 'hud-gem-paid')}
            </div>
            <div class="res-row" style="justify-content:flex-end;">
                ${ui.component.pill('💰 0', 'gold', 'hud-gold')} 
                ${ui.component.btn({label:'≡',theme:'ghost',style:'font-size:1.5rem;padding:0 4px;color:#ffb300;',action:'view.renderSettings()'})}
            </div>
        </div>`;

    view.updateHUD(data);
};

// --- HUD 資料更新邏輯 ---
view.updateHUD = (data) => {
    if (!data) data = window.GlobalState || {};
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };
    
    setText('hud-name', data.name || 'Commander');
    setText('hud-lv', data.lv || 1);
    
    // [確認] 資料會隨動：這裡會去抓最新的 freeGem 和 paidGem
    setText('hud-gem-free', `💎 ${data.freeGem || 0}`);
    setText('hud-gem-paid', `💠 ${data.paidGem || 0}`);
    setText('hud-gold', `💰 ${data.gold || 0}`);

    const expContainer = document.getElementById('hud-exp-container');
    if (expContainer) {
        expContainer.innerHTML = ui.progress.bar(data.exp || 0, (data.lv || 1) * 100, '', 'height:8px;');
    }
    if (window.Assets && Assets.getCharImgTag) {
        const avEl = document.getElementById('hud-avatar');
        if (avEl) avEl.innerHTML = window.Assets.getCharImgTag('hud-avatar-img', 'width:100%;height:100%;object-fit:cover;');
    }
};

// 2. Main Page 渲染 (V6: 穩定點擊版)
view.renderMain = () => {
    const container = document.getElementById('page-main');
    if (!container) return;

    const isBasic = window.GlobalState?.settings?.mode === 'basic';

    // 立體按鈕樣式
    const btnStyle3D = `
        width: 48px; height: 48px; border-radius: 12px; font-size: 1.6rem; padding: 0; 
        display: flex; align-items: center; justify-content: center; background: #fff; 
        border: 2px solid #3e2723; box-shadow: 0 4px 0 #5d4037; transition: all 0.1s; margin-bottom: 5px;
    `;
    
    // 1. Quick Icons
    const quickButtonsHtml = [
        { icon: '📜', action: "act.openquickModal('quick')", show: true },
        { icon: '👗', action: "act.navigate('avatar')", show: !isBasic },
        { icon: '❓', action: "act.showQA()", show: !isBasic }
    ]
    .filter(b => b.show)
    .map(b => ui.component.btn({
        label: b.icon, theme: 'normal', action: b.action, style: btnStyle3D
    })).join('');

    // 2. 立繪圖片
    let charImg = '';
    if (window.Assets && Assets.getCharImgTag) {
        charImg = window.Assets.getCharImgTag('main-char-img', 'height: 100%; width: auto; object-fit: contain; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.2));');
    } else {
        charImg = '<div style="font-size:6rem;">🦸</div>';
    }

    // 3. 劇情按鈕 (注意：這裡不需要再寫 pointer-events 了，我們靠容器解決)
    const storyBtn = !isBasic ? ui.component.btn({
        label: '🌀 進入劇情模式', theme: 'correct', action: 'act.enterStoryMode()',
        style: `width: 240px; padding: 12px; border-radius: 50px; font-size: 1.1rem; font-weight: bold; border: 2px solid #004d40; box-shadow: 0 5px 0 #00695c; margin-bottom: 5px;`
    }) : '';

    container.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
            
            <div style="position: absolute; top: 20px; right: 10px; z-index: 50; display: flex; flex-direction: column; gap: 15px;">
                ${quickButtonsHtml}
            </div>

            <div style="width: 100%; height: 75%; display: flex; align-items: flex-end; justify-content: center; 
                        padding-bottom: 0; transform: translateY(40px); 
                        position: relative; z-index: 10; pointer-events: none;">

                 <div style="height: 100%; width: auto; display: flex; align-items: flex-end; pointer-events: none;">
                    ${charImg}
                 </div>

                 <div onclick="act.navigate('stats')" 
                      style="position: absolute; bottom: 0; left: 30%;
                             width: 40%; height: 90%; 
                             cursor: pointer; pointer-events: auto; z-index: 20;">
                 </div>
            </div>

            <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); 
                        z-index: 100; width: auto; display: flex; justify-content: center;">
                ${storyBtn}
            </div>

        </div>
    `;
};

// 3. Navbar 渲染 - [動態生成回歸]
view.renderNavbar = () => {
    let container = document.getElementById('navbar');
    // 如果找不到 navbar 容器，自動建立並掛載
    if (!container) {
        container = document.createElement('div');
        container.id = 'navbar';
        document.getElementById('app-frame').appendChild(container);
    }

    const navItems = [
        // [修改] 將 onclick 改為 act.goToTaskRoot()
        // 注意：只有任務按鈕需要改，其他保持 act.navigate
        { id: 'task', icon: '📋', label: '任務', action: "act.goToTaskRoot()" }, 
        { id: 'main', icon: '🏠', label: '大廳', action: "act.navigate('main')" },
        { id: 'shop', icon: '🛒', label: '商店', action: "act.navigate('shop')" }
    ];

    const activePage = document.querySelector('.page.active');
    const activeId = activePage ? activePage.id.replace('page-', '') : 'main';

    container.innerHTML = navItems.map(item => {
        const isActive = item.id === activeId ? 'active' : '';
        // 使用 item.action
        return `
            <button class="nav-item ${isActive}" id="nav-${item.id}" onclick="${item.action}">
                <span style="font-size: 1.4rem; display: block;">${item.icon}</span> 
                <span style="font-size: 0.7rem; font-weight: bold;">${item.label}</span>
            </button>`;
    }).join('');
};

// 6. 全域渲染入口 (Master Render Loop)
view.render = () => {
    if (!window.GlobalState) return;
    
    // 1. 確保全局基礎結構 (HUD & Navbar) 永遠出現
    if (view.initHUD) view.initHUD(window.GlobalState);
    if (view.renderNavbar) view.renderNavbar(); 

    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    const pageId = activePage.id.replace('page-', '');

    // 2. 只有 'main' 歸這裡管，其餘頁面由各模組 Controller 自己呼叫渲染
    if (pageId === 'main') {
        if (view.renderMain) view.renderMain();
    }
    
    // 3. 同步 Navbar 狀態
    const navBtn = document.getElementById(`nav-${pageId}`);
    if (navBtn) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        navBtn.classList.add('active');
    }
};