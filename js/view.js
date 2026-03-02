// =============================================================================
// js/view.js - V43.0 Industrial UI Framework (4-Layer Architecture)
// =============================================================================

window.ui = window.ui || {};
window.view = window.view || {};
window.act = window.act || {};

// ============================================================================
// [輔助層] Utils (已刪除 getVariantStyle，樣式交由 CSS 管理)
// ============================================================================
ui.utils = {
    getThemeClass: (theme) => {
        return { correct: 'u-btn-correct', danger: 'u-btn-danger', normal: 'u-btn-normal', ghost: 'u-btn-ghost', paper: 'u-btn-paper' }[theme] || 'u-btn-normal';
    }
};

// ============================================================================
// LAYER 1: Atoms (純原子元件) - 加入 className 支援，適配 CSS 主題
// ============================================================================
ui.atom = {
    buttonBase: (opts = {}) => {
        const { label = '', theme = 'normal', size = '', action = '', disabled = false, id = '', style = '', className = '', icon = '' } = opts;
        const themeClass = ui.utils.getThemeClass(theme);
        const sizeClass = size ? `u-btn-${size}` : '';
        const iconHtml = icon ? `<span style="margin-right:4px;">${icon}</span>` : '';
        return `<button ${id ? `id="${id}"` : ''} class="u-btn ${themeClass} ${sizeClass} ${className}" style="${style}" ${disabled ? 'disabled' : ''} ${action && !disabled ? `onclick="${action}"` : ''}>${iconHtml}${label}</button>`;
    },

    cardBase: (opts = {}) => {
        const { children = '', style = '', className = '', onClick = '' } = opts;
        return `<div class="std-card ${className}" style="${style}" ${onClick ? `onclick="${onClick}"` : ''}>${children}</div>`;
    },

    headerBase: (opts = {}) => {
        const { title = '', backAction = '', rightContent = '', style = '', className = '' } = opts;
        const backBtn = backAction ? ui.atom.buttonBase({label: '返回', icon: '↵', theme: 'normal', action: backAction, style: 'padding: 6px 12px; font-size:0.9rem; border-radius:8px;'}) : '';
        return `
        <div class="${className}" style="display:flex; align-items:center; justify-content:space-between; padding:12px 15px; flex-shrink:0; ${style}">
            <div style="font-weight:800; font-size:1.1rem;">${title}</div>
            <div style="display:flex; align-items:center; gap:8px;">
                ${rightContent}
                ${backBtn}
            </div>
        </div>`;
    },

    qtySelectorBase: (opts = {}) => {
        const { idPrefix, qty = 1, onChange = '', style = '', className = '' } = opts;
        return `
        <div class="${className}" style="display:flex; align-items:center; gap:8px; padding:6px; border-radius:12px; width:fit-content; ${style}">
            ${ui.atom.buttonBase({label:'MIN', theme:'ghost', size:'sm', action:`${onChange}('min')`})}
            <button class="u-btn u-btn-ghost" onclick="${onChange}(-1)" style="width:32px;height:32px;padding:0;">➖</button>
            <b id="${idPrefix}-display" style="font-size:1.4rem; width:48px; text-align:center;">${qty}</b>
            <button class="u-btn u-btn-ghost" onclick="${onChange}(1)" style="width:32px;height:32px;padding:0;">➕</button>
            ${ui.atom.buttonBase({label:'MAX', theme:'ghost', size:'sm', action:`${onChange}('max')`})}
        </div>`;
    },

    badgeBase: (opts = {}) => {
        const { text, style = '', className = '' } = opts;
        return `<span class="u-pill ${className}" style="display:inline-flex; align-items:center; padding:2px 8px; border-radius:50px; font-size:0.7rem; font-weight:700; ${style}">${text}</span>`;
    },

    inputBase: (opts = {}) => {
        const { type = 'text', val = '', placeholder = '', onChange = '', id = '', style = '', extra = '', className = '' } = opts;
        if (type === 'textarea') return `<textarea id="${id}" class="inp ${className}" rows="3" placeholder="${placeholder}" oninput="${onChange}" style="${style}">${val}</textarea>`;
        if (type === 'select') {
            const optsHtml = (opts.options || []).map(o => `<option value="${o.val||o.value}" ${ (o.val||o.value) == val ? 'selected' : ''}>${o.label}</option>`).join('');
            return `<select id="${id}" class="${className}" onchange="${onChange}" style="width:100%; padding:8px; border-radius:8px; outline:none; font-size:0.9rem; ${style}">${optsHtml}</select>`;
        }
        // [優化] 支援原生小日曆 (datetime-local)
        if (type === 'datetime-local') {
            return `<input type="datetime-local" id="${id}" class="inp ${className}" value="${val}" onchange="${onChange}" style="${style}" ${extra}>`;
        }
        // [優化] 數字輸入框：強制轉為 type="text" 並過濾非數字，同時預設文字置中
        const isNum = type === 'number' ? `inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/[^0-9]/g,''); ${onChange}"` : `oninput="${onChange}"`;
        const alignStyle = type === 'number' ? 'text-align:center;' : '';
        return `<input type="text" id="${id}" class="inp ${className}" value="${val}" placeholder="${placeholder}" ${isNum} style="${alignStyle} ${style}" ${extra}>`;
    },

    drawerBase: (opts = {}) => {
        const { isOpen, contentHtml, onToggle, height = '35%', style = '', handleIconOpen = '▼', handleIconClose = '▲', className = '' } = opts;
        const icon = isOpen ? handleIconOpen : handleIconClose;
        const wrapperStyle = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 200; pointer-events: none; overflow: hidden;`;
        const drawerStyle = `position: absolute; bottom: 0; left: 0; width: 100%; height: ${height}; box-shadow: var(--shadow-lg); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: auto; display: flex; flex-direction: column; z-index: 201; border-top: 1px solid rgba(255,255,255,0.1); transform: translateY(${isOpen ? '0%' : '100%'}); ${style}`;
        const handleStyle = `position: absolute; right: 0; bottom: 100%; color: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; box-shadow: var(--shadow-sm); user-select: none; width: 60px; height: 40px; border-radius: 8px 8px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none; pointer-events: auto; z-index: 202; background: inherit;`;
        return `<div class="u-drawer-wrapper" style="${wrapperStyle}"><div class="u-drawer-body ${className}" style="${drawerStyle}"><div onclick="event.preventDefault(); event.stopPropagation(); ${onToggle}" style="${handleStyle}">${icon}</div><div style="width:100%; height:100%; overflow-y:auto; padding:15px; box-sizing:border-box;">${contentHtml}</div></div></div>`;
    },

    modalBase: (opts = {}) => {
        const { title, bodyHtml, footHtml, targetId = 'm-overlay', zIndex = 9000, className = '' } = opts;
        let modal = document.getElementById(targetId);
        if (!modal) {
            modal = document.createElement('div'); modal.id = targetId; modal.className = 'mask'; modal.style.zIndex = zIndex;
            modal.innerHTML = `<div class="modal ${className}"><div class="m-head"><span class="m-title"></span>${ui.atom.buttonBase({ label:'✕', theme:'ghost', style:'padding:0 8px; border:none;', action:`ui.composer.closeModal('${targetId}')` })}</div><div class="m-body"></div><div class="m-foot"></div></div>`;
            document.body.appendChild(modal);
        }
        modal.querySelector('.modal').className = `modal ${className}`;
        modal.querySelector('.m-title').innerText = title; 
        modal.querySelector('.m-body').innerHTML = bodyHtml;
        const foot = modal.querySelector('.m-foot'); 
        if (footHtml) { foot.innerHTML = footHtml; foot.style.display = 'flex'; } else { foot.style.display = 'none'; }
        modal.style.display = 'flex'; 
        requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('active')));
    }
};

// ============================================================================
// LAYER 3: Composers (組合器) - 變數已交接給 CSS 主題管理
// ============================================================================
ui.composer = {
    pageHeader: (opts = {}) => {
        const themeClass = `theme-${opts.variant || 'default'}`;
        return ui.atom.headerBase({ 
            ...opts, 
            className: themeClass,
            // 透過 CSS 變數自動取色
            style: `background: var(--current-bg); color: var(--current-text); border-bottom: 1px solid var(--current-border); ${opts.style || ''}` 
        });
    },

    qtySelector: (opts = {}) => {
        const themeClass = `theme-${opts.variant || 'default'}`;
        return ui.atom.qtySelectorBase({ 
            ...opts, 
            className: themeClass,
            style: `background: var(--current-soft); color: var(--current-text); border: 1px solid var(--current-border); ${opts.style || ''}` 
        });
    },

    formField: (opts = {}) => {
        const { label, inputHtml, hint = '' } = opts;
        return `<div class="input-group"><label class="section-title">${label}</label>${inputHtml}${hint ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${hint}</div>` : ''}</div>`;
    },

    drawer: (opts = {}) => {
        const themeClass = `theme-${opts.variant || 'story'}`; 
        return ui.atom.drawerBase({ 
            ...opts, 
            className: themeClass,
            style: `background: var(--current-bg); color: var(--current-text); border-top: 1px solid var(--current-border); ${opts.style || ''}` 
        });
    },

    cardVertical: (opts = {}) => {
        const themeClass = `theme-${opts.variant || 'default'}`;
        const mediaHtml = opts.imgPath ? `<div class="card-img-area"><img src="${opts.imgPath}" style="height:80px; object-fit:contain;"></div>` : (opts.iconHtml ? `<div class="card-img-area" style="font-size:3rem;">${opts.iconHtml}</div>` : '');
        return ui.atom.cardBase({
            className: `card-vertical ${themeClass}`,
            onClick: opts.onClick,
            style: `background: var(--current-bg); border-color: var(--current-border); color: var(--current-text); ${opts.style || ''}`,
            children: `${mediaHtml}<div class="card-info-area" style="text-align:center; margin-bottom:10px;"><div style="font-weight:bold;">${opts.title}</div>${opts.subTitle !== undefined ? `<div style="font-size:0.8rem; opacity:0.8; margin-top:2px; font-weight:bold;">${opts.subTitle}</div>` : ''}${opts.stock !== undefined ? `<div style="font-size:0.75rem; opacity:0.5; margin-top:2px;">庫存: ${opts.stock}</div>` : ''}</div><div style="width:100%;">${opts.actionBtnHtml || ui.atom.buttonBase({label:'購買', style:'width:100%;'})}</div>`
        });
    },

    centeredModalBody: (opts = {}) => {
        const { icon, title, desc, extraHtml = '' } = opts;
        return `<div style="text-align:center; padding:10px;"><div style="font-size:3.5rem; margin-bottom:10px; filter:drop-shadow(var(--shadow-sm));">${icon}</div><h3 style="margin-bottom:5px;">${title}</h3>${desc ? `<p style="opacity:0.7; font-size:0.9rem;">${desc}</p>` : ''}${extraHtml ? `<div style="margin-top:15px;">${extraHtml}</div>` : ''}</div>`;
    },

    closeModal: (id) => {
        const modal = document.getElementById(id || 'm-overlay');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => { if(!modal.classList.contains('active')) modal.style.display = 'none'; }, 200);
        }
    }
};

