/* js/modules/story_view.js - V43.0 Pure Architecture Upgrade */

window.storyView = {
    render: function() {
        window.TempState.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        // 如果結構已經存在，直接呼叫 refresh 並退出 (避免閃爍)
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
        
        const textBody = `
            <div id="story-text-box" 
                 onclick="if(window.StoryEngine && window.StoryEngine.clickScreen) window.StoryEngine.clickScreen()"
                 style="
                    flex: 1; min-height: 0; padding: 15px 20px 20px 20px; overflow-y: auto; 
                    color: var(--text-on-dark); font-size: 1.15rem; line-height: 1.6; padding-bottom: 40px;
                    white-space: pre-wrap; cursor: pointer; position: relative; scroll-behavior: smooth;
                 ">
                <div id="story-content"></div>
                <span id="story-cursor" style="display:none; color:var(--color-gold); font-weight:bold; margin-left:5px; animation:blink 1s infinite;">▼</span>
                <style>@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }</style>
            </div>`;

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

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; position:relative;">
                <div style="flex-shrink:0; height:60px; background:var(--bg-nav); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; padding:0 10px; box-shadow:0 2px 10px rgba(0,0,0,0.3); z-index:20;">${topBarContent}</div>
                
                <div style="flex: 1; min-height: 0; position: relative; display: flex; flex-direction: column;">
                    ${textBody}
                    ${tagDrawerHtml}
                </div>

                ${actionsArea}
            </div>
        `;
        
        this.refresh();
        this.renderIdle();
    },
	
	refresh: function() {
        this.updateTopBar();
        this.updateDrawer();
    },

    updateTopBar: function() {
        const el = document.getElementById('story-top-bar'); 
        if (!el) return;
        
        const gs = window.GlobalState;
        let currentMax = 100;
        if (window.StoryEngine && typeof StoryEngine.calculateMaxEnergy === 'function') {
            currentMax = StoryEngine.calculateMaxEnergy();
        }
        const energy = Math.floor(gs.story?.energy || 0);
        const currentLang = (gs.settings && gs.settings.targetLang) ? gs.settings.targetLang : 'mix';
        
        const langOpts = [{value:'mix',label:'Mix'}, {value:'zh',label:'ZH'}, {value:'jp',label:'JP'}, {value:'en',label:'EN'}];
        
        // [V43] 純淨 Select 與 Button 實作
        const langSelector = `<div style="transform: scale(0.9);">${ui.atom.inputBase({type:'select', val:currentLang, onChange:"EventBus.emit(window.EVENTS.Action.SET_LANG, this.value)", id:"story-lang-select", options:langOpts, style:'padding:4px 8px; font-size:0.85rem;'})}</div>`;
		
        let devBtnHtml = '';
        if (window.isDebugActive) {
            devBtnHtml = ui.atom.buttonBase({
                label: '📝', theme: 'danger', size: 'sm', 
                style: 'padding:2px 8px; margin-right:2px;', 
                action: 'Debug.openLiveStoryEditor()'
            });
        }

        const btnStamina = ui.atom.buttonBase({
            label: '+', theme: 'correct', size: 'sm', 
            style: 'padding:0 6px; height:20px; line-height:1; margin-left:4px;', 
            action: 'if(window.shopView) shopView.renderStaminaShop()' 
        });

        const pct = Math.min(100, Math.max(0, (energy / currentMax) * 100));
        const progressHtml = `<div class="u-progress" style="height:12px; background:rgba(255,255,255,0.1); font-size:0.7rem;"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${energy}/${currentMax}</div></div>`;

        el.innerHTML = `
            <div style="display:flex; align-items:center; width: 130px; flex-shrink: 0;">
                <span style="color:var(--color-gold); font-size:0.9rem; margin-right:4px;">⚡</span>
                <div style="flex:1;">${progressHtml}</div>
                ${btnStamina}
            </div>
            
            <div style="flex: 1;"></div>
            
            <div style="display:flex; align-items:center; gap:2px; flex-shrink: 0;">
                ${devBtnHtml}
                ${langSelector}
                ${ui.atom.buttonBase({label:'✕', theme:'danger', size:'sm', style:'padding:2px 8px;', action:"act.navigate('main')"})}
			</div>`;
    },

    updateDrawer: function() {
        const container = document.getElementById('tag-drawer-container');
        if (!container) return;

        const gs = window.GlobalState;
        const isTagOpen = window.TempState.isTagDrawerOpen || false;
        const myTags = gs.story?.tags || [];
        const myVars = gs.story?.vars || {};

        const roomName = window.MapManager && window.MapManager.currentRoom ? window.MapManager.currentRoom.name : '未知區域';
        const pathStr = window.MapManager && window.MapManager.map ? 
            window.MapManager.map.map(r => r.id === window.MapManager.currentRoom.id ? `📍[${r.name}]` : `🚪[${r.name}]`).join(" ─ ") : 
            "📍 無紀錄";

        let statusHtml = `
            <div style="margin-bottom: 15px;">
                <div style="font-size: 1.1rem; font-weight: bold; color: var(--color-gold); margin-bottom: 8px;">📍 ${roomName}</div>
                <div style="font-size: 0.85rem; color: var(--text-ghost); margin-bottom: 10px; line-height: 1.5;">🗺️ 路徑: ${pathStr}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        `;
        for (let [k, v] of Object.entries(myVars)) {
            let displayKey = k;
            if (k === 'tension' && gs.story.chain && gs.story.chain.tensionName) {
                displayKey = gs.story.chain.tensionName;
            } else {
                displayKey = window.t_tag ? window.t_tag(k) : k;
            }
            statusHtml += `<div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">${displayKey}: <span style="color:var(--color-info);">${v}</span></div>`;
        }
		statusHtml += `</div></div>`;

        const tagStyles = { 
            'loc': { color: '--color-gold-dark', bg: '--color-gold-soft' }, 
            'status': { color: '--color-info', bg: '--color-info-soft' }, 
            'warn': { color: '--color-danger', bg: '--color-danger-soft' }, 
            'info': { color: '--color-correct', bg: '--color-correct-soft' } 
        };
        
        let tagsHtml = '<div style="color:var(--text-ghost); font-size: 0.9rem;">尚無標籤</div>';
        if (myTags.length > 0) {
            tagsHtml = myTags.map(t => {
                const rawLabel = typeof t === 'string' ? t : t.label; 
                const type = typeof t === 'string' ? 'info' : t.type;
                const style = tagStyles[type] || tagStyles['info'];
                const displayLabel = window.t_tag ? window.t_tag(rawLabel) : rawLabel;
                
                // [V43] 使用原生 badgeBase 取代舊版
                return ui.atom.badgeBase({ 
                    text: displayLabel, 
                    style: `color:var(${style.color}); background:var(${style.bg}); border-color:var(${style.color});` 
                });
            }).join('');
        }

        const drawerInnerHtml = `
            <div style="display: flex; flex-direction: column; height: 100%; color:var(--text-on-dark);">
                <div style="flex-shrink: 0; padding-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.2); margin-bottom: 10px;">
                    <div style="font-size: 1.1rem; font-weight: bold; color: var(--color-gold-soft);">📊 當前狀態</div>
                </div>
                ${statusHtml}
                
                <div style="flex-shrink: 0; padding-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.2); margin-top: 10px; margin-bottom: 10px;">
                    <div style="font-size: 1.1rem; font-weight: bold; color: var(--color-gold-soft);">🏷️ 標籤紀錄</div>
                </div>
                <div style="flex: 1; overflow-y: auto; padding-bottom: 20px; display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start;">
                    ${tagsHtml}
                </div>
            </div>`;

        // [V43] 呼叫全新的 ui.composer.drawer
        container.innerHTML = ui.composer.drawer({
            isOpen: isTagOpen, 
            contentHtml: drawerInnerHtml, 
            onToggle: "EventBus.emit(window.EVENTS.Action.TOGGLE_DRAWER)",
            height: '320px', 
            handleIconOpen: '▼', 
            handleIconClose: '▲',
            variant: 'story' 
        });
    },

    clearScreen: function() {
        if (window.TempState.typingTimer) {
            clearInterval(window.TempState.typingTimer);
            window.TempState.typingTimer = null;
        }

        const box = document.getElementById('story-content');
        const actBox = document.getElementById('story-actions');
        const cursor = document.getElementById('story-cursor');
        
        if (box) box.innerHTML = '';
        if (actBox) actBox.innerHTML = '';
        if (cursor) cursor.style.display = 'none';
        
        const wrap = document.getElementById('story-text-box'); 
        if (wrap) wrap.scrollTop = 0;
    },

    appendChunk: function(htmlContent, isLastChunk) {
        const box = document.getElementById('story-content');
        const wrap = document.getElementById('story-text-box'); 
        const cursor = document.getElementById('story-cursor');
        if (!box || !wrap) return;

        let finalHtml = htmlContent;
        if (window.TempState.deferredHtml) {
            finalHtml = window.TempState.deferredHtml + finalHtml;
            window.TempState.deferredHtml = null;
        }

        if (cursor) cursor.style.display = 'none';

        const currentHeight = box.offsetHeight;
        const viewHeight = wrap.clientHeight;
        const isOverflowing = currentHeight > (viewHeight * 0.7);
        const isStart = (box.innerHTML.trim() === "");
        
        let justCleared = false;
        if (!isStart && isOverflowing) {
            box.innerHTML = ''; 
            wrap.scrollTop = 0;
            justCleared = true;
        }

        const div = document.createElement('div');
        div.style.marginBottom = '15px';
        div.style.opacity = '0.9';
        div.style.position = 'relative'; 
        box.appendChild(div);

        this.typeWriter(div, finalHtml, justCleared, () => {
            div.style.opacity = '1';
            if (cursor) {
                cursor.style.display = 'inline-block';
                cursor.innerHTML = isLastChunk ? '➤' : '▼'; 
                div.appendChild(cursor); 
            }
        });
    },

    typeWriter: function(element, htmlContent, justCleared, onComplete) {
        if (window.TempState.typingTimer) clearInterval(window.TempState.typingTimer);

        element.innerHTML = '';
        
        const tokens = [];
        let tempHtml = htmlContent;
        const tagRegex = /(<[^>]+>)/g; 
        
        let lastIdx = 0;
        let match;
        while ((match = tagRegex.exec(tempHtml)) !== null) {
            if (match.index > lastIdx) {
                const textPart = tempHtml.substring(lastIdx, match.index);
                for (let char of textPart) tokens.push({ type: 'text', val: char });
            }
            tokens.push({ type: 'html', val: match[0] });
            lastIdx = tagRegex.lastIndex;
        }
        if (lastIdx < tempHtml.length) {
            const textPart = tempHtml.substring(lastIdx);
            for (let char of textPart) tokens.push({ type: 'text', val: char });
        }

        let i = 0;
        const speed = 20;
        let currentString = ''; 

        window.TempState.typingTimer = setInterval(() => {
            if (window.TempState.skipRendering) {
                element.innerHTML = htmlContent;
                clearInterval(window.TempState.typingTimer);
                window.TempState.typingTimer = null; 
                window.TempState.skipRendering = false;
                if (onComplete) onComplete();
                return;
            }

            while (i < tokens.length && tokens[i].type === 'html') {
                currentString += tokens[i].val;
                i++;
            }

            if (i < tokens.length) {
                currentString += tokens[i].val;
                i++;
            }
            
            element.innerHTML = currentString; 
            
            if (!justCleared) {
                const wrap = document.getElementById('story-text-box');
                if(wrap && i % 3 === 0) {
                    if (wrap.scrollHeight - wrap.scrollTop > wrap.clientHeight + 50) wrap.scrollTop = wrap.scrollHeight;
                }
            }

            if (i >= tokens.length) {
                clearInterval(window.TempState.typingTimer);
                window.TempState.typingTimer = null;
                if (onComplete) onComplete();
            }
        }, speed);
    },

    appendInlineCheckResult: function(attrKey, total, isSuccess) {
        const color = isSuccess ? 'var(--color-correct)' : 'var(--color-danger)';
        const icon = isSuccess ? '✅' : '❌';
        const resultText = isSuccess ? '成功' : '失敗';
        const html = `<span style="color: var(--text-ghost); font-family: monospace, sans-serif; font-size: 0.95rem;">🎲 檢定 ${attrKey} (擲出 ${total})........ </span><span style="font-weight:bold; color:${color};">${resultText} ${icon}</span><br><br>`;
        window.TempState.deferredHtml = (window.TempState.deferredHtml || "") + html;
    },

    showOptions: function(options) {
        const container = document.getElementById('story-actions');
        if (!container) return;

        if (!options || options.length === 0) {
            container.innerHTML = '<div style="color:var(--text-ghost); text-align:center;">(沒有可用選項)</div>';
            return;
        }
        
        container.style.opacity = '1';
        // [V43] 改用原生 atom 產生選項按鈕
        container.innerHTML = options.map((btn, idx) => ui.atom.buttonBase({
            label: btn.label, theme: btn.style || 'normal',
            action: `EventBus.emit(window.EVENTS.Action.MAKE_CHOICE, ${idx})`,
            style: 'width:100%; max-width:400px; margin:0 auto; padding:12px; font-size:1rem; text-align:center;'
        })).join('');
        
        const wrap = document.getElementById('story-text-box');
        if(wrap) wrap.scrollTop = wrap.scrollHeight;
    },

    renderIdle: function() {
        this.clearScreen();
        const box = document.getElementById('story-content');
        const actBox = document.getElementById('story-actions');
        const gs = window.GlobalState;
        
        const hasSavedStory = (window.TempState.currentSceneNode) || (gs.story && (gs.story.currentNode || gs.story.chain));

        if (hasSavedStory) {
            if(box) box.innerHTML = `<div style="text-align:center; padding-top:40px; color:var(--color-gold);">⚠️ 檢測到未完成的冒險</div>`;
            const btnResume = ui.atom.buttonBase({ label: "▶ 繼續冒險", theme: 'correct', action: "EventBus.emit(window.EVENTS.Action.RESUME_STORY)", style: 'width:100%; max-width:400px; margin:0 auto 10px; padding:14px; font-size:1.1rem;' });
            const btnAbandon = ui.atom.buttonBase({ label: "🗑️ 放棄並重新開始", theme: 'danger', action: "EventBus.emit(window.EVENTS.Action.ABANDON_STORY)", style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
            if(actBox) actBox.innerHTML = btnResume + btnAbandon;
        } else {
            if(box) box.innerHTML = `<div style="text-align:center; padding-top:40px; color:var(--text-muted);">準備好開始新的旅程了嗎？</div>`;
            const btnExplore = ui.atom.buttonBase({ label: "🔍 開始探索 (5⚡)", theme: 'correct', action: "EventBus.emit(window.EVENTS.Action.EXPLORE)", style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
            if(actBox) actBox.innerHTML = btnExplore;
        }
    },

    disableOptions: function(clickedIdx) {
        const container = document.getElementById('story-actions');
        if (!container) return;
        const btns = container.querySelectorAll('button');
        btns.forEach((btn) => {
            btn.disabled = true; 
            btn.style.pointerEvents = 'none'; 
        });
    },

    init: function() {
        if (!window.EventBus) return;
        console.log("📺 StoryView Listening...");

        EventBus.on(window.EVENTS.System.NAVIGATE, (pageId) => {
            if (pageId === 'story' && window.storyView) storyView.render();
        });

        EventBus.on(window.EVENTS.Story.RENDER_IDLE, () => {
            if (window.storyView) storyView.renderIdle();
        });

        EventBus.on(window.EVENTS.Story.REFRESH_VIEW, () => {
            if (window.storyView) storyView.refresh();
        });
    },
};