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
    // 🎬 [START] 懸疑偵探劇本開場節點 × 3
    //    設計原則：
    //      - 三個開場風格不同（發現屍體、被委託、目擊現場）
    //      - 在開場選項賦予路線標籤 (route_detective / route_survivor)
    //      - 初始化 credibility（公信度）與 tension（恐慌度/暴露度）
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
                    zh: "{weather}的夜晚，你獨自來到{env_building}。<br>推開{env_room}的門，{env_pack_visual}<br>然後你看見了地上的{victim}——沒有了生命跡象。<br>{murder_weapon}就躺在屍體旁邊，上面還沾著尚未乾透的血跡。",
                    jp: "{weather}の夜、一人で{env_building}を訪れた。<br>{env_room}の扉を押し開けると、{env_pack_visual}<br>そして、床に倒れている{victim}を見た——すでに生命の兆候はない。<br>死体のそばには{murder_weapon}が転がっており、まだ乾ききっていない血がべっとりとこびりついている。",
                    kr: "{weather}의 밤, 홀로 {env_building}에 찾아왔다.<br>{env_room}의 문을 밀고 들어가자, {env_pack_visual}<br>그리고 바닥에 쓰러진 {victim}을(를) 보았다——생명의 징후는 이미 사라진 상태다.<br>시체 옆에는 {murder_weapon}이(가) 나뒹굴고 있었고, 덜 마른 핏자국이 묻어 있었다."
                }
            },
            {
                text: {
                    zh: "其他人陸續聚攏過來。恐慌開始蔓延。<br>沒有人知道兇手是誰，但每個人都在看著你。",
                    jp: "他の人々が次々と集まってきた。パニックが広がり始める。<br>犯人が誰かは誰も知らないが、誰もがあなたのことを見ている。",
                    kr: "다른 사람들이 속속 몰려든다. 공황이 퍼지기 시작한다.<br>범인이 누구인지 아는 사람은 없지만, 모두가 당신을 쳐다보고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "站出來調查真相",
                    jp: "立ち上がり自ら調べる",
                    kr: "나서서 직접 조사하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_detective"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸一口氣，壓下恐懼，大聲喝止了恐慌的人群。你冷靜地保護了現場，並自告奮勇開始尋找線索。這份鎮定讓你贏得了一些人的信任。",
                            jp: "深呼吸をして恐怖を抑え込み、パニックに陥る人々を大声で制止した。冷静に現場を保存し、自ら進んで手がかりを探し始めた。その落ち着きが、何人かの信頼を勝ち取った。",
                            kr: "심호흡을 하여 공포를 억누르고, 공황 상태에 빠진 사람들을 큰 소리로 제지했다. 냉정하게 현장을 보존하고, 자진해서 단서를 찾기 시작했다. 그 침착함이 몇몇 사람들의 신뢰를 얻었다."
                        }
                    }],
                    options: [{ label: { zh: "開始搜查", jp: "捜査開始", kr: "수사 시작" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "退縮躲避嫌疑",
                    jp: "危険を避けて隠れる",
                    kr: "위험을 피해 숨다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_survivor"],
                    varOps: [{ key: 'tension', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你意識到自己身處嫌疑的漩渦中心，百口莫辯。你慌亂地往後退去，只想盡快離開這個是非之地。但這份退縮反而讓周遭的目光變得更加懷疑。",
                            jp: "自分が嫌疑の渦中にいることを悟り、言い逃れはできないと感じた。あなたは慌てて後ずさりし、一刻も早くこの場から逃げ出そうとした。しかしその尻込みが、周囲の疑いの目をさらに強める結果となった。",
                            kr: "자신이 혐의의 소용돌이 한가운데 있음을 깨닫고, 변명할 길이 없다고 느꼈다. 당신은 허둥지둥 뒷걸음질 치며 하루빨리 이곳을 벗어나고 싶어 했다. 하지만 그 물러섬이 도리어 주변의 의심스러운 시선을 더욱 부추겼다."
                        }
                    }],
                    options: [{ label: { zh: "陷入孤立", jp: "孤立無援", kr: "고립되다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // START-B：你被人找上門（接受委託）
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
                    zh: "一封匿名信把你帶到了這裡——{env_building}。<br>寄信人在信中寫道：「{victim}死了，而且不是意外。真兇就在這棟建築裡。」<br>{weather}，整棟建築籠罩在一片{atmosphere}的氣氛中。",
                    jp: "一通の匿名の手紙が、あなたをここ——{env_building}へと導いた。<br>差出人は手紙にこう書いていた：「{victim}は死んだ。あれは事故ではない。真犯人はこの建物の中にいる」<br>{weather}の中、建物全体が{atmosphere}雰囲気に包まれている。",
                    kr: "익명의 편지 한 통이 당신을 이곳——{env_building}으로 이끌었다.<br>발신인은 편지에 이렇게 썼다: 「{victim}이(가) 죽었어. 그리고 그건 사고가 아니야. 진범은 이 건물 안에 있어.」<br>{weather}, 건물 전체가 {atmosphere} 분위기에 휩싸여 있다."
                }
            },
            {
                text: {
                    zh: "你意識到，在警察抵達之前，你可能是唯一能夠阻止真兇逃脫的人。<br>——如果你選擇這樣做的話。",
                    jp: "警察が到着する前に、真犯人の逃亡を阻止できるのは自分しかいないかもしれない、とあなたは気づいた。<br>——もし、そうすることを選ぶなら。",
                    kr: "경찰이 도착하기 전에, 진범이 도망치는 것을 막을 수 있는 유일한 사람이 자신일지도 모른다고 당신은 깨달았다.<br>——만약, 당신이 그렇게 하기로 선택한다면."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "接下任務",
                    jp: "任務を受ける",
                    kr: "임무를 받다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_detective"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你將匿名信收好，推開了大門。既然有人委託你揭開真相，你就絕不會讓兇手輕易逃脫。你帶著自信踏入了建築內部。",
                            jp: "匿名の手紙をしまい、扉を押し開けた。誰かがあなたに真相究明を託した以上、犯人を決して逃しはしない。自信を持って建物の内部へと足を踏み入れた。",
                            kr: "익명의 편지를 잘 챙기고, 문을 밀고 들어갔다. 누군가 당신에게 진상 규명을 의뢰한 이상, 범인을 절대 쉽게 놓아주지 않을 것이다. 당신은 자신만만하게 건물 내부로 발을 내디뎠다."
                        }
                    }],
                    options: [{ label: { zh: "開始調查", jp: "調査開始", kr: "조사 시작" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "先暗中觀察",
                    jp: "密かに観察する",
                    kr: "은밀히 관찰하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_survivor"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "這封信本身可能就是一個陷阱。你決定不公開自己的目的，偽裝成無關緊要的路人，在暗中默默觀察著建築裡的每一個人。",
                            jp: "この手紙自体が罠かもしれない。自分の目的は明かさず、無関係な通行人を装い、建物内の人々を暗がりから黙って観察することにした。",
                            kr: "이 편지 자체가 함정일지도 모른다. 당신은 자신의 목적을 밝히지 않고, 상관없는 행인으로 위장하여 건물 안의 모든 사람들을 어둠 속에서 조용히 관찰하기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "靜觀其變", jp: "様子を見る", kr: "상황 주시" }, action: "advance_chain" }]
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
                    zh: "你本來只是一個路過的旁觀者。<br>但就在{weather}的這個{atmosphere}夜晚，你在{env_room}裡親眼目睹了一切。<br>{true_culprit}。{victim}的身體無力倒下。<br>而對方的眼神，在那一瞬間，與你正面交鋒。",
                    jp: "あなたはただ通りかかっただけの傍観者のはずだった。<br>しかし、{weather}のこの{atmosphere}夜、{env_room}でそのすべてを直接目撃してしまった。<br>{true_culprit}。{victim}の体が力なく崩れ落ちる。<br>そして相手の視線が、その瞬間、あなたと正面からぶつかった。",
                    kr: "당신은 원래 그저 지나가던 방관자일 뿐이었다.<br>하지만 {weather}의 이 {atmosphere} 밤, {env_room}에서 모든 것을 직접 목격하고 말았다.<br>{true_culprit}. {victim}의 몸이 힘없이 쓰러진다.<br>그리고 상대의 시선이, 그 순간 당신과 정면으로 마주쳤다."
                }
            },
            {
                text: {
                    zh: "對方知道你看見了。<br>現在你面臨選擇——",
                    jp: "相手は、あなたが見たことを知っている。<br>今、あなたは選択を迫られている——",
                    kr: "상대는 당신이 보았다는 것을 알고 있다.<br>이제 당신은 선택의 기로에 놓였다——"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "大聲呼救引人過來",
                    jp: "大声で助けを呼ぶ",
                    kr: "큰 소리로 구조 요청"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_detective", "witnessed_culprit"],
                    varOps: [{ key: 'credibility', val: 30, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有逃跑，而是用盡全力大聲呼救！喊叫聲劃破了夜空，兇手見狀不妙，只能慌忙逃入黑暗中。你的果斷行動引來了人群，也成為了破案的關鍵證人。",
                            jp: "逃げ出すことなく、ありったけの声で助けを呼んだ！その叫び声が夜空を引き裂き、犯人は分が悪いと見て慌てて闇の中へ逃げ込んだ。あなたの果断な行動が人々を集め、事件解決の重要な証人となった。",
                            kr: "도망치지 않고, 온 힘을 다해 큰 소리로 구조를 요청했다! 외침이 밤하늘을 갈랐고, 범인은 상황이 불리함을 깨닫고 황급히 어둠 속으로 도망쳤다. 당신의 과단성 있는 행동이 사람들을 모았고, 사건 해결의 결정적인 증인이 되었다."
                        }
                    }],
                    options: [{ label: { zh: "挺身而出", jp: "立ち向かう", kr: "나서서 맞서다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "裝沒看見趕快跑",
                    jp: "見なかったふりで逃げる",
                    kr: "못 본 척 도망치다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_survivor", "witnessed_culprit"],
                    varOps: [{ key: 'tension', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "恐懼瞬間攫取了你的心臟。你捂住嘴巴，猛地轉身狂奔，祈禱兇手沒有看清你的臉。但你知道，一場危險的貓鼠遊戲已經開始了。",
                            jp: "恐怖が一瞬にして心臓を鷲掴みにした。あなたは口を覆い、勢いよく振り返って全力で逃げ出し、犯人があなたの顔をはっきり見ていないことを祈った。しかし、危険な猫と鼠のゲームがすでに始まっていることを、あなたは知っている。",
                            kr: "공포가 순식간에 당신의 심장을 움켜쥐었다. 당신은 입을 틀어막고 홱 돌아서서 미친 듯이 달렸고, 범인이 당신의 얼굴을 똑똑히 보지 못했기를 기도했다. 하지만 위험한 쫓고 쫓기는 게임이 이미 시작되었음을 당신은 알고 있다."
                        }
                    }],
                    options: [{ label: { zh: "落荒而逃", jp: "命からがら逃げる", kr: "허둥지둥 달아나다" }, action: "advance_chain" }]
                }
            }
        ]
    });


    // ============================================================
    // 🔍 [MIDDLE - 偵探路線] 探索節點
    //    reqTags: ['mystery', 'route_detective']
    //    - 找到真證物 → 賦予 has_true_evidence，credibility +20
    //    - 找到假線索 → 賦予 has_fake_clue（陷阱！）
    //    - 失敗 → tension 上升（暴露度/恐慌度）
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
                    zh: "{phrase_explore_start}<br>{env_pack_visual}<br>你蹲下身，仔細審視著現場的每一個細節。<br>{murder_weapon}留下的痕跡，說明了兇手的站位。",
                    jp: "{phrase_explore_start}<br>{env_pack_visual}<br>しゃがみ込み、現場のあらゆる細部を丹念に観察する。<br>{murder_weapon}が残した痕跡が、犯人の立ち位置を物語っている。",
                    kr: "{phrase_explore_start}<br>{env_pack_visual}<br>몸을 숙이고, 현장의 모든 세부 사항을 주의 깊게 살핀다.<br>{murder_weapon}이(가) 남긴 흔적이 범인의 서 있던 위치를 말해주고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "戴手套逐寸勘查",
                    jp: "手袋で一寸ずつ調べる",
                    kr: "장갑 끼고 꼼꼼히 조사"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next",
                rewards: {
                    tags: ["searched_scene", "has_true_evidence"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }],
                    exp: 20
                },
                onFail: {
                    varOps: [{ key: 'tension', val: 10, op: '+' }],
                    text: {
                        zh: "你沒發現什麼有用的東西，反而在翻找時不小心破壞了部分血跡。周圍的人看你的眼神變得更加不信任了。",
                        jp: "有用なものは何も見つからず、かえって探し回るうちに血痕の一部を荒らしてしまった。周囲のあなたを見る目がさらに不信感を帯びた。",
                        kr: "유용한 것은 찾지 못했고, 오히려 뒤적거리다 핏자국 일부를 훼손하고 말았다. 주변 사람들의 당신을 보는 눈빛이 더욱 불신으로 가득 찼다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你戴上手套，不放過任何一個角落。終於，你在角落的縫隙中找到了一個關鍵細節：{combo_item_desc}。<br>這能直接證明兇手的身份，是一份無可辯駁的鐵證。",
                            jp: "手袋をはめ、隅々まで見落とすことなく調べた。ついに、隅の隙間から決定的な手がかりを見つけた：{combo_item_desc}。<br>これは犯人の身元を直接証明できる、反論の余地がない鉄壁の証拠だ。",
                            kr: "장갑을 끼고 구석구석 하나도 놓치지 않고 살폈다. 마침내 구석의 틈새에서 결정적인 세부 사항을 찾아냈다: {combo_item_desc}.<br>이것은 범인의 정체를 직접적으로 증명할 수 있는 반박 불가한 철통같은 증거다."
                        }
                    }],
                    options: [{ label: { zh: "獲得鐵證", jp: "鉄壁の証拠を入手", kr: "결정적 증거 확보" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "快速掃視現場",
                    jp: "素早く見回す",
                    kr: "빠르게 현장 훑어보기"
                },
                action: "node_next",
                rewards: {
                    tags: ["searched_scene", "has_fake_clue"],
                    varOps: [{ key: 'tension', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "為了不引起太多注意，你只敢快速掃視現場。你撿起了一個看似可疑的物品，卻沒發現那其實是真兇刻意留下的誤導線索。",
                            jp: "あまり目立たないよう、現場を素早く見回すにとどめた。怪しげな品を拾い上げたが、それが真犯人の意図的なミスリードの手がかりであることには気づかなかった。",
                            kr: "너무 이목을 끌지 않기 위해 현장을 빠르게 훑어보기만 했다. 의심스러워 보이는 물건을 주웠지만, 그것이 진범이 의도적으로 남긴 교란용 단서라는 사실은 눈치채지 못했다."
                        }
                    }],
                    options: [{ label: { zh: "落入陷阱", jp: "罠にはまる", kr: "함정에 빠지다" }, action: "advance_chain" }]
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
                    zh: "你找到了{suspect_A}，對方的神情{state_modifier}。<br>「我什麼都不知道，」{suspect_A}說，「你最好別管這件事。」<br>但對方的眼神出賣了他。",
                    jp: "{suspect_A}を見つけた。相手の表情は{state_modifier}。<br>「何も知らない」と{suspect_A}は言った。「あんたも首を突っ込まない方がいい」<br>しかし、その目は嘘をついている。",
                    kr: "{suspect_A}을(를) 찾았다. 상대의 표정은 {state_modifier}.<br>「난 아무것도 몰라.」 {suspect_A}이(가) 말했다. 「너도 이 일에 신경 끄는 게 좋을 거야.」<br>하지만 상대의 눈빛은 거짓말을 하고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "眼神施壓逼問",
                    jp: "視線で圧力をかけ問い詰める",
                    kr: "눈빛으로 압박하며 추궁하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["interrogated_witness", "has_testimony"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 15
                },
                onFail: {
                    varOps: [{ key: 'tension', val: 10, op: '+' }],
                    text: {
                        zh: "你的強硬態度激怒了對方。{suspect_A}大聲呼喊，引來了其他人，讓你反而陷入了被懷疑的境地。",
                        jp: "あなたの強硬な態度が相手を激怒させた。{suspect_A}が大声を上げたことで人が集まり、かえってあなたが疑われる羽目になった。",
                        kr: "당신의 강경한 태도가 상대를 화나게 했다. {suspect_A}이(가) 큰 소리를 쳐 사람들을 불러 모았고, 오히려 당신이 의심받는 처지가 되었다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你往前逼近一步，不退讓的銳利眼神死死鎖住對方。在強大的心理壓力下，{suspect_A}終於鬆口，透露了一個你之前不知道的案發細節。",
                            jp: "一歩前に踏み出し、決して引かない鋭い視線で相手を射抜いた。強大な心理的圧力に耐えかね、{suspect_A}はついに口を割り、あなたの知らない事件の細部を漏らした。",
                            kr: "한 걸음 앞으로 다가가, 물러서지 않는 날카로운 눈빛으로 상대를 옭아맸다. 엄청난 심리적 압박감에 결국 {suspect_A}은(는) 입을 열었고, 당신이 몰랐던 사건의 세부 사항을 털어놓았다."
                        }
                    }],
                    options: [{ label: { zh: "獲得證詞", jp: "証言を獲得", kr: "증언 확보" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "放鬆語氣套話",
                    jp: "力を抜いた声で探りを入れる",
                    kr: "힘 뺀 목소리로 떠보다"
                },
                check: { stat: 'LUK', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["interrogated_witness"],
                    varOps: [{ key: 'credibility', val: 10, op: '+' }],
                    exp: 10
                },
                onFail: {
                    text: {
                        zh: "你想套話，但對方嘴巴很緊，幾句客套話就把你打發了。",
                        jp: "探りを入れたが相手の口は堅く、適当な相槌で追い払われてしまった。",
                        kr: "떠보려 했지만 상대의 입이 무거웠고, 몇 마디 입에 발린 소리로 당신을 돌려보냈다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你換了個舒適的坐姿，語氣變得隨意而放鬆。對方的警戒心稍稍降低，不經意間說了幾句含糊的話。雖然不是直接證據，但也許會有用。",
                            jp: "リラックスした姿勢に座り直し、気さくな口調で話しかけた。相手の警戒心が少し解け、不意に曖昧な言葉をいくつか漏らした。直接の証拠ではないが、役に立つかもしれない。",
                            kr: "편안한 자세로 고쳐 앉고, 말투를 가볍고 편안하게 바꿨다. 상대의 경계심이 조금 누그러졌고, 무심코 모호한 말 몇 마디를 흘렸다. 직접적인 증거는 아니지만, 유용할지도 모른다."
                        }
                    }],
                    options: [{ label: { zh: "獲得線索", jp: "手がかりを得る", kr: "단서 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "去找別的線索",
                    jp: "別の手がかりを探す",
                    kr: "다른 단서를 찾다"
                },
                action: "node_next",
                rewards: {
                    tags: ["interrogated_witness"],
                    varOps: [{ key: 'tension', val: 3, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "看來從他嘴裡問不出什麼了。你決定不浪費時間，轉身離開去尋找其他的突破口。",
                            jp: "彼からは何も聞き出せそうにない。時間を無駄にせず、立ち去って別の突破口を探すことにした。",
                            kr: "그의 입에서는 아무것도 알아낼 수 없을 것 같다. 시간을 낭비하지 않기로 하고, 몸을 돌려 다른 돌파구를 찾으러 떠났다."
                        }
                    }],
                    options: [{ label: { zh: "另尋他路", jp: "他を探す", kr: "다른 길 찾기" }, action: "advance_chain" }]
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
                    zh: "{env_pack_sensory}<br>{phrase_find_action}<br>牆壁上有一個幾乎看不出來的暗門。<br>這裡...是{true_culprit}的私人空間。",
                    jp: "{env_pack_sensory}<br>{phrase_find_action}<br>壁にほとんど見えない隠し扉がある。<br>ここは…{true_culprit}のプライベート空間だ。",
                    kr: "{env_pack_sensory}<br>{phrase_find_action}<br>벽에 거의 보이지 않는 비밀 문이 있다.<br>이곳은... {true_culprit}의 개인 공간이다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "冒險潛入搜查",
                    jp: "危険を冒して潜入調査",
                    kr: "위험을 감수하고 잠입 조사"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_secret_room", "has_true_evidence"],
                    varOps: [
                        { key: 'credibility', val: 25, op: '+' },
                        { key: 'tension',     val: 15, op: '+' }
                    ],
                    exp: 25
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你冒著隨時可能被撞見的極大風險潛入了暗門。在裡面，你找到了決定性的物證，這大幅提升了你的公信力，但也讓你的行蹤更加危險。",
                            jp: "いつでも見つかるかもしれないという多大なリスクを冒し、隠し扉に潜入した。その中で決定的な物証を見つけ、あなたの発言力は大幅に上がったが、同時に危険度も増した。",
                            kr: "언제 들킬지 모르는 큰 위험을 무릅쓰고 비밀 문으로 잠입했다. 그 안에서 결정적인 물증을 찾아내 당신의 공신력이 크게 높아졌지만, 행적은 더욱 위험해졌다."
                        }
                    }],
                    options: [{ label: { zh: "滿載而歸", jp: "収穫あり", kr: "큰 수확" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "記下位置先不驚動",
                    jp: "位置を記録し今は入らない",
                    kr: "위치를 기록하고 일단 물러나다"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_secret_room"],
                    varOps: [{ key: 'credibility', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "現在進去太危險了。你悄悄記下了暗門的位置與開啟方式，將這個秘密作為日後談判或搜查的籌碼。",
                            jp: "今入るのは危険すぎる。隠し扉の位置と開け方を密かに記憶し、この秘密を後日の交渉や捜査の切り札として残しておくことにした。",
                            kr: "지금 들어가는 건 너무 위험하다. 비밀 문의 위치와 여는 방법을 몰래 기억해 두고, 이 비밀을 나중에 협상이나 수사의 카드로 쓰기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "留下籌碼", jp: "切り札を残す", kr: "히든카드 남기기" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-偵探-D：箱庭探索，在房間內多次搜查道具
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
                    zh: "你來到了{env_room}。{env_pack_visual}<br>這裡有幾個值得調查的地方——但時間不多，你只能仔細搜查有限的幾處。",
                    jp: "{env_room}に来た。{env_pack_visual}<br>ここには調べるべき場所がいくつかある——だが時間はない。綿密に調べられる箇所は限られている。",
                    kr: "{env_room}에 왔다. {env_pack_visual}<br>이곳에는 조사할 만한 곳이 몇 군데 있다——하지만 시간이 없다. 꼼꼼히 조사할 수 있는 곳은 몇 군데뿐이다."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "時間一分一秒流逝，你還要繼續搜查哪裡？",
                    jp: "刻一刻と時間が過ぎていく。次はどこを調べる？",
                    kr: "시간이 1분 1초 흐르고 있다. 다음은 어디를 조사할까?"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "搜查隱蔽角落",
                    jp: "隠れた隅を調べる",
                    kr: "숨겨진 구석을 조사하다"
                },
                action: "node_next",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [{ key: 'search_count', val: 1, op: '-' }],
                    tags: ['searched_corner']
                },
                nextScene: {
                    dialogue: [{
                        text: { 
                            zh: "你翻找了角落的{env_feature}，幸運地發現了{combo_item_desc}。",
                            jp: "部屋の隅にある{env_feature}を探り、運よく{combo_item_desc}を見つけた。",
                            kr: "구석에 있는 {env_feature}을(를) 뒤져 운 좋게 {combo_item_desc}을(를) 발견했다."
                        }
                    }],
                    options: [
                        {
                            label: { zh: "可能是關鍵，收進口袋", jp: "重要かもしれない。ポケットへ", kr: "중요할지도. 주머니에 넣다" },
                            action: "map_return_hub", // 👈 返回 HUB
                            rewards: {
                                tags: ['has_item_clue'],
                                varOps: [{ key: 'credibility', val: 10, op: '+' }]
                            }
                        },
                        { label: { zh: "不重要，繼續搜", jp: "重要ではない。他を探す", kr: "중요하지 않아. 계속 조사" }, action: "map_return_hub" }
                    ]
                }
            },
            {
                label: {
                    zh: "翻閱散落的文件",
                    jp: "散乱した書類に目を通す",
                    kr: "어질러진 서류를 훑어보다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
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
                onFail: {
                    varOps: [{ key: 'search_count', val: 1, op: '-' }],
                    text: {
                        zh: "文件裡全是無意義的帳單，你白白浪費了寶貴的搜查時間。",
                        jp: "書類は無意味な請求書ばかりで、貴重な捜査時間を無駄にしてしまった。",
                        kr: "서류는 무의미한 청구서뿐이었고, 귀중한 수사 시간만 허비하고 말았다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你快速掃視文件夾，從中抽出了一張夾在中間的便條。上面的字跡和{murder_weapon}上留下的指紋細節完全吻合。這是一項鐵證。",
                            jp: "ファイルを素早く見渡し、間に挟まっていたメモを抜き出した。そこに書かれた筆跡と、{murder_weapon}に残された指紋の細部が完全に一致した。これは鉄壁の証拠だ。",
                            kr: "파일을 빠르게 훑어보고, 그 사이에 끼어 있던 메모를 빼냈다. 그곳에 적힌 필적과 {murder_weapon}에 남겨진 지문의 세부 사항이 완벽하게 일치했다. 이것은 철통같은 증거다."
                        }
                    }],
                    options: [{ label: { zh: "取得文件鐵證", jp: "文書の証拠を獲得", kr: "서류 증거 확보" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "🚪 離開這個房間",
                    jp: "🚪 この部屋を出る",
                    kr: "🚪 이 방을 떠나다"
                },
                action: "advance_chain" // 👈 離開 HUB，推進主線
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
                    zh: "{suspect_B}一個人縮在{env_feature}旁，神情{state_modifier}。<br>看起來對方已經快要崩潰了。",
                    jp: "{suspect_B}は一人で{env_feature}のそばにうずくまっている。表情は{state_modifier}。<br>今にも精神が崩壊しそうに見える。",
                    kr: "{suspect_B}은(는) 혼자 {env_feature} 곁에 웅크리고 있다. 표정은 {state_modifier}.<br>보아하니 금방이라도 무너져 내릴 것 같다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "安撫對方建立信任",
                    jp: "なだめて信頼を築く",
                    kr: "달래주며 신뢰를 쌓다"
                },
                action: "node_next",
                rewards: {
                    tags: ["helped_npc", "npc_trust"],
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 10
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你遞了一杯水過去，用溫和而堅定的語氣安撫了對方的恐慌。{suspect_B}情緒穩定下來後，對你充滿了感激，這大大提升了你在眾人面前的公信力。",
                            jp: "水を差し出し、穏やかで力強い言葉で相手のパニックをなだめた。{suspect_B}は落ち着きを取り戻すと、あなたに深い感謝の念を抱き、人々の前でのあなたの発言力は大きく高まった。",
                            kr: "물 한 잔을 건네며, 부드럽고 단호한 어조로 상대의 공황을 달래주었다. {suspect_B}은(는) 안정을 되찾은 후 당신에게 큰 감사를 느꼈고, 이는 사람들 앞에서의 당신의 공신력을 크게 높여주었다."
                        }
                    }],
                    options: [{ label: { zh: "建立威望", jp: "威信を高める", kr: "위상 강화" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "直接問有沒有看到線索",
                    jp: "直接聞く。何か見たか",
                    kr: "단서를 본 게 없는지 바로 묻다"
                },
                action: "node_next",
                rewards: {
                    tags: ["helped_npc"],
                    varOps: [{ key: 'credibility', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有多說廢話，直切主題詢問對方有沒有看到什麼。雖然對方被你稍微嚇到，但還是結結巴巴地吐出了一點有用的情報。",
                            jp: "余計な言葉はかけず、単刀直入に何か見ていないか尋ねた。相手は少し怯えていたが、それでもどもりながら有益な情報を少しだけ口にした。",
                            kr: "쓸데없는 말은 생략하고, 단도직입적으로 무언가 본 게 없는지 물었다. 상대는 조금 겁먹었지만, 그래도 더듬거리며 유용한 정보를 조금 털어놓았다."
                        }
                    }],
                    options: [{ label: { zh: "取得少許情報", jp: "少しの情報を得る", kr: "약간의 정보 획득" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ============================================================
    // 🏃 [MIDDLE - 生存路線] 躲避與目擊
    //    reqTags: ['mystery', 'route_survivor']
    //    設計原則：
    //      - 失敗讓 tension 大幅上升（恐慌度/暴露度）
    //      - 某些選擇可以切換回偵探路線 (route_detective)
    // ============================================================

    // MIDDLE-生存-A：躲進隱蔽處
    DB.templates.push({
        id: 'mys_mid_sur_hide',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_warn}<br>你的第一反應是找個地方躲起來。<br>{survivor_hiding}",
                    jp: "{phrase_danger_warn}<br>最初の反応は、どこか隠れられる場所を探すことだった。<br>{survivor_hiding}",
                    kr: "{phrase_danger_warn}<br>당신의 첫 반응은 숨을 곳을 찾는 것이었다.<br>{survivor_hiding}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "石化般靜止",
                    jp: "石のように静止する",
                    kr: "돌처럼 굳어버리다"
                },
                check: { stat: 'AGI', val: 4 },
                action: "node_next",
                rewards: { exp: 10 },
                onFail: {
                    varOps: [{ key: 'tension', val: 20, op: '+' }],
                    text: {
                        zh: "因為太過緊張，你不小心碰翻了旁邊的雜物，發出了清脆的聲響。<br>原本逐漸遠去的腳步聲，瞬間停了下來...",
                        jp: "極度の緊張から、誤ってそばにあった物を倒し、高い音を立ててしまった。<br>遠ざかりつつあった足音が、一瞬にしてピタリと止まった…",
                        kr: "너무 긴장한 나머지 실수로 옆에 있던 물건을 건드려 날카로운 소리를 내고 말았다.<br>멀어지던 발소리가 순식간에 뚝 끊겼다..."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你屏住呼吸，將身體蜷縮到極致，宛如一座石雕般靜止不動。<br>那沉重的腳步聲在附近徘徊了片刻後，終於漸漸遠去。你暫時安全了。",
                            jp: "息を殺し、極限まで体を丸め、まるで石像のように微動だにしなかった。<br>その重い足音は近くをしばらくうろついていたが、やがて遠ざかっていった。ひとまず安全だ。",
                            kr: "숨을 참고 몸을 극한까지 웅크린 채, 마치 돌조각처럼 미동도 하지 않았다.<br>무거운 발소리가 근처를 잠시 맴돌다가 마침내 점점 멀어졌다. 일단은 안전하다."
                        }
                    }],
                    options: [{ label: { zh: "暫鬆一口氣", jp: "一息つく", kr: "한숨 돌리다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "悄悄移到更安全處",
                    jp: "より安全な場所へ移る",
                    kr: "더 안전한 곳으로 이동하다"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'tension', val: 8, op: '+' }] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "這裡的掩體太過單薄。你趁著腳步聲還沒靠近，躡手腳地轉移到了另一個更深的暗角。<br>雖然避免了直接被發現，但不斷移動也讓你的暴露風險持續累積。",
                            jp: "ここの隠れ場所は心許ない。足音が近づく前に、足音を忍ばせてさらに奥の暗がりへと移動した。<br>直接見つかることは避けたが、移動を繰り返すことで露見するリスクも蓄積されていく。",
                            kr: "이곳의 엄폐물은 너무 부실하다. 발소리가 가까워지기 전에 발소리를 죽여 더 깊은 구석으로 이동했다.<br>직접 발각되는 것은 피했지만, 계속 이동하면서 노출될 위험도 쌓이고 있다."
                        }
                    }],
                    options: [{ label: { zh: "轉移陣地", jp: "身を隠す", kr: "진지 이동" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-生存-B：差點被發現
    DB.templates.push({
        id: 'mys_mid_sur_close_call',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_appear}<br>{true_culprit}就站在你藏身處不遠的地方，{verb_equip}著某樣東西，四下張望。<br>{survivor_hiding}",
                    jp: "{phrase_danger_appear}<br>{true_culprit}はあなたの隠れ場所のすぐ近くに立ち、何かを{verb_equip}しながら辺りを見回している。<br>{survivor_hiding}",
                    kr: "{phrase_danger_appear}<br>{true_culprit}은(는) 당신이 숨은 곳에서 멀지 않은 곳에 서서 무언가를 {verb_equip} 채 주위를 두리번거리고 있다.<br>{survivor_hiding}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "把存在感抹掉",
                    jp: "気配を完全に消す",
                    kr: "존재감을 지워버리다"
                },
                check: { stat: 'LUK', val: 5 },
                action: "node_next",
                rewards: { exp: 15 },
                onFail: {
                    varOps: [{ key: 'tension', val: 30, op: '+' }],
                    text: {
                        zh: "儘管你極力隱藏，但{true_culprit}的眼神還是精準地掃過了你藏身的方向，並停頓了一秒鐘。<br>你背脊發涼。你感覺到對方已經知道你在這裡了...",
                        jp: "必死に隠れたが、{true_culprit}の視線はあなたの隠れ場所を正確に捉え、一秒間立ち止まった。<br>背筋が凍る。相手はすでに、あなたがここにいると気づいている…",
                        kr: "필사적으로 숨었지만, {true_culprit}의 시선은 당신이 숨은 방향을 정확히 훑고 지나가며 1초간 멈칫했다.<br>등골이 서늘해진다. 상대가 당신이 여기 있다는 걸 이미 알고 있다고 느껴진다..."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你死死閉上雙眼，甚至不敢看對方的倒影，將自己的存在感縮小到了極限。<br>奇蹟般地，{true_culprit}的視線掃過了你的位置卻沒有停留，隨後緩緩離開了。你終於敢大口喘氣。",
                            jp: "目を固く閉じ、相手の影を見ることすら恐れ、自分の気配を極限まで消した。<br>奇跡的に、{true_culprit}の視線はあなたの場所をかすめたが留まらず、やがてゆっくりと立ち去った。ついに大きく息を吐くことができた。",
                            kr: "두 눈을 질끈 감고, 상대의 그림자조차 쳐다볼 엄두를 내지 못한 채 자신의 존재감을 극한으로 줄였다.<br>기적적으로 {true_culprit}의 시선이 당신이 있는 곳을 훑었지만 머물지 않았고, 이내 천천히 떠났다. 그제야 숨을 몰아쉴 수 있었다."
                        }
                    }],
                    options: [{ label: { zh: "死裡逃生", jp: "九死に一生", kr: "구사일생" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "趁不注意溜走",
                    jp: "隙を見て逃げ出す",
                    kr: "빈틈을 타 빠져나가다"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'tension', val: 12, op: '+' }] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你不敢把命運交給運氣。趁著{true_culprit}轉身檢視其他地方的空檔，你以最快的速度溜出了房間。<br>雖然成功拉開了距離，但急促的逃亡讓你的恐慌感直線上升。",
                            jp: "運に運命を委ねる勇気はなかった。{true_culprit}が別の場所を調べている隙に、全速力で部屋を抜け出した。<br>距離を取ることはできたが、急な逃亡によりパニックは急上昇した。",
                            kr: "운에 운명을 맡길 엄두가 나지 않았다. {true_culprit}이(가) 다른 곳을 확인하러 돌아선 틈을 타, 가장 빠른 속도로 방을 빠져나왔다.<br>거리를 벌리는 데는 성공했지만, 황급한 도주로 인해 공황감이 수직 상승했다."
                        }
                    }],
                    options: [{ label: { zh: "驚恐奔逃", jp: "恐怖の逃走", kr: "공포의 도주" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-生存-C：旁觀偵探的行動
    DB.templates.push({
        id: 'mys_mid_sur_witness_detective',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{survivor_witness}<br>{env_pack_sensory}<br>你有一個選擇：繼續躲著，或者出去幫一把。",
                    jp: "{survivor_witness}<br>{env_pack_sensory}<br>あなたには選択肢がある：このまま隠れ続けるか、それとも出ていって助け舟を出すか。",
                    kr: "{survivor_witness}<br>{env_pack_sensory}<br>당신에게는 선택지가 있다: 계속 숨어있을 것인가, 아니면 나가서 도와줄 것인가."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "繼續躲，這不關我事",
                    jp: "隠れ続ける。関係ない",
                    kr: "계속 숨어. 내 일 아니야"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'tension', val: 5, op: '+' }] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你默默地看著這一切，決定把嘴巴閉緊。這座建築裡的事太過複雜，你只想當一個活下來的透明人。<br>你的沉默保全了自己，但也讓你感到了一絲罪惡感。",
                            jp: "黙ってそのすべてを見つめ、口を閉ざすことに決めた。この建物の出来事は複雑すぎる。あなたはただ生きて帰る透明人間になりたいだけだ。<br>その沈黙は身の安全を保障したが、同時にわずかな罪悪感も生んだ。",
                            kr: "당신은 이 모든 것을 묵묵히 지켜보며 입을 다물기로 했다. 이 건물 안의 일은 너무 복잡하고, 당신은 그저 살아남는 투명인간이 되고 싶을 뿐이다.<br>그 침묵은 안전을 지켜주었지만, 동시에 약간의 죄책감도 안겨주었다."
                        }
                    }],
                    options: [{ label: { zh: "明哲保身", jp: "保身", kr: "일신 보전" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "挺身幫忙（轉為偵探）",
                    jp: "出て助ける（探偵に転向）",
                    kr: "나서서 돕다 (탐정으로 전환)"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_detective", "survivor_helped"], // 🌟 路線轉換
                    varOps: [
                        { key: 'tension',     val: 15, op: '+' },
                        { key: 'credibility', val: 20, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "正義感最終戰勝了恐懼。你從暗處走了出來，提供了你所知道的情報。<br>你的出現雖然暴露了行蹤（暴露度大增），但也讓其他調查者對你刮目相看（獲得公信度）。從現在起，你不再只是個逃亡者了。",
                            jp: "最後は正義感が恐怖に打ち勝った。あなたは暗がりから歩み出て、知っている情報を提供した。<br>姿を現したことで行方はバレてしまったが（暴露度大増）、他の調査者たちはあなたを見直した（公信力獲得）。今から、あなたはもう単なる逃亡者ではない。",
                            kr: "결국 정의감이 공포를 이겨냈다. 어둠 속에서 걸어 나와, 당신이 아는 정보를 제공했다.<br>나타남으로써 행적은 노출되었지만(노출도 크게 증가), 다른 조사자들은 당신을 다시 보게 되었다(공신력 획득). 이제부터 당신은 더 이상 단순한 도망자가 아니다."
                        }
                    }],
                    options: [{ label: { zh: "挺身而出", jp: "名乗り出る", kr: "나서다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-生存-D：高暴露度觸發（兇手主動追殺）
    DB.templates.push({
        id: 'mys_mid_sur_hunted',
        type: 'middle',
        reqTags: ['mystery', 'route_survivor', 'risk_high'], // 高 tension 時觸發
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_warn}<br>已經沒有時間猶豫了。{true_culprit}知道你在這裡。<br>{horror_chase_start}",
                    jp: "{phrase_danger_warn}<br>もうためらっている時間はない。{true_culprit}はあなたがここにいると気づいている。<br>{horror_chase_start}",
                    kr: "{phrase_danger_warn}<br>더 이상 망설일 시간이 없다. {true_culprit}은(는) 당신이 여기 있다는 걸 안다.<br>{horror_chase_start}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "全速衝出去躲避",
                    jp: "全速で飛び出し回避する",
                    kr: "전속력으로 뛰어나가 피하다"
                },
                check: { stat: 'AGI', val: 6 },
                action: "node_next",
                rewards: {
                    tags: ["survived_chase"],
                    varOps: [{ key: 'tension', val: -20, op: '+' }],
                    exp: 30
                },
                onFail: {
                    varOps: [{ key: 'tension', val: 35, op: '+' }],
                    text: {
                        zh: "你試圖逃跑，但速度不夠快。一隻冰冷的手死死抓住了你的手腕。<br>「你看到了，對吧...」對方陰沉地說道。",
                        jp: "逃げようとしたが、スピードが足りなかった。冷たい手があなたの手首を力強く掴んだ。<br>「見たんだろ…？」相手は陰惨な声でそう言った。",
                        kr: "도망치려 했지만 속도가 부족했다. 차가운 손이 당신의 손목을 꽉 움켜쥐었다.<br>「너 다 봤지...」 상대가 음침하게 말했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你腳跟一蹬，像離弦的箭一般全速衝入錯綜複雜的走廊！<br>利用環境的死角，你驚險地甩開了對方的追蹤，藏進了一個更安全的角落。追擊暫時中止了。",
                            jp: "踵で床を蹴り、放たれた矢のように入り組んだ廊下へ全速で飛び出した！<br>環境の死角を利用し、間一髪で追跡を振り切り、より安全な隅へ身を潜めた。追跡は一時的に途絶えた。",
                            kr: "뒤꿈치로 바닥을 벅차고 시위를 떠난 화살처럼 복잡한 복도로 전속력으로 뛰어들었다!<br>지형의 사각지대를 이용해 아슬아슬하게 추적을 따돌리고, 더 안전한 구석에 숨었다. 추격은 일시적으로 중단되었다."
                        }
                    }],
                    options: [{ label: { zh: "暫時脫險", jp: "一時脱出", kr: "일시적 위기 모면" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "大聲呼救（轉為偵探）",
                    jp: "大声で叫ぶ（探偵に転向）",
                    kr: "큰 소리로 외치다 (탐정으로 전환)"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_detective", "blew_cover"], // 🌟 路線轉換
                    varOps: [
                        { key: 'tension',     val: 10, op: '+' },
                        { key: 'credibility', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你自知跑不過對方，索性用盡全力大喊救命！<br>呼喊聲驚動了建築內的所有人。雖然你徹底暴露了自己（掩護被破壞），但也成功嚇退了兇手。現在，你必須帶領群眾找出真相了。",
                            jp: "逃げ切れないと悟り、いっそありったけの声で助けを呼んだ！<br>その叫び声は建物内の全員を驚かせた。完全に身を晒すことになったが（隠密状態崩壊）、犯人を退かせることには成功した。さあ、今度はあなたが群衆を率いて真相を見つける番だ。",
                            kr: "도망칠 수 없음을 깨닫고, 아예 온 힘을 다해 사람 살려달라고 외쳤다!<br>외침은 건물 안의 모든 사람들을 놀라게 했다. 자신을 완전히 노출시켰지만(위장 파괴), 범인을 겁먹고 물러나게 하는 데는 성공했다. 이제 당신이 사람들을 이끌고 진실을 찾아야 한다."
                        }
                    }],
                    options: [{ label: { zh: "破釜沉舟", jp: "背水の陣", kr: "배수진" }, action: "advance_chain" }]
                }
            }
        ]
    });


// ============================================================
    // 🌐 [MIDDLE - 懸疑通用節點] 不區分路線，任何 mystery 劇本都能觸發
    //    reqTags: ['mystery']
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
                    zh: "{sentence_event_sudden}<br>{env_pack_sensory}<br>所有人都停下來了。",
                    jp: "{sentence_event_sudden}<br>{env_pack_sensory}<br>誰もが動きを止めた。",
                    kr: "{sentence_event_sudden}<br>{env_pack_sensory}<br>모두가 동작을 멈췄다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "閉眼用耳朵定位",
                    jp: "目を閉じ耳で位置を特定",
                    kr: "눈 감고 귀로 위치 파악"
                },
                check: { stat: 'INT', val: 3 },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'credibility', val: 5, op: '+' }]
                },
                onFail: {
                    text: {
                        zh: "現場的雜音太多，你的心跳聲蓋過了一切。你無法分辨聲音的來源，反而讓自己變得更加焦慮。",
                        jp: "現場の雑音があまりにも多く、自分の心音がすべてを掻き消してしまった。音の出処が分からず、焦りだけが募った。",
                        kr: "현장의 잡음이 너무 많아 당신의 심장 박동 소리가 모든 것을 덮어버렸다. 소리의 근원지를 파악하지 못하고 오히려 불안감만 커졌다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你閉上眼睛，過濾掉人群的慌亂，專注於聽覺。你精準地判斷出聲音來自{env_room}的方向。這說明了某個人剛剛離開了那裡。",
                            jp: "目を閉じ、人々の慌てふためく音を遮断して聴覚に集中した。音が{env_room}の方向から聞こえたことを正確に判断した。それは、誰かがたった今そこを立ち去ったことを意味している。",
                            kr: "눈을 감고 사람들의 혼란스러운 소리를 걸러낸 뒤 청각에 집중했다. 소리가 {env_room} 방향에서 났다는 것을 정확히 파악해 냈다. 이는 누군가 방금 그곳을 떠났음을 의미한다."
                        }
                    }],
                    options: [{ label: { zh: "鎖定方位", jp: "位置特定", kr: "위치 확보" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "順著人群行動",
                    jp: "群衆の動きに合わせる",
                    kr: "사람들을 따라 행동"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'tension', val: 5, op: '+' }] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你不想在這種詭異的情況下顯得太突兀，於是混入人群中隨波逐流。雖然安全，但恐慌的氣氛也無可避免地傳染給了你。",
                            jp: "このような不気味な状況で悪目立ちしたくなかったあなたは、群衆に紛れて行動を共にした。安全ではあるが、パニックの空気はどうしてもあなたにも伝染してしまった。",
                            kr: "이런 기괴한 상황에서 너무 튀고 싶지 않아, 무리 속에 섞여 사람들을 따라갔다. 안전하긴 했지만, 공황의 분위기 역시 피할 수 없이 당신에게 전염되었다."
                        }
                    }],
                    options: [{ label: { zh: "隨波逐流", jp: "流れに身を任せる", kr: "흐름에 묻어가기" }, action: "advance_chain" }]
                }
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
                    zh: "{phrase_find_action}<br>竟然找到了{combo_item_desc}<br>這是...線索？還是有人故意放在這裡的？",
                    jp: "{phrase_find_action}<br>なんと{combo_item_desc}を見つけた。<br>これは…手がかりか？それとも誰かがわざとここに置いたものか？",
                    kr: "{phrase_find_action}<br>놀랍게도 {combo_item_desc}을(를) 찾아냈다.<br>이건... 단서일까? 아니면 누군가 일부러 여기에 둔 것일까?"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "收起以後再判斷",
                    jp: "しまい、後で判断する",
                    kr: "챙긴 후 나중에 판단"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_fake_clue", "has_fake_clue"], // 🌟 假線索入袋
                    varOps: [{ key: 'credibility', val: 3, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒想太多，將物品收進了口袋。你以為自己找到了一片拼圖，卻不知道這反而會將你的推理引向完全錯誤的方向。",
                            jp: "深く考えず、その品をポケットにしまった。パズルのピースを見つけたつもりでいるが、それが自分の推理を全く間違った方向へ導くことになるとは知る由もない。",
                            kr: "별생각 없이 그 물건을 주머니에 챙겼다. 퍼즐 조각을 찾았다고 생각했지만, 이것이 당신의 추리를 완전히 잘못된 방향으로 이끌게 될 줄은 꿈에도 몰랐다."
                        }
                    }],
                    options: [{ label: { zh: "被誤導", jp: "ミスリード", kr: "잘못된 길로" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "停手，擺得太刻意了",
                    jp: "手を止める。不自然だ",
                    kr: "멈추다. 너무 작위적이야"
                },
                check: { stat: 'INT', val: 6 },
                action: "node_next",
                rewards: {
                    tags: ["found_fake_clue"],
                    varOps: [{ key: 'credibility', val: 10, op: '+' }]
                },
                onFail: {
                    text: {
                        zh: "你想看出破綻，但物品上的血跡與周遭環境實在太過相符，讓你無法斷定真偽。你猶豫了很久，最終還是什麼都沒做。",
                        jp: "矛盾を見抜こうとしたが、品物の血痕や周囲の状況があまりにも符合しすぎており、真偽を断定できなかった。長くためらった末、結局何もしなかった。",
                        kr: "허점을 찾아내려 했지만, 물건에 묻은 혈흔과 주변 환경이 너무도 일치하여 진위를 단정 지을 수 없었다. 오랫동안 망설인 끝에, 결국 아무것도 하지 못했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你的手停在半空中。太乾淨了。這個位置、這個角度，簡直就像是特地擺好等著別人發現一樣。你的直覺是對的，這是用來誤導你的假線索。",
                            jp: "空中で手を止めた。不自然すぎる。この位置、この角度、まるで誰かに見つけられるのを待っているかのようだ。あなたの直感は正しかった。これはミスリードのための偽の手がかりだ。",
                            kr: "공중에서 손을 멈췄다. 너무 부자연스럽다. 이 위치, 이 각도, 마치 누군가 발견해 주기를 기다리며 세팅해 둔 것만 같다. 당신의 직감이 맞았다. 이건 당신을 교란하기 위한 가짜 단서다."
                        }
                    }],
                    options: [{ label: { zh: "識破陷阱", jp: "罠を見破る", kr: "함정 간파" }, action: "advance_chain" }]
                }
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
                    zh: "{suspect_A}與{suspect_B}在{env_room}裡爆發了激烈的爭執。<br>「是你幹的！你一直想要那份遺產！」<br>「你才是兇手！別以為大家不知道你在幹什麼！」",
                    jp: "{suspect_A}と{suspect_B}が{env_room}で激しい口論を繰り広げている。<br>「お前がやったんだろ！ずっとあの遺産を狙っていたじゃないか！」<br>「お前こそ犯人だ！自分が何をしているか、皆が知らないとでも思っているのか！」",
                    kr: "{suspect_A}와(과) {suspect_B}이(가) {env_room}에서 격렬한 말다툼을 벌이고 있다.<br>「네가 한 짓이잖아! 넌 항상 그 유산을 노렸어!」<br>「너야말로 살인자야! 네가 무슨 짓을 하고 다니는지 사람들이 모를 줄 알아!」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "介入並壓制聲音",
                    jp: "間に割り込み声で制圧",
                    kr: "끼어들어 목소리로 제압"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'credibility', val: 15, op: '+' }],
                    exp: 15
                },
                onFail: {
                    text: {
                        zh: "你試圖勸架，但兩人正在氣頭上，根本不理會你，甚至把你一起捲入了混亂的謾罵中。",
                        jp: "仲裁に入ろうとしたが、二人は頭に血が上っていて全く耳を貸さず、あろうことかあなたまで罵り合いの混乱に巻き込まれてしまった。",
                        kr: "말리려 했지만, 두 사람은 이미 이성을 잃어 당신의 말에 귀 기울이지 않았고, 오히려 당신까지 그 혼란스러운 욕설의 장에 휘말리고 말았다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你強勢地介入兩人之間，用冰冷且極具威嚴的聲音喝止了爭吵。在他們安靜下來的混亂瞬間，你敏銳地注意到了兩人互相指控時，言語中洩漏的一絲矛盾。",
                            jp: "二人の間に強引に割って入り、冷たく威厳のある声で口論を制止した。彼らが静まった混乱の一瞬、互いに非難し合う言葉の中に漏れた僅かな矛盾に、あなたは鋭く気づいた。",
                            kr: "두 사람 사이에 강압적으로 끼어들어, 차갑고 위엄 있는 목소리로 말다툼을 제지했다. 그들이 조용해진 혼란의 순간, 서로를 비난하던 말속에서 새어 나온 묘한 모순을 예리하게 포착해 냈다."
                        }
                    }],
                    options: [{ label: { zh: "掌控局面", jp: "その場を制す", kr: "상황 통제" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "在一旁觀察不介入",
                    jp: "傍観して介入しない",
                    kr: "옆에서 관찰만 하기"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'tension', val: 5, op: '+' }] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你站在陰影中，冷眼旁觀他們的互相撕咬。這是一場醜陋的鬧劇，雖然你沒有被捲入，但逐漸失控的情緒也讓現場的壓力直線飆升。",
                            jp: "あなたは陰に立ち、彼らの醜い噛み合いを冷ややかな目で見つめた。巻き込まれはしなかったものの、次第に制御を失っていく感情が、現場のプレッシャーを跳ね上がらせた。",
                            kr: "당신은 그림자 속에 서서 그들이 서로를 물어뜯는 모습을 차갑게 방관했다. 얽혀들진 않았지만, 점차 통제 불능으로 치닫는 감정의 소용돌이가 현장의 압박감을 수직 상승시켰다."
                        }
                    }],
                    options: [{ label: { zh: "冷眼旁觀", jp: "冷ややかな傍観", kr: "냉랭한 방관" }, action: "advance_chain" }]
                }
            }
        ]
    });


