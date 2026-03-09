/* js/modules/shop_controller.js - V51.3 Pure CSP Controller */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Shop = {
	_initialized: false,
    init: function() {
        if (!window.SQ.EventBus) return;
        if (window.SQ.Engine.Shop) window.SQ.Engine.Shop.init();
        const E = window.SQ.Events;
        
        Object.assign(window.SQ.Actions, {
            // --- 介面過濾與切換 ---
            setShopFilter: (cat) => { window.SQ.Temp.shopCategory = cat; window.SQ.View.Shop.render(); },
            setBagFilter: (cat) => { window.SQ.Temp.bagCategory = cat; window.SQ.View.Shop.render(); },
            toggleBag: (isOpen) => { window.SQ.Temp.isBagOpen = isOpen; window.SQ.View.Shop.render(); },
            toggleNpcDialog: () => {
                const dialogs = ["歡迎光臨！", "庫存有限！", "冒險累了嗎？", "只要有金幣，一切好談！"];
                const next = dialogs[Math.floor(Math.random() * dialogs.length)];
                window.SQ.Temp.npcText = next;
                const el = document.getElementById('shop-npc-text');
                if(el) el.innerText = next;
            },

            // --- 開啟各類 Modal 視窗 (補齊遺失的接口) ---
            openBuyModal: (id) => { if(window.SQ.View.Shop) window.SQ.View.Shop.renderBuyModal(id); },
            openUploadModal: (id) => { if(window.SQ.View.Shop) window.SQ.View.Shop.renderUploadModal(id === 'null' ? null : id); },
            renderItemDetail: (id) => { if(window.SQ.View.Shop) window.SQ.View.Shop.renderItemDetail(id); },
            renderStaminaShop: () => { if(window.SQ.View.Shop) window.SQ.View.Shop.renderStaminaShop(); },
            openPayment: () => { if(window.SQ.View.Shop) window.SQ.View.Shop.renderPayment(); },
            
            // --- 購買邏輯 ---
            updateBuyQty: (arg1, arg2) => {
                const deltaStr = String((arg2 !== undefined) ? arg2 : arg1);
                let qty = window.SQ.Temp.buyQty || 1;
                const max = window.SQ.Temp.buyMax || 99; // 防呆上限 99
                
                if (deltaStr === 'min') qty = 1;
                else if (deltaStr === 'max') qty = max;
                else qty += parseInt(deltaStr.replace('+', ''), 10) || 0; 
                
                if (qty < 1) qty = 1;
                if (qty > max) qty = max;
                window.SQ.Temp.buyQty = qty;
                
                // 👈 暴力網羅所有可能的 ID 名稱
                const display = document.getElementById('buy-qty') || 
                                document.getElementById('buy-qty-val') || 
                                document.getElementById('buy-qty-display');
                
                if (display) {
                    if (display.tagName === 'INPUT') display.value = qty;
                    else display.innerText = qty;
                }
                
                const priceDisplay = document.getElementById('buy-total-price');
                const items = window.SQ.Engine.Shop.getShopItems('全部');
                const item = items.find(i => i.id === window.SQ.Temp.buyTargetId);
                if (item && priceDisplay) priceDisplay.innerText = item.price * qty;

                window.SQ.Audio?.play('click'); 
            },

            confirmBuy: () => {
                const id = window.SQ.Temp.buyTargetId;
                const qty = window.SQ.Temp.buyQty || 1;
                const result = window.SQ.Engine.Shop.buyItem(id, qty);
				if (result.success) {
					if(window.SQ.Actions.toast)window.SQ.Actions.toast(`🎉 購買成功！`);
					window.SQ.Audio?.feedback('purchase'); // 👈 新增這行 (購買成功音效)
					window.SQ.Actions.closeModal('overlay');
                    window.SQ.View.Shop.render();
                    if (window.SQ.View.Main && view.updateHUD) view.updateHUD(window.SQ.State);
				} else {
					if(window.SQ.Actions.toast)window.SQ.Actions.toast(`❌ ${result.msg}`);
					window.SQ.Audio?.feedback('taskUndo'); // 👈 新增這行 (購買失敗音效)
				}
            },

			// --- 使用與丟棄物品 ---
            updateUseQty: (arg1, arg2) => {
                const deltaStr = String((arg2 !== undefined) ? arg2 : arg1);
                let qty = window.SQ.Temp.useQty || 1;
                const max = window.SQ.Temp.useMax || 1; 
                
                if (deltaStr === 'min') qty = 1;
                else if (deltaStr === 'max') qty = max;
                else qty += parseInt(deltaStr.replace('+', ''), 10) || 0; 
                
                if (qty < 1) qty = 1;
                if (qty > max) qty = max;
                window.SQ.Temp.useQty = qty;
                
                const display = document.getElementById('use-qty') || 
                                document.getElementById('use-qty-val') || 
                                document.getElementById('use-qty-display');
                if (display) {
                    if (display.tagName === 'INPUT') display.value = qty;
                    else display.innerText = qty;
                }
                
                window.SQ.Audio?.play('click'); 
            },

            useItem: (isDiscard) => {
                const id = window.SQ.Temp.useTargetId;
				if (isDiscard) {
					window.SQ.Engine.Shop.discardItem(id, 1);
					if(window.SQ.Actions.toast)window.SQ.Actions.toast('🗑️ 已丟棄 1 個');
					window.SQ.Audio?.play('delete'); // 👈 新增：丟棄物品音效
				} else {
					const res = window.SQ.Engine.Shop.useItem(id);
					if(window.SQ.Actions.toast)window.SQ.Actions.toast(res.success ? (res.msg || '✅ 使用成功') : '❌ 無法使用');
					// 👈 新增：依照成功或失敗給予不同音效
					if (res.success) window.SQ.Audio?.feedback('achievement'); // 或用一個代表魔法/喝藥水的專屬音效
					else window.SQ.Audio?.feedback('taskUndo');
				}
                window.SQ.Actions.closeModal('panel');
                window.SQ.View.Shop.render(); 
                if (window.SQ.View.Main && view.updateHUD) view.updateHUD(window.SQ.State);
            },

            // --- 自訂商品上架邏輯 ---
            shopUploadChange: () => {
                const cat = document.getElementById('up-cat').value;
                if (window.SQ.View.Shop && window.SQ.View.Shop.renderDynamicFields) window.SQ.View.Shop.renderDynamicFields(cat);
            },
            
            submitUpload: () => {
                const name = document.getElementById('up-name').value;
                const price = document.getElementById('up-price').value;
                const cat = document.getElementById('up-cat').value;
                
                if (!name || !price) { if(window.SQ.Actions.toast)window.SQ.Actions.toast('❌ 資訊不完整'); return; }
                
                let val = '';
                if (cat === '熱量') val = document.getElementById('up-val-cal')?.value;
                else if (cat === '金錢') val = document.getElementById('up-val-gold')?.value;
                else if (cat === '時間') {
                    const h = parseInt(document.getElementById('up-time-h')?.value || 0);
                    const m = parseInt(document.getElementById('up-time-m')?.value || 0);
                    val = (h * 60) + m; 
                }

                const typeSelect = document.getElementById('up-type');
                const itemType = typeSelect ? typeSelect.value : 'daily'; 
                const inputQty = parseInt(document.getElementById('up-qty').value || 1);

                const success = window.SQ.Engine.Shop.uploadItem({
                    name: name,
                    price: parseInt(price),
                    desc: document.getElementById('up-desc').value,
                    category: cat,
                    type: itemType,        
                    maxQty: inputQty,      
                    qty: inputQty,         
                    val: val, 
                    id: window.SQ.Temp.uploadEditId
                });

                if (success) {
                    if(window.SQ.Actions.toast)window.SQ.Actions.toast('✅ 上架成功');
                    window.SQ.Actions.closeModal('panel'); 
                    window.SQ.View.Shop.render();
                }
            },
            deleteShopItem: () => {
                window.SQ.Engine.Shop.deleteItem(window.SQ.Temp.uploadEditId);
                if(window.SQ.Actions.toast)window.SQ.Actions.toast('🗑️ 商品已下架');
                window.SQ.Actions.closeModal('panel');
                window.SQ.View.Shop.render();
            },

			// --- 特殊商店 ---
            buyStamina: (amount, cost) => {
                const res = window.SQ.Engine.Shop.recoverStamina(amount, cost);
                if (res.success) {
                    const max = (window.SQ.Engine.Story.calculateMaxEnergy) ? window.SQ.Engine.Story.calculateMaxEnergy() : 100;
                    if(window.SQ.Actions.toast)window.SQ.Actions.toast(`⚡ 精力恢復了！ (目前: ${res.current}/${max})`);
                    window.SQ.Actions.closeModal('overlay');
                    
                    if (window.SQ.Temp.currentView === 'story' && window.SQ.View.Story) window.SQ.View.Story.render(); 
                    if (window.SQ.View.Main && view.updateHUD) view.updateHUD(window.SQ.State);
                } else {
                    if(window.SQ.Actions.toast)window.SQ.Actions.toast(res.msg || '❌ 購買失敗');
                }
            },
            
            submitPayment: (amount) => {
                window.SQ.Engine.Shop.addGem(amount);
                if(window.SQ.Actions.toast)window.SQ.Actions.toast(`💎 獲得 ${amount} 鑽石！`);
                window.SQ.Actions.closeModal('overlay');
                if (window.SQ.View.Main && view.updateHUD) view.updateHUD(window.SQ.State);
            }
        });

        window.SQ.EventBus.on(E.System.NAVIGATE, (pageId) => { if (pageId === 'shop') window.SQ.View.Shop.render(); });
        console.log("✅ ShopController V51.3 Active");
    }
};
window.ShopController = window.SQ.Controller.Shop;