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
                label: {
                    zh: "閉上眼睛，面朝前，慢慢退出房間",
                    jp: "目を閉じてゆっくり下がる",
                    kr: "눈을 감고 천천히 물러나다"
                },
                next: { 
                    zh: "「뒤를 보지 마라」的意思是「不要看後面」。你做出了正確的選擇。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr001", "survived_warning"],
                    varOps: [{ key: 'knowledge', val: 15, op: '+' }],
                    exp: 20
                }
            },
            {
                label: {
                    zh: "轉身看看背後到底有什麼",
                    jp: "振り返って後ろを見る",
                    kr: "뒤돌아서 확인하다"
                },
                next: { 
                    zh: "你轉身了。但「뒤를 보지 마라」的意思是「不要看後面」..." 
                },
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
                label: {
                    zh: "往旁邊跳開，避開正面目標",
                    jp: "横に飛びのく",
                    kr: "옆으로 피하다"
                },
                next: { 
                    zh: "「뒤에 있어」意思是「它就在我後面」。" 
                },
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
                label: {
                    zh: "繼續往前走",
                    jp: "前に進み続ける",
                    kr: "계속 앞으로 가다"
                },
                next: { 
                    zh: "你以為文字只是幻覺。但「뒤에 있어」的意思是「它就在我後面」。" 
                },
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
                label: {
                    zh: "立刻轉身",
                    jp: "すぐに振り返る",
                    kr: "즉시 뒤돌아보다"
                },
                next: { 
                    zh: "「봐라」是「看」的意思。這次它寫著「看後面」。" 
                },
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
                label: {
                    zh: "這次還是不看",
                    jp: "今回も見ない",
                    kr: "이번에도 보지 않다"
                },
                next: { 
                    zh: "你決定不看。但「봐라」是「看」的意思，規則已經變了。" 
                },
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
                label: {
                    zh: "他是受害者，現場還有第三人",
                    jp: "彼は被害者。第三者がいる",
                    kr: "그는 피해자. 제3자가 있다"
                },
                next: { 
                    zh: "「彼が撃たれた」意思是「他被射了」。既然他是受害者，開槍的必定另有其人。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp001", "has_testimony", "found_true_victim"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }],
                    exp: 30
                }
            },
            {
                label: {
                    zh: "他就是兇手，立刻鎖定他",
                    jp: "彼が犯人だ、すぐに特定する",
                    kr: "그가 범인이다, 즉시 지목하다"
                },
                next: { 
                    zh: "你以為是「他射了人」。但「～られた」是被動語態，他其實是被射擊的受害者。" 
                },
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
                label: {
                    zh: "她是被威脅的對象",
                    jp: "彼女が脅された側だ",
                    kr: "그녀가 협박받은 쪽이다"
                },
                next: { 
                    zh: "「を」是受詞標記，這句的意思是「（某人）威脅了她」。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp001"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 25
                }
            },
            {
                label: {
                    zh: "她主動威脅了別人",
                    jp: "彼女が誰かを脅した",
                    kr: "그녀가 누군가를 협박했다"
                },
                next: { 
                    zh: "你搞混了主動與被動關係。「を」是受詞標記，她其實是被威脅的受害者。" 
                },
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
                label: {
                    zh: "這份供詞是被逼寫的",
                    jp: "この供述は強要されたものだ",
                    kr: "이 진술은 강요받은 것이다"
                },
                next: { 
                    zh: "「～させられた」是使役被動態，代表「被迫做某事」。有人在幕後操控局面。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["mastered_jp001", "has_true_evidence"],
                    varOps: [{ key: 'credibility', val: 30, op: '+' }],
                    exp: 45
                }
            },
            {
                label: {
                    zh: "他自己承認寫了供詞",
                    jp: "本人が書いたと認めた",
                    kr: "그가 직접 썼다고 인정했다"
                },
                next: { 
                    zh: "你以為是「我寫了」。但「～かされた」是被迫的意思，這份供詞其實是被逼寫下的。" 
                },
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
                label: {
                    zh: "這語氣根本不像同事！",
                    jp: "同僚とは思えない口調だ！",
                    kr: "동료라고는 생각할 수 없는 말투야!"
                },
                next: { 
                    zh: "沒有敬語的常體，代表兩人的關係非常親密，這就是關鍵證據。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp002", "has_fake_clue"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
                }
            },
            {
                label: {
                    zh: "也許只是習慣這樣說話",
                    jp: "ただの話し言葉の癖かも…",
                    kr: "그냥 말투의 습관일지도..."
                },
                next: { 
                    zh: "你試圖說服自己。但在日本職場，對普通工作夥伴不用敬語是非常罕見的。" 
                },
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
                label: {
                    zh: "第二則是真正的親密",
                    jp: "2つ目が本当に親密な関係だ",
                    kr: "두 번째가 진짜 친밀한 관계다"
                },
                next: { 
                    zh: "「ね」的語尾和省略敬語的常體，展現了毫無防備的親密感。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp002"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                    exp: 30
                }
            },
            {
                label: {
                    zh: "第一則比較正式認真",
                    jp: "1つ目の方が真剣な感じがする",
                    kr: "첫 번째가 더 진지한 느낌이다"
                },
                next: { 
                    zh: "第一則確實認真，但「よろしくお願いします」是標準的職場敬語，代表兩人之間仍有距離。" 
                },
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
                label: {
                    zh: "這語氣根本不是普通朋友",
                    jp: "こんな口調、ただの友達じゃない",
                    kr: "이런 말투는 그냥 친구가 아니야"
                },
                next: { 
                    zh: "「もう」的撒嬌語氣，加上省略敬語的「で」「よ」，這絕對是情侶間的對話。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["mastered_jp002"],
                    varOps: [{ key: 'evidence_count', val: 2, op: '+' }],
                    exp: 45
                }
            },
            {
                label: {
                    zh: "沒辦法確定，也許很正常",
                    jp: "普通のことかもしれない…確信が持てない",
                    kr: "일반적인 걸지도 몰라... 확신할 수 없어"
                },
                next: { 
                    zh: "你在關鍵時刻猶豫了。但在日文語境中，這種語氣已經完全越過了「普通朋友」的界線。" 
                },
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
                label: {
                    zh: "這語氣太親密了",
                    jp: "親しすぎる口調だ",
                    kr: "너무 친근한 말투야"
                },
                next: { 
                    zh: "這絕對不是「普通認識」。半語加上「야」的稱呼，代表他們私下關係非常熟絡。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr002"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
                }
            },
            {
                label: {
                    zh: "這很正常吧？",
                    jp: "普通じゃない？",
                    kr: "평범한 거 아냐?"
                },
                next: { 
                    zh: "你以為韓國朋友間都這樣說？但其實對不熟的人用半語是非常沒禮貌的，他們絕不只是普通朋友。" 
                },
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
                label: {
                    zh: "第二則更親密",
                    jp: "2つ目の方が親密だ",
                    kr: "두 번째가 더 친밀해"
                },
                next: { 
                    zh: "第二則使用了半語，而且「또 만나자（再見面吧）」展現了朋友以上的親密感。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr002"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                    exp: 30
                }
            },
            {
                label: {
                    zh: "第一則更親密",
                    jp: "1つ目の方が親密だ",
                    kr: "첫 번째가 더 친밀해"
                },
                next: { 
                    zh: "第一則雖然看似認真，但「보내드릴게요（會寄給您）」是標準的職場敬語，顯示出雙方的距離感。" 
                },
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
                label: {
                    zh: "走左邊",
                    jp: "左へ行く",
                    kr: "왼쪽으로 가다"
                },
                next: { 
                    zh: "「左へ進め」的意思正是「往左前進」。你安全通過了。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp003"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                    exp: 20
                }
            },
            {
                label: {
                    zh: "走右邊",
                    jp: "右へ行く",
                    kr: "오른쪽으로 가다"
                },
                next: { 
                    zh: "你選擇了右邊，但「右は危険」的意思是「右邊危險」。你觸發了陷阱。" 
                },
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
                label: {
                    zh: "開前方的門",
                    jp: "前の扉を開ける",
                    kr: "앞의 문을 열다"
                },
                next: { 
                    zh: "「前（まえ）」就是「前面」，你打開了正前方的門，機關順利解開。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp003"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                    exp: 25
                }
            },
            {
                label: {
                    zh: "開左邊的門",
                    jp: "左の扉を開ける",
                    kr: "왼쪽의 문을 열다"
                },
                next: { 
                    zh: "你憑藉上次的記憶選了左邊，但這次刻的漢字明明是「前」。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp003"],
                    varOps: [{ key: 'skill_points', val: -8, op: '+' }]
                }
            },
            {
                label: {
                    zh: "仔細推敲文字 (INT檢定)",
                    jp: "文字をじっくり考える",
                    kr: "글자를 신중히 추론하다"
                },
                check: { stat: 'INT', val: 4 },
                next: { 
                    zh: "你冷靜辨認筆畫，想起了「前」的意思正是往前走。理智引導你做出了正確選擇。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp003", "puzzle_solved"],
                    varOps: [
                        { key: 'skill_points', val: 20, op: '+' },
                        { key: 'puzzle_count', val: 1,  op: '+' }
                    ],
                    exp: 30
                }
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
                label: {
                    zh: "押後面的石板",
                    jp: "後ろの石板を押す",
                    kr: "뒤쪽의 석판을 누르다"
                },
                next: { 
                    zh: "在千鈞一髮之際，你認出了「後ろ（うしろ）」是「後面」的意思。機關停止了移動。" 
                },
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
                label: {
                    zh: "押前面的石板",
                    jp: "前の石板を押す",
                    kr: "앞쪽의 석판을 누르다"
                },
                next: { 
                    zh: "你憑直覺押了前面，但「後ろ」的意思其實是後面！陷阱被觸發了。" 
                },
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
                label: {
                    zh: "立刻開始訓練",
                    jp: "すぐに訓練を始める",
                    kr: "즉시 훈련을 시작하다"
                },
                next: { 
                    zh: "「시작해라」的意思正是「開始吧」。你準確執行了命令，沒有浪費一刻鐘。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr003"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                    exp: 15
                }
            },
            {
                label: {
                    zh: "等導師回來",
                    jp: "メンターを待つ",
                    kr: "멘토를 기다리다"
                },
                next: { 
                    zh: "你決定等一下，但「시작해라」是命令形，這句話要求你立刻開始，你錯失了訓練的最佳時機。" 
                },
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
                label: {
                    zh: "這是在鼓勵我",
                    jp: "これは励ましだ",
                    kr: "이건 격려야"
                },
                next: { 
                    zh: "「절대 포기하지 마라」意思是「絕對不要放棄」。對方其實正在默默為你加油。" 
                },
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
                label: {
                    zh: "這是在嘲諷我",
                    jp: "これは嫌味だ",
                    kr: "이건 비아냥이야"
                },
                next: { 
                    zh: "你以為對方在嘲諷，但「～지 마라」是「不要」的意思，其實對方是叫你不要放棄。" 
                },
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

// ════════════════════════════════════════════════════════════════
    // 📚 JP-005：時態 ～た vs ～ている｜ 劇本：偵探
    // ════════════════════════════════════════════════════════════════

    // JP-005 Tier 1：初見，辨識過去式
    DB.templates.push({
        id: 'learn_jp005_t1_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['learned_jp005'],
        dialogue: [{
            text: {
                zh: "監視器記錄上有一行備注：<br><br>「彼は{env_room}にいた」<br><br>他是「當時在」還是「現在在」？",
                jp: "監視カメラの記録に一行：<br><br>「彼は{env_room}にいた」<br><br>「当時いた」それとも「今いる」？",
                mix: "監視記錄：「彼は{env_room}にいた」<br><br>いた... いる（在）的過去式？現在式？"
            }
        }],
        options: [
            {
                label: {
                    zh: "他「當時」在——作為不在場證明",
                    jp: "「当時いた」——アリバイとして使える",
                    kr: "「당시 있었다」——알리바이로 쓸 수 있다"
                },
                next: { 
                    zh: "「いた」是「いる（在）」的過去式。「彼は{env_room}にいた」代表他當時確實在那裡，為你提供了關鍵的時間點佐證。",
                    jp: "「いた」は「いる」の過去形。当時そこにいた、ということだ。",
                    mix: "いた = いる的過去式。彼はいた = 他「曾在」，不是現在。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp005"],
                    varOps: [{ key: 'credibility', val: 10, op: '+' }],
                    exp: 20
                }
            },
            {
                label: {
                    zh: "他「現在」在——立刻去找他",
                    jp: "「今いる」——すぐに会いに行く",
                    kr: "「지금 있다」——당장 찾아가자"
                },
                next: { 
                    zh: "你搞錯了時態。「いた」是過去式，如果是現在式應該寫作「いる」。你興沖沖地跑過去，結果撲了個空。",
                    jp: "「いた」は過去形。「今いる」なら「いる」になる。",
                    mix: "いた（過去）≠ いる（現在）。他「曾在」，不是「現在在」。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp005"],
                    varOps: [{ key: 'tension', val: 15, op: '+' }]
                }
            }
        ]
    });

    // JP-005 Tier 2：進階對比（過去完成 vs 現在進行）
    DB.templates.push({
        id: 'learn_jp005_t2_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['applied_jp005'],
        condition: { tags: ['learned_jp005'] },
        dialogue: [{
            text: {
                zh: "兩份證詞：<br><br>甲：「{true_culprit}は逃げた」<br>乙：「{true_culprit}はまだ逃げている」<br><br>時間差可能決定案件走向。",
                jp: "二つの証言：<br><br>甲：「{true_culprit}は逃げた」<br>乙：「{true_culprit}はまだ逃げている」",
                mix: "甲：「逃げた」（過去式）<br>乙：「まだ逃げている」（現在進行）<br><br>一說已逃，一說還在逃？"
            }
        }],
        options: [
            {
                label: {
                    zh: "追乙的線索——嫌犯還在附近",
                    jp: "乙の情報を追う——まだ近くにいる",
                    kr: "을의 단서를 쫓는다——아직 근처에 있다"
                },
                next: { 
                    zh: "「逃げた」是過去式，代表動作已完成；而「まだ逃げている」是現在進行式，表示狀態持續中。乙的情報指出嫌犯此刻仍在移動，你成功縮小了搜索範圍！",
                    jp: "「逃げた」は完了。「まだ逃げている」は継続中。乙の情報の方が新しい。",
                    mix: "逃げた（完成）≠ 逃げている（持續中）。乙的情報更新，嫌犯還在。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp005", "has_true_evidence"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }],
                    exp: 30
                }
            },
            {
                label: {
                    zh: "兩份說的是同一件事",
                    jp: "2つとも同じことを言っている",
                    kr: "두 가지 모두 같은 이야기다"
                },
                next: { 
                    zh: "完全不同！「逃げた（た形）」是過去完成，人早跑遠了；「逃げている（ている形）」是現在進行，人還在附近躲藏。你錯失了最重要的時機。",
                    jp: "違う。た形は完了、ている形は継続中。乙の情報が有利だった。",
                    mix: "た形（完了）≠ ている形（持續）。差別很大，你錯過了時機。"
                },
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
                label: {
                    zh: "往前跑，同時注意後方",
                    jp: "前に走りながら後ろを警戒する",
                    kr: "앞으로 달리며 뒤를 경계하다"
                },
                next: { 
                    zh: "韓文「뒤를 봐라」是看後面，日文「前へ逃げろ」是往前逃。你完美結合了兩國語言的警告，一邊往前狂奔一邊閃過了背後的襲擊！" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["faced_mixed_crisis", "language_master"],
                    varOps: [{ key: 'knowledge', val: 30, op: '+' }],
                    exp: 60
                }
            },
            {
                label: {
                    zh: "太混亂了，隨便選一個方向",
                    jp: "混乱しすぎた。適当な方向を選ぶ",
                    kr: "너무 혼란스럽다. 아무 방향이나 고르다"
                },
                next: { 
                    zh: "你無法在極限狀態下同時處理兩種語言的指令，在猶豫之中，你錯失了最佳的逃生時機。" 
                },
                action: "advance_chain",
                rewards: {
                    tags: ["faced_mixed_crisis"],
                    varOps: [{ key: 'curse_val', val: 20, op: '+' }]
                }
            }
        ]
    });

