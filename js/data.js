/* js/data.js - V6.0 Unified Config & Default State */

// ==========================================
// 1. 玩家初始預設存檔 (Default State)
// 供 core.js 在建立新玩家時複製使用
// ==========================================
window.DefaultData = {
    name: 'Commander', 
    gold: 0, freeGem: 0, paidGem: 0, lv: 1, exp: 0,
    loginStreak: 0, lastLoginDate: new Date().toDateString(),
    
    // [與 stats.js 對齊] 統一使用大寫 KEY 與最新中文名稱
    attrs: { 
        STR: {name:'體能', v:1, exp:0, icon:'💪'}, 
        INT: {name:'思考', v:1, exp:0, icon:'🧠'}, 
        AGI: {name:'技術', v:1, exp:0, icon:'🛠️'}, 
        CHR: {name:'魅力', v:1, exp:0, icon:'✨'}, 
        VIT: {name:'創造', v:1, exp:0, icon:'🎨'}, 
        LUK: {name:'經營', v:1, exp:0, icon:'💼'} 
    },
    
    skills: [], archivedSkills: [], 
    tasks: [], achievements: [], milestones: [], history: [], bag: [],
    
    // [與 story.js 對齊] 劇情系統基礎狀態
    story: { energy: 30, tags: [], vars: {}, flags: {}, learning: {}, chain: null, currentNode: null },
    
    // [與 avatar.js 對齊] 紙娃娃系統基礎狀態
    avatar: { gender: 'm', unlocked: ['adventurer_m'], wearing: { suit: 'adventurer_m' } }, 
    
    // 商店自訂商品
    shop: { user: [] }, 
    
    settings: {
    mode: 'adventurer',
    calMode: false,
    calMax: 2000,
    strictMode: false,
    // 通知
    notificationEnabled: false,
    notifyDailyHour: 9,
    notifyDailyMinute: 0,
    notifyStreakHour: 21,
    notifyStreakMinute: 0,
    notifyDeadline: true,
    // 音效
    soundEnabled: true,
    musicEnabled: false,
    vibrationEnabled: true,
    volume: 0.7
	},
    unlocks: { basic: true, feature_cal: false, feature_strict: false },
    cal: { today: 0, logs: [] },
    taskCats: ['每日', '運動', '工作', '待辦', '願望']
};

// ==========================================
// 2. 遊戲靜態配置中心 (Game Configuration)
// 供各個模組讀取的唯讀設定 (不存入存檔)
// ==========================================
window.GameConfig = window.GameConfig || {};

// 系統常數
window.GameConfig.System = {
    SaveKey: 'Levelife_Save_V1', // [與 main.js 對齊] 統一管理存檔名稱
    SaveInterval: 5000 
};

// 紙娃娃商店列表 [與 avatar.js 的 ID 對齊]
window.GameConfig.AvatarShop = [
    { id: 'adventurer_m', name: '冒險者 (男)', price: 0, type: 'suit' },
    { id: 'adventurer_f', name: '冒險者 (女)', price: 0, type: 'suit' }, 
    { id: 'harem_m', name: '後宮 (男)', price: 150, type: 'suit' },
    { id: 'harem_f', name: '後宮 (女)', price: 150, type: 'suit' }
];
// 資源路徑配置 (Assets)
window.GameConfig.Assets = {
    basePath: 'img/',
    defExt: '.png',
    fallback: '🧚',
    avatars: { 
        adventurer: { m: 'adventurer_m', f: 'adventurer_f' }, 
        harem: { m: 'harem_m', f: 'harem_f' }, 
        basic: { m: 'adventurer_m', f: 'adventurer_f' } 
    }
};

// 技能與屬性配置 (Stats)
window.GameConfig.Stats = {
    skillLimit: 10,
    newSkillReward: { freeGem: 50, exp: 500 }
};

// 新手教學文案 (Tutorial)
window.GameConfig.Tutorial = {
    guideNpc: '🧚',
    step0_intro: { title: '✨ 歡迎來到 LevLife', desc: '我是你的引導小精靈。\n首先，請告訴我你的名字？', placeholder: '輸入暱稱...', btn: '確認' },
    step0_avatar: { title: '建立角色外觀', desc: '請選擇一個喜歡的形象', btn: '確認形象' },
    step1_lobby: { text: '點擊「角色立繪」\n查看你的屬性狀態。' },
    step1_addSkill: { text: '這是你的屬性面板。\n現在，點擊 [+ 新增] 來建立第一個技能！' },
    step2_navTask: { text: '太棒了！\n現在點擊下方的 [任務] 分頁。' },
    step2_addTask: { text: '點擊右下角的 [+] 按鈕\n新增一項每日任務。', modalHint: '輸入任務標題並點擊儲存' },
    step2_complete: { text: '試著完成剛剛建立的任務。\n(點擊左側圓圈)' },
    step3_navShop: { text: '完成任務獲得了金幣！\n我們去商店看看吧。' },
    step3_buyFail: { text: '這裡有很多神奇的道具。\n試著購買「易名契約」或「幻形面具」！', dialog: '哇！忘記你現在身上沒有鑽石呢...\n(點擊下方按鈕去賺點外快)', btn: '前往成就' },
    step4_addAch: { text: '我們來這裡領取特別獎勵。\n先點擊 [+] 新增一個成就。', modalHint: '隨便建立一個成就\n(例如：第一次探索)' },
    step4_claim: { text: '點擊按鈕完成它！', dialogReward: '恭喜完成第一個成就！\n抱歉剛剛造成你的困擾~\n這是給我補給你的特別獎勵 💎100！', dialogDone: '恭喜完成成就！\n(你已經領過新手禮包囉，這次就不重複發送了)', btn: '太棒了', btnContinue: '繼續' },
    step5_realBuy: { text: '現在有錢了！\n把剛剛想買的東西買下來吧！', success: '購買成功！\n物品已放入背包。' },
    step6_end: { dialog: '🎉 新手教學完成！\n\n你可以自由探索了。\n記得每天回來完成任務喔！', btn: '開始冒險' },
    restartConfirm: "重看教學？(不會重置角色進度)"
};
window.SQ = window.SQ || {};
window.SQ.Default = window.DefaultData;
window.SQ.Config = window.GameConfig;