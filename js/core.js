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

    // --- 讀檔邏輯 ---
    load: function() {
        // 💎 動態讀取 SaveKey，如果沒讀到則 fallback 為預設值
        const saveKey = (window.GameConfig && window.GameConfig.System && window.GameConfig.System.SaveKey) ? window.GameConfig.System.SaveKey : 'Levelife_Save_V1';
        const savedData = localStorage.getItem(saveKey);
        
        if (savedData) {
            try {
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
                this.initDefaultMemory(); 
            }
        } else {
            console.log("✨ 建立新存檔");
            this.resetData();
        }
    },

    save: function() {
        if (!window.GlobalState) return;
        try {
            const json = JSON.stringify(window.GlobalState);
            const encoded = btoa(unescape(encodeURIComponent(json)));
            // 💎 同步動態讀取 SaveKey
            const saveKey = (window.GameConfig && window.GameConfig.System && window.GameConfig.System.SaveKey) ? window.GameConfig.System.SaveKey : 'Levelife_Save_V1';
            localStorage.setItem(saveKey, encoded);
        } catch (e) {
            console.error("Save failed:", e);
        }
    },

    resetData: function() {
        this.initDefaultMemory();
        this.save();
    },

    initDefaultMemory: function() {
        if (window.DefaultData) {
            window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData));
            window.GlobalState.lastLoginDate = new Date().toDateString();
            window.GlobalState.installDate = Date.now();
        } else {
            // Fallback (萬一 data.js 沒載入時的最小安全結構)
            window.GlobalState = {
                name: 'Commander', lv: 1, exp: 0,
                gold: 0, freeGem: 0, paidGem: 0,
                tasks: [], history: [], achievements: [], milestones: [],
                taskCats: ['每日', '運動', '工作', '待辦', '願望'],
                attrs: {}, skills: [], cal: { today: 0, logs: [] },
                story: { energy: 30, tags: [], vars: {}, flags: {}, chain: null, currentNode: null },
                avatar: { gender: 'm', unlocked: [], wearing: {} },
                shop: { user: [] }, 
                settings: { mode: 'adventurer', calMax: 2000, theme: 'light' },
                unlocks: { 'basic': true, 'feature_cal': false },
                lastLoginDate: new Date().toDateString(), 
                installDate: Date.now()
            };
        }
    },

    migrateData: function() {
        const gs = window.GlobalState;
        if(!gs) return;
        
        // 確保所有關鍵陣列與屬性存在 (補丁機制)
        if(!gs.unlocks) gs.unlocks = {'basic':true, 'feature_cal': false};
        if(gs.unlocks.feature_cal === undefined) gs.unlocks.feature_cal = false;
        
        if(!gs.history) gs.history = [];
        if(!gs.tasks) gs.tasks = [];
        if(!gs.milestones) gs.milestones = []; 
        if(!gs.achievements) gs.achievements = [];
        if(!gs.settings) gs.settings = { mode: 'basic' };
        if(!gs.avatar) gs.avatar = { gender: 'm', unlocked: [], wearing: {} };
        
        // [新增防呆] 補齊 story 物件內部的缺失
        if(!gs.story) gs.story = { energy: 30, tags: [], vars: {}, flags: {}, chain: null, currentNode: null };
        if(gs.story.chain === undefined) gs.story.chain = null;
        if(gs.story.currentNode === undefined) gs.story.currentNode = null;
        if(gs.story.vars === undefined) gs.story.vars = {};
        if(gs.story.flags === undefined) gs.story.flags = {};
        if (!gs.cal) gs.cal = { today: 0, logs: [] };
		if (!gs.cal.logs) gs.cal.logs = [];
        // [關鍵修復] 舊玩家若無此欄位，給予初始值，避免觸發無限換日
        if(!gs.lastLoginDate) gs.lastLoginDate = new Date().toDateString(); 
        
        // 轉移並銷毀舊版熱量旗標
        if (gs.unlocks.calorie_tracker !== undefined) {
            gs.unlocks.feature_cal = gs.unlocks.calorie_tracker;
            delete gs.unlocks.calorie_tracker; 
        }
    },

    // --- [修復 CORE-3] 換日檢測邏輯重構 ---
    checkDailyReset: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        const today = new Date().toDateString();
        
        // 如果上次登入日期 不等於 今天
        if (gs.lastLoginDate !== today) {
            console.log(`🌅 換日觸發！(${gs.lastLoginDate} -> ${today})`);
            
            // 優先發送全域換日事件，讓各個 Engine (Task, Shop) 獨立監聽處理，不再互相干擾
            if (window.EventBus && window.EVENTS && window.EVENTS.System.DAILY_RESET) {
                window.EventBus.emit(window.EVENTS.System.DAILY_RESET);
            } else {
                // 相容舊寫法 Fallback
                if (window.TaskEngine && window.TaskEngine.resetDaily) window.TaskEngine.resetDaily();
            }

            // 更新日期並存檔
            gs.lastLoginDate = today;
            this.save();
            
            if (window.act.toast) window.act.toast("☀️ 早安！每日狀態已刷新");
        }
    },
	}; // 🚨 這裡非常關鍵！必須是 }; 來關閉整個 window.Core 物件！// --- B. 視窗管理 (Modal Router) ---
window.act.openModal = function(id) {
    if (id === 'settings' && window.SettingsController) {
        window.SettingsController.renderSettings();
        return;
    }
    if (id === 'bag' && window.view && view.renderBag) {
        view.renderBag();
        return;
    }

    const targetId = id.startsWith('m-') ? id : 'm-' + id;
    const m = document.getElementById(targetId);
    if (m) {
        m.style.display = 'flex';
        setTimeout(() => m.classList.add('active'), 10);
        // [修復 EVENT-2] 發送 MODAL_OPEN 事件
        if(window.EventBus && window.EVENTS) {
            window.EventBus.emit(window.EVENTS.System.MODAL_OPEN, id);
        }
    }
};

window.act.closeModal = function(id) {
    let targetId = id;
    if (id === 'universal' || id === 'overlay') targetId = 'm-overlay';
    if (id === 'system') targetId = 'm-system';
    if (id === 'panel') targetId = 'm-panel';
    if (!targetId.startsWith('m-')) targetId = 'm-' + targetId;

    const m = document.getElementById(targetId);
    if (m) {
        m.classList.remove('active');
        setTimeout(() => m.style.display = 'none', 300);
        if(window.EventBus && window.EVENTS) {
            window.EventBus.emit(window.EVENTS.System.MODAL_CLOSE, id);
        }
    }
};

// --- C. 通用操作 (Utils & Bridge) ---
window.act.save = function() {
    Core.save();
};

window.act.toast = function(msg) {
    if (window.EventBus && window.EVENTS) {
        window.EventBus.emit(window.EVENTS.System.TOAST, msg);
    } else {
        console.log(`[Toast] ${msg}`);
        alert(msg);
    }
};

window.act.showQA = function() {
    const confirmFunc = (window.sys && sys.confirm) ? sys.confirm : confirm;
    if (confirmFunc("要重新觀看新手教學嗎?")) {
        if (window.act.restartTutorial) window.act.restartTutorial();
        else window.act.toast("教學模組尚未載入");
    }
};

console.log("✅ Core V35 Loaded (Phase 1 Fixes Applied).");