// ============================================================================
// LAYER 4: Smart Components (智慧元件) - 綁定遊戲邏輯
// ============================================================================
ui.smart = {
    // 移植 V42.0 龐大的 taskCard 邏輯
    taskCard: (t, isHistory = false) => {
        let leftHtml = '';
        if (isHistory) {
            const isSuccess = t.status === 'success' || t.done;
            const color = isSuccess ? 'var(--color-correct)' : 'var(--color-danger)';
            leftHtml = `<div style="font-size:1.4rem; color:${color}; width:24px; text-align:center; font-weight:bold; flex-shrink:0; margin-right:12px;">${isSuccess ? '✓' : '✕'}</div>`;
        } else {
            leftHtml = `<div class="chk ${t.done?'checked':''}" style="width:24px; height:24px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer; margin-right:12px; background:var(--bg-card); transition:all 0.2s;" onclick="event.stopPropagation(); act.toggleTask('${t.id}')">${t.done ? '<span style="font-size:16px; font-weight:bold;">✓</span>' : ''}</div>`;
        }

        let badges = '';
        if (t.importance >= 3) badges += ui.atom.badgeBase({text:'🔥', style:'color:#ef6c00; border:1px solid #ef6c00; background:transparent;'});
        if (t.urgency >= 3) badges += ui.atom.badgeBase({text:'⚡', style:'color:var(--color-danger); border:1px solid var(--color-danger); background:transparent;'});
        if (t.recurrence) badges += ui.atom.badgeBase({text:'🔁', style:'color:var(--color-info); border:1px solid var(--color-info); background:transparent;'});
        let skillIcons = (t.attrs && t.attrs.length > 0) ? `<span style="font-size:0.9rem; margin-left:4px; opacity:0.8;">${t.attrs.map(a => '💪').join('')}</span>` : '';
        const pinHtml = t.pinned ? `<span style="margin-left:auto; font-size:1rem; color:#5d4037;">📌</span>` : `<span style="margin-left:auto;"></span>`;

        const titleRow = `<div style="display:flex; align-items:center; gap:6px; width:100%;"><span class="task-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60%; font-weight:bold; color:var(--text);">${t.title}</span>${badges} ${skillIcons} ${pinHtml}</div>`;
        
        // 進度條邏輯
        let progressRow = '';
        if (!isHistory) {
            if (t.type === 'count') {
                const pct = Math.min(100, Math.max(0, (t.curr / t.target) * 100));
                progressRow = `<div style="margin-top:6px; width:100%; cursor:default;" onclick="event.stopPropagation();"><div class="u-progress"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${t.curr} / ${t.target}</div></div></div>`;
            } else if (t.subs && t.subs.length > 0) {
                const doneCount = t.subs.filter(s => s.done).length;
                let stepsHtml = '<div style="display:flex; align-items:center; justify-content:space-between; width:100%; margin-top:8px;">';
                for (let i = 1; i <= t.subs.length; i++) {
                    stepsHtml += `<div style="width:12px; height:12px; background:${i <= doneCount ? 'var(--color-correct)' : 'rgba(0,0,0,0.1)'}; border-radius:50%; flex-shrink:0; z-index:2; transition:background 0.3s;"></div>`;
                    if (i < t.subs.length) stepsHtml += `<div style="flex:1; height:4px; background:${i < doneCount ? 'var(--color-correct)' : 'rgba(0,0,0,0.1)'}; margin:0 -2px; z-index:1; transition:background 0.3s;"></div>`;
                }
                progressRow = `<div style="margin-top:6px; width:100%; cursor:default;" onclick="event.stopPropagation();">${stepsHtml}</div></div>`;
            }
        }

        const rightHtml = isHistory ? '' : ui.atom.buttonBase({label:'⚙️', theme:'ghost', action:`event.stopPropagation(); act.editTask('${t.id}')`, style:'padding:0 5px; opacity:0.6; flex-shrink:0;'});

        let subtaskHtml = '';
        if (t.type === 'count') {
            subtaskHtml = `<div style="margin-top:8px; border-top:1px dashed var(--border); padding-top:8px; display:flex; justify-content:space-between; align-items:center; cursor:default;" onclick="event.stopPropagation();"><span style="font-weight:bold; color:var(--color-gold-dark);">目前進度: ${t.curr} / ${t.target}</span><button class="u-btn u-btn-sm u-btn-correct" onclick="event.stopPropagation(); act.incrementTask('${t.id}')">+1 次數</button></div>`;
        } else if (t.subs && t.subs.length > 0) {
            subtaskHtml = `<div style="margin-top:8px; border-top:1px dashed var(--border); padding-top:8px; cursor:default;" onclick="event.stopPropagation();">` + t.subs.map((sub, idx) => `<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; cursor:pointer; padding:6px 4px; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'" onclick="event.stopPropagation(); act.toggleSubtask('${t.id}', ${idx})"><div class="chk ${sub.done?'checked':''}" style="width:18px; height:18px; border:1px solid ${sub.done?'var(--color-correct)':'var(--text-ghost)'}; border-radius:4px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${sub.done ? '<span style="color:#fff; font-size:12px; font-weight:bold;">✓</span>' : ''}</div><div style="font-size:0.9rem; ${sub.done?'text-decoration:line-through; opacity:0.5;':''} flex:1; user-select:none;">${sub.text}</div></div>`).join('') + `</div>`;
        }

        const dateValue = isHistory ? (t.finishTime || '未知') : (t.deadline || '');
        const dateDisplay = dateValue ? `<div style="text-align:right; font-size:0.8rem; opacity:0.6; margin-top:8px;">📅 ${dateValue}</div>` : '';
        const isExpanded = window.TempState && window.TempState.expandedTaskId === t.id;
        
        return `
        <div class="task-card ${t.done?'status-done':''}" onclick="view.toggleCardExpand('${t.id}')">
            <div class="task-main-row"> 
                ${leftHtml}
                <div class="task-content">${titleRow}${progressRow}</div>
                <div>${rightHtml}</div>
            </div>
            <div id="expand-${t.id}" style="${isExpanded?'display:block;':'display:none;'} padding-top:10px; margin-top:10px; font-size:0.9rem; border-top:1px dashed var(--border); opacity:0.8; padding-left: 36px;">
                ${t.desc ? `<div style="margin-bottom:8px; line-height:1.4;">${t.desc}</div>` : ''} 
                ${subtaskHtml}
                ${dateDisplay}
            </div>
        </div>`;
    },

    shopItem: (item, editBtnHtml = '') => {
        const isSoldOut = item.qty <= 0;
        const isOnce = item.type === 'once';
        const specialStyle = isOnce ? 'border: 2px solid var(--color-gold); background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(0,0,0,0) 100%); box-shadow: inset 0 2px 10px rgba(255, 215, 0, 0.15);' : '';
        const soldOutOverlay = isSoldOut ? `<div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:4; display:flex; align-items:center; justify-content:center; pointer-events:none;"><div style="border: 3px solid var(--color-danger); color: var(--color-danger); font-weight: bold; font-size: 1.2rem; padding: 5px 10px; transform: rotate(-15deg); border-radius: 8px; background:rgba(255,255,255,0.9); box-shadow:var(--shadow-sm);">SOLD OUT</div></div>` : '';
        const btnAction = isSoldOut 
            ? ui.atom.buttonBase({ label:'已售完', disabled:true, theme:'ghost', size:'sm', style:'width:100%;' }) 
            : ui.atom.buttonBase({ label:'購買', theme:'correct', size:'sm', style:'width:100%;', action:`shopView.renderBuyModal('${item.id}')` });

        return `<div style="position:relative; overflow:hidden; border-radius:var(--radius-md);">${editBtnHtml}${soldOutOverlay}${ui.composer.cardVertical({ style: specialStyle, title: item.name, subTitle: `<div style="display:flex; justify-content:center; gap:8px;"><span style="color:var(--color-danger); font-weight:bold;">💰${item.price}</span><span style="opacity:0.6; font-size:0.9rem;">| 剩 ${item.qty}</span></div>`, desc: item.desc, actionBtnHtml: btnAction })}</div>`;
    },

    wardrobeItem: (item, isWearing, isUnlocked, isPreviewing, previewAction, actionBtnHtml) => {
        const borderStyle = isPreviewing ? 'border-color: var(--color-gold); background: var(--color-gold-soft); box-shadow: inset 0 0 0 1px var(--color-gold);' : '';
        return `
        <div class="avatar-card" style="min-width:110px; height:165px; flex-shrink:0; border-radius:var(--radius-md); display:flex; flex-direction:column; padding:10px; transition:all var(--t-base); border: 1.5px solid transparent; ${borderStyle}">
            <div onclick="${previewAction}" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;">
                <img src="img/${item.id}.png" style="height:65px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.1));" onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=\\'font-size:2.5rem\\'>👕</span>'">
                <div style="font-size:0.8rem; margin-top:8px; font-weight:bold; color:var(--text-2); text-align:center;">${item.name}</div>
            </div>
            <div style="margin-top:5px; width:100%;">${actionBtnHtml}</div>
        </div>`;
    }
};

