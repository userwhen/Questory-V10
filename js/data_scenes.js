/* js/data_scenes.js - V61.0 Fixed Hub Linking */

// ============================================================
// 先定義四大劇本的內容物件 (Variables)
// 這樣做可以確保 Hub 按鈕能直接讀取到內容，不會斷鏈
// ============================================================

// 1. 🐢 海龜湯劇本
const SCENE_TURTLE = {
    text: "【湯面】\n一個盲人走進麵館，點了一碗牛肉麵。他吃了一半，突然痛哭流涕，然後自殺了。\n\n(請透過「調查」與「詢問」蒐集線索，還原真相。)",
    options: [
        {
            label: "調查：牛肉麵",
            action: "investigate",
            result: "這碗麵的味道很重，加了很多蔥花和辣油，似乎是為了掩蓋什麼味道。",
            rewards: { tags: ['clue_taste'] }
        },
        {
            label: "調查：盲人",
            action: "investigate",
            result: "他的錢包裡有一張與女朋友的合照，照片背景是大海。",
            rewards: { tags: ['clue_photo'] }
        },
        {
            label: "詢問店員 (需發現照片)",
            condition: { hasTag: 'clue_photo' },
            action: "investigate", // 使用 investigate 原地刷新對話
            result: "店員：「喔，這對情侶以前來過。不過上次他們去海邊玩，好像發生了船難，只有他一個人回來...」\n(獲得線索：船難)",
            rewards: { tags: ['clue_accident'] }
        },
        {
            label: "💡 我知道真相了！(需蒐集所有線索)",
            condition: { hasTag: 'clue_taste', hasTag: 'clue_accident' }, 
            action: "node_next",
            nextScene: {
                text: "請推理：為什麼他吃了麵會自殺？",
                options: [
                    { 
                        label: "麵裡有毒", 
                        action: "investigate", 
                        result: "不對，如果是毒，他不會痛哭。請再想想。" 
                    },
                    { 
                        label: "他發現這不是牛肉", 
                        action: "node_next",
                        nextScene: {
                            text: "沒錯！他在船難時，女朋友曾經煮『牛肉麵』給他吃，騙他是牛肉。現在他吃到真正的牛肉麵，發現味道不一樣，才驚覺當時吃的是...",
                            dialogue: [
                                { speaker: "盲人", text: { zh: "這味道... 不對... 這不是牛肉麵的味道..." } },
                                { speaker: "盲人", text: { zh: "那時候... 她割給我的肉... 難道是..." } },
                                { speaker: "結局", text: { zh: "湯底揭曉：他在荒島上吃的是女友的肉。真相的絕望讓他選擇了自我了斷。" } }
                            ],
                            options: [{ label: "真是個悲傷的故事...", action: "finish_chain", rewards: { exp: 100 } }]
                        }
                    }
                ]
            }
        }
    ]
};

// 2. 🔒 密室逃脫劇本
const SCENE_ROOM = {
    text: "你被困在一個充滿藥水味的房間。門被一道電子鎖鎖住了。",
    options: [
        {
            label: "查看書桌",
            action: "investigate",
            result: "桌上有一本《元素圖鑑》，上面寫著：火(Red) + 水(Blue) = 紫(Purple)。旁邊有一個上鎖的木盒。",
            rewards: { tags: ['room_hint_1'] }
        },
        {
            label: "檢查實驗台",
            action: "investigate",
            result: "燒杯裡插著一把『銀色鑰匙』。",
            rewards: { tags: ['silver_key'] }
        },
        {
            label: "打開木盒 (需銀色鑰匙)",
            condition: { hasTag: 'silver_key' },
            action: "investigate",
            result: "你用銀色鑰匙打開木盒，裡面有一張紙條寫著密碼：『紫色的英文單字長度』。",
            rewards: { tags: ['room_code'] }
        },
        {
            label: "輸入密碼開門 (需獲得密碼)",
            condition: { hasTag: 'room_code' },
            action: "node_next",
            nextScene: {
                text: "密碼提示是：火(Red)+水(Blue)=紫。紫色是 PURPLE。\nPURPLE 有幾個字母？",
                options: [
                    { label: "5", action: "investigate", result: "密碼錯誤！(提示：PURPLE)" },
                    { 
                        label: "6", 
                        action: "node_next", 
                        nextScene: {
                            text: "『嗶！』電子鎖打開了。你成功逃脫！",
                            rewards: { gold: 200, exp: 50, removeTags: ['silver_key', 'room_code', 'room_hint_1'] },
                            options: [{ label: "離開", action: "finish_chain" }]
                        }
                    },
                    { label: "7", action: "investigate", result: "密碼錯誤！(提示：數數看 P-U-R-P-L-E)" }
                ]
            }
        }
    ]
};

