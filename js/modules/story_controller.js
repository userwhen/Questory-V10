/* js/modules/story_controller.js - V42.0 (Decoupled & Optimized) */

window.StoryController = {
    init: function() {
        if (!window.EventBus) return;
        const E = window.EVENTS || {}; // 確保事件定義存在

        // 1. 初始化引擎
        if (window.StoryEngine && window.StoryEngine.init) {
            window.StoryEngine.init();
        }
        
        // 2. 綁定按鈕動作 (Action Bridge)
        Object.assign(window.act, {
            
            // [Action] 進入劇情模式
            enterStoryMode: () => {
                // A. 頁面導航 (建議也改用事件，但 navigate 是核心功能先保留)
                if (window.act.navigate) act.navigate('story');
                
                // B. 通知系統：劇情模式已啟用 (取代直接呼叫 view.updateStoryHUD)
                EventBus.emit(E.Story.ENTERED || 'STORY_ENTERED');

                // C. 檢查進度並決定渲染內容
                const gs = window.GlobalState;
                const hasActiveChain = gs.story && gs.story.chain && gs.story.chain.history.length > 0;
                const hasActiveNode = gs.story && gs.story.currentNode;

                if (hasActiveChain || hasActiveNode) {
                    // 有存檔 -> 發送「渲染待機畫面」事件
                    // View 層監聽到這個事件後，執行 storyView.renderIdle()
                    EventBus.emit(E.Story.RENDER_IDLE || 'STORY_RENDER_IDLE');
                } else {
                    // 無進度 -> 嘗試進入大廳
                    if (window.StoryEngine && window.StoryEngine.playSceneNode) {
                        const hubId = (window.SCENE_DB && window.SCENE_DB.adventurer) ? window.SCENE_DB.adventurer[0].id : 'root_hub';
                        const hubNode = window.StoryEngine.findSceneById(hubId);
                        if(hubNode) window.StoryEngine.playSceneNode(hubNode);
                    }
                }
            },

            // [Action] 探索
            explore: () => {
                const res = window.StoryEngine.explore();
                
                if (res && !res.success) {
                    // [解耦] 錯誤提示改發事件
                    EventBus.emit(E.System.TOAST || 'SYSTEM_TOAST', res.msg || '無法探索');
                } else {
                    // 成功時，引擎會發出 UPDATE 事件，View 自行更新
                    // EventBus.emit(E.Stats.UPDATED); // 引擎內部通常會做這件事
                }
            },
            
            // [Action] 選項點擊
            choice: (idx) => {
                if (window.StoryEngine && window.StoryEngine.selectOption) {
                    window.StoryEngine.selectOption(idx);
                }
            },
            
            // [Action] 語言切換
            setLang: (lang) => {
                if (window.StoryEngine) window.StoryEngine.setLang(lang);
                
                const label = { 'zh': '中文', 'en': 'English', 'jp': '日本語', 'mix': '混合' };
                // [解耦] 提示改發事件
                EventBus.emit(E.System.TOAST || 'SYSTEM_TOAST', `🌐 語言已切換為 ${label[lang] || lang}`);
            },
            
            // [Action] Tag 抽屜
            toggleTagDrawer: (forceState) => {
                const current = window.TempState.isTagDrawerOpen || false;
                window.TempState.isTagDrawerOpen = (typeof forceState === 'boolean') ? forceState : !current;
                
                // 通知 View 重繪 (取代 storyView.render())
                EventBus.emit(E.Story.REFRESH_VIEW || 'STORY_REFRESH_VIEW');
            },
            
            // [Action] Tag 過濾
            setTagFilter: (val) => {
                window.TempState.tagFilter = val;
                EventBus.emit(E.Story.REFRESH_VIEW || 'STORY_REFRESH_VIEW');
            },
        });

        // 3. 監聽 View 更新需求 (如果 View 需要反向請求 Controller 做事)
        // 目前 Controller 是主動方，暫無此需求
        
        console.log("✅ StoryController V42.0 (Decoupled) Active");
    }
};

// 自動啟動控制器 (如果是在模組加載後)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.StoryController.init();
} else {
    window.addEventListener('DOMContentLoaded', window.StoryController.init);
}