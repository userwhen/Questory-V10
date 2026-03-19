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

        // 4. 攔截 Error (CSP 安全版圖片破圖處理)
        document.body.addEventListener('error', e => {
            if (e.target.tagName?.toLowerCase() === 'img') {
                // 原本的 dataset fallback 邏輯
                if (e.target.dataset.fallback) {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
                }
                
                // 👇 [新增] 自動處理大廳主角與頭像的破圖 (取代 inline onerror)
                if (e.target.classList.contains('hud-avatar-img') || e.target.classList.contains('main-char-img')) {
                    const isMain = e.target.classList.contains('main-char-img');
                    const style = isMain 
                        ? "height: 100%; width: auto; object-fit: contain; filter: drop-shadow(var(--shadow-md)); font-size:80px; display:flex; justify-content:center; align-items:center;"
                        : "width: 100%; height: 100%; object-fit: cover; font-size: 30px; display: flex; justify-content: center; align-items: center;";
                    const className = isMain ? 'main-char-img' : 'hud-avatar-img';
                    e.target.outerHTML = `<span class="${className}" style="${style}">🧍</span>`;
                }
            }
        }, true); // 👈 這裡的 true 很重要，代表捕獲階段攔截

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

       if (window.SQ.Core.checkDailyReset) window.SQ.Core.checkDailyReset();

        // 👇 [替換這整個區塊] 攔截沒有名字或 UID 的新手
        const gs = window.SQ.State;
        if (!gs.userName || !gs.userId) {
            console.log("🌟 偵測到新玩家，啟動註冊流程");
            this.showWelcomeScreen(() => {
                this.startGame();
            });
        } else {
            console.log(`👋 歡迎回來，${gs.userName} (${gs.userId})`);
            this.startGame();
        }
    },

    saveData: function() {
        if (window.Core && window.Core.save) window.Core.save();
        else if(window.SQ.State) {
            try { localStorage.setItem('Levelife_Save_V1', btoa(unescape(encodeURIComponent(JSON.stringify(window.SQ.State))))); } catch(e) {}
        }
    },
    resetData: function() { if (window.Core && window.Core.resetData) window.Core.resetData(); },
	// 👇 [新增 1] 正式進入遊戲的流程 (從原本的 boot 裡面獨立出來)
    startGame: function() {
        setTimeout(() => {
            if (window.SQ.Actions?.navigate) {
                if (window.Router) window.Router.init();
                window.SQ.Actions.navigate('main');
                
                // 進入大廳後，檢查是否需要啟動新手教學
                if (window.SQ.Tutorial && typeof window.SQ.Tutorial.checkTutorial === 'function') {
                    window.SQ.Tutorial.checkTutorial();
                }
            }
        }, 100);
    },

    // 👇 [新增 2] 全螢幕的新手註冊視窗
    showWelcomeScreen: function(onComplete) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed; inset:0; z-index:20000; background:var(--bg-base, #121216); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; animation: tuto-fadein 0.5s ease;`;

        overlay.innerHTML = `
            <div style="background:var(--bg-card, #1e1e24); padding:32px 24px; border-radius:20px; width:100%; max-width:340px; box-shadow:0 20px 40px rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.05); text-align:center;">
                <div style="font-size:3rem; margin-bottom:16px;">✨</div>
                <h2 style="color:var(--text, #fff); margin:0 0 8px 0; font-size:1.4rem;">歡迎來到 Questory</h2>
                <p style="color:var(--text-muted, #aaa); font-size:0.9rem; line-height:1.5; margin-bottom:24px;">
                    這是一場將現實生活轉化為冒險的旅程。<br>請問，我們該如何稱呼您？
                </p>
                
                <input id="sq-welcome-name" type="text" placeholder="請輸入您的暱稱 (1~10字)" maxlength="10" 
                       style="width:100%; padding:14px; border-radius:12px; 
                              border:2px solid var(--border, rgba(255,255,255,0.1)); 
                              background:var(--bg-input, rgba(0,0,0,0.2)); 
                              color:var(--text, #ffffff); 
                              font-size:1.1rem; font-weight:bold; text-align:center; box-sizing:border-box; margin-bottom:20px; outline:none; transition:border 0.3s;">
                
                <button id="sq-welcome-start" style="width:100%; padding:14px; border-radius:12px; border:none; background:var(--color-gold, #f5a623); color:#111; font-weight:800; font-size:1.1rem; cursor:pointer; box-shadow:0 4px 15px rgba(245,166,35,0.4); transition:transform 0.1s;">
                    開始冒險 🚀
                </button>
            </div>
        `;
        document.body.appendChild(overlay);

        const inputEl = document.getElementById('sq-welcome-name');
        const btnEl = document.getElementById('sq-welcome-start');

        // 👇 [修正] 確保 focus 與 blur 都是使用主題變數
        inputEl.addEventListener('focus', () => inputEl.style.borderColor = 'var(--color-gold, #f5a623)');
        inputEl.addEventListener('blur', () => inputEl.style.borderColor = 'var(--border, rgba(255,255,255,0.1))');

        const submitName = () => {
            const name = inputEl.value.trim();
            if (name.length < 1) {
                window.SQ.Actions?.toast('⚠️ 請輸入暱稱喔！');
                overlay.firstElementChild.style.transform = 'translateX(-5px)';
                setTimeout(() => overlay.firstElementChild.style.transform = 'translateX(5px)', 50);
                setTimeout(() => overlay.firstElementChild.style.transform = 'translateX(0)', 100);
                return;
            }

            const newUid = 'usr_' + Math.random().toString(36).substring(2, 10);
            
            // 👇 [修正 2] 雙重保險：確保 userName 跟 avatar 裡的 name 都被正確修改
            window.SQ.State.userName = name;
            window.SQ.State.userId = newUid;
            if (!window.SQ.State.avatar) window.SQ.State.avatar = {};
            window.SQ.State.avatar.name = name; // 同步修改頭像資料的名稱
            
            if (window.App && window.App.saveData) window.App.saveData();

            // 👇 [修正 2] 發送廣播事件：強制告訴全系統「屬性已更新，請重新繪製 HUD！」
            if (window.SQ.EventBus && window.SQ.Events && window.SQ.Events.Stats) {
                window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            }

            btnEl.innerText = '準備進入世界...';
            btnEl.style.opacity = '0.7';
            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    overlay.remove();
                    if (onComplete) onComplete();
                }, 400);
            }, 500);
        };

        btnEl.addEventListener('click', submitName);
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitName(); });
    }
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
	openTimer: function() {
    if (!window.SQ.Timer) {
        window.SQ.Actions.toast('❌ 計時器模組未載入');
        return;
    }
    window.SQ.Timer.open({ defaultMode: 'pomodoro', defaultMinutes: 25 });
    window.SQ.Audio?.feedback('click');
},
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
    },
	// 開啟個人檔案視窗
    openProfile: () => {
        // 👇 [修正] 尋找真實的路徑：window.SQ.View.Main.renderProfile
        if (window.SQ.View.Main && window.SQ.View.Main.renderProfile) {
            window.SQ.View.Main.renderProfile();
        } else {
            console.error("找不到 renderProfile 函數");
        }
    },
    // 點擊更名按鈕的邏輯
    clickRename: () => {
        const gs = window.SQ.State;

        if (window.sys && window.sys.confirm) {
            window.sys.confirm("修改名稱需要消耗 1 張【更名券】。<br>確定要進行修改嗎？", () => {
                
                // 👇 [修正 1] 加入 setTimeout，等待 350 毫秒讓確認視窗關閉
                setTimeout(() => {
                    const ticketIndex = (gs.bag || []).findIndex(item => item.id === 'sys_rename' && item.count > 0);

                    if (ticketIndex === -1) {
                        if (window.SQ.Actions && window.SQ.Actions.toast) {
                            window.SQ.Actions.toast('❌ 您的背包中沒有【更名券】喔！');
                        }
                        return;
                    }

                    if (window.sys && window.sys.prompt) {
                        window.sys.prompt("請輸入新的暱稱 (1~10字)：", gs.userName, (newName) => {
                            if (newName && newName.trim().length > 0) {
                                
                                gs.bag[ticketIndex].count -= 1;
                                if (gs.bag[ticketIndex].count <= 0) {
                                    gs.bag.splice(ticketIndex, 1);
                                }

                                gs.userName = newName.trim();
                                if (gs.avatar) gs.avatar.name = newName.trim();
                                
                                if (window.App && window.App.saveData) window.App.saveData();
                                if (window.SQ.Actions && window.SQ.Actions.toast) {
                                    window.SQ.Actions.toast('✅ 成功修改暱稱！已消耗 1 張更名券。');
                                }
                                
                                if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
                                if (window.SQ.Actions && window.SQ.Actions.closeModal) {
                                    window.SQ.Actions.closeModal('overlay');
                                }
                            }
                        });
                    }
                }, 350); // 👈 延遲時間設為 350ms
            });
        }
    },
});

window.onload = () => App.boot();