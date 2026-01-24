/* js/modules/shop_controller.js - V34.Final */
window.ShopController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act
        Object.assign(window.act, {
            setShopFilter: (cat) => { 
                window.TempState.shopCategory = cat; 
                shopView.render(); 
            },
            setBagFilter: (cat) => {
                window.TempState.bagCategory = cat;
                shopView.renderBag();
            },
            openBag: () => {
                window.TempState.bagCategory = '全部';
                shopView.renderBag();
            },
            openBuyModal: (id) => shopView.renderBuyModal(id),
            openItemDetail: (id) => shopView.renderItemDetail(id),
            openPayment: () => shopView.renderPayment(),
            
            // 購買相關
            updateBuyQty: (delta) => {
                let el = document.getElementById('buy-qty-input'); // 注意：V34 的 ui.input 預設 ID 可能不同
                // 這裡我們直接操作 TempState
                const current = window.TempState.buyQty || 1;
                const max = window.TempState.buyMax || 99;
                let next = current + delta;
                if (next < 1) next = 1;
                if (next > max) next = max;
                window.TempState.buyQty = next;
                
                // 更新 UI
                const display = document.getElementById('buy-qty-display');
                if(display) display.innerText = next;
                
                const totalDisplay = document.getElementById('buy-total-price');
                const items = ShopEngine.getShopItems('全部');
                const item = items.find(i => i.id === window.TempState.buyTargetId);
                if(totalDisplay && item) totalDisplay.innerText = item.price * next;
            },
            confirmBuy: () => ShopEngine.buyItem(window.TempState.buyTargetId, window.TempState.buyQty),
            useItem: (isDiscard) => ShopEngine.useItem(window.TempState.useTargetId, 1, isDiscard),

            // 上架相關
            renderUploadModal: (id) => shopView.renderUploadModal(id),
            shopUploadChange: () => {
                const el = document.getElementById('up-cat');
                if(el) shopView.renderDynamicFields(el.value);
            },
            submitUpload: () => {
                // 從 DOM 收集資料
                const data = {
                    name: document.getElementById('up-name')?.value,
                    desc: document.getElementById('up-desc')?.value,
                    category: document.getElementById('up-cat')?.value,
                    price: parseInt(document.getElementById('up-price')?.value) || 0,
                    qty: parseInt(document.getElementById('up-qty')?.value) || 1,
                    perm: document.getElementById('up-perm')?.value,
                    // 動態數值
                    val: document.getElementById('up-val-cal')?.value || 
                         document.getElementById('up-val-gold')?.value ||
                         document.getElementById('up-val-time')?.value || ''
                };
                ShopEngine.submitUpload(data);
            },
            deleteShopItem: () => {
                if(confirm("確定下架此商品？")) ShopEngine.deleteShopItem(window.TempState.uploadEditId);
            },
            
            // 儲值
            submitPayment: (amount) => {
                if(confirm(`確定儲值 ${amount} 鑽石?`)) ShopEngine.submitPayment(amount);
            },
			
			// 精力商店
            openStaminaShop: () => shopView.renderStaminaShop(),
            buyStamina: (type) => {
                if(confirm(`確定花費鑽石購買精力?`)) ShopEngine.buyStamina(type);
            },
			
			// [New] 橋接舊版通用開窗指令
            openModal: (id) => {
                if (id === 'bag') shopView.renderBag();
                // 其他舊版 ID 可在此擴充，例如 'quick'
            },
            
            // [New] 橋接 QA (如果還沒做 QA 模組，先給個空函式防止報錯)
            showQA: () => alert("QA 功能即將開放！"),
        });

        // [New] 橋接 View 層級呼叫 (給 HTML 按鈕用)
        window.view = window.view || {};
        window.view.renderUploadModal = (id) => window.shopView.renderUploadModal(id);


        // B. 監聽導航
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'shop') shopView.render();
        });

        // C. 監聽數據更新
        EventBus.on(E.Shop.UPDATED, () => {
            if (window.TempState.currentView === 'shop') shopView.render();
        });

        // D. 監聽背包更新
        EventBus.on(E.Shop.BAG_UPDATED, () => {
            const bagModal = document.getElementById('m-panel');
            if (bagModal && bagModal.classList.contains('active')) shopView.renderBag();
            // 通知 MainController 更新 HUD
            EventBus.emit(E.Stats.UPDATED);
        });

        console.log("✅ ShopController (Final) 就緒");
    }
};