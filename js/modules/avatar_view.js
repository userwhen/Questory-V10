/* js/modules/avatar_view.js - V34.Final (Assets Linked & No Purple) */
window.avatarView = {
    // 1. 主頁面佈局
    render: function() {
        window.TempState.currentView = 'avatar';
        const container = document.getElementById('page-avatar');
        if (!container) return;

        // [修改點 1] 移除紫色漸層，改為簡潔的淺灰或白色背景
        container.innerHTML = `
            <div style="position:relative; height:100%; display:flex; flex-direction:column;">
                <div style="position:absolute; top:10px; right:10px; z-index:10;">
                    ${ui.component.btn({ label:'↩ 返回', theme:'ghost', action:"act.navigate('main')" })}
                </div>
                
                <div id="avatar-stage" style="flex:1; background:#f0f0f0; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    </div>

                <div style="height:220px; background:#fff; border-top:1px solid #ddd; display:flex; flex-direction:column;">
                    <div style="padding:10px 15px; font-weight:bold; color:#666; border-bottom:1px solid #eee;">衣櫃</div>
                    <div id="wardrobe-list" style="flex:1; overflow-x:auto; display:flex; align-items:center; gap:15px; padding:0 15px;">
                        </div>
                </div>
            </div>
        `;

        this.renderStage();
        this.renderWardrobe();
    },

    // 2. 渲染舞台立繪 (嫁接 Assets)
    renderStage: function() {
        const stage = document.getElementById('avatar-stage');
        if (!stage) return;

        const preview = window.TempState.preview || {};
        const gender = window.GlobalState.avatar?.gender || 'm';
        let imgHtml = '';

        // [修改點 2] 判斷邏輯
        if (preview.suit) {
            // A. 如果有穿「套裝 (Shop Item)」，讀取 img/ 資料夾
            const path = `img/${preview.suit}_${gender}.png`;
            imgHtml = `<img src="${path}" style="height:90%; object-fit:contain; filter:drop-shadow(0 5px 10px rgba(0,0,0,0.1)); transition:transform 0.3s;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                       <div style="display:none; font-size:5rem;">🦸</div>`;
        } else {
            // B. 如果沒穿套裝（裸裝/預設），呼叫 Assets 模組取得基礎立繪
            if (window.Assets && window.Assets.getCharImgTag) {
                // 這裡呼叫 assets.js 的方法
                imgHtml = window.Assets.getCharImgTag('avatar-char-img', 'height:90%; object-fit:contain; filter:drop-shadow(0 5px 10px rgba(0,0,0,0.1));');
            } else {
                // Fallback: 如果 Assets 模組沒載入
                imgHtml = '<div style="font-size:6rem;">🧍</div>';
            }
        }
        
        stage.innerHTML = imgHtml;
    },

    // 3. 渲染衣櫃列表 (修復版)
    renderWardrobe: function() {
        const list = document.getElementById('wardrobe-list');
        if (!list) return;

        const shopData = window.GameConfig?.AvatarShop || [];
        const unlocked = window.GlobalState.avatar?.unlocked || [];
        const wearing = window.GlobalState.avatar?.wearing || {};
        const preview = window.TempState.preview || {};
        const gender = window.GlobalState.avatar?.gender || 'm';

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

            const borderStyle = isPreviewing 
                ? 'border: 2px solid #666; background: #e0e0e0;' 
                : 'border: 1px solid #eee; background: #fff;';

            // 🟢 [關鍵修復] 補回這一行定義！沒有它就會報 ReferenceError
            const imgPath = `img/${item.id}_${gender}.png`;

            return `
                <div class="avatar-card" style="min-width:110px; height:150px; border-radius:12px; display:flex; flex-direction:column; padding:10px; transition:0.2s; ${borderStyle}">
                    <div onclick="act.previewAvatarItem('${item.id}')" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;">
                        <img src="${imgPath}" style="height:60px; object-fit:contain;" onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=\\'font-size:2rem\\'>👕</span>'">
                        <div style="font-size:0.8rem; margin-top:5px; font-weight:bold; color:#555;">${item.name}</div>
                    </div>
                    ${ui.component.btn({ 
                        label: btn.label, theme: btn.theme, size: 'sm', 
                        action: btn.action, disabled: btn.disabled, style: 'width:100%;' 
                    })}
                </div>
            `;
        }).join('');
    }
};