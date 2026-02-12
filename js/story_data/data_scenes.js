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
// 2. 第一章：地下室驚悚 (Puzzle & Stat Check)
// ============================================================
register({
    id: 'rose_cellar_1',
    text: [
        "這裡似乎是家族廢棄的地下酒窖。微弱的燭光在牆上投下扭曲的影子。",
        "面前是一扇厚重的橡木門，門鎖上積滿了灰塵。",
        "角落裡有一具穿著僕人衣服的白骨，手裡似乎死死抓著什麼東西。"
    ],
    options: [
        // [測試功能] Investigate (原地查看) + Tag (獲得道具) + SAN值扣除
        { 
            label: "💀 搜查白骨 (SAN -10)", 
            condition: { noTag: 'has_key' },
            action: "investigate", 
            rewards: { 
                tags: ['has_key'], 
                varOps: [{key:'sanity', val:10, op:'-'}] 
            },
            result: "你強忍著恐懼掰開了白骨的手指。指骨斷裂的脆響讓你頭皮發麻。\n你獲得了【黃銅鑰匙】。" 
        },
        
        // [測試功能] Check (數值檢定) + FailScene
        { 
            label: "💪 嘗試撞門 (STR > 8)", 
            check: { stat: 'STR', val: 8 }, 
            nextScene: { text: "轟！腐朽的門框經不起你的怪力，應聲而破。", options: [{label:"逃離", action:"node_next", nextSceneId:'rose_hallway'}] }, 
            failScene: { text: "你狠狠撞在門上，肩膀傳來劇痛。門紋絲不動，嘲笑著你的無力。", rewards: { varOps: [{key:'sanity', val:5, op:'-'}] } } 
        },

        // [測試功能] Condition (條件解鎖)
        { 
            label: "🗝️ 使用鑰匙", 
            condition: { hasTag: 'has_key' }, 
            action: "node_next", 
            nextScene: { text: "鑰匙轉動時發出刺耳的摩擦聲。鎖開了。", options: [{label:"逃離", action:"node_next", nextSceneId:'rose_hallway'}] } 
        }
    ]
});

register({
    id: 'rose_hallway',
    text: [
        "你跌跌撞撞地逃出酒窖，外面是富麗堂皇卻冷清的長廊。",
        "牆上的掛鐘指向八點。壽宴即將開始。",
        "你整理了一下衣衫，洗去臉上的灰塵，眼神逐漸變得冰冷。今晚，你要拿回屬於你的東西。"
    ],
    options: [
        { label: "推開宴會廳大門", action: "node_next", nextSceneId: 'rose_hub' }
    ]
});

// ============================================================
// 3. 第二章：豪門夜宴 (Turn-based Sim / Hub Loop)
// ============================================================
register({
    id: 'rose_hub',
    // 每次進入 HUB 都顯示當前狀態
    text: [
        "【宴會廳】",
        "衣香鬢影，觥籌交錯。沒有人注意到你是剛從地獄爬回來的。",
        "距離家主宣布繼承人還有 {time_left} 個時辰。",
        "📊 當前狀態：威望 {prestige} | SAN值 {sanity} | 金幣 {gold} | 🌹管家好感 {favor_butler}"
    ],
    options: [
        // 1. 強制觸發：時間耗盡
        {
            label: "⏳ 鐘聲響起 (結算)",
            style: "danger",
            condition: { var: { key: 'time_left', val: 0, op: '<=' } },
            action: "node_next",
            nextSceneId: 'rose_climax'
        },

        // 2. 養成選項：社交 (提升威望)
        {
            label: "🗣️ 與賓客周旋 (威望+10 / 耗時1)",
            condition: { var: { key: 'time_left', val: 1, op: '>=' } },
            action: "node_next",
            rewards: { varOps: [{key:'prestige', val:10, op:'+'}, {key:'time_left', val:1, op:'-'}] },
            nextScene: { 
                text: "你巧妙地遊走在賓客之間，散播著對大哥不利的流言。\n眾人看你的眼神多了幾分敬畏。", 
                options: [{label:"繼續", action:"node_next", nextSceneId:'rose_hub'}] 
            }
        },

        // 3. 戀愛/交易選項：管家 (商店機制)
        {
            label: "🌹 尋找管家 (商店/戀愛)",
            condition: { var: { key: 'time_left', val: 1, op: '>=' } }, // 這裡不扣時間，進去再扣
            action: "node_next",
            nextSceneId: 'rose_butler_interaction'
        },

        // 4. 宮鬥選項：對峙大哥 (高風險)
        {
            label: "⚔️ 挑釁大哥 (INT檢定 / 耗時1)",
            condition: { var: { key: 'time_left', val: 1, op: '>=' } },
            action: "node_next",
            nextSceneId: 'rose_brother_fight'
        },

        // 5. 鎖定選項：拜見家主 (需要高威望)
        // [測試功能] Locked Action
        {
            label: "🐉 拜見家主 (🔒 需威望 50)",
            style: "disabled",
            condition: { var: { key: 'prestige', val: 50, op: '<' } },
            action: "locked",
            msg: "家主的保鏢攔住了你：「老爺只見有身份的人。」"
        },
        {
            label: "🐉 拜見家主 (獻上證據)",
            style: "primary",
            condition: { 
                vars: [
                    { key: 'prestige', val: 50, op: '>=' },
                    { key: 'time_left', val: 1, op: '>=' }
                ]
            },
            action: "node_next",
            nextSceneId: 'rose_master_meet'
        }
    ]
});

