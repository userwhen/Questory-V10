/* js/modules/avatar_controller.js - Avatar Controller */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Avatar = {
	_initialized: false,
    init: function() {
        const E = window.SQ.Events;
        if (!window.SQ.EventBus || !E) return;

        // A. 橋接 act
        Object.assign(window.SQ.Actions, {
            previewAvatarItem: (id) => window.SQ.Engine.Avatar.previewItem(id),
            wearAvatarItem: (id) => window.SQ.Engine.Avatar.wearItem(id),
            buyAvatarItem: (id) => window.SQ.Engine.Avatar.buyItem(id)
        });

        // B. 監聽導航
        window.SQ.EventBus.on(E.System.NAVIGATE, (pageId) => {
            if (pageId === 'avatar') {
                // 重要：先初始化 Session (建立預覽暫存)，再渲染
                window.SQ.Engine.Avatar.initSession(); 
                window.SQ.View.Avatar.render();
            }
        });

        // C. 監聽數據更新
        window.SQ.EventBus.on(E.Avatar.UPDATED, () => {
            if (window.SQ.Temp.currentView === 'avatar') {
                // 這裡可以做更細緻的局部刷新 (例如只刷新舞台或衣櫃)
                // 為了簡單穩固，我們先刷新整個舞台與衣櫃內容
                window.SQ.View.Avatar.renderStage();
                window.SQ.View.Avatar.renderWardrobe();
            }
        });

        console.log("✅ AvatarController (換裝) 模組就緒");
    }
};
window.AvatarController = window.SQ.Controller.Avatar;