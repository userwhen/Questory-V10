/* js/core.js - V35.0 System Core (Foundation) */
/* 包含：GlobalState 定義、存檔機制、核心導航、通用工具 */

window.act = window.act || {};
window.TempState = window.TempState || { currentView: 'main' };

// =========================================================
// 1. Core Engine (系統核心)
// =========================================================
window.Core = {
    // --- 系統初始化 ---
    init: function() {
        console.log("🚀 System Core V35 Initializing...");
        
        // 1. 讀取存檔
        this.load();

        // 2. 資料結構遷移與修補 (確保 DLC 與新欄位存在)
        this.migrateData();

        // 3. 發送初始化事件
        if (window.EventBus && window.EVENTS) {
            window.EventBus.emit(window.EVENTS.System.INIT);
        }
    },

    // --- 資料管理 (Data Management) ---
    
    // 讀取存檔
    load: function() {
        const savedData = localStorage.getItem('Levelife_Save_V1');
        if (savedData) {
            try {
                // Base64 解碼 -> JSON 解析
                window.GlobalState = JSON.parse(decodeURIComponent(escape(atob(savedData))));
                console.log("✅ 存檔讀取成功");
            } catch (e) {
                console.error("❌ 存檔損毀，重置資料", e);
                this.resetData();
            }
        } else {
            console.log("✨ 歡迎新使用者，建立預設資料");
            this.resetData();
        }
    },

    // 儲存存檔
    save: function() {
        if (!window.GlobalState) return;
        try {
            const json = JSON.stringify(window.GlobalState);
            const encoded = btoa(unescape(encodeURIComponent(json)));
            localStorage.setItem('Levelife_Save_V1', encoded);
            
            // 可選：發送存檔事件 (避免過於頻繁可不發)
            // if(window.EventBus) window.EventBus.emit(window.EVENTS.System.SAVE);
        } catch (e) {
            console.error("Save failed:", e);
            if (window.act.toast) window.act.toast("❌ 存檔失敗 (空間不足?)");
        }
    },

    // 重置/預設資料結構 (The Holy Grail of Data Structure)
    resetData: function() {
        window.GlobalState = {
            // [A] 玩家基礎
            lv: 1,
            exp: 0,
            gold: 0,
            freeGem: 0, // 免費鑽
            paidGem: 0, // 儲值鑽
            
            // [B] 屬性與技能
            attrs: {},   // STR, INT... (由 StatsEngine 補完)
            skills: [],  // 現役技能
            archivedSkills: [], // 大師技能
            
            // [C] 任務系統
            tasks: [],   // 進行中任務
            history: [], // 冒險日誌 (含完成與失敗)
            
            // [D] 成就與里程碑
            achievements: [], // 系統成就 (Badges - 自動觸發)
            milestones: [],   // 玩家里程碑 (Cards - 手動設定/Tag監聽)
            
            // [E] 設定與 DLC 解鎖
            settings: {
                mode: 'basic',      // basic, story, harem, learning...
                sound: true,
                theme: 'light',
                calMax: 2000,       // 預設熱量目標
                targetLang: 'en'    // 學習模式目標語言
            },
            unlocks: {
                // 預設解鎖 basic
                'basic': true,
                // DLC 預設鎖定
                'harem': false,
                'learning': false,
                'calorie_tracker': false, // 熱量追蹤模組
                'strict_mode': false      // 嚴格模式契約
            },

            // [F] 系統紀錄
            lastLoginDate: new Date().toDateString(),
            installDate: Date.now()
        };
        this.save();
    },

    // 資料補丁 (Migration) - 確保舊存檔擁有新欄位
    migrateData: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        // V35 DLC 補丁
        if (!gs.unlocks) gs.unlocks = { 'basic': true };
        
        // V35 雙貨幣補丁
        if (typeof gs.freeGem === 'undefined') gs.freeGem = 0;
        if (typeof gs.paidGem === 'undefined') gs.paidGem = 0;

        // V35 里程碑與歷史補丁
        if (!gs.milestones) gs.milestones = [];
        if (!gs.history) gs.history = [];

        // 確保設定存在
        if (!gs.settings) gs.settings = { mode: 'basic' };
    },
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