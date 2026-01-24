/* js/main.js - 修正後的啟動器 */
const SAVE_KEY = 'SQ_V103';

window.App = {
    boot: function() {
        this.loadData();
    
        // 1. 核心修正：必須把 MainController 放入啟動名單
        const controllers = [
            MainController,    
            TaskController, 
            StatsController, 
            ShopController, 
            AchController, 
            AvatarController, 
            StoryController, 
            SettingsController
        ];
    
        // 3. 啟動所有控制器
        controllers.forEach(ctrl => { 
            if (ctrl && ctrl.init) ctrl.init(); 
        });
    
        // 4. 初始導航
        if (window.act && window.act.navigate) {
            window.act.navigate('main');
        } else {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const main = document.getElementById('page-main');
            if(main) main.classList.add('active');
        }

        // 5. 渲染 HUD
        if(window.view && view.initHUD) view.initHUD(window.GlobalState);
        
        console.log("🚀 [App] System Booted.");
    },

    loadData: function() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            window.GlobalState = saved ? 
                { ...window.DefaultData, ...JSON.parse(saved) } : 
                JSON.parse(JSON.stringify(window.DefaultData));
        } catch (e) {
            console.error("Load Error:", e);
            window.GlobalState = JSON.parse(JSON.stringify(window.DefaultData));
        }
    },

    saveData: function() {
        if (window.isResetting) return;
        localStorage.setItem(SAVE_KEY, JSON.stringify(window.GlobalState));
    },

    // 修復並整合 initGlobalListeners
    initGlobalListeners: function() {
        if (!window.EventBus) return;
        
        window.EventBus.on(window.EVENTS.System.NAVIGATE, (pageId) => {
            // 雙重保險：確保 Core 執行切換
            if (window.Core) Core.switchPage(pageId);
            
            // 處理 Navbar 顯示邏輯
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.style.display = ['story', 'avatar'].includes(pageId) ? 'none' : 'flex';
            }
        });
    }
};

// MainController 保持不變
const MainController = {
    init: function() {
        if (!window.EventBus) return;

        window.EventBus.on(window.EVENTS.System.NAVIGATE, (pageId) => {
            if (window.view && typeof view.render === 'function') {
                view.render(); 
            }
        });

        window.EventBus.on(window.EVENTS.Stats.UPDATED, () => {
            if (window.view && view.updateHUD) {
                view.updateHUD(window.GlobalState);
            }
        });
        console.log("✅ MainController Active");
    }
};



// 啟動
document.addEventListener('DOMContentLoaded', () => App.boot());

Object.assign(window.act, {
    handleSysConfirm: (result) => {
        console.log("[Main] 處理系統確認:", result);

        // 1. 關閉視窗 (優先嘗試標準 UI 方法，失敗則用 DOM 硬關)
        // 因為 view.renderSystemModal 強制使用 'system' 層級，所以 ID 是 'm-system'
        const targetId = 'm-system';
        
        if (window.ui && window.ui.modal && window.ui.modal.close) {
            ui.modal.close(targetId);
        } else {
            // Fallback: 如果 ui 模組尚未就緒，直接操作 DOM
            const modal = document.getElementById(targetId);
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        }

        // 2. 處理 Prompt (輸入框)
        if (result === 'prompt_submit') {
            const val = document.getElementById('sys-univ-input')?.value;
            if (window.TempState.sysPromptCallback) {
                window.TempState.sysPromptCallback(val);
                window.TempState.sysPromptCallback = null;
            }
            return;
        }

        // 3. 處理 Confirm (確認)
        if (result === true) {
            if (window.TempState.sysConfirmCallback) {
                window.TempState.sysConfirmCallback();
                window.TempState.sysConfirmCallback = null;
            }
        } 
        // 4. 處理 Cancel (取消)
        else {
            if (window.TempState.sysCancelCallback) {
                window.TempState.sysCancelCallback();
                window.TempState.sysCancelCallback = null;
            }
        }
    }
});

// 確保這行在最下面
console.log("🚀 [Main] System Logic Loaded.");