// ============================================================================
// [視窗與通用管理] Modal Manager & Global Utils (V43 Core)
// ============================================================================
ui.modal = {
    layers: { 'panel': 'm-panel', 'overlay': 'm-overlay', 'system': 'm-system', 'quick': 'm-panel' },
    render: (title, bodyHtml, footHtml, layer = 'overlay') => ui.atom.modalBase({ title, bodyHtml, footHtml, targetId: ui.modal.layers[layer] || 'm-overlay', zIndex: layer === 'system' ? 9999 : (layer === 'overlay' ? 9500 : 9000) }),
    close: ui.composer.closeModal,
    
    // [V43 優化] 一鍵關閉所有視窗
    closeAll: () => {
        ['m-overlay', 'm-panel', 'm-system'].forEach(id => ui.composer.closeModal(id));
    },

    footRow: (cancelAction, confirmAction, confirmLabel = '確定', confirmTheme = 'correct', cancelLabel = '取消') => `${ui.atom.buttonBase({label:cancelLabel, theme:'ghost', style:'flex:1;', action:cancelAction})} ${ui.atom.buttonBase({label:confirmLabel, theme:confirmTheme, style:'flex:2;', action:confirmAction})}`
};

if (window.EventBus && window.EVENTS) {
    window.EventBus.on(window.EVENTS.System.MODAL_CLOSE, (layerName) => {
        const targetId = ui.modal.layers[layerName] || layerName || 'm-overlay';
        ui.composer.closeModal(targetId); 
    });
    window.EventBus.on(window.EVENTS.System.TOAST, (msg) => view.showToast(msg));
}

