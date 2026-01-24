/* js/view.js - V34.Strict (Restored Navbar & UI Locked) */

window.ui = window.ui || {};
window.view = window.view || {};
window.act = window.act || {};

// =============================================================================
// 1. 原子元件 (Atoms) - [鎖定不可動]
// =============================================================================
ui.component = {
    btn: (opts) => {
        const themeMap = {
            'correct': 'u-btn-correct', 'danger': 'u-btn-danger',
            'normal': 'u-btn-normal', 'ghost': 'u-btn-ghost',
        };
        const themeClass = themeMap[opts.theme] || 'u-btn-secondary';
        const sizeClass = opts.size ? `u-btn-${opts.size}` : '';
        const disabledAttr = opts.disabled ? 'disabled' : '';
        const idAttr = opts.id ? `id="${opts.id}"` : '';
        const action = opts.disabled ? '' : `onclick="${opts.action}"`;
        const iconHtml = opts.icon ? `<span style="margin-right:4px;">${opts.icon}</span>` : '';

        return `<button ${idAttr} class="u-btn ${themeClass} ${sizeClass}" style="${opts.style || ''}" ${action} ${disabledAttr}>${iconHtml}${opts.label||''}</button>`;
    },
    
    pillBtn: (opts) => {
        const baseStyle = opts.style || '';
        const pillStyle = `border-radius: 50px; padding: 4px 12px; white-space: nowrap; ${baseStyle}`;
        return ui.component.btn({
            ...opts,
            size: opts.size || 'sm', 
            style: pillStyle
        });
    },

    pill: (text, color, id, solid = false) => {
        const idAttr = id ? `id="${id}"` : '';
        const style = solid 
            ? `background: ${color}; color: #fff; border: none;` 
            : `border-color: ${color}; color: ${color}; background: rgba(0,0,0,0.05);`;
        return `<span ${idAttr} class="u-pill" style="${style}">${text}</span>`;
    },
    
    avatar: (id, action, imgContent) => {
        return `<div id="${id}" class="u-avatar" onclick="${action}">${imgContent}</div>`;
    },
    
    // 立繪/圖片按鈕 (Sprite)
    sprite: ({ src, action, width, height, style, id }) => {
        const idAttr = id ? `id="${id}"` : '';
        const clickAttr = action ? `onclick="${action}"` : '';
        const cursorStyle = action ? 'cursor: pointer;' : 'cursor: default;';
        const sizeStyle = `width:${width || 'auto'}; height:${height || 'auto'};`;
        
        return `
            <img ${idAttr} src="${src}" ${clickAttr} 
                 class="u-sprite"
                 style="display:block; object-fit:contain; -webkit-user-drag: none; ${sizeStyle} ${cursorStyle} ${style||''}"
                 onmousedown="if(this.onclick) this.style.transform='scale(0.95)'"
                 onmouseup="if(this.onclick) this.style.transform='scale(1)'"
                 onmouseleave="if(this.onclick) this.style.transform='scale(1)'"
            >
        `;
    },
    
    segment: (options, currentVal, onAction) => {
        return options.map(opt => {
            const isActive = currentVal === opt.val;
            const actionCall = onAction.includes('(') ? onAction : `${onAction}('${opt.val}')`;
            return ui.component.pillBtn({
                label: opt.label,
                theme: isActive ? 'correct' : 'normal',
                style: `flex:1; margin:2px; ${isActive ? 'box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);' : ''}`,
                action: actionCall
            });
        }).join('');
    },
};

// =============================================================================
// 2. 容器與標籤 (Containers & Tabs) - [鎖定不可動]
// =============================================================================
ui.container = {
    box: (content, style='') => `<div class="u-box" style="${style}">${content}</div>`,
    bar: (content, style='') => `<div class="u-bar" style="${style}">${content}</div>`
};

