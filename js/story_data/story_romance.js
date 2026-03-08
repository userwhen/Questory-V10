/* js/story_data/story_romance_v2.js - V2.0
 * 戀愛劇本擴充包（可直接與 story_romance.js V1.0 並存）
 *
 * 新增三條路線（由開場選擇決定）：
 *
 *   route_otome    → 乙女路線
 *     玩家在多個角色之間自由互動，透過 HUB 選擇去哪裡、跟誰互動
 *     每個角色有獨立的 affection_[角色key] 數值
 *     最終在 climax 選擇表白對象，結局依對象不同而異
 *
 *   route_consort  → 正宮之路（宮廷/後宮/競爭晉升）
 *     與養成的 route_climb 類似，但目標是「獲得主角的獨家寵愛」
 *     rank_points → 「寵愛值」，rival 是其他試圖搶位的角色
 *     需要在政治手腕與真感情之間做選擇
 *
 *   route_confront → 對峙路線（找出背叛/出軌證據）
 *     類似偵探劇本，但核心是情感而非推理
 *     evidence_count 累積到足夠時，可以選擇「攤牌」或「離開」
 *     結局可以是原諒、分手、或找出誤會
 *
 * 注意：本檔案完全不使用 {atmosphere}
 * 所有節點都可以和 story_romance.js V1.0 的節點混合抽取
 */
