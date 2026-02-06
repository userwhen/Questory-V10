/* js/core.js - V35.0 System Core (Foundation) */
/* 包含：GlobalState 定義、存檔機制、核心導航、通用工具 */

window.act = window.act || {};
window.TempState = window.TempState || { currentView: 'main' };

// =========================================================
// 1. Core Engine (系統核心)
// =========================================================
window.Core = {
    init: function() {
        console.log("🚀 System Core Initializing...");
        this.load();         // 1. 讀檔
        this.migrateData();  // 2. 補丁
        this.checkDailyReset(); // 3. [新增] 換日檢測
        
        if (window.EventBus && window.EVENTS) {
            window.EventBus.emit(window.EVENTS.System.INIT);
        }
    },

    // --- [關鍵修復] 讀檔邏輯 ---
    load: function() {
        const savedData = localStorage.getItem('Levelife_Save_V1');
        if (savedData) {
            try {
                // 嘗試解碼
                const jsonStr = decodeURIComponent(escape(atob(savedData)));
                const parsedData = JSON.parse(jsonStr);

                if (parsedData && typeof parsedData === 'object') {
                    window.GlobalState = parsedData;
                    console.log("✅ 存檔讀取成功");
                } else {
                    throw new Error("存檔內容為空或格式錯誤");
                }
            } catch (e) {
                console.error("❌ 存檔讀取嚴重錯誤:", e);
                console.warn("⚠️ 系統已載入預設值，但保留了原始存檔在 LocalStorage 以便救援。");
                // 注意：這裡只初始化記憶體，不呼叫 save() 覆蓋舊檔
                this.initDefaultMemory(); 
            }
        } else {
            console.log("✨ 建立新存檔");
            this.resetData(); // 這是新玩家，可以安全重置並存檔
        }
    },

    save: function() {
        if (!window.GlobalState) return;
        try {
            const json = JSON.stringify(window.GlobalState);
            // 使用標準編碼，避免中文亂碼
            const encoded = btoa(unescape(encodeURIComponent(json)));
            localStorage.setItem('Levelife_Save_V1', encoded);
        } catch (e) {
            console.error("Save failed:", e);
        }
    },

    // 完整的重置 (會覆蓋存檔)
    resetData: function() {
        this.initDefaultMemory();
        this.save();
    },

    // 只初始化記憶體 (不覆蓋存檔)
    initDefaultMemory: function() {
        window.GlobalState = {
            lv: 1, gold: 0, freeGem: 0, paidGem: 0,
            tasks: [], history: [], achievements: [], milestones: [],
            settings: { mode: 'basic', calMax: 2000, theme: 'light' },
            unlocks: { 'basic': true },
            lastLoginDate: new Date().toDateString(), // 預設今天
            installDate: Date.now()
        };
    },

    // --- [新增] 換日檢測邏輯 ---
    checkDailyReset: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        const today = new Date().toDateString();
        // 如果上次登入日期 不等於 今天
        if (gs.lastLoginDate !== today) {
            console.log(`🌅 換日觸發！(${gs.lastLoginDate} -> ${today})`);
            
            // 1. 重置每日任務 (假設 TaskEngine 存在)
            if (window.TaskEngine && window.TaskEngine.resetDaily) {
                window.TaskEngine.resetDaily();
            }
            
            // 2. 重置每日商店 (可選)
            // if (window.ShopEngine) window.ShopEngine.restock();

            // 3. 更新日期並存檔
            gs.lastLoginDate = today;
            this.save();
            
            if (window.act.toast) window.act.toast("☀️ 早安！每日狀態已刷新");
        }
    },

    migrateData: function() {
        const gs = window.GlobalState;
        if(!gs) return;
        
        // 確保所有關鍵陣列都存在，防止 "undefined" 錯誤
        if(!gs.unlocks) gs.unlocks = {'basic':true};
        if(!gs.history) gs.history = [];
        if(!gs.tasks) gs.tasks = [];
        if(!gs.milestones) gs.milestones = []; // 關鍵：成就引擎需要這個
        if(!gs.achievements) gs.achievements = [];
        if(!gs.settings) gs.settings = { mode: 'basic' };
    }
};

// --- B. 視窗管理 (Modal Router) ---
window.act.openModal = function(id) {
    // 路由轉發：將舊 ID 轉給新模組渲染
    if (id === 'settings' && window.SettingsController) {
        window.SettingsController.renderSettings();
        return;
    }
    if (id === 'bag' && window.view && view.renderBag) {
        view.renderBag(); // 假設 Shop/Bag View 存在
        return;
    }

    // 預設行為：尋找 DOM 直接開啟 (相容舊版靜態 HTML)
    const targetId = id.startsWith('m-') ? id : 'm-' + id;
    const m = document.getElementById(targetId);
    if (m) {
        m.style.display = 'flex';
        setTimeout(() => m.classList.add('active'), 10);
        // 發出事件
        if(window.EventBus) window.EventBus.emit(window.EVENTS.System.MODAL_OPEN, id);
    }
};

window.act.closeModal = function(id) {
    let targetId = id;
    // ID 映射 (相容舊版)
    if (id === 'universal' || id === 'overlay') targetId = 'm-overlay';
    if (id === 'system') targetId = 'm-system';
    if (id === 'panel') targetId = 'm-panel';
    if (!targetId.startsWith('m-')) targetId = 'm-' + targetId;

    const m = document.getElementById(targetId);
    if (m) {
        m.classList.remove('active');
        setTimeout(() => m.style.display = 'none', 300); // 等待動畫結束
        // 發出事件
        if(window.EventBus) window.EventBus.emit(window.EVENTS.System.MODAL_CLOSE, id);
    }
};

// --- C. 通用操作 (Utils & Bridge) ---
window.act.save = function() {
    Core.save();
};

window.act.toast = function(msg) {
    // 優先使用 EventBus 通知 UI 層顯示
    if (window.EventBus && window.EVENTS) {
        window.EventBus.emit(window.EVENTS.System.TOAST, msg);
    } else {
        // Fallback: 如果沒有 UI 層，直接 console
        console.log(`[Toast] ${msg}`);
        alert(msg);
    }
};

// 新手教學入口 (保留舊版)
window.act.showQA = function() {
    // 假設 sys.confirm 存在，否則用原生
    const confirmFunc = (window.sys && sys.confirm) ? sys.confirm : confirm;
    if (confirmFunc("要重新觀看新手教學嗎?")) {
        if (window.act.restartTutorial) window.act.restartTutorial();
        else window.act.toast("教學模組尚未載入");
    }
};

// 初始化執行 (確保在 DOMContentLoaded 後手動呼叫 Core.init，或由 main.js 呼叫)
console.log("✅ Core V35 Loaded.");