// ============================================================
    // ⚖️ [CLIMAX] 懸疑偵探劇本高潮節點 × 3
    //    reqTags: ['mystery']
    //    設計原則：
    //      - 玩家出示證物的按鈕由 condition（標籤）控制可見性
    //      - 包含公開審判、被逼入死角、以及私下心理戰三種情境
    // ============================================================

    // CLIMAX-A：公開對峙（正面攤牌，全路線通用）
    DB.templates.push({
        id: 'mys_climax_confrontation',
        type: 'climax',
        reqTags: ['mystery'],
        dialogue: [
            {
                text: {
                    zh: "所有人聚集在{env_room}。<br>氣氛已經壓抑到了極點。<br>你決定，現在就是時候了。",
                    jp: "全員が{env_room}に集まっている。<br>重苦しい空気が極限に達している。<br>あなたは決断した。今こそその時だと。",
                    kr: "모든 사람이 {env_room}에 모였다.<br>분위기는 이미 극도로 억눌려 있다.<br>당신은 결심했다. 지금이 바로 그때라고."
                }
            },
            {
                speaker: "你",
                text: {
                    zh: "「兇手就在這個房間裡。」",
                    jp: "「犯人はこの部屋の中にいる」",
                    kr: "「범인은 이 방 안에 있습니다.」"
                }
            },
            {
                text: {
                    zh: "沉默。然後，{true_culprit}{atom_manner}開口了：<br>「{alibi_claim}」",
                    jp: "沈黙。そして、{true_culprit}が{atom_manner}口を開いた：<br>「{alibi_claim}」",
                    kr: "침묵. 그리고 {true_culprit}이(가) {atom_manner} 입을 열었다:<br>「{alibi_claim}」"
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
                action: "node_next",
                rewards: {
                    tags: ["presented_true_evidence"],
                    varOps: [{ key: 'credibility', val: 30, op: '+' }]
                },
                nextScene: {
                    dialogue: [
                        { text: { 
                            zh: "你拿出了那份關鍵的{combo_item_simple}，輕輕放在所有人面前。<br>這份無可辯駁的鐵證，瞬間擊碎了對方的謊言。",
                            jp: "決定的な{combo_item_simple}を取り出し、全員の前にそっと置いた。<br>反論の余地のないその鉄壁の証拠は、相手の嘘を一瞬にして打ち砕いた。",
                            kr: "결정적인 {combo_item_simple}을(를) 꺼내어 모든 사람 앞에 가볍게 내려놓았다.<br>반박할 수 없는 이 철통같은 증거는 상대의 거짓말을 순식간에 산산조각 냈다."
                        } },
                        { speaker: "{true_culprit}", text: { zh: "{culprit_exposed}", jp: "{culprit_exposed}", kr: "{culprit_exposed}" } },
                        { text: { zh: "{crowd_trust}", jp: "{crowd_trust}", kr: "{crowd_trust}" } }
                    ],
                    options: [{ label: { zh: "看著對方崩潰", jp: "崩れ落ちる相手を見る", kr: "무너지는 상대를 지켜보다" }, action: "advance_chain" }]
                }
            },
            // 選項2：出示假線索（有 has_fake_clue 但沒有 has_true_evidence 時）
            {
                label: {
                    zh: "拿出物品（不確定有用）",
                    jp: "物を出す（役に立つか不明）",
                    kr: "물건 꺼내기 (확신 없음)"
                },
                condition: {
                    tags: ['has_fake_clue'],
                    excludeTags: ['has_true_evidence', 'presented_true_evidence']
                },
                action: "node_next",
                rewards: {
                    tags: ["presented_fake_clue"],
                    varOps: [{ key: 'credibility', val: -25, op: '+' }]
                },
                nextScene: {
                    dialogue: [
                        { text: { 
                            zh: "你咬了咬牙，拿出了那個{combo_item_simple}。<br>{true_culprit}先是愣了一下，隨後嘴角勾起了一抹不易察覺的冷笑。",
                            jp: "歯を食いしばり、あの{combo_item_simple}を取り出した。<br>{true_culprit}は一瞬呆気にとられた後、気づかれないように口角を冷たく吊り上げた。",
                            kr: "이를 악물고 그 {combo_item_simple}을(를) 꺼냈다.<br>{true_culprit}은(는) 멈칫하더니, 이내 눈치채기 힘들 만큼 입꼬리를 차갑게 올렸다."
                        } },
                        { speaker: "{true_culprit}", text: { zh: "{culprit_counter}", jp: "{culprit_counter}", kr: "{culprit_counter}" } },
                        { text: { zh: "{crowd_doubt}", jp: "{crowd_doubt}", kr: "{crowd_doubt}" } }
                    ],
                    options: [{ label: { zh: "試圖挽回局面...", jp: "事態の収拾を図る…", kr: "상황 수습 시도..." }, action: "advance_chain" }]
                }
            },
            // 選項3：沒有證物，用邏輯推理
            {
                label: {
                    zh: "用觀察到的一切推理",
                    jp: "観察したすべてで推理する",
                    kr: "관찰한 모든 것으로 추리하다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'tension', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "沒有決定性的物證，你只能深吸一口氣，將所有零碎的線索在腦海中拼湊起來，試圖用邏輯的長矛刺穿對方的謊言。<br>成敗在此一舉——",
                            jp: "決定的な物証はない。あなたは深呼吸をし、すべての断片的な手がかりを脳内で繋ぎ合わせ、論理の槍で相手の嘘を突き刺そうと試みた。<br>伸るか反るか、勝負はここだ——",
                            kr: "결정적인 물증이 없는 상황. 당신은 심호흡을 하고 흩어진 단서들을 머릿속에서 짜맞추며, 논리의 창으로 상대의 거짓말을 꿰뚫어보려 시도했다.<br>성패는 지금 이 순간에 달렸다——"
                        } 
                    }],
                    options: [{ label: { zh: "揭曉真相！", jp: "真相を暴く！", kr: "진상 규명!" }, action: "advance_chain" }]
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
                    zh: "{true_culprit}把你堵在了{env_room}裡。<br>只有你們兩個人。<br>「你知道得太多了，」對方說，聲音非常平靜，<br>「比我預期的要多得多。」",
                    jp: "{true_culprit}が、あなたを{env_room}に追い詰めた。<br>二人きりだ。<br>「君は知りすぎた」と相手は言った。ひどく冷徹な声だ。<br>「私が思っていたよりも、ずっと多くをな」",
                    kr: "{true_culprit}이(가) 당신을 {env_room}에 몰아넣었다.<br>둘뿐이다.<br>「넌 너무 많은 걸 알고 있어.」 상대가 말했다. 목소리는 아주 차분했다.<br>「내가 예상했던 것보다 훨씬 더 많이.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "大聲呼救，賭有人聽到",
                    jp: "大声で助けを呼び賭けに出る",
                    kr: "누군가 듣기를 바라며 크게 소리치다"
                },
                action: "node_next",
                rewards: {
                    tags: ["called_for_help"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你沒有坐以待斃，而是拼盡全力大喊救命！<br>{true_culprit}臉色大變，意識到不能再拖延，猛地朝你撲過來！",
                            jp: "黙って殺されるつもりはない。ありったけの力で助けを求めて叫んだ！<br>{true_culprit}は顔色を変え、これ以上時間をかけられないと悟り、猛然とあなたに襲いかかってきた！",
                            kr: "가만히 죽기를 기다리지 않고, 온 힘을 다해 살려달라고 소리쳤다!<br>{true_culprit}은(는) 얼굴빛이 변했고, 더 이상 지체할 수 없음을 깨닫고 당신을 향해 무섭게 달려들었다!"
                        } 
                    }],
                    options: [{ label: { zh: "躲開！", jp: "避ける！", kr: "피해!" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "和對方周旋拖延時間",
                    jp: "相手と立ち回り時間を稼ぐ",
                    kr: "상대와 대치하며 시간을 끌다"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'tension', val: 15, op: '+' }] },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你試圖用言語轉移對方的注意力，尋找逃跑的空隙。但{true_culprit}不為所動，步步進逼。<br>「沒用的，這裡只有我們。」",
                            jp: "言葉で相手の注意を逸らし、逃げる隙を探ろうとした。しかし{true_culprit}は動じず、じりじりと距離を詰めてくる。<br>「無駄だ。ここには我々しかいない」",
                            kr: "말로 상대의 주의를 분산시키며 도망칠 틈을 찾으려 했다. 하지만 {true_culprit}은(는) 흔들림 없이 한 걸음씩 다가왔다.<br>「소용없어. 여기엔 우리뿐이니까.」"
                        } 
                    }],
                    options: [{ label: { zh: "準備迎接衝擊...", jp: "衝撃に備える…", kr: "충격에 대비하다..." }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "攤牌：我把你的東西藏了",
                    jp: "打ち明ける：見つけた物を隠した",
                    kr: "털어놓다：찾은 걸 내가 숨겼어"
                },
                condition: { tags: ['has_item_clue'] },
                action: "node_next",
                rewards: {
                    tags: ["used_item_as_leverage"],
                    varOps: [{ key: 'credibility', val: 25, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你冷靜地拋出這個籌碼，原本步步逼近的{true_culprit}，動作瞬間僵住了。<br>「你把它藏在哪了？」對方的語氣終於出現了慌亂。你成功抓住了這唯一的破綻。",
                            jp: "冷静にこの切り札を切った。にじり寄ってきていた{true_culprit}の動きが、一瞬にして硬直した。<br>「どこに隠した？」相手の口調に、ついに焦りが混じった。あなたはこの唯一の隙を見事に突いた。",
                            kr: "당신은 차분하게 이 히든카드를 던졌다. 한 걸음씩 다가오던 {true_culprit}의 움직임이 순식간에 굳어졌다.<br>「어디에 숨겼지?」 상대의 말투에 드디어 당황한 기색이 서렸다. 당신은 이 유일한 빈틈을 성공적으로 파고들었다."
                        } 
                    }],
                    options: [{ label: { zh: "趁機反擊！", jp: "隙を突いて反撃！", kr: "틈을 타 반격!" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-C：私下談判（偵探路線的特殊高潮，為你新增）
    DB.templates.push({
        id: 'mys_climax_private_deal',
        type: 'climax',
        reqTags: ['mystery', 'route_detective'],
        dialogue: [
            {
                text: {
                    zh: "你沒有召集所有人。<br>你單獨把{true_culprit}叫到了{env_room}，並反鎖了門。<br><br>「只有我們兩個？」對方微微皺起眉頭，「你這是在做什麼？」<br>你深知，心理戰現在才正式開始。",
                    jp: "あなたは全員を集めることはしなかった。<br>単独で{true_culprit}を{env_room}に呼び出し、内側から鍵をかけた。<br><br>「二人きりか？」相手は少し眉をひそめた。「一体何のつもりだ？」<br>心理戦は、今ここから本格的に始まるのだ。",
                    kr: "당신은 모든 사람을 불러 모으지 않았다.<br>{true_culprit}만 따로 {env_room}으로 부른 뒤, 문을 안에서 잠갔다.<br><br>「우리 둘뿐이라고?」 상대가 살짝 미간을 찌푸렸다. 「무슨 꿍꿍이지?」<br>심리전은 지금부터 본격적으로 시작된다는 걸, 당신은 잘 알고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拍出鐵證，瓦解防線",
                    jp: "鉄壁の証拠を出し防衛線を崩す",
                    kr: "철통 증거로 방어선 무너뜨리기"
                },
                condition: { tags: ['has_true_evidence'] },
                action: "node_next",
                rewards: {
                    tags: ["presented_true_evidence", "psychological_breakdown"],
                    exp: 60
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你沒有給對方任何狡辯的機會，直接將致命的證據拍在桌上。<br>在密閉的空間與鐵證的雙重重壓下，{true_culprit}的心理防線瞬間崩塌，頹然地癱坐在椅子上。",
                            jp: "言い逃れの隙を一切与えず、致命的な証拠を直接机に叩きつけた。<br>密室という空間と鉄壁の証拠の二重の重圧に、{true_culprit}の心理的防衛線は一瞬にして崩壊し、へたり込むように椅子に座り込んだ。",
                            kr: "변명할 기회를 일절 주지 않고, 치명적인 증거를 책상에 바로 내리쳤다.<br>밀폐된 공간과 철통같은 증거의 이중 압박에 {true_culprit}의 심리적 방어선은 순식간에 무너졌고, 털썩 의자에 주저앉고 말았다."
                        } 
                    }],
                    options: [{ label: { zh: "逼迫認罪", jp: "自白を迫る", kr: "자백 강요" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "無中生有，進行詐唬",
                    jp: "はったりをかける",
                    kr: "블러핑으로 속여 넘기다"
                },
                check: { stat: 'INT', val: 6 },
                action: "node_next",
                rewards: {
                    tags: ["bluffed_culprit"],
                    varOps: [{ key: 'credibility', val: 20, op: '+' }],
                    exp: 40
                },
                onFail: {
                    varOps: [{ key: 'tension', val: 30, op: '+' }],
                    text: {
                        zh: "你試圖詐唬，但你的語氣不夠堅定。{true_culprit}輕易識破了你的虛張聲勢，眼神變得危險起來：「原來你手裡什麼都沒有啊...」",
                        jp: "はったりをかけようとしたが、口調の自信のなさを悟られた。{true_culprit}はあなたの虚勢をあっさりと見破り、目を危険に細めた。「なんだ、お前何も持ってないじゃないか…」",
                        kr: "블러핑을 시도했지만, 당신의 말투는 확신에 차지 못했다. {true_culprit}은(는) 당신의 허세를 쉽게 간파했고, 눈빛이 위험하게 변했다: 「뭐야, 네 손에 아무것도 없었군...」"
                    }
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你冷靜地編造了一個並不存在的「目擊證人」，語氣篤定得連你自己都快信了。<br>{true_culprit}的眼神開始閃爍，額頭滲出了冷汗。你的詐唬成功瓦解了對方的心理防線。",
                            jp: "存在しない「目撃者」を冷静にでっち上げ、自分でも信じ込みそうなほど確信に満ちた口調で語った。<br>{true_culprit}の視線は泳ぎ始め、額には冷や汗がにじむ。あなたのはったりは見事に相手の心理を崩した。",
                            kr: "당신은 존재하지 않는 '목격자'를 차분하게 꾸며내었고, 스스로도 믿을 만큼 확신에 찬 어조로 말했다.<br>{true_culprit}의 눈빛이 흔들리기 시작했고, 이마에는 식은땀이 맺혔다. 당신의 블러핑이 상대의 심리적 방어선을 무너뜨리는 데 성공했다."
                        } 
                    }],
                    options: [{ label: { zh: "心理博弈勝利", jp: "心理戦の勝利", kr: "심리전 승리" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "訴諸同理，攻心為上",
                    jp: "同情に訴え心に踏み込む",
                    kr: "공감을 끌어내 마음을 흔들다"
                },
                action: "node_next",
                rewards: {
                    tags: ["sympathized_culprit"],
                    varOps: [{ key: 'credibility', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你放軟了語氣，沒有指責，而是說出了你推測出的作案動機：「我知道你不是為了自己才這麼做的...」<br>這句話彷彿擊中了對方最柔軟的地方，{true_culprit}低下頭，陷入了長久的沉默。",
                            jp: "口調を和らげ、非難するのではなく、あなたが推測した犯行の動機を語りかけた。「自分のためだけにやったんじゃないってこと、分かってる…」<br>その言葉は相手の最も柔らかな部分を突き刺したのか、{true_culprit}は俯き、長い沈黙に陥った。",
                            kr: "말투를 부드럽게 낮추고, 비난 대신 당신이 추측한 범행 동기를 꺼냈다. 「오직 당신 자신만을 위해 그런 게 아니란 거 알아...」<br>그 말은 상대의 가장 연약한 곳을 찌른 듯했고, {true_culprit}은(는) 고개를 숙인 채 깊은 침묵에 빠졌다."
                        } 
                    }],
                    options: [{ label: { zh: "聽取自白", jp: "自白を聞く", kr: "자백 듣기" }, action: "advance_chain" }]
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
                    zh: "{true_culprit}被眾人制伏，等待警察抵達。<br>你找到的{combo_item_simple}成為了決定性的鐵證。<br>在場所有人都親眼目睹了你如何一步一步還原了這場謀殺。<br>————<br>【完美破案】<br>公信度：{credibility}",
                    jp: "{true_culprit}は群衆に取り押さえられ、警察の到着を待っている。<br>あなたが見つけた{combo_item_simple}は決定的な鉄壁の証拠となった。<br>その場にいる全員が、あなたがこの殺人をどうやって一歩ずつ再現したのかをその目で目撃した。<br>————<br>【完璧な解決】<br>公信力：{credibility}",
                    kr: "{true_culprit}은(는) 사람들에게 제압되어 경찰이 도착하기를 기다리고 있다.<br>당신이 찾아낸 {combo_item_simple}은(는) 결정적인 철통 증거가 되었다.<br>현장에 있던 모든 사람이 당신이 이 살인 사건을 어떻게 한 단계씩 재구성했는지 두 눈으로 목격했다.<br>————<br>【완벽한 사건 해결】<br>공신력: {credibility}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
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
                    zh: "你沒有找到決定性的鐵證，<br>但你之前累積的信任發揮了作用。<br>眾人投票，決定把{true_culprit}綁起來等待警察。<br>真相...大概是這樣吧。<br>————<br>【平庸的勝利】<br>公信度：{credibility}",
                    jp: "決定的な鉄壁の証拠は見つからなかった。<br>しかし、これまでに積み上げてきた信頼が功を奏した。<br>全員の多数決により、{true_culprit}を縛り上げて警察を待つことになった。<br>真相は…おそらくこれで合っているのだろう。<br>————<br>【平凡な勝利】<br>公信力：{credibility}",
                    kr: "결정적인 증거는 찾지 못했지만,<br>그동안 쌓아온 신뢰가 빛을 발했다.<br>사람들은 다수결로 {true_culprit}을(를) 묶어두고 경찰을 기다리기로 결정했다.<br>진상은... 아마도 이럴 것이다.<br>————<br>【평범한 승리】<br>공신력: {credibility}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 60, gold: 20 } }]
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
                    zh: "你出示的那份「證物」反而讓局面完全倒向了你。<br>{true_culprit}冷冷地看著你，嘴角微微上揚。<br>周圍的人開始懷疑：也許，真正需要被懷疑的人是你。<br>————<br>【身敗名裂】<br>公信度：{credibility}",
                    jp: "あなたが提示したその「証拠品」は、かえって状況を完全にあなたへの逆風に変えてしまった。<br>{true_culprit}は冷ややかな目であなたを見つめ、口角をわずかに吊り上げた。<br>周囲の人々は疑い始めた。もしかすると、本当に疑われるべきなのはあなたなのではないかと。<br>————<br>【失墜と破滅】<br>公信力：{credibility}",
                    kr: "당신이 제시한 그 '증거물'은 오히려 상황을 완전히 당신에게 불리하게 만들었다.<br>{true_culprit}은(는) 당신을 차갑게 바라보며 입꼬리를 살짝 올렸다.<br>주변 사람들은 의심하기 시작했다: 어쩌면, 진짜 의심받아야 할 사람은 당신일지도 모른다고.<br>————<br>【파멸과 불명예】<br>공신력: {credibility}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 20 } }]
    });

    // END-D：劫後餘生（生存路線，天亮等到警察）
    DB.templates.push({
        id: 'mys_end_survived',
        type: 'end',
        reqTags: ['mystery', 'route_survivor'],
        dialogue: [
            {
                text: {
                    zh: "天邊漸漸泛白。<br>你活下來了。<br>警察的車聲從遠處傳來。<br>{true_culprit}是否落網，你並不知道。<br>你只知道，你撐過了這一夜。<br>————<br>【劫後餘生】",
                    jp: "空が次第に白み始めた。<br>あなたは生き残った。<br>パトカーのサイレンが遠くから聞こえてくる。<br>{true_culprit}が捕まったかどうかは分からない。<br>分かるのは、この長い夜を生き延びたということだけだ。<br>————<br>【九死に一生】",
                    kr: "하늘이 점차 밝아온다.<br>당신은 살아남았다.<br>멀리서 경찰차 사이렌 소리가 들려온다.<br>{true_culprit}이(가) 체포되었는지는 알 수 없다.<br>당신이 아는 건, 이 밤을 버텨냈다는 것뿐이다.<br>————<br>【구사일생】"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 50, gold: 10 } }]
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
                    zh: "你親眼看見了兇手的臉。<br>你選擇了沉默。<br>也許是恐懼，也許是明哲保身。<br>{true_culprit}安然離開了，帶著那個只有你知道的秘密。<br>————<br>【沉默的目擊者】",
                    jp: "あなたは犯人の顔をその目で見た。<br>しかし、沈黙を選んだ。<br>恐怖からか、それとも保身からか。<br>{true_culprit}は無事に立ち去った。あなただけが知るその秘密と共に。<br>————<br>【沈黙の目撃者】",
                    kr: "당신은 범인의 얼굴을 똑똑히 보았다.<br>하지만 침묵을 선택했다.<br>두려움 때문인지, 아니면 몸을 사리기 위해서인지.<br>{true_culprit}은(는) 무사히 떠났다. 당신만이 아는 그 비밀을 간직한 채.<br>————<br>【침묵의 목격자】"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 30 } }]
    });

    console.log("✅ story_mystery.js V1.0 已載入（3 開場 × 9 中段 × 2 高潮 × 5 結局）");
})();