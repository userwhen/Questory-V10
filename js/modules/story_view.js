/* js/modules/story_view.js - V75.0 (Full UI Integration) */

window.storyView = {
    render: function() {
        window.TempState.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        if (document.getElementById('story-text-wrapper')) {
            this.updateTopBar();
            // 檢查並更新 Tag 抽屜 (如果狀態改變)
            this.updateDrawer();
            
            // 檢查是否為空，若是則強制重繪 Idle
            const box = document.getElementById('story-content');
            if (!box || box.innerHTML.trim() === "") this.renderIdle();
            return;
        }

        Object.assign(container.style, {
            backgroundColor: '#111', padding: '0', height: '100%', width: '100%',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            position: 'absolute', top: '0', left: '0'
        });

        const topBarContent = `<div id="story-topbar" style="display:flex; align-items:center; justify-content:space-between; width:100%; gap: 5px;"></div>`;
        
        const textBody = `
            <div id="story-text-wrapper" 
                 onclick="if(window.StoryEngine && window.StoryEngine.clickScreen) window.StoryEngine.clickScreen()"
                 style="
                    flex: 1; min-height: 0; padding: 5px 20px 20px 20px; overflow-y: auto; 
                    color: #e0e0e0; font-size: 1.15rem; line-height: 1.6; padding-bottom: 40px;
                    white-space: pre-wrap; cursor: pointer; position: relative; scroll-behavior: smooth;
                 ">
                <div id="story-content"></div>
                <div id="story-cursor" style="
                    display:none; color:#ffd700; font-weight:bold; font-size:1.2rem;
                    position: absolute; bottom: 10px; right: 20px; 
                    animation: bounce 1s infinite;
                "></div>
                <style>@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }</style>
            </div>`;

        const actionsArea = `
            <div id="story-actions" style="
                min-height: 180px; width: 100%;
                flex-shrink: 0; display: flex; flex-direction: column; 
                justify-content: flex-start; gap: 10px; background: #222; border-top: 2px solid #555;
                padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 10;
            "></div>`;

        // 預留抽屜容器
        const tagDrawerHtml = `<div id="tag-drawer-container"></div>`;

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; position:relative;">
                <div style="flex-shrink:0; height:60px; background:#111; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 10px;">${topBarContent}</div>
                ${textBody}
                ${actionsArea}
                ${tagDrawerHtml}
                
                <style>
                    /* 1. 調整 Toast 高度 (僅限 Story 模式) */
                    /* 請根據您實際 UI 庫的 Toast class 名稱調整 (如 .toast-box, #toast-container) */
                    .toast-box, .toast-container, div[id^="toast"] {
                        bottom: 200px !important; /* 數值越大越往上 */
                        z-index: 9999 !important;
                    }

                    /* 2. 調整 Tag 抽屜把手高度 */
                    /* 透過覆寫 top 屬性來移動把手位置 (預設通常是 50%) */
                    #tag-drawer-container .drawer-handle,
                    #tag-drawer-container [class*="handle"] {
                        top: 50% !important; /* 30% 代表偏上方，80% 代表偏下方 */
                    }
                </style>
                </div>
        `;
        
        this.updateTopBar();
        this.updateDrawer(); // 初次渲染抽屜
        this.renderIdle();
    },

    updateTopBar: function() {
        const el = document.getElementById('story-topbar');
        if (!el) return;
        
        const gs = window.GlobalState;
        const ui = window.ui || { 
            progress: { bar: () => '' }, 
            component: { btn: (o) => `<button onclick="${o.action}">${o.label}</button>` },
            input: { select: () => '' }
        };

        let currentMax = 100;
        if (window.StoryEngine && typeof StoryEngine.calculateMaxEnergy === 'function') {
            currentMax = StoryEngine.calculateMaxEnergy();
        }
        const energy = Math.floor(gs.story?.energy || 0);
        const locationName = window.TempState.storyLocation || '---';
        const currentLang = (gs.settings && gs.settings.targetLang) ? gs.settings.targetLang : 'mix';
        
        const langOpts = [{value:'mix',label:'Mix'}, {value:'zh',label:'ZH'}, {value:'jp',label:'JP'}, {value:'en',label:'EN'}];
        const langSelector = `<div style="transform: scale(0.9);">${ui.input.select(langOpts, currentLang, "act.setLang(this.value)", "story-lang-select")}</div>`;

        // [Restored] 精力商店按鈕
        const btnStamina = ui.component.btn({
            label: '+', theme: 'correct', size: 'sm', 
            style: 'padding:0 6px; height:20px; line-height:1; margin-left:4px;', 
            action: 'if(window.shopView) shopView.renderStaminaShop()' 
        });

        el.innerHTML = `
            <div style="display:flex; align-items:center; width: 130px; flex-shrink: 0;">
                <span style="color:#ffd700; font-size:0.9rem; margin-right:4px;">⚡</span>
                <div style="flex:1;">
                    ${ui.progress.bar(energy, currentMax, `${energy}/${currentMax}`, 'height:12px; background:#333; color:#fff; font-size:0.7rem;')}
                </div>
                ${btnStamina}
            </div>
            <div style="flex: 1; display:flex; justify-content:center; align-items:center; overflow:hidden; padding: 0 5px;">
                <div style="text-align:center; color:#aaa; font-size:0.95rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    📍 ${locationName}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:2px; flex-shrink: 0;">
                ${langSelector}
                ${ui.component.btn({label:'✕', theme:'danger', size:'sm', style:'padding:2px 8px;', action:"act.navigate('main')"})}
            </div>`;
    },

    // [New] 抽屜渲染邏輯 (從舊版移植)
    updateDrawer: function() {
        const container = document.getElementById('tag-drawer-container');
        if (!container) return;

        const ui = window.ui;
        const gs = window.GlobalState;
        const isTagOpen = window.TempState.isTagDrawerOpen || false;
        const currentTagFilter = window.TempState.tagFilter || '全部';
        const myTags = gs.story?.tags || [];

        const tagColors = { 'loc': '#795548', 'status': '#1976d2', 'warn': '#d32f2f', 'info': '#7b1fa2' };
        
        let tagsPillsHtml = myTags.length === 0 ? '<div style="color:#666; padding:10px;">尚無標籤</div>' : myTags.map(t => {
            const label = typeof t === 'string' ? t : t.label;
            const type = typeof t === 'string' ? 'info' : t.type;
            if (currentTagFilter !== '全部' && type !== 'loc' && label !== currentTagFilter) return '';
            return ui.component.pill(label, tagColors[type] || '#455a64', '', true);
        }).join('');

        const tagsAreaHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">${tagsPillsHtml}</div>`;

        const tagDrawerContent = `
            <div style="display: flex; flex-direction: column; height: 100%; color: #fff;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: 12px; margin: 10px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 1rem; font-weight: bold; white-space: nowrap; color: #ddd; padding-left:10px;">標籤</div>
                    <div style="flex: 1; min-width: 0; background: rgba(255,255,255,0.08); border-radius: 20px; padding: 4px 10px; overflow-x: auto; white-space: nowrap; display: flex; align-items: center; scrollbar-width: none;">
                        <div style="display: flex; gap: 5px; width: 100%;">
                             ${ui.layout.scrollX(['全部', '場景', '狀態', '知識'], currentTagFilter, 'act.setTagFilter')}
                        </div>
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto; padding:10px;">${tagsAreaHtml}</div>
            </div>`;

        // 使用 ui.layout.drawer 重新生成 HTML
        const drawerHtml = ui.layout.drawer(
            isTagOpen, tagDrawerContent, "act.toggleTagDrawer()",
            { dir: 'right', fixedHandle: true, color: '#1a1a1a', iconOpen: '▶', iconClose: '◀' }
        );
        
        container.innerHTML = drawerHtml;
    },

    clearScreen: function() {
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
        box.appendChild(div);

        this.typeWriter(div, htmlContent, justCleared, () => {
            div.style.opacity = '1';
            if (cursor) {
                cursor.style.display = 'block';
                cursor.innerHTML = isLastChunk ? '➤' : '▼'; 
            }
        });
    },

    typeWriter: function(element, htmlContent, justCleared, onComplete) {
        if (htmlContent.includes('<')) {
            element.innerHTML = htmlContent;
            if (onComplete) onComplete();
            return;
        }

        let i = 0;
        const speed = 25;
        const text = htmlContent;
        element.textContent = ''; 

        const timer = setInterval(() => {
            if (window.TempState.skipRendering) {
                element.textContent = text;
                clearInterval(timer);
                window.TempState.skipRendering = false;
                if (onComplete) onComplete();
                return;
            }

            element.textContent += text.charAt(i);
            i++;
            
            if (!justCleared) {
                const wrap = document.getElementById('story-text-wrapper');
                if(wrap && i % 5 === 0) {
                    if (wrap.scrollHeight - wrap.scrollTop > wrap.clientHeight + 50) {
                        wrap.scrollTop = wrap.scrollHeight;
                    }
                }
            } else {
                const wrap = document.getElementById('story-text-wrapper');
                if (wrap && wrap.scrollTop !== 0) wrap.scrollTop = 0;
            }

            if (i >= text.length) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);
    },

    appendInlineCheckResult: function(attrKey, total, isSuccess) {
        const box = document.getElementById('story-content');
        if (!box) return;
        const div = document.createElement('div'); 
        div.style.marginTop = '10px';
        div.style.padding = '8px';
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        div.style.borderRadius = '4px';
        div.style.borderLeft = isSuccess ? '3px solid #4caf50' : '3px solid #f44336';
        const color = isSuccess ? '#4caf50' : '#f44336';
        const icon = isSuccess ? '✅' : '❌';
        div.innerHTML = `<div style="font-size:0.9rem; color:#aaa;">🎲 檢定 ${attrKey} ... 擲出 ${total}</div><div style="font-size:1.1rem; font-weight:bold; color:${color};">${icon} ${isSuccess ? '成功' : '失敗'}</div>`;
        box.appendChild(div);
        const wrapper = document.getElementById('story-text-wrapper');
        if(wrapper) wrapper.scrollTop = wrapper.scrollHeight;
    },

    showOptions: function(options) {
        const container = document.getElementById('story-actions');
        const cursor = document.getElementById('story-cursor');
        if (!container) return;
        if (cursor) cursor.style.display = 'none';
        const ui = window.ui || { component: { btn: (o) => `<button onclick="${o.action}">${o.label}</button>` } };
        if (!options || options.length === 0) {
            container.innerHTML = '<div style="color:#666; text-align:center;">(沒有可用選項)</div>';
            return;
        }
        container.style.opacity = '1';
        container.style.transition = '';
        container.innerHTML = options.map((btn, idx) => ui.component.btn({
            label: btn.label, theme: btn.theme || 'normal',
            action: `window.StoryEngine.selectOption(${idx})`,
            style: 'width:100%; max-width:400px; margin:0 auto; padding:12px; font-size:1rem; text-align:center; border:1px solid #444; background:#2a2a2a; color:#eee;'
        })).join('');
        const wrap = document.getElementById('story-text-wrapper');
        if(wrap) wrap.scrollTop = wrap.scrollHeight;
    },

    renderIdle: function() {
        this.clearScreen();
        const ui = window.ui || { component: { btn: (o) => `<button onclick="${o.action}">${o.label}</button>` } };
        const box = document.getElementById('story-content');
        const actBox = document.getElementById('story-actions');
        const gs = window.GlobalState;
        
        const hasSavedStory = (window.TempState.currentSceneNode) || (gs.story && (gs.story.currentNode || gs.story.chain));

        if (hasSavedStory) {
            if(box) box.innerHTML = `<div style="text-align:center; padding-top:40px; color:#ffd700;">⚠️ 檢測到未完成的冒險</div>`;
            const btnResume = ui.component.btn({ label: "▶ 繼續冒險", theme: 'correct', action: "window.StoryEngine.resumeStory()", style: 'width:100%; max-width:400px; margin:0 auto 10px; padding:14px; font-size:1.1rem;' });
            const btnAbandon = ui.component.btn({ label: "🗑️ 放棄並重新開始", theme: 'danger', action: "window.StoryEngine.abandonStory()", style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
            if(actBox) actBox.innerHTML = btnResume + btnAbandon;
        } else {
            if(box) box.innerHTML = `<div style="text-align:center; padding-top:40px; color:#888;">準備好開始新的旅程了嗎？</div>`;
            const btnExplore = ui.component.btn({ label: "🔍 開始探索 (5⚡)", theme: 'correct', action: "window.StoryEngine.explore()", style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1.1rem;' });
            if(actBox) actBox.innerHTML = btnExplore;
        }
    }
};