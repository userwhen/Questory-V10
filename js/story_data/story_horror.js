/* js/story_data/story_horror.js - V1.0
 * 恐怖懸疑劇本節點
 *
 * 核心機制：作祟值（curse_val）
 *   - 探索中隨機上升，部分事件固定上升
 *   - curse_val >= 50 → 前兆事件出現，異象開始
 *   - curse_val >= 80 → tag: risk_high，引擎強制抽高壓節點
 *   - curse_val = 100 → 強制進入 climax（由 env_building + curse_type 決定遭遇）
 *
 * 路線標籤（由開場選項賦予）：
 *   route_investigate → 主動調查詛咒根源，以知識破解
 *   route_escape      → 盡快逃出，不管根源
 *
 * 與偵探劇本的通用節點（reqTags 只寫 ['horror'] 或 ['mystery', 'horror']）：
 *   - 部分中段通用節點可以被兩個劇本共同觸發
 *   - climax 的三槽結構（逃跑/戰鬥/找方法）是通用危機解法框架
 *
 * 載入順序：story_data_core → story_mystery → story_horror
 */
(function () {
    const DB = window.FragmentDB;
    if (!DB) { console.error("❌ story_horror.js: FragmentDB 未就緒"); return; }

    DB.templates = DB.templates || [];

    // ============================================================
    // 🎬 [START] 開場節點 × 3
    //    設計原則：
    //      - 三種到達方式（受邀/迷路/主動闖入）
    //      - 都在開場初始化 curse_val = 0，knowledge = 0
    //      - 開場選項決定路線標籤
    // ============================================================

    // START-A：你收到了一封邀請函
    DB.templates.push({
        id: 'hor_start_invited',
        type: 'start',
        reqTags: ['horror'],
        onEnter: {
            varOps: [
                { key: 'curse_val',  val: 0,  op: 'set' },
                { key: 'knowledge',  val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{weather}的夜晚，你按照邀請函上的指示，來到了這裡——{env_building}。<br><br>寄件人的名字已經模糊，但地址是真實的。<br><br>{env_pack_visual}<br><br>大門虛掩著，彷彿有人在等你。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "推門，進去查清楚",
                    jp: "扉を押し、中へ",
                    kr: "문을 밀고 들어가 조사하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_investigate"],
                    varOps: [{ key: 'knowledge', val: 5, op: '+' }]
                }
            },
            {
                label: {
                    zh: "退後一步，先看退路",
                    jp: "一歩引いて退路を確認",
                    kr: "한 발 물러서 퇴로를 확인하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_escape"],
                    varOps: [{ key: 'curse_val', val: 5, op: '+' }]
                }
            }
        ]
    });

    // START-B：你在暴風雨中迷路，闖入了這裡避難
    DB.templates.push({
        id: 'hor_start_lost',
        type: 'start',
        reqTags: ['horror'],
        onEnter: {
            varOps: [
                { key: 'curse_val',  val: 10, op: 'set' },
                { key: 'knowledge',  val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{weather}。<br><br>你已經在這片{env_pack_sensory}裡走了太久。<br><br>遠處出現了{env_building}的輪廓——廢棄的，但至少有屋頂。<br><br>你踢開了積滿灰塵的大門。<br><br>就在你關上門的瞬間，你聽到了{env_sound}。<br>來自建築的深處。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "循著聲音走過去",
                    jp: "音をたどって進む",
                    kr: "소리를 따라 걸어가다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_investigate"],
                    varOps: [{ key: 'curse_val', val: 5, op: '+' }]
                }
            },
            {
                label: {
                    zh: "找暗處蹲下，等天亮",
                    jp: "暗がりに身を潜め夜明けを待つ",
                    kr: "어둠 속에 웅크려 날이 밝길 기다리다"
                },
                action: "advance_chain",
                rewards: { tags: ["route_escape"] }
            }
        ]
    });

    // START-C：你是來調查這個地方的，你知道這裡有問題
    DB.templates.push({
        id: 'hor_start_professional',
        type: 'start',
        reqTags: ['horror'],
        onEnter: {
            varOps: [
                { key: 'curse_val',  val: 0,  op: 'set' },
                { key: 'knowledge',  val: 15, op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你帶著工具箱來到了{env_building}。<br><br>根據你之前蒐集到的資料，這裡有關於{curse_type}的記錄。<br><br>{env_pack_visual}<br><br>這個地方有問題——你早就知道，<br>問題是：它有多嚴重。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "先做好防護，再進入調查",
                    jp: "身を守ってから調べる",
                    kr: "자신을 지킨 후 조사하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_investigate", "has_preparation"],
                    varOps: [{ key: 'knowledge', val: 10, op: '+' }]
                }
            },
            {
                label: {
                    zh: "比預期的糟，先找出路",
                    jp: "予想より悪い。まず出口を",
                    kr: "예상보다 나쁘다. 먼저 출구를 찾다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_escape", "has_preparation"],
                    varOps: [{ key: 'knowledge', val: 5, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🔦 [MIDDLE - 調查路線] 探索節點
    //    reqTags: ['horror', 'route_investigate']
    //    設計原則：
    //      - 知識（knowledge）增加 → 解鎖高潮的「找方法」選項
    //      - 每個節點都讓作祟值上升一點（探索有代價）
    //      - 找到的物品用於 climax 的條件判斷
    // ============================================================

    // MIDDLE-調查-A：發現關於詛咒的記錄
    DB.templates.push({
        id: 'hor_mid_inv_records',
        type: 'middle',
        reqTags: ['horror', 'route_investigate'],
        excludeTags: ['found_curse_records'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_find_action}<br><br>在{env_feature}裡，你找到了一疊發黃的記錄。<br><br>翻開第一頁，上面寫著關於{curse_type}的詳細描述。<br>字跡是用力刻上去的，好像寫字的人生怕忘記這些內容。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "俯身細讀，逐行記下",
                    jp: "身を乗り出し一行ずつ読む",
                    kr: "몸을 숙여 한 줄씩 읽다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["found_curse_records", "knows_weakness"],
                    varOps: [
                        { key: 'knowledge', val: 25, op: '+' },
                        { key: 'curse_val', val: 10, op: '+' }
                    ],
                    exp: 20
                },
                successText: "你找到了關鍵的一段——破解{curse_type}的方法，就記錄在這裡。"
            },
            {
                label: "快速瀏覽，抓住重點",
                action: "advance_chain",
                rewards: {
                    tags: ["found_curse_records"],
                    varOps: [
                        { key: 'knowledge', val: 10, op: '+' },
                        { key: 'curse_val', val: 5, op: '+' }
                    ],
                    exp: 10
                }
            }
        ]
    });

    // MIDDLE-調查-B：找到關鍵物品（可用於對抗詛咒）
    DB.templates.push({
        id: 'hor_mid_inv_sacred_item',
        type: 'middle',
        reqTags: ['horror', 'route_investigate'],
        excludeTags: ['has_sacred_item'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>{phrase_find_action}<br><br>是{combo_item_desc}<br><br>就算你不完全確定這東西的用途，<br>你的直覺告訴你它和{curse_type}有關。"
                }
            }
        ],
        options: [
            {
                label: "帶走它",
                action: "advance_chain",
                rewards: {
                    tags: ["has_sacred_item"],
                    varOps: [
                        { key: 'knowledge', val: 15, op: '+' },
                        { key: 'curse_val', val: 8, op: '+' }
                    ]
                }
            },
            {
                label: "先不碰，記下位置再說",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 3, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-調查-C：箱庭搜查房間（同偵探劇本的核心玩法）
    DB.templates.push({
        id: 'hor_mid_inv_hub_room',
        type: 'middle',
        reqTags: ['horror', 'route_investigate'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'search_count', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你來到了{env_room}。<br><br>{env_pack_visual}<br><br>這裡有幾個地方值得仔細搜查。<br>但每多待一刻，你感覺那股壓迫感就會強一分。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "搜查{env_feature}",
                    jp: "{env_feature}を調べる",
                    kr: "{env_feature}을 조사하다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'search_count', val: 1, op: '-' },
                        { key: 'curse_val',    val: 5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: { zh: "你翻動了{env_feature}。<br><br>{combo_item_desc}<br><br>{env_pack_sensory}" }
                    }],
                    options: [
                        {
                            label: "帶走這個物品",
                            action: "node_self",
                            rewards: {
                                tags: ['has_item_clue'],
                                varOps: [{ key: 'knowledge', val: 8, op: '+' }]
                            }
                        },
                        { label: "繼續搜查其他地方", action: "node_self" }
                    ]
                }
            },
            {
                label: {
                    zh: "屏息，感受空間的重量",
                    jp: "息を止め、空間の重さを感じる",
                    kr: "숨을 죽이고 공간의 무게를 느끼다"
                },
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'search_count', val: 1, op: '>=' }],
                    excludeTags: ['sensed_room']
                },
                rewards: {
                    tags: ['sensed_room'],
                    varOps: [
                        { key: 'search_count', val: 1, op: '-' },
                        { key: 'knowledge',    val: 20, op: '+' },
                        { key: 'curse_val',    val: 15, op: '+' }
                    ]
                },
                successText: "你感應到了{curse_type}的中心點——就在{env_feature}之下。"
            },
            {
                label: "🚪 離開這個房間",
                action: "advance_chain"
            }
        ]
    });

    // MIDDLE-調查-D：遭遇異象（作祟值高時更容易觸發）
    DB.templates.push({
        id: 'hor_mid_inv_omen',
        type: 'middle',
        reqTags: ['horror', 'route_investigate'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_event_sudden}<br><br>{env_pack_sensory}<br><br>然後，你看見了——<br>{phrase_danger_appear}<br><br>不對。那不是真實的。<br>或者，你希望那不是真實的。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "咬緊牙關，掏出筆記本",
                    jp: "奥歯を噛み、ノートを取り出す",
                    kr: "이를 악물고 노트를 꺼내다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ['witnessed_omen'],
                    varOps: [
                        { key: 'knowledge', val: 15, op: '+' },
                        { key: 'curse_val', val: 10, op: '+' }
                    ],
                    exp: 15
                },
                successText: "你把看到的一切記在腦海裡。這些異象本身，就是破解詛咒的線索。"
            },
            {
                label: "轉身離開，裝作沒看見",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 20, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🏃 [MIDDLE - 逃脫路線] 求生節點
    //    reqTags: ['horror', 'route_escape']
    //    設計原則：
    //      - 確認出口 → 賦予 has_escape_route，決定結局能否成功逃脫
    //      - 失敗讓 curse_val 快速上升
    // ============================================================

    // MIDDLE-逃脫-A：尋找出口
    DB.templates.push({
        id: 'hor_mid_esc_find_exit',
        type: 'middle',
        reqTags: ['horror', 'route_escape'],
        excludeTags: ['found_exit'],
        dialogue: [
            {
                text: {
                    zh: "你沿著牆壁摸索著，尋找出口。<br><br>{env_pack_visual}<br><br>這棟建築比你想像的複雜得多。<br>每一扇門打開，裡面都是另一個房間。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "在牆上劃記號，找規律",
                    jp: "壁に印をつけ、規則性を探す",
                    kr: "벽에 표시하며 규칙을 찾다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["found_exit"],
                    varOps: [{ key: 'curse_val', val: 5, op: '+' }],
                    exp: 20
                },
                successText: "你找到了一扇通往外部的窗戶。記住這個位置——這是你的退路。"
            },
            {
                label: {
                    zh: "憑直覺，往前走",
                    jp: "直感を頼りに進む",
                    kr: "직감을 믿고 앞으로 걷다"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 15, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-逃脫-B：被詛咒影響，行動受阻
    DB.templates.push({
        id: 'hor_mid_esc_impeded',
        type: 'middle',
        reqTags: ['horror', 'route_escape'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_warn}<br><br>你想要移動，但雙腿好像不聽使喚。<br><br>{sentence_tension}<br><br>這個地方不想讓你離開。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "全身繃緊，暴力掙開",
                    jp: "全身を張り詰め、強引に抜け出す",
                    kr: "온몸을 긴장시켜 억지로 빠져나오다"
                },
                check: { stat: 'STR', val: 4 },
                action: "advance_chain",
                rewards: { exp: 10 },
                successText: "你強行掙脫了那種莫名的壓迫感，往出口的方向跑去。"
            },
            {
                label: "停下來，讓自己冷靜",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                }
            }
        ],
        onFail: {
            varOps: [{ key: 'curse_val', val: 25, op: '+' }],
            text: "你沒能掙脫。那股力量把你往回拖，拖向{env_building}的深處。"
        }
    });

    // MIDDLE-逃脫-C：高作祟值強制觸發（詛咒開始具象化）
    DB.templates.push({
        id: 'hor_mid_esc_manifestation',
        type: 'middle',
        reqTags: ['horror', 'route_escape', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "{horror_chase_start}<br><br>{monster}的存在已經不再只是幻覺。<br><br>它出現在你和出口之間。<br><br>{sentence_tension}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "壓低重心，全力繞行",
                    jp: "重心を下げ全力で迂回する",
                    kr: "무게중심을 낮춰 전력으로 우회하다"
                },
                check: { stat: 'AGI', val: 6 },
                action: "advance_chain",
                rewards: {
                    tags: ["evaded_monster"],
                    varOps: [{ key: 'curse_val', val: -15, op: '+' }],
                    exp: 30
                },
                successText: "你在千鈞一髮之際從它身旁竄過，跌進了下一條走廊。"
            },
            {
                label: "退回原路，找另一條路",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                }
            }
        ],
        onFail: {
            varOps: [{ key: 'curse_val', val: 30, op: '+' }],
            text: "它抓住了你。你不知道用了什麼力氣掙脫，跌倒在地。<br>現在，情況更糟了。"
        }
    });


    // ============================================================
    // 🌐 [MIDDLE - 恐怖通用節點]
    //    reqTags: ['horror']（不指定路線，任何 horror 劇本都能觸發）
    //    同時也可以和偵探劇本共用（reqTags: ['horror', 'mystery']）
    // ============================================================

    // MIDDLE-通用-A：詭異的前兆（作祟值中等時出現）
    DB.templates.push({
        id: 'hor_mid_any_omen_low',
        type: 'middle',
        reqTags: ['horror'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_sensory}<br><br>{sentence_event_sudden}<br><br>沒有人，什麼都沒有。<br>但那種被注視的感覺，並沒有消失。"
                }
            }
        ],
        options: [
            {
                label: "繼續前進，不去在意",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'curse_val', val: 8, op: '+' }] }
            },
            {
                label: {
                    zh: "腳步一頓，屏氣凝視",
                    jp: "足を止め、息を殺して凝視する",
                    kr: "발을 멈추고 숨을 죽여 응시하다"
                },
                check: { stat: 'INT', val: 3 },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'knowledge', val: 5, op: '+' }, { key: 'curse_val', val: 5, op: '+' }]
                },
                successText: "你注意到{env_feature}的位置不太對。好像有什麼東西剛剛移動過。"
            }
        ]
    });

    // MIDDLE-通用-B：發現前人留下的警告（可以是偵探或恐怖劇本的通用場景）
    DB.templates.push({
        id: 'hor_mid_any_warning',
        type: 'middle',
        reqTags: ['horror','mystery'],
        excludeTags: ['found_warning'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>在{env_feature}上，你發現了用{item_physical_state}東西刻下的字：<br><br>「不要在天黑後留在這裡。」<br><br>日期是三年前。<br>不知道那個人後來怎麼了。"
                }
            }
        ],
        options: [
    // ── 選項一：聽從警告 ──────────────────────
    {
        label: {
            zh: "這是真的警告，重新思考",
            jp: "本物の警告だ。計画を見直す",
            kr: "진짜 경고야. 계획을 다시 세우다"
        },
        action: "node_next",          // ← 改成 node_next，才會跳進 nextScene
        rewards: {
            tags: ["found_warning"],
            varOps: [{ key: 'knowledge', val: 10, op: '+' }]
        },
        nextScene: {
            dialogue: [{ text: { zh: "你環顧四周，選擇聽從建議。" } }],
            options: [
                {
                    label: { zh: "趁天黑離開", jp: "暗くなる前に離れる", kr: "어둠이 내리기 전에 떠나다" },
                    action: "advance_chain",
                    rewards: {
                        tags: ["found_warning"],
                        varOps: [{ key: 'curse_val', val: 2, op: '+' }]
                    }
                },
                {
                    label: { zh: "繼續搜查其他地方", jp: "他を調べ続ける", kr: "다른 곳을 계속 조사하다" },
                    action: "advance_chain",
                    rewards: {
                        tags: ["found_warning"],
                        varOps: [{ key: 'curse_val', val: 12, op: '+' }]
                    }
                }
            ]
        }
    },
    // ── 選項二：無視警告 ──────────────────────
    {
        label: {
            zh: "繼續，別在意這種東西",
            jp: "続けよう、こんなもの気にしない",
            kr: "계속 가자, 이런 건 신경 쓰지 마"
        },
        action: "advance_chain",
        rewards: {
            tags: ["found_warning"],
            varOps: [{ key: 'curse_val', val: 12, op: '+' }]
        }
    }
]}
    );

    // MIDDLE-通用-C：與其他倖存者遭遇（共用結構，偵探劇本也可觸發）
    DB.templates.push({
        id: 'hor_mid_any_survivor_encounter',
        type: 'middle',
        reqTags: ['horror','mystery'],
        excludeTags: ['met_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_encounter}<br><br>不是怪物，而是一個{identity_modifier}{core_identity}，<br>對方{state_modifier}。<br><br>「你也被困在這裡了嗎？」"
                }
            }
        ],
        options: [
            {
                label: "一起行動",
                action: "advance_chain",
                rewards: {
                    tags: ["met_survivor", "has_ally"],
                    varOps: [{ key: 'knowledge', val: 8, op: '+' }]
                }
            },
            {
                label: "謹慎，不完全信任對方",
                action: "advance_chain",
                rewards: {
                    tags: ["met_survivor"],
                    varOps: [{ key: 'curse_val', val: 3, op: '+' }]
                }
            },
            {
                label: {
                    zh: "讓對方先走，你壓後",
                    jp: "相手を先に行かせ後に続く",
                    kr: "상대를 먼저 보내고 뒤를 따르다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["met_survivor"],
                    varOps: [{ key: 'knowledge', val: 5, op: '+' }, { key: 'curse_val', val: 5, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // ☠️ [CLIMAX] 高潮危機節點 × 2
    //    三槽通用框架（逃跑 / 戰鬥 / 找方法）
    //    這個結構可以直接被冒險劇本的 climax 複用
    // ============================================================

    // CLIMAX-A：詛咒具象化，決戰時刻
    DB.templates.push({
        id: 'hor_climax_curse_manifest',
        type: 'climax',
        reqTags: ['horror'],
        dialogue: [
            {
                text: {
                    zh: "作祟值已經到達了臨界點。<br><br>整棟{env_building}開始顫抖。<br><br>{monster}從{env_feature}裡現身——它的形態比任何描述都要更令人絕望。<br><br>{sentence_tension}<br><br>你只有一次機會。"
                }
            }
        ],
        options: [
            // 槽一：找方法（需要 knows_weakness + 足夠的知識值）
            {
                label: {
                    zh: "用找到的方法對抗根源",
                    jp: "見つけた方法で根源に立ち向かう",
                    kr: "찾아낸 방법으로 근원에 맞서다"
                },
                condition: {
                    tags: ['knows_weakness'],
                    vars: [{ key: 'knowledge', val: 30, op: '>=' }]
                },
                action: "advance_chain",
                rewards: {
                    tags: ["used_ritual"],
                    varOps: [{ key: 'curse_val', val: -50, op: '+' }],
                    exp: 50
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你執行了記錄中的儀式。<br><br>{monster}發出了憤怒的低鳴。<br>它的形態開始扭曲、崩解。<br><br>{curse_type}的力量正在撤退。"
                        }
                    }],
                    options: [{ label: "不要停，繼續！", action: "advance_chain" }]
                }
            },
            // 槽二：戰鬥（需要攜帶了神聖物品或武器）
            {
                label: {
                    zh: "持物正面迎擊",
                    jp: "物を持って正面から挑む",
                    kr: "물건을 들고 정면으로 맞서다"
                },
                condition: { tags: ['has_sacred_item'] },
                action: "advance_chain",
                rewards: {
                    tags: ["fought_monster"],
                    varOps: [{ key: 'curse_val', val: -20, op: '+' }],
                    exp: 35
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你舉起了{combo_item_simple}，朝著{monster}猛地擲去。<br><br>它沒有直接消滅對方，但——對方退縮了。<br>就這一瞬間的空隙，已經足夠了。"
                        }
                    }],
                    options: [{ label: "趁現在！", action: "advance_chain" }]
                }
            },
            // 槽三：逃跑（永遠可見，但成功需要 has_escape_route）
            {
                label: {
                    zh: "全力跑，退路已確認",
                    jp: "全力で逃げる。退路は確認済み",
                    kr: "전력 질주. 퇴로는 이미 확인했다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["attempted_escape"],
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                }
            }
        ]
    });

    // CLIMAX-B：詛咒的核心浮現（調查路線的特殊高潮）
    DB.templates.push({
        id: 'hor_climax_curse_core',
        type: 'climax',
        reqTags: ['horror', 'route_investigate'],
        dialogue: [
            {
                text: {
                    zh: "你找到了。<br><br>在{env_building}的最深處，{curse_type}的根源就在這裡。<br><br>一個{combo_item_desc}<br><br>它就是一切的起點。<br>只要摧毀它，一切就結束了。<br><br>——但靠近它，需要付出代價。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "親手毀掉它",
                    jp: "自ら破壊する",
                    kr: "직접 부수다"
                },
                condition: { vars: [{ key: 'knowledge', val: 25, op: '>=' }] },
                action: "advance_chain",
                rewards: { tags: ["destroyed_core"], exp: 60 },
                nextScene: {
                    dialogue: [{ text: { zh: "你毫不猶豫地動手，將那個核心砸得粉碎。<br>周圍的空氣瞬間凝固，發出了一陣刺耳的悲鳴。" } }],
                    options: [{ label: "結束這一切！", action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "知識不足，強行毀掉它",
                    jp: "知識不足のまま強引に破壊する",
                    kr: "지식이 부족하지만 억지로 부수다"
                },
                action: "advance_chain",
                rewards: { tags: ["attempted_destroy"], varOps: [{ key: 'curse_val', val: 30, op: '+' }] },
                nextScene: {
                    dialogue: [{ text: { zh: "你強行破壞它，但一股恐怖的反噬之力瞬間湧入你的腦海！<br>你的視線開始模糊..." } }],
                    options: [{ label: "撐住！", action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "用聖物將它封印",
                    jp: "聖なる物で封じる",
                    kr: "성물로 봉인하다"
                },
                condition: { tags: ['has_sacred_item'] },
                action: "advance_chain",
                rewards: { tags: ["sealed_core"], varOps: [{ key: 'curse_val', val: -30, op: '+' }], exp: 40 },
                nextScene: {
                    dialogue: [{ text: { zh: "你用{combo_item_simple}壓制住了核心的躁動。<br>黑暗的氣息被暫時逼退，周圍安靜了下來。" } }],
                    options: [{ label: "見證結果...", action: "advance_chain" }]
                }
            }
        ]
    });


    // ============================================================
    // 🏁 [END] 結局節點 × 5
    //    由 tags + 數值組合決定觸發哪個
    // ============================================================

    // END-A：根源淨化（最佳結局）
    DB.templates.push({
        id: 'hor_end_purified',
        type: 'end',
        reqTags: ['horror'],
        condition: {
            tags: ['destroyed_core'],
            vars: [{ key: 'curse_val', val: 70, op: '<=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{curse_type}的力量，在你親手毀掉那個源頭之後，像潮水一樣退去。<br><br>{env_building}恢復了沉默。<br>這一次，是真正的、乾淨的沉默。<br><br>你走出了大門，黎明的光線讓你不得不瞇起眼睛。<br>————<br>【根源淨化】<br>知識值：{knowledge}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
    });

    // END-B：詛咒封印（有神聖物品，未能完全消滅）
    DB.templates.push({
        id: 'hor_end_sealed',
        type: 'end',
        reqTags: ['horror'],
        condition: { tags: ['sealed_core'] },
        dialogue: [
            {
                text: {
                    zh: "你沒能完全毀掉它，但你用{combo_item_simple}把它封印了。<br><br>這個詛咒不會就此消失。<br>只是，在封印解開之前，它對這個世界的影響會暫時停止。<br><br>你拖著疲憊的身軀走出了{env_building}。<br>————<br>【詛咒封印】<br>知識值：{knowledge}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 70, gold: 30 } }]
    });

    // END-C：成功逃脫（確認過退路，通過高潮的逃跑選項）
    DB.templates.push({
        id: 'hor_end_escaped',
        type: 'end',
        reqTags: ['horror'],
        condition: {
            tags: ['attempted_escape', 'found_exit']
        },
        dialogue: [
            {
                text: {
                    zh: "你逃出去了。<br><br>{curse_type}的影響在你越過那道門檻的瞬間，戛然而止。<br><br>你沒有回頭。<br>你不知道那個地方最終會怎樣。<br>你只知道，你活著出來了。<br>————<br>【成功逃脫】"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 50, gold: 20 } }]
    });

    // END-D：被詛咒吞噬（作祟值過高，未能完成任何解法）
    DB.templates.push({
        id: 'hor_end_consumed',
        type: 'end',
        reqTags: ['horror'],
        condition: {
            vars: [{ key: 'curse_val', val: 90, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你已經說不清楚，自己是在哪個時間點開始迷失的。<br><br>{env_building}還在。你也還在。<br>但「你」這個概念，已經變得越來越模糊。<br><br>{curse_type}找到了一個新的居所。<br>————<br>【被詛咒吞噬】<br>作祟值：{curse_val}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 10 } }]
    });

    // END-E：帶著傷痕離開（什麼都沒解決，但活著出來了）
    DB.templates.push({
        id: 'hor_end_escaped_hollow',
        type: 'end',
        reqTags: ['horror'],
        dialogue: [
            {
                text: {
                    zh: "你說不清楚自己是怎麼走出來的。<br><br>只記得跑，記得黑暗，記得{env_pack_sensory}<br><br>天亮了。你還活著。<br>{curse_type}還在那裡，原封不動。<br>————<br>【帶著傷痕離開】"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 25 } }]
    });

    console.log("✅ story_horror.js V1.0 已載入（3 開場 × 10 中段 × 2 高潮 × 5 結局）");
})();