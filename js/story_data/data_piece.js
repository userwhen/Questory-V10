/* js/data_piece.js (通用劇本 - V84 相容版) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) return;

    DB.templates.push(
        // ============================================================
        // [通用碎片] 1. 環境描寫
        // ============================================================
        { 
            type: 'univ_filler', 
            id: 'uni_env_normal',
			excludeTag: ['theme_romance',],
            weight: 10,
            dialogue: [
                { text: { zh: "{pattern_look_around}" } }
            ], 
            options: [
                { label: "保持警惕，繼續前進", action: "advance_chain" },
                { label: "仔細觀察周圍 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", rewards: { tags: ['observed'] } }
            ] 
        },
        { 
            type: 'univ_filler', 
            id: 'uni_env_danger',
			excludeTag: ['theme_romance',],
            conditions: { "risk_high": true },
            dialogue: [
                { text: { zh: "你的心跳聲在{base_env_sound}中顯得格外刺耳。" } },
                { text: { zh: "光線在{base_env_light}中扭曲，你總覺得角落裡有東西在看著你。" } },
                { text: { zh: "{pattern_enemy_appear} 不... 仔細一看，那只是{noun_env_feature}投下的陰影。" } }
            ], 
            options: [
                { label: "握緊武器", action: "advance_chain", rewards: { varOps: [{key:'stress', val:5, op:'+'}] } },
                { label: "深呼吸平復心情", action: "advance_chain", rewards: { varOps: [{key:'stress', val:5, op:'-'}] } }
            ] 
        },

        // 3. 物品發現
        { 
            type: 'univ_filler', 
            id: 'uni_item_discovery',
            dialogue: [
                { text: { zh: "你在{noun_env_feature}附近發現了一樣引人注目的東西。" } },
                { text: { zh: "湊近一看，那是一個{combo_item}。" } }
            ], 
            options: [
                { label: "撿起來看看", action: "advance_chain", rewards: { tags: ['found_something', 'item_checked'] } },
                { label: "不要亂碰比較好", action: "advance_chain" }
            ] 
        },

        // 4. 感官敘事
        {
            type: 'univ_filler', 
            id: 'uni_sense_mix',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "{atom_time}，一股{atom_smell}飄了過來，讓你皺起了眉頭。" } },
                { text: { zh: "你停下腳步。{base_env_sound}... 聲音似乎是從{noun_location_room}深處傳來的。" } },
                { text: { zh: "一陣寒意{atom_time}爬上了你的脊椎。這裡肯定發生過什麼。" } }
            ],
            options: [{ label: "循著感覺探索", action: "advance_chain" }]
        },

        // 5. 休息片段
        {
            type: 'univ_filler', 
            id: 'uni_rest_moment',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "連續的探索讓你感到有些疲憊。這裡暫時看起來是安全的。" } },
                { text: { zh: "你靠在{noun_env_feature}旁，稍微整理了一下思緒。" } },
                { text: { zh: "雖然這裡{sentence_env_vibe}，但你必須讓自己冷靜下來。" } }
            ],
            options: [
                { label: "原地休息片刻 (energy+10)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'+'}] } },
                { label: "檢查裝備", action: "advance_chain" }
            ]
        },

        // ============================================================
        // [Safety Net] 全域通用備案
        // ============================================================
        
        // 1. 通用戰鬥備案
        {
            type: 'event_battle',
            id: 'fallback_battle',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "路邊突然衝出了一隻{noun_monster}！" } },
                { text: { zh: "對方似乎飢餓難耐，直接向你發動了攻擊。" } },
                { text: { zh: "避無可避，唯有戰鬥。" } }
            ],
            options: [
                { 
                    label: "正面迎擊", 
                    check: { stat: 'STR', val: 5 }, 
                    action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你費盡九牛二虎之力擊退了對方。" } }], options: [{ label: "繼續前進", action: "advance_chain" }] }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你受了點傷才勉強趕跑對方。" } }], 
                        onEnter: { varOps: [{key:'energy', val:10, op:'-'}] },
                        options: [{ label: "拖著傷軀前進", action: "advance_chain" }] 
                    } 
                },
                { 
                    label: "嘗試逃跑", 
                    check: { stat: 'AGI', val: 5 }, 
                    action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你像風一樣消失在牠的視野中。" } }], options: [{ label: "繼續前進", action: "advance_chain" }] }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你沒能跑掉，被迫捲入苦戰！" } }], 
                        onEnter: { varOps: [{key:'energy', val:15, op:'-'}] },
                        options: [{ label: "死裡逃生", action: "advance_chain" }]
                    } 
                }
            ]
        },

        // 2. 通用高潮備案
        {
            type: 'climax', 
            id: 'fallback_climax',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "終於來到了旅途的終點。" } },
                { text: { zh: "強大的氣息從前方傳來，你知道，最後的試煉就在眼前。" } },
                { text: { zh: "無論勝敗，這都將是決定性的一戰。" } }
            ],
            options: [
                { label: "放手一搏！", style: "danger", action: "finish_chain", nextScene: { dialogue: [{ text: { zh: "戰鬥結束了... 你的命運就此定格。" } }] } }
            ]
        },

        // 3. 通用獎勵/休息備案
        {
            type: 'univ_filler',
            id: 'fallback_rest',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "四周暫時恢復了平靜。" } },
                { text: { zh: "你利用這難得的機會整理裝備，並包紮傷口。" } }
            ],
            options: [{ label: "休息 (energy+10)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'+'}] } }]
        },

        // 4. 通用養成備案
        {
            type: 'raise_climax', 
            id: 'raise_final_battle_low_fame',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "決戰之日來臨，雖然{trainee}的名氣還不足以撼動全場，但這是一次證明自己的機會。" } },
                { text: { zh: "對手{rival}甚至沒有正眼看過來，這份輕視或許能成為反擊的動力。" } },
                { text: { zh: "在此刻，你想向對方說最後一句話是..." } }
            ],
            options: [{ 
                label: "「輸贏不重要，只要發揮出你的全力！」", 
                action: "node_next", 
                rewards: { varOps: [{key:'stress', val:10, op:'-'}] }, 
                nextScene: { 
                    dialogue: [{ text: { zh: "{trainee}深吸了一口氣，點點頭。雖然沒有觀眾的歡呼，但他的眼神依然堅定。" } }],
                    options: [{ label: "迎戰", action: "advance_chain" }]
                } 
            }]
        },

        // 5. 通用戀愛備案
        {
            type: 'love_bond', 
            id: 'rom_bond_normal',
			reqTags: ['romance',],
            dialogue: [
                { text: { zh: "雖然你們還稱不上是親密夥伴，但{lover}似乎有話想對你說。" } },
                { text: { zh: "對方約你在{noun_location_room}見面，表情顯得有些嚴肅。" } },
                { speaker: "{lover}", text: { zh: "關於{rival}的事情... 我覺得你需要知道真相。" } }
            ],
            options: [{ 
                label: "洗耳恭聽", 
                action: "node_next", 
                rewards: { varOps: [{key:'trust', val:5, op:'+'}] }, 
                nextScene: { 
                    dialogue: [{ text: { zh: "你們交換了情報。雖然氣氛有些公事公辦，但這也是一種進展。" } }],
                    options: [{ label: "記在心裡", action: "advance_chain" }]
                } 
            }]
        },

        // ============================================================
        // [任務道具與擴充事件] 
        // ============================================================
        
        {
            type: 'univ_filler',
            id: 'uni_item_key_safe',
			excludeTag: ['theme_romance',],
            weight: 100, 
            conditions: { "exp_puzzle": true, "has_safe_key": false },
            dialogue: [
                { text: { zh: "你在走廊的{noun_env_feature}下面發現了一個閃閃發光的東西。" } },
                { text: { zh: "撿起來一看，是一把造型古老的鑰匙，上面刻著奇怪的花紋。" } },
                { text: { zh: "這該不會就是那個保險箱的鑰匙吧？" } }
            ],
            options: [{ 
                label: "收下鑰匙", 
                action: "node_next", 
                rewards: { tags: ['has_safe_key', 'found_something'] },
                nextScene: { 
                    dialogue: [{ text: { zh: "你把鑰匙放進口袋。現在你可以回去試試看那個保險箱了。" } }],
                    options: [{ label: "繼續探索", action: "advance_chain" }]
                }
            }]
        },
        {
            type: 'univ_filler',
            id: 'uni_item_magnifier',
			excludeTag: ['theme_romance',],
            weight: 80,
            conditions: { "exp_puzzle": true, "has_magnifier": false },
            dialogue: [
                { text: { zh: "經過書房時，你被桌上的一個物件絆倒了。" } },
                { text: { zh: "那是一個做工精良的放大鏡，雖然鏡片有點裂痕，但還能用。" } },
                { text: { zh: "有了這個，或許能看清一些原本忽略的細節。" } }
            ],
            options: [{ label: "裝備放大鏡", action: "advance_chain", rewards: { tags: ['has_magnifier'] } }]
        },
        {
            type: 'univ_filler',
            id: 'uni_event_blackcat',
            dialogue: [
                { text: { zh: "一隻黑貓突然從{noun_env_feature}後面竄出，把你嚇了一跳！" } },
                { text: { zh: "對方停在遠處，用那雙發亮的眼睛死死盯著你，隨後消失在陰影中。" } },
                { text: { zh: "這是不祥的預兆，還是某種指引？" } }
            ],
            options: [
                { label: "別自己嚇自己", action: "advance_chain" },
                { 
                    label: "試著跟上去 (AGI檢定)", 
                    check: { stat: 'AGI', val: 6 }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你追到了轉角，發現地上有一張被撕碎的紙條..." } }],
                        options: [{ label: "撿起紙條", action: "advance_chain" }]
                    }, 
                    rewards: { tags: ['found_scrap'] } 
                }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_event_whisper',
			excludeTag: ['theme_romance',],
            conditions: { "risk_high": true }, 
            dialogue: [
                { text: { zh: "你似乎聽到了有人在耳邊低語... 「回頭...別去...」" } },
                { text: { zh: "你猛然回頭，身後卻只有空蕩蕩的走廊和{noun_env_feature}。" } },
                { text: { zh: "是幻覺嗎？還是你的精神已經開始緊繃了？" } }
            ],
            options: [
                { 
                    label: "保持理智 (SAN檢定)", 
                    check: { stat: 'MND', val: 5 }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你甩了甩頭，將低語聲驅逐出腦海。" } }],
                        options: [{ label: "繼續前進", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "恐懼在心中蔓延..." } }], 
                        onEnter: { varOps: [{key:'stress', val:10, op:'+'}] },
                        options: [{ label: "深呼吸", action: "advance_chain" }]
                    } 
                },
                { label: "大聲喝斥壯膽", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_find_supply',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "在櫃子裡，你幸運地發現了一些急救用品和乾糧。" } },
                { text: { zh: "雖然不多，但足以讓你恢復一些體力。" } },
                { text: { zh: "在這個危險的地方，這些物資比黃金還珍貴。" } }
            ],
            options: [
                { label: "使用急救包 (energy+5)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:5, op:'+'}] } },
                { label: "留著以備不時之需", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_gen_atom_weather_change',
            dialogue: [
                { text: { zh: "天空突然變得陰沉，烏雲遮蔽了光線。" } },
                { text: { zh: "一陣強風吹過，捲起了地上的塵土與落葉。" } },
                { text: { zh: "這種壓抑的感覺，彷彿預示著{noun_monster}或是某種不祥之物的靠近。" } }
            ],
            options: [
                { label: "加快腳步 (消耗精力)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:5, op:'-'}] } },
                { label: "尋找避雨處", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_gen_merchant',
			excludeTag: ['romance',],
            dialogue: [
                { text: { zh: "在路邊，你遇到了一位背著大包小包的神秘行商。" } },
                { speaker: "商人", text: { zh: "嘿，朋友！不管你是{combo_person_titled}還是冒險者，總需要點補給吧？" } },
                { text: { zh: "他展示了一些看起來很實用的物資。" } }
            ],
            options: [
                { 
                    label: "購買補給 (金幣-50)", 
                    condition: { stats: { gold: '>49' } }, 
                    action: "node_next", 
                    rewards: { varOps: [{key:'gold', val:50, op:'-'}, {key:'energy', val:20, op:'+'}] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你買了一些藥水和乾糧，感覺體力恢復了不少。" } }],
                        options: [{ label: "繼續旅程", action: "advance_chain" }]
                    }
                },
                { label: "沒錢，揮手拒絕", action: "advance_chain" },
                { 
                    label: "試圖搶劫 (惡人限定)", 
                    condition: { tags: ['evil'] }, 
                    action: "node_next",
                    rewards: { varOps: [{key:'gold', val:100, op:'+'}] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你搶走了商人的錢袋，他嚇得落荒而逃。你的罪惡感增加了。" } }],
                        options: [{ label: "帶著贓款離開", action: "advance_chain" }]
                    }
                }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_gen_ruins',
			reqTags: ['ancient',],
			excludeTag: ['romance',],
            dialogue: [
                { text: { zh: "你發現了一塊殘破的石碑，上面刻著古老的文字。" } },
                { text: { zh: "雖然大部分已經風化，但隱約能辨認出關於「{combo_item}」的記載。" } },
                { text: { zh: "這或許是關於這個世界歷史的重要線索。" } }
            ],
            options: [
                { 
                    label: "解讀文字 (INT檢定)", 
                    check: { stat: 'INT', val: 5 }, 
                    action: "node_next", 
                    rewards: { gold: 50, tags: ['knowledge_ancient'] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你成功解讀了碑文，獲得了關於古代文明的知識。" } }],
                        options: [{ label: "心滿意足地離開", action: "advance_chain" }]
                    },
                    failScene: { 
                        dialogue: [{ text: { zh: "文字太過古老，你完全看不懂。" } }], 
                        onEnter: { varOps: [{key:'stress', val:5, op:'+'}] },
                        options: [{ label: "放棄解讀", action: "advance_chain" }]
                    }
                },
                { label: "看不懂，離開", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_gen_reflection',
            dialogue: [
                { text: { zh: "周圍暫時沒有危險，難得的寧靜讓你陷入了沉思。" } },
                { text: { zh: "你回想起出發時的初衷，以及這一路上的遭遇。" } },
                { text: { zh: "無論前方有什麼，你都必須堅持下去。" } }
            ],
            options: [
                { label: "自我激勵 (恢復energy)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'+'}] } },
                { 
                    label: "想念心愛的人", 
                    condition: { tags: ['theme_harem'] }, 
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你想起了{lover}的笑容，這給了你無窮的動力。" } }],
                        options: [{ label: "振作精神", action: "advance_chain" }]
                    }
                }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_gen_trap',
			reqTags: ['adventure',],
			excludeTag: ['romance',],
            dialogue: [
                { text: { zh: "小心！你感覺腳下一空！" } },
                { text: { zh: "這是一個隱蔽的{noun_env_feature}陷阱！" } },
                { text: { zh: "一切發生得太快，你必須立刻做出反應！" } }
            ],
            options: [
                { 
                    label: "靈巧閃避 (AGI檢定)", 
                    check: { stat: 'AGI', val: 6 }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你在千鈞一髮之際翻滾躲開了陷阱。好險！" } }],
                        options: [{ label: "繼續前進", action: "advance_chain" }]
                    },
                    failScene: { 
                        dialogue: [{ text: { zh: "你反應不及，重重地摔了一跤。" } }], 
                        onEnter: { varOps: [{key:'energy', val:15, op:'-'}] },
                        options: [{ label: "忍痛爬起", action: "advance_chain" }]
                    }
                },
                { label: "用身體硬抗 (STR檢定)", check: { stat: 'STR', val: 8 }, action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_gen_check_pocket',
			excludeTag: ['romance',],
            dialogue: [
                { text: { zh: "你摸了摸口袋..." } }
            ],
            options: [
                { 
                    label: "我是有錢人！", 
                    condition: { tags: ['trait_rich'] }, 
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你隨手撒了一把金幣，路人紛紛撿拾。" } }],
                        options: [{ label: "得意地離開", action: "advance_chain" }]
                    }
                },
                { label: "好像什麼都沒有", action: "advance_chain" }
            ]
        },
		{type: 'univ_filler',
        id: 'random_tavern_brawl',
        dialogue: [
            { text: "{phrase_brawl_start}{phrase_brawl_mid}" },
            { text: "{phrase_brawl_enemy}{phrase_brawl_end}" }
        ],
        options: [
            { label: "開打！", action: "advance_chain" }
        ]
		},
		{
        id: 'rand_event_horror_chase',
        type: 'encounter_stalk', // 設定關卡類型
        dialogue: [
            // 🌟 這裡就是魔法所在！引擎會自動遞迴拆解它們！
            { text: "{horror_chase_start}" },
            { text: "{horror_chase_action}" },
            { text: "{horror_chase_feel}" }
        ],
        options: [
            { 
                label: "拼命逃跑 (AGI檢定)", 
                check: { stat: 'AGI', val: 5 }, 
                action: "node_next", 
                nextScene: {
                    dialogue: [{ text: "你千鈞一髮之際撞開了旁邊的門，成功甩掉了它。" }],
                    options: [{ label: "喘口氣", action: "advance_chain" }]
                },
                failScene: {
                    dialogue: [{ text: "你被地上的雜物絆倒了！它瞬間追了上來..." }],
                    rewards: { varOps: [{key:'hp', val:10, op:'-'}] },
                    options: [{ label: "死命掙扎", action: "advance_chain" }]
                }
            }
        ]
    }
    );

    console.log("✅ 通用劇本(data_piece)已載入");
})();