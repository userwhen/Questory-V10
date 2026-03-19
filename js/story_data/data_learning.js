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
                // 選項文字已精簡，翻譯也同步縮短，對齊中文
                zh: "閉上眼睛，不往後看",
                jp: "目を閉じ、後ろを振り向かない",
                kr: "눈을 감고, 뒤돌아보지 않는다"
            },
            action: "node_next", // 👈 修正：有子場景，必須用 node_next 才能正確展開
            rewards: {
                tags: ["learned_kr001", "survived_warning"],
                varOps: [{ key: 'knowledge', val: 15, op: '+' }],
                exp: 20
            },
            nextScene: { 
                dialogue: [
                    {
                        // 多餘的動作描述已整併進這裡
                        text: {
                            zh: "「뒤를 보지 마라」的意思是「不要看後面」。你做出了正確的選擇。<br><br>你閉上眼睛，面朝牆壁，用腳後跟一步一步往出口摸索。"
                        }
                    }
                ],
                options: [
                    {
                        label: { zh: "繼續前進" },
                        action: "advance_chain" // 👈 修正：看完結果後，在這裡推進主線深度
                    }
                ]
            }
        },
        {
            label: {
                // 選項文字已精簡，去除原本過長的動作與心理描述
                zh: "猛地轉身",
                jp: "勢いよく振り返る",
                kr: "홱 뒤돌아본다"
            },
            action: "node_next", // 👈 修正：有子場景，必須用 node_next
            rewards: {
                tags: ["learned_kr001"],
                varOps: [{ key: 'curse_val', val: 20, op: '+' }]
            },
            nextScene: { 
                dialogue: [
                    {
                        // 原本選項中「汗毛豎起、好奇心戰勝恐懼」的描述移至此處
                        text: {
                            zh: "頸背的汗毛瞬間豎起，你的好奇心戰勝了恐懼。你轉身了……<br><br>但「뒤를 보지 마라」的意思明明是「不要看後面」……"
                        }
                    }
                ],
                options: [
                    {
                        label: { zh: "承受後果" },
                        action: "advance_chain" // 👈 修正：看完結果後推進主線深度
                    }
                ]
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
                zh: "側身閃避",
                jp: "横に躱す",
                kr: "옆으로 피하다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr001"],
                varOps: [
                    { key: 'knowledge', val: 10, op: '+' },
                    { key: 'curse_val', val: -10, op: '+' }
                ],
                exp: 25
            },
            nextScene: {
                dialogue: [{
                    text: {
                        zh: "你重心壓低，像貓一樣靜止後猛地側身閃開。<br><br>「뒤에 있어」意思是「它就在我後面」。你及時躲過了。",
                        jp: "重心を落とし、猫のように静止してから素早く横へ跳んだ。<br><br>「뒤에 있어」の意味は「すぐ後ろにいる」。とっさに躱すことができた。",
                        kr: "무게중심을 낮추고 고양이처럼 잠시 멈춘 뒤 재빠르게 옆으로 피했다.<br><br>「뒤에 있어」는 '그게 내 바로 뒤에 있어'라는 뜻이다. 제때 잘 피했다."
                    }
                }],
                options: [{ label: { zh: "繼續", jp: "続ける", kr: "계속" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "繼續往前走",
                jp: "前へ進み続ける",
                kr: "계속 앞으로 걷다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr001"],
                varOps: [{ key: 'curse_val', val: 25, op: '+' }]
            },
            nextScene: {
                dialogue: [{
                    text: {
                        zh: "你試圖說服自己這只是幻覺，繼續往前走。<br><br>但「뒤에 있어」的意思是「它就在我後面」……",
                        jp: "ただの幻覚だと言い聞かせ、前へ進み続けた。<br><br>しかし「뒤에 있어」は「すぐ後ろにいる」という意味だった……",
                        kr: "그냥 착각이라 스스로를 다독이며 계속 앞으로 걸었다.<br><br>하지만 「뒤에 있어」는 '그게 바로 내 뒤에 있어'라는 뜻이었다……"
                    }
                }],
                options: [{ label: { zh: "……", jp: "……", kr: "……" }, action: "advance_chain" }]
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
                zh: "咬牙轉身",
                jp: "歯を食いしばり振り返る",
                kr: "이를 악물고 뒤돌아보다"
            },
            action: "node_next", // 👈 修正為 node_next
            rewards: {
                tags: ["mastered_kr001"],
                varOps: [
                    { key: 'knowledge', val: 20, op: '+' },
                    { key: 'curse_val', val: -15, op: '+' }
                ],
                exp: 40
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你以腳跟為軸，整個人旋了過去。<br><br>「봐라」是「看」的意思。這次它寫著「看後面」。你做對了。",
                        jp: "踵を軸に、体ごと勢いよく回転させた。<br><br>「봐라」は「見ろ」という意味。今回は「後ろを見ろ」と書かれていたのだ。",
                        kr: "뒤꿈치를 축으로 온몸을 힘껏 돌렸다.<br><br>「봐라」는 '보아라'라는 뜻이다. 이번에는 '뒤를 보라'고 적혀 있었던 것이다."
                    }
                }],
                options: [{ label: { zh: "繼續", jp: "続ける", kr: "계속" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "死盯前方",
                jp: "前を睨みつける",
                kr: "앞만 뚫어지게 보다"
            },
            action: "node_next", // 👈 修正為 node_next
            rewards: {
                varOps: [{ key: 'curse_val', val: 30, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "上次的教訓刻骨銘心，你決定死盯前方，絕不回頭。<br><br>但「봐라」是「看」的意思，規則已經變了。",
                        jp: "前回の教訓が骨に刻まれている。決して振り返らず、前を睨みつけた。<br><br>しかし「봐라」は「見ろ」という意味。ルールはすでに変わっていたのだ。",
                        kr: "지난번 교훈이 뼛속에 새겨져 있다. 절대 뒤돌아보지 않고 앞만 뚫어지게 보았다.<br><br>하지만 「봐라」는 '보아라'라는 뜻이다. 규칙은 이미 변해 있었다."
                    }
                }],
                options: [{ label: { zh: "承受後果", jp: "結果を受け入れる", kr: "결과를 받아들이다" }, action: "advance_chain" }]
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
                zh: "開槍的另有其人",
                jp: "引き金を引いたのは別の誰かだ",
                kr: "방아쇠를 당긴 건 다른 누구다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp001", "has_testimony", "found_true_victim"],
                varOps: [{ key: 'credibility', val: 20, op: '+' }],
                exp: 30
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把日記翻到背面，在腦中重組施受關係。<br><br>「彼が撃たれた」意思是「他被射了」。既然他是受害者，開槍的必定另有其人。",
                        jp: "日記を裏返し、頭の中で主語と目的語を組み立て直す。<br><br>「彼が撃たれた」は「彼が撃たれた」という意味だ。彼が被害者である以上、引き金を引いたのは別の誰かだ。",
                        kr: "일기를 뒤집어 머릿속으로 주어와 목적어를 재조합하다.<br><br>「彼が撃たれた」는 '그가 총에 맞았다'는 뜻이다. 그가 피해자인 이상, 방아쇠를 당긴 건 다른 누군가다."
                    }
                }],
                options: [{ label: { zh: "繼續調查", jp: "調査を続ける", kr: "계속 조사하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "拍桌：「就是他」",
                jp: "机を叩く：「こいつだ」",
                kr: "책상을 치다：「이 사람이야」"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp001"],
                varOps: [
                    { key: 'credibility', val: -15, op: '+' },
                    { key: 'tension',     val: 15,  op: '+' }
                ]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你拍桌認定：「就是他」。<br><br>但你搞錯了。「～られた」是被動語態，他其實是被射擊的受害者。",
                        jp: "机を叩き、「こいつだ」と断定する。<br><br>しかし間違っている。「～られた」は受身形であり、彼は実際には撃たれた被害者なのだ。",
                        kr: "책상을 치며 「이 사람이야」라고 단정짓다.<br><br>하지만 틀렸다. 「～られた」는 수동태로, 그는 사실 총에 맞은 피해자다."
                    }
                }],
                options: [{ label: { zh: "承受質疑", jp: "疑念を受け入れる", kr: "의심을 받아들이다" }, action: "advance_chain" }]
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
                zh: "行動是別人發出的",
                jp: "動作は別の誰かが起こした",
                kr: "행동은 다른 누군가가 일으켰다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp001"],
                varOps: [{ key: 'credibility', val: 15, op: '+' }],
                exp: 25
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你用鉛筆在筆記本上畫出箭頭，釐清了邏輯。<br><br>「を」是受詞標記，這句的意思是「（某人）威脅了她」，行動是別人發出的。",
                        jp: "ノートに鉛筆で矢印を引き、論理を整理する。<br><br>「を」は目的語のマーカー。この文の意味は「（誰かが）彼女を脅した」であり、動作を起こしたのは別の誰かだ。",
                        kr: "노트에 연필로 화살표를 그려 논리를 정리하다.<br><br>「を」는 목적어 마커다. 이 문장의 뜻은 '(누군가가) 그녀를 협박했다'이며, 행동을 일으킨 건 다른 누군가다."
                    }
                }],
                options: [{ label: { zh: "繼續", jp: "続ける", kr: "계속" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "指著她：「是她」",
                jp: "彼女を指差す：「彼女だ」",
                kr: "그녀를 가리키다：「그녀야」"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp001"],
                varOps: [{ key: 'tension', val: 10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你指著她的名字說：「是她」。<br><br>但你搞混了主動與被動關係。「を」是受詞標記，她其實是被威脅的受害者。",
                        jp: "彼女の名前を指差し、「動いたのは彼女だ」と言う。<br><br>しかし能動と受動の関係を混同している。「を」は目的語のマーカーであり、彼女は実際には脅された被害者なのだ。",
                        kr: "그녀의 이름을 가리키며 「먼저 움직인 건 그녀야」라고 말하다.<br><br>하지만 능동과 수동의 관계를 혼동했다. 「を」는 목적어 마커로, 그녀는 사실 협박받은 피해자다."
                    }
                }],
                options: [{ label: { zh: "……", jp: "……", kr: "……" }, action: "advance_chain" }]
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
                zh: "他是被迫的",
                jp: "彼は強制されたんだ",
                kr: "그는 강요받은 거야"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_jp001", "has_true_evidence"],
                varOps: [{ key: 'credibility', val: 30, op: '+' }],
                exp: 45
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你舉起紙條，讓所有人都看清楚：「～させられた——他是被迫的」。<br><br>「～させられた」是使役被動態，代表「被迫做某事」。有人在幕後操控局面。",
                        jp: "紙をかざし、全員に見せる。「～させられた——彼は強制されたんだ」。<br><br>「～させられた」は使役受身形であり、「無理やり～させられた」ことを意味する。裏で状況を操っている者がいる。",
                        kr: "종이를 들어올려 모두가 볼 수 있게 하다. 「～させられた——그는 강요받은 거야」.<br><br>「～させられた」는 사역수동태로, '억지로 ~하게 되다'라는 뜻이다. 배후에서 상황을 조종하는 자가 있다."
                    }
                }],
                options: [{ label: { zh: "掌控局面", jp: "状況を掌握する", kr: "상황을 장악하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "這是你親口寫的",
                jp: "自分で書いたんだろう",
                kr: "네가 직접 쓴 거잖아"
            },
            action: "node_next",
            rewards: {
                varOps: [
                    { key: 'credibility', val: -20, op: '+' },
                    { key: 'tension',     val: 20,  op: '+' }
                ]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你將紙條推了回去：「這是你親口寫的」。<br><br>你以為「書かされた」是「我寫了」。但這是使役被動態，意思是「被迫寫下」，這份供詞其實是被逼寫下的。",
                        jp: "紙を突き返し、「自分で書いたんだろう」と言う。<br><br>「書いた」のだと勘違いしている。「～かされた」は使役受身形であり、この自白書は実際には書かされたものなのだ。",
                        kr: "종이를 밀어 돌려보내며 「네가 직접 쓴 거잖아」라고 말하다.<br><br>'내가 썼다'고 착각했다. 「～かされた」는 사역수동태로, 이 자백서는 사실 강제로 쓰인 것이다."
                    }
                }],
                options: [{ label: { zh: "場面失控", jp: "状況が制御不能になる", kr: "상황이 통제 불능이 되다" }, action: "advance_chain" }]
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
                zh: "「普通同事不會這樣說話」",
                jp: "「普通の同僚はこんな話し方しない」",
                kr: "「보통 동료는 이렇게 말 안 해」"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp002", "has_fake_clue"],
                varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你手指收緊，把手機螢幕翻向{lover}：「普通同事不會這樣說話的」。<br><br>沒有敬語的常體，代表兩人的關係非常親密，這就是關鍵證據。",
                        jp: "指先を強く握り込み、{lover}にスマホの画面を向ける。「普通の同僚はこんな話し方はしない」。<br><br>敬語のない常体は、二人の関係が非常に親密であることを示している。これが決定的な証拠だ。",
                        kr: "손가락에 힘을 꽉 주고, {lover}에게 폰 화면을 들이밀다. 「보통 동료는 이렇게 말 안 해」.<br><br>경어가 없는 반말은 두 사람의 관계가 매우 친밀하다는 것을 보여준다. 이것이 결정적인 증거다."
                    }
                }],
                options: [{ label: { zh: "繼續追問", jp: "さらに問い詰める", kr: "계속 추궁하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "收起手機，深呼吸",
                jp: "スマホをしまい、深呼吸する",
                kr: "폰을 집어넣고 심호흡하다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp002"],
                varOps: [{ key: 'pressure', val: 10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把手機收回口袋，深呼吸試圖說服自己這沒什麼。<br><br>但在日本職場，對普通工作夥伴不用敬語是非常罕見的。",
                        jp: "スマホをポケットに戻し、深呼吸をして「考えすぎだ」と自分に言い聞かせる。<br><br>しかし日本の職場で、普通の仕事仲間に敬語を使わないことは非常にまれだ。",
                        kr: "폰을 다시 주머니에 넣고 심호흡하며 별일 아닐 거라 스스로를 다독이다.<br><br>하지만 일본 직장에서 평범한 업무 파트너에게 경어를 쓰지 않는 것은 매우 드문 일이다."
                    }
                }],
                options: [{ label: { zh: "壓抑疑慮", jp: "疑念を押し殺す", kr: "의심을 억누르다" }, action: "advance_chain" }]
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
                zh: "第二則訊息",
                jp: "2つ目のメッセージ",
                kr: "두 번째 메시지"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp002"],
                varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                exp: 30
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把第二則訊息截圖放大，那個「ね」的語尾像刺一樣扎進眼睛。<br><br>「ね」的語尾和省略敬語的常體，展現了毫無防備的親密感。",
                        jp: "2つ目のメッセージを拡大する。語尾の「ね」が目に刺さるように飛び込んでくる。<br><br>「ね」という語尾と敬語を省略した常体は、無防備な親密さを表している。",
                        kr: "두 번째 메시지를 캡처해 확대한다. 어미의 「ね」가 가시처럼 눈에 박힌다.<br><br>「ね」라는 어미와 경어가 생략된 반말은 무방비한 친밀감을 드러낸다."
                    }
                }],
                options: [{ label: { zh: "保留證據", jp: "証拠を保存する", kr: "증거를 보존하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "第一則訊息",
                jp: "1つ目のメッセージ",
                kr: "첫 번째 메시지"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp002"],
                varOps: [{ key: 'pressure', val: 8, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你指著第一則訊息說：「這才是真的。」<br><br>第一則確實認真，但「よろしくお願いします」是標準的職場敬語，代表兩人之間仍有距離。",
                        jp: "最初のメッセージを指差し、「こっちの真剣さが本物だ」と確信する。<br><br>たしかに1つ目は真面目だが、「よろしくお願いします」は標準的な職場の敬語であり、二人の間にまだ距離があることを意味している。",
                        kr: "첫 번째 메시지를 가리키며 「이런 진지함이 진짜지」라고 확신하다.<br><br>첫 번째 메시지가 진지한 것은 맞지만, 「よろしくお願いします」는 표준적인 직장 경어로 두 사람 사이에 아직 거리가 있음을 의미한다."
                    }
                }],
                options: [{ label: { zh: "判斷失誤", jp: "判断ミス", kr: "판단 실수" }, action: "advance_chain" }]
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
                zh: "指出撒嬌的語氣",
                jp: "甘えた語感を指摘する",
                kr: "응석 부리는 어감을 지적하다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_jp002"],
                varOps: [{ key: 'evidence_count', val: 2, op: '+' }],
                exp: 45
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你目光直視{rival}，把那句「もう」的撒嬌語氣緩緩唸出口。<br><br>「もう」的撒嬌語氣，加上省略敬語的「で」「よ」，這絕對是情侶間的對話。",
                        jp: "{rival}を真っ直ぐ見据え、「もう」の甘えた語感をゆっくり口に出す。<br><br>「もう」という甘えた語感に、敬語を省略した「で」「よ」が加われば、これは間違いなく恋人同士の会話だ。",
                        kr: "{rival}를 똑바로 바라보며 「もう」의 응석 부리는 어감을 천천히 입 밖으로 내다.<br><br>「もう」라는 응석 부리는 어감에, 경어가 생략된 「で」와 「よ」가 더해지면 이건 절대적으로 연인 사이의 대화다."
                    }
                }],
                options: [{ label: { zh: "拆穿謊言", jp: "嘘を暴く", kr: "거짓말을 폭로하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "保持沉默",
                jp: "沈黙を守る",
                kr: "침묵을 지키다"
            },
            action: "node_next",
            rewards: {
                varOps: [{ key: 'pressure', val: 20, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你視線飄移，手心出汗。在這麼多人面前，你不敢說破。<br><br>你在關鍵時刻猶豫了。但在日文語境中，這種語氣已經完全越過了「普通朋友」的界線。",
                        jp: "視線が泳ぎ、手のひらがじっとり滲む。大勢の前では確信が持てず、口を閉ざした。<br><br>肝心な場面で躊躇してしまった。しかし日本語のニュアンスにおいて、この口調はすでに「ただの友達」の一線を完全に越えている。",
                        kr: "시선이 흔들리고 손바닥에 땀이 밴다. 이렇게 많은 사람들 앞에서는 확신이 서지 않아 입을 다물었다.<br><br>결정적인 순간에 망설였다. 하지만 일본어 뉘앙스에서 이런 어조는 이미 '그냥 친구'의 선을 완전히 넘은 것이다."
                    }
                }],
                options: [{ label: { zh: "錯失良機", jp: "好機を逃す", kr: "좋은 기회를 놓치다" }, action: "advance_chain" }]
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
                zh: "「야」不是隨便叫的",
                jp: "「야」は気軽な呼び方じゃない",
                kr: "「야」는 아무나 부르는 게 아니야"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr002"],
                varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你胸口悶了一下，把手機攥得更緊——那個「야」不是隨便叫的。<br><br>這絕對不是「普通認識」。半語加上「야」的稱呼，代表他們私下關係非常熟絡。",
                        jp: "胸がつまる。スマホを握りしめ、「야」はそう気軽に呼べる言葉じゃないと確信する。<br><br>これは絶対に「ただの知り合い」ではない。タメ口に「야」という呼びかけは、二人が私生活で非常に親しいことを表している。",
                        kr: "가슴이 답답해진다. 폰을 꽉 쥐며 「야」는 아무한테나 쓰는 말이 아니라고 확신하다.<br><br>이건 절대 '그냥 아는 사이'가 아니다. 반말에 「야」라는 호칭은 그들이 사적으로 매우 가까운 사이임을 보여준다."
                    }
                }],
                options: [{ label: { zh: "繼續調查", jp: "調査を続ける", kr: "계속 조사하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "放下手機",
                jp: "スマホを置く",
                kr: "폰을 내려놓다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr002"],
                varOps: [{ key: 'pressure', val: 8, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你聳聳肩，放下手機，心想韓國朋友間可能都這樣說話。<br><br>但你錯了。在韓國，對不熟的人用半語是非常沒禮貌的，他們絕不只是普通朋友。",
                        jp: "肩をすくめ、スマホを置く。韓国の友達同士はこういうものかもしれないと思った。<br><br>しかし間違っている。韓国では親しくない人にタメ口を使うのは非常に失礼なことであり、彼らは絶対にただの友達ではない。",
                        kr: "어깨를 으쓱하고 폰을 내려놓으며, 한국 친구들끼리는 원래 이렇게 하는 건지도 모른다고 생각하다.<br><br>하지만 틀렸다. 한국에서 친하지 않은 사람에게 반말을 쓰는 것은 매우 예의 없는 행동이며, 그들은 절대 그냥 친구가 아니다."
                    }
                }],
                options: [{ label: { zh: "忽視疑點", jp: "疑念を無視する", kr: "의심을 무시하다" }, action: "advance_chain" }]
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
                zh: "第二則",
                jp: "2つ目のメッセージ",
                kr: "두 번째 메시지"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr002"],
                varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                exp: 30
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你滾動到第二則，把「또 만나자」這四個字在心裡默唸了兩遍。<br><br>第二則使用了半語，而且「또 만나자（再見面吧）」展現了朋友以上的親密感。",
                        jp: "2つ目までスクロールし、「또 만나자」という言葉を心の中で二度繰り返す。<br><br>2つ目はタメ口が使われており、「또 만나자（また会おう）」という言葉は友達以上の親密さを表している。",
                        kr: "두 번째 메시지까지 스크롤하며 「또 만나자」 네 글자를 속으로 두 번 되뇌다.<br><br>두 번째는 반말이 쓰였고, 「또 만나자」라는 말은 친구 이상의 친밀감을 보여준다."
                    }
                }],
                options: [{ label: { zh: "鎖定證據", jp: "証拠を押さえる", kr: "증거를 확보하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "第一則",
                jp: "1つ目のメッセージ",
                kr: "첫 번째 메시지"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr002"],
                varOps: [{ key: 'pressure', val: 10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你停在第一則，盯著結尾覺得這份認真才是真的。<br><br>第一則雖然看似認真，但「보내드릴게요（會寄給您）」是標準的職場敬語，顯示出雙方的距離感。",
                        jp: "1つ目から動かず、語尾の真剣さの方が大事だと考える。<br><br>1つ目はたしかに真面目に見えるが、「보내드릴게요（お送りします）」は標準的な職場の敬語であり、双方の距離感を示している。",
                        kr: "첫 번째에서 멈추고 어미를 바라보며 이런 진지함이 더 중요하다고 생각하다.<br><br>첫 번째가 비록 진지해 보이지만, 「보내드릴게요」는 표준적인 직장 경어로 쌍방의 거리감을 보여준다."
                    }
                }],
                options: [{ label: { zh: "誤判情勢", jp: "状況を見誤る", kr: "상황을 오판하다" }, action: "advance_chain" }]
            }
        }
    ]
});
// KR-002 Tier 3：高壓對峙，突發狀況下的語氣破綻 (為你新增的代碼)
DB.templates.push({
    id: 'learn_kr002_t3_romance',
    type: 'middle',
    reqTags: ['learning', 'romance', 'risk_high'],
    dialogue: [
        {
            text: {
                zh: "{rival}一直堅稱與{lover}只是「普通的上下級關係」。<br><br>突然，{lover}不小心打翻了桌上的水杯，並順手遞給{rival}一張紙巾。<br>{rival}下意識地接過，脫口而出：<br><br>「아, 고마워. (啊，謝謝。)」<br><br>這瞬間的安靜震耳欲聾。所有人的目光都在你們身上。"
            }
        }
    ],
    options: [
        {
            label: {
                zh: "點破下意識的半語",
                jp: "無意識のタメ口を指摘する",
                kr: "무의식적인 반말을 지적하다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_kr002"],
                varOps: [{ key: 'evidence_count', val: 2, op: '+' }],
                exp: 45
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你冷冷地開口：「普通的上下級，會下意識用『고마워』這種半語嗎？」<br><br>在韓國，即使是突發狀況，對不熟的前輩也絕對會用敬語「고맙습니다」。這句自然的半語，徹底撕破了他們的謊言。",
                        jp: "冷たい声で口を開く。「ただの上下関係で、無意識に『고마워』なんてタメ口を使うか？」<br><br>韓国では、とっさの時でも親しくない先輩には絶対に敬語の「고맙습니다」を使う。この自然なタメ口が、彼らの嘘を完全に引き裂いた。",
                        kr: "차가운 목소리로 입을 열다. 「그냥 상하 관계인데, 무의식적으로 '고마워'라는 반말이 나와?」<br><br>한국에서는 돌발 상황이라도 친하지 않은 선배에게는 절대 존댓말인 '고맙습니다'를 쓴다. 이 자연스러운 반말이 그들의 거짓말을 완전히 찢어놓았다."
                    }
                }],
                options: [{ label: { zh: "掌控局面", jp: "状況を掌握する", kr: "상황을 장악하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "幫忙擦拭桌子",
                jp: "テーブルを拭くのを手伝う",
                kr: "테이블 닦는 것을 돕다"
            },
            action: "node_next",
            rewards: {
                varOps: [{ key: 'pressure', val: 20, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你急忙幫著收拾，錯過了點破的時機。<br><br>在韓國階級分明的文化裡，下級對上級脫口而出「고마워（半語）」是極不尋常的，但你沒能抓住這個致命的破綻。",
                        jp: "慌てて片付けを手伝い、指摘するタイミングを逃してしまった。<br><br>階層が明確な韓国の文化において、部下が上司に「고마워（タメ口）」と口走るのは極めて異常なことだが、その致命的な隙を突くことができなかった。",
                        kr: "황급히 수습을 돕느라 지적할 타이밍을 놓쳤다.<br><br>계급이 분명한 한국 문화에서 하급자가 상급자에게 '고마워(반말)'라고 불쑥 말하는 것은 극히 이례적이지만, 당신은 그 치명적인 허점을 잡지 못했다."
                    }
                }],
                options: [{ label: { zh: "錯失良機", jp: "好機を逃す", kr: "좋은 기회를 놓치다" }, action: "advance_chain" }]
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
                zh: "走進左側通道",
                jp: "左の通路へ進む",
                kr: "왼쪽 통로로 가다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp003"],
                varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                exp: 20
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你在心裡把漢字「左」和「ひだり」的讀音對上號，抬腳走進左側通道。<br><br>「左へ進め」的意思正是「往左前進」。你安全通過了。",
                        jp: "「左」と「ひだり」の読みを頭の中で照合し、左の通路へと足を踏み出す。<br><br>「左へ進め」はまさにその通り。無事に通過できた。",
                        kr: "머릿속에서 한자 '左'와 'ひだり'의 발음을 맞춰보고 왼쪽 통로로 발을 내딛다.<br><br>「左へ進め」의 뜻은 바로 '왼쪽으로 가라'다. 안전하게 통과했다."
                    }
                }],
                options: [{ label: { zh: "繼續深入", jp: "さらに奥へ進む", kr: "계속 깊이 들어가다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "往右走",
                jp: "右へ進む",
                kr: "오른쪽으로 가다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp003"],
                varOps: [{ key: 'skill_points', val: -10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你看右邊更寬，便跨門往右走。<br><br>但「右は危険」的意思是「右邊危險」。你觸發了陷阱。",
                        jp: "右の通路の方が広く見えたため、石門をまたいで右へ進む。<br><br>しかし「右は危険」の意味はそのままだ。罠を作動させてしまった。",
                        kr: "오른쪽이 더 넓어 보여 석문을 넘어 오른쪽으로 가다.<br><br>하지만 「右は危険」은 '오른쪽은 위험하다'는 뜻이다. 함정을 건드리고 말았다."
                    }
                }],
                options: [{ label: { zh: "承受傷害", jp: "ダメージを受ける", kr: "피해를 입다" }, action: "advance_chain" }]
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
                zh: "拉開正前方的門",
                jp: "正面の扉を引く",
                kr: "정면의 문을 당기다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp003"],
                varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                exp: 25
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你手指描過刻字的輪廓，確認那是「前」字，拉開了正前方的門。<br><br>「前（まえ）」就是「前面」，你打開了正前方的門，機關順利解開。",
                        jp: "刻まれた文字の輪郭を指でなぞり、「前」であることを確かめて正面の扉を引いた。<br><br>「前（まえ）」はそのままだ。正面の扉を開け、仕掛けは無事に解かれた。",
                        kr: "새겨진 글자의 윤곽을 손가락으로 훑어보며 '前'임을 확인하고 정면의 문을 당겼다.<br><br>「前(まえ)」는 '앞'이다. 정면의 문을 열자 장치가 순조롭게 풀렸다."
                    }
                }],
                options: [{ label: { zh: "繼續", jp: "続ける", kr: "계속" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "往左走",
                jp: "左へ進む",
                kr: "왼쪽으로 가다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp003"],
                varOps: [{ key: 'skill_points', val: -8, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你憑藉上次左邊成功的肌肉記憶，手自動伸向了左邊的把手。<br><br>但這次刻的漢字明明是「前」。你選錯了方向。",
                        jp: "前回左が正解だった筋肉の記憶で、勝手に左の取っ手へ手を向かわせてしまった。<br><br>しかし今回刻まれていた漢字は明らかに「前」だ。方向を間違えた。",
                        kr: "지난번 왼쪽이 정답이었던 근육 기억 때문에 손이 무의식적으로 왼쪽 손잡이를 향했다.<br><br>하지만 이번에 새겨진 한자는 분명 '前'이다. 방향을 잘못 선택했다."
                    }
                }],
                options: [{ label: { zh: "機關反噬", jp: "仕掛けの反撃", kr: "장치의 역공" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "冷靜分析字形",
                jp: "文字の形を分析する",
                kr: "글자 모양을 분석하다"
            },
            action: "node_next",
            check: { stat: 'INT', val: 4 }, // 屬性檢定保留
            rewards: {
                tags: ["applied_jp003", "puzzle_solved"],
                varOps: [
                    { key: 'skill_points', val: 20, op: '+' },
                    { key: 'puzzle_count', val: 1,  op: '+' }
                ],
                exp: 30
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你屏除雜念，在腦海中逐筆拆解字形。<br><br>你冷靜辨認筆畫，想起了「前」的意思正是往前走。理智引導你做出了正確選擇。",
                        jp: "雑念を振り払い、頭の中で文字の形を解析し直す。<br><br>冷静に画数を識別し、「前」の意味が前に進むことだと思い出した。理性が正しい選択へと導いてくれた。",
                        kr: "잡념을 버리고 머릿속에서 글자의 획을 천천히 분해하다.<br><br>냉정하게 획을 구별하여 '前'의 뜻이 앞으로 가는 것임을 기억해냈다. 이성이 당신을 올바른 선택으로 이끌었다."
                    }
                }],
                options: [{ label: { zh: "破解成功", jp: "解読成功", kr: "해독 성공" }, action: "advance_chain" }]
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
                zh: "推背後的石板",
                jp: "背後の石板を押す",
                kr: "등 뒤의 석판을 밀다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_jp003", "solved_final_puzzle"],
                varOps: [
                    { key: 'skill_points', val: 30, op: '+' },
                    { key: 'puzzle_count', val: 1,  op: '+' }
                ],
                exp: 50
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "腦中閃過「後ろ」的讀音——你旋身，雙手猛地推向背後那塊石板。<br><br>在千鈞一髮之際，你認出了「後ろ（うしろ）」是「後面」的意思。機關停止了移動。",
                        jp: "「うしろ」が頭の中で閃く——振り向き、背後の石板に両手で渾身の力を叩きつけた。<br><br>間一髪のところで、「後ろ（うしろ）」が「後ろ」という意味であることに気づいた。仕掛けの動きが止まった。",
                        kr: "「うしろ」의 발음이 머릿속에서 번쩍인다——몸을 돌려 등 뒤의 석판에 두 손으로 힘껏 밀었다.<br><br>위기일발의 순간, 「後ろ(うしろ)」가 '뒤'라는 뜻임을 알아챘다. 장치가 움직임을 멈췄다."
                    }
                }],
                options: [{ label: { zh: "生還", jp: "生還", kr: "생환" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "壓前面的石板",
                jp: "前の石板を押す",
                kr: "앞의 석판을 밀다"
            },
            action: "node_next",
            rewards: {
                varOps: [{ key: 'skill_points', val: -15, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "牆壁的轟鳴聲壓過了思考，本能讓你將雙手壓向前面的石板。<br><br>你憑直覺押了前面，但「後ろ」的意思其實是後面！陷阱被觸發了。",
                        jp: "壁の轟音がすべての思考を圧倒し、本能のまま両手を前の石板に押しつけてしまった。<br><br>直感で前を選んだが、「後ろ」の意味は実際には「後ろ」だ！罠が作動した。",
                        kr: "벽의 굉음이 모든 생각을 압도하여, 본능적으로 두 손을 앞쪽 석판으로 밀어붙이고 말았다.<br><br>직감으로 앞을 선택했지만, 「後ろ」의 뜻은 사실 뒤다! 함정이 발동되었다."
                    }
                }],
                options: [{ label: { zh: "承受重擊", jp: "痛撃を受ける", kr: "큰 타격을 입다" }, action: "advance_chain" }]
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
                zh: "立刻換上訓練服",
                jp: "すぐにトレーニングウェアに着替える",
                kr: "당장 훈련복으로 갈아입다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr003"],
                varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                exp: 15
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把筆記夾在腋下，立刻換上訓練服。「시작해라」那是命令，不是建議。<br><br>「지금 당장 시작해라」的意思正是「現在立刻開始」。你準確執行了命令，沒有浪費一刻鐘。",
                        jp: "メモを脇に挟み、すぐにトレーニングウェアに着替えた。「시작해라」は命令であり、提案ではない。<br><br>「지금 당장 시작해라」の意味は「今すぐ始めろ」だ。命令を正確に実行し、一分たりとも無駄にしなかった。",
                        kr: "노트를 겨드랑이에 끼고 당장 훈련복으로 갈아입었다. 「시작해라」는 명령이지 제안이 아니다.<br><br>「지금 당장 시작해라」의 뜻은 바로 '지금 당장 시작해라'다. 명령을 정확히 수행하여 일 분도 낭비하지 않았다."
                    }
                }],
                options: [{ label: { zh: "開始訓練", jp: "トレーニングを開始する", kr: "훈련을 시작하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "坐下等待{mentor}",
                jp: "座って{mentor}を待つ",
                kr: "앉아서 {mentor}를 기다리다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr003"],
                varOps: [{ key: 'pressure', val: 10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你折好筆記，決定坐下來等{mentor}回來再說。<br><br>但「시작해라」是命令形，這句話要求你立刻開始，你錯失了訓練的最佳時機。",
                        jp: "メモをたたみ、座って{mentor}が戻るのを待つことにした。<br><br>しかし「시작해라」は命令形だ。この言葉は「今すぐ始めろ」と要求しており、最適なトレーニングのタイミングを逃してしまった。",
                        kr: "노트를 접고 앉아서 {mentor}가 돌아오기를 기다리기로 했다.<br><br>하지만 「시작해라」는 명령형이다. 이 말은 당장 시작하라는 요구였고, 당신은 최적의 훈련 타이밍을 놓쳤다."
                    }
                }],
                options: [{ label: { zh: "進度落後", jp: "遅れをとる", kr: "진도가 뒤처지다" }, action: "advance_chain" }]
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
                zh: "握緊紙條",
                jp: "紙をきつく握る",
                kr: "종이를 꼭 쥐다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr003", "befriended_rival"],
                varOps: [
                    { key: 'skill_points', val: 10, op: '+' },
                    { key: 'rank_points',  val: 10, op: '+' }
                ]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "紙條握在手心，感覺到上面還有對方手掌的溫度。「절대」，絕對不要。<br><br>「절대 포기하지 마라」意思是「絕對不要放棄」。對方其實正在默默為你加油。",
                        jp: "手の中で紙をきつく握る。相手の体温がまだ残っている気がした。「절대」、絶対に。<br><br>「절대 포기하지 마라」の意味は「絶対に諦めるな」だ。相手は陰ながらあなたを応援していたのだ。",
                        kr: "종이를 손 안에 꼭 쥐다. 상대의 체온이 아직 남아있는 것 같다. 「절대」, 절대로.<br><br>「절대 포기하지 마라」는 '절대 포기하지 마라'는 뜻이다. 상대는 사실 속으로 당신을 응원하고 있었다."
                    }
                }],
                options: [{ label: { zh: "重拾信心", jp: "自信を取り戻す", kr: "자신감을 되찾다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "揉皺紙條丟掉",
                jp: "紙を丸めて捨てる",
                kr: "종이를 구겨 버리다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr003"],
                varOps: [{ key: 'pressure', val: 8, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你以為對方是來嘲諷的，氣憤地揉皺紙條丟在桌上。<br><br>但「～지 마라」是「不要」的意思，其實對方是叫你不要放棄。你誤會了對方的好意。",
                        jp: "嫌味を言いに来たのだと思い、腹を立てて紙を丸め、テーブルに投げつけた。<br><br>しかし「～지 마라」は「～するな」という意味。実は相手は「諦めるな」と言っていたのだ。好意を誤解してしまった。",
                        kr: "비아냥거리러 온 줄 알고 화가 나서 종이를 구겨 책상에 내던졌다.<br><br>하지만 「～지 마라」는 '~하지 마라'는 뜻이다. 사실 상대는 포기하지 말라고 한 것이다. 상대의 호의를 오해했다."
                    }
                }],
                options: [{ label: { zh: "心生芥蒂", jp: "わだかまりが生まれる", kr: "앙금이 생기다" }, action: "advance_chain" }]
            }
        }
    ]
});

