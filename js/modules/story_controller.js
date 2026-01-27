/* js/modules/story_controller.js - V35.18 (Fix Error & Drawer Logic) */

window.StoryController = {
    init: function() {
        if (!window.EventBus) return;
        if (window.StoryEngine) StoryEngine.init();
        const E = window.EVENTS;

        Object.assign(window.act, {
            // [Fix] 修復 index.html 呼叫報錯
            enterStoryMode: () => {
                act.navigate('story');
            },

            // 探索
            explore: () => {
                const res = StoryEngine.explore();
                if (res.success) {
                    if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
                    
                    // [建議加入] 探索成功後，立即渲染新劇情
                    if (window.storyView && window.TempState.storyCard) {
                        storyView.renderScene(window.TempState.storyCard);
                    }
                } else {
                    act.toast(res.msg || '精力不足！');
                    // ...
                }
            },
            
            // 選擇
            choice: (idx) => {
                StoryEngine.makeChoice(idx);
                if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
            },
            
            // 語言
            setLang: (lang) => {
                if (!window.GlobalState.settings) window.GlobalState.settings = {};
                window.GlobalState.settings.targetLang = lang;
                act.toast(`語言已切換: ${lang}`);
                if (window.TempState.storyCard) storyView.renderScene(window.TempState.storyCard);
            },
            
            // [Fix] Tag 抽屜開關 (配合 ui.layout.drawer 的 toggle 機制)
            toggleTagDrawer: (forceState) => {
                // 如果傳入布林值就用傳入的，否則反轉當前狀態
                const current = window.TempState.isTagDrawerOpen || false;
                const nextState = (typeof forceState === 'boolean') ? forceState : !current;
                
                window.TempState.isTagDrawerOpen = nextState;
                
                // 重新渲染 View 以更新抽屜位置
                if (window.storyView && storyView.render) storyView.render();
            },
			
			setTagFilter: (val) => {
                window.TempState.tagFilter = val;
                // 重新渲染介面以更新按鈕選取狀態
                if (window.storyView) storyView.render();
            },
        });

        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'story') {
                if (window.storyView) storyView.render();
            }
        });
        console.log("✅ StoryController Active");
    }
};