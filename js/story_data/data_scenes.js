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
        { speaker: "旁白", text: "zh:{atom_weather}，雨水順著雨衣的帽簷滑落... 這裡安靜得不正常。" },
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
        "(那個{atom_smell}的味道，似乎就是從門縫裡飄出來的...)"
    ],
    options: [
        // 補上 action: "node_next"
        { label: "直接推門進去 (STR檢定)", action: "node_next", check: { stat: 'STR', val: 6 }, nextSceneId: 'route_a_enter', failScene: { text: "門鎖住了，你撞不開。", options: [{label:"離開", action:"finish_chain"}]} },
        { label: "大喊名字", action: "node_next", nextSceneId: 'route_b_shout' },
        { label: "拍照走人", action: "node_next", nextSceneId: 'route_c_leave' }
    ]
});

register({ 
    id: 'route_a_enter', 
    // 補上 speaker: "旁白"
    dialogue: [
        { speaker: "旁白", text: "推開門，客廳擺滿了顯示雜訊的電視機..." },
        { speaker: "旁白", text: "不祥的預感讓你渾身寒顫，" },
        { speaker: "旁白", text: "餘光中，一雙乾枯腐敗，如同枯骨的手從黑暗緩緩伸出..." }
    ],  
    options: [
        // 補上 action: "node_next"
        { label: "奮力開門逃跑 (STR檢定)", action: "node_next", check: { stat: 'STR', val: 6 }, nextSceneId: 'leave01', failScene: { text: "門鎖住了，你撞不開。", options: [{ label: "無助的等候死亡", action: "node_next", nextSceneId: 'dead01' }]}},
        { label: "無助的等候死亡", action: "node_next", nextSceneId: 'dead01' }
    ]
});

register({ 
    id: 'route_b_shout',
    // 補上 speaker
    dialogue: [
        { speaker: "隔壁老太太", text: "那個人已經死了三天了！" },
        { speaker: "旁白", text: "不祥的預感讓你渾身寒顫，" },
        { speaker: "旁白", text: "那麼從門內傳來的陣陣詭異笑聲是...?" }
    ],
    options: [
        { label: "恐懼抓住你的腳步，但你深知這裡並不宜久留...", action: "node_next", nextSceneId: 'leave01' }
    ]
});
        
register({ 
    id: 'route_c_leave', 
    text: "你試圖下樓，卻發現一直在四樓鬼打牆...", 
    options: [{label:"加快腳步離開", action: "node_next", nextSceneId: 'leave01' }] 
});

register({ 
    id: 'dead01', 
    text: "你雙眼緊閉，祈禱著痛苦能快點過去...", 
    options: [{label:"結束一切", action:"finish_chain"}] 
});

register({ 
    id: 'leave01', 
    text: "腎上腺素幫助你逃離了令人恐懼的老舊國宅...", 
    options: [{label:"離開這裡", action:"finish_chain"}] 
});

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
// 2. 后宮模式 2.0 - 好感度階段與養成
// ============================================================

// [A. 入口] 確保變數初始化
register({
    id: 'harem_root',
    entry: true,
    onEnter: {
        // 如果變數不存在，設為 0；如果存在，保持原值 (Engine V78 的 varOps 若無特殊邏輯可能需注意)
        // 簡單做法：這裡是 Hub，不要在這裡重置變數。
        // 我們假設變數已經存在，或者在第一次互動時檢查。
        // 若要初始化，建議建立一個只跑一次的 'harem_init' 場景，類似 machine_entry
    },
    text: "【皇宮寢殿】\n這裡是你的後宮，你可以選擇與誰共度時光。",
    options: [
        { label: "召喚女僕長", action: "node_next", nextSceneId: 'harem_maid_intro' },
        
        // [重點] 連結到養成循環
        { 
            label: "💕 與女僕長互動 (養成)", 
            action: "node_next", 
            nextSceneId: 'harem_interaction_loop' 
        },
        
        { label: "前往花園", action: "node_next", nextSceneId: 'harem_garden' },
        { label: "返回大廳", action: "node_next", nextSceneId: 'root_hub' }
    ]
});

// [補回] 遺失的女僕介紹場景
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

// [補回] 遺失的花園場景
register({
    id: 'harem_garden',
    text: "御花園中百花盛開。你似乎聽到了遠處傳來的琴聲。",
    options: [
        { label: "尋找琴聲來源", action: "node_next", nextScene: { text: "是新來的寵妃在練琴。", options: [{label:"打賞", action:"node_next", nextSceneId:'harem_root'}] } },
        { label: "返回寢殿", action: "node_next", nextSceneId: 'harem_root' }
    ]
});

// [B. 養成循環] 階段式互動
register({
    id: 'harem_interaction_loop',
    // 這裡我們假設 maid_love 已經初始化 (若無則顯示 0)
    // 為了安全，可以在這裡加一個 onEnter 檢查 (需引擎支援 "add 0" 來確保 key 存在)
    onEnter: { varOps: [{ key: 'maid_love', val: 0, op: '+' }] }, 
    
    text: "女僕長正安靜地站在一旁。\n(💓 目前好感度: {maid_love})",
    options: [
        // --- 階段 1: 陌生 (好感 0-29) ---
        {
            label: "💬 閒聊 (+2 好感)",
            // 沒有門檻，隨時可做
            action: "node_next",
            rewards: { varOps: [{ key: 'maid_love', val: 2, op: '+' }] },
            nextScene: { 
                text: "你和她聊了聊天氣。\n她禮貌地回應了你。", 
                options: [{label:"繼續", action:"node_next", nextSceneId:'harem_interaction_loop'}] 
            }
        },

        // --- 階段 2: 熟悉 (好感 >= 30) ---
        {
            label: "🎁 送小禮物 (金幣-10 / +10 好感)",
            condition: { 
                vars: [
                    { key: 'maid_love', val: 30, op: '>=' },
                    { key: 'gold', val: 10, op: '>=' } 
                ]
            },
            action: "node_next",
            rewards: { 
                gold: -10,
                varOps: [{ key: 'maid_love', val: 10, op: '+' }] 
            },
            nextScene: { 
                text: "她收到禮物時，嘴角微微上揚。\n「謝謝您，陛下。」", 
                options: [{label:"繼續", action:"node_next", nextSceneId:'harem_interaction_loop'}] 
            }
        },

        // [情況 B: 沒錢] -> 顯示鎖定狀態 (改用 locked)
        {
            // 由於不能動 CSS，我們直接在文字上加鎖頭符號，並標註原因
            label: "🎁 送小禮物 (🔒 金幣不足 10)", 
            
            // 使用 Engine 不認識的 style 名稱 (如 disabled)，
            // 雖然 View 不會變色(因為不能改CSS)，但至少標記明確
            style: "disabled", 

            condition: { 
                vars: [
                    { key: 'maid_love', val: 30, op: '>=' }, // 好感度夠，才會看到這個鎖定的選項
                    { key: 'gold', val: 10, op: '<' }    // 錢不夠
                ]
            },
            
            // [關鍵] 設定動作為 locked
            action: "locked",
            
            // [關鍵] 設定點擊後的提示訊息
            msg: "❌ 您的金幣不足，無法購買禮物！"
        },

        // --- 階段 3: 曖昧 (好感 >= 60) ---
        {
            label: "✋ 肢體接觸 (警報+? / +15 好感)",
            condition: { var: { key: 'maid_love', val: 60, op: '>=' } },
            action: "node_next",
            rewards: { varOps: [{ key: 'maid_love', val: 15, op: '+' }] },
            nextScene: { 
                text: "你輕輕握住她的手，她臉紅了，但沒有抽開。\n氣氛變得有些微妙。", 
                options: [{label:"繼續", action:"node_next", nextSceneId:'harem_interaction_loop'}] 
            }
        },

        // --- 階段 4: 誓約 (好感 >= 100) ---
        {
            label: "💍 締結誓約 (解鎖結局)",
            style: "primary", // 特殊顏色按鈕
            condition: { var: { key: 'maid_love', val: 100, op: '>=' } },
            action: "node_next",
            nextSceneId: 'harem_true_love_event'
        },

        { label: "離開", action: "node_next", nextSceneId: 'harem_root' }
    ]
});

