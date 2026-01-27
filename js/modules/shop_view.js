/* js/modules/shop_view.js - V35.15 (Stable & Complete) */

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

        // --- [A] NPC & Filter ---
        const npcDialogs = ["歡迎光臨！", "庫存有限，要買要快！", "有些好貨剛到喔！"];
        if (!window.TempState.npcText) window.TempState.npcText = npcDialogs[0];
        
        const npcArea = `
            <div style="background: #3e2723; padding: 15px 20px; display: flex; align-items: center; gap: 15px; height: 120px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.2); position: relative; z-index: 10;">
                <div onclick="act.toggleNpcDialog()" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #ffd700; background: #5d4037; overflow: hidden; flex-shrink: 0; cursor: pointer; display:flex; align-items:center; justify-content:center;">
                    <div style="font-size:3rem; line-height:1;">👩‍🍳</div>
                </div>
                <div style="background: #fff; padding: 10px 15px; border-radius: 12px; position: relative; flex: 1; font-size: 0.9rem; color: #333; line-height: 1.4; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div style="position: absolute; left: -8px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-right: 8px solid #fff;"></div>
                    <span id="shop-npc-text">${window.TempState.npcText}</span>
                </div>
            </div>`;

        const filterBar = `
            <div style="background: #f5f5f5; padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ddd; flex-shrink: 0;">
                <div style="flex: 1; overflow-x: auto;">
                    ${ui.component.segment([{label:'全部', val:'全部'}, {label:'熱量', val:'熱量'}, {label:'時間', val:'時間'}, {label:'金錢', val:'金錢'}, {label:'其他', val:'其他'}], currentCat, 'act.setShopFilter')}
                </div>
                <div style="margin-left: 10px;">
                    ${ui.component.btn({ label: '⬆️ 上架', theme: 'normal', size: 'sm', style: 'white-space: nowrap; border: 1px solid #ccc; background: #fff;', action: 'shopView.renderUploadModal()' })}
                </div>
            </div>`;

        // --- [B] Body: 商品列表 ---
        const gridContent = items.length === 0 ? 
            `<div style="text-align:center; color:#999; padding:50px;">暫無商品</div>` :
            ui.layout.grid(items.map(i => {
                const isUser = i.id.startsWith('usr_');
                const isSoldOut = i.qty <= 0;
                
                const editBtn = isUser ? ui.component.btn({label:'⚙️', theme:'ghost', size:'sm', style:'position:absolute; top:2px; right:2px; padding:2px; z-index:5;', action:`shopView.renderUploadModal('${i.id}')`}) : '';
                
                const soldOutOverlay = isSoldOut ? `
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:4; display:flex; align-items:center; justify-content:center; pointer-events:none;">
                        <div style="border: 3px solid #d32f2f; color: #d32f2f; font-weight: bold; font-size: 1.2rem; padding: 5px 10px; transform: rotate(-15deg); border-radius: 8px; background:rgba(255,255,255,0.9);">SOLD OUT</div>
                    </div>` : '';

                const btnAction = isSoldOut 
                    ? ui.component.btn({ label:'已售完', disabled:true, theme:'ghost', size:'sm', style:'width:100%;' })
                    : ui.component.btn({ label:'購買', theme:'correct', size:'sm', style:'width:100%;', action:`shopView.renderBuyModal('${i.id}')` });

                return `<div style="position:relative; overflow:hidden; border-radius:12px;">
                    ${editBtn}
                    ${soldOutOverlay}
                    ${ui.card.vertical({
                        title: i.name, 
                        subTitle: `<div style="display:flex; justify-content:center; gap:8px;"><span style="color:#d32f2f; font-weight:bold;">💰${i.price}</span><span style="color:#888; font-size:0.9rem;">| 剩 ${i.qty}</span></div>`, 
                        desc: i.desc,
                        style: 'background:#fff; height:100%;',
                        actionBtnHtml: btnAction
                    })}
                </div>`;
            }).join(''), '2', '10px');

        const bodyArea = `<div style="flex: 1; overflow-y: auto; padding: 15px; background: #fafafa; padding-bottom: 50px;">${gridContent}</div>`;

        // 4. Backpack Drawer (背包抽屜)
        const bagCat = window.TempState.bagCategory || '全部';
        const bagItems = ShopEngine.getStackedBag(bagCat);
        
        // 背包內容 (Grid)
        const bagGrid = bagItems.length === 0 ? 
            `<div style="text-align:center; padding:30px; color:#aaa; width:100%;">背包空空如也</div>` :
            ui.layout.grid(bagItems.map(i => `
                <div onclick="shopView.renderItemDetail('${i.id}')" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:5px; text-align:center; cursor:pointer;">
                    <div style="font-size:1.5rem;">${i.icon || '🎒'}</div>
                    <div style="font-size:0.75rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${i.name}</div>
                    <div style="font-size:0.7rem; color:#ffd700;">x${i.count}</div>
                </div>
            `).join(''), '4', '5px');

        const drawerInnerHtml = `
    <div style="display: flex; flex-direction: column; height: 100%; color:#fff;">
        
        <div style="
            flex-shrink: 0; 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            margin-bottom: 10px; 
            padding-bottom: 8px; 
            border-bottom: 1px solid rgba(255,255,255,0.1);
        ">
            <div style="font-size: 1rem; font-weight: bold; white-space: nowrap; color: #ddd;">
                我的背包
            </div>

            <div style="
                flex: 1;              /* 1. 自動填滿剩餘寬度 */
                min-width: 0;         /* 2. 允許縮小 (關鍵！) */
                background: rgba(255,255,255,0.08); 
                border-radius: 20px; 
                padding: 4px 10px;    /* 左右留點空隙 */
                
                /* 讓內部 scrollX 能夠滾動 */
                overflow-x: auto;     
                white-space: nowrap;  
                display: flex;
                align-items: center;
                
                /* 隱藏醜醜的捲軸 (Webkit Only) */
                scrollbar-width: none; /* Firefox */
            ">
                <div style="display: flex; gap: 5px; width: 100%;">
                    ${ui.layout.scrollX(['全部', '熱量', '時間', '金錢'], bagCat, 'act.setBagFilter')}
                </div>
            </div>
        </div>

        <div style="flex: 1; overflow-y: auto;">
            ${bagGrid}
        </div>
    </div>
`;

        // [關鍵設定]：
        // dir: 'bottom' (由下往上滑出)
        // height: '220px' (抽屜高度固定)
        const bagDrawer = ui.layout.drawer(
            isBagOpen,
            drawerInnerHtml,
            `act.toggleBag(${!isBagOpen})`,
            { 
                dir: 'bottom',
                color: '#3e2723', 
                iconOpen: '▼', iconClose: '▲',
                height: '240px' // 設定背包容器高度
            }
        );

        // 5. 組合
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
        
        const body = `
            <div style="text-align:center; padding:10px;">
                <div style="font-size:3rem; margin-bottom:10px;">${item.icon||'🎁'}</div>
                <h3>${item.name}</h3>
                <p style="color:#666;">${item.desc}</p>
                <div style="margin:20px 0; padding:15px; background:#f5f5f5; border-radius:10px;">
                    <div style="display:flex; justify-content:center; align-items:center; gap:8px;">
                        ${ui.component.btn({label:'MIN', theme:'ghost', size:'sm', action:"act.updateBuyQty('min')"})}
                        <button class="u-btn u-btn-ghost" onclick="act.updateBuyQty(-1)">➖</button>
                        <b id="buy-qty-display" style="font-size:1.5rem; width:50px; text-align:center;">1</b>
                        <button class="u-btn u-btn-ghost" onclick="act.updateBuyQty(1)">➕</button>
                        ${ui.component.btn({label:'MAX', theme:'ghost', size:'sm', action:"act.updateBuyQty('max')"})}
                    </div>
                    <div style="font-size:0.8rem; color:#999; margin-top:5px;">(最大庫存: ${item.qty})</div>
                    <div style="margin-top:10px; color:var(--color-gold); font-weight:bold;">總價: <span id="buy-total-price">${item.price}</span></div>
                </div>
            </div>`;
        const foot = ui.component.btn({ label:'確認購買', theme:'correct', style:'width:100%;', action:'act.confirmBuy()' });
        ui.modal.render('購買商品', body, foot, 'overlay');
    },

    // 3. 上架/編輯視窗
    renderUploadModal: function(editId = null) {
        window.TempState.uploadEditId = editId;
        const gs = window.GlobalState;
        let data = { name: '', desc: '', category: '熱量', price: '', qty: '', perm: 'daily', val: '' };
        if (editId) { const item = gs.shop.user.find(i => i.id === editId); if (item) data = { ...item }; }

        const body = `
            <div style="margin-bottom:10px;">${ui.input.text(data.name, "商品名稱", "", "up-name")}</div>
            <div style="margin-bottom:10px;">${ui.input.textarea(data.desc, "描述...", "", "up-desc")}</div>
            <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:15px;">
                <div style="flex:1;"><label style="font-size:0.8rem; color:#888; display:block; margin-bottom:4px;">分類</label>${ui.input.select([{value:'熱量', label:'🔥 熱量'}, {value:'時間', label:'⏳ 時間'}, {value:'金錢', label:'💰 金錢'}, {value:'其他', label:'📦 其他'}], data.category, "act.shopUploadChange()", "up-cat")}</div>
                <div id="up-dyn-container" style="flex:1;"></div>
            </div>
            <div style="border-top:1px dashed #eee; padding-top:10px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px;">
                <div><label style="font-size:0.8rem; color:#888;">價格</label>${ui.input.number(data.price, "", 4, "up-price")}</div>
                <div><label style="font-size:0.8rem; color:#888;">庫存</label>${ui.input.number(data.qty, "", 3, "up-qty")}</div>
                <div><label style="font-size:0.8rem; color:#888;">重置</label>${ui.input.select([{value:'daily', label:'常駐'}, {value:'once', label:'單次'}], data.perm, "", "up-perm")}</div>
            </div>`;
        const foot = `${editId ? ui.component.btn({label:'下架', theme:'danger', action:'act.deleteShopItem()'}) : ''}${ui.component.btn({label:'保存上架', theme:'correct', style:'flex:1;', action:'act.submitUpload()'})}`;
        ui.modal.render(editId ? '編輯商品' : '上架商品', body, foot, 'panel');
        setTimeout(() => { this.renderDynamicFields(data.category, data.val); }, 0);
    },

    // 4. 動態欄位
    renderDynamicFields: function(cat, initVal = '') {
        const container = document.getElementById('up-dyn-container'); if (!container) return;
        let html = '';
        if (cat === '熱量') html = `<label style="font-size:0.8rem; color:#888; display:block; margin-bottom:4px;">數值 (Kcal)</label>${ui.input.number(initVal, "", 4, "up-val-cal")}`;
        else if (cat === '金錢') html = `<label style="font-size:0.8rem; color:#888; display:block; margin-bottom:4px;">數值 ($)</label>${ui.input.number(initVal, "", 4, "up-val-gold")}`;
        else if (cat === '時間') {
            const totalMin = parseInt(initVal) || 0;
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            html = `<label style="font-size:0.8rem; color:#888; display:block; margin-bottom:4px;">時長 (時:分)</label><div style="display:flex; align-items:center; gap:5px;">${ui.input.number(h, "", 2, "up-time-h")} <span style="font-weight:bold;">:</span> ${ui.input.number(m, "", 2, "up-time-m")}</div>`;
        } else html = `<div style="height:32px;"></div>`;
        container.innerHTML = html;
    },

    // 5. 儲值 & 詳情
    renderPayment: function() {
        const body = `<div style="text-align:center; padding:10px;"><h3 style="color:#fbc02d; margin-bottom:10px;">💎 儲值中心</h3><div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">${[30, 100, 300, 1000].map(v => ui.component.btn({label:`💎 ${v}`, theme:'ghost', action:`act.submitPayment(${v})`})).join('')}</div></div>`;
        ui.modal.render('', body, null, 'overlay');
    },

    // 6. 物品詳情 (含 MIN/MAX + 擁有數量)
    renderItemDetail: function(itemId) {
        const items = ShopEngine.getStackedBag('全部');
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        
        window.TempState.useTargetId = itemId;
        window.TempState.useQty = 1;
        window.TempState.useMax = item.count; // 設定最大值

        const body = `
            <div style="text-align:center; padding:10px;">
                <div style="font-size:3rem; margin-bottom:10px;">${item.icon||'📦'}</div>
                <h3>${item.name}</h3>
                <p style="color:#666;">${item.desc || '無描述'}</p>
                <div style="margin:20px 0; padding:15px; background:#f5f5f5; border-radius:10px;">
                    <div style="display:flex; justify-content:center; align-items:center; gap:8px;">
                        ${ui.component.btn({label:'MIN', theme:'ghost', size:'sm', action:"act.updateUseQty('min')"})}
                        <button class="u-btn u-btn-ghost" onclick="act.updateUseQty(-1)">➖</button>
                        <b id="use-qty-display" style="font-size:1.5rem; width:50px; text-align:center;">1</b>
                        <button class="u-btn u-btn-ghost" onclick="act.updateUseQty(1)">➕</button>
                        ${ui.component.btn({label:'MAX', theme:'ghost', size:'sm', action:"act.updateUseQty('max')"})}
                    </div>
                    <div style="font-size:0.9rem; color:#5d4037; margin-top:10px; font-weight:bold;">
                        (擁有數量: ${item.count})
                    </div>
                </div>
            </div>`;

        const foot = `
            <div style="display:flex; gap:10px; width:100%;">
                ${ui.component.btn({ label:'🗑️ 丟棄', theme:'danger', style:'flex:1;', action:'act.useItem(true)' })}
                ${ui.component.btn({ label:'✨ 使用', theme:'correct', style:'flex:2;', action:'act.useItem(false)' })}
            </div>
        `;
        ui.modal.render('物品詳情', body, foot, 'panel');
    },
	
	renderStaminaShop: function() {
        const gs = window.GlobalState;
        const gems = (gs.freeGem || 0) + (gs.paidGem || 0);

        // 定義三種商品
        const products = [
            { name: '小瓶精力藥水', icon: '🧪', recover: 30, price: 10, desc: '回復 30 點精力' },
            { name: '中瓶精力藥水', icon: '⚗️', recover: 60, price: 20, desc: '回復 60 點精力' },
            { name: '大瓶精力藥水', icon: '💉', recover: 100, price: 30, desc: '精力完全恢復' } // 因為上限100，補100等於全滿
        ];

        // 使用 Grid 佈局 (一行3個)
        const gridHtml = ui.layout.grid(products.map(p => {
            return ui.card.vertical({
                title: p.name,
                subTitle: `<div style="color:#4caf50; font-weight:bold;">💎 ${p.price}</div>`,
                desc: p.desc,
                // 圖示
                iconHtml: `<div style="font-size:3rem; margin-bottom:10px;">${p.icon}</div>`,
                style: 'background:#fff; border:1px solid #eee;',
                // 按鈕動作
                actionBtnHtml: ui.component.btn({
                    label: '購買',
                    theme: 'correct',
                    size: 'sm',
                    style: 'width:100%;',
                    action: `act.buyStamina(${p.recover}, ${p.price})`
                })
            });
        }).join(''), '3', '10px');

        const body = `
            <div style="text-align:center; padding:10px;">
                <h3 style="color:#ffd700; margin-bottom:5px;">⚡ 精力補給站</h3>
                <p style="color:#666; font-size:0.9rem; margin-bottom:20px;">
                    持有鑽石: <span style="color:#4caf50; font-weight:bold;">💎 ${gems}</span>
                </p>
                
                ${gridHtml}
            </div>`;

        ui.modal.render('', body, null, 'overlay');
    },
};