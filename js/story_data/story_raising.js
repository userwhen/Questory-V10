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
    // 🎬 [START] 養成劇本開場節點 × 3
    //    設計原則：
    //      - 區分訓練流 (route_skill_test) 與 攀升流 (route_climb)
    //      - 初始化 skill_points, rank_points, pressure
    // ============================================================

    // START-A：進入學院/訓練場，目標是通過最終考核
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
                    zh: "你站在{training_location}的入口前。<br><br>目標是{raising_goal}。<br>在你之前，已經有無數人在這裡放棄，或者失敗。<br><br>{mentor}從走廊盡頭走來，掃了你一眼：<br>「你就是新來的？看起來不怎麼樣。」",
                    jp: "{training_location}の入り口の前に立っている。<br><br>目標は{raising_goal}だ。<br>あなたの前にも、数え切れないほどの人々がここで諦め、あるいは失敗してきた。<br><br>廊下の奥から歩いてきた{mentor}が、あなたを一瞥して言った：<br>「お前が新入りか？大したことなさそうだな」",
                    kr: "{training_location} 입구 앞에 서 있다.<br><br>목표는 {raising_goal}이다.<br>당신 이전에도 이미 셀 수 없이 많은 사람들이 이곳에서 포기하거나 실패했다.<br><br>복도 끝에서 걸어온 {mentor}이(가) 당신을 훑어보며 말했다:<br>「네가 새로 온 녀석이냐? 별로 대단해 보이진 않는데.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "低頭：「請多指教。」",
                    jp: "頭を下げる：「よろしくお願いします」",
                    kr: "고개를 숙이다：「잘 부탁드립니다.」"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_skill_test", "has_ally"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你放低姿態，展現了學習的誠意。{mentor}冷哼了一聲，但眼神中多了一絲認可。良好的態度為你的訓練開了個好頭。",
                            jp: "謙虚な姿勢で学びの誠意を示した。{mentor}は鼻を鳴らしたが、その目には少しだけ認めるような色が浮かんだ。その態度は、訓練の幸先を良くした。",
                            kr: "자세를 낮추고 배우려는 성의를 보였다. {mentor}은(는) 코웃음을 쳤지만, 눈빛에는 일말의 인정이 담겨 있었다. 훌륭한 태도가 훈련의 순조로운 시작을 알렸다."
                        }
                    }],
                    options: [{ label: { zh: "開始訓練", jp: "訓練開始", kr: "훈련 시작" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "「用成績說話。」",
                    jp: "「結果で示します」",
                    kr: "「결과로 증명하죠.」"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_skill_test"],
                    varOps: [{ key: 'pressure', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你毫不退讓地直視對方面孔，宣告了自己的野心。這大膽的發言引來了周圍人的側目，讓你的訓練從一開始就充滿了壓力與挑戰。",
                            jp: "怯むことなく相手を真っ直ぐ見据え、野心を口にした。その大胆な発言は周囲の注目を集め、あなたの訓練は最初からプレッシャーと挑戦に満ちたものとなった。",
                            kr: "물러서지 않고 상대를 똑바로 쳐다보며 당신의 야심을 선언했다. 이 대담한 발언은 주변 사람들의 이목을 끌었고, 훈련의 시작부터 엄청난 압박감과 도전 의식을 안겨주었다."
                        }
                    }],
                    options: [{ label: { zh: "迎接挑戰", jp: "挑戦を受ける", kr: "도전 응수" }, action: "advance_chain" }]
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
                    zh: "第一天。<br><br>你是{env_building}裡地位最低的人。<br>其他人用打量的眼神看著你，有人帶著同情，有人帶著輕視。<br><br>{rival}走過你身邊，肩膀輕輕撞了你一下，沒有道歉。<br><br>你的目標是{raising_goal}。<br>沒有人相信你辦得到。",
                    jp: "初日。<br><br>あなたは{env_building}の中で最も身分の低い人間だ。<br>他の人々は値踏みするような目であなたを見ている。同情の目を向ける者もいれば、軽蔑する者もいる。<br><br>{rival}があなたの横を通り過ぎる時、肩を軽くぶつけてきたが、謝りもしない。<br><br>あなたの目標は{raising_goal}。<br>やり遂げられるなどと、誰も信じていない。",
                    kr: "첫날.<br><br>당신은 {env_building}에서 가장 지위가 낮은 사람이다.<br>다른 사람들은 평가하는 눈빛으로 당신을 훑어본다. 누군가는 동정을, 누군가는 경멸을 담아서.<br><br>{rival}이(가) 당신 곁을 지나가며 어깨를 살짝 치고 갔지만, 사과는 없었다.<br><br>당신의 목표는 {raising_goal}이다.<br>아무도 당신이 해낼 거라 믿지 않는다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "隱忍觀察規則生態",
                    jp: "耐えて規則と生態を観察する",
                    kr: "참으며 규칙과 생태를 관찰하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_climb"],
                    varOps: [{ key: 'rank_points', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你嚥下了這口氣，沒有輕舉妄動。在這個吃人的環境裡，先摸清權力結構比出風頭更重要。你的謹慎為你贏得了寶貴的資訊。",
                            jp: "ぐっと堪え、軽率な行動は避けた。この弱肉強食の環境では、目立つことよりも権力構造を把握することの方が重要だ。その慎重さが貴重な情報をもたらした。",
                            kr: "화를 꾹 삼키고, 섣불리 행동하지 않았다. 이 잡아먹고 먹히는 환경에서는 눈에 띄는 것보다 권력 구조를 파악하는 것이 더 중요하다. 당신의 신중함이 귀중한 정보를 안겨주었다."
                        }
                    }],
                    options: [{ label: { zh: "步步為營", jp: "着実に進める", kr: "차근차근 나아가다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "找{mentor}展現實力",
                    jp: "{mentor}に実力を見せつける",
                    kr: "{mentor}에게 실력을 증명하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_skill_test"],
                    varOps: [
                        { key: 'skill_points', val: 5, op: '+' },
                        { key: 'pressure',     val: 5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你決定不依賴人際關係，而是用純粹的實力說話。你直接找到了掌權的{mentor}展現自己。這份魄力讓人印象深刻，但也引來了更多的嫉妒。",
                            jp: "人間関係に頼らず、純粋な実力で語ることにした。実権を握る{mentor}の元へ直接出向き、自分をアピールした。その気迫は強い印象を与えたが、同時に多くの嫉妬も買った。",
                            kr: "인간관계에 의존하지 않고, 순수한 실력으로 증명하기로 했다. 실권을 쥔 {mentor}을(를) 직접 찾아가 자신을 드러냈다. 그 패기는 강렬한 인상을 남겼지만, 동시에 더 많은 질투를 불러일으켰다."
                        }
                    }],
                    options: [{ label: { zh: "用實力說話", jp: "実力で語る", kr: "실력으로 승부" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // START-C：你本來是替代品，意外獲得機會
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
                    zh: "你從來不是第一選擇。<br><br>是{rival}臨時出了狀況，這個機會才落到你身上。<br>所有人都知道這件事，包括你自己。<br><br>{mentor}把你叫到面前：<br>「你有多少時間準備？」<br>「……沒有。」<br>「那就現在開始。」",
                    jp: "あなたは決して第一候補ではなかった。<br><br>{rival}に突然のトラブルが起き、急遽あなたにお鉢が回ってきたのだ。<br>そのことは誰もが知っている、もちろんあなた自身も。<br><br>{mentor}があなたを呼び寄せた：<br>「準備にどれくらい時間がいる？」<br>「……全くありません」<br>「なら、今すぐ始めろ」",
                    kr: "당신은 한 번도 최우선 선택지였던 적이 없다.<br><br>{rival}에게 갑작스런 문제가 생기면서, 이 기회가 우연히 당신에게 떨어진 것이다.<br>모두가 이 사실을 알고 있다. 당신 자신조차도.<br><br>{mentor}이(가) 당신을 불렀다:<br>「준비할 시간이 얼마나 있지?」<br>「……없습니다.」<br>「그럼 지금 당장 시작해.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拼命訓練用實力堵嘴",
                    jp: "必死に訓練し実力で黙らせる",
                    kr: "필사적으로 훈련해 실력으로 증명"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_skill_test", "has_mentor_push"],
                    varOps: [
                        { key: 'skill_points', val: 10, op: '+' },
                        { key: 'pressure',     val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你拒絕成為別人的影子。你把自己逼到了極限，開啟了地獄般的特訓。巨大的壓力與高強度的訓練，讓你的實力飛速飆升。",
                            jp: "誰かの影になることは拒絶した。自分を限界まで追い込み、地獄のような特訓を開始した。巨大なプレッシャーと高強度の訓練により、あなたの実力は飛躍的に上昇した。",
                            kr: "누군가의 그림자가 되기를 거부했다. 스스로를 한계까지 몰아넣고 지옥 같은 특훈을 시작했다. 엄청난 압박감과 고강도 훈련 덕분에 당신의 실력은 눈에 띄게 급상승했다."
                        }
                    }],
                    options: [{ label: { zh: "地獄特訓", jp: "地獄の特訓", kr: "지옥 훈련" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "搞清人脈尋找盟友",
                    jp: "人脈を把握し味方を探す",
                    kr: "인맥을 파악하고 동료 찾기"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_climb"],
                    varOps: [{ key: 'rank_points', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你很清楚，光靠臨陣磨槍是不夠的。你開始積極奔走，建立自己的勢力，試圖在這個圈子裡站穩腳跟。你的圓滑為你累積了不少積分。",
                            jp: "泥縄式の訓練だけでは不十分だとよく分かっている。あなたは積極的に動き回り、自分の勢力を作り、この世界で足場を固めようとした。その世渡りの上手さが、多くのポイントをもたらした。",
                            kr: "벼락치기 훈련만으로는 부족하다는 걸 잘 안다. 당신은 적극적으로 뛰어다니며 자신의 세력을 구축하고, 이 바닥에서 입지를 다지려 했다. 당신의 능수능란함이 꽤 많은 점수를 모아주었다."
                        }
                    }],
                    options: [{ label: { zh: "建立勢力", jp: "勢力構築", kr: "세력 구축" }, action: "advance_chain" }]
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
                    zh: "訓練的第{depth}天。<br><br>{mentor}要求你重複同一個動作，重複到你做夢都在做為止。<br><br>你的雙手已經開始起繭，但{mentor}的表情還是沒有變化：<br>「再來。」",
                    jp: "訓練{depth}日目。<br><br>{mentor}から、夢に見るほど同じ動作を繰り返すよう命じられた。<br><br>両手にはすでにタコができ始めているが、{mentor}の表情は変わらない：<br>「もう一度だ」",
                    kr: "훈련 {depth}일 차.<br><br>{mentor}은(는) 꿈속에서도 할 수 있을 때까지 똑같은 동작을 반복하라고 요구했다.<br><br>두 손에는 이미 굳은살이 박이기 시작했지만, {mentor}의 표정에는 여전히 변화가 없다:<br>「다시.」"
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
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'skill_points', val: 18, op: '+' },
                        { key: 'pressure',     val: 5,  op: '+' }
                    ],
                    exp: 15
                },
                onFail: {
                    varOps: [{ key: 'pressure', val: 15, op: '+' }],
                    text: {
                        zh: "你的體力到達了極限，動作開始變形。{mentor}冷冷地叫你停下來，眼神裡滿是失望。你感到了巨大的挫敗與壓力。",
                        jp: "体力の限界に達し、フォームが崩れ始めた。{mentor}は冷たく停止を命じ、その目には失望が満ちていた。巨大な挫折感とプレッシャーに襲われた。",
                        kr: "체력이 한계에 달해 동작이 흐트러지기 시작했다. {mentor}은(는) 차갑게 멈추라고 지시했고, 눈빛에는 실망이 가득했다. 엄청난 좌절감과 압박감을 느꼈다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你咬緊牙關，硬生生逼迫肌肉完成了一次完美無瑕的演練。<br>{mentor}難得地點了點頭：「今天可以了。」<br>這是你第一次得到這句話。強度是平時三倍，撐下來的進步也是三倍。",
                            jp: "歯を食いしばり、筋肉を限界まで追い込んで完璧な演習をやり遂げた。<br>{mentor}が珍しく頷いた。「今日はここまでだ」<br>その言葉をもらえたのは初めてだ。普段の三倍の負荷だが、乗り越えた分の成長も三倍だ。",
                            kr: "이를 악물고, 근육을 한계까지 몰아붙여 흠잡을 데 없는 시범을 해냈다.<br>{mentor}이(가) 드물게 고개를 끄덕였다. 「오늘은 여기까지.」<br>이 말을 들은 건 처음이다. 강도는 평소의 세 배지만, 버텨낸 만큼 발전도 세 배다."
                        }
                    }],
                    options: [{ label: { zh: "突破極限", jp: "限界突破", kr: "한계 돌파" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "先休息，保留體力",
                    jp: "まず休み体力を温存する",
                    kr: "먼저 쉬며 체력을 아끼다"
                },
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'skill_points', val: 8,  op: '+' },
                        { key: 'pressure',     val: -5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你知道過度訓練只會帶來反效果，於是選擇適時地停下腳步休息。<br>雖然進度慢了一些，但釋放掉的壓力讓你能在未來的訓練中走得更長遠。",
                            jp: "過度な訓練は逆効果だと知っているため、適切なタイミングで立ち止まり休むことを選んだ。<br>進歩は少し遅くなるが、プレッシャーから解放されたことで、今後の訓練を長く続けられるだろう。",
                            kr: "오버트레이닝은 역효과만 낸다는 것을 알기에, 적절한 타이밍에 멈춰서 쉬기로 했다.<br>진도는 조금 느려졌지만, 압박감을 해소한 덕분에 앞으로의 훈련에서 더 멀리 갈 수 있게 되었다."
                        }
                    }],
                    options: [{ label: { zh: "勞逸結合", jp: "メリハリをつける", kr: "적절한 휴식" }, action: "advance_chain" }]
                }
            }
        ]
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
                    zh: "{mentor}給了你一個特殊的機會：<br><br>「有一個私下的特訓名額。強度是平時的三倍。能撐下來的人，進步速度也是三倍。」<br><br>你看了看{rival}——對方也在考慮要不要報名。",
                    jp: "{mentor}から特別なチャンスを与えられた：<br><br>「非公式の特訓枠が一つある。強度は普段の三倍だ。耐え抜いた者は、三倍の速度で成長する」<br><br>あなたは{rival}を見た——相手も参加すべきか迷っているようだ。",
                    kr: "{mentor}이(가) 특별한 기회를 주었다:<br><br>「비공식 특훈 자리가 하나 있다. 강도는 평소의 세 배다. 버텨낸 자는 세 배의 속도로 성장할 거다.」<br><br>당신은 {rival}을(를) 쳐다보았다——상대 역시 지원할지 고민하는 눈치다."
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
                action: "node_next",
                rewards: {
                    tags: ["done_intensive", "key_achievement"],
                    varOps: [
                        { key: 'skill_points', val: 35, op: '+' },
                        { key: 'pressure',     val: 20, op: '+' }
                    ],
                    exp: 30
                },
                onFail: {
                    varOps: [
                        { key: 'pressure',     val: 25, op: '+' },
                        { key: 'skill_points', val: 5,  op: '+' }
                    ],
                    text: {
                        zh: "特訓的強度遠超你的負荷，你最終還是沒能撐住，中途倒下了。<br>但你學到了自己的極限在哪裡。失敗本身也是一種進步。",
                        jp: "特訓の強度は負荷をはるかに超えており、結局耐えきれずに途中で倒れてしまった。<br>しかし、自分の限界がどこにあるかを学んだ。失敗そのものもまた、一つの進歩だ。",
                        kr: "특훈의 강도는 한계를 한참 넘어섰고, 결국 버티지 못하고 중간에 쓰러지고 말았다.<br>하지만 자신의 한계가 어디까지인지 배웠다. 실패 그 자체도 발전이다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你咬牙撐過了那如同地獄般的特訓。期間{rival}中途放棄了，但你沒有。<br>當你傷痕累累地完成最後一項指標時，{mentor}第一次用敬佩的眼神正眼看了你。",
                            jp: "地獄のような特訓を歯を食いしばって耐え抜いた。途中で{rival}は棄権したが、あなたは辞めなかった。<br>満身創痍で最後の課題をやり遂げた時、{mentor}は初めて感嘆の眼差しであなたを正面から見た。",
                            kr: "지옥 같은 특훈을 이를 악물고 버텨냈다. 도중에 {rival}은(는) 포기했지만, 당신은 그러지 않았다.<br>만신창이가 되어 마지막 지표를 달성했을 때, {mentor}은(는) 처음으로 감탄어린 눈빛으로 당신을 똑바로 쳐다보았다."
                        }
                    }],
                    options: [{ label: { zh: "脫胎換骨", jp: "生まれ変わる", kr: "환골탈태" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "穩健進步，不報名",
                    jp: "参加せず、着実に進歩する",
                    kr: "참가하지 않고 착실히 발전하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["done_intensive"],
                    varOps: [{ key: 'skill_points', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你評估了自己的身心狀態，決定不冒這個險，按部就班地進行常規訓練。<br>雖然沒有迎來實力的爆發期，但扎實的基礎才是走得長遠的關鍵。",
                            jp: "自身の心身の状態を見極め、このリスクは冒さず、順を追って通常の訓練を行うことにした。<br>実力が爆発的に伸びる時期は来なかったが、確かな基礎こそが長く続けるための鍵だ。",
                            kr: "자신의 심신 상태를 평가한 뒤, 이런 위험을 감수하지 않고 정해진 순서대로 정규 훈련을 진행하기로 했다.<br>실력이 폭발적으로 성장하는 시기는 오지 않았지만, 탄탄한 기초야말로 멀리 갈 수 있는 핵심이다."
                        }
                    }],
                    options: [{ label: { zh: "穩扎穩打", jp: "堅実な歩み", kr: "착실한 전진" }, action: "advance_chain" }]
                }
            }
        ]
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
                    zh: "{mentor}給了你一段難得的自由時間。<br><br>在{training_location}裡，有幾件事可以做。<br>自由時間很少，選擇你認為最重要的。",
                    jp: "{mentor}が貴重な自由時間を与えてくれた。<br><br>{training_location}の中で、できることがいくつかある。<br>自由時間は少ない。最も重要だと思うものを選ぼう。",
                    kr: "{mentor}이(가) 귀중한 자유 시간을 주었다.<br><br>{training_location} 안에서 할 수 있는 일이 몇 가지 있다.<br>자유 시간은 적다. 가장 중요하다고 생각하는 것을 선택하자."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "還有一點自由時間，你打算怎麼利用？",
                    jp: "まだ少し自由時間がある。どう過ごす？",
                    kr: "아직 자유 시간이 조금 남았다. 어떻게 활용할까?"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "加練弱點項目",
                    jp: "弱点を集中的に鍛える",
                    kr: "약점 항목 집중 훈련"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',    val: 1,  op: '-' },
                        { key: 'skill_points', val: 18, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你針對自己最弱的部分進行反覆練習。雖然過程無比枯燥，但這正是成長的必要代價。你感覺到自己的短板正在被補齊。",
                            jp: "自分の最も苦手な部分を重点的に反復練習した。過程はひどく退屈だが、これこそが成長に必要な代償だ。自分の弱点が補われているのを感じる。",
                            kr: "자신이 가장 취약한 부분을 집중적으로 반복 연습했다. 과정은 몹시 지루하지만, 이것이야말로 성장에 필요한 대가다. 단점이 보완되고 있음을 느낀다."
                        } 
                    }],
                    options: [{ label: { zh: "補齊短板", jp: "弱点克服", kr: "단점 보완" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "和{rival}交流建立關係",
                    jp: "{rival}と交流し関係を作る",
                    kr: "{rival}와 교류하며 관계 맺기"
                },
                action: "node_next",
                condition: {
                    vars: [{ key: 'free_time', val: 1, op: '>=' }],
                    excludeTags: ['befriended_rival']
                },
                rewards: {
                    tags: ["befriended_rival"],
                    varOps: [
                        { key: 'free_time',   val: 1,  op: '-' },
                        { key: 'rank_points', val: 12, op: '+' } // 🌟 獲得地位點數
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你主動找上{rival}攀談。幾句交流後，你發現對方比你想像的還要有意思。<br>也許在這個殘酷的環境裡，「對手」不一定永遠都是敵人。",
                            jp: "自ら{rival}に話しかけた。言葉を交わすうち、相手が想像以上に面白い人間だと気づいた。<br>この過酷な環境において、「ライバル」が常に敵とは限らないのかもしれない。",
                            kr: "먼저 {rival}에게 말을 걸었다. 몇 마디 나누고 나니 상대가 생각보다 훨씬 흥미로운 사람이라는 걸 알게 되었다.<br>이 가혹한 환경에서, '경쟁자'가 항상 적이기만 한 건 아닐지도 모른다."
                        } 
                    }],
                    options: [{ label: { zh: "化敵為友", jp: "敵を味方に", kr: "적을 동료로" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "研讀理論補強知識",
                    jp: "理論を学び知識を補強する",
                    kr: "이론을 공부하며 지식 보강"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    tags: ["studied_theory"],
                    varOps: [
                        { key: 'free_time',    val: 1,  op: '-' },
                        { key: 'skill_points', val: 12, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "理論和實踐必須並行。你一頭栽進了文獻之中，幸運地在書裡找到了一個你之前實作時沒注意到的重要細節。",
                            jp: "理論と実践は両輪でなければならない。文献に没頭し、幸運にも以前の実技では気づかなかった重要な詳細を本の中で見つけた。",
                            kr: "이론과 실전은 병행되어야 한다. 문헌에 파묻혀 지내다, 다행히도 예전 실습 때 미처 눈치채지 못했던 중요한 세부 사항을 책 속에서 찾아냈다."
                        } 
                    }],
                    options: [{ label: { zh: "融會貫通", jp: "知識の習得", kr: "완벽한 이해" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "🚪 結束自由時間",
                    jp: "🚪 自由時間を終える",
                    kr: "🚪 자유 시간 종료"
                },
                action: "advance_chain" // 👈 離開 HUB 推進主線
            }
        ]
    });

   // ============================================================
    // 👑 [MIDDLE - 晉升路線] 職場/權謀與人際關係
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
                    zh: "上面交下來一個任務。<br><br>沒有人想做——太麻煩，而且風險很高。<br>但如果做好了，所有人都會記住你的名字。<br><br>{rival}用意味深長的眼神看著你：<br>「這種苦差事，交給你最適合了。」",
                    jp: "上層部から任務が下りてきた。<br><br>誰もやりたがらない——面倒で、しかもリスクが高すぎるからだ。<br>しかし成功すれば、全員があなたの名前を覚えるだろう。<br><br>{rival}が意味深な視線を向けてきた：<br>「こういう骨の折れる仕事は、お前が適任だろう」",
                    kr: "윗선에서 임무가 하나 내려왔다.<br><br>아무도 하고 싶어 하지 않는다——너무 번거롭고 위험성도 높기 때문이다.<br>하지만 잘 해낸다면, 모두가 당신의 이름을 기억하게 될 것이다。<br><br>{rival}이(가) 의미심장한 눈빛으로 당신을 바라본다:<br>「이런 궂은일은 네가 딱 제격이지.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "接過任務不說廢話",
                    jp: "仕事を受け余計な事は言わない",
                    kr: "임무를 받고 쓸데없는 말은 않다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["completed_task", "key_achievement"],
                    varOps: [
                        { key: 'rank_points', val: 25, op: '+' },
                        { key: 'pressure',    val: 10, op: '+' }
                    ],
                    exp: 20
                },
                onFail: {
                    varOps: [{ key: 'pressure', val: 20, op: '+' }],
                    text: {
                        zh: "你接下了任務，但事情的複雜度超乎想像。你搞砸了，所有人都知道了。{rival}在你看不到的地方露出了滿意的笑。",
                        jp: "任務を引き受けたが、事態の複雑さは想像を超えていた。あなたは失敗し、それは全員の知るところとなった。{rival}はあなたの見えない所で満足げな笑みを浮かべた。",
                        kr: "임무를 맡았지만, 일의 복잡함은 상상 이상이었다. 당신은 일을 망쳤고, 모두가 그 사실을 알게 되었다. {rival}은(는) 당신이 보지 못하는 곳에서 만족스러운 미소를 지었다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有任何抱怨，乾脆俐落地接下並出色地完成了任務。你把事情做得比任何人預期的都好。上面的人開始記住你的名字，而{rival}的臉色變得十分難看。",
                            jp: "一切の文句を言わず、見事に任務を遂行した。あなたは誰の予想よりも遥かに良い仕事をした。上層部はあなたの名前を覚え始め、{rival}の顔色はひどく曇った。",
                            kr: "아무런 불평 없이 깔끔하게 임무를 맡아 훌륭하게 완수해 냈다. 당신은 누구의 예상보다도 훨씬 일을 잘 해냈다. 윗사람들은 당신의 이름을 기억하기 시작했고, {rival}의 얼굴은 몹시 일그러졌다."
                        }
                    }],
                    options: [{ label: { zh: "一戰成名", jp: "名乗りを上げる", kr: "단숨에 명성 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "接下但找人分攤風險",
                    jp: "受けるがリスクを分担する",
                    kr: "받되 위험을 나누다"
                },
                action: "node_next",
                rewards: {
                    tags: ["completed_task"],
                    varOps: [{ key: 'rank_points', val: 12, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你接下了任務，但巧妙地將部分權責與其他人綁定。雖然功勞被分走了一些，但也成功避免了獨自背鍋的風險。這是聰明的職場生存之道。",
                            jp: "任務は引き受けたが、巧みに一部の権限と責任を他の者と結びつけた。手柄は少し減ったが、一人で責任を負うリスクを見事に回避した。賢い組織の生存術だ。",
                            kr: "임무를 맡았지만, 교묘하게 일부 권한과 책임을 다른 사람들과 엮어놓았다. 공로는 조금 나뉘었지만, 혼자 독박 쓸 위험은 성공적으로 피했다. 영리한 직장 생존술이다."
                        }
                    }],
                    options: [{ label: { zh: "明哲保身", jp: "保身の術", kr: "일신 보전" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "婉拒苦差保持低調",
                    jp: "丁重に断り目立たないように",
                    kr: "정중히 거절하고 낮게 엎드리다"
                },
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'pressure',    val: -5, op: '+' },
                        { key: 'rank_points', val: -5, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你找了個無可挑剔的理由推掉了這件苦差事。雖然錯失了表現的機會並損失了一點評價，但也成功避開了潛在的雷區，壓力頓時減輕不少。",
                            jp: "非の打ち所のない理由をつけて、この骨の折れる仕事を辞退した。アピールの機会を逃し少し評価を下げたが、潜在的な地雷原を上手く避け、プレッシャーはかなり軽減された。",
                            kr: "흠잡을 데 없는 핑계를 대고 이 궂은일을 거절했다. 능력을 보여줄 기회를 놓치고 평판은 조금 떨어졌지만, 잠재적인 지뢰밭을 무사히 피해 압박감은 한결 가벼워졌다."
                        }
                    }],
                    options: [{ label: { zh: "避開雷區", jp: "地雷を避ける", kr: "지뢰밭 피하기" }, action: "advance_chain" }]
                }
            }
        ]
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
                    zh: "你被叫到了{mentor}的面前。<br><br>這種單獨面談的機會千載難逢，但也可能是某種試探。<br><br>對方靜靜地看著你，等你開口。<br><br>這一刻，你說的每一句話都很重要。",
                    jp: "{mentor}の前に呼び出された。<br><br>このような単独面談の機会は千載一遇だが、同時に何らかの試しかもしれない。<br><br>相手は静かにあなたを見つめ、口を開くのを待っている。<br><br>この瞬間、あなたが発するすべての一言が極めて重要になる。",
                    kr: "{mentor} 앞으로 불려 갔다.<br><br>이런 단독 면담 기회는 천재일우지만, 동시에 일종의 시험일 수도 있다.<br><br>상대는 조용히 당신을 바라보며, 입을 열기를 기다리고 있다.<br><br>이 순간, 당신이 내뱉는 모든 말이 무척 중요하다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "坦誠不足，提改進計畫",
                    jp: "不足を認め改善計画を話す",
                    kr: "부족함 인정 후 개선안 제시"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_audience", "has_ally"],
                    varOps: [{ key: 'rank_points', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有掩飾自己的缺點，而是客觀地分析並提出了改進計畫。你的坦誠與上進心打動了對方，在這個充滿算計的地方，這份真實反而拉近了你們的距離。",
                            jp: "自分の欠点を隠すことなく、客観的に分析して改善計画を提示した。あなたの誠実さと向上心が相手の心を動かした。打算の渦巻くこの場所で、その素直さはかえって二人の距離を縮めた。",
                            kr: "자신의 단점을 숨기지 않고, 객관적으로 분석하여 개선 계획을 제시했다. 당신의 솔직함과 향상심이 상대의 마음을 움직였고, 계산이 난무하는 이곳에서 그 진실함은 오히려 두 사람의 거리를 좁혀주었다."
                        }
                    }],
                    options: [{ label: { zh: "深獲賞識", jp: "高く評価される", kr: "높은 평가 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "強調自己的優點與成績",
                    jp: "自分の長所と実績を強調する",
                    kr: "자신의 장점과 실적 강조"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_audience"],
                    varOps: [{ key: 'rank_points', val: 12, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你自信地匯報了近期的成績，巧妙地展現了自己的價值。{mentor}微微點了點頭，雖然沒有表現出太多的親近，但顯然認可了你的能力與野心。",
                            jp: "自信を持って最近の実績を報告し、自分の価値を巧みにアピールした。{mentor}はわずかに頷いた。過度な親密さは示さなかったが、あなたの能力と野心を明確に認めたようだ。",
                            kr: "자신감 있게 최근의 실적을 보고하며, 교묘하게 자신의 가치를 드러냈다. {mentor}은(는) 가볍게 고개를 끄덕였다. 큰 친근함을 보이지는 않았지만, 당신의 능력과 야심을 분명히 인정했다."
                        }
                    }],
                    options: [{ label: { zh: "獲得認可", jp: "認められる", kr: "인정받음" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "暗指{rival}的問題",
                    jp: "{rival}の問題をほのめかす",
                    kr: "{rival}의 문제를 암시하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_audience"],
                    varOps: [
                        { key: 'rank_points', val: 5,  op: '+' },
                        { key: 'pressure',    val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你巧妙地給對手上眼藥，不動聲色地指出了{rival}的失誤。這招雖然奏效，讓上位者對{rival}產生了微詞，但也讓你意識到自己正在踏入危險的政治泥潭。",
                            jp: "巧みにライバルの評価を下げ、{rival}のミスをそれとなく指摘した。この手は功を奏し、上層部に{rival}への不満を抱かせたが、同時に自分が危険な政治の泥沼に足を踏み入れていることを自覚させた。",
                            kr: "교묘하게 경쟁자를 깎아내리며, 은연중에 {rival}의 실수를 지적했다. 이 수법은 먹혀들어 윗사람이 {rival}에게 불만을 품게 만들었지만, 동시에 자신이 위험한 정치적 진흙탕에 발을 들이고 있음을 깨닫게 했다."
                        }
                    }],
                    options: [{ label: { zh: "玩弄政治", jp: "政治的な駆け引き", kr: "정치질" }, action: "advance_chain" }]
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
                    zh: "難得的空檔。<br><br>在{env_building}裡，人際關係就是貨幣。<br>你可以投資幾件事，但時間有限。",
                    jp: "貴重な空き時間だ。<br><br>{env_building}の中では、人間関係こそが通貨となる。<br>いくつか投資できる事柄があるが、時間は限られている。",
                    kr: "모처럼의 여유 시간이다。<br><br>{env_building} 안에서는, 인간관계가 곧 화폐다。<br>몇 가지에 투자할 수 있지만, 시간은 제한되어 있다."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "午休時間還沒結束，你還要進行什麼社交活動？",
                    jp: "休憩時間はまだ終わっていない。次は何の社交活動をする？",
                    kr: "휴식 시간이 아직 끝나지 않았다. 다음은 어떤 사교 활동을 할까?"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "拜訪有影響力的人",
                    jp: "影響力のある人物を訪ねる",
                    kr: "영향력 있는 사람 방문"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',   val: 1,  op: '-' },
                        { key: 'rank_points', val: 15, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你帶著得體的微笑與對方交談，成功留下了好印象。在這個地方，良好的印象往往就是晉升的敲門磚。",
                            jp: "愛想の良い笑顔で相手と語り合い、見事に好印象を残した。この場所では、良い印象が昇進への足がかりとなることが多い。",
                            kr: "예의 바른 미소로 상대와 대화를 나누며 성공적으로 좋은 인상을 남겼다. 이곳에서 좋은 인상은 종종 승진을 위한 발판이 된다."
                        }
                    }],
                    options: [{ label: { zh: "建立關係", jp: "コネを作る", kr: "관계 구축" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "收集情報分清敵友",
                    jp: "情報を集め敵味方を把握",
                    kr: "정보 수집 및 피아 식별"
                },
                action: "node_next",
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
                    dialogue: [{
                        text: {
                            zh: "你在茶水間與走廊捕捉到了許多隻言片語。你拼湊出了一個更完整的全局圖。在這裡，知道得越多，活得越久。",
                            jp: "給湯室や廊下で多くの断片的な会話を耳にした。それらを繋ぎ合わせ、より完全な全体図を描き出した。ここでは、多くを知る者ほど長く生き残る。",
                            kr: "탕비실과 복도에서 오가는 많은 단편적인 말들을 포착했다. 당신은 이를 짜맞춰 더 완전한 전체 그림을 그려냈다. 이곳에서는 많이 알수록 더 오래 살아남는다."
                        }
                    }],
                    options: [{ label: { zh: "掌握局勢", jp: "情勢を握る", kr: "정세 파악" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "偷偷練習提升自己",
                    jp: "こっそり練習し自分を高める",
                    kr: "몰래 연습하며 실력 키우기"
                },
                action: "node_next",
                condition: { vars: [{ key: 'free_time', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [
                        { key: 'free_time',    val: 1,  op: '-' },
                        { key: 'skill_points', val: 10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你避開了無謂的社交，躲在角落精進自己的業務能力。沒有人知道你在練習，但當機會來臨時，你會準備好的。",
                            jp: "無意味な社交を避け、隅に隠れて自身の業務能力に磨きをかけた。あなたが練習していることは誰も知らないが、機会が来た時、準備は万端だろう。",
                            kr: "무의미한 사교를 피하고, 구석에 숨어 자신의 업무 능력을 갈고닦았다. 아무도 당신이 연습하는 걸 모르지만, 기회가 왔을 때 당신은 준비되어 있을 것이다."
                        }
                    }],
                    options: [{ label: { zh: "精進業務", jp: "業務の精進", kr: "업무 정진" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "🚪 結束空檔回去工作",
                    jp: "🚪 空き時間を終え仕事に戻る",
                    kr: "🚪 여유 시간 끝내고 업무 복귀"
                },
                action: "advance_chain" // 👈 離開 HUB，推進主線
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
                    zh: "{rival}找上了你。<br><br>「你知道你和我的差距有多大嗎？<br>就算你拼命努力，也永遠追不上我。」<br><br>周圍有人在看。",
                    jp: "{rival}があなたに近づいてきた。<br><br>「お前と俺の差がどれだけあるか分かってるのか？<br>いくら必死に努力したところで、永遠に追いつけないぞ」<br><br>周囲の人間がこちらを見ている。",
                    kr: "{rival}이(가) 당신을 찾아왔다.<br><br>「너와 내 격차가 얼마나 큰지 알아?<br>아무리 죽어라 노력해도 넌 영원히 날 따라잡지 못해.」<br><br>주변 사람들이 지켜보고 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "冷靜回應，用成績說話",
                    jp: "冷静に返し、結果で示す",
                    kr: "냉정하게 답하고 실적으로 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["handled_rival"],
                    varOps: [
                        { key: 'skill_points', val: 10, op: '+' },
                        { key: 'rank_points',  val: 5,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你不卑不亢地拿出了最近的成果。那份沉甸甸的數據讓{rival}一時語塞，只能冷哼一聲轉身離開。周圍的人對你的沉穩刮目相看。",
                            jp: "あなたは毅然とした態度で最近の成果を提示した。その確かなデータに{rival}は一時言葉を失い、鼻を鳴らして立ち去るしかなかった。周囲の人はあなたの落ち着きを見直した。",
                            kr: "당신은 당당하게 최근의 성과를 내밀었다. 그 묵직한 데이터에 {rival}은(는) 순간 말문이 막혔고, 코웃음을 치며 돌아설 수밖에 없었다. 주변 사람들은 당신의 침착함에 감탄했다."
                        }
                    }],
                    options: [{ label: { zh: "無聲反擊", jp: "無言の反撃", kr: "무언의 반격" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "開口要求當場比較",
                    jp: "その場での勝負を要求する",
                    kr: "그 자리에서 비교를 요구하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["handled_rival", "key_achievement"],
                    varOps: [
                        { key: 'rank_points',  val: 20, op: '+' },
                        { key: 'pressure',     val: 10, op: '+' }
                    ]
                },
                onFail: {
                    varOps: [{ key: 'pressure', val: 15, op: '+' }],
                    text: {
                        zh: "你試圖反駁，卻一時語塞找不出對方邏輯的破綻。{rival}大笑著離開，讓你當眾顏面盡失，壓力倍增。",
                        jp: "反論しようとしたが、言葉に詰まり相手の論理の穴を見つけられなかった。{rival}は大笑いして去り、あなたは皆の前で面目を失い、プレッシャーが倍増した。",
                        kr: "반박하려 했지만 순간 말문이 막혀 상대 논리의 허점을 찾지 못했다. {rival}은(는) 크게 웃으며 떠났고, 당신은 사람들 앞에서 체면을 구기며 압박감이 배가되었다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你敏銳地抓住了對方話語中的漏洞，當場提出了一個精準且無法拒絕的挑戰。你的強勢表現讓所有人重新評估了你的實力，{rival}的臉色變得極度難看。",
                            jp: "相手の言葉の隙を鋭く突き、その場で正確かつ拒否できない勝負を突きつけた。あなたの強気な姿勢に誰もが実力を再評価し、{rival}の顔色は極度に険しくなった。",
                            kr: "상대방 말의 허점을 예리하게 파고들어, 그 자리에서 거절할 수 없는 정확한 도전을 제안했다. 당신의 강경한 태도에 모두가 실력을 재평가했고, {rival}의 얼굴은 몹시 일그러졌다."
                        }
                    }],
                    options: [{ label: { zh: "氣勢壓制", jp: "気迫で圧倒", kr: "기선 제압" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "忍下去，專注自己",
                    jp: "堪えて自分に集中する",
                    kr: "참고 자신에게 집중하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["handled_rival"],
                    varOps: [{ key: 'pressure', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸一口氣，將這份屈辱咽下。口舌之爭沒有意義，你默默轉身回到自己的位置，將這份憤怒轉化為前進的動力。",
                            jp: "深呼吸をして、その屈辱を飲み込んだ。口論に意味はない。あなたは黙って自分の持ち場に戻り、その怒りを前進する原動力へと変えた。",
                            kr: "심호흡을 하고 이 굴욕을 삼켰다. 말싸움은 의미가 없다. 당신은 말없이 자리로 돌아가, 그 분노를 앞으로 나아갈 원동력으로 바꾸었다."
                        }
                    }],
                    options: [{ label: { zh: "隱忍不發", jp: "隠忍自重", kr: "은인자중" }, action: "advance_chain" }]
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
                    zh: "沒有預期的事發生了。<br><br>{rival}在最關鍵的時刻出了差錯，而空出來的位置，就這樣落到了你面前。<br><br>你沒有請求這個機會，但它就在這裡。",
                    jp: "予期せぬ事態が起きた。<br><br>{rival}が最も重要な局面でミスを犯し、空いたそのポジションが、そのままあなたの前に転がり込んできた。<br><br>あなたが望んだわけではないが、機会はここにある。",
                    kr: "예상치 못한 일이 일어났다.<br><br>{rival}이(가) 가장 결정적인 순간에 실수를 저질렀고, 그 빈자리가 그대로 당신 앞에 떨어졌다.<br><br>당신이 원했던 기회는 아니지만, 기회는 바로 여기에 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "上前一步把機會接住",
                    jp: "一歩前に出て機会を掴む",
                    kr: "한 걸음 나서 기회를 잡다"
                },
                check: { stat: 'LUK', val: 3 },
                action: "node_next",
                rewards: {
                    tags: ["had_lucky_break", "key_achievement"],
                    varOps: [
                        { key: 'rank_points',  val: 25, op: '+' },
                        { key: 'skill_points', val: 10, op: '+' }
                    ],
                    exp: 25
                },
                onFail: {
                    text: {
                        zh: "你急忙上前想接下這個空缺，但因為太過倉促，表現得十分笨拙。機會最終還是溜走了。",
                        jp: "慌ててその空席に飛び込もうとしたが、あまりにも準備不足で不手際を晒してしまった。結局、機会は逃げていった。",
                        kr: "급히 나서서 그 빈자리를 차지하려 했지만, 너무 서두른 나머지 서툰 모습만 보이고 말았다. 기회는 결국 날아가 버렸다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你毫不猶豫地接手了爛攤子，並以驚人的效率將其完美收尾。你做到了。有些機會，確實只有準備好的人才能穩穩接住。",
                            jp: "躊躇なくその尻拭いを引き受け、驚異的な効率で完璧に仕上げた。あなたはやってのけた。一部の機会は、準備ができている者だけが確実に掴めるのだ。",
                            kr: "망설임 없이 그 뒷수습을 맡았고, 놀라운 효율로 완벽하게 마무리했다. 당신은 해냈다. 어떤 기회는, 오직 준비된 자만이 확실히 잡을 수 있는 법이다."
                        }
                    }],
                    options: [{ label: { zh: "把握良機", jp: "好機を掴む", kr: "호기 포착" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "謹慎評估後再決定",
                    jp: "慎重に評価してから決める",
                    kr: "신중하게 평가 후 결정"
                },
                action: "node_next",
                rewards: {
                    tags: ["had_lucky_break"],
                    varOps: [{ key: 'rank_points', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "這也許是個燙手山芋。你選擇了禮貌地觀望，雖然錯失了一步登天的可能，但也體現了你的穩重，讓高層對你的謹慎留下了印象。",
                            jp: "これは厄介な火種かもしれない。あなたは礼儀正しく様子を見ることを選んだ。一足飛びに出世する可能性は逃したが、その堅実さが上層部に慎重な人間だという印象を残した。",
                            kr: "이건 뜨거운 감자일지도 모른다. 당신은 정중하게 관망하기를 택했고, 단숨에 출세할 가능성은 놓쳤지만 당신의 진중함이 윗사람들에게 신중한 사람이라는 인상을 남겼다."
                        }
                    }],
                    options: [{ label: { zh: "穩重行事", jp: "堅実な行動", kr: "진중한 처사" }, action: "advance_chain" }]
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
                    zh: "你已經太久沒有好好睡覺了。<br><br>壓力在某一個瞬間到達了臨界點。<br><br>你站在{training_location}裡，周圍的聲音好像變得很遠。<br><br>你需要做一個決定——繼續撐著，還是說出來。",
                    jp: "もう随分とまともに眠れていない。<br><br>プレッシャーが、ある瞬間に臨界点に達した。<br><br>{training_location}に立っていると、周囲の音がひどく遠く聞こえる。<br><br>決断しなければならない——このまま耐え続けるか、それとも打ち明けるか。",
                    kr: "제대로 잠을 자지 못한 지 너무 오래되었다.<br><br>압박감이 어느 순간 임계점에 도달했다.<br><br>{training_location}에 서 있는데, 주변의 소리가 까마득하게 멀게 느껴진다.<br><br>결정을 내려야 한다——계속 버틸 것인가, 아니면 털어놓을 것인가."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "找{mentor}坦誠說明",
                    jp: "{mentor}に現状を正直に話す",
                    kr: "{mentor}에게 솔직히 말하다"
                },
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'pressure',    val: -30, op: '+' },
                        { key: 'rank_points', val: 10,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你敲開了對方的門，承認了自己已到達極限。出乎意料的是，{mentor}並沒有責備你，反而欣賞你懂得知退的成熟。你的壓力大幅減輕了。",
                            jp: "ドアを叩き、自分が限界に達していることを認めた。意外なことに、{mentor}はあなたを責めず、むしろ引き際を心得る成熟さを評価してくれた。プレッシャーは大幅に軽減された。",
                            kr: "문을 두드리고, 자신이 한계에 다다랐음을 인정했다. 뜻밖에도 {mentor}은(는) 당신을 질책하지 않았고, 오히려 물러설 때를 아는 성숙함을 높이 평가했다. 압박감이 크게 줄어들었다."
                        }
                    }],
                    options: [{ label: { zh: "放下重擔", jp: "重荷を下ろす", kr: "짐을 내려놓다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "死咬牙關一步一步走",
                    jp: "歯を食いしばり一歩ずつ進む",
                    kr: "이를 꽉 물고 한 걸음씩 걷다"
                },
                check: { stat: 'VIT', val: 6 },
                action: "node_next",
                rewards: {
                    varOps: [
                        { key: 'skill_points', val: 20, op: '+' },
                        { key: 'pressure',     val: -10, op: '+' }
                    ]
                },
                onFail: {
                    varOps: [
                        { key: 'pressure',     val: 15, op: '+' },
                        { key: 'skill_points', val: -10, op: '+' }
                    ],
                    text: {
                        zh: "你眼前一黑，徹底崩潰了。長時間的過載讓你的身體強行停機。但有時候，崩潰本身才是真正休息的開始。",
                        jp: "目の前が真っ暗になり、完全に倒れ込んだ。長時間の過負荷により、体が強制的にシャットダウンしたのだ。しかし時には、崩壊そのものが真の休息の始まりとなる。",
                        kr: "눈앞이 깜깜해지며 완전히 무너져 내렸다. 장기간의 과부하로 몸이 강제로 전원을 꺼버렸다. 하지만 때로는, 무너짐 그 자체가 진정한 휴식의 시작이기도 하다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你拒絕低頭。憑藉著驚人的意志力，你硬是驅使著疲憊的身體完成了今天的指標。你撐過去了。這種極限狀態，反而讓你突破了長久以來的瓶頸。",
                            jp: "屈することを拒んだ。驚異的な意志力で疲弊した体を奮い立たせ、今日のノルマを無理やり達成した。あなたは乗り越えた。この極限状態が、かえって長年の壁を突破させたのだ。",
                            kr: "고개 숙이기를 거부했다. 놀라운 의지력으로 지친 몸을 억지로 이끌고 오늘의 목표를 달성해 냈다. 당신은 버텨냈다. 이 극한의 상태가 도리어 오랜 병목 현상을 돌파하게 만들었다."
                        }
                    }],
                    options: [{ label: { zh: "突破極限", jp: "限界突破", kr: "한계 돌파" }, action: "advance_chain" }]
                }
            }
        ]
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
                    zh: "這一次，不是訓練，不是任務。<br><br>只是一個意外的時刻——<br>你和{mentor}在{env_room}裡，說了一些在其他時候不可能說出口的話。<br><br>關係在這一刻，悄悄地改變了。",
                    jp: "今回は、訓練でも任務でもない。<br><br>ただの予期せぬ瞬間——<br>あなたと{mentor}は{env_room}にいて、他の時なら絶対に口にしないようなことを話した。<br><br>関係がこの瞬間、密かに変わった。",
                    kr: "이번엔 훈련도, 임무도 아니다.<br><br>그저 예상치 못한 순간——<br>당신과 {mentor}은(는) {env_room}에서, 다른 때라면 절대 꺼내지 않았을 말들을 나누었다。<br><br>관계가 이 순간, 은밀하게 변했다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "坦誠說困惑，也說動力",
                    jp: "困惑と動機を素直に話す",
                    kr: "혼란과 원동력을 솔직히 말하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["formed_bond", "has_ally"],
                    varOps: [
                        { key: 'rank_points',  val: 15, op: '+' },
                        { key: 'pressure',     val: -10, op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "卸下了平時的武裝，你分享了自己脆弱的一面，也展現了底層的堅持。對方看著你的眼神變得更加柔和。你們之間建立起了超越上下級的默契。",
                            jp: "普段の武装を解き、自分の脆い部分を共有しつつ、心の底にある信念を見せた。あなたを見る相手の目はより穏やかになった。二人の間には、上下関係を超えた絆が芽生えた。",
                            kr: "평소의 무장을 해제하고, 자신의 연약한 면을 공유하면서도 내면의 굳건함을 보여주었다. 당신을 바라보는 상대의 눈빛이 훨씬 부드러워졌다. 두 사람 사이에 상하 관계를 뛰어넘는 교감이 싹텄다."
                        }
                    }],
                    options: [{ label: { zh: "羈絆加深", jp: "絆が深まる", kr: "유대감 형성" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "保持距離，維持專業",
                    jp: "距離を保ち専門性を維持する",
                    kr: "거리를 두며 프로의식 유지"
                },
                action: "node_next",
                rewards: {
                    tags: ["formed_bond"],
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你察覺到了氣氛的微妙，禮貌地退回了專業的界線內。對方也沒有勉強，尊重了你的選擇。這讓你們的關係維持在一種高效且克制的狀態。",
                            jp: "雰囲気の微妙な変化に気づき、礼儀正しく専門的な境界線へと退いた。相手も無理強いはせず、あなたの選択を尊重した。これにより、二人の関係は効率的かつ節度ある状態に保たれた。",
                            kr: "미묘한 분위기를 눈치채고, 정중하게 프로페셔널한 경계선으로 물러났다. 상대도 강요하지 않고 당신의 선택을 존중했다. 이로써 두 사람의 관계는 효율적이고 절제된 상태로 유지되었다."
                        }
                    }],
                    options: [{ label: { zh: "堅守底線", jp: "一線を守る", kr: "선 긋기" }, action: "advance_chain" }]
                }
            }
        ]
    });