// [C. 真愛劇情]
register({
    id: 'harem_true_love_event',
    text: "【特殊劇情：誓約之吻】\n女僕長卸下了平日的防備，依偎在你懷裡。\n「陛下...不，親愛的。我願意永遠追隨您。」",
    options: [
        {
            label: "接受她的心意 (Happy End)",
            action: "finish_chain",
            rewards: { 
                exp: 1000, 
                tags: ['maid_conquered'] // 獲得成就標籤
            }
        }
    ]
});

// ============================================================
// 3. 機械公元 2.0 (Machine Era) - 資源管理與風險博弈
// ============================================================

// [A. 初始化入口] 設定三個核心數值：時間、進度、警報值
register({
    id: 'machine_entry',
    entry: true, 
    onEnter: { 
        varOps: [
            { key: 'time_left', val: 5, op: 'set' }, 
            { key: 'hack_progress', val: 0, op: 'set' },
            { key: 'alert_level', val: 0, op: 'set' } // 新增：警報值
        ]
    },
    text: "【系統初始化】\n正在建立安全通道...\n目標：獲取 100% 數據。\n警告：警報值過高將觸發防火牆反擊。",
    options: [
        { label: "接入神經網路", action: "node_next", nextSceneId: 'machine_root' }
    ]
});

// [B. 主控台循環] 核心博弈邏輯
register({
    id: 'machine_root',
    text: "【系統主控台】\n⏳ 剩餘時間：{time_left}\n💾 破解進度：{hack_progress}%\n⚠️ 警報等級：{alert_level}%",
    options: [
        // 優先級 1: 警報爆表 (強制登出)
        {
            label: "⚠️ 警報大作！強制登出！",
            style: "danger",
            condition: { var: { key: 'alert_level', val: 100, op: '>=' } },
            action: "node_next",
            nextSceneId: 'machine_bad_end'
        },
        // 優先級 2: 時間耗盡 (強制結算)
        {
            label: "⏳ 時間耗盡，斷開連接",
            condition: { 
                // [修正] 使用 vars 陣列來同時檢查兩個條件
                vars: [
                    { key: 'time_left', val: 1, op: '<' },
                    { key: 'alert_level', val: 100, op: '<' }
                ]
            },
            action: "node_next",
            nextSceneId: 'machine_calculating'
        },
        // 優先級 3: 正常行動
        { 
            label: "🔨 暴力破解 (耗時1 / 警報+30)", 
            condition: { 
                vars: [
                    { key: 'time_left', val: 1, op: '>=' },
                    { key: 'alert_level', val: 100, op: '<' }
                ]
            }, 
            action: "node_next", 
            rewards: { 
                varOps: [
                    { key: 'time_left', val: 1, op: '-' },
                    { key: 'hack_progress', val: 25, op: '+' },
                    { key: 'alert_level', val: 30, op: '+' }
                ] 
            },
            nextSceneId: 'machine_root' 
        },
        { 
            label: "🦠 植入病毒 (耗時2 / 警報+0)", 
            condition: { 
                vars: [
                    { key: 'time_left', val: 2, op: '>=' },
                    { key: 'alert_level', val: 100, op: '<' }
                ]
            },
            action: "node_next", 
            rewards: { 
                varOps: [
                    { key: 'time_left', val: 2, op: '-' },
                    { key: 'hack_progress', val: 40, op: '+' }
                ] 
            },
            nextSceneId: 'machine_root'
        },
        { 
            label: "🧹 清除日誌 (耗時1 / 警報-20)", 
            condition: { 
                vars: [
                    { key: 'time_left', val: 1, op: '>=' },
                    { key: 'alert_level', val: 100, op: '<' },
                    { key: 'alert_level', val: 0, op: '>' }
                ]
            },
            action: "node_next", 
            rewards: { 
                varOps: [
                    { key: 'time_left', val: 1, op: '-' },
                    { key: 'alert_level', val: 20, op: '-' }
                ] 
            },
            nextSceneId: 'machine_root'
        },
        // 優先級 4: 主動撤退
        {
            label: "🚪 主動斷開連接 (結算)",
            condition: { 
                vars: [
                    { key: 'time_left', val: 1, op: '>=' },
                    { key: 'alert_level', val: 100, op: '<' }
                ]
            },
            action: "node_next",
            nextSceneId: 'machine_calculating'
        }
    ]
});

