/* js/data_piece.js (通用劇本 - V5 語法化完美分類版) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) return;

    DB.templates.push(

        // ============================================================
        // 🔍 【分區 A：探索與發現】 (觀察環境、尋找物品、解謎)
        // 適用：所有主題 (日常、懸疑、冒險皆合理)
        // ============================================================
        
        { 
            type: 'univ_filler', id: 'uni_env_normal', weight: 10,
            dialogue: [
                { text: { zh: "你環顧四周。{env_pack_visual}" } }
            ], 
            options: [
                { label: "保持警惕，繼續前進", action: "advance_chain" },
                { label: "仔細觀察周圍 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", rewards: { tags: ['observed'] } }
            ] 
        },
        { 
            type: 'univ_filler', id: 'uni_item_discovery', weight: 15,
            dialogue: [
                { text: { zh: "你在{env_feature}附近發現了一樣引人注目的東西。" } },
                { text: { zh: "{phrase_find_action}" } },
                { text: { zh: "竟然是{combo_item_desc}" } }
            ], 
            options: [
                { label: "撿起來收好", action: "advance_chain", rewards: { tags: ['item_found'] } },
                { label: "不要亂碰比較好", action: "advance_chain" }
            ] 
        },
        {
            type: 'univ_filler', id: 'gen_event_mechanism', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "你注意到前方有一個奇怪的裝置。在{env_light}的映照下，這東西顯得格格不入。" } },
                { text: { zh: "它似乎隱藏著某種規律，或者是一個未解的謎題。" } }
            ],
            options: [
                { 
                    label: "嘗試破解它 (INT檢定)", check: { stat: 'INT', val: 6 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "伴隨著一聲清脆的喀噠聲，裝置被你解開了，裡面藏著一些有用的物資！" } }], rewards: { gold: 30 }, options: [{label: "收下物資", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你弄錯了順序，裝置直接卡死，甚至發出了警告的聲響。" } }], rewards: { varOps: [{key:'stress', val:5, op:'+'}] }, options: [{label: "退後", action: "advance_chain"}] }
                },
                { label: "不要節外生枝", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_lore_discovery', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "你在{env_feature}發現了一些奇怪的痕跡。{phrase_find_action}" } },
                { text: { zh: "那似乎是某種過去遺留下來的線索，隱約記載著一段不為人知的故事。" } }
            ],
            options: [
                { 
                    label: "仔細研究 (INT檢定)", check: { stat: 'INT', val: 7 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你成功解讀了這些痕跡，獲得了隱秘的知識！" } }], rewards: { exp: 50, tags: ['knowledge_found'] }, options: [{label: "收穫滿滿", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "這些線索太過零碎，看得你頭昏腦脹。" } }], rewards: { varOps: [{key:'energy', val:5, op:'-'}] }, options: [{label: "移開視線", action: "advance_chain"}] }
                },
                { label: "沒時間看這些，繼續走", action: "advance_chain" }
            ]
        },

        // ============================================================
        // 🌫️ 【分區 B：遊蕩與異象】 (氣氛營造、懸疑感、天氣變化)
        // 適用：所有主題 (取代原本的戰鬥與怪物追逐)
        // ============================================================

        { 
            type: 'univ_filler', id: 'uni_env_danger', weight: 15,
            conditions: { "risk_high": true },
            dialogue: [
                { text: { zh: "你的心跳聲與環境的{env_sound}交織在一起，顯得格外刺耳。" } },
                { text: { zh: "在{env_light}的映照下，你總覺得角落裡有東西在看著你。" } },
                { text: { zh: "突然，{sentence_encounter} 不... 仔細一看，那只是{env_feature}投下的陰影。虛驚一場。" } }
            ], 
            options: [
                { label: "深呼吸平復心情", action: "advance_chain", rewards: { varOps: [{key:'stress', val:5, op:'-'}] } },
                { label: "加快腳步離開這", action: "advance_chain" }
            ] 
        },
        {
            type: 'univ_filler', id: 'uni_sense_mix', weight: 10,
            dialogue: [
                { text: { zh: "{atom_time}，空氣中瀰漫著{env_smell}，讓你忍不住皺起了眉頭。" } },
                { text: { zh: "你停下腳步。{env_sound}... 聲音似乎是從深處傳來的。" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [{ label: "循著感覺探索", action: "advance_chain" }]
        },
        {
            type: 'univ_filler', id: 'gen_event_env_shift', weight: 10,
            dialogue: [
                { text: { zh: "{atom_time}，周圍的環境發生了變化。{env_pack_visual}" } },
                { text: { zh: "這種壓抑的感覺簡直快讓人喘不過氣來。" } }
            ],
            options: [
                { label: "咬牙硬撐 (MND檢定)", check: { stat: 'MND', val: 5 }, action: "advance_chain", failScene: { dialogue: [{ text: { zh: "不安感不可遏制地蔓延開來。" } }], rewards: { varOps: [{key:'sanity', val:10, op:'-'}] }, options: [{label: "繼續走", action: "advance_chain"}] } },
                { label: "閉上眼，在心裡默念", action: "advance_chain", rewards: { varOps: [{key:'energy', val:5, op:'-'}] } } 
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_stalker_sense', weight: 10,
            dialogue: [
                { text: { zh: "{env_pack_sensory}" } },
                { text: { zh: "有什麼東西，或者什麼人，正在靠近。" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [
                { 
                    label: "躲進陰影中 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你完美地與黑暗融為一體，躲過了未知的視線。" } }], options: [{label: "安全了", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你在躲藏時不小心弄出了聲響！腳步聲立刻朝你逼近，你只好匆忙逃離！" } }], rewards: { varOps: [{key:'energy', val:15, op:'-'}] }, options: [{label: "拼命逃離", action: "advance_chain"}] }
                }
            ]
        },

        // ============================================================
        // 🏕️ 【分區 C：休憩與整理】 (恢復體力、整理物資、心理描寫)
        // 適用：所有主題 (作為劇情節奏的緩衝點)
        // ============================================================

        {
            type: 'univ_filler', id: 'uni_rest_moment', weight: 15,
            dialogue: [
                { text: { zh: "連續的行動讓你感到有些疲憊。這裡暫時看起來是安全的。" } },
                { text: { zh: "你靠在{env_feature}旁，稍微整理了一下思緒。" } },
                { text: { zh: "雖然{env_pack_sensory}，但你必須讓自己冷靜下來。" } }
            ],
            options: [
                { label: "原地休息片刻 (精+10)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'+'}] } },
                { label: "檢查身上物品", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_tempting_rest', weight: 10,
            dialogue: [
                { text: { zh: "你來到一個相對安靜的{env_room}。{env_pack_visual}" } },
                { text: { zh: "這裡有一個看起來還算完好的{env_feature}。" } },
                { text: { zh: "你已經很疲憊了，或許可以稍微休息一下？" } }
            ],
            options: [
                { 
                    label: "放心睡一覺 (賭運氣)", check: { stat: 'LUK', val: 5 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "這是一次難得的好眠，你感覺精力充沛。" } }], rewards: { varOps: [{key:'energy', val:30, op:'+'}] }, options: [{label: "起身出發", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你閉上眼沒多久，就被遠處的動靜驚醒，根本無法好好休息。" } }], rewards: { varOps: [{key:'sanity', val:5, op:'-'}] }, options: [{label: "無奈起身", action: "advance_chain"}] }
                },
                { label: "保持警惕，只稍微坐一下", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'+'}] } }
            ]
        },
        {
            type: 'univ_filler', id: 'uni_gen_reflection', weight: 10,
            dialogue: [
                { text: { zh: "周圍暫時沒有危機，難得的寧靜讓你陷入了沉思。" } },
                { text: { zh: "你回想起出發時的初衷，以及這一路上的種種。" } },
                { text: { zh: "無論前方有什麼，你都必須堅持下去。" } }
            ],
            options: [
                { label: "自我激勵 (恢復精力)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'+'}] } },
                { 
                    label: "想念心裡的那個人", 
                    condition: { tags: ['theme_romance'] },  // 戀愛劇本專屬選項
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你想起了對方的笑容，這給了你無窮的動力。" } }],
                        options: [{ label: "振作精神", action: "advance_chain" }]
                    }
                }
            ]
        },
        {
            type: 'univ_filler', id: 'uni_gen_check_pocket', weight: 10,
            dialogue: [
                { text: { zh: "你摸了摸口袋..." } }
            ],
            options: [
                { 
                    label: "我是有錢人！", 
                    condition: { tags: ['trait_rich'] }, 
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你摸到了沉甸甸的金幣，心裡踏實了不少。" } }],
                        options: [{ label: "得意地笑", action: "advance_chain" }]
                    }
                },
                { label: "好像什麼都沒有", action: "advance_chain" }
            ]
        },

        // ============================================================
        // 💬 【分區 D：社交與邂逅】 (NPC互動、神秘人物、商人)
        // 適用：所有主題 (使用 combo_person_appearance 動態生成外觀)
        // ============================================================

        {
            type: 'univ_filler', id: 'gen_encounter_merchant', weight: 10,
            dialogue: [
                { text: { zh: "在前方，你遇到了一個背著大包小包的人。那是一名商人，對方手中把玩著一個{combo_item_simple}。" } },
                { speaker: "商人", text: { zh: "嘿，朋友！出門在外，總需要點補給吧？" } },
                { text: { zh: "對方熱情地展示了一些看起來很實用的物資。" } }
            ],
            options: [
                { 
                    label: "購買補給 (金幣-30)", 
                    condition: { stats: { gold: '>29' } }, 
                    action: "node_next", 
                    rewards: { varOps: [{key:'gold', val:30, op:'-'}, {key:'energy', val:20, op:'+'}] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你買了一些必需品，感覺體力恢復了不少。" } }],
                        options: [{ label: "繼續旅程", action: "advance_chain" }]
                    }
                },
                { label: "沒錢，揮手拒絕", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_weird_npc', weight: 10,
            dialogue: [
                { text: { zh: "在{env_feature}附近，你遇到了一個人。那是{combo_person_appearance}" } },
                { text: { zh: "{phrase_social_action}" } },
                { text: { zh: "你不知道對方是抱持著善意還是惡意。" } }
            ],
            options: [
                { 
                    label: "試著搭話 (CHR檢定)", check: { stat: 'CHR', val: 5 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "對方放下了戒心，甚至給你指引了一條明路。" } }], rewards: { exp: 20 }, options: [{label: "道謝後離開", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "對方對你的態度感到反感，冷冷地轉身離開了。" } }], options: [{label: "看著對方走遠", action: "advance_chain"}] }
                },
                { label: "保持距離，繞道而行", action: "advance_chain" }
            ]
        },
		// ============================================================
        // 🧭 【分類 A：探索與發現】 (純環境與物品互動)
        // ============================================================
        { 
            type: 'univ_filler', id: 'rand_explore_normal', weight: 15,
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "{phrase_explore_vibe}" } }
            ], 
            options: [
                { label: "保持警惕，繼續前進", action: "advance_chain" },
                { label: "仔細觀察周圍 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", rewards: { tags: ['observed'] } }
            ] 
        },
        { 
            type: 'univ_filler', id: 'rand_explore_find_item', weight: 15,
            dialogue: [
                { text: { zh: "{phrase_find_action}" } },
                { text: { zh: "{phrase_find_result}" } },
                { text: { zh: "{sentence_tension}" } } // 使用 core 裡的 sentence_tension 取代舊版
            ], 
            options: [
                { label: "收進背包", action: "advance_chain", rewards: { tags: ['item_found'], varOps: [{key:'gold', val:15, op:'+'}] } },
                { label: "太可疑了，不要亂碰", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:5, op:'+'}] } }
            ] 
        },

        // ============================================================
        // ⚠️ 【分類 B：異象與高壓】 (心理恐懼、環境異變)
        // ============================================================
        { 
            type: 'univ_filler', id: 'rand_tension_event', weight: 10,
            dialogue: [
                { text: { zh: "{phrase_danger_warn}" } },
                { text: { zh: "{sentence_tension}" } }
            ], 
            options: [
                { label: "深呼吸平復心情 (MND檢定)", check: { stat: 'MND', val: 5 }, action: "advance_chain", failScene: { dialogue: [{ text: { zh: "恐懼揮之不去..." } }], rewards: { varOps: [{key:'energy', val:5, op:'-'}] } } },
                { label: "立刻拔出武器警戒", action: "advance_chain" }
            ] 
        },

        // ============================================================
        // ⚔️ 【分類 C：遭遇與衝突】 (戰鬥、突發事件)
        // ============================================================
        {
            type: 'univ_filler', id: 'rand_combat_ambush', weight: 10,
            excludeTags: ['theme_romance', 'theme_raising'], 
            dialogue: [
                { text: { zh: "{phrase_explore_vibe}" } },
                { text: { zh: "{phrase_danger_warn}" } },
                { text: { zh: "{phrase_danger_appear}" } }
            ],
            options: [
                { label: "正面迎擊！(STR檢定)", check: { stat: 'STR', val: 5 }, action: "advance_chain", rewards: { exp: 20 }, failScene: { dialogue: [{ text: { zh: "你被打退了，受了點傷！" } }], rewards: { varOps: [{key:'hp', val:10, op:'-'}] } } },
                { label: "冷靜撤退 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain", failScene: { dialogue: [{ text: { zh: "你沒能跑掉，被迫捲入混戰！" } }], rewards: { varOps: [{key:'energy', val:15, op:'-'}] } } }
            ]
        },
        {
            type: 'univ_filler', id: 'random_combat_sudden', weight: 5,
            excludeTags: ['theme_romance', 'theme_raising'],
            dialogue: [
                // 替換酒館鬥毆：用 core 裡現有的衝突語句
                { text: { zh: "{sentence_event_sudden}" } },
                { text: { zh: "{sentence_encounter}" } },
                { text: { zh: "{phrase_combat_start}" } }
            ],
            options: [
                { label: "開打！(STR)", check: { stat: 'STR', val: 6 }, action: "advance_chain", rewards: { exp: 30 } },
                { label: "趁亂繞過去 (AGI)", check: { stat: 'AGI', val: 6 }, action: "advance_chain", rewards: { gold: 20 } }
            ]
        },
        {
            type: 'univ_filler', id: 'rand_event_horror_chase', weight: 5,
            reqTags: ['risk_high'], 
            dialogue: [
                // 嚴格對齊 core 中的 horror_chase_start 與 sentence_tension
                { text: { zh: "{horror_chase_start}" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [
                { 
                    label: "拼命逃跑 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你千鈞一髮之際撞開了旁邊的門，成功甩掉了對方。" } }], options: [{ label: "大口喘氣", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "你被地上的雜物絆倒了！對方瞬間追了上來..." } }], rewards: { varOps: [{key:'hp', val:15, op:'-'}] }, options: [{ label: "死命掙扎", action: "advance_chain" }] }
                }
            ]
        },

        // ============================================================
        // 💬 【分類 D：社交與人際】 (NPC互動、情報交流)
        // ============================================================
        {
            type: 'univ_filler', id: 'rand_social_conflict', weight: 10,
            dialogue: [
                // 利用人物登場與心理壓力句型來建構社交情境
                { text: { zh: "{combo_person_appearance}" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [
                { label: "靜觀其變", action: "advance_chain" },
                { label: "上前搭話 (CHR檢定)", check: { stat: 'CHR', val: 5 }, action: "advance_chain", rewards: { varOps: [{key:'trust', val:10, op:'+'}] } }
            ]
        },
		
		{ 
		type: 'univ_filler', 
		id: 'map_event_creepy_doll', 
		weight: 15,
		// 【動態文本】利用你的 V5 詞庫，自動生成場景與物品
		dialogue: [
			{ text: { zh: "{atom_time}，你正在觀察這個房間。" } },
			{ text: { zh: "{env_pack_visual}" } }, // 隨機視覺描述
			{ text: { zh: "突然，你在{env_feature}發現了{combo_item_desc}" } } // 隨機生成物品與能力描述
		], 
		options: [
			// 玩家專屬選項 (處理完這些，玩家就可以點擊下方自動生成的開門選項)
			{ 
				label: "小心翼翼地收起 (AGI檢定)", 
				check: { stat: 'AGI', val: 5 }, 
				action: "advance_chain", 
				rewards: { tags: ['item_found'], gold: 15 } 
			},
			{ 
				label: "這東西太邪門了，不要碰", 
				action: "advance_chain", 
				rewards: { varOps: [{key:'sanity', val:5, op:'+'}] } 
			}
			// 💡 引擎魔法：MapManager 會在這裡自動幫你加上：
			// [🚪 推開未知的門 (探索新房間)]
			// [🔙 退回 [大廳]]
		] 
		},
        // ============================================================
        // 🛠️ 【系統測試區】 (保留用於診斷 Context Injection)
        // ============================================================
        {
            type: 'univ_filler', id: 'test_context_injection', weight: 10000, 
            dialogue: [
                { text: { zh: "【系統診斷】你走進房間，前方出現了一個{core_identity}！" } }
            ],
            options: [
                {
                    label: "🗣️ 上前攀談 (系統判定：對方帶有 human 標籤)",
                    condition: { tags: ['human'] }, 
                    action: "advance_chain"
                },
                {
                    label: "⚔️ 拔出銀劍 (系統判定：對方帶有 monster 標籤)",
                    condition: { tags: ['monster'] }, 
                    action: "advance_chain"
                },
                {
                    label: "🏃 轉身就跑 (通用選項)",
                    action: "advance_chain" 
                }
            ]
        }
    );

    console.log("✅ 通用劇本(data_piece V5 完美分類版)已載入");
})();