// KR-003 Tier 3：高壓競技，即時指令反應 (為你新增的代碼)
DB.templates.push({
    id: 'learn_kr003_t3_raising',
    type: 'middle',
    reqTags: ['learning', 'raising', 'risk_high'],
    dialogue: [
        {
            text: {
                zh: "終極考核中，你的設備突然發出刺耳的警報，壓力閥即將爆裂。<br><br>場外的{mentor}猛拍玻璃，用麥克風對你大吼：<br><br>「뒤로 물러서지 말고, 버튼을 눌러라!」<br><br>情況危急，你只有一秒鐘反應。"
            }
        }
    ],
    options: [
        {
            label: {
                zh: "死守原地，按下按鈕",
                jp: "その場に踏みとどまり、ボタンを押す",
                kr: "제자리를 지키며 버튼을 누르다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_kr003", "passed_final_exam"],
                varOps: [
                    { key: 'skill_points', val: 30, op: '+' },
                    { key: 'rank_points',  val: 20, op: '+' }
                ],
                exp: 50
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你強忍住後退的本能，死守在操作台前，狠狠拍下了緊急按鈕。警報聲戛然而止。<br><br>「물러서지 말고 (不要後退)」結合「눌러라 (按下去)」。你在極限狀態下完美執行了複合命令。",
                        jp: "後退したい本能をねじ伏せ、操作台の前に踏みとどまって緊急ボタンを強く叩いた。警報音が鳴り止む。<br><br>「물러서지 말고（後退するな）」と「눌러라（押せ）」。極限状態の中で複合命令を完璧に実行した。",
                        kr: "물러서려는 본능을 억누르고 조작대 앞을 지키며 비상 버튼을 세게 내리쳤다. 경보음이 뚝 끊겼다.<br><br>「물러서지 말고(물러서지 말고)」와 「눌러라(눌러라)」. 극한의 상황에서 복합 명령을 완벽하게 수행했다."
                    }
                }],
                options: [{ label: { zh: "通過考核", jp: "試験合格", kr: "시험 통과" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "立刻往後撤退",
                jp: "すぐに後ろへ退避する",
                kr: "즉시 뒤로 물러서다"
            },
            action: "node_next",
            rewards: {
                varOps: [
                    { key: 'skill_points', val: -20, op: '+' },
                    { key: 'pressure', val: 30, op: '+' }
                ]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "恐懼戰勝了理智，你放開操作台往後撤退。隨後，設備發出沉悶的爆炸聲，考核失敗。<br><br>你搞錯了。「～지 말고」是「不要做～然後去做～」。{mentor}是叫你「不要後退，按下按鈕」。",
                        jp: "恐怖が理性を上回り、操作台から離れて後退した。直後、設備が鈍い爆発音を立て、試験は失敗に終わった。<br><br>間違えてしまった。「～지 말고」は「～せずに、～しろ」。{mentor}は「後退せずに、ボタンを押せ」と指示していたのだ。",
                        kr: "공포가 이성을 이겼고, 당신은 조작대에서 손을 떼고 뒤로 물러섰다. 직후 설비에서 둔탁한 폭발음이 나며 시험은 실패했다.<br><br>틀렸다. 「～지 말고」는 '~하지 말고 ~해라'다. {mentor}는 '물러서지 말고, 버튼을 눌러라'라고 지시한 것이다."
                    }
                }],
                options: [{ label: { zh: "考核失敗", jp: "試験失敗", kr: "시험 실패" }, action: "advance_chain" }]
            }
        }
    ]
});


    // ════════════════════════════════════════════════════════════════
