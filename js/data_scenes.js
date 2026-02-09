/* js/data_scenes.js - V79.0 (Fixed Syntax & Restored Missing Scenes) */

// ============================================================
// 0. 核心設置 (Core Setup)
// ============================================================
window._SCENE_POOL = window._SCENE_POOL || {};

// 輔助函數：註冊場景
function register(scene) {
    if (scene.id) window._SCENE_POOL[scene.id] = scene;
    return scene;
}

// ============================================================
// 1. 冒險者模式內容 (Adventurer Content)
// ============================================================

// --- A. 狼人殺 (Wolf) [已補完缺失部分] ---
const WOLF_HUB = register({
    id: 'wolf_hub',
    text: "【狼人殺：迷霧村莊】\n昨晚村長被殺了。嫌疑人有 A、B、C。\n規則：狼人說謊，好人說實話。",
    options: [
        // 審問選項：有標籤後自動消失
        { label: "審問 A", condition: { noTag: 'info_A' }, action: "node_next", nextSceneId: 'wolf_room_a' },
        { label: "審問 B", condition: { noTag: 'info_B' }, action: "node_next", nextSceneId: 'wolf_room_b' },
        { label: "審問 C", condition: { noTag: 'info_C' }, action: "node_next", nextSceneId: 'wolf_room_c' },
        // 邏輯整合
        {
            label: "💡 整合所有線索",
            condition: { hasTag: 'info_A' }, // 簡化檢查
            action: "node_next",
            nextScene: {
                text: "筆記：\n若B是狼 -> B謊 -> C是狼 (雙狼矛盾)\n若C是狼 -> C謊 -> A非狼 -> A實話 -> B是狼 (雙狼矛盾)\n結論似乎只有一個...",
                options: [{ label: "我明白了", action: "node_next", nextSceneId: 'wolf_hub' }]
            }
        },
        { label: "⚖️ 開始投票", action: "node_next", nextSceneId: 'wolf_vote' },
        { label: "離開", action: "finish_chain" }
    ]
});

// 補回房間定義，否則 Hub 會報錯
register({
    id: 'wolf_room_a',
    dialogue: [{ speaker: "A", text: "我不是狼人！B 才是狼人，我看見他半夜出門了！" }],
    options: [{ label: "紀錄證詞", action: "node_next", rewards: { tags: ['info_A'] }, nextSceneId: 'wolf_hub' }]
});
register({
    id: 'wolf_room_b',
    dialogue: [{ speaker: "B", text: "A 在說謊！C 是好人，我們昨晚一直在一起喝酒。" }],
    options: [{ label: "紀錄證詞", action: "node_next", rewards: { tags: ['info_B'] }, nextSceneId: 'wolf_hub' }]
});
register({
    id: 'wolf_room_c',
    dialogue: [{ speaker: "C", text: "我不知道誰是狼人... 但我敢發誓，A 是狼人！" }],
    options: [{ label: "紀錄證詞", action: "node_next", rewards: { tags: ['info_C'] }, nextSceneId: 'wolf_hub' }]
});

register({
    id: 'wolf_vote',
    text: "真相只有一個，請指認兇手：",
    options: [
        { 
            label: "投票給 A", 
            action: "node_next", 
            nextScene: { 
                text: "恭喜！A 是狼人 (全體邏輯閉環)。", 
                rewards: { exp: 300 }, 
                options: [{
                    label: "破案離開", 
                    action: "finish_chain",
                    rewards: { removeTags: ['info_A', 'info_B', 'info_C'] } 
                }] 
            } 
        },
        { 
            label: "投票給 B", 
            action: "node_next", 
            nextScene: { 
                text: "B 被處決了... 但他是好人。", 
                options: [{
                    label: "失敗離開", 
                    action: "finish_chain",
                    rewards: { removeTags: ['info_A', 'info_B', 'info_C'] }
                }] 
            } 
        },
        { 
            label: "投票給 C", 
            action: "node_next", 
            nextScene: { 
                text: "C 被處決了... 但他是好人。", 
                options: [{
                    label: "失敗離開", 
                    action: "finish_chain",
                    rewards: { removeTags: ['info_A', 'info_B', 'info_C'] }
                }] 
            } 
        },
        { label: "再想想", action: "node_next", nextSceneId: 'wolf_hub' }
    ]
});

