/* js/main.js - V35.Final (Bootloader & System Interceptors) */
const SAVE_KEY = 'SQ_V103';

// =============================================================================
// 1. 應用程式核心 (App Core)
// =============================================================================
window.App = {
    boot: function() {
        this.loadData();
    
        // 核心修正：必須把 MainController 放入啟動名單
        // 注意：請確保其他 Controller (Task, Stats...) 的 js 檔已在 index.html 引入
        const controllers = [
            window.MainController,    
            window.TaskController, 
            window.StatsController, 
            window.ShopController, 
            window.AchController, 
            window.AvatarController, 
            window.StoryController, 
            window.SettingsController,
			window.quickController
        ];
    
        // 啟動所有控制器
        controllers.forEach(ctrl => { 
            if (ctrl && ctrl.init) ctrl.init(); 
        });
    
        // 初始導航
        if (window.act && window.act.navigate) {
            window.act.navigate('main');
        } else {
            // Fallback: 如果 act.navigate 尚未就緒
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const main = document.getElementById('page-main');
            if(main) main.classList.add('active');
        }

        // 渲染 HUD
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

    initGlobalListeners: function() {
        if (!window.EventBus) return;
        
        window.EventBus.on(window.EVENTS.System.NAVIGATE, (pageId) => {
            if (window.Core) Core.switchPage(pageId);
            
            // 處理 Navbar 顯示邏輯 (隱藏 Navbar 的頁面)
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.style.display = ['story', 'avatar'].includes(pageId) ? 'none' : 'flex';
            }
        });
    }
};

// =============================================================================
// 2. 主控制器 (Main Controller)
// =============================================================================
window.MainController = {
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

// =============================================================================
// 3. 全域視窗攔截 (Global Window Interceptors)
// =============================================================================

// A. 覆蓋原生 Alert
window._nativeAlert = window.alert; 
window.alert = function(msg) {
    if (window.view && view.renderSystemModal) {
        view.renderSystemModal('alert', msg);
    } else {
        console.warn("View 尚未就緒，使用原生 Alert");
        window._nativeAlert(msg);
    }
};

// B. 覆蓋原生 Confirm (注意：改為非同步!)
// 如果您的代碼中有 if(confirm('...')) { ... } 這種寫法，會失效！
// 必須改為 sys.confirm('...', () => { ... })
window._nativeConfirm = window.confirm;
window.confirm = function(msg) {
    console.error("🛑 [System] 禁止使用原生 confirm()，因為它會阻塞 UI 線程。請改用 sys.confirm(msg, onYes, onNo)。");
    // 為了防止邏輯錯誤，這裡直接開啟自定義視窗，但回傳 false
    if (window.view && view.renderSystemModal) {
        // 嘗試自動轉接：但因為無法傳入 callback，只能顯示視窗，無法執行後續
        view.renderSystemModal('alert', "系統錯誤：請聯繫開發者使用 sys.confirm");
    }
    return false; 
};

// C. 覆蓋原生 Prompt
window._nativePrompt = window.prompt;
window.prompt = function(msg, def) {
    console.error("🛑 [System] 禁止使用原生 prompt()。請改用 sys.prompt(msg, def, onSubmit)。");
    if (window.view && view.renderSystemModal) {
        view.renderSystemModal('alert', "系統錯誤：請聯繫開發者使用 sys.prompt");
    }
    return null;
};

// D. 定義 System Helpers (正確的呼叫方式)
window.sys = {
    // 使用法: sys.confirm('確定要刪除嗎?', () => { 刪除邏輯... })
    confirm: (msg, onConfirm, onCancel) => {
        window.TempState.sysConfirmCallback = onConfirm;
        window.TempState.sysCancelCallback = onCancel;
        view.renderSystemModal('confirm', msg);
    },
    
    // 使用法: sys.prompt('請輸入名字', '預設值', (val) => { console.log(val) })
    prompt: (msg, defVal, onSubmit) => {
        window.TempState.sysPromptCallback = onSubmit;
        view.renderSystemModal('prompt', msg, defVal);
    }
};

// =============================================================================
// 4. 系統視窗邏輯實現 (System Modal Logic)
// =============================================================================
// 這裡定義了當使用者在 sys.confirm/alert 按下按鈕後，程式該怎麼反應
Object.assign(window.act, {
    handleSysConfirm: (result) => {
        console.log("[Main] 處理系統確認:", result);

        // 1. 關閉視窗
        const targetId = 'm-system';
        if (window.ui && window.ui.modal && window.ui.modal.close) {
            ui.modal.close(targetId);
        } else {
            const modal = document.getElementById(targetId);
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        }

        // 2. 處理 Prompt (輸入框提交)
        if (result === 'prompt_submit') {
            const val = document.getElementById('sys-univ-input')?.value;
            if (window.TempState.sysPromptCallback) {
                window.TempState.sysPromptCallback(val);
                window.TempState.sysPromptCallback = null;
            }
            return;
        }

        // 3. 處理 Confirm (確認: true)
        if (result === true) {
            if (window.TempState.sysConfirmCallback) {
                window.TempState.sysConfirmCallback();
                window.TempState.sysConfirmCallback = null;
            }
        } 
        // 4. 處理 Cancel (取消: false)
        else {
            if (window.TempState.sysCancelCallback) {
                window.TempState.sysCancelCallback();
                window.TempState.sysCancelCallback = null;
            }
        }
    }
});

// =============================================================================
// 5. 啟動入口 (Boot Trigger)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 確保 Global Helpers 已經掛載
    console.log("🚀 [Main] System Logic Loaded.");
    App.boot();
});