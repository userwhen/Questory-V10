/* js/modules/shop_view.js - V43.0 Pure Architecture Upgrade */

window.shopView = {
    render: function() {
        window.TempState.currentView = 'shop';
        const page = document.getElementById('page-shop');
        if (!page) return;

        page.style.padding = '0';
        page.style.height = '100%'; 
        page.style.overflow = 'hidden';

        const currentCat = window.TempState.shopCategory || '全部';
        const isBagOpen = window.TempState.isBagOpen || false; 
        const items = window.ShopEngine ? ShopEngine.getShopItems(currentCat) : [];

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

        // --- [B] Filter 列 (純 V43 寫法) ---
        const cats = ['全部', '熱量', '時間', '金錢', '其他'];
        const filterBtns = cats.map(c => ui.atom.buttonBase({
            label: c, theme: c === currentCat ? 'normal' : 'ghost', 
            style: 'flex-shrink:0; border-radius:50px; padding:4px 12px;', action: `act.setShopFilter('${c}')`
        })).join('');
        
        const filterBar = `
            <div style="background: var(--bg-elevated); padding: 10px 15px; border-bottom: 1px solid var(--border); flex-shrink: 0; display:flex; align-items:center; gap:8px;">
                <div style="flex:1; overflow:hidden;">
                    <div class="u-scroll-list" style="-webkit-overflow-scrolling:touch;">${filterBtns}</div>
                </div>
                <div style="flex-shrink:0;">
                    ${ui.atom.buttonBase({ label: '⬆️ 上架', theme: 'normal', size: 'sm', style: 'white-space: nowrap;', action: 'shopView.renderUploadModal()' })}
                </div>
            </div>`;

        // --- [C] Body: 商品列表 (純 V43) ---
        let gridContent = `<div class="ui-empty"><div class="ui-empty-icon">🛒</div>暫無商品</div>`;
        if (items.length > 0) {
            gridContent = `<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; width:100%;">` + 
                items.map(i => {
                    const isUser = i.id.startsWith('usr_');
                    const editBtnHtml = isUser ? ui.atom.buttonBase({label:'⚙️', theme:'ghost', size:'sm', style:'position:absolute; top:2px; right:2px; padding:2px; z-index:5; border:none;', action:`shopView.renderUploadModal('${i.id}')`}) : '';
                    return ui.smart.shopItem(i, editBtnHtml);
                }).join('') + `</div>`;
        }
        const bodyArea = `<div style="flex: 1; overflow-y: auto; padding: 15px; background: var(--bg-panel); padding-bottom: 50px;">${gridContent}</div>`;

        // --- [D] Backpack Drawer (純 V43) ---
        const bagCat = window.TempState.bagCategory || '全部';
        const bagItems = window.ShopEngine ? ShopEngine.getStackedBag(bagCat) : [];
        
        let bagGrid = `<div class="ui-empty"><div class="ui-empty-icon">🎒</div>背包空空如也</div>`;
        if (bagItems.length > 0) {
            bagGrid = `<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; width:100%;">` + 
                bagItems.map(i => `
                <div onclick="shopView.renderItemDetail('${i.id}')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-sm); padding:8px 5px; text-align:center; cursor:pointer; transition:transform 0.1s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
                    <div style="font-size:1.8rem; margin-bottom:4px;">${i.icon || '🎒'}</div>
                    <div style="font-size:0.75rem; color:var(--text-on-dark); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:bold;">${i.name}</div>
                    <div style="font-size:0.7rem; color:var(--color-gold);">x${i.count}</div>
                </div>`).join('') + `</div>`;
        }

        const bagCatBtns = ['全部', '熱量', '時間', '金錢'].map(c => ui.atom.buttonBase({
            label: c, theme: c === bagCat ? 'normal' : 'ghost', style: 'flex-shrink:0; border-radius:50px; padding:4px 12px;', action: `act.setBagFilter('${c}')`
        })).join('');

        const drawerInnerHtml = `
            <div style="display: flex; flex-direction: column; height: 100%; color:var(--text-on-dark);">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: 12px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 1.1rem; font-weight: bold; white-space: nowrap; color: var(--color-gold-soft);">🎒 我的背包</div>
                    <div style="flex: 1; min-width: 0; background: rgba(0,0,0,0.2); border-radius: 20px; padding: 4px 10px; overflow-x: auto; white-space: nowrap; display: flex; align-items: center; scrollbar-width: none;">
                        <div class="u-scroll-list">${bagCatBtns}</div>
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto; padding-bottom: 20px;">${bagGrid}</div>
            </div>`;

        const bagDrawer = ui.composer.drawer({
            isOpen: isBagOpen, contentHtml: drawerInnerHtml, onToggle: `act.toggleBag(${!isBagOpen})`, 
            variant: 'story', height: '280px', handleIconOpen: '▼', handleIconClose: '▲'
        });

        page.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column;">
                ${npcArea}
                ${filterBar}
                ${bodyArea}
                ${bagDrawer}
            </div>
        `;
    },

    renderBuyModal: function(itemId) {
        const items = window.ShopEngine ? ShopEngine.getShopItems('全部') : [];
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        window.TempState.buyTargetId = itemId; 
        window.TempState.buyQty = 1; 
        window.TempState.buyMax = item.qty; 
        
        const extraHtml = `
            <div style="margin:20px 0; padding:15px; background:var(--bg-box); border-radius:var(--radius-md); border:1px solid var(--border); display:flex; flex-direction:column; align-items:center;">
                ${ui.composer.qtySelector({ idPrefix: 'buy-qty', qty: 1, onChange: 'act.updateBuyQty' })}
                <div style="margin-top:10px; text-align:center; color:var(--color-gold-dark); font-weight:bold; font-size:1.1rem;">
                    總價: <span id="buy-total-price">${item.price}</span>
                    <span style="font-size:0.9rem; color:var(--text-ghost); font-weight:normal; margin-left:6px;">/ 剩餘 ${item.qty}</span>
                </div>
            </div>`;
            
        const body = ui.composer.centeredModalBody({icon: item.icon||'🎁', title: item.name, desc: item.desc, extraHtml});
        const foot = ui.atom.buttonBase({ label:'確認購買', theme:'correct', style:'width:100%;', action:'act.confirmBuy()' });
        ui.modal.render('🛒 購買商品', body, foot, 'overlay');
    },

    renderUploadModal: function(editId = null) {
        window.TempState.uploadEditId = editId;
        const gs = window.GlobalState;
        let data = { name: '', desc: '', category: '熱量', price: '', qty: '', type: 'daily', val: '' };
        if (editId) { const item = gs.shop.user.find(i => i.id === editId); if (item) data = { ...item }; }

        const body = `
            ${ui.composer.formField({label:'商品名稱', inputHtml: ui.atom.inputBase({type:'text', val:data.name, placeholder:"請輸入名稱", id:"up-name"})})}
            ${ui.composer.formField({label:'描述', inputHtml: ui.atom.inputBase({type:'textarea', val:data.desc, placeholder:"商品效果或說明...", id:"up-desc"})})}
            <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:15px;">
                <div style="flex:1;">
                    ${ui.composer.formField({label:'分類', inputHtml: ui.atom.inputBase({type:'select', val:data.category, onChange:"act.shopUploadChange()", id:"up-cat", options:[{value:'熱量', label:'🔥 熱量'}, {value:'時間', label:'⏳ 時間'}, {value:'金錢', label:'💰 金錢'}, {value:'其他', label:'📦 其他'}]})})}
                </div>
                <div id="up-dyn-container" style="flex:1;"></div>
            </div>
            <div style="border-top:1px dashed var(--border); padding-top:15px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                ${ui.composer.formField({label:'價格', inputHtml: ui.atom.inputBase({type:'number', val:data.price, id:"up-price"})})}
                ${ui.composer.formField({label:'庫存', inputHtml: ui.atom.inputBase({type:'number', val:data.qty, id:"up-qty"})})}
                ${ui.composer.formField({label:'重置', inputHtml: ui.atom.inputBase({type:'select', val:data.type, id:"up-type", options:[{value:'daily', label:'常駐'}, {value:'once', label:'單次'}]})})}
            </div>`;
            
        const foot = editId 
            ? `${ui.atom.buttonBase({label:'下架', theme:'danger', action:'act.deleteShopItem()'})} ${ui.atom.buttonBase({label:'保存修改', theme:'correct', style:'flex:1;', action:'act.submitUpload()'})}`
            : ui.atom.buttonBase({label:'上架商品', theme:'correct', style:'width:100%;', action:'act.submitUpload()'});
            
        ui.modal.render(editId ? '編輯商品' : '上架商品', body, foot, 'panel');
        setTimeout(() => { this.renderDynamicFields(data.category, data.val); }, 0);
    },

    renderDynamicFields: function(cat, initVal = '') {
        const container = document.getElementById('up-dyn-container'); if (!container) return;
        if (cat === '熱量') container.innerHTML = ui.composer.formField({label:'數值 (Kcal)', inputHtml: ui.atom.inputBase({type:'number', val:initVal, id:"up-val-cal"})});
        else if (cat === '金錢') container.innerHTML = ui.composer.formField({label:'數值 ($)', inputHtml: ui.atom.inputBase({type:'number', val:initVal, id:"up-val-gold"})});
        else if (cat === '時間') {
            const h = Math.floor((parseInt(initVal) || 0) / 60), m = (parseInt(initVal) || 0) % 60;
            container.innerHTML = ui.composer.formField({label:'時長 (時:分)', inputHtml: `<div style="display:flex; align-items:center; gap:5px;">${ui.atom.inputBase({type:'number', val:h, id:"up-time-h"})} <span style="font-weight:bold; opacity:0.6;">:</span> ${ui.atom.inputBase({type:'number', val:m, id:"up-time-m"})}</div>`});
        }
        else container.innerHTML = `<div style="height:32px;"></div>`;
    },

    renderPayment: function() {
        const body = `<div style="text-align:center; padding:10px;"><div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">${[30, 100, 300, 1000].map(v => ui.atom.buttonBase({label:`💎 ${v}`, theme:'ghost', action:`act.submitPayment(${v})`})).join('')}</div></div>`;
        ui.modal.render('💎 儲值中心', body, null, 'overlay');
    },

    renderItemDetail: function(itemId) {
        const items = window.ShopEngine ? ShopEngine.getStackedBag('全部') : [];
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        
        window.TempState.useTargetId = itemId;
        window.TempState.useQty = 1;
        window.TempState.useMax = item.count; 

        const extraHtml = `
            <div style="margin:20px 0; padding:15px; background:var(--bg-box); border-radius:var(--radius-md); border:1px solid var(--border); display:flex; flex-direction:column; align-items:center;">
                ${ui.composer.qtySelector({ idPrefix: 'use-qty', qty: 1, onChange: 'act.updateUseQty' })}
                <div style="margin-top:10px; text-align:center; color:var(--text-ghost); font-weight:normal; font-size:0.9rem;">
                    剩餘: ${item.count}
                </div>
            </div>`;

        const body = ui.composer.centeredModalBody({icon: item.icon||'📦', title: item.name, desc: item.desc || '無描述', extraHtml});
        const foot = `<div style="display:flex; gap:10px; width:100%;">${ui.atom.buttonBase({ label:'🗑️ 丟棄', theme:'danger', style:'flex:1;', action:'act.useItem(true)' })}${ui.atom.buttonBase({ label:'✨ 使用', theme:'correct', style:'flex:2;', action:'act.useItem(false)' })}</div>`;
        
        ui.modal.render('📦 物品詳情', body, foot, 'panel');
    },
	
	renderStaminaShop: function() {
        const gs = window.GlobalState;
        const gems = (gs.freeGem || 0) + (gs.paidGem || 0);

        const products = [
            { name: '小瓶精力藥水', icon: '🧪', recover: 30, price: 10, desc: '回復 30 點精力' },
            { name: '中瓶精力藥水', icon: '⚗️', recover: 60, price: 20, desc: '回復 60 點精力' },
            { name: '大瓶精力藥水', icon: '💉', recover: 100, price: 30, desc: '精力完全恢復' } 
        ];

        const gridHtml = `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; width:100%;">` + products.map(p => {
            return ui.composer.cardVertical({
                title: p.name,
                subTitle: `<div style="color:var(--color-danger); font-weight:bold;">💎 ${p.price}</div>`,
                iconHtml: `<div style="font-size:3.5rem; margin-bottom:5px; filter:drop-shadow(var(--shadow-sm));">${p.icon}</div>`,
                actionBtnHtml: ui.atom.buttonBase({ label: '購買', theme: 'correct', size: 'sm', style: 'width:100%;', action: `act.buyStamina(${p.recover}, ${p.price})` })
            });
        }).join('') + `</div>`;

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