// 📚 JP-004：時態 ～た vs ～ている｜ 劇本：偵探
// ════════════════════════════════════════════════════════════════

// JP-004 Tier 1：初見，辨識過去式
DB.templates.push({
    id: 'learn_jp004_t1_mystery',
    type: 'middle',
    reqTags: ['learning', 'mystery'],
    excludeTags: ['learned_jp004'],
    dialogue: [{
        text: {
				zh: "監視記錄上有一行備注：「彼は{env_room}にいた」。<br><br>「いた」...是「いる（在）」的過去式還是現在式？<br>這說明他是「當時在」還是「現在在」？",
				jp: "監視記録に一行のメモがある：「彼は{env_room}にいた」。<br><br>「いた」…これは「いる」の過去形か、それとも現在形か？<br>彼は「当時いた」のか、それとも「今いる」のか？",
				kr: "CCTV 기록에 적힌 메모 한 줄: 「彼は{env_room}にいた」。<br><br>'いた'... 'いる(있다)'의 과거형인가 현재형인가?<br>'당시 있었다'인가 아니면 '지금 있다'인가?"
			}
    }],
    options: [
        {
            label: {
                zh: "「他當時在{env_room}」",
                jp: "「当時{env_room}にいた」",
                kr: "「당시 {env_room}에 있었다」"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp004"],
                varOps: [{ key: 'credibility', val: 10, op: '+' }],
                exp: 20
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你在筆記本上把「いた」圈了起來，這是過去式的釘子。<br><br>「いた」是「いる（在）」的過去式。「彼は{env_room}にいた」代表他當時確實在那裡，為你提供了關鍵的時間點佐證。",
                        jp: "ノートに「いた」を丸で囲む。これは過去形の釘だ。<br><br>「いた」は「いる」の過去形。「彼は{env_room}にいた」は、当時確かにそこにいたことを意味し、決定的な時間軸の証拠となる。",
                        kr: "노트에 「いた」를 동그라미 치다. 이것은 과거형이라는 못이다.<br><br>「いた」는 'いる(있다)'의 과거형이다. 「彼は{env_room}にいた」는 그가 당시 확실히 그곳에 있었음을 의미하며, 결정적인 시간적 증거가 된다."
                    }
                }],
                options: [{ label: { zh: "確立不在場證明", jp: "アリバイを確立する", kr: "알리바이를 확립하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "「他現在在{env_room}」",
                jp: "「今{env_room}にいる」",
                kr: "「지금 {env_room}에 있다」"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp004"],
                varOps: [{ key: 'tension', val: 15, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你推開椅子站起，捲起袖子準備立刻過去找他。<br><br>但你搞錯了時態。「いた」是過去式，如果是現在式應該寫作「いる」。你興沖沖地跑過去，結果撲了個空。",
                        jp: "椅子を引いて立ち上がり、袖をまくって今すぐそこへ向かおうとした。<br><br>しかし時制を間違えている。「いた」は過去形だ。現在形なら「いる」と書くはずだ。意気揚々と駆けつけたが、結局空振りに終わった。",
                        kr: "의자를 밀어내고 일어서며 소매를 걷고 당장 그곳으로 가려 했다.<br><br>하지만 시제를 착각했다. 「いた」는 과거형이다. 현재형이라면 'いる'라고 썼을 것이다. 들떠서 달려갔지만 결국 허탕을 쳤다."
                    }
                }],
                options: [{ label: { zh: "撲空", jp: "空振り", kr: "허탕" }, action: "advance_chain" }]
            }
        }
    ]
});

