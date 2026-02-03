/* js/event_bus.js - V35.0 Event System */

// 1. 定義所有事件常數 (Event Constants)
window.EVENTS = {
    System: {
        INIT: 'sys:init',
        NAVIGATE: 'sys:navigate',       // 頁面切換
        TOAST: 'sys:toast',             // 顯示提示
        MODAL_CLOSE: 'sys:modal_close', // 關閉視窗
        CONFIRM: 'sys:confirm',         // 確認對話框
        SAVE: 'sys:save'                // 觸發存檔
    },
    Task: {
        CREATED: 'task:created',
        UPDATED: 'task:updated',        // 列表刷新
        DELETED: 'task:deleted',
        COMPLETED: 'task:completed',    // Payload: { task, impact }
        FAILED: 'task:failed',          // Payload: { task }
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
        SKILL_EDIT_MODE: 'stats:skill_edit',
        LEVEL_UP: 'stats:level_up'      // [建議新增] 升級特效用
    },
    Story: {
        UPDATED: 'story:updated',       // 精力變更
        SCENE_START: 'story:scene_start',
        SCENE_PLAYED: 'story:scene_played', // 播放卡片
        SCENE_END: 'story:scene_end'
    },
    Ach: {
        UPDATED: 'ach:updated',         // 成就列表變更 (進度更新)
        UNLOCKED: 'ach:unlocked',       // [New] 成就達成/解鎖 (特效用)
        EDIT_MODE: 'ach:edit_mode'      // 打開里程碑編輯 (新增監聽目標)
    },
    Settings: {
        UPDATED: 'settings:updated',
        MODE_CHANGED: 'settings:mode_changed' // [New] 模式切換 (重繪整個 App)
    },
    Avatar: {
        UPDATED: 'avatar:updated'
    }
};