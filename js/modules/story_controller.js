/* js/modules/story_controller.js - V41.1 (Engine V41 Adapter) */

window.StoryController = {
    init: function() {
        if (!window.EventBus) return;
        
        // 確保引擎已就緒
        if (window.StoryEngine && window.StoryEngine.init) {
            window.StoryEngine.init();
        }
        
        const E = window.EVENTS || {};

        // 綁定 window.act 供 HTML 按鈕呼叫
        Object.assign(window.act, {
            
            // 1. 進入劇情模式
            enterStoryMode: () => {
                if (window.act.navigate) act.navigate('story');
                // 確保進入時刷新一次介面
                if (window.view && view.updateStoryHUD) view.updateStoryHUD();
            },

            // 2. [Critical Fix] 探索功能
            explore: () => {
                // 呼叫引擎
                const res = window.StoryEngine.explore();
                
                // 處理回傳結果
                if (res && !res.success) {
                    // 如果失敗 (例如精力不足)，顯示提示
                    if (window.act.toast) act.toast(res.msg || '無法探索');
                } else {
                    // 成功時，引擎會自動處理渲染，Controller 不需介入
                    // 僅需更新 HUD
                    if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
                }
            },
            
            // 3. [Critical Fix] 選項點擊
            // 這是修復「沒反應」的關鍵！
            choice: (idx) => {
                // V41 引擎必須使用 selectOption 來處理索引
                if (window.StoryEngine && window.StoryEngine.selectOption) {
                    window.StoryEngine.selectOption(idx);
                } else {
                    console.error("❌ StoryEngine.selectOption 未定義！請確認引擎版本。");
                }

                // 點擊後更新頂部數值 (金幣/精力)
                if (window.view && view.updateHUD) view.updateHUD(window.GlobalState);
            },
            
            // 4. 語言切換
            setLang: (lang) => {
                if (window.StoryEngine) window.StoryEngine.setLang(lang);
                
                const label = { 'zh': '中文', 'en': 'English', 'jp': '日本語', 'mix': '混合' };
                if (window.act.toast) act.toast(`🌐 語言已切換為 ${label[lang] || lang}`);
                
                // 如果當前有顯示劇情，嘗試重新渲染文本 (可選)
                if (window.TempState && window.TempState.storyCard) {
                    // 這裡不強制重繪，以免打字機效果重跑
                }
            },
            
            // 5. Tag 抽屜開關
            toggleTagDrawer: (forceState) => {
                const current = window.TempState.isTagDrawerOpen || false;
                const nextState = (typeof forceState === 'boolean') ? forceState : !current;
                window.TempState.isTagDrawerOpen = nextState;
                if (window.storyView && storyView.render) storyView.render();
            },
            
            // 6. Tag 過濾器
            setTagFilter: (val) => {
                window.TempState.tagFilter = val;
                if (window.storyView) storyView.render();
            },
        });

        // 監聽頁面切換事件
        if (E.System && E.System.NAVIGATE) {
            EventBus.on(E.System.NAVIGATE, (pageId) => {
                if (pageId === 'story') {
                    if (window.storyView) storyView.render();
                }
            });
        }
        
        console.log("✅ StoryController V41.1 (Engine Adapter) Active");
    }
};

// 自動啟動控制器 (如果是在模組加載後)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.StoryController.init();
} else {
    window.addEventListener('DOMContentLoaded', window.StoryController.init);
}