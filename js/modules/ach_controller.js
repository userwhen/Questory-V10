/* js/modules/ach_controller.js - Ach Controller (Fixed & Merged) */
window.AchController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act (包含新的領取邏輯)
        Object.assign(window.act, {
            // CRUD
            submitAchievement: () => AchEngine.submitAchievement(),
            
            deleteAchievement: (id) => {
                sys.confirm("確定刪除此成就？", () => {
                    AchEngine.deleteAchievement(id);
                    // 刪除後刷新視圖
                    if(window.taskView) taskView.render(); 
                });
            },
            
            // 編輯與新增
            editAch: (id) => window.EventBus.emit(E.Ach.EDIT_MODE, { achId: id }),
            createAch: () => window.EventBus.emit(E.Ach.EDIT_MODE, { achId: null }), 
            
            // --- [新增] 兩段式領取邏輯 ---
            
            // 第一階段：點擊「完成」 -> 變身為「領取」
            preClaimAch: (id, btn) => {
                // 1. 變更按鈕樣式 (綠 -> 黃)
                btn.style.background = '#fbc02d'; // 黃色
                btn.style.color = '#333'; // 深色文字
                btn.innerHTML = '🎁 領取'; // 變更文字
                
                // 2. 變更點擊行為 (指向真正的領取函式)
                // 注意：這裡再次加入 stopPropagation 防止冒泡打開詳情
                btn.onclick = (e) => { e.stopPropagation(); act.claimAch(id); };
                
                // 3. 震動回饋 (增加期待感)
                if(navigator.vibrate) navigator.vibrate(50);
            },

            // 第二階段：真正的領取處理
            claimAch: (id) => {
                const gs = window.GlobalState;
                const ach = gs.achievements.find(a => a.id === id);
                
                if (ach && !ach.claimed) {
                    // 1. 標記領取
                    ach.claimed = true;
                    ach.claimedAt = new Date().toISOString();
                    
                    // 2. 發放獎勵 (範例：發金幣)
                    const rewardGold = parseInt(ach.rewards?.gold || 0);
                    if(rewardGold > 0) {
                        gs.gold = (gs.gold || 0) + rewardGold;
                    }

                    // 3. 存檔
                    App.saveData();
                    
                    // 4. 回饋與刷新
                    act.toast(`🎉 成功領取：${ach.title} (+${rewardGold}G)`);
                    if(navigator.vibrate) navigator.vibrate([100, 50, 100]); // 雙重震動
                    
                    // 刷新列表 (領取後通常會從列表中消失，進入殿堂)
                    if(window.taskView) taskView.render();
                }
            },

            // 保留原本的 claim 接口以防萬一，但導向新的 claimAch
            claim: (id) => act.claimAch(id)
        });

        // B. 監聽導航
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'milestone') {
                 if(window.taskView && taskView.renderMilestonePage) taskView.renderMilestonePage();
            }
        });

        // C. 監聽編輯模式
        EventBus.on(E.Ach.EDIT_MODE, (data) => {
            // 統一由 View 層處理表單渲染
            // 假設您的成就表單渲染函式在 view 或 taskView 中
            if(window.view && view.renderCreateAchForm) view.renderCreateAchForm(data.achId);
        });

        // D. 監聽數據變動 (自動檢查成就條件)
        EventBus.on(E.Task.COMPLETED, (data) => {
            if(window.AchEngine) AchEngine.checkConditions('TASK_COMPLETED', data);
        });
        EventBus.on(E.Stats.UPDATED, () => {
            if(window.AchEngine) AchEngine.checkConditions('STATS_UPDATED', {});
        });

        // E. 監聽自身更新 (當成就達成或數據變更時，刷新列表)
        EventBus.on(E.Ach.UPDATED, () => {
            if (window.TempState.currentView === 'tasks' && window.TempState.taskTab === 'ach') {
                if(window.taskView && taskView.render) taskView.render(false);
            }
        });

        console.log("✅ AchController (成就) 模組就緒");
    }
};