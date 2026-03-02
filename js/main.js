/* js/main.js - V40.0 System Bootloader (Phase 1 Fix) */
/* 負責：系統初始化順序、全域 UI 管理、錯誤攔截、相容性接口 */

// =========================================================================
// 1. 系統啟動 (Boot Sequence)
// =========================================================================
window.App = {
    boot: function() {
        // [V43 優化] 統一初始化 TempState，放在最前面確保全站狀態安全
        window.TempState = window.TempState || {};
        Object.assign(window.TempState, {
            currentView: 'main',
            taskTab: 'list',
            statsTab: 'attr',
            shopCategory: '全部',
            bagCategory: '全部',
            isTagDrawerOpen: false,
            isBagOpen: false,
            editingTask: null,
            editingAch: null
        });

        console.log("🔌 [App] System Booting...");

        // 1. 啟動 Core
        if (window.Core) {
            window.Core.init(); 
        } else {
            console.error("❌ [Fatal] Core 未載入，系統無法啟動");
            return;
        }

        // 2. 啟動基礎引擎 (Engines)
        if (window.TaskEngine) TaskEngine.init();
        if (window.AchEngine) AchEngine.init();
        if (window.StatsEngine) StatsEngine.init();
        if (window.ShopEngine) ShopEngine.init(); 

        // 3. 啟動 UI 控制器 (Controllers)
        const controllers = [
            window.MainController,    
            window.TaskController, 
            window.StatsController, 
            window.AchController, 
            window.ShopController, 
            window.AvatarController, 
            window.StoryController, 
            window.SettingsController,
            window.QuickController
        ];
        
        controllers.forEach(ctrl => { 
            if (ctrl && ctrl.init) {
                try { ctrl.init(); } catch(e) { console.error(`❌ 控制器初始化失敗:`, e); }
            }
        });

        // 4. 所有人就緒！正式觸發換日檢查
        if (window.Core && window.Core.checkDailyReset) {
            window.Core.checkDailyReset();
        }

        // 5. 啟動導航
        setTimeout(() => {
            if (window.act && window.act.navigate) {
                console.log("🚀 Launching App UI...");
                if (window.Router) window.Router.init();
                window.act.navigate('main');
            }
        }, 100);
    },

    saveData: function() {
        if (window.Core && window.Core.save) {
            window.Core.save();
        } else {
            console.warn("Core.save not ready, using fallback.");
            if(window.GlobalState) {
                try {
                    const json = JSON.stringify(window.GlobalState);
                    const encoded = btoa(unescape(encodeURIComponent(json)));
                    localStorage.setItem('Levelife_Save_V1', encoded);
                } catch(e) {}
            }
        }
    },

    resetData: function() {
        if (window.Core && window.Core.resetData) window.Core.resetData();
    }
};
// [V43 優化] 統一初始化 TempState，確保全站狀態安全
        window.TempState = window.TempState || {};
        Object.assign(window.TempState, {
            currentView: 'main',
            taskTab: 'list',
            statsTab: 'attr',
            shopCategory: '全部',
            bagCategory: '全部',
            isTagDrawerOpen: false,
            isBagOpen: false
        });

// =============================================================================
// 2. 主控制器 (Main Controller) - [HUD/Navbar 管理員]
// =============================================================================
window.MainController = {
    init: function() {
        if (!window.EventBus) return;

        window.EventBus.on(window.EVENTS.System.NAVIGATE, (pageId) => {
            if (window.view) {
                const isFullScreen = ['story', 'avatar'].includes(pageId);
                if (view.initHUD) view.initHUD(window.GlobalState);
                if (view.renderNavbar && !isFullScreen) view.renderNavbar();
            }
            if (pageId === 'main') {
                if (window.view && view.renderMain) view.renderMain();
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

window.act.checkInAch = function(id) {
    if (window.AchEngine && window.AchEngine.claimReward) {
        const res = window.AchEngine.claimReward(id);
        if (res && res.success) {
            if (window.act.toast) window.act.toast("✅ 簽到成功！");
            if (window.view && window.view.updateHUD) window.view.updateHUD();
            if (window.achView && window.achView.renderList) {
                if (window.TempState.taskTab === 'ach' && window.taskView) {
                    window.taskView.render();
                }
            }
        } else {
            if (window.act.toast) window.act.toast(res.msg || "簽到失敗");
        }
    }
};

// =============================================================================
// 5. 啟動入口
// =============================================================================
window.onload = function() {
    App.boot();
};