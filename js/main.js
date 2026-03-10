/* js/main.js - V51.5 Final Complete Dispatcher */

window.App = {
    boot: function() {
        window.SQ.Temp = window.SQ.Temp || {};
        Object.assign(window.SQ.Temp, {
            currentView: 'main', taskTab: 'list', statsTab: 'attr',
            shopCategory: '全部', bagCategory: '全部',
            isTagDrawerOpen: false, isBagOpen: false,
            editingTask: null, editingAch: null,
			currentEditingType: null, // 用來記錄現在是在編輯 task, ach 還是 skill
			editingTask: null, 
			editingAch: null,
			editingSkill: null
        });
		window.SQ.Temp.isDebugActive = localStorage.getItem('dev_mode_active') === 'true';
        console.log("🔌 [App] System Booting (Strict CSP Mode)...");

        // 統一的派發器 (Dispatcher)
        const dispatch = (action, id, val, e) => {
            if (!action) return;
            
            let finalVal = val;
            if (typeof val === 'string') {
                if (val === 'true') finalVal = true;
                else if (val === 'false') finalVal = false;
                else if (val.trim() !== '' && !isNaN(val)) finalVal = Number(val);
            }

            if (action === 'emit') {
                const eventName = id || e.target.closest('[data-event]')?.dataset.event;
                if (eventName && window.SQ && window.SQ.EventBus) window.SQ.EventBus.emit(eventName, finalVal !== undefined ? finalVal : id);
            } else if (window.SQ && window.SQ.Actions && typeof window.SQ.Actions[action] === 'function') {
                if (id !== undefined && finalVal !== undefined) window.SQ.Actions[action](id, finalVal);
                else if (id !== undefined) window.SQ.Actions[action](id);
                else window.SQ.Actions[action](finalVal);
            } else if (window.SQ && window.SQ.View && window.SQ.View.Main && typeof window.SQ.View.Main[action] === 'function') {
                if (id !== undefined && finalVal !== undefined) window.SQ.View.Main[action](id, finalVal);
                else if (id !== undefined) window.SQ.View.Main[action](id);
                else window.SQ.View.Main[action](finalVal);
            } else if (window.Debug && typeof window.Debug[action] === 'function') {
                if (id !== undefined && finalVal !== undefined) window.Debug[action](id, finalVal);
                else if (id !== undefined) window.Debug[action](id);
                else window.Debug[action](finalVal);
            }
        };

        // 1. 攔截 Click
        document.body.addEventListener('click', e => {
            const t = e.target.closest('[data-action]');
            if (!t) return;
            if (t.dataset.stop === 'true') e.stopPropagation();
            dispatch(t.dataset.action, t.dataset.id, t.dataset.val, e);
        });

        // 2. 攔截 Input
        document.body.addEventListener('input', e => {
            const t = e.target.closest('[data-input]');
            if (!t) return;
            let val = e.target.value;
            if (t.dataset.isNum === 'true') { val = val.replace(/[^0-9]/g, ''); e.target.value = val; }
            dispatch(t.dataset.input, t.dataset.id, val, e);
        });

        // 3. 攔截 Change
        document.body.addEventListener('change', e => {
            const t = e.target.closest('[data-change]');
            if (!t) return;
            dispatch(t.dataset.change, t.dataset.id, e.target.type === 'checkbox' ? e.target.checked : e.target.value, e);
        });

        // 4. 攔截 Error
        document.body.addEventListener('error', e => {
            if (e.target.tagName?.toLowerCase() === 'img' && e.target.dataset.fallback) {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
            }
        }, true);

        // 👇 新增這段：資料庫錯誤邊界檢查 (try-catch 版)
        try {
            const dbCheck = {
                'FragmentDB': !!window.FragmentDB,
                'SCENE_DB': !!window.SCENE_DB,
                'StoryEngine': !!(window.SQ && window.SQ.Engine && window.SQ.Engine.Story),
                'EventBus': !!(window.SQ && window.SQ.EventBus)
            };

            Object.entries(dbCheck).forEach(([db, exists]) => {
                if (!exists) {
                    console.error(`🚨 [系統嚴重警告] 遺失模組: ${db}，這可能導致相關功能失效！`);
                    if (window.SQ && window.SQ.Actions && window.SQ.Actions.toast) {
                        window.SQ.Actions.toast(`系統警告：缺少 ${db} 模組，請檢查更新`);
                    }
                }
            });
        } catch (e) {
            console.error("🚨 [系統檢查出錯]", e);
        }

        // ── 插件初始化（需在 Core.init 之前，讓 State 就緒後立刻讀設定）──
        if (window.SQ.Audio) window.SQ.Audio.init();
        if (window.SQ.IAP)   window.SQ.IAP.init?.();

        if (window.SQ.Core) window.SQ.Core.init(); else return console.error("❌ Core 未載入");
        
        const E = window.SQ.Engine;
        [E.Task, E.Ach, E.Stats, E.Shop].forEach(en => en?.init());
        
        const C = window.SQ.Controller;
        [C.Main, C.Task, C.Stats, C.Ach, C.Shop, C.Avatar, C.Story, C.Settings, C.Quick].forEach(ctrl => ctrl?.init());
        
        if (window.SQ.Core.checkDailyReset) window.SQ.Core.checkDailyReset();

        setTimeout(() => {
            if (window.SQ.Actions?.navigate) {
                if (window.Router) window.Router.init();
                window.SQ.Actions.navigate('main');
				if (window.SQ.Actions.checkTutorial) window.SQ.Actions.checkTutorial();
            }
        }, 100);
    },

    saveData: function() {
        if (window.Core && window.Core.save) window.Core.save();
        else if(window.SQ.State) {
            try { localStorage.setItem('Levelife_Save_V1', btoa(unescape(encodeURIComponent(JSON.stringify(window.SQ.State))))); } catch(e) {}
        }
    },
    resetData: function() { if (window.Core && window.Core.resetData) window.Core.resetData(); },
	// 在導航到 main 之後啟動教學檢查
	
};
// =========================================================================
// 系統控制器與全域彈窗攔截器 (這是剛才漏掉的部分)
// =========================================================================
window.SQ.Controller.Main = {
    init: function() {
        if (!window.SQ.EventBus) return;
        window.SQ.EventBus.on(window.SQ.Events.System.NAVIGATE, (pageId) => {
            if (window.SQ.View.Main) {
                const isFullScreen = ['story', 'avatar'].includes(pageId);
                if (view.initHUD) view.initHUD(window.SQ.State);
                if (view.renderNavbar && !isFullScreen) view.renderNavbar();
            }
            if (pageId === 'main') { if (window.SQ.View.Main && view.renderMain) view.renderMain(); }
        });
        window.SQ.EventBus.on(window.SQ.Events.Stats.UPDATED, () => {
            if (window.SQ.View.Main && view.updateHUD) view.updateHUD(window.SQ.State);
        });
    }
};

