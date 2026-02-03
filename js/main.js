/* js/main.js - V39.2 System Bootloader (UI Manager & Lobby Fix) */
/* 負責：系統初始化順序、全域 UI 管理、錯誤攔截、相容性接口 */

const SAVE_KEY = 'Levelife_Save_V1';

window.App = {
    // =========================================================================
    // 1. 系統啟動 (Boot Sequence)
    // =========================================================================
    boot: function() {
        console.log("🔌 [App] System Booting...");

        // A. 初始化控制器
        const controllers = [
            window.MainController,    
            window.TaskController, 
            window.StatsController, 
            window.AchController, 
            window.ShopController, 
            window.AvatarController, 
            window.StoryController, 
            window.SettingsController,
            window.quickController
        ];
        
        controllers.forEach(ctrl => { 
            if (ctrl && ctrl.init) ctrl.init(); 
        });

        // B. 初始化引擎
        if (window.TaskEngine) window.TaskEngine.init();
        if (window.AchEngine) window.AchEngine.init();
        if (window.StatsEngine) window.StatsEngine.init();
        if (window.Core) window.Core.init();

        // C. 啟動導航
        setTimeout(() => {
            if (window.act && window.act.navigate) {
                console.log("🚀 Launching App...");
                if (window.Router) window.Router.init();
				window.act.navigate('main');
            } else {
                console.error("❌ Core.js 未載入，無法導航");
                const page = document.getElementById('page-main');
                if(page) page.classList.add('active');
            }
        }, 100);
        
        console.log("🚀 [App] System Booted Successfully.");
    },

    // =========================================================================
    // [兼容接口] Shop 重構後可移除
    // =========================================================================
    saveData: function() {
        if (window.Core && window.Core.save) {
            window.Core.save();
        } else {
            console.warn("Core.save not ready, using fallback.");
            if(window.GlobalState) {
                try {
                    const json = JSON.stringify(window.GlobalState);
                    const encoded = btoa(unescape(encodeURIComponent(json)));
                    localStorage.setItem(SAVE_KEY, encoded);
                } catch(e) {
                    // ignore
                }
            }
        }
    },

    resetData: function() {
        if (window.Core && window.Core.resetData) window.Core.resetData();
    }
};

// =============================================================================
// 2. 主控制器 (Main Controller) - [HUD/Navbar 管理員]
// =============================================================================
window.MainController = {
    init: function() {
        if (!window.EventBus) return;

        // 監聽導航：負責全域 UI 的持續渲染
        window.EventBus.on(window.EVENTS.System.NAVIGATE, (pageId) => {
            
            // 1. 強制渲染 HUD 與 Navbar (解決消失問題)
            if (window.view) {
                // 只有在非全螢幕頁面才顯示 Navbar (story/avatar 除外)
                const isFullScreen = ['story', 'avatar'].includes(pageId);
                
                if (view.initHUD) view.initHUD(window.GlobalState);
                if (view.renderNavbar && !isFullScreen) view.renderNavbar();
            }

            // 2. 如果是首頁，呼叫大廳渲染邏輯
            // (其他頁面由各自的 Controller 負責)
            if (pageId === 'main') {
                if (window.view && view.renderMain) view.renderMain();
            }
            
        });

        // 監聽數值變更：刷新 HUD 數據
        window.EventBus.on(window.EVENTS.Stats.UPDATED, () => {
            if (window.view && view.updateHUD) {
                view.updateHUD(window.GlobalState);
            }
        });
        
        console.log("✅ MainController Active (UI Manager)");
    }
};

// =============================================================================
// 3. 系統視窗攔截 (System Interceptors)
// =============================================================================

window.sys = {
    confirm: (msg, onConfirm, onCancel) => {
        if (window.view && view.renderSystemModal) {
            window.TempState.sysConfirmCallback = onConfirm;
            window.TempState.sysCancelCallback = onCancel;
            view.renderSystemModal('confirm', msg);
        } else {
            if(window._nativeConfirm(msg)) { if(onConfirm) onConfirm(); } 
            else { if(onCancel) onCancel(); }
        }
    },
    
    prompt: (msg, defVal, onSubmit) => {
        if (window.view && view.renderSystemModal) {
            window.TempState.sysPromptCallback = onSubmit;
            view.renderSystemModal('prompt', msg, defVal);
        } else {
            const val = window._nativePrompt(msg, defVal);
            if(onSubmit) onSubmit(val);
        }
    }
};

window._nativeAlert = window.alert; 
window.alert = function(msg) {
    if (window.view && view.renderSystemModal) view.renderSystemModal('alert', msg);
    else window._nativeAlert(msg);
};

window._nativeConfirm = window.confirm;
window.confirm = function(msg) {
    console.warn("⚠️ 建議使用 sys.confirm");
    return window._nativeConfirm(msg); 
};

window._nativePrompt = window.prompt;
window.prompt = function(msg, def) {
    console.warn("⚠️ 建議使用 sys.prompt");
    return window._nativePrompt(msg, def);
};

// =============================================================================
// 4. 視窗回調處理
// =============================================================================
window.act = window.act || {};
Object.assign(window.act, {
    handleSysConfirm: (result) => {
        const targetId = 'm-system';
        if (window.act.closeModal) window.act.closeModal(targetId);
        else { const m = document.getElementById(targetId); if(m) m.style.display='none'; }

        if (result === 'prompt_submit') {
            const val = document.getElementById('sys-univ-input')?.value;
            if (window.TempState.sysPromptCallback) {
                window.TempState.sysPromptCallback(val);
                window.TempState.sysPromptCallback = null;
            }
            return;
        }

        if (result === true) {
            if (window.TempState.sysConfirmCallback) {
                window.TempState.sysConfirmCallback();
                window.TempState.sysConfirmCallback = null;
            }
        } else {
            if (window.TempState.sysCancelCallback) {
                window.TempState.sysCancelCallback();
                window.TempState.sysCancelCallback = null;
            }
        }
    }
});

// =============================================================================
// 5. 啟動入口
// =============================================================================
window.onload = function() {
    App.boot();
};