/* js/data_piece.js (V8.1 極簡動態版 - 9 個母模板 + 自動生成) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) return;

    // ==========================================
    // 🌟 動態母模板生成器（核心）
    // ==========================================
    function createFiller(id, config) {
        return Object.assign({
            type: 'univ_filler',
            id: id,
            dialogue: [{ text: { zh: "{phrase_explore_start} {env_pack_sensory}" } }],
            options: [
                { label: "繼續前進", action: "advance_chain" },
                { 
                    label: {
                        zh: "仔細調查",
                        jp: "じっくり調べる",
                        kr: "자세히 조사하다"
                    },
                    check: { stat: 'INT', val: 5 }, 
                    action: "advance_chain", 
                    rewards: { exp: 15, gold: 5 }
                }
            ]
        }, config || {});
    }
	// ── 工廠函數 1：NPC 遭遇 ──────────────────────────────────
    DB.createEncounterNode = function(theme, npcKey, custom = {}) {
        return {
            id: `encounter_${theme}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            type: 'middle',
            reqTags: [theme],
            dialogue: [{ text: { zh: custom.text || `{sentence_encounter}<br><br>{${npcKey}}{state_modifier}。` } }],
            options: [
                { label: custom.talkLabel || "上前搭話", action: "advance_chain", rewards: { varOps: [{ key: 'trust', val: 5, op: '+' }] } },
                { label: "保持距離，繼續觀察", action: "advance_chain", rewards: { tags: ['cautious'] } }
            ]
        };
    };

    // ── 工廠函數 2：高壓危機節點 ──────────────────────────────
    DB.createCrisisNode = function(theme, custom = {}) {
        return {
            id: `crisis_${theme}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            type: 'middle',
            reqTags: [theme, 'risk_high'],
            dialogue: [{ text: { zh: custom.text || "{phrase_danger_warn}<br>{sentence_tension}" } }],
            options: [
                { 
                    label: custom.fightLabel || "正面應對（檢定）", 
                    check: { stat: custom.stat || 'STR', val: custom.checkVal || 8 }, 
                    action: "advance_chain", 
                    rewards: { exp: 25 }, 
                    failNextTags: ['risk_high'] 
                },
                { label: custom.fleeLabel || "先撤退！", action: "advance_chain", rewards: { energy: -5 } }
            ]
        };
    };

    // ── 工廠函數 3：通用結局生成 ──────────────────────────────
    DB.createEndNode = function(theme, id, conditionTags, conditionVars, dialogueText, rewardConfig = {}) {
        const node = {
            id: id,
            type: 'end',
            reqTags: [theme],
            dialogue: [{ text: { zh: dialogueText } }],
            options: [{ label: "結束冒險", action: "finish_chain", rewards: rewardConfig }]
        };
        if (conditionTags || conditionVars) {
            node.condition = {};
            if (conditionTags && conditionTags.length > 0) node.condition.tags = conditionTags;
            if (conditionVars && conditionVars.length > 0) node.condition.vars = conditionVars;
        }
        return node;
    };
    DB.templates = DB.templates || [];

    DB.templates.push(
        // A. 探索與發現（純環境）
        createFiller('uni_env_normal', {
            onEnter: { varOps: [{ key: 'energy', val: 1, op: '-' }] },
            dialogue: [{ text: { zh: "{phrase_explore_start} {env_pack_visual}" } }]
        }),
        createFiller('uni_item_discovery', {
            dialogue: [{ text: { zh: "{phrase_find_action} 竟然是{combo_item_desc}" } }],
            options: [
                { label: "收進背包", action: "advance_chain", rewards: { tags: ['{combo_item_simple}'], gold: 10 } },
                { label: "不要亂碰", action: "advance_chain", rewards: { energy: 5 } }
            ]
        }),

        // B. 異象與高壓（心理恐懼）
        createFiller('uni_env_danger', {
            onEnter: { varOps: [{ key: 'energy', val: 2, op: '-' }] },
            dialogue: [{ text: { zh: "{phrase_danger_warn} {sentence_tension}" } }]
        }),
        createFiller('gen_event_stalker_sense', {
            dialogue: [{ text: { zh: "{env_pack_sensory} 有什麼東西正在靠近..." } }]
        }),

        // C. 遭遇與衝突（戰鬥）
        createFiller('rand_combat_ambush', {
            onEnter: { varOps: [{ key: 'energy', val: 3, op: '-' }] },
            dialogue: [{ text: { zh: "{phrase_danger_appear} {phrase_combat_start}" } }],
            options: [
                { label: "正面迎擊！(STR檢定)", check: { stat: 'STR', val: 5 }, action: "advance_chain", rewards: { exp: 30 } }
            ]
        }),

        // D. 休憩與整理
        createFiller('uni_rest_moment', {
            dialogue: [{ text: { zh: "這裡暫時安全，你靠在{env_feature}旁休息片刻..." } }],
            options: [{ label: "恢復精力", action: "advance_chain", rewards: { energy: 15 } }]
        }),

        // E. 社交與邂逅
        createFiller('gen_encounter_merchant', {
            dialogue: [{ text: { zh: "{combo_person_appearance} 熱情地向你兜售補給品。" } }],
            options: [
                { label: "購買補給 (金幣-30)", condition: { vars: [{ key: 'gold', val: 30, op: '>=' }] }, action: "advance_chain", rewards: { gold: -30, energy: 30 } }
            ]
        }),

        // 🌟 額外高壓事件（risk_high 專用）
        createFiller('rand_tension_event', {
            reqTags: ['risk_high'],
            dialogue: [{ text: { zh: "{phrase_danger_warn} {sentence_tension}" } }]
        }),

        // 🌟 萬用學習/解謎事件（未來可直接擴充螺旋學習）
        createFiller('uni_quiz_moment', {
            dialogue: [{ text: { zh: "你發現了一張寫著外語的紙條：{spiral_word}。這是什麼意思？" } }],
            options: [{ label: "嘗試翻譯", action: "answer_quiz", wordId: "{spiral_word_id}" }]
        }),

    );

// ════════════════════════════════════════════════════════════════
    // 🛏️ 類型一：喘息與休憩（純恢復，無條件銜接）
    //    精力恢復 / 心理緩衝 / 為下一段蓄力
    // ════════════════════════════════════════════════════════════════

    // ── U-R01：短暫藏身 ─────────────────────────────────────────
    DB.templates.push({
        id: 'univ_rest_hideout',
        type: 'middle',
        reqTags: [],         // 無主題限制
        excludeTags: ['has_rested_recently'],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{phrase_explore_start}<br><br>{rest_activity}<br><br>你找到了{rest_location}，暫時躲了進去。<br>{memory_flashback}",
                jp: "{phrase_explore_start}<br><br>{rest_activity}<br><br>{rest_location}を見つけ、一時的に身を隠した。<br>{memory_flashback}",
                kr: "{phrase_explore_start}<br><br>{rest_activity}<br><br>{rest_location}을(를) 찾아 잠시 몸을 숨겼다.<br>{memory_flashback}"
            }
        }],
        options: [
            {
                label: {
                    zh: "充分休息，回復精力",
                    jp: "十分休んで活力を回復する",
                    kr: "충분히 쉬며 에너지를 회복하다"
                },
                action: "node_next",
                rewards: {
                    energy: 20,
                    tags: ["has_rested_recently"],
                    varOps: [{ key: 'time_left', val: 1, op: '-' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你放下戒備，在這裡獲得了難得的深度休息。雖然消耗了一點時間，但你的體力得到了極大的補充，為接下來的旅程做好了準備。",
                            jp: "警戒を解き、ここで貴重な深い休息を得た。少し時間を消費したが、体力は大きく回復し、これからの旅への準備が整った。",
                            kr: "경계를 풀고, 이곳에서 귀중한 깊은 휴식을 취했다. 시간은 조금 소모했지만, 체력을 크게 보충하여 앞으로의 여정을 위한 준비를 마쳤다."
                        }
                    }],
                    options: [{ label: { zh: "重振旗鼓", jp: "気力を取り戻す", kr: "기운을 차리다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "淺眠，保持警覺",
                    jp: "浅く眠り警戒を保つ",
                    kr: "얕게 자며 경계를 유지하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    energy: 12,
                    exp: 10,
                    tags: ["has_rested_recently", "cautious"]
                },
                onFail: {
                    text: {
                        zh: "你想保持警覺，卻因為過度緊繃而無法入睡。你不僅沒有恢復精力，反而弄得自己神經衰弱。",
                        jp: "警戒を保とうとしたが、過度な緊張で眠りにつけなかった。活力を回復するどころか、神経をすり減らしてしまった。",
                        kr: "경계를 유지하려 했지만, 지나친 긴장 탓에 잠들지 못했다. 에너지를 회복하기는커녕 신경만 쇠약해졌다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在淺眠中，你的感官仍維持著一定的警覺。休息雖然不算充分，但你沒有漏掉周圍的任何動靜，確保了自身的絕對安全。",
                            jp: "浅い眠りの中、あなたの五感は一定の警戒を保ち続けた。休息は十分とは言えないが、周囲のいかなる物音も逃さず、絶対的な安全を確保した。",
                            kr: "얕은 잠 속에서도 당신의 감각은 일정한 경계를 유지했다. 휴식이 충분하진 않았지만, 주변의 어떤 기척도 놓치지 않고 절대적인 안전을 확보했다."
                        }
                    }],
                    options: [{ label: { zh: "繼續行動", jp: "行動再開", kr: "계속 행동하다" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "沒空休息，繼續前進",
                    jp: "休む暇はない、先へ進む",
                    kr: "쉴 틈이 없다, 계속 전진하다"
                },
                action: "node_next",
                rewards: { exp: 5 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深知停下腳步可能帶來的風險。你咬緊牙關，強忍著疲憊，推開門繼續踏上了未知的旅程。",
                            jp: "立ち止まることのリスクをよく理解している。歯を食いしばり、疲労に耐えながら、扉を開けて再び未知の旅へと足を踏み出した。",
                            kr: "멈춰 섰을 때의 위험성을 잘 알고 있다. 이를 악물고 피로를 참아내며, 문을 열고 다시 미지의 여정에 올랐다."
                        }
                    }],
                    options: [{ label: { zh: "堅定前行", jp: "足を進める", kr: "발걸음을 옮기다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-R02：意外的平靜時刻 ───────────────────────────────────
    DB.templates.push({
        id: 'univ_rest_calm_moment',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{env_pack_visual}<br><br>{rest_activity}<br><br>這裡出奇地安靜。<br>{memory_flashback}",
                jp: "{env_pack_visual}<br><br>{rest_activity}<br><br>ここは不気味なほど静かだ。<br>{memory_flashback}",
                kr: "{env_pack_visual}<br><br>{rest_activity}<br><br>이곳은 기묘할 정도로 조용하다.<br>{memory_flashback}"
            }
        }],
        options: [
            {
                label: {
                    zh: "趁機恢復狀態",
                    jp: "この隙に状態を回復する",
                    kr: "이 틈에 상태를 회복하다"
                },
                action: "node_next",
                rewards: { energy: 15, exp: 5 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你閉上眼睛，享受這片刻的寧靜。心跳逐漸平穩，體力也在安靜的氛圍中得到了恢復。",
                            jp: "目を閉じ、この束の間の静寂を楽しんだ。心拍は次第に落ち着き、静かな雰囲気の中で体力も回復した。",
                            kr: "눈을 감고 이 짧은 평온을 즐긴다. 심박수가 점차 안정되고, 조용한 분위기 속에서 체력도 회복되었다."
                        }
                    }],
                    options: [{ label: { zh: "準備出發", jp: "出発の準備", kr: "출발 준비" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "仔細環顧，也許有收穫",
                    jp: "じっくり見回す。何かあるかも",
                    kr: "자세히 둘러보다. 뭔가 있을지도"
                },
                check: { stat: 'INT', val: 3 },
                action: "node_next",
                rewards: {
                    energy: 8,
                    gold: 15,
                    exp: 12,
                    tags: ["observed"]
                },
                onFail: {
                    text: {
                        zh: "你四處翻找，卻什麼也沒找到，反而打破了這份寧靜，白白浪費了休息的好時機。",
                        jp: "あちこち探し回ったが何も見つからず、かえってこの静寂を壊し、貴重な休息の機会を無駄にしてしまった。",
                        kr: "이곳저곳 뒤져보았지만 아무것도 찾지 못했고, 오히려 이 평온함만 깨뜨리며 좋은 휴식 기회를 날려버렸다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "平靜讓你得以仔細觀察四周的細節。在不起眼的角落裡，你發現了{combo_item_simple}——不知是誰留下的，但現在它歸你了。",
                            jp: "静寂のおかげで周囲の細部をじっくり観察することができた。目立たない隅で、{combo_item_simple}を見つけた——誰が残したものかは分からないが、今からこれはあなたのものだ。",
                            kr: "평온함 덕분에 주변의 세부 사항을 자세히 관찰할 수 있었다. 눈에 띄지 않는 구석에서 {combo_item_simple}을(를) 발견했다——누가 남긴 건진 모르지만, 이제 당신 것이다."
                        }
                    }],
                    options: [{ label: { zh: "意外收穫", jp: "思いがけない収穫", kr: "뜻밖의 수확" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ════════════════════════════════════════════════════════════════
    // 🎒 類型二：補給與道具發現（隨機物品 + 關鍵道具）
    // ════════════════════════════════════════════════════════════════

    // ── U-S01：殘留補給品 ───────────────────────────────────────
    DB.templates.push({
        id: 'univ_supply_remnant',
        type: 'middle',
        reqTags: [],
        excludeTags: ['looted_supply'],
        weight: 1,
        dialogue: [{
            text: {
                zh: "在{supply_source}，你翻到了一些殘留的補給。<br><br>{supply_flavor}",
                jp: "{supply_source}で、残された補給品をいくつか見つけた。<br><br>{supply_flavor}",
                kr: "{supply_source}에서 남겨진 보급품을 몇 개 찾아냈다.<br><br>{supply_flavor}"
            }
        }],
        options: [
            {
                label: {
                    zh: "全部收下，先恢復精力",
                    jp: "全て受け取り、活力を回復する",
                    kr: "모두 챙겨 에너지를 회복하다"
                },
                action: "node_next",
                rewards: {
                    energy: 25,
                    gold: 5,
                    tags: ["looted_supply"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在這個物資匱乏的環境中，活下去才是最重要的。你將所有能用的補給品一掃而空，感覺狀態好多了。",
                            jp: "物資が乏しいこの環境では、生き延びることが最優先だ。使える補給品を根こそぎ回収し、状態がずっと良くなったのを感じた。",
                            kr: "물자가 부족한 이 환경에서는 살아남는 것이 가장 중요하다. 쓸 만한 보급품을 싹쓸이하자 상태가 훨씬 좋아진 것이 느껴진다."
                        }
                    }],
                    options: [{ label: { zh: "滿載而歸", jp: "実入りが多い", kr: "가득 챙기기" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "只取需要的，留給後人",
                    jp: "必要な分だけ取り、後の人に残す",
                    kr: "필요한 것만 챙기고 후인을 위해 남기다"
                },
                action: "node_next",
                rewards: {
                    energy: 12,
                    exp: 15,
                    tags: ["looted_supply"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你克制了貪婪，只取走了一部分。也許這個決定之後會有意義，也許不會——但你不後悔保持了一絲底線。",
                            jp: "強欲を抑え、一部だけを持ち去った。この決断が後で意味を持つかもしれないし、持たないかもしれない——しかし、一線を守ったことに後悔はない。",
                            kr: "탐욕을 억누르고 일부만 챙겼다. 이 결정이 나중에 의미가 있을 수도, 없을 수도 있지만——최소한의 도리를 지킨 것을 후회하지 않는다."
                        }
                    }],
                    options: [{ label: { zh: "堅守原則", jp: "一線を守る", kr: "원칙 고수" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不確定安不安全，不碰",
                    jp: "安全か分からない、触れない",
                    kr: "안전이 불확실해. 건드리지 않다"
                },
                action: "node_next",
                rewards: { exp: 8, tags: ["cautious"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在這種地方，看似免費的補給往往標好了致命的價格。你謹慎地繞過了這堆物資，空手離開了。",
                            jp: "こういう場所では、無料に見える補給品には往々にして致命的な代償が伴う。あなたは慎重に物資を避け、手ぶらでその場を後にした。",
                            kr: "이런 곳에서 공짜로 보이는 보급품에는 흔히 치명적인 대가가 따르기 마련이다. 당신은 신중하게 물자들을 피해 빈손으로 떠났다."
                        }
                    }],
                    options: [{ label: { zh: "謹慎行事", jp: "慎重な行動", kr: "신중한 행동" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-S02：隱密空間——關鍵道具或隨機道具 ────────────────────
    DB.templates.push({
        id: 'univ_supply_hidden_cache',
        type: 'middle',
        reqTags: [],
        excludeTags: ['found_hidden_cache'],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{hidden_space_desc}<br><br>你猶豫片刻——這種地方藏著的東西，有時是寶貝，有時是陷阱。",
                jp: "{hidden_space_desc}<br><br>少し躊躇した——こういう場所に隠されている物は、宝の時もあれば、罠の時もある。",
                kr: "{hidden_space_desc}<br><br>당신은 잠시 망설였다——이런 곳에 숨겨진 물건은 보물일 때도 있고, 함정일 때도 있다."
            }
        }],
        options: [
            {
                label: {
                    zh: "直接打開",
                    jp: "そのまま開ける",
                    kr: "그냥 열다"
                },
                action: "node_next",
                rewards: {
                    gold: 30,
                    energy: 10,
                    tags: ["found_hidden_cache", "item_found"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "裡面是{combo_item_desc}。<br>你把它收好。這東西在這個隱密的地方出現，絕對不是偶然。",
                            jp: "中身は{combo_item_desc}だった。<br>それをしっかりしまい込んだ。これがこんな隠し場所に置かれているのは、決して偶然ではない。",
                            kr: "안에는 {combo_item_desc}이(가) 있었다.<br>당신은 그것을 잘 챙겼다. 이것이 이런 은밀한 곳에 있는 것은 절대 우연이 아니다."
                        }
                    }],
                    options: [{ label: { zh: "果斷拾取", jp: "果断に拾う", kr: "과감한 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "先確認周圍安全",
                    jp: "まず周囲の安全を確認する",
                    kr: "먼저 주변 안전을 확인하다"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next",
                rewards: {
                    gold: 30,
                    energy: 15,
                    exp: 20,
                    tags: ["found_hidden_cache", "item_found"]
                },
                onFail: {
                    text: {
                        zh: "你檢查了半天也沒看出名堂，反而因為過度緊張消耗了不少精力。最終你還是硬著頭皮打開了它。",
                        jp: "いくら調べても何も分からず、過度の緊張でかえって体力を消耗してしまった。結局、覚悟を決めて開けるしかなかった。",
                        kr: "한참을 확인했지만 아무것도 알아내지 못했고, 오히려 과도한 긴장 탓에 기력만 낭비했다. 결국 눈딱 감고 열어볼 수밖에 없었다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你冷靜地排除了潛在的陷阱機關，才謹慎地將它打開。<br>裡面是{combo_item_desc}。謹慎讓你獲得了更多——精力和物品都完整到手。",
                            jp: "潜在的な罠を冷静に排除してから、慎重に開けた。<br>中身は{combo_item_desc}だった。その慎重さのおかげで、活力もアイテムも無傷で手に入れることができた。",
                            kr: "침착하게 잠재적인 함정 장치를 제거한 후, 조심스럽게 그것을 열었다.<br>안에는 {combo_item_desc}이(가) 있었다. 신중함 덕분에 기력과 물건 모두 온전히 얻을 수 있었다."
                        }
                    }],
                    options: [{ label: { zh: "安全獲取", jp: "安全に確保", kr: "안전한 확보" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "先搜查周圍有沒有陷阱",
                    jp: "周囲に罠がないか調べる",
                    kr: "주변에 함정이 없는지 조사하다"
                },
                action: "node_next",
                rewards: {
                    exp: 10,
                    tags: ["found_hidden_cache", "cautious"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你花了不少時間仔細搜查四周的牆壁與地板。最後確認安全，但當你開啟隱蔽處時，裡面已經空了——有人比你早到過。",
                            jp: "かなりの時間をかけて、周囲の壁や床を綿密に調べた。安全を確認して隠し場所を開けたが、中は空っぽだった——誰かが先にここへ来ていたのだ。",
                            kr: "주변의 벽과 바닥을 꼼꼼히 조사하느라 꽤 많은 시간을 썼다. 마침내 안전을 확인했지만, 은닉처를 열었을 때 안은 이미 텅 비어 있었다——누군가 당신보다 먼저 왔다 간 것이다."
                        }
                    }],
                    options: [{ label: { zh: "空手而歸", jp: "手ぶらで戻る", kr: "빈손으로 돌아가다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-S03：劇本關鍵道具（chain_item）──────────────────────
    // chain_item 由劇本 skeleton initChain 時寫入 memory['chain_item']
    // 在 _resolveDynamicText 中以 {chain_item} 取用
    DB.templates.push({
        id: 'univ_supply_chain_item',
        type: 'middle',
        reqTags: [],
        excludeTags: ['received_chain_item'],
        // 只在劇本確實產生了關鍵道具時才觸發
        condition: { vars: [{ key: 'g_has_chain_item_hint', val: 1, op: '>=' }] },
        weight: 2,           // 較高權重，有條件滿足就優先出現
        dialogue: [{
            text: {
                zh: "你在{supply_source}發現了某個東西。<br><br>仔細一看——這正是你一直在找的：<strong>{chain_item}</strong>。<br><br>它怎麼會在這裡？",
                jp: "{supply_source}で何かを発見した。<br><br>よく見ると——それはずっと探していたものだった：<strong>{chain_item}</strong>。<br><br>なぜこんなところに？",
                kr: "{supply_source}에서 무언가를 발견했다.<br><br>자세히 보니——당신이 계속 찾고 있던 바로 그것이다: <strong>{chain_item}</strong>。<br><br>이게 왜 여기에 있지?"
            }
        }],
        options: [
            {
                label: {
                    zh: "收下，這正是我需要的",
                    jp: "手に入れる。これが必要だった",
                    kr: "챙긴다. 이게 바로 내게 필요했어"
                },
                action: "node_next",
                rewards: {
                    tags: ["received_chain_item", "item_found", "has_key_item"],
                    varOps: [
                        { key: 'g_has_chain_item_hint', val: 0, op: '=' },
                        { key: 'credibility', val: 10, op: '+' }
                    ],
                    exp: 20
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你迅速將<strong>{chain_item}</strong>收進懷裡。這東西的出現太過及時，它將徹底改變你接下來面對危機時的選擇空間。",
                            jp: "あなたは素早く<strong>{chain_item}</strong>を懐にしまった。このタイミングでの出現はあまりにも出来過ぎているが、これで今後の危機に対する選択肢が劇的に変わるはずだ。",
                            kr: "당신은 재빨리 <strong>{chain_item}</strong>을(를) 품속에 챙겼다. 이것의 등장은 너무나도 시기적절하며, 앞으로 위기에 맞설 때 당신의 선택지를 완전히 바꿔놓을 것이다."
                        }
                    }],
                    options: [{ label: { zh: "取得關鍵道具", jp: "キーアイテム獲得", kr: "핵심 아이템 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "這是陷阱，先觀察",
                    jp: "罠だ。まず観察する",
                    kr: "함정이야, 먼저 관찰하자"
                },
                check: { stat: 'INT', val: 6 },
                action: "node_next",
                rewards: {
                    tags: ["received_chain_item", "item_found", "has_key_item", "cautious"],
                    exp: 30,
                    varOps: [{ key: 'g_has_chain_item_hint', val: 0, op: '=' }]
                },
                onFail: {
                    text: {
                        zh: "你疑神疑鬼地觀察了半天，什麼異狀也沒發現。你浪費了太多時間，最後只能匆匆將物品拿走。",
                        jp: "疑心暗鬼になって長時間観察したが、何の異変も見つからなかった。時間を浪費し、結局は慌てて品物を持ち去るしかなかった。",
                        kr: "의심에 사로잡혀 한참을 관찰했지만 아무 이상도 발견하지 못했다. 시간만 허비한 채 결국 서둘러 물건을 챙겨 떠났다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你屏住呼吸等了一會兒，確認黑暗中沒有人在監視，才快速取走<strong>{chain_item}</strong>。<br>謹慎是對的——在這個世界裡，沒有什麼東西是單純的偶然。",
                            jp: "息を潜めてしばらく待ち、暗闇の中に監視者がいないことを確認してから、素早く<strong>{chain_item}</strong>を回収した。<br>慎重になって正解だ——この世界に、純粋な偶然など存在しない。",
                            kr: "숨을 죽이고 잠시 기다려, 어둠 속에 감시하는 자가 없는지 확인한 후에야 빠르게 <strong>{chain_item}</strong>을(를) 챙겼다.<br>신중하길 잘했다——이 세계에 순수한 우연이란 건 존재하지 않으니까."
                        }
                    }],
                    options: [{ label: { zh: "謹慎獲取", jp: "慎重に確保", kr: "신중한 획득" }, action: "advance_chain" }]
                }
            }
        ]
    });
// ════════════════════════════════════════════════════════════════
    // 🤝 類型三：NPC 短暫交會（給予道具 / 情報 / 精力）
    // ════════════════════════════════════════════════════════════════

    // ── U-N01：神秘路人給予補給 ─────────────────────────────────
    DB.templates.push({
        id: 'univ_npc_gives_supply',
        type: 'middle',
        reqTags: [],
        excludeTags: ['met_benefactor'],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{sentence_encounter}<br><br>對方沒有敵意。沉默片刻後，遞出了手中的東西。<br><br>{npc_gift_reason}",
                jp: "{sentence_encounter}<br><br>相手に敵意はない。少しの沈黙の後、手に持っていたものを差し出した。<br><br>{npc_gift_reason}",
                kr: "{sentence_encounter}<br><br>상대에게 적의는 없다. 잠시 침묵한 뒤, 손에 든 것을 내밀었다.<br><br>{npc_gift_reason}"
            }
        }],
        options: [
            {
                label: {
                    zh: "接受並道謝",
                    jp: "受け取り感謝する",
                    kr: "받고 감사 인사"
                },
                action: "node_next",
                rewards: {
                    energy: 20,
                    gold: 15,
                    tags: ["met_benefactor"],
                    varOps: [{ key: 'trust', val: 5, op: '+' }],
                    exp: 10
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你接過{combo_item_simple}。{item_use_effect}<br><br>對方點了點頭，轉身消失在{env_feature}之後，沒有留下任何聯絡方式。",
                            jp: "{combo_item_simple}を受け取った。{item_use_effect}<br><br>相手は頷き、背を向けて{env_feature}の向こうへと消えた。連絡先などは一切残さなかった。",
                            kr: "{combo_item_simple}을(를) 건네받았다. {item_use_effect}<br><br>상대는 고개를 끄덕이더니 몸을 돌려 {env_feature} 뒤로 사라졌고, 어떤 연락처도 남기지 않았다."
                        }
                    }],
                    options: [{ label: { zh: "萍水相逢", jp: "一期一会", kr: "우연한 만남" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "拒絕，保持警惕",
                    jp: "断り、警戒を解かない",
                    kr: "거절하고 경계 유지"
                },
                action: "node_next",
                rewards: {
                    exp: 8,
                    tags: ["met_benefactor", "cautious"],
                    varOps: [{ key: 'trust', val: -5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你婉拒了這份好意。在這個世界裡，免費的東西往往最昂貴。<br>對方沒有強求，只是靜靜地轉身離開。也許這是對的選擇——但也許你錯失了一個好機會。",
                            jp: "あなたはその好意を丁重に断った。この世界では、無料のものほど高くつくからだ。<br>相手は無理強いせず、静かに立ち去った。正しい選択だったのかもしれない——だが、好機を逃したのかもしれない。",
                            kr: "당신은 그 호의를 정중히 거절했다. 이 세계에서 공짜란 종종 가장 비싼 대가를 요구하기 마련이니까.<br>상대는 강요하지 않고 조용히 몸을 돌려 떠났다. 아마도 옳은 선택일 것이다——하지만 좋은 기회를 놓친 것일지도 모른다."
                        }
                    }],
                    options: [{ label: { zh: "防人之心", jp: "警戒心", kr: "사람 조심" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "接受，但先問來歷",
                    jp: "受け取るが先に素性を聞く",
                    kr: "받되 먼저 출처를 묻다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    energy: 20,
                    gold: 15,
                    exp: 25,
                    tags: ["met_benefactor", "has_testimony"],
                    varOps: [{ key: 'trust', val: 8, op: '+' }]
                },
                onFail: {
                    text: {
                        zh: "你想打聽對方的底細，但對方眼神一冷，什麼也沒說便收回了手，轉身隱入黑暗。你什麼也沒得到。",
                        jp: "素性を探ろうとしたが、相手の目が冷たくなり、何も言わずに手を引っ込めて闇へと消えた。あなたは何も得られなかった。",
                        kr: "상대의 정체를 캐내려 했지만, 상대는 눈빛이 차갑게 변하더니 아무 말 없이 손을 거두고 어둠 속으로 사라졌다. 당신은 아무것도 얻지 못했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你的敏銳讓對方猶豫了片刻，最終對方不僅留下了物資，還說出了一個名字（或者一個地點）。<br>這條隱秘的線索，或許在之後會派上大用場。",
                            jp: "あなたの鋭さに相手は少し躊躇したが、結局物資を残すだけでなく、ある名前（あるいは場所）を口にした。<br>この隠された手がかりは、後で大いに役立つかもしれない。",
                            kr: "당신의 예리함에 상대는 잠시 머뭇거리더니, 결국 물자뿐만 아니라 어떤 이름(혹은 장소)을 말해주었다.<br>이 은밀한 단서는 나중에 큰 도움이 될지도 모른다."
                        }
                    }],
                    options: [{ label: { zh: "獲得情報", jp: "情報を得る", kr: "정보 획득" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-N02：NPC 以道具換取情報 ───────────────────────────────
    DB.templates.push({
        id: 'univ_npc_trade_info',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{combo_person_appearance}，對方看起來{state_modifier}。<br><br>「我有你需要的東西。但我也需要你的幫助。」<br><br>{env_pack_sensory}",
                jp: "{combo_person_appearance}。相手は{state_modifier}に見える。<br><br>「君が必要としているものを持っている。だが、君の助けも必要なんだ」<br><br>{env_pack_sensory}",
                kr: "{combo_person_appearance}, 상대는 {state_modifier} 보인다.<br><br>「네게 필요한 물건을 갖고 있어. 하지만 나도 네 도움이 필요해.」<br><br>{env_pack_sensory}"
            }
        }],
        options: [
            {
                label: {
                    zh: "聽聽看對方想要什麼",
                    jp: "相手の望みを聞いてみる",
                    kr: "상대가 원하는 걸 들어보다"
                },
                action: "node_next",
                rewards: {
                    exp: 10,
                    varOps: [{ key: 'trust', val: 3, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "對方開出的條件是：幫忙帶走{combo_item_simple}，或者打探某人的下落。<br>作為回報，他當場給了你一些補給，還透露了一條你之前不知道的捷徑。",
                            jp: "相手の条件は、{combo_item_simple}を持ち出すのを手伝うか、ある人物の行方を探ることだった。<br>その見返りとして、彼はその場で補給品を与え、あなたが知らなかった抜け道を一つ教えてくれた。",
                            kr: "상대가 내건 조건은 {combo_item_simple}을(를) 가져가는 걸 돕거나, 누군가의 행방을 알아보는 것이었다.<br>그에 대한 보답으로 그는 그 자리에서 약간의 보급품을 주고, 당신이 몰랐던 지름길 하나를 알려주었다."
                        }
                    }],
                    options: [{ label: { zh: "達成交易", jp: "取引成立", kr: "거래 성사" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "直接拒絕，不想牽扯",
                    jp: "直接断る。関わりたくない",
                    kr: "단칼에 거절. 엮이기 싫다"
                },
                action: "node_next",
                rewards: { exp: 5, tags: ["cautious"] },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "這種來路不明的交易背後通常隱藏著巨大的麻煩。你冷冷地拒絕了對方，頭也不回地離開了。",
                            jp: "素性の知れない取引の裏には、大抵大きなトラブルが潜んでいる。あなたは冷たく拒絶し、振り返ることなくその場を去った。",
                            kr: "이런 출처 불명의 거래 뒤에는 보통 엄청난 골칫거리가 숨어 있기 마련이다. 당신은 차갑게 거절하고 뒤도 돌아보지 않고 떠났다."
                        }
                    }],
                    options: [{ label: { zh: "遠離是非", jp: "厄介事を避ける", kr: "시비 피하기" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "花金幣解決一切",
                    jp: "金貨で全て解決する",
                    kr: "금화로 모두 해결하다"
                },
                condition: { vars: [{ key: 'gold', val: 20, op: '>=' }] },
                action: "node_next",
                rewards: {
                    gold: -20,
                    energy: 20,
                    exp: 15,
                    tags: ["item_found"],
                    varOps: [{ key: 'trust', val: 5, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你不想欠下人情債。幾枚金幣在手裡拋動發出的清脆聲響，讓複雜的交易瞬間變得簡單。<br>對方滿意地收下金幣，交出了{combo_item_simple}，雙方互不相欠。",
                            jp: "借りを作るつもりはなかった。手に持った金貨が立てる小気味よい音が、複雑な取引を一瞬にして単純なものに変えた。<br>相手は満足げに金貨を受け取り、{combo_item_simple}を渡した。これで貸し借りなしだ。",
                            kr: "남에게 빚을 지고 싶지 않았다. 손안에서 굴러가는 금화 몇 닢의 경쾌한 소리가 복잡한 거래를 순식간에 단순하게 만들었다.<br>상대는 만족스럽게 금화를 챙기고 {combo_item_simple}을(를) 내주었다. 양쪽 모두 빚진 것 없는 깔끔한 거래다."
                        }
                    }],
                    options: [{ label: { zh: "金錢萬能", jp: "金が物を言う", kr: "돈이 최고" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ════════════════════════════════════════════════════════════════
    // ⚙️ 類型四：機關與陷阱（風險與報酬並存）
    // ════════════════════════════════════════════════════════════════

    // ── U-T01：察覺機關 ─────────────────────────────────────────
    DB.templates.push({
        id: 'univ_trap_detected',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{phrase_explore_start}<br><br>{trap_warning}<br><br>你在正式踏進去之前停住了腳步。直覺告訴你：不要莽撞。",
                jp: "{phrase_explore_start}<br><br>{trap_warning}<br><br>あなたは足を踏み入れる直前で立ち止まった。直感が告げている。無謀な真似はするなと。",
                kr: "{phrase_explore_start}<br><br>{trap_warning}<br><br>당신은 발을 들이기 직전에 멈춰 섰다. 직감이 무모하게 굴지 말라고 경고한다."
            }
        }],
        options: [
            {
                label: {
                    zh: "繞道避開這個區域",
                    jp: "迂回してこの区画を避ける",
                    kr: "우회하여 이 구역 피하기"
                },
                action: "node_next",
                rewards: { exp: 8, energy: -3 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你決定不冒險。雖然繞遠路多消耗了一點體力，但至少保證了安全。在未知環境中，謹慎總沒錯。",
                            jp: "危険を冒さないことにした。遠回りして少し体力を余分に消費したが、少なくとも安全は確保できた。未知の環境では、慎重であることに越したことはない。",
                            kr: "위험을 감수하지 않기로 했다. 먼 길을 돌아가느라 체력을 조금 더 썼지만, 적어도 안전은 보장받았다. 미지의 환경에서는 신중한 게 최고다."
                        }
                    }],
                    options: [{ label: { zh: "安全第一", jp: "安全第一", kr: "안전 제일" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "嘗試拆除機關",
                    jp: "罠を解除しようとする",
                    kr: "함정을 해제하려 하다"
                },
                check: { stat: 'INT', val: 6 },
                action: "node_next",
                rewards: {
                    gold: 25,
                    exp: 30,
                    tags: ["puzzle_solved", "item_found"]
                },
                onFail: {
                    energy: -10, // 失敗直接扣除精力
                    text: {
                        zh: "你試圖拆除，卻剪錯了線。機關瞬間觸發，你被機關擊中受了不小的傷，痛得咬牙切齒。",
                        jp: "解除を試みたが、手順を誤った。罠が瞬時に作動し、あなたは仕掛けの直撃を受けて大きな傷を負い、歯を食いしばった。",
                        kr: "해제하려 했지만 선을 잘못 잘랐다. 함정이 순식간에 작동했고, 장치에 맞아 적잖은 상처를 입어 고통에 이를 악물었다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你冷靜地分析著機關的構造，花了一些時間，終於聽見「喀噠」一聲，成功將其拆除。<br><br>機關之後是{hidden_space_desc}——裡面藏著{combo_item_desc}。這份豐厚的戰利品是你智慧的獎賞。",
                            jp: "罠の構造を冷静に分析し、時間をかけてようやく「カチッ」という音と共に解除に成功した。<br><br>罠の奥には{hidden_space_desc}があり、そこには{combo_item_desc}が隠されていた。この豊かな戦利品は、あなたの知恵への報酬だ。",
                            kr: "함정의 구조를 냉정하게 분석하며 시간을 들인 끝에, 마침내 '딸깍' 소리와 함께 성공적으로 해제했다.<br><br>함정 뒤편에는 {hidden_space_desc}이(가) 있었고——그 안에는 {combo_item_desc}이(가) 숨겨져 있었다. 이 풍성한 전리품은 당신의 지혜에 대한 보상이다."
                        }
                    }],
                    options: [{ label: { zh: "巧手破解", jp: "巧みな解除", kr: "교묘한 해제" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "硬闖，賭自己夠快",
                    jp: "強行突破。速さに賭ける",
                    kr: "강행 돌파. 속도에 걸다"
                },
                check: { stat: 'AGI', val: 7 },
                action: "node_next",
                rewards: {
                    gold: 20,
                    exp: 20,
                    tags: ["item_found"]
                },
                onFail: {
                    energy: -15,
                    text: {
                        zh: "你以為自己夠快，但機關更快。在你衝過去的瞬間，陷阱狠狠擊中了你，讓你狼狽不堪，受了重傷。",
                        jp: "自分が十分速いと思い込んでいたが、罠はさらに速かった。駆け抜けようとした瞬間、激しい一撃を食らい、重傷を負って無様な姿を晒した。",
                        kr: "자신이 충분히 빠르다고 생각했지만, 함정은 더 빨랐다. 돌진하는 순간 장치가 당신을 매섭게 덮쳤고, 꼴사납게 큰 부상을 입고 말았다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你深吸一口氣，如同獵豹般竄出！就在機關啟動的瞬間，你以不可思議的敏捷翻滾了過去。<br>毫髮無傷的你撿起了對面的{combo_item_simple}。這場豪賭，你贏了。",
                            jp: "深呼吸をし、豹のように飛び出した！罠が作動した瞬間、信じられないほどの身軽さで転がり抜けた。<br>無傷のあなたは、向こう側にあった{combo_item_simple}を拾い上げた。この大穴の賭けは、あなたの勝ちだ。",
                            kr: "심호흡을 하고 표범처럼 튀어 나갔다! 함정이 작동하는 순간, 믿을 수 없는 민첩함으로 구르며 피했다.<br>털끝 하나 다치지 않은 당신은 반대편에 놓인 {combo_item_simple}을(를) 집어 들었다. 이 도박은 당신의 승리다."
                        }
                    }],
                    options: [{ label: { zh: "驚險過關", jp: "間一髪", kr: "아슬아슬 통과" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-T02：沒察覺就踩中機關 ─────────────────────────────────
    DB.templates.push({
        id: 'univ_trap_triggered',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{phrase_explore_start}<br><br>太晚了。腳底傳來一聲悶響，某個東西被你踩動了。<br><br>{sentence_tension}",
                jp: "{phrase_explore_start}<br><br>遅すぎた。足元から鈍い音が響き、何かを踏み抜いてしまった。<br><br>{sentence_tension}",
                kr: "{phrase_explore_start}<br><br>너무 늦었다. 발밑에서 둔탁한 소리가 나며, 무언가를 밟아 작동시키고 말았다.<br><br>{sentence_tension}"
            }
        }],
        options: [
            {
                label: {
                    zh: "立刻衝刺，快速脫離",
                    jp: "即座に走り出し素早く離脱する",
                    kr: "즉시 전력질주로 빠르게 이탈"
                },
                check: { stat: 'AGI', val: 5 },
                action: "node_next",
                rewards: {
                    energy: -8,
                    exp: 20
                },
                onFail: {
                    energy: -15,
                    text: {
                        zh: "你的腿像灌了鉛一樣沉重，剛邁出一步就被噴發出來的機關直接命中，鮮血直流。",
                        jp: "脚が鉛のように重く、一歩踏み出しただけで噴出した罠の直撃を受け、鮮血が流れた。",
                        kr: "다리에 납덩이를 단 듯 무거웠고, 한 발짝 내딛자마자 뿜어져 나온 함정에 직격당해 피를 흘렸다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你根本沒空思考，憑藉肌肉記憶猛地向前衝刺！機關射出的危險物品驚險地擦過了你的衣袖。<br>你大口喘著粗氣，雖然消耗了些許體力，但命保住了。",
                            jp: "考える暇もなく、筋肉の記憶を頼りに猛烈なダッシュを見せた！罠から放たれた危険物が、間一髪で服の袖をかすめた。<br>荒い息を吐きながら、少し体力は消耗したが命は助かったと安堵した。",
                            kr: "생각할 겨를도 없이 근육의 기억에 의존해 맹렬하게 앞으로 돌진했다! 함정에서 발사된 위험한 물건이 아슬아슬하게 당신의 옷소매를 스치고 지나갔다.<br>당신은 거친 숨을 몰아쉬었다. 체력은 조금 소모했지만 목숨은 건졌다."
                        }
                    }],
                    options: [{ label: { zh: "逃過一劫", jp: "難を逃れる", kr: "위기 탈출" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "趴倒降低暴露面積",
                    jp: "伏せて被弾面積を減らす",
                    kr: "엎드려 피탄 면적 줄이기"
                },
                check: { stat: 'STR', val: 4 },
                action: "node_next",
                rewards: {
                    energy: -12,
                    exp: 15
                },
                onFail: {
                    energy: -18,
                    text: {
                        zh: "你試圖趴下，但動作太慢，機關的強大衝擊力還是結結實實地打在了你身上，讓你眼冒金星。",
                        jp: "伏せようとしたが動作が遅すぎた。罠の強大な衝撃がまともに体に直撃し、目から火が出るほどの痛みを感じた。",
                        kr: "엎드리려 했지만 동작이 너무 느렸다. 함정의 강력한 충격이 고스란히 몸을 강타했고, 눈앞에 별이 번쩍였다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你果斷飛撲倒地，用雙臂護住頭部。機關的碎片從你頭頂呼嘯而過。<br>你及時壓低了身體，只受了點皮肉傷。代價是精力和一點自尊。",
                            jp: "果断に地面へダイブし、両腕で頭を庇った。罠の破片が頭上をかすめて飛んでいく。<br>咄嗟に姿勢を低くしたおかげで、かすり傷で済んだ。代償は体力と少しばかりの自尊心だ。",
                            kr: "과감하게 바닥에 엎드리며 두 팔로 머리를 감쌌다. 함정의 파편들이 머리 위를 휙 스치고 지나갔다.<br>재빨리 몸을 낮춘 덕분에 가벼운 찰과상만 입었다. 대가는 기력과 약간의 자존심이다."
                        }
                    }],
                    options: [{ label: { zh: "減少傷害", jp: "被害を抑える", kr: "피해 최소화" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "完全沒反應過來",
                    jp: "全く反応できなかった",
                    kr: "전혀 반응하지 못했다"
                },
                action: "node_next",
                rewards: {
                    energy: -20,
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "轟隆巨響！機關的攻擊完整地砸在了你身上，甚至還附帶了一股不祥的氣息（詛咒上升）。<br>你痛苦地爬起來，渾身是傷，但也只能咬牙繼續前進——這裡沒有放棄的選項。",
                            jp: "轟音！罠の攻撃がまともにあなたを襲い、さらに不吉な気配まで纏わりついた（呪い上昇）。<br>全身の痛みに耐えながら起き上がった。しかし歯を食いしばって進むしかない——ここに諦めるという選択肢はないのだ。",
                            kr: "굉음! 함정의 공격이 고스란히 몸을 덮쳤고, 심지어 불길한 기운마저 띠고 있었다(저주 상승).<br>고통 속에서 비틀거리며 일어났다. 온몸이 상처투성이지만 이를 악물고 나아갈 수밖에 없다——이곳에 포기란 선택지는 없으니까."
                        }
                    }],
                    options: [{ label: { zh: "重傷前行", jp: "重傷を負い進む", kr: "중상 입고 전진" }, action: "advance_chain" }]
                }
            }
        ]
    });

// ════════════════════════════════════════════════════════════════
    // 🌀 類型五：環境異象（不明訊號 / 奇怪的發現）
    //    無直接衝突，但給玩家信息與選擇
    // ════════════════════════════════════════════════════════════════

    // ── U-E01：環境給出訊號 ─────────────────────────────────────
    DB.templates.push({
        id: 'univ_env_signal',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{env_pack_visual}<br><br>{hidden_space_desc}<br><br>你停下來，確認自己沒有看錯。這個細節不尋常。",
                jp: "{env_pack_visual}<br><br>{hidden_space_desc}<br><br>立ち止まり、見間違いでないか確認した。この細部は普通ではない。",
                kr: "{env_pack_visual}<br><br>{hidden_space_desc}<br><br>당신은 멈춰 서서, 자신이 잘못 본 게 아닌지 확인했다. 이 세부 사항은 예사롭지 않다."
            }
        }],
        options: [
            {
                label: {
                    zh: "深入調查",
                    jp: "深く調査する",
                    kr: "깊이 조사하다"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next",
                rewards: {
                    gold: 20,
                    exp: 25,
                    tags: ["observed", "item_found"]
                },
                onFail: {
                    text: {
                        zh: "你試圖分析這個不尋常的細節，但一無所獲。反倒因為過於專注而浪費了不少寶貴的時間。",
                        jp: "この異常な細部を分析しようとしたが、何も得られなかった。かえって集中しすぎて貴重な時間を浪費してしまった。",
                        kr: "이 예사롭지 않은 세부 사항을 분석하려 했지만, 아무것도 얻지 못했다. 오히려 너무 집중한 나머지 귀중한 시간만 낭비했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "經過仔細調查，你發現了隱藏在其中的{combo_item_desc}。<br>這個地方曾經有人在此停留，也許比你早，也許是為了等你。",
                            jp: "綿密に調査した結果、隠されていた{combo_item_desc}を発見した。<br>ここにはかつて誰かが留まっていた。あなたより先に来たのか、あるいはあなたを待っていたのかもしれない。",
                            kr: "자세히 조사한 끝에, 숨겨져 있던 {combo_item_desc}을(를) 발견했다.<br>이곳에는 예전에 누군가 머물렀던 적이 있다. 당신보다 먼저 왔을 수도 있고, 어쩌면 당신을 기다렸을 수도 있다."
                        }
                    }],
                    options: [{ label: { zh: "獲得線索", jp: "手がかり獲得", kr: "단서 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "記下來，先繼續前進",
                    jp: "記録し、今は先へ進む",
                    kr: "기록해두고, 일단 전진하다"
                },
                action: "node_next",
                rewards: {
                    exp: 12,
                    tags: ["observed"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "現在不是糾結於細枝末節的時候。你將這個異常的位置牢牢記在腦海中，隨後快步離開了。",
                            jp: "今は些細なことにこだわっている場合ではない。あなたはこの異常な場所をしっかりと脳裏に刻み込み、早足で立ち去った。",
                            kr: "지금은 사소한 것에 얽매일 때가 아니다. 당신은 이 이상한 장소를 머릿속에 단단히 기억해두고 빠른 걸음으로 떠났다."
                        }
                    }],
                    options: [{ label: { zh: "保持進度", jp: "歩みを進める", kr: "진도 유지" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "感覺不對，離開這裡",
                    jp: "嫌な予感がする。離れる",
                    kr: "느낌이 안 좋아, 이곳을 떠나다"
                },
                action: "node_next",
                rewards: {
                    energy: 5,
                    tags: ["cautious"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "強烈的直覺警告你遠離這個地方。你果斷轉身，避開了潛在的風險，這份謹慎也讓你稍微平復了緊繃的神經。",
                            jp: "強い直感がここから離れろと警告している。あなたは果断に背を向け、潜在的なリスクを回避した。その慎重さのおかげで、張り詰めていた神経が少し落ち着いた。",
                            kr: "강렬한 직감이 이곳을 벗어나라고 경고한다. 과감하게 몸을 돌려 잠재적인 위험을 피했고, 이 신중함 덕분에 팽팽했던 신경도 조금 진정되었다."
                        }
                    }],
                    options: [{ label: { zh: "相信直覺", jp: "直感を信じる", kr: "직감 믿기" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-E02：地點留下了某人的痕跡 ────────────────────────────
    DB.templates.push({
        id: 'univ_env_trace',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: {
                zh: "在{supply_source}，你發現了某人曾在此停留的痕跡。<br><br>地上有一個{combo_item_simple}，旁邊還有幾個{env_adj}的腳印。<br><br>{env_pack_sensory}",
                jp: "{supply_source}で、誰かがここに留まっていた痕跡を見つけた。<br><br>地面に{combo_item_simple}が一つ落ちており、その横にはいくつかの{env_adj}足跡がある。<br><br>{env_pack_sensory}",
                kr: "{supply_source}에서 누군가 머물렀던 흔적을 발견했다.<br><br>바닥에 {combo_item_simple}이(가) 하나 떨어져 있고, 그 옆에는 몇 개의 {env_adj} 발자국이 있다.<br><br>{env_pack_sensory}"
            }
        }],
        options: [
            {
                label: {
                    zh: "帶走那個物品",
                    jp: "その物品を持ち去る",
                    kr: "그 물건을 가져가다"
                },
                action: "node_next",
                rewards: {
                    gold: 15,
                    exp: 10,
                    tags: ["item_found"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你彎腰撿起了那樣東西。{item_use_effect}<br>你不知道它的主人去了哪裡，但現在它對你更有用。",
                            jp: "腰をかがめてそれを拾い上げた。{item_use_effect}<br>持ち主がどこへ行ったかは分からないが、今はあなたにとって有用だ。",
                            kr: "허리를 굽혀 그것을 주웠다. {item_use_effect}<br>주인이 어디로 갔는지는 모르지만, 지금은 당신에게 더 쓸모가 있다."
                        }
                    }],
                    options: [{ label: { zh: "物盡其用", jp: "有効活用", kr: "요긴한 사용" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "沿著腳印追蹤",
                    jp: "足跡をたどって追跡する",
                    kr: "발자국을 따라 추적하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "node_next",
                rewards: {
                    exp: 20,
                    gold: 10,
                    tags: ["has_testimony", "observed"]
                },
                onFail: {
                    text: {
                        zh: "你順著腳印走了一段，但痕跡在混亂的地形中突然中斷了。你失去了線索，也白白浪費了精力。",
                        jp: "足跡を少しの間たどったが、混乱した地形の中で痕跡が途絶えてしまった。手がかりを失い、体力だけを無駄にした。",
                        kr: "발자국을 따라 조금 걸었지만, 복잡한 지형 속에서 흔적이 갑자기 끊겨버렸다. 단서를 잃었고 기력만 낭비했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你的敏銳觀察力發揮了作用，腳印引導你找到了另一處隱密的藏物點。<br>裡面還有一些補給和{combo_item_simple}，追蹤的回報相當豐厚。",
                            jp: "鋭い観察眼が功を奏し、足跡はあなたを別の隠された物資の場所へと導いた。<br>そこにはさらにいくつかの補給品と{combo_item_simple}があり、追跡の見返りは非常に大きかった。",
                            kr: "당신의 예리한 관찰력이 빛을 발해, 발자국이 다른 은밀한 은닉처로 당신을 이끌었다.<br>그 안에는 약간의 보급품과 {combo_item_simple}이(가) 더 있었고, 추적에 대한 보상은 꽤 쏠쏠했다."
                        }
                    }],
                    options: [{ label: { zh: "追蹤成功", jp: "追跡成功", kr: "추적 성공" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不碰，這可能是現場",
                    jp: "触らない。事件現場の可能性がある",
                    kr: "건드리지 않다. 현장일지도 몰라"
                },
                action: "node_next",
                rewards: {
                    exp: 8,
                    tags: ["cautious"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "這看起來太像某種刻意留下的陷阱或是犯罪現場。你決定保持原樣，不留下任何自己的痕跡，悄悄退出了這個區域。",
                            jp: "意図的に残された罠か、あるいは犯罪現場のようにも見える。あなたはそのままにして自分の痕跡を一切残さず、静かにこの区域から退いた。",
                            kr: "어떤 의도적인 함정이나 범죄 현장처럼 보인다. 당신은 그대로 둔 채 자신의 흔적을 전혀 남기지 않고 조용히 이 구역을 빠져나왔다."
                        }
                    }],
                    options: [{ label: { zh: "謹慎為上", jp: "慎重を期す", kr: "신중함 최우선" }, action: "advance_chain" }]
                }
            }
        ]
    });


    // ════════════════════════════════════════════════════════════════
    // 💰 類型六：意外之財（純金幣 + 精力組合）
    // ════════════════════════════════════════════════════════════════

    // ── U-G01：可疑的財物 ───────────────────────────────────────
    DB.templates.push({
        id: 'univ_gold_suspicious',
        type: 'middle',
        reqTags: [],
        excludeTags: ['took_suspicious_gold'],
        weight: 1,
        dialogue: [{
            text: {
                zh: "在{env_feature}，你發現了一個沉甸甸的小袋子。<br><br>裡面是金幣。不少。沒有任何標記，不知是誰的。<br><br>{sentence_tension}",
                jp: "{env_feature}で、ずっしりと重い小さな袋を見つけた。<br><br>中身は金貨だ。かなりの量がある。何の印もなく、誰のものか分からない。<br><br>{sentence_tension}",
                kr: "{env_feature}에서 묵직한 작은 주머니를 하나 발견했다.<br><br>안에는 금화가 들어있다. 꽤 많다. 아무런 표시도 없고 누구 것인지도 알 수 없다.<br><br>{sentence_tension}"
            }
        }],
        options: [
            {
                label: {
                    zh: "直接收進口袋",
                    jp: "そのままポケットにしまう",
                    kr: "바로 주머니에 넣다"
                },
                action: "node_next",
                rewards: {
                    gold: 50,
                    tags: ["took_suspicious_gold"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你將袋子裡的錢全部倒進了自己的口袋。在這個殘酷的世界裡，道德往往是件奢侈品，而金幣卻能實打實地買到生存的機會。",
                            jp: "袋の中の金をすべて自分のポケットに流し込んだ。この残酷な世界では、道徳は往々にして贅沢品だが、金貨は確実に生き延びる機会を買ってくれる。",
                            kr: "주머니 안의 돈을 전부 자신의 주머니에 털어 넣었다. 이 잔혹한 세계에서 도덕은 종종 사치품이지만, 금화는 확실하게 생존의 기회를 사준다."
                        }
                    }],
                    options: [{ label: { zh: "天降橫財", jp: "棚から牡丹餅", kr: "뜻밖의 횡재" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "拿一半，留下另一半",
                    jp: "半分取り、残りは置いておく",
                    kr: "절반만 가져가고 나머지는 두다"
                },
                action: "node_next",
                rewards: {
                    gold: 25,
                    exp: 15,
                    tags: ["took_suspicious_gold"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你取走了一半的硬幣，將剩下的留在原處。<br>也許這是某種測試，也許只是純粹的運氣。至少你沒有展現出毫無底線的貪婪。",
                            jp: "硬貨の半分を取り、残りは元の場所に戻した。<br>これは何かの試しかもしれないし、ただの幸運かもしれない。少なくとも、あなたは底なしの貪欲さを見せることはなかった。",
                            kr: "동전의 절반을 챙기고 나머지는 원래 자리에 두었다.<br>어쩌면 이건 일종의 시험일지도, 혹은 그저 순수한 행운일지도 모른다. 적어도 당신은 밑도 끝도 없는 탐욕을 보이지는 않았다."
                        }
                    }],
                    options: [{ label: { zh: "知足常樂", jp: "足るを知る", kr: "안분지족" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不碰，繼續前進",
                    jp: "触らずに先へ進む",
                    kr: "건드리지 않고 계속 전진하다"
                },
                action: "node_next",
                rewards: {
                    exp: 20,
                    energy: 5,
                    tags: ["took_suspicious_gold"] // 雖然沒拿，但標記事件已發生
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "太可疑了。你甚至連碰都沒有碰它一下，轉身繼續你的旅程。<br>某種程度上，在這絕境中能抵擋住金錢的誘惑，這個決定比金幣本身更值錢。",
                            jp: "怪しすぎる。あなたはそれに触れることすらなく、背を向けて旅を続けた。<br>ある意味で、この絶境において金の誘惑に打ち勝ったというその決断は、金貨そのものよりも価値がある。",
                            kr: "너무 의심스럽다. 당신은 그것을 건드리지조차 않고 몸을 돌려 여정을 계속했다.<br>어떤 면에서, 이 절망적인 상황 속에서 돈의 유혹을 이겨낸 그 결정은 금화 자체보다 더 값지다."
                        }
                    }],
                    options: [{ label: { zh: "不為所動", jp: "心を動かされない", kr: "동요하지 않다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-G02：賭注（高風險高報酬，已合併檢定邏輯）──────────────────────────────
    DB.templates.push({
        id: 'univ_gold_gamble',
        type: 'middle',
        reqTags: [],
        condition: { vars: [{ key: 'gold', val: 20, op: '>=' }] },
        weight: 1,
        dialogue: [{
            text: {
                zh: "{combo_person_appearance}，手中的骰子在{env_light}下閃著光。<br><br>「賭一把？你出二十，我出四十。猜對了就拿走，猜錯了⋯⋯那就各憑本事。」",
                jp: "{combo_person_appearance}。手の中のサイコロが{env_light}の下で光っている。<br><br>「賭けをしないか？お前が20、俺が40出す。当たれば持っていけ。外れたら……まあ、自己責任だな」",
                kr: "{combo_person_appearance}, 손에 든 주사위가 {env_light} 아래서 빛난다.<br><br>「도박 한번 할까? 넌 20을 걸고, 난 40을 걸지. 맞히면 가져가고, 틀리면... 각자 알아서 하는 거지.」"
            }
        }],
        options: [
            {
                label: {
                    zh: "賭一把 (花費20金幣)",
                    jp: "賭ける (金貨20消費)",
                    kr: "도박한다 (금화 20 소비)"
                },
                check: { stat: 'LCK', val: 5 }, // 系統判定輸贏
                action: "node_next",
                rewards: { 
                    varOps: [{ key: 'gold', val: 20, op: '+' }], // 贏了淨賺 20 (加上本金共拿40)
                    exp: 15 
                },
                onFail: {
                    varOps: [{ key: 'gold', val: -20, op: '+' }], // 輸了扣除 20
                    text: {
                        zh: "你猜錯了。二十枚金幣就這樣俐落地換了個主人。對方笑著拍了拍你的肩膀：「下次吧。」",
                        jp: "外れた。20枚の金貨はあっさりと持ち主を変えた。相手は笑ってあなたの肩を叩いた。「また今度な」",
                        kr: "틀렸다. 금화 20닢은 그렇게 깔끔하게 주인이 바뀌었다. 상대가 웃으며 당신의 어깨를 두드렸다. 「다음에 또 하자고.」"
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你贏了！對方爽快地將四十枚金幣推到你面前，沒有耍賴。<br>「運氣真不錯。」他說，眼神中帶著一絲複雜的意味。",
                            jp: "あなたの勝ちだ！相手はいさぎよく40枚の金貨をあなたの前に押し出した。ごまかしは一切ない。<br>「運がいいな」彼は言い、その目には少し複雑な色が浮かんでいた。",
                            kr: "당신이 이겼다! 상대는 시원스럽게 40닢의 금화를 당신 앞으로 밀어주었고, 발뺌하지 않았다.<br>「운이 좋군.」 그가 말했다. 눈빛에 약간 복잡한 의미가 담겨 있었다."
                        }
                    }],
                    options: [{ label: { zh: "收下獎金", jp: "賞金を受け取る", kr: "상금 챙기기" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "不賭，繼續前進",
                    jp: "賭けずに先へ進む",
                    kr: "도박하지 않고 전진"
                },
                action: "node_next",
                rewards: { exp: 8 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你搖了搖頭。十賭九輸，你可不想把珍貴的資源浪費在機率上。你無視了對方的挑釁，穩步離開了現場。",
                            jp: "あなたは首を振った。賭け事は大抵負けるものだ。貴重な資源を確率などに浪費したくはない。相手の挑発を無視し、確かな足取りでその場を離れた。",
                            kr: "당신은 고개를 저었다. 도박은 십중팔구 잃기 마련이다. 귀중한 자원을 확률에 낭비하고 싶진 않다. 상대의 도발을 무시하고, 흔들림 없는 발걸음으로 현장을 떠났다."
                        }
                    }],
                    options: [{ label: { zh: "拒絕誘惑", jp: "誘惑を拒む", kr: "유혹 거절" }, action: "advance_chain" }]
                }
            }
        ]
    });
// ════════════════════════════════════════════════════════════════
    // 🔮 類型七：神秘符文 / 古老文字（解謎 + 精力恢復或道具）
    //    低調版的學習鉤，不涉及 learning 標籤
    // ════════════════════════════════════════════════════════════════

    // ── U-M01：壁刻文字（解讀後恢復 + 獎勵）────────────────────
    DB.templates.push({
        id: 'univ_mystery_inscription',
        type: 'middle',
        reqTags: [],
        excludeTags: ['read_inscription'],
        weight: 1,
        dialogue: [{
            text: {
                zh: "{env_pack_visual}<br><br>牆上有一段刻字，筆跡古老，語言也不像你熟悉的文字。<br><br>字跡中夾雜著幾個符號——你隱約感覺它有意義。",
                jp: "{env_pack_visual}<br><br>壁に文字が刻まれている。筆跡は古く、見慣れた言語でもないようだ。<br><br>文字の中にはいくつかの記号が混ざっている——何か意味があるような気がする。",
                kr: "{env_pack_visual}<br><br>벽에 글귀가 새겨져 있다. 필적이 오래되었고, 당신에게 익숙한 언어도 아니다.<br><br>글귀 사이에 몇 개의 기호가 섞여 있다——어렴풋이 어떤 의미가 느껴진다."
            }
        }],
        options: [
            {
                label: {
                    zh: "嘗試解讀",
                    jp: "解読を試みる",
                    kr: "해독 시도"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next",
                rewards: {
                    energy: 10,
                    exp: 25,
                    gold: 15,
                    tags: ["read_inscription", "knowledge_found"]
                },
                onFail: {
                    text: {
                        zh: "這些符號過於晦澀，你盯著看了半天，只覺得一陣頭暈目眩，什麼也沒看懂。",
                        jp: "記号はあまりにも難解で、しばらく見つめていると眩暈がしてきた。結局何も読み取れなかった。",
                        kr: "기호들이 너무 난해해서 한참을 쳐다보았지만, 어지러움만 느꼈을 뿐 아무것도 이해하지 못했다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你花了一些時間，結合周圍的環境拼湊出大意——這段文字描述了一種古老的儀式，或者說，一個隱藏出口的方向。某些塵封的知識在你腦海中鬆動了。",
                            jp: "時間をかけて周囲の環境と照らし合わせ、大意を掴んだ。この文章は古代の儀式、あるいは隠された出口の方向を示している。脳の奥底で、埃を被っていた知識が少しだけ解放された。",
                            kr: "시간을 들여 주변 환경과 결합해 대략적인 의미를 짜맞췄다. 이 글귀는 고대의 의식, 혹은 숨겨진 출구의 방향을 묘사하고 있다. 뇌리 속에 묻혀 있던 어떤 지식이 깨어나는 듯했다."
                        }
                    }],
                    options: [{ label: { zh: "豁然開朗", jp: "理解する", kr: "깨달음" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "拓印下來之後研究",
                    jp: "拓本を取り後で研究する",
                    kr: "탁본을 떠 나중에 연구하다"
                },
                action: "node_next",
                rewards: {
                    exp: 12,
                    tags: ["read_inscription"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "現在不是解讀的好時機。你用隨身的紙筆將這段奇特的文字拓印了下來，妥善收好，留待日後慢慢研究。",
                            jp: "今は解読している場合ではない。手持ちの紙とペンでこの奇妙な文字を写し取り、後でじっくり研究するために大切にしまった。",
                            kr: "지금은 해독하기 좋은 타이밍이 아니다. 가지고 있던 종이와 펜으로 이 기묘한 글귀를 탁본하여 잘 챙겨두고, 훗날 천천히 연구하기로 했다."
                        }
                    }],
                    options: [{ label: { zh: "留下紀錄", jp: "記録を残す", kr: "기록 남기기" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "忽略並繼續前進",
                    jp: "無視して先へ進む",
                    kr: "무시하고 계속 전진"
                },
                action: "node_next",
                rewards: { energy: 3 },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "好奇心殺死貓。你沒有理會那些詭異的刻字，保持專注，繼續踏上你的旅程。",
                            jp: "好奇心は猫を殺す。不気味な刻み文字は気にせず、集中力を保ったまま旅を続けた。",
                            kr: "호기심이 고양이를 죽인다. 그 기괴한 글귀는 무시하고, 집중을 유지하며 여정을 계속했다."
                        }
                    }],
                    options: [{ label: { zh: "不為所動", jp: "気に留めない", kr: "동요하지 않다" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ════════════════════════════════════════════════════════════════
    // 🌿 類型八：路徑岔口（無衝突，純路線選擇影響後續標籤）
    // ════════════════════════════════════════════════════════════════

    // ── U-P01：三岔路口 ─────────────────────────────────────────
    DB.templates.push({
        id: 'univ_path_crossroads',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: {
                zh: "前方出現了三條路。<br><br>左邊：{env_pack_visual}<br>右邊：{env_pack_sensory}<br>中間：{hidden_space_desc}<br><br>你只能選一條。",
                jp: "前方に三つの道が現れた。<br><br>左側：{env_pack_visual}<br>右側：{env_pack_sensory}<br>中央：{hidden_space_desc}<br><br>選べるのは一つだけだ。",
                kr: "앞에 세 갈래 길이 나타났다.<br><br>왼쪽: {env_pack_visual}<br>오른쪽: {env_pack_sensory}<br>가운데: {hidden_space_desc}<br><br>당신은 하나만 선택해야 한다."
            }
        }],
        options: [
            {
                label: {
                    zh: "走左邊（視覺引導）",
                    jp: "左の道を行く（視覚）",
                    kr: "왼쪽 길 (시각적 판단)"
                },
                action: "node_next",
                rewards: {
                    energy: 5,
                    exp: 10,
                    tags: ["took_left_path"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你選擇相信自己的眼睛，踏入了左邊的通道。周圍的景象逐漸變化，帶領你走向未知的深處。",
                            jp: "自分の目を信じ、左の通路へと足を踏み入れた。周囲の景色は次第に変化し、未知の奥深くへとあなたを導いていく。",
                            kr: "자신의 눈을 믿기로 하고, 왼쪽 통로로 발을 내디뎠다. 주변의 광경이 점차 변하며 당신을 미지의 깊은 곳으로 이끈다."
                        }
                    }],
                    options: [{ label: { zh: "踏入左徑", jp: "左道へ", kr: "왼쪽 진입" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "走右邊（感官引導）",
                    jp: "右の道を行く（感覚）",
                    kr: "오른쪽 길 (감각적 판단)"
                },
                action: "node_next",
                rewards: {
                    gold: 10,
                    exp: 10,
                    tags: ["took_right_path"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你循著空氣中的氣息與細微的聲音，走向了右邊。這條路似乎較少人涉足，但也許藏著意外的收穫。",
                            jp: "空気の匂いと微かな音を頼りに、右の道を進んだ。この道はあまり人が足を踏み入れていないようだが、思いがけない収穫が隠されているかもしれない。",
                            kr: "공기 중의 기운과 미세한 소리를 따라 오른쪽으로 향했다. 이 길은 사람의 발길이 드문 듯하지만, 뜻밖의 수확이 숨겨져 있을지도 모른다."
                        }
                    }],
                    options: [{ label: { zh: "踏入右徑", jp: "右道へ", kr: "오른쪽 진입" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "走中間（直覺引導）",
                    jp: "中央の道を行く（直感）",
                    kr: "가운데 길 (직감적 판단)"
                },
                action: "node_next",
                rewards: {
                    energy: 10,
                    gold: 15,
                    exp: 15,
                    tags: ["took_middle_path"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "中間的路沒有任何明顯的地標或線索，你完全憑藉著直覺前進。但有時候，心底的直覺比任何理性的指引都還要準確。",
                            jp: "中央の道には目印や手がかりがない。完全に直感だけを頼りに進んだ。しかし時として、心の直感はどんな理性的な導きよりも正確なのだ。",
                            kr: "가운데 길에는 눈에 띄는 랜드마크나 단서가 없었고, 당신은 온전히 직감에 의존해 나아갔다. 하지만 때로는, 마음속 직감이 어떤 이성적인 지표보다 더 정확한 법이다."
                        }
                    }],
                    options: [{ label: { zh: "踏入中徑", jp: "中央道へ", kr: "가운데 진입" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-P02：回頭路（代價 + 補給）────────────────────────────
    DB.templates.push({
        id: 'univ_path_backtrack',
        type: 'middle',
        reqTags: [],
        excludeTags: ['did_backtrack'],
        weight: 1,
        dialogue: [{
            text: {
                zh: "前方的路被死死封住了。你別無選擇，必須原路折返。<br><br>{rest_activity}<br><br>在回頭的路上，你注意到了一個之前匆忙間錯過的細節——{hidden_space_desc}",
                jp: "行く手が完全に塞がれていた。選択の余地はなく、引き返すしかない。<br><br>{rest_activity}<br><br>戻る道すがら、先ほどは急いでいて見落とした細部に気づいた——{hidden_space_desc}",
                kr: "앞길이 꽉 막혀 있다. 선택의 여지가 없이, 왔던 길로 돌아가야 한다.<br><br>{rest_activity}<br><br>돌아가는 길에, 당신은 아까 서두르느라 놓쳤던 세부 사항을 눈치챘다——{hidden_space_desc}"
            }
        }],
        options: [
            {
                label: {
                    zh: "停下來仔細調查",
                    jp: "立ち止まり詳しく調べる",
                    kr: "멈춰서 자세히 조사하다"
                },
                action: "node_next",
                rewards: {
                    gold: 20,
                    energy: 10,
                    exp: 15,
                    tags: ["did_backtrack", "observed"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你耐心地重新搜查了這個區域，這次的折返讓你幸運地找到了{combo_item_simple}。<br>走錯了路固然浪費時間，但有時候也會帶來意外的補償。",
                            jp: "根気よくこの区画を再調査し、この引き返しによって幸運にも{combo_item_simple}を見つけた。<br>道を間違えて時間を無駄にしたが、時にはそれが思いがけない埋め合わせをもたらすこともある。",
                            kr: "참을성 있게 이 구역을 다시 수색했고, 이번에 길을 되돌아간 덕분에 운 좋게 {combo_item_simple}을(를) 찾아냈다.<br>길을 잘못 들어 시간을 낭비하긴 했지만, 때로는 그것이 뜻밖의 보상을 가져다주기도 한다."
                        }
                    }],
                    options: [{ label: { zh: "塞翁失馬", jp: "人間万事塞翁が馬", kr: "전화위복" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "繼續往回走不停留",
                    jp: "止まらずに引き返し続ける",
                    kr: "멈추지 않고 계속 돌아가다"
                },
                action: "node_next",
                rewards: {
                    energy: -5,
                    exp: 8,
                    tags: ["did_backtrack"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你心裡只想趕快回到正軌，不想在走過的地方多浪費一秒鐘。你加快了腳步折返，雖然白白消耗了些體力，但也重新找回了方向。",
                            jp: "一刻も早く正しい軌道に戻りたくて、すでに通った場所に一秒たりとも時間を浪費したくなかった。早足で引き返し、無駄な体力は使ったが、再び方向を取り戻すことができた。",
                            kr: "하루빨리 올바른 궤도로 돌아가고 싶은 마음에, 이미 지나온 곳에서 1초도 낭비하고 싶지 않았다. 걸음을 재촉해 돌아가느라 체력을 헛되이 소모하긴 했지만, 다시 방향을 되찾았다."
                        }
                    }],
                    options: [{ label: { zh: "回到正軌", jp: "軌道修正", kr: "궤도 복귀" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ════════════════════════════════════════════════════════════════
    // 🎯 類型九：高風險版本（與 risk_high 標籤連動的強化版節點）
    // ════════════════════════════════════════════════════════════════

    // ── U-H01：高風險下的喘息（精力少但更有意義）────────────────
    DB.templates.push({
        id: 'univ_risk_brief_rest',
        type: 'middle',
        reqTags: ['risk_high'],
        weight: 2,
        dialogue: [{
            text: {
                zh: "你不能停太久。但你必須停一下。<br><br>{rest_activity}<br><br>短短幾秒鐘的靜止，讓你清晰地聽見了自己的心跳。你意識到：你還活著。這已經比你預期的要好了。",
                jp: "長くは止まれない。だが、今は休まなければならない。<br><br>{rest_activity}<br><br>わずか数秒の静止が、自分の鼓動をはっきりと聞かせた。あなたは悟った。まだ生きている。それだけでも、予想よりずっとマシだ。",
                kr: "오래 멈춰있을 수 없다. 하지만 반드시 잠시 멈춰야 한다.<br><br>{rest_activity}<br><br>단 몇 초간의 정적이 당신의 심장 박동을 선명하게 들려주었다. 당신은 깨달았다: 나는 아직 살아있다. 그것만으로도 예상했던 것보다 훨씬 나은 상황이다."
            }
        }],
        options: [
            {
                label: {
                    zh: "盡快喘息，繼續逃",
                    jp: "素早く息を整え逃げ続ける",
                    kr: "빨리 숨 고르고 계속 도망치다"
                },
                action: "node_next",
                rewards: {
                    energy: 12,
                    exp: 10
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你大口呼吸著空氣，讓氧氣重新注滿肺部。這短暫的停頓勉強支撐起了你虛弱的雙腿，你強迫自己站起來，再次投入這場高壓的博弈。",
                            jp: "大きく息を吸い込み、肺に酸素を満たした。この短時間の休息で弱った両脚を辛うじて立たせ、再びこの高圧的なゲームへと身を投じた。",
                            kr: "숨을 크게 들이마셔 폐에 산소를 다시 채웠다. 이 짧은 멈춤이 후들거리는 두 다리를 간신히 지탱해 주었고, 당신은 억지로 몸을 일으켜 다시 이 숨 막히는 게임에 뛰어들었다."
                        }
                    }],
                    options: [{ label: { zh: "死裡求生", jp: "決死の生存", kr: "결사적인 생존" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "冒險搜查這個角落",
                    jp: "危険を冒して隅を調べる",
                    kr: "위험을 무릅쓰고 구석 조사"
                },
                check: { stat: 'INT', val: 5 },
                action: "node_next",
                rewards: {
                    energy: 12,
                    gold: 20,
                    exp: 20,
                    tags: ["item_found"]
                },
                onFail: {
                    varOps: [{ key: 'tension', val: 15, op: '+' }], // 失敗增加暴露度
                    text: {
                        zh: "你試圖在極度恐慌中集中精神，但雙手抖得厲害，什麼也沒摸到。遠處傳來的異響警告你不能再浪費時間了。",
                        jp: "極度のパニックの中で集中しようとしたが、手が激しく震え、何も見つけられなかった。遠くから聞こえる異音が、これ以上時間を無駄にするなと警告している。",
                        kr: "극도의 공황 상태에서 집중하려 했지만, 손이 너무 떨려 아무것도 찾지 못했다. 멀리서 들려오는 기이한 소리가 더 이상 시간을 지체해선 안 된다고 경고한다."
                    }
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "在極端的高壓中，你奇蹟般地維持了敏銳的觀察力。你看到了隱藏在陰影下的{hidden_space_desc}，裡面放著{combo_item_simple}。<br>高危險帶來了高回報，這份冷靜救了你一命。",
                            jp: "極限のプレッシャーの中、奇跡的に鋭い観察力を維持した。陰に隠された{hidden_space_desc}を見つけ、そこには{combo_item_simple}があった。<br>ハイリスク・ハイリターン。その冷静さが命を救った。",
                            kr: "극도의 압박 속에서, 기적적으로 예리한 관찰력을 유지했다. 어둠 속에 숨겨진 {hidden_space_desc}을(를) 보았고, 그 안에는 {combo_item_simple}이(가) 놓여 있었다.<br>고위험이 고수익을 가져왔다. 이 냉정함이 당신의 목숨을 구했다."
                        }
                    }],
                    options: [{ label: { zh: "驚險拾取", jp: "際どい回収", kr: "아슬아슬한 획득" }, action: "advance_chain" }]
                }
            }
        ]
    });

    // ── U-H02：risk_high 下的關鍵道具出現 ───────────────
    DB.templates.push({
        id: 'univ_risk_key_item_drop',
        type: 'middle',
        reqTags: ['risk_high'],
        excludeTags: ['found_risk_item'],
        weight: 2,
        dialogue: [{
            text: {
                zh: "慌亂逃亡之中，你的腳尖踢到了什麼沉甸甸的東西。<br><br>低頭一看——是{combo_item_desc}。<br><br>{item_use_effect}",
                jp: "パニックになりながら逃げる最中、足先が何か重いものにぶつかった。<br><br>下を見ると——{combo_item_desc}だ。<br><br>{item_use_effect}",
                kr: "허둥지둥 도망치던 중, 발끝에 뭔가 묵직한 것이 채였다.<br><br>고개를 숙여 보니——{combo_item_desc}이다.<br><br>{item_use_effect}"
            }
        }],
        options: [
            {
                label: {
                    zh: "一把抓起，繼續狂奔",
                    jp: "ひっつかみ、走り続ける",
                    kr: "움켜쥐고 계속 도망치다"
                },
                action: "node_next",
                rewards: {
                    gold: 20,
                    energy: 10,
                    tags: ["found_risk_item", "item_found"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "你根本來不及細想，憑著求生本能一把將物品抓進懷裡，然後沒有減速地繼續向前狂奔。這東西或許會成為你翻盤的關鍵。",
                            jp: "深く考える暇もなく、生存本能のままにそれを懐へつかみ込み、速度を落とさずに走り続けた。この品は、形勢逆転の鍵になるかもしれない。",
                            kr: "깊게 생각할 겨를도 없이, 생존 본능에 이끌려 물건을 품속에 홱 집어넣고는 속도를 줄이지 않고 계속 달렸다. 이것이 판세를 뒤집을 열쇠가 될지도 모른다."
                        }
                    }],
                    options: [{ label: { zh: "亡命拾荒", jp: "命がけの回収", kr: "결사적인 획득" }, action: "advance_chain" }]
                }
            },
            {
                label: {
                    zh: "沒空管它，逃命要緊",
                    jp: "構う暇はない、命が最優先だ",
                    kr: "신경 쓸 겨를 없어, 목숨이 먼저다"
                },
                action: "node_next",
                rewards: {
                    energy: 5,
                    exp: 8,
                    tags: ["found_risk_item"]
                },
                nextScene: {
                    dialogue: [{
                        text: {
                            zh: "停下腳步就等於死亡。你強忍著去撿裝備的衝動，看都沒多看一眼，跨過它直接逃走了。性命永遠排在第一位。",
                            jp: "足を止めることは死を意味する。装備を拾いたい衝動を必死に抑え込み、見向きもせずにそれを跨いで逃げ去った。命こそが永遠の最優先事項だ。",
                            kr: "발걸음을 멈추는 건 곧 죽음을 의미한다. 장비를 줍고 싶은 충동을 억누르고, 쳐다보지도 않은 채 그것을 뛰어넘어 곧장 도망쳤다. 목숨이 언제나 최우선이다."
                        }
                    }],
                    options: [{ label: { zh: "保命第一", jp: "命を惜しむ", kr: "목숨 보전" }, action: "advance_chain" }]
                }
            }
        ]
    });


    const univCount = DB.templates.filter(t => t.id && t.id.startsWith('univ_')).length;
    console.log(`✅ data_piece_universal.js V1.0 已載入`);
	})();