view.getPriorityInfo = (importance, urgency) => {
    if (importance >= 3 && urgency >= 3) return { color: 'var(--color-danger)', label: '🔥 危機', border: 'var(--color-danger)' };
    if (importance >= 3) return { color: 'var(--color-info)', label: '💎 願景', border: 'var(--color-info)' };
    if (urgency >= 3) return { color: '#ef6c00', label: '⚡ 突發', border: '#ef6c00' };
    return { color: 'var(--text-muted)', label: '🍂 雜務', border: 'var(--text-muted)' };
};

view.toggleCardExpand = function(id) {
    if (!window.TempState) return;
    window.TempState.expandedTaskId = window.TempState.expandedTaskId === id ? null : id;
    if (window.taskView && taskView.render) taskView.render();
};

view.showToast = (msg) => {
    const old = document.querySelector('.u-toast'); if(old) old.remove();
    const toast = document.createElement('div'); toast.className = 'u-toast'; toast.innerHTML = msg;       
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
};
act.toast = view.showToast;

view.renderSystemModal = (type, msg, defVal = '') => {
    let title = '系統提示', body = `<div style="padding:20px; font-size:1.1rem; text-align:center;">${msg}</div>`, foot = '';
    if (type === 'alert') {
        title = '⚠️ 提示'; foot = ui.atom.buttonBase({label:'確定', theme:'normal', style:'width:100%;', action:"ui.composer.closeModal('m-system')"});
    } else if (type === 'confirm') {
        title = '❓ 確認'; foot = ui.modal.footRow("act.handleSysConfirm(false)", "act.handleSysConfirm(true)");
    } else if (type === 'prompt') {
        title = '✏️ 輸入'; body += `<div style="padding:0 20px;">${ui.atom.inputBase({type:'text', val:defVal, id:'sys-univ-input'})}</div>`; foot = ui.modal.footRow("ui.composer.closeModal('m-system')", "act.handleSysConfirm('prompt_submit')");
    }
    ui.modal.render(title, body, foot, 'system');
};

