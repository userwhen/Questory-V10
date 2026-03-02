/* js/core.js - V36.0 System Core (Phase 1 Fix) */
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
        // ⚠️ 已移除 this.checkDailyReset()，改由 main.js 在所有模組就緒後統一呼叫，解決 Race Condition
        
        if (window.EventBus && window.EVENTS) {
            window.EventBus.emit(window.EVENTS.System.INIT);
        }
    },

    // --- 讀檔邏輯 ---
    load: function() {
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
        
        if (!gs.unlocks) {
            gs.unlocks = { basic: true, feature_cal: false, feature_strict: false };
        } else {
            if (gs.unlocks.feature_cal === undefined) gs.unlocks.feature_cal = false;
            if (gs.unlocks.feature_strict === undefined) gs.unlocks.feature_strict = false;
        }
        if(!gs.history) gs.history = [];
        if(!gs.tasks) gs.tasks = [];
        if(!gs.milestones) gs.milestones = []; 
        if(!gs.achievements) gs.achievements = [];
        if(!gs.settings) gs.settings = { mode: 'basic' };
        if(!gs.avatar) gs.avatar = { gender: 'm', unlocked: [], wearing: {} };
        
        if(!gs.story) gs.story = { energy: 30, tags: [], vars: {}, flags: {}, chain: null, currentNode: null };
        if(gs.story.chain === undefined) gs.story.chain = null;
        if(gs.story.currentNode === undefined) gs.story.currentNode = null;
        if(gs.story.vars === undefined) gs.story.vars = {};
        if(gs.story.flags === undefined) gs.story.flags = {};
        if (!gs.cal) gs.cal = { today: 0, logs: [] };
		if (!gs.cal.logs) gs.cal.logs = [];
        if(!gs.lastLoginDate) gs.lastLoginDate = new Date().toDateString(); 
        
        if (gs.unlocks.calorie_tracker !== undefined) {
            gs.unlocks.feature_cal = gs.unlocks.calorie_tracker;
            delete gs.unlocks.calorie_tracker; 
        }
    },

    checkDailyReset: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        const today = new Date().toDateString();

        if (gs.lastLoginDate !== today) {
            console.log(`🌅 換日觸發！(${gs.lastLoginDate} -> ${today})`);

            if (gs.lastLoginDate) {
                const lastDate = new Date(gs.lastLoginDate);
                const nowDate = new Date();
                const diffTime = Math.abs(nowDate.setHours(0,0,0,0) - lastDate.setHours(0,0,0,0));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    gs.loginStreak = (gs.loginStreak || 0) + 1;
                } else if (diffDays > 1) {
                    gs.loginStreak = 1; 
                }
            } else {
                gs.loginStreak = 1; 
            }

            gs.lastLoginDate = today;

            if (window.EventBus && window.EVENTS && window.EVENTS.System.DAILY_RESET) {
                window.EventBus.emit(window.EVENTS.System.DAILY_RESET);
            }
            
            if (this.save) this.save();
        }
    }
}; // ✅ 徹底修復：在這裡乾淨地關閉 Core 物件

// =========================================================
// 2. 視窗管理與通用操作 (Modal Router & Utils)
// =========================================================
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

console.log("✅ Core V36 Loaded (Phase 1 Fixes Applied).");