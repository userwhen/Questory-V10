/* js/modules/story_view.js - V84.0 (UI Fixes: Persistence & Layout) */

window.storyView = {
    render: function() {
        window.TempState.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        // 如果介面已經存在，只更新局部
        if (document.getElementById('story-text-wrapper')) {
            this.updateTopBar();
            this.updateDrawer();
            const box = document.getElementById('story-content');
            if (!box || box.innerHTML.trim() === "") this.renderIdle();
            return;
        }

        // 初始化容器樣式
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
                    flex: 1; min-height: 0; padding: 15px 20px 20px 20px; overflow-y: auto; 
                    color: #e0e0e0; font-size: 1.15rem; line-height: 1.6; padding-bottom: 40px;
                    white-space: pre-wrap; cursor: pointer; position: relative; scroll-behavior: smooth;
                 ">
                <div id="story-content"></div>
                <span id="story-cursor" style="display:none; color:#ffd700; font-weight:bold; margin-left:5px; animation:blink 1s infinite;">▼</span>
                <style>@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }</style>
            </div>`;

        const actionsArea = `
            <div id="story-actions" style="
                min-height: 200px; width: 100%;
                flex-shrink: 0; display: flex; flex-direction: column; 
                justify-content: flex-start; gap: 10px; background: #222; 
                border-top: 2px solid #555; box-shadow: 0 -4px 10px rgba(0,0,0,0.5);
                padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 10;
            "></div>`;

        const tagDrawerHtml = `<div id="tag-drawer-container"></div>`;

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; position:relative;">
                <div style="flex-shrink:0; height:60px; background:#111; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 10px;">${topBarContent}</div>
                ${textBody}
                ${actionsArea}
                ${tagDrawerHtml}
                
                <style>
                    [UI Modify] 調整 Toast 位置 */
                    .toast-box, .toast-container, div[id^="toast"] {
                        top: auto !important;           /* 取消頂部定位 */
                        bottom: 220px !important;       /* 設為 210px (略高於 180px 的按鈕區) */
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        z-index: 9999 !important;
                    }

                    /* Tag 抽屜把手位置 */
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
        // 防呆：確保 ui 物件存在
        const ui = window.ui || { 
            progress: { bar: () => '' }, 
            component: { btn: (o) => `<button>${o.label}</button>` },
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

    updateDrawer: function() {
        const container = document.getElementById('tag-drawer-container');
        // 防呆：如果 ui.layout 不存在，就不渲染抽屜，避免報錯
        if (!container || !window.ui || !window.ui.layout) return;

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

        const drawerHtml = ui.layout.drawer(
            isTagOpen, tagDrawerContent, "act.toggleTagDrawer()",
            { dir: 'right', fixedHandle: true, color: '#1a1a1a', iconOpen: '▶', iconClose: '◀' }
        );
        
        container.innerHTML = drawerHtml;
    },

    clearScreen: function() {
        // [Logic Fix] 清除舊的打字機計時器，防止計時器洩漏
        if (window.TempState.typingTimer) {
            clearInterval(window.TempState.typingTimer);
            window.TempState.typingTimer = null;
        }

        const box = document.getElementById('story-content');
        const actBox = document.getElementById('story-actions');
        // 不要隱藏 cursor，因為我們會移動它
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

        // [Logic Fix] 檢查是否有「延遲顯示」的檢定結果 (Persistence Logic)
        let finalHtml = htmlContent;
        if (window.TempState.deferredHtml) {
            finalHtml = window.TempState.deferredHtml + finalHtml;
            window.TempState.deferredHtml = null; // 清空緩存
        }

        if (cursor) cursor.style.display = 'none';

        // 自動清屏邏輯 (如果太長)
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
        // 確保顏色能正確顯示
        div.style.position = 'relative'; 
        box.appendChild(div);

        this.typeWriter(div, finalHtml, justCleared, () => {
            div.style.opacity = '1';
            
            // [UI Fix] 游標邏輯：直接插入到最後一個文字區塊的內部，實現 Inline 跟隨
            if (cursor) {
                cursor.style.display = 'inline-block';
                cursor.innerHTML = isLastChunk ? '➤' : '▼'; 
                div.appendChild(cursor); // 將游標移到當前打字的 div 裡
            }
        });
    },

    // [Logic Fix] 升級版打字機 (支援 HTML 標籤跳過)
    typeWriter: function(element, htmlContent, justCleared, onComplete) {
        // 清除舊計時器
        if (window.TempState.typingTimer) clearInterval(window.TempState.typingTimer);

        let i = 0;
        const speed = 20; // 打字速度
        const text = htmlContent;
        element.innerHTML = ''; // 必須清空

        window.TempState.typingTimer = setInterval(() => {
            // 如果被標記為跳過 (點擊畫面)
            if (window.TempState.skipRendering) {
                element.innerHTML = text; // 直接顯示全文
                clearInterval(window.TempState.typingTimer);
                window.TempState.skipRendering = false;
                if (onComplete) onComplete();
                return;
            }

            // [HTML Tag Detection] 
            // 如果遇到 <，直接找到對應的 >，並一次性印出整個標籤
            if (text.charAt(i) === '<') {
                const closeIdx = text.indexOf('>', i);
                if (closeIdx !== -1) {
                    element.innerHTML += text.substring(i, closeIdx + 1);
                    i = closeIdx + 1;
                } else {
                    // 防呆：如果只有 < 沒有 >，就當作普通字符
                    element.innerHTML += text.charAt(i);
                    i++;
                }
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            
            // 自動捲動
            if (!justCleared) {
                const wrap = document.getElementById('story-text-wrapper');
                if(wrap && i % 3 === 0) { // 頻率稍微調高一點
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

    // [Logic Fix] 檢定結果：改為存入「暫存區」而非直接顯示
    appendInlineCheckResult: function(attrKey, total, isSuccess) {
        const color = isSuccess ? '#4caf50' : '#ff5252'; // 成功綠，失敗紅
        const icon = isSuccess ? '✅' : '❌';
        const resultText = isSuccess ? '成功' : '失敗';
        
        // 使用 Flexbox + Span 確保絕對單行
        // width: 100% 確保撐滿容器
        // border-bottom: 虛線分隔，取代原本的色塊背景
        const html = `
            <div style="
                margin: 8px 0; padding: 5px 0; 
                border-bottom: 1px dashed #444; 
                display: flex; align-items: center; justify-content: space-between;
                width: 100%;
                color: #aaa; font-family: monospace, sans-serif; font-size: 0.95rem;
            ">
                <span>🎲 檢定 ${attrKey} ... (擲出 ${total})</span>
                
                <span style="font-weight:bold; color:${color}; margin-left: 10px; white-space: nowrap;">
                    ${resultText} ${icon}
                </span>
            </div>
        `;

        // 1. 如果當前有內容，嘗試直接插入
        const box = document.getElementById('story-content');
        if (box && box.innerHTML.trim() !== "") {
            const div = document.createElement('div');
            div.innerHTML = html;
            box.appendChild(div);
            // 捲動到底部
            const wrap = document.getElementById('story-text-wrapper');
            if(wrap) wrap.scrollTop = wrap.scrollHeight;
        }

        // 2. 同時存入暫存，供換頁時使用 (這能解決換頁後檢定結果消失的問題)
        window.TempState.deferredHtml = (window.TempState.deferredHtml || "") + html;
    },

    showOptions: function(options) {
        const container = document.getElementById('story-actions');
        // 游標由 appendChunk 控制，這裡不需要隱藏
        if (!container) return;

        const ui = window.ui || { component: { btn: (o) => `<button onclick="${o.action}">${o.label}</button>` } };
        
        if (!options || options.length === 0) {
            container.innerHTML = '<div style="color:#666; text-align:center;">(沒有可用選項)</div>';
            return;
        }
        
        container.style.opacity = '1';
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