// JP-004 Tier 2：進階對比（過去完成 vs 現在進行）
DB.templates.push({
    id: 'learn_jp004_t2_mystery',
    type: 'middle',
    reqTags: ['learning', 'mystery'],
    excludeTags: ['applied_jp004'],
    condition: { tags: ['learned_jp004'] },
    dialogue: [{
        text: {
				zh: "兩份證詞：<br><br>甲：「{true_culprit}は逃げた」（過去式）<br>乙：「{true_culprit}はまだ逃げている」（現在進行）<br><br>一說已逃，一說還在逃？時間差可能決定案件走向。",
				jp: "二つの証言：<br><br>甲：「{true_culprit}は逃げた」（過去形）<br>乙：「{true_culprit}はまだ逃げている」（現在進行形）<br><br>一人は逃げたと言い、もう一人はまだ逃げていると言う？この時間差が事件の行方を決定づけるかもしれない。",
				kr: "두 개의 진술:<br><br>갑: 「{true_culprit}は逃げた」(과거형)<br>을: 「{true_culprit}はまだ逃げている」(현재진행형)<br><br>하나는 이미 도망쳤다고 하고, 하나는 아직 도망 중이라고? 이 시간차가 사건의 향방을 결정할 수 있다."
			}
    }],
    options: [
        {
            label: {
                zh: "重視乙的供詞：現在進行",
                jp: "乙の証言を重視：現在進行形",
                kr: "을의 진술을 중시: 현재진행형"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp004", "has_true_evidence"],
                varOps: [{ key: 'credibility', val: 20, op: '+' }],
                exp: 30
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把乙的供詞推給搭檔，「まだ逃げている」代表嫌犯今此此刻還在移動。<br><br>「逃げた」是過去式，代表動作已完成；而「まだ逃げている」是現在進行式，表示狀態持續中。乙的情報指出嫌犯此刻仍在移動，你成功縮小了搜索範圍！",
                        jp: "乙の証言を相棒の前に押しやる。「まだ逃げている」は、容疑者が今もまだ動いていることを意味する。<br><br>「逃げた」は過去形で動作の完了を、「まだ逃げている」は現在進行形で状態の継続を表す。乙の情報により、容疑者が今も移動中であることが分かり、捜索範囲を絞り込むことに成功した！",
                        kr: "을의 진술을 파트너 앞으로 밀어놓다. 「まだ逃げている」는 용의자가 지금 이 순간에도 이동 중임을 의미한다.<br><br>「逃げた」는 과거형으로 동작의 완료를, 「まだ逃げている」는 현재진행형으로 상태의 지속을 나타낸다. 을의 정보 덕분에 용의자가 아직 이동 중임을 파악하여 수색 범위를 성공적으로 좁혔다!"
                    }
                }],
                options: [{ label: { zh: "展開追捕", jp: "追跡を開始する", kr: "추적을 시작하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "兩份供詞方向一致",
                jp: "二つの証言は方向が一致",
                kr: "두 진술의 방향이 일치"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp004"],
                varOps: [{ key: 'tension', val: 10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你疊起兩份供詞，認為它們說的都是同一件事，只要方向一致就好。<br><br>完全不同！「逃げた（た形）」是過去完成，人早跑遠了；「逃げている（ている形）」是現在進行，人還在附近躲藏。你錯失了最重要的時機。",
                        jp: "二つの証言を重ね、同じことを言っていると判断した。方向さえ一致していればいいと。<br><br>まったく違う！「逃げた（た形）」は過去完了で、とっくに遠くへ逃げている。「逃げている（ている形）」は現在進行形で、まだ近くに潜んでいる。最も重要なタイミングを逃してしまった。",
                        kr: "두 진술을 겹쳐놓고 같은 말이라고 판단했다. 방향만 같으면 충분하다고.<br><br>완전히 다르다! 「逃げた(た형)」는 과거완료로 이미 멀리 도망갔다는 뜻이고, 「逃げている(ている형)」는 현재진행형으로 아직 근처에 숨어있다는 뜻이다. 가장 중요한 타이밍을 놓쳤다."
                    }
                }],
                options: [{ label: { zh: "錯失先機", jp: "先機を逃す", kr: "선수를 빼앗기다" }, action: "advance_chain" }]
            }
        }
    ]
});
// JP-004 Tier 3：高壓審問，動態時態破綻 (為你新增的代碼)
DB.templates.push({
    id: 'learn_jp004_t3_mystery',
    type: 'middle',
    reqTags: ['learning', 'mystery', 'risk_high'],
    dialogue: [{
        text: {
				zh: "嫌犯堅稱：「家にいた（在家）」。<br>但你手裡的錄音卻顯示他在案發時說：「今、彼を殺しているところだ」。<br><br>「～ているところだ」的意思是？這句話的時態是……",
				jp: "容疑者は「家にいた」と堅く主張している。<br>しかし、あなたの手元の録音では、事件当時に彼はこう言っている：「今、彼を殺しているところだ」。<br><br>「～ているところだ」の意味は？この言葉の時制は……",
				kr: "용의자는 「家にいた(집에 있었다)」고 강력히 주장한다.<br>하지만 당신 손에 있는 녹음에서 그는 사건 당시 이렇게 말했다: 「今、彼を殺しているところだ」.<br><br>「～ているところだ」의 뜻은? 이 문장의 시제는……"
			}
    }],
    options: [
        {
            label: {
                zh: "指出「～ている」是現在進行",
                jp: "「～ている」は現在進行形だと指摘する",
                kr: "「～ている」가 현재진행형임을 지적하다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_jp004", "solved_final_puzzle"],
                varOps: [{ key: 'credibility', val: 30, op: '+' }],
                exp: 45
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你播放了錄音，冷冷地指出：「『殺している』是現在進行式。你當時正在殺人，根本不在家！」<br><br>「～ているところだ」表示動作正在進行的最高潮。這份錄音直接粉碎了他的不在場證明，案件真相大白。",
                        jp: "録音を再生し、冷たく言い放つ。「『殺している』は現在進行形だ。お前は当時殺人を実行していた。家にいるはずがない！」<br><br>「～ているところだ」は動作がまさに進行中であることを示す。この録音が彼のアリバイを完全に粉砕し、事件の真相が明らかになった。",
                        kr: "녹음을 틀고 차갑게 지적한다: 「'殺している'는 현재진행형이야. 넌 당시 살인을 저지르고 있었어. 집에 있었을 리가 없지!」<br><br>「～ているところだ」는 동작이 한창 진행 중임을 나타낸다. 이 녹음이 그의 알리바이를 완전히 박살 내고 사건의 진상이 밝혀졌다."
                    }
                }],
                options: [{ label: { zh: "案件偵破", jp: "事件解決", kr: "사건 해결" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "詢問「殺した」的時間點",
                jp: "「殺した」のタイミングを尋ねる",
                kr: "「殺した」의 타이밍을 묻다"
            },
            action: "node_next",
            rewards: {
                varOps: [
                    { key: 'credibility', val: -15, op: '+' },
                    { key: 'tension', val: 20, op: '+' }
                ]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你質問他：「那你到底是什麼時候『殺した（殺了）』他的？」<br><br>你搞混了時態！錄音裡說的是「殺している（正在殺）」，而不是「殺した（殺完了）」。嫌犯抓住了你語病中的破綻，開始狡辯。",
                        jp: "「じゃあ、一体いつ『殺した』んだ？」と問い詰める。<br><br>時制を混同している！録音で言っているのは「殺している（殺しつつある）」であり、「殺した（殺し終わった）」ではない。容疑者はその言葉の綻びを突いて、言い逃れを始めた。",
                        kr: "「그럼 도대체 언제 '殺した(죽였다)'는 거야?」라고 추궁한다.<br><br>시제를 혼동했다! 녹음에서 말한 건 「殺している(죽이고 있다)」이지, 「殺した(죽였다)」가 아니다. 용의자는 그 말실수의 허점을 파고들어 변명하기 시작했다."
                    }
                }],
                options: [{ label: { zh: "失去優勢", jp: "優位を失う", kr: "우위를 잃다" }, action: "advance_chain" }]
            }
        }
    ]
});
    
