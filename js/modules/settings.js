/* js/modules/settings.js - V35.0 Fixed (Unlock Sync) */
window.SettingsEngine = {
    // 商店商品定義
    shopItems: [
        { 
            id: 'harem', name: '💕 后宮模式', 
            desc: '沈浸式體驗，專注於角色互動與好感度培養。',
            price: 50, currency: 'free', 
            color: '#e91e63', bg: '#fce4ec', border: '#f48fb1', badge: 'NEW'
        },
        { 
            id: 'learning', name: '📚 語言學習模組', 
            desc: '解鎖多語言劇情與單字替換功能。',
            price: 100, currency: 'paid', 
            color: '#f57f17', bg: '#fff8e1', border: '#ffb300', badge: 'HOT'
        }
    ],

    // 1. 應用設定變更
    applySettings: function(newSettings) {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        
        if (newSettings.mode === 'learning') {
            newSettings.learningMode = true;
            if (!newSettings.targetLang) newSettings.targetLang = 'mix';
        } else if (newSettings.mode) {
            newSettings.learningMode = false;
        }

        Object.assign(gs.settings, newSettings);
        
        if (window.App) App.saveData();
        
        EventBus.emit(window.EVENTS.Settings.UPDATED);
        EventBus.emit(window.EVENTS.System.TOAST, "✅ 設定已儲存");
        
        return gs.settings.mode === 'basic' ? 'stats' : 'main';
    },

    // 2. [修復] 儲存卡路里目標並解鎖功能
    saveCalTarget: function(val) {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        if (!gs.unlocks) gs.unlocks = {}; // 確保 unlocks 存在
        
        const numVal = parseInt(val);
        
        // 設定數值
        gs.settings.calMode = true;
        gs.settings.calMax = numVal;
        
        // [關鍵修復] 同步解鎖 TaskEngine 需要的旗標
        gs.unlocks.calorie_tracker = true; 
        
        if (window.App) App.saveData();
        
        // 通知更新
        if (window.EventBus) {
            EventBus.emit(window.EVENTS.Settings.UPDATED);
            EventBus.emit(window.EVENTS.System.TOAST, `✅ 目標已更新: ${numVal} Kcal (功能已啟用)`);
            // 強制刷新 Stats 頁面以顯示熱量表
            EventBus.emit(window.EVENTS.Stats.UPDATED);
        }
    },

    // 3. 購買模式
    buyMode: function(itemId) {
        const gs = window.GlobalState;
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return;

        const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
        if (totalGem < item.price) {
            EventBus.emit(window.EVENTS.System.TOAST, "❌ 鑽石不足");
            return;
        }
        
        let cost = item.price;
        if ((gs.freeGem || 0) >= cost) {
            gs.freeGem -= cost;
        } else {
            cost -= (gs.freeGem || 0);
            gs.freeGem = 0;
            gs.paidGem = (gs.paidGem || 0) - cost;
        }

        if (!gs.unlocks) gs.unlocks = {};
        gs.unlocks[itemId] = true;
        
        if (window.App) App.saveData();
        EventBus.emit(window.EVENTS.Settings.UPDATED);
        EventBus.emit(window.EVENTS.System.TOAST, `🎉 已解鎖 ${item.name}`);
    },

    // 4. 重置資料
    performReset: function() {
        window.isResetting = true;
        localStorage.clear();
        location.reload();
    },

    // 5. 匯出/匯入
    exportData: function() {
        const json = JSON.stringify(window.GlobalState);
        return btoa(unescape(encodeURIComponent(json)));
    },

    importData: function(encodedStr) {
        try {
            const jsonStr = decodeURIComponent(escape(atob(encodedStr)));
            const data = JSON.parse(jsonStr);
            
            if (data && (typeof data.lv === 'number' || typeof data.gold === 'number')) {
                window.GlobalState = data;
                if (window.App) App.saveData();
                EventBus.emit(window.EVENTS.System.TOAST, "✅ 匯入成功，即將重啟...");
                setTimeout(() => location.reload(), 1000);
            } else {
                throw new Error("Format Error");
            }
        } catch (e) {
            if(window.EventBus) EventBus.emit(window.EVENTS.System.TOAST, "❌ 代碼無效");
        }
    }
};