window.sys = {
    confirm: (msg, onConfirm, onCancel) => {
        if (window.SQ.View.Main && view.renderSystemModal) {
            window.SQ.Temp.sysConfirmCallback = onConfirm;
            window.SQ.Temp.sysCancelCallback = onCancel;
            view.renderSystemModal('confirm', msg);
        } else {
            if(window._nativeConfirm(msg)) { if(onConfirm) onConfirm(); } else { if(onCancel) onCancel(); }
        }
    },
    prompt: (msg, defVal, onSubmit) => {
        if (window.SQ.View.Main && view.renderSystemModal) {
            window.SQ.Temp.sysPromptCallback = onSubmit;
            view.renderSystemModal('prompt', msg, defVal);
        } else {
            const val = window._nativePrompt(msg, defVal);
            if(onSubmit) onSubmit(val);
        }
    }
};

window._nativeAlert = window.alert; window.alert = function(msg) { if (window.SQ.View.Main && view.renderSystemModal) view.renderSystemModal('alert', msg); else window._nativeAlert(msg); };
window._nativeConfirm = window.confirm; window.confirm = function(msg) { return window._nativeConfirm(msg); };
window._nativePrompt = window.prompt; window.prompt = function(msg, def) { return window._nativePrompt(msg, def); };

window.SQ.Actions = window.SQ.Actions || {};
Object.assign(window.SQ.Actions, {
    handleSysConfirm: (result) => {
        const targetId = 'm-system';
        if (window.SQ.Actions.closeModal) window.SQ.Actions.closeModal(targetId);
        else { const m = document.getElementById(targetId); if(m) m.style.display='none'; }
        if (result === 'prompt_submit') {
            const val = document.getElementById('sys-univ-input')?.value;
            if (window.SQ.Temp.sysPromptCallback) { window.SQ.Temp.sysPromptCallback(val); window.SQ.Temp.sysPromptCallback = null; }
            return;
        }
        if (result === true || result === 'true') { if (window.SQ.Temp.sysConfirmCallback) { window.SQ.Temp.sysConfirmCallback(); window.SQ.Temp.sysConfirmCallback = null; } } 
        else { if (window.SQ.Temp.sysCancelCallback) { window.SQ.Temp.sysCancelCallback(); window.SQ.Temp.sysCancelCallback = null; } }
    }
});

window.onload = () => App.boot();