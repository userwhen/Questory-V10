/* js/modules/avatar_view.js - V51.2 Zero Inline Events */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Avatar = {
    render: function() {
        window.SQ.Temp.currentView = 'avatar';
        const container = document.getElementById('page-avatar');
        if (!container) return;

        const headerHtml = ui.composer.pageHeader({
            title: '👗 更衣室',
            rightContent: ui.atom.buttonBase({ label:'返回', icon: '↵', theme:'normal', action:'navigate', actionVal:'main', style:'padding: 6px 12px; font-size:0.9rem; border-radius:8px; background:rgba(255,255,255,0.4); color:#5d4037; border:none;' }),
            style: 'background:#d8a273; color:#5d4037; border-bottom:1px solid #c88c51;'
        });

        container.innerHTML = `
            <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; background:var(--bg-panel); overflow:hidden;">
                ${headerHtml}
                <div id="avatar-stage" style="flex:1; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; background:radial-gradient(circle, #fffaf0 0%, #f0e2d3 80%);"></div>
                <div style="height:35%; min-height:200px; flex-shrink:0; background:#d8a273; display:flex; flex-direction:column; box-shadow:0 -4px 15px rgba(139,69,19,0.15); z-index:10;">
                    <div style="flex-shrink:0; padding:12px 15px; font-weight:bold; background:rgba(255,255,255,0.1); color:#4a332a; border-bottom:1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">我的衣櫃</div>
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
            // 拔除 onerror，改用 data-fallback 讓 main.js 大腦接管
            imgHtml = `<img src="img/${preview.suit}.png" data-fallback="true" style="height:90%; object-fit:contain; filter:drop-shadow(0 8px 20px rgba(0,0,0,0.25)); transition:transform var(--t-base);">
                       <div style="display:none; font-size:5rem;">🦸</div>`;
        } else {
            if (window.Assets && window.Assets.getCharImgTag) {
                // CharImgTag 也加入了 fallback 支援
                imgHtml = window.Assets.getCharImgTag('avatar-char-img', 'height:90%; object-fit:contain; filter:drop-shadow(0 8px 20px rgba(0,0,0,0.25));').replace('<img', '<img data-fallback="true"');
            } else {
                imgHtml = '<div style="font-size:6rem;">🧍</div>';
            }
        }
        
        stage.innerHTML = `
            <div style="position:absolute; width:70%; height:70%; background:radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 60%); top:50%; left:50%; transform:translate(-50%, -50%); pointer-events:none;"></div>
            ${imgHtml}
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

            // 拔除 onclick，改用 data-action="previewAvatarItem"
            const borderStyle = isPreviewing ? 'border-color: var(--color-gold); background: var(--color-gold-soft); box-shadow: inset 0 0 0 1px var(--color-gold);' : '';
            return `
            <div class="avatar-card" style="min-width:110px; height:165px; flex-shrink:0; border-radius:var(--radius-md); display:flex; flex-direction:column; padding:10px; transition:all var(--t-base); border: 1.5px solid transparent; ${borderStyle}">
                <div data-action="previewAvatarItem" data-id="${item.id}" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;">
                    <img src="img/${item.id}.png" data-fallback="true" style="height:65px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.1));">
                    <div style="display:none; font-size:2.5rem">👕</div>
                    <div style="font-size:0.8rem; margin-top:8px; font-weight:bold; color:var(--text-2); text-align:center;">${item.name}</div>
                </div>
                <div style="margin-top:5px; width:100%;">${btnActionHtml}</div>
            </div>`;
        }).join('');
    }
};