/* js/modules/debug.js - V42.0 UI System Upgrade */
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
        const btn = ui.component.btn;
        
        // 統一的區塊與網格樣式
        const sectionStyle = "margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px dashed var(--border);";
        const labelStyle = "display: block; font-size: 0.9rem; color: var(--text); margin-bottom: 8px; font-weight: bold;";
        const gridStyle = "display: grid; grid-template-columns: 1fr 1fr; gap: 8px;";

        const body = `
            <div style="padding: 5px;">
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">🩺 系統診斷</label>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">執行自動化測試，檢查 DLC、商店、任務邏輯。<b>(測試數據將會保留)</b></p>
                    ${btn({label: '🚀 執行全系統診斷', theme: 'normal', style: 'width: 100%; border-color:var(--color-info); color:var(--color-info);', action: 'Debug.runFullDiagnosis()'})}
                </div>

                <div style="${sectionStyle}">
                    <label style="${labelStyle}">⏳ 時光機 (跨日模擬)</label>
                    <div style="${gridStyle}">
                        ${btn({label: '📅 模擬昨日', theme: 'ghost', action: "Debug.timeMachine('yesterday')"}) }
                        ${btn({label: '⏪ 回到 7 天前', theme: 'ghost', action: "Debug.timeMachine('week_ago')"}) }
                    </div>
                </div>

                <div style="${sectionStyle}">
                    <label style="${labelStyle}">💎 資源作弊</label>
                    <div style="${gridStyle}">
                        ${btn({label: '💰 +1000 金幣', theme: 'ghost', style:'color:var(--color-gold-dark);', action: "Debug.cheat('gold', 1000)"}) }
                        ${btn({label: '✨ +500 經驗', theme: 'ghost', style:'color:var(--color-info);', action: "Debug.cheat('exp', 500)"}) }
                        ${btn({label: '⚡ 精力補滿', theme: 'correct', action: "Debug.cheat('energy', 100)"}) }
                        ${btn({label: '🔥 設為 Lv.36', theme: 'danger', action: "Debug.setMaxEnergy100()"}) }
                    </div>
                </div>
                
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">🔓 權限解鎖</label>
                    <div style="${gridStyle}">
                        ${btn({label: '🔓 解鎖 DLC', theme: 'ghost', action: "Debug.unlockDLC()"}) }
                        ${btn({label: '🔒 重置鎖定', theme: 'ghost', action: "Debug.resetDLC()"}) }
                    </div>
                </div>

                <div style="border:none; padding-top:10px;">
                    <div style="${gridStyle}">
                         ${btn({label: `DevMode: ${window.isDebugActive ? 'ON' : 'OFF'}`, theme: window.isDebugActive ? 'correct' : 'ghost', action: "Debug.toggleDevMode()"}) }
                         ${btn({label: '🔄 重載網頁', theme: 'normal', action: "location.reload()"}) }
                    </div>
                </div>
            </div>
        `;
        
        const foot = btn({label: '關閉', theme: 'normal', style: 'width: 100%;', action: "ui.modal.close('m-panel')"});

        if (window.ui && window.ui.modal && window.ui.modal.render) {
            ui.modal.render('🛠️ DEBUG 控制台', body, foot, 'panel');
        } else {
            console.error("❌ 無法開啟 Debug 視窗：找不到 ui.modal.render");
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
            // 時光機觸發換日後，改成：
			if (window.Core && Core.checkDailyReset) Core.checkDailyReset();
			if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
			// 如果在任務頁，刷新任務
			if (window.TempState.currentView === 'task' && window.taskView) taskView.render();
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
			const max = (window.StoryEngine && StoryEngine.calculateMaxEnergy)
						? StoryEngine.calculateMaxEnergy() : 30;
			gs.story.energy = max; // ✅ 補滿至當前等級上限，而非固定 100
            if (window.view && view.renderStoryPage && window.TempState.currentView === 'story') view.renderStoryPage();
            act.toast(`⚡ 精力已設定為 ${val}`);
        }
        act.save();
        if (window.view && view.updateHUD) view.updateHUD(gs);
    },
	
	// Logic: 劇本即時編輯器 (Live Script Editor)
    openLiveStoryEditor: () => {
        // 1. 取得當前節點資料
        const nodeObj = window.TempState.currentSceneNode;
        if (!nodeObj) return act.toast("⚠️ 找不到當前劇情節點資料");

        // 2. 將物件轉成格式化的 JSON 字串
        const jsonStr = JSON.stringify(nodeObj, null, 4);

        // 3. 建立 UI
        const body = `
            <div style="padding:10px;">
                <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px; background:var(--bg-box); padding:8px; border-radius:var(--radius-sm);">
                    正在編輯節點：<b style="color:var(--text);">${nodeObj.id || '未知'}</b><br>
                    <span style="color:var(--color-danger);">⚠️ 儲存後僅在目前遊戲生效。若要永久保存，請複製代碼貼回 VS Code。</span>
                </div>
                <textarea id="live-story-editor" class="inp" spellcheck="false"
				style="width:100%; height:350px; font-family:monospace; font-size:0.85rem; resize:vertical; white-space: pre-wrap; word-wrap: break-word; text-align: left;"
				>${jsonStr}</textarea>
            </div>
        `;

        const foot = `
            ${ui.component.btn({label:'📋 複製代碼', theme:'normal', style:'flex:1;', action:`Debug.copyStoryJson()`})}
            ${ui.component.btn({label:'💾 即時應用', theme:'correct', style:'flex:1;', action:`Debug.saveLiveStory()`})}
        `;

        ui.modal.render('📝 劇本即時編輯', body, foot, 'system'); // 用 system 層級確保不會被蓋住
    },

    saveLiveStory: () => {
        try {
            const str = document.getElementById('live-story-editor').value;
            const parsed = JSON.parse(str); // 測試 JSON 格式是否正確
            
            // 1. 更新當前記憶體中的節點
            window.TempState.currentSceneNode = parsed;
            
            // 2. 如果你有一個全域劇本庫 (例如 window.GameConfig.Story 或 window.StoryData)，也一併更新
            if (window.GameConfig && window.GameConfig.Story && parsed.id) {
                window.GameConfig.Story[parsed.id] = parsed;
            } else if (window.StoryData && window.StoryData.sceneMap && parsed.id) {
                // ✅ 修正了這裡的括號與路徑
                window.StoryData.sceneMap[parsed.id] = parsed;
            }

            ui.modal.close('m-system');
            act.toast("✅ 劇本已即時更新！");
            
            // 3. 強制重繪當前劇情畫面
            if (window.storyView && window.storyView.render) {
                // 清空文字與打字機計時器
                window.TempState.deferredHtml = "";
                const box = document.getElementById('story-content');
                if(box) box.innerHTML = "";
                
                // 呼叫 StoryEngine 重新渲染該節點 (依照你的引擎名稱而定，若是 renderNode 就呼叫它)
                if (window.StoryEngine && typeof window.StoryEngine.renderCurrentNode === 'function') {
                    window.StoryEngine.renderCurrentNode();
                } else if (window.StoryEngine && typeof window.StoryEngine.renderNode === 'function') {
                    window.StoryEngine.renderNode(parsed);
                } else {
                    window.storyView.render();
                }
            }
        } catch (e) {
            act.toast("⚠️ JSON 格式錯誤，請檢查逗號或引號！");
            console.error(e);
        }
    },

    copyStoryJson: () => {
        const str = document.getElementById('live-story-editor').value;
        navigator.clipboard.writeText(str).then(() => act.toast("📋 已複製！請貼回 VS Code"));
    },

    setMaxEnergy100: () => {
        const gs = window.GlobalState;
        if (!gs) return;
        gs.lv = 36; 
        gs.exp = 0;
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

    runFullDiagnosis: async () => {
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