// --- B. 快遞驚魂 (Delivery) ---
register({
    id: 'delivery_start',
    dialogue: [
        { speaker: "旁白", text: "雨水順著雨衣的帽簷滑落... 這裡安靜得不正常。" },
        { speaker: "你", text: "有人在嗎？快遞。" },
        { speaker: "旁白", text: "沒有回應。但我能感覺到，門後似乎有什麼東西在動..." }
    ],
    options: [{ label: "繼續等待...", action: "node_next", nextSceneId: 'delivery_choice' }]
});
register({
    id: 'delivery_choice',
    text: [
        "(備註欄寫著紅字：『必須親手交付，絕不能帶回。』)",
        "時間是晚上 11:58。還有兩分鐘。",
        "(那個燒焦的味道，似乎就是從門縫裡飄出來的...)"
    ],
    options: [
        { label: "【A】直接推門進去 (STR檢定)", check: { stat: 'STR', val: 6 }, nextSceneId: 'route_a_enter', failScene: { text: "門鎖住了，你撞不開。", options: [{label:"離開", action:"finish_chain"}]} },
        { label: "【B】大喊名字", action: "node_next", nextSceneId: 'route_b_shout' },
        { label: "【C】拍照走人", action: "node_next", nextSceneId: 'route_c_leave' }
    ]
});
register({ id: 'route_a_enter', text: "推開門，客廳擺滿了顯示雜訊的電視機...", options: [{label:"離開", action:"finish_chain"}] });
register({ id: 'route_b_shout', text: "隔壁老太太探出頭：「那個人已經死了三天了！」", options: [{label:"離開", action:"finish_chain"}] });
register({ id: 'route_c_leave', text: "你試圖下樓，卻發現一直在四樓鬼打牆...", options: [{label:"離開", action:"finish_chain"}] });

// --- C. 海龜湯 (Turtle Soup) ---
const TURTLE_HUB = register({
    id: 'turtle_hub',
    text: "【海龜湯：半碗牛肉麵】\n題目：一個盲人去吃牛肉麵，吃到一半突然痛哭，然後自殺了。\n請調查線索還原真相。",
    options: [
        { label: "🔍 調查桌面", action: "investigate", result: "桌上除了半碗麵，還有灑落一地的**蔥花**。" },
        { label: "🔍 詢問老闆", action: "investigate", result: "老闆：「那個人說不要蔥，但我太忙忘記了，還是加了滿滿的蔥。」" },
        { 
            label: "💡 我知道真相了 (揭曉)", 
            action: "node_next", 
            nextScene: {
                text: "真相：\n盲人以前有個女友。女友曾騙他說「我也愛吃蔥」，把肉都夾給他，自己吃蔥。\n盲人吃到蔥花，驚覺當年女友其實是在受苦，或者驚覺這碗麵的味道和當年女友做的一樣（暗示女友已死或已離開），悲從中來。",
                rewards: { exp: 50 },
                options: [{ label: "真是個悲傷的故事...", action: "finish_chain" }]
            }
        },
        { label: "離開", action: "finish_chain" }
    ]
});

// --- D. 密室逃脫 (Escape Room) ---
const ROOM_HUB = register({
    id: 'room_hub',
    text: "【密室逃脫：煉金術士的牢房】\n你被關在一個潮濕的石室裡。面前有一扇厚重的鐵門。",
    options: [] 
});

