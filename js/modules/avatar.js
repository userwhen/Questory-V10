/* js/modules/avatar.js - Avatar Logic Engine */
window.AvatarEngine = {
    // 1. 初始化試穿 Session (進入頁面時呼叫)
    initSession: function() {
        const gs = window.GlobalState;
        // 確保結構存在
        if (!gs.avatar) gs.avatar = { unlocked: [], wearing: {}, gender: 'm' };
        
        // 確保商店數據存在 (Fallback)
        if (!window.GameConfig) window.GameConfig = {};
        if (!window.GameConfig.AvatarShop) {
            window.GameConfig.AvatarShop = [
                { id: 'adventurer_m', name: '冒險者 (男)', price: 0, type: 'suit' },
                { id: 'adventurer_f', name: '冒險者 (女)', price: 0, type: 'suit' }, 
                { id: 'harem_m', name: '後宮 (男)', price: 150, type: 'suit' },
                { id: 'harem_f', name: '後宮 (女)', price: 150, type: 'suit' }
            ];
        }

        // 🚨 [相容性修復] 把舊存檔的 suit_novice 自動轉換為 adventurer_m
        if (gs.avatar.wearing.suit === 'suit_novice' || !gs.avatar.wearing.suit) {
            gs.avatar.wearing.suit = 'adventurer_m';
        }
        if (gs.avatar.unlocked.includes('suit_novice')) {
            gs.avatar.unlocked = gs.avatar.unlocked.filter(id => id !== 'suit_novice');
        }

        // 如果還沒解鎖預設套裝，自動解鎖
        if (!gs.avatar.unlocked.includes('adventurer_m')) {
            gs.avatar.unlocked.push('adventurer_m');
        }

        // 複製當前穿著到預覽暫存
        window.TempState.preview = JSON.parse(JSON.stringify(gs.avatar.wearing || {}));
        
        window.EventBus.emit(window.EVENTS.Avatar.UPDATED);
    },

    // 2. 預覽邏輯 (只改暫存，不存檔)
    previewItem: function(suitId) {
        if (!window.TempState.preview) window.TempState.preview = {};
        window.TempState.preview.suit = suitId;
        window.EventBus.emit(window.EVENTS.Avatar.UPDATED);
    },

    // 3. 穿上邏輯 (確認變更)
    wearItem: function(suitId) {
        const gs = window.GlobalState;
        if (!gs.avatar.wearing) gs.avatar.wearing = {};
        
        gs.avatar.wearing.suit = suitId;
        window.TempState.preview.suit = suitId; // 同步預覽

        if (window.App) App.saveData();
        
        window.EventBus.emit(window.EVENTS.Avatar.UPDATED);
        window.EventBus.emit(window.EVENTS.System.TOAST, "✨ 已更換裝備");
        
        // 通知 HUD 更新立繪
        window.EventBus.emit(window.EVENTS.Stats.UPDATED);
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
            window.EventBus.emit(window.EVENTS.System.TOAST, `💎 鑽石不足 (需 ${item.price})`);
            return;
        }

        if (item.price > 0) {
            gs.paidGem -= item.price;
        }

        if (!gs.avatar.unlocked) gs.avatar.unlocked = [];
        if (!gs.avatar.unlocked.includes(suitId)) gs.avatar.unlocked.push(suitId);

        if (window.App) App.saveData();
        
        window.EventBus.emit(window.EVENTS.Avatar.UPDATED);
        window.EventBus.emit(window.EVENTS.System.TOAST, `🎉 購買成功！`);
        window.EventBus.emit(window.EVENTS.Stats.UPDATED);
    }
};