/* js/modules/story_controller.js - V51.4 Pure CSP Bridge */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Story = {
	_initialized: false,
    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        if (!window.SQ.EventBus || !window.SQ.Events) return;

        const E = window.SQ.Events;

        window.SQ.Temp = window.SQ.Temp || {
            isProcessing: false, lockInput: false, isWaitingInput: false,
            skipRendering: false, typingTimer: null, energyLoopId: null,
            deferredHtml: null, isTagDrawerOpen: false, tagFilter: null,
            storyLocation: '未知區域', currentSceneNode: null, storyCard: null,
            storyQueue: [], storyStep: 0, storyOptions: []
        };

        if (window.SQ.Engine.Story.init) window.SQ.Engine.Story.init();
        if (window.SQ.View.Story && window.SQ.View.Story.init) window.SQ.View.Story.init();

        // 🌟 [V51.4 新增] 為 StoryView 提供乾淨的 act 接口
        Object.assign(window.SQ.Actions, {
            clickStoryScreen: () => { if (window.SQ.Engine.Story.clickScreen) window.SQ.Engine.Story.clickScreen(); },
            exploreStory: () => window.SQ.EventBus.emit(E.Action.EXPLORE),
            resumeStory: () => window.SQ.EventBus.emit(E.Action.RESUME_STORY),
            abandonStory: () => window.SQ.EventBus.emit(E.Action.ABANDON_STORY),
            makeStoryChoice: (idx) => window.SQ.EventBus.emit(E.Action.MAKE_CHOICE, idx),
            setStoryLang: (lang) => window.SQ.EventBus.emit(E.Action.SET_LANG, lang),
            toggleStoryDrawer: () => window.SQ.EventBus.emit(E.Action.TOGGLE_DRAWER)
        });
        
        window.SQ.EventBus.on(E.Action.ENTER_STORY_MODE, () => {
            if (window.SQ.Actions && window.SQ.Actions.navigate) window.SQ.Actions.navigate('story');
            else window.SQ.EventBus.emit(E.System.NAVIGATE, 'story');
            
            const gs = window.SQ.State;
            const hasActiveChain = gs && gs.story && gs.story.chain && gs.story.chain.history.length > 0;
            const hasActiveNode = gs && gs.story && gs.story.currentNode;

            if (hasActiveChain || hasActiveNode) {
                if (E.Story && E.Story.RENDER_IDLE) window.SQ.EventBus.emit(E.Story.RENDER_IDLE);
            } else {
                if (window.SQ.Engine.Story.playSceneNode) {
                    const hubId = (window.SCENE_DB && window.SCENE_DB.adventurer) ? window.SCENE_DB.adventurer[0].id : 'root_hub';
                    const hubNode = window.SQ.Engine.Story.findSceneById(hubId);
                    if(hubNode) window.SQ.Engine.Story.playSceneNode(hubNode);
                }
            }
        });

        window.SQ.EventBus.on(E.Action.EXPLORE, () => {
            if (window.StoryEngine) {
                const res = window.SQ.Engine.Story.explore();
                if (res && !res.success && E.System && E.System.TOAST) window.SQ.EventBus.emit(E.System.TOAST, res.msg || '無法探索');
            }
        });

        window.SQ.EventBus.on(E.Action.MAKE_CHOICE, (idx) => { if (window.SQ.Engine.Story.selectOption) window.SQ.Engine.Story.selectOption(idx); });
        window.SQ.EventBus.on(E.Action.RESUME_STORY, () => { if (window.SQ.Engine.Story.resumeStory) window.SQ.Engine.Story.resumeStory(); });
        window.SQ.EventBus.on(E.Action.ABANDON_STORY, () => { if (window.SQ.Engine.Story.abandonStory) window.SQ.Engine.Story.abandonStory(); });

        window.SQ.EventBus.on(E.Action.SET_LANG, (lang) => {
            if (window.StoryEngine) window.SQ.Engine.Story.setLang(lang);
            const label = { 'zh': '中文', 'en': 'English', 'jp': '日本語', 'mix': '混合' };
            if (E.System && E.System.TOAST) window.SQ.EventBus.emit(E.System.TOAST, `🌐 語言已切換為 ${label[lang] || lang}`);
        });

        window.SQ.EventBus.on(E.Action.TOGGLE_DRAWER, (forceState) => {
            const current = window.SQ.Temp.isTagDrawerOpen || false;
            window.SQ.Temp.isTagDrawerOpen = (typeof forceState === 'boolean') ? forceState : !current;
            if (E.Story && E.Story.REFRESH_VIEW) window.SQ.EventBus.emit(E.Story.REFRESH_VIEW);
        });

        window.SQ.EventBus.on(E.Action.SET_TAG_FILTER, (val) => {
            window.SQ.Temp.tagFilter = val;
            if (E.Story && E.Story.REFRESH_VIEW) window.SQ.EventBus.emit(E.Story.REFRESH_VIEW);
        });
    }
};
window.StoryController = window.SQ.Controller.Story;