// [C. 過場計算] 這裡只負責顯示過場動畫，並提供唯一的結果按鈕
register({
    id: 'machine_calculating',
    text: "正在上傳數據包...\n校驗完整性中...\n(進度: {hack_progress}%)",
    options: [
        // 只有一個結果會出現，玩家感覺像是自動判定的
        {
            label: "查看最終報告 (完美)",
            condition: { var: { key: 'hack_progress', val: 100, op: '>=' } },
            action: "node_next",
            nextScene: { 
                text: "【任務完成】\n你成功竊取了所有核心機密資料。\n企業股價大跌，你的帳戶多了一筆鉅款。", 
                rewards: { gold: 200, exp: 50 }, 
                options: [{label:"潛入陰影 (離開)", action:"finish_chain"}] 
            }
        },
        {
            label: "查看最終報告 (普通)",
            condition: { 
                var: { key: 'hack_progress', val: 100, op: '<' },
                var: { key: 'hack_progress', val: 50, op: '>=' } // 需引擎支援多重condition或順序判定，若不支援可簡化
            },
            action: "node_next",
            nextScene: { 
                text: "【任務勉強完成】\n資料有些損毀，但還能賣點錢。", 
                rewards: { gold: 50, exp: 20 }, 
                options: [{label:"離開", action:"finish_chain"}] 
            }
        },
        {
            label: "查看最終報告 (失敗)",
            condition: { var: { key: 'hack_progress', val: 50, op: '<' } },
            action: "node_next",
            nextScene: { 
                text: "【任務失敗】\n你只抓到了一些垃圾緩存文件，白忙一場。", 
                rewards: { energy: -5 }, // 扣點精力懲罰
                options: [{label:"灰溜溜地離開", action:"finish_chain"}] 
            }
        }
    ]
});

// [D. 壞結局] 警報過高
register({
    id: 'machine_bad_end',
    text: "【致命錯誤】\n防火牆追蹤到了你的神經訊號！\n你的大腦受到強烈電擊...",
    options: [
        { 
            label: "意識中斷... (HP -20)", 
            action: "finish_chain", 
            rewards: { energy: -20 } // 大幅扣除精力
        }
    ]
});

// ============================================================
// 5. 新增劇本：告解室的最後一小時 (The Confessional)
// ============================================================

// --- 序章：冒牌神父 ---
register({
    id: 'confessional_start',
    text: [
        "【第一章：冒牌神父】",
        "教堂的彩色玻璃窗被颱風拍打得格格作響，像是有無數隻手試圖從外面的黑暗中闖進來。",
        "你低頭看著身上這件寬大的黑色聖袍，領口還帶著一股樟腦丸的陳舊氣味。",
        "你叫陳默，一個正在被通緝的詐欺犯。為了躲避豪雨和警方的路檢，你撬開了這間無人教堂的後門。"
    ],
    options: [
        { 
            label: "喝一口聖壇上的紅酒", 
            action: "node_next", 
            nextScene: {
                text: "劣質的葡萄酸澀味在舌尖蔓延。就在你準備喝第二口的時候，大門發出了刺耳的摩擦聲——吱呀！",
                options: [{ label: "有人來了！", action: "node_next", nextSceneId: 'confessional_encounter' }]
            }
        }
    ]
});

register({
    id: 'confessional_encounter',
    text: [
        "一個全身濕透的女人跌跌撞撞地闖了進來。",
        "她穿著昂貴但沾滿泥濘的風衣，臉色蒼白如紙，眼神渙散。",
        "她看見了你身上的聖袍，撲通一聲跪在告解室前。"
    ],
    dialogue: [
        { speaker: "女人", text: "神父……我有罪。" },
        { speaker: "你", text: "（壓低嗓音）孩子，這麼晚了，教堂已經關門了。" },
        { speaker: "女人", text: "不，請聽我說。我剛才……殺了人。" }
    ],
    options: [
        { 
            label: "握緊藏在腰後的折疊刀", 
            action: "node_next", 
            nextSceneId: 'confessional_poison_reveal' 
        }
    ]
});

// --- 轉折：毒發宣告 ---
register({
    id: 'confessional_poison_reveal',
    dialogue: [
        { speaker: "你", text: "你殺了誰？" },
        { speaker: "女人", text: "我殺了這裡的神父。十分鐘前，我在那瓶紅酒裡下了足以殺死一頭大象的氰化物。" }
    ],
    text: [
        "匡噹！你手中的酒杯掉在地上摔得粉碎。",
        "深紅色的液體潑灑在鞋子上，像極了血。",
        "女人看著地上的碎片，嘴角勾起一抹詭異的微笑。"
    ],
    options: [
        { 
            label: "什麼...？！", 
            action: "node_next", 
            nextScene: {
                text: "女人平靜地說：「毒發時間是一小時。現在，您還有五十分鐘。」",
                // 獲得中毒狀態 TAG
                rewards: { tags: ['poisoned'] },
                options: [{ label: "逼問解藥！", action: "node_next", nextSceneId: 'confessional_interrogation' }]
            } 
        }
    ]
});

// --- 發展：死亡博弈 ---
register({
    id: 'confessional_interrogation',
    text: [
        "【第二章：死亡倒數】",
        "恐懼像冰水一樣澆透了全身。喉嚨開始發緊——是心理作用？還是毒藥生效了？",
        "你衝過去揪住她的衣領，但她眼神鋒利，毫無懼色。"
    ],
    dialogue: [
        { speaker: "女人", text: "這是一個考驗。如果您是真的神父，上帝會拯救您。" },
        { speaker: "你", text: "別裝神弄鬼！解藥在哪裡？" },
        { speaker: "女人", text: "解藥在我的車上。但我設定了密碼鎖，四十分鐘後自動銷毀。" },
        { speaker: "女人", text: "幫我完成一個『儀式』，聽完我真正的告解並赦免我，我就給你解藥。" }
    ],
    options: [
        { 
            label: "只能聽她說了... (剩餘30分鐘)", 
            action: "node_next", 
            nextSceneId: 'confessional_truth' 
        }
    ]
});

register({
    id: 'confessional_truth',
    text: [
        "【第三章：致命的真相】",
        "時間流逝，你的手指開始發麻，視線邊緣出現模糊。",
        "女人講述了一個關於丈夫外遇、黑幫棄屍點以及外科醫生丈夫的故事。",
        "就在這時——咚、咚、咚。",
        "教堂後門傳來了沈重的敲擊聲。"
    ],
    dialogue: [
        { speaker: "女人", text: "（縮成一團）他們來了。我丈夫，還有那個神父。他們回來『清理』了。" },
        { speaker: "你", text: "該死...還有二十分鐘..." }
    ],
    options: [
        // 這裡是結局分歧點
        // 選項 A: 壞結局
        { 
            label: "把女人交出去換解藥", 
            action: "node_next", 
            nextSceneId: 'confessional_end_bad' 
        },
        // 選項 B: 真結局 (需要智力檢定或觀察)
        { 
            label: "等等...這邏輯不對 (INT檢定)", 
            check: { stat: 'INT', val: 7 },
            nextSceneId: 'confessional_end_true',
            failScene: { text: "你的大腦一片混亂，無法思考細節...", options: [{label:"只能拼了！(轉向戰鬥)", action:"node_next", nextSceneId:'confessional_end_action'}]}
        },
        // 選項 C: 戰鬥結局 (模擬中毒視角)
        { 
            label: "相信..她...聯手..反..殺...", 
            action: "node_next", 
            nextSceneId: 'confessional_end_action' 
        }
    ]
});

