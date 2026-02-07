/* js/modules/debug.js - V58.0 Full (View & Logic Included) */
window.Debug = window.Debug || {};
window.act = window.act || {};

// 1. 初始化 Dev 狀態
if (localStorage.getItem('dev_mode_active') === 'true') {
    window.isDebugActive = true;
} else {
    window.isDebugActive = false;
}

const DebugEngine = {
    clickCount: 0,
    clickTimer: null,

    // ============================================================
    // [UI] 顯示 DEBUG 面板 (這就是 View)
    // ============================================================
    showMenu: () => {
        const body = `
            <div class="debug-panel">
                <div class="debug-section">
                    <label>🩺 系統診斷</label>
                    <p style="font-size:0.8rem; color:#666; margin-bottom:8px;">執行自動化測試，檢查 DLC、商店、任務邏輯。<b>(測試數據將會保留)</b></p>
                    <button class="u-btn u-btn-primary u-btn-block" onclick="Debug.runFullDiagnosis()">🚀 執行全系統診斷</button>
                </div>

                <div class="debug-section">
                    <label>⏳ 時光機 (跨日模擬)</label>
                    <div class="btn-grid">
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.timeMachine('yesterday')">📅 模擬昨日</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.timeMachine('week_ago')">⏪ 回到 7 天前</button>
                    </div>
                </div>

                <div class="debug-section">
                    <label>💎 資源作弊</label>
                    <div class="btn-grid">
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('gold', 1000)">💰 +1000 金幣</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('exp', 500)">✨ +500 經驗</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('energy', 100)">⚡ 精力補滿</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.setMaxEnergy100()">🔥 設定 Lv.36 (上限100)</button>
                    </div>
                </div>
                
                <div class="debug-section">
                    <label>🔓 權限解鎖</label>
                    <div class="btn-grid">
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.unlockDLC()">🔓 解鎖所有功能</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.resetDLC()">🔒 重置鎖定狀態</button>
                    </div>
                </div>

                <div class="debug-section" style="border:none;">
                    <div class="btn-grid">
                         <button class="u-btn ${window.isDebugActive ? 'u-btn-primary' : 'u-btn-ghost'} u-btn-sm" onclick="Debug.toggleDevMode()">
                            DevMode: ${window.isDebugActive ? 'ON' : 'OFF'}
                        </button>
                        <button class="u-btn u-btn-secondary u-btn-sm" onclick="location.reload()">🔄 重載網頁</button>
                    </div>
                </div>
            </div>
            <style>
                .debug-panel { padding: 5px; }
                .debug-section { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ddd; }
                .debug-section label { display: block; font-size: 0.9rem; color: #333; margin-bottom: 8px; font-weight: bold; }
                .u-btn-block { width: 100%; }
                .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            </style>
        `;
        
        const foot = `<button class="u-btn u-btn-block u-btn-secondary" onclick="act.closeModal('m-overlay')">關閉</button>`;

        if (window.ui && window.ui.modal && window.ui.modal.render) {
            ui.modal.render('DEBUG 控制台', body, foot, 'overlay');
        } else if (window.view && view.renderModal) {
            view.renderModal('DEBUG 控制台', body, foot, 'overlay');
        } else {
            console.error("❌ 無法開啟 Debug 視窗：找不到 ui.modal.render");
            alert("Debug 視窗無法開啟 (UI 模組缺失)");
        }
    },

    // ============================================================
    // Logic: 時光機
    // ============================================================
    timeMachine: (mode) => {
        const gs = window.GlobalState;
        const d = new Date();
        if (mode === 'yesterday') {
            d.setDate(d.getDate() - 1);
            gs.lastLoginDate = d.toDateString(); 
            act.save();
            if (window.Core && Core.checkDailyReset) Core.checkDailyReset();
            else if (window.TaskEngine && TaskEngine.resetDaily) TaskEngine.resetDaily();
            if(window.view && view.renderTasks) view.renderTasks();
            if(window.view && view.renderHUD) view.renderHUD();
            act.toast("已模擬跨日！");
        } else if (mode === 'week_ago') {
            d.setDate(d.getDate() - 7);
            gs.lastLoginDate = d.toDateString();
            act.save();
            act.toast("已回到 7 天前 (請重整)");
            setTimeout(() => location.reload(), 1000);
        }
    },

    // ============================================================
    // Logic: 作弊功能
    // ============================================================
    cheat: (type, val) => {
        const gs = window.GlobalState;
        if (type === 'gold') {
            gs.gold = (gs.gold || 0) + val;
            act.toast(`💰 金幣 +${val}`);
        } else if (type === 'exp') {
            gs.exp = (gs.exp || 0) + val;
            if(window.StatsEngine) StatsEngine.checkLevelUp();
            act.toast(`✨ 經驗 +${val}`);
        } else if (type === 'gem') {
            gs.freeGem = (gs.freeGem || 0) + val;
            act.toast(`💎 鑽石 +${val}`);
        } else if (type === 'energy') {
            if (!gs.story) gs.story = {};
            gs.story.energy = val; 
            if (window.view && view.renderStoryPage && window.TempState.currentView === 'story') view.renderStoryPage();
            act.toast(`⚡ 精力已設定為 ${val}`);
        }
        act.save();
        if (window.view && view.updateHUD) view.updateHUD(gs);
    },

    // [New] 設定等級為 36 (使精力上限達到 100)
    setMaxEnergy100: () => {
        const gs = window.GlobalState;
        if (!gs) return;
        
        gs.lv = 36; // 公式 30 + (36-1)*2 = 100
        gs.exp = 0;
        
        // 順便補滿精力
        if (!gs.story) gs.story = {};
        gs.story.energy = 100;
        
        act.save();
        act.toast("🔥 已設定為 Lv.36 (精力上限 100)");
        
        if (window.view && view.updateHUD) view.updateHUD(gs);
    },

    unlockDLC: () => {
        const gs = window.GlobalState;
        if(!gs.unlocks) gs.unlocks = {};
        gs.unlocks.feature_cal = true;
        gs.unlocks.feature_strict = true;
        act.save();
        act.toast("✅ DLC 功能已解鎖");
        if(window.act.renderSettings) act.renderSettings();
    },

    resetDLC: () => {
        const gs = window.GlobalState;
        if(gs.unlocks) {
            gs.unlocks.feature_cal = false;
            gs.unlocks.feature_strict = false;
        }
        act.save();
        act.toast("🔒 DLC 功能已上鎖");
        if(window.act.renderSettings) act.renderSettings();
    },

    // ============================================================
    // Logic: 全系統診斷
    // ============================================================
    runFullDiagnosis: async () => {
        // ... (這裡將呼叫外部的詳細診斷腳本，或可直接整合下方代碼) ...
        alert("請使用 Console 執行更詳細的 [完整功能測試診斷代碼] 以獲得最佳報告。");
    },

    // 觸發器
    triggerDevMode: () => {
        if (DebugEngine.clickTimer) clearTimeout(DebugEngine.clickTimer);
        DebugEngine.clickCount++;
        DebugEngine.clickTimer = setTimeout(() => { DebugEngine.clickCount = 0; }, 2000);
        if (DebugEngine.clickCount >= 5) {
            DebugEngine.clickCount = 0;
            DebugEngine.showMenu();
        }
    },
    toggleDevMode: () => {
        window.isDebugActive = !window.isDebugActive;
        localStorage.setItem('dev_mode_active', window.isDebugActive);
        act.toast(`DevMode: ${window.isDebugActive ? 'ON' : 'OFF'}`);
        DebugEngine.showMenu(); 
    }
};

window.Debug = DebugEngine;
window.act.triggerDevMode = DebugEngine.triggerDevMode;
window.act.debugDay = () => DebugEngine.showMenu();