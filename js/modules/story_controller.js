/* js/modules/story_controller.js - V34.Final */
window.StoryController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act
        Object.assign(window.act, {
            enterStory: () => window.act.navigate('story'),
            enterStoryMode: () => window.act.navigate('story'),
            
            explore: () => StoryEngine.explore(),
            choice: (idx) => StoryEngine.makeChoice(idx),
            
            // [New] 語言切換橋接
            setLang: (val) => {
                StoryEngine.setLang(val);
                // 如果在閒置畫面，重繪以更新文字 (可選)
                if (window.storyView) window.storyView.render();
            }
        });

        // B. 監聽導航
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'story') {
                // 資料安全檢查
                if (!window.GlobalState.story) {
                    StoryEngine.init(); 
                }
                
                window.TempState.storyCard = null; 
                
                if (window.storyView) {
                    window.storyView.render();
                }
            }
        });

        // C. 監聽更新
        EventBus.on(E.Story.UPDATED, () => {
            if (window.TempState.currentView === 'story') {
                if (window.storyView) window.storyView.render();
            }
        });

        // D. 監聽播放
        EventBus.on(E.Story.SCENE_PLAYED, (card) => {
            if (window.storyView) window.storyView.renderScene(card);
        });

        console.log("✅ StoryController (Final) 就緒");
    }
};