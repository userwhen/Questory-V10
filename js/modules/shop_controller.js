/* js/modules/shop_controller.js - V35.7 (Min/Max & Time Logic) */

window.ShopController = {
    init: function() {
        if (!window.EventBus) return;
        if (window.ShopEngine) ShopEngine.init();
        const E = window.EVENTS;

        Object.assign(window.act, {
            setShopFilter: (cat) => { window.TempState.shopCategory = cat; shopView.render(); },
            setBagFilter: (cat) => { window.TempState.bagCategory = cat; shopView.render(); },
            toggleBag: (isOpen) => { window.TempState.isBagOpen = isOpen; shopView.render(); },
            toggleNpcDialog: () => {
                const dialogs = ["歡迎光臨！", "庫存有限！", "冒險累了嗎？", "只要有金幣，一切好談！"];
                const next = dialogs[Math.floor(Math.random() * dialogs.length)];
                window.TempState.npcText = next;
                const el = document.getElementById('shop-npc-text');
                if(el) el.innerText = next;
            },

            openBuyModal: (id) => shopView.renderBuyModal(id),
            
            // [Fix] 支援 Min/Max 字串指令
            updateBuyQty: (delta) => {
                let qty = window.TempState.buyQty || 1;
                const max = window.TempState.buyMax || 999;
                
                if (delta === 'min') {
                    qty = 1;
                } else if (delta === 'max') {
                    qty = max;
                } else {
                    qty += delta;
                }

                if (qty < 1) qty = 1;
                if (qty > max) qty = max;
                
                window.TempState.buyQty = qty;
                
                const qtyDisplay = document.getElementById('buy-qty-display');
                const priceDisplay = document.getElementById('buy-total-price');
                const items = ShopEngine.getShopItems('全部');
                const item = items.find(i => i.id === window.TempState.buyTargetId);
                
                if (qtyDisplay) qtyDisplay.innerText = qty;
                if (item && priceDisplay) priceDisplay.innerText = item.price * qty;
            },

            confirmBuy: () => {
                const id = window.TempState.buyTargetId;
                const qty = window.TempState.buyQty || 1;
                const result = ShopEngine.buyItem(id, qty);
                if (result.success) {
                    act.toast(`🎉 購買成功！`);
                    ui.modal.close('m-overlay');
                    shopView.render();
                    if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
                } else {
                    act.toast(`❌ ${result.msg}`);
                }
            },
			
			// [New] 物品使用數量的加減邏輯 (與 updateBuyQty 類似，但對象不同)
            updateUseQty: (delta) => {
                let qty = window.TempState.useQty || 1;
                const max = window.TempState.useMax || 1; // 這裡的 Max 是背包擁有量
                if (delta === 'min') {
                    qty = 1;
                } else if (delta === 'max') {
                    qty = max;
                } else {
                    qty += delta;
                }
                // 邊界檢查
                if (qty < 1) qty = 1;
                if (qty > max) qty = max;
                
                window.TempState.useQty = qty;
                
                // 更新 UI 顯示
                const qtyDisplay = document.getElementById('use-qty-display');
                if (qtyDisplay) qtyDisplay.innerText = qty;
            },

            // [重點更新] 使用物品回饋
            useItem: (isDiscard) => {
                const id = window.TempState.useTargetId;
                if (isDiscard) {
                    ShopEngine.discardItem(id, 1);
                    act.toast('🗑️ 已丟棄 1 個');
                } else {
                    const res = ShopEngine.useItem(id);
                    // 顯示引擎回傳的詳細訊息 (例如：攝取了 500 Kcal)
                    act.toast(res.success ? (res.msg || '✅ 使用成功') : '❌ 無法使用');
                }
                ui.modal.close('m-panel');
                shopView.render(); 
                if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
            },

            shopUploadChange: () => {
                const cat = document.getElementById('up-cat').value;
                if (shopView.renderDynamicFields) shopView.renderDynamicFields(cat);
            },
            
            // [Fix] 處理時間輸入 (H:M -> Total Min)
            submitUpload: () => {
                const name = document.getElementById('up-name').value;
                const price = document.getElementById('up-price').value;
                const cat = document.getElementById('up-cat').value;
                
                if (!name || !price) { act.toast('❌ 資訊不完整'); return; }
                
                let val = '';
                if (cat === '熱量') val = document.getElementById('up-val-cal')?.value;
                else if (cat === '金錢') val = document.getElementById('up-val-gold')?.value;
                else if (cat === '時間') {
                    const h = parseInt(document.getElementById('up-time-h')?.value || 0);
                    const m = parseInt(document.getElementById('up-time-m')?.value || 0);
                    val = (h * 60) + m; // 存成總分鐘數
                }

                const success = ShopEngine.uploadItem({
                    name: name,
                    price: parseInt(price),
                    desc: document.getElementById('up-desc').value,
                    category: cat,
                    qty: parseInt(document.getElementById('up-qty').value || 1),
                    val: val, // 儲存數值
                    id: window.TempState.uploadEditId
                });

                if (success) {
                    act.toast('✅ 上架成功');
                    ui.modal.close('m-panel'); 
                    shopView.render();
                }
            },
            deleteShopItem: () => {
                ShopEngine.deleteItem(window.TempState.uploadEditId);
                act.toast('🗑️ 商品已下架');
                ui.modal.close('m-panel');
                shopView.render();
            },

            openItemDetail: (id) => shopView.renderItemDetail(id),
            useItem: (isDiscard) => {
                const id = window.TempState.useTargetId;
                if (isDiscard) {
                    ShopEngine.discardItem(id, 1);
                    act.toast('🗑️ 已丟棄 1 個');
                } else {
                    const res = ShopEngine.useItem(id);
                    act.toast(res.success ? '✅ 使用成功' : '❌ 無法使用');
                }
                ui.modal.close('m-panel');
                shopView.render(); 
                if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
            },
			// [Update] 購買精力 (顯示正確上限)
            buyStamina: (amount, cost) => {
                const res = ShopEngine.recoverStamina(amount, cost);
                
                if (res.success) {
                    // [新增] 獲取動態上限
                    const max = (window.StoryEngine && window.StoryEngine.calculateMaxEnergy) 
                                ? window.StoryEngine.calculateMaxEnergy() 
                                : 100;

                    act.toast(`⚡ 精力恢復了！ (目前: ${res.current}/${max})`);
                    ui.modal.close('m-overlay');
                    
                    if (window.TempState.currentView === 'story' && window.storyView) {
                        storyView.render(); 
                    }
                    if (window.view && view.updateHUD) {
                        view.updateHUD(window.GlobalState);
                    }
                } else {
                    act.toast(res.msg || '❌ 購買失敗');
                }
            },
            submitPayment: (amount) => {
                ShopEngine.addGem(amount);
                act.toast(`💎 獲得 ${amount} 鑽石！`);
                ui.modal.close('m-overlay');
                if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
            },
            openPayment: () => shopView.renderPayment()
        });

        EventBus.on(E.System.NAVIGATE, (pageId) => { if (pageId === 'shop') shopView.render(); });
        console.log("✅ ShopController Active");
    }
};