(function () {
    const DB = window.FragmentDB;
    if (!DB) { console.error("❌ story_romance_v2.js: FragmentDB 未就緒"); return; }

    DB.templates = DB.templates || [];


    // ============================================================
    // 🎬 [START] 新增開場節點 × 3（三條新路線各一個）
    // ============================================================

    // START-乙女：你來到了一個新環境，認識了幾個不同的人
	// START-A：偶然相遇（命運式邂逅）
    DB.templates.push({
        id: 'rom_start_encounter',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection', val: 0,  op: 'set' },
                { key: 'trust',     val: 0,  op: 'set' },
                { key: 'pressure',  val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你在{meet_location}遇見了{lover}。<br><br>{env_pack_visual}<br><br>這不是刻意安排的相遇，但你知道這種事沒有純粹的偶然。<br><br>{lover}{state_modifier}，<br>然後抬起頭，和你的視線正面交鋒。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "主動開口，不留後悔",
                    jp: "自ら口を開き後悔を残さない",
                    kr: "먼저 말을 걸어 후회를 남기지 않다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_direct"],
                    varOps: [
                        { key: 'affection', val: 8, op: '+' },
                        { key: 'pressure',  val: 5, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "先靜靜觀察，等時機",
                    jp: "静かに観察し機会を待つ",
                    kr: "조용히 관찰하며 기회를 기다리다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_indirect"],
                    varOps: [{ key: 'trust', val: 5, op: '+' }]
                }
            }
        ]
    });

    // START-B：你們早就認識，但從來不是這樣的關係
    DB.templates.push({
        id: 'rom_start_known',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection', val: 10, op: 'set' },
                { key: 'trust',     val: 15, op: 'set' },
                { key: 'pressure',  val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你和{lover}已經認識了很長時間。<br><br>朋友、同學，或者只是會點頭的熟人。<br>但最近某件事讓你開始用不一樣的眼光看對方。<br><br>你不確定這是什麼感覺，<br>你只知道，你開始會在意{lover}在不在場。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "感覺還清晰，現在開口",
                    jp: "感覚が鮮明なうちに話しかける",
                    kr: "느낌이 생생할 때 먼저 말을 걸다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_direct"],
                    varOps: [{ key: 'affection', val: 10, op: '+' }]
                }
            },
            {
                label: {
                    zh: "假裝沒變，觀察對方",
                    jp: "何も変わらないふりで相手を観察",
                    kr: "아무것도 안 변한 척하며 상대를 살피다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_indirect"],
                    varOps: [{ key: 'trust', val: 10, op: '+' }]
                }
            }
        ]
    });

    // START-C：命中注定的環境，你們被困在一個地方
    DB.templates.push({
        id: 'rom_start_forced',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection', val: 0,  op: 'set' },
                { key: 'trust',     val: 0,  op: 'set' },
                { key: 'pressure',  val: 10, op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{env_pack_sensory}<br><br>你和{lover}因為某個突發狀況，被迫困在了{env_room}裡。<br><br>平時說不上幾句話的關係，<br>突然變得無比近距離。<br><br>沉默讓空氣變得奇怪。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "打破沉默，開口找話題",
                    jp: "沈黙を破り話題を探す",
                    kr: "침묵을 깨고 화제를 찾다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_direct"],
                    varOps: [
                        { key: 'affection', val: 5, op: '+' },
                        { key: 'trust',     val: 5, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "安靜著，讓對方感到你",
                    jp: "静かに、存在を感じさせる",
                    kr: "조용히 존재감을 느끼게 하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_indirect"],
                    varOps: [{ key: 'trust', val: 8, op: '+' }]
                }
            }
        ]
    });
    DB.templates.push({
        id: 'rom_start_otome',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection',        val: 0,  op: 'set' },
                { key: 'trust',            val: 0,  op: 'set' },
                { key: 'pressure',         val: 0,  op: 'set' },
                { key: 'aff_lover',        val: 0,  op: 'set' },
                { key: 'aff_rival',        val: 0,  op: 'set' },
                { key: 'aff_mentor',       val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "新的環境，新的開始。<br><br>在{env_building}裡，你一個人都不認識。<br><br>但很快地，幾個人出現在你的視野裡：<br>{lover}。{rival}。還有{mentor}。<br><br>每一個人都有自己的故事，<br>而你的故事，從你選擇靠近誰開始。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "先了解環境，再說別的",
                    jp: "まず環境を把握する",
                    kr: "먼저 환경을 파악하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_otome"],
                    varOps: [{ key: 'aff_lover', val: 0, op: 'set' }]
                }
            },
            {
                label: {
                    zh: "找{lover}說話",
                    jp: "{lover}に話しかける",
                    kr: "{lover}에게 말을 걸다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_otome", "route_direct"],
                    varOps: [{ key: 'aff_lover', val: 10, op: '+' }]
                }
            }
        ]
    });

    // START-正宮：你進入了一個競爭激烈的環境，目標是獲得唯一的位置
    DB.templates.push({
        id: 'rom_start_consort',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection', val: 0,  op: 'set' },
                { key: 'trust',     val: 0,  op: 'set' },
                { key: 'pressure',  val: 10, op: 'set' },
                { key: 'rank_points', val: 0, op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "這裡的規則很清楚：只有一個位置，但有很多人想要它。<br><br>你看著{rival}——對方已經站穩了腳跟，<br>對你投來一個意味深長的眼神。<br><br>{lover}在遠處，目光短暫地掃過你，<br>然後移開了。<br><br>遊戲從現在開始。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "先摸清規則和人際",
                    jp: "まず規則と人間関係を把握する",
                    kr: "먼저 규칙과 인간관계를 파악하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_consort"],
                    varOps: [{ key: 'rank_points', val: 8, op: '+' }]
                }
            },
            {
                label: {
                    zh: "真心打動{lover}",
                    jp: "素直に見せ真心で{lover}を動かす",
                    kr: "솔직하게 보여주며 진심으로 {lover}를 움직이다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_consort", "route_direct"],
                    varOps: [
                        { key: 'affection', val: 10, op: '+' },
                        { key: 'pressure',  val: 8,  op: '+' }
                    ]
                }
            }
        ]
    });

    // START-對峙：你開始懷疑，但還沒有確定
    DB.templates.push({
        id: 'rom_start_confront',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection',      val: 30, op: 'set' },
                { key: 'trust',          val: 20, op: 'set' },
                { key: 'pressure',       val: 15, op: 'set' },
                { key: 'evidence_count', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你和{lover}在一起已經有一段時間了。<br><br>但最近，有些事情不太對勁。<br><br>電話響了就走出去接。<br>出門的理由越來越模糊。<br>偶爾，你看到{rival}的名字出現在{lover}的手機螢幕上。<br><br>你不確定自己是否多心。<br>但你需要知道真相。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "再多收集證據，確認了再說",
                    jp: "証拠を集めてから確かめる",
                    kr: "증거를 더 모은 후 확인하다"
                },
                action: "advance_chain",
                rewards: { tags: ["route_confront"] }
            },
            {
                label: {
                    zh: "問{lover}要說明",
                    jp: "{lover}に直接聞き説明を求める",
                    kr: "{lover}에게 직접 물어 설명을 요구하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_confront", "route_direct"],
                    varOps: [
                        { key: 'trust',    val: 10, op: '+' },
                        { key: 'pressure', val: 15, op: '+' }
                    ]
                }
            }
        ]
    });


    // ============================================================
    // 💕 [MIDDLE - 乙女路線] 多角色互動
    //    reqTags: ['romance', 'route_otome']
    //    核心：HUB 讓玩家選擇去哪裡跟誰互動
    // ============================================================

    // MIDDLE-乙女-HUB：自由行動，選擇互動對象
    DB.templates.push({
        id: 'rom_mid_otome_hub',
        type: 'middle',
        reqTags: ['romance', 'route_otome'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'free_time', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>你有一段自由的時間。<br>這裡有幾個人，你可以選擇去找誰說話。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "找{lover}【好感{aff_lover}】",
                    jp: "{lover}を訪ねる【好感{aff_lover}】",
                    kr: "{lover}를 찾아가다【호감{aff_lover}】"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1, op: '-' },
                        { key: 'aff_lover', val: 15, op: '+' },
                        { key: 'affection', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{lover}{state_modifier}。<br><br>你們聊了一會兒，話題從{env_room}的某件事說起，<br>漸漸說到了更深的地方。<br><br>你發現{lover}比你想像的更有趣。" } }],
                    options: [
                        {
                            label: "繼續深聊",
                            action: "node_self",
                            rewards: {
                                varOps: [
                                    { key: 'aff_lover', val: 8, op: '+' },
                                    { key: 'trust',     val: 5, op: '+' }
                                ]
                            }
                        },
                        { label: "今天就到這裡", action: "node_self" }
                    ]
                }
            },
            {
                label: {
                    zh: "找{rival}♥{aff_rival}",
                    jp: "{rival}を訪ねる【好感{aff_rival}】",
                    kr: "{rival}를 찾아가다【호감{aff_rival}】"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1,  op: '-' },
                        { key: 'aff_rival', val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{rival}看到你走過來，表情有些意外。<br><br>「找我有什麼事？」<br><br>你發現{rival}和你想像的不完全一樣——<br>也許並不是純粹的對手。" } }],
                    options: [
                        {
                            label: "試著更了解對方",
                            action: "node_self",
                            rewards: {
                                tags: ["knows_rival"],
                                varOps: [{ key: 'aff_rival', val: 8, op: '+' }]
                            }
                        },
                        { label: "保持距離，今天到這裡", action: "node_self" }
                    ]
                }
            },
            {
                label: {
                    zh: "找{mentor}♥{aff_mentor}",
                    jp: "{mentor}を訪ねる【好感{aff_mentor}】",
                    kr: "{mentor}를 찾아가다【호감{aff_mentor}】"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',  val: 1,  op: '-' },
                        { key: 'aff_mentor', val: 12, op: '+' },
                        { key: 'trust',      val: 8,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{mentor}給了你一些你意想不到的建議。<br><br>對方似乎比表面上更在意你的處境。<br>你不確定這代表什麼，但心裡的某個地方，<br>莫名地暖了一下。" } }],
                    options: [
                        {
                            label: "認真說出你的困境",
                            action: "node_self",
                            rewards: {
                                tags: ["mentor_confidant"],
                                varOps: [{ key: 'aff_mentor', val: 10, op: '+' }]
                            }
                        },
                        { label: "謝過後離開", action: "node_self" }
                    ]
                }
            },
            {
                label: "🚪 一個人待著",
                action: "advance_chain"
            }
        ]
    });

    // MIDDLE-乙女-B：兩個角色起衝突，你必須選邊站
    DB.templates.push({
        id: 'rom_mid_otome_triangle',
        type: 'middle',
        reqTags: ['romance', 'route_otome'],
        excludeTags: ['resolved_triangle'],
        dialogue: [
            {
                text: {
                    zh: "{lover}和{rival}在你面前發生了爭執。<br><br>話題和你有關。<br><br>兩個人都轉向你，等你說話。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "站在{lover}那邊",
                    jp: "{lover}の側に立つ",
                    kr: "{lover} 편에 서다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["resolved_triangle"],
                    varOps: [
                        { key: 'aff_lover', val: 20, op: '+' },
                        { key: 'aff_rival', val: -10, op: '+' },
                        { key: 'pressure',  val: 10,  op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "{rival}邊，出人意料",
                    jp: "{rival}側に立つ。意外な選択",
                    kr: "{rival} 편에 서다. 의외의 선택"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["resolved_triangle"],
                    varOps: [
                        { key: 'aff_rival', val: 25, op: '+' },
                        { key: 'aff_lover', val: -5,  op: '+' },
                        { key: 'pressure',  val: 15,  op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "不選邊，說出自己立場",
                    jp: "どちらも選ばず自分の立場を言う",
                    kr: "어느 쪽도 선택 않고 내 입장을 말하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["resolved_triangle"],
                    varOps: [
                        { key: 'aff_lover',  val: 8,  op: '+' },
                        { key: 'aff_rival',  val: 8,  op: '+' },
                        { key: 'trust',      val: 12, op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-乙女-C：獨處時刻（與特定角色的深度事件）
    DB.templates.push({
        id: 'rom_mid_otome_alone_lover',
        type: 'middle',
        reqTags: ['romance', 'route_otome'],
        excludeTags: ['had_alone_lover'],
        dialogue: [
            {
                text: {
                    zh: "你和{lover}意外地單獨在{env_room}裡。<br><br>{env_pack_visual}<br><br>這種情況不常有，<br>而你知道，說不定這就是某個轉折點。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "說出平時說不出口的話",
                    jp: "普段言えない言葉を口にする",
                    kr: "평소 못 하던 말을 꺼내다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_alone_lover"],
                    varOps: [
                        { key: 'aff_lover', val: 25, op: '+' },
                        { key: 'trust',     val: 15, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "靜靜地在一起，不說話",
                    jp: "静かに一緒にいて何も言わない",
                    kr: "조용히 함께 있으며 아무 말도 하지 않다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_alone_lover"],
                    varOps: [{ key: 'aff_lover', val: 15, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 👑 [MIDDLE - 正宮路線] 後宮/競爭晉升
    //    reqTags: ['romance', 'route_consort']
    // ============================================================

    // MIDDLE-正宮-A：展示你的獨特價值
    DB.templates.push({
        id: 'rom_mid_con_showcase',
        type: 'middle',
        reqTags: ['romance', 'route_consort'],
        excludeTags: ['showcased'],
        dialogue: [
            {
                text: {
                    zh: "機會來了。<br><br>在所有人面前，你有一個展示自己的時刻。<br>{rival}已經表現過了，而且表現得不差。<br><br>輪到你了。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "展現最真實的自己",
                    jp: "最も得意な本当の自分を見せる",
                    kr: "가장 잘하는 진짜 자신을 보여주다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["showcased"],
                    varOps: [
                        { key: 'affection',   val: 20, op: '+' },
                        { key: 'rank_points', val: 20, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "展現對方想看到的樣子",
                    jp: "相手が見たい姿を見せる",
                    kr: "상대가 보고 싶어 하는 모습을 보여주다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["showcased"],
                    varOps: [
                        { key: 'rank_points', val: 25, op: '+' },
                        { key: 'trust',       val: -8, op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-正宮-B：HUB 宮廷/職場手腕
    DB.templates.push({
        id: 'rom_mid_con_hub',
        type: 'middle',
        reqTags: ['romance', 'route_consort'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'free_time', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "這是個需要眼觀四面的地方。<br><br>每一個選擇，都可能改變你在{lover}心中的位置。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "製造和{lover}獨處的機會",
                    jp: "{lover}と二人きりの機会を作る",
                    kr: "{lover}와 단둘이 있을 기회를 만들다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1,  op: '-' },
                        { key: 'affection', val: 20, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你成功地讓{lover}只注意到你。<br>至少在這一刻。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "化解{rival}對你的攻勢",
                    jp: "{rival}の攻勢をかわす",
                    kr: "{rival}의 공세를 무력화하다"
                },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'free_time', val: 1, op: '>=' }],
                    excludeTags: ['neutralized_rival']
                },
                rewards: {
                    tags: ["neutralized_rival"],
                    varOps: [
                        { key: 'free_time',   val: 1,  op: '-' },
                        { key: 'rank_points', val: 15, op: '+' },
                        { key: 'pressure',    val: 5,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{rival}的計畫沒有得逞。<br>你沒有做任何惡意的事——只是比對方更聰明地應對了局面。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "說句讓{lover}記住你的話",
                    jp: "{lover}の心に残る言葉を言う",
                    kr: "{lover}의 기억에 남을 말을 하다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1,  op: '-' },
                        { key: 'affection', val: 15, op: '+' },
                        { key: 'trust',     val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{lover}停下來，認真地看了你一眼。<br>有些話，說出口的時機比內容更重要。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: "🚪 靜觀其變",
                action: "advance_chain"
            }
        ]
    });

    // MIDDLE-正宮-C：{rival} 的正面挑戰
    DB.templates.push({
        id: 'rom_mid_con_rival_challenge',
        type: 'middle',
        reqTags: ['romance', 'route_consort'],
        excludeTags: ['faced_rival_challenge'],
        dialogue: [
            {
                text: {
                    zh: "{rival}選擇了正面交鋒。<br><br>「{lover}對你有什麼好感，不過是因為你夠新鮮，」<br>對方{atom_manner}說，「等一段時間，一切都會回歸原位。」<br><br>周圍有人在看。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "冷靜：讓時間說話",
                    jp: "冷静に：時間が証明する",
                    kr: "냉정하게：시간이 증명할 거야"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["faced_rival_challenge"],
                    varOps: [
                        { key: 'rank_points', val: 15, op: '+' },
                        { key: 'affection',   val: 10, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "{lover}行動回應",
                    jp: "{lover}に向き直り行動で答える",
                    kr: "{lover}를 향해 행동으로 답하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["faced_rival_challenge"],
                    varOps: [
                        { key: 'affection', val: 20, op: '+' },
                        { key: 'pressure',  val: 10, op: '+' }
                    ]
                }
            }
        ]
    });


    // ============================================================
    // 🔍 [MIDDLE - 對峙路線] 收集證據與情感抉擇
    //    reqTags: ['romance', 'route_confront']
    // ============================================================

    // MIDDLE-對峙-A：發現可疑的訊息
    DB.templates.push({
        id: 'rom_mid_conf_evidence_msg',
        type: 'middle',
        reqTags: ['romance', 'route_confront'],
        excludeTags: ['found_msg_evidence'],
        dialogue: [
            {
                text: {
                    zh: "{lover}把手機留在{env_room}裡，自己出去了。<br><br>螢幕亮了。<br>你沒有刻意偷看，但你看見了{rival}的名字。<br><br>還有訊息的開頭幾個字——那個語氣，不像是普通的朋友。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "打開看，信任可能受損",
                    jp: "開けて見る。信頼が下がるかも",
                    kr: "열어보다. 신뢰가 떨어질 수도"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["found_msg_evidence"],
                    varOps: [
                        { key: 'evidence_count', val: 1,   op: '+' },
                        { key: 'trust',          val: -10, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "把手機翻面，裝沒看見",
                    jp: "スマホを裏返し見なかったふりをする",
                    kr: "폰을 뒤집어 못 본 척하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["found_msg_evidence"],
                    varOps: [{ key: 'pressure', val: 15, op: '+' }]
                }
            },
            {
                label: {
                    zh: "{lover}回來直接問",
                    jp: "{lover}が戻ったら直接聞く",
                    kr: "{lover}가 돌아오면 직접 묻다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["found_msg_evidence", "asked_directly"],
                    varOps: [
                        { key: 'trust',    val: 10, op: '+' },
                        { key: 'pressure', val: 10, op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-對峙-B：HUB 調查行動
    DB.templates.push({
        id: 'rom_mid_conf_hub_investigate',
        type: 'middle',
        reqTags: ['romance', 'route_confront'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'search_count', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你決定主動去找答案。<br><br>有幾個方向可以調查，但每一個都有代價——<br>對關係的代價，或是對自己心理的代價。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "查{lover}最近的行程",
                    jp: "{lover}の最近の行動を調べる",
                    kr: "{lover}의 최근 일정을 조사하다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'search_count',   val: 1,   op: '-' },
                        { key: 'evidence_count', val: 1,   op: '+' },
                        { key: 'trust',          val: -5,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "幾個日期對不上。<br>你不知道這算不算證據，<br>但你沒辦法假裝自己沒注意到。" } }],
                    options: [{ label: "繼續調查", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "轉向共同朋友，側面打聽",
                    jp: "共通の知人に向き直り、さりげなく聞く",
                    kr: "공통 지인에게 돌아서 슬쩍 물어보다"
                },
                check: { stat: 'INT', val: 3 },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'search_count', val: 1, op: '>=' }],
                    excludeTags: ['asked_mutual_friend']
                },
                rewards: {
                    tags: ["asked_mutual_friend"],
                    varOps: [
                        { key: 'search_count',   val: 1,  op: '-' },
                        { key: 'evidence_count', val: 1,  op: '+' }
                    ]
                },
                successText: "對方說漏了一句話。<br>你現在更確定了一件事。"
            },
            {
                label: {
                    zh: "問自己：真想知道嗎",
                    jp: "自分に問う：本当に知りたいか",
                    kr: "스스로에게 묻다：정말 알고 싶어"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'search_count', val: 1,   op: '-' },
                        { key: 'trust',        val: 10,  op: '+' },
                        { key: 'pressure',     val: -10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "也許你最怕的，不是被背叛，<br>而是確認之後不知道該怎麼辦。<br><br>你稍微平靜了一點。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: "🚪 先不繼續調查",
                action: "advance_chain"
            }
        ]
    });

    // MIDDLE-對峙-C：偶然遇見{rival}
    DB.templates.push({
        id: 'rom_mid_conf_meet_rival',
        type: 'middle',
        reqTags: ['romance', 'route_confront'],
        excludeTags: ['confronted_rival'],
        dialogue: [
            {
                text: {
                    zh: "你在{env_room}裡遇到了{rival}。<br><br>單獨。<br><br>對方看到你，明顯愣了一下，<br>然後很快恢復了鎮定：<br>「我們需要談談。」"
                }
            }
        ],
        options: [
            {
                label: "「說。」",
                action: "advance_chain",
                rewards: {
                    tags: ["confronted_rival"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
                }
            },
            {
                label: {
                    zh: "沉默轉身，什麼都不說",
                    jp: "黙って背を向ける",
                    kr: "침묵한 채 등을 돌리다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["confronted_rival"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                }
            },
            {
                label: {
                    zh: "{lover}知道你來嗎",
                    jp: "聞く：{lover}は知っているか",
                    kr: "묻다：{lover}는 알고 있어"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["confronted_rival"],
                    varOps: [
                        { key: 'evidence_count', val: 2, op: '+' },
                        { key: 'trust',          val: 5, op: '+' }
                    ]
                }
            }
        ]
    });
	// ============================================================
    // 💕 [MIDDLE - 直球路線]
    //    reqTags: ['romance', 'route_direct']
    // ============================================================

    // MIDDLE-直球-A：主動邀約
    DB.templates.push({
        id: 'rom_mid_dir_ask_out',
        type: 'middle',
        reqTags: ['romance', 'route_direct'],
        excludeTags: ['asked_out'],
        dialogue: [
            {
                text: {
                    zh: "你鼓起勇氣問了：<br>「下次，可以一起去{meet_location}嗎？」<br><br>{lover}沉默了一秒鐘。<br>那一秒，比你想像的還要漫長。"
                }
            }
        ],
        options: [
            {
                label: "坦誠說出這是你的期待",
                action: "advance_chain",
                rewards: {
                    tags: ["asked_out", "had_date"],
                    varOps: [
                        { key: 'affection', val: 20, op: '+' },
                        { key: 'trust',     val: 10, op: '+' }
                    ],
                    exp: 15
                }
            },
            {
                label: {
                    zh: "說「順路」或「偶然」",
                    jp: "「ついで」か「偶然」と言う",
                    kr: "「가는 길에」 또는 「우연히」라 하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["asked_out"],
                    varOps: [
                        { key: 'affection', val: 10, op: '+' },
                        { key: 'trust',     val: -5, op: '+' }
                    ]
                }
            },
            {
                label: "臨時改口，算了這次",
                action: "advance_chain",
                rewards: {
                    tags: ["asked_out"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-直球-B：約會中的關鍵時刻
    DB.templates.push({
        id: 'rom_mid_dir_date_moment',
        type: 'middle',
        reqTags: ['romance', 'route_direct'],
        excludeTags: ['had_key_moment'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>你們在{env_light}的映照下並肩走著。<br><br>{lover}突然停下來，說了一句你沒想到的話：<br>「你有沒有想過，如果當初我們沒有遇見……」<br><br>話說到一半，沒有繼續。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "接話：那我應該會很可惜",
                    jp: "話を受ける：残念に思うだろう",
                    kr: "말을 받다：그럼 많이 아쉬울 것 같아"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_key_moment"],
                    varOps: [
                        { key: 'affection', val: 25, op: '+' },
                        { key: 'trust',     val: 15, op: '+' }
                    ]
                }
            },
            {
                label: "笑著轉移話題",
                action: "advance_chain",
                rewards: {
                    tags: ["had_key_moment"],
                    varOps: [{ key: 'affection', val: 8, op: '+' }]
                }
            },
            {
                label: "認真問對方想說什麼",
                action: "advance_chain",
                rewards: {
                    tags: ["had_key_moment"],
                    varOps: [
                        { key: 'trust', val: 20, op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-直球-C：HUB 共度時光（箱庭式）
    DB.templates.push({
        id: 'rom_mid_dir_hub_together',
        type: 'middle',
        reqTags: ['romance', 'route_direct'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'time_together', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你和{lover}有一段完整的時間。<br><br>{env_pack_visual}<br><br>沒有打擾，沒有外部壓力。<br>只有你們兩個人，和一些可以做的選擇。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "分享平時不說的事",
                    jp: "普段言わないことを話す",
                    kr: "평소에 안 하던 이야기를 나누다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'time_together', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'time_together', val: 1,  op: '-' },
                        { key: 'trust',         val: 18, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{lover}比你想像的更認真在聽。<br>有些事，說出口之後就不一樣了。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "一起做件平時不做的事",
                    jp: "普段しないことを一緒にする",
                    kr: "평소에 안 하는 일을 함께 하다"
                },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'time_together', val: 1, op: '>=' }],
                    excludeTags: ['shared_activity']
                },
                rewards: {
                    tags: ["shared_activity"],
                    varOps: [
                        { key: 'time_together', val: 1,  op: '-' },
                        { key: 'affection',     val: 20, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{lover}笑了。<br>你記住了這一刻——不是因為特別，而是因為很自然。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "說出一直沒說的感覺",
                    jp: "ずっと言えなかった気持ちを言う",
                    kr: "계속 못 했던 감정을 말하다"
                },
                action: "advance_chain",
                condition: {
                    vars: [
                        { key: 'time_together', val: 1,  op: '>=' },
                        { key: 'affection',     val: 30, op: '>=' }
                    ]
                },
                rewards: {
                    tags: ["confessed_hint"],
                    varOps: [
                        { key: 'time_together', val: 1,  op: '-' },
                        { key: 'affection',     val: 15, op: '+' },
                        { key: 'trust',         val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{lover}沉默了一下。<br>然後，對方的表情變了。<br>你不確定那是什麼——但不是壞事。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "就這樣靜靜在一起就好",
                    jp: "このまま静かに一緒にいる",
                    kr: "이대로 조용히 함께 있으면 돼"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'trust', val: 5, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🌱 [MIDDLE - 慢熱路線]
    //    reqTags: ['romance', 'route_indirect']
    // ============================================================

    // MIDDLE-慢熱-A：不動聲色地在意
    DB.templates.push({
        id: 'rom_mid_ind_silent_care',
        type: 'middle',
        reqTags: ['romance', 'route_indirect'],
        excludeTags: ['showed_care'],
        dialogue: [
            {
                text: {
                    zh: "{lover}看起來{state_modifier}。<br><br>你沒有直接問，但你注意到了。<br>你可以假裝沒看見，或者用你自己的方式，讓對方知道有人在。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "默默做件讓對方好過的事",
                    jp: "黙って相手が楽になることをする",
                    kr: "말없이 상대를 편하게 해줄 일을 하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["showed_care"],
                    varOps: [
                        { key: 'trust',     val: 20, op: '+' },
                        { key: 'affection', val: 10, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "找個藉口靠近，不解釋",
                    jp: "口実を作って近づく。理由は言わない",
                    kr: "구실 만들어 다가가다. 이유는 말하지 않다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["showed_care"],
                    varOps: [{ key: 'affection', val: 15, op: '+' }]
                }
            },
            {
                label: {
                    zh: "這不關你事，保持距離",
                    jp: "自分の事ではない。距離を保つ",
                    kr: "내 일이 아니야. 거리를 유지하다"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'pressure', val: 5, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-慢熱-B：意外的坦白時刻
    DB.templates.push({
        id: 'rom_mid_ind_accidental_honest',
        type: 'middle',
        reqTags: ['romance', 'route_indirect'],
        excludeTags: ['had_honest_moment'],
        dialogue: [
            {
                text: {
                    zh: "你們不知道怎麼聊到了這個話題。<br><br>{lover}說了一些平時不會對別人說的話。<br>然後停下來，像是意識到自己說太多了，看著你：<br>「……算了，你不用回答。」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "認真回答，說出自己的想法",
                    jp: "真剣に答え自分の考えを話す",
                    kr: "진지하게 답하며 자신의 생각을 나누다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_honest_moment"],
                    varOps: [
                        { key: 'trust',     val: 25, op: '+' },
                        { key: 'affection', val: 15, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "輕描淡寫，給對方空間",
                    jp: "さらりと流し相手に空間を与える",
                    kr: "가볍게 넘기며 상대에게 여유를 주다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_honest_moment"],
                    varOps: [{ key: 'trust', val: 12, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-慢熱-C：HUB 日常相處（箱庭式）
    DB.templates.push({
        id: 'rom_mid_ind_hub_daily',
        type: 'middle',
        reqTags: ['romance', 'route_indirect'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'daily_moments', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "普通的日子。<br><br>但你發現，普通的日子裡，{lover}的存在佔了越來越多的比例。<br><br>你可以選擇讓這種感覺繼續生長，<br>或者試著說清楚它。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "傳一則算不算在意的訊息",
                    jp: "気にしているかどうかわからないメッセージを送る",
                    kr: "신경 쓰는 건지 모를 메시지를 보내다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'daily_moments', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'daily_moments', val: 1,  op: '-' },
                        { key: 'affection',     val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{lover}回了。<br>不算快，但也沒有很慢。<br>你看了很多遍才放下手機。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "不動聲色，留意細節",
                    jp: "顔色を変えず、細部に目を向ける",
                    kr: "표정 하나 않고 세세한 부분을 살피다"
                },
                check: { stat: 'INT', val: 3 },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'daily_moments', val: 1, op: '>=' }],
                    excludeTags: ['read_signals']
                },
                rewards: {
                    tags: ["read_signals"],
                    varOps: [
                        { key: 'daily_moments', val: 1,  op: '-' },
                        { key: 'trust',         val: 15, op: '+' }
                    ]
                },
                successText: "你注意到{lover}在你面前會做的一些小動作。<br>也許對方也在等什麼。"
            },
            {
                label: {
                    zh: "安靜夜晚寫下，沒送出",
                    jp: "静かな夜に書いたが送らなかった",
                    kr: "조용한 밤에 적었지만 보내지 않다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'daily_moments', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'daily_moments', val: 1,  op: '-' },
                        { key: 'trust',         val: 10, op: '+' },
                        { key: 'affection',     val: 8,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你把它存了下來。<br>有一天，也許你會送出去。<br>也許不會。<br>但光是寫出來，你就更清楚自己在想什麼了。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: "🚪 讓日子繼續流動",
                action: "advance_chain"
            }
        ]
    });


    // ============================================================
    // 🌐 [MIDDLE - 戀愛通用節點]
    // ============================================================

    // MIDDLE-通用-A：外部壓力介入（流言、第三者）
    DB.templates.push({
        id: 'rom_mid_any_interference',
        type: 'middle',
        reqTags: ['romance'],
        excludeTags: ['handled_interference'],
        dialogue: [
            {
                text: {
                    zh: "{rival}出現了。<br><br>不是在挑釁你，而是在{lover}身邊，<br>用一種讓你說不清楚的方式靠近。<br><br>你感覺到了，但你不確定這算不算你的事。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "直接問{lover}你們是什麼",
                    jp: "{lover}に直接関係を聞く",
                    kr: "{lover}에게 직접 관계를 묻다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["handled_interference"],
                    varOps: [
                        { key: 'trust',     val: 15, op: '+' },
                        { key: 'pressure',  val: 10, op: '+' }
                    ]
                }
            },
            {
                label: "不動聲色，繼續觀察",
                action: "advance_chain",
                rewards: {
                    tags: ["handled_interference"],
                    varOps: [{ key: 'pressure', val: 15, op: '+' }]
                }
            },
            {
                label: {
                    zh: "製造和{lover}獨處",
                    jp: "{lover}との機会を増やし行動で示す",
                    kr: "{lover}와 함께할 기회를 늘려 행동으로 보여주다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["handled_interference"],
                    varOps: [
                        { key: 'affection', val: 15, op: '+' },
                        { key: 'pressure',  val: 5,  op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-通用-B：誤會與解釋
    DB.templates.push({
        id: 'rom_mid_any_misunderstanding',
        type: 'middle',
        reqTags: ['romance'],
        excludeTags: ['resolved_misunderstanding'],
        dialogue: [
            {
                text: {
                    zh: "你做的某件事，被{lover}誤解了。<br><br>對方的態度明顯不一樣，但沒有直接說。<br>這種沉默比爭吵更難受。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "主動解釋，不讓誤會發酵",
                    jp: "自ら説明し誤解を放置しない",
                    kr: "직접 설명하며 오해를 방치하지 않다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["resolved_misunderstanding"],
                    varOps: [
                        { key: 'trust',    val: 20, op: '+' },
                        { key: 'pressure', val: -8, op: '+' }
                    ]
                }
            },
            {
                label: "等對方先開口",
                action: "advance_chain",
                rewards: {
                    tags: ["resolved_misunderstanding"],
                    varOps: [{ key: 'pressure', val: 12, op: '+' }]
                }
            },
            {
                label: "裝作沒事，讓時間解決",
                action: "advance_chain",
                rewards: {
                    tags: ["resolved_misunderstanding"],
                    varOps: [
                        { key: 'trust',    val: -10, op: '+' },
                        { key: 'pressure', val: 8,   op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-通用-C：高壓危機（外部壓力爆發，risk_high 觸發）
    DB.templates.push({
        id: 'rom_mid_any_crisis',
        type: 'middle',
        reqTags: ['romance', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "流言已經控制不住了。<br><br>所有人都在討論你和{lover}的關係，<br>有些人帶著善意，有更多人帶著惡意。<br><br>{lover}給你發了一條訊息：<br>「我們需要談談。」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "坦誠說感覺，不管結果",
                    jp: "素直に気持ちを言う。結果は問わない",
                    kr: "솔직하게 감정을 말하다. 결과는 상관없어"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'trust',     val: 25, op: '+' },
                        { key: 'pressure',  val: -20, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "護{lover}，感覺放後",
                    jp: "まず{lover}を守り自分の気持ちは後",
                    kr: "먼저 {lover}를 지키고 내 감정은 뒤로"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'affection', val: 20, op: '+' },
                        { key: 'pressure',  val: -10, op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-通用-D：與養成共用——重要關係的坦白時刻
    DB.templates.push({
        id: 'rom_mid_any_bond',
        type: 'middle',
        reqTags: ['romance', 'raising'], // 🌟 與養成共用（不同變數方向）
        excludeTags: ['had_deep_talk'],
        dialogue: [
            {
                text: {
                    zh: "在{env_room}裡，只有你們兩個人。<br><br>{env_pack_visual}<br><br>有些話，你覺得今天不說，可能再也找不到機會說了。"
                }
            }
        ],
        options: [
            {
                label: "說出來",
                action: "advance_chain",
                rewards: {
                    tags: ["had_deep_talk"],
                    varOps: [
                        { key: 'trust',        val: 20, op: '+' },
                        { key: 'affection',    val: 15, op: '+' },
                        { key: 'rank_points',  val: 10, op: '+' }  // 養成劇本觸發時也有效
                    ]
                }
            },
            {
                label: {
                    zh: "沒說，對方已感覺到",
                    jp: "言わなくても相手に伝わった",
                    kr: "말 안 했지만 상대가 느꼈다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_deep_talk"],
                    varOps: [{ key: 'affection', val: 20, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 💌 [CLIMAX] 新增高潮節點 × 3
    // ============================================================
	   // CLIMAX-A：告白時刻
    DB.templates.push({
        id: 'rom_climax_confession',
        type: 'climax',
        reqTags: ['romance'],
        dialogue: [
            {
                text: {
                    zh: "你已經想過這個時刻很多次了。<br><br>現在它真的來了。<br><br>{lover}就在你面前，{env_pack_visual}<br><br>你知道，說出口之後，一切都會不一樣。"
                }
            }
        ],
        options: [
            // 好感度和信任度都高：雙向確認
            {
                label: {
                    zh: "說出感覺，直接而清楚",
                    jp: "気持ちを直接はっきり言う",
                    kr: "감정을 직접 명확하게 말하다"
                },
                condition: {
                    vars: [
                        { key: 'affection', val: 40, op: '>=' },
                        { key: 'trust',     val: 35, op: '>=' }
                    ]
                },
                action: "advance_chain",
                rewards: {
                    tags: ["confessed", "mutual_feeling"],
                    exp: 50
                }
            },
            // 好感度高但信任不夠：半表白
            {
                label: {
                    zh: "用行動代替語言",
                    jp: "言葉より行動で示す",
                    kr: "말 대신 행동으로 보여주다"
                },
                condition: { vars: [{ key: 'affection', val: 35, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["confessed"],
                    varOps: [{ key: 'affection', val: 10, op: '+' }]
                }
            },
            // 信任夠但好感度不足：坦誠說不確定
            {
                label: {
                    zh: "說出困惑，讓對方知道",
                    jp: "困惑を打ち明け相手に伝える",
                    kr: "혼란을 털어놓고 상대에게 알리다"
                },
                condition: { vars: [{ key: 'trust', val: 35, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["confessed"],
                    varOps: [{ key: 'trust', val: 15, op: '+' }]
                }
            },
            // 保底：什麼都說不出來
            {
                label: "這個時機不對，先算了",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'pressure', val: 20, op: '+' }]
                }
            }
        ]
    });

    // CLIMAX-B：關係的最終考驗（外部危機下的選擇）
    DB.templates.push({
        id: 'rom_climax_crisis_choice',
        type: 'climax',
        reqTags: ['romance'],
        condition: { vars: [{ key: 'pressure', val: 50, op: '>=' }] },
        dialogue: [
            {
                text: {
                    zh: "外部的壓力已經大到你們不能再迴避了。<br><br>{lover}說：「如果繼續這樣，對你不好。也許我們應該……」<br><br>話沒說完。<br>但你知道對方在說什麼。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "「我不管。我只是不想放棄。」",
                    jp: "「どうでもいい。諦めたくないだけ」",
                    kr: "「상관없어. 나는 그냥 포기하기 싫어」"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["chose_to_stay"],
                    varOps: [{ key: 'trust', val: 30, op: '+' }]
                }
            },
            {
                label: {
                    zh: "也許你對，但無法決定",
                    jp: "「正しいかも。でも私には決められない」",
                    kr: "「맞을 수도 있어. 하지만 내가 결정할 수 없어」"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["confessed"],
                    varOps: [{ key: 'affection', val: 20, op: '+' }]
                }
            }
        ]
    });

    // CLIMAX-乙女：選擇表白對象
    DB.templates.push({
        id: 'rom_climax_otome_choose',
        type: 'climax',
        reqTags: ['romance', 'route_otome'],
        dialogue: [
            {
                text: {
                    zh: "這段時間，你認識了幾個不一樣的人。<br><br>而現在，你必須做出一個選擇——<br>或者，你選擇不做選擇。<br><br>心裡的那個答案，你其實早就知道了。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "向{lover}表白",
                    jp: "{lover}に告白する",
                    kr: "{lover}에게 고백하다"
                },
                condition: { vars: [{ key: 'aff_lover', val: 40, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["chose_lover"],
                    exp: 50
                }
            },
            {
                label: {
                    zh: "向{rival}表白，出人意料",
                    jp: "{rival}に告白する。意外な選択",
                    kr: "{rival}에게 고백하다. 모두를 놀라게"
                },
                condition: { vars: [{ key: 'aff_rival', val: 40, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["chose_rival"],
                    exp: 50
                }
            },
            {
                label: {
                    zh: "向{mentor}告白",
                    jp: "{mentor}に告白する",
                    kr: "{mentor}에게 고백하다"
                },
                condition: { vars: [{ key: 'aff_mentor', val: 40, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["chose_mentor"],
                    exp: 50
                }
            },
            {
                label: {
                    zh: "誰都不選，維持現狀",
                    jp: "誰も選ばず現状を維持する",
                    kr: "아무도 선택 않고 현상 유지"
                },
                action: "advance_chain",
                rewards: { tags: ["chose_none"] }
            }
        ]
    });

    // CLIMAX-正宮：最後的競爭
    DB.templates.push({
        id: 'rom_climax_consort_final',
        type: 'climax',
        reqTags: ['romance', 'route_consort'],
        dialogue: [
            {
                text: {
                    zh: "決定性的時刻到了。<br><br>{rival}和你，站在同一個位置的兩個候選人。<br>{lover}必須做出選擇。<br><br>你能做的，你都做了。<br>現在，只剩下等待。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "最後說一句發自內心的話",
                    jp: "最後に心からの言葉を言う",
                    kr: "마지막으로 진심에서 우러난 말을 하다"
                },
                condition: { vars: [{ key: 'trust', val: 30, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["won_consort"],
                    exp: 60
                }
            },
            {
                label: {
                    zh: "用積累的資歷說話",
                    jp: "積み上げた実績で語る",
                    kr: "쌓아온 실적으로 말하다"
                },
                condition: { vars: [{ key: 'rank_points', val: 50, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["won_consort"],
                    exp: 50
                }
            },
            {
                label: {
                    zh: "不說，讓{lover}決定",
                    jp: "何も言わず{lover}に決めさせる",
                    kr: "아무 말 않고 {lover}가 결정하게 두다"
                },
                action: "advance_chain",
                rewards: { tags: ["waited_consort"] }
            }
        ]
    });

    // CLIMAX-對峙：真相大白的時刻
    DB.templates.push({
        id: 'rom_climax_confront_truth',
        type: 'climax',
        reqTags: ['romance', 'route_confront'],
        dialogue: [
            {
                text: {
                    zh: "你決定正面攤牌。<br><br>你和{lover}面對面，<br>手邊放著你這段時間收集到的一切。<br><br>你深吸一口氣。<br>說出來之後，沒有退路。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拿出證據，要{lover}解釋",
                    jp: "証拠を出し{lover}に説明を求める",
                    kr: "증거를 내밀며 {lover}에게 설명을 요구하다"
                },
                condition: { vars: [{ key: 'evidence_count', val: 3, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["showed_evidence"],
                    exp: 50
                }
            },
            {
                label: {
                    zh: "不用證據，只說感受",
                    jp: "証拠なしで気持ちだけを言う",
                    kr: "증거 없이 감정만 말하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["said_feelings"],
                    varOps: [{ key: 'trust', val: 20, op: '+' }]
                }
            },
            {
                label: {
                    zh: "{lover}：愛我嗎",
                    jp: "{lover}に聞く：愛してるか",
                    kr: "{lover}에게 묻다：나를 사랑해"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["asked_directly", "said_feelings"],
                    exp: 40
                }
            }
        ]
    });


    // ============================================================
    // 🌸 [END] 新增結局節點 × 6
    // ============================================================

    // END-乙女-A：選擇了{lover}，對方回應了
    DB.templates.push({
        id: 'rom_end_otome_lover',
        type: 'end',
        reqTags: ['romance'],
        condition: {
            tags: ['chose_lover'],
            vars: [
                { key: 'aff_lover', val: 40, op: '>=' },
                { key: 'trust',     val: 20, op: '>=' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{lover}沉默了一下。<br>然後，微微笑了。<br><br>「我以為你永遠不會說出來。」<br><br>原來對方也一直在等。<br>————<br>【{lover}路線完結】<br>好感度：{aff_lover}"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
    });

    // END-乙女-B：出乎意料地選擇了{rival}
    DB.templates.push({
        id: 'rom_end_otome_rival',
        type: 'end',
        reqTags: ['romance'],
        condition: { tags: ['chose_rival'] },
        dialogue: [
            {
                text: {
                    zh: "{rival}的表情，是你第一次看到對方真正驚訝的樣子。<br><br>「……你認真的？」<br>「認真的。」<br><br>這個答案，連你自己都沒有預期。<br>————<br>【{rival}路線完結】"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 80, gold: 30 } }]
    });

    // END-正宮：成為正宮
    DB.templates.push({
        id: 'rom_end_consort_won',
        type: 'end',
        reqTags: ['romance'],
        condition: { tags: ['won_consort'] },
        dialogue: [
            {
                text: {
                    zh: "{lover}做出了選擇。<br><br>是你。<br><br>{rival}轉身離開了，沒有說話。<br>你站在原地，感覺到的不只是勝利，<br>還有一種沉甸甸的責任——<br>你要配得上這個選擇。<br>————<br>【正宮之路完結】<br>寵愛值：{rank_points}"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
    });

    // END-對峙-A：原諒（真相是誤會）
    DB.templates.push({
        id: 'rom_end_confront_forgive',
        type: 'end',
        reqTags: ['romance'],
        condition: {
            tags: ['showed_evidence'],
            vars: [{ key: 'trust', val: 30, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{lover}聽完了你說的一切。<br><br>然後解釋了你不知道的部分。<br>有些事，比你想的更複雜，<br>也比你擔心的更單純。<br><br>你花了一段時間消化，<br>然後選擇相信。<br>————<br>【原諒，重新開始】"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 80, gold: 30 } }]
    });

    // END-對峙-B：離開（確認背叛）
    DB.templates.push({
        id: 'rom_end_confront_leave',
        type: 'end',
        reqTags: ['romance'],
        condition: {
            tags: ['showed_evidence'],
            vars: [{ key: 'trust', val: 29, op: '<=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{lover}沒有否認。<br><br>你放下了手邊的一切，站起來：<br>「我知道了。」<br>就這三個字。<br><br>你離開的時候，沒有眼淚。<br>也許眼淚之後會來，但現在，你感覺的是清醒。<br>————<br>【選擇離開】"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 60, gold: 20 } }]
    });

    // END-對峙-C：感情說清楚（不靠證據，靠坦誠）
    DB.templates.push({
        id: 'rom_end_confront_honest',
        type: 'end',
        reqTags: ['romance'],
        condition: { tags: ['said_feelings'] },
        dialogue: [
            {
                text: {
                    zh: "你沒有拿出任何證據。<br><br>你只是說出了你的感受，<br>和你真正想要的是什麼。<br><br>{lover}聽完了，沉默了一下，<br>然後說了一句讓你意想不到的話。<br><br>不管那句話是什麼，<br>你知道，這段關係從今天起不一樣了。<br>————<br>【以真心換真心】"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 70, gold: 25 } }]
    });
	DB.templates.push({
        id: 'rom_end_mutual',
        type: 'end',
        reqTags: ['romance'],
        condition: {
            tags: ['mutual_feeling'],
            vars: [
                { key: 'affection', val: 40, op: '>=' },
                { key: 'trust',     val: 35, op: '>=' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{lover}說：「我也是。」<br><br>就這三個字。<br>沒有特別複雜的告白，沒有戲劇性的場景。<br>只是兩個人，在{env_light}的映照下，終於說清楚了。<br>————<br>【真心相愛】<br>好感度：{affection}　信任度：{trust}"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 120, gold: 50 } }]
    });

    // END-B：表面幸福（affection 高但 trust 低）
    DB.templates.push({
        id: 'rom_end_surface',
        type: 'end',
        reqTags: ['romance'],
        condition: {
            vars: [
                { key: 'affection', val: 40, op: '>=' },
                { key: 'trust',     val: 34, op: '<=' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你們在一起了。<br><br>從外面看，這是一段很好的關係。<br>但你們之間，有些話始終沒有說清楚。<br><br>也許以後會說。<br>也許不會。<br>————<br>【表面幸福】<br>好感度：{affection}　信任度：{trust}"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 70, gold: 20 } }]
    });

    // END-C：深刻友誼（trust 高但 affection 低）
    DB.templates.push({
        id: 'rom_end_friendship',
        type: 'end',
        reqTags: ['romance'],
        condition: {
            vars: [
                { key: 'trust',     val: 40, op: '>=' },
                { key: 'affection', val: 34, op: '<=' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你說了，但{lover}的回應不是你期待的那種。<br><br>「你對我來說很重要，」對方說，「但不是那樣。」<br><br>這句話很痛，但你知道那是真話。<br>而真話，有時候比謊言更珍貴。<br>————<br>【深刻友誼】<br>信任度：{trust}"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 60, gold: 15 } }]
    });

    // END-D：壓力下選擇留下（risk_high 路線的特殊結局）
    DB.templates.push({
        id: 'rom_end_persisted',
        type: 'end',
        reqTags: ['romance'],
        condition: { tags: ['chose_to_stay'] },
        dialogue: [
            {
                text: {
                    zh: "那些流言和壓力沒有散去。<br>但你們選擇不在乎。<br><br>這不是電影裡的結局——沒有戲劇性的反轉，沒有所有人突然理解。<br>只是兩個人，決定繼續站在彼此旁邊。<br>————<br>【選擇留下】"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 90, gold: 30 } }]
    });

    // END-E：遺憾分離（保底結局）
    DB.templates.push({
        id: 'rom_end_parted',
        type: 'end',
        reqTags: ['romance'],
        // 無 condition → fallback
        dialogue: [
            {
                text: {
                    zh: "有些故事，沒有走到那個結局。<br><br>不是因為不好，只是時機不對，<br>或者你們都還沒有準備好。<br><br>但那些時刻，都是真實的。<br>————<br>【遺憾分離】<br>好感度：{affection}　信任度：{trust}"
                }
            }
        ],
        options: [{ label: "結束故事", action: "finish_chain", rewards: { exp: 30 } }]
    });


    console.log("✅ story_romance_v2.js V2.0 已載入（3 開場 × 12 中段 × 3 高潮 × 6 結局）");
    console.log("   可與 story_romance.js V1.0 並存，引擎會將所有節點混合抽取。");
})();