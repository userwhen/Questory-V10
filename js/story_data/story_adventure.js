/* js/story_data/story_adventure.js - V1.0
 * 冒險劇本節點
 *
 * 核心機制：
 *   skill_points  → 冒險過程中積累，決定最終能否打敗 BOSS
 *   puzzle_solved → 解謎成功的標記，解鎖高潮的「知識解法」選項
 *   boss_weakness → 找到 BOSS 弱點，讓戰鬥成功率大幅提升
 *
 * 路線（由開場選擇）：
 *   route_explorer → 解謎/探索為主，古墓奇兵風格
 *   route_warrior  → 戰鬥成長為主，打怪練功風格
 *   （兩條路線的中段節點大量共用，差異在 climax 的決勝判定）
 *
 * 與其他劇本的共用節點（reqTags 標記說明）：
 *   reqTags: ['adventure']              → 只有冒險劇本觸發
 *   reqTags: ['adventure', 'horror']    → 冒險與恐怖共用
 *   reqTags: ['adventure', 'mystery']   → 冒險與偵探共用
 *   reqTags: ['adventure', 'horror', 'mystery'] → 三個劇本都能觸發
 *
 * 技能成長與養成劇本的連結：
 *   skill_points 變數在養成劇本的 climax 同樣被讀取
 *   因此冒險中練到的技能，可以直接帶進養成模式的最終考驗
 */
