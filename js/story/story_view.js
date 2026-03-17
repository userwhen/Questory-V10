/* js/modules/story_view.js - V51.4 Pure CSP */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Story = {
    render: function() {
        window.SQ.Temp.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        if (document.getElementById('story-text-box')) {
            this.refresh();
            const box = document.getElementById('story-content');
            if (!box || box.innerHTML.trim() === "") this.renderIdle();
            return;
        }

        Object.assign(container.style, {
            backgroundColor: 'var(--bg-frame)', padding: '0', height: '100%', width: '100%',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            position: 'absolute', top: '0', left: '0'
        });

        const topBarContent = `<div id="story-top-bar" style="display:flex; align-items:center; justify-content:space-between; width:100%; gap: 5px;"></div>`;
        
        // 移除 onclick，改用 data-action
        const textBody = `
            <div id="story-text-box" data-action="clickStoryScreen"
                 style="
                    flex: 1; min-height: 0; 
                    padding: 30px 20px 40px 20px; 
                    overflow-y: auto; 
                    color: var(--text-on-dark); font-size: 1.15rem; line-height: 1.6; 
                    cursor: pointer; position: relative; scroll-behavior: smooth;
                 "><div id="story-content"></div><span id="story-cursor" style="display:none; color:var(--color-gold); font-weight:bold; margin-left:5px; animation:blink 1s infinite;">▼</span></div>
            <style>@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }</style>
        `;
		
        const actionsArea = `
            <div id="story-actions" style="
                width: 100%; flex-shrink: 0; background: var(--bg-hud); 
                border-top: 1px solid rgba(255,255,255,0.08); box-shadow: 0 -4px 15px rgba(0,0,0,0.6);
                padding: 15px; box-sizing: border-box; z-index: 10;
                display: flex; flex-direction: column; justify-content: flex-start; gap: 10px;
                height: 200px; 
                overflow-y: auto; 
            "></div>`;

        const tagDrawerHtml = `<div id="tag-drawer-container"></div>`;


        container.innerHTML = `<div style="display:flex; flex-direction:column; height:100%; width:100%; position:relative;"><div style="flex-shrink:0; height:60px; background:var(--bg-nav); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; padding:0 10px; box-shadow:0 2px 10px rgba(0,0,0,0.3); z-index:20;">${topBarContent}</div><div style="flex: 1; min-height: 0; position: relative; display: flex; flex-direction: column;">${textBody}${tagDrawerHtml}</div>${actionsArea}</div>`;
        
        this.refresh();
        this.renderIdle();
    },
	
	refresh: function() { this.updateTopBar(); this.updateDrawer(); },

    updateTopBar: function() {
        const el = document.getElementById('story-top-bar'); 
        if (!el) return;
        
        const gs = window.SQ.State;
        const currentMax = (window.StoryEngine && typeof window.SQ.Engine.Story.calculateMaxEnergy === 'function') ? window.SQ.Engine.Story.calculateMaxEnergy() : 100;
        const energy = Math.floor(gs.story?.energy || 0);
        const currentLang = (gs.settings && gs.settings.targetLang) ? gs.settings.targetLang : 'mix';
        const langOpts = [{value:'mix',label:'Mix'}, {value:'zh',label:'ZH'}, {value:'jp',label:'JP'}, {value:'kr',label:'KR'}, {value:'en',label:'EN'}];
		// ✅ 判斷玩家是否在商店購買了解鎖項目 (id: 'learning')
        const hasLearning = gs.unlocks && (Array.isArray(gs.unlocks) ? gs.unlocks.includes('learning') : gs.unlocks['learning']);
        
        // ✅ 如果有買，才顯示選單；沒買就留空
        const langSelector = hasLearning 
            ? `<div style="transform: scale(0.9);">${ui.atom.inputBase({type:'select', val:currentLang, action:"setStoryLang", id:"story-lang-select", options:langOpts, style:'padding:4px 8px; font-size:0.85rem;'})}</div>` 
            : '';
		
        const devBtnHtml = window.SQ.Temp.isDebugActive ? ui.atom.buttonBase({ label: '📝', theme: 'danger', size: 'sm', style: 'padding:2px 8px; margin-right:2px;', action: 'openLiveStoryEditor' }) : '';
        const btnStamina = ui.atom.buttonBase({ label: '+', theme: 'correct', size: 'sm', style: 'padding:0 6px; height:20px; line-height:1; margin-left:4px;', action: 'renderStaminaShop' });
        const pct = Math.min(100, Math.max(0, (energy / currentMax) * 100));
        const progressHtml = `<div class="u-progress" style="height:12px; background:rgba(255,255,255,0.1); font-size:0.7rem;"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${energy}/${currentMax}</div></div>`;

        el.innerHTML = `
            <div style="display:flex; align-items:center; width: 130px; flex-shrink: 0;"><span style="color:var(--color-gold); font-size:0.9rem; margin-right:4px;">⚡</span><div style="flex:1;">${progressHtml}</div>${btnStamina}</div>
            <div style="flex: 1;"></div>
            <div style="display:flex; align-items:center; gap:2px; flex-shrink: 0;">${devBtnHtml}${langSelector}${ui.atom.buttonBase({label:'✕', theme:'danger', size:'sm', style:'padding:2px 8px;', action:"navigate", actionVal:"main"})}</div>`;
    },

    updateDrawer: function() {
        const container = document.getElementById('tag-drawer-container');
        if (!container) return;
 
        const gs      = window.SQ.State;
        const myTags  = gs.story?.tags || [];
        const tagDict = (window.FragmentDB && window.FragmentDB.tagDict) ? window.FragmentDB.tagDict : {};
 
        const rawLang    = gs.settings?.targetLang || 'zh';
        const isLearning = gs.settings?.learningMode;
        const langToUse  = (isLearning && rawLang !== 'mix' && rawLang !== 'zh') ? rawLang : 'zh';
 
        const hiddenPrefixes = ['struct_', 'route_', 'env_', 'learning', 'vibe_', 'trait_', 'meet_', 'goal_', 'train_', 'world_', 'motive_', 'curse_', 'bonus_'];
        const coreThemes     = ['mystery', 'horror', 'romance', 'adventure', 'raising'];
 
        const playerTags = myTags.filter(t => {
            const label = typeof t === 'string' ? t : t.label;
            if (!label) return false;
            if (coreThemes.includes(label)) return false;
            if (hiddenPrefixes.some(p => label.startsWith(p))) return false;
            return true;
        });
 
        // ── 位置資訊 ──────────────────────────────────────────
        const map         = window.SQ.Engine.Map;
        const currentRoom = map && map.currentRoom;
        const roomName    = currentRoom ? currentRoom.name : '未知區域';
        const pathStr     = (map && map.map && map.map.length > 0)
            ? map.map.map(r => r.id === currentRoom?.id
                ? `📍[${r.name}]`
                : `🚪[${r.name}]`).join(' → ')
            : '📍 無紀錄';
 
        // ── 標籤 HTML ─────────────────────────────────────────
        const tagStyles = {
            'loc'   : { color: '--color-gold-dark',  bg: '--color-gold-soft'    },
            'status': { color: '--color-info',        bg: '--color-info-soft'    },
            'warn'  : { color: '--color-danger',      bg: '--color-danger-soft'  },
            'info'  : { color: '--color-correct',     bg: '--color-correct-soft' }
        };
 
        const tagsHtml = playerTags.length > 0
            ? playerTags.map(t => {
                const rawLabel     = typeof t === 'string' ? t : t.label;
                const config       = tagDict[rawLabel] || { zh: rawLabel, type: 'info' };
                const displayLabel = config[langToUse] || config['zh'] || rawLabel;
                const style        = tagStyles[config.type || 'info'] || tagStyles.info;
                return ui.atom.badgeBase({
                    text: displayLabel,
                    style: `color:var(${style.color});background:var(${style.bg});border-color:var(${style.color});`
                });
            }).join('')
            : '<div style="color:var(--text-ghost);font-size:0.9rem;">尚無特殊狀態或道具</div>';
 
        // ── 整個內容：一個 div，overflow-y:auto，從頭捲到尾 ──
        const drawerInnerHtml = `
            <div style="
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                color: var(--text-on-dark);
                padding: 10px 12px 24px;
                box-sizing: border-box;
            ">
                <div style="font-size:0.75rem;letter-spacing:0.08em;color:var(--color-gold-soft);margin-bottom:4px;">📍 當前位置</div>
                <div style="font-size:1rem;font-weight:bold;color:var(--color-gold);margin-bottom:2px;">${roomName}</div>
                <div style="font-size:0.8rem;color:var(--text-ghost);line-height:1.5;margin-bottom:14px;">${pathStr}</div>
 
                <div style="height:1px;background:rgba(255,255,255,0.1);margin-bottom:12px;"></div>
 
                <div style="font-size:0.75rem;letter-spacing:0.08em;color:var(--color-gold-soft);margin-bottom:8px;">🏷️ 已獲標籤</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;">
                    ${tagsHtml}
                </div>
            </div>`;
 
        container.innerHTML = ui.composer.drawer({
            isOpen:          window.SQ.Temp.isTagDrawerOpen || false,
            contentHtml:     drawerInnerHtml,
            toggleAction:    "toggleStoryDrawer",
            height:          '40%',
            handleIconOpen:  '▼',
            handleIconClose: '▲',
            variant:         'story'
        });
    },

    clearScreen: function() {
    // 💡 保留第一行這句就好！這就是完美的清理邏輯
    if (window.SQ.Temp && window.SQ.Temp.typingTimer) { 
        clearInterval(window.SQ.Temp.typingTimer); 
        window.SQ.Temp.typingTimer = null; 
    }
    
    const box = document.getElementById('story-content'); 
    const actBox = document.getElementById('story-actions'); 
    const cursor = document.getElementById('story-cursor'); 
    const wrap = document.getElementById('story-text-box'); 
    
    if (box) box.innerHTML = ''; 
    if (actBox) actBox.innerHTML = ''; 
    if (cursor) cursor.style.display = 'none'; 
    if (wrap) wrap.scrollTop = 0;
},

    appendChunk: function(htmlContent, isLastChunk) {
        const box = document.getElementById('story-content'); const wrap = document.getElementById('story-text-box'); const cursor = document.getElementById('story-cursor'); if (!box || !wrap) return;
        let finalHtml = htmlContent; if (window.SQ.Temp.deferredHtml) { finalHtml = window.SQ.Temp.deferredHtml + finalHtml; window.SQ.Temp.deferredHtml = null; }
        if (cursor) cursor.style.display = 'none';
        let justCleared = false; if (box.innerHTML.trim() !== "" && box.offsetHeight > (wrap.clientHeight * 0.7)) { box.innerHTML = ''; wrap.scrollTop = 0; justCleared = true; }
        const div = document.createElement('div'); div.style.marginBottom = '15px'; div.style.opacity = '0.9'; div.style.position = 'relative'; box.appendChild(div);
        this.typeWriter(div, finalHtml, justCleared, () => { div.style.opacity = '1'; if (cursor) { cursor.style.display = 'inline-block'; cursor.innerHTML = isLastChunk ? '➤' : '▼'; div.appendChild(cursor); } });
    },

    typeWriter: function(element, htmlContent, justCleared, onComplete) {
        if (window.SQ.Temp.typingTimer) clearInterval(window.SQ.Temp.typingTimer);
        element.innerHTML = ''; const tokens = []; let tempHtml = htmlContent; const tagRegex = /(<[^>]+>)/g; let lastIdx = 0; let match;
        while ((match = tagRegex.exec(tempHtml)) !== null) { if (match.index > lastIdx) { const textPart = tempHtml.substring(lastIdx, match.index); for (let char of textPart) tokens.push({ type: 'text', val: char }); } tokens.push({ type: 'html', val: match[0] }); lastIdx = tagRegex.lastIndex; }
        if (lastIdx < tempHtml.length) { const textPart = tempHtml.substring(lastIdx); for (let char of textPart) tokens.push({ type: 'text', val: char }); }
        let i = 0; let currentString = ''; 
        window.SQ.Temp.typingTimer = setInterval(() => {
            if (window.SQ.Temp.skipRendering) { element.innerHTML = htmlContent; clearInterval(window.SQ.Temp.typingTimer); window.SQ.Temp.typingTimer = null; window.SQ.Temp.skipRendering = false; if (onComplete) onComplete(); return; }
            while (i < tokens.length && tokens[i].type === 'html') { currentString += tokens[i].val; i++; }
            if (i < tokens.length) { currentString += tokens[i].val; i++; }
            element.innerHTML = currentString; 
            if (!justCleared) { const wrap = document.getElementById('story-text-box'); if(wrap && i % 3 === 0) { if (wrap.scrollHeight - wrap.scrollTop > wrap.clientHeight + 50) wrap.scrollTop = wrap.scrollHeight; } }
            if (i >= tokens.length) { clearInterval(window.SQ.Temp.typingTimer); window.SQ.Temp.typingTimer = null; if (onComplete) onComplete(); }
        }, 20);
    },

    appendInlineCheckResult: function(attrKey, total, isSuccess) {
        const resultHtml =
            `<div style="margin-top:6px; font-family:monospace, sans-serif; font-size:0.9rem; line-height:1.8;">` +
            `<span style="color:var(--text-ghost);">🎲 檢定 ${attrKey}（擲出 ${total}）......</span><br>` +
            `<span style="font-weight:bold; color:${isSuccess ? 'var(--color-correct)' : 'var(--color-danger)'};">` +
            `${isSuccess ? '✅ 成功' : '❌ 失敗'}</span>` +
            `</div><br>`;
        window.SQ.Temp.deferredHtml = (window.SQ.Temp.deferredHtml || "") + resultHtml;
    },

    showOptions: function(options) {
    const container = document.getElementById('story-actions');
    if (!container) return;
    if (!options || options.length === 0) {
        return container.innerHTML = '<div style="color:var(--text-ghost); text-align:center;">(沒有可用選項)</div>';
    }

    container.style.opacity = '1';
    const gs = window.SQ.State;
    const langToUse = (gs.settings && gs.settings.targetLang && gs.settings.targetLang !== 'mix')
        ? gs.settings.targetLang : 'zh';
    const myVars = (gs && gs.story && gs.story.vars) ? gs.story.vars : {};

    // ── 清除舊狀態列 ──────────────────────────────────────────
    const oldBar = document.getElementById('story-status-bar');
    if (oldBar) oldBar.remove();

    // ── 建立狀態列，插在對話框容器和 story-actions 之間 ───────
    const varKeys = Object.keys(myVars);
    if (varKeys.length > 0) {
        const i18n  = window.I18N_DICT || {};
        const chain = gs.story && gs.story.chain;

        const items = varKeys.map(k => {
            let name = i18n[k] && i18n[k][langToUse] ? i18n[k][langToUse]
                     : i18n[k] && i18n[k]['zh']      ? i18n[k]['zh']
                     : k;
            if (k === 'tension' && chain && chain.tensionName) name = chain.tensionName;
            if (k.startsWith('affection_')) name = langToUse==='jp' ? '好感度' : langToUse==='kr' ? '호감도' : '好感度';
            if (k.startsWith('clue_'))      name = langToUse==='jp' ? '手がかり' : langToUse==='kr' ? '단서' : '線索';

            return `<span style="display:inline-flex;align-items:center;` +
                   `background:rgba(0,0,0,0.55);padding:3px 10px;border-radius:10px;` +
                   `font-size:0.82rem;border:1px solid rgba(255,255,255,0.12);white-space:nowrap;">` +
                   `<span style="color:var(--text-muted);margin-right:5px;">${name}</span>` +
                   `<span style="font-weight:bold;color:var(--color-gold);">${myVars[k]}</span></span>`;
        }).join('');

        const bar = document.createElement('div');
        bar.id = 'story-status-bar';
		bar.style.cssText = [
        'display:flex',
            'flex-wrap:nowrap',           // 【修改】設為 nowrap 強制單行顯示
            'overflow-x:auto',            // 【新增】內容過多時允許水平滑動
            'scrollbar-width:none',       // 【新增】隱藏捲軸 (Firefox)
            'justify-content:flex-start', // 【修改】改為靠左對齊，確保滑動時開頭不會被截斷
            'align-items:center',
            'gap:6px',
            'padding:8px 10px',           // 【修改】移除原本右側的 52px，改為左右對稱的 10px
            'background:rgba(0,0,0,0.25)',
            'border-top:1px solid rgba(255,255,255,0.07)',
            'flex-shrink:0',
            'min-height:38px'
        ].join(';');
        
        // 【修改】植入一段隱藏 Webkit (Chrome/Safari) 捲軸的 CSS，讓畫面保持乾淨
        bar.innerHTML = `<style>#story-status-bar::-webkit-scrollbar { display: none; }</style>` + items;

        // 🌟 只做這一行，不移動任何其他元素
        container.parentNode.insertBefore(bar, container);
    }

    // ── 按鈕區 ────────────────────────────────────────────────
    const buttonsHtml = options.map((btn, idx) => {
        let displayLabel = btn.label;
        if (typeof btn.label === 'object' && btn.label !== null) {
            displayLabel = btn.label[langToUse] || btn.label['zh'] || Object.values(btn.label)[0] || "未命名選項";
        }
        if (typeof displayLabel === 'string') {
            displayLabel = displayLabel.replace(/\{([^}]+)\}/g, (m, key) =>
                myVars[key] !== undefined ? myVars[key] : m);
        }
        return ui.atom.buttonBase({
            label: displayLabel,
            theme: btn.style || 'normal',
            action: 'makeStoryChoice',
            actionVal: idx,
            style: 'width:100%;max-width:400px;margin:0 auto;padding:12px;font-size:1rem;text-align:center;'
        });
    }).join('');

    container.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;width:100%;align-items:center;">${buttonsHtml}</div>`;

    const wrap = document.getElementById('story-text-box');
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
},

    renderIdle: function() {
    this.clearScreen();
    const box = document.getElementById('story-content');
    const actBox = document.getElementById('story-actions');
    const gs = window.SQ.State;

    // 🌟 清除狀態列
    const oldBar = document.getElementById('story-status-bar');
    if (oldBar) oldBar.remove();

    if ((window.SQ.Temp.currentSceneNode) || (gs.story && (gs.story.currentNode || gs.story.chain))) {
        if(box) box.innerHTML = `<div style="text-align:center; padding-top:40px; color:var(--color-gold);">⚠️ 檢測到未完成的冒險</div>`;
        if(actBox) actBox.innerHTML = 
            ui.atom.buttonBase({ label: "▶ 繼續冒險", theme: 'correct', action: 'resumeStory', style: 'width:100%; max-width:400px; margin:0 auto 10px; padding:14px; font-size:1.1rem;' }) + 
            ui.atom.buttonBase({ label: "🗑️ 放棄並重新開始", theme: 'danger', action: 'abandonStory', style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
    } else {
        if(box) box.innerHTML = `<div style="text-align:center; padding-top:40px; color:var(--text-muted);">準備好開始新的旅程了嗎？</div>`;
        if(actBox) actBox.innerHTML = 
            ui.atom.buttonBase({ label: "🔍 開始探索 (5⚡)", theme: 'correct', action: 'exploreStory', style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
    }
},

    disableOptions: function() { const container = document.getElementById('story-actions'); if (!container) return; container.querySelectorAll('button').forEach((btn) => { btn.disabled = true; btn.style.pointerEvents = 'none'; }); },

    init: function() {
        if (!window.SQ.EventBus) return;
        window.SQ.EventBus.on(window.SQ.Events.System.NAVIGATE, (pageId) => { if (pageId === 'story' && window.SQ.View.Story) window.SQ.View.Story.render(); });
        window.SQ.EventBus.on(window.SQ.Events.Story.RENDER_IDLE, () => { if (window.SQ.View.Story) window.SQ.View.Story.renderIdle(); });
        window.SQ.EventBus.on(window.SQ.Events.Story.REFRESH_VIEW, () => { if (window.SQ.View.Story) window.SQ.View.Story.refresh(); });
    }
};