// ════════════════════════════════════════════════════════════════
    // 📚 JP-006：助詞 に vs で｜ 劇本：偵探/冒險
    // ════════════════════════════════════════════════════════════════

    // JP-006 Tier 1：地點與動作的辨識
    DB.templates.push({
        id: 'learn_jp006_t1_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['learned_jp006'],
        dialogue: [{
            text: {
                zh: "兩份目擊報告，同一地點，助詞不同：<br><br>甲：「彼は{env_room}にいた」<br>乙：「彼は{env_room}で何かをしていた」<br><br>兩份說的是同一件事嗎？",
                jp: "二人の目撃証言：<br><br>甲：「彼は{env_room}にいた」<br>乙：「彼は{env_room}で何かをしていた」",
                mix: "甲用「に」，乙用「で」：<br><br>「{env_room}にいた」vs「{env_room}で何かをしていた」<br><br>に和で有什麼差？"
            }
        }],
        options: [
            {
                label: {
                    zh: "不同——乙看到他在做事",
                    jp: "違う——乙は彼の行動を見た",
                    kr: "다르다——을은 그의 행동을 봤다"
                },
                next: { 
                    zh: "「に」只表示存在的位置，而「で」表示動作發生的場所。<br>乙不僅看到他，還看到他「正在做某事」，乙的供詞分量更重！",
                    jp: "「に」は存在の場所。「で」は動作の場所。乙の証言には「行動」が含まれている。",
                    mix: "に（存在位置）≠ で（動作場所）。乙知道得更多。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp006"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 25
                }
            },
            {
                label: {
                    zh: "一樣——都說他在那裡",
                    jp: "同じ——二人とも彼がそこにいたと言っている",
                    kr: "같다——둘 다 그가 거기 있었다고 한다"
                },
                next: { 
                    zh: "你忽略了助詞的關鍵差異！「に」只表示存在，但「で」代表他在那裡進行了動作。乙其實看到他在做事，你卻把兩份供詞當成一樣的。",
                    jp: "「に」は存在のみ、「で」は動作も含む。証言の重みが違う。",
                    mix: "に（只有存在）≠ で（存在+動作）。乙比甲知道得更多。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_jp006"],
                    varOps: [{ key: 'tension', val: 8, op: '+' }]
                }
            }
        ]
    });

    // JP-006 Tier 2：應用於機關解謎
    DB.templates.push({
        id: 'learn_jp006_t2_adventure',
        type: 'middle',
        reqTags: ['learning', 'adventure'],
        excludeTags: ['applied_jp006'],
        condition: { tags: ['learned_jp006'] },
        dialogue: [{
            text: {
                zh: "石板上刻著兩行指示：<br><br>「祭壇に触れるな」<br>「祭壇で儀式を行え」<br><br>你面前有兩個祭壇。",
                jp: "石板に二行の指示：<br><br>「祭壇に触れるな」<br>「祭壇で儀式を行え」<br><br>祭壇が二つある。",
                mix: "「祭壇に触れるな」（に）<br>「祭壇で儀式を行え」（で）<br><br>哪個要觸碰，哪個進行儀式？"
            }
        }],
        options: [
            {
                label: {
                    zh: "只對一個進行儀式，另一個不碰",
                    jp: "片方で儀式を行い、もう片方には触れない",
                    kr: "하나에서만 의식을 하고 다른 하나는 만지지 않는다"
                },
                next: { 
                    zh: "「祭壇に」的「に」是接觸的對象，所以「不要碰那個祭壇」。<br>「祭壇で」的「で」是動作場所，所以「在這個祭壇上進行儀式」。機關成功啟動！",
                    jp: "「に触れるな」は接触禁止。「で儀式を行え」はそこで儀式をせよ。正解。",
                    mix: "に（禁止接觸的祭壇）+ で（進行儀式的祭壇）= 兩個不同目標。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp006", "puzzle_solved"],
                    varOps: [
                        { key: 'skill_points', val: 20, op: '+' },
                        { key: 'puzzle_count', val: 1, op: '+' }
                    ],
                    exp: 35
                }
            },
            {
                label: {
                    zh: "直接觸碰有文字的祭壇",
                    jp: "文字が刻まれた祭壇に直接触れる",
                    kr: "문자가 새겨진 제단을 직접 만진다"
                },
                next: { 
                    zh: "「触れるな」= 不要觸碰！這裡的「に」是接觸對象的標記。你碰了禁忌的祭壇，懲罰機制啟動了。",
                    jp: "「触れるな」は禁止命令。禁止された方に触れてしまった。",
                    mix: "触れるな = 禁止觸碰。你碰了禁忌那個。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_jp006"],
                    varOps: [{ key: 'skill_points', val: -10, op: '+' }]
                }
            }
        ]
    });


    // ════════════════════════════════════════════════════════════════
    // 📚 KR-004：생존 詞彙 조심/도망/위험｜ 劇本：恐怖/冒險
    // ════════════════════════════════════════════════════════════════

    // KR-004 Tier 1：初見生存詞彙
    DB.templates.push({
        id: 'learn_kr004_t1_horror',
        type: 'middle',
        reqTags: ['learning', 'horror'],
        excludeTags: ['learned_kr004', 'risk_high'],
        dialogue: [{
            text: {
                zh: "廢棄走廊的牆上，噴漆寫著三個詞：<br><br>「조심 · 도망 · 위험」<br><br>箭頭指向右方出口，叉叉畫在前方的門上。",
                kr: "복도 벽에 스프레이로 세 단어：<br><br>「조심 · 도망 · 위험」<br><br>화살표는 오른쪽 출구, X는 앞 문.",
                mix: "牆上三個字：「조심 · 도망 · 위험」<br><br>箭頭指右，叉叉在前。什麼意思？"
            }
        }],
        options: [
            {
                label: {
                    zh: "往右方出口跑",
                    jp: "右の出口へ走る",
                    kr: "오른쪽 출구로 뛰다"
                },
                next: { 
                    zh: "「조심（小心）/ 도망（逃跑）/ 위험（危險）」全都是警告。箭頭指向右邊出口，前方則是叉叉。你跑對了方向。",
                    kr: "조심＝小心, 도망＝逃跑, 위험＝危險. 오른쪽이 맞았어.",
                    mix: "조심（小心）/ 도망（逃跑）/ 위험（危險）= 生存三詞。往右是對的。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr004"],
                    varOps: [{ key: 'knowledge', val: 10, op: '+' }],
                    exp: 15
                }
            },
            {
                label: {
                    zh: "硬闖前方的門",
                    jp: "前のドアに突っ込む",
                    kr: "앞쪽 문으로 돌진하다"
                },
                next: { 
                    zh: "前方的門畫著叉叉，旁邊寫著「위험（危險）」。你還是選擇了硬闖，付出了慘痛的代價。",
                    kr: "앞 문에 X가 있었잖아. 「위험」은 위험하다는 뜻이야.",
                    mix: "위험（危險）+ 叉叉 = 禁止進入。조심／도망／위험，記住這三個字。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr004"],
                    varOps: [{ key: 'curse_val', val: 15, op: '+' }]
                }
            }
        ]
    });

    // KR-004 Tier 2：動態情境辨識
    DB.templates.push({
        id: 'learn_kr004_t2_adventure',
        type: 'middle',
        reqTags: ['learning', 'adventure'],
        excludeTags: ['applied_kr004'],
        condition: { tags: ['learned_kr004'] },
        dialogue: [{
            text: {
                zh: "你遇到倒在地上的陌生人，他急促地說：<br><br>「빨리 도망쳐！저기 위험해！조심해！」<br><br>他的手指向了岔路口左側。",
                kr: "쓰러진 사람이 급하게 말했어：<br><br>「빨리 도망쳐！저기 위험해！조심해！」<br><br>손은 갈림길 왼쪽을 가리키고 있어.",
                mix: "倒地的人說：「빨리 도망쳐！저기 위험해！」<br><br>빨리... 도망쳐... 위험... 快逃！危險！"
            }
        }],
        options: [
            {
                label: {
                    zh: "他指左邊是危險——往右跑",
                    jp: "左が危険だと言っている——右へ走る",
                    kr: "왼쪽이 위험하다고 한다——오른쪽으로 뛴다"
                },
                next: { 
                    zh: "「도망쳐（快逃）」！「저기 위험해（那裡危險）」！他指著左邊，意思是左邊有危險。你果斷往右逃，逃過一劫。",
                    kr: "「저기 위험해」= 저쪽이 위험해. 왼쪽이 위험이니까 오른쪽이 맞아.",
                    mix: "빨리（快）+ 도망쳐（逃）+ 저기 위험（那裡危）= 指危險方向。往右。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr004"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                    exp: 25
                }
            },
            {
                label: {
                    zh: "他指的方向有寶物——往左跑",
                    jp: "指差した方向に宝がある——左へ走る",
                    kr: "가리킨 방향에 보물이 있다——왼쪽으로 뛴다"
                },
                next: { 
                    zh: "你誤會了！「저기 위험해（那裡危險）」他是在警告你不要過去，而不是引導你。你迎面撞上了陷阱。",
                    kr: "「저기 위험해」는 저기가 위험하다는 경고야.",
                    mix: "저기（那裡）위험해（危險）= 那裡很危，不是目標。你走錯了。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr004"],
                    varOps: [{ key: 'curse_val', val: 20, op: '+' }]
                }
            }
        ]
    });


    // ════════════════════════════════════════════════════════════════
    // 📚 KR-005：時態 ～았/었 vs ～고 있어｜ 劇本：偵探/戀愛
    // ════════════════════════════════════════════════════════════════

    // KR-005 Tier 1：偵探不在場證明
    DB.templates.push({
        id: 'learn_kr005_t1_mystery',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['learned_kr005'],
        dialogue: [{
            text: {
                zh: "嫌疑人手機有兩條訊息：<br><br>A：「나 거기 있었어」<br>B：「나 거기 있고 있어」<br><br>哪一條說的是「當時在那裡」？",
                kr: "용의자 폰에 두 메시지：<br><br>A：「나 거기 있었어」<br>B：「나 거기 있고 있어」<br><br>어느 쪽이 「그때 거기 있었다」는 뜻？",
                mix: "A：「있었어」（었어）<br>B：「있고 있어」（고 있어）<br><br>었어 = 過去？고 있어 = 進行中？"
            }
        }],
        options: [
            {
                label: {
                    zh: "A——있었어 是過去式",
                    jp: "A——「있었어」は過去形",
                    kr: "A——「있었어」가 과거형이다"
                },
                next: { 
                    zh: "「았/었어」是韓文的過去式語尾。「있었어」代表「當時在那裡」，可以作為完美的不在場證明。",
                    kr: "「았/었어」는 과거형이야. 「있었어」＝그때 거기 있었어.",
                    mix: "았/었어（過去）vs 고 있어（現在進行）。있었어 = 曾在那裡。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr005"],
                    varOps: [{ key: 'credibility', val: 12, op: '+' }],
                    exp: 20
                }
            },
            {
                label: {
                    zh: "B——있고 있어 感覺更強調",
                    jp: "B——「있고 있어」の方が強調されている",
                    kr: "B——「있고 있어」가 더 강조하는 느낌이다"
                },
                next: { 
                    zh: "「고 있어」是現在進行式，意思是「現在正在那裡」。不在場證明需要的是過去的時間點，你選錯了。",
                    kr: "「고 있어」는 현재진행형이야. 「있었어」가 과거형이고.",
                    mix: "고 있어（現在進行）≠ 었어（過去）。不在場證明要用過去式。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["learned_kr005"],
                    varOps: [{ key: 'tension', val: 10, op: '+' }]
                }
            }
        ]
    });

    // KR-005 Tier 2：戀愛語氣延伸
    DB.templates.push({
        id: 'learn_kr005_t2_romance',
        type: 'middle',
        reqTags: ['learning', 'romance'],
        excludeTags: ['applied_kr005'],
        condition: { tags: ['learned_kr005'] },
        dialogue: [{
            text: {
                zh: "{lover}傳來兩句話：<br><br>「내가 네 생각만 했어」<br>「지금도 네 생각하고 있어」<br><br>這兩句說的是同一件事嗎？",
                kr: "{lover}의 메시지：<br><br>「내가 네 생각만 했어」<br>「지금도 네 생각하고 있어」<br><br>같은 말인가？",
                mix: "「네 생각만 했어」（했어）<br>「지금도 생각하고 있어」（하고 있어）<br><br>時間點一樣嗎？"
            }
        }],
        options: [
            {
                label: {
                    zh: "不一樣——一個過去，一個現在",
                    jp: "違う——一つは過去、一つは今",
                    kr: "다르다——하나는 과거, 하나는 지금"
                },
                next: { 
                    zh: "「했어」是過去式（之前一直想你），「하고 있어」是現在進行式（現在也在想你）。連在一起看，代表對方從過去到現在一直掛念著你。",
                    kr: "「했어」는 과거야. 「하고 있어」는 지금 진행 중이야.",
                    mix: "했어（過去）+ 하고 있어（現在進行）= 從過去到現在持續想你。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr005"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                    exp: 25
                }
            },
            {
                label: {
                    zh: "一樣——反正都是「想你」",
                    jp: "同じ——どちらも「君を想う」という意味",
                    kr: "같다——어차피 둘 다 보고 싶다는 뜻이다"
                },
                next: { 
                    zh: "雖然都是想念，但時態大不相同。對方特地用了「過去」與「現在進行」兩種時態來強調持續性，你卻只把它當成普通的一句話。",
                    kr: "비슷하지만 달라. 「했어」는 과거, 「하고 있어」는 지금.",
                    mix: "했어（過去）和 하고 있어（現在）不完全一樣，放在一起 = 持續到現在。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["applied_kr005"],
                    varOps: [{ key: 'pressure', val: 5, op: '+' }]
                }
            }
        ]
    });
