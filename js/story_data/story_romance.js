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
    // 🎬 [START] 戀愛劇本開場節點 × 6
    // ============================================================

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
                    zh: "你在{meet_location}遇見了{lover}。<br><br>{env_pack_visual}<br><br>這不是刻意安排的相遇，但你知道這種事沒有純粹的偶然。<br><br>{lover}{state_modifier}，<br>然後抬起頭，和你的視線正面交鋒。",
                    jp: "{meet_location}で{lover}に出会った。<br><br>{env_pack_visual}<br><br>仕組まれた出会いではない。だが、純粋な偶然など存在しないことをあなたは知っている。<br><br>{lover}は{state_modifier}、<br>そして顔を上げ、あなたの視線と正面からぶつかった。",
                    kr: "{meet_location}에서 {lover}와(과) 마주쳤다.<br><br>{env_pack_visual}<br><br>의도된 만남은 아니지만, 이런 일에 순수한 우연이란 없다는 걸 당신은 알고 있다.<br><br>{lover}은(는) {state_modifier},<br>이내 고개를 들어 당신의 시선과 정면으로 부딪쳤다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "主動開口",
                    jp: "自ら話しかける",
                    kr: "먼저 말을 걸다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_direct"],
                    varOps: [
                        { key: 'affection', val: 8, op: '+' },
                        { key: 'pressure',  val: 5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸一口氣，主動打破了僵局。你的直率讓對方有些意外，但也拉近了彼此的距離。",
                            jp: "深呼吸をして、自ら膠着状態を破った。その率直さに相手は少し驚いたようだが、二人の距離は縮まった。",
                            kr: "심호흡을 하고 먼저 침묵을 깼다. 당신의 솔직함에 상대는 조금 놀랐지만, 서로의 거리는 가까워졌다."
                        }
                    }],
                    options: [{ label: { zh: "開始對話", jp: "会話を始める", kr: "대화 시작" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "靜靜觀察",
                    jp: "静かに観察する",
                    kr: "조용히 관찰하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_indirect"],
                    varOps: [{ key: 'trust', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你選擇按兵不動，靜靜觀察著對方的反應。雖然沒有立刻拉近距離，但你對局勢有了更多把握。",
                            jp: "動かずに、静かに相手の反応を観察することにした。すぐに距離は縮まらないが、状況をより把握できた。",
                            kr: "가만히 서서 조용히 상대의 반응을 관찰하기로 했다. 당장 거리가 좁혀지진 않았지만, 상황을 더 잘 파악하게 되었다."
                        }
                    }],
                    options: [{ label: { zh: "靜觀其變", jp: "様子を見る", kr: "상황을 지켜보다" }, action: "advance_chain" }]
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
                    zh: "你和{lover}已經認識了很長時間。<br><br>朋友、同學，或者只是會點頭的熟人。<br>但最近某件事讓你開始用不一樣的眼光看對方。<br><br>你不確定這是什麼感覺，<br>你只知道，你開始會在意{lover}在不在場。",
                    jp: "あなたと{lover}はもう長い付き合いだ。<br><br>友達、同級生、あるいはただ会釈するだけの知人。<br>しかし最近の出来事で、相手を見る目が変わり始めた。<br><br>この感情が何なのかは分からない。<br>ただ、{lover}がその場にいるかどうかを気にし始めていることだけは確かだ。",
                    kr: "당신과 {lover}은(는) 이미 안 지 꽤 오래되었다.<br><br>친구, 동급생, 혹은 그저 가볍게 인사하는 지인.<br>하지만 최근 어떤 일로 인해 상대를 다른 눈으로 보기 시작했다.<br><br>이 감정이 무엇인지는 확신할 수 없다.<br>그저 {lover}이(가) 그 자리에 있는지 신경 쓰이기 시작했다는 것만 알 뿐이다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "現在開口",
                    jp: "今すぐ話す",
                    kr: "지금 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_direct"],
                    varOps: [{ key: 'affection', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你決定不再隱藏自己的心意，趁著感覺清晰時，試著讓這段關係邁出新的一步。",
                            jp: "自分の気持ちを隠すのはやめ、感覚が鮮明なうちに、この関係を一歩前へ進めてみることにした。",
                            kr: "더 이상 마음을 숨기지 않기로 하고, 느낌이 생생할 때 이 관계를 한 걸음 더 발전시켜 보기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "改變現狀", jp: "現状を変える", kr: "현실을 바꾸다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "裝作沒變",
                    jp: "変わらないふり",
                    kr: "안 변한 척"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_indirect"],
                    varOps: [{ key: 'trust', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你暫時將這份感情藏在心底，維持著原本的相處模式，默默觀察對方的態度。",
                            jp: "ひとまずこの感情を心の奥にしまい、元の関係性を保ちながら、相手の態度を黙って観察することにした。",
                            kr: "일단 이 감정을 마음속에 묻어두고 원래의 관계를 유지하며 묵묵히 상대의 태도를 관찰하기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "維持現狀", jp: "現状維持", kr: "현상 유지" }, action: "advance_chain" }]
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
                    zh: "{env_pack_sensory}<br><br>你和{lover}因為某個突發狀況，被迫困在了{env_room}裡。<br><br>平時說不上幾句話的關係，<br>突然變得無比近距離。<br><br>沉默讓空氣變得奇怪。",
                    jp: "{env_pack_sensory}<br><br>突発的な事態により、あなたと{lover}は{env_room}に閉じ込められてしまった。<br><br>普段は言葉を交わすことも少ない関係だが、<br>突然、信じられないほど距離が縮まった。<br><br>沈黙が空気を妙なものにしている。",
                    kr: "{env_pack_sensory}<br><br>어떤 돌발 상황 때문에 당신과 {lover}은(는) {env_room}에 갇히게 되었다.<br><br>평소엔 말도 몇 마디 안 섞던 사이인데,<br>갑자기 엄청나게 거리가 가까워졌다.<br><br>침묵이 공기를 어색하게 만든다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "打破沉默",
                    jp: "沈黙を破る",
                    kr: "침묵을 깨다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_direct"],
                    varOps: [
                        { key: 'affection', val: 5, op: '+' },
                        { key: 'trust',     val: 5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你受不了這詭異的氣氛，主動開口找了個話題，試圖化解兩人之間的尷尬。",
                            jp: "この妙な雰囲気に耐えきれず、自ら話題を振って二人の間の気まずさを和らげようとした。",
                            kr: "이 어색한 분위기를 참지 못하고, 먼저 화제를 꺼내 두 사람 사이의 서먹함을 풀어보려 했다."
                        }
                    }],
                    options: [{ label: { zh: "搭話", jp: "話しかける", kr: "말 걸기" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "保持安靜",
                    jp: "静かにする",
                    kr: "조용히 있다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_indirect"],
                    varOps: [{ key: 'trust', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你選擇保持沉默，讓兩人在這狹小的空間裡，靜靜感受彼此的存在與呼吸。",
                            jp: "沈黙を選び、この狭い空間で、ただ静かに互いの存在と呼吸を感じ合うことにした。",
                            kr: "침묵을 선택하고, 이 좁은 공간에서 그저 조용히 서로의 존재와 호흡을 느끼기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "感受氣息", jp: "気配を感じる", kr: "기운을 느끼다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // START-乙女：多角色自由互動
    DB.templates.push({
        id: 'rom_start_otome',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection',  val: 0, op: 'set' },
                { key: 'trust',      val: 0, op: 'set' },
                { key: 'pressure',   val: 0, op: 'set' },
                { key: 'aff_lover',  val: 0, op: 'set' },
                { key: 'aff_rival',  val: 0, op: 'set' },
                { key: 'aff_mentor', val: 0, op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "新的環境，新的開始。<br><br>在{env_building}裡，你一個人都不認識。<br><br>但很快地，幾個人出現在你的視野裡：<br>{lover}。{rival}。還有{mentor}。<br><br>每一個人都有自己的故事，<br>而你的故事，從你選擇靠近誰開始。",
                    jp: "新しい環境、新しい始まり。<br><br>{env_building}には知り合いが一人もいない。<br><br>だがすぐに、数人の人物が視界に入ってきた。<br>{lover}。{rival}。そして{mentor}。<br><br>誰もがそれぞれの物語を抱えている。<br>あなたの物語は、誰に近づくかを選ぶところから始まる。",
                    kr: "새로운 환경, 새로운 시작.<br><br>{env_building}에는 아는 사람이 아무도 없다.<br><br>하지만 곧 몇 명의 인물이 시야에 들어왔다.<br>{lover}. {rival}. 그리고 {mentor}.<br><br>모두 각자의 이야기를 가지고 있다.<br>그리고 당신의 이야기는, 누구에게 다가갈지 선택하는 것에서부터 시작된다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "了解環境",
                    jp: "環境を把握する",
                    kr: "환경을 파악하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_otome"],
                    varOps: [{ key: 'aff_lover', val: 0, op: 'set' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你決定先不急著與任何人深交，而是先摸清這個新環境的狀況。",
                            jp: "まずは誰とも深く関わろうとせず、この新しい環境の状況を把握することにした。",
                            kr: "우선 누구와도 깊이 엮이지 않고, 이 새로운 환경의 상황을 파악하기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "觀察四周", jp: "周囲を観察する", kr: "주위를 관찰하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "找{lover}說話",
                    jp: "{lover}に話しかける",
                    kr: "{lover}에게 말을 걸다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_otome", "route_direct"],
                    varOps: [{ key: 'aff_lover', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你的目光被{lover}吸引，決定主動上前搭話，開啟了這段緣分。",
                            jp: "あなたの視線は{lover}に引き寄せられ、自ら話しかけてこの縁をスタートさせることにした。",
                            kr: "당신의 시선은 {lover}에게 끌렸고, 먼저 다가가 말을 걸어 이 인연을 시작하기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "靠近", jp: "近づく", kr: "다가가다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // START-正宮：後宮競爭，爭奪唯一位置
    DB.templates.push({
        id: 'rom_start_consort',
        type: 'start',
        reqTags: ['romance'],
        onEnter: {
            varOps: [
                { key: 'affection',   val: 0,  op: 'set' },
                { key: 'trust',       val: 0,  op: 'set' },
                { key: 'pressure',    val: 10, op: 'set' },
                { key: 'rank_points', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "這裡的規則很清楚：只有一個位置，但有很多人想要它。<br><br>你看著{rival}——對方已經站穩了腳跟，對你投來一個意味深長的眼神。<br><br>{lover}在遠處，目光短暫地掃過你，然後移開了。<br><br>遊戲從現在開始。",
                    jp: "ここのルールは明確だ。ポジションは一つしかないのに、それを狙う者は大勢いる。<br><br>{rival}を見ると、相手はすでに足場を固め、あなたに意味深な視線を送ってきた。<br><br>{lover}は遠くから一瞬だけあなたに視線を向け、すぐに逸らした。<br><br>ゲームは今始まる。",
                    kr: "이곳의 규칙은 명확하다. 자리는 단 하나인데, 원하는 사람은 너무 많다.<br><br>{rival}을(를) 바라보자——상대는 이미 자리를 잡았고, 당신에게 의미심장한 눈빛을 보낸다.<br><br>{lover}은(는) 멀리서 잠시 당신을 훑어보고는 시선을 거두었다.<br><br>게임은 지금부터 시작이다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "摸清規則",
                    jp: "規則を把握する",
                    kr: "규칙을 파악하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_consort"],
                    varOps: [{ key: 'rank_points', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在這種吃人的環境裡，輕舉妄動是大忌。你決定先冷眼旁觀，弄清楚這裡的權力結構。",
                            jp: "このような弱肉強食の環境で軽率な行動は禁物だ。まずは冷ややかに傍観し、ここの権力構造を把握することにした。",
                            kr: "이런 잡아먹고 먹히는 환경에서 경솔한 행동은 금물이다. 먼저 차갑게 방관하며 이곳의 권력 구조를 파악하기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "步步為營", jp: "慎重に進める", kr: "신중하게 나아가다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "真心打動",
                    jp: "真心で動かす",
                    kr: "진심으로 움직이다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_consort", "route_direct"],
                    varOps: [
                        { key: 'affection', val: 10, op: '+' },
                        { key: 'pressure',  val: 8,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "比起勾心鬥角，你決定用最純粹的真心去打動{lover}，這是一場不小的豪賭。",
                            jp: "権謀術数よりも、最も純粋な真心で{lover}の心を動かすことにした。これは小さからぬ賭けだ。",
                            kr: "암투보다는 가장 순수한 진심으로 {lover}의 마음을 움직이기로 했다. 이는 꽤 큰 도박이다."
                        }
                    }],
                    options: [{ label: { zh: "表露心跡", jp: "心を打ち明ける", kr: "마음을 털어놓다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // START-對峙：出軌與背叛的查證
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
                    zh: "你和{lover}在一起已經有一段時間了。<br><br>但最近，有些事情不太對勁。<br><br>電話響了就走出去接。出門的理由越來越模糊。偶爾，你看到{rival}的名字出現在{lover}的手機螢幕上。<br><br>你不確定自己是否多心，但你需要知道真相。",
                    jp: "あなたと{lover}は付き合い始めてからしばらく経つ。<br><br>しかし最近、何かがおかしい。<br><br>電話が鳴ると部屋を出てから出る。外出の理由がどんどん曖昧になっている。時折、{lover}のスマホの画面に{rival}の名前が表示されるのを見る。<br><br>考えすぎなのかもしれない。だが、真相を知る必要がある。",
                    kr: "당신과 {lover}이(가) 함께한 지 이미 꽤 시간이 지났다.<br><br>하지만 최근, 무언가 좀 이상하다.<br><br>전화가 울리면 나가서 받는다. 외출하는 이유가 점점 모호해진다. 가끔 {lover}의 휴대폰 화면에 {rival}의 이름이 뜨는 것을 본다.<br><br>단순한 착각인지 확신할 수 없다. 하지만 진실을 알아야만 한다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "收集證據",
                    jp: "証拠を集める",
                    kr: "증거를 모으다"
                },
                action: "node_next",
                rewards: { tags: ["route_confront"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在沒有確鑿證據之前，打草驚蛇只會讓對方有防備。你決定先暗中調查。",
                            jp: "確たる証拠がないうちに藪をつついて蛇を出せば、相手に警戒されるだけだ。まずは密かに調べることにした。",
                            kr: "확실한 증거도 없이 섣불리 건드리면 상대가 경계할 뿐이다. 우선 몰래 조사해 보기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "暗中調查", jp: "密かに調べる", kr: "몰래 조사하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "當面對質",
                    jp: "直接問いつめる",
                    kr: "직접 따져 묻다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_confront", "route_direct"],
                    varOps: [
                        { key: 'trust',    val: 10, op: '+' },
                        { key: 'pressure', val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你受不了這種猜忌的折磨，決定直接向{lover}要一個解釋。房間的氣氛瞬間降至冰點。",
                            jp: "疑心暗鬼に苛まれるのに耐えきれず、{lover}に直接説明を求めることにした。部屋の空気が一瞬で氷点下に達した。",
                            kr: "이런 의심의 고통을 견딜 수 없어, {lover}에게 직접 해명을 요구하기로 했다. 방 안의 분위기가 순식간에 얼어붙었다."
                        }
                    }],
                    options: [{ label: { zh: "尋求解釋", jp: "説明を求める", kr: "해명을 요구하다" }, action: "advance_chain" }]
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
                    zh: "{env_pack_visual}<br><br>你有一段自由的時間。<br>這裡有幾個人，你可以選擇去找誰說話。",
                    jp: "{env_pack_visual}<br><br>自由な時間ができた。<br>ここには何人かいる。誰に話しかけるか選ぼう。",
                    kr: "{env_pack_visual}<br><br>자유 시간이 생겼다.<br>여기에 몇 사람이 있다. 누구에게 말을 걸지 선택할 수 있다."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "自由時間還沒結束，你要去找誰？",
                    jp: "自由時間はまだ終わっていない。誰のところへ行く？",
                    kr: "자유 시간이 아직 끝나지 않았다. 누구에게 갈까?"
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
                action: "node_next", // 👈 進入子場景
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1, op: '-' },
                        { key: 'aff_lover', val: 15, op: '+' },
                        { key: 'affection', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你走向{lover}，對方看起來{state_modifier}。<br><br>你們聊了一會兒，話題從{env_room}的某件事說起，漸漸說到了更深的地方。<br><br>你發現{lover}比你想像的更有趣。",
                            jp: "{lover}に歩み寄る。相手は{state_modifier}に見える。<br><br>しばらく語り合い、話題は{env_room}の出来事から次第に深いところへ移っていった。<br><br>あなたは{lover}が想像以上に面白い人だと気づいた。",
                            kr: "{lover}에게 다가간다. 상대는 {state_modifier} 보인다.<br><br>잠시 대화를 나누며, 화제는 {env_room}의 어떤 일에서 시작해 점점 더 깊은 곳으로 이어졌다.<br><br>당신은 {lover}가 상상했던 것보다 훨씬 흥미로운 사람이라는 걸 깨달았다."
                        } 
                    }],
                    options: [
                        {
                            label: { zh: "繼續深聊", jp: "もっと深く話す", kr: "더 깊이 대화하다" },
                            action: "map_return_hub", // 👈 結束互動，返回 HUB
                            rewards: {
                                varOps: [
                                    { key: 'aff_lover', val: 8, op: '+' },
                                    { key: 'trust',     val: 5, op: '+' }
                                ]
                            }
                        },
                        { label: { zh: "今天就聊到這", jp: "今日はここまでに", kr: "오늘은 여기까지" }, action: "map_return_hub" }
                    ]
                }
            },
            {
                label: {
                    zh: "找{rival}【好感{aff_rival}】",
                    jp: "{rival}を訪ねる【好感{aff_rival}】",
                    kr: "{rival}를 찾아가다【호감{aff_rival}】"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1,  op: '-' },
                        { key: 'aff_rival', val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "{rival}看到你走過來，表情有些意外。<br><br>「找我有什麼事？」<br><br>幾句交談後，你發現{rival}和你想像的不完全一樣——也許並不是純粹的對手。",
                            jp: "あなたが歩いてくるのを見て、{rival}は少し意外そうな顔をした。<br><br>「私に何か用？」<br><br>言葉を交わすうち、{rival}があなたの想像とは少し違うことに気づいた——純粋なライバルというわけではないのかもしれない。",
                            kr: "{rival}은(는) 당신이 다가오는 것을 보고 조금 의외라는 표정을 지었다.<br><br>「나한테 무슨 볼일이라도?」<br><br>몇 마디 대화를 나누고 나서, 당신은 {rival}이(가) 상상했던 것과 완전히 같지는 않다는 걸 발견했다——어쩌면 순수한 라이벌이 아닐지도 모른다."
                        } 
                    }],
                    options: [
                        {
                            label: { zh: "試著更了解對方", jp: "もっと相手を知ろうとする", kr: "상대를 더 알아가려 하다" },
                            action: "map_return_hub",
                            rewards: {
                                tags: ["knows_rival"],
                                varOps: [{ key: 'aff_rival', val: 8, op: '+' }]
                            }
                        },
                        { label: { zh: "保持距離", jp: "距離を置く", kr: "거리를 두다" }, action: "map_return_hub" }
                    ]
                }
            },
            {
                label: {
                    zh: "找{mentor}【好感{aff_mentor}】",
                    jp: "{mentor}を訪ねる【好感{aff_mentor}】",
                    kr: "{mentor}를 찾아가다【호감{aff_mentor}】"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',  val: 1,  op: '-' },
                        { key: 'aff_mentor', val: 12, op: '+' },
                        { key: 'trust',      val: 8,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "{mentor}靜靜地聽著你說話，並給了你一些意想不到的建議。<br><br>對方似乎比表面上更在意你的處境。你不確定這代表什麼，但心裡的某個地方，莫名地暖了一下。",
                            jp: "{mentor}は静かにあなたの話を聞き、思いがけない助言をくれた。<br><br>相手は表面以上にあなたの立場を気にかけているようだ。これが何を意味するのかは分からないが、心のどこかが妙に温かくなった。",
                            kr: "{mentor}은(는) 조용히 당신의 말을 듣더니, 예상치 못한 조언을 건넸다.<br><br>상대는 겉보기보다 당신의 처지를 더 신경 쓰는 것 같다. 이것이 무엇을 의미하는지 확신할 수 없지만, 마음 한구석이 왠지 모르게 따뜻해졌다."
                        } 
                    }],
                    options: [
                        {
                            label: { zh: "說出內心的困境", jp: "内心の苦境を打ち明ける", kr: "내면의 어려움을 털어놓다" },
                            action: "map_return_hub",
                            rewards: {
                                tags: ["mentor_confidant"],
                                varOps: [{ key: 'aff_mentor', val: 10, op: '+' }]
                            }
                        },
                        { label: { zh: "謝過後離開", jp: "礼を言って立ち去る", kr: "감사를 표하고 떠나다" }, action: "map_return_hub" }
                    ]
                }
            },
            {
                label: {
                    zh: "時間到了，結束自由行動",
                    jp: "時間だ、自由行動を終える",
                    kr: "시간이 다 됐다, 자유 행동 종료"
                },
                action: "advance_chain" // 👈 離開 HUB，推進主線
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
                    zh: "{lover}和{rival}在你面前發生了爭執。<br><br>話題和你有關。<br><br>兩個人都停了下來，同時轉向你，等著你開口。",
                    jp: "目の前で{lover}と{rival}が言い争っている。<br><br>話題はあなたに関することだ。<br><br>二人は言い争いを止め、同時にあなたの方を向き、あなたが口を開くのを待っている。",
                    kr: "당신 앞에서 {lover}와(과) {rival}이(가) 말다툼을 벌이고 있다.<br><br>당신과 관련된 이야기다.<br><br>두 사람이 말다툼을 멈추고 동시에 당신을 향해 돌아서서, 당신이 입을 열기를 기다린다."
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
                action: "node_next",
                rewards: {
                    tags: ["resolved_triangle"],
                    varOps: [
                        { key: 'aff_lover', val: 20, op: '+' },
                        { key: 'aff_rival', val: -10, op: '+' },
                        { key: 'pressure',  val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你毫不猶豫地站在了{lover}身邊。這讓{lover}露出了安心的神色，卻讓{rival}的臉色沉了下來，拂袖而去。",
                            jp: "躊躇なく{lover}の側に立った。それを見て{lover}は安堵の表情を浮かべたが、{rival}は顔を曇らせ、その場を立ち去った。",
                            kr: "망설임 없이 {lover}의 곁에 섰다. 이에 {lover}은(는) 안도하는 표정을 지었지만, {rival}은(는) 얼굴이 어두워지며 자리를 박차고 나갔다."
                        } 
                    }],
                    options: [{ label: { zh: "化解衝突", jp: "対立を収める", kr: "갈등을 수습하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "站在{rival}那邊",
                    jp: "{rival}側に立つ",
                    kr: "{rival} 편에 서다"
                },
                action: "node_next",
                rewards: {
                    tags: ["resolved_triangle"],
                    varOps: [
                        { key: 'aff_rival', val: 25, op: '+' },
                        { key: 'aff_lover', val: -5,  op: '+' },
                        { key: 'pressure',  val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "出人意料地，你選擇支持{rival}。這個決定讓在場兩人都愣住了。{lover}眼神中閃過一絲受傷，而{rival}看向你的眼神則變得複雜起來。",
                            jp: "意外にも、あなたは{rival}を支持した。その決断にその場の二人は呆然とした。{lover}の目には傷ついた色がよぎり、あなたを見る{rival}の眼差しは複雑なものになった。",
                            kr: "의외로 당신은 {rival}을(를) 지지하는 쪽을 택했다. 이 결정에 그 자리에 있던 두 사람 모두 어리둥절해했다. {lover}의 눈빛에는 상처받은 기색이 스쳐 지나갔고, 당신을 바라보는 {rival}의 눈빛은 복잡해졌다."
                        } 
                    }],
                    options: [{ label: { zh: "局面逆轉", jp: "局面が逆転する", kr: "상황 역전" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不選邊，說出自己立場",
                    jp: "どちらも選ばず自分の立場を言う",
                    kr: "어느 쪽도 선택 않고 내 입장을 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["resolved_triangle"],
                    varOps: [
                        { key: 'aff_lover',  val: 8,  op: '+' },
                        { key: 'aff_rival',  val: 8,  op: '+' },
                        { key: 'trust',      val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你深吸一口氣，沒有偏袒任何一方，而是客觀地說出了自己的想法。這份成熟的態度平息了爭吵，讓兩人都對你刮目相看。",
                            jp: "深呼吸をして、どちらの肩を持つこともなく客観的に自分の考えを述べた。その成熟した態度が口論を鎮め、二人はあなたを見直した。",
                            kr: "심호흡을 하고, 어느 한 쪽 편을 들지 않은 채 객관적으로 자신의 생각을 말했다. 이런 성숙한 태도가 말다툼을 가라앉혔고, 두 사람 모두 당신을 다시 보게 만들었다."
                        } 
                    }],
                    options: [{ label: { zh: "理性溝通", jp: "理性的な対話", kr: "이성적인 대화" }, action: "advance_chain" }]
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
                    zh: "你和{lover}意外地單獨在{env_room}裡。<br><br>{env_pack_visual}<br><br>這種情況不常有，<br>而你知道，說不定這就是某個轉折點。",
                    jp: "思いがけず、あなたと{lover}は{env_room}で二人きりになった。<br><br>{env_pack_visual}<br><br>こんな状況はめったにない。<br>そしてあなたは分かっている、これが何かの転機になるかもしれないと。",
                    kr: "당신과 {lover}은(는) 뜻밖에 {env_room}에 단둘이 남게 되었다.<br><br>{env_pack_visual}<br><br>이런 상황은 흔치 않다.<br>그리고 당신은 알고 있다, 어쩌면 이것이 어떤 전환점이 될지도 모른다는 것을."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "說出心裡話",
                    jp: "本音を打ち明ける",
                    kr: "진심을 털어놓다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_alone_lover"],
                    varOps: [
                        { key: 'aff_lover', val: 25, op: '+' },
                        { key: 'trust',     val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你抓住了這個難得的機會，將平時說不出口的話告訴了對方。<br><br>這份坦誠打破了最後一層隔閡，你們的心靠得更近了。",
                            jp: "このまたとない機会を逃さず、普段は口にできない言葉を相手に伝えた。<br><br>その率直さが最後の壁を打ち破り、二人の心はさらに近づいた。",
                            kr: "이 귀한 기회를 놓치지 않고, 평소 입 밖으로 내지 못했던 말들을 상대에게 전했다.<br><br>그 솔직함이 마지막 벽을 허물었고, 두 사람의 마음은 더욱 가까워졌다."
                        } 
                    }],
                    options: [{ label: { zh: "拉近距離", jp: "距離が縮まる", kr: "거리가 좁혀지다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "靜靜陪伴",
                    jp: "静かに寄り添う",
                    kr: "조용히 곁에 머물다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_alone_lover"],
                    varOps: [{ key: 'aff_lover', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你沒有說話，只是靜靜地陪在對方身邊。有時候，無聲的陪伴比言語更能傳達心意。",
                            jp: "何も言わず、ただ静かに相手の傍に寄り添った。時には、無言の寄り添いの方が言葉よりも心を伝えることがある。",
                            kr: "아무 말 없이, 그저 조용히 상대의 곁을 지켰다. 때로는 소리 없는 동반이 말보다 더 마음을 잘 전할 때가 있다."
                        } 
                    }],
                    options: [{ label: { zh: "無聲默契", jp: "無言の繋がり", kr: "무언의 교감" }, action: "advance_chain" }]
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
                    zh: "機會來了。<br><br>在所有人面前，你有一個展示自己的時刻。<br>{rival}已經表現過了，而且表現得不差。<br><br>輪到你了。",
                    jp: "チャンスが来た。<br><br>全員の前で、自分をアピールする時だ。<br>{rival}はすでに自分をアピールし、しかもその評価は悪くない。<br><br>あなたの番だ。",
                    kr: "기회가 왔다.<br><br>모든 사람 앞에서 자신을 증명할 시간이다.<br>{rival}은(는) 이미 능력을 보여주었고, 꽤 훌륭하게 해냈다.<br><br>이제 당신 차례다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "展現真實的自己",
                    jp: "本当の自分を見せる",
                    kr: "진짜 자신을 보여주다"
                },
                action: "node_next",
                rewards: {
                    tags: ["showcased"],
                    varOps: [
                        { key: 'affection',   val: 20, op: '+' },
                        { key: 'rank_points', val: 20, op: '+' }
                    ]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你沒有刻意迎合，而是展現了最真實、最自信的自己。這份毫不做作的光芒，不僅贏得了尊重，也深深吸引了{lover}的目光。",
                            jp: "迎合することなく、最も真実で自信に満ちた自分を表現した。その飾らない輝きは尊敬を集めただけでなく、{lover}の視線を深く惹きつけた。",
                            kr: "억지로 맞추려 하지 않고 가장 진실하고 자신감 넘치는 모습을 보여주었다. 그 꾸밈없는 빛은 존경을 얻어냈을 뿐만 아니라 {lover}의 시선을 깊이 사로잡았다."
                        }
                    }],
                    options: [{ label: { zh: "無可替代", jp: "唯一無二", kr: "대체 불가" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "展現對方想看的樣子",
                    jp: "相手が望む姿を見せる",
                    kr: "상대가 원하는 모습을 보여주다"
                },
                action: "node_next",
                rewards: {
                    tags: ["showcased"],
                    varOps: [
                        { key: 'rank_points', val: 25, op: '+' },
                        { key: 'trust',       val: -8, op: '+' }
                    ]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你精準地捕捉到了局勢的需求，完美地扮演了那個最適合這個位置的角色。你獲得了極高的評價，但在{lover}眼中，你似乎多了一層偽裝。",
                            jp: "状況が求めるものを正確に捉え、そのポジションに最もふさわしい役を完璧に演じきった。高い評価を得たが、{lover}の目には、あなたが一枚の仮面を被っているように映ったようだ。",
                            kr: "상황이 요구하는 바를 정확히 포착하고, 그 자리에 가장 어울리는 역할을 완벽하게 연기해 냈다. 높은 평가를 받았지만, {lover}의 눈에는 당신이 가식을 한 겹 두른 것처럼 보인 듯하다."
                        }
                    }],
                    options: [{ label: { zh: "完美演繹", jp: "完璧な演技", kr: "완벽한 연기" }, action: "advance_chain" }]
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
                    zh: "這是個需要眼觀四面的地方。<br><br>每一個選擇，都可能改變你在{lover}心中的位置。",
                    jp: "ここは四方八方に気を配るべき場所だ。<br><br>一つひとつの選択が、{lover}の心の中でのあなたの位置を変えるかもしれない。",
                    kr: "이곳은 사방을 주의 깊게 살펴야 하는 곳이다.<br><br>하나의 선택이 {lover}의 마음속 당신의 위치를 바꿀 수 있다."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "權力的遊戲還在繼續，下一步你要怎麼走？",
                    jp: "権力ゲームはまだ続いている。次の一手はどうする？",
                    kr: "권력 게임은 아직 계속되고 있다. 다음은 어떻게 움직일 것인가?"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "製造獨處機會",
                    jp: "二人きりの機会を作る",
                    kr: "단둘이 있을 기회 만들기"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1,  op: '-' },
                        { key: 'affection', val: 20, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你巧妙地支開了旁人，製造了和{lover}獨處的機會。你成功地讓{lover}只注意到你。至少在這一刻。",
                            jp: "巧みに人を遠ざけ、{lover}と二人きりになる機会を作った。あなたはうまく{lover}の関心を自分だけに向けることができた。少なくともこの瞬間だけは。",
                            kr: "교묘하게 주변 사람들을 물리고 {lover}와(과) 단둘이 있을 기회를 만들었다. 성공적으로 {lover}의 시선이 오직 당신에게만 머물게 했다. 적어도 이 순간만큼은."
                        } 
                    }],
                    options: [{ label: { zh: "繼續籌謀", jp: "策略を続ける", kr: "계속 도모하다" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "化解{rival}的攻勢",
                    jp: "{rival}の攻勢をかわす",
                    kr: "{rival}의 공세 무력화"
                },
                action: "node_next",
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
                    dialogue: [{ 
                        text: { 
                            zh: "你敏銳地察覺到{rival}的暗中操作。{rival}的計畫沒有得逞。你沒有做任何惡意的事——只是比對方更聰明地應對了局面。",
                            jp: "{rival}の暗躍を鋭く察知した。{rival}の計画は失敗に終わった。あなたは何も悪意ある行動はしていない——ただ相手よりも賢く立ち回っただけだ。",
                            kr: "{rival}의 암약을 예리하게 눈치챘다. {rival}의 계획은 수포로 돌아갔다. 당신은 어떤 악의적인 행동도 하지 않았다——그저 상대보다 더 현명하게 대처했을 뿐이다."
                        } 
                    }],
                    options: [{ label: { zh: "鞏固地位", jp: "地位を固める", kr: "입지를 다지다" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "讓{lover}記住你",
                    jp: "{lover}の心に残る言葉を言う",
                    kr: "{lover}의 기억에 남을 말 하기"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time', val: 1,  op: '-' },
                        { key: 'affection', val: 15, op: '+' },
                        { key: 'trust',     val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "在眾人交談的間隙，你說出了一句直擊人心的話。{lover}停下來，認真地看了你一眼。有些話，說出口的時機比內容更重要。",
                            jp: "人々の会話の合間に、あなたは心に刺さる一言を口にした。{lover}は立ち止まり、真剣な眼差しであなたを見た。言葉というものは、その内容よりも口にするタイミングの方が重要なことがある。",
                            kr: "사람들이 대화하는 틈을 타, 당신은 마음을 울리는 한마디를 던졌다. {lover}은(는) 가던 길을 멈추고 당신을 진지하게 바라보았다. 어떤 말은 내용보다 그것을 내뱉는 타이밍이 더 중요하다."
                        } 
                    }],
                    options: [{ label: { zh: "留下餘韻", jp: "余韻を残す", kr: "여운을 남기다" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "靜觀其變",
                    jp: "静観する",
                    kr: "상황을 지켜보다"
                },
                action: "advance_chain" // 👈 結束自由行動，推進主線
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
                    zh: "{rival}選擇了正面交鋒。<br><br>「{lover}對你有什麼好感，不過是因為你夠新鮮，」對方{atom_manner}說，「等一段時間，一切都會回歸原位。」<br><br>周圍有人在看。",
                    jp: "{rival}は正面衝突を選んだ。<br><br>「{lover}があなたに好感を抱いているのは、ただ新鮮だからよ」相手は{atom_manner}言った。「少し時間が経てば、すべて元通りになるわ」<br><br>周囲の人々が注目している。",
                    kr: "{rival}은(는) 정면충돌을 선택했다.<br><br>「{lover}이(가) 너한테 호감을 가지는 건 그저 신선해서일 뿐이야.」 상대가 {atom_manner} 말했다. 「시간이 지나면 모든 건 제자리로 돌아가게 돼 있어.」<br><br>주변 사람들이 지켜보고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "冷靜回應",
                    jp: "冷静に答える",
                    kr: "냉정하게 대답하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["faced_rival_challenge"],
                    varOps: [
                        { key: 'rank_points', val: 15, op: '+' },
                        { key: 'affection',   val: 10, op: '+' }
                    ]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你沒有被激怒，只是冷靜地看著對方，輕笑了一聲：「那就讓時間來證明吧。」這份從容讓{rival}的挑釁顯得像個笑話，周圍的人也暗暗佩服你的氣度。",
                            jp: "挑発には乗らず、ただ静かに相手を見つめて軽く笑った。「なら、時間が証明してくれるわ」その余裕が{rival}の挑発を滑稽なものにし、周囲の人々も密かにあなたの度量に感心した。",
                            kr: "도발에 넘어가지 않고, 그저 차분히 상대를 바라보며 가볍게 코웃음을 쳤다. 「그럼 시간이 증명해 주겠지.」 그 여유로움이 {rival}의 도발을 우스꽝스럽게 만들었고, 주변 사람들도 속으로 당신의 그릇에 감탄했다."
                        }
                    }],
                    options: [{ label: { zh: "展現氣度", jp: "度量を見せる", kr: "그릇을 보여주다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "用行動反擊",
                    jp: "行動で反撃する",
                    kr: "행동으로 반격하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["faced_rival_challenge"],
                    varOps: [
                        { key: 'affection', val: 20, op: '+' },
                        { key: 'pressure',  val: 10, op: '+' }
                    ]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你沒有回答{rival}，而是直接轉向遠處的{lover}，用一個親暱而宣示主權的舉動回應了這一切。這大膽的舉動讓現場氣氛瞬間沸騰，也徹底點燃了戰火。",
                            jp: "{rival}には答えず、遠くにいる{lover}に直接向き直り、親しげで主導権を示すような行動で全てに答えた。その大胆な行動にその場は沸き立ち、戦いの火蓋が完全に切って落とされた。",
                            kr: "{rival}에게 대답하는 대신, 멀리 있는 {lover}를 향해 직접 돌아서서 친밀하고 주도권을 과시하는 행동으로 모든 것에 답했다. 그 대담한 행동에 현장의 분위기는 순식간에 끓어올랐고, 전쟁의 불씨가 완전히 당겨졌다."
                        }
                    }],
                    options: [{ label: { zh: "宣示主權", jp: "主導権を示す", kr: "주도권을 과시하다" }, action: "advance_chain" }]
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
                    zh: "{lover}把手機留在{env_room}裡，自己出去了。<br><br>螢幕亮了。<br>你沒有刻意偷看，但你看見了{rival}的名字。<br><br>還有訊息的開頭幾個字——那個語氣，不像是普通的朋友。",
                    jp: "{lover}はスマホを{env_room}に残し、部屋を出て行った。<br><br>画面が光った。<br>盗み見ようとしたわけではないが、{rival}の名前が見えてしまった。<br><br>そしてメッセージの冒頭の数文字——その口調は、ただの友達とは思えなかった。",
                    kr: "{lover}은(는) 휴대폰을 {env_room}에 두고 밖으로 나갔다.<br><br>화면이 켜졌다。<br>일부러 훔쳐보려던 건 아니지만, {rival}의 이름이 눈에 들어왔다.<br><br>그리고 메시지 첫머리의 몇 글자——그 어조는, 결코 평범한 친구 사이 같지 않았다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "打開看",
                    jp: "開いて見る",
                    kr: "열어보다"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_msg_evidence"],
                    varOps: [
                        { key: 'evidence_count', val: 1,   op: '+' },
                        { key: 'trust',          val: -10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你的手指有些顫抖，還是點開了訊息。<br>內容證實了你的部分猜測，但也讓你在這段關係中徹底失去了安全感（信任度下降）。",
                            jp: "指先が少し震えたが、それでもメッセージを開いた。<br>内容はあなたの推測の一部を裏付けるものだったが、同時にこの関係における安心感を完全に奪い去った（信頼度低下）。",
                            kr: "손끝이 약간 떨렸지만, 결국 메시지를 열어보았다.<br>내용은 당신의 추측 일부를 확인시켜주었지만, 동시에 이 관계에서의 안전감을 완전히 잃게 만들었다(신뢰도 하락)."
                        }
                    }],
                    options: [{ label: { zh: "證據入袋", jp: "証拠確保", kr: "증거 확보" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "裝沒看見",
                    jp: "見なかったふり",
                    kr: "못 본 척하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_msg_evidence"],
                    varOps: [{ key: 'pressure', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你強迫自己把手機翻面，裝作什麼都沒看見。<br>但那幾個字已經烙印在你的腦海裡，無形的心理壓力壓得你喘不過氣來。",
                            jp: "無理やりスマホを裏返し、何も見なかったふりをした。<br>しかし、あの数文字はすでに脳裏に焼き付いており、目に見えない心理的重圧があなたを息苦しくさせる。",
                            kr: "억지로 폰을 뒤집어 아무것도 못 본 척했다.<br>하지만 그 몇 글자는 이미 뇌리에 박혔고, 보이지 않는 심리적 압박감이 당신을 숨 막히게 한다."
                        }
                    }],
                    options: [{ label: { zh: "自我折磨", jp: "自己嫌悪", kr: "자기 괴롭힘" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "等{lover}回來直接問",
                    jp: "戻ったら直接聞く",
                    kr: "돌아오면 직접 묻다"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_msg_evidence", "asked_directly"],
                    varOps: [
                        { key: 'trust',    val: 10, op: '+' },
                        { key: 'pressure', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你不願暗自猜忌。當{lover}回來時，你直接指著螢幕詢問了。<br>雖然對方給出了解釋（信任度上升），但這種當面的對峙也讓氣氛變得異常緊繃。",
                            jp: "一人で疑心暗鬼になるのは嫌だった。{lover}が戻ってきた時、画面を指差して直接問い詰めた。<br>相手は説明してくれたが（信頼度上昇）、このような対面での追及は空気を異常なまでに張り詰めさせた。",
                            kr: "혼자 의심하며 괴로워하기 싫었다. {lover}이(가) 돌아왔을 때, 화면을 가리키며 직접 물었다.<br>상대가 해명을 해주긴 했지만(신뢰도 상승), 이런 식의 정면 대결은 분위기를 비정상적으로 팽팽하게 만들었다."
                        }
                    }],
                    options: [{ label: { zh: "氣氛緊繃", jp: "張り詰めた空気", kr: "팽팽한 긴장감" }, action: "advance_chain" }]
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
                    zh: "你決定主動去找答案。<br><br>有幾個方向可以調查，但每一個都有代價——<br>對關係的代價，或是對自己心理的代價。",
                    jp: "自ら答えを探しに行くことにした。<br><br>調査の方向性はいくつかあるが、どれも代償を伴う——<br>関係に対する代償か、それとも自分自身の心理的な代償か。",
                    kr: "당신은 직접 답을 찾아 나서기로 했다.<br><br>조사할 수 있는 방향은 몇 가지가 있지만, 각각 대가가 따른다——<br>관계에 대한 대가, 혹은 당신 심리에 대한 대가."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "調查還沒結束，你還要繼續深挖嗎？",
                    jp: "調査はまだ終わっていない。さらに深く掘り下げるか？",
                    kr: "조사는 아직 끝나지 않았다. 계속 파헤칠 것인가?"
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
                action: "node_next",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'search_count',   val: 1,  op: '-' },
                        { key: 'evidence_count', val: 1,  op: '+' },
                        { key: 'trust',          val: -5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你暗中核對了對方的行程。幾個日期根本對不上。<br>你不知道這算不算鐵證，但你沒辦法假裝自己沒注意到。",
                            jp: "密かに相手の行動履歴を照合した。いくつか日付が合わない箇所がある。<br>これが決定的な証拠になるかは分からないが、気づかなかったふりをすることはできない。",
                            kr: "몰래 상대의 일정을 대조해 보았다. 며칠 날짜가 전혀 맞지 않는다.<br>이게 확실한 증거가 될지는 모르겠지만, 눈치채지 못한 척할 수는 없다."
                        } 
                    }],
                    options: [{ label: { zh: "繼續調查", jp: "調査を続ける", kr: "계속 조사하다" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "向共同朋友打聽",
                    jp: "共通の知人に探りを入れる",
                    kr: "공통 지인에게 슬쩍 묻다"
                },
                check: { stat: 'INT', val: 3 },
                action: "node_next",
                condition: {
                    vars: [{ key: 'search_count', val: 1, op: '>=' }],
                    excludeTags: ['asked_mutual_friend']
                },
                rewards: {
                    tags: ["asked_mutual_friend"],
                    varOps: [
                        { key: 'search_count',   val: 1, op: '-' },
                        { key: 'evidence_count', val: 1, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你巧妙地向共同朋友旁敲側擊，對方不小心說漏了一句話。<br>你現在更確定了一件事。",
                            jp: "共通の知人に巧妙に探りを入れたところ、相手がうっかり一言漏らした。<br>これで、ある一つのことがより確実になった。",
                            kr: "공통 지인에게 교묘하게 떠보자, 상대가 실수로 말 한마디를 흘렸다.<br>이제 당신은 어떤 사실 하나를 더욱 확신하게 되었다."
                        } 
                    }],
                    options: [{ label: { zh: "繼續調查", jp: "調査を続ける", kr: "계속 조사하다" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "問自己：真想知道嗎",
                    jp: "自分に問う：本当に知りたいか",
                    kr: "스스로에게 묻다：정말 알고 싶어"
                },
                action: "node_next",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'search_count', val: 1,   op: '-' },
                        { key: 'trust',        val: 10,  op: '+' },
                        { key: 'pressure',     val: -10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你停下調查的腳步，深吸了一口氣。也許你最怕的，不是被背叛，而是確認之後不知道該怎麼辦。<br>選擇暫時相信對方，讓你稍微平靜了一點。",
                            jp: "調査の手を止め、深呼吸をした。一番恐れているのは裏切られることではなく、裏切りを確信した後にどうすればいいか分からないことなのかもしれない。<br>一時的に相手を信じることを選び、少し落ち着きを取り戻した。",
                            kr: "조사를 멈추고 심호흡을 했다. 어쩌면 당신이 가장 두려워하는 건 배신당하는 게 아니라, 사실을 확인한 뒤에 어찌해야 할지 모르는 것일지도 모른다.<br>일단 상대를 믿기로 하자, 마음이 조금 평온해졌다."
                        } 
                    }],
                    options: [{ label: { zh: "暫時冷靜", jp: "ひとまず冷静に", kr: "일단 진정" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "🚪 結束調查",
                    jp: "🚪 調査を終了する",
                    kr: "🚪 조사 종료"
                },
                action: "advance_chain" // 👈 離開 HUB 推進主線
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
                    zh: "你在{env_room}裡遇到了{rival}。<br><br>單獨。<br><br>對方看到你，明顯愣了一下，<br>然後很快恢復了鎮定：<br>「我們需要談談。」",
                    jp: "{env_room}で{rival}に出くわした。<br><br>二人きりだ。<br><br>相手はあなたを見て明らかに一瞬戸惑ったが、すぐに落ち着きを取り戻した：<br>「話があるの」",
                    kr: "{env_room}에서 {rival}와(과) 마주쳤다.<br><br>단둘이.<br><br>상대는 당신을 보고 명백히 멈칫했지만,<br>이내 침착함을 되찾았다:<br>「우리 얘기 좀 해.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "「說。」",
                    jp: "「言って」",
                    kr: "「말해.」"
                },
                action: "node_next",
                rewards: {
                    tags: ["confronted_rival"],
                    varOps: [{ key: 'evidence_count', val: 1, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你冷冷地看著對方，不帶任何情緒地吐出一個字。{rival}的幾句辯解，反而在你耳中成了最有利的證據。",
                            jp: "冷たい目で相手を見据え、感情を交えずに短い言葉を投げかけた。{rival}のいくつかの言い訳は、かえってあなたの耳には最も有力な証拠として響いた。",
                            kr: "차갑게 상대를 바라보며 아무런 감정 없이 짧게 내뱉었다. {rival}의 몇 가지 변명은 오히려 당신의 귀에 가장 유력한 증거로 들렸다."
                        }
                    }],
                    options: [{ label: { zh: "收集證據", jp: "証拠確保", kr: "증거 확보" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "轉身離開",
                    jp: "背を向けて立ち去る",
                    kr: "등을 돌려 떠나다"
                },
                action: "node_next",
                rewards: {
                    tags: ["confronted_rival"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你什麼都沒說，轉身就走。你不打算從情敵的口中聽取任何「真相」，但這種逃避也讓你的心理壓力直線飆升。",
                            jp: "何も言わず、背を向けて歩き出した。恋敵の口からいかなる「真相」も聞くつもりはない。しかし、この逃避はあなたの心理的プレッシャーを急激に高めることになった。",
                            kr: "아무 말 없이 등을 돌려 걸어갔다. 연적의 입에서 나오는 어떤 '진실'도 들을 생각이 없다. 하지만 이런 도피는 당신의 심리적 압박감을 수직 상승시켰다."
                        }
                    }],
                    options: [{ label: { zh: "心理重擔", jp: "心理的重圧", kr: "심리적 중압감" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "{lover}知道你來嗎",
                    jp: "「{lover}は知ってるの？」",
                    kr: "「{lover}도 알아?」"
                },
                action: "node_next",
                rewards: {
                    tags: ["confronted_rival"],
                    varOps: [
                        { key: 'evidence_count', val: 2, op: '+' },
                        { key: 'trust',          val: 5, op: '+' }
                    ]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你一針見血地拋出這個問題。{rival}臉上的表情瞬間變得不自然。從對方的反應中，你不僅拿到了關鍵證據，也對{lover}還保留了一絲信任的餘地。",
                            jp: "核心を突く質問を投げかけた。{rival}の表情が一瞬不自然になった。相手の反応から決定的な証拠を手に入れただけでなく、{lover}に対する僅かな信頼の余地も残された。",
                            kr: "정곡을 찌르는 질문을 던졌다. {rival}의 표정이 순식간에 부자연스러워졌다. 상대의 반응에서 결정적인 증거를 얻었을 뿐만 아니라, {lover}에 대한 한 가닥 신뢰의 여지도 남겨두게 되었다."
                        }
                    }],
                    options: [{ label: { zh: "一針見血", jp: "核心を突く", kr: "정곡을 찌르다" }, action: "advance_chain" }]
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
                    zh: "你鼓起勇氣問了：<br>「下次，可以一起去{meet_location}嗎？」<br><br>{lover}沉默了一秒鐘。<br>那一秒，比你想像的還要漫長。",
                    jp: "勇気を振り絞って尋ねた。<br>「今度、一緒に{meet_location}に行きませんか？」<br><br>{lover}は一秒間沈黙した。<br>その一秒は、想像以上に長く感じられた。",
                    kr: "용기를 내어 물었다.<br>「다음에 같이 {meet_location}에 갈 수 있을까?」<br><br>{lover}은(는) 1초 동안 침묵했다.<br>그 1초는 당신이 상상했던 것보다 훨씬 길게 느껴졌다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "坦誠說出期待",
                    jp: "素直に期待を伝える",
                    kr: "기대감을 솔직하게 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["asked_out", "had_date"],
                    varOps: [
                        { key: 'affection', val: 20, op: '+' },
                        { key: 'trust',     val: 10, op: '+' }
                    ],
                    exp: 15
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有掩飾自己的緊張，坦誠地說這是一直以來的期待。<br>這份真誠打破了沉默，{lover}的嘴角微微上揚，輕輕點了頭。",
                            jp: "緊張を隠さず、ずっとそうしたかったのだと素直に伝えた。<br>その誠実さが沈黙を破り、{lover}は口元を少しほころばせ、小さく頷いた。",
                            kr: "긴장감을 숨기지 않고, 줄곧 기대해왔다고 솔직하게 말했다.<br>그 진심이 침묵을 깼고, {lover}은(는) 입가에 옅은 미소를 띠며 가볍게 고개를 끄덕였다."
                        }
                    }],
                    options: [{ label: { zh: "約定達成", jp: "約束成立", kr: "약속 성사" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "推託是偶然順路",
                    jp: "ついで・偶然だと言う",
                    kr: "가는 길에 우연이라고 둘러대다"
                },
                action: "node_next",
                rewards: {
                    tags: ["asked_out"],
                    varOps: [
                        { key: 'affection', val: 10, op: '+' },
                        { key: 'trust',     val: -5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "那漫長的一秒讓你退縮了，你趕緊補上一句「只是剛好順路」。<br>{lover}若有所思地看了你一眼，雖然答應了，但氣氛卻少了一點悸動。",
                            jp: "長く感じられた一秒に怯み、慌てて「ただのついでだから」と言い足した。<br>{lover}は何かを考えるようにあなたを一瞥した。承諾はしてくれたものの、雰囲気から少しだけときめきが失われた。",
                            kr: "그 길게 느껴진 1초에 겁을 먹고, 서둘러 '그냥 가는 길이라서'라고 덧붙였다.<br>{lover}은(는) 생각에 잠긴 듯 당신을 한 번 쳐다보았다. 승낙하긴 했지만, 분위기에서 설렘이 조금 줄어들었다."
                        }
                    }],
                    options: [{ label: { zh: "勉強邀約", jp: "ぎこちない誘い", kr: "어색한 약속" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "臨時改口作罷",
                    jp: "直前で取りやめる",
                    kr: "갑자기 말을 바꾸어 그만두다"
                },
                action: "node_next",
                rewards: {
                    tags: ["asked_out"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你終究沒有勇氣承受被拒絕的風險，結巴著改口說「沒事，下次再說吧」。<br>錯失的機會化成了內心的壓力，讓你感到無比懊悔。",
                            jp: "結局、拒絶されるリスクに耐える勇気が持てず、口ごもりながら「いや、やっぱりまた今度にしよう」と取りやめてしまった。<br>逃した機会が心の重圧へと変わり、激しい後悔の念に襲われた。",
                            kr: "결국 거절당할 위험을 감수할 용기가 없어, 말을 더듬으며 '아니야, 다음에 하자'고 말을 바꿨다.<br>놓쳐버린 기회는 마음속 압박감으로 변해, 엄청난 후회를 남겼다."
                        }
                    }],
                    options: [{ label: { zh: "錯失良機", jp: "好機を逃す", kr: "좋은 기회를 놓치다" }, action: "advance_chain" }]
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
                    zh: "{env_pack_visual}<br><br>你們在{env_light}的映照下並肩走著。<br><br>{lover}突然停下來，說了一句你沒想到的話：<br>「你有沒有想過，如果當初我們沒有遇見……」<br><br>話說到一半，沒有繼續。",
                    jp: "{env_pack_visual}<br><br>二人は{env_light}に照らされながら肩を並べて歩いている。<br><br>{lover}が突然立ち止まり、思いがけないことを口にした。<br>「考えたことある？もし、あの時私たちが出会っていなかったら……」<br><br>言葉は途中で途切れ、続きはなかった。",
                    kr: "{env_pack_visual}<br><br>두 사람은 {env_light}의 불빛 아래 나란히 걷고 있다.<br><br>{lover}이(가) 갑자기 걸음을 멈추고 예상치 못한 말을 꺼냈다.<br>「생각해 본 적 있어? 만약 그때 우리가 만나지 않았다면……」<br><br>말은 중간에 끊겼고, 더 이상 이어지지 않았다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "接話：那我應該會很可惜",
                    jp: "言葉を継ぐ：私ならとても残念に思う",
                    kr: "말을 잇다：그럼 난 엄청 아쉬웠을 거야"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_key_moment"],
                    varOps: [
                        { key: 'affection', val: 25, op: '+' },
                        { key: 'trust',     val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你停下腳步，認真地接上話：「那我應該會覺得非常可惜。」<br>這個直白的答案讓{lover}眼底閃過一抹溫柔的光芒，你們之間的情感羈絆變得更深了。",
                            jp: "立ち止まり、真剣な表情で言葉を返した。「私なら、ものすごく残念に思うよ」<br>その率直な答えに{lover}の瞳の奥に優しい光が宿り、二人の絆はさらに深まった。",
                            kr: "걸음을 멈추고 진지하게 말을 이었다. 「그럼 난 엄청 아쉬웠을 것 같아.」<br>그 솔직한 대답에 {lover}의 눈가에 부드러운 빛이 스쳤고, 두 사람 사이의 유대감은 더욱 깊어졌다."
                        }
                    }],
                    options: [{ label: { zh: "情意漸濃", jp: "深まる情愛", kr: "깊어지는 마음" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "笑著轉移話題",
                    jp: "笑って話題を変える",
                    kr: "웃으며 화제를 돌리다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_key_moment"],
                    varOps: [{ key: 'affection', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "氣氛突然變得有些沉重，你笑著打哈哈，把話題轉向了旁邊的風景。<br>雖然化解了當下的異樣感，但你也避開了一次交心的機會。",
                            jp: "空気が急に重くなりかけたため、笑ってごまかし、隣の風景へと話題をそらした。<br>その場の妙な空気は和よいだが、心を通い合わせる機会は避けてしまった。",
                            kr: "분위기가 갑자기 무거워지자, 웃으며 얼버무리고 옆의 풍경으로 화제를 돌렸다.<br>당장의 어색함은 모면했지만, 마음을 터놓을 기회는 피해버리고 말았다."
                        }
                    }],
                    options: [{ label: { zh: "避開交心", jp: "本音を避ける", kr: "진심을 피하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "認真問對方想說什麼",
                    jp: "相手が何を言いたいのか真剣に聞く",
                    kr: "상대가 무슨 말을 하려는지 진지하게 묻다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_key_moment"],
                    varOps: [{ key: 'trust', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你靜靜地看著{lover}的眼睛：「如果沒有遇見，然後呢？你想說什麼？」<br>你的傾聽給予了對方極大的安全感，讓這份信任感更加堅固。",
                            jp: "静かに{lover}の目を見つめた。「出会っていなかったら、どうなってた？何を言おうとしたの？」<br>あなたのその傾聴する姿勢が相手に大きな安心感を与え、信頼関係をより強固なものにした。",
                            kr: "가만히 {lover}의 눈을 바라보았다. 「만나지 않았다면, 그리고? 무슨 말을 하고 싶었던 거야?」<br>당신의 경청하는 태도는 상대에게 큰 안정감을 주었고, 신뢰감을 더욱 단단하게 만들었다."
                        }
                    }],
                    options: [{ label: { zh: "建立信任", jp: "信頼関係の構築", kr: "신뢰 구축" }, action: "advance_chain" }]
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
                    zh: "你和{lover}有一段完整的時間。<br><br>{env_pack_visual}<br><br>沒有打擾，沒有外部壓力。<br>只有你們兩個人，和一些可以做的選擇。",
                    jp: "あなたと{lover}には、たっぷりと時間がある。<br><br>{env_pack_visual}<br><br>邪魔者もいなければ、外からのプレッシャーもない。<br>ただ二人きり、そしていくつかの選択肢があるだけだ。",
                    kr: "당신과 {lover}에게 온전한 시간이 주어졌다.<br><br>{env_pack_visual}<br><br>방해하는 사람도, 외부의 압력도 없다.<br>오직 두 사람, 그리고 당신이 할 수 있는 몇 가지 선택만이 있을 뿐이다."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "時間還在繼續，這份寧靜屬於你們。",
                    jp: "時間はまだ流れている。この穏やかな時間は二人だけのものだ。",
                    kr: "시간은 여전히 흐르고 있다. 이 평온함은 두 사람만의 것이다."
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
                action: "node_next",
                condition: { vars: [{ key: 'time_together', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'time_together', val: 1,  op: '-' },
                        { key: 'trust',         val: 18, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你訴說著平時藏在心底的話，而{lover}比你想像的更認真在聽。<br>有些事，說出口之後就不一樣了。",
                            jp: "普段は心の奥底にしまっている言葉を紡ぎ出し、{lover}は想像以上に真剣に耳を傾けてくれた。<br>言葉にしたことで、何かが変わった。",
                            kr: "평소 마음속 깊이 숨겨두었던 이야기들을 꺼냈고, {lover}은(는) 상상 이상으로 진지하게 들어주었다.<br>어떤 일들은 입 밖으로 내고 나면 달라진다."
                        } 
                    }],
                    options: [{ label: { zh: "彼此信任", jp: "互いの信頼", kr: "서로의 신뢰" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "一起做平時不做的事",
                    jp: "普段しないことを一緒にする",
                    kr: "평소에 안 하는 일을 함께 하다"
                },
                check: { stat: 'AGI', val: 3 }, // 可以依據遊戲調性調整
                action: "node_next",
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
                    dialogue: [{ 
                        text: { 
                            zh: "你們嘗試了一些有點冒險或不同尋常的舉動。{lover}笑了。<br>你記住了這一刻——不是因為特別，而是因為很自然。",
                            jp: "少し冒険的で非日常的なことに一緒に挑戦した。{lover}が笑った。<br>あなたはこの瞬間を心に刻んだ——特別だからではなく、とても自然だったからだ。",
                            kr: "조금 모험적이거나 평소와는 다른 행동을 함께 시도해 보았다. {lover}이(가) 웃었다.<br>당신은 이 순간을 기억했다——특별해서가 아니라, 너무나 자연스러웠기 때문이다."
                        } 
                    }],
                    options: [{ label: { zh: "創造回憶", jp: "思い出を作る", kr: "추억 만들기" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "說出一直沒說的感覺",
                    jp: "ずっと言えなかった気持ちを言う",
                    kr: "계속 못 했던 감정을 말하다"
                },
                action: "node_next",
                condition: {
                    vars: [
                        { key: 'time_together', val: 1,  op: '>=' },
                        { key: 'affection',     val: 30, op: '>=' } // 需要高好感才能觸發
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
                    dialogue: [{ 
                        text: { 
                            zh: "你藉著氣氛，隱晦但真誠地表達了自己的愛意。<br>{lover}沉默了一下，然後，對方的表情變了。<br>你不確定那是什麼——但絕對不是壞事。",
                            jp: "雰囲気に後押しされ、遠回しに、しかし真摯に自分の愛情を伝えた。<br>{lover}は少し沈黙し、そして表情を変えた。<br>それが何を意味するのかは分からないが、決して悪いことではないはずだ。",
                            kr: "분위기를 타서 은근하지만 진심을 다해 자신의 애정을 표현했다.<br>{lover}은(는) 잠시 침묵하더니, 이내 표정이 변했다.<br>그게 무엇인지 확신할 순 없지만——절대 나쁜 뜻은 아니다."
                        } 
                    }],
                    options: [{ label: { zh: "心照不宣", jp: "暗黙の了解", kr: "이심전심" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "靜靜享受這份安寧",
                    jp: "このまま静かに安らぎを楽しむ",
                    kr: "이 평온함을 조용히 즐기다"
                },
                action: "advance_chain", // 👈 離開 HUB 推進主線
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
                    zh: "{lover}看起來{state_modifier}。<br><br>你沒有直接問，但你注意到了。<br>你可以假裝沒看見，或者用你自己的方式，讓對方知道有人在。",
                    jp: "{lover}は{state_modifier}に見える。<br><br>直接は聞かなかったが、あなたは気づいている。<br>見なかったふりをするか、それとも自分なりのやり方で、味方がいることを相手に伝えるか。",
                    kr: "{lover}은(는) {state_modifier} 보인다.<br><br>직접 묻지는 않았지만, 당신은 눈치챘다.<br>못 본 척할 수도 있고, 혹은 당신만의 방식으로 누군가 곁에 있다는 걸 알게 할 수도 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "默默做件小事",
                    jp: "黙ってさりげなく助ける",
                    kr: "조용히 작은 도움을 주다"
                },
                action: "node_next",
                rewards: {
                    tags: ["showed_care"],
                    varOps: [
                        { key: 'trust',     val: 20, op: '+' },
                        { key: 'affection', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有說破，只是默默地做了一件能讓對方好過一點的事。{lover}察覺到了這份不著痕跡的體貼，對你的信任感加深了。",
                            jp: "あえて言葉にはせず、ただ黙って相手が少しでも楽になるようなことをした。{lover}はそのさりげない気遣いに気づき、あなたへの信頼を深めた。",
                            kr: "아무 말 없이, 그저 조용히 상대를 편하게 해줄 일을 하나 했다. {lover}은(는) 그 티 나지 않는 배려를 알아채고 당신에 대한 신뢰를 깊게 가졌다."
                        }
                    }],
                    options: [{ label: { zh: "無聲的體貼", jp: "無言の気遣い", kr: "말 없는 배려" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "找藉口靠近",
                    jp: "口実を作って近づく",
                    kr: "구실을 만들어 다가가다"
                },
                action: "node_next",
                rewards: {
                    tags: ["showed_care"],
                    varOps: [{ key: 'affection', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你隨便找了個藉口靠近對方，什麼也不解釋。雖然行為顯得有些笨拙，但也成功傳達了你的在意。",
                            jp: "適当な口実を作って相手に近づき、何も説明しなかった。少し不器用な行動だったが、あなたの気遣いはうまく伝わった。",
                            kr: "적당한 구실을 대어 상대에게 다가가 아무것도 설명하지 않았다. 조금 서툰 행동이었지만, 당신의 관심은 성공적으로 전달되었다."
                        }
                    }],
                    options: [{ label: { zh: "笨拙的關心", jp: "不器用な気遣い", kr: "서툰 관심" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "保持距離",
                    jp: "距離を保つ",
                    kr: "거리를 두다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'pressure', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你告訴自己這不關你的事，刻意保持了距離。雖然避免了越界，但眼睜睜看著對方獨自承受，讓你的心裡有些沉悶。",
                            jp: "これは自分には関係のないことだと言い聞かせ、意図的に距離を置いた。一線を越えることは避けたが、相手が一人で抱え込んでいるのをただ見ているのは、少し心が痛んだ。",
                            kr: "이건 내 일이 아니라고 속으로 되뇌며 일부러 거리를 두었다. 선을 넘는 것은 피했지만, 상대가 혼자 견뎌내는 걸 그저 지켜보는 것은 마음을 무겁게 했다."
                        }
                    }],
                    options: [{ label: { zh: "袖手旁觀", jp: "傍観する", kr: "방관하다" }, action: "advance_chain" }]
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
                    zh: "你們不知道怎麼聊到了這個話題。<br><br>{lover}說了一些平時不會對別人說的話。<br>然後停下來，像是意識到自己說太多了，看著你：<br>「……算了，你不用回答。」",
                    jp: "どうしてその話になったのかは分からない。<br><br>{lover}は、普段は人に言わないようなことを口にした。<br>そして立ち止まり、少し言い過ぎたことに気づいたようにあなたを見て言った：<br>「……やっぱりいい。返事はしなくていいよ」",
                    kr: "어쩌다 그 이야기가 나왔는지는 모른다.<br><br>{lover}은(는) 평소 남들에게 하지 않는 말을 꺼냈다.<br>그러다 말이 너무 길어졌다는 걸 깨달은 듯 말을 멈추고 당신을 보며 말했다:<br>「……됐어, 대답 안 해도 돼.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "認真說出想法",
                    jp: "真剣に自分の考えを話す",
                    kr: "진지하게 내 생각을 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_honest_moment"],
                    varOps: [
                        { key: 'trust',     val: 25, op: '+' },
                        { key: 'affection', val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有順著對方的話結束話題，而是認真地給出了自己的想法。這份珍貴的坦誠，讓你們之間建立起了深刻的羈絆。",
                            jp: "相手の言葉に流されて話を終わらせず、真剣に自分の考えを伝えた。この貴重な素直さが、二人の間に深い絆を築き上げた。",
                            kr: "상대의 말에 휩쓸려 대화를 끝내지 않고, 진지하게 당신의 생각을 전했다. 이 소중한 솔직함이 두 사람 사이에 깊은 유대감을 형성했다."
                        }
                    }],
                    options: [{ label: { zh: "深刻羈絆", jp: "深い絆", kr: "깊은 유대감" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "給予對方空間",
                    jp: "相手に空間を与える",
                    kr: "상대에게 여유를 주다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_honest_moment"],
                    varOps: [{ key: 'trust', val: 12, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你看出了對方的侷促，輕描淡寫地帶過了這個話題。雖然沒有深聊，但這種不強求的溫柔，也讓對方感到十分安心。",
                            jp: "相手の気まずさを察し、さらりと話題を変えた。深く語り合うことはなかったが、その無理を強いらない優しさに、相手は大きな安心感を覚えた。",
                            kr: "상대의 불편함을 눈치채고, 가볍게 화제를 넘겼다. 깊은 대화를 나누진 않았지만, 강요하지 않는 그 다정함이 상대에게 큰 안도감을 주었다."
                        }
                    }],
                    options: [{ label: { zh: "溫柔的退讓", jp: "優しい配慮", kr: "다정한 물러섬" }, action: "advance_chain" }]
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
                    zh: "普通的日子。<br><br>但你發現，普通的日子裡，{lover}的存在佔了越來越多的比例。<br><br>你可以選擇讓這種感覺繼續生長，<br>或者試著說清楚它。",
                    jp: "ありふれた日々。<br><br>しかし、そのありふれた日々の中で、{lover}の存在が占める割合がどんどん大きくなっていることに気づいた。<br><br>この感情が育っていくのをそのまま見守るか、<br>それとも、言葉にしてはっきりさせるか。",
                    kr: "평범한 나날들.<br><br>하지만 그 평범한 일상 속에서 {lover}의 존재가 차지하는 비중이 점점 커지고 있음을 깨달았다.<br><br>이 감정이 계속 자라나도록 내버려 둘 수도 있고,<br>아니면 확실하게 말해볼 수도 있다."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "平凡的日常還在繼續，這份感情會如何生長？",
                    jp: "平凡な日常はまだ続く。この感情はどう育っていくのだろう？",
                    kr: "평범한 일상은 계속된다. 이 감정은 어떻게 자라날까?"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "傳一則小訊息",
                    jp: "何気ないメッセージを送る",
                    kr: "가벼운 메시지를 보내다"
                },
                action: "node_next",
                condition: { vars: [{ key: 'daily_moments', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'daily_moments', val: 1,  op: '-' },
                        { key: 'affection',     val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你傳了一則算不算在意的訊息。{lover}回了。不算快，但也沒有很慢。你看了很多遍才放下手機。",
                            jp: "気にしているのかどうかわからないようなメッセージを送った。{lover}から返事が来た。早くはないが、遅くもない。あなたはそれを何度も見返してから、スマホを置いた。",
                            kr: "신경 쓰는 건지 아닌지 애매한 메시지를 보냈다. {lover}에게서 답장이 왔다. 빠르지도, 늦지도 않은 속도로. 당신은 여러 번 다시 읽고 나서야 폰을 내려놓았다."
                        } 
                    }],
                    options: [{ label: { zh: "日常的牽絆", jp: "日常の絆", kr: "일상의 유대" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "留意對方的小細節",
                    jp: "相手の細部に目を向ける",
                    kr: "상대의 작은 디테일을 살피다"
                },
                check: { stat: 'INT', val: 3 },
                action: "node_next",
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
                onFail: {
                    varOps: [{ key: 'daily_moments', val: 1, op: '-' }],
                    text: {
                        zh: "你試圖解讀對方的舉動，卻反而讓自己陷入了沒有必要的胡思亂想之中。",
                        jp: "相手の行動を深読みしようとして、かえって不必要な妄想に陥ってしまった。",
                        kr: "상대의 행동을 해석하려다 도리어 쓸데없는 잡념에 빠지고 말았다."
                    }
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你不動聲色地觀察著。你注意到{lover}在你面前會做的一些小動作。也許對方也在等什麼。",
                            jp: "顔色を変えずに観察した。あなたは、{lover}があなたの前で見せるちょっとした仕草に気づいた。相手も何かを待っているのかもしれない。",
                            kr: "내색하지 않고 관찰했다. 당신은 {lover}이(가) 당신 앞에서 하는 작은 행동들을 눈치챘다. 어쩌면 상대도 무언가를 기다리고 있는지도 모른다."
                        } 
                    }],
                    options: [{ label: { zh: "無聲的默契", jp: "無言の繋がり", kr: "무언의 교감" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "寫下未送出的話",
                    jp: "送らなかった言葉を書く",
                    kr: "보내지 않은 말을 적다"
                },
                action: "node_next",
                condition: { vars: [{ key: 'daily_moments', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'daily_moments', val: 1,  op: '-' },
                        { key: 'trust',         val: 10, op: '+' },
                        { key: 'affection',     val: 8,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "在安靜的夜晚，你寫下了一段話，把它存了下來。有一天，也許你會送出去。也許不會。但光是寫出來，你就更清楚自己在想什麼了。",
                            jp: "静かな夜、ある言葉を書き留め、保存した。いつか送るかもしれないし、送らないかもしれない。しかし、文字にするだけでも自分の気持ちがはっきりと見えてきた。",
                            kr: "조용한 밤, 어떤 말을 적어 저장해 두었다. 언젠가 보낼지도, 안 보낼지도 모른다. 하지만 적어두는 것만으로도 내 마음이 더 선명해졌다."
                        } 
                    }],
                    options: [{ label: { zh: "釐清思緒", jp: "思考の整理", kr: "생각 정리" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "🚪 讓日子繼續流動",
                    jp: "🚪 このまま日々を過ごす",
                    kr: "🚪 이대로 날을 보내다"
                },
                action: "advance_chain" // 👈 離開 HUB 推進主線
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
                    zh: "{rival}出現了。<br><br>不是在挑釁你，而是在{lover}身邊，用一種讓你說不清楚的方式靠近。<br><br>你感覺到了，但你不確定這算不算你的事。",
                    jp: "{rival}が現れた。<br><br>あなたを挑発しているわけではない。だが{lover}の傍で、なんとも言えない絶妙な距離感で近づいている。<br><br>あなたはそれに気づいたが、自分が首を突っ込むべきことなのか確信が持てない。",
                    kr: "{rival}이(가) 나타났다.<br><br>당신을 도발하는 게 아니다. 그저 {lover} 곁에서, 뭐라 말하기 애매한 방식으로 가까이 다가가고 있다.<br><br>당신은 그것을 느꼈지만, 자신이 나설 일인지 확신하지 못한다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "直接問你們是什麼關係",
                    jp: "直接関係を聞く",
                    kr: "직접 관계를 묻다"
                },
                action: "node_next",
                rewards: {
                    tags: ["handled_interference"],
                    varOps: [
                        { key: 'trust',    val: 15, op: '+' },
                        { key: 'pressure', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你不想獨自猜疑，直接向{lover}開口確認了你們的關係。<br>這個直球讓局面瞬間明朗，雖然帶來了不小的壓力，但也換來了對方坦誠的交代。",
                            jp: "一人で疑うのは嫌だった。あなたは{lover}に直接二人の関係を確認した。<br>その直球の問いは事態を瞬時に明確にした。少なからずプレッシャーは生じたが、相手からの誠実な答えを得られた。",
                            kr: "혼자 의심하기 싫어, {lover}에게 두 사람의 관계를 직접 확인했다.<br>그 돌직구는 상황을 순식간에 명확하게 만들었다. 적잖은 압박감을 가져왔지만, 상대의 솔직한 대답을 얻어냈다."
                        }
                    }],
                    options: [{ label: { zh: "消除疑慮", jp: "疑念を晴らす", kr: "의심 해소" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不動聲色繼續觀察",
                    jp: "静かに観察を続ける",
                    kr: "조용히 계속 관찰하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["handled_interference"],
                    varOps: [{ key: 'pressure', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你選擇按兵不動，默默看著他們的互動。<br>沒有行動代表沒有衝突，但那些模糊的猜測在你心中發酵，成為了沉重的心理壓力。",
                            jp: "動かず、二人のやり取りを黙って見守ることにした。<br>行動を起こさなければ衝突は起きない。しかし、曖昧な推測が心の中で発酵し、重い心理的プレッシャーとなった。",
                            kr: "가만히 서서 두 사람의 모습을 묵묵히 지켜보기로 했다.<br>행동하지 않으면 충돌도 없다. 하지만 모호한 추측들이 마음속에서 부풀어 올라 무거운 심리적 압박감이 되었다."
                        }
                    }],
                    options: [{ label: { zh: "暗自忍受", jp: "一人で耐える", kr: "혼자 참다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "製造機會宣示主權",
                    jp: "機会を作り行動で示す",
                    kr: "기회를 만들어 행동으로 보여주다"
                },
                action: "node_next",
                rewards: {
                    tags: ["handled_interference"],
                    varOps: [
                        { key: 'affection', val: 15, op: '+' },
                        { key: 'pressure',  val: 5,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有說話，而是直接走上前，用一個自然的舉動將{lover}的注意力拉回自己身上。<br>這個聰明的舉動不僅化解了危機，還讓{lover}感受到了你的在乎。",
                            jp: "何も言わず、ただ歩み寄って自然な振る舞いで{lover}の注意を自分に引き戻した。<br>この賢明な行動は危機を乗り越えただけでなく、あなたが気にかけていることを{lover}に伝えられた。",
                            kr: "아무 말 없이 다가가, 자연스러운 행동으로 {lover}의 주의를 당신에게로 다시 돌려놓았다.<br>이 영리한 행동은 위기를 모면했을 뿐만 아니라, 당신이 신경 쓰고 있다는 것을 {lover}가 느끼게 해주었다."
                        }
                    }],
                    options: [{ label: { zh: "巧妙化解", jp: "巧みに切り抜ける", kr: "교묘하게 모면하다" }, action: "advance_chain" }]
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
                    zh: "你做的某件事，被{lover}誤解了。<br><br>對方的態度明顯不一樣，但沒有直接說。<br>這種沉默比爭吵更難受。",
                    jp: "あなたの何気ない行動が、{lover}に誤解されてしまった。<br><br>相手の態度は明らかに普段と違うが、直接は何も言ってこない。<br>この沈黙は、口論よりも辛い。",
                    kr: "당신이 한 어떤 행동을 {lover}이(가) 오해하고 말았다.<br><br>상대의 태도가 명백히 달라졌지만, 직접 말하지는 않는다.<br>이런 침묵은 말다툼보다 더 견디기 힘들다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "主動解釋不讓誤會發酵",
                    jp: "自ら説明し誤解を放置しない",
                    kr: "직접 설명해 오해를 풀다"
                },
                action: "node_next",
                rewards: {
                    tags: ["resolved_misunderstanding"],
                    varOps: [
                        { key: 'trust',    val: 20, op: '+' },
                        { key: 'pressure', val: -8, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深知冷戰的殺傷力，於是立刻拉住對方，將事情的原委解釋清楚。<br>誤會解開後，{lover}的神情放鬆下來，你們對彼此的信任也加深了。",
                            jp: "冷戦の破壊力を知っているからこそ、すぐに相手を引き留め、事の経緯をきちんと説明した。<br>誤解が解けると{lover}の表情は和らぎ、互いの信頼もさらに深まった。",
                            kr: "냉전의 파괴력을 잘 알기에, 즉시 상대를 붙잡고 일의 자초지종을 명확히 설명했다.<br>오해가 풀리자 {lover}의 표정이 편안해졌고, 서로에 대한 신뢰도 더 깊어졌다."
                        }
                    }],
                    options: [{ label: { zh: "重歸於好", jp: "仲直り", kr: "화해" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "等對方先開口",
                    jp: "相手が口を開くのを待つ",
                    kr: "상대가 먼저 말하길 기다리다"
                },
                action: "node_next",
                rewards: {
                    tags: ["resolved_misunderstanding"],
                    varOps: [{ key: 'pressure', val: 12, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你拉不下臉，決定等對方先來問你。<br>時間在兩人之間僵持，雖然最後事情還是說開了，但這段等待的時間讓壓力變得相當沉重。",
                            jp: "意地を張り、相手から聞いてくるのを待つことにした。<br>二人の間で時間が膠着し、最終的には話はついたものの、待っていた時間がプレッシャーをかなり重くした。",
                            kr: "자존심 때문에, 상대가 먼저 물어보기를 기다리기로 했다.<br>두 사람 사이에 시간이 교착되었고, 결국 이야기는 풀렸지만 그 기다림의 시간이 압박감을 꽤 무겁게 만들었다."
                        }
                    }],
                    options: [{ label: { zh: "僵持不下", jp: "膠着状態", kr: "교착 상태" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "裝作沒事讓時間解決",
                    jp: "何もなかったふりをする",
                    kr: "아무 일 없던 척하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["resolved_misunderstanding"],
                    varOps: [
                        { key: 'trust',    val: -10, op: '+' },
                        { key: 'pressure', val: 8,   op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你裝作一切正常，試圖用日常的相處來沖淡這份尷尬。<br>誤會或許被時間掩蓋了，但在你們心裡，卻留下了一道未解的裂痕（信任度下降）。",
                            jp: "すべて正常であるかのように振る舞い、日常の付き合いでこの気まずさを薄めようとした。<br>誤解は時間に隠されたかもしれないが、二人の心には未解決の亀裂が残った（信頼度低下）。",
                            kr: "모든 게 정상인 척하며, 일상적인 행동으로 이 어색함을 희석시키려 했다.<br>오해는 시간에 가려졌을지 모르지만, 두 사람의 마음속에는 풀리지 않은 균열이 남았다(신뢰도 하락)."
                        }
                    }],
                    options: [{ label: { zh: "留下裂痕", jp: "残された亀裂", kr: "남겨진 균열" }, action: "advance_chain" }]
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
                    zh: "流言已經控制不住了。<br><br>所有人都在討論你和{lover}的關係，<br>有些人帶著善意，有更多人帶著惡意。<br><br>{lover}給你發了一條訊息：<br>「我們需要談談。」",
                    jp: "噂はもう抑えきれない。<br><br>誰もがあなたと{lover}の関係について噂している。<br>好意的な人もいるが、悪意を持っている人の方が多い。<br><br>{lover}からメッセージが届いた：<br>「少し話そう」",
                    kr: "소문은 이미 걷잡을 수 없게 되었다.<br><br>모두가 당신과 {lover}의 관계에 대해 이야기하고 있다.<br>호의적인 사람도 있지만, 악의를 품은 사람이 훨씬 많다.<br><br>{lover}에게서 메시지가 왔다:<br>「우리 얘기 좀 해.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "坦誠感覺不管結果",
                    jp: "結果を問わず素直に話す",
                    kr: "결과에 상관없이 솔직하게 말하다"
                },
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'trust',    val: 25,  op: '+' },
                        { key: 'pressure', val: -20, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "見面時，你沒有顧慮外人的眼光，將內心的真實想法傾瀉而出。<br>這份坦誠像利刃般切開了流言的陰霾。你們選擇相信彼此，壓力瞬間得到了釋放。",
                            jp: "会った時、他人の目は気にせず、心の中の本当の思いをすべて吐き出した。<br>その素直さは鋭い刃のように噂の陰りを切り裂いた。互いを信じることを選び、プレッシャーは瞬時に解放された。",
                            kr: "만났을 때, 남들의 시선은 신경 쓰지 않고 마음속 진심을 모두 쏟아냈다.<br>그 솔직함은 날카로운 칼날처럼 소문의 먹구름을 갈랐다. 서로를 믿기로 선택했고, 압박감은 순식간에 해소되었다."
                        }
                    }],
                    options: [{ label: { zh: "斬斷流言", jp: "噂を断ち切る", kr: "소문을 끊어내다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "保護{lover}放後感覺",
                    jp: "{lover}を守り自分は後回し",
                    kr: "내 감정보다 {lover} 보호"
                },
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'affection', val: 20,  op: '+' },
                        { key: 'pressure',  val: -10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你把自己的委屈藏在心裡，第一時間站出來維護了{lover}。<br>你的犧牲與保護欲讓{lover}深受感動，雖然你背負了更多，但你們的感情卻變得無比堅定。",
                            jp: "自分の悔しさは心にしまい、真っ先に{lover}をかばうために前に出た。<br>あなたの自己犠牲と保護欲に{lover}は深く感動し、あなたがより多くを背負うことになっても、二人の感情は比類なきほど強固になった。",
                            kr: "자신의 억울함은 마음속에 숨기고, 가장 먼저 나서서 {lover}을(를) 보호했다.<br>당신의 희생과 보호 본능에 {lover}은(는) 깊이 감동했고, 당신이 짐을 더 지게 되었지만 두 사람의 감정은 무엇보다 단단해졌다."
                        }
                    }],
                    options: [{ label: { zh: "自我犧牲", jp: "自己犠牲", kr: "자기희생" }, action: "advance_chain" }]
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
                    zh: "在{env_room}裡，只有你們兩個人。<br><br>{env_pack_visual}<br><br>有些話，你覺得今天不說，可能再也找不到機會說了。",
                    jp: "{env_room}には、二人しかいない。<br><br>{env_pack_visual}<br><br>今日言わなければ、二度と言う機会はないかもしれない言葉がある。",
                    kr: "{env_room}에는, 두 사람뿐이다.<br><br>{env_pack_visual}<br><br>오늘 말하지 않으면, 다시는 말할 기회가 없을지도 모르는 말들이 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "勇敢說出口",
                    jp: "勇気を出して言う",
                    kr: "용기 내어 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_deep_talk"],
                    varOps: [
                        { key: 'trust',       val: 20, op: '+' },
                        { key: 'affection',   val: 15, op: '+' },
                        { key: 'rank_points', val: 10, op: '+' }  // 養成劇本觸發時也有效
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸了一口氣，將心底的那些話毫無保留地說了出來。<br>話音落下的瞬間，某種無形的壁壘被打破了。這場深刻的對話，將你們的關係推向了全新的高度。",
                            jp: "深呼吸をして、心の奥底にある言葉を余すところなく口にした。<br>言葉が終わった瞬間、見えない壁が打ち破られた。この深い対話が、二人の関係を全く新しい高みへと押し上げた。",
                            kr: "심호흡을 하고, 마음속 깊은 곳의 말들을 숨김없이 털어놓았다.<br>말이 끝나는 순간, 보이지 않는 벽이 허물어졌다. 이 깊은 대화가 두 사람의 관계를 완전히 새로운 차원으로 끌어올렸다."
                        }
                    }],
                    options: [{ label: { zh: "打破壁壘", jp: "壁を壊す", kr: "장벽 허물기" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "沒說，對方已懂",
                    jp: "言わなくても伝わった",
                    kr: "말 안 해도 알다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_deep_talk"],
                    varOps: [{ key: 'affection', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "話到了嘴邊，你最終還是嚥了下去。但當你對上{lover}的眼神時，你發現對方已經全部明白了。<br>不需要言語，這種極致的默契讓愛意在靜謐中達到了頂峰。",
                            jp: "喉まで出かかった言葉を、最後は飲み込んだ。しかし{lover}の目と合った時、相手がすべてを理解していることに気づいた。<br>言葉は必要ない。この極限の阿吽の呼吸が、静寂の中で愛情を頂点に達しさせた。",
                            kr: "입가까지 맴돌던 말을 결국 삼키고 말았다. 하지만 {lover}와(과) 눈이 마주쳤을 때, 상대가 이미 모든 것을 이해하고 있음을 알았다.<br>말은 필요 없다. 이 극한의 교감이 정적 속에서 애정을 최고조로 끌어올렸다."
                        }
                    }],
                    options: [{ label: { zh: "極致默契", jp: "阿吽の呼吸", kr: "극한의 교감" }, action: "advance_chain" }]
                }
            }
        ]
    });

// ============================================================
    // 💌 [CLIMAX] 戀愛路線高潮節點 × 5
    // ============================================================

    // CLIMAX-A：告白時刻（基礎戀愛線通用）
    DB.templates.push({
        id: 'rom_climax_confession',
        type: 'climax',
        reqTags: ['romance'],
        dialogue: [
            {
                text: {
                    zh: "你已經想過這個時刻很多次了。<br><br>現在它真的來了。<br><br>{lover}就在你面前，{env_pack_visual}<br><br>你知道，說出口之後，一切都會不一樣。",
                    jp: "この瞬間のことは、もう何度も頭の中でシミュレーションしてきた。<br><br>そして今、それが現実となった。<br><br>目の前に{lover}がいる。{env_pack_visual}<br><br>言葉にしてしまえば、すべてが変わってしまうことをあなたは知っている。",
                    kr: "이 순간을 이미 수없이 상상해 왔다.<br><br>이제 그것이 정말로 다가왔다.<br><br>{lover}이(가) 당신 눈앞에 있다. {env_pack_visual}<br><br>입 밖으로 내뱉고 나면, 모든 것이 달라질 거란 걸 당신은 알고 있다."
                }
            }
        ],
        options: [
            // 好感度和信任度都高：雙向確認
            {
                label: {
                    zh: "直白說出心意",
                    jp: "素直に気持ちを伝える",
                    kr: "마음을 솔직하게 전하다"
                },
                condition: {
                    vars: [
                        { key: 'affection', val: 40, op: '>=' },
                        { key: 'trust',     val: 35, op: '>=' }
                    ]
                },
                action: "node_next",
                rewards: {
                    tags: ["confessed", "mutual_feeling"],
                    exp: 50
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸一口氣，將這段時間累積的感情化作最直接的言語。<br>{lover}定定地看著你，眼中閃爍著同樣的光芒。你們的心意在這一刻完美交匯。",
                            jp: "深呼吸をして、これまで募らせてきた感情を最もストレートな言葉にした。<br>{lover}はあなたを真っ直ぐに見つめ、その瞳には同じ光が宿っていた。二人の想いがこの瞬間、完璧に交差した。",
                            kr: "심호흡을 하고, 그동안 쌓아온 감정을 가장 직접적인 말로 바꾸어 전했다.<br>{lover}은(는) 당신을 지그시 바라보았고, 그 눈동자에는 같은 빛이 일렁이고 있었다. 두 사람의 마음이 이 순간 완벽하게 교차했다."
                        }
                    }],
                    options: [{ label: { zh: "雙向奔赴", jp: "両思い", kr: "서로를 향한 마음" }, action: "advance_chain" }]
                }
            },
            // 好感度高但信任不夠：半表白
            {
                label: {
                    zh: "用行動代替言語",
                    jp: "言葉より行動で示す",
                    kr: "말 대신 행동으로 보여주다"
                },
                condition: { vars: [{ key: 'affection', val: 35, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["confessed"],
                    varOps: [{ key: 'affection', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有說話，而是鼓起勇氣，輕輕握住了對方的手。<br>雖然沒有明確的言語承諾，但這個溫柔的舉動已經勝過千言萬語，拉近了彼此的距離。",
                            jp: "言葉にはせず、勇気を出してそっと相手の手に触れた。<br>明確な言葉での約束はないが、その優しい行動は千の言葉よりも雄弁に、二人の距離を縮めた。",
                            kr: "아무 말 없이 용기를 내어 조용히 상대의 손을 잡았다.<br>명확한 말로 한 약속은 없지만, 이 다정한 행동은 천 마디 말보다 더 많은 것을 전하며 서로의 거리를 좁혔다."
                        }
                    }],
                    options: [{ label: { zh: "無聲的告白", jp: "無言の告白", kr: "무언의 고백" }, action: "advance_chain" }]
                }
            },
            // 信任夠但好感度不足：坦誠說不確定
            {
                label: {
                    zh: "坦白內心的困惑",
                    jp: "心の迷いを打ち明ける",
                    kr: "마음속 혼란을 털어놓다"
                },
                condition: { vars: [{ key: 'trust', val: 35, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["confessed"],
                    varOps: [{ key: 'trust', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有強求結果，而是坦白了自己內心的掙扎與不確定。<br>這份真誠的脆弱非但沒有推開對方，反而讓{lover}更加心疼你，加深了你們之間的信任。",
                            jp: "結果を急がず、自分の心の中の葛藤と迷いを素直に打ち明けた。<br>その誠実な弱さは相手を遠ざけるどころか、かえって{lover}の心を動かし、二人の信頼をより深いものにした。",
                            kr: "결과를 서두르지 않고, 내면의 갈등과 불확실함을 솔직하게 털어놓았다.<br>이 진실된 나약함은 상대를 밀어내기는커녕, 오히려 {lover}의 마음을 아프게 하며 두 사람 사이의 신뢰를 깊게 만들었다."
                        }
                    }],
                    options: [{ label: { zh: "展現脆弱", jp: "弱さを見せる", kr: "나약함 드러내기" }, action: "advance_chain" }]
                }
            },
            // 保底：什麼都說不出來
            {
                label: {
                    zh: "時機不對，先算了",
                    jp: "タイミングが悪い。やめておく",
                    kr: "타이밍이 안 좋아. 일단 넘어가다"
                },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'pressure', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "話到了嘴邊，你最終還是嚥了下去。你笑著轉移了話題。<br>錯失的機會化作沉重的壓力，緊緊壓在你的心頭，讓你感到無比懊悔。",
                            jp: "喉まで出かかった言葉を、結局飲み込んでしまった。笑って話題をそらす。<br>逃したチャンスは重いプレッシャーとなり、心を強く締め付け、深い後悔を残した。",
                            kr: "입가까지 맴돌던 말을 결국 삼키고 말았다. 웃으며 화제를 돌렸다.<br>놓쳐버린 기회는 무거운 압박감이 되어 마음을 짓누르고, 엄청난 후회를 남겼다."
                        }
                    }],
                    options: [{ label: { zh: "退縮", jp: "尻込みする", kr: "물러서다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-B：關係的最終考驗（外部危機下的選擇）
    DB.templates.push({
        id: 'rom_climax_crisis_choice',
        type: 'climax',
        reqTags: ['romance'],
        condition: { vars: [{ key: 'pressure', val: 50, op: '>=' }] }, // 高壓專屬高潮
        dialogue: [
            {
                text: {
                    zh: "外部的壓力已經大到你們不能再迴避了。<br><br>{lover}看著你，眼神疲憊：「如果繼續這樣，對你不好。也許我們應該……」<br><br>話沒說完。<br>但你知道對方在說什麼。",
                    jp: "外部からのプレッシャーは、もはや無視できないほど大きくなっていた。<br><br>{lover}は疲れた瞳であなたを見て言った。「このままじゃ、君のためにならない。たぶん、私たちは……」<br><br>言葉は最後まで続かなかった。<br>しかし、相手が何を言いたいのかは分かっている。",
                    kr: "외부의 압박이 더 이상 회피할 수 없을 만큼 커졌다.<br><br>{lover}이(가) 지친 눈빛으로 당신을 보며 말한다. 「계속 이러면 너한테 안 좋아. 어쩌면 우리는……」<br><br>말을 끝맺지 못했다.<br>하지만 상대가 무슨 말을 하려는지 당신은 알고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "「我只是不想放棄」",
                    jp: "「諦めたくないだけ」",
                    kr: "「나는 그냥 포기하기 싫어」"
                },
                action: "node_next",
                rewards: {
                    tags: ["chose_to_stay"],
                    varOps: [{ key: 'trust', val: 30, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你打斷了對方，堅定地表明了自己的立場。<br>這份破釜沉舟的決心打動了{lover}，讓對方眼中的動搖消散，重新燃起了與你共同面對危機的勇氣。",
                            jp: "相手の言葉を遮り、自分の意志をきっぱりと伝えた。<br>その背水の陣の決意が{lover}の心を打ち、瞳の揺らぎを消し去り、共に危機に立ち向かう勇気を再び燃え上がらせた。",
                            kr: "상대의 말을 끊고, 당신의 입장을 단호하게 밝혔다.<br>그 배수진의 결의가 {lover}의 마음을 움직였고, 눈빛의 흔들림이 사라지며 함께 위기에 맞설 용기를 다시 불태우게 했다."
                        }
                    }],
                    options: [{ label: { zh: "共同面對", jp: "共に立ち向かう", kr: "함께 맞서다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "「也許你對，但我無法決定」",
                    jp: "「正しいかも。でも私には決められない」",
                    kr: "「네 말이 맞을 수도 있어. 하지만 난 결정 못 해」"
                },
                action: "node_next",
                rewards: {
                    tags: ["confessed"],
                    varOps: [{ key: 'affection', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你的猶豫讓氣氛變得沉重。<br>雖然你坦誠了自己的軟弱，對方也因你的不捨而心生憐惜，但這也讓這段關係的未來蒙上了一層陰影。",
                            jp: "あなたの躊躇いが空気を重くした。<br>自分の弱さを素直に認めたことで相手もあなたの未練に同情したが、同時にこの関係の未来に暗い影を落とすことになった。",
                            kr: "당신의 망설임이 분위기를 무겁게 만들었다.<br>자신의 나약함을 솔직하게 인정하여 상대도 당신의 미련에 연민을 느꼈지만, 동시에 이 관계의 미래에 어두운 그림자를 드리웠다."
                        }
                    }],
                    options: [{ label: { zh: "陷入迷惘", jp: "迷いの中へ", kr: "미궁 속으로" }, action: "advance_chain" }]
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
                    zh: "這段時間，你認識了幾個不一樣的人。<br><br>而現在，你必須做出一個選擇——或者，你選擇不做選擇。<br><br>心裡的那個答案，你其實早就知道了。",
                    jp: "この期間、あなたは複数の異なる人物と知り合った。<br><br>そして今、一つの選択を迫られている——あるいは、選択しないという選択を。<br><br>心の中の答えに、あなたはもうとっくに気づいているはずだ。",
                    kr: "그동안 당신은 몇 명의 각기 다른 사람들을 만났다.<br><br>그리고 지금, 당신은 선택을 해야만 한다——혹은, 선택하지 않는 것을 선택하거나.<br><br>마음속의 그 대답은, 사실 이미 알고 있을 것이다."
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
                action: "node_next",
                rewards: { tags: ["chose_lover"], exp: 50 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你走向{lover}，這段時間以來的點點滴滴在腦海中閃過。<br>你終於確定，這就是那個你想要共度未來的人。",
                            jp: "{lover}の元へ向かう。これまでのささやかな思い出が脳裏を駆け巡る。<br>未来を共に歩みたいのはこの人だと、ついに確信した。",
                            kr: "{lover}에게로 향한다. 그동안 함께했던 크고 작은 기억들이 뇌리를 스쳐 지나간다.<br>당신은 마침내 이 사람이 바로 미래를 함께하고 싶은 사람임을 확신했다."
                        }
                    }],
                    options: [{ label: { zh: "走向愛人", jp: "愛する人の元へ", kr: "연인에게로" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "向{rival}表白",
                    jp: "{rival}に告白する",
                    kr: "{rival}에게 고백하다"
                },
                condition: { vars: [{ key: 'aff_rival', val: 40, op: '>=' }] },
                action: "node_next",
                rewards: { tags: ["chose_rival"], exp: 50 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "出乎所有人的意料，你轉向了{rival}。<br>原來在那些針鋒相對、互相試探的日子裡，你們的心早已不知不覺地靠近了彼此。",
                            jp: "誰もが予想しない中、あなたは{rival}の方を向いた。<br>火花を散らし、互いを探り合った日々の中で、いつの間にか二人の心は惹かれ合っていたのだ。",
                            kr: "모두의 예상을 깨고, 당신은 {rival}을(를) 향해 돌아섰다.<br>날 선 공방을 벌이고 서로를 떠보던 그 시간들 속에서, 두 사람의 마음은 이미 눈치채지 못할 만큼 가까워져 있었던 것이다."
                        }
                    }],
                    options: [{ label: { zh: "意料之外", jp: "予想外の結末", kr: "예상 밖의 결말" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "向{mentor}告白",
                    jp: "{mentor}に告白する",
                    kr: "{mentor}에게 고백하다"
                },
                condition: { vars: [{ key: 'aff_mentor', val: 40, op: '>=' }] },
                action: "node_next",
                rewards: { tags: ["chose_mentor"], exp: 50 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你走向了那個一直默默引導你的人。<br>比起轟轟烈烈的激情，你更渴望{mentor}給予你的那份深沉、穩定的安心感。",
                            jp: "ずっと陰ながら導いてくれた人の元へ歩み寄る。<br>燃え上がるような情熱よりも、{mentor}が与えてくれる深く安定した安心感を、あなたは求めていたのだ。",
                            kr: "항상 묵묵히 당신을 이끌어준 사람에게로 향했다.<br>불타오르는 격정보다는, {mentor}이(가) 주는 그 깊고 안정적인 안도감을 당신은 더 갈망했던 것이다."
                        }
                    }],
                    options: [{ label: { zh: "渴求安穩", jp: "安らぎを求めて", kr: "안정을 갈망하며" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "誰都不選",
                    jp: "誰も選ばない",
                    kr: "아무도 선택하지 않다"
                },
                action: "node_next",
                rewards: { tags: ["chose_none"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你環顧四周，最終選擇轉身離開。<br>也許現在的你，還沒準備好為任何人停下腳步，你想要先找到真正的自己。",
                            jp: "周囲を見渡し、最後は背を向けて立ち去ることを選んだ。<br>今のあなたはまだ、誰かのために立ち止まる準備ができていない。まずは本当の自分を見つけたいのだ。",
                            kr: "주위를 둘러보고, 결국 몸을 돌려 떠나는 것을 선택했다.<br>어쩌면 지금의 당신은 아직 누군가를 위해 멈춰 설 준비가 되지 않은 것일지도 모른다. 당신은 먼저 진짜 자신을 찾고 싶다."
                        }
                    }],
                    options: [{ label: { zh: "獨自美麗", jp: "孤独な美しさ", kr: "홀로 빛나다" }, action: "advance_chain" }]
                }
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
                    zh: "決定性的時刻到了。<br><br>{rival}和你，站在同一個位置的兩個候選人。<br>{lover}必須做出選擇。<br><br>你能做的，你都做了。<br>現在，只剩下等待。",
                    jp: "決定的な瞬間が訪れた。<br><br>{rival}とあなた。同じポジションに立つ二人の候補者。<br>{lover}は選択を下さねばならない。<br><br>やれることはすべてやった。<br>あとは、待つだけだ。",
                    kr: "결정적인 순간이 왔다.<br><br>{rival}와(과) 당신, 같은 자리에 선 두 명의 후보자.<br>{lover}은(는) 선택을 내려야 한다.<br><br>당신이 할 수 있는 건 다 했다.<br>이제 남은 건 기다림뿐이다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "用真心說服",
                    jp: "真心で説得する",
                    kr: "진심으로 설득하다"
                },
                condition: { vars: [{ key: 'trust', val: 30, op: '>=' }] },
                action: "node_next",
                rewards: { tags: ["won_consort"], exp: 60 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你拋開了所有的算計與手段，用最真誠的話語打動了{lover}。<br>在這場殘酷的權力遊戲中，你用真心贏得了最終的勝利。",
                            jp: "すべての打算と駆け引きを捨て、最も真摯な言葉で{lover}の心を動かした。<br>この残酷な権力ゲームにおいて、あなたは真実の愛で最終的な勝利を手にしたのだ。",
                            kr: "모든 계산과 수단을 버리고, 가장 진실한 말로 {lover}의 마음을 움직였다.<br>이 잔혹한 권력 게임에서, 당신은 진심으로 최종적인 승리를 거머쥐었다."
                        }
                    }],
                    options: [{ label: { zh: "真心致勝", jp: "真心の勝利", kr: "진심의 승리" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "用實力證明",
                    jp: "実力で証明する",
                    kr: "실력으로 증명하다"
                },
                condition: { vars: [{ key: 'rank_points', val: 50, op: '>=' }] },
                action: "node_next",
                rewards: { tags: ["won_consort"], exp: 50 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你冷靜地展示了自己這段時間以來的積累與價值。<br>你用無可挑剔的實力向{lover}證明，你才是那個最適合站在這個位置上的人。",
                            jp: "これまで積み上げてきた実績と価値を冷静に提示した。<br>非の打ち所のない実力で、自分こそがこの場に立つに最もふさわしい人間であることを{lover}に証明してみせた。",
                            kr: "그동안 쌓아온 실적과 가치를 냉정하게 보여주었다.<br>당신은 흠잡을 데 없는 실력으로, 자신이 바로 이 자리에 서기에 가장 적합한 사람임을 {lover}에게 증명해 냈다."
                        }
                    }],
                    options: [{ label: { zh: "實力上位", jp: "実力による勝利", kr: "실력으로 쟁취" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "把選擇權交出",
                    jp: "選択権を委ねる",
                    kr: "선택권을 넘기다"
                },
                action: "node_next",
                rewards: { tags: ["waited_consort"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你選擇了沉默，將最終的決定權完全交給了{lover}。<br>這是最無私的愛，也是一場最冒險的賭博。你靜靜地等待命運的宣判。",
                            jp: "沈黙を選び、最終的な決定権を完全に{lover}に委ねた。<br>それは最も無私な愛であり、最も危険な賭けでもあった。あなたは静かに運命の宣告を待った。",
                            kr: "침묵을 선택하고, 최종적인 결정권을 온전히 {lover}에게 넘겼다.<br>이것은 가장 이타적인 사랑이자, 가장 위험한 도박이기도 하다. 당신은 조용히 운명의 선고를 기다렸다."
                        }
                    }],
                    options: [{ label: { zh: "聽天由命", jp: "運命に任せる", kr: "운명에 맡기다" }, action: "advance_chain" }]
                }
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
                    zh: "你決定正面攤牌。<br><br>你和{lover}面對面，手邊放著你這段時間收集到的一切。<br><br>你深吸一口氣。<br>說出來之後，沒有退路。",
                    jp: "正面からカードを切ることにした。<br><br>あなたと{lover}は向かい合っている。手元には、この期間に集めたすべての証拠がある。<br><br>深呼吸をする。<br>口にすれば、もう後戻りはできない。",
                    kr: "정면으로 승부를 보기로 했다.<br><br>당신과 {lover}은(는) 마주 보고 있다. 손닿는 곳에는 그동안 모은 모든 증거가 놓여 있다.<br><br>심호흡을 한다.<br>입 밖으로 내뱉고 나면, 퇴로는 없다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拿出證據要求解釋",
                    jp: "証拠を出し説明を求める",
                    kr: "증거를 내밀며 해명 요구"
                },
                condition: { vars: [{ key: 'evidence_count', val: 3, op: '>=' }] },
                action: "node_next",
                rewards: { tags: ["showed_evidence"], exp: 50 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你將收集到的鐵證甩在桌上，冷冷地逼迫{lover}面對現實。<br>所有的謊言在這一刻無所遁形，事態已經到了必須做個了斷的地步。",
                            jp: "集めた決定的な証拠をテーブルに叩きつけ、冷ややかに{lover}へ現実を突きつけた。<br>すべての嘘が白日の下に晒され、事態はもはや決着をつけねばならないところまで来ていた。",
                            kr: "모아둔 결정적인 증거를 책상에 내던지며, 차갑게 {lover}이(가) 현실을 직시하도록 몰아붙였다.<br>모든 거짓말이 이 순간 낱낱이 드러났고, 사태는 이제 끝을 맺어야만 하는 지경에 이르렀다."
                        }
                    }],
                    options: [{ label: { zh: "鐵證如山", jp: "動かぬ証拠", kr: "움직일 수 없는 증거" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "只說感受，不要證據",
                    jp: "証拠は出さず気持ちを言う",
                    kr: "증거 없이 감정만 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["said_feelings"],
                    varOps: [{ key: 'trust', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你收起了那些冷冰冰的證據，只是平靜地訴說著自己這段時間以來的痛苦與不安。<br>這份卸下防備的柔軟反而擊潰了{lover}的心理防線，對方陷入了深深的自責。",
                            jp: "冷たい証拠を突きつけるのはやめ、ただ静かに、この間の自分の苦しみや不安を語った。<br>その無防備な柔らかさがかえって{lover}の心理的防壁を打ち崩し、相手を深い自責の念に駆らせた。",
                            kr: "차가운 증거들을 거두고, 그저 차분하게 그동안 자신이 느꼈던 고통과 불안을 이야기했다.<br>방어기제를 내려놓은 그 부드러움이 오히려 {lover}의 심리적 방어선을 무너뜨렸고, 상대는 깊은 자책감에 빠졌다."
                        }
                    }],
                    options: [{ label: { zh: "攻心為上", jp: "心に訴えかける", kr: "마음을 움직이다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "「你還愛我嗎？」",
                    jp: "「まだ愛してるの？」",
                    kr: "「아직 날 사랑해?」"
                },
                action: "node_next",
                rewards: {
                    tags: ["asked_directly", "said_feelings"],
                    exp: 40
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有提任何懷疑，只是直視著對方的眼睛，拋出了這個最根本、也最殘酷的問題。<br>在這個問題面前，所有的藉口和算計都失去了意義。",
                            jp: "何の疑いも口にせず、ただ相手の目を真っ直ぐ見据えて、この最も根本的で残酷な質問を投げかけた。<br>この問いの前では、すべての言い訳や計算も意味を失った。",
                            kr: "아무런 의심도 꺼내지 않고, 그저 상대의 눈을 똑바로 바라보며 이 가장 근본적이고도 잔인한 질문을 던졌다.<br>이 질문 앞에서는 어떤 변명이나 계산도 의미를 잃었다."
                        }
                    }],
                    options: [{ label: { zh: "直球對決", jp: "直球勝負", kr: "정면 승부" }, action: "advance_chain" }]
                }
            }
        ]
    });

// ============================================================
    // 🌸 [END] 戀愛路線結局節點 × 11
    //    由 tags + 數值組合決定觸發哪個
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
                    zh: "{lover}沉默了一下。<br>然後，微微笑了。<br><br>「我以為你永遠不會說出來。」<br><br>原來對方也一直在等。<br>————<br>【{lover}路線完結】<br>好感度：{aff_lover}",
                    jp: "{lover}は少し沈黙し、<br>そして、微笑んだ。<br><br>「君は一生言ってくれないのかと思ってたよ」<br><br>相手もずっと待っていたのだ。<br>————<br>【{lover}ルート完結】<br>好感度：{aff_lover}",
                    kr: "{lover}은(는) 잠시 침묵하더니,<br>이내 옅게 미소 지었다.<br><br>「네가 영영 말 안 할 줄 알았어.」<br><br>알고 보니 상대도 계속 기다리고 있었던 것이다.<br>————<br>【{lover} 루트 완결】<br>호감도: {aff_lover}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
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
                    zh: "{rival}的表情，是你第一次看到對方真正驚訝的樣子。<br><br>「……你認真的？」<br>「認真的。」<br><br>這個答案，連你自己都沒有預期。<br>————<br>【{rival}路線完結】",
                    jp: "{rival}の表情は、あなたが初めて見る心底驚いたような顔だった。<br><br>「……本気なの？」<br>「本気だよ」<br><br>この答えは、あなた自身すら予想していなかったものだ。<br>————<br>【{rival}ルート完結】",
                    kr: "{rival}의 표정은, 당신이 처음으로 보는 진심으로 놀란 모습이었다.<br><br>「……진심이야?」<br>「진심이야.」<br><br>이 대답은 당신 자신조차 예상하지 못했던 것이다.<br>————<br>【{rival} 루트 완결】"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 80, gold: 30 } }]
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
                    zh: "{lover}做出了選擇。<br><br>是你。<br><br>{rival}轉身離開了，沒有說話。<br>你站在原地，感覺到的不只是勝利，還有一種沉甸甸的責任——<br>你要配得上這個選擇。<br>————<br>【正宮之路完結】<br>寵愛值：{rank_points}",
                    jp: "{lover}は選択を下した。<br><br>あなただ。<br><br>{rival}は何も言わず、背を向けて立ち去った。<br>その場に立つあなたが感じたのは、勝利だけではない。ずっしりとした重い責任——<br>この選択に見合う自分にならなければならない。<br>————<br>【正室への道・完結】<br>寵愛値：{rank_points}",
                    kr: "{lover}이(가) 선택을 내렸다.<br><br>바로 당신이다.<br><br>{rival}은(는) 아무 말 없이 돌아섰다.<br>제자리에 선 당신이 느낀 것은 단순한 승리감뿐만이 아니었다. 그것은 묵직한 책임감——<br>이 선택에 걸맞은 사람이 되어야 한다는 것이다.<br>————<br>【정실의 길 완결】<br>총애 수치: {rank_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
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
                    zh: "{lover}聽完了你說的一切。<br><br>然後解釋了你不知道的部分。<br>有些事，比你想的更複雜，也比你擔心的更單純。<br><br>你花了一段時間消化，然後選擇相信。<br>————<br>【原諒，重新開始】",
                    jp: "{lover}はあなたの言葉をすべて聞き終えた。<br><br>そして、あなたの知らない部分について説明した。<br>ある事は想像以上に複雑で、またある事は心配していたよりずっと単純だった。<br><br>消化するのに少し時間はかかったが、あなたは信じることを選んだ。<br>————<br>【許し、再出発】",
                    kr: "{lover}은(는) 당신의 말을 모두 끝까지 들었다.<br><br>그리고 당신이 몰랐던 부분들을 설명했다.<br>어떤 일들은 생각보다 더 복잡했고, 걱정했던 것보다 훨씬 더 단순했다.<br><br>당신은 그것을 소화하는 데 시간을 보낸 뒤, 믿기로 선택했다.<br>————<br>【용서, 그리고 다시 시작】"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 80, gold: 30 } }]
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
                    zh: "{lover}沒有否認。<br><br>你放下了手邊的一切，站起來：<br>「我知道了。」<br>就這三個字。<br><br>你離開的時候，沒有眼淚。<br>也許眼淚之後會來，但現在，你感覺的是清醒。<br>————<br>【選擇離開】",
                    jp: "{lover}は否定しなかった。<br><br>あなたは手にしていたものをすべて置き、立ち上がった。<br>「分かった」<br>その一言だけだった。<br><br>去り際、涙は出なかった。<br>後から流れてくるかもしれないが、今はただ、はっきりとした目が覚めるような感覚しかなかった。<br>————<br>【別れの選択】",
                    kr: "{lover}은(는) 부정하지 않았다.<br><br>당신은 손에 든 것을 모두 내려놓고 일어났다.<br>「알았어.」<br>그 한마디뿐이었다.<br><br>떠날 때, 눈물은 나지 않았다.<br>나중에 눈물이 흐를지도 모르지만, 지금 느껴지는 건 오직 선명한 현실 자각뿐이다.<br>————<br>【이별의 선택】"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 60, gold: 20 } }]
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
                    zh: "你沒有拿出任何證據。<br><br>你只是說出了你的感受，和你真正想要的是什麼。<br><br>{lover}聽完了，沉默了一下，然後說了一句讓你意想不到的話。<br><br>不管那句話是什麼，你知道，這段關係從今天起不一樣了。<br>————<br>【以真心換真心】",
                    jp: "証拠など何も出さなかった。<br><br>ただ自分の気持ちと、本当は何を望んでいるのかを伝えた。<br><br>{lover}は聞き終えると少し沈黙し、そして、思いがけない言葉を口にした。<br><br>その言葉が何であれ、今日からこの関係が違うものになることだけは分かっている。<br>————<br>【真心には真心を】",
                    kr: "당신은 어떤 증거도 꺼내지 않았다.<br><br>그저 당신의 감정과, 진정으로 원하는 것이 무엇인지 말했을 뿐이다.<br><br>{lover}은(는) 다 듣고 난 뒤 잠시 침묵하더니, 예상치 못한 말을 꺼냈다.<br><br>그 말이 무엇이든 간에, 이 관계가 오늘부터 달라졌다는 것만은 확실하다.<br>————<br>【진심에는 진심으로】"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 70, gold: 25 } }]
    });

    // END-A：真心相愛（affection 和 trust 都高）
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
                    zh: "{lover}說：「我也是。」<br><br>就這三個字。<br>沒有特別複雜的告白，沒有戲劇性的場景。<br>只是兩個人，在{env_light}的映照下，終於說清楚了。<br>————<br>【真心相愛】<br>好感度：{affection}　信任度：{trust}",
                    jp: "「私もだよ」と{lover}は言った。<br><br>たったその一言。<br>複雑な告白も、ドラマチックな展開もない。<br>ただ二人、{env_light}に照らされながら、ついに心を通い合わせたのだ。<br>————<br>【真実の愛】<br>好感度：{affection}　信頼度：{trust}",
                    kr: "{lover}이(가) 말했다. 「나도 그래.」<br><br>그 짧은 한마디.<br>복잡한 고백이나 극적인 장면은 없었다.<br>그저 두 사람이 {env_light} 아래서, 마침내 마음을 확실히 확인했을 뿐이다.<br>————<br>【진실한 사랑】<br>호감도: {affection}　신뢰도: {trust}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 120, gold: 50 } }]
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
                    zh: "你們在一起了。<br><br>從外面看，這是一段很好的關係。<br>但你們之間，有些話始終沒有說清楚。<br><br>也許以後會說。<br>也許不會。<br>————<br>【表面幸福】<br>好感度：{affection}　信任度：{trust}",
                    jp: "二人は結ばれた。<br><br>はたから見れば、とても良好な関係だ。<br>しかし二人の間には、ずっと口にできないままの言葉がある。<br><br>いつか言う日が来るかもしれない。<br>来ないかもしれない。<br>————<br>【うわべの幸福】<br>好感度：{affection}　信頼度：{trust}",
                    kr: "두 사람은 함께하게 되었다.<br><br>겉으로 보기엔 아주 좋은 관계다.<br>하지만 두 사람 사이에는 끝내 확실히 말하지 못한 것들이 있다.<br><br>어쩌면 나중에 말하게 될지도 모른다.<br>어쩌면 아닐지도.<br>————<br>【표면적인 행복】<br>호감도: {affection}　신뢰도: {trust}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 70, gold: 20 } }]
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
                    zh: "你說了，但{lover}的回應不是你期待的那種。<br><br>「你對我來說很重要，」對方說，「但不是那樣。」<br><br>這句話很痛，但你知道那是真話。<br>而真話，有時候比謊言更珍貴。<br>————<br>【深刻友誼】<br>信任度：{trust}",
                    jp: "想いは伝えたが、{lover}の返事は期待していたものではなかった。<br><br>「君は私にとってとても大切な人だ」相手は言った。「でも、そういう意味じゃないんだ」<br><br>その言葉は痛かったが、それが本心だと分かった。<br>そして真実は時に、嘘よりも尊い。<br>————<br>【深い友情】<br>信頼度：{trust}",
                    kr: "말했지만, {lover}의 대답은 당신이 기대했던 것이 아니었다.<br><br>「넌 나한테 정말 소중한 사람이야.」 상대가 말했다. 「하지만 그런 쪽은 아니야.」<br><br>그 말은 아팠지만, 진심이라는 걸 안다.<br>그리고 진심은, 때로는 거짓말보다 훨씬 소중하다.<br>————<br>【깊은 우정】<br>신뢰도: {trust}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 60, gold: 15 } }]
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
                    zh: "那些流言和壓力沒有散去。<br>但你們選擇不在乎。<br><br>這不是電影裡的結局——沒有戲劇性的反轉，沒有所有人突然理解。<br>只是兩個人，決定繼續站在彼此旁邊。<br>————<br>【選擇留下】",
                    jp: "噂やプレッシャーは消えなかった。<br>しかし、二人は気にしないことを選んだ。<br><br>これは映画のような結末ではない。ドラマチックなどんでん返しもなければ、全員が急に理解してくれるわけでもない。<br>ただ二人、互いの傍に立ち続けることを決めただけだ。<br>————<br>【共に残る選択】",
                    kr: "그 소문과 압박감은 흩어지지 않았다.<br>하지만 두 사람은 개의치 않기로 했다.<br><br>이것은 영화 속 결말이 아니다——극적인 반전도 없고, 모든 사람이 갑자기 이해해 주지도 않는다.<br>그저 두 사람이, 계속 서로의 곁에 서 있기로 결정했을 뿐이다.<br>————<br>【함께 남기로 한 선택】"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 90, gold: 30 } }]
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
                    zh: "有些故事，沒有走到那個結局。<br><br>不是因為不好，只是時機不對，或者你們都還沒有準備好。<br><br>但那些時刻，都是真實的。<br>————<br>【遺憾分離】<br>好感度：{affection}　信任度：{trust}",
                    jp: "結末まで辿り着かない物語もある。<br><br>ダメだったわけではない。ただタイミングが悪かったか、お互いにまだその準備ができていなかっただけだ。<br><br>それでも、共に過ごしたあの時間は、すべて本物だった。<br>————<br>【切ない別れ】<br>好感度：{affection}　信頼度：{trust}",
                    kr: "어떤 이야기들은 그 결말에 도달하지 못한다.<br><br>나빠서가 아니라, 그저 타이밍이 맞지 않았거나, 두 사람 모두 아직 준비가 되지 않았을 뿐이다.<br><br>하지만 그 순간들은, 모두 진짜였다.<br>————<br>【아쉬운 이별】<br>호감도: {affection}　신뢰도: {trust}"
                }
            }
        ],
        options: [{ label: { zh: "結束故事", jp: "物語を終える", kr: "이야기 종료" }, action: "finish_chain", rewards: { exp: 30 } }]
    });


    console.log("✅ story_romance_v2.js V2.0 已載入（3 開場 × 12 中段 × 3 高潮 × 6 結局）");
    console.log("   可與 story_romance.js V1.0 並存，引擎會將所有節點混合抽取。");
})();