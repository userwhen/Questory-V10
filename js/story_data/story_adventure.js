/* js/story_data/story_adventure.js - V1.0
 * 冒險劇本節點
 *
 * 核心機制：
 *   skill_points  → 冒險過程中積累，決定最終能否打敗 BOSS
 *   puzzle_solved → 解謎成功的標記，解鎖高潮的「知識解法」選項
 *   boss_weakness → 找到 BOSS 弱點，讓戰鬥成功率大幅提升
 *
 * 路線（由開場選擇）：
 *   route_explorer → 解謎/探索為主，古墓奇兵風格
 *   route_warrior  → 戰鬥成長為主，打怪練功風格
 *   （兩條路線的中段節點大量共用，差異在 climax 的決勝判定）
 *
 * 與其他劇本的共用節點（reqTags 標記說明）：
 *   reqTags: ['adventure']              → 只有冒險劇本觸發
 *   reqTags: ['adventure', 'horror']    → 冒險與恐怖共用
 *   reqTags: ['adventure', 'mystery']   → 冒險與偵探共用
 *   reqTags: ['adventure', 'horror', 'mystery'] → 三個劇本都能觸發
 *
 * 技能成長與養成劇本的連結：
 *   skill_points 變數在養成劇本的 climax 同樣被讀取
 *   因此冒險中練到的技能，可以直接帶進養成模式的最終考驗
 */
