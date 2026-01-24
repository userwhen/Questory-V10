/* js/modules/story_view.js - V34.Final (Pure Black View) */
window.storyView = {
    render: function() {
        window.TempState.currentView = 'story';
        const container = document.getElementById('page-story');
        if (!container) return;

        const gs = window.GlobalState;
        const currentMax = StoryEngine.calculateMaxEnergy();
        const energy = Math.floor(gs.story?.energy || 0);
        
        // [New] 純黑背景設定
        container.style.backgroundColor = '#000000';
        container.style.backgroundImage = 'none';

        // [New] 語言選擇器 HTML (V29 移植)
        const currentLang = gs.settings?.targetLang || 'mix';
        const langSelector = `
            <select onchange="act.setLang(this.value)" style="margin-right:8px; padding:2px 5px; font-size:0.8rem; border-radius:4px; background:#333; color:#fff; border:1px solid #555;">
                <option value="mix" ${currentLang==='mix'?'selected':''}>😵 混合</option>
                <option value="zh" ${currentLang==='zh'?'selected':''}>🇹🇼 中文</option>
                <option value="en" ${currentLang==='en'?'selected':''}>🇺🇸 英文</option>
                <option value="jp" ${currentLang==='jp'?'selected':''}>🇯🇵 日文</option>
            </select>
        `;

        // A. 頂部資訊列 (整合語言選單)
        const topBar = `
            <div id="story-top-bar" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #333;">
                <div style="color:#ffd700; font-weight:bold; font-size:1.1rem;">
                    ⚡ ${energy} <span style="font-size:0.8rem; color:#666;">/${currentMax}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    ${langSelector}
                    ${ui.component.btn({ label: '✕', theme: 'danger', size: 'sm', action: "act.navigate('main')" })}
                </div>
            </div>
        `;

        // B. 劇情文字區 (字體顏色設為淺灰)
        const textBox = `
            <div id="story-text-box" style="flex:1; padding:20px; overflow-y:auto; color:#e0e0e0; font-size:1.1rem; line-height:1.6;">
                <div id="story-content" style="min-height:100px;"></div>
            </div>
        `;

        // C. 動作按鈕區
        const actionArea = `<div id="story-actions" style="padding:15px;"></div>`;

        // 組合 DOM
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; width:100%;">
                ${topBar}
                ${textBox}
                ${actionArea}
            </div>
        `;

        // 點擊加速
        const textWrapper = document.getElementById('story-text-box');
        if(textWrapper) {
            textWrapper.onclick = () => {
                if (window.TempState.isRendering) { window.TempState.skipRendering = true; }
            };
        }

        // 恢復狀態
        if (!window.TempState.storyCard) {
            this.renderIdle();
        } else {
            this.renderScene(window.TempState.storyCard);
        }
    },

    // 閒置狀態
    renderIdle: function() {
        // 使用慢速 (80ms) 增加氛圍
        this.typeText("四周一片漆黑，唯有遠處傳來微弱的聲響...", () => {
            this.renderActions([
                { label: "🔍 繼續探索 (5⚡)", theme: 'correct', action: "act.explore()" },
                { label: "🏠 返回大廳", theme: 'normal', action: "act.navigate('main')" }
            ]);
        }, 80);
    },

    // 場景渲染
    renderScene: function(card) {
        window.TempState.storyCard = card;
        document.getElementById('story-actions').innerHTML = '';
        
        // 正常速度 (30ms)
        this.typeText(card.text, () => {
            const actions = (card.options || []).map((opt, idx) => ({
                label: opt.text || opt.label || "選項", 
                theme: opt.style || 'primary',
                action: `act.choice(${idx})`
            }));
            this.renderActions(actions);
        }, 30);
    },

    renderActions: function(actions) {
        const container = document.getElementById('story-actions');
        if (!container) return;
        
        if (actions.length === 0) {
            container.innerHTML = '<div style="color:#666; text-align:center;">(沒有可用選項)</div>';
            return;
        }

        container.innerHTML = actions.map(btn => ui.component.btn({
            label: btn.label,
            theme: btn.theme || 'normal',
            action: btn.action,
            style: 'width:100%; padding:15px; font-size:1rem; margin-bottom:10px;'
        })).join('');
    },

    // [Fix] 打字機特效 (支援自訂速度)
    typeText: function(text, onComplete, speed = 30) {
        const box = document.getElementById('story-content');
        if (!box) return;
        box.innerHTML = '';
        
        if(window.TempState.skipRendering) {
            box.textContent = text;
            window.TempState.skipRendering = false;
            window.TempState.isRendering = false;
            if(onComplete) onComplete();
            return;
        }

        let i = 0;
        window.TempState.isRendering = true;
        
        function type() {
            if(!window.TempState.isRendering) return;
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