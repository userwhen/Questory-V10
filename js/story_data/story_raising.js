/* js/story_data/story_raising.js - V1.0
 * 養成劇本節點
 *
 * 兩種子模式（由開場選擇）：
 *
 *   route_skill_test  → 技能提升模式（類冒險）
 *     核心機制：skill_points 積累，climax 通過測試
 *     風格：皇家學院、魔法大考、競技場冠軍
 *     結局判定：skill_points 高低 + 是否完成關鍵挑戰
 *
 *   route_climb       → 升級晉升模式（類戀愛）
 *     核心機制：rank_points 積累，每次做出正確判斷就晉升
 *     風格：宮廷宮女、公司底層、練習生出道
 *     結局判定：rank_points 高低 + 是否獲得關鍵賞識
 *
 * 共用機制：
 *   pressure    → 壓力值，失誤或錯誤選擇讓壓力上升
 *   pressure >= 80 → risk_high，觸發高壓危機節點
 *   has_ally        → 是否有導師/貴人支持
 *   key_achievement → 是否完成過關鍵成就
 *
 * 與冒險劇本的連結：
 *   skill_points 變數名稱相同，可以跨劇本帶入
 *
 * reqTags 說明：
 *   reqTags: ['raising']              → 只有養成劇本觸發
 *   reqTags: ['raising', 'romance']   → 養成與戀愛共用（人際關係節點）
 *   reqTags: ['raising', 'adventure'] → 養成與冒險共用（技能訓練節點）
 */
