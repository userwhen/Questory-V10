/* js/modules/shop_view.js - V57.1 Fixed Icon Display */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Shop = {
    render: function() {
        window.SQ.Temp.currentView = 'shop';
        const page = document.getElementById('page-shop');
        if (!page) return;
        page.style.padding = '0'; page.style.height = '100%'; page.style.overflow = 'hidden';
        const curCat = window.SQ.Temp.shopCategory || '全部';
        
        const npcArea = `<div style="background: var(--bg-hud); padding: 15px 20px; display: flex; align-items: center; gap: 15px; height: 120px; flex-shrink: 0; position: relative; z-index: 10;"><div data-action="toggleNpcDialog" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid var(--color-gold); background: var(--bg-nav); overflow: hidden; flex-shrink: 0; cursor: pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);"><div style="font-size:3rem; line-height:1;">👩‍🍳</div></div><div style="background: var(--bg-card); padding: 10px 15px; border-radius: 12px; position: relative; flex: 1; font-size: 0.9rem; color: var(--text); line-height: 1.4; box-shadow: var(--shadow-sm);"><div style="position: absolute; left: -8px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-right: 8px solid var(--bg-card);"></div><span id="shop-npc-text" style="font-weight:bold;">${window.SQ.Temp.npcText || "歡迎光臨！"}</span></div></div>`;
        
        const filterBar = `<div style="background: var(--bg-elevated); padding: 10px 15px; border-bottom: 1px solid var(--border); flex-shrink: 0; display:flex; align-items:center; gap:8px;">
            <div style="flex:1; overflow:hidden;"><div class="u-scroll-list">${['全部', '熱量', '時間', '金錢', '其他'].map(c => ui.atom.buttonBase({label: c, theme: c === curCat ? 'normal' : 'ghost', style: 'flex-shrink:0; border-radius:50px; padding:4px 12px;', action: 'setShopFilter', actionVal: c })).join('')}</div></div>
            <div style="flex-shrink:0;">${ui.atom.buttonBase({ label: '⬆️ 上架', theme: 'normal', size: 'sm', style: 'white-space: nowrap;', action: 'openUploadModal' })}</div>
        </div>`;
        
        const items = window.SQ.Engine.Shop.getShopItems(curCat);
        const bodyArea = `<div style="flex: 1; overflow-y: auto; padding: 15px; background: var(--bg-panel); padding-bottom: 50px;">${items.length > 0 ? `<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; width:100%;">` + items.map(i => {
            // ✅ [修正] 商店卡片 icon：優先用商品自帶 icon，無則 fallback 到分類 icon
            const displayIcon = i.icon || (window.SQ.CATEGORY_ICONS && window.SQ.CATEGORY_ICONS[i.category]) || '📦';
            const itemWithIcon = { ...i, icon: displayIcon };
            return ui.smart.shopItem(itemWithIcon, i.id.startsWith('usr_') ? ui.atom.buttonBase({label:'⚙️', theme:'ghost', size:'sm', style:'position:absolute; top:2px; right:2px; padding:2px; z-index:5; border:none;', action:'openUploadModal', actionId: i.id}) : '');
        }).join('') + `</div>` : `<div class="ui-empty"><div class="ui-empty-icon">🛒</div>暫無商品</div>`}</div>`;

        const bagCat = window.SQ.Temp.bagCategory || '全部';
        const bagItems = window.SQ.Engine.Shop.getStackedBag(bagCat);
        const bagGrid = bagItems.length > 0 ? `<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; width:100%;">` + bagItems.map(i => {
            // ✅ [修正] 背包 icon：同樣優先自帶，fallback 分類 icon
            const bagIcon = i.icon || (window.SQ.CATEGORY_ICONS && window.SQ.CATEGORY_ICONS[i.category]) || '🎒';
            return `<div data-action="renderItemDetail" data-id="${i.id}" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-sm); padding:8px 5px; text-align:center; cursor:pointer;"><div style="font-size:1.8rem; margin-bottom:4px;">${bagIcon}</div><div style="font-size:0.75rem; color:var(--text-on-dark); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:bold;">${i.name}</div><div style="font-size:0.7rem; color:var(--color-gold);">x${i.count}</div></div>`;
        }).join('') + `</div>` : `<div class="ui-empty"><div class="ui-empty-icon">🎒</div>背包空空如也</div>`;

        const drawerInner = `<div style="display: flex; flex-direction: column; height: 100%; color:var(--text-on-dark);"><div style="flex-shrink: 0; display: flex; align-items: center; gap: 12px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);"><div style="font-size: 1.1rem; font-weight: bold; white-space: nowrap; color: var(--color-gold-soft);">🎒 我的背包</div><div style="flex: 1; min-width: 0; background: rgba(0,0,0,0.2); border-radius: 20px; padding: 4px 10px; overflow-x: auto; white-space: nowrap; display: flex; align-items: center; scrollbar-width: none;"><div class="u-scroll-list">${['全部', '熱量', '時間', '金錢'].map(c => ui.atom.buttonBase({label: c, theme: c === bagCat ? 'normal' : 'ghost', style: 'flex-shrink:0; border-radius:50px; padding:4px 12px;', action: 'setBagFilter', actionVal: c })).join('')}</div></div></div><div style="flex: 1; overflow-y: auto; padding-bottom: 20px;">${bagGrid}</div></div>`;

        page.innerHTML = `<div style="position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column;">${npcArea}${filterBar}${bodyArea}${ui.composer.drawer({isOpen: window.SQ.Temp.isBagOpen||false, contentHtml: drawerInner, toggleAction: 'toggleBag', height: '280px', handleIconOpen: '▼', handleIconClose: '▲'})}</div>`;
    },

    renderBuyModal: function(id) {
        const item = window.SQ.Engine.Shop.getShopItems('全部').find(i => i.id === id);
        if (!item) return;
        // ✅ icon fallback
        const displayIcon = item.icon || (window.SQ.CATEGORY_ICONS && window.SQ.CATEGORY_ICONS[item.category]) || '🎁';
        window.SQ.Temp.buyTargetId = id;
        window.SQ.Temp.buyQty = 1;
        window.SQ.Temp.buyMax = item.qty || 99;
        ui.modal.render('🛒 購買商品', ui.composer.centeredModalBody({icon: displayIcon, title: item.name, desc: item.desc, extraHtml: `<div style="margin:20px 0; padding:15px; background:var(--bg-box); border-radius:var(--radius-md); border:1px solid var(--border); display:flex; flex-direction:column; align-items:center;">${ui.composer.qtySelector({ idPrefix: 'buy-qty', qty: 1, onChange: 'updateBuyQty' })}<div style="margin-top:10px; text-align:center; color:var(--color-gold-dark); font-weight:bold; font-size:1.1rem;">總價: <span id="buy-total-price">${item.price}</span><span style="font-size:0.9rem; color:var(--text-ghost); font-weight:normal; margin-left:6px;">/ 剩餘 ${item.qty}</span></div></div>`}), ui.atom.buttonBase({ label:'確認購買', theme:'correct', style:'width:100%;', action:'confirmBuy' }), 'overlay');
    },

    renderUploadModal: function(editId = null) {
        const data = editId ? { ...(window.SQ.State.shop.user.find(i => i.id === editId) || {}) } : { name: '', desc: '', category: '熱量', price: 0, qty: 1, type: 'daily', val: '' };
        window.SQ.Temp.uploadEditId = editId;

        // ✅ [修正] icon 初始值：編輯時讀已存的 icon；新建時根據分類自動決定
        const initIcon = data.icon || (window.SQ.CATEGORY_ICONS && window.SQ.CATEGORY_ICONS[data.category]) || '📦';

        const scanIconSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px; height:20px;"><path d="M4 8V4H8M16 4H20V8M20 16V20H16M8 20H4V16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12H18" stroke="#f85149" stroke-width="2" stroke-linecap="round"/></svg>`;

        const nameAndScanRow = `
            <div style="display:flex; align-items:flex-end; gap:8px; margin-bottom:15px;">
                <div style="flex:1;">
                    ${ui.composer.formField({
                        label:'商品名稱', 
                        style: 'margin-bottom:0;',
                        inputHtml: ui.atom.inputBase({type:'text', val:data.name, placeholder:"輸入或掃描...", action:"shopUploadChange", id:"up-name"})
                    })}
                </div>
                <button data-action="startScan" 
                        style="width:42px; height:42px; background:var(--bg-elevated); border:1px solid var(--border); 
                               border-radius:8px; cursor:pointer; display:flex; align-items:center; 
                               justify-content:center; color:var(--text); flex-shrink:0; transition:all 0.2s;">
                    ${scanIconSvg}
                </button>
            </div>`;
			const iconPreviewRow = `<input type="hidden" id="up-icon" value="${initIcon}">`;

        let body = `
            ${nameAndScanRow}
            ${iconPreviewRow}
            ${ui.composer.formField({label:'描述', inputHtml: ui.atom.inputBase({type:'textarea', val:data.desc, placeholder:"說明...", action:"shopUploadChange", id:"up-desc"})})}
            <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:15px;">
                <div style="flex:1;">
                    ${ui.composer.formField({label:'分類', inputHtml: ui.atom.inputBase({
                        type:'select', val:data.category, action:"shopUploadChange", id:"up-cat", 
                        options:[{val:'熱量', label:'🔥 熱量'}, {val:'時間', label:'⏳ 時間'}, {val:'金錢', label:'💰 金錢'}, {val:'其他', label:'📦 其他'}]
                    })})}
                </div>
                <div id="up-dyn-container" style="flex:1;"></div>
            </div>
            <div style="border-top:1px dashed var(--border); padding-top:15px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                ${ui.composer.formField({label:'價格', inputHtml: ui.atom.inputBase({type:'number', val:data.price, id:"up-price"})})}
                ${ui.composer.formField({label:'庫存', inputHtml: ui.atom.inputBase({type:'number', val:data.qty, id:"up-qty"})})}
                ${ui.composer.formField({label:'重置', inputHtml: ui.atom.inputBase({type:'select', val:data.type, id:"up-type", options:[{val:'daily', label:'常駐'}, {val:'once', label:'單次'}]})})}
            </div>`;

        ui.modal.render(
            editId ? '編輯商品' : '上架商品',
            body,
            editId
                ? `${ui.atom.buttonBase({label:'下架', theme:'danger', action:'deleteShopItem'})} ${ui.atom.buttonBase({label:'保存', theme:'correct', style:'flex:1;', action:'submitUpload'})}`
                : ui.atom.buttonBase({label:'上架商品', theme:'correct', style:'width:100%;', action:'submitUpload'}),
            'panel'
        );
        setTimeout(() => this.renderDynamicFields(data.category, data.val), 0);
    },

    renderDynamicFields: function(cat, initVal = '') {
        const c = document.getElementById('up-dyn-container');
        if (!c) return;
        if (cat === '熱量') c.innerHTML = ui.composer.formField({label:'數值 (Kcal)', inputHtml: ui.atom.inputBase({type:'number', val:initVal, id:"up-val-cal"})});
        else if (cat === '金錢') c.innerHTML = ui.composer.formField({label:'數值 ($)', inputHtml: ui.atom.inputBase({type:'number', val:initVal, id:"up-val-gold"})});
        else if (cat === '時間') c.innerHTML = ui.composer.formField({label:'時長 (時:分)', inputHtml: `<div style="display:flex; align-items:center; gap:5px;">${ui.atom.inputBase({type:'number', val:Math.floor((parseInt(initVal)||0)/60), id:"up-time-h"})} <span style="font-weight:bold; opacity:0.6;">:</span> ${ui.atom.inputBase({type:'number', val:(parseInt(initVal)||0)%60, id:"up-time-m"})}</div>`});
        else c.innerHTML = `<div style="height:32px;"></div>`;
    },

    renderPayment: function() {
        const isMock = (!window.SQ.IAP || window.SQ.IAP.IAP_MODE === 'mock') && !window.SQ.Sub?.isProOrTrial();
        const products = window.SQ.IAP?.getProducts() || [
            { sku:'gem_30',   gems:30,   price:'NT$30',  label:'小袋鑽石', icon:'💎', badge:null,        savePct:null, color:'#4fc3f7' },
            { sku:'gem_100',  gems:100,  price:'NT$90',  label:'鑽石袋',   icon:'💎', badge:'🔥 最熱門',  savePct:null, color:'#ff7043' },
            { sku:'gem_300',  gems:300,  price:'NT$250', label:'鑽石箱',   icon:'💎', badge:'⚡ 超值',    savePct:17,   color:'#ab47bc' },
            { sku:'gem_1000', gems:1000, price:'NT$790', label:'鑽石寶庫', icon:'💎', badge:'👑 最划算',  savePct:34,   color:'#ffc107' },
        ];
        const allDonates = window.SQ.IAP?.getDonateProducts() || [
            { sku:'coffee_1', price:'NT$30', label:'請開發者喝咖啡', icon:'☕', desc:'小小支持，大大鼓勵！' },
        ];
        const donates = allDonates.filter(d => !d.hidden);
        const totalGem = (window.SQ.State?.freeGem || 0) + (window.SQ.State?.paidGem || 0);

        const balanceBar = `
            <div style="display:flex; align-items:center; justify-content:space-between;
                        padding:11px 14px; border-radius:12px; margin-bottom:14px;
                        background:var(--color-gold-soft); border:1px solid var(--color-gold);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="font-size:1.4rem; line-height:1;">💎</div>
                    <div>
                        <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600; letter-spacing:.4px;">目前鑽石</div>
                        <div style="font-size:1.2rem; font-weight:800; color:var(--color-gold-dark); line-height:1.1;">${totalGem}</div>
                    </div>
                </div>
                ${isMock ? `<div style="font-size:0.68rem; padding:3px 9px; border-radius:50px; background:rgba(0,0,0,0.05); color:var(--text-muted); border:1px solid var(--border);">⚙️ 測試模式</div>` : ''}
            </div>`;

        const gemGrid = `
            <div style="font-size:0.72rem; font-weight:700; color:#999; letter-spacing:.8px; text-transform:uppercase; margin-bottom:10px;">💎 鑽石方案</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                ${products.map(p => {
                    const accentColor = p.color || '#4fc3f7';
                    const badgeHtml = p.badge ? `<div style="position:absolute; top:-1px; left:50%; transform:translateX(-50%); white-space:nowrap; padding:2px 10px; border-radius:50px; font-size:0.65rem; font-weight:800; color:#fff; background:${accentColor}; box-shadow:0 2px 8px ${accentColor}55;">${p.badge}</div>` : '';
                    const saveHtml = p.savePct ? `<div style="font-size:0.65rem; font-weight:700; color:${accentColor}; background:${accentColor}18; border-radius:50px; padding:1px 7px; margin-top:1px;">省 ${p.savePct}%</div>` : '<div style="height:16px;"></div>';
                    return `
                        <button data-action="submitPayment" data-val="${p.sku}"
                                style="position:relative; padding:${p.badge ? '18px' : '12px'} 10px 12px; border-radius:16px; cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; gap:3px; background:var(--bg-card); border:2px solid ${p.badge ? accentColor : 'var(--border)'}; box-shadow:${p.badge ? `0 4px 16px ${accentColor}33` : '0 1px 4px rgba(0,0,0,0.06)'}; transition:transform .15s, box-shadow .15s; width:100%;">
                            ${badgeHtml}
                            <div style="font-size:2rem; line-height:1.1;">${p.icon}</div>
                            <div style="font-size:1rem; font-weight:800; color:#1a237e;">${p.gems}</div>
                            <div style="font-size:0.7rem; color:#aaa;">${p.label}</div>
                            ${saveHtml}
                            <div style="font-size:0.88rem; font-weight:700; margin-top:4px; color:${accentColor};">${isMock ? '免費測試' : p.price}</div>
                        </button>`;
                }).join('')}
            </div>`;

        const coffeeSection = `
            <div style="border-top:1px solid var(--border); padding-top:14px; margin-top:4px;">
                ${donates.map(d => `
                    <button data-action="submitPayment" data-val="${d.sku}"
                            style="width:100%; padding:11px 14px; border-radius:12px; cursor:pointer; background:var(--bg-elevated); border:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:1.2rem; opacity:0.8;">${d.icon}</span>
                            <div style="text-align:left;">
                                <div style="font-size:0.82rem; color:var(--text-2); font-weight:600;">${d.label}</div>
                                <div style="font-size:0.68rem; color:var(--text-ghost);">${d.desc}</div>
                            </div>
                        </div>
                        <span style="font-size:0.88rem; font-weight:700; color:var(--color-gold-dark); flex-shrink:0;">${isMock ? '測試' : d.price}</span>
                    </button>`).join('')}`;

        const restoreBtn = `
            <div style="margin-top:14px; text-align:center;">
                <button data-action="restorePurchases" style="background:none; border:none; cursor:pointer; font-size:0.75rem; color:#bbb; text-decoration:underline;">恢復先前購買</button>
            </div>`;

        ui.modal.render('💎 儲值中心', `<div style="padding:4px 2px;">${balanceBar}${gemGrid}${coffeeSection}${restoreBtn}</div>`, null, 'overlay');
    },

    renderItemDetail: function(id) {
        const item = window.SQ.Engine.Shop.getStackedBag('全部').find(i => i.id === id);
        if (!item) return;
        // ✅ icon fallback
        const displayIcon = item.icon || (window.SQ.CATEGORY_ICONS && window.SQ.CATEGORY_ICONS[item.category]) || '📦';
        window.SQ.Temp.useTargetId = id;
        window.SQ.Temp.useQty = 1;
        window.SQ.Temp.useMax = item.count || 1;
        ui.modal.render('📦 物品詳情', ui.composer.centeredModalBody({icon: displayIcon, title: item.name, desc: item.desc || '無描述', extraHtml: `<div style="margin:20px 0; padding:15px; background:var(--bg-box); border-radius:var(--radius-md); border:1px solid var(--border); display:flex; flex-direction:column; align-items:center;">${ui.composer.qtySelector({ idPrefix: 'use-qty', qty: 1, onChange: 'updateUseQty' })}<div style="margin-top:10px; text-align:center; color:var(--text-ghost); font-weight:normal; font-size:0.9rem;">剩餘: ${item.count}</div></div>`}), `<div style="display:flex; gap:10px; width:100%;">${ui.atom.buttonBase({ label:'🗑️ 丟棄', theme:'danger', style:'flex:1;', action:'useItem', actionVal:'true' })}${ui.atom.buttonBase({ label:'✨ 使用', theme:'correct', style:'flex:2;', action:'useItem', actionVal:'false' })}</div>`, 'panel');
    },

    renderStaminaShop: function() {
        const gridHtml = `<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:10px; width:100%; box-sizing:border-box;">` + 
        [{ name: '精力藥水小', icon: '🧪', recover: 30, price: 10, desc: '回復 30 點精力' },
         { name: '精力藥水中', icon: '⚗️', recover: 60, price: 20, desc: '回復 60 點精力' },
         { name: '精力藥水大', icon: '💉', recover: 100, price: 30, desc: '精力完全恢復' }].map(p => 
            `<div style="flex:1; min-width:90px; max-width:130px;">` +
            ui.composer.cardVertical({ title: p.name, subTitle: `<div style="color:var(--color-danger); font-weight:bold;">💎 ${p.price}</div>`, iconHtml: `<div style="font-size:3rem; margin-bottom:5px; filter:drop-shadow(var(--shadow-sm));">${p.icon}</div>`, actionBtnHtml: ui.atom.buttonBase({ label: '購買', theme: 'correct', size: 'sm', style: 'width:100%;', action: `buyStamina`, actionId: p.recover, actionVal: p.price }) }) + 
            `</div>`
        ).join('') + `</div>`;
        
        ui.modal.render('⚡ 精力補給站', `<div style="text-align:center; padding:5px;"><p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:15px;">持有鑽石: <span style="color:var(--color-info); font-weight:bold;">💎 ${(window.SQ.State.freeGem || 0) + (window.SQ.State.paidGem || 0)}</span></p>${gridHtml}</div>`, null, 'overlay');
    }
};