/* js/modules/avatar_view.js - V42.1 (Fix Overflow & Hover Logic) */
window.avatarView = {
    render: function() {
        window.TempState.currentView = 'avatar';
        const container = document.getElementById('page-avatar');
        if (!container) return;

        const headerHtml = ui.layout.pageHeader('👗 更衣室', ui.component.btn({ label:'↩ 返回', theme:'ghost', size:'sm', action:"act.navigate('main')" }));

        container.innerHTML = `
            <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; background:var(--bg-panel); overflow:hidden;">
                ${headerHtml}
                <div id="avatar-stage" style="flex:1; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;"></div>
                
                <div style="height:35%; min-height:200px; flex-shrink:0; background:var(--bg-card); border-top:1px solid var(--border); display:flex; flex-direction:column; box-shadow:0 -4px 15px rgba(0,0,0,0.05); z-index:10;">
                    <div style="flex-shrink:0; padding:12px 15px; font-weight:bold; color:var(--text-muted); border-bottom:1px solid var(--border-card);">我的衣櫃</div>
                    <div id="wardrobe-list" style="flex:1; overflow-x:auto; display:flex; align-items:center; gap:12px; padding:0 15px;"></div>
                </div>
            </div>
        `;

        this.renderStage();
        this.renderWardrobe();
    },

    renderStage: function() {
        const stage = document.getElementById('avatar-stage');
        if (!stage) return;

        const preview = window.TempState.preview || {};
        const gender = window.GlobalState.avatar?.gender || 'm';
        let imgHtml = '';

        if (preview.suit) {
            const path = `img/${preview.suit}_${gender}.png`;
            imgHtml = `<img src="${path}" style="height:90%; object-fit:contain; filter:drop-shadow(0 8px 20px rgba(0,0,0,0.25)); transition:transform var(--t-base);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                       <div style="display:none; font-size:5rem;">🦸</div>`;
        } else {
            if (window.Assets && window.Assets.getCharImgTag) {
                imgHtml = window.Assets.getCharImgTag('avatar-char-img', 'height:90%; object-fit:contain; filter:drop-shadow(0 8px 20px rgba(0,0,0,0.25));');
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
        const unlocked = window.GlobalState.avatar?.unlocked || [];
        const wearing = window.GlobalState.avatar?.wearing || {};
        const preview = window.TempState.preview || {};
        const gender = window.GlobalState.avatar?.gender || 'm';

        // 修復：精確判斷空狀態，避免字串操作造成的靜默錯誤
        if (shopData.length === 0) {
            list.innerHTML = ui.layout.empty('衣櫃空空如也', '👕');
            return;
        }

        list.innerHTML = shopData.map(item => {
            const isWearing = wearing.suit === item.id;
            const isUnlocked = unlocked.includes(item.id);
            const isPreviewing = preview.suit === item.id;

            let btn = {};
            if (isWearing) {
                btn = { label: '穿著中', theme: 'ghost', disabled: true };
            } else if (isUnlocked) {
                btn = { label: '穿上', theme: 'correct', action: `act.wearAvatarItem('${item.id}')` };
            } else {
                btn = { label: `💎 ${item.price}`, theme: 'normal', action: `act.buyAvatarItem('${item.id}')` };
            }

            // 修復：只有在預覽時才掛載 Inline Style，非預覽狀態交給 CSS hover 處理
            const borderStyle = isPreviewing 
                ? 'border-color: var(--color-gold); background: var(--color-gold-soft); box-shadow: inset 0 0 0 1px var(--color-gold);' 
                : '';

            const imgPath = `img/${item.id}_${gender}.png`;

            return `
                <div class="avatar-card" style="min-width:110px; height:165px; flex-shrink:0; border-radius:var(--radius-md); display:flex; flex-direction:column; padding:10px; transition:all var(--t-base); border: 1.5px solid transparent; ${borderStyle}">
                    <div onclick="act.previewAvatarItem('${item.id}')" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;">
                        <img src="${imgPath}" style="height:65px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.1));" onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=\\'font-size:2.5rem\\'>👕</span>'">
                        <div style="font-size:0.8rem; margin-top:8px; font-weight:bold; color:var(--text-2); text-align:center;">${item.name}</div>
                    </div>
                    <div style="margin-top:5px; width:100%;">
                        ${ui.component.btn({ label: btn.label, theme: btn.theme, size: 'sm', action: btn.action, disabled: btn.disabled, style: 'width:100%;' })}
                    </div>
                </div>
            `;
        }).join('');
    }
};