// --- 結局 A：虛假的救贖 (Bad End) ---
register({
    id: 'confessional_end_bad',
    text: [
        "你打開門，向門外的黑影高喊：「我抓住了她！給我解藥！」",
        "進來的是個戴眼鏡的男人，他微笑著遞給你一支針筒。",
        "你迫不及待地注射，卻發現身體瞬間失去了力氣——那是肌肉鬆弛劑。"
    ],
    dialogue: [
        { speaker: "丈夫", text: "親愛的，今晚的獵物素質不錯。" },
        { speaker: "女人", text: "（蹲在你耳邊）可惜，神父的演技太差了。" }
    ],
    options: [
        { 
            label: "意識陷入黑暗... (結局)", 
            action: "finish_chain", 
            rewards: { removeTags: ['poisoned'] } 
        }
    ]
});

// --- 結局 B：真正的神父 (True End) ---
register({
    id: 'confessional_end_true',
    text: [
        "你猛地踢開告解室的門，一把扯下聖壇下的地毯，露出了一個通風口。",
        "你冷冷地看著驚恐的女人。"
    ],
    dialogue: [
        { speaker: "你", text: "根本沒有毒酒。如果是氰化物，我早就死了。" },
        { speaker: "你", text: "我的手指發麻是因為發燒淋雨。你編故事只是為了讓我替你擋住門外的人！" },
        { speaker: "女人", text: "你..." }
    ],
    options: [
        {
            label: "從通風口逃走",
            action: "node_next",
            nextScene: {
                text: [
                    "門外的人破門而入——是警察。",
                    "原來女人才是黑寡婦殺手，她殺了真神父並藏屍，卻剛好撞見你。",
                    "你在雨中回頭看了一眼教堂，警車的紅藍光在夜色中閃爍。"
                ],
                dialogue: [
                    { speaker: "你", text: "這世上沒有神，只有為了活下去而編造謊言的惡魔。阿門。" }
                ],
                options: [{ 
                    label: "逃出生天 (True End)", 
                    action: "finish_chain", 
                    rewards: { exp: 500, gold: 100, removeTags: ['poisoned'] } 
                }]
            }
        }
    ]
});

// --- 結局 C：血色黎明 (Action End) ---
register({
    id: 'confessional_end_action',
    text: [
        "你利用教堂的地形，推倒了雕像，並點燃了聖油。",
        "當入侵者闖入時，你展開了一場血腥的搏鬥。",
        "（戰鬥過程省略...）你受了重傷，但成功殺死了對方。"
    ],
    dialogue: [
        { speaker: "你", text: "呼...呼...解藥...給我..." },
        { speaker: "女人", text: "（哭著拿出藥瓶）對不起。" }
    ],
    options: [
        {
            label: "喝下藥水",
            action: "node_next",
            nextScene: {
                text: [
                    "腹痛瞬間加劇，如同火燒。",
                    "女人後退一步：「酒裡真的有毒，但那是除草劑。根本沒有解藥。」",
                    "女人拿走了屍體上的車鑰匙離開了。你靠在聖壇上，看著窗外的第一縷晨光。"
                ],
                dialogue: [
                    { speaker: "你", text: "至少……這場雨停了。" }
                ],
                options: [{ 
                    label: "在晨光中閉上眼 (Normal End)", 
                    action: "finish_chain", 
                    rewards: { removeTags: ['poisoned'] } 
                }]
            }
        }
    ]
});
// ============================================================
// 1. 全局初始化 (Initialization)
// ============================================================
register({
    id: 'rose_start',
    entry: true, // 入口標記
    onEnter: { 
        varOps: [
            { key: 'sanity', val: 100, op: 'set' },   // SAN值 (驚悚要素)
            { key: 'prestige', val: 10, op: 'set' },  // 威望 (宮鬥要素)
            { key: 'gold', val: 50, op: 'set' },      // 金錢 (交易要素)
            { key: 'favor_butler', val: 0, op: 'set' }, // 好感度 (戀愛要素)
            { key: 'time_left', val: 5, op: 'set' }   // 回合數 (養成限制)
        ],
        rewards: { removeTags: ['has_key', 'evidence_poison', 'gift_jade'] } // 重置道具
    },
    text: [
        "【序章：囚鳥】",
        "頭痛欲裂。你緩緩睜開眼，發現自己躺在冰冷潮濕的石板地上。",
        "空氣中瀰漫著陳年紅酒與鐵鏽（或許是血？）混合的腥味。遠處傳來雷聲，彷彿是這座深宅大院的低吼。",
        "你是被召回家族的私生子，本該參加今晚的家主壽宴，此刻卻身陷囹圄。"
    ],
    options: [
        { label: "掙扎著站起來", action: "node_next", nextSceneId: 'rose_cellar_1' }
    ]
});

// ============================================================
// 1. 全局初始化
// ============================================================
register({
    id: 'rose_start',
    entry: true,
    onEnter: { 
        varOps: [
            // 初始化數值 (移除 msg 以關閉 Toast)
            { key: 'sanity', val: 90, op: 'set' },      // 精神略低，因為剛醒來
            { key: 'prestige', val: 0, op: 'set' },
            { key: 'favor_butler', val: 0, op: 'set' },
            { key: 'time_left', val: 6, op: 'set' },
            { key: 'gold', val: 50, op: 'add' }         // 獲得初始資金
        ],
        // 清除舊存檔的標籤
        rewards: { removeTags: ['has_key', 'evidence_poison', 'heir_approved', 'secret_passage'] }
    },
    text: [
        "【序章：囚鳥】",
        "……滴答……滴答……",
        "冰冷的水滴落在眉心，強烈的暈眩感讓你忍不住乾嘔。",
        "你試圖移動，卻發現手腳僵硬。這裡不是你溫暖的臥室，而是充滿霉味與鐵鏽氣息的黑暗空間。",
        "記憶如碎片般閃回：雷雨夜、家主壽宴的邀請函、馬車上的迷香……以及昏迷前聽到的最後一句話：",
        "「處理乾淨點，今晚過後，羅斯家族只需要一位繼承人。」"
    ],
    options: [
        { label: "咬牙撐起身體，觀察四周", action: "node_next", nextSceneId: 'rose_cellar_1' }
    ]
});

