/* js/modules/shop_view.js - V34.Final (Complete UI) */
window.shopView = {
    // 1. 商店主頁渲染
    render: function() {
        window.TempState.currentView = 'shop';
        const page = document.getElementById('page-shop');
        if (!page) return;

        const currentCat = window.TempState.shopCategory || '全部';
        const items = ShopEngine.getShopItems(currentCat);

        // 工具列
        const toolbar = ui.container.bar(
            ui.component.segment([{label:'全部', val:'全部'}, {label:'健康', val:'健康'}, {label:'裝備', val:'裝備'}, {label:'用戶', val:'其他'}], currentCat, 'act.setShopFilter') +
            `<div style="margin-left:auto; display:flex; gap:5px;">` +
            ui.component.btn({ label:'💎儲值', theme:'ghost', size:'sm', action:"act.openPayment()" }) +
            ui.component.btn({ label:'🎒背包', theme:'normal', size:'sm', action:"act.openBag()" }) +
            `</div>`
        , 'padding:10px; display:flex; gap:5px; align-items:center;');

        // 上架按鈕 (FAB)
        const fabHtml = ui.component.btn({
            label: '➕', theme: 'correct', 
            style: 'position:absolute; bottom:20px; right:20px; width:50px; height:50px; border-radius:50%; font-size:1.5rem; box-shadow:0 4px 10px rgba(0,0,0,0.3); z-index:10;',
            action: 'view.renderUploadModal()'
        });

        // 商品網格
        const gridHtml = items.length === 0 ? 
            `<div style="text-align:center; color:#999; padding:40px;">暫無商品</div>` :
            ui.layout.grid(
                items.map(i => {
                    // 如果是用戶商品，顯示編輯按鈕
                    const isUser = i.id.startsWith('usr_');
                    const editBtn = isUser ? ui.component.btn({label:'⚙️', theme:'ghost', size:'sm', style:'position:absolute; top:5px; right:5px; padding:2px 6px;', action:`view.renderUploadModal('${i.id}')`}) : '';
                    
                    return `<div style="position:relative;">
                        ${editBtn}
                        ${ui.card.vertical({
                            title: i.name,
                            subTitle: `💰 ${i.price}`,
                            desc: `庫存: ${i.qty}`,
                            style: 'background:#fff;',
                            actionBtnHtml: ui.component.btn({ label:'購買', theme:'correct', size:'sm', style:'width:100%;', action:`act.openBuyModal('${i.id}')` })
                        })}
                    </div>`;
                }).join(''), 
                '2', '10px'
            );

        page.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; position:relative;">
                ${toolbar}
                <div style="flex:1; overflow-y:auto; padding:10px;">${gridHtml}</div>
                ${fabHtml}
            </div>
        `;
    },

    // 2. 背包渲染
    renderBag: function() {
        const currentCat = window.TempState.bagCategory || '全部';
        const items = ShopEngine.getStackedBag(currentCat);
        
        const filterHtml = ui.tabs.scrollX(['全部', '健康', '裝備', '道具'], currentCat, 'act.setBagFilter');

        const listHtml = items.length === 0 ?
            `<div style="text-align:center; padding:30px; color:#999;">背包是空的</div>` :
            ui.layout.grid(
                items.map(i => `
                    <div class="u-box" onclick="act.openItemDetail('${i.id}')" style="text-align:center; padding:10px; cursor:pointer; background:#fff;">
                        <div style="font-size:2rem;">${i.icon||'📦'}</div>
                        <div style="font-weight:bold; font-size:0.9rem;">${i.name}</div>
                        <div style="font-size:0.8rem; color:#666;">x${i.count}</div>
                    </div>
                `).join(''), 
                '3', '8px'
            );

        ui.modal.render('🎒 我的背包', `<div style="padding:10px;">${filterHtml}<br>${listHtml}</div>`, null, 'panel');
    },

    // 3. 購買確認視窗
    renderBuyModal: function(itemId) {
        const items = ShopEngine.getShopItems('全部');
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        window.TempState.buyTargetId = itemId;
        window.TempState.buyQty = 1;
        window.TempState.buyMax = item.qty;

        const body = `
            <div style="text-align:center; padding:10px;">
                <div style="font-size:3rem; margin-bottom:10px;">${item.icon||'🎁'}</div>
                <h3>${item.name}</h3>
                <p style="color:#666;">${item.desc}</p>
                <div style="margin:20px 0; padding:15px; background:#f5f5f5; border-radius:10px;">
                    <div style="display:flex; justify-content:center; align-items:center; gap:15px;">
                        <button class="u-btn u-btn-ghost" onclick="act.updateBuyQty(-1)">➖</button>
                        <b id="buy-qty-display" style="font-size:1.5rem;">1</b>
                        <button class="u-btn u-btn-ghost" onclick="act.updateBuyQty(1)">➕</button>
                    </div>
                    <div style="margin-top:10px; color:var(--color-gold); font-weight:bold;">
                        總價: <span id="buy-total-price">${item.price}</span>
                    </div>
                </div>
            </div>
        `;

        const foot = ui.component.btn({ label:'確認購買', theme:'correct', style:'width:100%;', action:'act.confirmBuy()' });
        ui.modal.render('購買商品', body, foot, 'overlay');
    },

    // 4. [New] 上架商品視窗
    renderUploadModal: function(editId = null) {
        window.TempState.uploadEditId = editId;
        const gs = window.GlobalState;
        
        let data = { name: '', desc: '', category: '熱量', price: '', qty: '', perm: 'daily', val: '' };
        if (editId) {
            const item = gs.shop.user.find(i => i.id === editId);
            if (item) data = { ...item };
        }

        const body = `
            <div style="margin-bottom:10px;">${ui.input.text(data.name, "商品名稱", "", "up-name")}</div>
            <div style="margin-bottom:10px;">${ui.input.textarea(data.desc, "描述...", "", "up-desc")}</div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
                <div>
                    <label style="font-size:0.8rem; color:#888;">分類</label>
                    ${ui.input.select([{value:'熱量', label:'🔥 熱量'}, {value:'時間', label:'⏳ 時間'}, {value:'金錢', label:'💰 金錢'}, {value:'其他', label:'📦 其他'}], data.category, "act.shopUploadChange()", "up-cat")}
                </div>
                <div id="up-dyn-container">
                    </div>
            </div>

            <div style="border-top:1px dashed #eee; padding-top:10px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px;">
                <div><label style="font-size:0.8rem; color:#888;">價格</label>${ui.input.number(data.price, "$", "", 4, "up-price")}</div>
                <div><label style="font-size:0.8rem; color:#888;">庫存</label>${ui.input.number(data.qty, "Qty", "", 3, "up-qty")}</div>
                <div>
                    <label style="font-size:0.8rem; color:#888;">重置</label>
                    ${ui.input.select([{value:'daily', label:'常駐'}, {value:'once', label:'單次'}], data.perm, "", "up-perm")}
                </div>
            </div>
        `;

        const foot = `
            ${editId ? ui.component.btn({label:'下架', theme:'danger', action:'act.deleteShopItem()'}) : ''}
            ${ui.component.btn({label:'保存上架', theme:'correct', style:'flex:1;', action:'act.submitUpload()'})}
        `;

        // 使用特殊的 ID 方便關閉
        ui.modal.render(editId ? '編輯商品' : '上架商品', body, foot, 'm-upload');
        
        // 初始化動態欄位
        setTimeout(() => { this.renderDynamicFields(data.category, data.val); }, 0);
    },

    // 5. [New] 動態欄位渲染
    renderDynamicFields: function(cat, initVal = '') {
        const container = document.getElementById('up-dyn-container');
        if (!container) return;
        
        let html = '';
        if (cat === '熱量') {
            html = `<label style="font-size:0.8rem; color:#888;">數值 (Kcal)</label>${ui.input.number(initVal, "0", "", 4, "up-val-cal")}`;
        } else if (cat === '金錢') {
            html = `<label style="font-size:0.8rem; color:#888;">數值 ($)</label>${ui.input.number(initVal, "0", "", 4, "up-val-gold")}`;
        } else if (cat === '時間') {
            html = `<label style="font-size:0.8rem; color:#888;">時長 (分)</label>${ui.input.number(initVal, "min", "", 3, "up-val-time")}`;
        } else {
            html = `<label style="font-size:0.8rem; color:#888;">(無特殊數值)</label><div style="height:32px;"></div>`;
        }
        container.innerHTML = html;
    },

    // 6. [New] 儲值視窗
    renderPayment: function() {
        const body = `
            <div style="text-align:center; padding:10px;">
                <h3 style="color:#fbc02d; margin-bottom:10px;">💎 儲值中心</h3>
                <p style="color:#888; font-size:0.8rem; margin-bottom:20px;">(測試環境，無實際扣款)</p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    ${ui.component.btn({label:'💎 30 ($30)', theme:'ghost', action:'act.submitPayment(30)'})}
                    ${ui.component.btn({label:'💎 100 ($100)', theme:'ghost', action:'act.submitPayment(100)'})}
                    ${ui.component.btn({label:'💎 300 ($300)', theme:'ghost', action:'act.submitPayment(300)'})}
                    ${ui.component.btn({label:'💎 1000 ($1000)', theme:'ghost', action:'act.submitPayment(1000)'})}
                </div>
            </div>
        `;
        ui.modal.render('', body, null, 'overlay');
    },

    // 7. 物品詳情
    renderItemDetail: function(itemId) {
        const items = ShopEngine.getStackedBag('全部');
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        window.TempState.useTargetId = itemId;

        const body = `
            <div style="text-align:center;">
                <div style="font-size:3rem;">${item.icon||'📦'}</div>
                <h3>${item.name}</h3>
                <p>${item.desc || '無描述'}</p>
                <p style="color:#666;">擁有數量: ${item.count}</p>
            </div>
        `;
        const foot = `
            ${ui.component.btn({ label:'丟棄', theme:'danger', action:'act.useItem(true)' })}
            ${ui.component.btn({ label:'使用', theme:'correct', action:'act.useItem(false)' })}
        `;
        ui.modal.render('物品詳情', body, foot, 'panel');
    },
	
	// [New] 渲染精力商店
    renderStaminaShop: function() {
        // 使用 Card Vertical 渲染三個選項
        const itemsHtml = [
            { type: 'small', title: '小瓶精力', cost: 20, val: 20, icon: '🥤' },
            { type: 'medium', title: '中瓶精力', cost: 50, val: 50, icon: '🧪' },
            { type: 'large', title: '大瓶精力', cost: 100, val: 100, icon: '⚡' }
        ].map(p => ui.card.vertical({
            title: p.title,
            subTitle: `💎 ${p.cost}`,
            desc: `恢復 ${p.val} 點`,
            style: 'text-align:center;',
            actionBtnHtml: ui.component.btn({
                label: '購買', theme: 'correct', size: 'sm', style: 'width:100%;',
                action: `act.buyStamina('${p.type}')`
            })
        })).join('');

        const body = `
            <div style="text-align:center; margin-bottom:15px; color:#666; font-size:0.9rem;">
                使用鑽石快速恢復精力
            </div>
            ${ui.layout.grid(itemsHtml, '3', '8px')}
        `;

        ui.modal.render('⚡ 精力補給站', body, null, 'overlay');
    }
};