const ROOM_DOOR = register({
    id: 'room_door',
    text: "這扇門鎖得很緊。鎖孔呈現奇特的六角形。",
    options: [
        { label: "嘗試撞開 (STR 8)", check: { stat: 'STR', val: 8 }, nextScene: { text: "門紋絲不動，你的肩膀倒是腫了。", options: [{label:"返回", action:"node_next", nextSceneId:'room_hub'}] }, failScene: { text: "根本撞不動。", options: [{label:"返回", action:"node_next", nextSceneId:'room_hub'}] } },
        { label: "返回", action: "node_next", nextSceneId: 'room_hub' }
    ]
});

const ROOM_BED = register({
    id: 'room_bed',
    text: "一張破舊的草蓆。掀開草蓆，你發現下面有一塊鬆動的石磚。",
    options: [
        { 
            label: "撬開石磚", 
            condition: { noTag: 'has_key' }, 
            action: "node_next", 
            nextScene: {
                text: "你在石磚下發現了一把【生鏽的六角鑰匙】！",
                options: [
                    { label: "拿走鑰匙", action: "node_next", rewards: { tags: ['has_key'] }, nextSceneId: 'room_hub' }
                ]
            }
        },
        { label: "什麼都沒有了", condition: { hasTag: 'has_key' }, action: "node_next", nextSceneId: 'room_hub' },
        { label: "返回", action: "node_next", nextSceneId: 'room_hub' }
    ]
});

ROOM_HUB.options = [
    { label: "🚪 查看鐵門", action: "node_next", nextSceneId: 'room_door' },
    { label: "🛏️ 檢查床鋪", action: "node_next", nextSceneId: 'room_bed' },
    { 
        label: "🔑 使用鑰匙開門", 
        condition: { hasTag: 'has_key' }, 
        action: "node_next", 
        nextScene: {
            text: "咔嚓一聲，鐵門應聲而開！自由的空氣湧了進來。",
            rewards: { exp: 100, removeTags: ['has_key'] },
            options: [{ label: "逃離密室", action: "finish_chain" }]
        }
    },
    { label: "放棄並呼救", action: "finish_chain" }
];

// ============================================================
// 2. 后宮模式內容 (Harem Mode)
// ============================================================
register({
    id: 'harem_root',
    entry: true,
    text: "【皇宮寢殿】\n柔和的晨光透過紗簾灑在床上。這裡是你的帝國，也是你的溫柔鄉。",
    options: [
        { label: "召喚女僕長", action: "node_next", nextSceneId: 'harem_maid_intro' },
        { label: "前往花園", action: "node_next", nextSceneId: 'harem_garden' },
        { label: "批閱奏摺 (獲得金幣)", action: "node_next", nextScene: { text: "你勤勉地工作了一上午。", rewards: { gold: 50 }, options: [{label:"返回", action:"node_next", nextSceneId:'harem_root'}] } },
        { label: "(DEBUG) 返回冒險者大廳", action: "node_next", nextSceneId: 'root_hub' }
    ]
});

register({
    id: 'harem_maid_intro',
    dialogue: [
        { speaker: "女僕長", text: "陛下，您醒了。今日要先更衣，還是先用膳？" },
        { speaker: "你", text: "先更衣吧。" },
        { speaker: "旁白", text: "女僕長輕手輕腳地為你披上皇袍，指尖若有似無地劃過你的胸膛。" }
    ],
    options: [
        { label: "調戲她", action: "node_next", nextScene: { text: "她臉紅了，但沒有反抗。", options: [{label:"返回寢殿", action:"node_next", nextSceneId:'harem_root'}] } },
        { label: "保持威嚴", action: "node_next", nextSceneId: 'harem_root' }
    ]
});

register({
    id: 'harem_garden',
    text: "御花園中百花盛開。你似乎聽到了遠處傳來的琴聲。",
    options: [
        { label: "尋找琴聲來源", action: "node_next", nextScene: { text: "是新來的寵妃在練琴。", options: [{label:"打賞", action:"node_next", nextSceneId:'harem_root'}] } },
        { label: "返回寢殿", action: "node_next", nextSceneId: 'harem_root' }
    ]
});

