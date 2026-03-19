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
                zh: "{weather}的夜晚，你按照邀請函上的指示，來到了這裡——{env_building}。<br><br>寄件人的名字已經模糊，但地址是真實的。<br><br>{env_pack_visual}<br><br>大門虛掩著，彷彿有人在等你。",
                jp: "{weather}の夜、招待状の指示通りにここへやって来た——{env_building}。<br><br>差出人の名前はぼやけているが、住所に間違いはない。<br><br>{env_pack_visual}<br><br>扉は半開きになっており、まるで誰かがあなたを待っているかのようだ。",
                kr: "{weather}의 밤, 초대장의 지시에 따라 이곳에 도착했다——{env_building}.<br><br>발신인의 이름은 흐려졌지만, 주소는 진짜다.<br><br>{env_pack_visual}<br><br>문이 살짝 열려 있어, 마치 누군가 당신을 기다리고 있는 것 같다."
            }
        }
    ],
    options: [
        {
            label: {
                zh: "推門進入",
                jp: "扉を押し開ける",
                kr: "문을 밀고 들어가다"
            },
            action: "node_next",
            rewards: {
                tags: ["route_investigate"],
                varOps: [{ key: 'knowledge', val: 5, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你深吸一口氣，推開虛掩的大門，踏入了未知的黑暗之中，準備查清楚這一切。",
                        jp: "深呼吸をして半開きの扉を押し開け、すべての真相を突き止めるべく未知の暗闇へと足を踏み入れた。",
                        kr: "심호흡을 하고 살짝 열린 문을 밀고 들어가, 모든 것을 알아내기 위해 미지의 어둠 속으로 발을 내디뎠다."
                    }
                }],
                options: [{ label: { zh: "深入", jp: "奥へ", kr: "안으로" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "確認退路",
                jp: "退路を確認する",
                kr: "퇴로를 확인하다"
            },
            action: "node_next",
            rewards: {
                tags: ["route_escape"],
                varOps: [{ key: 'curse_val', val: 5, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "直覺警告著你。你謹慎地退後一步，先確認了身後的逃生路線，這才緩步前進。",
                        jp: "直感が警告している。慎重に一歩下がり、背後の逃走ルートを確認してからゆっくりと進み始めた。",
                        kr: "직감이 경고한다. 신중하게 한 발 물러서 등 뒤의 도주 경로를 확인한 뒤에야 천천히 나아갔다."
                    }
                }],
                options: [{ label: { zh: "前進", jp: "進む", kr: "전진" }, action: "advance_chain" }]
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
                zh: "{weather}。<br><br>你已經在這片{env_pack_sensory}裡走了太久。<br><br>遠處出現了{env_building}的輪廓——廢棄的，但至少有屋頂。<br><br>你踢開了積滿灰塵的大門。<br><br>就在你關上門的瞬間，你聽到了{env_sound}。<br>來自建築的深處。",
                jp: "{weather}。<br><br>この{env_pack_sensory}の中を歩き続けて、随分と経った。<br><br>遠くに{env_building}の輪郭が見える——廃墟だが、少なくとも屋根はある。<br><br>埃まみれの扉を蹴り開けた。<br><br>扉を閉めた瞬間、{env_sound}が聞こえた。<br>建物の奥深くからだ。",
                kr: "{weather}.<br><br>당신은 이 {env_pack_sensory} 속을 너무 오래 걸었다.<br><br>멀리서 {env_building}의 윤곽이 나타났다——버려진 곳이지만, 적어도 지붕은 있다.<br><br>먼지 쌓인 문을 발로 차서 열었다.<br><br>문을 닫는 순간, {env_sound}를 들었다.<br>건물 깊은 곳에서 들려온다."
            }
        }
    ],
    options: [
        {
            label: {
                zh: "循聲尋找",
                jp: "音をたどる",
                kr: "소리를 따라가다"
            },
            action: "node_next",
            rewards: {
                tags: ["route_investigate"],
                varOps: [{ key: 'curse_val', val: 5, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "恐懼與好奇交織。你壯著膽子，朝著建築深處那詭異的聲音源頭走去。",
                        jp: "恐怖と好奇心が交錯する。勇気を振り絞り、建物の奥深くからする不気味な音の源へと歩を進めた。",
                        kr: "공포와 호기심이 교차한다. 용기를 내어 건물 깊은 곳에서 들려오는 기괴한 소리의 근원지로 걸어갔다."
                    }
                }],
                options: [{ label: { zh: "探索", jp: "探索", kr: "탐색" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "原地躲藏",
                jp: "その場に隠れる",
                kr: "제자리에 숨다"
            },
            action: "node_next",
            rewards: { tags: ["route_escape"] },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你決定不冒險，找了個隱蔽的暗處蹲下，祈禱著天亮。但這裡真的安全嗎？",
                        jp: "危険を冒さず、見つかりにくい暗がりに身を潜めて夜明けを祈った。しかし、ここは本当に安全なのだろうか？",
                        kr: "모험을 하지 않기로 하고, 눈에 띄지 않는 어두운 곳에 웅크려 날이 밝기를 기도했다. 하지만 이곳은 정말 안전할까?"
                    }
                }],
                options: [{ label: { zh: "等待", jp: "待つ", kr: "기다림" }, action: "advance_chain" }]
            }
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
                zh: "你帶著工具箱來到了{env_building}。<br><br>根據你之前蒐集到的資料，這裡有關於{curse_type}的記錄。<br><br>{env_pack_visual}<br><br>這個地方有問題——你早就知道，<br>問題是：它有多嚴重。",
                jp: "ツールボックスを手に、{env_building}へとやって来た。<br><br>事前に集めた資料によると、ここには{curse_type}に関する記録がある。<br><br>{env_pack_visual}<br><br>この場所には何かある——それは百も承知だ。<br>問題は、それがどれほど深刻かということだ。",
                kr: "도구 상자를 들고 {env_building}에 도착했다.<br><br>전에 수집한 자료에 따르면, 이곳에 {curse_type}에 관한 기록이 있다.<br><br>{env_pack_visual}<br><br>이곳에 문제가 있다는 건——진작에 알고 있었다.<br>문제는 그게 얼마나 심각하냐는 것이다."
            }
        }
    ],
    options: [
        {
            label: {
                zh: "著裝調查",
                jp: "装備を整えて調査する",
                kr: "장비를 갖추고 조사하다"
            },
            action: "node_next",
            rewards: {
                tags: ["route_investigate", "has_preparation"],
                varOps: [{ key: 'knowledge', val: 10, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "你熟練地清點工具並做好防護，深吸一口氣，踏入這片詛咒之地開始調查。",
                        jp: "手慣れた動作で道具を確認して防護を固め、深呼吸をしてから呪われた地へと足を踏み入れ調査を開始した。",
                        kr: "능숙하게 도구를 점검하고 보호 장비를 갖춘 뒤, 심호흡을 하고 이 저주받은 땅에 발을 내디뎌 조사를 시작했다."
                    }
                }],
                options: [{ label: { zh: "深入", jp: "奥へ", kr: "안으로" }, action: "advance_chain" }]
            }
        },
        {
            label: {
                zh: "預留後路",
                jp: "退路を確保する",
                kr: "퇴로를 확보하다"
            },
            action: "node_next",
            rewards: {
                tags: ["route_escape", "has_preparation"],
                varOps: [{ key: 'knowledge', val: 5, op: '+' }]
            },
            nextScene: { 
                dialogue: [{
                    text: {
                        zh: "現場的氣息比資料上描述的更糟。你決定先摸清撤退的出路，再做打算。",
                        jp: "現場の空気は資料の記述よりも悪い。まずは撤退するための出口を確保してから行動することにした。",
                        kr: "현장의 기운이 자료에 묘사된 것보다 더 나쁘다. 먼저 철수할 출구를 파악한 뒤에 다음 행동을 결정하기로 했다."
                    }
                }],
                options: [{ label: { zh: "行動", jp: "行動", kr: "행동" }, action: "advance_chain" }]
            }
        }
    ]
});


	// ============================================================
    // 🔦 [MIDDLE - 調查路線] 探索伴隨代價(加詛咒)；知識解鎖高潮解法；關鍵道具影響結局。
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
                    zh: "{phrase_find_action}<br><br>在{env_feature}裡，你找到了一疊發黃的記錄。<br><br>翻開第一頁，上面寫著關於{curse_type}的詳細描述。<br>字跡是用力刻上去的，好像寫字的人生怕忘記這些內容。",
                    jp: "{phrase_find_action}<br><br>{env_feature}の中に、黄ばんだ記録の束を見つけた。<br><br>最初のページをめくると、{curse_type}に関する詳細な記述があった。<br>筆跡は強く刻み込まれており、書いた者がこの内容を忘れることを恐れていたかのようだ。",
                    kr: "{phrase_find_action}<br><br>{env_feature} 안에서 누렇게 바랜 기록 뭉치를 발견했다.<br><br>첫 장을 넘기자, {curse_type}에 대한 상세한 묘사가 적혀 있었다.<br>글씨는 힘주어 새겨져 있어, 글쓴이가 이 내용을 잊어버릴까 두려워했던 것 같다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "細讀記錄",
                    jp: "記録を熟読する",
                    kr: "기록을 정독하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["found_curse_records", "knows_weakness"],
                    varOps: [
                        { key: 'knowledge', val: 25, op: '+' },
                        { key: 'curse_val', val: 10, op: '+' }
                    ],
                    exp: 20
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你俯下身，硬扛著逐漸增強的壓迫感，逐行記下內容。<br><br>你找到了關鍵的一段——破解{curse_type}的方法，就記錄在這裡。",
                            jp: "次第に強まる圧迫感に耐えながら身を乗り出し、一行ずつ内容を記憶に刻み込んだ。<br><br>決定的な箇所を見つけた。{curse_type}を解く方法がここに記録されていたのだ。",
                            kr: "점점 강해지는 압박감을 견디며 몸을 숙여 한 줄씩 내용을 외웠다.<br><br>결정적인 대목을 찾았다. {curse_type}를 푸는 방법이 여기에 기록되어 있었다."
                        }
                    }],
                    options: [{ label: { zh: "銘記在心", jp: "心に刻む", kr: "명심하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "快速瀏覽",
                    jp: "ざっと目を通す",
                    kr: "빠르게 훑어보다"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_curse_records"],
                    varOps: [
                        { key: 'knowledge', val: 10, op: '+' },
                        { key: 'curse_val', val: 5, op: '+' }
                    ],
                    exp: 10
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "這裡的氣息太過危險，你只敢快速瀏覽，抓住了幾個重點便草草收起記錄。<br><br>雖然只是一瞥，但你對這個地方的了解又多了一些。",
                            jp: "ここの空気は危険すぎる。ざっと目を通し、いくつかの要点だけを掴んで記録を急いでしまった。<br><br>一瞥しただけだが、この場所についての理解が少し深まった。",
                            kr: "이곳의 기운이 너무 위험해, 빠르게 훑어보며 요점 몇 개만 파악하고 서둘러 기록을 덮었다.<br><br>비록 한 번 훑어본 것뿐이지만, 이곳에 대한 이해가 조금 더 생겼다."
                        }
                    }],
                    options: [{ label: { zh: "離開此處", jp: "この場を離れる", kr: "이곳을 떠나다" }, action: "advance_chain" }]
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
                    zh: "{env_pack_visual}<br><br>{phrase_find_action}<br><br>是{combo_item_desc}。<br><br>就算你不完全確定這東西的用途，你的直覺告訴你它和{curse_type}有關。",
                    jp: "{env_pack_visual}<br><br>{phrase_find_action}<br><br>{combo_item_desc}だ。<br><br>これが何に使うものか完全には分からなくても、直感がこれが{curse_type}と関係していると告げている。",
                    kr: "{env_pack_visual}<br><br>{phrase_find_action}<br><br>{combo_item_desc}이다.<br><br>이 물건의 용도를 완전히 확신할 순 없어도, 직감은 이것이 {curse_type}와 관련이 있다고 말하고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "帶走它",
                    jp: "持ち去る",
                    kr: "가져가다"
                },
                action: "node_next",
                rewards: {
                    tags: ["has_sacred_item"],
                    varOps: [
                        { key: 'knowledge', val: 15, op: '+' },
                        { key: 'curse_val', val: 8, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你將它收入囊中。在接觸的瞬間，你感到一股寒意竄上脊背，但這份力量或許能在關鍵時刻救你一命。",
                            jp: "それを鞄にしまった。触れた瞬間、背筋に寒気が走ったが、この力が決定的な瞬間に命を救ってくれるかもしれない。",
                            kr: "그것을 가방에 챙겼다. 닿는 순간 등골에 오싹한 한기가 느껴졌지만, 이 힘이 결정적인 순간에 목숨을 구해줄지도 모른다."
                        }
                    }],
                    options: [{ label: { zh: "繼續前進", jp: "先へ進む", kr: "계속 나아가다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "先不碰，記下位置",
                    jp: "触れずに場所を覚える",
                    kr: "만지지 않고 위치를 기억하다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 3, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你決定不冒險觸碰未知的物品，只是暗暗記下了它的位置，隨後轉身離開。",
                            jp: "未知の物品に触れる危険は冒さず、その場所だけを密かに記憶に留め、身を翻してその場を離れた。",
                            kr: "미지의 물건을 건드리는 모험은 하지 않기로 하고, 그 위치만 속으로 기억해 둔 채 몸을 돌려 떠났다."
                        }
                    }],
                    options: [{ label: { zh: "離開", jp: "立ち去る", kr: "떠나다" }, action: "advance_chain" }]
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
                    zh: "你來到了{env_room}。<br><br>{env_pack_visual}<br><br>這裡有幾個地方值得仔細搜查。<br>但每多待一刻，你感覺那股壓迫感就會強一分。",
                    jp: "{env_room}にやって来た。<br><br>{env_pack_visual}<br><br>ここには綿密に調べるべき場所がいくつかある。<br>しかし、長く留まれば留まるほど、圧迫感が強まっていくのを感じる。",
                    kr: "{env_room}에 도착했다.<br><br>{env_pack_visual}<br><br>이곳에는 자세히 살펴볼 만한 곳이 몇 군데 있다.<br>하지만 오래 머무를수록 그 압박감이 더 강해지는 것을 느낀다."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "你還在{env_room}裡。壓迫感更重了。",
                    jp: "まだ{env_room}にいる。圧迫感がさらに増している。",
                    kr: "아직 {env_room}에 있다. 압박감이 더 심해졌다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "搜查{env_feature}",
                    jp: "{env_feature}を調べる",
                    kr: "{env_feature}을(를) 조사하다"
                },
                action: "node_next", // 👈 修正：有子場景，必須用 node_next
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'search_count', val: 1, op: '-' },
                        { key: 'curse_val',    val: 5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: { 
                            zh: "你翻動了{env_feature}。<br><br>{combo_item_desc}<br><br>{env_pack_sensory}",
                            jp: "{env_feature}を探った。<br><br>{combo_item_desc}<br><br>{env_pack_sensory}",
                            kr: "{env_feature}을(를) 뒤적였다.<br><br>{combo_item_desc}<br><br>{env_pack_sensory}"
                        }
                    }],
                    options: [
                        {
                            label: { zh: "帶走這個物品", jp: "この物品を持ち去る", kr: "이 물건을 챙기다" },
                            action: "map_return_hub", // 👈 修正：子場景結束，返回 HUB
                            rewards: {
                                tags: ['has_item_clue'],
                                varOps: [{ key: 'knowledge', val: 8, op: '+' }]
                            }
                        },
                        { 
                            label: { zh: "不碰它，繼續搜查", jp: "触れずに捜査を続ける", kr: "건드리지 않고 계속 조사하다" }, 
                            action: "map_return_hub" // 👈 修正：子場景結束，返回 HUB
                        }
                    ]
                }
            },
            {
                label: {
                    zh: "感知空間的異樣",
                    jp: "空間の異変を感知する",
                    kr: "공간의 이변을 감지하다"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next", // 👈 修正：有子場景，必須用 node_next
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
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你閉上眼睛屏息，感受這個空間的重量與氣流。<br><br>你感應到了{curse_type}的中心點——就在{env_feature}之下。",
                            jp: "目を閉じて息を止め、この空間の重さと気流を感じ取った。<br><br>{curse_type}の中心点を感じ取った。それは{env_feature}の下にある。",
                            kr: "눈을 감고 숨을 죽인 채, 이 공간의 무게와 기류를 느꼈다.<br><br>{curse_type}의 중심점을 감지했다. 바로 {env_feature} 아래에 있다."
                        }
                    }],
                    options: [{ label: { zh: "返回搜查", jp: "捜査に戻る", kr: "조사로 돌아가다" }, action: "map_return_hub" }] // 👈 修正：返回 HUB
                }
            },
            {
                label: {
                    zh: "離開這個房間",
                    jp: "この部屋を出る",
                    kr: "이 방을 나서다"
                },
                action: "advance_chain" // 👈 離開 HUB 推進深度
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
                    zh: "{sentence_event_sudden}<br><br>{env_pack_sensory}<br><br>然後，你看見了——<br>{phrase_danger_appear}<br><br>不對。那不是真實的。<br>或者，你希望那不是真實的。",
                    jp: "{sentence_event_sudden}<br><br>{env_pack_sensory}<br><br>そして、それを見てしまった——<br>{phrase_danger_appear}<br><br>違う。これは現実じゃない。<br>あるいは、現実ではないと思いたいだけなのかもしれない。",
                    kr: "{sentence_event_sudden}<br><br>{env_pack_sensory}<br><br>그리고, 보게 되었다——<br>{phrase_danger_appear}<br><br>아니야. 저건 진짜가 아니야.<br>혹은, 진짜가 아니길 바라는 것일지도 모른다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "直視異象，記錄細節",
                    jp: "異象を直視し、詳細を記録する",
                    kr: "이변을 직시하고 세부 사항을 기록하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ['witnessed_omen'],
                    varOps: [
                        { key: 'knowledge', val: 15, op: '+' },
                        { key: 'curse_val', val: 10, op: '+' }
                    ],
                    exp: 15
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你咬緊牙關，強忍著恐懼掏出筆記本。你把看到的一切死死記在腦海裡。<br><br>因為你清楚，這些異象本身，就是破解詛咒的線索。",
                            jp: "奥歯を強く噛みしめ、恐怖を押し殺してノートを取り出した。見たものすべてを脳裏に焼き付けた。<br><br>なぜなら、この異象そのものが呪いを解く手がかりになることを知っているからだ。",
                            kr: "이를 악물고 공포를 억누르며 노트를 꺼냈다. 본 모든 것을 머릿속에 깊이 새겼다.<br><br>이러한 이변 자체가 저주를 푸는 단서라는 것을 알고 있기 때문이다."
                        }
                    }],
                    options: [{ label: { zh: "挺過異象", jp: "異象をやり過ごす", kr: "이변을 견뎌내다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "裝作沒看見，轉身離開",
                    jp: "見て見ぬふりをして立ち去る",
                    kr: "못 본 척 몸을 돌려 떠나다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "恐懼讓你別開了視線。你僵硬地轉過身，裝作什麼都沒看見，快步離開了這裡。<br><br>未知的恐懼深深烙印在你心底，讓周遭的氣息變得更加沉重。",
                            jp: "恐怖のあまり目を逸らしてしまった。強張った体で振り返り、何も見なかったふりをして早足で立ち去った。<br><br>未知の恐怖が心の奥底に焼き付き、周囲の空気がより一層重く感じられるようになった。",
                            kr: "공포에 시선을 피하고 말았다. 뻣뻣하게 굳은 몸을 돌려, 아무것도 보지 못한 척 빠른 걸음으로 이곳을 벗어났다.<br><br>미지의 공포가 마음속 깊이 새겨져 주변의 기운이 더욱 무겁게 느껴진다."
                        }
                    }],
                    options: [{ label: { zh: "逃避", jp: "逃避", kr: "도피" }, action: "advance_chain" }]
                }
            }
        ]
    });


	// ============================================================
    // 🏃 [MIDDLE - 逃脫路線] 確認出口(has_escape_route)定結局；失敗加劇詛咒(curse_val)。
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
                    zh: "你沿著牆壁摸索著，尋找出口。<br><br>{env_pack_visual}<br><br>這棟建築比你想像的複雜得多。<br>每一扇門打開，裡面都是另一個房間。",
                    jp: "壁を伝いながら出口を探す。<br><br>{env_pack_visual}<br><br>この建物は想像以上に複雑だ。<br>扉を開けるたび、また別の部屋が現れる。",
                    kr: "벽을 더듬으며 출구를 찾는다.<br><br>{env_pack_visual}<br><br>이 건물은 생각보다 훨씬 복잡하다.<br>문을 열 때마다 또 다른 방이 나온다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "劃記號找規律",
                    jp: "印をつけて規則を探す",
                    kr: "표시를 하며 규칙을 찾다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["found_exit", "has_escape_route"], // 👈 補上註解提到的 has_escape_route 標籤
                    varOps: [{ key: 'curse_val', val: 5, op: '+' }],
                    exp: 20
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你強迫自己冷靜，在牆上劃下印記尋找建築的規律。<br><br>終於，你找到了一扇通往外部的窗戶。記住這個位置——這是你的退路。",
                            jp: "冷静さを保ち、壁に印をつけて建物の構造の規則性を探った。<br><br>ついに、外へと通じる窓を見つけた。この場所を覚えておこう——これがあなたの退路だ。",
                            kr: "스스로를 진정시키며 벽에 표시를 해 건물의 규칙을 찾았다.<br><br>마침내 외부로 통하는 창문을 찾았다. 이 위치를 기억해두자——이것이 당신의 퇴로다."
                        }
                    }],
                    options: [{ label: { zh: "記下退路", jp: "退路を記憶する", kr: "퇴로를 기억하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "憑直覺前進",
                    jp: "直感で進む",
                    kr: "직감으로 나아가다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 15, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你憑著直覺在錯綜複雜的房間中穿梭。<br><br>但這只會讓你在這棟詭異的建築裡越陷越深，找不到出口的焦慮讓作祟感更強了。",
                            jp: "直感を頼りに、入り組んだ部屋の中を進んでいく。<br><br>しかし、それはこの不気味な建物の中に深く迷い込むだけだった。出口が見つからない焦りが、祟りの気配をより一層強めた。",
                            kr: "직감에 의지해 복잡하게 얽힌 방들을 지나간다.<br><br>하지만 그것은 이 기괴한 건물 속으로 더 깊이 빠져들게 할 뿐이었다. 출구를 찾지 못한 불안감이 저주의 기운을 더욱 강하게 만들었다."
                        }
                    }],
                    options: [{ label: { zh: "迷失", jp: "迷子", kr: "길을 잃다" }, action: "advance_chain" }]
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
                    zh: "{phrase_danger_warn}<br><br>你想要移動，但雙腿好像不聽使喚。<br><br>{sentence_tension}<br><br>這個地方不想讓你離開。",
                    jp: "{phrase_danger_warn}<br><br>動こうとするが、両足が言うことを聞かない。<br><br>{sentence_tension}<br><br>この場所が、あなたを帰すまいとしている。",
                    kr: "{phrase_danger_warn}<br><br>움직이려 하지만, 두 다리가 말을 듣지 않는다.<br><br>{sentence_tension}<br><br>이곳은 당신을 떠나보내고 싶어 하지 않는다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "暴力掙脫",
                    jp: "強引に振りほどく",
                    kr: "억지로 뿌리치다"
                },
                check: { stat: 'STR', val: 4 },
                action: "node_next",
                rewards: { exp: 10 },
                onFail: { // 👈 修正：移入對應的選項物件中
                    varOps: [{ key: 'curse_val', val: 25, op: '+' }],
                    text: {
                        zh: "你沒能掙脫。那股力量把你往回拖，拖向{env_building}的深處。",
                        jp: "振りほどけなかった。その力はあなたを背後へ、{env_building}の奥深くへと引きずり込んでいく。",
                        kr: "빠져나오지 못했다. 그 힘이 당신을 뒤로 끌어당겨, {env_building}의 깊은 곳으로 끌고 간다."
                    }
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你全身肌肉緊繃，強行掙脫了那種莫名的壓迫感，大口喘息著往出口的方向跑去。",
                            jp: "全身の筋肉を張り詰め、得体の知れない圧迫感を強引に振りほどき、荒い息をつきながら出口の方向へ走った。",
                            kr: "온몸의 근육을 긴장시켜, 정체불명의 압박감을 억지로 떨쳐내고 거칠게 숨을 몰아쉬며 출구 쪽으로 달렸다."
                        }
                    }],
                    options: [{ label: { zh: "逃走", jp: "逃げる", kr: "도망치다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "停下冷靜",
                    jp: "立ち止まり冷静になる",
                    kr: "멈춰서 침착해지다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你選擇停下來，試圖讓自己冷靜並找回身體的控制權。<br><br>但這股力量藉機纏上了你，讓你寸步難行，詛咒更加深了。",
                            jp: "立ち止まり、冷静になって身体の制御を取り戻そうと試みた。<br><br>しかし、その力は隙に乗じてあなたに絡みつき、一歩も動けなくしてしまった。呪いがさらに深まった。",
                            kr: "멈춰 서서 스스로를 진정시키고 몸의 통제권을 되찾으려 시도했다.<br><br>하지만 그 힘은 기회를 틈타 당신을 옭아매어 한 발짝도 움직일 수 없게 만들었고, 저주는 더욱 깊어졌다."
                        }
                    }],
                    options: [{ label: { zh: "寸步難行", jp: "一歩も動けない", kr: "한 발짝도 움직일 수 없다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-逃脫-C：高作祟值強制觸發（詛咒開始具象化）
    DB.templates.push({
        id: 'hor_mid_esc_manifestation',
        type: 'middle',
        reqTags: ['horror', 'route_escape', 'risk_high'],
        dialogue: [
            {
                text: {
                    zh: "{horror_chase_start}<br><br>{monster}的存在已經不再只是幻覺。<br><br>它出現在你和出口之間。<br><br>{sentence_tension}",
                    jp: "{horror_chase_start}<br><br>{monster}の存在はもはや幻覚ではない。<br><br>それはあなたと出口の間に現れた。<br><br>{sentence_tension}",
                    kr: "{horror_chase_start}<br><br>{monster}의 존재는 더 이상 환각이 아니다.<br><br>그것은 당신과 출구 사이에 나타났다.<br><br>{sentence_tension}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "全力繞行",
                    jp: "全力で迂回する",
                    kr: "전력으로 우회하다"
                },
                check: { stat: 'AGI', val: 6 },
                action: "node_next",
                rewards: {
                    tags: ["evaded_monster"],
                    varOps: [{ key: 'curse_val', val: -15, op: '+' }],
                    exp: 30
                },
                onFail: { // 👈 修正：移入對應的選項物件中
                    varOps: [{ key: 'curse_val', val: 30, op: '+' }],
                    text: {
                        zh: "它抓住了你。你不知道用了什麼力氣掙脫，跌倒在地。<br>現在，情況更糟了。",
                        jp: "捕まってしまった。どうやって振りほどいたのか分からないが、地面に倒れ込んだ。<br>事態はさらに悪化している。",
                        kr: "그것이 당신을 붙잡았다. 무슨 힘으로 뿌리쳤는지 모르게 바닥에 넘어졌다.<br>이제 상황은 더 최악이다."
                    }
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你壓低重心，在千鈞一髮之際從它身旁竄過，狼狽地跌進了下一條走廊，成功甩開了它。",
                            jp: "重心を下げ、間一髪のところでその横をすり抜け、這うように次の廊下へ転がり込んでうまく振り切った。",
                            kr: "무게중심을 낮추고, 위기일발의 순간에 그것의 옆을 스쳐 지나가 다음 복도로 굴러떨어지며 무사히 따돌렸다."
                        }
                    }],
                    options: [{ label: { zh: "驚險逃生", jp: "スリルある生還", kr: "아슬아슬한 도망" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "退回原路",
                    jp: "元の道を引き返す",
                    kr: "원래 길로 되돌아가다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你不敢直面恐懼，選擇退回原路尋找另一條路。<br><br>雖然暫時避開了正面衝突，但你在這棟建築裡困得更深了。",
                            jp: "恐怖に立ち向かえず、元の道を引き返して別の道を探すことにした。<br><br>一時的に正面衝突は避けたものの、この建物の中にさらに深く閉じ込められてしまった。",
                            kr: "공포에 맞서지 못하고, 원래 길로 되돌아가 다른 길을 찾기로 했다.<br><br>일단 정면충돌은 피했지만, 이 건물 속에 더 깊이 갇히게 되었다."
                        }
                    }],
                    options: [{ label: { zh: "越陷越深", jp: "深みにはまる", kr: "더 깊이 빠져들다" }, action: "advance_chain" }]
                }
            }
        ]
    });


    // ============================================================
    // 🌐 [MIDDLE - 恐怖通用節點] 可在恐怖或偵探劇本中隨機觸發。
    // ============================================================

    // MIDDLE-通用-A：詭異的前兆（作祟值中等時出現）
    DB.templates.push({
        id: 'hor_mid_any_omen_low',
        type: 'middle',
        reqTags: ['horror'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_sensory}<br><br>{sentence_event_sudden}<br><br>沒有人，什麼都沒有。<br>但那種被注視的感覺，並沒有消失。",
                    jp: "{env_pack_sensory}<br><br>{sentence_event_sudden}<br><br>誰もいない、何もない。<br>しかし、誰かに見られているという感覚は消えない。",
                    kr: "{env_pack_sensory}<br><br>{sentence_event_sudden}<br><br>아무도, 아무것도 없다.<br>하지만 누군가 지켜보는 듯한 느낌은 사라지지 않는다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "屏氣凝視",
                    jp: "息を殺して凝視する",
                    kr: "숨을 죽여 응시하다"
                },
                check: { stat: 'INT', val: 3 },
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'knowledge', val: 5, op: '+' },
                        { key: 'curse_val', val: 5, op: '+' }
                    ]
                },
                successText: "你敏銳地注意到{env_feature}的位置不太對。好像有什麼東西剛剛移動過。",
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你腳步一頓，試圖在昏暗中尋找視線的來源。<br><br>雖然沒有看到實體，但你確定這不是錯覺。這個認知讓你更了解這裡的危險，但也加深了你內心的恐懼。",
                            jp: "足を止め、薄暗がりの中で視線の主を探そうとした。<br><br>実体は見えなかったが、これが錯覚ではないと確信した。この認識はここでの危険への理解を深めたが、同時に心の奥底の恐怖を増幅させた。",
                            kr: "발걸음을 멈추고 어스름 속에서 시선의 주인을 찾으려 애썼다.<br><br>실체는 보이지 않았지만 착각이 아니라는 것은 확신할 수 있었다. 이 깨달음은 이곳의 위험에 대한 이해를 높여주었지만, 동시에 마음속 공포를 가중시켰다."
                        }
                    }],
                    options: [{ label: { zh: "保持警惕", jp: "警戒を保つ", kr: "경계 유지" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不去在意",
                    jp: "気にしない",
                    kr: "신경 쓰지 않다"
                },
                action: "node_next",
                rewards: { 
                    varOps: [{ key: 'curse_val', val: 8, op: '+' }] 
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你告訴自己只是太累了，強壓下心中的不安繼續前進。<br><br>但你忽視了環境的警告。那股視線如影隨形，詛咒正在你身後悄悄滋長。",
                            jp: "ただ疲れているだけだと言い聞かせ、胸の不安を押し殺して先へ進んだ。<br><br>しかし、環境からの警告を無視してしまった。その視線は影のように付きまとい、背後で静かに呪いが育っていく。",
                            kr: "그저 너무 피곤해서 그렇다고 스스로를 타이르며, 마음속 불안을 억누르고 계속 나아갔다.<br><br>하지만 환경의 경고를 무시하고 말았다. 그 시선은 그림자처럼 따라다니고, 등 뒤에서 저주가 소리 없이 자라난다."
                        }
                    }],
                    options: [{ label: { zh: "繼續前行", jp: "先へ進む", kr: "계속 가다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-通用-B：發現前人留下的警告（可以是偵探或恐怖劇本的通用場景）
    DB.templates.push({
        id: 'hor_mid_any_warning',
        type: 'middle',
        reqTags: ['horror', 'mystery'],
        excludeTags: ['found_warning'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>在{env_feature}上，你發現了用{item_physical_state}的東西刻下的字：<br><br>「不要在天黑後留在這裡。」<br><br>日期是三年前。不知道那個人後來怎麼了。",
                    jp: "{env_pack_visual}<br><br>{env_feature}に、{item_physical_state}もので刻まれた文字を見つけた：<br><br>「暗くなってからここに残るな」<br><br>日付は三年前。あの人はその後どうなったのだろうか。",
                    kr: "{env_pack_visual}<br><br>{env_feature}에 {item_physical_state} 것으로 새겨진 글자를 발견했다:<br><br>「어두워진 후에 이곳에 남지 마라」<br><br>날짜는 3년 전. 그 사람은 그 후 어떻게 되었을까."
                }
            }
        ],
        options: [
            // ── 選項一：聽從警告 ──────────────────────
            {
                label: {
                    zh: "重新思考計畫",
                    jp: "計画を見直す",
                    kr: "계획을 다시 세우다"
                },
                action: "node_next", // ← 跳進子場景的連續決策
                rewards: {
                    tags: ["found_warning"],
                    varOps: [{ key: 'knowledge', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "這是一則用絕望刻下的真實警告。你環顧四周，決定聽從前人的建議。",
                            jp: "これは絶望の中で刻まれた本物の警告だ。あなたは周囲を見回し、先人の忠告に従うことにした。",
                            kr: "이것은 절망 속에서 새겨진 진짜 경고다. 당신은 주위를 둘러보고 선인의 충고를 따르기로 했다."
                        } 
                    }],
                    options: [
                        {
                            label: { zh: "趁天黑離開", jp: "暗くなる前に離れる", kr: "어둠이 내리기 전에 떠나다" },
                            action: "advance_chain",
                            rewards: {
                                varOps: [{ key: 'curse_val', val: 2, op: '+' }]
                            }
                        },
                        {
                            label: { zh: "只搜查最後一處", jp: "最後の一箇所だけ調べる", kr: "마지막 한 곳만 더 조사하다" },
                            action: "advance_chain",
                            rewards: {
                                varOps: [{ key: 'curse_val', val: 12, op: '+' }]
                            }
                        }
                    ]
                }
            },
            // ── 選項二：無視警告 ──────────────────────
            {
                label: {
                    zh: "無視並繼續",
                    jp: "無視して続ける",
                    kr: "무시하고 계속하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_warning"],
                    varOps: [{ key: 'curse_val', val: 12, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你搖搖頭，決定別在意這種可能只是惡作劇的東西，執意繼續深入。<br><br>這種輕敵的態度讓黑暗中的某些東西察覺到了你。作祟感加重了。",
                            jp: "首を横に振り、ただの悪戯かもしれないこんなものは気にしないと決め、強引に奥へと進んだ。<br><br>その油断が、闇に潜む何かにあなたを気づかせてしまった。祟りの気配が重くなった。",
                            kr: "고개를 내저으며, 그저 장난일지도 모르는 이런 건 신경 쓰지 않기로 하고 고집스럽게 안으로 계속 들어갔다.<br><br>그런 방심이 어둠 속에 숨은 무언가에게 당신을 눈치채게 만들었다. 祟り(저주)의 기운이 짙어졌다."
                        }
                    }],
                    options: [{ label: { zh: "深入危險", jp: "危険の奥へ", kr: "위험 속으로" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-通用-C：與其他倖存者遭遇（共用結構，偵探劇本也可觸發）
    DB.templates.push({
        id: 'hor_mid_any_survivor_encounter',
        type: 'middle',
        reqTags: ['horror', 'mystery'],
        excludeTags: ['met_survivor'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_encounter}<br><br>不是怪物，而是一個{identity_modifier}{core_identity}，對方看起來{state_modifier}。<br><br>「你也被困在這裡了嗎？」",
                    jp: "{sentence_encounter}<br><br>怪物ではない。{identity_modifier}{core_identity}だ。相手は{state_modifier}に見える。<br><br>「あなたもここに閉じ込められたの？」",
                    kr: "{sentence_encounter}<br><br>괴물이 아니다. {identity_modifier}{core_identity}이다. 상대는 {state_modifier} 보인다.<br><br>「당신도 여기에 갇혔나요?」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "一起行動",
                    jp: "一緒に行動する",
                    kr: "함께 행동하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["met_survivor", "has_ally"],
                    varOps: [{ key: 'knowledge', val: 8, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "在這種地方，多一個人就多一份力量。你選擇信任對方，結伴同行。<br><br>雙方交換了各自探索到的情報，你對這裡的了解加深了。",
                            jp: "こんな場所では、人が一人増えれば力になる。相手を信じ、共に行動することにした。<br><br>互いに探り当てた情報を交換し、ここについての理解が深まった。",
                            kr: "이런 곳에서는 한 사람이라도 더 있는 게 힘이 된다. 상대를 믿고 동행하기로 했다.<br><br>서로 조사한 정보를 교환하여 이곳에 대한 이해가 깊어졌다."
                        }
                    }],
                    options: [{ label: { zh: "結伴", jp: "同行する", kr: "동행하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "讓對方先走",
                    jp: "相手を先に行かせる",
                    kr: "상대를 먼저 보내다"
                },
                action: "node_next",
                rewards: {
                    tags: ["met_survivor"],
                    varOps: [
                        { key: 'knowledge', val: 5, op: '+' }, 
                        { key: 'curse_val', val: 5, op: '+' }
                    ]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你表現出善意，但保持著距離，讓對方走在前面探路。<br><br>這種防備心讓你能在安全距離外觀察情況，但也讓氣氛變得壓抑緊張。",
                            jp: "善意は見せつつも距離を保ち、相手を先に行かせて道を探らせた。<br><br>その警戒心のおかげで安全な距離から状況を観察できるが、同時に重苦しく緊張した空気を生んだ。",
                            kr: "선의를 보이면서도 거리를 두고, 상대를 먼저 보내 길을 살피게 했다.<br><br>이런 경계심 덕분에 안전한 거리에서 상황을 관찰할 수 있었지만, 분위기는 무겁고 긴장되었다."
                        }
                    }],
                    options: [{ label: { zh: "保持戒心", jp: "警戒する", kr: "경계하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "拒絕並離開",
                    jp: "拒絶して離れる",
                    kr: "거절하고 떠나다"
                },
                action: "node_next",
                rewards: {
                    tags: ["met_survivor"],
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }] // 👈 調整為適當的懲罰值
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "在這種詭異的環境裡，任何活人都可能比怪物更危險。你謹慎地拒絕了對方，獨自離開。<br><br>你回到了孤立無援的狀態。懷疑與孤獨讓恐懼感再次湧上心頭。",
                            jp: "こんな異様な環境では、生きている人間の方が怪物よりも危険かもしれない。慎重に相手を拒絶し、一人で立ち去った。<br><br>孤立無援の状態に戻ってしまった。疑心暗鬼と孤独から、再び恐怖が込み上げてくる。",
                            kr: "이런 기괴한 환경에서는 살아있는 인간이 괴물보다 더 위험할 수 있다. 신중하게 상대를 거절하고 홀로 떠났다.<br><br>다시 고립무원 상태로 돌아왔다. 의심과 고독이 다시금 공포를 불러일으킨다."
                        }
                    }],
                    options: [{ label: { zh: "孤獨前行", jp: "孤独に進む", kr: "홀로 나아가다" }, action: "advance_chain" }]
                }
            }
        ]
    });


    // ============================================================
    // ☠️ [CLIMAX] 高潮危機節點 × 3
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
                    zh: "作祟值已經到達了臨界點。<br><br>整棟{env_building}開始顫抖。<br><br>{monster}從{env_feature}裡現身——它的形態比任何描述都要更令人絕望。<br><br>{sentence_tension}<br><br>你只有一次機會。",
                    jp: "祟り値が臨界点に達した。<br><br>{env_building}全体が震え始める。<br><br>{env_feature}から{monster}が姿を現した——その姿はどんな描写よりも絶望的だ。<br><br>{sentence_tension}<br><br>チャンスは一度きりだ。",
                    kr: "저주 수치가 임계점에 달했다.<br><br>{env_building} 전체가 요동치기 시작한다.<br><br>{env_feature}에서 {monster}이(가) 모습을 드러낸다——그 형태는 어떤 묘사보다도 더 절망적이다.<br><br>{sentence_tension}<br><br>기회는 단 한 번뿐이다."
                }
            }
        ],
        options: [
            // 槽一：找方法（需要 knows_weakness + 足夠的知識值）
            {
                label: {
                    zh: "用儀式對抗根源",
                    jp: "儀式で根源に立ち向かう",
                    kr: "의식으로 근원에 맞서다"
                },
                condition: {
                    tags: ['knows_weakness'],
                    vars: [{ key: 'knowledge', val: 30, op: '>=' }]
                },
                action: "node_next", // 👈 修正為 node_next
                rewards: {
                    tags: ["used_ritual"],
                    varOps: [{ key: 'curse_val', val: -50, op: '+' }],
                    exp: 50
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你頂著恐懼，完美執行了記錄中的儀式。<br><br>{monster}發出了憤怒的低鳴，它的形態開始扭曲、崩解。<br><br>{curse_type}的力量正在撤退。",
                            jp: "恐怖に耐え、記録にあった儀式を完璧に実行した。<br><br>{monster}が怒りの低い唸り声を上げ、その形が歪み、崩れ始めた。<br><br>{curse_type}の力が退いていく。",
                            kr: "공포를 억누르고 기록에 있던 의식을 완벽하게 수행했다.<br><br>{monster}이(가) 분노의 낮은 울음소리를 내며, 그 형태가 일그러지고 무너지기 시작한다.<br><br>{curse_type}의 힘이 물러나고 있다."
                        }
                    }],
                    options: [{ label: { zh: "繼續！", jp: "続けろ！", kr: "계속해!" }, action: "advance_chain" }]
                }
            },
            // 槽二：戰鬥（需要攜帶了神聖物品或武器）
            {
                label: {
                    zh: "持聖物正面迎擊",
                    jp: "聖物を持って正面から挑む",
                    kr: "성물을 들고 정면으로 맞서다"
                },
                condition: { tags: ['has_sacred_item'] },
                action: "node_next", // 👈 修正為 node_next
                rewards: {
                    tags: ["fought_monster"],
                    varOps: [{ key: 'curse_val', val: -20, op: '+' }],
                    exp: 35
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你舉起了手中的{combo_item_simple}，朝著{monster}猛地擲去。<br><br>它沒有直接消滅對方，但——對方退縮了。就這一瞬間的空隙，已經足夠了。",
                            jp: "手に持った{combo_item_simple}を掲げ、{monster}に向かって激しく投げつけた。<br><br>相手を直接消滅させることはできなかったが——相手はひるんだ。この一瞬の隙があれば十分だ。",
                            kr: "손에 든 {combo_item_simple}을(를) 높이 들어, {monster}을(를) 향해 세게 던졌다.<br><br>그것을 직접 소멸시키지는 못했지만——상대가 움찔했다. 이 한순간의 빈틈이면 충분하다."
                        }
                    }],
                    options: [{ label: { zh: "趁現在！", jp: "今だ！", kr: "지금이야!" }, action: "advance_chain" }]
                }
            },
            // 槽三：逃跑（永遠可見，但結局依賴 has_escape_route）
            {
                label: {
                    zh: "退路已定，全力逃亡",
                    jp: "退路は確保済み、全力で逃げる",
                    kr: "퇴로는 확보됐다, 전력으로 도망치다"
                },
                action: "node_next", // 👈 修正為 node_next
                rewards: {
                    tags: ["attempted_escape"],
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你沒有任何能夠對抗它的手段。你只能轉身，朝著記憶中的退路沒命地狂奔！",
                            jp: "それに立ち向かう手段は何もない。あなたは身を翻し、記憶の中の退路に向かって死に物狂いで走るしかない！",
                            kr: "그것에 맞설 방법이 아무것도 없다. 당신은 몸을 돌려 기억 속의 퇴로를 향해 필사적으로 달릴 수밖에 없다!"
                        }
                    }],
                    options: [{ label: { zh: "快跑！", jp: "走れ！", kr: "뛰어!" }, action: "advance_chain" }]
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
                    zh: "你找到了。<br><br>在{env_building}的最深處，{curse_type}的根源就在這裡。<br><br>一個{combo_item_desc}。<br><br>它就是一切的起點。<br>只要摧毀它，一切就結束了。<br><br>——但靠近它，需要付出代價。",
                    jp: "見つけた。<br><br>{env_building}の最深部、{curse_type}の根源はここにあった。<br><br>{combo_item_desc}だ。<br><br>これがすべての始まり。これを破壊すれば、すべてが終わる。<br><br>——しかし、これに近づくには代償を払わねばならない。",
                    kr: "찾아냈다.<br><br>{env_building}의 가장 깊은 곳, {curse_type}의 근원이 바로 여기에 있었다.<br><br>{combo_item_desc}이다.<br><br>이것이 모든 것의 시작이다. 이것만 부수면, 모든 게 끝난다.<br><br>——하지만 그것에 접근하려면 대가를 치러야 한다."
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
                action: "node_next", // 👈 修正為 node_next
                rewards: { tags: ["destroyed_core"], exp: 60 },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "憑藉累積的知識，你找到了它的弱點。你毫不猶豫地動手，將那個核心砸得粉碎。<br>周圍的空氣瞬間凝固，發出了一陣刺耳的悲鳴。",
                            jp: "蓄積された知識のおかげで、弱点を見抜いた。躊躇なく手を下し、そのコアを粉々に打ち砕いた。<br>周囲の空気が一瞬にして凍りつき、耳を劈くような悲鳴が響き渡った。",
                            kr: "축적된 지식 덕분에 그것의 약점을 찾아냈다. 망설임 없이 손을 써 그 코어를 산산조각 냈다.<br>주변 공기가 순식간에 얼어붙으며, 귀를 찢는 듯한 비명이 울려 퍼졌다."
                        } 
                    }],
                    options: [{ label: { zh: "結束這一切！", jp: "すべてを終わらせる！", kr: "모든 걸 끝내!" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "用聖物將它封印",
                    jp: "聖なる物で封印する",
                    kr: "성물로 봉인하다"
                },
                condition: { tags: ['has_sacred_item'] },
                action: "node_next", // 👈 修正為 node_next
                rewards: { tags: ["sealed_core"], varOps: [{ key: 'curse_val', val: -30, op: '+' }], exp: 40 },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你拿出了{combo_item_simple}，用它壓制住了核心的躁動。<br>黑暗的氣息被暫時逼退，周圍終於安靜了下來。",
                            jp: "{combo_item_simple}を取り出し、それを使ってコアの暴走を抑え込んだ。<br>闇の気配が一時的に退けられ、周囲はついに静寂を取り戻した。",
                            kr: "{combo_item_simple}을(를) 꺼내어, 그것으로 코어의 폭주를 억눌렀다.<br>어둠의 기운이 일시적으로 물러나고, 주변은 마침내 조용해졌다."
                        } 
                    }],
                    options: [{ label: { zh: "見證結果", jp: "結果を見届ける", kr: "결과를 지켜보다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "強行毀掉它",
                    jp: "強引に破壊する",
                    kr: "억지로 부수다"
                },
                action: "node_next", // 👈 修正為 node_next
                rewards: { tags: ["attempted_destroy"], varOps: [{ key: 'curse_val', val: 30, op: '+' }] },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "因為缺乏足夠的知識，你只能強行破壞它。就在你動手的瞬間，一股恐怖的反噬之力瞬間湧入你的腦海！<br>你的視線開始模糊...",
                            jp: "十分な知識がなかったため、強引に破壊するしかなかった。手を下した瞬間、恐ろしい反撃の力があなたの脳内に流れ込んできた！<br>視界がぼやけ始める…",
                            kr: "충분한 지식이 부족하여 억지로 부술 수밖에 없었다. 손을 뻗는 순간, 끔찍한 반동의 힘이 뇌리로 쏟아져 들어왔다!<br>시야가 흐려지기 시작한다..."
                        } 
                    }],
                    options: [{ label: { zh: "撐住！", jp: "持ちこたえろ！", kr: "버텨!" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-C：絕命逃生戰（逃脫路線的特殊高潮，為你新增）
    DB.templates.push({
        id: 'hor_climax_escape_run',
        type: 'climax',
        reqTags: ['horror', 'route_escape'],
        dialogue: [
            {
                text: {
                    zh: "建築開始崩塌，{monster}的咆哮聲就在你腦後。<br><br>門窗被黑色的黏液封死，作祟值引發了最後的空間扭曲。<br><br>你距離出口只剩最後幾步，但地板正在裂開。<br><br>這是生與死的界線。",
                    jp: "建物が崩壊し始め、{monster}の咆哮がすぐ背後から聞こえる。<br><br>扉や窓は黒い粘液で塞がれ、祟り値が最後の空間の歪みを引き起こした。<br><br>出口まであと数歩というところで、床がひび割れ始めた。<br><br>ここが生と死の境界線だ。",
                    kr: "건물이 무너지기 시작하고, {monster}의 포효 소리가 바로 뒤에서 들려온다.<br><br>문과 창문은 검은 점액으로 막혔고, 저주 수치가 마지막 공간 왜곡을 일으켰다.<br><br>출구까지 몇 걸음 남지 않았지만, 바닥이 갈라지고 있다.<br><br>이곳이 삶과 죽음의 경계선이다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "衝向確認過的退路",
                    jp: "確認済みの退路へ走る",
                    kr: "확인해 둔 퇴로로 달리다"
                },
                condition: { tags: ['has_escape_route'] },
                action: "node_next",
                rewards: { tags: ["escaped_via_route"], exp: 60 },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你沒有猶豫，直奔之前標記好的窗戶。在整條走廊被黑暗吞噬的最後一秒，你撞破玻璃，重重地摔向了外面的草地。",
                            jp: "ためらうことなく、以前印をつけておいた窓へ一直線に向かう。廊下全体が闇に飲み込まれる最後の1秒、ガラスを突き破り、外の草むらへと激しく転げ落ちた。",
                            kr: "망설임 없이, 전에 표시해 둔 창문을 향해 직진한다. 복도 전체가 어둠에 집어삼켜지기 직전의 1초, 유리를 깨고 밖의 풀밭으로 세게 굴러떨어졌다."
                        } 
                    }],
                    options: [{ label: { zh: "重見天日", jp: "生還", kr: "생환" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "靠敏捷躍過裂縫",
                    jp: "敏捷性で亀裂を飛び越える",
                    kr: "민첩함으로 틈을 뛰어넘다"
                },
                check: { stat: 'AGI', val: 7 },
                action: "node_next",
                rewards: { tags: ["escaped_by_skill"], varOps: [{ key: 'curse_val', val: 20, op: '+' }], exp: 40 },
                onFail: {
                    varOps: [{ key: 'curse_val', val: 40, op: '+' }],
                    text: {
                        zh: "你沒能跳過去，半個身子摔進了裂縫中。黑暗瞬間纏上了你的雙腿，將你往深淵拖拽！",
                        jp: "飛び越えられず、体が半分亀裂に落ち込んでしまった。闇が瞬時に両足に絡みつき、深淵へと引きずり込もうとする！",
                        kr: "뛰어넘지 못하고 반쯤 틈새로 떨어지고 말았다. 어둠이 순식간에 두 다리를 휘감고 심연으로 끌어내리려 한다!"
                    }
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "雖然沒有準備好的退路，但你憑藉驚人的爆發力躍過了崩塌的地板，驚險地抓住門框，將自己甩出了大門！",
                            jp: "用意された退路はなかったが、驚異的な瞬発力で崩れる床を飛び越え、間一髪でドア枠を掴み、外へと身を投げ出した！",
                            kr: "준비된 퇴로는 없었지만, 놀라운 순발력으로 무너지는 바닥을 뛰어넘어, 아슬아슬하게 문틀을 잡고 밖으로 몸을 던졌다!"
                        } 
                    }],
                    options: [{ label: { zh: "驚險逃脫", jp: "間一髪の脱出", kr: "아슬아슬한 탈출" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "盲目往外衝",
                    jp: "闇雲に外へ突っ込む",
                    kr: "무작정 밖으로 뛰쳐나가다"
                },
                action: "node_next",
                rewards: { tags: ["blind_escape"], varOps: [{ key: 'curse_val', val: 30, op: '+' }] },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你像無頭蒼蠅一樣四處亂撞，雖然最後幸運地跌出了建築，但身後的黑暗已經如影隨形地附著在你的影子上。",
                            jp: "パニックになり手当たり次第にぶつかりながら走り、なんとか建物の外に転がり出たものの、背後の闇はすでにあなたの影にぴったりと張り付いている。",
                            kr: "패닉에 빠져 이리저리 부딪히며 달리다 간신히 건물 밖으로 굴러떨어졌지만, 등 뒤의 어둠은 이미 당신의 그림자에 찰거머리처럼 들러붙어 있다."
                        } 
                    }],
                    options: [{ label: { zh: "逃出生天？", jp: "脱出成功？", kr: "탈출 성공?" }, action: "advance_chain" }]
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
                    zh: "{curse_type}的力量，在你親手毀掉那個源頭之後，像潮水一樣退去。<br><br>{env_building}恢復了沉默。<br>這一次，是真正的、乾淨的沉默。<br><br>你走出了大門，黎明的光線讓你不得不瞇起眼睛。<br>————<br>【根源淨化】<br>知識值：{knowledge}",
                    jp: "{curse_type}の力は、あなたがその源を自らの手で破壊した後、潮のように引いていった。<br><br>{env_building}は沈黙を取り戻した。<br>今回は、真の、清らかな沈黙だ。<br><br>扉を抜けると、夜明けの光に思わず目を細めた。<br>————<br>【根源浄化】<br>知識値：{knowledge}",
                    kr: "당신이 그 근원을 직접 부순 후, {curse_type}의 힘이 썰물처럼 빠져나갔다.<br><br>{env_building}은(는) 다시 침묵에 잠겼다.<br>이번에는 진정하고 깨끗한 침묵이다.<br><br>문을 나서자, 새벽빛에 절로 눈이 부시다.<br>————<br>【근원 정화】<br>지식 수치: {knowledge}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
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
                    zh: "你沒能完全毀掉它，但你用{combo_item_simple}把它封印了。<br><br>這個詛咒不會就此消失。<br>只是，在封印解開之前，它對這個世界的影響會暫時停止。<br><br>你拖著疲憊的身軀走出了{env_building}。<br>————<br>【詛咒封印】<br>知識值：{knowledge}",
                    jp: "完全に破壊することはできなかったが、{combo_item_simple}を使って封印した。<br><br>この呪いがこれで消え去るわけではない。<br>ただ、封印が解かれるまで、この世界への影響は一時的に止まる。<br><br>疲労困憊の体を引きずり、{env_building}を後にした。<br>————<br>【呪い封印】<br>知識値：{knowledge}",
                    kr: "완전히 부수지는 못했지만, {combo_item_simple}을(를) 이용해 봉인했다.<br><br>이 저주가 이대로 사라지지는 않을 것이다.<br>다만, 봉인이 풀리기 전까지 이 세계에 미치는 영향은 일시적으로 멈출 것이다.<br><br>지친 몸을 이끌고 {env_building}을(를) 빠져나왔다.<br>————<br>【저주 봉인】<br>지식 수치: {knowledge}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 70, gold: 30 } }]
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
                    zh: "你逃出去了。<br><br>{curse_type}的影響在你越過那道門檻的瞬間，戛然而止。<br><br>你沒有回頭。<br>你不知道那個地方最終會怎樣。<br>你只知道，你活著出來了。<br>————<br>【成功逃脫】",
                    jp: "逃げ延びた。<br><br>あの敷居を越えた瞬間、{curse_type}の影響はぴたりと止んだ。<br><br>振り返ることはなかった。<br>あの場所が最終的にどうなるのかは分からない。<br>分かるのは、生きて出てこられたということだけだ。<br>————<br>【脱出成功】",
                    kr: "당신은 탈출했다.<br><br>그 문턱을 넘는 순간, {curse_type}의 영향이 뚝 끊겼다.<br><br>뒤돌아보지 않았다.<br>그곳이 결국 어떻게 될지는 모른다.<br>오직 당신이 살아서 나왔다는 것만 알 뿐이다.<br>————<br>【성공적 탈출】"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 50, gold: 20 } }]
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
                    zh: "你已經說不清楚，自己是在哪個時間點開始迷失的。<br><br>{env_building}還在。你也還在。<br>但「你」這個概念，已經變得越來越模糊。<br><br>{curse_type}找到了一個新的居所。<br>————<br>【被詛咒吞噬】<br>作祟值：{curse_val}",
                    jp: "自分がどの時点で迷い始めたのか、もはやはっきりとは分からない。<br><br>{env_building}はまだある。あなたもまだいる。<br>しかし「あなた」という概念は、すでにひどく曖昧になっている。<br><br>{curse_type}は新たな住処を見つけたのだ。<br>————<br>【呪いに呑まれる】<br>祟り値：{curse_val}",
                    kr: "자신이 어느 시점부터 길을 잃기 시작했는지, 이제는 명확히 말할 수 없다.<br><br>{env_building}은(는) 여전히 있다. 당신도 여전히 있다.<br>하지만 '당신'이라는 개념은 이미 점점 흐려지고 있다.<br><br>{curse_type}이(가) 새로운 거처를 찾았다.<br>————<br>【저주에 집어삼켜짐】<br>저주 수치: {curse_val}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 10 } }]
    });

    // END-E：帶著傷痕離開（什麼都沒解決，但活著出來了）
    DB.templates.push({
        id: 'hor_end_escaped_hollow',
        type: 'end',
        reqTags: ['horror'],
        dialogue: [
            {
                text: {
                    zh: "你說不清楚自己是怎麼走出來的。<br><br>只記得跑，記得黑暗，記得{env_pack_sensory}。<br><br>天亮了。你還活著。<br>{curse_type}還在那裡，原封不動。<br>————<br>【帶著傷痕離開】",
                    jp: "自分がどうやって出てきたのか、うまく説明できない。<br><br>ただ走ったこと、暗闇、そして{env_pack_sensory}だけを覚えている。<br><br>夜が明けた。あなたは生きている。<br>{curse_type}はまだあそこに、手つかずのまま残っている。<br>————<br>【傷跡を抱えて去る】",
                    kr: "어떻게 걸어 나왔는지 설명할 수 없다.<br><br>그저 달렸던 것, 어둠, 그리고 {env_pack_sensory}만 기억날 뿐이다.<br><br>날이 밝았다. 당신은 아직 살아있다.<br>{curse_type}은(는) 아직 그곳에 고스란히 남아있다.<br>————<br>【상처를 안고 떠나다】"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 25 } }]
    });

    console.log("✅ story_horror.js V1.0 已載入（3 開場 × 10 中段 × 2 高潮 × 5 結局）");
})();