// 3. 🐺 狼人殺劇本
const SCENE_WOLF = {
    text: "昨晚村長被殺了。嫌疑人有三個：A、B、C。其中一人是狼人，狼人會說謊，好人說實話。\n\n你必須找出狼人。",
    options: [
        {
            label: "審問 A",
            action: "node_next",
            nextScene: {
                dialogue: [
                    { speaker: "A", text: { zh: "我不是狼人！" } },
                    { speaker: "A", text: { zh: "B 才是狼人，我看見他半夜出門了！" } }
                ],
                options: [{ label: "紀錄證詞：A指控B", action: "investigate", result: "已記錄 A 的證詞。(可繼續審問其他人)", rewards: { tags: ['info_A'] } }]
            }
        },
        {
            label: "審問 B",
            action: "node_next",
            nextScene: {
                dialogue: [
                    { speaker: "B", text: { zh: "A 在說謊！" } },
                    { speaker: "B", text: { zh: "C 是好人，我們昨晚一直在一起喝酒。" } }
                ],
                options: [{ label: "紀錄證詞：B保C", action: "investigate", result: "已記錄 B 的證詞。(可繼續審問其他人)", rewards: { tags: ['info_B'] } }]
            }
        },
        {
            label: "審問 C",
            action: "node_next",
            nextScene: {
                dialogue: [
                    { speaker: "C", text: { zh: "我不知道誰是狼人..." } },
                    { speaker: "C", text: { zh: "但我敢發誓，A 是狼人！" } }
                ],
                options: [{ label: "紀錄證詞：C指控A", action: "investigate", result: "已記錄 C 的證詞。(可繼續審問其他人)", rewards: { tags: ['info_C'] } }]
            }
        },
        {
            label: "⚖️ 開始投票",
            action: "node_next",
            nextScene: {
                text: "整理邏輯：\nA說: B是狼\nB說: C是好人 (且A說謊)\nC說: A是狼\n\n誰是說謊的狼人？",
                options: [
                    { label: "投票給 A", action: "node_next", nextScene: { text: "恭喜！A 是狼人。\n\n邏輯：若A是狼(謊) -> B非狼(真) -> C是好人(真) -> C說A是狼(真)。全體邏輯閉環！", rewards: { exp: 300 }, options: [{label: "破案", action: "finish_chain"}] } },
                    { label: "投票給 B", action: "node_next", nextScene: { text: "B 被處決了... 但他是好人。\n\n邏輯錯誤：若B是狼(謊) -> C是壞人(假) -> C說A是狼(謊) -> A是好人(真) -> A說B是狼(真)。\n這會導致 B 既是狼又是被 A (好人) 指控的狼... 等等，好像也通？\n不，狼人殺只有一狼。若B是狼，C也是壞人，就有兩狼了。所以 B 不可能是狼。", options: [{label: "GG", action: "finish_chain"}] } },
                    { label: "投票給 C", action: "node_next", nextScene: { text: "C 被處決了... 但他是好人。", options: [{label: "GG", action: "finish_chain"}] } }
                ]
            }
        }
    ]
};

// 4. 🌸 紅樓夢劇本
const SCENE_RED = {
    text: "正值暮春時節，落花滿地。你遠遠看見一位女子，肩上擔著花鋤，鋤上掛著花囊，手內拿著花帚。\n\n那是林黛玉。",
    options: [
        {
            label: "靜靜旁觀",
            action: "node_next",
            nextScene: {
                dialogue: [
                    { speaker: "黛玉", text: { zh: "花謝花飛花滿天，紅消香斷有誰憐？" } },
                    { speaker: "黛玉", text: { zh: "遊絲軟繫飄春榭，落絮輕沾撲繡簾..." } },
                    { speaker: "你", text: { zh: "(這就是著名的《葬花吟》... 好美的詞藻，卻也透著無盡的悲涼。)" } }
                ],
                options: [
                    { 
                        label: "上前搭話", 
                        action: "node_next",
                        nextScene: {
                            text: "你忍不住吟道：『儂今葬花人笑痴，他年葬儂知是誰？』\n黛玉聽聞，猛然回頭。",
                            dialogue: [
                                { speaker: "黛玉", text: { zh: "你是何人？為何知曉我心中所想？" } },
                                { speaker: "你", text: { zh: "在下只是一個過客，感嘆姑娘對花的憐惜之情。" } }
                            ],
                            options: [
                                { 
                                    label: "【詩詞挑戰】試著接下一句", 
                                    action: "node_next",
                                    nextScene: {
                                        text: "黛玉低吟：『一朝春盡紅顏老...』\n下一句是？",
                                        options: [
                                            { label: "花落人亡兩不知", isCorrect: true, action: "node_next", nextScene: { text: "黛玉眼中泛起淚光，視你為知音。", rewards: { exp: 50, tags: ['daiyu_friend'] }, options:[{label:"陪她葬花", action:"finish_chain"}] } },
                                            { label: "落花時節又逢君", isCorrect: false, action: "investigate", result: "黛玉眉頭微蹙：「這似乎是杜甫的詩，非我當下心境。」" }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
};


// ============================================================
// 最後：定義 SCENE_DB 並在 Hub 中引用上述變數
// ============================================================
window.SCENE_DB = {
    'adventurer': [
        {
            id: 'root_hub',
            entry: true, // 入口
            text: "你站在命運的十字路口，面前有四扇不同風格的大門。你想體驗哪一段旅程？",
            options: [
                // 這裡我們直接把上面定義好的物件 (SCENE_TURTLE 等) 塞進 nextScene
                // 這樣引擎就會無縫接軌，不會斷掉
                { label: "🐢 海龜湯：半碗牛肉麵", action: "node_next", nextScene: SCENE_TURTLE },
                { label: "🔒 密室逃脫：煉金術士", action: "node_next", nextScene: SCENE_ROOM },
                { label: "🐺 狼人殺：迷霧村莊", action: "node_next", nextScene: SCENE_WOLF },
                { label: "🌸 紅樓夢：黛玉葬花", action: "node_next", nextScene: SCENE_RED },
                { label: "🎲 普通隨機冒險", action: "finish_chain" } 
            ]
        }
    ]
};