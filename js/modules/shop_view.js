/* js/modules/shop_view.js - V42.0 UI System Upgrade */

window.shopView = {
    // 1. 主渲染
    render: function() {
        window.TempState.currentView = 'shop';
        const page = document.getElementById('page-shop');
        if (!page) return;

        page.style.padding = '0';
        page.style.height = '100%'; 
        page.style.overflow = 'hidden';

        const currentCat = window.TempState.shopCategory || '全部';
        const isBagOpen = window.TempState.isBagOpen || false; 
        const items = ShopEngine.getShopItems(currentCat);

        // --- [A] NPC 區域 ---
        const npcDialogs = ["歡迎光臨！", "庫存有限，要買要快！", "有些好貨剛到喔！"];
        if (!window.TempState.npcText) window.TempState.npcText = npcDialogs[0];
        
        const npcArea = `
            <div style="background: var(--bg-hud); padding: 15px 20px; display: flex; align-items: center; gap: 15px; height: 120px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.2); position: relative; z-index: 10;">
                <div onclick="act.toggleNpcDialog()" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid var(--color-gold); background: var(--bg-nav); overflow: hidden; flex-shrink: 0; cursor: pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">
                    <div style="font-size:3rem; line-height:1;">👩‍🍳</div>
                </div>
                <div style="background: var(--bg-card); padding: 10px 15px; border-radius: 12px; position: relative; flex: 1; font-size: 0.9rem; color: var(--text); line-height: 1.4; box-shadow: var(--shadow-sm);">
                    <div style="position: absolute; left: -8px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-right: 8px solid var(--bg-card);"></div>
                    <span id="shop-npc-text" style="font-weight:bold;">${window.TempState.npcText}</span>
                </div>
            </div>`;

        // --- [B] Filter 列 ---
        const filterBar = `
            <div style="background: var(--bg-elevated); padding: 10px 15px; border-bottom: 1px solid var(--border); flex-shrink: 0;">
                ${ui.layout.filterBar(
                    ['全部', '熱量', '時間', '金錢', '其他'], 
                    currentCat, 
                    'act.setShopFilter',
                    ui.component.btn({ label: '⬆️ 上架', theme: 'normal', size: 'sm', style: 'white-space: nowrap;', action: 'shopView.renderUploadModal()' })
                )}
            </div>`;

        // --- [C] Body: 商品列表 ---
        const gridContent = items.length === 0 ? 
            ui.layout.empty('暫無商品', '🛒') :
            ui.layout.grid(items.map(i => {
                const isUser = i.id.startsWith('usr_');
                const isSoldOut = i.qty <= 0;
                
                const editBtn = isUser ? ui.component.btn({label:'⚙️', theme:'ghost', size:'sm', style:'position:absolute; top:2px; right:2px; padding:2px; z-index:5; border:none;', action:`shopView.renderUploadModal('${i.id}')`}) : '';
                
                const soldOutOverlay = isSoldOut ? `
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:4; display:flex; align-items:center; justify-content:center; pointer-events:none;">
                        <div style="border: 3px solid var(--color-danger); color: var(--color-danger); font-weight: bold; font-size: 1.2rem; padding: 5px 10px; transform: rotate(-15deg); border-radius: 8px; background:rgba(255,255,255,0.9); box-shadow:var(--shadow-sm);">SOLD OUT</div>
                    </div>` : '';

                const btnAction = isSoldOut 
                    ? ui.component.btn({ label:'已售完', disabled:true, theme:'ghost', size:'sm', style:'width:100%;' })
                    : ui.component.btn({ label:'購買', theme:'correct', size:'sm', style:'width:100%;', action:`shopView.renderBuyModal('${i.id}')` });

                return `<div style="position:relative; overflow:hidden; border-radius:var(--radius-md);">
                    ${editBtn}
                    ${soldOutOverlay}
                    ${ui.card.vertical({
                        title: i.name, 
                        subTitle: `<div style="display:flex; justify-content:center; gap:8px;"><span style="color:var(--color-danger); font-weight:bold;">💰${i.price}</span><span style="color:var(--text-ghost); font-size:0.9rem;">| 剩 ${i.qty}</span></div>`, 
                        desc: i.desc,
                        actionBtnHtml: btnAction
                    })}
                </div>`;
            }).join(''), '2', '10px');

        const bodyArea = `<div style="flex: 1; overflow-y: auto; padding: 15px; background: var(--bg-panel); padding-bottom: 50px;">${gridContent}</div>`;

        // --- [D] Backpack Drawer ---
        const bagCat = window.TempState.bagCategory || '全部';
        const bagItems = ShopEngine.getStackedBag(bagCat);
        
        const bagGrid = bagItems.length === 0 ? 
            ui.layout.empty('背包空空如也', '🎒') :
            ui.layout.grid(bagItems.map(i => `
                <div onclick="shopView.renderItemDetail('${i.id}')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-sm); padding:8px 5px; text-align:center; cursor:pointer; transition:transform 0.1s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
                    <div style="font-size:1.8rem; margin-bottom:4px;">${i.icon || '🎒'}</div>
                    <div style="font-size:0.75rem; color:var(--text-on-dark); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:bold;">${i.name}</div>
                    <div style="font-size:0.7rem; color:var(--color-gold);">x${i.count}</div>
                </div>
            `).join(''), '4', '8px');

        const drawerInnerHtml = ui.layout.drawerContent(
            '🎒 我的背包', 
            ['全部', '熱量', '時間', '金錢'], 
            bagCat, 
            'act.setBagFilter', 
            bagGrid
        );

        const bagDrawer = ui.layout.drawer(
            isBagOpen,
            drawerInnerHtml,
            `act.toggleBag(${!isBagOpen})`,
            { color: 'var(--bg-hud)', iconOpen: '▼', iconClose: '▲', height: '280px' }
        );

        page.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column;">
                ${npcArea}
                ${filterBar}
                ${bodyArea}
                ${bagDrawer}
            </div>
        `;
    },

    // 2. 購買確認視窗
    renderBuyModal: function(itemId) {
        const items = ShopEngine.getShopItems('全部');
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        window.TempState.buyTargetId = itemId; 
        window.TempState.buyQty = 1; 
        window.TempState.buyMax = item.qty; 
        
        // [優化] 改用 centeredBody
        const extraHtml = `
            <div style="margin:20px 0; padding:15px; background:var(--bg-box); border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="display:flex; justify-content:center; align-items:center; gap:8px;">
                    ${ui.component.btn({label:'MIN', theme:'ghost', size:'sm', action:"act.updateBuyQty('min')"})}
                    <button class="u-btn u-btn-ghost" onclick="act.updateBuyQty(-1)">➖</button>
                    <b id="buy-qty-display" style="font-size:1.5rem; width:50px; text-align:center; color:var(--text);">1</b>
                    <button class="u-btn u-btn-ghost" onclick="act.updateBuyQty(1)">➕</button>
                    ${ui.component.btn({label:'MAX', theme:'ghost', size:'sm', action:"act.updateBuyQty('max')"})}
                </div>
                <div style="font-size:0.8rem; color:var(--text-ghost); margin-top:5px;">(最大庫存: ${item.qty})</div>
                <div style="margin-top:10px; color:var(--color-gold-dark); font-weight:bold; font-size:1.1rem;">總價: <span id="buy-total-price">${item.price}</span></div>
            </div>`;
            
        const body = ui.modal.centeredBody(item.icon||'🎁', item.name, item.desc, extraHtml);
        const foot = ui.component.btn({ label:'確認購買', theme:'correct', style:'width:100%;', action:'act.confirmBuy()' });
        
        ui.modal.render('🛒 購買商品', body, foot, 'overlay');
    },

    // 3. 上架/編輯視窗
    renderUploadModal: function(editId = null) {
        window.TempState.uploadEditId = editId;
        const gs = window.GlobalState;
        let data = { name: '', desc: '', category: '熱量', price: '', qty: '', perm: 'daily', val: '' };
        if (editId) { const item = gs.shop.user.find(i => i.id === editId); if (item) data = { ...item }; }

        const body = `
            ${ui.input.field('商品名稱', ui.input.text(data.name, "請輸入名稱", "", "up-name"))}
            ${ui.input.field('描述', ui.input.textarea(data.desc, "商品效果或說明...", "", "up-desc"))}
            <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:15px;">
                <div style="flex:1;">
                    ${ui.input.field('分類', ui.input.select([{value:'熱量', label:'🔥 熱量'}, {value:'時間', label:'⏳ 時間'}, {value:'金錢', label:'💰 金錢'}, {value:'其他', label:'📦 其他'}], data.category, "act.shopUploadChange()", "up-cat"))}
                </div>
                <div id="up-dyn-container" style="flex:1;"></div>
            </div>
            <div style="border-top:1px dashed var(--border); padding-top:15px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                ${ui.input.field('價格', ui.input.number(data.price, "", 4, "up-price"))}
                ${ui.input.field('庫存', ui.input.number(data.qty, "", 3, "up-qty"))}
                ${ui.input.field('重置', ui.input.select([{value:'daily', label:'常駐'}, {value:'once', label:'單次'}], data.perm, "", "up-perm"))}
            </div>`;
            
        const foot = editId 
            ? `${ui.component.btn({label:'下架', theme:'danger', action:'act.deleteShopItem()'})} ${ui.component.btn({label:'保存修改', theme:'correct', style:'flex:1;', action:'act.submitUpload()'})}`
            : ui.component.btn({label:'上架商品', theme:'correct', style:'width:100%;', action:'act.submitUpload()'});
            
        ui.modal.render(editId ? '編輯商品' : '上架商品', body, foot, 'panel');
        setTimeout(() => { this.renderDynamicFields(data.category, data.val); }, 0);
    },

    // 4. 動態欄位
    renderDynamicFields: function(cat, initVal = '') {
        const container = document.getElementById('up-dyn-container'); if (!container) return;
        let html = '';
        if (cat === '熱量') html = ui.input.field('數值 (Kcal)', ui.input.number(initVal, "", 4, "up-val-cal"));
        else if (cat === '金錢') html = ui.input.field('數值 ($)', ui.input.number(initVal, "", 4, "up-val-gold"));
        else if (cat === '時間') {
            const totalMin = parseInt(initVal) || 0;
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            html = ui.input.field('時長 (時:分)', `<div style="display:flex; align-items:center; gap:5px;">${ui.input.number(h, "", 2, "up-time-h")} <span style="font-weight:bold; color:var(--text-muted);">:</span> ${ui.input.number(m, "", 2, "up-time-m")}</div>`);
        } else html = `<div style="height:32px;"></div>`;
        container.innerHTML = html;
    },

    // 5. 儲值
    renderPayment: function() {
        // 修復：給予明確標題，消滅空白黑條
        const body = `<div style="text-align:center; padding:10px;"><div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">${[30, 100, 300, 1000].map(v => ui.component.btn({label:`💎 ${v}`, theme:'ghost', action:`act.submitPayment(${v})`})).join('')}</div></div>`;
        ui.modal.render('💎 儲值中心', body, null, 'overlay');
    },

    // 6. 物品詳情
    renderItemDetail: function(itemId) {
        const items = ShopEngine.getStackedBag('全部');
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        
        window.TempState.useTargetId = itemId;
        window.TempState.useQty = 1;
        window.TempState.useMax = item.count; 

        // [優化] 改用 centeredBody
        const extraHtml = `
            <div style="margin:20px 0; padding:15px; background:var(--bg-box); border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="display:flex; justify-content:center; align-items:center; gap:8px;">
                    ${ui.component.btn({label:'MIN', theme:'ghost', size:'sm', action:"act.updateUseQty('min')"})}
                    <button class="u-btn u-btn-ghost" onclick="act.updateUseQty(-1)">➖</button>
                    <b id="use-qty-display" style="font-size:1.5rem; width:50px; text-align:center; color:var(--text);">1</b>
                    <button class="u-btn u-btn-ghost" onclick="act.updateUseQty(1)">➕</button>
                    ${ui.component.btn({label:'MAX', theme:'ghost', size:'sm', action:"act.updateUseQty('max')"})}
                </div>
                <div style="font-size:0.9rem; color:var(--color-info); margin-top:10px; font-weight:bold;">
                    (擁有數量: ${item.count})
                </div>
            </div>`;

        const body = ui.modal.centeredBody(item.icon||'📦', item.name, item.desc || '無描述', extraHtml);
        
        const foot = `
            <div style="display:flex; gap:10px; width:100%;">
                ${ui.component.btn({ label:'🗑️ 丟棄', theme:'danger', style:'flex:1;', action:'act.useItem(true)' })}
                ${ui.component.btn({ label:'✨ 使用', theme:'correct', style:'flex:2;', action:'act.useItem(false)' })}
            </div>
        `;
        ui.modal.render('📦 物品詳情', body, foot, 'panel');
    },
	
    // 7. 精力補給站
	renderStaminaShop: function() {
        const gs = window.GlobalState;
        const gems = (gs.freeGem || 0) + (gs.paidGem || 0);

        const products = [
            { name: '小瓶精力藥水', icon: '🧪', recover: 30, price: 10, desc: '回復 30 點精力' },
            { name: '中瓶精力藥水', icon: '⚗️', recover: 60, price: 20, desc: '回復 60 點精力' },
            { name: '大瓶精力藥水', icon: '💉', recover: 100, price: 30, desc: '精力完全恢復' } 
        ];

        const gridHtml = ui.layout.grid(products.map(p => {
            return ui.card.vertical({
                title: p.name,
                subTitle: `<div style="color:var(--color-danger); font-weight:bold;">💎 ${p.price}</div>`,
                desc: `<span style="color:var(--text-muted); font-size:0.85rem;">${p.desc}</span>`,
                iconHtml: `<div style="font-size:3.5rem; margin-bottom:5px; filter:drop-shadow(var(--shadow-sm));">${p.icon}</div>`,
                actionBtnHtml: ui.component.btn({
                    label: '購買', theme: 'correct', size: 'sm', style: 'width:100%;',
                    action: `act.buyStamina(${p.recover}, ${p.price})`
                })
            });
        }).join(''), '3', '10px');

        // 修復：給予明確標題，消滅空白黑條
        const body = `
            <div style="text-align:center; padding:10px;">
                <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:20px;">
                    持有鑽石: <span style="color:var(--color-info); font-weight:bold;">💎 ${gems}</span>
                </p>
                ${gridHtml}
            </div>`;

        ui.modal.render('⚡ 精力補給站', body, null, 'overlay');
    }
};