ui.tabs = {
    scrollX: (options, currentVal, actionName) => {
        const buttons = options.map(opt => ui.component.btn({
            label: opt,
            theme: opt === currentVal ? 'correct' : 'ghost',
            size: 'sm',
            style: 'border-radius:15px; white-space:nowrap; flex-shrink:0; margin-right:5px;',
            action: `${actionName}('${opt}')`
        })).join('');
        return `<div style="display:flex; overflow-x:auto; padding-bottom:5px; -webkit-overflow-scrolling:touch; gap:5px;">${buttons}</div>`;
    },
    sliding: (label1, label2, isLeft, act1, act2) => {
        return `
        <div style="display:flex; background:rgba(0,0,0,0.1); border-radius:50px; padding:4px; margin:10px 15px;">
            ${ui.component.pillBtn({label:label1, theme:isLeft?'correct':'ghost', style:'flex:1;', action:act1})}
            ${ui.component.pillBtn({label:label2, theme:!isLeft?'correct':'ghost', style:'flex:1;', action:act2})}
        </div>`;
    }
};

// =============================================================================
// 3. 輸入元件 (Inputs) - [鎖定不可動]
// =============================================================================
ui.input = {
    text: (val, placeholder, onInput, id) => 
        `<input type="text" id="${id||''}" class="inp" value="${val||''}" placeholder="${placeholder||''}" oninput="${onInput}">`,

    textarea: (val, placeholder, onInput, id) => 
        `<textarea id="${id||''}" class="inp" rows="3" placeholder="${placeholder||''}" oninput="${onInput}">${val||''}</textarea>`,

    number: (val, onInput, digit=4, id) => {
        const width = digit === 2 ? '60px' : '100px';
        return `<input type="number" id="${id||''}" class="inp inp-num" style="width:${width}; text-align:center;" value="${val||0}" oninput="${onInput}">`;
    },
    
    datetime: (val, onChange, id) => 
        `<input type="datetime-local" id="${id||''}" class="inp" value="${val||''}" onchange="${onChange}" style="width:100%;">`,
    
    select: (options, currentVal, onChange, id) => {
        const optsHtml = options.map(opt => 
            `<option value="${opt.val||opt.value}" ${ (opt.val||opt.value) == currentVal ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        return `<select id="${id||''}" onchange="${onChange}" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc; background:#fff; outline:none; font-size:0.9rem;">${optsHtml}</select>`;
    },

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
};

// =============================================================================
// 4. 進度與佈局 (Layouts) - [鎖定不可動]
// =============================================================================
ui.progress = {
    bar: (curr, max, text, style='') => {
        const pct = Math.min(100, Math.max(0, (curr / max) * 100));
        return `
            <div class="u-progress" style="${style}">
                <div class="u-progress-bar" style="width:${pct}%"></div>
                <div class="u-progress-text">${text || ''}</div>
            </div>`;
    },
    stepWizard: (currStep, totalSteps) => {
        let html = '<div style="display:flex; align-items:center; justify-content:space-between; width:100%;">';
        for (let i = 1; i <= totalSteps; i++) {
            let state = 'gray'; 
            if (i < currStep) state = 'green'; 
            else if (i === currStep) state = 'gold'; 

            const color = state==='green'?'#4caf50':(state==='gold'?'#ffb300':'#ccc');
            const circle = `<div style="width:12px; height:12px; border-radius:50%; background:${color}; margin:0 2px;"></div>`;
            html += circle;
            if (i < totalSteps) html += `<div style="flex:1; height:2px; background:#eee;"></div>`;
        }
        return html + '</div>';
    }
};

ui.layout = {
    flexRow: (content, gap='10px', justify='space-between') => 
        `<div style="display:flex; align-items:center; justify-content:${justify}; gap:${gap}; width:100%;">${content}</div>`,
    grid: (content, cols='2', gap='10px') => 
        `<div style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:${gap}; width:100%;">${content}</div>`,
    scrollX: (options, currentVal, actionName) => {
        const buttons = options.map(opt => ui.component.pillBtn({
            label: opt,
            theme: opt === currentVal ? 'normal' : 'ghost',
            style: 'flex-shrink:0; margin-right:5px;', 
            action: `${actionName}('${opt}')`
        })).join('');

        return `<div style="display:flex; overflow-x:auto; padding-bottom:5px; -webkit-overflow-scrolling:touch; gap:5px;">${buttons}</div>`;
    },
    drawer: (isOpen, contentHtml, onOpen, onClose) => {
        const handleStyle = `
            width: 40px; height: 50px; 
            background: #222; color: #fff; 
            border: 1px solid #555; border-bottom: none; 
            display: flex; align-items: center; justify-content: center; 
            cursor: pointer; position: absolute; top: -50px;
            border-radius: 8px 8px 0 0;
        `;
        return `
            <div id="tag-drawer-unit" class="${isOpen ? 'open' : ''}" 
                 style="position: absolute; bottom: 0; right: 0; width: 100%; height: 200px; z-index: 20; transform: translateX(${isOpen ? '0%' : '100%'}); transition: transform 0.3s ease;">
                <div onclick="${onOpen}" style="${handleStyle} left: -40px;">◁</div>
                <div id="tag-drawer-body" style="width: 100%; height: 100%; background: rgba(10,10,10,0.95); border-top: 2px solid #ffd700; padding: 15px; overflow-y: auto;">
                    ${contentHtml}
                </div>
                <div onclick="${onClose}" style="${handleStyle} right: 0; border-radius: 8px 0 0 0;">▷</div>
            </div>
        `;
    },
    
    scroller: (header, body, id='') => `
        <div style="display:flex; flex-direction:column; height:100%; width:100%; overflow:hidden; position:relative;">
            <div style="flex-shrink:0; z-index:2;">${header}</div>
            <div id="${id}" style="flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; padding-bottom:80px;">
                ${body}
            </div>
        </div>`
};

// =============================================================================
// 5. 卡片元件 (Cards) - [鎖定不可動]
// =============================================================================
ui.card = {
    vertical: (optsOrTitle, subTitle, desc, actionBtn, onClick) => {
        let opts = typeof optsOrTitle === 'object' ? optsOrTitle : { title: optsOrTitle, subTitle: subTitle, desc: desc, actionBtnHtml: actionBtn, onClick: onClick };
        let imgHtml = '';
        if (opts.imgPath) {
            imgHtml = `<div class="card-img-area"><img src="${opts.imgPath}" style="height:80px; object-fit:contain;"></div>`;
        }
        const borderStyle = opts.isHighlight ? 'border: 2px solid var(--color-primary);' : '';
        const clickAction = opts.onClick ? `onclick="${opts.onClick}"` : '';

        return `
        <div class="card-vertical" style="${opts.style||''} ${borderStyle}" ${clickAction}>
            ${imgHtml}
            <div class="card-info-area" style="text-align:center;">
                <div style="font-weight:bold; margin-bottom:4px;">${opts.title}</div>
                <div style="font-size:0.8rem; color:#666;">${opts.subTitle||''}</div>
                <div style="font-size:0.75rem; color:#999;">${opts.desc||''}</div>
            </div>
            <div class="card-action-area" style="margin-top:8px;">${opts.actionBtnHtml||''}</div>
        </div>`;
    },

    task: (t, isReadOnly = false) => {
        const left = isReadOnly 
            ? `<div style="font-size:1.2rem; color:var(--color-correct); width:30px; text-align:center;">✓</div>`
            : `<div class="task-checkbox ${t.done?'checked':''}" onclick="event.stopPropagation(); act.toggleTask('${t.id}')">${t.done?'✓':''}</div>`;

        let pills = '';
        if (t.importance >= 3) pills += ui.component.pill('🔥', 'orange', '', 'soft');
        if (t.recurrence) pills += ui.component.pill('🔁', 'blue', '', 'soft');

        const progressRow = (!t.done && t.type === 'count') 
            ? `<div style="margin-top:5px;">${ui.progress.bar(t.curr, t.target)}</div>` 
            : '';

        const right = isReadOnly ? '' : ui.component.btn({ label:'⚙️', theme:'ghost', action:`event.stopPropagation(); act.editTask('${t.id}')` });

        return `
            <div class="task-card ${t.done?'status-done':''}" ${!isReadOnly ? `onclick="view.toggleCardExpand('${t.id}')"` : ''}>
                <div class="task-main-row">
                    <div>${left}</div>
                    <div class="task-content" style="flex:1;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="task-title">${t.title}</span>${pills}
                        </div>
                        ${progressRow}
                    </div>
                    <div>${right}</div>
                </div>
                <div id="expand-${t.id}" style="display:none; padding-top:10px; border-top:1px dashed #eee; margin-top:10px; font-size:0.9rem; color:#666;">
                    ${t.desc || '無描述'} <br>
                    <span style="font-size:0.8rem; color:#aaa;">📅 ${t.deadline || '無期限'}</span>
                </div>
            </div>`;
    },
    
    nav: ({ icon, title, desc, theme, action }) => {
        return `
            <div class="nav-card theme-${theme || 'normal'}" onclick="${action}" 
                 style="display:flex; align-items:center; gap:12px; padding:12px; background:rgba(255,255,255,0.8); border-radius:12px; cursor:pointer; border:1px solid ${theme==='gold'?'var(--color-gold)':'#eee'}; box-shadow:0 2px 6px rgba(0,0,0,0.05); margin-top:5px;">
                <div style="font-size:1.5rem;">${icon}</div>
                <div style="flex:1; text-align:left;">
                    <div style="font-weight:bold; font-size:0.95rem; color:#4e342e;">${title}</div>
                    <div style="font-size:0.75rem; color:#8d6e63; line-height:1.2;">${desc}</div>
                </div>
                <div style="color:${theme==='gold'?'var(--color-gold)':'#ccc'}; font-weight:bold;">➜</div>
            </div>`;
    },

    achievement: (a) => {
        return `<div class="task-card" style="border-left: 4px solid gold;">
            <div style="font-weight:bold;">${a.title}</div>
            <div style="font-size:0.85rem; color:#666;">${a.desc}</div>
            <div style="margin-top:5px;">${ui.progress.bar(a.curr, a.targetVal, `${a.curr}/${a.targetVal}`)}</div>
            <div style="text-align:right; margin-top:5px;">
                ${a.done && !a.claimed ? ui.component.btn({label:'領取', theme:'correct', size:'sm', action:`act.claim('${a.id}')`}) : (a.claimed ? '已領取' : '')}
                ${ui.component.btn({label:'⚙️', theme:'ghost', size:'sm', action:`act.editAch('${a.id}')`})}
            </div>
        </div>`;
    }
};

// =============================================================================
// 6. 視窗工廠 (Modals) - [修正：層級分流]
// =============================================================================
ui.modal = {
    render: (title, bodyHtml, footHtml, layer = 'overlay') => {
        // [關鍵修改] 根據 layer 決定 ID，對應 CSS z-index
        // system: 緊急/警示 (z-index 9999)
        // overlay: 確認/詳情 (z-index 9500)
        // panel: 一般功能面板 (z-index 9000)
        const layers = { 'panel': 'm-panel', 'overlay': 'm-overlay', 'system': 'm-system' };
        const targetId = layers[layer] || layers['overlay'];

        let modal = document.getElementById(targetId);
        
        // 如果不存在，動態建立 (確保它在 HTML 最尾端，層級最高)
        if (!modal) {
            modal = document.createElement('div');
            modal.id = targetId;
            modal.className = 'mask'; // CSS: .mask { z-index: 根據 ID 決定 或預設 }
            
            // 這裡補上 CSS 對應的 style 確保 JS 邏輯生效
            if (layer === 'system') modal.style.zIndex = '9999';
            else if (layer === 'overlay') modal.style.zIndex = '9500';
            else modal.style.zIndex = '9000';

            const closeBtnHtml = ui.component.btn({
                label: '✕',
                theme: 'ghost',
                style: 'font-size: 1.2rem; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;'
            });

            modal.innerHTML = `
                <div class="modal">
                    <div class="m-head">
                        <span class="m-title"></span>
                        ${closeBtnHtml}
                    </div>
                    <div class="m-body"></div>
                    <div class="m-foot"></div>
                </div>`;
            document.body.appendChild(modal);
        }

        const closeBtn = modal.querySelector('.m-head button');
        closeBtn.setAttribute('onclick', `window.act.closeModal('${targetId}')`);

        modal.querySelector('.m-title').innerText = title;
        modal.querySelector('.m-body').innerHTML = bodyHtml;
        
        const footEl = modal.querySelector('.m-foot');
        if (footHtml) {
            footEl.style.display = 'flex';
            footEl.innerHTML = footHtml;
        } else {
            footEl.style.display = 'none';
        }

        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('active'));
    },

    close: (id) => {
        const targetId = id || 'm-overlay';
        const modal = document.getElementById(targetId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => { 
                if (!modal.classList.contains('active')) {
                    modal.style.display = 'none'; 
                    // 如果沒有其他啟動中的 modal，才移除 body 的鎖定
                    if (!document.querySelector('.mask.active')) {
                        document.body.classList.remove('modal-open');
                    }
                }
            }, 300);
        }
    }
};