(function () {
    const DB = window.FragmentDB;
    if (!DB) { console.error("❌ story_adventure.js: FragmentDB 未就緒"); return; }

    DB.templates = DB.templates || [];


    // ============================================================
    // 🎬 [START] 開場節點 × 3
    // ============================================================

    // START-A：探索古蹟（解謎路線導向）
    DB.templates.push({
        id: 'adv_start_ruin',
        type: 'start',
        reqTags: ['adventure'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 0,  op: 'set' },
                { key: 'puzzle_count', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{weather}的{atmosphere}之中，古老的{env_building}終於出現在你眼前。<br><br>傳說中，{boss}就藏在這裡最深的地方。<br>{world_state}的時代裡，能到達這裡的人已經不多了。<br><br>{env_pack_visual}"
                }
            }
        ],
        options: [
            {
                label: "循著古地圖的指示深入（探索路線）",
                action: "advance_chain",
                rewards: {
                    tags: ["route_explorer"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                }
            },
            {
                label: "直接突破，以武力開路（戰士路線）",
                action: "advance_chain",
                rewards: {
                    tags: ["route_warrior"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                }
            }
        ]
    });

    // START-B：接受委託，深入危地
    DB.templates.push({
        id: 'adv_start_quest',
        type: 'start',
        reqTags: ['adventure'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 5,  op: 'set' },
                { key: 'puzzle_count', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "委託書上只寫了兩件事：目的地，以及報酬。<br><br>你帶著{start_bonus}武器，踏入了{env_building}。<br>據說{boss}已經在這裡盤踞多年，沒有人能將它驅逐。<br><br>也許你是第一個真正有機會的人。"
                }
            }
        ],
        options: [
            {
                label: "先偵察地形，再制定策略（探索路線）",
                action: "advance_chain",
                rewards: {
                    tags: ["route_explorer", "has_preparation"],
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                }
            },
            {
                label: "直接進去找{boss}（戰士路線）",
                action: "advance_chain",
                rewards: {
                    tags: ["route_warrior"],
                    varOps: [{ key: 'skill_points', val: 3, op: '+' }]
                }
            }
        ]
    });

    // START-C：意外發現，被捲入其中
    DB.templates.push({
        id: 'adv_start_accidental',
        type: 'start',
        reqTags: ['adventure'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 0,  op: 'set' },
                { key: 'puzzle_count', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你本來只是路過。<br><br>但{env_pack_sensory}<br><br>然後是{sentence_event_sudden}<br><br>{env_building}的入口就在你面前，某種東西把你往裡面拉。<br>這不是偶然，你感覺得到。"
                }
            }
        ],
        options: [
            {
                label: "跟著感覺走，深入調查（探索路線）",
                action: "advance_chain",
                rewards: { tags: ["route_explorer"] }
            },
            {
                label: "直覺告訴你要戰鬥，準備好武器（戰士路線）",
                action: "advance_chain",
                rewards: { tags: ["route_warrior"] }
            }
        ]
    });


    // ============================================================
    // 🗺️ [MIDDLE - 探索路線] 解謎與偵察
    //    reqTags: ['adventure', 'route_explorer']
    // ============================================================

    // MIDDLE-探索-A：古代謎題（密室逃脫風格）
    DB.templates.push({
        id: 'adv_mid_exp_puzzle',
        type: 'middle',
        reqTags: ['adventure', 'route_explorer'],
        excludeTags: ['solved_main_puzzle'],
        dialogue: [
            {
                text: {
                    zh: "前方的通道被一道石門封死。<br><br>門上刻著複雜的圖案——這是某種謎題。<br><br>{env_pack_visual}<br><br>旁邊的石壁上，隱約有文字：<br>「{world_vibe}的時代裡，強者並非用力量開路，<br>而是用他所知道的去解開束縛。」"
                }
            }
        ],
        options: [
            {
                label: "仔細分析圖案的規律（INT 檢定）",
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                rewards: {
                    tags: ["solved_main_puzzle", "puzzle_solved"],
                    varOps: [
                        { key: 'skill_points', val: 20, op: '+' },
                        { key: 'puzzle_count', val: 1,  op: '+' }
                    ],
                    exp: 25
                },
                successText: "石門緩緩移動。你找到了規律——這個謎題的答案藏在{world_vibe}的歷史典故裡。"
            },
            {
                label: "用蠻力砸開（STR 檢定，但會觸發陷阱）",
                check: { stat: 'STR', val: 6 },
                action: "advance_chain",
                rewards: {
                    tags: ["solved_main_puzzle"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                },
                successText: "你砸開了石門，但觸動了某個機關——{sentence_event_sudden}"
            },
            {
                label: "先繞路，找其他線索再回來",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'skill_points', val: 3, op: '+' }] }
            }
        ]
    });

    // MIDDLE-探索-B：發現 BOSS 的弱點記錄
    DB.templates.push({
        id: 'adv_mid_exp_weakness',
        type: 'middle',
        reqTags: ['adventure', 'route_explorer'],
        excludeTags: ['boss_weakness'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_find_action}<br><br>是一份古代的戰鬥記錄。<br>字跡早已模糊，但關鍵的部分你還是讀出來了：<br><br>「{boss}的弱點在於——」<br><br>後面的字被人刻意刮去了一半，但你能推斷出剩下的部分。"
                }
            }
        ],
        options: [
            {
                label: "仔細推斷，補全記錄（INT 檢定）",
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["boss_weakness"],
                    varOps: [{ key: 'skill_points', val: 25, op: '+' }],
                    exp: 20
                },
                successText: "你推算出了完整的弱點。面對{boss}時，這將是決定性的優勢。"
            },
            {
                label: "帶走這份記錄，之後再研究",
                action: "advance_chain",
                rewards: {
                    tags: ["has_item_clue"],
                    varOps: [{ key: 'skill_points', val: 10, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-探索-C：箱庭探索房間（三劇本通用核心玩法）
    DB.templates.push({
        id: 'adv_mid_exp_hub_room',
        type: 'middle',
        reqTags: ['adventure', 'route_explorer'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'search_count', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你踏入了{env_room}。<br><br>{env_pack_visual}<br><br>這裡有幾處值得搜查的地方。<br>帶走有用的東西，越多越好。"
                }
            }
        ],
        options: [
            {
                label: "🔍 搜查{env_feature}",
                action: "advance_chain",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [{ key: 'search_count', val: 1, op: '-' }]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你在{env_feature}找到了{combo_item_desc}" } }],
                    options: [
                        {
                            label: "帶走它",
                            action: "node_self",
                            rewards: {
                                tags: ['has_item_clue'],
                                varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                            }
                        },
                        { label: "繼續搜查", action: "node_self" }
                    ]
                }
            },
            {
                label: "⚔️ 練習戰鬥動作（STR 或 AGI 檢定）",
                check: { stat: 'AGI', val: 3 },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'search_count', val: 1, op: '>=' }],
                    excludeTags: ['trained_here']
                },
                rewards: {
                    tags: ['trained_here'],
                    varOps: [
                        { key: 'search_count',  val: 1,  op: '-' },
                        { key: 'skill_points',  val: 15, op: '+' }
                    ],
                    exp: 15
                },
                successText: "你利用這個空間練習了幾組動作。對付{boss}時，這些會用上。"
            },
            {
                label: "🚪 繼續前進",
                action: "advance_chain"
            }
        ]
    });


    // ============================================================
    // ⚔️ [MIDDLE - 戰士路線] 戰鬥與技能成長
    //    reqTags: ['adventure', 'route_warrior']
    // ============================================================

    // MIDDLE-戰士-A：遭遇小怪，練習戰鬥
    DB.templates.push({
        id: 'adv_mid_war_skirmish',
        type: 'middle',
        reqTags: ['adventure', 'route_warrior'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_appear}<br><br>不是{boss}，只是它的爪牙。<br>但這正是你需要的——實戰。"
                }
            }
        ],
        options: [
            {
                label: "正面迎擊，學習對方的攻擊模式（STR 檢定）",
                check: { stat: 'STR', val: 4 },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'skill_points', val: 20, op: '+' }],
                    exp: 20
                },
                successText: "你擊退了對方，同時觀察到了{boss}爪牙的弱點。技能在實戰中成長。"
            },
            {
                label: "閃避為主，保存體力（AGI 檢定）",
                check: { stat: 'AGI', val: 4 },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'skill_points', val: 12, op: '+' }],
                    exp: 12
                },
                successText: "你巧妙地周旋，沒有消耗太多能量。速度就是你的武器。"
            },
            {
                label: "撤退，這一戰划不來",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'skill_points', val: 3, op: '+' }] }
            }
        ],
        onFail: {
            varOps: [{ key: 'skill_points', val: -5, op: '+' }],
            text: "你被擊退了。傷了點皮肉，但更重要的是——你現在知道對方的力道了。"
        }
    });

    // MIDDLE-戰士-B：找到傳說武器或強化裝備
    DB.templates.push({
        id: 'adv_mid_war_weapon',
        type: 'middle',
        reqTags: ['adventure', 'route_warrior'],
        excludeTags: ['found_legendary_weapon'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>就在{env_feature}裡，有一個{combo_item_desc}<br><br>根據{start_bonus}的光芒判斷，這不是普通的東西。"
                }
            }
        ],
        options: [
            {
                label: "帶走它",
                action: "advance_chain",
                rewards: {
                    tags: ["found_legendary_weapon"],
                    varOps: [{ key: 'skill_points', val: 20, op: '+' }]
                }
            },
            {
                label: "先測試它的威力",
                check: { stat: 'INT', val: 3 },
                action: "advance_chain",
                rewards: {
                    tags: ["found_legendary_weapon", "knows_weapon_power"],
                    varOps: [{ key: 'skill_points', val: 30, op: '+' }],
                    exp: 15
                },
                successText: "你了解了這件武器的特性。對付{boss}時，你知道該怎麼用它。"
            }
        ]
    });

    // MIDDLE-戰士-C：遭遇強敵，接近 BOSS 前的最後考驗
    DB.templates.push({
        id: 'adv_mid_war_elite',
        type: 'middle',
        reqTags: ['adventure', 'route_warrior'],
        excludeTags: ['fought_elite'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_encounter}<br><br>這不是一般的敵人。是{boss}的精銳護衛。<br><br>{sentence_tension}"
                }
            }
        ],
        options: [
            {
                label: "全力一戰（STR 或 AGI 擇高，V5 以上才有把握）",
                check: { stat: 'STR', val: 5 },
                action: "advance_chain",
                rewards: {
                    tags: ["fought_elite"],
                    varOps: [{ key: 'skill_points', val: 35, op: '+' }],
                    exp: 35
                },
                successText: "你擊倒了護衛。{boss}已經近在眼前，而你比剛才更強了。"
            },
            {
                label: "智取，找弱點偷襲（INT 檢定）",
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                rewards: {
                    tags: ["fought_elite"],
                    varOps: [{ key: 'skill_points', val: 25, op: '+' }],
                    exp: 25
                },
                successText: "你找到了對方的破綻，一擊必殺。聰明比力量更節省體力。"
            },
            {
                label: "暫時撤退",
                action: "advance_chain",
                rewards: {
                    tags: ["fought_elite"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                }
            }
        ],
        onFail: {
            varOps: [{ key: 'skill_points', val: -8, op: '+' }],
            text: "你被狠狠打退了。但失敗本身就是訓練——你不會在{boss}身上犯同樣的錯。"
        }
    });


    // ============================================================
    // 🌐 [MIDDLE - 冒險通用節點]
    //    部分節點同時標記 horror / mystery，讓三個劇本共用
    // ============================================================

    // MIDDLE-通用-A：遭遇陷阱（三劇本共用）
    DB.templates.push({
        id: 'adv_mid_any_trap',
        type: 'middle',
        reqTags: ['adventure', 'horror', 'mystery'], // 🌟 三劇本皆可觸發
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>就在你往前踏出一步的時候——<br><br>{sentence_event_sudden}<br><br>陷阱！有人（或某種東西）事先設置了這個。"
                }
            }
        ],
        options: [
            {
                label: "快速反應，跳開（AGI 檢定）",
                check: { stat: 'AGI', val: 4 },
                action: "advance_chain",
                rewards: { exp: 10 },
                successText: "你在觸發的瞬間跳開了。沒有受傷，但心跳還沒停下來。"
            },
            {
                label: "事先偵測到了，繞過去（INT 檢定）",
                check: { stat: 'INT', val: 3 },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }],
                    exp: 15
                },
                successText: "你注意到了地板的異常，繞開了陷阱。對方低估了你的觀察力。"
            },
            {
                label: "硬著頭皮衝過去（沒有結果保證）",
                action: "advance_chain",
                rewards: { exp: 5 }
            }
        ]
    });

    // MIDDLE-通用-B：神秘商人（三劇本共用）
    DB.templates.push({
        id: 'adv_mid_any_merchant',
        type: 'middle',
        reqTags: ['adventure', 'horror', 'mystery'], // 🌟 三劇本皆可觸發
        excludeTags: ['met_merchant'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_encounter}<br><br>不是敵人。是一個{identity_modifier}商人，神情{state_modifier}。<br><br>「我在這裡等了很久了，」他說，<br>「等一個需要我的東西的人。」"
                }
            }
        ],
        options: [
            {
                label: "購買補給（金幣 -30，回復能量）",
                condition: { vars: [{ key: 'gold', val: 30, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["met_merchant"],
                    varOps: [
                        { key: 'gold',         val: -30, op: '+' },
                        { key: 'skill_points', val: 10,  op: '+' }
                    ]
                }
            },
            {
                label: "詢問這裡的情報",
                action: "advance_chain",
                rewards: {
                    tags: ["met_merchant"],
                    varOps: [{ key: 'skill_points', val: 12, op: '+' }]
                }
            },
            {
                label: "不信任對方，繼續前進",
                action: "advance_chain",
                rewards: { tags: ["met_merchant"] }
            }
        ]
    });

    // MIDDLE-通用-C：環境謎題（冒險/恐怖共用）
    DB.templates.push({
        id: 'adv_mid_any_env_puzzle',
        type: 'middle',
        reqTags: ['adventure', 'horror'], // 🌟 冒險與恐怖共用
        excludeTags: ['solved_env_puzzle'],
        dialogue: [
            {
                text: {
                    zh: "通道的另一端，{env_feature}擋住了去路。<br><br>{env_pack_visual}<br><br>這不是隨機的，這是設計過的。<br>有規律，有邏輯——只要你能找到它。"
                }
            }
        ],
        options: [
            {
                label: "花時間解開謎題（INT 檢定）",
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["solved_env_puzzle", "puzzle_solved"],
                    varOps: [
                        { key: 'skill_points', val: 15, op: '+' },
                        { key: 'puzzle_count', val: 1,  op: '+' }
                    ],
                    exp: 20
                },
                successText: "你解開了。這種地方的謎題，往往隱藏著更重要的答案。"
            },
            {
                label: "找其他方法繞過去",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'skill_points', val: 3, op: '+' }] }
            }
        ]
    });

    // MIDDLE-通用-D：隊友或 NPC 的協助（冒險/偵探共用）
    DB.templates.push({
        id: 'adv_mid_any_npc_help',
        type: 'middle',
        reqTags: ['adventure', 'mystery'], // 🌟 冒險與偵探共用
        excludeTags: ['received_npc_help'],
        dialogue: [
            {
                text: {
                    zh: "你在{env_room}裡遇到了{combo_person_appearance}。<br><br>對方{state_modifier}，但看起來知道一些你不知道的事。<br><br>「你是來找{boss}的嗎？」對方壓低聲音問道。"
                }
            }
        ],
        options: [
            {
                label: "「對，你知道什麼？」",
                action: "advance_chain",
                rewards: {
                    tags: ["received_npc_help"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }]
                }
            },
            {
                label: "謹慎回應，先觀察對方",
                action: "advance_chain",
                rewards: {
                    tags: ["received_npc_help"],
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🐉 [CLIMAX] 高潮節點 × 2
    //    同樣使用三槽通用框架（逃跑 / 戰鬥 / 知識解法）
    // ============================================================

    // CLIMAX-A：與 BOSS 正面對決
    DB.templates.push({
        id: 'adv_climax_boss_fight',
        type: 'climax',
        reqTags: ['adventure'],
        dialogue: [
            {
                text: {
                    zh: "終於。<br><br>{boss}就在眼前。<br><br>{sentence_tension}<br><br>你在冒險中積累的一切，在這一刻都有了意義。<br>你只有一次機會——用對的方式。"
                }
            }
        ],
        options: [
            // 槽一：維持原樣（已有 nextScene）
            // 槽二：戰鬥
            {
                label: "用你在旅途中磨練的實力正面一戰",
                condition: { vars: [{ key: 'skill_points', val: 50, op: '>=' }] },
                action: "advance_chain",
                rewards: { tags: ["fought_boss"], varOps: [{ key: 'skill_points', val: -20, op: '+' }], exp: 45 },
                nextScene: {
                    dialogue: [{ text: { zh: "你迎頭而上，與{boss}的力量正面衝撞。<br>巨大的衝擊力讓周圍的{env_feature}紛紛碎裂！" } }],
                    options: [{ label: "分出勝負！", action: "advance_chain" }]
                }
            },
            // 槽三：傳說武器
            {
                label: "祭出傳說武器（需要 found_legendary_weapon）",
                condition: { tags: ['found_legendary_weapon'] },
                action: "advance_chain",
                rewards: { tags: ["used_legendary_weapon"], exp: 40 },
                nextScene: {
                    dialogue: [{ text: { zh: "武器爆發出刺眼的光芒，{boss}發出了痛苦的咆哮。<br>這就是終結它的時刻！" } }],
                    options: [{ label: "給予最後一擊！", action: "advance_chain" }]
                }
            },
            // 槽四：逃跑
            {
                label: "這一次不是時候，撤退",
                action: "advance_chain",
                rewards: { tags: ["fled_boss"] },
                nextScene: {
                    dialogue: [{ text: { zh: "你抓準空隙，轉身就跑。<br>身後的咆哮聲震耳欲聾，但你沒有回頭。" } }],
                    options: [{ label: "逃出生天...", action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-B：最終謎題（探索路線特殊高潮）
    DB.templates.push({
        id: 'adv_climax_final_puzzle',
        type: 'climax',
        reqTags: ['adventure', 'route_explorer'],
        condition: {
            vars: [{ key: 'puzzle_count', val: 2, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{boss}的真正封印，不是靠武力能打開的。<br><br>整個{env_building}就是一道謎題。<br>你一路走來解開的每一個謎，都是最後答案的一部分。<br><br>現在——把它們拼在一起。"
                }
            }
        ],
        options: [
            {
                label: "用你收集的所有線索，解開最終封印（需要 puzzle_count >= 2）",
                condition: { vars: [{ key: 'puzzle_count', val: 2, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["solved_final_puzzle"],
                    exp: 80
                }
            },
            {
                label: "線索還不夠，只能強行突破",
                action: "advance_chain",
                rewards: {
                    tags: ["forced_final"],
                    varOps: [{ key: 'skill_points', val: -15, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🏆 [END] 結局節點 × 5
    // ============================================================

    // END-A：完美勝利（弱點攻擊或最終謎題解開）
    DB.templates.push({
        id: 'adv_end_perfect',
        type: 'end',
        reqTags: ['adventure'],
        condition: {
            tags: ['used_weakness']
        },
        dialogue: [
            {
                text: {
                    zh: "{boss}倒下了。<br><br>不是靠蠻力，而是靠你一路積累的知識和準備。<br><br>{env_building}的詛咒（或守衛）隨著它的倒下煙消雲散。<br>————<br>【完美勝利】<br>技能值：{skill_points}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 120, gold: 80 } }]
    });

    // END-B：謎題通關（解謎路線，解開最終封印）
    DB.templates.push({
        id: 'adv_end_puzzle_clear',
        type: 'end',
        reqTags: ['adventure'],
        condition: { tags: ['solved_final_puzzle'] },
        dialogue: [
            {
                text: {
                    zh: "封印解開的瞬間，{boss}發出了一聲長嘯。<br><br>然後——沉默。<br><br>它不是被消滅，而是被釋放了。<br>古代的束縛解除了，這個地方也終於可以安息。<br>————<br>【謎題通關】<br>解謎次數：{puzzle_count}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 100, gold: 60 } }]
    });

    // END-C：硬打勝利（靠技能積累強行打過）
    DB.templates.push({
        id: 'adv_end_brute_win',
        type: 'end',
        reqTags: ['adventure'],
        condition: {
            tags: ['fought_boss'],
            vars: [{ key: 'skill_points', val: 30, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你沒有弱點，沒有傳說武器。<br>你只有一路積累下來的實力。<br><br>那就夠了。<br><br>{boss}最終敗在了你的鍛鍊之下。<br>————<br>【實力碾壓】<br>技能值：{skill_points}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 80, gold: 40 } }]
    });

    // END-D：撤退，留待下次（逃跑選項）
    DB.templates.push({
        id: 'adv_end_retreat',
        type: 'end',
        reqTags: ['adventure'],
        condition: { tags: ['fled_boss'] },
        dialogue: [
            {
                text: {
                    zh: "你撤退了。<br><br>{boss}沒有追出來——也許它知道，你只是還沒準備好。<br><br>下一次，你會帶著更完整的準備回來。<br>————<br>【撤退，留待下次】<br>技能值：{skill_points}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 30, gold: 10 } }]
    });

    // END-E：通用結局（什麼條件都不符合時的保底）
    DB.templates.push({
        id: 'adv_end_generic',
        type: 'end',
        reqTags: ['adventure'],
        // 沒有 condition → 作為 fallback 使用
        dialogue: [
            {
                text: {
                    zh: "冒險結束了。<br><br>你不確定自己是贏了還是輸了。<br>但你在這裡學到的東西，帶走了。<br>————<br>技能值：{skill_points}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 40 } }]
    });

    console.log("✅ story_adventure.js V1.0 已載入（3 開場 × 11 中段 × 2 高潮 × 5 結局）");
})();