// ============================================================================
// [App 具體視圖] HUD, Navbar, Main (全面 V43 升級)
// ============================================================================
view.initHUD = (data) => {
    let container = document.getElementById('hud');
    if (!container) { container = document.createElement('div'); container.id = 'hud'; document.getElementById('app-frame').appendChild(container); }
    
    // [V43] 拔除 ui.component.avatar 與 badge
    const avatarHtml = `<div id="hud-avatar" class="u-avatar" onclick="act.navigate('stats')" style="cursor:pointer;">⏳</div>`;
    const gemFree = ui.atom.badgeBase({text: '💎 <span id="hud-gem-free">0</span>', style: 'color:var(--color-info); background:var(--color-info-soft); border-color:var(--color-info);'});
    const gemPaid = ui.atom.badgeBase({text: '💠 <span id="hud-gem-paid">0</span>', style: 'color:var(--color-info); background:var(--color-info-soft); border-color:var(--color-info);'});
    const goldBadge = ui.atom.badgeBase({text: '💰 <span id="hud-gold">0</span>', style: 'color:var(--color-gold); background:var(--color-gold-soft); border-color:var(--color-gold);'});

    container.innerHTML = `<div class="hud-left">${avatarHtml}<div class="hud-info"><div id="hud-name" class="hud-name">---</div><div class="hud-lv-row"><div class="hud-lv-txt">Lv.<span id="hud-lv">1</span></div><div id="hud-exp-container" style="flex:1"></div></div></div></div><div class="hud-right"><div class="res-row" onclick="act.openPayment()" style="display:flex; gap:4px; cursor:pointer;">${gemFree} ${gemPaid}</div><div class="res-row" style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">${goldBadge} <button onclick="view.renderSettings()" style="background:none; border:none; color:var(--color-gold); font-size:1.5rem; cursor:pointer; font-weight:bold;">≡</button></div></div>`;
    view.updateHUD(data);
};

