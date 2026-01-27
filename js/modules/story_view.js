/* js/modules/story_view.js - V35.20 (Fix Typing Effect Logic by Content Check) */

window.storyView = {
    render: function() {
        window.TempState.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        // 1. 基本樣式
        container.style.backgroundColor = '#111';
        container.style.padding = '0';
        container.style.height = '100%';
        container.style.overflow = 'hidden';

        // 2. 數據準備
        const gs = window.GlobalState;
        const currentMax = StoryEngine.calculateMaxEnergy();
        const energy = Math.floor(gs.story?.energy || 0);
        const locationName = window.TempState.storyLocation || '未知之地';
        const myTags = gs.story?.tags || []; 
        
        // 讀取當前標籤篩選狀態
        const currentFilter = window.TempState.tagFilter || '全部';

        // 3. 標籤顯示 (Pills)
        const tagColors = { 'loc': '#795548', 'status': '#1976d2', 'warn': '#d32f2f', 'info': '#7b1fa2' };
        let tagsPillsHtml = myTags.length === 0 
            ? '<div style="color:#666; font-size:0.8rem;">(尚未獲得任何標籤)</div>' 
            : myTags.map(t => {
                const label = typeof t === 'string' ? t : t.label;
                const type = typeof t === 'string' ? 'info' : t.type;
                // 篩選過濾邏輯
                if (currentFilter !== '全部' && type !== 'loc' && label !== currentFilter) return '';
                return ui.component.pill(label, tagColors[type] || '#455a64', '', true);
            }).join('');
        const tagsAreaHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">${tagsPillsHtml}</div>`;
  
        // 4. TopBar
        const topBarContent = `
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                <div style="display:flex; align-items:center; gap:8px; flex:1;">
                    <div style="width:80px;">${ui.progress.bar(energy, currentMax, `${energy}/${currentMax}`, 'height:12px; background:#333; color:#ffd700; font-size:0.7rem;')}</div>
                    ${ui.component.btn({label:'+', theme:'correct', size:'sm', style:'padding:0 6px; height:22px; line-height:1;', action:'shopView.renderStaminaShop()'})}
                </div>
                <div style="flex:1.5; text-align:center; color:#aaa; font-size:0.9rem; font-weight:bold;">📍 ${locationName}</div>
                <div style="flex:1; text-align:right;">
                    ${ui.component.btn({label:'✕', theme:'danger', size:'sm', style:'padding:2px 8px;', action:"act.navigate('main')"})}
                </div>
            </div>`;

        // 5. Text Body
        const textBody = `
            <div id="story-text-wrapper" onclick="if(window.TempState.isRendering) window.TempState.skipRendering=true;" style="padding: 20px; height: 100%; overflow-y: auto; color: #e0e0e0; font-size: 1.1rem; line-height: 1.6; padding-bottom: 20px;">
                <div id="story-content" style="min-height: 100px;"></div>
            </div>`;

        // 6. Actions Area
        const actionsArea = `
            <div id="story-actions" style="
                height: 220px !important;     
                min-height: 220px !important; 
                width: 100%;
                flex-shrink: 0; flex-grow: 0;                 
                display: flex; flex-direction: column; justify-content: flex-start; gap: 10px;
                background: #222; border-top: 2px solid #555;
                padding: 15px; box-sizing: border-box;       
                overflow-y: auto; z-index: 10; position: relative;
            "></div>
        `;

        // 7. Tag Drawer Content
        const isTagOpen = window.TempState.isTagDrawerOpen || false;
        const tagDrawerContent = `
            <div style="display: flex; flex-direction: column; height: 100%; color: #fff;">
                <div style="
                    flex-shrink: 0; display: flex; align-items: center; gap: 12px; 
                    margin: 10px 0; padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="font-size: 1rem; font-weight: bold; white-space: nowrap; color: #ddd;">標籤篩選</div>
                    <div style="
                        flex: 1; min-width: 0;
                        background: rgba(255,255,255,0.08); 
                        border-radius: 20px; padding: 4px 10px;
                        overflow-x: auto; white-space: nowrap;
                        display: flex; align-items: center; scrollbar-width: none;
                    ">
                        <div style="display: flex; gap: 5px; width: 100%;">
                             ${ui.layout.scrollX(['全部', '場景', '狀態', '知識'], currentFilter, 'act.setTagFilter')}
                        </div>
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto;">${tagsAreaHtml}</div>
            </div>
        `;

        // 8. Drawer Implementation (固定把手模式)
        const tagDrawerHtml = ui.layout.drawer(
            isTagOpen, tagDrawerContent, "act.toggleTagDrawer()",
            { dir: 'right', fixedHandle: true, color: '#1a1a1a', iconOpen: '▶', iconClose: '◀' }
        );

        // 9. 組裝 HTML
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; position:relative;">
                <div style="flex-shrink:0; height:50px; background:#111; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 10px;">${topBarContent}</div>
                <div style="flex:1; position:relative; overflow:hidden;">${textBody}</div>
                ${actionsArea}
                ${tagDrawerHtml} 
            </div>
        `;

        // 10. 渲染內容 (核心修正：改用 Text 比對)
        if (!window.TempState.storyCard) { 
            this.renderIdle(); 
        } else { 
            // 🔍 這裡改了！不看 ID，直接看文字內容是否相同
            // 如果上次渲染的文字 == 現在要渲染的文字，代表是同一個場景，只是刷新了介面
            const currentText = window.TempState.storyCard.text;
            const lastText = window.TempState.lastRenderedText;
            
            // 判斷是否需要「瞬間顯示」(true = 瞬間, false = 打字特效)
            const isInstant = (currentText && lastText && currentText === lastText);
            
            this.renderScene(window.TempState.storyCard, isInstant); 
        }
    },

    // 渲染按鈕
    renderActions: function(actions) {
        const container = document.getElementById('story-actions');
        if (!container) return;

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

    // 閒置狀態
    renderIdle: function() {
        const idleText = "四周一片漆黑，唯有遠處傳來微弱的聲響...";
        
        // 比對：如果上次渲染的文字跟現在一樣，就不要重跑動畫
        const lastText = window.TempState.lastRenderedText;
        const isInstant = (lastText === idleText);

        // 記錄當前文字
        window.TempState.lastRenderedText = idleText;
        window.TempState.storyCard = null; // 確保狀態正確

        const actions = [
            { label: "🔍 繼續探索 (5⚡)", theme: 'correct', action: "act.explore()" },
            { label: "🏠 返回大廳", theme: 'normal', action: "act.navigate('main')" }
        ];

        if (isInstant) {
            // [瞬間模式]
            const box = document.getElementById('story-content');
            if (box) box.textContent = idleText;
            this.renderActions(actions);
        } else {
            // [動畫模式]
            this.typeText(idleText, () => {
                this.renderActions(actions);
            }, 80);
        }
    },

    // 場景渲染
    renderScene: function(card, isInstant = false) {
        window.TempState.storyCard = card;
        // 📝 這裡改了！記錄當下的文字內容，供下次比對
        window.TempState.lastRenderedText = card.text; 
        
        if (card.location) window.TempState.storyLocation = card.location;

        const actionBox = document.getElementById('story-actions');
        if (actionBox) actionBox.innerHTML = ''; 

        const actions = (card.options || []).map((opt, idx) => ({
            label: opt.text || opt.label || "選項", 
            theme: opt.style || 'normal',
            action: `act.choice(${idx})`
        }));

        if (isInstant) {
            // ✅ [瞬間模式]：切換抽屜/標籤時使用
            const box = document.getElementById('story-content');
            if (box) {
                box.textContent = card.text; // 直接塞字，跳過動畫
                
                // 恢復捲動位置
                const wrapper = document.getElementById('story-text-wrapper');
                if (wrapper && window.TempState.storyScrollY) {
                    wrapper.scrollTop = window.TempState.storyScrollY;
                }
            }
            this.renderActions(actions);
        } else {
            // 🎬 [特效模式]：新劇情時使用
            // 重置捲軸
            const wrapper = document.getElementById('story-text-wrapper');
            if (wrapper) wrapper.scrollTop = 0;
            // 清除舊的記憶位置，因為這是新劇情
            window.TempState.storyScrollY = 0;

            this.typeText(card.text, () => {
                this.renderActions(actions);
            }, 30);
        }
    },

    // 打字機特效 (保持不變)
    typeText: function(text, onComplete, speed = 30) {
        const box = document.getElementById('story-content');
        if (!box) return;
        box.innerHTML = '';
        
        if(window.TempState.isRendering) window.TempState.skipRendering = false;

        let i = 0;
        window.TempState.isRendering = true;
        
        function type() {
            if(window.TempState.currentView !== 'story') {
                window.TempState.isRendering = false;
                return;
            }

            if(window.TempState.skipRendering) {
                 box.textContent = text;
                 window.TempState.skipRendering = false;
                 window.TempState.isRendering = false;
                 if(onComplete) onComplete();
                 return;
            }
            if (i < text.length) {
                box.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed); 
            } else {
                window.TempState.isRendering = false;
                if (onComplete) onComplete();
            }
        }
        type();
    }
};

// 監聽捲動事件，記錄位置
document.addEventListener('scroll', (e) => {
    if (e.target.id === 'story-text-wrapper') {
        window.TempState.storyScrollY = e.target.scrollTop;
    }
}, true);