// ════════════════════════════════════════════════════════════════
    // 📚 韓日混合：高壓綜合危機｜ 任何劇本（risk_high）
    // ════════════════════════════════════════════════════════════════

    DB.templates.push({
        id: 'learn_mixed_crisis',
        type: 'middle',
        reqTags: ['learning', 'risk_high'],
        excludeTags: ['faced_mixed_crisis'],
        dialogue: [{
            text: {
                zh: "兩張紙條，一韓一日，都被你握在手裡。<br><br>韓文：「뒤를 봐라」<br>日文：「前へ逃げろ」<br><br>它們指示的方向相反。時間不多了。",
                jp: "二つのメモ、韓国語と日本語。<br><br>韓：「뒤를 봐라」<br>日：「前へ逃げろ」<br><br>指示は逆。どうする？",
                mix: "「뒤를 봐라」（韓）<br>「前へ逃げろ」（日）<br><br>뒤（後）vs 前（まえ）。相反方向，選哪個？"
            }
        }],
        options: [
            {
                label: {
                    zh: "往前跑，同時注意後方",
                    jp: "前に走りながら後ろを警戒する",
                    kr: "앞으로 달리며 뒤를 경계하다"
                },
                next: { 
                    zh: "「뒤를 봐라」= 看後面（韓）。「前へ逃げろ」= 往前逃（日）。<br>這兩個指令並不矛盾——你往前跑的同時回頭確認了後方的威脅，完美整合了雙語的求生訊息。",
                    jp: "「뒤（後ろ）」を確認し、「前へ逃げろ（前に逃げる）」。両方同時に実行した。見事だ。",
                    mix: "뒤（後方確認）+ 前逃げろ（往前跑）= 不矛盾，同時執行。你讀懂了韓日雙語。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["faced_mixed_crisis", "language_master"],
                    varOps: [{ key: 'knowledge', val: 30, op: '+' }],
                    exp: 60
                }
            },
            {
                label: {
                    zh: "太混亂了，隨便選一個方向",
                    jp: "混乱した。適当な方向へ走る",
                    kr: "너무 혼란스럽다. 아무 방향으로나 뛴다"
                },
                next: { 
                    zh: "兩個指令其實可以同時執行，但你被不同語言的切換困住了。<br>「뒤를 봐라」= 看後面。「前へ逃げろ」= 往前逃。<br>你錯失了最佳的應對時機。",
                    jp: "「뒤（後ろ）を見て」「前へ逃げる」。同時にできる行動だった。焦りが命取りになった。",
                    mix: "뒤確認後方 + 前逃げろ往前 = 可以同時做。你被語言切換卡住，錯失了時機。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["faced_mixed_crisis"],
                    varOps: [{ key: 'curse_val', val: 20, op: '+' }]
                }
            }
        ]
    });


    // ════════════════════════════════════════════════════════════════
    // 📚 韓日混合：偵探審訊雙語供詞｜ 劇本：偵探
    // ════════════════════════════════════════════════════════════════

    DB.templates.push({
        id: 'learn_mixed_interrogation',
        type: 'middle',
        reqTags: ['learning', 'mystery'],
        excludeTags: ['done_mixed_interrogation'],
        condition: { tags: ['learned_jp001', 'learned_kr005'] },
        dialogue: [{
            text: {
                zh: "兩名目擊者各說一種語言，你必須將情報整合：<br><br>甲（日）：「彼女が撃たれた」<br>乙（韓）：「그때 그 여자는 거기 있었어」",
                jp: "二人の目撃者、異なる言語：<br><br>甲（日）：「彼女が撃たれた」<br>乙（韓）：「그때 그 여자는 거기 있었어」",
                mix: "甲（日）：「彼女が撃たれた」<br>乙（韓）：「그때 그 여자는 거기 있었어」<br><br>撃たれた（被射）+ 있었어（當時在）= ？"
            }
        }],
        options: [
            {
                label: {
                    zh: "兩份都說她是受害者且在場",
                    jp: "両方とも彼女が被害者で、現場にいたと言っている",
                    kr: "둘 다 그녀가 피해자이고 현장에 있었다고 말한다"
                },
                next: { 
                    zh: "「彼女が撃たれた」= 她被射了（日文被動式），說明她是受害者。<br>「그때 거기 있었어」= 那時她在那裡（韓文過去式）。<br>兩份供詞完美交叉確認。",
                    jp: "「撃たれた（被害者）」＋「있었어（過去形・そこにいた）」。見事な言語のクロスチェックだ。",
                    mix: "撃たれた（被射 = 受害者）+ 있었어（過去在場）= 跨語言交叉確認成功。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["done_mixed_interrogation", "has_true_evidence"],
                    varOps: [{ key: 'credibility', val: 25, op: '+' }],
                    exp: 50
                }
            },
            {
                label: {
                    zh: "兩種語言太混亂，無法判斷",
                    jp: "言語が入り混じり、判断できない",
                    kr: "언어가 섞여 있어 판단하기 어렵다"
                },
                next: { 
                    zh: "這兩個語法你其實都學過了，只是高壓下失去了雙語整合能力。<br>「撃たれた」（日文被動）= 受害者。「있었어」（韓文過去）= 當時在場。<br>如果拆開來逐句分析就清楚了。",
                    jp: "「撃たれた（被害者）」、「있었어（当時いた）」。別々に考えればわかるはずだった。",
                    mix: "撃たれた（JP被動）= 受害者。있었어（KR過去）= 在場。不要慌，分開分析就清楚了。"
                },
                action: "advance_chain",
                rewards: {
                    tags: ["done_mixed_interrogation"],
                    varOps: [{ key: 'tension', val: 12, op: '+' }]
                }
            }
        ]
    });

    // ============================================================
    // 系統狀態報告 (結尾整理)
    // ============================================================
    const learningCount = DB.templates.filter(t => t.id && t.id.startsWith('learn_')).length;
    console.log("✅ [模組載入] data_learning.js V2.3 (MIX多語支援版) 已就緒");
    console.log("   📚 日文知識點：JP-001(被動) / JP-002(敬語) / JP-003(方向詞) / JP-005(時態) / JP-006(にvsで)");
    console.log("   📚 韓文知識點：KR-001(뒤) / KR-002(반말) / KR-003(命令形) / KR-004(生存詞彙) / KR-005(時態)");
    console.log("   🔥 進階混合關卡：生存高壓危機 × 1 / 偵探雙語供詞 × 1");
    console.log(`   📊 當前已實裝 ${learningCount} 個螺旋式學習節點。`);

})();