// --- 子場景：管家互動 (Shop & Romance) ---
register({
    id: 'rose_butler_interaction',
    text: [
        "年輕英俊的管家將你拉到角落，嘴角帶著玩味的笑。",
        "「三少爺/小姐，您看起來需要一點幫助？」"
    ],
    options: [
        // 交易：買情報
        {
            label: "💰 購買大哥的把柄 (金幣-30)",
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
            nextScene: { text: "管家遞給你一張藥單：「大少爺最近買了不少砒霜。」\n(獲得關鍵道具：毒藥證據)", options: [{label:"返回", action:"node_next", nextSceneId:'rose_hub'}]}
        },
        // 沒錢買
        {
            label: "💰 購買大哥的把柄 (🔒 金幣不足)",
            style: "disabled",
            condition: { 
                noTag: 'evidence_poison',
                var: { key: 'gold', val: 30, op: '<' }
            },
            action: "locked",
            msg: "管家笑了：「情報可是很貴的。」"
        },
        // 戀愛：調情
        {
            label: "💕 稱讚他的忠誠 (魅力檢定)",
            check: { stat: 'CHR', val: 6 },
            action: "node_next",
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] }, // 耗時
            nextScene: { 
                text: "你輕輕整理他的領帶。他耳根紅了。\n「我只對您一人忠誠。」\n(好感度 +20)", 
                rewards: { varOps: [{key:'favor_butler', val:20, op:'+'}] },
                options: [{label:"返回", action:"node_next", nextSceneId:'rose_hub'}]
            },
            failScene: {
                text: "他禮貌地後退一步：「請您自重。」\n(好感度不變)",
                options: [{label:"返回", action:"node_next", nextSceneId:'rose_hub'}]
            }
        },
        { label: "沒事", action: "node_next", nextSceneId: 'rose_hub' }
    ]
});

// --- 子場景：大哥對峙 (Risk Reward) ---
register({
    id: 'rose_brother_fight',
    text: "大哥端著酒杯走來，眼中滿是惡毒：「地窖的老鼠也配上桌吃飯？」",
    options: [
        {
            label: "忍氣吞聲 (SAN -20)",
            action: "node_next",
            rewards: { varOps: [{key:'sanity', val:20, op:'-'}, {key:'time_left', val:1, op:'-'}] },
            nextScene: { text: "你低下了頭。大哥得意地大笑離去。\n雖然屈辱，但你保存了實力。", options: [{label:"返回", action:"node_next", nextSceneId:'rose_hub'}]}
        },
        {
            label: "反唇相譏 (INT > 7)",
            check: { stat: 'INT', val: 7 },
            rewards: { varOps: [{key:'time_left', val:1, op:'-'}] },
            nextScene: { 
                text: "你冷冷地回擊：「總比偷吃家產的蛀蟲好。」\n周圍賓客發出竊笑。大哥臉色鐵青地走了。\n(威望 +20)", 
                rewards: { varOps: [{key:'prestige', val:20, op:'+'}] },
                options: [{label:"返回", action:"node_next", nextSceneId:'rose_hub'}]
            },
            failScene: {
                text: "你試圖反駁，卻結結巴巴。大哥當眾羞辱了你一番。\n(威望 -10)",
                rewards: { varOps: [{key:'prestige', val:10, op:'-'}] },
                options: [{label:"返回", action:"node_next", nextSceneId:'rose_hub'}]
            }
        }
    ]
});

