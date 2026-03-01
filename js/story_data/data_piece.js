/* js/data_piece.js (萬用通用劇本 - V8 終極動態拼圖與數值驅動版) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) return;

    DB.templates.push(

        // ============================================================
        // 🧭 【分類 A：探索與發現】 (純環境與物品互動)
        // ============================================================
        { 
            type: 'univ_filler', id: 'uni_env_normal',
            onEnter: { varOps: [{ key: 'energy', val: 1, op: '-', msg: "👣 探索消耗了些許體力" }] },
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "{phrase_explore_vibe}" } }
            ], 
            options: [
                { label: "保持警惕，繼續前進", action: "advance_chain" },
                { label: "仔細觀察周圍 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", rewards: { exp: 10 } }
            ] 
        },
        { 
            type: 'univ_filler', id: 'uni_item_discovery',
            dialogue: [
                { text: { zh: "你在{env_feature}附近發現了一樣引人注目的東西。" } },
                { text: { zh: "{phrase_find_action}" } },
                { text: { zh: "竟然是{combo_item_desc}" } }
            ], 
            options: [
                { label: "收進背包", action: "advance_chain", rewards: { tags: ['{combo_item_simple}'], gold: 10 } },
                { label: "不要亂碰比較好", action: "advance_chain", rewards: { energy: 5 } }
            ] 
        },
        {
            type: 'univ_filler', id: 'gen_event_mechanism',
            onEnter: { varOps: [{ key: 'energy', val: 2, op: '-' }] },
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "你注意到前方有一個奇怪的裝置。在{env_light}的映照下，這東西顯得格格不入。" } },
                { text: { zh: "它似乎隱藏著某種規律，或者是一個未解的謎題。" } }
            ],
            options: [
                { 
                    label: "嘗試破解它 (INT檢定)", check: { stat: 'INT', val: 6 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "伴隨著一聲清脆的喀噠聲，裝置被你解開了，裡面藏著一些有用的物資！" } }], rewards: { gold: 30, exp: 20 }, options: [{label: "收下物資", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你弄錯了順序，裝置直接卡死，甚至發出了警告的聲響。" } }], rewards: { energy: -10 }, options: [{label: "趕緊退後", action: "advance_chain"}] }
                },
                { label: "不要節外生枝", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_lore_discovery',
            dialogue: [
                { text: { zh: "{phrase_explore_vibe}" } },
                { text: { zh: "你在{env_feature}發現了一些奇怪的痕跡。{phrase_find_action}" } },
                { text: { zh: "那似乎是某種過去遺留下來的線索，隱約記載著一段不為人知的故事。" } }
            ],
            options: [
                { 
                    label: "仔細研究 (INT檢定)", check: { stat: 'INT', val: 7 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你成功解讀了這些痕跡，獲得了隱秘的知識！" } }], rewards: { exp: 50 }, options: [{label: "收穫滿滿", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "這些線索太過零碎，看得你頭昏腦脹。" } }], rewards: { energy: -5 }, options: [{label: "移開視線", action: "advance_chain"}] }
                },
                { label: "沒時間看這些，繼續走", action: "advance_chain" }
            ]
        },
        { 
            type: 'univ_filler', id: 'rand_explore_normal',
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "{phrase_explore_vibe}" } }
            ], 
            options: [
                { label: "繼續前進", action: "advance_chain" },
                { label: "環顧四周 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", rewards: { exp: 10, energy: -2 } }
            ] 
        },
        { 
            type: 'univ_filler', id: 'rand_explore_find_item',
            dialogue: [
                { text: { zh: "{phrase_find_action}" } },
                { text: { zh: "{phrase_find_result}" } },
                { text: { zh: "{sentence_tension}" } } 
            ], 
            options: [
                { label: "迅速收起", action: "advance_chain", rewards: { tags: ['{combo_item_simple}'], gold: 15 } },
                { label: "太可疑了，直接無視", action: "advance_chain", rewards: { energy: 5 } }
            ] 
        },
        { 
            type: 'univ_filler', id: 'uni_explore_vibe',
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "{phrase_explore_vibe}" } }
            ], 
            options: [
                { label: "安靜通過", action: "advance_chain" },
                { 
                    label: "仔細搜索 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", 
                    rewards: { exp: 15, gold: 5 },
                    failScene: { dialogue: [{ text: { zh: "你什麼也沒發現，白白浪費了體力。" } }], rewards: { energy: -5 } }
                }
            ] 
        },
        {
            type: 'univ_filler', id: 'uni_find_item',
            dialogue: [
                { text: { zh: "{phrase_find_action}" } },
                { text: { zh: "{phrase_find_result}" } }
            ],
            options: [
                { label: "收進背包", action: "advance_chain", rewards: { tags: ['{combo_item_simple}'], gold: 10 } },
                { label: "不要節外生枝", action: "advance_chain" }
            ]
        },
        { 
            type: 'univ_filler', id: 'map_event_creepy_doll',
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "{phrase_explore_vibe}" } }, 
                { text: { zh: "突然，你在{env_feature}發現了{combo_item_desc}" } } 
            ], 
            options: [
                { label: "小心翼翼地收起 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain", rewards: { tags: ['{combo_item_simple}'], gold: 15 } },
                { label: "這東西太怪了，不要碰", action: "advance_chain", rewards: { energy: 5 } }
            ] 
        },

        // ============================================================
        // ⚠️ 【分類 B：異象與高壓】 (心理恐懼、環境異變)
        // ============================================================
        { 
            type: 'univ_filler', id: 'uni_env_danger',
            onEnter: { varOps: [{ key: 'energy', val: 2, op: '-', msg: "⚠️ 氣氛變得異常沉重" }] },
            dialogue: [
                { text: { zh: "你的心跳聲與環境的{env_sound}交織在一起，顯得格外刺耳。" } },
                { text: { zh: "在{env_light}的映照下，你總覺得角落裡有東西在看著你。" } },
                { text: { zh: "突然，{sentence_encounter} 不... 仔細一看，那只是{env_feature}投下的陰影。虛驚一場。" } }
            ], 
            options: [
                { label: "深呼吸平復心情", action: "advance_chain", rewards: { energy: 10 } },
                { label: "加快腳步離開這", action: "advance_chain", rewards: { energy: -5, exp: 5 } }
            ] 
        },
        {
            type: 'univ_filler', id: 'uni_sense_mix',
            dialogue: [
                { text: { zh: "{atom_time}，空氣中瀰漫著{env_smell}，讓你忍不住皺起了眉頭。" } },
                { text: { zh: "你停下腳步。{env_sound}... 聲音似乎是從深處傳來的。" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [{ label: "循著感覺探索", action: "advance_chain" }]
        },
        {
            type: 'univ_filler', id: 'gen_event_env_shift',
            dialogue: [
                { text: { zh: "{atom_time}，周圍的環境發生了變化。{env_pack_visual}" } },
                { text: { zh: "這種壓抑的感覺簡直快讓人喘不過氣來。" } }
            ],
            options: [
                { label: "咬牙硬撐 (VIT檢定)", check: { stat: 'VIT', val: 5 }, action: "advance_chain", rewards: { exp: 15 }, failScene: { dialogue: [{ text: { zh: "不安感不可遏制地蔓延開來。" } }], rewards: { energy: -15 }, options: [{label: "繼續走", action: "advance_chain"}] } },
                { label: "閉上眼，在心裡默念", action: "advance_chain", rewards: { energy: -5 } } 
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_stalker_sense',
            dialogue: [
                { text: { zh: "{env_pack_sensory}" } },
                { text: { zh: "有什麼東西，或者什麼人，正在靠近。" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [
                { 
                    label: "躲進陰影中 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你完美地與黑暗融為一體，躲過了未知的視線。" } }], rewards: { exp: 20 }, options: [{label: "安全了", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你在躲藏時不小心弄出了聲響！腳步聲立刻朝你逼近，你只好匆忙逃離！" } }], rewards: { energy: -20 }, options: [{label: "拼命逃離", action: "advance_chain"}] }
                }
            ]
        },
        { 
            type: 'univ_filler', id: 'rand_tension_event',
			reqTags: ['risk_high'],
            dialogue: [
                { text: { zh: "{phrase_danger_warn}" } },
                { text: { zh: "{sentence_tension}" } }
            ], 
            options: [
                { label: "深呼吸平復心情 (VIT檢定)", check: { stat: 'VIT', val: 5 }, action: "advance_chain", rewards: { energy: 10 }, failScene: { dialogue: [{ text: { zh: "恐懼揮之不去..." } }], rewards: { energy: -10 } } },
                { label: "立刻拔出武器警戒", action: "advance_chain", rewards: { exp: 5 } }
            ] 
        },
        { 
            type: 'univ_filler', id: 'uni_danger_tension',
            dialogue: [
                { text: { zh: "{phrase_danger_warn}" } },
                { text: { zh: "{sentence_tension}" } }
            ], 
            options: [
                { label: "深呼吸冷靜 (VIT檢定)", check: { stat: 'VIT', val: 5 }, action: "advance_chain", rewards: { energy: 10 }, failScene: { dialogue: [{ text: { zh: "恐懼揮之不去，你感到異常疲憊。" } }], rewards: { energy: -15 } } },
                { label: "立刻進入備戰狀態", action: "advance_chain", rewards: { exp: 10 } }
            ] 
        },

        // ============================================================
        // ⚔️ 【分類 C：遭遇與衝突】 (戰鬥、突發事件)
        // ============================================================
        {
            type: 'univ_filler', id: 'rand_combat_ambush',
            onEnter: { varOps: [{ key: 'energy', val: 3, op: '-', msg: "⚠️ 遭遇突發狀況！" }] },
            dialogue: [
                { text: { zh: "{phrase_explore_vibe}" } },
                { text: { zh: "{phrase_danger_warn}" } },
                { text: { zh: "{phrase_danger_appear}" } }
            ],
            options: [
                { label: "正面迎擊！(STR檢定)", check: { stat: 'STR', val: 5 }, action: "advance_chain", rewards: { exp: 30, gold: 15 }, failScene: { dialogue: [{ text: { zh: "你被打退了，受了點傷！" } }], rewards: { energy: -20 } } },
                { label: "冷靜撤退 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain", rewards: { exp: 10 }, failScene: { dialogue: [{ text: { zh: "你沒能跑掉，被迫捲入混戰！" } }], rewards: { energy: -25 } } }
            ]
        },
        {
            type: 'univ_filler', id: 'random_combat_sudden',
            dialogue: [
                { text: { zh: "{sentence_event_sudden}" } },
                { text: { zh: "{sentence_encounter}" } },
                { text: { zh: "{phrase_combat_start}" } }
            ],
            options: [
                { label: "開打！(STR檢定)", check: { stat: 'STR', val: 6 }, action: "advance_chain", rewards: { exp: 30 }, failScene: { dialogue: [{ text: { zh: "戰鬥比想像中艱難。" } }], rewards: { energy: -15 } } },
                { label: "趁亂繞過去 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "advance_chain", rewards: { gold: 20 }, failScene: { dialogue: [{ text: { zh: "你被發現了，只能強行突破。" } }], rewards: { energy: -20 } } }
            ]
        },
        {
            type: 'univ_filler', id: 'rand_event_horror_chase',
			reqTags: ['risk_high'],
            dialogue: [
                { text: { zh: "{horror_chase_start}" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [
                { 
                    label: "拼命逃跑 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你千鈞一髮之際撞開了旁邊的門，成功甩掉了對方。" } }], rewards: { exp: 20 }, options: [{ label: "大口喘氣", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "你被地上的雜物絆倒了！對方瞬間追了上來..." } }], rewards: { energy: -30 }, options: [{ label: "死命掙扎", action: "advance_chain" }] }
                }
            ]
        },
        {
            type: 'univ_filler', id: 'uni_encounter_sudden',
            dialogue: [
                { text: { zh: "{phrase_explore_vibe}" } },
                { text: { zh: "{phrase_danger_appear}" } },
                { text: { zh: "{phrase_combat_start}" } }
            ],
            options: [
                { label: "正面迎擊！(STR檢定)", check: { stat: 'STR', val: 6 }, action: "advance_chain", rewards: { exp: 25, gold: 10 }, failScene: { dialogue: [{ text: { zh: "你被打退了，消耗了大量體力！" } }], rewards: { energy: -25 } } },
                { label: "冷靜撤退 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "advance_chain", rewards: { exp: 10 }, failScene: { dialogue: [{ text: { zh: "你沒能跑掉，被迫捲入混戰！" } }], rewards: { energy: -30 } } }
            ]
        },

        // ============================================================
        // 🏕️ 【分類 D：休憩與整理】 (恢復體力、整理物資、心理描寫)
        // ============================================================
        {
            type: 'univ_filler', id: 'uni_rest_moment',
            dialogue: [
                { text: { zh: "連續的行動讓你感到有些疲憊。這裡暫時看起來是安全的。" } },
                { text: { zh: "你靠在{env_feature}旁，稍微整理了一下思緒。" } },
                { text: { zh: "雖然{env_pack_sensory}，但你必須讓自己冷靜下來。" } }
            ],
            options: [
                { label: "原地休息片刻 (恢復精力)", action: "advance_chain", rewards: { energy: 15 } },
                { label: "檢查身上裝備", action: "advance_chain", rewards: { exp: 5 } }
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_tempting_rest',
            dialogue: [
                { text: { zh: "你來到一個相對安靜的{env_room}。{env_pack_visual}" } },
                { text: { zh: "這裡有一個看起來還算完好的{env_feature}。" } },
                { text: { zh: "你已經很疲憊了，或許可以稍微休息一下？" } }
            ],
            options: [
                { 
                    label: "放心睡一覺 (LUK檢定)", check: { stat: 'LUK', val: 5 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "這是一次難得的好眠，你感覺精力充沛。" } }], rewards: { energy: 30 }, options: [{label: "起身出發", action: "advance_chain"}] },
                    failScene: { dialogue: [{ text: { zh: "你閉上眼沒多久，就被遠處的動靜驚醒，根本無法好好休息。" } }], rewards: { energy: -5 }, options: [{label: "無奈起身", action: "advance_chain"}] }
                },
                { label: "保持警惕，只稍微坐一下", action: "advance_chain", rewards: { energy: 10 } }
            ]
        },
        {
            type: 'univ_filler', id: 'uni_gen_reflection',
            dialogue: [
                { text: { zh: "周圍暫時沒有危機，難得的寧靜讓你陷入了沉思。" } },
                { text: { zh: "你回想起出發時的初衷，以及這一路上的種種。" } },
                { text: { zh: "無論前方有什麼，你都必須堅持下去。" } }
            ],
            options: [
                { label: "自我激勵 (恢復精力)", action: "advance_chain", rewards: { energy: 10 } },
                { 
                    label: "回憶起心裡的那個人", 
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你想起了對方的身影，這給了你無窮的動力。" } }],
                        rewards: { energy: 5, exp: 10 },
                        options: [{ label: "振作精神", action: "advance_chain" }]
                    }
                }
            ]
        },
        {
            type: 'univ_filler', id: 'uni_gen_check_pocket',
            dialogue: [
                { text: { zh: "你摸了摸口袋..." } }
            ],
            options: [
                { 
                    label: "仔細翻找角落 (LUK檢定)", check: { stat: 'LUK', val: 5 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "你摸到了幾枚被人遺忘的金幣，心裡踏實了不少。" } }], rewards: { gold: 20 }, options: [{ label: "得意地笑", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "口袋裡空空如也，甚至還破了個洞。" } }], rewards: { energy: -2 }, options: [{ label: "無奈嘆氣", action: "advance_chain" }] }
                },
                { label: "算了，繼續前進", action: "advance_chain" }
            ]
        },

        // ============================================================
        // 💬 【分類 E：社交與邂逅】 (NPC互動、情報交流)
        // ============================================================
        {
            type: 'univ_filler', id: 'gen_encounter_merchant',
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
                    rewards: { gold: -30, energy: 30 },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你買了一些必需品，感覺體力恢復了不少。" } }],
                        options: [{ label: "繼續旅程", action: "advance_chain" }]
                    }
                },
                { label: "沒錢，揮手拒絕", action: "advance_chain" }
            ]
        },
        {
            type: 'univ_filler', id: 'gen_event_weird_npc',
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
        {
            type: 'univ_filler', id: 'rand_social_conflict',
            dialogue: [
                { text: { zh: "{combo_person_appearance}" } },
                { text: { zh: "{sentence_tension}" } }
            ],
            options: [
                { label: "靜觀其變", action: "advance_chain" },
                { label: "上前搭話 (CHR檢定)", check: { stat: 'CHR', val: 5 }, action: "advance_chain", rewards: { exp: 15, gold: 10 }, failScene: { dialogue: [{ text: { zh: "交涉失敗，氣氛變得更尷尬了。" } }], rewards: { energy: -5 } } }
            ]
        },
        {
            type: 'univ_filler', id: 'uni_social_encounter',
            dialogue: [
                { text: { zh: "{phrase_explore_start}" } },
                { text: { zh: "前方出現了一個人影... 是{combo_person_appearance}。" } },
                { text: { zh: "{phrase_social_action}" } },
                { text: { zh: "{phrase_social_react}" } }
            ],
            options: [
                { 
                    label: "友善搭話 (CHR檢定)", check: { stat: 'CHR', val: 5 }, action: "advance_chain", 
                    rewards: { exp: 15, energy: 10 }, 
                    failScene: { dialogue: [{ text: { zh: "對方毫不理睬你，轉身離去。" } }] } 
                },
                { label: "保持戒備，安靜離開", action: "advance_chain" }
            ]
        }
    );

    console.log("✅ 萬用劇本(data_piece V8 終極動態拼圖與數值驅動版) 已載入");
})();