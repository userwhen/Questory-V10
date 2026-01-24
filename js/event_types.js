// 1. 定義所有事件常數 (Event Constants)
window.EVENTS = {
    System: {
        INIT: 'sys:init',
        NAVIGATE: 'sys:navigate',       // 頁面切換
        TOAST: 'sys:toast',             // 顯示提示
        MODAL_CLOSE: 'sys:modal_close', // 關閉視窗
        CONFIRM: 'sys:confirm'          // 確認對話框
    },
    Task: {
        CREATED: 'task:created',
        UPDATED: 'task:updated',        // 列表刷新
        DELETED: 'task:deleted',
        COMPLETED: 'task:completed',
        EDIT_MODE: 'task:edit_mode',    // 打開編輯窗
        FORM_UPDATE: 'task:form_update' // 表單內容變更
    },
    Shop: {
        UPDATED: 'shop:updated',        // 商店數據變更
        BAG_UPDATED: 'shop:bag_updated',// 背包變更
        OPEN_BUY: 'shop:open_buy',
        OPEN_DETAIL: 'shop:open_detail'
    },
    Stats: {
        UPDATED: 'stats:updated',       // 屬性/金幣/等級變更
        SKILL_EDIT_MODE: 'stats:skill_edit'
    },
    Story: {
        UPDATED: 'story:updated',       // 精力變更
        SCENE_START: 'story:scene_start',
        SCENE_PLAYED: 'story:scene_played', // 播放卡片
        SCENE_END: 'story:scene_end'
    },
    // ✅ [補齊] 成就系統事件
    Ach: {
        UPDATED: 'ach:updated',         // 成就列表變更
        EDIT_MODE: 'ach:edit_mode'      // 打開成就編輯
    },
    // ✅ [補齊] 設定系統事件
    Settings: {
        UPDATED: 'settings:updated'
    },
    // ✅ [補齊] 換裝系統事件
    Avatar: {
        UPDATED: 'avatar:updated'
    }
};