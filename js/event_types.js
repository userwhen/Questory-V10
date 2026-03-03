/* js/event_types.js - V43.0 Centralized Event Dictionary */

// 1. 定義所有事件常數 (Event Constants)
window.SQ = window.SQ || {}; window.SQ.Events = {
    System: {
        INIT: 'sys:init',
        NAVIGATE: 'sys:navigate',       // 頁面切換
        TOAST: 'sys:toast',             // 顯示提示
        MODAL_OPEN: 'sys:modal_open',   // 開啟視窗
        MODAL_CLOSE: 'sys:modal_close', // 關閉視窗
        CONFIRM: 'sys:confirm',         // 確認對話框
        SAVE: 'sys:save',               // 觸發存檔
        DAILY_RESET: 'sys:daily_reset'  // 統一換日廣播
    },
    // [V43] 將 Story 動作正式收編到全域字典
    Action: {
        ENTER_STORY_MODE: 'action_enter_story_mode',
        EXPLORE: 'action_explore',
        MAKE_CHOICE: 'action_make_choice',
        SET_LANG: 'action_set_lang',
        TOGGLE_DRAWER: 'action_toggle_drawer',
        SET_TAG_FILTER: 'action_set_tag_filter',
        RESUME_STORY: 'action_resume_story',
        ABANDON_STORY: 'action_abandon_story'
    },
    Task: {
        CREATED: 'task:created',
        UPDATED: 'task:updated',        // 列表刷新
        DELETED: 'task:deleted',
        COMPLETED: 'task:completed',    // Payload: { task, impact }
        UNCOMPLETED: 'task:uncompleted',// 取消完成 Payload: { task }
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
        LEVEL_UP: 'stats:level_up',     // 升級特效用
        SKILL_MAXED: 'stats:skill_maxed'
    },
    Story: {
        UPDATED: 'story:updated',       // 精力變更
        SCENE_START: 'story:scene_start',
        SCENE_PLAYED: 'story:scene_played', // 播放卡片
        SCENE_END: 'story:scene_end',
        ENTERED: 'story:entered',        
        RENDER_IDLE: 'story:render_idle',
        REFRESH_VIEW: 'story:refresh_view'
    },
    Ach: {
        UPDATED: 'ach:updated',         // 成就列表變更 (進度更新)
        UNLOCKED: 'ach:unlocked',       // 成就達成/解鎖 (特效用)
        EDIT_MODE: 'ach:edit_mode'      // 打開里程碑編輯 
    },
    Settings: {
        UPDATED: 'settings:updated',
        MODE_CHANGED: 'settings:mode_changed' // 模式切換 
    },
    Avatar: {
        UPDATED: 'avatar:updated'
    }
};

window.SQ.Events = window.SQ.Events;