(function () {
    const DB = window.FragmentDB;
    if (!DB) { console.error("❌ story_raising.js: FragmentDB 未就緒"); return; }

    DB.templates = DB.templates || [];


    // ============================================================
    // 🎬 [START] 開場節點 × 3
    // ============================================================

    // START-A：進入皇家學院/訓練場，目標是通過最終考核
    DB.templates.push({
        id: 'rai_start_academy',
        type: 'start',
        reqTags: ['raising'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 0,  op: 'set' },
                { key: 'rank_points',  val: 0,  op: 'set' },
                { key: 'pressure',     val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你站在{training_location}的入口前。<br><br>目標是{raising_goal}。<br>在你之前，已經有無數人在這裡放棄，或者失敗。<br><br>{mentor}從走廊盡頭走來，掃了你一眼：<br>「你就是新來的？看起來不怎麼樣。」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "低頭：「請多指教。」",
                    jp: "頭を下げる：「よろしくお願いします」",
                    kr: "고개를 숙이다：「잘 부탁드립니다」"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_skill_test", "has_ally"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                }
            },
            {
                label: {
                    zh: "「成績說話。」自行",
                    jp: "「結果で示す」独自に模索する",
                    kr: "「결과로 증명하겠어」 혼자 길을 찾다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_skill_test"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                }
            }
        ]
    });

    // START-B：進入宮廷/公司/娛樂圈，從最底層開始
    DB.templates.push({
        id: 'rai_start_bottom',
        type: 'start',
        reqTags: ['raising'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 0,  op: 'set' },
                { key: 'rank_points',  val: 0,  op: 'set' },
                { key: 'pressure',     val: 5,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "第一天。<br><br>你是{env_building}裡地位最低的人。<br>其他人用打量的眼神看著你，有人帶著同情，有人帶著輕視。<br><br>{rival}走過你身邊，肩膀輕輕撞了你一下，沒有道歉。<br><br>你的目標是{raising_goal}。<br>沒有人相信你辦得到。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "先觀察規則和生態",
                    jp: "まず規則と生態を観察する",
                    kr: "먼저 규칙과 생태를 관찰하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_climb"],
                    varOps: [{ key: 'rank_points', val: 8, op: '+' }]
                }
            },
            {
                label: {
                    zh: "找{mentor}展現自己",
                    jp: "{mentor}に自ら近づき自分を見せる",
                    kr: "{mentor}에게 먼저 다가가 자신을 보여주다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_skill_test"],
                    varOps: [
                        { key: 'skill_points', val: 5, op: '+' },
                        { key: 'pressure',     val: 5, op: '+' }
                    ]
                }
            }
        ]
    });

    // START-C：你本來是{rival}的替代品，意外獲得機會
    DB.templates.push({
        id: 'rai_start_understudy',
        type: 'start',
        reqTags: ['raising'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 0,  op: 'set' },
                { key: 'rank_points',  val: 0,  op: 'set' },
                { key: 'pressure',     val: 15, op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你從來不是第一選擇。<br><br>是{rival}臨時出了狀況，這個機會才落到你身上。<br>所有人都知道這件事，包括你自己。<br><br>{mentor}把你叫到面前：<br>「你有多少時間準備？」<br>「……沒有。」<br>「那就現在開始。」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拼命訓練，用實力堵嘴",
                    jp: "必死に訓練し実力で黙らせる",
                    kr: "필사적으로 훈련하며 실력으로 입을 막다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_skill_test", "has_mentor_push"],
                    varOps: [
                        { key: 'skill_points', val: 10, op: '+' },
                        { key: 'pressure',     val: 10, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "搞清人際關係，找盟友",
                    jp: "人間関係を把握し味方を探す",
                    kr: "인간관계를 파악하고 동료를 찾다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["route_climb"],
                    varOps: [{ key: 'rank_points', val: 10, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 📚 [MIDDLE - 技能提升路線]
    //    reqTags: ['raising', 'route_skill_test']
    // ============================================================

    // MIDDLE-技能-A：基礎訓練（反覆練習，穩定積累）
    DB.templates.push({
        id: 'rai_mid_skill_basic',
        type: 'middle',
        reqTags: ['raising', 'route_skill_test'],
        dialogue: [
            {
                text: {
                    zh: "訓練的第{depth}天。<br><br>{mentor}要求你重複同一個動作，重複到你做夢都在做為止。<br><br>你的雙手已經開始起繭，但{mentor}的表情還是沒有變化：<br>「再來。」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "握緊拳頭，再來一遍",
                    jp: "拳を握り締め、もう一度繰り返す",
                    kr: "주먹을 꽉 쥐고 한 번 더 반복하다"
                },
                check: { stat: 'VIT', val: 3 },
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'skill_points', val: 18, op: '+' },
                        { key: 'pressure',     val: 5,  op: '+' }
                    ],
                    exp: 15
                },
                successText: "{mentor}點了點頭：「今天可以了。」這是你第一次得到這句話。\n強度是平時三倍，能撐下來進步也是三倍。"
            },
            {
                label: {
                    zh: "先休息，保留體力",
                    jp: "まず休み体力を温存する",
                    kr: "먼저 쉬며 체력을 아끼다"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'skill_points', val: 8,  op: '+' },
                        { key: 'pressure',     val: -5, op: '+' }
                    ]
                }
            }
        ],
        onFail: {
            varOps: [{ key: 'pressure', val: 15, op: '+' }],
            text: "你撐不住了，動作開始變形。{mentor}讓你停下來，眼神裡帶著失望。"
        }
    });

    // MIDDLE-技能-B：高強度特訓（高風險高報酬）
    DB.templates.push({
        id: 'rai_mid_skill_intensive',
        type: 'middle',
        reqTags: ['raising', 'route_skill_test'],
        excludeTags: ['done_intensive'],
        dialogue: [
            {
                text: {
                    zh: "{mentor}給了你一個特殊的機會：<br><br>「有一個私下的特訓名額。強度是平時的三倍。<br>能撐下來的人，進步速度也是三倍。」<br><br>你看了看{rival}——對方也在考慮要不要報名。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "舉手，不給自己留退路",
                    jp: "手を挙げ、退路を断つ",
                    kr: "손을 들고 퇴로를 끊다"
                },
                check: { stat: 'VIT', val: 5 },
                action: "advance_chain",
                rewards: {
                    tags: ["done_intensive", "key_achievement"],
                    varOps: [
                        { key: 'skill_points', val: 35, op: '+' },
                        { key: 'pressure',     val: 20, op: '+' }
                    ],
                    exp: 30
                },
                successText: "你撐過來了。{rival}中途放棄了，但你沒有。{mentor}第一次正眼看你。"
            },
            {
                label: {
                    zh: "不報名，穩健進步就好",
                    jp: "参加しない。着実に進歩する",
                    kr: "참가 안 해. 착실히 발전하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["done_intensive"],
                    varOps: [{ key: 'skill_points', val: 10, op: '+' }]
                }
            }
        ],
        onFail: {
            varOps: [
                { key: 'pressure',     val: 25, op: '+' },
                { key: 'skill_points', val: 5,  op: '+' }
            ],
            text: "你還是沒撐住，但你學到了自己的極限在哪裡。失敗本身也是進步。"
        }
    });

    // MIDDLE-技能-C：HUB 自由訓練時間（箱庭式）
    DB.templates.push({
        id: 'rai_mid_skill_hub',
        type: 'middle',
        reqTags: ['raising', 'route_skill_test'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'free_time', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{mentor}給了你一段自由時間。<br><br>在{training_location}裡，有幾件事可以做。<br>自由時間很少，選擇你認為最重要的。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "加練弱點",
                    jp: "弱点を集中的に鍛える",
                    kr: "약점을 집중 훈련하다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',    val: 1,  op: '-' },
                        { key: 'skill_points', val: 18, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你針對自己最弱的部分反覆練習。<br>這種枯燥，是成長的必要代價。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "和{rival}聊聊，建立關係",
                    jp: "{rival}と話し関係を作る",
                    kr: "{rival}와 이야기하며 관계를 쌓다"
                },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'free_time', val: 1, op: '>=' }],
                    excludeTags: ['befriended_rival']
                },
                rewards: {
                    tags: ["befriended_rival"],
                    varOps: [
                        { key: 'free_time',   val: 1,  op: '-' },
                        { key: 'rank_points', val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "{rival}比你想像的還要有意思。<br>也許「對手」不一定是敵人。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "研讀理論，補強知識",
                    jp: "理論を学び知識を補強する",
                    kr: "이론을 공부하며 지식을 보강하다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    tags: ["studied_theory"],
                    varOps: [
                        { key: 'free_time',    val: 1,  op: '-' },
                        { key: 'skill_points', val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "理論和實踐必須並行。<br>你在書裡找到了一個你之前沒注意到的細節。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "結束自由時間，回歸正規",
                    jp: "自由時間を終え正規訓練へ",
                    kr: "자유 시간 끝내고 정규 훈련으로"
                },
                action: "advance_chain"
            }
        ]
    });


    // ============================================================
    // 👑 [MIDDLE - 晉升路線]
    //    reqTags: ['raising', 'route_climb']
    // ============================================================

    // MIDDLE-晉升-A：關鍵任務，做出正確判斷就晉升
    DB.templates.push({
        id: 'rai_mid_climb_task',
        type: 'middle',
        reqTags: ['raising', 'route_climb'],
        dialogue: [
            {
                text: {
                    zh: "上面交下來一個任務。<br><br>沒有人想做——太麻煩，而且風險很高。<br>但如果做好了，所有人都會記住你的名字。<br><br>{rival}用意味深長的眼神看著你：<br>「這種苦差事，交給你最適合了。」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "接過任務，不說廢話",
                    jp: "仕事を受け取り、余計な言葉は言わない",
                    kr: "임무를 받아들이고 쓸데없는 말은 하지 않다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["completed_task", "key_achievement"],
                    varOps: [
                        { key: 'rank_points', val: 25, op: '+' },
                        { key: 'pressure',    val: 10, op: '+' }
                    ],
                    exp: 20
                },
                successText: "你把任務做得比任何人預期的都好。上面的人開始注意到你的名字。"
            },
            {
                label: {
                    zh: "接下，但找人分攤風險",
                    jp: "受けるが誰かとリスクを分担する",
                    kr: "받되 누군가와 위험을 나누다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["completed_task"],
                    varOps: [{ key: 'rank_points', val: 12, op: '+' }]
                }
            },
            {
                label: "婉拒，保持低調",
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'pressure',    val: -5, op: '+' },
                        { key: 'rank_points', val: -5, op: '+' }
                    ]
                }
            }
        ],
        onFail: {
            varOps: [{ key: 'pressure', val: 20, op: '+' }],
            text: "你搞砸了。所有人都知道了。{rival}在你看不到的地方露出了滿意的笑。"
        }
    });

    // MIDDLE-晉升-B：面對上位者，說出正確的話
    DB.templates.push({
        id: 'rai_mid_climb_audience',
        type: 'middle',
        reqTags: ['raising', 'route_climb'],
        excludeTags: ['had_audience'],
        dialogue: [
            {
                text: {
                    zh: "你被叫到了{mentor}（或上位者）的面前。<br><br>這種機會千載難逢，也可能是試探。<br><br>對方靜靜地看著你，等你開口。<br><br>這一刻，你說的每一句話都很重要。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "坦誠說不足，提出改進計畫",
                    jp: "不足を認め改善計画を話す",
                    kr: "부족함을 인정하고 개선 계획을 말하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_audience", "has_ally"],
                    varOps: [{ key: 'rank_points', val: 20, op: '+' }]
                }
            },
            {
                label: "強調自己的優點與成績",
                action: "advance_chain",
                rewards: {
                    tags: ["had_audience"],
                    varOps: [{ key: 'rank_points', val: 12, op: '+' }]
                }
            },
            {
                label: {
                    zh: "{rival}壞話，高風險",
                    jp: "{rival}の悪口を言う。高リスク",
                    kr: "{rival} 험담하다. 고위험"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["had_audience"],
                    varOps: [
                        { key: 'rank_points', val: 5,   op: '+' },
                        { key: 'pressure',    val: 15,  op: '+' }
                    ]
                }
            }
        ]
    });

    // MIDDLE-晉升-C：HUB 自由行動（宮廷/職場箱庭）
    DB.templates.push({
        id: 'rai_mid_climb_hub',
        type: 'middle',
        reqTags: ['raising', 'route_climb'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'free_time', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "難得的空檔。<br><br>在{env_building}裡，人際關係就是貨幣。<br>你可以投資幾件事，但時間有限。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拜訪有影響力的人",
                    jp: "影響力のある人物を訪ねる",
                    kr: "영향력 있는 사람을 방문하다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',   val: 1,  op: '-' },
                        { key: 'rank_points', val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你留下了好印象。在這個地方，印象就是一切。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "收集情報，分清盟友與威脅",
                    jp: "情報を集め味方と脅威を把握する",
                    kr: "정보를 모아 동료와 위협을 파악하다"
                },
                action: "advance_chain",
                condition: {
                    vars: [{ key: 'free_time', val: 1, op: '>=' }],
                    excludeTags: ['gathered_intel']
                },
                rewards: {
                    tags: ["gathered_intel"],
                    varOps: [
                        { key: 'free_time',   val: 1,  op: '-' },
                        { key: 'rank_points', val: 10, op: '+' },
                        { key: 'pressure',    val: 5,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "你拼湊出了一個更完整的全局圖。<br>在這裡，知道得越多，活得越久。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "偷偷練習，悄悄提升自己",
                    jp: "こっそり練習し自分を高める",
                    kr: "몰래 연습하며 조용히 성장하다"
                },
                action: "advance_chain",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',    val: 1,  op: '-' },
                        { key: 'skill_points', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ text: { zh: "沒有人知道你在練習。<br>但當機會來臨時，你會準備好的。" } }],
                    options: [{ label: "繼續", action: "node_self" }]
                }
            },
            {
                label: {
                    zh: "結束空檔，回去工作",
                    jp: "空き時間を終え仕事に戻る",
                    kr: "여유 시간 끝내고 일로 돌아가다"
                },
                action: "advance_chain"
            }
        ]
    });


    // ============================================================
    // 🌐 [MIDDLE - 養成通用節點]
    //    reqTags: ['raising']（兩條路線都能觸發）
    // ============================================================

    // MIDDLE-通用-A：{rival} 的挑釁與壓力（高壓節點）
    DB.templates.push({
        id: 'rai_mid_any_rival',
        type: 'middle',
        reqTags: ['raising'],
        excludeTags: ['handled_rival'],
        dialogue: [
            {
                text: {
                    zh: "{rival}找上了你。<br><br>「你知道你和我的差距有多大嗎？<br>就算你拼命努力，也永遠追不上我。」<br><br>周圍有人在看。"
                }
            }
        ],
        options: [
            {
                label: "冷靜回應，用成績說話",
                action: "advance_chain",
                rewards: {
                    tags: ["handled_rival"],
                    varOps: [
                        { key: 'skill_points', val: 10, op: '+' },
                        { key: 'rank_points',  val: 5,  op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "開口，要求當場比較",
                    jp: "口を開き、その場での比較を要求する",
                    kr: "입을 열어 그 자리에서의 비교를 요청하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["handled_rival", "key_achievement"],
                    varOps: [
                        { key: 'rank_points',  val: 20, op: '+' },
                        { key: 'pressure',     val: 10, op: '+' }
                    ]
                },
                successText: "你的表現讓所有人重新評估你。{rival}的臉色不太好看。"
            },
            {
                label: {
                    zh: "忍下去，先專注自己",
                    jp: "堪えて自分に集中する",
                    kr: "참고 자신에게 집중하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["handled_rival"],
                    varOps: [{ key: 'pressure', val: 8, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-通用-B：意外的轉機（幸運事件）
    DB.templates.push({
        id: 'rai_mid_any_lucky_break',
        type: 'middle',
        reqTags: ['raising'],
        excludeTags: ['had_lucky_break'],
        dialogue: [
            {
                text: {
                    zh: "沒有預期的事發生了。<br><br>{rival}在最關鍵的時刻出了差錯，<br>而空出來的位置，就這樣落到了你面前。<br><br>你沒有請求這個機會，但它就在這裡。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "上前一步，把機會接住",
                    jp: "一歩前に出て、機会を掴み取る",
                    kr: "한 걸음 앞으로 나서 기회를 잡다"
                },
                check: { stat: 'LUK', val: 3 },
                action: "advance_chain",
                rewards: {
                    tags: ["had_lucky_break", "key_achievement"],
                    varOps: [
                        { key: 'rank_points',  val: 25, op: '+' },
                        { key: 'skill_points', val: 10, op: '+' }
                    ],
                    exp: 25
                },
                successText: "你做到了。有些機會，只有準備好的人才能接住。"
            },
            {
                label: "謹慎評估後再決定",
                action: "advance_chain",
                rewards: {
                    tags: ["had_lucky_break"],
                    varOps: [{ key: 'rank_points', val: 10, op: '+' }]
                }
            }
        ]
    });

    // MIDDLE-通用-C：高壓危機（pressure >= 80 觸發）
    DB.templates.push({
        id: 'rai_mid_any_crisis',
        type: 'middle',
        reqTags: ['raising', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "你已經太久沒有好好睡覺了。<br><br>壓力在某一個瞬間到達了臨界點。<br><br>你站在{training_location}裡，周圍的聲音好像變得很遠。<br><br>你需要做一個決定——繼續撐著，還是說出來。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "找{mentor}，坦誠說明狀態",
                    jp: "{mentor}を訪ね現状を正直に話す",
                    kr: "{mentor}를 찾아가 솔직하게 상태를 말하다"
                },
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'pressure',     val: -30, op: '+' },
                        { key: 'rank_points',  val: 10,  op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "牙關死咬，一步一步走",
                    jp: "奥歯を食いしばり、一歩一歩進む",
                    kr: "이를 꽉 물고 한 걸음 한 걸음 나아가다"
                },
                check: { stat: 'VIT', val: 6 },
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'skill_points', val: 20, op: '+' },
                        { key: 'pressure',     val: -10, op: '+' }
                    ]
                },
                successText: "你撐過去了。這種極限狀態，反而讓你突破了某個瓶頸。"
            }
        ],
        onFail: {
            varOps: [
                { key: 'pressure',     val: 15, op: '+' },
                { key: 'skill_points', val: -10, op: '+' }
            ],
            text: "你崩潰了一下。但有時候崩潰本身，才是真正休息的開始。"
        }
    });

    // MIDDLE-通用-D：養成與戀愛共用——人際突破
    DB.templates.push({
        id: 'rai_mid_any_bond',
        type: 'middle',
        reqTags: ['raising', 'romance'], // 🌟 養成與戀愛共用
        excludeTags: ['formed_bond'],
        dialogue: [
            {
                text: {
                    zh: "這一次，不是訓練，不是任務。<br><br>只是一個意外的時刻——<br>你和{mentor}（或某個重要的人）在{env_room}裡，<br>說了一些在其他時候不可能說出口的話。<br><br>關係在這一刻，悄悄地改變了。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "坦誠說困惑，也說動力",
                    jp: "困惑と動機を素直に話す",
                    kr: "혼란과 동기를 솔직하게 말하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["formed_bond", "has_ally"],
                    varOps: [
                        { key: 'rank_points',  val: 15, op: '+' },
                        { key: 'pressure',     val: -10, op: '+' }
                    ]
                }
            },
            {
                label: {
                    zh: "保持距離，維持專業",
                    jp: "距離を保ち専門的な関係を維持する",
                    kr: "거리를 유지하며 전문적 관계를 지키다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["formed_bond"],
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🎯 [CLIMAX] 高潮節點 × 2
    // ============================================================

    // CLIMAX-A：最終考核（技能提升路線）
    DB.templates.push({
        id: 'rai_climax_final_test',
        type: 'climax',
        reqTags: ['raising'],
        dialogue: [
            {
                text: {
                    zh: "考核日。<br><br>你站在{training_location}的中央，所有人都在看。<br>{mentor}坐在評審席上，表情一如既往地難以捉摸。<br>{rival}站在你旁邊，輕輕說：<br>「今天，就見真章了。」"
                }
            }
        ],
        options: [
            // 完整準備，高分通過
            {
                label: "全力發揮你訓練的一切",
                condition: { vars: [{ key: 'skill_points', val: 60, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    tags: ["passed_test_high"],
                    exp: 60
                }
            },
            // 有貴人支持
            {
                label: {
                    zh: "靠{mentor}補不足",
                    jp: "安定して{mentor}の指導で補う",
                    kr: "안정적으로 하고 {mentor}의 조언으로 보완하다"
                },
                condition: { tags: ['has_ally'] },
                action: "advance_chain",
                rewards: {
                    tags: ["passed_test_mid"],
                    exp: 40
                }
            },
            // 技能不足，硬撐
            {
                label: {
                    zh: "知道還不夠，但不放棄",
                    jp: "まだ不十分とわかっていても諦めない",
                    kr: "아직 부족한 걸 알아도 포기하지 않다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["attempted_test"],
                    varOps: [{ key: 'pressure', val: 20, op: '+' }]
                }
            }
        ]
    });

    // CLIMAX-B：關鍵晉升機會（晉升路線）
    DB.templates.push({
        id: 'rai_climax_promotion',
        type: 'climax',
        reqTags: ['raising', 'route_climb'],
        dialogue: [
            {
                text: {
                    zh: "機會終於來了。<br><br>一個位置空出來了，所有人都知道是誰最有資格——<br>但「最有資格」和「得到」之間，還有很長的距離。<br><br>{rival}已經在{mentor}面前展示了自己的成績。<br>現在，輪到你了。"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拿出積累的成果和人脈",
                    jp: "積み上げた成果と人脈を見せる",
                    kr: "쌓아온 성과와 인맥을 내보이다"
                },
                condition: {
                    tags: ['key_achievement'],
                    vars: [{ key: 'rank_points', val: 50, op: '>=' }]
                },
                action: "advance_chain",
                rewards: {
                    tags: ["won_promotion"],
                    exp: 60
                }
            },
            {
                label: {
                    zh: "{mentor}的背書",
                    jp: "{mentor}の後ろ盾がある",
                    kr: "{mentor}의 보증이 있다"
                },
                condition: { tags: ['has_ally', 'key_achievement'] },
                action: "advance_chain",
                rewards: {
                    tags: ["won_promotion_backed"],
                    exp: 45
                }
            },
            {
                label: {
                    zh: "資歷不足，提未來計畫",
                    jp: "経験不足だが未来の計画を提示する",
                    kr: "경력이 부족하지만 미래 계획을 제시하다"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["attempted_promotion"],
                    varOps: [{ key: 'pressure', val: 15, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 🏆 [END] 結局節點 × 5
    // ============================================================

    // END-A：完美成就（技能滿分通過考核）
    DB.templates.push({
        id: 'rai_end_perfect',
        type: 'end',
        reqTags: ['raising'],
        condition: {
            tags: ['passed_test_high'],
            vars: [{ key: 'skill_points', val: 60, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你的表現讓所有人沉默了。<br><br>不是因為意外，而是因為——他們早就知道你能做到，<br>只是沒想到你真的做到了。<br><br>{mentor}走到你面前，第一次伸出手：<br>「幹得好。」<br>————<br>【完美成就】<br>技能值：{skill_points}"
                }
            }
        ],
        options: [{ label: "結束旅程", action: "finish_chain", rewards: { exp: 120, gold: 60 } }]
    });

    // END-B：晉升成功（rank_points 足夠）
    DB.templates.push({
        id: 'rai_end_promoted',
        type: 'end',
        reqTags: ['raising'],
        condition: {
            tags: ['won_promotion'],
            vars: [{ key: 'rank_points', val: 50, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你得到了那個位置。<br><br>不是靠運氣，是靠你一步一步走到這裡。<br><br>{rival}看著你，表情複雜。<br>你決定是否要說些什麼——或者什麼都不說，讓結果代替你發言。<br>————<br>【晉升成功】<br>等級分：{rank_points}"
                }
            }
        ],
        options: [{ label: "結束旅程", action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
    });

    // END-C：平凡結局（有努力，但沒有突破）
    DB.templates.push({
        id: 'rai_end_average',
        type: 'end',
        reqTags: ['raising'],
        condition: {
            tags: ['attempted_test'],
            vars: [
                { key: 'skill_points', val: 59, op: '<=' },
                { key: 'rank_points',  val: 30, op: '>=' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你沒有達到最頂端。<br><br>但你也沒有失敗——只是普通。<br>普通，在這個地方，已經比大多數人走得更遠了。<br><br>{mentor}說：「你還有進步的空間。」<br>這句話，也許是批評，也許是期待。<br>————<br>【平凡結局】"
                }
            }
        ],
        options: [{ label: "結束旅程", action: "finish_chain", rewards: { exp: 50, gold: 20 } }]
    });

    // END-D：有貴人相助的成功（rank 不夠高，但有 mentor 支持）
    DB.templates.push({
        id: 'rai_end_mentored',
        type: 'end',
        reqTags: ['raising'],
        condition: { tags: ['won_promotion_backed', 'has_ally'] },
        dialogue: [
            {
                text: {
                    zh: "你不是靠自己一個人走到這裡的。<br><br>{mentor}在最關鍵的時刻說了一句話，<br>那句話，改變了所有人的判斷。<br><br>你知道這其中有運氣的成分。<br>但你也知道，是你讓自己配得上那句話。<br>————<br>【貴人相助】"
                }
            }
        ],
        options: [{ label: "結束旅程", action: "finish_chain", rewards: { exp: 70, gold: 30 } }]
    });

    // END-E：壯烈失敗（壓力崩潰，什麼都沒完成）
    DB.templates.push({
        id: 'rai_end_failed',
        type: 'end',
        reqTags: ['raising'],
        // 無 condition → fallback，當其他結局都不符合時觸發
        dialogue: [
            {
                text: {
                    zh: "你沒有成功。<br><br>但「失敗」這件事本身，也許是這段旅程最重要的收穫。<br><br>下一次，你會帶著這些痛苦重新開始。<br>也許那才是真正的起點。<br>————<br>【壯烈失敗】<br>技能值：{skill_points}"
                }
            }
        ],
        options: [{ label: "結束旅程", action: "finish_chain", rewards: { exp: 20 } }]
    });

    console.log("✅ story_raising.js V1.0 已載入（3 開場 × 10 中段 × 2 高潮 × 5 結局）");
})();