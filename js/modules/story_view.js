/* js/modules/story_view.js - V42.0 UI System Upgrade */

window.storyView = {
    render: function() {
        window.TempState.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        if (document.getElementById('story-text-wrapper')) {
            this.updateTopBar();
            this.updateDrawer();
            const box = document.getElementById('story-content');
            if (!box || box.innerHTML.trim() === "") this.renderIdle();
            return;
        }

        Object.assign(container.style, {
            backgroundColor: 'var(--bg-frame)', padding: '0', height: '100%', width: '100%',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            position: 'absolute', top: '0', left: '0'
        });

        const topBarContent = `<div id="story-topbar" style="display:flex; align-items:center; justify-content:space-between; width:100%; gap: 5px;"></div>`;
        
        const textBody = `
            <div id="story-text-wrapper" 
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
                min-height: 200px; width: 100%;
                flex-shrink: 0; display: flex; flex-direction: column; 
                justify-content: flex-start; gap: 10px; background: var(--bg-hud); 
                border-top: 1px solid rgba(255,255,255,0.08); box-shadow: 0 -4px 15px rgba(0,0,0,0.6);
                padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 10;
            "></div>`;

        const tagDrawerHtml = `<div id="tag-drawer-container"></div>`;

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; position:relative;">
                <div style="flex-shrink:0; height:60px; background:var(--bg-nav); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; padding:0 10px; box-shadow:0 2px 10px rgba(0,0,0,0.3); z-index:20;">${topBarContent}</div>
                ${textBody}
                ${actionsArea}
                ${tagDrawerHtml}
                
                <style>
                    .toast-box, .toast-container, div[id^="toast"] {
                        top: auto !important;           
                        bottom: 220px !important;       
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        z-index: 9999 !important;
                    }

                    #tag-drawer-container .drawer-handle,
                    #tag-drawer-container [class*="handle"] {
                        top: auto !important;
                        bottom: 210px !important;
                    }
                </style>
            </div>
        `;
        
        this.updateTopBar();
        this.updateDrawer();
        this.renderIdle();
    },

    updateTopBar: function() {
        const el = document.getElementById('story-topbar');
        if (!el) return;
        
        const gs = window.GlobalState;
        let currentMax = 100;
        if (window.StoryEngine && typeof StoryEngine.calculateMaxEnergy === 'function') {
            currentMax = StoryEngine.calculateMaxEnergy();
        }
        const energy = Math.floor(gs.story?.energy || 0);
        const locationName = window.TempState.storyLocation || '---';
        const currentLang = (gs.settings && gs.settings.targetLang) ? gs.settings.targetLang : 'mix';
        
        const langOpts = [{value:'mix',label:'Mix'}, {value:'zh',label:'ZH'}, {value:'jp',label:'JP'}, {value:'en',label:'EN'}];
        const langSelector = `<div style="transform: scale(0.9);">${ui.input.select(langOpts, currentLang, "act.setLang(this.value)", "story-lang-select")}</div>`;
		
		// [新增] 開發者專用的劇本編輯按鈕
        let devBtnHtml = '';
        if (window.isDebugActive) {
            devBtnHtml = ui.component.btn({
                label: '📝', theme: 'danger', size: 'sm', 
                style: 'padding:2px 8px; margin-right:2px;', 
                action: 'Debug.openLiveStoryEditor()'
            });
        }

        const btnStamina = ui.component.btn({
            label: '+', theme: 'correct', size: 'sm', 
            style: 'padding:0 6px; height:20px; line-height:1; margin-left:4px;', 
            action: 'if(window.shopView) shopView.renderStaminaShop()' 
        });

        el.innerHTML = `
            <div style="display:flex; align-items:center; width: 130px; flex-shrink: 0;">
                <span style="color:var(--color-gold); font-size:0.9rem; margin-right:4px;">⚡</span>
                <div style="flex:1;">
                    ${ui.progress.bar(energy, currentMax, `${energy}/${currentMax}`, 'height:12px; background:rgba(255,255,255,0.1); font-size:0.7rem;')}
                </div>
                ${btnStamina}
            </div>
            <div style="flex: 1; display:flex; justify-content:center; align-items:center; overflow:hidden; padding: 0 5px;">
                <div style="text-align:center; color:var(--text-ghost); font-size:0.95rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    📍 ${locationName}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:2px; flex-shrink: 0;">
                ${devBtnHtml}
                ${langSelector}
                ${ui.component.btn({label:'✕', theme:'danger', size:'sm', style:'padding:2px 8px;', action:"act.navigate('main')"})}
            </div>`;
    },

    updateDrawer: function() {
        const container = document.getElementById('tag-drawer-container');
        if (!container || !window.ui || !window.ui.layout) return;

        const gs = window.GlobalState;
        const isTagOpen = window.TempState.isTagDrawerOpen || false;
        const currentTagFilter = window.TempState.tagFilter || '全部';
        const myTags = gs.story?.tags || [];

        // 對應 CSS 變數的標籤顏色配置
        const tagStyles = { 
            'loc': { color: '--color-gold-dark', bg: '--color-gold-soft' }, 
            'status': { color: '--color-info', bg: '--color-info-soft' }, 
            'warn': { color: '--color-danger', bg: '--color-danger-soft' }, 
            'info': { color: '--color-correct', bg: '--color-correct-soft' } 
        };
        
        let tagsPillsHtml = myTags.length === 0 ? '<div style="color:var(--text-ghost); padding:10px;">尚無標籤</div>' : myTags.map(t => {
            const label = typeof t === 'string' ? t : t.label;
            const type = typeof t === 'string' ? 'info' : t.type;
            if (currentTagFilter !== '全部' && type !== 'loc' && label !== currentTagFilter) return '';
            const style = tagStyles[type] || tagStyles['info'];
            return ui.component.badge(label, style.color, style.bg);
        }).join('');

        const tagsAreaHtml = `<div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">${tagsPillsHtml}</div>`;

        const tagDrawerContent = `
            <div style="display: flex; flex-direction: column; height: 100%; color: var(--text-on-dark);">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: 12px; margin: 10px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 1rem; font-weight: bold; white-space: nowrap; color: var(--color-gold); padding-left:10px;">標籤</div>
                    <div style="flex: 1; min-width: 0; background: rgba(255,255,255,0.08); border-radius: 20px; padding: 4px 10px; overflow-x: auto; white-space: nowrap; display: flex; align-items: center; scrollbar-width: none;">
                        <div style="display: flex; gap: 5px; width: 100%;">
                             ${ui.layout.scrollX(['全部', '場景', '狀態', '知識'], currentTagFilter, 'act.setTagFilter')}
                        </div>
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto; padding:10px;">${tagsAreaHtml}</div>
            </div>`;

        const drawerHtml = ui.layout.drawer(
            isTagOpen, tagDrawerContent, "act.toggleTagDrawer()",
            { dir: 'right', fixedHandle: true, color: 'var(--bg-nav)', iconOpen: '▶', iconClose: '◀' }
        );
        
        container.innerHTML = drawerHtml;
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
        
        const wrap = document.getElementById('story-text-wrapper');
        if (wrap) wrap.scrollTop = 0;
    },

    appendChunk: function(htmlContent, isLastChunk) {
        const box = document.getElementById('story-content');
        const wrap = document.getElementById('story-text-wrapper');
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

        let i = 0;
        const speed = 20;
        const text = htmlContent;
        element.innerHTML = '';

        window.TempState.typingTimer = setInterval(() => {
            if (window.TempState.skipRendering) {
                element.innerHTML = text;
                clearInterval(window.TempState.typingTimer);
                window.TempState.typingTimer = null; 
                window.TempState.skipRendering = false;
                if (onComplete) onComplete();
                return;
            }

            if (text.charAt(i) === '<') {
                const closeIdx = text.indexOf('>', i);
                if (closeIdx !== -1) {
                    element.innerHTML += text.substring(i, closeIdx + 1);
                    i = closeIdx + 1;
                } else {
                    element.innerHTML += text.charAt(i);
                    i++;
                }
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            
            if (!justCleared) {
                const wrap = document.getElementById('story-text-wrapper');
                if(wrap && i % 3 === 0) {
                    if (wrap.scrollHeight - wrap.scrollTop > wrap.clientHeight + 50) {
                        wrap.scrollTop = wrap.scrollHeight;
                    }
                }
            } else {
                const wrap = document.getElementById('story-text-wrapper');
                if (wrap && wrap.scrollTop !== 0) wrap.scrollTop = 0;
            }

            if (i >= text.length) {
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
        container.innerHTML = options.map((btn, idx) => ui.component.btn({
            label: btn.label, theme: 'normal',
            action: `window.StoryEngine.selectOption(${idx})`,
            style: 'width:100%; max-width:400px; margin:0 auto; padding:12px; font-size:1rem; text-align:center;'
        })).join('');
        
        const wrap = document.getElementById('story-text-wrapper');
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
            const btnResume = ui.component.btn({ label: "▶ 繼續冒險", theme: 'correct', action: "window.StoryEngine.resumeStory()", style: 'width:100%; max-width:400px; margin:0 auto 10px; padding:14px; font-size:1.1rem;' });
            const btnAbandon = ui.component.btn({ label: "🗑️ 放棄並重新開始", theme: 'danger', action: "window.StoryEngine.abandonStory()", style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
            if(actBox) actBox.innerHTML = btnResume + btnAbandon;
        } else {
            if(box) box.innerHTML = `<div style="text-align:center; padding-top:40px; color:var(--text-muted);">準備好開始新的旅程了嗎？</div>`;
            const btnExplore = ui.component.btn({ label: "🔍 開始探索 (5⚡)", theme: 'correct', action: "window.StoryEngine.explore()", style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
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
            if (pageId === 'story' && window.storyView) {
                storyView.render();
            }
        });

        EventBus.on(window.EVENTS.Story.RENDER_IDLE, () => {
            if (window.storyView) storyView.renderIdle();
        });

        EventBus.on(window.EVENTS.Story.REFRESH_VIEW, () => {
            if (window.storyView) storyView.render();
        });
    }
};