// ════════════════════════════════════════════════════════════════
// 📚 KR-004：生存危險詞彙 (조심, 도망, 위험) ｜ 劇本：恐怖生存
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
                zh: "往右方出口衝刺",
                jp: "右の出口へ全力疾走する",
                kr: "오른쪽 출구로 전력 질주하다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr004"],
                varOps: [{ key: 'knowledge', val: 10, op: '+' }],
                exp: 15
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "三個詞在腦中閃爍——조심，도망，위험——箭頭指右，你立刻腳跟轉向，全力衝刺。<br><br>「조심（小心）/ 도망（逃跑）/ 위험（危險）」全都是警告。箭頭指向右邊出口，前方則是叉叉。你跑對了方向。",
                        jp: "三つの単語が頭に閃く——조심、도망、위험。矢印は右、踵を向け、全力で駆ける。<br><br>「조심（注意） / 도망（逃亡） / 위험（危険）」はすべて警告だ。矢印が右を、前方に✕印を指している。正しい方向へ逃げた。",
                        kr: "세 단어가 머릿속에서 번쩍인다——조심, 도망, 위험. 화살표는 오른쪽, 발뒤꿈치를 돌려 전력 질주하다.<br><br>「조심 / 도망 / 위험」은 모두 경고다. 화살표는 오른쪽 출구를 가리키고 앞쪽 문엔 X가 그려져 있다. 방향을 제대로 잡고 도망쳤다."
                    }
                }],
                options: [{ label: { zh: "逃出生天", jp: "脱出成功", kr: "탈출 성공" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "衝撞前方的門",
                jp: "前の扉に突っ込む",
                kr: "앞쪽 문으로 돌진하다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr004"],
                varOps: [{ key: 'curse_val', val: 15, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你心想叉叉可能只是塗鴉，肩一沉，像破城槌一樣撞開了前方的門。<br><br>前方的門畫著叉叉，旁邊寫著「위험（危險）」。你還是選擇了硬闖，付出了慘痛的代價。",
                        jp: "✕マークはただの落書きだと思い、肩を下げ、破城槌のように前の扉に突っ込んだ。<br><br>前の扉には✕マークがあり、そばには「위험（危険）」と書かれていた。強行突破を選んだ結果、痛ましい代償を払うことになった。",
                        kr: "X 표시는 그냥 낙서일 거라 생각하고 어깨를 낮춰 공성 망치처럼 앞쪽 문을 들이받았다.<br><br>앞쪽 문에는 X가 그려져 있고 옆에는 「위험」이라고 적혀 있었다. 그래도 강행 돌파를 선택했고, 뼈아픈 대가를 치렀다."
                    }
                }],
                options: [{ label: { zh: "慘痛代價", jp: "痛ましい代償", kr: "뼈아픈 대가" }, action: "advance_chain" }]
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
                zh: "轉身往右跑",
                jp: "右へ向きを変えて走る",
                kr: "오른쪽으로 방향을 바꿔 뛰다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr004"],
                varOps: [{ key: 'skill_points', val: 15, op: '+' }],
                exp: 25
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "「저기（那裡）위험（危險）」。他的手指著左邊是在警告，不是引路。你轉身往右狂奔。<br><br>「도망쳐（快逃）」！「저기 위험해（那裡危險）」！他指著左邊，意思是左邊有危險。你果斷往右逃，逃過一劫。",
                        jp: "「저기（あそこ）위험（危険）」。左を指しているのは警告であり、誘導ではない。右へ向きを変えて走り出す。<br><br>「도망쳐（逃げろ）」！「저기 위험해（あそこは危険だ）」！左を指しているのは、そこに危険があるという意味だ。右へ逃げる決断を下し、難を逃れた。",
                        kr: "「저기(거기) 위험(위험)」. 왼쪽을 가리키는 건 경고지 안내가 아니다. 몸을 돌려 오른쪽으로 뛰었다.<br><br>「도망쳐(도망쳐)」! 「저기 위험해(저기 위험해)」! 왼쪽을 가리키는 건 그쪽에 위험이 있다는 뜻이다. 과감히 오른쪽으로 피해서 화를 면했다."
                    }
                }],
                options: [{ label: { zh: "逃過一劫", jp: "難を逃れる", kr: "화를 면하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "蹲下確認並往左跑",
                jp: "かがんで確かめ、左へ走る",
                kr: "몸을 숙여 확인하고 왼쪽으로 뛰다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr004"],
                varOps: [{ key: 'curse_val', val: 20, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你看他震顫的手指著左邊，以為那是生路，便蹲下確認後往左跑去。<br><br>你誤會了！「저기 위험해（那裡危險）」他是在警告你不要過去，而不是引導你。你迎面撞上了陷阱。",
                        jp: "震える腕が左を指しているのを生路だと勘違いし、かがんで確認してから左へ走り出した。<br><br>誤解している！「저기 위험해（あそこは危険だ）」、彼はそこへ行くなと警告しているのであって、誘導しているわけではない。正面から罠に突っ込んでしまった。",
                        kr: "떨리는 팔이 왼쪽을 가리키는 걸 살길이라 착각하고, 몸을 숙여 확인한 뒤 왼쪽으로 달려갔다.<br><br>오해했다! 「저기 위험해」는 그쪽으로 가지 말라고 경고하는 것이지, 안내하는 게 아니다. 정면으로 함정과 맞닥뜨렸다."
                    }
                }],
                options: [{ label: { zh: "落入陷阱", jp: "罠に落ちる", kr: "함정에 빠지다" }, action: "advance_chain" }]
            }
        }
    ]
});

// KR-004 Tier 3：高壓生存，極限聽力反應 (為你新增的代碼)
DB.templates.push({
    id: 'learn_kr004_t3_horror',
    type: 'middle',
    reqTags: ['learning', 'horror', 'risk_high'],
    dialogue: [{
        text: {
            zh: "怪物正在破門而入，房間的廣播突然響起粗糙的雜音：<br><br>「...숨지 마라... 밖으로... 도망쳐!」<br><br>這段不清晰的語音裡，你捕捉到了「도망쳐（逃）」，但前面那句是關鍵。<br>怪物已經撞開了一半的門。"
        }
    }],
    options: [
        {
            label: {
                zh: "砸開窗戶跳出去",
                jp: "窓を叩き割り、外へ飛び出す",
                kr: "창문을 깨고 밖으로 뛰어내리다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_kr004", "survived_final_attack"],
                varOps: [{ key: 'knowledge', val: 20, op: '+' }],
                exp: 40
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "「숨지 마라」意思是「不要躲藏」。你抓起椅子砸碎玻璃，縱身躍出窗外。<br><br>廣播的意思是「不要躲藏，往外逃！」你如果在房內尋找掩體，就會被怪物甕中捉鱉。你做出了正確的生存抉擇。",
                        jp: "「숨지 마라」の意味は「隠れるな」。椅子を掴んで窓ガラスを叩き割り、外へ飛び出した。<br><br>放送の意味は「隠れずに、外へ逃げろ！」だ。もし部屋の中で隠れ場所を探していたら、怪物に袋の鼠にされていただろう。正しい生存の選択をした。",
                        kr: "「숨지 마라」는 '숨지 마라'는 뜻이다. 의자를 집어 들고 유리창을 깬 뒤 밖으로 뛰어내렸다.<br><br>방송의 뜻은 '숨지 말고, 밖으로 도망쳐라!'다. 만약 방 안에서 숨을 곳을 찾았다면 괴물에게 독 안에 든 쥐 신세가 되었을 것이다. 올바른 생존의 선택을 했다."
                    }
                }],
                options: [{ label: { zh: "驚險逃脫", jp: "間一髪の脱出", kr: "아슬아슬하게 탈출" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "鑽進鐵櫃裡躲藏",
                jp: "鉄のロッカーに潜り込んで隠れる",
                kr: "철제 캐비닛 안에 들어가 숨다"
            },
            action: "node_next",
            rewards: {
                varOps: [{ key: 'curse_val', val: 30, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你聽到「逃跑」，下意識選擇了最安全的隱蔽處，鑽進了鐵櫃裡。<br><br>你沒聽懂廣播！「숨지 마라」是「不要躲藏」。怪物撞開門，徑直走向了鐵櫃……",
                        jp: "「逃げろ」という言葉を聞いて、無意識に最も安全な隠れ場所を選び、ロッカーに潜り込んだ。<br><br>放送を聞き間違えている！「숨지 마라」は「隠れるな」だ。扉をぶち破った怪物は、まっすぐロッカーへと向かってきた……",
                        kr: "「도망쳐」라는 말을 듣고 무의식적으로 가장 안전한 은신처를 골라 철제 캐비닛 안으로 들어갔다.<br><br>방송을 잘못 알아들었다! 「숨지 마라」는 '숨지 마라'다. 문을 부수고 들어온 괴물은 곧장 캐비닛 쪽으로 다가왔다……"
                    }
                }],
                options: [{ label: { zh: "無路可退", jp: "逃げ場なし", kr: "퇴로가 없다" }, action: "advance_chain" }]
            }
        }
    ]
});
// ════════════════════════════════════════════════════════════════
// 📚 JP-005：助詞 に vs で｜ 劇本：偵探/冒險
// ════════════════════════════════════════════════════════════════