// ============================================================
// 2. 第一章：死寂地窖 (擴充環境描寫)
// ============================================================
register({
    id: 'rose_cellar_1',
    text: [
        "這是一個被家族遺棄多年的地下酒窖。牆壁上滲出的水漬像是一張張哭泣的臉。",
        "微弱的燭光在風中搖曳，隨時可能熄滅。",
        "面前是一扇厚重的橡木門，門鎖早已鏽跡斑斑。",
        "而在角落的酒桶旁，蜷縮著一具穿著僕人制服的白骨，對方的手指呈現出詭異的扭曲狀，似乎死前正死死抓著什麼希望。"
    ],
    options: [
        // [A] 搜查屍體
        { 
            label: "💀 檢查那具白骨 (SAN -5)", 
            condition: { noTag: 'has_key' },
            action: "node_next", 
            nextSceneId: 'rose_cellar_1', // 刷新場景
            rewards: { 
                tags: ['has_key'], 
                varOps: [{key:'sanity', val:5, op:'-'}] // 扣除 SAN
            },
            nextScene: { 
                text: "你強忍著恐懼與噁心，靠近那具屍體。制服上的銘牌寫著「老湯姆」——那是小時候唯一給過你糖果的僕人。\n\n你掰開他僵硬的指骨，清脆的斷裂聲在寂靜的地窖中格外刺耳。\n一枚冰冷的【黃銅鑰匙】滑落在你掌心。\n「抱歉了，湯姆。」你低聲說道。" 
            }
        },
        
        // [B] 暴力破門 (描述更暴力)
        { 
            label: "💪 用身體撞開木門 (STR > 8)", 
            check: { stat: 'STR', val: 8 }, 
            nextScene: { 
                text: "你後退幾步，深吸一口氣，將全身的力量集中在肩膀上。\n\n「砰！」\n\n伴隨著腐朽木屑的飛濺，橡木門發出一聲哀鳴，轟然倒塌。你揉了揉發痛的肩膀，眼神堅定。", 
                options: [{label: "衝出地窖", action: "node_next", nextSceneId: 'rose_hallway'}] 
            }, 
            failScene: { 
                text: "你狠狠撞向大門，但對方比想像中更堅固。劇痛從肩膀傳遍全身，你狼狽地跌坐在地，揚起一陣灰塵。\n這扇門在嘲笑你的無力。", 
                rewards: { varOps: [{key:'sanity', val:5, op:'-'}] } 
            } 
        },

        // [C] 使用鑰匙 (增加細節)
        { 
            label: "🗝️ 插入黃銅鑰匙", 
            condition: { hasTag: 'has_key' }, 
            action: "node_next", 
            nextScene: { 
                text: "鑰匙插入鎖孔，發出乾澀的摩擦聲。\n你輕輕轉動，鏽死的機關在抗議聲中妥協了。\n\n「喀噠。」鎖開了。", 
                options: [{label: "推門離開", action: "node_next", nextSceneId: 'rose_hallway'}] 
            } 
        }
    ]
});

// 過渡場景：長廊
register({
    id: 'rose_hallway',
    text: [
        "推開門的瞬間，刺眼的光線讓你瞇起了眼。",
        "你跌跌撞撞地爬出地窖，外面是富麗堂皇的長廊。紅地毯柔軟得像沼澤，牆上的油畫中，歷代家主正冷漠地注視著你這位私生子。",
        "遠處傳來悠揚的小提琴聲與賓客的談笑聲。掛鐘指向八點，距離決定繼承人的時刻已經不遠了。",
        "你拍去身上的塵土，整理好凌亂的衣領。從現在起，你是獵人，不是獵物。"
    ],
    options: [
        { label: "推開宴會廳大門，入局", action: "node_next", nextSceneId: 'rose_hub' }
    ]
});

// ============================================================
// 3. 第二章：豪門夜宴 (HUB - 增加氛圍描述)
// ============================================================
register({
    id: 'rose_hub',
    text: [
        "【宴會廳】",
        "水晶吊燈灑下金色的光輝，香檳塔折射著奢靡的色彩。衣香鬢影之間，沒人注意到角落裡那個剛從地獄爬回來的人。",
        "大少爺正在人群中心高談闊論，享受著恭維。",
        "家主書房的鐘聲每隔一小時就會敲響，那是倒數的喪鐘。",
        "------------------------------",
        "⏳ 距離審判還有： {time_left} 時辰",
        "📊 當前局勢：威望 {prestige} | 理智 {sanity} | 金幣 {gold} | 💕管家好感 {favor_butler}"
    ],
    options: [
        // [A] 結局判定
        {
            label: "🔔 午夜鐘聲響起 (前往結局)",
            style: "danger",
            condition: { var: { key: 'time_left', val: 0, op: '<=' } },
            action: "node_next",
            nextSceneId: 'rose_climax'
        },

        // [B] 社交 (增加具體情境)
        {
            label: "🍷 融入貴族圈子 (威望+10 / 耗時)",
            condition: { var: { key: 'time_left', val: 1, op: '>=' } },
            action: "node_next",
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: { 
                text: "你端起一杯紅酒，掩飾住嘴角的冷笑，走向了家族的旁支長老們。\n你若無其事地提起了大少爺最近在賭場的巨額虧損，以及幾筆不明的賬目。\n\n長老們的臉色變了。謠言像病毒一樣在宴會廳擴散。", 
                onEnter: { varOps: [{key:'prestige', val:10, op:'+'}] },
                options: [{label:"深藏功與名，退回人群", action:"node_next", nextSceneId:'rose_hub'}] 
            }
        },

        // [C] 管家線
        {
            label: "🌹 尋找那位年輕管家",
            condition: { var: { key: 'time_left', val: 1, op: '>=' } },
            action: "node_next",
            nextSceneId: 'rose_butler_interaction'
        },

        // [D] 對峙線
        {
            label: "⚔️ 主動走向大少爺 (INT檢定 / 耗時)",
            condition: { var: { key: 'time_left', val: 1, op: '>=' } },
            action: "node_next",
            nextSceneId: 'rose_brother_fight'
        },
		{
        label: "🍃 前往露台 (休息/偷聽)",
        condition: { var: { key: 'time_left', val: 1, op: '>=' } },
        action: "node_next",
        nextSceneId: 'rose_terrace' // 指向擴充一
    },
    {
        label: "📚 進入圖書室 (探索)",
        condition: { var: { key: 'time_left', val: 1, op: '>=' } },
        action: "node_next",
        nextSceneId: 'rose_library' // 指向擴充二
    },
    {
        label: "🎲 去偏廳賭一把 (賺錢)",
        condition: { var: { key: 'time_left', val: 1, op: '>=' } },
        action: "node_next",
        nextSceneId: 'rose_gamble' // 指向擴充三
    },
        // [E] 晉見家主
        {
            label: "🐉 強闖家主書房 (需威望50)",
            style: "primary",
            condition: { 
                vars: [
                    { key: 'prestige', val: 50, op: '>=' },
                    { key: 'time_left', val: 1, op: '>=' }
                ]
            },
            action: "node_next",
            nextSceneId: 'rose_master_meet'
        },
        {
            label: "🐉 強闖家主書房 (🔒 威望不足)",
            style: "disabled",
            condition: { var: { key: 'prestige', val: 50, op: '<' } },
            action: "locked",
            msg: "門口的保鏢冷冷地看著你：「私生子沒有資格進去。」"
        }
    ]
});