// ============================================================
    // 🎯 [CLIMAX] 養成劇本高潮節點 × 3
    //    設計原則：
    //      - 包含技能線的「最終考核」、晉升線的「關鍵晉升」
    //      - 新增全路線通用的「突發危機救場」
    //      - 嚴格判斷前期累積的 skill_points, rank_points 與標籤
    // ============================================================

    // CLIMAX-A：最終考核（技能提升路線專屬）
    DB.templates.push({
        id: 'rai_climax_final_test',
        type: 'climax',
        reqTags: ['raising', 'route_skill_test'], // 確保是技能線觸發
        dialogue: [
            {
                text: {
                    zh: "考核日。<br><br>你站在{training_location}的中央，所有人都在看。<br>{mentor}坐在評審席上，表情一如既往地難以捉摸。<br>{rival}站在你旁邊，輕輕說：<br>「今天，就見真章了。」",
                    jp: "最終試験の日。<br><br>{training_location}の中央に立つあなたを、全員が注視している。<br>{mentor}は審査席に座り、相変わらず読み取れない表情をしている。<br>隣に立つ{rival}が、静かに言った：<br>「今日、本当の実力が分かるな」",
                    kr: "최종 평가일.<br><br>당신은 {training_location}의 중앙에 서 있고, 모두가 지켜보고 있다.<br>{mentor}은(는) 심사석에 앉아 여느 때처럼 속을 알 수 없는 표정을 짓고 있다.<br>옆에 선 {rival}이(가) 나직하게 말했다:<br>「오늘, 진짜 승부가 나겠군.」"
                }
            }
        ],
        options: [
            // 完整準備，高分通過
            {
                label: {
                    zh: "全力發揮訓練的一切",
                    jp: "訓練のすべてを出し切る",
                    kr: "훈련한 모든 것을 쏟아내다"
                },
                condition: { vars: [{ key: 'skill_points', val: 60, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["passed_test_high"],
                    exp: 60
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸一口氣，將這段時間無數次重複的動作行雲流水地展現出來。沒有一絲猶豫，完美無瑕。<br>全場安靜了一秒，隨後爆發出熱烈的掌聲。連{mentor}也終於露出了滿意的微笑。",
                            jp: "深呼吸をし、これまで無数に繰り返してきた動作を流れるように披露した。一糸の迷いもない、完璧なパフォーマンスだ。<br>会場は一秒静まり返り、その後割れんばかりの拍手が沸き起こった。{mentor}でさえ、ついに満足げな笑みを浮かべた。",
                            kr: "심호흡을 하고, 그동안 수없이 반복했던 동작을 물 흐르듯 선보였다. 한 치의 망설임도 없는, 완벽한 퍼포먼스였다.<br>장내는 1초간 정적에 휩싸였다가, 이내 열렬한 박수갈채가 터져 나왔다. {mentor}조차 마침내 흡족한 미소를 지었다."
                        }
                    }],
                    options: [{ label: { zh: "完美收官", jp: "有終の美", kr: "완벽한 마무리" }, action: "advance_chain" }]
                }
            },
            // 有貴人支持
            {
                label: {
                    zh: "靠{mentor}的提點補足",
                    jp: "{mentor}の助言で補う",
                    kr: "{mentor}의 조언으로 보완"
                },
                condition: { tags: ['has_ally'] },
                action: "node_next",
                rewards: {
                    tags: ["passed_test_mid"],
                    exp: 40
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你在過程中出現了一個小失誤，但你立刻想起了{mentor}私下的提點，巧妙地將失誤掩蓋過去。<br>雖然不算完美，但評審席上的{mentor}為你點了點頭，這足以讓你過關。",
                            jp: "途中で小さなミスをしたが、{mentor}からの個人的な助言をすぐに思い出し、巧みにミスをカバーした。<br>完璧とは言えないが、審査席の{mentor}があなたに頷き、それで合格には十分だった。",
                            kr: "도중에 작은 실수가 있었지만, {mentor}이(가) 개인적으로 해주었던 조언을 곧바로 떠올려 교묘하게 실수를 무마했다.<br>완벽하진 않았지만, 심사석의 {mentor}이(가) 당신을 향해 고개를 끄덕여주었고, 그것으로 통과하기엔 충분했다."
                        }
                    }],
                    options: [{ label: { zh: "順利過關", jp: "無事合格", kr: "무사 통과" }, action: "advance_chain" }]
                }
            },
            // 技能不足，硬撐保底
            {
                label: {
                    zh: "知道還不夠，但不放棄",
                    jp: "不十分とわかっていても諦めない",
                    kr: "부족한 걸 알아도 포기하지 않다"
                },
                action: "node_next",
                rewards: {
                    tags: ["attempted_test"],
                    varOps: [{ key: 'pressure', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你咬緊牙關硬撐到了最後，但實力的差距無法隱瞞，你的表現充滿了破綻。<br>你在眾人的目光下感到無地自容，壓力直線上升，但你至少撐完了全程。",
                            jp: "歯を食いしばって最後まで耐え抜いたが、実力差は隠しきれず、パフォーマンスは破綻だらけだった。<br>群衆の視線に穴があったら入りたい気分になり、プレッシャーは急上昇したが、少なくとも最後までやり遂げた。",
                            kr: "이를 악물고 끝까지 버텼지만, 실력 차이는 숨길 수 없었고 퍼포먼스는 허점투성이였다.<br>사람들의 시선에 쥐구멍에라도 숨고 싶을 만큼 압박감이 치솟았지만, 적어도 끝까지 해내기는 했다."
                        }
                    }],
                    options: [{ label: { zh: "遺憾收場", jp: "無念の結末", kr: "아쉬운 마무리" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-B：關鍵晉升機會（晉升路線專屬）
    DB.templates.push({
        id: 'rai_climax_promotion',
        type: 'climax',
        reqTags: ['raising', 'route_climb'], // 確保是晉升線觸發
        dialogue: [
            {
                text: {
                    zh: "機會終於來了。<br><br>一個位置空出來了，所有人都知道是誰最有資格——<br>但「最有資格」和「得到」之間，還有很長的距離。<br><br>{rival}已經在{mentor}（或高層）面前展示了自己的成績。<br>現在，輪到你了。",
                    jp: "ついに機会がやってきた。<br><br>あるポジションが空き、誰が最もふさわしいか誰もが知っている——<br>だが、「ふさわしい」ことと「手に入れる」ことの間には、大きな隔たりがある。<br><br>{rival}はすでに{mentor}（あるいは上層部）に自分の実績をアピールした。<br>さあ、今度はあなたの番だ。",
                    kr: "드디어 기회가 왔다.<br><br>한 자리가 비었고, 누가 가장 적임자인지는 모두가 알고 있다——<br>하지만 '가장 적임자'인 것과 '그 자리를 차지하는 것' 사이에는 아주 큰 거리가 있다.<br><br>{rival}은(는) 이미 {mentor}(혹은 윗선) 앞에서 자신의 성과를 내보였다.<br>이제, 당신 차례다."
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
                action: "node_next",
                rewards: {
                    tags: ["won_promotion"],
                    exp: 60
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你將完美無瑕的成績單與各方勢力的推薦信輕輕放在桌上。這是一場無懈可擊的展示。<br>高層們互相交換了眼神，毫無懸念地，這個位置是你的了。",
                            jp: "非の打ち所のない成績表と、各方面の勢力からの推薦状を静かに机に置いた。それは完璧なアピールだった。<br>上層部が目配せを交わす。疑う余地なく、そのポジションはあなたのものだ。",
                            kr: "흠잡을 데 없는 성적표와 각계 세력의 추천서를 조용히 책상 위에 올려놓았다. 완벽하고도 빈틈없는 프레젠테이션이었다.<br>윗사람들은 시선을 교환했고, 의심의 여지 없이 그 자리는 당신의 차지가 되었다."
                        }
                    }],
                    options: [{ label: { zh: "上位成功", jp: "昇進成功", kr: "승진 성공" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "依靠{mentor}的背書",
                    jp: "{mentor}の後ろ盾に頼る",
                    kr: "{mentor}의 보증에 의지하다"
                },
                condition: { tags: ['has_ally', 'key_achievement'] },
                action: "node_next",
                rewards: {
                    tags: ["won_promotion_backed"],
                    exp: 45
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "面對高層的質疑，{mentor}適時地站了出來，為你的能力與潛力作出了強力的擔保。<br>在這句話的分量下，反對的聲音被壓了下去，你驚險地拿下了這個位置。",
                            jp: "上層部の疑問の声に対し、{mentor}が絶妙なタイミングで前に出て、あなたの能力と将来性を強力に保証してくれた。<br>その言葉の重みに反対意見は押し潰され、あなたは辛くもそのポジションを勝ち取った。",
                            kr: "윗선의 의구심 앞에 {mentor}이(가) 적절한 타이밍에 나서서 당신의 능력과 잠재력을 강력하게 보증해 주었다.<br>그 말의 무게에 반대의 목소리는 잦아들었고, 당신은 아슬아슬하게 그 자리를 따냈다."
                        }
                    }],
                    options: [{ label: { zh: "驚險晉升", jp: "際どい昇進", kr: "아슬아슬한 승진" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "資歷不足，提未來計畫",
                    jp: "実績不足だが未来の計画を語る",
                    kr: "경력은 부족하지만 미래 계획 제시"
                },
                action: "node_next",
                rewards: {
                    tags: ["attempted_promotion"],
                    varOps: [{ key: 'pressure', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你試圖用宏大的未來計畫來彌補資歷的空缺，但高層們的反應十分冷淡。<br>「我們需要的是即戰力，不是空頭支票。」你落選了，同時感到了深深的挫敗。",
                            jp: "壮大な未来の計画で実績の不足を補おうとしたが、上層部の反応は非常に冷ややかだった。<br>「我々が必要としているのは即戦力だ。絵に描いた餅ではない」あなたは落選し、深い挫折感を味わった。",
                            kr: "거창한 미래 계획으로 경력의 공백을 메우려 했지만, 윗사람들의 반응은 매우 냉담했다.<br>「우리가 필요한 건 즉시 전력감이지, 빈 수표가 아니네.」 당신은 탈락했고, 깊은 좌절감을 느꼈다."
                        }
                    }],
                    options: [{ label: { zh: "晉升失敗", jp: "昇進失敗", kr: "승진 실패" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-C：突發危機救場（全路線通用高潮，為你新增）
    DB.templates.push({
        id: 'rai_climax_crisis_breakthrough',
        type: 'climax',
        reqTags: ['raising'], // 全路線皆可觸發
        dialogue: [
            {
                text: {
                    zh: "突發狀況。<br><br>原本安排好的重要環節出了大錯，全場陷入混亂。<br>{rival}試圖救場，卻因為過度緊張反而讓情況更糟。<br><br>所有人的目光都驚恐地望著台上。<br>這是危機，也是絕佳的舞台。現在是挽救一切的最後機會。",
                    jp: "突発的なトラブルだ。<br><br>予定されていた重要なプログラムで大失敗が起き、会場全体が混乱に陥った。<br>{rival}が事態を収拾しようとしたが、過度の緊張からかえって状況を悪化させてしまった。<br><br>全員が恐怖の面持ちでステージを見つめている。<br>これは危機であり、同時に絶好の舞台でもある。すべてを挽回する最後のチャンスだ。",
                    kr: "돌발 상황이다.<br><br>원래 예정되어 있던 중요한 순서에서 큰 실수가 발생해, 장내 전체가 혼란에 빠졌다.<br>{rival}이(가) 수습하려 했지만 지나치게 긴장한 탓에 오히려 상황을 악화시키고 말았다.<br><br>모두가 경악 어린 시선으로 무대를 바라보고 있다.<br>이것은 위기이자, 절호의 무대이기도 하다. 모든 것을 만회할 마지막 기회다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "憑硬實力上台救場",
                    jp: "確かな実力でステージを救う",
                    kr: "순수한 실력으로 무대를 수습하다"
                },
                condition: { vars: [{ key: 'skill_points', val: 50, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["saved_the_day_skill"],
                    exp: 60
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你冷靜地走上前，用無可挑剔的專業能力瞬間穩住了崩潰的環節。每一個動作、每一句話都精準無誤。<br>危機被你化解於無形，全場在震驚後為你爆發出雷鳴般的歡呼。",
                            jp: "冷静に前に進み出て、非の打ち所のない専門的な能力で、崩壊しかけたプログラムを瞬時に立て直した。あらゆる動作、言葉が正確無比だった。<br>危機は見事に回避され、会場は驚きから一転、雷鳴のような歓声に包まれた。",
                            kr: "침착하게 앞으로 나서서, 흠잡을 데 없는 전문적인 능력으로 붕괴 직전의 순서를 순식간에 안정시켰다. 모든 동작과 말이 정확하게 들어맞았다.<br>위기는 감쪽같이 해소되었고, 장내는 경악에 빠졌다가 이내 우레와 같은 환호성을 터뜨렸다."
                        }
                    }],
                    options: [{ label: { zh: "力挽狂瀾", jp: "起死回生", kr: "위기 모면" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "憑手腕調度資源平息",
                    jp: "手腕を発揮し資源を動員する",
                    kr: "수완을 발휘해 자원을 조달하다"
                },
                condition: { vars: [{ key: 'rank_points', val: 40, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["saved_the_day_rank"],
                    exp: 60
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有親自下場，而是迅速拿過麥克風指揮現場人員。利用你累積的人脈和威望，你極高效率地調度了備用資源。<br>混亂在你的掌控下迅速平息，高層對你的領導力刮目相看。",
                            jp: "自ら手を下すのではなく、素早くマイクを奪い現場のスタッフを指揮した。これまでに築いた人脈と威信を活かし、極めて効率的に予備の資源を動員した。<br>混乱はあなたの采配によって瞬時に鎮まり、上層部はあなたの統率力を見直した。",
                            kr: "직접 나서지 않고, 재빨리 마이크를 잡아 현장 스태프들을 지휘했다. 그동안 쌓아온 인맥과 위상을 활용해 아주 효율적으로 예비 자원들을 조달해 냈다.<br>혼란은 당신의 통제하에 빠르게 가라앉았고, 윗사람들은 당신의 리더십에 감탄했다."
                        }
                    }],
                    options: [{ label: { zh: "展現大將之風", jp: "将器を示す", kr: "리더십 발휘" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "咬牙硬抗，試圖幫忙",
                    jp: "歯を食いしばって手助けを試みる",
                    kr: "이를 악물고 어떻게든 도와보려 하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["attempted_save"],
                    varOps: [{ key: 'pressure', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你衝上前去試圖幫忙，但事態超出了你的能力範圍。雖然你勉強沒讓情況繼續惡化，但也弄得自己狼狽不堪。<br>危機度過了，但你並不是這場風波中的英雄。",
                            jp: "前に飛び出して手助けを試みたが、事態はあなたの能力の範疇を超えていた。状況のさらなる悪化は辛うじて防いだものの、あなた自身もボロボロになった。<br>危機は去ったが、あなたはこの騒動の英雄にはなれなかった。",
                            kr: "앞으로 뛰어나가 어떻게든 도와보려 했지만, 사태는 당신의 능력 밖이었다. 간신히 상황이 더 악화되는 것만 막았을 뿐, 당신 자신도 엉망진창이 되고 말았다.<br>위기는 넘겼지만, 당신이 이 소동의 영웅이 되지는 못했다."
                        }
                    }],
                    options: [{ label: { zh: "勉強度過", jp: "どうにか乗り切る", kr: "간신히 넘김" }, action: "advance_chain" }]
                }
            }
        ]
    });

// ============================================================
    // 🏆 [END] 養成路線結局節點 × 5
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
                    zh: "你的表現讓所有人沉默了。<br><br>不是因為意外，而是因為——他們早就知道你能做到，只是沒想到你真的做到了。<br><br>{mentor}走到你面前，第一次伸出手：<br>「幹得好。」<br>————<br>【完美成就】<br>技能值：{skill_points}",
                    jp: "あなたのパフォーマンスは、全員を沈黙させた。<br><br>予想外だったからではない。彼らはあなたがやれると前から知っていたが——本当にやってのけるとは、思っていなかったからだ。<br><br>{mentor}があなたの前に歩み寄り、初めて手を差し出した。<br>「よくやった」<br>————<br>【完璧な偉業】<br>スキルポイント：{skill_points}",
                    kr: "당신의 퍼포먼스는 모두를 침묵하게 만들었다.<br><br>예상 밖이라서가 아니다. 그들은 당신이 해낼 수 있다는 걸 예전부터 알고 있었지만——정말로 해낼 줄은 몰랐기 때문이다.<br><br>{mentor}이(가) 당신 앞으로 다가와, 처음으로 손을 내밀었다.<br>「잘했다.」<br>————<br>【완벽한 성취】<br>스킬 포인트: {skill_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束旅程", jp: "旅を終える", kr: "여정 종료" }, action: "finish_chain", rewards: { exp: 120, gold: 60 } }]
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
                    zh: "你得到了那個位置。<br><br>不是靠運氣，是靠你一步一步走到這裡。<br><br>{rival}看著你，表情複雜。<br>你決定是否要說些什麼——或者什麼都不說，讓結果代替你發言。<br>————<br>【晉升成功】<br>等級分：{rank_points}",
                    jp: "あなたはそのポジションを手に入れた。<br><br>運ではない。一歩一歩、自分の足でここまで登り詰めたのだ。<br><br>{rival}が複雑な表情であなたを見ている。<br>何か言葉をかけるか——あるいは何も言わず、結果に語らせるかは、あなたの自由だ。<br>————<br>【昇進成功】<br>ランクポイント：{rank_points}",
                    kr: "당신은 그 자리를 차지했다.<br><br>운이 아니다. 한 걸음 한 걸음, 당신의 힘으로 여기까지 온 것이다.<br><br>{rival}이(가) 복잡한 표정으로 당신을 바라본다.<br>무슨 말을 건넬지——혹은 아무 말 없이 결과로 증명할지는, 당신의 선택이다.<br>————<br>【승진 성공】<br>등급 포인트: {rank_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束旅程", jp: "旅を終える", kr: "여정 종료" }, action: "finish_chain", rewards: { exp: 100, gold: 50 } }]
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
                    zh: "你沒有達到最頂端。<br><br>但你也沒有失敗——只是普通。<br>普通，在這個地方，已經比大多數人走得更遠了。<br><br>{mentor}說：「你還有進步的空間。」<br>這句話，也許是批評，也許是期待。<br>————<br>【平凡結局】",
                    jp: "頂点には届かなかった。<br><br>だが失敗したわけではない——ただ、普通だった。<br>普通であること、それはこの場所において、すでに大半の者より遠くまで進んだことを意味する。<br><br>{mentor}は言った：「まだ伸びしろがあるな」<br>その言葉は批判かもしれないし、期待かもしれない。<br>————<br>【平凡な結末】",
                    kr: "최정상에 도달하지는 못했다.<br><br>하지만 실패한 것도 아니다——그저 평범했을 뿐이다.<br>평범함, 이곳에서 그것은 이미 대다수의 사람보다 더 멀리 왔다는 것을 의미한다.<br><br>{mentor}이(가) 말했다: 「아직 발전할 여지가 있군.」<br>그 말은 비판일 수도, 기대일 수도 있다.<br>————<br>【평범한 결말】"
                }
            }
        ],
        options: [{ label: { zh: "結束旅程", jp: "旅を終える", kr: "여정 종료" }, action: "finish_chain", rewards: { exp: 50, gold: 20 } }]
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
                    zh: "你不是靠自己一個人走到這裡的。<br><br>{mentor}在最關鍵的時刻說了一句話，那句話，改變了所有人的判斷。<br><br>你知道這其中有運氣的成分。<br>但你也知道，是你讓自己配得上那句話。<br>————<br>【貴人相助】",
                    jp: "自分一人の力でここまで来たわけではない。<br><br>{mentor}が最も重要な局面で発したあの一言が、全員の判断を変えたのだ。<br><br>運の要素があったことは分かっている。<br>だが、自分があの言葉にふさわしい人間になれたのだということも、あなたは知っている。<br>————<br>【後援者の導き】",
                    kr: "혼자만의 힘으로 여기까지 온 것은 아니다.<br><br>{mentor}이(가) 가장 결정적인 순간에 던진 그 한마디가, 모든 사람의 판단을 바꾸어 놓았다.<br><br>운이 따랐다는 것은 안다.<br>하지만 자신이 그 말에 걸맞은 사람이 되었다는 것 또한, 당신은 알고 있다.<br>————<br>【귀인의 도움】"
                }
            }
        ],
        options: [{ label: { zh: "結束旅程", jp: "旅を終える", kr: "여정 종료" }, action: "finish_chain", rewards: { exp: 70, gold: 30 } }]
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
                    zh: "你沒有成功。<br><br>但「失敗」這件事本身，也許是這段旅程最重要的收穫。<br><br>下一次，你會帶著這些痛苦重新開始。<br>也許那才是真正的起點。<br>————<br>【壯烈失敗】<br>技能值：{skill_points}",
                    jp: "成功はしなかった。<br><br>しかし「失敗」という経験そのものが、この旅の最も重要な収穫だったのかもしれない。<br><br>次は、この苦しみを背負ってやり直すだろう。<br>おそらくそれこそが、本当のスタート地点なのだ。<br>————<br>【壮絶な敗北】<br>スキルポイント：{skill_points}",
                    kr: "성공하지 못했다.<br><br>하지만 '실패' 그 자체가 이 여정의 가장 중요한 수확일지도 모른다.<br><br>다음번엔, 이 고통을 짊어지고 다시 시작할 것이다.<br>어쩌면 그것이 진정한 출발점일지도 모른다.<br>————<br>【장렬한 실패】<br>스킬 포인트: {skill_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束旅程", jp: "旅を終える", kr: "여정 종료" }, action: "finish_chain", rewards: { exp: 20 } }]
    });

    console.log("✅ story_raising.js V1.0 已載入（3 開場 × 10 中段 × 2 高潮 × 5 結局）");
})();