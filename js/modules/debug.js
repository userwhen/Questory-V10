/* js/modules/debug.js - V57.1 UI Renderer Fix */
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
    // [UI] 顯示 DEBUG 面板
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
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('energy', 100)">⚡ 精力全滿 (100)</button>
                        <button class="u-btn u-btn-ghost u-btn-sm" onclick="Debug.cheat('gem', 50)">💎 +50 鑽石</button>
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

        // [關鍵修正] 直接呼叫 ui.modal.render (這是 settings_view.js 也在用的正確接口)
        if (window.ui && window.ui.modal && window.ui.modal.render) {
            ui.modal.render('DEBUG 控制台', body, foot, 'overlay');
        } 
        // 備用方案：如果 ui 沒載入，嘗試用 view
        else if (window.view && view.renderModal) {
            view.renderModal('DEBUG 控制台', body, foot, 'overlay');
        } 
        // 最後防線：如果都失敗，至少報錯
        else {
            console.error("❌ 無法開啟 Debug 視窗：找不到 ui.modal.render");
            alert("Debug 視窗無法開啟 (UI 模組缺失)");
        }
    },

    // ============================================================
    // 1. 時光機 (跨日測試)
    // ============================================================
    timeMachine: (mode) => {
        const gs = window.GlobalState;
        const d = new Date();
        
        if (mode === 'yesterday') {
            d.setDate(d.getDate() - 1);
            gs.lastLoginDate = d.toDateString(); 
            act.save();
            console.log("🕒 [DEBUG] 日期已回撥:", gs.lastLoginDate);
            
            if (window.Core && Core.checkDailyReset) {
                console.log("🔄 [DEBUG] 觸發 Core.checkDailyReset...");
                Core.checkDailyReset();
            } else if (window.TaskEngine && TaskEngine.resetDaily) {
                TaskEngine.resetDaily();
            }

            if(window.view && view.renderTasks) view.renderTasks();
            if(window.view && view.renderHUD) view.renderHUD();
            act.toast("已模擬跨日！請檢查每日任務與商店庫存");
        } 
        else if (mode === 'week_ago') {
            d.setDate(d.getDate() - 7);
            gs.lastLoginDate = d.toDateString();
            act.save();
            act.toast("已回到 7 天前 (請重整頁面生效)");
            setTimeout(() => location.reload(), 1000);
        }
    },

    // ============================================================
    // 2. 作弊功能
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
            if (window.view && view.renderStoryPage && window.TempState.currentView === 'story') {
                view.renderStoryPage();
            }
            act.toast(`⚡ 精力已設定為 ${val}`);
        }
        
        act.save();
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
    // 3. 全系統診斷 (保留資料版)
    // ============================================================
    runFullDiagnosis: async () => {
        console.clear();
        console.log("%c🚀 開始執行全系統診斷 (資料保留模式)...", "color:white; background:#E91E63; font-size:16px; padding:5px; border-radius:4px;");
        
        const gs = window.GlobalState;
        if (!gs) return alert("❌ GlobalState 未就緒");

        if(window.act.closeModal) act.closeModal('overlay');

        let PASS = 0, FAIL = 0;
        const assert = (label, cond, msg) => {
            if(cond) {
                console.log(`%c✅ [PASS] ${label}`, "color:lightgreen");
                PASS++;
            } else {
                console.error(`❌ [FAIL] ${label}`, msg);
                FAIL++;
            }
        };

        try {
            console.group("🔓 1. DLC 測試");
            gs.unlocks.feature_cal = true;
            gs.unlocks.feature_strict = true;
            if(window.act.updateSettingsDraft) {
                act.updateSettingsDraft('calMode', true);
                act.updateSettingsDraft('strictMode', true);
                act.saveSettings(); 
            }
            assert("設定寫入", gs.settings.calMode === true && gs.settings.strictMode === true, "設定未正確儲存");
            console.groupEnd();

            console.group("📝 2. 任務測試");
            const testTaskTitle = `[DEBUG] 測試任務 ${Date.now().toString().slice(-4)}`;
            window.TempState.editingTask = { 
                id: null, 
                title: testTaskTitle, 
                cat: "測試", 
                type: 'normal',
                calories: 300, 
                importance: 3, urgency: 3 
            };
            
            window.act.submitTask(); 
            const task = gs.tasks.find(t => t.title === testTaskTitle);
            assert("任務新增", !!task, "無法在 GlobalState 找到新任務");

            if (task) {
                const calBefore = gs.cal.today;
                window.act.toggleTask(task.id);
                
                assert("任務完成", task.done === true, "任務狀態未更新為 done");
                assert("熱量燃燒", gs.cal.today === calBefore - 300, `熱量未正確扣除 (預期 ${calBefore-300}, 實際 ${gs.cal.today})`);
                
                const inHistory = gs.history.some(h => h.id === task.id);
                assert("歷史存檔", inHistory, "任務未寫入 History");
            }
            console.groupEnd();

            console.group("🍎 3. 商店測試");
            gs.gold += 500;
            if(window.ShopEngine) {
                ShopEngine.init(); 
                const buyRes = ShopEngine.buyItem('sys_apple', 1);
                
                if (buyRes.success) {
                    assert("商品購買", true, "");
                    const calBeforeEat = gs.cal.today;
                    window.TempState.useTargetId = 'sys_apple';
                    window.act.useItem(false); 
                    assert("熱量攝取", gs.cal.today === calBeforeEat + 50, `熱量未增加 (預期 ${calBeforeEat+50}, 實際 ${gs.cal.today})`);
                } else {
                    console.warn("⚠️ 無法購買 sys_apple，跳過此測試");
                }
            }
            console.groupEnd();

            if(window.EventBus) {
                EventBus.emit(window.EVENTS.System.NAVIGATE, 'main');
                EventBus.emit(window.EVENTS.Stats.UPDATED);
            }
            act.toast(`診斷完成！PASS:${PASS} FAIL:${FAIL}`);
            alert(`✅ 診斷完成\n\n通過: ${PASS}\n失敗: ${FAIL}\n\n注意：測試產生的任務與物品已保留在您的存檔中。`);

        } catch(e) {
            console.error(e);
            alert("❌ 診斷發生錯誤，請查看 Console");
        }
    },

    // 4. 隱藏觸發器 (連點 5 下)
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

console.log("✅ Debug Module V57.1 (UI Fix) Loaded.");