// JP-005 Tier 1：地點與動作的辨識
DB.templates.push({
    id: 'learn_jp005_t1_mystery',
    type: 'middle',
    reqTags: ['learning', 'mystery'],
    excludeTags: ['learned_jp005'],
    dialogue: [{
		text: {
			zh: "兩份目擊報告，同一地點，助詞不同：<br><br>甲：「彼は{env_room}にいた」<br>乙：「彼は{env_room}で何かをしていた」<br><br>甲用「に」，乙用「で」，這兩者有什麼差？兩份報告說的是同一件事嗎？",
			jp: "二人の目撃証言：<br><br>甲：「彼は{env_room}にいた」<br>乙：「彼は{env_room}で何かをしていた」<br><br>甲は「に」、乙は「で」を使っている。二つの証言は同じことを言っているのだろうか？",
			kr: "두 명의 목격자 진술:<br><br>갑: 「彼は{env_room}にいた」<br>을: 「彼は{env_room}で何かをしていた」<br><br>갑은 「に」를, 을은 「で」를 썼다. 둘의 차이는 무엇일까? 두 진술은 같은 사건을 말하고 있는 걸까?"
		}
	}],
    options: [
        {
            label: {
                zh: "重視乙的證詞：で代表動作",
                jp: "乙の証言を重視：「で」は行動を伴う",
                kr: "을의 진술을 중시: 「で」는 행동을 동반해"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp005"],
                varOps: [{ key: 'credibility', val: 15, op: '+' }],
                exp: 25
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你在筆記上圈出助詞：「に」只表示存在的位置，而「で」表示動作發生的場所。<br><br>乙不僅看到嫌犯在哪，還看到他「正在做某事」，乙的供詞分量更重！你抓住了破案的關鍵線索。",
                        jp: "ノートの助詞を丸で囲む。「に」は存在のみ、「で」は行動を伴う。<br><br>乙は彼がどこにいたかだけでなく、「何かをしていた」ことも見ている。乙の証言の方が重要だ！事件解決の決定的な手がかりを掴んだ。",
                        kr: "노트의 조사를 동그라미 치다. 「に」는 존재 위치만, 「で」는 행동이 일어난 장소를 나타낸다.<br><br>을은 그가 어디 있었는지뿐만 아니라, '무언가를 하고 있었다'는 것도 보았다. 을의 진술이 훨씬 더 무겁다! 사건 해결의 결정적인 단서를 잡았다."
                    }
                }],
                options: [{ label: { zh: "鎖定線索", jp: "手がかりを掴む", kr: "단서를 확보하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "兩份供詞互相印證",
                jp: "二つの証言を裏付けとする",
                kr: "두 진술을 상호 확인하다"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_jp005"],
                varOps: [{ key: 'tension', val: 8, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把兩張紙疊起推到一旁，認為兩人都證明嫌犯在場，這樣就足夠了。<br><br>你忽略了助詞的關鍵差異！「に」只表示存在，但「で」代表他在那裡進行了動作。乙其實看到他在做事，你卻把兩份供詞當成了等價的情報。",
                        jp: "二つの証言を重ねて脇に置き、どちらも彼がそこにいたと言っているのだから十分だと考えた。<br><br>助詞の重要な違いを見落としている！「に」は存在のみだが、「で」はそこで行動を起こしたことを表す。乙は彼が何かをしているのを見たのに、あなたはその重要な情報を見過ごしてしまった。",
                        kr: "두 진술을 겹쳐 옆으로 밀어놓고, 둘 다 그가 거기 있었다고 하니 상호 확인으로 충분하다고 여겼다.<br><br>조사의 결정적인 차이를 간과했다! 「に」는 존재만 나타내지만, 「で」는 거기서 행동을 했음을 의미한다. 을은 그가 무언가 하는 것을 보았는데, 당신은 두 진술을 똑같은 정보로 취급해버렸다."
                    }
                }],
                options: [{ label: { zh: "判斷失誤", jp: "判断ミス", kr: "판단 실수" }, action: "advance_chain" }]
            }
        }
    ]
});

// JP-005 Tier 2：應用於機關解謎
DB.templates.push({
    id: 'learn_jp005_t2_adventure',
    type: 'middle',
    reqTags: ['learning', 'adventure'],
    excludeTags: ['applied_jp005'],
    condition: { tags: ['learned_jp005'] },
    dialogue: [{
        text: {
            zh: "石板上刻著兩行指示：<br><br>「祭壇に触れるな」<br>「祭壇で儀式を行え」<br><br>你面前有兩個不同的祭壇。"
        }
    }],
    options: [
        {
            label: {
                zh: "在寫著「で」的祭壇前準備",
                jp: "「で」と書かれた祭壇の前に進む",
                kr: "「で」가 적힌 제단 앞에 서다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp005", "puzzle_solved"],
                varOps: [
                    { key: 'skill_points', val: 20, op: '+' },
                    { key: 'puzzle_count', val: 1, op: '+' }
                ],
                exp: 35
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你環顧兩座祭壇，深吸一口氣，避開了寫著「に触れるな」的祭壇，走到了另一座祭壇前。<br><br>「祭壇に」的「に」是接觸的對象，所以「不要碰那個祭壇」。<br>「祭壇で」的「で」是動作場所，所以「在這個祭壇上進行儀式」。機關成功啟動！",
                        jp: "二つの祭壇を見回し、深呼吸をする。「に触れるな」の方を避け、「で儀式を行え」の前に進み出た。<br><br>「祭壇に」の「に」は接触の対象なので「その祭壇に触れるな」という意味。<br>「祭壇で」の「で」は動作の場所なので「この祭壇で儀式を行え」という意味。仕掛けが正常に作動した！",
                        kr: "두 제단을 둘러보며 깊게 숨을 들이쉬다. 「に触れるな」쪽을 피하고 다른 제단 앞으로 나아갔다.<br><br>「祭壇に」의 「に」는 접촉의 대상이므로 '그 제단을 건드리지 마라'.<br>「祭壇で」의 「で」는 동작의 장소이므로 '이 제단에서 의식을 행하라'. 장치가 성공적으로 작동했다!"
                    }
                }],
                options: [{ label: { zh: "解開機關", jp: "仕掛けを解く", kr: "장치를 풀다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "伸手觸碰有刻字的祭壇",
                jp: "文字が刻まれた祭壇に触れる",
                kr: "글자가 새겨진 제단을 만지다"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_jp005"],
                varOps: [{ key: 'skill_points', val: -10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你心想從有刻字的祭壇開始調查，於是伸出手，觸碰了冰冷的石面。<br><br>「触れるな」= 不要觸碰！這裡的「に」是接觸對象的標記。你碰了絕對不能碰的祭壇，懲罰機制啟動了。",
                        jp: "文字が刻まれた祭壇から調べようと思い、手を伸ばして冷たい石の表面に触れてしまった。<br><br>「触れるな」＝触れてはいけない！ここの「に」は接触対象のマーカーだ。絶対に触れてはならない祭壇に触れてしまい、罰のメカニズムが発動した。",
                        kr: "글자가 새겨진 제단부터 조사해야겠다고 생각하며 손을 뻗어 차가운 돌 표면을 만졌다.<br><br>「触れるな」 = 만지지 마라! 여기서의 「に」는 접촉 대상의 마커다. 절대 건드려선 안 될 제단을 건드렸고, 형벌 장치가 작동했다."
                    }
                }],
                options: [{ label: { zh: "觸發陷阱", jp: "罠を作動させる", kr: "함정 발동" }, action: "advance_chain" }]
            }
        }
    ]
});

// JP-005 Tier 3：高壓脫逃，極限場景判斷 (為你新增的代碼)
DB.templates.push({
    id: 'learn_jp005_t3_adventure',
    type: 'middle',
    reqTags: ['learning', 'adventure', 'risk_high'],
    dialogue: [{
		text: {
			zh: "遺跡開始崩塌，落石不斷砸下。你必須輸入最後的逃生密碼。<br><br>提示只有殘破的一段語音：「炎...（雜音）...隠れろ！（躲藏）」<br><br>語音中聽不清楚是「炎に」還是「炎で」，但前方是一片火海，還有一個被火海包圍的安全掩體。你要選哪一個？",
			jp: "遺跡が崩壊し始め、落石が降り注ぐ。最後の脱出暗号を入力しなければならない。<br><br>ヒントは途切れ途切れの音声だけだ：「炎...（ノイズ）...隠れろ！」<br><br>「炎に」なのか「炎で」なのか聞き取れない。しかし目の前には火の海があり、その中に火の海に囲まれた安全なシェルターがある。どちらを選ぶ？",
			kr: "유적이 무너지기 시작하고 낙석이 계속 떨어진다. 마지막 탈출 암호를 입력해야 한다.<br><br>힌트는 끊어지는 음성뿐이다: 「炎...(잡음)...隠れろ!(숨어라!)」<br><br>음성에서는 「炎に」인지 「炎で」인지 잘 들리지 않는다. 하지만 눈앞에는 불바다가 있고, 불바다에 둘러싸인 안전한 은신처가 있다. 어느 쪽을 선택할 것인가?"
		}
	}],
    options: [
        {
            label: {
                zh: "選擇「炎に」，衝進火裡躲藏",
                jp: "「炎に」を選び、火の中へ飛び込む",
                kr: "「炎に」를 선택하고 불길 속으로 뛰어들다"
            },
            action: "node_next",
            rewards: {
                varOps: [
                    { key: 'skill_points', val: -20, op: '+' },
                    { key: 'curse_val', val: 30, op: '+' }
                ]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你選擇了「炎に（躲進火裡）」，閉上眼衝進了火海中！<br><br>你判斷錯誤了！「に隠れる」是進入並留在那個狀態中。如果提示是「炎に隠れろ」，就是要你「藏進火裡」，這會讓你被活活燒死。逃脫失敗。",
                        jp: "「炎に（火の中に隠れる）」だと判断し、目を閉じて火の海に飛び込んだ！<br><br>判断ミスだ！「に隠れる」は、その中に入り込んで留まることを意味する。「炎に隠れろ」なら「火の中に隠れろ」となり、生きたまま焼かれてしまう。脱出失敗だ。",
                        kr: "「炎に(불속에 숨다)」라고 판단하고 눈을 감은 채 불바다로 뛰어들었다!<br><br>판단이 틀렸다! 「に隠れる」는 그 안으로 들어가 머무는 것을 의미한다. 만약 힌트가 「炎に隠れろ」였다면 '불길 속에 숨어라'가 되어 산 채로 타죽게 된다. 탈출 실패."
                    }
                }],
                options: [{ label: { zh: "葬身火海", jp: "火の海に葬られる", kr: "불바다에 묻히다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "選擇「炎で」，利用火勢作掩護",
                jp: "「炎で」を選び、火を隠れ蓑にする",
                kr: "「炎で」를 선택하고 불길을 엄폐물로 삼다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_jp005", "survived_final_attack"],
                varOps: [
                    { key: 'skill_points', val: 30, op: '+' },
                    { key: 'knowledge', val: 15, op: '+' }
                ],
                exp: 50
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你選擇了「炎で（在火海這個範圍內）」，你翻滾進入被火包圍的安全掩體中躲藏。<br><br>「で」代表動作發生的場所。語音的真意是「在火海中（尋找地方）躲藏」。你利用火勢作為掩護，避開了落石，成功等到了救援。",
                        jp: "「炎で（火の海という範囲内で）」だと判断し、火に囲まれた安全なシェルターに転がり込んだ。<br><br>「で」は動作が起こる場所を表す。音声の真意は「火の海の中で（場所を見つけて）隠れろ」だ。火の勢いを隠れ蓑にして落石を避け、無事に救助を待つことができた。",
                        kr: "「炎で(불바다라는 범위 안에서)」라고 판단하고, 불에 둘러싸인 안전한 은신처로 굴러 들어갔다.<br><br>「で」는 동작이 일어나는 장소를 나타낸다. 음성의 진짜 의미는 '불바다 속에서 (장소를 찾아) 숨어라'이다. 불길을 엄폐물로 삼아 낙석을 피하고 성공적으로 구조를 기다렸다."
                    }
                }],
                options: [{ label: { zh: "絕處逢生", jp: "絶体絶命からの生還", kr: "기사회생" }, action: "advance_chain" }]
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
				zh: "嫌疑人的手機裡有兩條訊息：<br><br>A：「나 거기 있었어」（었어）<br>B：「나 거기 있고 있어」（고 있어）<br><br>哪一條才是「當時在那裡」？",
				jp: "容疑者のスマホに二つのメッセージがある：<br><br>A：「나 거기 있었어」（었어）<br>B：「나 거기 있고 있어」（고 있어）<br><br>どちらが「当時そこにいた」という意味だろうか？",
				kr: "용의자의 휴대폰에 두 개의 메시지가 있다:<br><br>A: 「나 거기 있었어」(었어)<br>B: 「나 거기 있고 있어」(고 있어)<br><br>어느 쪽이 '당시 그곳에 있었다'는 뜻일까?"
			}
    }],
    options: [
        {
            label: {
                zh: "A訊息：「있었어」",
                jp: "Aのメッセージ：「있었어」",
                kr: "A 메시지: 「있었어」"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr005"],
                varOps: [{ key: 'credibility', val: 12, op: '+' }],
                exp: 20
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把A訊息截圖，用紅筆圈出「있었어」的字尾——「었」，這是確鑿的過去式。<br><br>「았/었어」是韓文的過去式語尾。「있었어」代表「當時在那裡」，這條訊息可以作為嫌犯完美的不在場證明。",
                        jp: "Aのメッセージをスクリーンショットし、「있었어」の語尾を赤で丸く囲む。「었」、これは確かな過去形だ。<br><br>「았/었어」は韓国語の過去形の語尾。「있었어」は「当時そこにいた」ことを意味し、容疑者の完璧なアリバイとなる。",
                        kr: "A 메시지를 캡처하고 「있었어」의 어미를 빨간색으로 동그라미 친다. 「었」, 이건 명확한 과거형이다.<br><br>「았/었어」는 한국어의 과거형 어미다. 「있었어」는 '당시 그곳에 있었다'는 뜻으로, 용의자의 완벽한 알리바이가 될 수 있다."
                    }
                }],
                options: [{ label: { zh: "確認不在場", jp: "アリバイの確認", kr: "알리바이 확인" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "B訊息：「있고 있어」",
                jp: "Bのメッセージ：「있고 있어」",
                kr: "B 메시지: 「있고 있어」"
            },
            action: "node_next",
            rewards: {
                tags: ["learned_kr005"],
                varOps: [{ key: 'tension', val: 10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你覺得B的語氣更強烈，於是截圖標記了B訊息。<br><br>你搞錯了。「～고 있어」是現在進行式，意思是「現在正在那裡」。不在場證明需要的是過去的時間點，你選錯了線索。",
                        jp: "Bの語気の方が強いと感じ、Bのメッセージをスクリーンショットしてマークした。<br><br>間違えている。「～고 있어」は現在進行形で、「今そこにいる」という意味だ。アリバイに必要なのは過去の時点であり、手がかりを見誤った。",
                        kr: "B 메시지의 어감이 더 강하다고 느껴 B를 캡처해서 표시해두었다.<br><br>착각했다. 「～고 있어」는 현재진행형으로, '지금 거기에 있다'는 뜻이다. 알리바이에 필요한 것은 과거의 시점인데 단서를 잘못 선택했다."
                    }
                }],
                options: [{ label: { zh: "線索無效", jp: "手がかり無効", kr: "단서 무효" }, action: "advance_chain" }]
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
				zh: "{lover}傳來兩句話：<br><br>「내가 네 생각만 했어」（했어）<br>「지금도 네 생각하고 있어」（하고 있어）<br><br>時間點一樣嗎？這兩句說的是同一件事嗎？",
				jp: "{lover}から二つのメッセージが届いた：<br><br>「내가 네 생각만 했어」（했어）<br>「지금도 네 생각하고 있어」（하고 있어）<br><br>時間軸は同じだろうか？二つは同じことを言っているのだろうか？",
				kr: "{lover}가 두 문장을 보냈다:<br><br>「내가 네 생각만 했어」(했어)<br>「지금도 네 생각하고 있어」(하고 있어)<br><br>시간대가 같을까? 두 문장의 의미는 같은 걸까?"
			}
    }],
    options: [
        {
            label: {
                zh: "時態不同，涵蓋過去到現在",
                jp: "時制が違う。過去から現在までを含んでいる",
                kr: "시제가 달라. 과거부터 현재까지를 포함해"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr005"],
                varOps: [{ key: 'evidence_count', val: 1, op: '+' }],
                exp: 25
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你調亮手機螢幕，一字一句比對：「했어」是過去，「하고 있어」是現在進行。時間軸不一樣。<br><br>「했어」是過去式（之前一直想你），「하고 있어」是現在進行式（現在也在想你）。連在一起看，代表對方從過去到現在一直掛念著你。",
                        jp: "スマホの画面を明るくし、一語ずつ比べる。「했어」は過去、「하고 있어」は現在進行。時間軸が違う。<br><br>「했어」は過去形（今まで想っていた）、「하고 있어」は現在進行形（今も想っている）。繋げて見れば、相手が過去から今までずっとあなたのことを気にかけていることが分かる。",
                        kr: "폰 화면 밝기를 높이고 한 글자씩 비교하다. 「했어」는 과거, 「하고 있어」는 현재진행. 시간축이 다르다.<br><br>「했어」는 과거형(그동안 생각했어), 「하고 있어」는 현재진행형(지금도 생각하고 있어)이다. 이어서 보면, 상대가 과거부터 지금까지 계속 당신을 생각하고 있다는 뜻이다."
                    }
                }],
                options: [{ label: { zh: "心意相通", jp: "心が通じ合う", kr: "마음이 통하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "兩句意思相同",
                jp: "二つの文の意味は同じ",
                kr: "두 문장의 의미는 같아"
            },
            action: "node_next",
            rewards: {
                tags: ["applied_kr005"],
                varOps: [{ key: 'pressure', val: 5, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把手機貼在胸口，覺得兩句都是單純的想念，意思是一樣的。<br><br>雖然都是想念，但時態大不相同。對方特地用了「過去」與「現在進行」兩種時態來強調這份感情的「持續性」，你卻只把它當成普通的一句話，略顯遲鈍。",
                        jp: "スマホを胸に当て、どちらも単なる恋しさであり、意味は同じだと感じた。<br><br>たしかにどちらも想いだが、時制が大きく異なる。相手はわざわざ「過去」と「現在進行」の二つの時制を使って感情の「継続性」を強調したのに、あなたはそれを普通の言葉としてしか受け取れず、少し鈍感だ。",
                        kr: "폰을 가슴에 대고 둘 다 단순한 그리움이니 의미는 같다고 느꼈다.<br><br>둘 다 그리움이긴 하지만 시제가 크게 다르다. 상대는 일부러 '과거'와 '현재진행' 두 가지 시제를 써서 감정의 '지속성'을 강조했는데, 당신은 그저 평범한 한마디로 받아들여 눈치가 조금 없다."
                    }
                }],
                options: [{ label: { zh: "略顯遲鈍", jp: "少し鈍感", kr: "눈치가 없다" }, action: "advance_chain" }]
            }
        }
    ]
});