(function () {
    const DB = window.FragmentDB;
    if (!DB) { console.error("❌ story_adventure.js: FragmentDB 未就緒"); return; }

    DB.templates = DB.templates || [];


// ============================================================
    // 🎬 [START] 冒險劇本開場節點 × 3
    // ============================================================

    // START-A：探索古蹟（解謎路線導向）
    DB.templates.push({
        id: 'adv_start_ruin',
        type: 'start',
        reqTags: ['adventure'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 0,  op: 'set' },
                { key: 'puzzle_count', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "{weather}的{atmosphere}之中，古老的{env_building}終於出現在你眼前。<br><br>傳說中，{boss}就藏在這裡最深的地方。<br>{world_state}的時代裡，能到達這裡的人已經不多了。<br><br>{env_pack_visual}",
                    jp: "{weather}の{atmosphere}の中、ついに古き{env_building}が目の前に現れた。<br><br>伝説によると、{boss}はこの最深部に潜んでいるという。<br>{world_state}の時代において、ここまで辿り着ける者はすでに少ない。<br><br>{env_pack_visual}",
                    kr: "{weather}의 {atmosphere} 속에서, 마침내 오래된 {env_building}이(가) 눈앞에 나타났다.<br><br>전설에 따르면, {boss}은(는) 이곳 가장 깊은 곳에 숨어 있다고 한다.<br>{world_state}의 시대에 여기까지 도달할 수 있는 사람은 이제 많지 않다.<br><br>{env_pack_visual}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "深入探索",
                    jp: "深く探索する",
                    kr: "깊이 탐색하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_explorer"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你攤開地圖，仔細比對著周圍的地形，小心翼翼地避開了門口可疑的機關，沿著相對安全的路線深入。",
                            jp: "地図を広げて周囲の地形を慎重に見比べ、入り口にある怪しい仕掛けを避けながら、比較的安全なルートに沿って奥へと進んだ。",
                            kr: "지도를 펼쳐 주변 지형을 주의 깊게 대조하고, 입구의 의심스러운 장치를 조심스럽게 피해 비교적 안전한 길을 따라 깊이 들어갔다."
                        }
                    }],
                    options: [{ label: { zh: "繼續前進", jp: "先へ進む", kr: "계속 전진" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "武力突破",
                    jp: "武力で突破する",
                    kr: "무력으로 돌파하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_warrior"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有理會那些繁瑣的路線，直接拔出武器破開了阻擋在門口的障礙，氣勢如虹地踏入其中。",
                            jp: "煩わしいルートなど気にも留めず、武器を抜いて入り口を塞ぐ障害物を直接破壊し、勢いよく中へと足を踏み入れた。",
                            kr: "번거로운 길은 신경 쓰지 않고, 무기를 빼들어 입구를 막고 있는 장애물을 부수며 기세 좋게 안으로 발을 내디뎠다."
                        }
                    }],
                    options: [{ label: { zh: "強勢踏入", jp: "強気で踏み込む", kr: "강력한 진입" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // START-B：接受委託，深入危地
    DB.templates.push({
        id: 'adv_start_quest',
        type: 'start',
        reqTags: ['adventure'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 5,  op: 'set' },
                { key: 'puzzle_count', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "委託書上只寫了兩件事：目的地，以及報酬。<br><br>你帶著{start_bonus}，踏入了{env_building}。<br>據說{boss}已經在這裡盤踞多年，沒有人能將它驅逐。<br><br>也許你是第一個真正有機會的人。",
                    jp: "依頼書に書かれているのは二つだけ：目的地と、報酬だ。<br><br>あなたは{start_bonus}を手に、{env_building}へと足を踏み入れた。<br>{boss}は長年ここに居座り、誰も追い払うことができなかったという。<br><br>もしかすると、あなたこそが本当にチャンスを掴む最初の人間かもしれない。",
                    kr: "의뢰서에는 단 두 가지만 적혀 있다: 목적지와 보수.<br><br>당신은 {start_bonus}을(를) 챙겨 {env_building}에 발을 들였다.<br>듣자 하니 {boss}이(가) 수년간 이곳에 똬리를 틀고 있어 아무도 몰아내지 못했다고 한다.<br><br>어쩌면 당신이 진정한 기회를 가진 첫 번째 사람일지도 모른다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "偵察地形",
                    jp: "地形を偵察する",
                    kr: "지형을 정찰하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_explorer", "has_preparation"],
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "經驗告訴你不能魯莽。你先摸清了周遭的環境配置，確保了掩體與視線死角後，才開始向內推進。",
                            jp: "経験上、無謀な行動は禁物だと分かっている。まずは周囲の環境配置を把握し、遮蔽物と死角を確保してから内部への前進を開始した。",
                            kr: "경험상 무모한 행동은 금물이다. 먼저 주변 환경 배치를 파악하고, 엄폐물과 사각지대를 확보한 후에야 안으로 전진하기 시작했다."
                        }
                    }],
                    options: [{ label: { zh: "開始潛入", jp: "潜入開始", kr: "잠입 시작" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "直搗黃龍",
                    jp: "敵の本拠地を突く",
                    kr: "적의 본거지를 치다"
                },
                action: "node_next",
                rewards: {
                    tags: ["route_warrior"],
                    varOps: [{ key: 'skill_points', val: 3, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "既然目標明確，就不需要浪費時間。你握緊武器，徑直朝著最危險的氣息源頭大步走去。",
                            jp: "目標が明確である以上、時間を無駄にする必要はない。武器を握り締め、最も危険な気配がする源へと真っ直ぐに大股で歩き出した。",
                            kr: "목표가 명확한 이상 시간을 낭비할 필요는 없다. 무기를 꽉 쥐고 가장 위험한 기운이 느껴지는 근원지를 향해 곧장 발걸음을 옮겼다."
                        }
                    }],
                    options: [{ label: { zh: "正面迎擊", jp: "正面から迎え撃つ", kr: "정면 돌파" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // START-C：意外發現，被捲入其中
    DB.templates.push({
        id: 'adv_start_accidental',
        type: 'start',
        reqTags: ['adventure'],
        onEnter: {
            varOps: [
                { key: 'skill_points', val: 0,  op: 'set' },
                { key: 'puzzle_count', val: 0,  op: 'set' }
            ]
        },
        dialogue: [
            {
                text: {
                    zh: "你本來只是路過。<br><br>但{env_pack_sensory}。<br><br>然後是{sentence_event_sudden}。<br><br>{env_building}的入口就在你面前，某種東西把你往裡面拉。<br>這不是偶然，你感覺得到。",
                    jp: "ただ通りかかっただけのはずだった。<br><br>しかし、{env_pack_sensory}。<br><br>そして、{sentence_event_sudden}。<br><br>{env_building}の入り口が目の前にあり、何かがあなたを中へ引きずり込もうとしている。<br>偶然ではない。肌でそう感じる。",
                    kr: "당신은 그저 지나가던 길이었다.<br><br>하지만 {env_pack_sensory}.<br><br>그리고 {sentence_event_sudden}.<br><br>{env_building}의 입구가 눈앞에 있고, 무언가가 당신을 안으로 끌어당기고 있다.<br>이건 우연이 아니다. 당신은 느낄 수 있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "順從直覺",
                    jp: "直感に従う",
                    kr: "직감에 따르다"
                },
                action: "node_next",
                rewards: { tags: ["route_explorer"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有抵抗那股無形的牽引力，順著神秘的預感走進了深處。前方的迷霧似乎主動為你讓開了一條路。",
                            jp: "見えない引力に抵抗することなく、神秘的な予感に従って奥へと進んだ。前方の霧が、まるで自ら道を譲ってくれるかのようだった。",
                            kr: "그 보이지 않는 이끌림에 저항하지 않고, 신비한 예감에 따라 깊은 곳으로 들어갔다. 앞의 안개가 마치 스스로 길을 비켜주는 듯했다."
                        }
                    }],
                    options: [{ label: { zh: "隨波逐流", jp: "流れに身を任せる", kr: "흐름에 몸을 맡기다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "準備戰鬥",
                    jp: "戦闘準備",
                    kr: "전투 준비"
                },
                action: "node_next",
                rewards: { tags: ["route_warrior"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "本能發出了強烈的警告。你立刻抽出武器，全神貫注地戒備著四周，緩步踏入了這片未知的領域。",
                            jp: "本能が強い警告を発した。すぐに武器を抜き、四方に全神経を集中させて警戒しながら、未知の領域へとゆっくり足を踏み入れた。",
                            kr: "본능이 강렬한 경고를 보냈다. 즉시 무기를 꺼내 들고 사방을 온 신경을 다해 경계하며, 이 미지의 영역으로 천천히 발을 내디뎠다."
                        }
                    }],
                    options: [{ label: { zh: "步步為營", jp: "慎重に進む", kr: "신중하게 전진" }, action: "advance_chain" }]
                }
            }
        ]
    });

// ============================================================
    // 🗺️ [MIDDLE - 探索路線] 解謎與偵察
    //    reqTags: ['adventure', 'route_explorer']
    // ============================================================

    // MIDDLE-探索-A：古代謎題（密室逃脫風格）
    DB.templates.push({
        id: 'adv_mid_exp_puzzle',
        type: 'middle',
        reqTags: ['adventure', 'route_explorer'],
        excludeTags: ['solved_main_puzzle'],
        dialogue: [
            {
                text: {
                    zh: "前方的通道被一道石門封死。<br><br>門上刻著複雜的圖案——這是某種謎題。<br><br>{env_pack_visual}<br><br>旁邊的石壁上，隱約有文字：<br>「{world_vibe}的時代裡，強者並非用力量開路，而是用他所知道的去解開束縛。」",
                    jp: "前方の通路が石の扉で完全に塞がれている。<br><br>扉には複雑な模様が刻まれている——何らかの謎解きのようだ。<br><br>{env_pack_visual}<br><br>傍らの石壁には、微かに文字が読み取れる：<br>「{world_vibe}の時代において、強者は力で道を切り拓くのではなく、己の知識で呪縛を解き放つ」",
                    kr: "앞쪽 통로가 돌문으로 꽉 막혀 있다.<br><br>문에는 복잡한 문양이 새겨져 있다——일종의 퍼즐이다.<br><br>{env_pack_visual}<br><br>옆쪽 돌벽에 흐릿한 글귀가 보인다:<br>「{world_vibe}의 시대에, 강자는 힘으로 길을 열지 않고 자신이 아는 것으로 속박을 푼다.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "摸索石門找規律",
                    jp: "石の扉を触って規則を探す",
                    kr: "돌문을 더듬어 규칙을 찾다"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next",
                rewards: {
                    tags: ["solved_main_puzzle", "puzzle_solved"],
                    varOps: [
                        { key: 'skill_points', val: 20, op: '+' },
                        { key: 'puzzle_count', val: 1,  op: '+' }
                    ],
                    exp: 25
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: -10, op: '+' }],
                    text: {
                        zh: "你沒能看出端倪，反而按錯了一塊突起的石磚。一陣刺鼻的毒霧噴出，讓你劇烈咳嗽起來。",
                        jp: "手がかりを見つけられず、誤って出っ張った石レンガを押してしまった。鼻を突く毒霧が噴き出し、激しく咳き込んだ。",
                        kr: "단서를 찾지 못하고 도리어 튀어나온 돌벽돌을 잘못 눌렀다. 코를 찌르는 독안개가 뿜어져 나와 격렬하게 기침을 했다."
                    }
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你蹲下身，仔細地從頭到尾摸了一遍石門上的刻紋。<br>你找到了規律——這個謎題的答案藏在{world_vibe}的歷史典故裡。伴隨著沉重的轟鳴聲，石門緩緩移動，為你敞開了道路。",
                            jp: "しゃがみ込み、石の扉に刻まれた模様を端から端まで念入りに触れていった。<br>規則性を見つけた——この謎の答えは、{world_vibe}の歴史的背景に隠されていたのだ。重々しい轟音と共に石の扉がゆっくりと動き、道を開いた。",
                            kr: "몸을 숙여 돌문에 새겨진 문양을 처음부터 끝까지 주의 깊게 더듬어 보았다.<br>규칙을 찾았다——이 퍼즐의 해답은 {world_vibe}의 역사적 배경 속에 숨겨져 있었다. 육중한 굉음과 함께 돌문이 천천히 움직이며 길을 열어주었다."
                        }
                    }],
                    options: [{ label: { zh: "繼續前進", jp: "先へ進む", kr: "계속 전진" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "暴力衝撞石門",
                    jp: "武力で石の扉に体当たりする",
                    kr: "무력으로 돌문에 들이받다"
                },
                check: { stat: 'STR', val: 6 },
                action: "node_next",
                rewards: {
                    tags: ["solved_main_puzzle"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: -15, op: '+' }],
                    text: {
                        zh: "石門紋風不動，強大的反作用力反而震得你骨頭髮麻。機關被觸動，無數暗箭朝你射來！",
                        jp: "石の扉はびくともせず、強大な反作用で骨が痺れるほどの衝撃を受けた。仕掛けが作動し、無数の暗器があなたに向かって放たれた！",
                        kr: "돌문은 꿈쩍도 하지 않았고, 강력한 반작용에 뼈가 저릴 정도의 충격을 받았다. 장치가 작동하며 수많은 암기가 당신을 향해 날아왔다!"
                    }
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你無視了牆上的提示，退後三步，用盡全力以肩猛撞石門！<br>石門在你的暴力下轟然碎裂，但也觸動了某個機關——{sentence_event_sudden}。你勉強躲過了這波致命的襲擊。",
                            jp: "壁のヒントを無視して三歩下がり、全力で石の扉に肩から体当たりした！<br>石の扉はあなたの暴力によって粉々に砕け散ったが、同時に何かの仕掛けを作動させてしまった——{sentence_event_sudden}。間一髪で致命的な襲撃を躱した。",
                            kr: "벽의 힌트를 무시하고 세 걸음 물러선 뒤, 온 힘을 다해 어깨로 돌문을 들이받았다!<br>돌문은 당신의 무력에 산산조각 났지만, 동시에 어떤 장치를 건드리고 말았다——{sentence_event_sudden}. 당신은 간신히 치명적인 습격을 피했다."
                        }
                    }],
                    options: [{ label: { zh: "驚險過關", jp: "間一髪の突破", kr: "아슬아슬한 통과" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "繞開找線索",
                    jp: "迂回して手がかりを探す",
                    kr: "우회해서 단서를 찾다"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'skill_points', val: 3, op: '+' }] },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你不打算硬碰硬，決定先退回前面的通道，尋找可能遺漏的線索或別的出路。",
                            jp: "強行突破するつもりはない。まずは前の通路に戻り、見落とした手がかりや別の抜け道がないか探すことにした。",
                            kr: "정면충돌은 피하기로 하고, 일단 앞쪽 통로로 물러나 놓친 단서나 다른 출구가 없는지 찾아보기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "暫時撤退", jp: "一時撤退", kr: "일단 후퇴" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-探索-B：發現 BOSS 的弱點記錄
    DB.templates.push({
        id: 'adv_mid_exp_weakness',
        type: 'middle',
        reqTags: ['adventure', 'route_explorer'],
        excludeTags: ['boss_weakness'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_find_action}<br><br>是一份古代的戰鬥記錄。<br>字跡早已模糊，但關鍵的部分你還是讀出來了：<br><br>「{boss}的弱點在於——」<br><br>後面的字被人刻意刮去了一半，但你能推斷出剩下的部分。",
                    jp: "{phrase_find_action}<br><br>古代の戦闘記録だ。<br>筆跡はとうにぼやけているが、重要な部分はなんとか読み取れた：<br><br>「{boss}の弱点は——」<br><br>その後の文字は誰かに意図的に半分削り取られていたが、残りの部分から推測できそうだ。",
                    kr: "{phrase_find_action}<br><br>고대의 전투 기록이다.<br>글씨는 이미 흐릿해졌지만, 핵심적인 부분은 읽어낼 수 있었다:<br><br>「{boss}의 약점은 바로——」<br><br>뒤쪽 글자는 누군가 고의로 절반을 긁어냈지만, 나머지 부분을 유추할 수 있을 것 같다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "腦中填補空白",
                    jp: "頭の中で空白を補う",
                    kr: "머릿속으로 공백을 채우다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["boss_weakness"],
                    varOps: [{ key: 'skill_points', val: 25, op: '+' }],
                    exp: 20
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: -5, op: '+' }],
                    text: {
                        zh: "你盯著那些殘破的字跡看了半天，依舊毫無頭緒，反而讓自己頭痛欲裂。",
                        jp: "削り取られた文字をいつまでも睨んでいたが、まったく見当もつかず、かえって頭痛が激しくなった。",
                        kr: "훼손된 글자를 한참 쳐다보았지만 여전히 갈피를 잡을 수 없었고, 오히려 두통만 심해졌다."
                    }
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "你瞇起眼，運用自己豐富的見識與對這座遺跡的了解，在腦中完美拼湊出了殘缺的段落。<br>你推算出了完整的弱點。面對{boss}時，這將是決定性的優勢。",
                            jp: "目を細め、これまでの豊富な知識とこの遺跡への理解を駆使して、頭の中で欠けた段落を完璧に繋ぎ合わせた。<br>完全な弱点を導き出した。{boss}と対峙する時、これが決定的な優位性となるだろう。",
                            kr: "눈을 가늘게 뜨고, 풍부한 식견과 이 유적에 대한 이해를 바탕으로 머릿속에서 훼손된 문단을 완벽하게 끼워 맞췄다.<br>온전한 약점을 알아냈다. {boss}와(과) 맞설 때 이것이 결정적인 우위가 될 것이다."
                        }
                    }],
                    options: [{ label: { zh: "掌握弱點", jp: "弱点を掴む", kr: "약점 파악" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "帶走記錄",
                    jp: "記録を持ち帰る",
                    kr: "기록을 가져가다"
                },
                action: "node_next",
                rewards: {
                    tags: ["has_item_clue"],
                    varOps: [{ key: 'skill_points', val: 10, op: '+' }]
                },
                nextScene: { 
                    dialogue: [{
                        text: {
                            zh: "現在不是解讀的好時機。你小心翼翼地將這份脆弱的記錄收好，打算之後再找時間仔細研究。",
                            jp: "今は解読している余裕はない。脆い記録を慎重にしまい込み、後で時間をかけてじっくり調べることにした。",
                            kr: "지금은 해독할 때가 아니다. 이 부서지기 쉬운 기록을 조심스럽게 챙겨, 나중에 시간을 내어 자세히 연구하기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "收入行囊", jp: "鞄にしまう", kr: "가방에 넣다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-探索-C：箱庭探索房間（三劇本通用核心玩法）
    DB.templates.push({
        id: 'adv_mid_exp_hub_room',
        type: 'middle',
        reqTags: ['adventure', 'route_explorer'],
        isHub: true,
        onEnter: {
            varOps: [{ key: 'search_count', val: 3, op: 'set' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你踏入了{env_room}。<br><br>{env_pack_visual}<br><br>這裡有幾處值得搜查的地方。<br>帶走有用的東西，越多越好。",
                    jp: "{env_room}に足を踏み入れた。<br><br>{env_pack_visual}<br><br>ここには調べるべき場所がいくつかある。<br>役に立つものは多ければ多いほどいい、持ち帰ろう。",
                    kr: "{env_room}에 발을 들여놓았다.<br><br>{env_pack_visual}<br><br>이곳에는 조사해 볼 만한 곳이 몇 군데 있다.<br>유용한 물건은 많을수록 좋다, 챙겨가자."
                }
            }
        ],
        briefDialogue: [ // 👈 新增：返回 HUB 時的短描述
            {
                text: {
                    zh: "房間裡還有其他角落，你要繼續調查嗎？",
                    jp: "部屋にはまだ別の隅がある。調査を続けるか？",
                    kr: "방 안에는 아직 다른 구석이 있다. 조사를 계속할 것인가?"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "搜查{env_feature}",
                    jp: "{env_feature}を調べる",
                    kr: "{env_feature} 조사"
                },
                action: "node_next",
                condition: { vars: [{ key: 'search_count', val: 1, op: '>=' }] },
                rewards: {
                    varOps: [{ key: 'search_count', val: 1, op: '-' }]
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你在{env_feature}一番翻找，發現了{combo_item_desc}。",
                            jp: "{env_feature}をくまなく探した結果、{combo_item_desc}を見つけた。",
                            kr: "{env_feature}을(를) 샅샅이 뒤진 끝에, {combo_item_desc}을(를) 발견했다."
                        } 
                    }],
                    options: [
                        {
                            label: { zh: "帶走物品", jp: "物品を持ち帰る", kr: "물건 챙기기" },
                            action: "map_return_hub", // 👈 返回 HUB
                            rewards: {
                                tags: ['has_item_clue'],
                                varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                            }
                        },
                        { label: { zh: "先放著，繼續搜查", jp: "一旦置いて他を調べる", kr: "일단 두고 계속 조사" }, action: "map_return_hub" }
                    ]
                }
            },
            {
                label: {
                    zh: "找開闊處反覆走架",
                    jp: "開けた場所で型を反復する",
                    kr: "넓은 곳에서 자세를 반복하다"
                },
                check: { stat: 'AGI', val: 3 },
                action: "node_next",
                condition: {
                    vars: [{ key: 'search_count', val: 1, op: '>=' }],
                    excludeTags: ['trained_here']
                },
                rewards: {
                    tags: ['trained_here'],
                    varOps: [
                        { key: 'search_count',  val: 1,  op: '-' },
                        { key: 'skill_points',  val: 15, op: '+' }
                    ],
                    exp: 15
                },
                onFail: {
                    varOps: [{ key: 'search_count', val: 1, op: '-' }],
                    text: {
                        zh: "你試圖在這個充滿陷阱的房間走動，卻差點扭傷了腳踝，什麼也沒練成。",
                        jp: "罠だらけのこの部屋で動こうとして、危うく足首を捻挫しそうになった。結局何の練習にもならなかった。",
                        kr: "함정이 가득한 이 방에서 움직이려다 하마터면 발목을 삘 뻔했고, 결국 아무 연습도 하지 못했다."
                    }
                },
                nextScene: {
                    dialogue: [{ 
                        text: { 
                            zh: "你利用這個空間，靈活地練習了幾組應對突襲的動作。<br>你的身體逐漸熱開。對付{boss}時，這些靈敏的反應絕對會派上用場。",
                            jp: "この空間を利用して、奇襲に対処する型を機敏にいくつか練習した。<br>体が温まってきた。{boss}と対峙する時、この鋭い反応は絶対に役立つはずだ。",
                            kr: "이 공간을 활용해, 기습에 대처하는 동작들을 민첩하게 몇 세트 연습했다.<br>몸이 서서히 풀리기 시작했다. {boss}와(과) 맞설 때, 이 예민한 반응속도는 절대적으로 유용할 것이다."
                        } 
                    }],
                    options: [{ label: { zh: "提升狀態", jp: "状態を整える", kr: "컨디션 상승" }, action: "map_return_hub" }] // 👈 返回 HUB
                }
            },
            {
                label: {
                    zh: "🚪 繼續前進",
                    jp: "🚪 先へ進む",
                    kr: "🚪 계속 전진"
                },
                action: "advance_chain" // 👈 離開 HUB 推進主線
            }
        ]
    });

 // ============================================================
    // ⚔️ [MIDDLE - 戰士路線] 戰鬥與技能成長
    //    reqTags: ['adventure', 'route_warrior']
    // ============================================================

    // MIDDLE-戰士-A：遭遇小怪，練習戰鬥
    DB.templates.push({
        id: 'adv_mid_war_skirmish',
        type: 'middle',
        reqTags: ['adventure', 'route_warrior'],
        dialogue: [
            {
                text: {
                    zh: "{phrase_danger_appear}<br><br>不是{boss}，只是它的爪牙。<br>但這正是你需要的——實戰。",
                    jp: "{phrase_danger_appear}<br><br>{boss}ではない。ただの手下だ。<br>だが、これこそがあなたに必要なものだ——実戦である。",
                    kr: "{phrase_danger_appear}<br><br>{boss}은(는) 아니다. 그저 졸개일 뿐이다.<br>하지만 이것이야말로 당신에게 필요한 것이다——실전."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "迎上去以戰養戰",
                    jp: "向かっていき戦いながら学ぶ",
                    kr: "맞서 나가며 싸우면서 배우다"
                },
                check: { stat: 'STR', val: 4 },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'skill_points', val: 20, op: '+' }],
                    exp: 20
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: -5, op: '+' }],
                    text: {
                        zh: "你雖然奮力揮舞武器，但對方的力量超乎預期。你被狠狠擊退，受了點皮肉傷。<br>但更重要的是——你現在知道對方的力道了。",
                        jp: "力いっぱい武器を振るったが、相手の力は予想以上だった。激しく弾き飛ばされ、かすり傷を負った。<br>しかし何よりも重要なのは——これで相手の力量が分かったということだ。",
                        kr: "힘껏 무기를 휘둘렀지만, 상대의 힘이 예상보다 강했다. 당신은 거칠게 밀려나며 가벼운 상처를 입었다.<br>하지만 더 중요한 것은——이제 상대의 힘이 어느 정도인지 알게 되었다는 것이다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你毫無畏懼地迎擊，在幾回合的交鋒中，你成功擊退了對方，同時觀察到了{boss}爪牙的弱點。<br>你的戰鬥技巧在實戰中獲得了顯著的成長。",
                            jp: "恐れることなく迎え撃ち、数回の打ち合いの末に見事相手を撃退した。同時に、{boss}の手下の弱点を観察することにも成功した。<br>あなたの戦闘スキルは実戦の中で著しく成長した。",
                            kr: "두려움 없이 맞서 싸우며, 몇 번의 교전 끝에 상대를 성공적으로 격퇴했고, 동시에 {boss} 졸개의 약점을 관찰해 냈다.<br>당신의 전투 기술이 실전 속에서 눈에 띄게 성장했다."
                        }
                    }],
                    options: [{ label: { zh: "戰意高昂", jp: "高まる戦意", kr: "전의 고조" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "持續移動以逸待勞",
                    jp: "動き続けて力を温存する",
                    kr: "계속 움직이며 체력을 아끼다"
                },
                check: { stat: 'AGI', val: 4 },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'skill_points', val: 12, op: '+' }],
                    exp: 12
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: -5, op: '+' }],
                    text: {
                        zh: "你試圖靈活閃避，卻被絆了一下，重重摔在地上。你付出了代價，但也摸清了對方的攻擊模式。",
                        jp: "機敏に避けようとしたが、足をもつれて地面に激しく転倒した。代償は払ったが、相手の攻撃パターンは掴めた。",
                        kr: "민첩하게 피하려 했지만 발이 걸려 바닥에 세게 넘어졌다. 대가를 치렀지만, 상대의 공격 패턴은 파악했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有硬碰硬，而是利用靈活的走位與對方巧妙地周旋。敵人被你耗盡了體力而退卻。<br>你沒有消耗太多能量。速度就是你的武器。",
                            jp: "まともにぶつかり合うことは避け、機敏な足さばきで相手と巧みに立ち回った。敵は体力を消耗し退却していった。<br>エネルギーをあまり消耗しなかった。スピードこそがあなたの武器だ。",
                            kr: "정면충돌을 피하고, 민첩한 움직임으로 상대와 교묘하게 맞섰다. 적은 체력을 다 쓰고 물러났다.<br>에너지를 많이 소모하지 않았다. 속도가 곧 당신의 무기다."
                        }
                    }],
                    options: [{ label: { zh: "保持節奏", jp: "ペースを保つ", kr: "리듬 유지" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "戰略撤退",
                    jp: "戦略的撤退",
                    kr: "전략적 후퇴"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'skill_points', val: 3, op: '+' }] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你評估了局勢，決定不把體力浪費在這些雜兵身上，迅速撤離了戰場。",
                            jp: "状況を判断し、こんな雑魚に体力を消耗するのは無駄だと考え、素早く戦場から撤退した。",
                            kr: "상황을 판단하고, 이런 잡병들에게 체력을 낭비하지 않기로 한 뒤 신속하게 전장을 벗어났다."
                        }
                    }],
                    options: [{ label: { zh: "保存實力", jp: "実力温存", kr: "체력 보존" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-戰士-B：找到傳說武器或強化裝備
    DB.templates.push({
        id: 'adv_mid_war_weapon',
        type: 'middle',
        reqTags: ['adventure', 'route_warrior'],
        excludeTags: ['found_legendary_weapon'],
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>就在{env_feature}裡，有一個{combo_item_desc}。<br><br>根據{start_bonus}的光芒判斷，這不是普通的東西。",
                    jp: "{env_pack_visual}<br><br>まさに{env_feature}の中に、{combo_item_desc}がある。<br><br>{start_bonus}の放つ光からして、これはただの代物ではない。",
                    kr: "{env_pack_visual}<br><br>바로 {env_feature} 안에, {combo_item_desc}이(가) 있다.<br><br>{start_bonus}의 빛으로 보아, 이건 평범한 물건이 아니다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "帶走武器",
                    jp: "武器を持ち去る",
                    kr: "무기를 가져가다"
                },
                action: "node_next",
                rewards: {
                    tags: ["found_legendary_weapon"],
                    varOps: [{ key: 'skill_points', val: 20, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你毫不猶豫地將它拔出帶走。手中沉甸甸的重量感，讓你在接下來的戰鬥中更有底氣。",
                            jp: "躊躇なくそれを抜き取り、持ち去った。手に伝わるずっしりとした重みが、これからの戦いへの自信を与えてくれる。",
                            kr: "망설임 없이 그것을 뽑아 챙겼다. 손에 전해지는 묵직한 무게감이 앞으로의 전투에 더 큰 자신감을 불어넣어 준다."
                        }
                    }],
                    options: [{ label: { zh: "如虎添翼", jp: "鬼に金棒", kr: "호랑이에 날개" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "試試手感並分析",
                    jp: "試し打ちして分析する",
                    kr: "시험 삼아 휘두르고 분석하다"
                },
                check: { stat: 'INT', val: 3 },
                action: "node_next",
                rewards: {
                    tags: ["found_legendary_weapon", "knows_weapon_power"],
                    varOps: [{ key: 'skill_points', val: 30, op: '+' }],
                    exp: 15
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: 10, op: '+' }],
                    text: {
                        zh: "你試著揮舞了幾下，只覺得這把武器十分稱手，但沒能發掘出它隱藏的力量。",
                        jp: "何度か振ってみて、非常に手に馴染む武器だと感じたが、そこに秘められた力を見出すことはできなかった。",
                        kr: "몇 번 휘둘러보고 무기가 손에 아주 잘 맞는다고 느꼈지만, 거기에 숨겨진 힘을 발견하지는 못했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你找了塊堅硬的石頭試試手感，不僅帶走了武器，更深刻了解了這件武器的特殊力量與重心。<br>對付{boss}時，你知道該怎麼發揮它的最大威力。",
                            jp: "硬い石を見つけて試し打ちをし、武器を持ち帰っただけでなく、その特殊な力と重心を深く理解した。<br>{boss}と対峙する時、どうすればこの武器の最大の威力を発揮できるか、あなたには分かっている。",
                            kr: "단단한 돌을 찾아 시험 삼아 휘둘러보고, 무기를 챙겼을 뿐만 아니라 그 무기의 특수한 힘과 무게 중심을 깊이 이해했다.<br>{boss}와(과) 맞설 때, 이 무기의 위력을 어떻게 최대치로 끌어올릴지 당신은 알고 있다."
                        }
                    }],
                    options: [{ label: { zh: "徹底掌握", jp: "完全に掌握する", kr: "완벽하게 마스터" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-戰士-C：遭遇強敵，接近 BOSS 前的最後考驗
    DB.templates.push({
        id: 'adv_mid_war_elite',
        type: 'middle',
        reqTags: ['adventure', 'route_warrior'],
        excludeTags: ['fought_elite'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_encounter}<br><br>這不是一般的敵人。是{boss}的精銳護衛。<br><br>{sentence_tension}",
                    jp: "{sentence_encounter}<br><br>これは普通の敵ではない。{boss}の精鋭護衛だ。<br><br>{sentence_tension}",
                    kr: "{sentence_encounter}<br><br>이건 일반적인 적이 아니다. {boss}의 정예 호위병이다.<br><br>{sentence_tension}"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "深吸一口氣主動出擊",
                    jp: "深呼吸して先手を打つ",
                    kr: "깊게 숨을 들이쉬고 먼저 공격하다"
                },
                check: { stat: 'STR', val: 5 },
                action: "node_next",
                rewards: {
                    tags: ["fought_elite"],
                    varOps: [{ key: 'skill_points', val: 35, op: '+' }],
                    exp: 35
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: -8, op: '+' }],
                    text: {
                        zh: "精銳護衛的力量令人絕望，你被狠狠打退了。<br>但失敗本身就是訓練——你不會在{boss}身上犯同樣的錯。",
                        jp: "精鋭護衛の力は絶望的で、あなたは激しく打ち負かされた。<br>しかし失敗そのものが訓練だ。{boss}を相手に同じ間違いは繰り返さない。",
                        kr: "정예 호위병의 힘은 절망적이었고, 당신은 무참히 패배했다.<br>하지만 실패 그 자체가 훈련이다. {boss}를 상대로는 똑같은 실수를 반복하지 않을 것이다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你以雷霆之勢發起猛攻，在生死一瞬的搏殺中，你終於擊倒了強大的護衛。<br>{boss}已經近在眼前，而經歷了這場死鬥的你，比剛才更強了。",
                            jp: "雷のごとき勢いで猛攻を仕掛け、生死を分ける死闘の末に、ついに強大な護衛を打ち倒した。<br>{boss}はもう目の前だ。そして、この死闘をくぐり抜けたあなたは、さっきよりも遥かに強くなっている。",
                            kr: "우레와 같은 기세로 맹공을 퍼부었고, 생사를 넘나드는 사투 끝에 마침내 강력한 호위병을 쓰러뜨렸다.<br>{boss}은(는) 이미 눈앞에 있고, 이 사투를 겪은 당신은 아까보다 훨씬 더 강해졌다."
                        }
                    }],
                    options: [{ label: { zh: "越戰越勇", jp: "闘志満々", kr: "갈수록 용맹해짐" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "繞到側翼等待破綻",
                    jp: "側面に回り隙を待つ",
                    kr: "측면으로 돌아 빈틈을 기다리다"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next",
                rewards: {
                    tags: ["fought_elite"],
                    varOps: [{ key: 'skill_points', val: 30, op: '+' }],
                    exp: 25
                },
                onFail: {
                    varOps: [{ key: 'skill_points', val: -5, op: '+' }],
                    text: {
                        zh: "你試圖尋找破綻，卻被對方識破意圖，反被逼入死角。你只能狼狽地擋下攻擊並拉開距離。",
                        jp: "隙を探そうとしたが、相手に意図を見透かされ、逆に死角へと追い詰められた。無様に攻撃を防ぎ、距離を取るしかなかった。",
                        kr: "빈틈을 찾으려 했지만 상대에게 의도를 간파당해 오히려 사각지대로 몰렸다. 허둥지둥 공격을 막아내고 거리를 벌릴 수밖에 없었다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沉住氣，像獵豹般在側翼遊走，終於捕捉到了對方的致命破綻，一擊必殺。<br>聰明比單純的力量更節省體力，你保留了充足的精力面對最後的挑戰。",
                            jp: "気を沈め、豹のように側面に回り込み、ついに相手の致命的な隙を捉えて一撃で仕留めた。<br>単なる力押しよりも頭を使う方が体力を温存できる。最後の挑戦に向けて十分な活力を残すことができた。",
                            kr: "침착하게 표범처럼 측면을 맴돌다, 마침내 상대의 치명적인 빈틈을 포착해 일격에 숨통을 끊었다.<br>단순한 힘보다 똑똑한 방식이 체력을 더 아껴준다. 당신은 마지막 도전을 위해 충분한 기력을 보존했다."
                        }
                    }],
                    options: [{ label: { zh: "智取強敵", jp: "知略で勝つ", kr: "지략으로 승리" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "暫時撤退",
                    jp: "一時撤退",
                    kr: "일단 후퇴"
                },
                action: "node_next",
                rewards: {
                    tags: ["fought_elite"],
                    varOps: [{ key: 'skill_points', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "敵人的壓迫感太強，你決定不急於一時，緩步退回了安全區域，重新擬定對策。",
                            jp: "敵のプレッシャーが強すぎる。今は焦る時ではないと判断し、安全な場所までゆっくりと後退して対策を練り直すことにした。",
                            kr: "적의 압박감이 너무 강하다. 조급해하지 않기로 하고, 안전한 구역으로 천천히 물러나 대책을 다시 세우기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "重整旗鼓", jp: "体勢を立て直す", kr: "전열 정비" }, action: "advance_chain" }]
                }
            }
        ]
    });
// ============================================================
    // 🌐 [MIDDLE - 冒險通用節點]
    //    部分節點同時標記 horror / mystery，讓三個劇本共用
    // ============================================================

    // MIDDLE-通用-A：遭遇陷阱（三劇本共用）
    DB.templates.push({
        id: 'adv_mid_any_trap',
        type: 'middle',
        reqTags: ['adventure', 'horror', 'mystery'], // 🌟 三劇本皆可觸發
        dialogue: [
            {
                text: {
                    zh: "{env_pack_visual}<br><br>就在你往前踏出一步的時候——<br><br>{sentence_event_sudden}<br><br>陷阱！有人（或某種東西）事先設置了這個。",
                    jp: "{env_pack_visual}<br><br>一歩前に踏み出したその時——<br><br>{sentence_event_sudden}<br><br>罠だ！誰か（あるいは何か）が事前にこれを仕掛けていたのだ。",
                    kr: "{env_pack_visual}<br><br>앞으로 한 발짝 내딛는 바로 그 순간——<br><br>{sentence_event_sudden}<br><br>함정이다! 누군가(혹은 무언가)가 미리 이것을 설치해 둔 것이다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "腳底一麻，身體先行",
                    jp: "足が痺れる——体が先に動く",
                    kr: "발바닥이 찌릿하며 몸이 먼저 반응하다"
                },
                check: { stat: 'AGI', val: 4 },
                action: "node_next",
                rewards: { exp: 10 },
                onFail: {
                    text: {
                        zh: "你反應慢了一拍，陷阱擦過你的身體，留下一道火辣辣的傷痕。你痛苦地悶哼了一聲。",
                        jp: "反応が遅れた。罠が体をかすめ、焼け付くような傷跡を残した。あなたは苦痛にうめき声を上げた。",
                        kr: "반응이 한 박자 늦었다. 함정이 몸을 스치고 지나가며 화끈거리는 상처를 남겼다. 당신은 고통스러운 신음을 내뱉었다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在千鈞一髮之際，你的身體先於大腦做出了反應！你在觸發的瞬間驚險跳開了。<br>沒有受傷，但心跳還沒停下來。",
                            jp: "危機一髪のところで、体が脳よりも先に反応した！罠が作動した瞬間に間一髪で飛び退いた。<br>怪我はないが、心臓の鼓動はまだ激しく鳴り響いている。",
                            kr: "위기일발의 순간, 당신의 몸이 뇌보다 먼저 반응했다! 함정이 작동하는 순간 아슬아슬하게 뛰어올라 피했다.<br>다치지는 않았지만, 심장 박동은 아직도 진정되지 않고 있다."
                        }
                    }],
                    options: [{ label: { zh: "驚魂未定", jp: "肝を冷やす", kr: "놀란 가슴" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "察覺異樣，轉路繞行",
                    jp: "異変に気づき迂回する",
                    kr: "이상함을 눈치채고 우회하다"
                },
                check: { stat: 'INT', val: 3 },
                action: "node_next",
                rewards: {
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }],
                    exp: 15
                },
                onFail: {
                    text: {
                        zh: "你以為看穿了機關，卻踩到了真正的誘餌。陷阱狠狠擊中了你，讓你痛得彎下了腰。",
                        jp: "仕掛けを見抜いたと思ったが、本当の罠を踏んでしまった。罠が激しく直撃し、痛みのあまりその場にうずくまった。",
                        kr: "장치를 간파했다고 생각했지만 진짜 미끼를 밟고 말았다. 함정이 당신을 강하게 덮쳤고, 고통에 몸을 웅크렸다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你眼明手快地收回了腳步，注意到了地板的不自然反光。你冷靜地繞開了陷阱的核心區域。<br>對方顯然低估了你的觀察力。",
                            jp: "素早く足を引っ込め、床の不自然な反射に気づいた。冷静に罠の中心を避けて迂回した。<br>相手はどうやらあなたの観察眼を甘く見ていたようだ。",
                            kr: "발을 재빨리 거둬들이고, 바닥의 부자연스러운 반사광을 눈치챘다. 침착하게 함정의 핵심 구역을 피해 우회했다.<br>상대는 분명 당신의 관찰력을 과소평가했다."
                        }
                    }],
                    options: [{ label: { zh: "洞察先機", jp: "先を見通す", kr: "선견지명" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "硬著頭皮直接衝",
                    jp: "覚悟を決めて直進する",
                    kr: "각오를 다지고 직진하다"
                },
                action: "node_next",
                rewards: { exp: 5 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你放棄了閃避，雙臂護住要害直接往前猛衝！陷阱在你身後接連觸發，雖然受了點擦傷，但你憑藉著一往無前的氣勢強行闖過了危險區。",
                            jp: "回避を諦め、両腕で急所をかばいながら前へと猛突進した！背後で次々と罠が作動し、かすり傷は負ったものの、猪突猛進の気勢で危険地帯を強行突破した。",
                            kr: "회피를 포기하고, 두 팔로 급소를 가린 채 앞을 향해 맹렬히 돌진했다! 등 뒤에서 함정들이 연달아 작동했고, 찰과상을 입었지만 저돌적인 기세로 위험 구역을 강행 돌파했다."
                        }
                    }],
                    options: [{ label: { zh: "強行突破", jp: "強行突破", kr: "강행 돌파" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-通用-B：神秘商人（三劇本共用）
    DB.templates.push({
        id: 'adv_mid_any_merchant',
        type: 'middle',
        reqTags: ['adventure', 'horror', 'mystery'], // 🌟 三劇本皆可觸發
        excludeTags: ['met_merchant'],
        dialogue: [
            {
                text: {
                    zh: "{sentence_encounter}<br><br>不是敵人。是一個{identity_modifier}的商人，神情{state_modifier}。<br><br>「我在這裡等了很久了，」他說，「等一個需要我的東西的人。」",
                    jp: "{sentence_encounter}<br><br>敵ではない。一人の{identity_modifier}商人が、{state_modifier}様子で立っている。<br><br>「ここでずっと待っていた」彼は言う。「私の品を必要とする者が来るのを」",
                    kr: "{sentence_encounter}<br><br>적은 아니다. 한 {identity_modifier} 상인이 {state_modifier} 표정으로 서 있다.<br><br>「여기서 한참을 기다렸소.」 그가 말한다. 「내 물건을 필요로 하는 사람이 오기를.」"
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "花金幣補給",
                    jp: "金貨で補給する",
                    kr: "금화로 보급하다"
                },
                condition: { vars: [{ key: 'gold', val: 30, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["met_merchant"],
                    varOps: [
                        { key: 'gold',         val: -30, op: '+' },
                        { key: 'skill_points', val: 10,  op: '+' }
                    ]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你遞出金幣，買下了一些珍貴的補給品。隨著能量的恢復，你感覺對接下來的挑戰更有把握了。",
                            jp: "金貨を渡し、貴重な補給品を買い取った。エネルギーが回復し、この先の試練への自信が湧いてきた。",
                            kr: "금화를 건네고 귀중한 보급품을 샀다. 에너지가 회복되면서, 앞으로의 도전에 더 자신감이 생겼다."
                        }
                    }],
                    options: [{ label: { zh: "恢復狀態", jp: "状態回復", kr: "상태 회복" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "詢問情報",
                    jp: "情報を尋ねる",
                    kr: "정보를 묻다"
                },
                action: "node_next",
                rewards: {
                    tags: ["met_merchant"],
                    varOps: [{ key: 'skill_points', val: 12, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你收起金幣，轉而向商人打聽這裡的情報。對方露出讚賞的笑容，告訴了你一個關於這座建築的隱藏秘密。",
                            jp: "金貨はしまって、商人にここの情報を尋ねた。彼は感心したように笑い、この建物に関する隠された秘密を一つ教えてくれた。",
                            kr: "금화는 집어넣고, 상인에게 이곳의 정보에 대해 물었다. 상대는 감탄한 듯한 미소를 지으며, 이 건물에 관한 숨겨진 비밀을 하나 알려주었다."
                        }
                    }],
                    options: [{ label: { zh: "獲得情報", jp: "情報獲得", kr: "정보 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不信任並離開",
                    jp: "信用せず立ち去る",
                    kr: "불신하고 떠나다"
                },
                action: "node_next",
                rewards: { tags: ["met_merchant"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在這種詭異的地方出現商人，本身就夠可疑了。你警惕地後退，拒絕了交易，快步離開了現場。",
                            jp: "こんな不気味な場所に商人がいること自体が怪しすぎる。警戒して後ずさりし、取引を拒否してその場を早足で立ち去った。",
                            kr: "이런 기괴한 곳에 상인이 있다는 것 자체가 충분히 의심스럽다. 경계하며 뒷걸음질 치고, 거래를 거절한 채 빠른 걸음으로 자리를 떴다."
                        }
                    }],
                    options: [{ label: { zh: "保持警惕", jp: "警戒を保つ", kr: "경계 유지" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-通用-C：環境謎題（冒險/恐怖共用）
    DB.templates.push({
        id: 'adv_mid_any_env_puzzle',
        type: 'middle',
        reqTags: ['adventure', 'horror'], // 🌟 冒險與恐怖共用
        excludeTags: ['solved_env_puzzle'],
        dialogue: [
            {
                text: {
                    zh: "通道的另一端，{env_feature}擋住了去路。<br><br>{env_pack_visual}<br><br>這不是隨機的，這是設計過的。<br>有規律，有邏輯——只要你能找到它。",
                    jp: "通路の向こう側で、{env_feature}が行く手を阻んでいる。<br><br>{env_pack_visual}<br><br>これは偶然ではない。意図的に設計されたものだ。<br>規則性があり、論理がある——それを見つけ出しさえすれば。",
                    kr: "통로 반대편, {env_feature}이(가) 길을 막고 있다.<br><br>{env_pack_visual}<br><br>이건 무작위가 아니라 설계된 것이다.<br>규칙이 있고, 논리가 있다——당신이 그것을 찾아낼 수만 있다면."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "慢慢拆解邏輯",
                    jp: "論理をゆっくりほどく",
                    kr: "논리를 차근히 풀다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    tags: ["solved_env_puzzle", "puzzle_solved"],
                    varOps: [
                        { key: 'skill_points', val: 15, op: '+' },
                        { key: 'puzzle_count', val: 1,  op: '+' }
                    ],
                    exp: 20
                },
                onFail: {
                    text: {
                        zh: "這謎題的複雜度遠超預期。你絞盡腦汁卻毫無進展，不僅浪費了大量時間，還讓自己心浮氣躁。",
                        jp: "この謎の複雑さは予想をはるかに超えていた。知恵を絞っても何の進展もなく、多大な時間を浪費した上にひどく苛立ってしまった。",
                        kr: "이 퍼즐의 복잡함은 예상을 훨씬 뛰어넘었다. 머리를 쥐어짜도 아무런 진전이 없었고, 많은 시간을 낭비했을 뿐만 아니라 마음만 조급해졌다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸一口氣，強迫自己坐下來。經過一番精密的推敲與嘗試，你成功解開了它。<br>這種地方的謎題，往往隱藏著更重要的答案。",
                            jp: "深呼吸をして、無理やり自分を座らせた。綿密な推敲と試行錯誤の末、ついにそれを解き明かした。<br>こういう場所の謎には、往々にしてより重要な答えが隠されているものだ。",
                            kr: "심호흡을 하고, 억지로 자리에 앉았다. 치밀한 추론과 시도 끝에, 성공적으로 그것을 풀었다.<br>이런 곳의 퍼즐에는 종종 더 중요한 해답이 숨겨져 있기 마련이다."
                        }
                    }],
                    options: [{ label: { zh: "破解謎題", jp: "謎を解き明かす", kr: "퍼즐 해결" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "找其他方法繞過去",
                    jp: "別の方法で迂回する",
                    kr: "다른 방법으로 우회하다"
                },
                action: "node_next",
                rewards: { varOps: [{ key: 'skill_points', val: 3, op: '+' }] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你決定不把時間浪費在這些複雜的機關上。你沿著邊緣摸索，幸運地找到了一條隱蔽的通風管，雖然狼狽，但成功繞過了障礙。",
                            jp: "複雑な仕掛けに時間を浪費するのはやめた。壁沿いを探り、運良く隠された通風管を見つけた。這いつくばる羽目になったが、無事に障害を迂回できた。",
                            kr: "이 복잡한 장치에 시간을 낭비하지 않기로 했다. 가장자리를 따라 더듬어 운 좋게 숨겨진 환풍구를 찾았고, 꼴은 좀 우스워졌지만 무사히 장애물을 우회했다."
                        }
                    }],
                    options: [{ label: { zh: "繞道而行", jp: "回り道", kr: "우회하기" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // MIDDLE-通用-D：隊友或 NPC 的協助（冒險/偵探共用）
    DB.templates.push({
        id: 'adv_mid_any_npc_help',
        type: 'middle',
        reqTags: ['adventure', 'mystery'], // 🌟 冒險與偵探共用
        excludeTags: ['received_npc_help'],
        dialogue: [
            {
                text: {
                    zh: "你在{env_room}裡遇到了{combo_person_appearance}。<br><br>對方看起來{state_modifier}，但眼神卻透露著知道一些你不知道的事。<br><br>「你是來找{boss}的嗎？」對方壓低聲音問道。",
                    jp: "{env_room}で{combo_person_appearance}に出会った。<br><br>相手は{state_modifier}に見えるが、その目はあなたの知らない何かを知っていると物語っている。<br><br>「君も{boss}を探しに来たのかい？」相手は声を潜めて尋ねた。",
                    kr: "{env_room}에서 {combo_person_appearance}와(과) 마주쳤다。<br><br>상대는 {state_modifier} 보였지만, 그 눈빛은 당신이 모르는 무언가를 알고 있다는 것을 드러내고 있다。<br><br>「당신도 {boss}를 찾으러 온 건가?」 상대가 목소리를 낮추며 물었다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "「對，你知道什麼？」",
                    jp: "「そうだ。何を知っている？」",
                    kr: "「맞아, 당신은 뭘 알지?」"
                },
                action: "node_next",
                rewards: {
                    tags: ["received_npc_help"],
                    varOps: [{ key: 'skill_points', val: 15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你的坦率贏得了對方的信任。他向你指明了一條鮮為人知的暗道，這將為你省下大量的麻煩。",
                            jp: "その率直さが相手の信頼を勝ち取った。彼はあまり知られていない隠し通路を教えてくれた。これでかなりの手間が省けるだろう。",
                            kr: "당신의 솔직함이 상대의 신뢰를 얻었다. 그는 사람들에게 잘 알려지지 않은 비밀 통로를 가리켜 주었고, 덕분에 많은 수고를 덜게 될 것이다."
                        }
                    }],
                    options: [{ label: { zh: "獲得助力", jp: "助力を得る", kr: "조력 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "謹慎回應，先觀察對方",
                    jp: "慎重に答え、まず相手を観察する",
                    kr: "신중하게 답하며 상대를 관찰하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["received_npc_help"],
                    varOps: [{ key: 'skill_points', val: 8, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有立刻承認，而是含糊其辭地反問。對方雖然沒有透露核心秘密，但還是給了你一些有用的忠告。",
                            jp: "すぐには認めず、言葉を濁して逆に問い返した。核心的な秘密こそ明かされなかったものの、相手はいくつか有用な忠告をくれた。",
                            kr: "당장 인정하지 않고, 얼버무리며 되물었다. 상대는 핵심적인 비밀은 털어놓지 않았지만, 그래도 몇 가지 유용한 충고를 해주었다."
                        }
                    }],
                    options: [{ label: { zh: "謹慎行事", jp: "慎重な行動", kr: "신중한 행동" }, action: "advance_chain" }]
                }
            }
        ]
    });


 // ============================================================
    // 🐉 [CLIMAX] 冒險劇本高潮節點 × 3
    //    同樣使用三槽通用框架（逃跑 / 戰鬥 / 知識解法）
    // ============================================================

    // CLIMAX-A：與 BOSS 正面對決（冒險劇本通用）
    DB.templates.push({
        id: 'adv_climax_boss_fight',
        type: 'climax',
        reqTags: ['adventure'],
        dialogue: [
            {
                text: {
                    zh: "終於。<br><br>{boss}就在眼前。<br><br>{sentence_tension}<br><br>你在冒險中積累的一切，在這一刻都有了意義。<br>你只有一次機會——用對的方式。",
                    jp: "ついに。<br><br>{boss}が目の前にいる。<br><br>{sentence_tension}<br><br>冒険の中で積み重ねてきたすべてが、この瞬間のためにある。<br>チャンスは一度きり——正しい方法で挑め。",
                    kr: "마침내.<br><br>{boss}이(가) 눈앞에 있다.<br><br>{sentence_tension}<br><br>당신이 모험에서 쌓아온 모든 것이 이 순간 의미를 갖는다.<br>기회는 단 한 번뿐이다——올바른 방식을 택하라."
                }
            }
        ],
        options: [
            // 槽一：知識解法（需要知道弱點）
            {
                label: {
                    zh: "攻其弱點，致命一擊",
                    jp: "弱点を突き、致命的な一撃を",
                    kr: "약점을 노려 치명타를"
                },
                condition: { tags: ['boss_weakness'] },
                action: "node_next",
                rewards: {
                    tags: ["exploited_weakness"],
                    varOps: [{ key: 'skill_points', val: 10, op: '+' }],
                    exp: 60
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你不慌不忙地避開了{boss}狂暴的攻勢。因為你早就知道它的弱點在哪裡。<br>在它露出破綻的瞬間，你精準地刺入了它的死穴！",
                            jp: "慌てることなく、{boss}の狂暴な攻撃を躱した。相手の弱点がどこにあるか、すでに知っているからだ。<br>隙を見せた瞬間、その死穴に正確な一撃を突き刺した！",
                            kr: "당황하지 않고 {boss}의 광폭한 공세를 피했다. 녀석의 약점이 어디인지 이미 알고 있기 때문이다.<br>녀석이 빈틈을 보인 순간, 당신은 정확하게 급소를 찔렀다!"
                        }
                    }],
                    options: [{ label: { zh: "奠定勝局", jp: "勝負を決める", kr: "승기 잡기" }, action: "advance_chain" }]
                }
            },
            // 槽二：戰鬥（高技能點）
            {
                label: {
                    zh: "用旅途磨練的實力一戰",
                    jp: "旅で鍛えた力で正面勝負",
                    kr: "여정에서 쌓은 실력으로 정면 승부"
                },
                condition: { vars: [{ key: 'skill_points', val: 50, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["fought_boss"],
                    varOps: [{ key: 'skill_points', val: -20, op: '+' }],
                    exp: 45
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你迎頭而上，沒有任何花招，純粹以這段冒險中淬鍊出的實力與{boss}正面衝撞。<br>巨大的衝擊力讓周圍的{env_feature}紛紛碎裂！你扛住了！",
                            jp: "真っ向から挑み、小細工なしに、この冒険で鍛え上げられた力だけで{boss}と正面衝突した。<br>凄まじい衝撃で周囲の{env_feature}が次々と砕け散る！あなたは持ちこたえた！",
                            kr: "정면으로 맞서, 아무런 잔재주 없이 이 모험에서 단련된 순수한 실력만으로 {boss}와(과) 정면충돌했다.<br>거대한 충격에 주변의 {env_feature}이(가) 산산조각 났다! 당신은 버텨냈다!"
                        }
                    }],
                    options: [{ label: { zh: "分出勝負！", jp: "決着をつける！", kr: "승부를 내자!" }, action: "advance_chain" }]
                }
            },
            // 槽三：傳說武器
            {
                label: {
                    zh: "祭出傳說武器",
                    jp: "伝説の武器を解き放つ",
                    kr: "전설의 무기를 꺼내다"
                },
                condition: { tags: ['found_legendary_weapon'] },
                action: "node_next",
                rewards: { tags: ["used_legendary_weapon"], exp: 50 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你拔出了那把古老的武器。它彷彿感應到了宿敵，爆發出刺眼的光芒。<br>{boss}發出了痛苦與恐懼交織的咆哮。這就是終結它的時刻！",
                            jp: "あの古き武器を抜いた。宿敵を感知したかのように、それは眩い光を放った。<br>{boss}は苦痛と恐怖の入り混じった咆哮を上げた。これぞ決着の時だ！",
                            kr: "오래된 무기를 뽑아 들었다. 마치 숙적을 감지한 듯 눈부신 빛을 뿜어냈다.<br>{boss}은(는) 고통과 공포가 뒤섞인 포효를 내질렀다. 이것이 녀석을 끝낼 순간이다!"
                        }
                    }],
                    options: [{ label: { zh: "給予最後一擊！", jp: "止めを刺す！", kr: "마지막 일격을!" }, action: "advance_chain" }]
                }
            },
            // 槽四：逃跑保底
            {
                label: {
                    zh: "這一次不是時候，撤退",
                    jp: "今はまだその時ではない、撤退する",
                    kr: "지금은 때가 아니다, 후퇴하다"
                },
                action: "node_next",
                rewards: { tags: ["fled_boss"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "敵人的威壓太過恐怖。你抓準空隙，轉身就跑。<br>身後的咆哮聲震耳欲聾，但你沒有回頭。活下去，才會有下一次機會。",
                            jp: "敵の威圧感はあまりにも恐ろしかった。隙を突き、背を向けて走り出した。<br>背後から鼓膜を破るような咆哮が聞こえたが、振り返らなかった。生きていれば、また次の機会がある。",
                            kr: "적의 위압감이 너무도 끔찍했다. 빈틈을 타 몸을 돌려 달아났다.<br>등 뒤로 귀청이 터질 듯한 포효가 울렸지만, 뒤돌아보지 않았다. 살아남아야 다음 기회도 있는 법이다."
                        }
                    }],
                    options: [{ label: { zh: "逃出生天", jp: "脱出", kr: "탈출" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-B：最終謎題（探索路線特殊高潮）
    DB.templates.push({
        id: 'adv_climax_final_puzzle',
        type: 'climax',
        reqTags: ['adventure', 'route_explorer'],
        condition: {
            vars: [{ key: 'puzzle_count', val: 2, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "{boss}的真正封印，不是靠武力能打開的。<br><br>整個{env_building}就是一道巨大的謎題。<br>你一路走來解開的每一個謎，都是最後答案的一部分。<br><br>現在——把它們拼在一起。",
                    jp: "{boss}の真の封印は、武力で開けられるものではない。<br><br>{env_building}全体が、一つの巨大な謎なのだ。<br>これまで解き明かしてきた一つひとつの謎が、最後の答えの一部となっている。<br><br>さあ——それらを一つに繋ぎ合わせる時だ。",
                    kr: "{boss}의 진짜 봉인은 무력으로 열 수 있는 것이 아니다.<br><br>{env_building} 전체가 하나의 거대한 퍼즐이다.<br>당신이 여기까지 오며 풀었던 모든 퍼즐이, 마지막 해답의 일부다.<br><br>이제——그것들을 하나로 맞출 시간이다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "串聯線索解開最終封印",
                    jp: "手がかりを繋ぎ最終封印を解く",
                    kr: "단서를 연결해 최후의 봉인을 풀다"
                },
                condition: { vars: [{ key: 'puzzle_count', val: 2, op: '>=' }] },
                action: "node_next",
                rewards: {
                    tags: ["solved_final_puzzle"],
                    exp: 80
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你將沿途收集到的線索在腦海中迅速串聯。古老的機關在你的操作下發出清脆的咬合聲。<br>光芒亮起，那不可一世的{boss}在封印之力的反噬下發出了絕望的哀嚎。",
                            jp: "道中で集めた手がかりを脳内で素早く繋ぎ合わせた。古代の仕掛けがあなたの操作で小気味よい音を立てて噛み合う。<br>光が満ち、傲慢な{boss}は封印の力の反発を受け、絶望的な悲鳴を上げた。",
                            kr: "길을 오며 모은 단서들을 머릿속에서 빠르게 연결했다. 고대의 장치가 당신의 조작에 따라 경쾌하게 맞물리는 소리를 낸다.<br>빛이 번쩍이고, 기고만장하던 {boss}은(는) 봉인의 힘이 역류하며 절망적인 비명을 내질렀다."
                        }
                    }],
                    options: [{ label: { zh: "完美解謎", jp: "完全なる謎解き", kr: "완벽한 풀이" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "線索不足強行突破",
                    jp: "手がかり不足。強引に突破する",
                    kr: "단서 부족. 억지로 돌파하다"
                },
                action: "node_next",
                rewards: {
                    tags: ["forced_final"],
                    varOps: [{ key: 'skill_points', val: -15, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你沒有收集齊全所有碎片，只能憑著直覺與蠻力強行轉動最後的機關。<br>雖然封印打開了，但反衝的力量也重創了你，接下來的戰鬥將會無比艱難。",
                            jp: "すべてのピースを集めきれず、直感と力任せに最後の仕掛けを強引に回した。<br>封印は解けたものの、反動の力があなたに重傷を負わせた。この後の戦いは極めて困難なものになるだろう。",
                            kr: "모든 조각을 다 모으지 못해, 직감과 힘만으로 억지로 마지막 장치를 돌렸다.<br>봉인은 열렸지만 반동의 힘이 당신에게 큰 타격을 주었고, 앞으로의 전투는 몹시 험난해질 것이다."
                        }
                    }],
                    options: [{ label: { zh: "付出代價", jp: "代償を払う", kr: "대가를 치르다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // CLIMAX-C：先發制人的突襲（戰士路線特殊高潮，為你新增）
    DB.templates.push({
        id: 'adv_climax_ambush',
        type: 'climax',
        reqTags: ['adventure', 'route_warrior'],
        condition: {
            tags: ['fought_elite'] // 需要之前擊敗過菁英護衛才能獲得潛入機會
        },
        dialogue: [
            {
                text: {
                    zh: "這是一個絕佳的機會。<br><br>{boss}正在王座上沉睡，並不知道它的護衛已經被你悄無聲息地解決了。<br><br>你的呼吸與心跳都壓到了最低。<br>刺殺，還是一記震撼的重擊？這取決於你對武器的掌握。",
                    jp: "絶好の機会だ。<br><br>{boss}は玉座で眠りについている。護衛があなたによって音もなく始末されたことなど知る由もない。<br><br>呼吸と心音を極限まで押し殺す。<br>暗殺か、それとも強烈な一撃か？それはあなたの武器の練度にかかっている。",
                    kr: "절호의 기회다.<br><br>{boss}은(는) 왕좌에서 잠들어 있고, 자신의 호위병이 당신에게 소리 소문 없이 처리되었다는 사실을 전혀 모른다.<br><br>숨소리와 심장 박동을 극한까지 낮춘다.<br>암살할 것인가, 아니면 묵직한 일격을 날릴 것인가? 이는 당신의 무기 숙련도에 달려있다."
                }
            }
        ],
        options: [
            {
                label: {
                    zh: "發動完美暗殺",
                    jp: "完璧な暗殺を実行する",
                    kr: "완벽한 암살 실행"
                },
                condition: { 
                    tags: ['knows_weapon_power'],
                    vars: [{ key: 'skill_points', val: 40, op: '>=' }]
                },
                action: "node_next",
                rewards: {
                    tags: ["perfect_ambush"],
                    exp: 80
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "因為深刻了解手中武器的特性，你悄無聲息地滑入了{boss}的死角。<br>沒有給對方任何反擊的機會，鋒刃精準地切斷了它的咽喉。戰鬥在開始前就結束了。",
                            jp: "手にした武器の特性を深く理解しているからこそ、音もなく{boss}の死角へと滑り込むことができた。<br>反撃の隙を一切与えず、刃が的確にその喉元を切り裂いた。戦いは始まる前に終わった。",
                            kr: "손에 든 무기의 특성을 깊이 이해하고 있기에, 소리 없이 {boss}의 사각지대로 미끄러져 들어갔다.<br>반격의 기회를 전혀 주지 않고, 칼날이 정확하게 녀석의 목을 갈랐다. 전투는 시작되기도 전에 끝났다."
                        }
                    }],
                    options: [{ label: { zh: "一擊必殺", jp: "一撃必殺", kr: "일격필살" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "蓄力發動重擊",
                    jp: "力を溜めて強撃を放つ",
                    kr: "기를 모아 강타를 날리다"
                },
                action: "node_next",
                rewards: {
                    tags: ["heavy_ambush"],
                    varOps: [{ key: 'skill_points', val: -10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你高高躍起，將所有的力量傾注在這一擊上！<br>{boss}在劇痛中驚醒，雖然這一擊重創了它，但憤怒的巨獸也隨即展開了瘋狂的反撲！",
                            jp: "高く跳躍し、すべての力をこの一撃に注ぎ込んだ！<br>{boss}は激痛とともに目を覚ました。一撃で重傷を負わせたが、怒り狂う巨獣は直後に狂気の反撃を開始した！",
                            kr: "높이 뛰어올라, 이 일격에 모든 힘을 쏟아부었다!<br>{boss}은(는) 극심한 고통에 깨어났다. 비록 이 일격으로 큰 타격을 주긴 했지만, 분노한 거수는 곧바로 광란의 반격을 시작했다!"
                        }
                    }],
                    options: [{ label: { zh: "正面死鬥", jp: "正面からの死闘", kr: "정면 사투" }, action: "advance_chain" }]
                }
            }
        ]
    });


 // ============================================================
    // 🏆 [END] 冒險路線結局節點 × 5
    // ============================================================

    // END-A：完美勝利（弱點攻擊或最終謎題解開）
    DB.templates.push({
        id: 'adv_end_perfect',
        type: 'end',
        reqTags: ['adventure'],
        condition: {
            tags: ['exploited_weakness'] // 👈 修正：對齊 CLIMAX 中設定的標籤
        },
        dialogue: [
            {
                text: {
                    zh: "{boss}倒下了。<br><br>不是靠蠻力，而是靠你一路積累的知識和準備。<br><br>{env_building}的詛咒（或守衛）隨著它的倒下煙消雲散。<br>————<br>【完美勝利】<br>技能值：{skill_points}",
                    jp: "{boss}は倒れた。<br><br>力任せにではない。これまで積み重ねてきた知識と準備のおかげだ。<br><br>{env_building}の呪い（あるいは守り）は、その死と共に霧散した。<br>————<br>【完全勝利】<br>スキルポイント：{skill_points}",
                    kr: "{boss}이(가) 쓰러졌다.<br><br>무식한 힘이 아니라, 당신이 여정 내내 쌓아온 지식과 준비 덕분이다.<br><br>{env_building}의 저주(혹은 파수꾼)는 녀석이 쓰러짐과 동시에 연기처럼 사라졌다.<br>————<br>【완벽한 승리】<br>스킬 포인트: {skill_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 120, gold: 80 } }]
    });

    // END-B：謎題通關（解謎路線，解開最終封印）
    DB.templates.push({
        id: 'adv_end_puzzle_clear',
        type: 'end',
        reqTags: ['adventure'],
        condition: { tags: ['solved_final_puzzle'] },
        dialogue: [
            {
                text: {
                    zh: "封印解開的瞬間，{boss}發出了一聲長嘯。<br><br>然後——沉默。<br><br>它不是被消滅，而是被釋放了。<br>古代的束縛解除了，這個地方也終於可以安息。<br>————<br>【謎題通關】<br>解謎次數：{puzzle_count}",
                    jp: "封印が解かれた瞬間、{boss}は長く咆哮した。<br><br>そして——沈黙。<br><br>消滅したのではない、解放されたのだ。<br>古代の呪縛は解かれ、この場所もついに安らぎを得た。<br>————<br>【謎解きクリア】<br>謎解き回数：{puzzle_count}",
                    kr: "봉인이 풀리는 순간, {boss}은(는) 긴 포효를 내질렀다.<br><br>그리고——침묵。<br><br>소멸한 것이 아니라 해방된 것이다.<br>고대의 속박이 풀렸고, 이곳도 마침내 안식을 찾을 수 있게 되었다.<br>————<br>【퍼즐 클리어】<br>퍼즐 해결 횟수: {puzzle_count}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 100, gold: 60 } }]
    });

    // END-C：硬打勝利（靠技能積累強行打過）
    DB.templates.push({
        id: 'adv_end_brute_win',
        type: 'end',
        reqTags: ['adventure'],
        condition: {
            tags: ['fought_boss'],
            vars: [{ key: 'skill_points', val: 30, op: '>=' }]
        },
        dialogue: [
            {
                text: {
                    zh: "你沒有弱點情報，沒有傳說武器。<br>你只有一路積累下來的實力。<br><br>那就夠了。<br><br>{boss}最終敗在了你的千錘百鍊之下。<br>————<br>【實力碾壓】<br>技能值：{skill_points}",
                    jp: "弱点の情報もない、伝説の武器もない。<br>あなたにあるのは、ここまで積み上げてきた己の実力だけだ。<br><br>それで十分だった。<br><br>{boss}はついに、あなたの鍛え抜かれた力に敗れ去った。<br>————<br>【実力による蹂躙】<br>スキルポイント：{skill_points}",
                    kr: "당신에겐 약점 정보도, 전설의 무기도 없었다.<br>오직 지금껏 쌓아온 순수한 실력뿐이었다.<br><br>그걸로 충분했다.<br><br>{boss}은(는) 결국 당신의 피나는 단련 앞에 무릎을 꿇었다.<br>————<br>【실력 압살】<br>스킬 포인트: {skill_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 80, gold: 40 } }]
    });

    // END-D：撤退，留待下次（逃跑選項）
    DB.templates.push({
        id: 'adv_end_retreat',
        type: 'end',
        reqTags: ['adventure'],
        condition: { tags: ['fled_boss'] },
        dialogue: [
            {
                text: {
                    zh: "你撤退了。<br><br>{boss}沒有追出來——也許它知道，你只是還沒準備好。<br><br>下一次，你會帶著更完整的準備回來。<br>————<br>【撤退，留待下次】<br>技能值：{skill_points}",
                    jp: "あなたは撤退した。<br><br>{boss}は追ってこなかった——もしかすると、あなたがまだ準備不足なだけだと分かっているのかもしれない。<br><br>次は、より万全な準備を整えて戻ってくるだろう。<br>————<br>【撤退、次回へ持ち越し】<br>スキルポイント：{skill_points}",
                    kr: "당신은 후퇴했다.<br><br>{boss}은(는) 쫓아오지 않았다——어쩌면, 당신이 아직 준비되지 않았다는 걸 녀석도 아는 것일지 모른다.<br><br>다음에는 더욱 완벽한 준비를 갖추고 돌아올 것이다.<br>————<br>【후퇴, 다음을 기약하며】<br>스킬 포인트: {skill_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 30, gold: 10 } }]
    });

    // END-E：通用結局（什麼條件都不符合時的保底）
    DB.templates.push({
        id: 'adv_end_generic',
        type: 'end',
        reqTags: ['adventure'],
        // 沒有 condition → 作為 fallback 使用
        dialogue: [
            {
                text: {
                    zh: "冒險結束了。<br><br>你不確定自己是贏了還是輸了。<br>但你在這裡學到的東西，被你帶走了。<br>————<br>【平凡歸來】<br>技能值：{skill_points}",
                    jp: "冒険は終わった。<br><br>勝ったのか負けたのか、自分でもよく分からない。<br>しかしここで学んだものは、確実に持ち帰ることができた。<br>————<br>【平凡な生還】<br>スキルポイント：{skill_points}",
                    kr: "모험이 끝났다.<br><br>이긴 건지 진 건지 당신 스스로도 확신할 수 없다.<br>하지만 이곳에서 배운 것만큼은 확실히 챙겨 간다.<br>————<br>【평범한 귀환】<br>스킬 포인트: {skill_points}"
                }
            }
        ],
        options: [{ label: { zh: "結束冒險", jp: "冒険を終える", kr: "모험 종료" }, action: "finish_chain", rewards: { exp: 40 } }]
    });

    console.log("✅ story_adventure.js V1.0 已載入（3 開場 × 11 中段 × 2 高潮 × 5 結局）");
})();
