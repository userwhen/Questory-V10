/* js/modules/debug300.js - V12.0 (DEBUG Console) */
window.Debug = window.Debug || {};
window.act = window.act || {};

// 定義 Dev 狀態
if (localStorage.getItem('dev_mode_active') === 'true') {
    window.isDebugActive = true;
} else {
    window.isDebugActive = false;
}

const DebugEngine = {
    clickCount: 0,
    clickTimer: null,

    // [入口] 顯示 DEBUG 面板
    showMenu: () => {
        const body = `
            <div class="debug-panel">
                <div class="debug-section">
                    <label>⏳ 時光機</label>
                    <div class="btn-grid">
                        <button class="u-btn u-btn-primary u-btn-sm" onclick="Debug.timeMachine('yesterday')">📅 模擬昨日跨日</button>
                        <button class="u-btn u-btn-secondary u-btn-sm" onclick="Debug.timeMachine('week_ago')">⏪ 回到 7 天前</button>
                    </div>
                    <div style="font-size:0.8rem; color:#d32f2f; margin-top:5px;">* 點擊後會強制觸發每日檢查</div>
                </div>

                <div class="debug-section">
                    <label>💎 資源修改</label>
                    <div class="btn-grid">
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('gold', 1000)">💰 +1000 金幣</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('exp', 500)">✨ +500 經驗</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('energy', 100)">⚡ 精力全滿</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('gem', 50)">💎 +50 鑽石</button>
                    </div>
                </div>

                <div class="debug-section" style="border:none;">
                    <label>🔧 開發開關</label>
                    <div class="btn-grid">
                         <button class="u-btn ${window.isDebugActive ? 'u-btn-primary' : 'u-btn-ghost'} u-btn-sm" onclick="Debug.toggleDevMode()">
                            🔓 DevMode: ${window.isDebugActive ? 'ON' : 'OFF'}
                        </button>
                        <button class="u-btn u-btn-secondary u-btn-sm" onclick="location.reload()">🔄 強制重載網頁</button>
                    </div>
                </div>
            </div>
            <style>
                .debug-panel { padding: 10px; }
                .debug-section { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ddd; }
                .debug-section label { display: block; font-size: 0.85rem; color: #888; margin-bottom: 8px; font-weight: bold; }
                .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            </style>
        `;
        
        if (window.view && view.renderModal) {
            view.renderModal('DEBUG', body, `<button class="u-btn u-btn-block u-btn-secondary" onclick="act.closeModal('m-overlay')">關閉</button>`, 'overlay');
        }
    },

    // 1. 時光機 (跨日測試)
    timeMachine: (mode) => {
        const gs = window.GlobalState;
        const d = new Date();
        
        if (mode === 'yesterday') {
            // 1. 修改存檔日期為昨天
            d.setDate(d.getDate() - 1);
            gs.lastLoginDate = d.toDateString(); 
            act.save();
            
            console.log("🕒 [DEBUG] 已將日期回撥至昨天:", gs.lastLoginDate);

            // 2. 強制執行 TaskEngine.init() 觸發換日邏輯
            if (window.TaskEngine && TaskEngine.init) {
                console.log("🔄 [DEBUG] 強制執行每日檢查...");
                TaskEngine.init();
            }

            // 3. 強制刷新介面，讓使用者立刻看到結果
            if(window.view && view.renderTasks) view.renderTasks();
            if(window.view && view.renderHUD) view.renderHUD();

            act.toast("已模擬跨日！每日任務與屬性應已更新");
        } 
        else if (mode === 'week_ago') {
            d.setDate(d.getDate() - 7);
            gs.lastLoginDate = d.toDateString();
            act.save();
            act.toast("已回到 7 天前 (請重整頁面生效)");
            setTimeout(() => location.reload(), 1000);
        }
    },

    // 2. 作弊功能 (加錢/加狀態)
    cheat: (type, val) => {
        const gs = window.GlobalState;
        if (type === 'gold') {
            gs.gold = (gs.gold || 0) + val;
            act.toast(`💰 金幣已增加 ${val}`);
        } else if (type === 'exp') {
            gs.exp = (gs.exp || 0) + val;
            if(window.StatsEngine) StatsEngine.checkLevelUp();
            act.toast(`✨ 經驗已增加 ${val}`);
        } else if (type === 'gem') {
            gs.freeGem = (gs.freeGem || 0) + val;
            act.toast(`💎 鑽石已增加 ${val}`);
        } else if (type === 'energy') {
            if (!gs.story) gs.story = {};
            gs.story.energy = val;
            // [修正] 強制刷新劇情介面
            if (window.view && view.renderStoryPage) view.renderStoryPage();
            act.toast(`⚡ 精力已恢復至 ${val}`);
        }
        act.save();
        // 刷新 HUD
        if (window.view && view.renderHUD) view.renderHUD();
    },

    // 3. 隱藏觸發器
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
        act.toast(`DevMode 已${window.isDebugActive ? '開啟' : '關閉'}`);
        DebugEngine.showMenu(); 
    }
};

window.Debug = DebugEngine;
window.act.triggerDevMode = DebugEngine.triggerDevMode;
window.act.debugDay = () => DebugEngine.showMenu(); // 兼容舊接口