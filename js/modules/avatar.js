/* js/modules/avatar.js - Avatar Logic Engine */
window.AvatarEngine = {
    // 1. 初始化試穿 Session (進入頁面時呼叫)
    initSession: function() {
        const gs = window.GlobalState;
        if (!gs.avatar) gs.avatar = { unlocked: [], wearing: {}, gender: 'm' };
        
        // 確保商店數據存在 (Fallback)
        if (!window.GameConfig) window.GameConfig = {};
        if (!window.GameConfig.AvatarShop) {
            window.GameConfig.AvatarShop = [
                { id: 'suit_novice', name: '新手套裝', price: 0 },
                { id: 'suit_knight', name: '騎士鎧甲', price: 100 },
                { id: 'suit_mage', name: '法師長袍', price: 150 },
                { id: 'suit_king', name: '國王新衣', price: 999 }
            ];
        }

        // 複製當前穿著到預覽暫存
        window.TempState.preview = JSON.parse(JSON.stringify(gs.avatar.wearing || {}));
        
        // 如果還沒解鎖新手套裝，自動解鎖
        if (!gs.avatar.unlocked.includes('suit_novice')) {
            gs.avatar.unlocked.push('suit_novice');
        }

        EventBus.emit(EVENTS.Avatar.UPDATED);
    },

    // 2. 預覽邏輯 (只改暫存，不存檔)
    previewItem: function(suitId) {
        if (!window.TempState.preview) window.TempState.preview = {};
        window.TempState.preview.suit = suitId;
        EventBus.emit(EVENTS.Avatar.UPDATED);
    },

    // 3. 穿上邏輯 (確認變更)
    wearItem: function(suitId) {
        const gs = window.GlobalState;
        if (!gs.avatar.wearing) gs.avatar.wearing = {};
        
        gs.avatar.wearing.suit = suitId;
        window.TempState.preview.suit = suitId; // 同步預覽

        if (window.App) App.saveData();
        
        EventBus.emit(EVENTS.Avatar.UPDATED);
        EventBus.emit(EVENTS.System.TOAST, "✨ 已更換裝備");
        
        // 通知 HUD 更新立繪
        EventBus.emit(EVENTS.Stats.UPDATED);
    },

    // 4. 購買邏輯
    buyItem: function(suitId) {
        const gs = window.GlobalState;
        const shopData = window.GameConfig.AvatarShop || [];
        const item = shopData.find(i => i.id === suitId);
        if (!item) return;

        // 檢查貨幣 (假設用付費鑽石，可依需求改)
        const currentGem = gs.paidGem || 0;
        
        // 簡單判斷：如果價格是 0 就直接送
        if (item.price > 0 && currentGem < item.price) {
            EventBus.emit(EVENTS.System.TOAST, `💎 鑽石不足 (需 ${item.price})`);
            return;
        }

        if (item.price > 0) {
            gs.paidGem -= item.price;
        }

        if (!gs.avatar.unlocked) gs.avatar.unlocked = [];
        if (!gs.avatar.unlocked.includes(suitId)) gs.avatar.unlocked.push(suitId);

        if (window.App) App.saveData();
        
        EventBus.emit(EVENTS.Avatar.UPDATED);
        EventBus.emit(EVENTS.System.TOAST, `🎉 購買成功！`);
        EventBus.emit(EVENTS.Stats.UPDATED);
    }
};