// ============================================================
// 子場景擴充：管家的誘惑
// ============================================================
register({
    id: 'rose_butler_interaction',
    text: [
        "你穿過人群，在陰影處找到了那位年輕英俊的管家——塞巴斯。",
        "他正在擦拭銀質餐具，看到你時，眼底閃過一絲驚訝，隨即化為玩味的笑意。",
        "「哎呀，三少爺。您身上的泥土味……可是會熏到客人的。」他遞給你一條潔白的手帕。"
    ],
    options: [
        // 交易線：變得更貪婪
        {
            label: "💰 「我要買大少爺的命」 (金幣-30)",
            condition: { 
                noTag: 'evidence_poison',
                var: { key: 'gold', val: 30, op: '>=' }
            },
            action: "node_next",
            rewards: { 
                gold: -30, 
                tags: ['evidence_poison'],
                varOps: [{key:'time_left', val:1, op:'-'}]
            },
            nextScene: { 
                text: "塞巴斯收起金幣，動作優雅得像在表演魔術。\n\n「命我給不了，但這個……或許您用得上。」\n他將一張皺巴巴的藥單塞進你的袖口，低聲耳語：「這是大少爺從黑市購買砒霜的收據。今晚的壽宴，恐怕不只是慶祝那麼簡單。」", 
                options: [{label:"這足夠了", action:"node_next", nextSceneId:'rose_hub'}]
            }
        },
        
        // 戀愛線：增加肢體接觸描寫
        {
            label: "💕 接過手帕，觸碰指尖 (CHR > 6)",
            check: { stat: 'CHR', val: 6 },
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: { 
                text: "你接過手帕，指尖故意在他掌心輕輕劃過。塞巴斯的動作停滯了一瞬，呼吸亂了半拍。\n\n你靠近他，在他耳邊輕笑：「比起這些虛偽的貴族，我更願意信任你，塞巴斯。」\n\n他低下頭，掩飾住泛紅的耳根：「……我不討厭您的信任，少爺。」", 
                onEnter: { varOps: [{key:'favor_butler', val:20, op:'+'}] }, // 好感增加
                options: [{label:"曖昧的氛圍恰到好處", action:"node_next", nextSceneId:'rose_hub'}] 
            },
            failScene: {
                text: "你試圖調情，但塞巴斯禮貌地後退了一步，眼神恢復了冰冷。\n「請自重，少爺。老爺正在看著這邊。」\n氣氛變得尷尬起來。",
                options: [{label:"悻悻然離開", action:"node_next", nextSceneId:'rose_hub'}]
            }
        },

        // 密道線：增加緊張感
        {
            label: "🤝 「如果我失敗了...」 (需好感 40)",
            condition: { var: { key: 'favor_butler', val: 40, op: '>=' } },
            action: "node_next",
            rewards: { 
                tags: ['secret_passage'],
                varOps: [{key:'time_left', val:1, op:'-'}] 
            },
            nextScene: {
                text: "塞巴斯的神情變得嚴肅。他左右環顧，確認無人後，將一張手繪地圖塞進你的口袋。\n\n「別死在這裡。」他的聲音很輕，卻帶著顫抖，「如果情況失控，廚房壁爐後有一條通往河邊的密道。船我已經準備好了。」",
                options: [{label:"點頭致謝", action:"node_next", nextSceneId:'rose_hub'}]
            }
        },
        
        { label: "沒什麼，只是路過", action: "node_next", nextSceneId: 'rose_hub' }
    ]
});

// ============================================================
// 子場景擴充：兄弟鬩牆
// ============================================================
register({
    id: 'rose_brother_fight',
    text: [
        "你走向人群中心。大少爺看到了你，手中的酒杯猛地頓住。",
        "他推開身邊的舞伴，帶著一身酒氣大步走來，臉上掛著猙獰的笑。",
        "「喲，這不是我們的小老鼠嗎？地窖的空氣不適合你嗎？竟然爬到這種場合來丟人現眼！」",
        "周圍的賓客安靜下來，都在等著看這場好戲。"
    ],
    options: [
        {
            label: "💢 忍氣吞聲 (SAN -20)",
            action: "node_next",
            rewards: { 
                varOps: [{key:'sanity', val:20, op:'-'}, {key:'time_left', val:1, op:'-'}] 
            },
            nextScene: { 
                text: "你緊握雙拳，指甲深深嵌入掌心。你低下頭，任由他在眾人面前羞辱你。\n\n「這就對了，私生子就該有私生子的樣子。」大少爺得意地將一杯酒潑在你腳邊，大笑離去。\n\n雖然屈辱，但你成功讓他放鬆了警惕。", 
                options: [{label:"擦乾鞋子，等待時機", action:"node_next", nextSceneId:'rose_hub'}]
            }
        },
        {
            label: "🧠 智慧反擊 (INT > 7)",
            check: { stat: 'INT', val: 7 },
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: { 
                text: "你沒有生氣，反而優雅地舉杯，聲音不大卻清晰地傳遍全場：\n\n「大哥，您看起來很緊張？是因為賭場的債主追得太緊，還是因為……您給父親準備的『壽禮』見不得光？」\n\n大少爺的臉色瞬間煞白。周圍的賓客開始竊竊私語，懷疑的種子已經種下。", 
                onEnter: { varOps: [{key:'prestige', val:20, op:'+'}] },
                options: [{label:"微笑著看著他落荒而逃", action:"node_next", nextSceneId:'rose_hub'}] 
            },
            failScene: {
                text: "你試圖反駁，但在大少爺強大的氣場下結結巴巴。他無情地打斷了你，並嘲笑你的出身。\n賓客們發出刺耳的哄笑聲，你的顏面掃地。",
                onEnter: { varOps: [{key:'prestige', val:10, op:'-'}] },
                options: [{label:"狼狽地退回角落", action:"node_next", nextSceneId:'rose_hub'}]
            }
        }
    ]
});

