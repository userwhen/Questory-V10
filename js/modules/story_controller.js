/* js/modules/story_controller.js - V45.1 (Clean Events) */

window.StoryController = {
    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        if (!window.EventBus || !window.EVENTS) return;

        const E = window.EVENTS;

        // 🌟 統一宣告 TempState 藍圖
        window.TempState = window.TempState || {
            isProcessing: false, lockInput: false, isWaitingInput: false,
            skipRendering: false, typingTimer: null, energyLoopId: null,
            deferredHtml: null, isTagDrawerOpen: false, tagFilter: null,
            storyLocation: '未知區域', currentSceneNode: null, storyCard: null,
            storyQueue: [], storyStep: 0, storyOptions: []
        };

        // 初始化底層模組
        if (window.StoryEngine && window.StoryEngine.init) window.StoryEngine.init();
        if (window.storyView && window.storyView.init) window.storyView.init();
        
        // ============================================================
        // 🌟 4. 註冊事件監聽器 (無除錯訊息的純淨版)
        // ============================================================
        
        // 進入故事模式 (包含呼叫 Router 切換畫面)
        EventBus.on(E.Action.ENTER_STORY_MODE, () => {
            // 讓系統 Router 幫我們切換 CSS 顯示畫面
            if (window.act && window.act.navigate) {
                window.act.navigate('story');
            } else {
                EventBus.emit(E.System.NAVIGATE, 'story');
            }
            
            const gs = window.GlobalState;
            const hasActiveChain = gs && gs.story && gs.story.chain && gs.story.chain.history.length > 0;
            const hasActiveNode = gs && gs.story && gs.story.currentNode;

            if (hasActiveChain || hasActiveNode) {
                if (E.Story && E.Story.RENDER_IDLE) EventBus.emit(E.Story.RENDER_IDLE);
            } else {
                if (window.StoryEngine && window.StoryEngine.playSceneNode) {
                    const hubId = (window.SCENE_DB && window.SCENE_DB.adventurer) ? window.SCENE_DB.adventurer[0].id : 'root_hub';
                    const hubNode = window.StoryEngine.findSceneById(hubId);
                    if(hubNode) window.StoryEngine.playSceneNode(hubNode);
                }
            }
        });

        // 探索
        EventBus.on(E.Action.EXPLORE, () => {
            if (window.StoryEngine) {
                const res = window.StoryEngine.explore();
                if (res && !res.success && E.System && E.System.TOAST) {
                    EventBus.emit(E.System.TOAST, res.msg || '無法探索');
                }
            }
        });

        // 選擇選項
        EventBus.on(E.Action.MAKE_CHOICE, (idx) => {
            if (window.StoryEngine && window.StoryEngine.selectOption) window.StoryEngine.selectOption(idx);
        });

        // 繼續/放棄冒險
        EventBus.on(E.Action.RESUME_STORY, () => {
            if (window.StoryEngine && window.StoryEngine.resumeStory) window.StoryEngine.resumeStory();
        });
        
        EventBus.on(E.Action.ABANDON_STORY, () => {
            if (window.StoryEngine && window.StoryEngine.abandonStory) window.StoryEngine.abandonStory();
        });

        // 切換語言
        EventBus.on(E.Action.SET_LANG, (lang) => {
            if (window.StoryEngine) window.StoryEngine.setLang(lang);
            const label = { 'zh': '中文', 'en': 'English', 'jp': '日本語', 'mix': '混合' };
            if (E.System && E.System.TOAST) EventBus.emit(E.System.TOAST, `🌐 語言已切換為 ${label[lang] || lang}`);
        });

        // UI 互動 (抽屜/過濾器)
        EventBus.on(E.Action.TOGGLE_DRAWER, (forceState) => {
            const current = window.TempState.isTagDrawerOpen || false;
            window.TempState.isTagDrawerOpen = (typeof forceState === 'boolean') ? forceState : !current;
            if (E.Story && E.Story.REFRESH_VIEW) EventBus.emit(E.Story.REFRESH_VIEW);
        });

        EventBus.on(E.Action.SET_TAG_FILTER, (val) => {
            window.TempState.tagFilter = val;
            if (E.Story && E.Story.REFRESH_VIEW) EventBus.emit(E.Story.REFRESH_VIEW);
        });
    }
};