// =============================================================================
// 7. 全域橋接 (Bridge)
// =============================================================================
if (window.EventBus) {
    window.EventBus.on(window.EVENTS.System.MODAL_CLOSE, (id) => {
        console.log("🎯 View 接收到關閉訊號:", id);
        ui.modal.close(id || 'm-overlay'); 
    });
}

view.toggleCardExpand = (id) => {
    const el = document.getElementById(`expand-${id}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

view.showToast = (msg) => {
    const old = document.querySelector('.u-toast'); if(old) old.remove();
    const toast = document.createElement('div'); 
    toast.className = 'u-toast show';
    // 確保 toast 層級最高
    toast.style.zIndex = '10000';
    toast.innerHTML = ui.component.pill(msg, 'rgba(0,0,0,0.8)', '', true);
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
};
act.toast = view.showToast;

// ==========================================
// [Part 3] Implementation (具體渲染邏輯)
// ==========================================

// 1. HUD 渲染
view.initHUD = (data) => {
    const container = document.getElementById('hud');
    if (!container) return;

    container.innerHTML = `
        <div class="hud-left">
            ${ui.component.avatar('hud-avatar', "act.navigate('stats')", '⏳')}
            <div class="hud-info">
                <div id="hud-name" class="hud-name">---</div>
                <div class="hud-lv-row">
                    <div class="hud-lv-txt">Lv.<span id="hud-lv">1</span></div>
                    <div id="hud-exp-container" style="flex:1">
                        ${ui.progress.bar(0, 100)}
                    </div>
                </div>
            </div>
        </div>
        <div class="hud-right">
            <div class="res-row" onclick="act.openPayment()">
                ${ui.component.pill('💎 0', '#b3e5fc', 'hud-gem-free')}
                ${ui.component.pill('💠 0', '#e1bee7', 'hud-gem-paid')}
            </div>
            <div class="res-row" style="justify-content: flex-end;">
                ${ui.component.pill('💰 0', 'gold', 'hud-gold')}
                ${ui.component.btn({label:'≡', theme:'ghost', style:'font-size:1.5rem; padding:0 8px; color: #ffb300;', action:'view.renderSettings()'})}
            </div>
        </div>`;

    view.updateHUD(data);
};

view.updateHUD = (data) => {
    if (!data) data = window.GlobalState || {};

    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };
    
    setText('hud-name', data.name || 'Commander');
    setText('hud-lv', data.lv || 1);
    setText('hud-gem-free', `💎 ${data.freeGem || 0}`);
    setText('hud-gem-paid', `💠 ${data.paidGem || 0}`);
    setText('hud-gold', `💰 ${data.gold || 0}`);

    const expContainer = document.getElementById('hud-exp-container');
    if (expContainer) {
        const lv = data.lv || 1;
        expContainer.innerHTML = ui.progress.bar(data.exp || 0, lv * 100);
    }

    if (window.Assets && window.Assets.getCharImgTag) {
        const avatarEl = document.getElementById('hud-avatar');
        if (avatarEl) avatarEl.innerHTML = window.Assets.getCharImgTag('hud-avatar-img', 'width:100%; height:100%; object-fit:cover;');
    }
};

// 2. Main Page 渲染 (大廳)
view.renderMain = (mode) => {
    view.hideFab(); 
    const container = document.getElementById('page-main');
    if (!container) return;

    if (container.innerHTML.trim() === "") {
        container.innerHTML = `
            <div id="quick-icons-normal" class="quick-area-normal"></div>
            <div class="main-scene"></div>
        `;
    }

    const quickArea = document.getElementById('quick-icons-normal');
    const sceneArea = container.querySelector('.main-scene');
    
    const isBasic = window.GlobalState?.settings?.mode === 'basic';
    
    const buttons = [
        { icon: '📜', action: "act.openModal('quick')", show: true },
        { icon: '🎒', action: "act.openModal('bag')", show: true },
        { icon: '👗', action: "act.navigate('avatar')", show: !isBasic },
        { icon: '❓', action: "act.showQA()", show: !isBasic }
    ];

    if (quickArea) {
        quickArea.innerHTML = buttons
            .filter(b => b.show)
            .map(b => ui.component.btn({
                label: b.icon, theme: 'normal', action: b.action,
                style: 'width:44px; height:44px; border-radius: 10px; font-size:1.3rem;'
            })).join('');
    }

    let charHtml = (window.Assets && Assets.getCharImgTag) 
        ? Assets.getCharImgTag('main-char-img') 
        : '<div style="font-size:5rem;">🦸</div>';

    const storyBtn = !isBasic ? ui.component.btn({
        label: '🌀 劇情模式', theme: 'correct', action: 'act.enterStoryMode()',
        style: 'width:200px; margin: 20px auto; display:block; border-radius:25px;'
    }) : '';

    if (sceneArea) {
        sceneArea.innerHTML = `
            <div class="char-stage" onclick="act.navigate('stats')" style="cursor:pointer; text-align:center;">
                ${charHtml}
            </div>
            ${storyBtn}
        `;
    }
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
        { id: 'task', icon: '📋', label: '任務' },
        { id: 'main', icon: '🏠', label: '大廳' },
        { id: 'shop', icon: '🛒', label: '商店' }
    ];

    const activePage = document.querySelector('.page.active');
    const activeId = activePage ? activePage.id.replace('page-', '') : 'main';

    container.innerHTML = navItems.map(item => {
        const isActive = item.id === activeId ? 'active' : '';
        return `
            <button class="nav-item ${isActive}" id="nav-${item.id}" onclick="act.navigate('${item.id}')">
                <span style="font-size: 1.4rem; display: block;">${item.icon}</span> 
                <span style="font-size: 0.7rem; font-weight: bold;">${item.label}</span>
            </button>`;
    }).join('');
};

// 4. System Modals (強制 system 層級)
view.renderSystemModal = (type, msg, defVal) => {
    const title = type === 'confirm' ? '確認操作' : (type === 'prompt' ? '請輸入' : '系統提示');
    let body = `<div style="padding:10px; font-weight:bold; text-align:center;">${msg.replace(/\n/g, '<br>')}</div>`;
    
    if (type === 'prompt') {
        body += `<div style="margin-top:15px;">${ui.input.text(defVal, '請輸入內容...', '', 'sys-univ-input')}</div>`;
    }
    
    let foot = '';
    if (type === 'alert') {
        foot = ui.component.btn({ label:'我知道了', theme:'correct', action:'act.handleSysConfirm(true)' });
    } else {
        const cancelBtn = ui.component.btn({ label:'取消', theme:'normal', action:'act.handleSysConfirm(false)' });
        const confirmAction = type === 'prompt' ? "'prompt_submit'" : 'true';
        const confirmBtn = ui.component.btn({ label:'確定', theme:'correct', action: `act.handleSysConfirm(${confirmAction})` });
        foot = ui.layout.flexRow(`${cancelBtn}${confirmBtn}`, 'center', 'center');
    }

    // 強制使用 system 層級 (z-index 9999)
    ui.modal.render(title, body, foot, 'system');
    
    if (type === 'prompt') {
        setTimeout(() => { 
            const inp = document.querySelector('#sys-univ-input'); 
            if(inp) inp.focus(); 
        }, 150);
    }
};

view.renderModal = ui.modal.render;

view.hideFab = () => {
    const fab = document.getElementById('global-fab');
    if(fab) fab.style.display = 'none';
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