// KR-005 Tier 3：高壓修羅場，戳破時間差謊言 (為你新增的代碼)
DB.templates.push({
    id: 'learn_kr005_t3_romance',
    type: 'middle',
    reqTags: ['learning', 'romance', 'mystery', 'risk_high'],
    dialogue: [{
        text: {
				zh: "{lover}向你保證：「我昨晚早就回家了！」<br><br>但你趁對方不注意時，看到{lover}傳給{rival}的訊息紀錄，發送時間是昨晚深夜：<br><br>「아직 밖에서 술 마시고 있어.」（술 마시고 있어）<br><br>這句話是什麼意思？你要怎麼當面戳破這個謊言？",
				jp: "{lover}は「昨夜はとっくに家に帰ってた！」と保証する。<br><br>しかし、相手の隙を突いて{rival}へのメッセージ記録を見ると、深夜にこう送られていた：<br><br>「아직 밖에서 술 마시고 있어.」（술 마시고 있어）<br><br>この言葉はどういう意味か？どうやってこの嘘を暴く？",
				kr: "{lover}가 당신에게 장담한다: 「나 어젯밤에 벌써 집에 갔었다고!」<br><br>하지만 방심한 틈에 {rival}에게 보낸 메시지 기록을 보니, 발송 시간이 심야였다:<br><br>「아직 밖에서 술 마시고 있어.」(술 마시고 있어)<br><br>이 문장은 무슨 뜻일까? 어떻게 눈앞에서 이 거짓말을 폭로할 것인가?"
			}
    }],
    options: [
        {
            label: {
                zh: "指出「고 있어」是當時正在進行",
                jp: "「고 있어」は当時進行中だったと指摘する",
                kr: "「고 있어」가 당시 진행 중이었음을 지적하다"
            },
            action: "node_next",
            rewards: {
                tags: ["mastered_kr005", "has_true_evidence"],
                varOps: [
                    { key: 'evidence_count', val: 2, op: '+' },
                    { key: 'tension', val: -10, op: '+' }
                ],
                exp: 45
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你舉起手機冷笑：「昨晚早就回家了？那深夜這句『마시고 있어（正在喝酒）』是誰發的？」<br><br>「～고 있어」是現在進行式。在昨晚那個時間點發出這句話，代表對方「當時正在外面喝酒」，根本沒有回家。你用無可辯駁的文法邏輯鎖死了對方的謊言。",
                        jp: "スマホを掲げて冷笑する。「昨夜はとっくに家に帰ってた？じゃあ深夜のこの『마시고 있어（飲んでいる）』は誰が送ったんだ？」<br><br>「～고 있어」は現在進行形だ。昨夜のあの時点でこれを送ったということは、相手は「当時外で飲んでいた」のであり、全く家に帰っていなかったのだ。反論の余地がない文法ロジックで相手の嘘を完全に封じ込めた。",
                        kr: "휴대폰을 들어 올리며 비웃는다. 「어젯밤에 벌써 집에 갔었다고? 그럼 심야에 보낸 이 '마시고 있어(마시고 있어)'는 누가 보낸 거야?」<br><br>「～고 있어」는 현재진행형이다. 어젯밤 그 시점에 이 말을 보냈다는 것은, 상대가 '당시 밖에서 술을 마시고 있었음'을 의미하며 집에는 전혀 가지 않았다는 뜻이다. 반박할 수 없는 문법 논리로 상대의 거짓말을 꼼짝 못 하게 만들었다."
                    }
                }],
                options: [{ label: { zh: "謊言破滅", jp: "嘘の崩壊", kr: "거짓말의 붕괴" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "質問對方「喝了酒（마셨어）」嗎",
                jp: "「お酒を飲んだ（마셨어）」のかと問い詰める",
                kr: "「술을 마셨어(마셨어)」냐고 추궁하다"
            },
            action: "node_next",
            rewards: {
                varOps: [
                    { key: 'pressure', val: 20, op: '+' },
                    { key: 'evidence_count', val: -1, op: '+' }
                ]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你生氣地質問：「你昨晚是不是在外面喝了酒（마셨어）？」<br><br>你搞錯了重點！「마셨어（喝了）」是過去式，對方大可狡辯「那是早上的事」。訊息裡的「마시고 있어」是正在進行，代表發送訊息的當下人還在外面。你因為時態用錯，讓對方找到了開脫的藉口。",
                        jp: "「昨夜、外でお酒を飲んだ（마셨어）でしょう？」と怒って問い詰める。<br><br>要点を間違えている！「마셨어（飲んだ）」は過去形であり、相手は「それは朝のことだ」と言い逃れができる。メッセージの「마시고 있어」は現在進行中であり、送信したその瞬間もまだ外にいたことを示している。時制を間違えたせいで、相手に逃げ道を与えてしまった。",
                        kr: "「어젯밤에 밖에서 술 마셨어(마셨어)?」라고 화를 내며 추궁한다.<br><br>핵심을 잘못 짚었다! 「마셨어(마셨어)」는 과거형이므로 상대는 '그건 아침 일이다'라고 변명할 수 있다. 메시지의 「마시고 있어」는 진행 중을 나타내며, 메시지를 보낼 당시 아직 밖에 있었음을 뜻한다. 시제를 잘못 사용하는 바람에 상대에게 빠져나갈 구실을 주고 말았다."
                    }
                }],
                options: [{ label: { zh: "被對方狡辯", jp: "言い逃れされる", kr: "변명에 넘어가다" }, action: "advance_chain" }]
            }
        }
    ]
});
// ════════════════════════════════════════════════════════════════
// 📚 韓日混合 KR+JP 高壓綜合事件｜ 劇本：任何主題（risk_high）
// ════════════════════════════════════════════════════════════════

