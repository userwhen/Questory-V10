/* js/modules/debug.js */
	const IS_PRODUCTION = false; // 🔒 上市前 true，測試時改 false

	if (IS_PRODUCTION) {
		window.Debug = { triggerDevMode: () => {} };
		window.SQ.Actions.triggerDevMode = () => {};
		// 直接停在這裡，後面的 DebugEngine 完全不執行
	} else {
		// ↓ 以下是原本 debug.js 的全部內容，整個包進 else 裡 ↓
		window.SQ.Actions = window.SQ.Actions || {};
		if (localStorage.getItem('dev_mode_active') === 'true') { 
			window.SQ.Temp.isDebugActive = true; 
		} else { 
			window.SQ.Temp.isDebugActive = false; 
		}
    
    const DebugEngine = {
    clickCount: 0, clickTimer: null,

    showMenu: () => {
        const btn = ui.atom.buttonBase;
        const sectionStyle = "margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px dashed var(--border);";
        const labelStyle = "display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; font-weight: bold; text-transform: uppercase;";
        const gridStyle = "display: grid; grid-template-columns: 1fr 1fr; gap: 8px;";

        const body = `
            <div style="padding: 5px;">
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">🩺 系統診斷</label>
                    ${btn({label: '🚀 執行全系統診斷', theme: 'normal', style: 'width: 100%; color:var(--color-info);', action: 'runFullDiagnosis'})}
                </div>
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">⏳ 時光機</label>
                    <div style="${gridStyle}">
                        ${btn({label: '📅 模擬昨日', theme: 'ghost', action: "timeMachine", actionId: "yesterday"})}
                        ${btn({label: '⏪ 7 天前', theme: 'ghost', action: "timeMachine", actionId: "week_ago"})}
                    </div>
                </div>
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">💎 資源作弊</label>
                    <div style="${gridStyle}">
                        ${btn({label: '💰 +1000', theme: 'ghost', action: "cheat", actionId: "gold", actionVal: 1000})}
                        ${btn({label: '✨ +500', theme: 'ghost', action: "cheat", actionId: "exp", actionVal: 500})}
                        ${btn({label: '⚡ 補滿', theme: 'correct', action: "cheat", actionId: "energy", actionVal: 100})}
                        ${btn({label: '🔥 Lv.36', theme: 'danger', action: "setMaxEnergy100"})}
                    </div>
                </div>
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">🔓 功能解鎖</label>
                    <div style="${gridStyle}">
                        ${btn({label: '🔓 解鎖 DLC', theme: 'ghost', action: "unlockDLC"})}
                        ${btn({label: '🔒 重置 DLC', theme: 'ghost', action: "resetDLC"})}
                        ${btn({label: '👑 啟用 Pro', theme: 'ghost', action: "debugEnablePro"})}
                        ${btn({label: '🚫 關閉 Pro', theme: 'ghost', action: "debugDisablePro"})}
                    </div>
                </div>
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">🔌 插件功能模擬</label>
                    <div style="${gridStyle}">
                        ${btn({label: '📅 行事曆', theme: 'ghost', action: "debugTogglePlugin", actionId: "calendar"})}
                        ${btn({label: '📷 掃描器', theme: 'ghost', action: "debugTogglePlugin", actionId: "scanner"})}
                        ${btn({label: '🔔 通知', theme: 'ghost', action: "debugTogglePlugin", actionId: "notification"})}
                        ${btn({label: '💎 IAP', theme: 'ghost', action: "debugTogglePlugin", actionId: "iap"})}
                    </div>
                </div>
                <div style="border:none; padding-top:10px;">
                    <div style="${gridStyle}">
                         ${btn({label: `Dev: ${window.SQ.Temp.isDebugActive ? 'ON' : 'OFF'}`, theme: window.SQ.Temp.isDebugActive ? 'correct' : 'ghost', action: "toggleDevMode"})}
                         ${btn({label: '🔄 重載', theme: 'normal', action: "reloadApp"})}
                    </div>
                </div>
            </div>
        `;
        ui.modal.render('🛠️ DEBUG 控制台', body, btn({label: '關閉', theme: 'normal', style: 'width: 100%;', action: "closeModal", actionId: "m-panel"}), 'panel');
    },

    reloadApp: () => location.reload(),
    closeModal: (id) => ui.modal.close(id),

    timeMachine: (mode) => {
        const gs = window.SQ.State;
        const d = new Date();
        if (mode === 'yesterday') {
            d.setDate(d.getDate() - 1);
            gs.lastLoginDate = d.toDateString(); 
            if(window.App) window.App.saveData();
            
            // 👇 完全只用 window.SQ.Core
            if (window.SQ.Core) {
				window.SQ.Core._dailyResetDone = false;
				window.SQ.Core.checkDailyReset();
			}
            
            // 👇 拔除 view，改用 EventBus
            if (window.SQ.EventBus && window.SQ.Events && window.SQ.Events.Stats) {
                window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            }
            if (window.SQ.Temp.currentView === 'task' && window.SQ.View && window.SQ.View.Task) window.SQ.View.Task.render();
            window.SQ.Actions.toast("已模擬跨日！");
        } else if (mode === 'week_ago') {
            d.setDate(d.getDate() - 7);
            gs.lastLoginDate = d.toDateString();
            if(window.App) window.App.saveData();
            window.SQ.Actions.toast("已回到 7 天前 (請重整)");
            setTimeout(() => location.reload(), 1000);
        }
    },

    cheat: (type, val) => {
        const gs = window.SQ.State;
        if (type === 'gold') { gs.gold = (gs.gold || 0) + val; window.SQ.Actions.toast(`💰 金幣 +${val}`); } 
        else if (type === 'exp') { gs.exp = (gs.exp || 0) + val; if(window.SQ.Engine && window.SQ.Engine.Stats) window.SQ.Engine.Stats.checkLevelUp(); window.SQ.Actions.toast(`✨ 經驗 +${val}`); } 
        else if (type === 'energy') {
            if (!gs.story) gs.story = {};
            const max = (window.SQ.Engine && window.SQ.Engine.Story && window.SQ.Engine.Story.calculateMaxEnergy) ? window.SQ.Engine.Story.calculateMaxEnergy() : 30;
            gs.story.energy = max; 
            if (window.SQ.View && window.SQ.View.Story && window.SQ.Temp.currentView === 'story') window.SQ.View.Story.render();
            window.SQ.Actions.toast(`⚡ 精力已設定為 ${max}`);
        }
        if(window.App) window.App.saveData();
        // 👇 拔除 view，改用 EventBus
        if (window.SQ.EventBus && window.SQ.Events && window.SQ.Events.Stats) {
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
        }
    },

    openLiveStoryEditor: () => {
        const nodeObj = window.SQ.Temp.currentSceneNode;
        if (!nodeObj) returnwindow.SQ.Actions.toast("⚠️ 找不到當前劇情節點資料");
        const jsonStr = JSON.stringify(nodeObj, null, 4);
        const body = `<div style="padding:10px;"><div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px; background:var(--bg-box); padding:8px; border-radius:var(--radius-sm);">正在編輯節點：<b style="color:var(--text);">${nodeObj.id || '未知'}</b></div><textarea id="live-story-editor" class="inp" spellcheck="false" style="width:100%; height:350px; font-family:monospace; font-size:0.85rem; resize:vertical; text-align: left;">${jsonStr}</textarea></div>`;
        const foot = `${ui.atom.buttonBase({label:'📋 複製', theme:'normal', action:'copyStoryJson'})}${ui.atom.buttonBase({label:'💾 應用', theme:'correct', action:'saveLiveStory'})}`;
        ui.modal.render('📝 劇本即時編輯', body, foot, 'system');
    },

    saveLiveStory: () => {
        try {
            const str = document.getElementById('live-story-editor').value;
            const parsed = JSON.parse(str); 
            window.SQ.Temp.currentSceneNode = parsed;
            if (window.GameConfig?.Story && parsed.id) window.GameConfig.Story[parsed.id] = parsed;
            ui.modal.close('m-system');
           window.SQ.Actions.toast("✅ 劇本已即時更新！");
            if (window.SQ.View.Story) window.SQ.View.Story.refresh();
        } catch (e) {window.SQ.Actions.toast("⚠️ JSON 格式錯誤"); }
    },

    copyStoryJson: () => {
        const str = document.getElementById('live-story-editor').value;
        navigator.clipboard.writeText(str).then(() =>window.SQ.Actions.toast("📋 已複製！"));
    },

    setMaxEnergy100: () => {
        const gs = window.SQ.State; if (!gs) return;
        gs.lv = 36; gs.exp = 0; if (!gs.story) gs.story = {}; gs.story.energy = 100;
        if(window.App) window.App.saveData();window.SQ.Actions.toast("🔥 已設定為 Lv.36");
        // 👇 拔除 view，改用 EventBus
        if (window.SQ.EventBus && window.SQ.Events && window.SQ.Events.Stats) {
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
        }
    },

    unlockDLC: () => {
        const gs = window.SQ.State; if(!gs.unlocks) gs.unlocks = {};
        gs.unlocks.feature_cal = true; gs.unlocks.feature_strict = true;
        if(window.App) window.App.saveData();window.SQ.Actions.toast("✅ DLC 功能已解鎖");
        // 👇 [修復] 補上 window.SQ.Actions
        if(window.SQ.Actions.renderSettings) window.SQ.Actions.renderSettings();
    },

    resetDLC: () => {
        const gs = window.SQ.State; if(gs.unlocks) { gs.unlocks.feature_cal = false; gs.unlocks.feature_strict = false; }
        if(window.App) window.App.saveData(); window.SQ.Actions.toast("🔒 DLC 功能已上鎖");
        // 👇 [修復] 補上 window.SQ.Actions
        if(window.SQ.Actions.renderSettings) window.SQ.Actions.renderSettings();
    },

    debugEnablePro: () => {
        const gs = window.SQ.State;
        if (!gs.subscription) gs.subscription = {};
        gs.subscription.mock    = true;
        gs.subscription.active  = true;
        gs.subscription.expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
        if(window.App) App.saveData();
        window.SQ.Actions.toast('👑 Pro 已啟用（測試）');
        DebugEngine.showMenu();
    },

    debugDisablePro: () => {
        const gs = window.SQ.State;
        if (gs.subscription) {
            gs.subscription.mock   = false;
            gs.subscription.active = false;
            gs.subscription.expiresAt = null;
        }
        if(window.App) App.saveData();
        window.SQ.Actions.toast('🚫 Pro 已關閉');
        DebugEngine.showMenu();
    },

    debugTogglePlugin: (pluginId) => {
        const pluginMap = {
            calendar:     () => window.SQ.Calendar,
            scanner:      () => window.SQ.Scanner,
            notification: () => window.SQ.Notification,
            iap:          () => window.SQ.IAP,
        };
        const plugin = pluginMap[pluginId]?.();
        if (!plugin) {
            window.SQ.Actions.toast(`❌ 插件 ${pluginId} 未載入`);
            return;
        }
        // Toggle mock mode if available
        if ('MOCK_MODE' in plugin) {
            plugin.MOCK_MODE = !plugin.MOCK_MODE;
            window.SQ.Actions.toast(`🔌 ${pluginId} mock: ${plugin.MOCK_MODE ? 'ON' : 'OFF'}`);
        } else if ('IAP_MODE' in plugin) {
            plugin.IAP_MODE = plugin.IAP_MODE === 'mock' ? 'live' : 'mock';
            window.SQ.Actions.toast(`🔌 IAP mode: ${plugin.IAP_MODE}`);
        } else {
            window.SQ.Actions.toast(`ℹ️ ${pluginId} 已載入，無 mock 開關`);
        }
    },

    runFullDiagnosis: () => {
        const lines = [];
        const ok  = (label, val) => lines.push(`✅ ${label}: ${val}`);
        const err = (label, val) => lines.push(`❌ ${label}: ${val}`);
        const wrn = (label, val) => lines.push(`⚠️ ${label}: ${val}`);

        // ── Audio ────────────────────────────────────────
        const aud = window.SQ.Audio;
        if (!aud)                     err('Audio', '模組未載入');
        else if (!aud._ctx)           wrn('Audio', '已載入，等待首次點擊初始化 AudioContext');
        else if (!aud._enabled)       wrn('Audio', '已停用（設定關閉）');
        else                          ok('Audio', `就緒 | 音量 ${Math.round((aud._volume||0)*100)}%`);

        // ── Subscription ─────────────────────────────────
        const sub = window.SQ.Sub;
        if (!sub)                     err('Subscription', '模組未載入');
        else if (sub.isPro())         ok('Subscription', `Pro 有效至 ${sub.expiryLabel()||'無限制'} | mock:${sub.SUB_MODE}`);
        else if (sub.isInTrial())     ok('Subscription', '試用中');
        else                          wrn('Subscription', '未訂閱（免費版）');

        // ── IAP ──────────────────────────────────────────
        const iap = window.SQ.IAP;
        if (!iap)                     err('IAP', '模組未載入');
        else                          ok('IAP', `mode:${iap.IAP_MODE} | products:${Object.keys(iap.PRODUCTS||{}).length}`);

        // ── Notification ─────────────────────────────────
        const s = window.SQ.State?.settings || {};
        if (!s.notificationEnabled)   wrn('Notification', '未開啟推播');
        else                          ok('Notification', `開啟 | 每日 ${s.notifyDailyHour??9}:${String(s.notifyDailyMinute??0).padStart(2,'0')}`);

        // ── Calendar ─────────────────────────────────────
        if (!window.SQ.Calendar)      wrn('Calendar', '模組未載入');
        else                          ok('Calendar', '已載入');

        // ── Scanner ──────────────────────────────────────
        if (!window.SQ.Scanner)       wrn('Scanner', '模組未載入');
        else                          ok('Scanner', '已載入');

        // ── State ────────────────────────────────────────
        const gs = window.SQ.State;
        if (!gs)                      err('State', '未初始化');
        else {
            ok('Tasks', `共 ${(gs.tasks||[]).length} 個 | 未完成 ${(gs.tasks||[]).filter(t=>!t.done).length}`);
            ok('Player', `Lv.${gs.lv||1} | Gold:${gs.gold||0} | Gem:${(gs.freeGem||0)+(gs.paidGem||0)}`);
        }

        const body = lines.map(l => {
            const color = l.startsWith('✅') ? 'var(--color-correct)' 
                        : l.startsWith('❌') ? 'var(--color-danger)'
                        : 'var(--color-gold-dark)';
            return `<div style="padding:6px 0; border-bottom:1px solid var(--border);
                                font-size:0.82rem; color:${color};">${l}</div>`;
        }).join('');

        ui.modal.render('🩺 系統診斷報告',
            `<div style="padding:5px 10px;">${body}</div>`,
            ui.atom.buttonBase({label:'關閉', theme:'normal', style:'width:100%;',
                action:'closeModal', actionId:'m-panel'}),
            'panel');
    },

    triggerDevMode: () => {
        if (DebugEngine.clickTimer) clearTimeout(DebugEngine.clickTimer);
        DebugEngine.clickCount++;
        DebugEngine.clickTimer = setTimeout(() => { DebugEngine.clickCount = 0; }, 2000);
        if (DebugEngine.clickCount >= 5) { DebugEngine.clickCount = 0; DebugEngine.showMenu(); }
    },
    
    toggleDevMode: () => {
        window.SQ.Temp.isDebugActive = !window.SQ.Temp.isDebugActive;
        localStorage.setItem('dev_mode_active', window.SQ.Temp.isDebugActive);
       window.SQ.Actions.toast(`DevMode: ${window.SQ.Temp.isDebugActive ? 'ON' : 'OFF'}`);
        DebugEngine.showMenu(); 
    }
};

window.Debug = DebugEngine;
    window.SQ.Actions.triggerDevMode     = DebugEngine.triggerDevMode;
    window.SQ.Actions.debugEnablePro     = DebugEngine.debugEnablePro;
    window.SQ.Actions.debugDisablePro    = DebugEngine.debugDisablePro;
    window.SQ.Actions.debugTogglePlugin  = DebugEngine.debugTogglePlugin;
    window.SQ.Actions.unlockDLC          = DebugEngine.unlockDLC;
    window.SQ.Actions.resetDLC           = DebugEngine.resetDLC;
    window.SQ.Actions.runFullDiagnosis   = DebugEngine.runFullDiagnosis;
    window.SQ.Actions.timeMachine        = DebugEngine.timeMachine;
    window.SQ.Actions.cheat              = DebugEngine.cheat;
    window.SQ.Actions.setMaxEnergy100    = DebugEngine.setMaxEnergy100;
    window.SQ.Actions.toggleDevMode      = DebugEngine.toggleDevMode;
    window.SQ.Actions.reloadApp          = DebugEngine.reloadApp;
    window.SQ.Actions.selectShopIcon     = (ico) => {
        // fallback if shop_controller not loaded yet
        if (window.SQ.Controller?.Shop?.selectShopIcon) {
            window.SQ.Controller.Shop.selectShopIcon(ico);
        }
    };}