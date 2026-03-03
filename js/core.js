/* js/core.js - SQ Phase 1 Refactor (Fix) */
window.SQ = window.SQ || {}; // 👈 確保這裡有分號
window.SQ.Actions = window.SQ.Actions || {}; // 👈 確保這裡有分號
window.SQ.Temp = window.SQ.Temp || { currentView: 'main' };

// =========================================================
// 1. Core Engine (系統核心)
// =========================================================
window.SQ.Core = {
    init: function() {
        console.log("🚀 [SQ.Core] Initializing...");
        this.load();         
        this.migrateData();  
        if (window.SQ.EventBus && window.SQ.Events) {
            window.SQ.EventBus.emit(window.SQ.Events.System.INIT);
        }
    },

    load: function() {
        const saveKey = window.SQ.Config?.System?.SaveKey || 'Levelife_Save_V1';
        const savedData = localStorage.getItem(saveKey);
        
        if (savedData) {
            try {
                const jsonStr = decodeURIComponent(escape(atob(savedData)));
                const parsedData = JSON.parse(jsonStr);

                if (parsedData && typeof parsedData === 'object') {
                    window.SQ.State = parsedData;
                    window.SQ.State = window.SQ.State; // 重新綁定橋接
                    console.log("✅ 存檔讀取成功");
                } else throw new Error("存檔內容為空或格式錯誤");
            } catch (e) {
                console.error("❌ 存檔讀取嚴重錯誤:", e);
                this.initDefaultMemory(); 
            }
        } else {
            console.log("✨ 建立新存檔");
            this.resetData();
        }
    },

    save: function() {
        if (!window.SQ.State) return;
        try {
            const json = JSON.stringify(window.SQ.State);
            const encoded = btoa(unescape(encodeURIComponent(json)));
            const saveKey = window.SQ.Config?.System?.SaveKey || 'Levelife_Save_V1';
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
        if (window.SQ.Default) {
            window.SQ.State = JSON.parse(JSON.stringify(window.SQ.Default));
            window.SQ.State.lastLoginDate = new Date().toDateString();
            window.SQ.State.installDate = Date.now();
        } else {
            window.SQ.State = {}; 
        }
        window.SQ.State = window.SQ.State; // 同步橋接
    },

    migrateData: function() {
        const gs = window.SQ.State;
        if(!gs) return;
        
        if (!gs.unlocks) gs.unlocks = { basic: true, feature_cal: false, feature_strict: false };
        else {
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
        // 🌟 加入守衛：確保每次啟動或重新整理，只執行一次結算
        if (this._dailyResetDone) {
            console.log("📅 [SQ.Core] 今日已結算，跳過重置");
            return; 
        }

        const gs = window.SQ.State;
        if (!gs) return;

        const today = new Date().toDateString();

        if (gs.lastLoginDate !== today) {
            console.log(`🌅 換日觸發！(${gs.lastLoginDate} -> ${today})`);

            if (gs.lastLoginDate) {
                const lastDate = new Date(gs.lastLoginDate);
                const nowDate = new Date();
                const diffTime = Math.abs(nowDate.setHours(0,0,0,0) - lastDate.setHours(0,0,0,0));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) gs.loginStreak = (gs.loginStreak || 0) + 1;
                else if (diffDays > 1) gs.loginStreak = 1; 
            } else {
                gs.loginStreak = 1; 
            }

            gs.lastLoginDate = today;

            if (window.SQ.EventBus && window.SQ.Events && window.SQ.Events.System.DAILY_RESET) {
                window.SQ.EventBus.emit(window.SQ.Events.System.DAILY_RESET);
            }
            if (this.save) this.save();
        }
        
        // 標記為已完成，並在 10 秒後釋放鎖定
        this._dailyResetDone = true; 
        setTimeout(() => { this._dailyResetDone = false; }, 10000);
    }
};

// =========================================================
// 2. 動作收斂註冊表 (Action Registry)
// =========================================================
Object.assign(window.SQ.Actions, {
    openModal: function(id) {
        if (id === 'settings' && window.SettingsController) { window.SettingsController.renderSettings(); return; }
        if (id === 'bag' && window.SQ.View.Main && window.SQ.View.Main.renderBag) { window.SQ.View.Main.renderBag(); return; }

        const targetId = id.startsWith('m-') ? id : 'm-' + id;
        const m = document.getElementById(targetId);
        if (m) {
            m.style.display = 'flex';
            setTimeout(() => m.classList.add('active'), 10);
            if(window.SQ.EventBus && window.SQ.Events) {
                window.SQ.EventBus.emit(window.SQ.Events.System.MODAL_OPEN, id);
            }
        }
    },

    closeModal: function(id) {
        let targetId = id;
        if (id === 'universal' || id === 'overlay') targetId = 'm-overlay';
        if (id === 'system') targetId = 'm-system';
        if (id === 'panel') targetId = 'm-panel';
        if (!targetId.startsWith('m-')) targetId = 'm-' + targetId;

        const m = document.getElementById(targetId);
        if (m) {
            m.classList.remove('active');
            setTimeout(() => m.style.display = 'none', 300);
            if(window.SQ.EventBus && window.SQ.Events) {
                window.SQ.EventBus.emit(window.SQ.Events.System.MODAL_CLOSE, id);
            }
        }
    },

    save: function() { window.SQ.Core.save(); },

    toast: function(msg) {
        if (window.SQ.EventBus && window.SQ.Events) {
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, msg);
        } else {
            console.log(`[Toast] ${msg}`);
            alert(msg);
        }
    },

    showQA: function() {
    // 1. 獲取確認函式
    const confirmFunc = (window.sys && window.sys.confirm) ? window.sys.confirm : window.confirm;
    
    // 2. 正確的非同步寫法：把動作放在第二個參數裡
    confirmFunc("要重新觀看新手教學嗎？", () => {
        // 只有玩家在 Modal 點擊「確定」後，這段才會執行
        if (window.SQ.Actions.restartTutorial) {
            console.log("🧚 執行重啟教學...");
            window.SQ.Actions.restartTutorial(); //
        } else {
            window.SQ.Actions.toast("教學模組尚未載入");
        }
    });
}
});