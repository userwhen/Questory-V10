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
    },
	{
            type: 'univ_filler',
            id: 'random_explore_ambush',
            dialogue: [
                // 第一句：過場 + 氛圍 (例如：瞬間，你輕步走進了廢棄的地下室。這裡空氣中瀰漫著霉味...)
                { text: { zh: "{phrase_explore_start}{phrase_explore_vibe}" } },
                
                // 第二句：心理壓力 + 危機預警 (例如：手心裡全是汗水... 就在這時，角落傳來了不尋常的動靜。)
                { text: { zh: "{phrase_tension_body}{phrase_danger_warn}" } },

                // 第三句：敵人現身 (例如：一個狂暴的狼人從陰影中竄了出來...)
                { text: { zh: "{phrase_danger_appear}" } }
            ],
            options: [
                { label: "準備戰鬥", action: "advance_chain", rewards: { varOps: [{key:'stress', val:10, op:'+'}] } },
                { label: "冷靜撤退 (AGI)", check: { stat: 'AGI', val: 5 }, action: "advance_chain" }
            ]
        },
		{
            type: 'univ_filler',
            id: 'random_social_conflict',
            dialogue: [
                // 例如：氣氛瞬間降至冰點。這句話就像一顆炸彈...
                { text: { zh: "{phrase_tension_mind}{phrase_social_action}" } },
                
                // 例如：周圍的流浪者紛紛轉過頭來... 對方發出一聲冷笑。
                { text: { zh: "{phrase_social_react}" } }
            ],
            options: [
                { label: "靜觀其變", action: "advance_chain" },
                { label: "強勢回擊 (CHR)", check: { stat: 'CHR', val: 5 }, action: "advance_chain" }
            ]
        },
		// ==========================================
        // 🔮 [嵌套句型隨機庫] 10 個通用事件
        // ==========================================

        // 1. 致命的誘惑 (物品發現與陷阱博弈)
        {
            type: 'univ_filler', id: 'gen_event_lure', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_explore_start}{phrase_find_action}" } },
                { text: { zh: "{phrase_find_result}它在{atom_light}下散發著微弱的光芒。" } },
                { text: { zh: "{phrase_tension_mind}" } }
            ],
            options: [
                { 
                    label: "小心翼翼地拿走 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你動作輕柔地取走了物品，沒有觸發任何機關。" } }], rewards: { gold: 30, tags: ['item_found'] }, options: [{label: "離開", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你的手一抖！{sentence_event}！某種機關被觸發了！" } }], rewards: { varOps: [{key:'energy', val:15, op:'-'}] }, options: [{label: "狼狽逃脫", action: "advance_chain"}] }
                },
                { label: "太可疑了，直接無視", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:5, op:'+'}] } } // 忍住誘惑恢復理智
            ]
        },

        // 2. 虛驚一場 (氣氛堆疊與釋放)
        {
            type: 'univ_filler', id: 'gen_event_false_alarm', weight: 15,
            dialogue: [
                { text: { zh: "{phrase_explore_vibe}{phrase_danger_warn}" } },
                { text: { zh: "{phrase_tension_body}" } },
                { text: { zh: "你猛然回頭，卻發現只是一陣風吹落了{noun_env_feature}上的雜物。虛驚一場。" } }
            ],
            options: [
                { label: "鬆了一口氣", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:5, op:'-'}] } }, // 雖然沒事但被嚇到了
                { label: "深呼吸，平復心跳", action: "advance_chain" }
            ]
        },

        // 3. 突發遭遇戰 (純戰鬥)
        {
            type: 'univ_filler', id: 'gen_event_sudden_combat', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_danger_warn}{phrase_danger_appear}" } },
                { text: { zh: "{phrase_tension_mind}你別無選擇！" } }
            ],
            options: [
                { 
                    label: "正面迎擊！(STR檢定)", check: { stat: 'STR', val: 6 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你怒吼著發動攻擊，成功將對方擊退！" } }], rewards: { exp: 50 }, options: [{label: "繼續前進", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "對方的力量遠超你的想像，你被打飛了出去！" } }], rewards: { varOps: [{key:'hp', val:15, op:'-'}] }, options: [{label: "負傷撤退", action: "advance_chain"}] }
                },
                { label: "丟出誘餌轉移注意 (消耗金幣)", condition: { stats: { gold: '>9' } }, action: "advance_chain", rewards: { gold: -10 } }
            ]
        },

        // 4. 神秘的陌生人 (社交互動)
        {
            type: 'univ_filler', id: 'gen_event_weird_npc', weight: 10,
            dialogue: [
                { text: { zh: "在{noun_location_room}的{atom_feature}，你遇到了一個{noun_npc_generic}。" } },
                { text: { zh: "{phrase_social_react}{phrase_social_action}" } },
                { text: { zh: "你不知道對方是敵是友。" } }
            ],
            options: [
                { 
                    label: "試著搭話 (CHR檢定)", check: { stat: 'CHR', val: 5 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "對方放下了戒心，甚至給了你一些有用的物資。" } }], rewards: { varOps: [{key:'energy', val:20, op:'+'}] }, options: [{label: "道謝後離開", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "對方對你的態度感到反感，{atom_manner}轉身離開了。" } }], options: [{label: "看著對方走遠", action: "advance_chain"}] }
                },
                { label: "保持距離，繞道而行", action: "advance_chain" }
            ]
        },

        // 5. 古老的遺留物 (知識與理智的考驗)
        {
            type: 'univ_filler', id: 'gen_event_lore_discovery', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "你在{noun_env_feature}發現了一些奇怪的痕跡。{phrase_find_action}" } },
                { text: { zh: "那似乎是某種古老儀式的殘留，牆上還刻著詭異的符號。" } }
            ],
            options: [
                { 
                    label: "仔細研究符號 (INT檢定)", check: { stat: 'INT', val: 7 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你解開了符號的含義，獲得了隱秘的知識！" } }], rewards: { exp: 100, tags: ['knowledge_ancient'] }, options: [{label: "收穫滿滿", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "盯著這些扭曲的圖案看太久，讓你的大腦一陣刺痛。" } }], rewards: { varOps: [{key:'sanity', val:10, op:'-'}] }, options: [{label: "移開視線", action: "advance_chain"}] }
                },
                { label: "這東西不吉利，別碰為妙", action: "advance_chain" }
            ]
        },

        // 6. 環境異變 (純氛圍壓力)
        {
            type: 'univ_filler', id: 'gen_event_env_shift', weight: 10,
            dialogue: [
                { text: { zh: "{atom_time}，周圍的環境發生了變化。{sentence_env_vibe}" } },
                { text: { zh: "{phrase_tension_body}這種壓抑的感覺簡直快把人逼瘋了。" } }
            ],
            options: [
                { label: "咬牙硬撐 (SAN檢定)", check: { stat: 'LUK', val: 4 }, action: "advance_chain", failScene: { dialogue: [{ text: { zh: "恐懼不可遏制地蔓延開來。" } }], rewards: { varOps: [{key:'sanity', val:15, op:'-'}] }, options: [{label: "繼續走", action: "advance_chain"}] } },
                { label: "閉上眼，在心裡默念咒語", action: "advance_chain", rewards: { varOps: [{key:'energy', val:5, op:'-'}] } } // 消耗體力換取精神穩定
            ]
        },

        // 7. 被窺視的感覺 (潛行檢定)
        {
            type: 'univ_filler', id: 'gen_event_stalker_sense', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_explore_vibe}" } },
                { text: { zh: "{sentence_perception}。有什麼東西正在靠近。" } },
                { text: { zh: "{phrase_tension_mind}" } }
            ],
            options: [
                { 
                    label: "躲進陰影中 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你完美地與黑暗融為一體，那東西沒有發現你，逕直走了過去。" } }], options: [{label: "安全了", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你在躲藏時不小心弄出了{atom_sound}！那東西立刻朝你衝來！" } }], rewards: { varOps: [{key:'hp', val:10, op:'-'}], tags: ['danger_high'] }, options: [{label: "拼命逃離", action: "advance_chain"}] }
                }
            ]
        },

        // 8. 詭異的機關
        {
            type: 'univ_filler', id: 'gen_event_mechanism', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "你注意到前方有一個奇怪的裝置。{phrase_find_result}" } },
                { text: { zh: "{sentence_event}！它似乎正在運轉。" } }
            ],
            options: [
                { 
                    label: "嘗試破壞它 (STR檢定)", check: { stat: 'STR', val: 7 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你暴力拆解了裝置，從裡面掉落了一些有價值的零件。" } }], rewards: { gold: 40 }, options: [{label: "收下零件", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "裝置異常堅固，你的攻擊反而觸發了防禦機制，遭到了電擊！" } }], rewards: { varOps: [{key:'hp', val:15, op:'-'}] }, options: [{label: "退後", action: "advance_chain"}] }
                },
                { label: "不要節外生枝", action: "advance_chain" }
            ]
        },

        // 9. 誘人的休憩點
        {
            type: 'univ_filler', id: 'gen_event_tempting_rest', weight: 10,
            dialogue: [
                { text: { zh: "你來到一個相對安靜的{noun_location_room}。{sentence_env_vibe}" } },
                { text: { zh: "這裡有一個看起來還算完好的{atom_feature}。" } },
                { text: { zh: "你已經很疲憊了，或許可以稍微休息一下？" } }
            ],
            options: [
                { 
                    label: "放心睡一覺 (賭運氣)", check: { stat: 'LUK', val: 5 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "這是一次難得的好眠，你感覺精力充沛。" } }], rewards: { varOps: [{key:'energy', val:30, op:'+'}] }, options: [{label: "起身出發", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你睡到一半，突然被{atom_sound}驚醒！有東西在附近！根本無法休息。" } }], rewards: { varOps: [{key:'sanity', val:10, op:'-'}] }, options: [{label: "拿起武器", action: "advance_chain"}] }
                },
                { label: "保持警惕，只稍微坐一下", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'+'}] } }
            ]
        },

        // 10. 駭人的殘骸
        {
            type: 'univ_filler', id: 'gen_event_creepy_remnant', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "{phrase_find_action}那裡散落著一些無法辨認的殘骸和血跡。" } },
                { text: { zh: "這顯然是{noun_monster}留下的傑作。{phrase_tension_body}" } }
            ],
            options: [
                { 
                    label: "強忍噁心搜索殘骸 (LUK檢定)", check: { stat: 'LUK', val: 6 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你在血泊中找到了一枚未受損的戒指。" } }], rewards: { gold: 50, varOps: [{key:'sanity', val:5, op:'-'}] }, options: [{label: "擦乾淨收好", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你什麼也沒找到，反而被殘忍的景象刺激得嘔吐起來。" } }], rewards: { varOps: [{key:'sanity', val:15, op:'-'}] }, options: [{label: "狼狽離開", action: "advance_chain"}] }
                },
                { label: "快步離開這裡", action: "advance_chain" }
            ]
        },
    );

    console.log("✅ 通用劇本(data_piece)已載入");
})();