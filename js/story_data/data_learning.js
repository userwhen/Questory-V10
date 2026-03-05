/* js/story_data/story_learning.js - V1.0
 * 語言學習事件包（行動驅動理解 Action-Based Comprehension）
 *
 * 設計原則：
 *   1. 不破壞沉浸感——語言是「劇情工具」，不是考試
 *   2. 螺旋式三難度：tier_1（初見有提示）→ tier_2（應用少提示）→ tier_3（高壓無提示）
 *   3. 不需要全域開關，用 reqTags 插入對應主題劇本自然觸發
 *   4. 所有節點 type: 'middle'，引擎不需要修改
 *
 * reqTags 設計：
 *   ['learning', 'horror']           → 恐怖劇本才觸發
 *   ['learning', 'mystery']          → 偵探劇本才觸發
 *   ['learning', 'romance']          → 戀愛劇本才觸發
 *   ['learning', 'adventure']        → 冒險劇本才觸發
 *   ['learning', 'raising']          → 養成劇本才觸發
 *   ['learning', 'horror', 'risk_high'] → 高壓狀態下的 tier_3 考驗
 *
 * 知識點覆蓋（日文）：
 *   JP-001  助詞が vs を（施受關係）→ 被動語態
 *   JP-002  敬語 vs 常體（人際距離）
 *   JP-003  方向詞 左/右/前/後
 *   JP-004  危険・注意・逃げろ 等生存詞彙
 *   JP-005  時態：～た（過去）vs ～ている（現在進行）
 *
 * 知識點覆蓋（韓文）：
 *   KR-001  방향詞 뒤/앞/왼쪽/오른쪽
 *   KR-002  반말（半語）vs 존댓말（敬語）的親疏判斷
 *   KR-003  명령형（命令形）：～해라 / ～지 마라
 *   KR-004  조심 / 도망 / 위험 等生存詞彙
 *   KR-005  時態：～았/었（過去）vs ～고 있어（現在進行）
 *
 * 螺旋循環示意：
 *   第一次出現（tier_1）：有中文旁白提示
 *     「牆上寫著韓文，你隱約記得『뒤』是...」
 *   第二次出現（tier_2）：提示減少，靠上下文推斷
 *     「鏡子上的字：『뒤를 보지 마라』你必須決定」
 *   第三次出現（tier_3，risk_high）：高壓，無提示，限時感
 *     「腳步聲越來越近，血字清楚地寫著『뒤를 보지 마라』——現在。」
 */