view.updateHUD = (data) => {
    if (!data) data = window.GlobalState || {};
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };
    setText('hud-name', data.name || 'Commander'); setText('hud-lv', data.lv || 1); setText('hud-gem-free', data.freeGem || 0); setText('hud-gem-paid', data.paidGem || 0); setText('hud-gold', data.gold || 0);
    const expContainer = document.getElementById('hud-exp-container');
    if (expContainer) {
        const pct = Math.min(100, Math.max(0, ((data.exp || 0) / ((data.lv || 1) * 100)) * 100));
        expContainer.innerHTML = `<div class="u-progress"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${data.exp||0} / ${(data.lv||1)*100}</div></div>`;
    }
    if (window.Assets && window.Assets.getCharImgTag) {
        const avEl = document.getElementById('hud-avatar'); if (avEl) avEl.innerHTML = window.Assets.getCharImgTag('hud-avatar-img', 'width:100%;height:100%;object-fit:cover;');
    }
};

view.renderMain = () => {
    const container = document.getElementById('page-main'); if (!container) return;
    const isBasic = window.GlobalState?.settings?.mode === 'basic';
    const btnStyle3D = `width: 48px; height: 48px; border-radius: var(--radius-md); font-size: 1.6rem; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-card); border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); transition: transform var(--t-fast) var(--ease-bounce), box-shadow var(--t-fast); margin-bottom: 8px; cursor: pointer;`;
    const quickButtonsHtml = [{ icon: '📜', action: "act.openquickModal('quick')", show: true }, { icon: '👗', action: "act.navigate('avatar')", show: !isBasic }, { icon: '❓', action: "act.showQA()", show: !isBasic }].filter(b => b.show).map(b => `<div onclick="${b.action}" style="${btnStyle3D}" onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='var(--shadow-xs)';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)';">${b.icon}</div>`).join('');
    let charImg = window.Assets?.getCharImgTag ? window.Assets.getCharImgTag('main-char-img', 'height: 100%; width: auto; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));') : '<div style="font-size:6rem;">🦸</div>';
    
    const storyBtn = !isBasic ? ui.atom.buttonBase({
        label: '🌀 進入劇情模式', 
        theme: 'correct', 
        action: "EventBus.emit(window.EVENTS.Action.ENTER_STORY_MODE)", 
        style: `width: 240px; padding: 12px; border-radius: var(--radius-full); font-size: 1.1rem;`
    }) : '';
    
    container.innerHTML = `<div style="position: relative; width: 100%; height: 100%; overflow: hidden;"><div style="position: absolute; top: 20px; right: 14px; z-index: 50; display: flex; flex-direction: column;">${quickButtonsHtml}</div><div style="width: 100%; height: 75%; display: flex; align-items: flex-end; justify-content: center; transform: translateY(40px); position: relative; z-index: 10; pointer-events: none;"><div style="height: 100%; width: auto; display: flex; align-items: flex-end; pointer-events: none;">${charImg}</div><div onclick="act.navigate('stats')" style="position: absolute; bottom: 0; left: 30%; width: 40%; height: 90%; cursor: pointer; pointer-events: auto; z-index: 20;"></div></div><div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 100; width: auto; display: flex; justify-content: center;">${storyBtn}</div></div>`;
};

