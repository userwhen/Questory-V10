/* js/modules/avatar_controller.js - Avatar Controller */
window.AvatarController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // A. 橋接 act
        Object.assign(window.act, {
            previewAvatarItem: (id) => AvatarEngine.previewItem(id),
            wearAvatarItem: (id) => AvatarEngine.wearItem(id),
            buyAvatarItem: (id) => AvatarEngine.buyItem(id)
        });

        // B. 監聽導航
        EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'avatar') {
                // 重要：先初始化 Session (建立預覽暫存)，再渲染
                AvatarEngine.initSession(); 
                avatarView.render();
            }
        });

        // C. 監聽數據更新
        EventBus.on(E.Avatar.UPDATED, () => {
            if (window.TempState.currentView === 'avatar') {
                // 這裡可以做更細緻的局部刷新 (例如只刷新舞台或衣櫃)
                // 為了簡單穩固，我們先刷新整個舞台與衣櫃內容
                avatarView.renderStage();
                avatarView.renderWardrobe();
            }
        });

        console.log("✅ AvatarController (換裝) 模組就緒");
    }
};