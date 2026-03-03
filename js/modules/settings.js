/* js/modules/settings.js - V35.0 Fixed (Unlock Sync) */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Settings = {
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
        const gs = window.SQ.State;
        if (!gs.settings) gs.settings = {};
        
        if (newSettings.mode === 'learning') {
            newSettings.learningMode = true;
            if (!newSettings.targetLang) newSettings.targetLang = 'mix';
        } else if (newSettings.mode) {
            newSettings.learningMode = false;
        }

        Object.assign(gs.settings, newSettings);
        
        if (window.App) App.saveData();
        
        window.SQ.EventBus.emit(window.SQ.Events.Settings.UPDATED);
        window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, "✅ 設定已儲存");
        
        return gs.settings.mode === 'basic' ? 'stats' : 'main';
    },

    // 2. [修復] 儲存卡路里目標並解鎖功能
    saveCalTarget: function(val) {
        const gs = window.SQ.State;
        if (!gs.settings) gs.settings = {};
        if (!gs.unlocks) gs.unlocks = {}; // 確保 unlocks 存在
        
        const numVal = parseInt(val);
        
        // 設定數值
        gs.settings.calMode = true;
        gs.settings.calMax = numVal;
        
        // [關鍵修復] 同步解鎖 TaskEngine 需要的旗標
        gs.unlocks.feature_cal = true; 
        
        if (window.App) App.saveData();
        
        // 通知更新
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.Settings.UPDATED);
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `✅ 目標已更新: ${numVal} Kcal (功能已啟用)`);
            // 強制刷新 Stats 頁面以顯示熱量表
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
        }
    },

    // 3. 購買模式
    buyMode: function(itemId) {
        const gs = window.SQ.State;
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return;

        const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
        if (totalGem < item.price) {
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, "❌ 鑽石不足");
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
        window.SQ.EventBus.emit(window.SQ.Events.Settings.UPDATED);
        window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `🎉 已解鎖 ${item.name}`);
    },

    // 在 SettingsEngine 內新增/修改
downloadSaveFile: function() {
        const gs = window.SQ.State;
        const json = JSON.stringify(gs, null, 2); // 美化格式
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Levelife_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    },

    // 2. 讀取 JSON 檔案 (解析用)
    parseSaveFile: function(file, callback) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // 簡單驗證
                if (data && typeof data.lv !== 'undefined') {
                    callback(data);
                } else {
                    alert("❌ 檔案格式錯誤：這不是本遊戲的存檔");
                }
            } catch (err) {
                console.error(err);
                alert("❌ 檔案損毀無法讀取");
            }
        };
        reader.readAsText(file);
    },
	
	// 4. [補回] 重置資料 (這是原本缺失的部分)
    performReset: function() {
        console.warn("⚠️ 執行系統重置...");
        const saveKey = (window.GameConfig?.System?.SaveKey) || 'Levelife_Save_V1';
        localStorage.removeItem(saveKey);
        localStorage.removeItem('SQ_QUICK_DRAFT');		// 清除存檔
        location.reload(); // 重新整理頁面
    },
};
window.SettingsEngine = window.SQ.Engine.Settings;