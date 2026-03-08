/* js/story_data/story_mystery.js - V1.0
 * 偵探懸疑劇本節點
 *
 * 架構說明：
 *   - 骨架（skeleton）定義在 story_generator_skeletons.js 的 'mystery' key
 *   - 本檔案只負責提供節點（templates）給引擎的 pickTemplate 篩選
 *   - 路線分歧由開場選項決定，不依賴 global_play_mode
 *     route_detective → 偵探路線，主動搜查，以 tension = 暴露度
 *     route_survivor  → 生存路線，被動躲避，以 tension = 恐慌度
 *
 * 節點類型對照：
 *   type: 'start'   → 開場（每局只用一個）
 *   type: 'middle'  → 中段探索（引擎隨機抽取，可無縫銜接任何開場/結尾）
 *   type: 'climax'  → 高潮審問（固定在倒數第二段）
 *   type: 'end'     → 結局（根據 condition 篩選）
 *
 * 無縫銜接原則：
 *   所有 middle 節點的文本都使用代名詞或動態變數，
 *   不寫「正如剛才你看到的」這種綁死前情的句子。
 *
 * 載入順序：story_data_core → story_mystery → （其他劇本資料）
 */
(function () {
    const DB = window.FragmentDB;
    if (!DB) { console.error("❌ story_mystery.js: FragmentDB 未就緒"); return; }

    DB.templates = DB.templates || [];

    // ============================================================
    // 🎬 [START] 開場節點 × 3
    //    設計原則：
    //      - 三個開場風格不同（發現屍體、被捲入、目擊現場）
    //      - 都在開場選項賦予路線標籤，不依賴全域種子
    //      - 初始化 credibility（公信度）與 tension（暴露度/恐慌度）
    // ============================================================

    // START-A：你發現了屍體
    DB.templates.push({
        id: 'mys_start_found_body',
        type: 'start',
        reqTags: ['mystery'],
        onEnter: {
            varOps: [
                { key: 'credibility', val: 0,  op: 'set' },
                { key: 'tension',     val: 10, op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{weather}的夜晚，你獨自來到{env_building}。<br>推開{env_room}的門，{env_pack_visual}<br>然後你看見了地上的{victim}——沒有了生命跡象。<br>{murder_weapon}就躺在屍體旁邊，上面還沾著尚未乾透的血跡。"
                }
            },
            {
                text: {
                    zh: "其他人陸續聚攏過來。恐慌開始蔓延。<br>沒有人知道兇手是誰，但每個人都在看著你。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "站出來，我來查清楚",
                    jp: "立ち上がり私が調べる",
                    kr: "나서서 내가 조사하겠다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_detective"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }]
                }
            },
            {
                label: {
                    zh: "太危險了，先找地方躲",
                    jp: "危険すぎる。隠れ場所を探す",
                    kr: "너무 위험해. 숨을 곳을 찾다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_survivor"],
                    varOps: [{ key: 'tension', val: 5, op: '+' }]
                }
            }
        ]
    });

    // START-B：你被人找上門
    DB.templates.push({
        id: 'mys_start_hired',
        type: 'start',
        reqTags: ['mystery'],
        onEnter: {
            varOps: [
                { key: 'credibility', val: 10, op: 'set' },
                { key: 'tension',     val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "一封匿名信把你帶到了這裡——{env_building}。<br>寄信人在信中寫道：「{victim}死了，而且不是意外。真兇就在這棟建築裡。」<br>{weather}，整棟建築籠罩在一片{atmosphere}的氣氛中。"
                }
            },
            {
                text: {
                    zh: "你意識到，在警察抵達之前，你可能是唯一能夠阻止真兇逃脫的人。<br>——如果你選擇這樣做的話。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "接下任務，開始調查",
                    jp: "任務を受け調査を始める",
                    kr: "임무를 받고 조사를 시작하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_detective"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }]
                }
            },
            {
                label: {
                    zh: "可能是陷阱，先觀察",
                    jp: "罠かもしれない。まず観察する",
                    kr: "함정일 수도 있다. 먼저 관찰하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_survivor"]
                }
            }
        ]
    });

    // START-C：你親眼目擊了兇殺
    DB.templates.push({
        id: 'mys_start_witnessed',
        type: 'start',
        reqTags: ['mystery'],
        onEnter: {
            varOps: [
                { key: 'credibility', val: 0,  op: 'set' },
                { key: 'tension',     val: 20, op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你本來只是一個路過的旁觀者。<br>但就在{weather}的這個{atmosphere}夜晚，你在{env_room}裡親眼目睹了一切。<br>{true_culprit}。{victim}的身體無力倒下。<br>而對方的眼神，在那一瞬間，與你正面交鋒。"
                }
            },
            {
                text: {
                    zh: "對方知道你看見了。<br>現在你面臨選擇——"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "大聲呼救，引人過來",
                    jp: "大声で助けを呼び人を集める",
                    kr: "큰 소리로 도움을 청해 사람을 모으다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_detective", "witnessed_culprit"],
                    varOps: [{ key: 'credibility', val: 30, op: '+' }]
                }
            },
            {
                label: {
                    zh: "裝作沒看見，趕快跑",
                    jp: "何も見ていないふりをして逃げる",
                    kr: "못 본 척하고 빨리 도망치다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_survivor", "witnessed_culprit"],
                    varOps: [{ key: 'tension', val: 15, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🔍 [MIDDLE - 偵探路線] 探索節點
    //    reqTags: ['mystery', 'route_detective']
    //    設計原則：
    //      - 每個節點都能獨立存在，不依賴其他節點的前情
    //      - 找到真證物 → 賦予 has_true_evidence，credibility +20
    //      - 找到假線索 → 賦予 has_fake_clue（陷阱！）
    //      - 失敗 → tension 上升（暴露度）
    //      - excludeTags 防止同一個搜查點被重複觸發
    // ============================================================

    // MIDDLE-偵探-A：搜查現場，高風險高報酬
    DB.templates.push({
        id: 'mys_mid_det_search_scene',
        type: 'middle',
        reqTags: ['mystery', 'route_detective'],
        excludeTags: ['searched_scene'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_explore_start}<br>{env_pack_visual}<br>你蹲下身，仔細審視著現場的每一個細節。<br>{murder_weapon}留下的痕跡，說明了兇手的站位。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "戴上手套，逐寸勘查",
                    jp: "手袋をはめ、一寸ずつ調べる",
                    kr: "장갑을 끼고 한 치씩 조사하다"
                },
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                rewards: {
                    tags: ["searched_scene", "has_true_evidence"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }],
                    exp: 20
                },
                successText: "你找到了一個關鍵細節：{combo_item_desc}<br>這能直接證明兇手的身份。"
            },
            {
                label: {
                    zh: "快速掃視，可能有遺漏",
                    jp: "素早く見回す。見落とすかも",
                    kr: "빠르게 훑어보다. 놓칠 수도 있어"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["searched_scene", "has_fake_clue"],
                    varOps: [{ key: 'tension', val: 5, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-偵探-B：審問目擊者
    DB.templates.push({
        id: 'mys_mid_det_interrogate',
        type: 'middle',
        reqTags: ['mystery', 'route_detective'],
        excludeTags: ['interrogated_witness'],
        dialogue: [
            {
                text: {
                    zh: "你找到了{suspect_A}，對方的神情{state_modifier}。<br>「我什麼都不知道，」{suspect_A}說，「你最好別管這件事。」<br>但對方的眼神出賣了他。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "往前一步，眼神不退讓",
                    jp: "一歩踏み出し、視線で圧力をかける",
                    kr: "한 걸음 앞으로 나서며 눈빛으로 압박하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["interrogated_witness", "has_testimony"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 15
                },
                successText: "{suspect_A}終於鬆口，透露了一個你之前不知道的細節。"
            },
            {
                label: {
                    zh: "換個坐姿，放鬆語氣問",
                    jp: "座り直して、力を抜いた声で聞く",
                    kr: "자세를 바꾸며 힘 뺀 목소리로 묻다"
                },
                check: { stat: 'LUK', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["interrogated_witness"],
                    varOps: [{ key: 'credibility', val: 10, op: '+' }],
                    exp: 10
                },
                successText: "對方警戒心稍稍降低，說了幾句含糊的話，但或許有用。"
            },
            {
                label: {
                    zh: "放棄，去找別的線索",
                    jp: "諦めて別の手がかりを探す",
                    kr: "포기하고 다른 단서를 찾다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["interrogated_witness"],
                    varOps: [{ key: 'tension', val: 3, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-偵探-C：發現嫌疑人的秘密房間
    DB.templates.push({
        id: 'mys_mid_det_secret_room',
        type: 'middle',
        reqTags: ['mystery', 'route_detective'],
        excludeTags: ['found_secret_room'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_sensory}<br>{phrase_find_action}<br>牆壁上有一個幾乎看不出來的暗門。<br>這裡...是{true_culprit}的私人空間。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "冒險進去，可能被發現",
                    jp: "リスクを冒して中へ入る",
                    kr: "위험을 감수하고 안으로 들어가다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["found_secret_room", "has_true_evidence"],
                    varOps: [
                        { key: 'credibility', val: 25, op: '+' },
                        { key: 'tension',     val: 15, op: '+' }
                    ],
                    exp: 25
                }
            },
            {
                label: {
                    zh: "記下位置，先不驚動",
                    jp: "位置を記録し相手を刺激しない",
                    kr: "위치를 기록하고 자극하지 않다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["found_secret_room"],
                    varOps: [{ key: 'credibility', val: 8, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-偵探-D：箱庭探索，在房間內多次搜查道具
    // 這個節點觸發後會進入反覆搜查迴圈，直到玩家選擇離開
    DB.templates.push({
        id: 'mys_mid_det_hub_room',
        type: 'middle',
        reqTags: ['mystery', 'route_detective'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'search_count', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你來到了{env_room}。{env_pack_visual}<br>這裡有幾個值得調查的地方——但時間不多，你只能仔細搜查有限的幾處。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "搜查角落，也許有發現",
                    jp: "隅を調べる。証拠があるかも",
                    kr: "구석을 조사하다. 증거가 있을지도"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [{ key: 'search_count', val: 1, op: '-' }],
                    tags: ['searched_corner']
                },
                nextScene: {
                    dialogue: [{
                        text: { zh: "你翻找了{env_feature}，發現了{combo_item_desc}" }
                    }],
                    options: [
                        {
                            label: {
                                zh: "可能是關鍵，收進口袋",
                                jp: "重要かもしれない。ポケットへ",
                                kr: "중요할지도. 주머니에 넣다"
                            },
                            action: "node_self",  // 回到當前 HUB
                            rewards: {
                                tags: ['has_item_clue'],
                                varOps: [{ key: 'credibility', val: 10, op: '+' }]
                            }
                        },
                        { label: "不重要，繼續搜", action: "node_self" }
                    ]
                }
            },
            {
                label: {
                    zh: "翻開文件夾，從頭掃",
                    jp: "ファイルを開き、最初から目を通す",
                    kr: "파일을 펼쳐 처음부터 훑어보다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'search_count', val: 1, op: '>=' }],
                    excludeTags: ['searched_documents']
                },
                rewards: {
                    tags: ['searched_documents', 'has_true_evidence'],
                    varOps: [
                        { key: 'search_count',  val: 1,  op: '-' },
                        { key: 'credibility',   val: 20, op: '+' }
                    ]
                },
                successText: "文件裡藏著一張便條，上面的字跡和{murder_weapon}上留下的印痕吻合。"
            },
            {
                label: "🚪 離開這個房間",
                action: "advance_chain"
            }
        ]
    });

    // MIDDLE-偵探-E：幫助其他恐慌的 NPC（累積公信度）
    DB.templates.push({
        id: 'mys_mid_det_help_npc',
        type: 'middle',
        reqTags: ['mystery', 'route_detective'],
        excludeTags: ['helped_npc'],
        dialogue: [
            {
                text: {
                    zh: "{suspect_B}一個人縮在{env_feature}旁，神情{state_modifier}。<br>看起來對方已經快要崩潰了。"
                }
            }
        ],
        options: [
            {
                label: "安撫對方，建立信任",
                action: "advance_chain",
                rewards: {
                    tags: ["helped_npc", "npc_trust"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 10
                }
            },
            {
                label: {
                    zh: "直接問，有沒有看到",
                    jp: "直接聞く。何か見たか",
                    kr: "직접 묻다. 뭔가 봤냐고"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["helped_npc"],
                    varOps: [{ key: 'credibility', val: 5, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🏃 [MIDDLE - 生存路線] 躲避節點
    //    reqTags: ['mystery', 'route_survivor']
    //    設計原則：
    //      - 失敗讓 tension 大幅上升
    //      - tension >= 70 後兇手主動找上門（risk_high 標籤觸發）
    //      - 偶爾讓玩家「旁觀」偵探的行動，增加世界感
    // ============================================================

    // MIDDLE-生存-A：躲進隱蔽處
    DB.templates.push({
        id: 'mys_mid_sur_hide',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_warn}<br>你的第一反應是找個地方躲起來。<br>{survivor_hiding}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "屏住呼吸，石化般靜止",
                    jp: "息を止め、石になったように動かない",
                    kr: "숨을 참고 돌처럼 굳어버리다"
                },
                check: { stat: 'AGI', val: 4 },
                action: "advance_chain",
                rewards: { exp: 10 },
                successText: "腳步聲漸漸遠去。你暫時安全了。"
            },
            {
                label: {
                    zh: "悄悄移到更安全的地方",
                    jp: "そっと安全な隠れ場所に移る",
                    kr: "살짝 더 안전한 곳으로 이동하다"
                },
                action: "advance_chain",
                rewards: { varOps: [{ key: 'tension', val: 8, op: '+' }] }
            }
        ],
        onFail: {
            varOps: [{ key: 'tension', val: 20, op: '+' }],
            text: "你不小心碰翻了什麼東西，發出了聲響。對方停了下來..."
        }
    });

    // MIDDLE-生存-B：差點被發現
    DB.templates.push({
        id: 'mys_mid_sur_close_call',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_appear}<br>{true_culprit}就站在你藏身處不遠的地方，<br>{verb_equip}著某樣東西，四下張望。<br>{survivor_hiding}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "縮成最小，把存在感抹掉",
                    jp: "できる限り小さくなり、気配を消す",
                    kr: "최대한 작아지며 존재감을 지우다"
                },
                check: { stat: 'LUK', val: 5 },
                action: "advance_chain",
                rewards: { exp: 15 },
                successText: "{true_culprit}沒有發現你，緩緩離開了。你喘了口氣。"
            },
            {
                label: "趁對方不注意偷偷溜走",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'tension', val: 12, op: '+' }] }
            }
        ],
        onFail: {
            varOps: [{ key: 'tension', val: 30, op: '+' }],
            text: "{true_culprit}的眼神掃過你藏身的方向，停頓了一秒鐘。<br>你感覺到對方已經知道你在這裡了..."
        }
    });

    // MIDDLE-生存-C：旁觀偵探的行動
    DB.templates.push({
        id: 'mys_mid_sur_witness_detective',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{survivor_witness}<br>{env_pack_sensory}<br>你有一個選擇：繼續躲著，或者出去幫一把。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "繼續躲，這不關我事",
                    jp: "隠れ続ける。関係ない",
                    kr: "계속 숨다. 내 일이 아니야"
                },
                action: "advance_chain",
                rewards: { varOps: [{ key: 'tension', val: 5, op: '+' }] }
            },
            {
                label: {
                    zh: "出去幫忙，暴露自己",
                    jp: "出て助ける。自分が露出する",
                    kr: "나가서 돕다. 자신이 노출된다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_detective", "survivor_helped"],
                    varOps: [
                        { key: 'tension',     val: 15, op: '+' },
                        { key: 'credibility', val: 20, op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-生存-D：高暴露度觸發（兇手主動追殺）
    DB.templates.push({
        id: 'mys_mid_sur_hunted',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_warn}<br>已經沒有時間猶豫了。{true_culprit}知道你在這裡。<br>{horror_chase_start}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "腳跟一蹬，全速衝出去",
                    jp: "踵で床を蹴り、全速で飛び出す",
                    kr: "뒤꿈치로 바닥을 박차고 전속력으로 뛰어나가다"
                },
                check: { stat: 'AGI', val: 6 },
                action: "advance_chain",
                rewards: {
                    tags: ["survived_chase"],
                    varOps: [{ key: 'tension', val: -20, op: '+' }],
                    exp: 30
                },
                successText: "你成功甩開了對方，藏進了一個更安全的角落。"
            },
            {
                label: {
                    zh: "大聲呼救，引人過來",
                    jp: "大声で叫び人を引き寄せる",
                    kr: "큰 소리로 외쳐 사람을 끌어오다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_detective", "blew_cover"],
                    varOps: [
                        { key: 'tension',     val: 10, op: '+' },
                        { key: 'credibility', val: 10, op: '+' }
                    ]
                }
            }
        ],
        onFail: {
            varOps: [{ key: 'tension', val: 35, op: '+' }],
            text: "你沒能跑掉。對方抓住了你的手腕。<br>「你看到了，對吧...」"
        }
    });


    // ============================================================
    // 🌐 [MIDDLE - 通用節點] 不區分路線，任何 mystery 劇本都能觸發
    //    reqTags: ['mystery']（只有這一個，不指定路線）
    //    目的：增加中段的不可預測性，任何開場銜接都合理
    // ============================================================

    // MIDDLE-通用-A：詭異的氣氛事件
    DB.templates.push({
        id: 'mys_mid_any_atmosphere',
        type: 'middle',
        reqTags: ['mystery'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_event_sudden}<br>{env_pack_sensory}<br>所有人都停下來了。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "閉眼，用耳朵定位",
                    jp: "目を閉じ、耳で位置を特定する",
                    kr: "눈을 감고 귀로 위치를 파악하다"
                },
                action: "advance_chain",
                check: { stat: 'INT', val: 3 },
                rewards: {
                    varOps: [{ key: 'credibility', val: 5, op: '+' }]
                },
                successText: "你判斷出聲音來自{env_room}的方向。這說明了什麼..."
            },
            {
                label: "順著眾人的恐慌行動",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'tension', val: 5, op: '+' }] }
            }
        ]
    });

    // MIDDLE-通用-B：發現假線索（陷阱）
    DB.templates.push({
        id: 'mys_mid_any_fake_clue',
        type: 'middle',
        reqTags: ['mystery'],
        excludeTags: ['found_fake_clue'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_find_action}<br>竟然找到了{combo_item_desc}<br>這是...線索？還是有人故意放在這裡的？"
                }
            }
        ],
        options: [
            {
                label: "收起來，之後再判斷",
                action: "advance_chain",
                rewards: {
                    tags: ["found_fake_clue", "has_fake_clue"],
                    varOps: [{ key: 'credibility', val: 3, op: '+' }]
                }
            },
            {
                label: {
                    zh: "停手，擺得太刻意了",
                    jp: "手を止める——わざとらしい",
                    kr: "손을 멈추다——너무 작위적이야"
                },
                check: { stat: 'INT', val: 6 },
                action: "advance_chain",
                rewards: {
                    tags: ["found_fake_clue"],
                    varOps: [{ key: 'credibility', val: 10, op: '+' }]
                },
                successText: "你的直覺是對的。這是有人故意放的假線索，目的是誤導你。"
            }
        ]
    });

    // MIDDLE-通用-C：緊張的對峙（兩個嫌疑人起衝突）
    DB.templates.push({
        id: 'mys_mid_any_conflict',
        type: 'middle',
        reqTags: ['mystery'],
        dialogue: [
            {
                text: {
                    zh: "{suspect_A}與{suspect_B}在{env_room}裡爆發了激烈的爭執。<br>「是你幹的！你一直想要那份遺產！」<br>「你才是兇手！別以為大家不知道你在幹什麼！」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "站到中間，聲音壓下去",
                    jp: "二人の間に割り込み、声で制圧する",
                    kr: "두 사람 사이에 끼어들어 목소리로 제압하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 15
                },
                successText: "你的介入讓兩人都停了下來。在混亂中，你注意到了一個細節。"
            },
            {
                label: "站在一旁觀察，不介入",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'tension', val: 5, op: '+' }] }
            }
        ]
    });


    // ============================================================
    // ⚖️ [CLIMAX] 高潮審問節點 × 2
    //    reqTags: ['mystery']
    //    設計原則：
    //      - 玩家出示證物的按鈕由 condition（標籤）控制可見性
    //      - 公信度高低決定圍觀者反應
    //      - 不管什麼路線都必須面對這個節點
    // ============================================================

    // CLIMAX-A：公開對峙（正面攤牌）
    DB.templates.push({
        id: 'mys_climax_confrontation',
        type: 'climax',
        reqTags: ['mystery'],
        dialogue: [
            {
                text: {
                    zh: "所有人聚集在{env_room}。<br>氣氛已經壓抑到了極點。<br>你決定，現在就是時候了。"
                }
            },
            {
                speaker: "你",
                text: {
                    zh: "兇手就在這個房間裡。"
                }
            },
            {
                text: {
                    zh: "沉默。然後，{true_culprit}{atom_manner}開口了：<br>「{alibi_claim}」"
                }
            }
        ],
        options: [
            // 選項1：出示真正的證物（需要 has_true_evidence 標籤）
            {
                label: {
                    zh: "拿出決定性證物",
                    jp: "決定的な証拠を提示する",
                    kr: "결정적인 증거를 제시하다"
                },
                condition: { tags: ['has_true_evidence'] },
                action: "advance_chain",
                rewards: {
                    tags: ["presented_true_evidence"],
                    varOps: [{ key: 'credibility', val: 30, op: '+' }]
                },
                nextScene: {
                    dialogue: [
                        {
                            text: { zh: "你拿出了那份關鍵的{combo_item_simple}，放在所有人面前。" }
                        },
                        {
                            speaker: "{true_culprit}",
                            text: { zh: "{culprit_exposed}" }
                        },
                        {
                            text: { zh: "{crowd_trust}" }
                        }
                    ],
                    options: [{ label: "看著對方的表情崩潰", action: "advance_chain" }]
                }
            },
            // 選項2：出示假線索（有 has_fake_clue 但沒有 has_true_evidence 時）
            {
                label: {
                    zh: "拿出物品，不確定有用",
                    jp: "物を出す。役に立つか不明",
                    kr: "물건을 꺼내다. 쓸모 있을지 모르겠어"
                },
                condition: {
                    tags: ['has_fake_clue'],
                    excludeTags: ['has_true_evidence', 'presented_true_evidence']
                },
                action: "advance_chain",
                rewards: {
                    tags: ["presented_fake_clue"],
                    varOps: [{ key: 'credibility', val: -25, op: '+' }]
                },
                nextScene: {
                    dialogue: [
                        {
                            text: { zh: "你拿出了那個{combo_item_simple}。<br>{true_culprit}愣了一下，然後——" }
                        },
                        {
                            speaker: "{true_culprit}",
                            text: { zh: "{culprit_counter}" }
                        },
                        {
                            text: { zh: "{crowd_doubt}" }
                        }
                    ],
                    options: [{ label: "試圖挽回局面...", action: "advance_chain" }]
                }
            },
            // 選項3：沒有證物，用邏輯推理
            {
                label: {
                    zh: "用觀察到的一切推理",
                    jp: "観察したすべてで論理的に推理する",
                    kr: "관찰한 모든 것으로 논리적으로 추리하다"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'tension', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你深吸一口氣，將所有零碎的線索在腦海中拼湊起來。<br>成敗在此一舉——" } }],
                    options: [{ label: "揭曉真相！", action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-B：生存者路線的特殊高潮（被逼到牆角）
    DB.templates.push({
        id: 'mys_climax_cornered',
        type: 'climax',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{true_culprit}把你堵在了{env_room}裡。<br>只有你們兩個人。<br>「你知道得太多了，」對方說，聲音非常平靜，<br>「比我預期的要多得多。」"
                }
            }
        ],
        options: [
            // ✅ 補上過場緩衝
            {
                label: "大聲呼救，賭有人聽到",
                action: "advance_chain",
                rewards: {
                    tags: ["called_for_help"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你拼盡全力大喊。<br>{true_culprit}臉色大變，猛地朝你撲過來！" } }],
                    options: [{ label: "躲開！", action: "advance_chain" }]
                }
            },
            // ✅ 補上過場緩衝
            {
                label: "和對方周旋，拖延時間",
                action: "advance_chain",
                rewards: { varOps: [{ key: 'tension', val: 15, op: '+' }] },
                nextScene: {
                    dialogue: [{ text: { zh: "你試圖用言語轉移對方的注意力，但{true_culprit}步步進逼。<br>「沒用的，這裡只有我們。」" } }],
                    options: [{ label: "準備迎接衝擊...", action: "advance_chain" }]
                }
            },
            // ✅ 補上過場緩衝
            {
                label: {
                    zh: "攤牌：我把你的東西藏了",
                    jp: "打ち明ける：見つけた物を隠した",
                    kr: "털어놓다：찾은 걸 내가 숨겼어"
                },
                condition: { tags: ['has_item_clue'] },
                action: "advance_chain",
                rewards: {
                    tags: ["used_item_as_leverage"],
                    varOps: [{ key: 'credibility', val: 25, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "聽到這句話，{true_culprit}的動作瞬間停住了。<br>你抓住了這唯一的破綻。" } }],
                    options: [{ label: "趁機反擊！", action: "advance_chain" }]
                }
            }
        ]
    });


    // ============================================================
    // 🏁 [END] 結局節點 × 3 偵探路線 + 2 生存路線
    //    condition 決定哪個結局被觸發
    //    引擎的 pickTemplate 會按順序找第一個符合 condition 的 end 節點
    // ============================================================

    // END-A：完美破案（有真正的鐵證，公信度高）
    DB.templates.push({
        id: 'mys_end_perfect',
        type: 'end',
        reqTags: ['mystery'],
        condition: {
            tags: ['presented_true_evidence'],
            vars: [{ key: 'credibility', val: 40, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{true_culprit}被眾人制伏，等待警察抵達。<br>你找到的{combo_item_simple}成為了決定性的鐵證。<br>在場所有人都親眼目睹了你如何一步一步還原了這場謀殺。<br>————<br>【完美破案】<br>公信度：{credibility}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
    });

    // END-B：平庸勝利（沒有鐵證，但公信度足夠讓眾人信服）
    DB.templates.push({
        id: 'mys_end_pyrrhic',
        type: 'end',
        reqTags: ['mystery'],
        condition: {
            vars: [{ key: 'credibility', val: 40, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你沒有找到決定性的鐵證，<br>但你之前累積的信任發揮了作用。<br>眾人投票，決定把{true_culprit}綁起來等待警察。<br>真相...大概是這樣吧。<br>————<br>【平庸的勝利】\n公信度：{credibility}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 60, gold: 20 } }]
    });

    // END-C：身敗名裂（公信度太低，出示了假線索）
    DB.templates.push({
        id: 'mys_end_discredited',
        type: 'end',
        reqTags: ['mystery'],
        condition: {
            tags: ['presented_fake_clue'],
            vars: [{ key: 'credibility', val: 39, op: '<=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你出示的那份「證物」反而讓局面完全倒向了你。<br>{true_culprit}冷冷地看著你，嘴角微微上揚。<br>周圍的人開始懷疑：也許，真正需要被懷疑的人是你。<br>————<br>【身敗名裂】<br>公信度：{credibility}"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 20 } }]
    });

    // END-D：劫後餘生（生存路線，天亮等到警察）
    DB.templates.push({
        id: 'mys_end_survived',
        type: 'end',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "天邊漸漸泛白。<br>你活下來了。<br>警察的車聲從遠處傳來。<br>{true_culprit}是否落網，你並不知道—。<br>你只知道，你撐過了這一夜。<br>————<br>【劫後餘生】"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 50, gold: 10 } }]
    });

    // END-E：真相目擊者（從 START-C 目擊了整件事，但選擇沉默）
    DB.templates.push({
        id: 'mys_end_silent_witness',
        type: 'end',
        reqTags: ['mystery', 'witnessed_culprit', 'route_survivor'],
        condition: {
            vars: [{ key: 'tension', val: 50, op: '<' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你親眼看見了兇手的臉。<br>你選擇了沉默。<br>也許是恐懼，也許是明哲保身。<br>{true_culprit}安然離開了，帶著那個只有你知道的秘密。<br>————<br>【沉默的目擊者】"
                }
            }
        ],
        options: [{ label: "結束冒險", action: "finish_chain", rewards: { exp: 30 } }]
    });

    console.log("✅ story_mystery.js V1.0 已載入（3 開場 × 9 中段 × 2 高潮 × 5 結局）");
})();