// ============================================================
// 3. 機械公元內容 (Machine Mode) [FIXED]
// ============================================================
register({
    id: 'machine_root',
    entry: true,
    onEnter: { 
        varOps: [
            { key: 'time_left', val: 5, op: 'set', msg: '⏳ 系統連結剩餘時間: 5' }, 
            { key: 'hack_progress', val: 0, op: 'set' } 
        ]
    },
    // [Fix] 移除了多餘的 text: 標籤
    text: "【系統重啟...】\n你已接入企業伺服器。\n剩餘連接時間：{time_left} 單位\n破解進度：{hack_progress}%",
    options: [
        { 
            label: "暴力破解 (消耗 1 時間)", 
            condition: { var: { key: 'time_left', val: 1, op: '>=' } }, 
            action: "node_next", 
            rewards: { 
                varOps: [
                    { key: 'time_left', val: 1, op: '-' },
                    { key: 'hack_progress', val: 20, op: '+' }
                ] 
            },
            nextSceneId: 'machine_root' 
        },
        { 
            label: "植入病毒 (消耗 2 時間)", 
            condition: { var: { key: 'time_left', val: 2, op: '>=' } },
            action: "node_next", 
            rewards: { 
                varOps: [
                    { key: 'time_left', val: 2, op: '-' },
                    { key: 'hack_progress', val: 50, op: '+' }
                ] 
            },
            nextSceneId: 'machine_root'
        },
        {
            label: "斷開連接 (結算)", 
            action: "node_next", 
            nextSceneId: 'machine_result'
        }
    ]
});

register({
    id: 'machine_result',
    text: "正在結算你的駭客成果...",
    options: [
        {
            label: "查看結果",
            condition: { var: { key: 'hack_progress', val: 100, op: '>=' } },
            nextScene: { text: "完美入侵！你獲得了所有資料。", rewards: { gold: 100 }, options: [{label:"離開", action:"finish_chain"}] }
        },
        {
            label: "查看結果",
            condition: { var: { key: 'hack_progress', val: 100, op: '<' } },
            nextScene: { text: "入侵不完整，只獲得了部分垃圾數據。", rewards: { gold: 10 }, options: [{label:"離開", action:"finish_chain"}] }
        }
    ]
});

// ============================================================
// 4. 入口配置 (SCENE_DB)
// ============================================================
window.SCENE_DB = {
    'adventurer': [
        {
            id: 'root_hub',
            entry: true,
            text: "【命運大廳】\n無數的時間線在你面前交織，請選擇你的旅程：",
            options: [
                { label: "📦 快遞驚魂 (懸疑)", action: "node_next", nextSceneId: 'delivery_start' },
                { label: "🐺 狼人殺 (推理)", action: "node_next", nextSceneId: 'wolf_hub' },
                { label: "🐢 海龜湯 (解謎)", action: "node_next", nextSceneId: 'turtle_hub' },
                { label: "🔒 密室逃脫 (探索)", action: "node_next", nextSceneId: 'room_hub' },
                { label: "🎲 無盡隨機冒險", action: "node_next", nextSceneId: 'GEN_MODULAR' },
                { label: "--- 模式切換測試 ---", action: "investigate", result: "請選擇要預覽的模式入口：" },
                { label: "🚀 跳轉：機械公元", action: "node_next", nextSceneId: 'machine_root', style: 'primary' },
                { label: "💕 跳轉：后宮帝國", action: "node_next", nextSceneId: 'harem_root', style: 'primary' }
            ]
        }
    ],
    'harem': [ { id: 'harem_root', entry: true } ],
    'machine': [ { id: 'machine_root', entry: true } ]
};

register(window.SCENE_DB['adventurer'][0]);