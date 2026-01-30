/* js/modules/story_view.js - V44.5 (Smart Paging & Idle Logic Fix) */

window.storyView = {
    // ============================================================
    // 1. Ruby 解析
    // ============================================================
    parseRuby: function(text) {
        if (!text) return "";
        // 格式支援：漢字[平假名] -> <ruby>漢字<rt>平假名</rt></ruby>
        return text.replace(/([\u4e00-\u9fa5]+)\[(.+?)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
    },
	// [New] 2. 自動排版：句點換行
    formatText: function(text) {
        if (!text) return "";
        // 先處理 Ruby
        let formatted = this.parseRuby(text);
        // 將句點替換為 句點+換行 (使用 <br> 或 \n 配合 pre-wrap)
        // 這裡我們用 \n\n 讓段落更分明
        formatted = formatted.replace(/。/g, '。\n\n');
        return formatted;
    },

    // ============================================================
    // 2. 主渲染函式 (UI 建構)
    // ============================================================
    render: function() {
        window.TempState.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        // --- 容器樣式 ---

        Object.assign(container.style, {
            backgroundColor: '#111',
            padding: '0',
            height: '100%',       // [修正] 不使用 100vh
            width: '100%',
            overflow: 'hidden',   // 禁止整體滾動
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute', // 確保填滿父層
            top: '0',
            left: '0'
        });

        // --- 數據準備 ---
        const gs = window.GlobalState;
        let currentMax = 100;
        if (window.StoryEngine && typeof StoryEngine.calculateMaxEnergy === 'function') {
            currentMax = StoryEngine.calculateMaxEnergy();
        }
        const energy = Math.floor(gs.story?.energy || 0);
        const locationName = window.TempState.storyLocation || '---';
        const currentTagFilter = window.TempState.tagFilter || '全部';
        const myTags = gs.story?.tags || []; 

        // --- UI 庫防呆 ---
        const ui = window.ui || {
            input: { select: () => '' },
            component: { btn: (o) => `<button onclick="${o.action}">${o.label}</button>`, pill: (l) => `<span>${l}</span>` },
            progress: { bar: () => '' },
            layout: { scrollX: () => '', drawer: (o,c) => c }
        };

        // --- A. TopBar ---
        const langOpts = [
            { value: 'mix', label: '😵 Mix' },
            { value: 'zh',  label: '🇹🇼 ZH' },
            { value: 'jp',  label: '🇯🇵 JP' },
            { value: 'en',  label: '🇺🇸 EN' }
        ];
        const currentLang = (gs.settings && gs.settings.targetLang) ? gs.settings.targetLang : 'mix';
        
        // 使用 ui.input.select
        const langSelectorHtml = `
            <div style="width:85px; transform: scale(0.9);">
                ${ui.input.select(langOpts, currentLang, "act.setLang(this.value)", "story-lang-select")}
            </div>`;
            
        // 準備 "+" 按鈕 (開啟精力商店)
        const btnStamina = ui.component.btn({
            label: '+', 
            theme: 'correct', 
            size: 'sm', 
            style: 'padding:0 6px; height:20px; line-height:1; margin-left:4px;', 
            action: 'if(window.shopView) shopView.renderStaminaShop()' 
        });

        const topBarContent = `
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap: 5px;">
                <div style="display:flex; align-items:center; width: 120px; flex-shrink: 0;">
                    <span style="color:#ffd700; font-size:0.9rem; margin-right:4px;">⚡</span>
                    <div style="flex:1;">
                        ${ui.progress.bar(energy, currentMax, `${energy}/${currentMax}`, 'height:12px; background:#333; color:#fff; font-size:0.7rem;')}
                    </div>
                    ${btnStamina}
                </div>

                <div style="flex: 1; display:flex; justify-content:center; align-items:center; overflow:hidden;">
                    <div style="text-align:center; color:#aaa; font-size:0.95rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        📍 ${locationName}
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:2px; flex-shrink: 0;">
                    ${langSelectorHtml}
                    ${ui.component.btn({label:'✕', theme:'danger', size:'sm', style:'padding:2px 6px;', action:"act.navigate('main')"})}
                </div>
            </div>`;

        // --- B. Tag Pills & Drawer ---
        const tagColors = { 'loc': '#795548', 'status': '#1976d2', 'warn': '#d32f2f', 'info': '#7b1fa2' };
        let tagsPillsHtml = myTags.length === 0 ? '' : myTags.map(t => {
                const label = typeof t === 'string' ? t : t.label;
                const type = typeof t === 'string' ? 'info' : t.type;
                if (currentTagFilter !== '全部' && type !== 'loc' && label !== currentTagFilter) return '';
                return ui.component.pill(label, tagColors[type] || '#455a64', '', true);
            }).join('');
        const tagsAreaHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">${tagsPillsHtml}</div>`;

        const isTagOpen = window.TempState.isTagDrawerOpen || false;
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

        const tagDrawerHtml = ui.layout.drawer(
            isTagOpen, tagDrawerContent, "act.toggleTagDrawer()",
            { dir: 'right', fixedHandle: true, color: '#1a1a1a', iconOpen: '▶', iconClose: '◀' }
        );

        // --- C. Text Body (加入 hint) ---
        const hintHtml = `
            <div id="story-next-hint" style="display:none; text-align:center; margin-top:10px; animation: bounce 1s infinite; cursor:pointer; color:#ffd700;">
                ▼ 點擊繼續
            </div>
            <style>@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }</style>
        `;

        const textBody = `
            <div id="story-text-wrapper" 
                 onclick="if(window.TempState.waitingForPageClick && window.TempState.nextPageFunc) { window.TempState.nextPageFunc(); } else if(window.TempState.isRendering) { window.TempState.skipRendering=true; }" 
                 style="
                    flex: 1; min-height: 0; padding: 20px; overflow-y: auto; 
                    color: #e0e0e0; font-size: 1.1rem; line-height: 1.6; padding-bottom: 20px;
                    white-space: pre-wrap; /* [Critical Fix] 讓 \n 自動換行 */
                 ">
                <div id="story-content" style="min-height: 100px;"></div>
                ${hintHtml}
            </div>`;
        // --- D. Actions Area ---
        const actionsArea = `
            <div id="story-actions" style="
                min-height: 220px; width: 100%;
                flex-shrink: 0; display: flex; flex-direction: column; 
                justify-content: flex-start; gap: 10px; background: #222; border-top: 2px solid #555;
                padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 10; position: relative;
            "></div>`;

        // --- F. 最終組裝 ---
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; width:100%; position:relative;">
                <div style="flex-shrink:0; height:60px; background:#111; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 10px;">${topBarContent}</div>
                ${textBody}
                ${actionsArea}
                ${tagDrawerHtml} 
            </div>
        `;

        // --- G. 內容渲染觸發 ---
        if (!window.TempState.storyCard) { 
            this.renderIdle(); 
        } else { 
            const currentText = window.TempState.storyCard.text;
            const lastText = window.TempState.lastRenderedText;
            const isInstant = (currentText && lastText && currentText === lastText);
            this.renderScene(window.TempState.storyCard, isInstant); 
        }

        // 確保按鈕點擊有效
        if (!window.act) window.act = {};
        if (!window.act.choice) {
            window.act.choice = (idx) => {
                if (window.StoryEngine && window.StoryEngine.makeChoice) window.StoryEngine.makeChoice(idx);
            };
        }
    },

    // ============================================================
    // 3. 場景渲染
    // ============================================================
    renderScene: function(card, isInstant = false) {
        window.TempState.storyCard = card;
        window.TempState.lastRenderedText = card.text;
        if (card.location) window.TempState.storyLocation = card.location;

        const actionBox = document.getElementById('story-actions');
        if (actionBox) actionBox.innerHTML = ''; 

        // 準備選項按鈕
        const actions = (card.options || []).map((opt, idx) => ({
            label: opt.label || "Option", 
            theme: opt.style || 'normal',
            action: `act.choice(${idx})`
        }));
		
		const rawText = card.text || "";
        const displayHtml = (this.formatText) ? this.formatText(rawText) : rawText;

        if (isInstant) {
            const box = document.getElementById('story-content');
            const hint = document.getElementById('story-next-hint');
            if (box) {
                box.innerHTML = this.parseRuby(card.text); 
                if(hint) hint.style.display = 'none';
            }
            this.renderActions(actions);
        } else {
            this.typeWriter(displayHtml, () => {
                this.renderActions(actions);
            });
        }
    },

    // [Modified] 移除「返回大廳」按鈕
    renderIdle: function() {
        const idleText = "四周一片漆黑，唯有遠處傳來微弱的聲響...";
        const lastText = window.TempState.lastRenderedText;
        const isInstant = (lastText === idleText);

        window.TempState.lastRenderedText = idleText;
        window.TempState.storyCard = null;

        const actions = [
            { label: "🔍 繼續探索 (5⚡)", theme: 'correct', action: "act.explore()" }
            // 移除了 "🏠 返回大廳"
        ];

        if (isInstant) {
            const box = document.getElementById('story-content');
            if (box) box.textContent = idleText;
            this.renderActions(actions);
        } else {
            this.typeWriter(idleText, () => {
                this.renderActions(actions);
            }, 40);
        }
    },

    renderActions: function(actions) {
        const container = document.getElementById('story-actions');
        if (!container) return;
        
        const ui = window.ui || { component: { btn: (o) => `<button onclick="${o.action}">${o.label}</button>` } };

        if (!actions || actions.length === 0) {
            container.innerHTML = '<div style="color:#666; text-align:center; margin-top:20px;">(沒有可用選項)</div>';
            return;
        }
        
        container.innerHTML = actions.map(btn => ui.component.btn({
            label: btn.label,
            theme: btn.theme || 'normal',
            action: btn.action,
            style: 'width:100%; max-width:400px; margin:0 auto; padding:14px; font-size:1rem; text-align:center; border:1px solid #444; background:#2a2a2a; color:#eee; flex-shrink: 0;'
        })).join('');
    },

    // ============================================================
    // 4. 智慧打字機 (Smart Paging) - 整合版
    // ============================================================
    typeWriter: function(text, onComplete, customSpeed) {
        const box = document.getElementById('story-content');
        const hint = document.getElementById('story-next-hint');
        if (!box) return;
        
        if (window._typewriterTimer) {
            clearTimeout(window._typewriterTimer);
            window._typewriterTimer = null;
        }

        const typingSpeed = customSpeed || 20; 
        window.TempState.isRendering = false;
        window.TempState.skipRendering = false;
        window.TempState.waitingForPageClick = false;

        // [New] 簡易處理：如果是 HTML (有 <ruby> 或 <br>), 直接顯示不打字
        if (text.includes('<') && text.includes('>')) {
            box.innerHTML = text;
            if(hint) hint.style.display = 'none';
            window.TempState.isRendering = false;
            if (onComplete) onComplete();
            return;
        }

        // 分頁邏輯
        const PAGE_SIZE = 80; // 每頁字數
        let chunks = [];
        for (let i = 0; i < text.length; i += PAGE_SIZE) {
            chunks.push(text.substring(i, i + PAGE_SIZE));
        }
        
        let chunkIndex = 0;
        box.innerHTML = '';
        if(hint) hint.style.display = 'none';
        
        window.TempState.isRendering = true;

        const showChunk = () => {
            let charIndex = 0;
            const currentChunk = chunks[chunkIndex];
            
            const typeChar = () => {
                // 安全檢查
                if(window.TempState.currentView !== 'story') {
                    window.TempState.isRendering = false;
                    return;
                }

                if (window.TempState.skipRendering) {
                    box.innerHTML += currentChunk.substring(charIndex);
                    finishChunk();
                    return;
                }
                
                if (charIndex < currentChunk.length) {
                    box.textContent += currentChunk[charIndex];
                    charIndex++;
                    // 自動捲動到底部
                    const wrap = document.getElementById('story-text-wrapper');
                    if(wrap) wrap.scrollTop = wrap.scrollHeight;
                    
                    window._typewriterTimer = setTimeout(typeChar, typingSpeed);
                } else {
                    finishChunk();
                }
            };

            const finishChunk = () => {
                chunkIndex++;
                window.TempState.isRendering = false;
                window.TempState.skipRendering = false;
                window._typewriterTimer = null;
                
                if (chunkIndex < chunks.length) {
                    // 還有下一頁
                    if(hint) hint.style.display = 'block';
                    window.TempState.waitingForPageClick = true;
                    window.TempState.nextPageFunc = () => {
                        if(hint) hint.style.display = 'none';
                        window.TempState.waitingForPageClick = false;
                        window.TempState.isRendering = true;
                        showChunk();
                    };
                } else {
                    // 全部結束
                    if(hint) hint.style.display = 'none';
                    window.TempState.waitingForPageClick = false;
                    if (typeof onComplete === 'function') onComplete();
                }
            };
            typeChar();
        };
        
        showChunk();
    },

    // 5. 檢定結果顯示
    appendInlineCheckResult: function(attrKey, total, isSuccess) {
        const box = document.getElementById('story-content');
        if (!box) return;
        const div = document.createElement('div'); 
        div.style.marginTop = '10px';
        const color = isSuccess ? '#4caf50' : '#f44336';
        div.innerHTML = `<span style="color:#aaa;">(🎲) (${attrKey}判定)... ${total} ...</span><span style="color:${color}; font-weight:bold;">${isSuccess ? '成功' : '失敗'}</span>`;
        box.appendChild(div);
        
        const wrapper = document.getElementById('story-text-wrapper');
        if(wrapper) wrapper.scrollTop = wrapper.scrollHeight;
    },
	
	// [New] 鎖定/解鎖按鈕
    setButtonsDisabled: function(disabled) {
        const container = document.getElementById('story-actions');
        if (!container) return;
        const btns = container.querySelectorAll('button');
        btns.forEach(btn => {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '1';
            btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
        });
    }
};