// ============================================================
// 子場景擴充：風暴前的寧靜 (家主書房)
// ============================================================
register({
    id: 'rose_master_meet',
    text: [
        "書房裡瀰漫著濃重的藥味。年邁的家主坐在皮椅上，正劇烈地咳嗽，手帕上滿是鮮血。",
        "他渾濁的眼睛盯著你，聲音沙啞：「你來做什麼？如果你也是來要錢的，就滾出去。」"
    ],
    options: [
        {
            label: "📄 呈上大少爺買毒的證據",
            condition: { hasTag: 'evidence_poison' },
            action: "node_next",
            rewards: { 
                tags: ['heir_approved'], 
                varOps: [{key:'time_left', val:1, op:'-'}] 
            },
            nextScene: { 
                text: "你將那張皺巴巴的藥單放在桌上。家主顫抖著手拿起，看完後，整個人彷彿蒼老了十歲。\n\n「逆子……咳咳……那個逆子！」\n\n他從手指上取下一枚象徵權力的翡翠扳指，重重地拍在你手裡。\n「活下去……殺了那個逆子……羅斯家族，交給你了。」", 
                options: [{label:"戴上扳指，眼神蛻變", action:"node_next", nextSceneId:'rose_hub'}]
            }
        },
        {
            label: "只是問安 (無證據)",
            action: "node_next",
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: {
                text: "你沒有足夠的籌碼。家主失望地閉上眼，揮手讓你出去。\n「優柔寡斷，難成大器。」\n你錯失了最後的機會。",
                options: [{label:"不甘地退出書房", action:"node_next", nextSceneId:'rose_hub'}]
            }
        }
    ]
});

// ============================================================
// 4. 終章：血色黎明 (結局描寫強化)
// ============================================================
register({
    id: 'rose_climax',
    text: [
        "【終章：審判時刻】",
        "午夜十二點。鐘聲敲響的瞬間，宴會廳爆發出一陣驚恐的尖叫。",
        "家主倒在主位上，口吐白沫，已經斷了氣。",
        "「是他！」大少爺第一時間跳出來，指著你的鼻子，表情猙獰而誇張，「我親眼看到這個私生子從書房出來！是他毒死了父親！」",
        "衛兵拔劍衝入，賓客們驚恐後退。所有人的目光都聚焦在你身上。",
        "這是你最後的機會。"
    ],
    options: [
        // 結局 A: 權力的頂峰
        {
            label: "👑 舉起家主信物，反殺！",
            style: "primary",
            condition: { hasTag: 'heir_approved' },
            action: "finish_chain",
            nextScene: { 
                text: "面對指控，你沒有慌張。你緩緩舉起右手，那枚翡翠扳指在燈光下散發著寒光。\n\n「家主信物在此！誰敢造次？」你厲聲喝道，氣勢壓倒了全場。\n隨即，你甩出了大少爺購買砒霜的證據。\n\n局勢瞬間逆轉。衛兵們遲疑片刻，將劍鋒轉向了臉色慘白的大少爺。\n你坐在了那張沾血的椅子上，俯瞰著被拖走的大哥。你贏了，但你的心也和這扳指一樣冰冷了。\n\n【結局：血色權杖】\n(達成條件：獲得家主認可)",
                rewards: { exp: 2000, gold: 1000, title: "豪門家主" }
            }
        },
        
        // 結局 B: 愛情的逃亡
        {
            label: "🌹 與塞巴斯殺出重圍",
            style: "danger",
            condition: { var: { key: 'favor_butler', val: 50, op: '>=' } },
            action: "finish_chain",
            nextScene: { 
                text: "「動手！」你大喊一聲。\n\n燈光突然熄滅——是塞巴斯切斷了電源。黑暗中，槍聲響起，精準地擊倒了靠近你的衛兵。\n一隻溫暖的手抓住了你：「少爺，這邊！」\n\n火光與混亂中，你們跳上了停在後門的汽車。你回頭看了一眼燃燒的莊園，那裡埋葬了你的過去，但身邊的人，是你的未來。\n\n【結局：亂世鴛鴦】\n(達成條件：管家好感 > 50)",
                rewards: { exp: 1200, gold: 100, title: "私奔貴族" }
            }
        },

        // 結局 C: 苟且偷生
        {
            label: "🏃‍♂️ 鑽入密道逃跑",
            condition: { hasTag: 'secret_passage' },
            action: "finish_chain",
            nextScene: {
                text: "你深知大勢已去，趁著眾人混亂之際，滾進了壁爐後的暗門。\n\n你在潮濕的密道中狂奔，身後是衛兵的追殺聲。當你爬出下水道，看著黎明升起，你發現自己雖然一無所有，但至少還活著。\n復仇的火種，還未熄滅。\n\n【結局：流亡者】\n(達成條件：發現密道)",
                rewards: { exp: 500 }
            }
        },

        // 結局 D: 悲劇
        {
            label: "無力辯解...",
            action: "finish_chain",
            nextScene: { 
                text: "你試圖張嘴辯解，但憤怒的人群淹沒了你的聲音。\n「殺死弒父兇手！」\n\n在混亂的暴力中，你的意識逐漸模糊。你失敗了，成為了家族鬥爭中又一個無名的犧牲品。\n\n【結局：無名之鬼】",
                rewards: { energy: -20 }
            }
        }
    ]
});

