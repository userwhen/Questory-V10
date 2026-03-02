/* js/modules/debug.js - V43.0 Pure Architecture Upgrade */
window.Debug = window.Debug || {};
window.act = window.act || {};

if (localStorage.getItem('dev_mode_active') === 'true') {
    window.isDebugActive = true;
} else {
    window.isDebugActive = false;
}

const DebugEngine = {
    clickCount: 0,
    clickTimer: null,

    showMenu: () => {
        const btn = ui.atom.buttonBase;
        const sectionStyle = "margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px dashed var(--border);";
        const labelStyle = "display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; font-weight: bold; text-transform: uppercase;";
        const gridStyle = "display: grid; grid-template-columns: 1fr 1fr; gap: 8px;";

        const body = `
            <div style="padding: 5px;">
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">🩺 系統診斷</label>
                    ${btn({label: '🚀 執行全系統診斷', theme: 'normal', style: 'width: 100%; color:var(--color-info);', action: 'Debug.runFullDiagnosis()'})}
                </div>
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">⏳ 時光機</label>
                    <div style="${gridStyle}">
                        ${btn({label: '📅 模擬昨日', theme: 'ghost', action: "Debug.timeMachine('yesterday')"}) }
                        ${btn({label: '⏪ 回到 7 天前', theme: 'ghost', action: "Debug.timeMachine('week_ago')"}) }
                    </div>
                </div>
                <div style="${sectionStyle}">
                    <label style="${labelStyle}">💎 資源作弊</label>
                    <div style="${gridStyle}">
                        ${btn({label: '💰 +1000', theme: 'ghost', action: "Debug.cheat('gold', 1000)"}) }
                        ${btn({label: '✨ +500', theme: 'ghost', action: "Debug.cheat('exp', 500)"}) }
                        ${btn({label: '⚡ 補滿', theme: 'correct', action: "Debug.cheat('energy', 100)"}) }
                        ${btn({label: '🔥 Lv.36', theme: 'danger', action: "Debug.setMaxEnergy100()"}) }
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
                         ${btn({label: '🔄 重載', theme: 'normal', action: "location.reload()"}) }
                    </div>
                </div>
            </div>
        `;
        const foot = btn({label: '關閉', theme: 'normal', style: 'width: 100%;', action: "ui.modal.close('m-panel')"});
        ui.modal.render('🛠️ DEBUG 控制台', body, foot, 'panel');
    },

    timeMachine: (mode) => {
        const gs = window.GlobalState;
        const d = new Date();
        if (mode === 'yesterday') {
            d.setDate(d.getDate() - 1);
            gs.lastLoginDate = d.toDateString(); 
            act.save();
            if (window.Core && Core.checkDailyReset) Core.checkDailyReset();
            if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
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

    cheat: (type, val) => {
        const gs = window.GlobalState;
        if (type === 'gold') { gs.gold = (gs.gold || 0) + val; act.toast(`💰 金幣 +${val}`); } 
        else if (type === 'exp') { gs.exp = (gs.exp || 0) + val; if(window.StatsEngine) StatsEngine.checkLevelUp(); act.toast(`✨ 經驗 +${val}`); } 
        else if (type === 'gem') { gs.freeGem = (gs.freeGem || 0) + val; act.toast(`💎 鑽石 +${val}`); } 
        else if (type === 'energy') {
            if (!gs.story) gs.story = {};
            const max = (window.StoryEngine && StoryEngine.calculateMaxEnergy) ? StoryEngine.calculateMaxEnergy() : 30;
            gs.story.energy = max; 
            if (window.view && view.renderStoryPage && window.TempState.currentView === 'story') view.renderStoryPage();
            act.toast(`⚡ 精力已設定為 ${val}`);
        }
        act.save();
        if (window.view && view.updateHUD) view.updateHUD(gs);
    },

    openLiveStoryEditor: () => {
        const nodeObj = window.TempState.currentSceneNode;
        if (!nodeObj) return act.toast("⚠️ 找不到當前劇情節點資料");
        const jsonStr = JSON.stringify(nodeObj, null, 4);
        const body = `
            <div style="padding:10px;">
                <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px; background:var(--bg-box); padding:8px; border-radius:var(--radius-sm);">
                    正在編輯節點：<b style="color:var(--text);">${nodeObj.id || '未知'}</b><br>
                    <span style="color:var(--color-danger);">⚠️ 儲存後僅在目前遊戲生效。若要永久保存，請複製代碼貼回 VS Code。</span>
                </div>
                <textarea id="live-story-editor" class="inp" spellcheck="false" style="width:100%; height:350px; font-family:monospace; font-size:0.85rem; resize:vertical; white-space: pre-wrap; word-wrap: break-word; text-align: left;">${jsonStr}</textarea>
            </div>
        `;
        const foot = `
            ${ui.atom.buttonBase({label:'📋 複製代碼', theme:'normal', style:'flex:1;', action:`Debug.copyStoryJson()`})}
            ${ui.atom.buttonBase({label:'💾 即時應用', theme:'correct', style:'flex:1;', action:`Debug.saveLiveStory()`})}
        `;
        ui.modal.render('📝 劇本即時編輯', body, foot, 'system');
    },

    saveLiveStory: () => {
        try {
            const str = document.getElementById('live-story-editor').value;
            const parsed = JSON.parse(str); 
            window.TempState.currentSceneNode = parsed;
            if (window.GameConfig && window.GameConfig.Story && parsed.id) window.GameConfig.Story[parsed.id] = parsed;
            else if (window.StoryData && window.StoryData.sceneMap && parsed.id) window.StoryData.sceneMap[parsed.id] = parsed;
            ui.modal.close('m-system');
            act.toast("✅ 劇本已即時更新！");
            if (window.storyView && window.storyView.render) {
                window.TempState.deferredHtml = "";
                const box = document.getElementById('story-content');
                if(box) box.innerHTML = "";
                if (window.StoryEngine && typeof window.StoryEngine.renderCurrentNode === 'function') window.StoryEngine.renderCurrentNode();
                else if (window.StoryEngine && typeof window.StoryEngine.renderNode === 'function') window.StoryEngine.renderNode(parsed);
                else window.storyView.render();
            }
        } catch (e) {
            act.toast("⚠️ JSON 格式錯誤，請檢查逗號或引號！");
        }
    },

    copyStoryJson: () => {
        const str = document.getElementById('live-story-editor').value;
        navigator.clipboard.writeText(str).then(() => act.toast("📋 已複製！請貼回 VS Code"));
    },

    setMaxEnergy100: () => {
        const gs = window.GlobalState;
        if (!gs) return;
        gs.lv = 36; gs.exp = 0;
        if (!gs.story) gs.story = {};
        gs.story.energy = 100;
        act.save(); act.toast("🔥 已設定為 Lv.36 (精力上限 100)");
        if (window.view && view.updateHUD) view.updateHUD(gs);
    },

    unlockDLC: () => {
        const gs = window.GlobalState;
        if(!gs.unlocks) gs.unlocks = {};
        gs.unlocks.feature_cal = true; gs.unlocks.feature_strict = true;
        act.save(); act.toast("✅ DLC 功能已解鎖");
        if(window.act.renderSettings) act.renderSettings();
    },

    resetDLC: () => {
        const gs = window.GlobalState;
        if(gs.unlocks) { gs.unlocks.feature_cal = false; gs.unlocks.feature_strict = false; }
        act.save(); act.toast("🔒 DLC 功能已上鎖");
        if(window.act.renderSettings) act.renderSettings();
    },

    runFullDiagnosis: async () => { alert("請使用 Console 執行更詳細的 [完整功能測試診斷代碼] 以獲得最佳報告。"); },

    triggerDevMode: () => {
        if (DebugEngine.clickTimer) clearTimeout(DebugEngine.clickTimer);
        DebugEngine.clickCount++;
        DebugEngine.clickTimer = setTimeout(() => { DebugEngine.clickCount = 0; }, 2000);
        if (DebugEngine.clickCount >= 5) { DebugEngine.clickCount = 0; DebugEngine.showMenu(); }
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