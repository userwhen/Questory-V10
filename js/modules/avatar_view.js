/* js/modules/avatar_view.js - V51.3 Clean Theme Edition */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Avatar = {
    render: function() {
        window.SQ.Temp.currentView = 'avatar';
        const container = document.getElementById('page-avatar');
        if (!container) return;

        // 🌟 修正：移除寫死的木頭色，改用系統標準變數
        const headerHtml = ui.composer.pageHeader({
            title: '👗 更衣室',
            rightContent: ui.atom.buttonBase({ label:'返回', icon: '↵', theme:'normal', action:'navigate', actionVal:'main', style:'padding: 6px 12px; font-size:0.9rem; border-radius:8px; background:var(--bg-box); color:var(--text); border:none;' }),
            style: 'background:var(--bg-card); color:var(--text); border-bottom:1px solid var(--border);'
        });

        // 🌟 修正：舞台與衣櫃背景全面改用變數，完美支援深/淺色主題
        container.innerHTML = `
            <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; background:var(--bg-panel); overflow:hidden;">
                ${headerHtml}
                <div id="avatar-stage" style="flex:1; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; background:var(--bg-body);"></div>
                <div style="height:35%; min-height:200px; flex-shrink:0; background:var(--bg-elevated); display:flex; flex-direction:column; box-shadow:0 -4px 15px var(--shadow-md); z-index:10;">
                    <div style="flex-shrink:0; padding:12px 15px; font-weight:bold; background:var(--bg-box); color:var(--text); border-bottom:1px solid var(--border); box-shadow: var(--shadow-sm);">我的衣櫃</div>
                    <div id="wardrobe-list" style="flex:1; overflow-x:auto; display:flex; align-items:center; gap:12px; padding:10px 15px;"></div>
                </div>
            </div>
        `;

        this.renderStage();
        this.renderWardrobe();
    },

    renderStage: function() {
        const stage = document.getElementById('avatar-stage');
        if (!stage) return;

        const preview = window.SQ.Temp.preview || {};
        let imgHtml = '';

        if (preview.suit) {
            imgHtml = `<img src="img/${preview.suit}.png" data-fallback="true" style="height:90%; object-fit:contain; filter:drop-shadow(var(--shadow-md)); transition:transform var(--t-base);">
                       <div style="display:none; font-size:5rem;">🦸</div>`;
        } else {
            if (window.Assets && window.Assets.getCharImgTag) {
                imgHtml = window.Assets.getCharImgTag('avatar-char-img', 'height:90%; object-fit:contain; filter:drop-shadow(var(--shadow-md));').replace('<img', '<img data-fallback="true"');
            } else {
                imgHtml = '<div style="font-size:6rem;">🧍</div>';
            }
        }
        
        // 🌟 修正：利用 var(--bg-box) 達成自動對比，並嚴格控制 z-index
        stage.innerHTML = `
            <div style="position:absolute; inset:0; background: var(--bg-box); z-index: 0; pointer-events:none;"></div>

            <div style="position:absolute; width:70%; height:70%; background:radial-gradient(circle, var(--text) 0%, transparent 60%); opacity: 0.15; top:50%; left:50%; transform:translate(-50%, -50%); pointer-events:none; z-index: 1;"></div>

            <div style="position:relative; z-index: 10; height:100%; display:flex; align-items:center; justify-content:center;">
                ${imgHtml}
            </div>
        `;
    },

    renderWardrobe: function() {
        const list = document.getElementById('wardrobe-list');
        if (!list) return;

        const shopData = window.GameConfig?.AvatarShop || [];
        const unlocked = window.SQ.State.avatar?.unlocked || [];
        const wearing = window.SQ.State.avatar?.wearing || {};
        const preview = window.SQ.Temp.preview || {};

        if (shopData.length === 0) {
            list.innerHTML = `<div class="ui-empty"><div class="ui-empty-icon">👕</div>衣櫃空空如也</div>`;
            return;
        }

        list.innerHTML = shopData.map(item => {
            const isWearing = wearing.suit === item.id;
            const isUnlocked = unlocked.includes(item.id);
            const isPreviewing = preview.suit === item.id;

            let btnActionHtml = '';
            if (isWearing) {
                btnActionHtml = ui.atom.buttonBase({ label: '穿著中', theme: 'ghost', size: 'sm', disabled: true, style: 'width:100%;' });
            } else if (isUnlocked) {
                btnActionHtml = ui.atom.buttonBase({ label: '穿上', theme: 'correct', size: 'sm', action: 'wearAvatarItem', actionId: item.id, style: 'width:100%;' });
            } else {
                btnActionHtml = ui.atom.buttonBase({ label: `💎 ${item.price}`, theme: 'normal', size: 'sm', action: 'buyAvatarItem', actionId: item.id, style: 'width:100%;' });
            }

            const borderStyle = isPreviewing ? 'border-color: var(--color-gold); background: var(--color-gold-soft); box-shadow: inset 0 0 0 1px var(--color-gold);' : '';
            return `
            <div class="avatar-card" style="min-width:110px; height:165px; flex-shrink:0; border-radius:var(--radius-md); display:flex; flex-direction:column; padding:10px; transition:all var(--t-base); border: 1.5px solid transparent; ${borderStyle}">
                <div data-action="previewAvatarItem" data-id="${item.id}" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;">
                    <img src="img/${item.id}.png" data-fallback="true" style="height:65px; object-fit:contain; filter:drop-shadow(var(--shadow-sm));">
                    <div style="display:none; font-size:2.5rem">👕</div>
                    <div style="font-size:0.8rem; margin-top:8px; font-weight:bold; color:var(--text-2); text-align:center;">${item.name}</div>
                </div>
                <div style="margin-top:5px; width:100%;">${btnActionHtml}</div>
            </div>`;
        }).join('');
    }
};