register({
    id: 'rose_terrace',
    text: [
        "【露台】",
        "你推開落地窗，冷冽的夜風撲面而來，吹散了宴會廳的脂粉氣。",
        "欄杆外是漆黑的懸崖，遠處的海浪聲隱約可聞。",
        "角落裡，兩個喝醉的家族長老正在抽煙，似乎在談論什麼秘密。"
    ],
    options: [
        // 選項 A: 偷聽 (獲得情報)
        {
            label: "👂 躲在陰影處偷聽 (INT檢定)",
            check: { stat: 'INT', val: 6 },
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: {
                text: "你屏住呼吸，聽到長老低聲說道：\n「老爺子的遺囑藏在『那幅畫』後面...就是畫著『獨眼巨人』的那幅。」\n(獲得情報：遺囑位置)",
                onEnter: { tags: ['info_will_location'] }, // 獲得情報標籤
                options: [{label: "記在心裡，返回宴會", action: "node_next", nextSceneId: 'rose_hub'}]
            },
            failScene: {
                text: "你靠得太近，不小心踢到了花盆。\n「誰在那裡？！」\n長老們警覺地閉上了嘴並離開了。你什麼都沒聽到。",
                options: [{label: "尷尬地返回", action: "node_next", nextSceneId: 'rose_hub'}]
            }
        },
        // 選項 B: 休息 (恢復 SAN)
        {
            label: "🚬 獨自吹風冷靜 (SAN +10)",
            action: "node_next",
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: {
                text: "你看著遠處的燈塔，深吸了一口冰冷的空氣。\n混亂的思緒逐漸清晰，恐懼感也消退了不少。",
                onEnter: { varOps: [{key:'sanity', val:10, op:'+'}] },
                options: [{label: "精神飽滿地返回", action: "node_next", nextSceneId: 'rose_hub'}]
            }
        },
        { label: "返回宴會廳", action: "node_next", nextSceneId: 'rose_hub' }
    ]
});
register({
    id: 'rose_library',
    text: [
        "【圖書室】",
        "巨大的桃花心木書架直通天花板，空氣中瀰漫著舊紙張的味道。",
        "這裡平時鮮有人至，是尋找家族黑歷史的最佳場所。"
    ],
    options: [
        // 選項 A: 尋找地圖 (替代管家線的密道獲取方式)
        {
            label: "🔍 翻找建築圖紙 (INT > 7)",
            condition: { noTag: 'secret_passage' }, // 只有沒地圖時才顯示
            check: { stat: 'INT', val: 7 },
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: {
                text: "在一本厚重的《家族建築史》夾層中，你發現了一張發黃的藍圖。\n上面標記著廚房壁爐後方有一條通往河邊的走私密道。\n(獲得標籤：逃生密道)",
                onEnter: { tags: ['secret_passage'] },
                options: [{label: "收好圖紙", action: "node_next", nextSceneId: 'rose_hub'}]
            },
            failScene: {
                text: "書海浩瀚，你翻得頭昏腦脹，除了灰塵什麼也沒找到。",
                rewards: { varOps: [{key:'sanity', val:5, op:'-'}] },
                options: [{label: "放棄尋找", action: "node_next", nextSceneId: 'rose_hub'}]
            }
        },
        // 選項 B: 閱讀戰術書 (提升能力)
        {
            label: "📚 閱讀《權力博弈論》 (INT +1)",
            action: "node_next",
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: {
                text: "你閱讀了關於談判與施壓的章節，感覺對人心的掌控力提升了。",
                onEnter: { 
                    // 這裡假設您的系統有直接加屬性的功能，如果沒有，可以用變數模擬
                    // 或是直接給予威望
                     varOps: [{key:'prestige', val:5, op:'+'}]
                },
                options: [{label: "合上書本", action: "node_next", nextSceneId: 'rose_hub'}]
            }
        },
        { label: "離開圖書室", action: "node_next", nextSceneId: 'rose_hub' }
    ]
});register({
    id: 'rose_gamble',
    text: [
        "【偏廳賭桌】",
        "煙霧繚繞的偏廳裡，幾個紈褲子弟正在玩撲克。",
        "桌上堆滿了金幣和籌碼。這是快速獲取資金的地方，也是深淵。"
    ],
    options: [
        // 選項 A: 參與賭局
        {
            label: "🎲 加入牌局 (金幣 -10 / LUK檢定)",
            condition: { var: { key: 'gold', val: 10, op: '>=' } },
            check: { stat: 'LUK', val: 5 }, // 運氣檢定
            rewards: { 
                gold: -10, // 入場費
                varOps: [{key:'time_left', val:1, op:'-'}] 
            },
            nextScene: {
                text: "你的運氣好得驚人！連續幾把同花順讓其他人看得目瞪口呆。\n你面前的籌碼堆成了小山。\n(金幣 +50)",
                onEnter: { gold: 50, varOps: [{key:'prestige', val:5, op:'+'}] },
                options: [{label: "見好就收", action: "node_next", nextSceneId: 'rose_hub'}]
            },
            failScene: {
                text: "今晚幸運女神沒有站在你這邊。\n你輸光了手裡的籌碼，還被旁人嘲笑了一番。",
                onEnter: { varOps: [{key:'sanity', val:5, op:'-'}] },
                options: [{label: "灰溜溜地離開", action: "node_next", nextSceneId: 'rose_hub'}]
            }
        },
        // 選項 B: 出千 (高風險)
        {
            label: "🃏 嘗試出千 (AGI > 8)",
            check: { stat: 'AGI', val: 8 },
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: {
                text: "你的手指靈活地換了底牌。沒有人發現破綻。\n你大殺四方，贏走了桌上所有的錢！\n(金幣 +100)",
                onEnter: { gold: 100 },
                options: [{label: "趕緊溜走", action: "node_next", nextSceneId: 'rose_hub'}]
            },
            failScene: {
                text: "「他在袖子裡藏牌！」\n一聲大喝，你被憤怒的賭徒們圍毆了一頓，扔出了偏廳。\n(HP/精力扣除)",
                rewards: { energy: -10, varOps: [{key:'prestige', val:20, op:'-'}] },
                options: [{label: "狼狽爬起", action: "node_next", nextSceneId: 'rose_hub'}]
            }
        },
        { label: "沒興趣", action: "node_next", nextSceneId: 'rose_hub' }
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
				{ label: "--- 模式切換測試 ---", action: "investigate", result: "請選擇要預覽的模式入口：" },
				{ label: "🎲 無盡隨機冒險", action: "node_next", nextSceneId: 'GEN_MODULAR' },
                { label: "📦 快遞驚魂 (懸疑)", action: "node_next", nextSceneId: 'delivery_start' },
                { label: "🐺 狼人殺 (推理)", action: "node_next", nextSceneId: 'wolf_hub' },
                { label: "🐢 海龜湯 (解謎)", action: "node_next", nextSceneId: 'turtle_hub' },
                { label: "🔒 密室逃脫 (探索)", action: "node_next", nextSceneId: 'room_hub' },
                { label: "🌹 測試劇本：豪門夜宴 (Full Feature)", action: "node_next", nextSceneId: 'rose_start' },
                { label: "🚀 跳轉：機械公元", action: "node_next", nextSceneId: 'machine_entry', style: 'primary' },
                { label: "💕 跳轉：后宮帝國", action: "node_next", nextSceneId: 'harem_root', style: 'primary' },
				{ label: "⛪ 告解室的最後一小時 (懸疑)", action: "node_next", nextSceneId: 'confessional_start' },
			]
        }
    ],
    'harem': [ { id: 'harem_root', entry: true } ],
    'machine': [ { id: 'machine_root', entry: true } ]
};

register(window.SCENE_DB['adventurer'][0]);