DB.templates.push({
    id: 'learn_mixed_crisis',
    type: 'middle',
    reqTags: ['learning', 'risk_high'],
    excludeTags: ['faced_mixed_crisis'],
    dialogue: [
        {
            text: {
                zh: "兩張紙條，一韓一日，都被你死死握在手裡。<br><br>韓文：「뒤를 봐라」<br>日文：「前へ逃げろ」<br><br>它們指示的方向完全相反。<br>時間不多了。",
                jp: "韓国語と日本語、二枚のメモをきつく握りしめている。<br><br>韓国語：「뒤를 봐라」<br>日本語：「前へ逃げろ」<br><br>指示している方向が完全に逆だ。もう時間がない。",
                kr: "한국어와 일본어, 두 장의 쪽지를 손에 꽉 쥐고 있다.<br><br>한국어: 「뒤를 봐라」<br>일본어: 「前へ逃げろ」<br><br>지시하는 방향이 완전히 반대다. 시간이 얼마 없다."
            }
        }
    ],
    options: [
        {
            label: {
                zh: "往前跑，同時回頭看",
                jp: "前へ走りながら、後ろを振り返る",
                kr: "앞으로 뛰면서 뒤를 돌아보다"
            },
            action: "node_next",
            rewards: {
                tags: ["faced_mixed_crisis", "language_master"],
                varOps: [{ key: 'knowledge', val: 30, op: '+' }],
                exp: 60
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你依照「前へ逃げろ」起跑，同時眼角餘光向後掃視「뒤를 봐라」。<br><br>韓文「뒤를 봐라」是看後面，日文「前へ逃げろ」是往前逃。<br>這兩個指令並不矛盾！你完美結合了兩國語言的警告，一邊往前狂奔一邊閃過了背後的致命襲擊！",
                        jp: "「前へ逃げろ」に従って走り出し、同時に視界の端で「뒤를 봐라」を実践して後ろを確認する。<br><br>韓国語の「뒤를 봐라」は後ろを見ろ、日本語の「前へ逃げろ」は前へ逃げろ。<br>二つの指示は矛盾していなかった！二ヶ国語の警告を見事に統合し、前へ全力で逃げながら背後からの致命的な襲撃を躱した！",
                        kr: "「前へ逃げろ」에 따라 앞으로 달리며, 동시에 시야 끝으로 「뒤를 봐라」를 실천해 뒤를 확인한다.<br><br>한국어의 「뒤를 봐라」는 뒤를 보라는 뜻이고, 일본어의 「前へ逃げろ」는 앞으로 도망치라는 뜻이다.<br>두 지시는 모순되지 않았다! 두 언어의 경고를 완벽하게 결합하여, 앞으로 전력 질주하는 동시에 등 뒤의 치명적인 습격을 피했다!"
                    }
                }],
                options: [{ label: { zh: "化險為夷", jp: "危機を脱する", kr: "위기를 모면하다" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "大腦當機，隨便選一邊",
                jp: "脳がフリーズし、適当な方向へ走る",
                kr: "뇌가 정지해 아무 쪽이나 뛰다"
            },
            action: "node_next",
            rewards: {
                tags: ["faced_mixed_crisis"],
                varOps: [{ key: 'curse_val', val: 20, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "紙條在你手中顫抖，語言的切換讓你的大腦瞬間當機，你只好隨便朝著腳步的方向跑去。<br><br>這兩個指令其實可以同時執行，但你被不同語言的切換困住了。<br>「뒤를 봐라」= 看後面。「前へ逃げろ」= 往前逃。你錯失了最佳的應對時機，迎面撞上了危險。",
                        jp: "メモが手の中で震える。言語の切り替えで脳が瞬時にフリーズし、足が向く方へ適当に走り出してしまった。<br><br>実は二つの指示は同時に実行できたのだが、異なる言語の切り替えに足を取られてしまった。<br>「뒤를 봐라」＝後ろを見ろ。「前へ逃げろ」＝前へ逃げろ。最適な対応のタイミングを逃し、危険に正面から突っ込んでしまった。",
                        kr: "쪽지가 손 안에서 떨린다. 언어 전환으로 인해 뇌가 순식간에 정지했고, 발이 향하는 쪽으로 대충 뛰어버렸다.<br><br>사실 두 지시는 동시에 수행할 수 있었지만, 다른 언어로의 전환에 발목을 잡혔다.<br>「뒤를 봐라」= 뒤를 봐라. 「前へ逃げろ」= 앞으로 도망쳐라. 최적의 대응 타이밍을 놓치고 위험과 정면으로 맞닥뜨렸다."
                    }
                }],
                options: [{ label: { zh: "陷入險境", jp: "窮地に陥る", kr: "궁지에 빠지다" }, action: "advance_chain" }]
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
    condition: { tags: ['learned_jp001', 'learned_kr005'] }, // 需要先學過 JP-001 和 KR-005
    dialogue: [{
        text: {
            zh: "兩名目擊者各說一種語言，你必須將情報整合：<br><br>甲（日）：「彼女が撃たれた」<br>乙（韓）：「그때 그 여자는 거기 있었어」",
            jp: "二人の目撃者がそれぞれ違う言語を話している。情報を統合しなければならない：<br><br>甲（日）：「彼女が撃たれた」<br>乙（韓）：「그때 그 여자는 거기 있었어」",
            kr: "두 명의 목격자가 각각 다른 언어를 쓰고 있다. 정보를 통합해야 한다:<br><br>갑(일): 「彼女が撃たれた」<br>을(한): 「그때 그 여자는 거기 있었어」"
        }
    }],
    options: [
        {
            label: {
                zh: "並排分析，畫箭頭串聯",
                jp: "並べて分析し、矢印でつなぐ",
                kr: "나란히 분석하고 화살표로 연결하다"
            },
            action: "node_next",
            rewards: {
                tags: ["done_mixed_interrogation", "has_true_evidence"],
                varOps: [{ key: 'credibility', val: 25, op: '+' }],
                exp: 50
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你在筆記本上並排寫下兩句，畫箭頭串聯：「撃たれた（受害）+ 있었어（在場）= 她是關鍵人」。<br><br>「彼女が撃たれた」= 她被射了（日文被動式），說明她是受害者。<br>「그때 거기 있었어」= 那時她在那裡（韓文過去式）。<br>兩份供詞完美交叉確認，拼湊出了完整的真相！",
                        jp: "ノートに二文を並べて書き、矢印でつなぐ：「撃たれた（被害者）＋있었어（現場にいた）＝彼女が鍵だ」。<br><br>「彼女が撃たれた」＝彼女が撃たれた（日本語の受身形）、彼女が被害者であることを示している。<br>「그때 거기 있었어」＝あの時彼女はそこにいた（韓国語の過去形）。<br>二つの証言が見事に交差して裏付けられ、完全な真相が組み上がった！",
                        kr: "노트에 두 문장을 나란히 쓰고 화살표로 연결하다: 「撃たれた(피해자) + 있었어(현장에 있었다) = 그녀가 핵심이야」.<br><br>「彼女が撃たれた」= 그녀가 총에 맞았다(일본어 수동태), 그녀가 피해자임을 보여준다.<br>「그때 거기 있었어」= 그때 거기 있었다(한국어 과거형).<br>두 진술이 완벽하게 교차 확인되며 온전한 진상이 맞춰졌다!"
                    }
                }],
                options: [{ label: { zh: "真相大白", jp: "真相解明", kr: "진상 규명" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "供詞扣桌，揉太陽穴",
                jp: "証言をテーブルに伏せ、こめかみをもむ",
                kr: "진술을 엎어놓고 관자놀이를 문지르다"
            },
            action: "node_next",
            rewards: {
                tags: ["done_mixed_interrogation"],
                varOps: [{ key: 'tension', val: 12, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你把兩份供詞反扣在桌上，痛苦地揉著太陽穴。日語和韓語同時在腦中打架，讓你十分混亂。<br><br>這兩個語法你其實都學過了，只是高壓下失去了雙語整合能力。<br>「撃たれた」（日文被動）= 受害者。「있었어」（韓文過去）= 當時在場。如果拆開來逐句分析就清楚了，但你放棄了思考。",
                        jp: "二つの証言を伏せてテーブルに置き、苦痛に顔を歪めてこめかみをもむ。日本語と韓国語が同時に脳内でぶつかり合い、大混乱に陥っている。<br><br>実はこの二つの文法はどちらもすでに学んだものだが、プレッシャーの中で言語を統合する力を失ってしまった。<br>「撃たれた」（日本語の受身形）＝被害者。「있었어」（韓国語の過去形）＝当時現場にいた。一つずつ分解して考えれば分かるはずなのに、あなたは思考を放棄してしまった。",
                        kr: "두 진술을 책상에 엎어놓고 고통스럽게 관자놀이를 문지른다. 일본어와 한국어가 머릿속에서 동시에 뒤엉켜 혼란스럽다.<br><br>사실 이 두 문법은 모두 배운 것이지만, 엄청난 압박감 속에 이중 언어 통합 능력을 잃어버렸다.<br>「撃たれた」(일본어 수동태) = 피해자. 「있었어」(한국어 과거형) = 당시 현장에 있었다. 하나씩 떼어놓고 분석하면 명확해질 텐데, 당신은 생각을 포기하고 말았다."
                    }
                }],
                options: [{ label: { zh: "放棄思考", jp: "思考放棄", kr: "생각 포기" }, action: "advance_chain" }]
            }
        }
    ]
});
// ════════════════════════════════════════════════════════════════
// 📚 韓日混合 KR+JP 高壓綜合事件：密室毒氣逃生
// 劇本：任何主題（只在 risk_high 狀態觸發）
// ════════════════════════════════════════════════════════════════

DB.templates.push({
    id: 'learn_mixed_escape_crisis',
    type: 'middle',
    reqTags: ['learning', 'risk_high'],
    excludeTags: ['faced_mixed_escape'],
    dialogue: [{
        text: {
            zh: "毒氣開始灌入密室。<br>門上用鮮血寫著韓文：「문을 열지 마라」<br>窗戶玻璃上刻著日文：「窓を割れ」<br><br>你開始咳嗽，視線逐漸模糊。必須立刻做決定！",
            jp: "毒ガスが密室に充満し始めた。<br>ドアには血で韓国語が書かれている：「문을 열지 마라」<br>窓ガラスには日本語が刻まれている：「窓を割れ」<br><br>咳き込み、視界がぼやけてきた。今すぐ決断しなければならない！",
            kr: "독가스가 밀실에 스며들기 시작한다.<br>문에는 피로 한국어가 적혀 있다: 「문을 열지 마라」<br>창문 유리에는 일본어가 새겨져 있다: 「窓を割れ」<br><br>기침이 나고 시야가 점점 흐려진다. 지금 당장 결정해야 한다!"
        }
    }],
    options: [
        {
            label: {
                zh: "抓起滅火器砸碎窗戶",
                jp: "消火器を掴み、窓を叩き割る",
                kr: "소화기를 집어 들고 창문을 깨다"
            },
            action: "node_next",
            rewards: {
                tags: ["faced_mixed_escape", "language_master"],
                varOps: [{ key: 'knowledge', val: 30, op: '+' }],
                exp: 60
            },
            nextScene: {
                dialogue: [{
                    text: {
                        zh: "你記起「열지 마라」是韓文的否定命令「不要打開」，而「割れ」是日文的命令形「打破」。<br><br>你毫不猶豫地抓起滅火器砸碎玻璃，翻身躍出窗外，新鮮空氣灌入肺部。你完美破解了雙語死亡陷阱！",
                        jp: "「열지 마라」は韓国語の否定命令「開けるな」であり、「割れ」は日本語の命令形「割れ」であることを思い出した。<br><br>躊躇なく消火器でガラスを叩き割り、窓の外へ飛び出すと、新鮮な空気が肺に流れ込んだ。二ヶ国語のデストラップを見事に突破した！",
                        kr: "「열지 마라」는 한국어의 부정 명령 '열지 마라'이고, 「割れ」는 일본어의 명령형 '깨라'임을 기억해냈다.<br><br>망설임 없이 소화기로 유리를 깨고 창밖으로 몸을 던지자, 신선한 공기가 폐로 밀려들어왔다. 이중 언어 데스 트랩을 완벽하게 돌파했다!"
                    }
                }],
                options: [{ label: { zh: "逃出生天", jp: "脱出成功", kr: "탈출 성공" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "轉動門把，推門而出",
                jp: "ドアノブを回し、ドアを押し開ける",
                kr: "문고리를 돌려 문을 밀고 나가다"
            },
            action: "node_next",
            rewards: {
                tags: ["faced_mixed_escape"],
                varOps: [{ key: 'curse_val', val: 20, op: '+' }]
            },
            nextScene: {
                dialogue: [{
                    text: {
                        zh: "情急之下，你以為門上的字是叫你「開門逃生」，一把轉動了門把。<br><br>你搞混了文法！韓文的「～지 마라」是「不要做」。門外其實是高濃度的毒氣源頭，你一開門，瞬間被毒氣吞噬。",
                        jp: "焦りのあまり、ドアの文字を「開けろ」という意味だと勘違いし、ドアノブを回してしまった。<br><br>文法を混同している！韓国語の「～지 마라」は「～するな」だ。ドアの外は実は高濃度の毒ガスの発生源であり、ドアを開けた瞬間、毒ガスに飲み込まれてしまった。",
                        kr: "다급한 마음에 문에 적힌 글자가 '문을 열라'는 뜻인 줄 알고 문고리를 돌려버렸다.<br><br>문법을 헷갈렸다! 한국어의 「～지 마라」는 '~하지 마라'다. 문밖은 사실 고농도 독가스의 발원지였고, 문을 여는 순간 독가스에 집어삼켜졌다."
                    }
                }],
                options: [{ label: { zh: "陷入死局", jp: "死の淵に沈む", kr: "죽음의 구렁텅이에 빠지다" }, action: "advance_chain" }]
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