view.renderNavbar = (targetPageId) => {
    let container = document.getElementById('navbar');
    if (!container) { container = document.createElement('div'); container.id = 'navbar'; document.getElementById('app-frame').appendChild(container); }
    const navItems = [{ id: 'task', icon: '📋', label: '任務', action: "act.goToTaskRoot()" }, { id: 'main', icon: '🏠', label: '大廳', action: "act.navigate('main')" }, { id: 'shop', icon: '🛒', label: '商店', action: "act.navigate('shop')" }];
    const activeId = targetPageId || window.TempState?.currentView || (document.querySelector('.page.active')?.id.replace('page-', '')) || 'main';
    container.innerHTML = navItems.map(item => `<button class="nav-item ${item.id === activeId ? 'active' : ''}" id="nav-${item.id}" onclick="${item.action}"><span style="font-size: 1.4rem; display: block; margin-bottom: 2px;">${item.icon}</span><span style="font-size: 0.7rem; font-weight: bold;">${item.label}</span></button>`).join('');
};

view.render = (targetPageId) => {
    if (!window.GlobalState) return;
    const activePageId = targetPageId || window.TempState?.currentView || (document.querySelector('.page.active')?.id.replace('page-', '')) || 'main';
    if (view.initHUD) view.initHUD(window.GlobalState);
    if (view.renderNavbar) view.renderNavbar(activePageId); 
    if (activePageId === 'main' && view.renderMain) view.renderMain();
};