/* js/story_data/story_horror.js (V8 雙模式融合終極版：生存箱庭 + 驚悚線性) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    // ==========================================
    // 🚪 1. 箱庭大廳共用選項 (完美連動時間與生存機制)
    // ==========================================
    const horrorHubOptions = [
        { 
            label: "🔍 仔細搜查這個房間 (耗時 1)", 
            action: "advance_chain", 
            rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        },
        { 
            label: "🗺️ 趕快離開，推開新門 (耗時 1)", 
            action: "map_explore_new", 
            rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        }
    ];

    DB.templates = DB.templates || [];
    DB.templates.push(
        // ========================================================================
        // 🟥 【模式 A】生存箱庭模式 (Hub Mode) - 密室逃脫與時間倒數
        // ========================================================================
        
        // --- 🎬 箱庭開場 ---
        {
            type: 'start', id: 'hor_hub_start',
            reqTags: ['horror', 'is_hub_mode'],
            onEnter: { 
                varOps: [
                    { key: 'tension', val: 20, op: 'set', msg: "⚠️ 恐懼開始蔓延..." },
                    { key: 'time_left', val: 3, op: 'set', msg: "⏳ 距離黎明還剩 3 小時" }
                ] 
            },
            dialogue: [
                { text: { zh: "【生存箱庭模式】你不該來這裡的。" } },
                { text: { zh: "在{env_weather}的夜晚，你的車拋錨在了半路。這棟廢棄的{env_building}是你唯一的避難所。" } },
                { text: { zh: "但大門在你身後死死鎖上。黑暗中傳來了令人毛骨悚然的{env_sound}。" } },
                { text: { zh: "你必須在這裡撐過 3 個小時，直到天亮..." } }
            ],
            options: horrorHubOptions
        },

        // --- 🔍 箱庭：染血的置物櫃 ---
        {
            type: 'middle', id: 'hor_hub_bloody_locker',
            reqTags: ['horror', 'is_hub_mode'],
            dialogue: [
                { text: { zh: "你原本想在{env_room}的{env_feature}尋找物資或急救包。" } },
                { text: { zh: "當你拉開門的瞬間，一具被折斷四肢、塞成球狀的屍體滾了出來，砸在你的腳邊！" } },
                { text: { zh: "最可怕的是，屍體的眼睛還在死死盯著你，嘴唇微微抽動。" } }
            ],
            options: [
                { 
                    label: "強忍嘔吐感搜身 (LUK檢定)", check: { stat: 'LUK', val: 6 }, action: "node_next", 
                    rewards: { gold: 30, varOps: [{key: 'tension', val: 10, op: '+'}] },
                    nextScene: { dialogue: [{ text: { zh: "你摸到了一些有用的物資，但這畫面會在你腦海裡盤旋很久。" } }], options: horrorHubOptions }
                },
                { 
                    label: "嚇得跌坐在地連連後退", action: "node_next", 
                    rewards: { varOps: [{key: 'tension', val: 20, op: '+'}] },
                    nextScene: { dialogue: [{ text: { zh: "你狼狽地爬起來，心跳快得像是要炸開。" } }], options: horrorHubOptions }
                }
            ]
        },

        // --- 🔍 箱庭：無形的威脅 ---
        {
            type: 'middle', id: 'hor_hub_invisible',
            reqTags: ['horror', 'is_hub_mode'],
            dialogue: [
                { text: { zh: "{env_pack_sensory}" } },
                { text: { zh: "你什麼都沒看見，但你的脖子突然感受到了一陣冰冷刺骨的吐息。" } },
                { text: { zh: "某個看不見的東西，正緊緊貼在你的背後，跟著你的腳步移動。" } }
            ],
            options: [
                { 
                    label: "裝作沒發現往前走 (VIT檢定)", check: { stat: 'VIT', val: 6 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你強忍恐懼勻速前進。過了一陣子，背後的重量消失了，那東西放過了你。" } }],
                        rewards: { varOps: [{key:'tension', val: 10, op: '-'}] }, // 恐懼下降
                        options: horrorHubOptions 
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "恐懼讓你崩潰，你忍不住瘋狂拍打自己的背！那刺骨的寒意瞬間鑽進了你的骨髓！" } }],
                        rewards: { varOps: [{key:'tension', val: 30, op: '+'}, {key:'hp', val: 10, op: '-'}] },
                        options: horrorHubOptions
                    } 
                },
                { 
                    label: "猛然回頭！", action: "node_next", 
                    rewards: { varOps: [{key:'tension', val: 25, op: '+'}] },
                    nextScene: { dialogue: [{ text: { zh: "背後什麼都沒有！但那股寒意卻深深烙印在你的神經裡。" } }], options: horrorHubOptions }
                }
            ]
        },

        // --- 🔍 箱庭：瘋狂倖存者 ---
        {
            type: 'middle', id: 'hor_hub_mad_survivor',
            reqTags: ['horror', 'is_hub_mode'], excludeTags: ['met_survivor'],
            dialogue: [
                { text: { zh: "你在{env_room}遇到了一名{survivor}。對方緊緊抱著頭，渾身發抖。" } },
                { speaker: "倖存者", text: { zh: "別看牆壁... 牆壁裡有眼睛... 它們會鑽進你的腦子裡！" } },
                { text: { zh: "對方語無倫次地尖叫著，突然拿起一把碎玻璃，開始狂抓自己的臉。" } }
            ],
            options: [
                { 
                    label: "試圖制止對方 (STR檢定)", check: { stat: 'STR', val: 6 }, action: "node_next",
                    rewards: { tags: ['met_survivor'] },
                    nextScene: { dialogue: [{ text: { zh: "你成功奪下玻璃，對方昏死了過去。你稍微感到了一絲心安。" } }], rewards: { varOps: [{key:'tension', val:10, op:'-'}] }, options: horrorHubOptions },
                    failScene: { dialogue: [{ text: { zh: "對方力氣大得驚人，推開你後衝進了黑暗中..." } }], rewards: { varOps: [{key:'tension', val:10, op:'+'}] }, options: horrorHubOptions }
                },
                { 
                    label: "對方沒救了，轉身離開", action: "node_next", 
                    rewards: { varOps: [{key:'tension', val: 15, op: '+'}] },
                    nextScene: { dialogue: [{ text: { zh: "你冷酷地拋下了對方。慘叫聲在背後迴盪。" } }], options: horrorHubOptions }
                }
            ]
        },

        // --- 🚨 箱庭高潮：黎明前的作祟 (Climax) ---
        { 
            type: 'climax', id: 'hor_hub_boss_haunt', 
            reqTags: ['horror', 'is_hub_mode'],
            onEnter: { varOps: [{key: 'time_left', val: 0, op: 'set', msg: "🚨 時間歸零！作祟開始！"}] },
            dialogue: [
                { text: { zh: "整棟{env_building}的{env_sound}瞬間消失，取而代之的是令人窒息的壓迫感。" } },
                { text: { zh: "時間到了。一陣陰風吹過，{horror_chase_start}" } }, 
                { text: { zh: "【{monster}】的作祟正式開始了！你必須活下去！" } }
            ], 
            options: [
                { 
                    label: "死戰到底！(STR檢定)", check: { stat: 'STR', val: 8 }, action: "node_next", 
                    rewards: { exp: 100, gold: 50 },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你拼盡全力擊退了怪物，第一縷曙光終於照進了窗戶！" } }], 
                        options: [{ label: "結束這場惡夢", action: "advance_chain" }] 
                    },
                    failScene: { 
                        dialogue: [{ text: { zh: "你敵不過它... 你的意識逐漸模糊..." } }], 
                        rewards: { varOps: [{key:'hp', val: 50, op: '-'}] }, 
                        options: [{ label: "眼前一黑", action: "advance_chain" }] 
                    }
                },
                { 
                    label: "使用神聖力量驅逐！", condition: { tags: ['bonus_holy'] }, action: "node_next", 
                    rewards: { exp: 200 },
                    nextScene: { dialogue: [{ text: { zh: "聖光爆發，怪物發出淒厲慘叫化為灰燼！" } }], options: [{ label: "完美生還", action: "advance_chain" }]} 
                }
            ] 
        },


        // ========================================================================
        // 🟦 【模式 B】驚悚線性模式 (Linear Mode) - 經典海龜湯與追擊敘事
        // ========================================================================

        // --- 🎬 線性開場 ---
        {
            type: 'start', id: 'hor_lin_setup',
            reqTags: ['horror', 'is_linear_mode'],
            onEnter: { varOps: [{ key: 'tension', val: 10, op: 'set' }] },
            dialogue: [
                { text: { zh: "【線性驚悚模式】這裡本該是你熟悉的{env_room}，但此刻看起來卻異常陌生。" } },
                { text: { zh: "{env_pack_visual}，牆角的陰影似乎比平常更深、更濃。" } },
                { text: { zh: "你停下腳步，總覺得有某種視線正在從{env_feature}的縫隙中窺視著你。" } },
                { speaker: "旁白", text: { zh: "（耳邊傳來一陣若有似無的竊笑聲，聽起來既像老人，又像嬰兒...）" } }
            ],
            options: [
                { label: "強裝鎮定，忽視聲音", action: "advance_chain" },
                { label: "檢查聲音來源", action: "advance_chain", rewards: { tags: ['marked_by_curse'], varOps: [{ key: 'tension', val: 15, op: '+' }] } }
            ]
        },

        // --- 🔪 線性：樓層殺手 (海龜湯) ---
        {
            type: 'middle', id: 'hor_lin_stalk_floor_killer',
            reqTags: ['horror', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "你透過窗戶往下看，街燈下有一個身穿雨衣的{monster}，正用一把{item_physical_state}的斧頭狂砍著地上的血肉。" } },
                { text: { zh: "突然，對方停下動作，緩緩抬起頭，精準無比地與你對上了視線。" } },
                { text: { zh: "一樓樓梯間的感應燈亮起... 幾秒後熄滅，接著二樓的燈亮了... 對方正在數著樓層上來找你！" } }
            ],
            options: [
                { 
                    label: "鎖死房門躲進衣櫃！(AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你剛躲進去，門外就傳來沈重的腳步聲。「叩、叩...」斧頭在門上刮擦著。幾分鐘後，腳步聲終於遠去。" } }],
                        options: [{ label: "趁機溜出去", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你轉身的瞬間，「砰！」門板被劈開！一隻滿佈血絲的眼睛從洞口探了進來！" } }],
                        rewards: { tags: ['risk_high'], varOps: [{key:'tension', val: 20, op: '+'}] },
                        options: [{ label: "破窗逃跑！", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "抄起武器，門後埋伏！(STR檢定)", style: "danger", check: { stat: 'STR', val: 7 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "門推開的瞬間你狠狠砸了下去！對方摔下樓梯，你趁機狂奔逃離。" } }], options: [{ label: "逃脫", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "你反被一腳踹飛，斧頭高高舉起..." } }], rewards: { varOps: [{key:'hp', val: 20, op: '-'}] }, options: [{ label: "死命掙扎", action: "advance_chain" }] }
                }
            ]
        },

        // --- 📷 線性：相機鬼影 ---
        {
            type: 'middle', id: 'hor_lin_stalk_camera',
            reqTags: ['horror', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "周圍的燈光突然全部熄滅。你掏出手機開啟相機的閃光燈，試圖照亮前方的路。" } },
                { text: { zh: "螢幕上顯示著前方的空蕩走廊，但當你把鏡頭稍微偏轉時——" } },
                { text: { zh: "手機螢幕裡，一個高瘦蒼白的人影，就筆直地站在你左肩的正後方！但肉眼卻什麼都沒看見！" } }
            ],
            options: [
                { label: "不回頭，直接轉身揮拳！(STR檢定)", style: "danger", check: { stat: 'STR', val: 6 }, action: "advance_chain" },
                { label: "死盯著螢幕，倒退著走", action: "advance_chain", rewards: { tags: ['risk_high'], varOps: [{key:'tension', val: 15, op: '+'}] } }
            ]
        },

        // --- 🏃 線性：扭曲追跡 ---
        {
            type: 'middle', id: 'hor_lin_psych_stalk',
            reqTags: ['horror', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "走廊彷彿沒有盡頭。身後傳來了急促的{env_sound}。" } },
                { text: { zh: "那聲音極不規律，就像是某種肢體扭曲的怪物，正手腳並用在地上爬行。" } },
                { speaker: "？？？", text: { zh: "嘻嘻... 找到... 你了..." } }
            ],
            options: [
                { label: "屏住呼吸，躲進死角", style: "primary", check: { stat: 'INT', val: 5 }, action: "advance_chain" },
                { label: "不要回頭，狂奔！", action: "advance_chain", rewards: { varOps: [{key:'tension', val: 10, op: '+'}] } }
            ]
        },

        // --- 🚨 線性高潮：直視恐懼 (Climax) ---
        {
            type: 'climax', id: 'hor_lin_climax_look',
            reqTags: ['horror', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "無路可退了。那個【{monster}】就懸掛在天花板上。" } },
                { text: { zh: "對方的頭顱以詭異的角度轉了180度，死白色的眼珠正死死盯著你。" } },
                { text: { zh: "所有的本能都在尖叫：絕對不能和對方對視。" } }
            ],
            options: [
                { 
                    label: "緊閉雙眼，不停祈禱 (LUK檢定)", action: "node_next", check: { stat: 'LUK', val: 5 }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你感到一股冰冷的氣息貼著臉頰滑過... 但最終，對方似乎對靜止的獵物失去了興趣。" } }],
                        options: [{ label: "撐過去了", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你忍不住睜開了一條縫... 一張布滿血絲的臉正貼在你的鼻尖前，露出了裂到耳根的笑容。" } }],
                        rewards: { varOps: [{key:'tension', val: 50, op: '+'}] },
                        options: [{ label: "慘叫", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "用手電筒強光照射對方！", style: "danger", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "光線照亮了對方的全貌——那景象超越了人類理智的極限。" } },
                            { text: { zh: "你的意識在尖叫中斷線了。\n【結局：精神崩潰】" } }
                        ],
                        options: [{ label: "陷入瘋狂", action: "finish_chain" }] 
                    } 
                }
            ]
        },

        // ========================================================================
        // 🏁 【共用尾聲】 (End)
        // ========================================================================
        {
            type: 'end', id: 'hor_shared_end',
            reqTags: ['horror'],
            dialogue: [
                { text: { zh: "不知道過了多久，周圍終於恢復了死寂。你推開大門，衝進了外面的陽光中。" } },
                { text: { zh: "人群的喧囂聲讓你感到一陣恍惚。你以為你逃掉了。" } },
                { text: { zh: "但當你低頭看時，發現自己的腳踝上，多了一個青紫色的手印，而且...還在發燙。" } }
            ],
            options: [{ label: "這只是一個開始...", action: "finish_chain", rewards: { title: "生還者", gold: 30 } }]
        }
    );

    console.log("👻 恐怖驚悚劇本已載入 (V8 雙模式融合終極版)");
})();