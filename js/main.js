/* js/main.js - V39.2 System Bootloader (UI Manager & Lobby Fix) */
/* 負責：系統初始化順序、全域 UI 管理、錯誤攔截、相容性接口 */
    // =========================================================================
    // 1. 系統啟動 (Boot Sequence)
    // =========================================================================
	window.App = {
    boot: function() {
        console.log("🔌 [App] System Booting...");

        // ============================================================
        // 1. 【絕對優先】啟動 Core 並讀取存檔
        // ============================================================
        // 只有先讀檔，GlobalState 才有資料，後續的 Controller/Engine 才不會把空資料存進去
        if (window.Core) {
            window.Core.init(); 
        } else {
            console.error("❌ [Fatal] Core 未載入，系統無法啟動");
            return; // Core 沒活，後面都不用跑了
        }

        // ============================================================
        // 2. 啟動基礎引擎 (Engines)
        // ============================================================
        // 建議先啟動引擎，確保邏輯層就緒，再啟動 UI 控制器
        if (window.TaskEngine) window.TaskEngine.init();
        if (window.AchEngine) window.AchEngine.init();
        if (window.StatsEngine) window.StatsEngine.init();
        // ShopEngine 通常由 Controller 帶起，但如果這裡先跑也沒關係，因為 Core 已經 ready 了

        // ============================================================
        // 3. 啟動 UI 控制器 (Controllers)
        // ============================================================
        const controllers = [
            window.MainController,    
            window.TaskController, 
            window.StatsController, 
            window.AchController, 
            window.ShopController, // 它會呼叫 ShopEngine，現在安全了，因為 Core 已經有資料
            window.AvatarController, 
            window.StoryController, 
            window.SettingsController,
            window.quickController
        ];
        
        controllers.forEach(ctrl => { 
            if (ctrl && ctrl.init) {
                try {
                    ctrl.init(); 
                } catch(e) {
                    console.error(`❌ 控制器初始化失敗: ${ctrl}`, e);
                }
            }
        });

        // ============================================================
        // 4. 啟動導航 (Navigation)
        // ============================================================
        setTimeout(() => {
            if (window.act && window.act.navigate) {
                console.log("🚀 Launching App UI...");
                if (window.Router) window.Router.init();
                
                // 讀取上次最後所在的頁面，如果沒有則回首頁
                // (你可以之後再實作記住最後頁面的功能，現在先回 main)
                window.act.navigate('main');
            } else {
                console.error("❌ Router/Nav 未就緒");
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

        // ============================================================
        // [新增] 導航攔截器 (Navigation Guard)
        // 解決 Basic 模式按返回鍵誤入大廳的問題
        // ============================================================
        if (window.act && window.act.navigate) {
            const originalNavigate = window.act.navigate;
            
            // 覆寫導航行為
            window.act.navigate = function(targetPage) {
                const gs = window.GlobalState;
                
                // 邏輯：如果是基礎模式，且目標是 'main' (大廳)，強制導向 'stats'
                if (gs && gs.settings && gs.settings.mode === 'basic') {
                    if (targetPage === 'main') {
                        console.log("🛡️ [Basic Mode] 攔截大廳導航，停留在 Stats");
                        targetPage = 'stats'; // 強制重導向
                    }
                }
                
                // 執行原本的導航
                originalNavigate(targetPage);
            };
        }
        // ============================================================

        // 監聽導航：負責全域 UI 的持續渲染
        window.EventBus.on(window.EVENTS.System.NAVIGATE, (pageId) => {
            
            // 1. 強制渲染 HUD 與 Navbar
            if (window.view) {
                const isFullScreen = ['story', 'avatar'].includes(pageId);
                
                // [優化] 如果是 Basic 模式，可以選擇不渲染 Navbar 的 Home 按鈕
                // 但有了上面的攔截器，就算按了也不會壞，這樣比較保險
                if (view.initHUD) view.initHUD(window.GlobalState);
                if (view.renderNavbar && !isFullScreen) view.renderNavbar();
            }

            // 2. 渲染頁面內容
            if (pageId === 'main') {
                if (window.view && view.renderMain) view.renderMain();
            }
        });

        // 監聽數值變更
        window.EventBus.on(window.EVENTS.Stats.UPDATED, () => {
            if (window.view && view.updateHUD) {
                view.updateHUD(window.GlobalState);
            }
        });
        
        console.log("✅ MainController Active (With Basic Mode Guard)");
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