(function () {
    const DB = window.FragmentDB;
    if (!DB) { console.error("❌ story_learning.js: FragmentDB 未就緒"); return; }

    DB.templates = DB.templates || [];


    // ============================================================
    // 📚 韓文知識點 KR-001：方向詞 뒤（後面）
    // 劇本：恐怖
    // ============================================================

    // KR-001 Tier 1：初見，有提示
    DB.templates.push({
        id: 'learn_kr001_t1_horror',
        type: 'middle',
        reqTags: ['learning', 'horror'],
        excludeTags: ['learned_kr001', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "你在{env_feature}上發現了一行用炭筆潦草寫下的韓文：<br><br>「뒤를 보지 마라」<br><br>你在腦子裡搜索——<br>你似乎記得「뒤（dwi）」在韓文裡是「後面」的意思。"
                }
            }
        ],
        options: [
            {
                label: "「不要看後面」——閉上眼睛，面朝前，慢慢退出房間",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr001", "survived_warning"],
                    varOps: [{ key: 'knowledge', val: 15, op: '+' }],
                    exp: 20
                }
            },
            {
                label: "轉身看看背後到底有什麼",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr001"],
                    varOps: [{ key: 'curse_val', val: 20, op: '+' }]
                }
            }
        ]
    });

    // KR-001 Tier 2：應用，提示減少
    DB.templates.push({
        id: 'learn_kr001_t2_horror',
        type: 'middle',
        reqTags: ['learning', 'horror'],
        excludeTags: ['applied_kr001'],
        condition: { tags: ['learned_kr001'] },
        dialogue: [
            {
                text: {
                    zh: "鏡子上的霧氣凝成了文字：<br><br>「뒤에 있어」<br><br>腳步聲從你身後傳來，越來越近。"
                }
            }
        ],
        options: [
            {
                label: "「它就在我後面」——往旁邊跳開，不要讓自己成為正面目標",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr001"],
                    varOps: [
                        { key: 'knowledge', val: 10, op: '+' },
                        { key: 'curse_val', val: -10, op: '+' }
                    ],
                    exp: 25
                }
            },
            {
                label: "繼續往前走——文字只是幻覺",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr001"],
                    varOps: [{ key: 'curse_val', val: 25, op: '+' }]
                }
            }
        ]
    });

    // KR-001 Tier 3：高壓考驗，無提示
    DB.templates.push({
        id: 'learn_kr001_t3_horror',
        type: 'middle',
        reqTags: ['learning', 'horror', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "求生本能告訴你要動，但你腳底像生了根。<br><br>前面的牆上，血字清晰：<br><br>「뒤를 봐라」<br><br>腳步聲。<br>現在。"
                }
            }
        ],
        options: [
            {
                label: "立刻轉身——這次，它叫你看",
                action: "advance_chain",
                rewards: {
                    tags: ["mastered_kr001"],
                    varOps: [
                        { key: 'knowledge', val: 20, op: '+' },
                        { key: 'curse_val', val: -15, op: '+' }
                    ],
                    exp: 40
                }
            },
            {
                label: "上次說不要看——這次還是不看",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 30, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 📚 日文知識點 JP-001：被動語態（が撃たれた vs を撃った）
    // 劇本：偵探
    // ============================================================

    // JP-001 Tier 1：初見，有解說
    DB.templates.push({
        id: 'learn_jp001_t1_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['learned_jp001'],
        dialogue: [
            {
                text: {
                    zh: "在{env_room}的{env_feature}裡，你找到了一頁撕下的日記：<br><br>「彼が撃たれた」<br><br>你停下來思考——<br>日文的「～られた」是被動語態的過去式。<br>「撃たれた」意思是「被射擊了」。<br>所以「彼が撃たれた」的意思是……"
                }
            }
        ],
        options: [
            {
                label: "「他被射了」——他是受害者，不是兇手！現場還有第三個人",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp001", "has_testimony", "found_true_victim"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }],
                    exp: 30
                }
            },
            {
                label: "「他射了人」——他就是兇手，立刻鎖定他",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp001"],
                    varOps: [
                        { key: 'credibility', val: -15, op: '+' },
                        { key: 'tension',     val: 15,  op: '+' }
                    ]
                }
            }
        ]
    });

    // JP-001 Tier 2：應用，換情境
    DB.templates.push({
        id: 'learn_jp001_t2_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['applied_jp001'],
        condition: { tags: ['learned_jp001'] },
        dialogue: [
            {
                text: {
                    zh: "另一份文件寫著：<br><br>「彼女を脅した」<br><br>只有一行，沒有上下文。<br>你必須判斷——誰威脅了誰？"
                }
            }
        ],
        options: [
            {
                label: "「她威脅了某人」——彼女（她）是主詞，を 是受詞標記",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp001"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 25
                }
            },
            {
                label: "「她被威脅了」——搞混了主動被動",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp001"],
                    varOps: [{ key: 'tension', val: 10, op: '+' }]
                }
            }
        ]
    });

    // JP-001 Tier 3：高壓，審問現場即時判斷
    DB.templates.push({
        id: 'learn_jp001_t3_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "{true_culprit}把一張紙條摔在桌上：<br><br>「私が書かされた」<br><br>「這份供詞不是我自願的，」對方說，「你自己看清楚。」<br><br>所有人都在等你的判斷。"
                }
            }
        ],
        options: [
            {
                label: "「～させられた」是被迫做某事。這份供詞是被逼寫的，有人在操控局面",
                action: "advance_chain",
                rewards: {
                    tags: ["mastered_jp001", "has_true_evidence"],
                    varOps: [{ key: 'credibility', val: 30, op: '+' }],
                    exp: 45
                }
            },
            {
                label: "「我寫了」——他自己承認了",
                action: "advance_chain",
                rewards: {
                    varOps: [
                        { key: 'credibility', val: -20, op: '+' },
                        { key: 'tension',     val: 20,  op: '+' }
                    ]
                }
            }
        ]
    });


    // ============================================================
    // 📚 日文知識點 JP-002：敬語 vs 常體（親疏關係）
    // 劇本：戀愛
    // ============================================================

    // JP-002 Tier 1：初見，情境引導
    DB.templates.push({
        id: 'learn_jp002_t1_romance',
        type: 'middle',
        reqTags: ['learning', 'romance'],
        excludeTags: ['learned_jp002'],
        dialogue: [
            {
                text: {
                    zh: "{lover}說對方只是「普通的工作夥伴」。<br><br>但你看到了對方手機裡的一則訊息——<br><br>「ねえ、今夜会えない？」<br><br>沒有敬語，也沒有「です/ます」。<br>日文的常體通常用於……很親近的人之間。"
                }
            }
        ],
        options: [
            {
                label: "這語氣根本不像同事！這就是證據",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp002", "has_fake_clue"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
                }
            },
            {
                label: "也許只是他們習慣這樣說話……",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp002"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                }
            }
        ]
    });

    // JP-002 Tier 2：更複雜的語氣分析
    DB.templates.push({
        id: 'learn_jp002_t2_romance',
        type: 'middle',
        reqTags: ['learning', 'romance'],
        excludeTags: ['applied_jp002'],
        condition: { tags: ['learned_jp002'] },
        dialogue: [
            {
                text: {
                    zh: "你找到了更多訊息記錄。<br><br>第一則：「明日の会議はよろしくお願いします」<br>第二則：「昨日はありがとうね。また会いたい」<br><br>兩則訊息，兩種語氣。<br>你需要判斷哪一則才是真正親密的往來。"
                }
            }
        ],
        options: [
            {
                label: "第二則——「ね」的語尾和省略敬語，才是真正的親密",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp002"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                    exp: 30
                }
            },
            {
                label: "第一則——語氣比較正式，感覺更認真",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp002"],
                    varOps: [{ key: 'pressure', val: 8, op: '+' }]
                }
            }
        ]
    });

    // JP-002 Tier 3：高壓對峙，即時語氣分析
    DB.templates.push({
        id: 'learn_jp002_t3_romance',
        type: 'middle',
        reqTags: ['learning', 'romance', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "{rival}當著你的面說：「我和{lover}只是普通朋友。」<br><br>但你剛才看到他們的訊息：<br>「もう、心配しすぎだよ。そんな顔しないで」<br><br>所有人都在看著你。<br>你有幾秒鐘做出判斷。"
                }
            }
        ],
        options: [
            {
                label: "「よ」「で」這種語尾和「もう」的撒嬌語氣，根本不是普通朋友",
                action: "advance_chain",
                rewards: {
                    tags: ["mastered_jp002"],
                    varOps: [{ key: 'evidence_count', val: 2, op: '+' }],
                    exp: 45
                }
            },
            {
                label: "也許這在日文裡很正常……沒辦法確定",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'pressure', val: 20, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 📚 韓文知識點 KR-002：반말（半語）親疏判斷
    // 劇本：戀愛
    // ============================================================

    // KR-002 Tier 1：初見
    DB.templates.push({
        id: 'learn_kr002_t1_romance',
        type: 'middle',
        reqTags: ['learning', 'romance'],
        excludeTags: ['learned_kr002'],
        dialogue: [
            {
                text: {
                    zh: "你無意間瞥到{rival}傳給{lover}的韓文訊息：<br><br>「야, 오늘 밤에 만나」<br><br>韓文的半語（반말）通常只用於……<br>非常親近的朋友，或者比自己年紀小的人之間。<br>「야（야）」更是只有對熟人才會這樣叫。"
                }
            }
        ],
        options: [
            {
                label: "這語氣太親了，這不是「普通認識」",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr002"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
                }
            },
            {
                label: "也許韓國朋友間都這樣說？",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr002"],
                    varOps: [{ key: 'pressure', val: 8, op: '+' }]
                }
            }
        ]
    });

    // KR-002 Tier 2：對比敬語與半語
    DB.templates.push({
        id: 'learn_kr002_t2_romance',
        type: 'middle',
        reqTags: ['learning', 'romance'],
        excludeTags: ['applied_kr002'],
        condition: { tags: ['learned_kr002'] },
        dialogue: [
            {
                text: {
                    zh: "{lover}說和{rival}不熟。<br><br>但你看到的訊息串裡，<br>第一則：「내일 보고서 보내드릴게요」（敬語）<br>第二則：「어제 정말 재미있었어. 또 만나자」（半語）<br><br>同一個人，兩種語氣。<br>哪一段對話更親密？"
                }
            }
        ],
        options: [
            {
                label: "第二則——半語加上「또 만나자（再見面吧）」，是朋友以上的親密",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr002"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                    exp: 30
                }
            },
            {
                label: "第一則——敬語反而更認真",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr002"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 📚 日文知識點 JP-003：方向詞與機關解謎
    // 劇本：冒險
    // ============================================================

    // JP-003 Tier 1：初見，有標示
    DB.templates.push({
        id: 'learn_jp003_t1_adventure',
        type: 'middle',
        reqTags: ['learning', 'adventure'],
        excludeTags: ['learned_jp003'],
        dialogue: [
            {
                text: {
                    zh: "古老的石門前，刻著兩行字：<br><br>「左 (ひだり) へ進め」<br>「右 (みぎ) は危険」<br><br>石門旁邊有兩條通道，一左一右。"
                }
            }
        ],
        options: [
            {
                label: "走左邊——「左へ進め」是「往左前進」的意思",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp003"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                    exp: 20
                }
            },
            {
                label: "走右邊",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp003"],
                    varOps: [{ key: 'skill_points', val: -10, op: '+' }]
                }
            }
        ]
    });

    // JP-003 Tier 2：沒有標注假名
    DB.templates.push({
        id: 'learn_jp003_t2_adventure',
        type: 'middle',
        reqTags: ['learning', 'adventure'],
        excludeTags: ['applied_jp003'],
        condition: { tags: ['learned_jp003'] },
        dialogue: [
            {
                text: {
                    zh: "機關底座刻著：<br><br>「前の扉を開けよ」<br><br>這次沒有假名標注。<br>三個方向的把手在你面前。"
                }
            }
        ],
        options: [
            {
                label: "開正前方的門——「前（まえ）」是「前面」",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp003"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                    exp: 25
                }
            },
            {
                label: "開左邊的門——上次是左邊",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp003"],
                    varOps: [{ key: 'skill_points', val: -8, op: '+' }]
                }
            },
            {
                label: "試著仔細推敲文字（INT 檢定）",
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp003", "puzzle_solved"],
                    varOps: [
                        { key: 'skill_points', val: 20, op: '+' },
                        { key: 'puzzle_count', val: 1,  op: '+' }
                    ],
                    exp: 30
                },
                successText: "你仔細辨認，「前」的筆畫你認得——往前走。"
            }
        ]
    });

    // JP-003 Tier 3：高壓，BOSS 前最後機關
    DB.templates.push({
        id: 'learn_jp003_t3_adventure',
        type: 'middle',
        reqTags: ['learning', 'adventure', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "最後一道封印，四個方向的刻字：<br><br>「後ろの石板を押せ」<br><br>機關開始倒計時。<br>牆壁在移動。"
                }
            }
        ],
        options: [
            {
                label: "押後面的石板——「後ろ（うしろ）」是「後面」",
                action: "advance_chain",
                rewards: {
                    tags: ["mastered_jp003", "solved_final_puzzle"],
                    varOps: [
                        { key: 'skill_points', val: 30, op: '+' },
                        { key: 'puzzle_count', val: 1,  op: '+' }
                    ],
                    exp: 50
                }
            },
            {
                label: "押前面的——感覺是往前走",
                action: "advance_chain",
                rewards: {
                    varOps: [{ key: 'skill_points', val: -15, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 📚 韓文知識點 KR-003：命令形 ～해라 / ～지 마라
    // 劇本：養成
    // ============================================================

    // KR-003 Tier 1：訓練指令初見
    DB.templates.push({
        id: 'learn_kr003_t1_raising',
        type: 'middle',
        reqTags: ['learning', 'raising'],
        excludeTags: ['learned_kr003'],
        dialogue: [
            {
                text: {
                    zh: "{mentor}留下了一張訓練筆記，上面用韓文寫著：<br><br>「지금 당장 시작해라」<br><br>你思考了一下——<br>「～해라」是命令形，「지금 당장」是「立刻、馬上」。"
                }
            }
        ],
        options: [
            {
                label: "立刻開始訓練，一刻都不等",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr003"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                    exp: 15
                }
            },
            {
                label: "等{mentor}回來再說",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr003"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                }
            }
        ]
    });

    // KR-003 Tier 2：否定命令形
    DB.templates.push({
        id: 'learn_kr003_t2_raising',
        type: 'middle',
        reqTags: ['learning', 'raising'],
        excludeTags: ['applied_kr003'],
        condition: { tags: ['learned_kr003'] },
        dialogue: [
            {
                text: {
                    zh: "考核前夕，{rival}悄悄遞給你一張紙條：<br><br>「절대 포기하지 마라」<br><br>「～지 마라」是「不要做～」的否定命令形。<br>「절대」是「絕對」。"
                }
            }
        ],
        options: [
            {
                label: "「絕對不要放棄」——{rival}在鼓勵你",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr003", "befriended_rival"],
                    varOps: [
                        { key: 'skill_points', val: 10, op: '+' },
                        { key: 'rank_points',  val: 10, op: '+' }
                    ]
                }
            },
            {
                label: "「絕對放棄吧」——這是嘲諷",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr003"],
                    varOps: [{ key: 'pressure', val: 8, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 📚 日文知識點 JP-005：時態 ～た vs ～ている
    // 劇本：偵探（螺旋複習 JP-001 後進階）
    // ============================================================

    // JP-005 Tier 1
    DB.templates.push({
        id: 'learn_jp005_t1_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['learned_jp005'],
        dialogue: [
            {
                text: {
                    zh: "監視器記錄上有一行備注：<br><br>「彼は{env_room}にいた」<br><br>「いた」是「いる（在）」的過去式。<br>這說明……"
                }
            }
        ],
        options: [
            {
                label: "「他當時在{env_room}裡」——這是不在場證明的一部分",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp005"],
                    varOps: [{ key: 'credibility', val: 10, op: '+' }],
                    exp: 20
                }
            },
            {
                label: "「他現在在{env_room}裡」——立刻去找他",
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp005"],
                    varOps: [{ key: 'tension', val: 15, op: '+' }]
                }
            }
        ]
    });

    // JP-005 Tier 2：過去式 vs 現在進行式
    DB.templates.push({
        id: 'learn_jp005_t2_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['applied_jp005'],
        condition: { tags: ['learned_jp005'] },
        dialogue: [
            {
                text: {
                    zh: "兩份證詞放在你面前：<br><br>甲：「{true_culprit}は逃げた」<br>乙：「{true_culprit}はまだ逃げている」<br><br>時間差可能決定整個案件的走向。"
                }
            }
        ],
        options: [
            {
                label: "甲說「已經逃了」，乙說「現在還在逃」——乙的情報更新，說明還在現場附近",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp005", "has_true_evidence"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }],
                    exp: 30
                }
            },
            {
                label: "兩份說的是同一件事，沒有差別",
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp005"],
                    varOps: [{ key: 'tension', val: 10, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 📚 韓日混合 KR+JP 高壓綜合事件
    // 劇本：任何主題（只在 risk_high 狀態觸發）
    // ============================================================

    DB.templates.push({
        id: 'learn_mixed_crisis',
        type: 'middle',
        reqTags: ['learning', 'risk_high'],
        excludeTags: ['faced_mixed_crisis'],
        dialogue: [
            {
                text: {
                    zh: "兩張紙條，一韓一日，都被你握在手裡。<br><br>韓文：「뒤를 봐라」<br>日文：「前へ逃げろ」<br><br>它們指示的方向相反。<br>時間不多了。"
                }
            }
        ],
        options: [
            {
                label: "韓文說「看後面」，日文說「往前逃」——往前跑，同時注意後方",
                action: "advance_chain",
                rewards: {
                    tags: ["faced_mixed_crisis", "language_master"],
                    varOps: [{ key: 'knowledge', val: 30, op: '+' }],
                    exp: 60
                }
            },
            {
                label: "太混亂了，隨便選一個方向",
                action: "advance_chain",
                rewards: {
                    tags: ["faced_mixed_crisis"],
                    varOps: [{ key: 'curse_val', val: 20, op: '+' }]
                }
            }
        ]
    });


    // ============================================================
    // 詞庫擴充：把語言學習相關的 fragment key 加進 DB.fragments
    // （供節點文本裡的 {佔位符} 使用）
    // ============================================================
    if (DB.fragments) {
        Object.assign(DB.fragments, {

            // 語言警告句（日文）
            jp_warning: [
                { val: "危ない！ここは開けないで",    tag: ["learning", "adventure", "jp"] },
                { val: "逃げろ！今すぐここを出ろ！",  tag: ["learning", "horror", "jp"] },
                { val: "触れるな、呪われるぞ",        tag: ["learning", "horror", "jp"] },
                { val: "前へ進め、後ろを見るな",       tag: ["learning", "adventure", "jp"] },
            ],

            // 語言警告句（韓文）
            kr_warning: [
                { val: "뒤를 보지 마라！",             tag: ["learning", "horror", "kr"] },
                { val: "도망쳐！빨리！",               tag: ["learning", "horror", "kr"] },
                { val: "조심해！위험해！",             tag: ["learning", "horror", "kr"] },
                { val: "왼쪽으로 가！",               tag: ["learning", "adventure", "kr"] },
            ],

            // 語言線索句（日文，偵探用）
            jp_clue: [
                { val: "彼が撃たれた",                 tag: ["learning", "mystery", "jp"] },
                { val: "彼女を脅した",                 tag: ["learning", "mystery", "jp"] },
                { val: "鍵はここだ",                   tag: ["learning", "mystery", "jp"] },
                { val: "私が書かされた",               tag: ["learning", "mystery", "jp"] },
            ],

            // 語言親密句（日文，戀愛用）
            jp_intimate: [
                { val: "ねえ、今夜会えない？",         tag: ["learning", "romance", "jp"] },
                { val: "昨日はありがとうね。また会いたい", tag: ["learning", "romance", "jp"] },
                { val: "もう、心配しすぎだよ",         tag: ["learning", "romance", "jp"] },
            ],

            // 語言親密句（韓文，戀愛用）
            kr_intimate: [
                { val: "야, 오늘 밤에 만나",           tag: ["learning", "romance", "kr"] },
                { val: "어제 정말 재미있었어. 또 만나자", tag: ["learning", "romance", "kr"] },
                { val: "내가 네 생각만 해",            tag: ["learning", "romance", "kr"] },
            ],
        });
    }

    console.log("✅ story_learning.js V1.0 已載入");
    console.log("   JP 知識點：JP-001（被動語態）JP-002（敬語）JP-003（方向詞）JP-005（時態）");
    console.log("   KR 知識點：KR-001（方向詞 뒤）KR-002（반말）KR-003（命令形）");
    console.log("   高壓混合：韓日雙語綜合判斷 × 1");
    console.log("   總計：18 個學習節點（每知識點 2-3 個難度層次）");
})();