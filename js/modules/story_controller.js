/* js/modules/story_controller.js - V42.1 (Decoupled & Optimized - Fixed Init) */

window.StoryController = {
    init: function() {
        if (!window.EventBus) return;
        const E = window.EVENTS || {};

        // 1. 初始化引擎
        if (window.StoryEngine && window.StoryEngine.init) {
            window.StoryEngine.init();
        }
        
        // 1.5 [修復 STORY-V1] 由 Controller 統一負責初始化 View，避免多重綁定
        if (window.storyView && window.storyView.init) {
            window.storyView.init();
        }
        
        // 2. 綁定按鈕動作 (Action Bridge)
        Object.assign(window.act, {
            enterStoryMode: () => {
                if (window.act.navigate) act.navigate('story');
                
                // [修復] 使用標準常數
                if (E.Story && E.Story.ENTERED) EventBus.emit(E.Story.ENTERED);

                const gs = window.GlobalState;
                const hasActiveChain = gs.story && gs.story.chain && gs.story.chain.history.length > 0;
                const hasActiveNode = gs.story && gs.story.currentNode;

                if (hasActiveChain || hasActiveNode) {
                    if (E.Story && E.Story.RENDER_IDLE) EventBus.emit(E.Story.RENDER_IDLE);
                } else {
                    if (window.StoryEngine && window.StoryEngine.playSceneNode) {
                        const hubId = (window.SCENE_DB && window.SCENE_DB.adventurer) ? window.SCENE_DB.adventurer[0].id : 'root_hub';
                        const hubNode = window.StoryEngine.findSceneById(hubId);
                        if(hubNode) window.StoryEngine.playSceneNode(hubNode);
                    }
                }
            },

            explore: () => {
                const res = window.StoryEngine.explore();
                if (res && !res.success) {
                    if (E.System && E.System.TOAST) EventBus.emit(E.System.TOAST, res.msg || '無法探索');
                }
            },
            
            choice: (idx) => {
                if (window.StoryEngine && window.StoryEngine.selectOption) {
                    window.StoryEngine.selectOption(idx);
                }
            },
            
            setLang: (lang) => {
                if (window.StoryEngine) window.StoryEngine.setLang(lang);
                const label = { 'zh': '中文', 'en': 'English', 'jp': '日本語', 'mix': '混合' };
                if (E.System && E.System.TOAST) EventBus.emit(E.System.TOAST, `🌐 語言已切換為 ${label[lang] || lang}`);
            },
            
            toggleTagDrawer: (forceState) => {
                const current = window.TempState.isTagDrawerOpen || false;
                window.TempState.isTagDrawerOpen = (typeof forceState === 'boolean') ? forceState : !current;
                if (E.Story && E.Story.REFRESH_VIEW) EventBus.emit(E.Story.REFRESH_VIEW);
            },
            
            setTagFilter: (val) => {
                window.TempState.tagFilter = val;
                if (E.Story && E.Story.REFRESH_VIEW) EventBus.emit(E.Story.REFRESH_VIEW);
            },
        });
        
        console.log("✅ StoryController V42.1 Active (Double Init Fixed)");
    }
};

// [修復 STORY-1] 徹底移除底部的 document.addEventListener 自動啟動區塊
// Controller 的 init 已經由 main.js (App.boot) 統一呼叫，留著會造成二次初始化！