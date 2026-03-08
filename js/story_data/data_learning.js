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
                    zh: "閉上眼睛，面朝牆壁，用腳後跟一步一步往出口摸索",
                    jp: "目を閉じて壁に向かい、かかとで出口を探りながら後退する",
                    kr: "눈을 감고 벽을 향한 채 발뒤꿈치로 출구를 더듬으며 물러나다"
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
                    zh: "汗毛豎起，猛地轉身",
                    jp: "首筋の産毛が逆立つ。それでも好奇心が恐怖に勝った。振り返る",
                    kr: "목덜미의 털이 곤두선다. 그래도 호기심이 공포를 앞섰다. 홱 뒤돌다"
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
                    zh: "重心壓低，像貓一樣靜止片刻，然後猛地側身閃開",
                    jp: "重心を低くし、猫のように静止してから、素早く横に跳ぶ",
                    kr: "무게중심을 낮추고 고양이처럼 잠시 멈추다가 재빠르게 옆으로 몸을 피하다"
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
                    zh: "說服自己，繼續往前走",
                    jp: "「古い建物の残響だ」と言い聞かせ、足を止めずに前進する",
                    kr: "「낡은 건물의 잔향일 뿐이야」라고 스스로에게 말하며 멈추지 않고 앞으로 걷다"
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
                    zh: "牙關一咬，腳跟為軸，整個人旋過去",
                    jp: "奥歯を噛みしめ、踵を軸に体ごと回転させる",
                    kr: "어금니를 깨물고 뒤꿈치를 축으로 온몸을 돌리다"
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
                    zh: "教訓刻骨，死盯前方",
                    jp: "前回の教訓が骨に刻まれている。首の筋肉を固めて、視線を前に釘付けにする",
                    kr: "지난번 교훈이 뼛속에 새겨졌다. 목 근육을 굳혀 시선을 앞에 못 박다"
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
                    zh: "把日記翻到背面，在腦中重組施受關係——開槍的另有其人",
                    jp: "日記を裏返し、頭の中で主語と目的語を組み立て直す——引き金を引いたのは別の誰かだ",
                    kr: "일기를 뒤집어 머릿속으로 주어와 목적어를 재조합하다——방아쇠를 당긴 건 다른 누구다"
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
                    zh: "拍桌：「就是他」",
                    jp: "立ち上がり、日記をパートナーの前に叩きつける：「こいつだ。間違いない」",
                    kr: "자리를 박차고 일어나 일기를 파트너 앞에 집어 던지다：「이 사람이야. 의심의 여지 없어」"
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
                    zh: "用鉛筆在筆記本上畫出箭頭——「を」指向她，行動是別人發出的",
                    jp: "ノートに矢印を引く——「を」は彼女に向いている。動作は別の誰かが起こした",
                    kr: "노트에 화살표를 그리다——「를」은 그녀를 향하고 있다. 행동은 다른 누군가가 일으켰다"
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
                    zh: "指她名字：「是她」",
                    jp: "紙の上で彼女の名前を指でたたく：「動いたのは彼女の方だ」",
                    kr: "종이 위에서 그녀의 이름을 손가락으로 두드리다：「먼저 움직인 건 그녀야」"
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
                    zh: "舉起紙條，讓所有人都看清楚：「～させられた——他是被迫的」",
                    jp: "紙をかざし、全員に見せる：「させられた——強制されたんだ」",
                    kr: "종이를 들어올려 모두가 볼 수 있게 하다：「させられた——강요받은 거야」"
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
                    zh: "推回：「你親口寫的」",
                    jp: "紙を突き返す：「自分で書いたんだ。これはお前の自白書だ」",
                    kr: "종이를 밀어 돌려보내다：「직접 쓴 거잖아. 이건 네 자백서야」"
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
                    zh: "手指收緊，把手機螢幕翻向{lover}：「普通同事不會這樣說話的」",
                    jp: "指先が強張る。{lover}にスマホの画面を向ける：「普通の同僚はこんな話し方しない」",
                    kr: "손가락이 굳어진다. {lover}에게 폰 화면을 들이밀다：「보통 동료는 이렇게 말 안 해」"
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
                    zh: "收起手機，深呼吸",
                    jp: "スマホをポケットに戻し、深呼吸する——きっと考えすぎだ",
                    kr: "폰을 다시 주머니에 넣고 깊게 숨을 들이쉬다——내가 너무 많이 생각하는 걸 거야"
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
                    zh: "把第二則訊息截圖放大，那個「ね」的語尾像刺一樣扎進眼睛",
                    jp: "2つ目のメッセージを拡大する。語尾の「ね」が目に刺さるように飛び込んでくる",
                    kr: "두 번째 메시지를 캡처해 확대한다. 어미의 「ね」가 눈에 박히듯 들어온다"
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
                    zh: "指第一則：「這才是」",
                    jp: "最初のメッセージを指差し、確信を持って：「こっちの真剣さが本物だ」",
                    kr: "첫 번째 메시지를 가리키며 확신에 찬 목소리로：「이런 진지함이 진짜 신경 쓰는 거야」"
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
                    zh: "目光直視{rival}，把那句「もう」的撒嬌語氣緩緩唸出口",
                    jp: "{rival}を真っ直ぐ見据え、「もう」の甘えた語感をゆっくり口に出す",
                    kr: "{rival}를 똑바로 바라보며 「もう」의 응석 부리는 어감을 천천히 입 밖으로 내다"
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
                    zh: "視線飄移，手心出汗",
                    jp: "視線が泳ぐ。手のひらがじっとり滲む——こんな大勢の前では、確信が持てない",
                    kr: "시선이 흔들린다. 손바닥이 살짝 젖어든다——이렇게 많은 사람들 앞에서는 확신이 없다"
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
                    zh: "胸口悶了一下，把手機攥得更緊——那個「야」不是隨便叫的",
                    jp: "胸がつまる。スマホを握りしめる——「야」はそう気軽に呼べる言葉じゃない",
                    kr: "가슴이 답답해진다. 폰을 더 꽉 쥐다——「야」는 아무한테나 쓰는 말이 아니야"
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
                    zh: "聳肩，放下手機",
                    jp: "肩をすくめ、スマホを置く——韓国の友達ってそういうものかもしれない",
                    kr: "어깨를 으쓱하고 폰을 내려놓다——한국 친구들끼리는 원래 이렇게 하는 건지도 몰라"
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
                    zh: "滾動到第二則，把「또 만나자」這四個字在心裡默唸了兩遍",
                    jp: "2つ目までスクロールし、「또 만나자」の四文字を心の中で二度繰り返す",
                    kr: "두 번째 메시지까지 스크롤하며 「또 만나자」 네 글자를 속으로 두 번 되뇌다"
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
                    zh: "停在第一則，盯著結尾",
                    jp: "1つ目から動かず、「보내드릴게요」の語尾を見つめる——この真剣さの方が大事だ",
                    kr: "첫 번째에서 멈추고 「보내드릴게요」의 어미를 바라보다——이런 진지함이 더 중요해"
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
                    zh: "在心裡把漢字「左」和「ひだり」的讀音對上號，抬腳走進左側通道",
                    jp: "「左」と「ひだり」を頭の中で照合し、足を踏み出して左の通路へ進む",
                    kr: "「左」와 「ひだり」의 발음을 머릿속에서 맞춰보고 왼쪽 통로로 발을 내딛다"
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
                    zh: "右邊更寬，跨門往右走",
                    jp: "右の通路の方が広く見える——石門をまたいで右へ進む",
                    kr: "오른쪽 통로가 더 넓어 보인다——석문을 넘어 오른쪽으로 걸어가다"
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
                    zh: "手指描過刻字的輪廓，確認那是「前」字，拉開正前方的門",
                    jp: "刻まれた文字の輪郭をなぞり、「前」であることを確かめて正面の扉を引く",
                    kr: "새겨진 글자의 윤곽을 손가락으로 따라가며 「前」임을 확인하고 정면의 문을 당기다"
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
                    zh: "上次左邊成功，往左走",
                    jp: "前回は左が正解だった——筋肉の記憶が勝手に左の取っ手へ手を向かわせる",
                    kr: "지난번엔 왼쪽이 정답이었다——근육 기억이 자동으로 손을 왼쪽 손잡이로 향하게 하다"
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
                    zh: "屏除雜念，逐筆拆解",
                    jp: "雑念を振り払い、頭の中で文字の形を解析し直す",
                    kr: "잡념을 버리고 머릿속에서 글자의 획을 천천히 분해하다"
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
                    zh: "腦中閃過「後ろ」的讀音——旋身，雙手猛地推向背後那塊石板",
                    jp: "「うしろ」が頭の中で閃く——振り向き、背後の石板に両手で渾身の力を叩きつける",
                    kr: "「うしろ」의 발음이 머릿속에서 번쩍인다——몸을 돌려 등 뒤의 석판에 두 손으로 힘껏 밀다"
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
                    zh: "轟鳴壓思考，壓前石板",
                    jp: "壁の轟音がすべての思考を圧倒する——本能が両手を前の石板に押しつけさせる",
                    kr: "벽의 굉음이 모든 생각을 압도한다——본능이 두 손을 앞쪽 석판으로 밀어붙이게 한다"
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
                    zh: "把筆記夾在腋下，換上訓練服——「시작해라」，那是命令，不是建議",
                    jp: "メモを脇に挟み、トレーニングウェアに着替える——「시작해라」は命令だ、提案じゃない",
                    kr: "노트를 겨드랑이에 끼고 훈련복으로 갈아입다——「시작해라」는 명령이야, 제안이 아니야"
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
                    zh: "折好筆記，等{mentor}",
                    jp: "メモをたたんでテーブルに戻し、椅子に腰掛ける——{mentor}がまだ戻っていない。待とう",
                    kr: "노트를 접어 책상에 내려놓고 의자에 앉다——{mentor}가 아직 돌아오지 않았다. 먼저 기다리자"
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
                    zh: "紙條握在手心，感覺到上面還有對方手掌的溫度——「절대」，絕對不要",
                    jp: "手の中で紙をきつく握る。相手の体温がまだ残っている気がした——「절대」、絶対に",
                    kr: "종이를 손 안에 꼭 쥐다. 상대의 체온이 아직 남아있는 것 같다——「절대」, 절대로"
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
                    zh: "揉皺紙條，丟在桌上",
                    jp: "紙くしゃっと丸めてテーブルに投げつける——試験前夜にわざわざ嫌味を言いに来たのか",
                    kr: "종이를 구겨 책상에 내던지다——시험 전날 밤에 일부러 와서 비아냥거리는 거야"
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
                label: {
                    zh: "「他當時在{env_room}」——不在場證明",
                    jp: "「当時{env_room}にいた」——アリバイ",
                    kr: "「당시 {env_room}에 있었다」——알리바이"
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
                    zh: "「現在在{env_room}」——去找",
                    jp: "「今{env_room}にいる」——すぐ行く",
                    kr: "「지금 {env_room}에 있다」——바로 찾아가다"
                },
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
                    zh: "圈いた——過去式釘子",
                    jp: "ノートに「いた」を丸で囲む——過去形だ。「当時いた」、時系列上の証拠になる",
                    kr: "노트에 「いた」를 동그라미 치다——과거형이야. 「당시 있었다」, 시간축 위의 증거가 된다"
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
                    zh: "推椅站起，捲袖去找他",
                    jp: "椅子を引いて立ち上がり、袖をまくる——今もそこにいる。今すぐ行く",
                    kr: "의자를 밀어내고 일어서며 소매를 걷다——지금도 거기 있어. 지금 당장 찾아가야 해"
                },
                next: { 
                    zh: "你搞錯了時態。「いた」是過去式，如果是現在式應該寫作「いる」。你興沖沖地跑過去，結果撲了個空。" 
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
                    zh: "把乙的供詞推給搭檔",
                    jp: "乙の証言を相棒の前に押しやる——「まだ逃げている」、今もまだ動いている",
                    kr: "을의 진술을 파트너 앞으로 밀어놓다——「まだ逃げている」, 지금도 아직 달아나고 있어"
                },
                next: { 
                    zh: "「逃げた」是過去式，代表動作已完成；而「まだ逃げている」是現在進行式，表示狀態持續中。乙的情報指出嫌犯此刻仍在移動，你成功縮小了搜索範圍！" 
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
                    zh: "疊起供詞，方向一致",
                    jp: "二つの証言を重ねて押さえる——同じことを言っている。方向が一致していればそれでいい",
                    kr: "두 진술을 겹쳐 눌러놓다——같은 말을 하고 있어. 방향이 일치하면 그걸로 충분해"
                },
                next: { 
                    zh: "完全不同！「逃げた（た形）」是過去完成，人早跑遠了；「逃げている（ている形）」是現在進行，人還在附近躲藏。你錯失了最重要的時機。" 
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
                    zh: "「前へ逃げろ」——腳步起跑。同時，眼角餘光向後掃——「뒤를 봐라」",
                    jp: "「前へ逃げろ」——足が動く。同時に、視界の端で後ろを確認する——「뒤를 봐라」",
                    kr: "「前へ逃げろ」——발이 움직인다. 동시에 시야 끝으로 뒤를 확인하다——「뒤를 봐라」"
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
                    zh: "紙條顫抖，隨便選一邊",
                    jp: "二枚のメモが手の中で震える——言語の切り替えが脳をフリーズさせ、足が向く方へ走り出す",
                    kr: "두 쪽지가 손 안에서 떨린다——언어 전환이 뇌를 멈추게 해, 발이 향하는 쪽으로 그냥 뛰다"
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
                    zh: "圈助詞：に在，で動",
                    jp: "二つの証言の助詞をそれぞれ丸で囲む——「に」は存在のみ、「で」は行動を伴う",
                    kr: "두 진술의 조사를 각각 동그라미 치다——「に」는 존재만, 「で」는 행동을 동반해"
                },
                next: { 
                    zh: "「に」只表示存在的位置，而「で」表示動作發生的場所。<br>乙不僅看到他，還看到他「正在做某事」，乙的供詞分量更重！" 
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
                    zh: "疊起推旁，互相印證",
                    jp: "二つの証言を重ねて脇に置く——どちらも彼がそこにいたと言っている。裏付けには十分だ",
                    kr: "두 진술을 겹쳐 옆으로 밀어놓다——둘 다 그가 거기 있었다고 해. 상호 확인으로 충분해"
                },
                next: { 
                    zh: "你忽略了助詞的關鍵差異！「に」只表示存在，但「で」代表他在那裡進行了動作。乙其實看到他在做事，你卻把兩份供詞當成一樣的。" 
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
                zh: "石板上刻著兩行指示：<br><br>「祭壇に触れるな」<br>「祭壇で儀式を行え」<br><br>你面前有兩個祭壇。"
            }
        }],
        options: [
            {
                label: {
                    zh: "環顧兩座祭壇，深吸一口氣——「に触れるな」那座退後，「で儀式を行え」這座上前",
                    jp: "二つの祭壇を見回し、深呼吸する——「に触れるな」の方を避け、「で儀式を行え」の前に進む",
                    kr: "두 제단을 둘러보며 깊게 숨을 들이쉬다——「に触れるな」쪽에서 물러서고 「で儀式を行え」 앞으로 나아가다"
                },
                next: { 
                    zh: "「祭壇に」的「に」是接觸的對象，所以「不要碰那個祭壇」。<br>「祭壇で」的「で」是動作場所，所以「在這個祭壇上進行儀式」。機關成功啟動！" 
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
                    zh: "手伸向刻字祭壇，觸石",
                    jp: "文字が刻まれた祭壇から始めよう——手を伸ばし、石の表面に触れる",
                    kr: "글자가 새겨진 제단부터 시작하자——손을 뻗어 돌 표면에 닿다"
                },
                next: { 
                    zh: "「触れるな」= 不要觸碰！這裡的「に」是接觸對象的標記。你碰了禁忌的祭壇，懲罰機制啟動了。" 
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
                zh: "廢棄走廊的牆上，噴漆寫著三個詞：<br><br>「조심 · 도망 · 위험」<br><br>箭頭指向右方出口，叉叉畫在前方的門上。"
            }
        }],
        options: [
            {
                label: {
                    zh: "三個詞在腦中閃爍——조심，도망，위험——箭頭指右，腳跟轉向，全力衝刺",
                    jp: "三つの単語が頭に閃く——조심、도망、위험——矢印は右、踵を向け、全力で駆ける",
                    kr: "세 단어가 머릿속에서 번쩍인다——조심, 도망, 위험——화살표는 오른쪽, 발뒤꿈치를 돌려 전력 질주하다"
                },
                next: { 
                    zh: "「조심（小心）/ 도망（逃跑）/ 위험（危險）」全都是警告。箭頭指向右邊出口，前方則是叉叉。你跑對了方向。" 
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
                    zh: "叉叉是塗鴉，衝門而入",
                    jp: "✕マークは落書きにすぎない——肩を下げ、破城槌のように前の扉に突っ込む",
                    kr: "X 표시는 그냥 낙서겠지——어깨를 낮추고 공성 망치처럼 앞쪽 문으로 돌진하다"
                },
                next: { 
                    zh: "前方的門畫著叉叉，旁邊寫著「위험（危險）」。你還是選擇了硬闖，付出了慘痛的代價。" 
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
                zh: "你遇到倒在地上的陌生人，他急促地說：<br><br>「빨리 도망쳐！저기 위험해！조심해！」<br><br>他的手指向了岔路口左側。"
            }
        }],
        options: [
            {
                label: {
                    zh: "「저기（那裡）위험（危險）」——他的手指著左邊是在警告，不是引路。轉身往右跑",
                    jp: "「저기（あそこ）위험（危険）」——左を指しているのは警告だ、誘導じゃない。右へ向きを変えて走る",
                    kr: "「저기（거기）위험（위험）」——왼쪽을 가리키는 건 경고야, 안내가 아니야. 오른쪽으로 방향을 바꿔 뛰다"
                },
                next: { 
                    zh: "「도망쳐（快逃）」！「저기 위험해（那裡危險）」！他指著左邊，意思是左邊有危險。你果斷往右逃，逃過一劫。" 
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
                    zh: "蹲下確認，往左跑",
                    jp: "震える腕は何かを指し示している——かがんでもう一度確かめ、左へ走り出す",
                    kr: "떨리는 팔이 무언가를 가리키고 있다——몸을 숙여 한 번 더 확인하고 왼쪽으로 달려가다"
                },
                next: { 
                    zh: "你誤會了！「저기 위험해（那裡危險）」他是在警告你不要過去，而不是引導你。你迎面撞上了陷阱。" 
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
                zh: "嫌疑人手機有兩條訊息：<br><br>A：「나 거기 있었어」<br>B：「나 거기 있고 있어」<br><br>哪一條說的是「當時在那裡」？"
            }
        }],
        options: [
            {
                label: {
                    zh: "把A訊息截圖，用紅線圈出「있었어」的字尾——「었」，這是確鑿的過去",
                    jp: "Aのメッセージをスクリーンショットし、「있었어」の語尾を赤で丸く囲む——「었」、これは確かな過去形だ",
                    kr: "A 메시지를 캡처하고 「있었어」의 어미를 빨간색으로 동그라미 치다——「었」, 이건 명확한 과거야"
                },
                next: { 
                    zh: "「았/었어」是韓文的過去式語尾。「있었어」代表「當時在那裡」，可以作為完美的不在場證明。" 
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
                    zh: "B語氣更強，截圖標記",
                    jp: "Bの語気の方が強調されている気がする——Bのスクリーンショットにマークをつける",
                    kr: "B 메시지의 어감이 더 강조된 것 같다——B를 캡처해서 표시해두다"
                },
                next: { 
                    zh: "「고 있어」是現在進行式，意思是「現在正在那裡」。不在場證明需要的是過去的時間點，你選錯了。" 
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
                    zh: "調亮度，逐字比時態",
                    jp: "スマホの画面を明るくし、一語ずつ比べる——「했어」は過去、「하고 있어」は今この瞬間、時間軸が違う",
                    kr: "폰 화면 밝기를 높이고 한 글자씩 비교하다——「했어」는 과거, 「하고 있어」는 지금, 시간대가 달라"
                },
                next: { 
                    zh: "「했어」是過去式（之前一直想你），「하고 있어」是現在進行式（現在也在想你）。連在一起看，代表對方從過去到現在一直掛念著你。" 
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
                    zh: "手機貼胸，都是想念",
                    jp: "スマホを胸に当て、その温もりが心の中でじわじわと広がるのを感じる——どちらも想いは同じだ",
                    kr: "폰을 가슴에 대고 그 따뜻한 감각이 마음속에서 퍼져나가게 두다——둘 다 그리움이야, 의미는 같아"
                },
                next: { 
                    zh: "雖然都是想念，但時態大不相同。對方特地用了「過去」與「現在進行」兩種時態來強調持續性，你卻只把它當成普通的一句話。" 
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
                zh: "兩張紙條，一韓一日，都被你握在手裡。<br><br>韓文：「뒤를 봐라」<br>日文：「前へ逃げろ」<br><br>它們指示的方向相反。時間不多了。"
            }
        }],
        options: [
            {
                label: {
                    zh: "「前へ逃げろ」——腳步起跑。同時，眼角餘光向後掃——「뒤를 봐라」",
                    jp: "「前へ逃げろ」——足が動く。同時に、視界の端で後ろを確認する——「뒤를 봐라」",
                    kr: "「前へ逃げろ」——발이 움직인다. 동시에 시야 끝으로 뒤를 확인하다——「뒤를 봐라」"
                },
                next: { 
                    zh: "「뒤를 봐라」= 看後面（韓）。「前へ逃げろ」= 往前逃（日）。<br>這兩個指令並不矛盾——你往前跑的同時回頭確認了後方的威脅，完美整合了雙語的求生訊息。" 
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
                    zh: "紙條顫抖，隨便選一邊",
                    jp: "二枚のメモが手の中で震える——言語の切り替えが脳をフリーズさせ、足が向く方へ走り出す",
                    kr: "두 쪽지가 손 안에서 떨린다——언어 전환이 뇌를 멈추게 해, 발이 향하는 쪽으로 그냥 뛰다"
                },
                next: { 
                    zh: "兩個指令其實可以同時執行，但你被不同語言的切換困住了。<br>「뒤를 봐라」= 看後面。「前へ逃げろ」= 往前逃。<br>你錯失了最佳的應對時機。" 
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
                zh: "兩名目擊者各說一種語言，你必須將情報整合：<br><br>甲（日）：「彼女が撃たれた」<br>乙（韓）：「그때 그 여자는 거기 있었어」"
            }
        }],
        options: [
            {
                label: {
                    zh: "在筆記本上並排寫下兩句，畫箭頭串聯：「撃たれた（受害）+ 있었어（在場）= 她是關鍵人」",
                    jp: "ノートに二文を並べ、矢印でつなぐ：「撃たれた（被害者）＋있었어（現場にいた）＝彼女が鍵だ」",
                    kr: "노트에 두 문장을 나란히 쓰고 화살표로 연결하다：「撃たれた（피해자）＋있었어（현장에 있었다）＝그녀가 핵심이야」"
                },
                next: { 
                    zh: "「彼女が撃たれた」= 她被射了（日文被動式），說明她是受害者。<br>「그때 거기 있었어」= 那時她在那裡（韓文過去式）。<br>兩份供詞完美交叉確認。" 
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
                    zh: "供詞扣桌，揉太陽穴",
                    jp: "二つの証言を伏せてテーブルに置き、こめかみをもむ——日本語と韓国語が同時に押し寄せ、頭が混乱している",
                    kr: "두 진술을 엎어 책상에 내려놓고 관자놀이를 문지르다——일본어와 한국어가 동시에 밀려와 머릿속이 꼬여버렸어"
                },
                next: { 
                    zh: "這兩個語法你其實都學過了，只是高壓下失去了雙語整合能力。<br>「撃たれた」（日文被動）= 受害者。「있었어」（韓文過去）= 當時在場。<br>如果拆開來逐句分析就清楚了。" 
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
    console.log("✅ [模組載入] data_learning.js V2.4 (Show Don't Tell 沉浸式改寫版) 已就緒");
    console.log("   📚 日文知識點：JP-001(被動) / JP-002(敬語) / JP-003(方向詞) / JP-005(時態) / JP-006(にvsで)");
    console.log("   📚 韓文知識點：KR-001(뒤) / KR-002(반말) / KR-003(命令形) / KR-004(生存詞彙) / KR-005(時態)");
    console.log("   🔥 進階混合關卡：生存高壓危機 × 1 / 偵探雙語供詞 × 1");
    console.log(`   📊 當前已實裝 ${learningCount} 個螺旋式學習節點。`);

})();