// --- 子場景：拜見家主 (True End Route) ---
register({
    id: 'rose_master_meet',
    text: "家主書房。老人咳著血，看著你遞上來的毒藥單據（如果有）。\n「原來...那個逆子...」",
    options: [
        {
            label: "承諾守護家族",
            action: "node_next",
            rewards: { tags: ['heir_approved'], varOps: [{key:'time_left', val:99, op:'set'}] }, // 強制讓時間歸零進結局? 不，這裡是消耗時間
            nextScene: { 
                text: "家主將一枚玉扳指交給你。\n「活下去...這家業...是你的了。」\n(獲得關鍵標籤：繼承認可)", 
                options: [{label:"返回宴會廳等待結局", action:"node_next", nextSceneId:'rose_hub'}]
            }
        }
    ]
});

// ============================================================
// 4. 終章：血色黎明 (Endings)
// ============================================================
register({
    id: 'rose_climax',
    text: [
        "【終章：審判時刻】",
        "午夜鐘聲響起。家主突然口吐白沫，倒地身亡！",
        "大哥指著你大喊：「是他！是他從地窖逃出來殺了父親！」",
        "全場目光聚焦在你身上。這是決定命運的瞬間。"
    ],
    options: [
        // 結局 A: 繼承家業 (True End)
        {
            label: "👑 展示家主信物 (需繼承認可)",
            style: "primary",
            condition: { hasTag: 'heir_approved' },
            action: "finish_chain",
            nextScene: { 
                text: "你亮出了玉扳指，並甩出了大哥買毒藥的證據。\n「逆子弒父，證據確鑿！」\n衛兵拿下了大哥。你坐在了家主的位置上，俯瞰著曾經蔑視你的人。\n【結局：血色權杖】",
                rewards: { exp: 2000, title: "豪門家主" }
            }
        },
        
        // 結局 B: 私奔 (Romance End)
        {
            label: "🌹 與管家殺出重圍 (需好感 > 50)",
            style: "danger",
            condition: { var: { key: 'favor_butler', val: 50, op: '>=' } },
            action: "finish_chain",
            nextScene: { 
                text: "管家突然拔槍，射倒了試圖靠近你的衛兵。\n「走！」\n火光中，你們跳上了停在門外的汽車。雖然失去了家產，但你獲得了自由與愛。\n【結局：亂世鴛鴦】",
                rewards: { exp: 1000 }
            }
        },

        // 結局 C: 壞結局 (Bad End)
        {
            label: "無力辯解...",
            action: "finish_chain",
            nextScene: { 
                text: "你試圖解釋，但聲音被憤怒的人群淹沒。\n沒有權力，沒有盟友，真相便無人關心。\n你被拖了下去，消失在雷雨夜中。\n【結局：無名之鬼】",
                rewards: { energy: -20 }
            }
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
				{ label: "--- 模式切換測試 ---", action: "investigate", result: "請選擇要預覽的模式入口：" },
                { label: "📦 快遞驚魂 (懸疑)", action: "node_next", nextSceneId: 'delivery_start' },
                { label: "🐺 狼人殺 (推理)", action: "node_next", nextSceneId: 'wolf_hub' },
                { label: "🐢 海龜湯 (解謎)", action: "node_next", nextSceneId: 'turtle_hub' },
                { label: "🔒 密室逃脫 (探索)", action: "node_next", nextSceneId: 'room_hub' },
                { label: "🎲 無盡隨機冒險", action: "node_next", nextSceneId: 'GEN_MODULAR' },
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