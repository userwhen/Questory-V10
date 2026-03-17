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
    // 精力恢復 / 心理緩衝 / 為下一段蓄力
    // ════════════════════════════════════════════════════════════════

    // ── U-R01：短暫藏身 ─────────────────────────────────────────
    DB.templates.push({
        id: 'univ_rest_hideout',
        type: 'middle',
        reqTags: [],         // 無主題限制
        excludeTags: ['has_rested_recently'],
        weight: 1,
        dialogue: [{
            text: { zh:
                "{phrase_explore_start}<br><br>" +
                "{rest_activity}<br><br>" +
                "你找到了{rest_location}，暫時躲了進去。{memory_flashback}"
            }
        }],
        options: [
            {
                label: "充分休息，回復精力",
                action: "advance_chain",
                rewards: {
                    energy: 20,
                    tags: ["has_rested_recently"],
                    varOps: [{ key: 'time_left', val: 1, op: '-' }]
                }
            },
            {
                label: {
                    zh: "淺眠，保持警覺",
                    jp: "浅く眠り警戒を保つ",
                    kr: "얕게 자며 경계를 유지하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    energy: 12,
                    exp: 10,
                    tags: ["has_rested_recently", "cautious"]
                },
                nextScene: {
                    zh: "淺眠中，你的感官仍維持一定的警覺。<br>休息不算充分，但你沒有漏掉任何動靜。"
                }
            },
            {
                label: "沒空休息，繼續前進",
                action: "advance_chain",
                rewards: { exp: 5 }
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
            text: { zh:
                "{env_pack_visual}<br><br>" +
                "{rest_activity}<br><br>" +
                "這裡出奇地安靜。{memory_flashback}"
            }
        }],
        options: [
            {
                label: "趁機恢復狀態",
                action: "advance_chain",
                rewards: { energy: 15, exp: 5 }
            },
            {
                label: {
                    zh: "仔細環顧，也許有收穫",
                    jp: "じっくり見回す。何かあるかも",
                    kr: "자세히 둘러보다. 뭔가 있을지도"
                },
                check: { stat: 'INT', val: 3 },
                action: "advance_chain",
                rewards: {
                    energy: 8,
                    gold: 15,
                    exp: 12,
                    tags: ["observed"]
                },
                nextScene: {
                    zh: "平靜讓你得以仔細觀察四周。<br>你發現了{combo_item_simple}——不知是誰留下的。"
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
            text: { zh:
                "在{supply_source}，你翻到了一些殘留的補給。<br><br>" +
                "{supply_flavor}"
            }
        }],
        options: [
            {
                label: "全部收下，先恢復精力",
                action: "advance_chain",
                rewards: {
                    energy: 25,
                    gold: 5,
                    tags: ["looted_supply"]
                }
            },
            {
                label: {
                    zh: "只取需要的，留給後人",
                    jp: "必要なものだけ取り後の人のために残す",
                    kr: "필요한 것만 가져가고 후인을 위해 남기다"
                },
                action: "advance_chain",
                rewards: {
                    energy: 12,
                    exp: 15,
                    tags: ["looted_supply"]
                },
                nextScene: {
                    zh: "你只取走了一部分。<br>也許這個決定之後會有意義，也許不會——但你不後悔。"
                }
            },
            {
                label: "不確定安不安全，不碰",
                action: "advance_chain",
                rewards: { exp: 8, tags: ["cautious"] }
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
            text: { zh:
                "{hidden_space_desc}<br><br>" +
                "你猶豫片刻——這種地方藏著的東西，有時是寶貝，有時是陷阱。"
            }
        }],
        options: [
            {
                label: "直接打開",
                action: "advance_chain",
                rewards: {
                    gold: 30,
                    energy: 10,
                    tags: ["found_hidden_cache", "item_found"]
                },
                nextScene: {
                    zh: "裡面是{combo_item_desc}<br><br>" +
                        "你把它收好。這東西在這個地方出現，絕對不是偶然。"
                }
            },
            {
                label: {
                    zh: "先確認周圍安全",
                    jp: "まず周囲の安全を確認する",
                    kr: "먼저 주변 안전을 확인하다"
                },
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                rewards: {
                    gold: 30,
                    energy: 15,
                    exp: 20,
                    tags: ["found_hidden_cache", "item_found"]
                },
                nextScene: {
                    zh: "你先確認了沒有觸發機關，才謹慎打開。<br><br>" +
                        "裡面是{combo_item_desc}<br>" +
                        "謹慎讓你獲得了更多——精力和物品都完整到手。"
                }
            },
            {
                label: "先搜查周圍有沒有陷阱",
                action: "advance_chain",
                rewards: {
                    exp: 10,
                    tags: ["found_hidden_cache", "cautious"]
                },
                nextScene: {
                    zh: "你花了不少時間仔細搜查。<br>最後確認安全，但開啟時已經空了——有人比你早到過。"
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
            text: { zh:
                "你在{supply_source}發現了某個東西。<br><br>" +
                "仔細一看——這正是你一直在找的：<strong>{chain_item}</strong>。<br><br>" +
                "它怎麼會在這裡？"
            }
        }],
        options: [
            {
                label: "收下，這正是我需要的",
                action: "advance_chain",
                rewards: {
                    tags: ["received_chain_item", "item_found", "has_key_item"],
                    varOps: [
                        { key: 'g_has_chain_item_hint', val: 0, op: '=' },
                        { key: 'credibility', val: 10, op: '+' }
                    ],
                    exp: 20
                },
                nextScene: {
                    zh: "你把{chain_item}收好。<br>這改變了你接下來的選擇空間。"
                }
            },
            {
                label: {
                    zh: "這是陷阱，先觀察",
                    jp: "罠だ——まず観察する",
                    kr: "함정이야——먼저 관찰하다"
                },
                check: { stat: 'INT', val: 6 },
                action: "advance_chain",
                rewards: {
                    tags: ["received_chain_item", "item_found", "has_key_item", "cautious"],
                    exp: 30,
                    varOps: [{ key: 'g_has_chain_item_hint', val: 0, op: '=' }]
                },
                nextScene: {
                    zh: "你等了一會兒，確認沒有人在監視，才取走{chain_item}。<br>" +
                        "謹慎是對的——這個地方沒有什麼是單純的偶然。"
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
            text: { zh:
                "{sentence_encounter}<br><br>" +
                "對方沒有敵意。沉默片刻後，遞出了手中的東西。<br><br>" +
                "{npc_gift_reason}"
            }
        }],
        options: [
            {
                label: "接受，道謝",
                action: "advance_chain",
                rewards: {
                    energy: 20,
                    gold: 15,
                    tags: ["met_benefactor"],
                    varOps: [{ key: 'trust', val: 5, op: '+' }],
                    exp: 10
                },
                nextScene: {
                    zh: "你接過{combo_item_simple}。{item_use_effect}<br><br>" +
                        "對方已經消失在{env_feature}之後，沒有留下任何聯絡方式。"
                }
            },
            {
                label: "拒絕，保持警惕",
                action: "advance_chain",
                rewards: {
                    exp: 8,
                    tags: ["met_benefactor", "cautious"],
                    varOps: [{ key: 'trust', val: -5, op: '+' }]
                },
                nextScene: {
                    zh: "你婉拒了。對方沒有強求，只是點了點頭，轉身離開。<br>" +
                        "也許是對的選擇——也許你失去了某個機會。"
                }
            },
            {
                label: {
                    zh: "接受，但先問來歷",
                    jp: "受け取るが先に素性を聞く",
                    kr: "받되 먼저 출처를 묻다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    energy: 20,
                    gold: 15,
                    exp: 25,
                    tags: ["met_benefactor", "has_testimony"],
                    varOps: [{ key: 'trust', val: 8, op: '+' }]
                },
                nextScene: {
                    zh: "對方猶豫了片刻，說出了一個名字——或者一個地點。<br>" +
                        "這條線索可能在之後派上用場。"
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
            text: { zh:
                "{combo_person_appearance}，對方{state_modifier}。<br><br>" +
                "「我有你需要的東西。但我也需要你的幫助。」<br><br>" +
                "{env_pack_sensory}"
            }
        }],
        options: [
            {
                label: "聽聽看對方想要什麼",
                action: "advance_chain",
                rewards: {
                    exp: 10,
                    varOps: [{ key: 'trust', val: 3, op: '+' }]
                },
                nextScene: {
                    zh: "對方開出的條件是：幫他帶走{combo_item_simple}，或者打探某人的下落。<br>" +
                        "作為回報，他給了你一些補給，還透露了一條你不知道的路線。"
                }
            },
            {
                label: "直接拒絕，不想牽扯",
                action: "advance_chain",
                rewards: { exp: 5, tags: ["cautious"] }
            },
            {
                label: {
                    zh: "花金幣解決一切",
                    jp: "金貨で全て解決する",
                    kr: "금화로 모두 해결하다"
                },
                condition: { vars: [{ key: 'gold', val: 20, op: '>=' }] },
                action: "advance_chain",
                rewards: {
                    gold: -20,
                    energy: 20,
                    exp: 15,
                    tags: ["item_found"],
                    varOps: [{ key: 'trust', val: 5, op: '+' }]
                },
                nextScene: {
                    zh: "金幣讓對話變得簡單許多。<br>" +
                        "對方收下金幣，給了你{combo_item_simple}，沒有多說什麼。"
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
            text: { zh:
                "{phrase_explore_start}<br><br>" +
                "{trap_warning}<br><br>" +
                "你在正式踏進去之前停住了腳步。直覺告訴你：不要莽撞。"
            }
        }],
        options: [
            {
                label: "繞道，避開這個區域",
                action: "advance_chain",
                rewards: { exp: 8, energy: -3 }
            },
            {
                label: {
                    zh: "嘗試拆除機關",
                    jp: "罠を解除しようとする",
                    kr: "함정을 해제하려 하다"
                },
                check: { stat: 'INT', val: 6 },
                action: "advance_chain",
                rewards: {
                    gold: 25,
                    exp: 30,
                    tags: ["puzzle_solved", "item_found"]
                },
                nextScene: {
                    zh: "你花了一些時間，成功拆除了機關。<br><br>" +
                        "機關之後是{hidden_space_desc}——裡面有{combo_item_desc}"
                }
            },
            {
                label: {
                    zh: "硬闖，賭自己夠快",
                    jp: "強行突破。速さに賭ける",
                    kr: "강행 돌파. 속도에 걸다"
                },
                check: { stat: 'AGI', val: 7 },
                action: "advance_chain",
                rewards: {
                    gold: 20,
                    exp: 20,
                    tags: ["item_found"]
                },
                nextScene: {
                    zh: "你賭對了。機關啟動的瞬間你已經滾過去了。<br>" +
                        "對面放著{combo_item_simple}，值得。"
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
            text: { zh:
                "{phrase_explore_start}<br><br>" +
                "太晚了。腳底傳來一聲悶響，某個東西被你踩動了。<br><br>" +
                "{sentence_tension}"
            }
        }],
        options: [
            {
                label: {
                    zh: "立刻衝刺，快速脫離",
                    jp: "即座に走り出し素早く離脱する",
                    kr: "즉시 전력질주로 빠르게 이탈하다"
                },
                check: { stat: 'AGI', val: 5 },
                action: "advance_chain",
                rewards: {
                    energy: -8,
                    exp: 20
                },
                nextScene: {
                    zh: "你反應夠快，機關射出的東西只擦過了你的衣袖。<br>" +
                        "喘了幾口氣，繼續。"
                }
            },
            {
                label: {
                    zh: "趴倒，降低暴露面積",
                    jp: "伏せて被弾面積を減らす",
                    kr: "엎드려 피탄 면적을 줄이다"
                },
                check: { stat: 'STR', val: 4 },
                action: "advance_chain",
                rewards: {
                    energy: -12,
                    exp: 15
                },
                nextScene: {
                    zh: "機關啟動了，但你及時壓低身體，只受了輕傷。<br>" +
                        "代價是精力和一點自尊。"
                }
            },
            {
                label: "完全沒反應過來",
                action: "advance_chain",
                rewards: {
                    energy: -20,
                    varOps: [{ key: 'curse_val', val: 10, op: '+' }]
                },
                nextScene: {
                    zh: "機關完整地砸在你身上。<br>" +
                        "你爬起來，渾身疼痛，繼續——沒有其他選項。"
                }
            }
        ]
    });


    // ════════════════════════════════════════════════════════════════
    // 🌀 類型五：環境異象（不明訊號 / 奇怪的發現）
    // 無直接衝突，但給玩家信息與選擇
    // ════════════════════════════════════════════════════════════════

    // ── U-E01：環境給出訊號 ─────────────────────────────────────
    DB.templates.push({
        id: 'univ_env_signal',
        type: 'middle',
        reqTags: [],
        weight: 1,
        dialogue: [{
            text: { zh:
                "{env_pack_visual}<br><br>" +
                "{hidden_space_desc}<br><br>" +
                "你停下來，確認自己沒有看錯。這個細節不尋常。"
            }
        }],
        options: [
            {
                label: "深入調查（INT）",
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                rewards: {
                    gold: 20,
                    exp: 25,
                    tags: ["observed", "item_found"]
                },
                nextScene: {
                    zh: "調查之後，你發現了{combo_item_desc}<br><br>" +
                        "這個地方曾經有人在此停留，也許比你早，也許為了等你。"
                }
            },
            {
                label: "記下來，先繼續前進",
                action: "advance_chain",
                rewards: {
                    exp: 12,
                    tags: ["observed"]
                }
            },
            {
                label: "感覺不對，離開這裡",
                action: "advance_chain",
                rewards: {
                    energy: 5,
                    tags: ["cautious"]
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
            text: { zh:
                "在{supply_source}，你發現了某人曾在此停留的痕跡。<br><br>" +
                "地上有一個{combo_item_simple}，旁邊還有幾個{env_adj}的腳印。<br><br>" +
                "{env_pack_sensory}"
            }
        }],
        options: [
            {
                label: "帶走那個物品",
                action: "advance_chain",
                rewards: {
                    gold: 15,
                    exp: 10,
                    tags: ["item_found"]
                },
                nextScene: {
                    zh: "{item_use_effect}<br><br>你不知道它的主人去了哪裡。"
                }
            },
            {
                label: {
                    zh: "沿著腳印追蹤",
                    jp: "足跡をたどって追跡する",
                    kr: "발자국을 따라 추적하다"
                },
                check: { stat: 'INT', val: 4 },
                action: "advance_chain",
                rewards: {
                    exp: 20,
                    gold: 10,
                    tags: ["has_testimony", "observed"]
                },
                nextScene: {
                    zh: "腳印引導你找到了另一處藏物點。<br>" +
                        "裡面還有一些補給和{combo_item_simple}。"
                }
            },
            {
                label: "不碰——這可能是現場",
                action: "advance_chain",
                rewards: {
                    exp: 8,
                    tags: ["cautious"]
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
            text: { zh:
                "在{env_feature}，你發現了一個沉甸甸的小袋子。<br><br>" +
                "裡面是金幣。不少。沒有任何標記，不知是誰的。<br><br>" +
                "{sentence_tension}"
            }
        }],
        options: [
            {
                label: "直接收進口袋",
                action: "advance_chain",
                rewards: {
                    gold: 50,
                    tags: ["took_suspicious_gold"]
                }
            },
            {
                label: {
                    zh: "拿一半，留下另一半",
                    jp: "半分取って残りは置く",
                    kr: "절반만 가져가고 나머지는 두다"
                },
                action: "advance_chain",
                rewards: {
                    gold: 25,
                    exp: 15,
                    tags: ["took_suspicious_gold"]
                },
                nextScene: {
                    zh: "你取了一半。<br>也許這是測試，也許只是運氣。至少你沒有全拿。"
                }
            },
            {
                label: "不碰，繼續前進",
                action: "advance_chain",
                rewards: {
                    exp: 20,
                    energy: 5,
                    tags: ["took_suspicious_gold"]
                },
                nextScene: {
                    zh: "你沒有動它。<br>某種程度上，這個決定比金幣本身更值錢。"
                }
            }
        ]
    });

    // ── U-G02：賭注（高風險高報酬）──────────────────────────────
    DB.templates.push({
        id: 'univ_gold_gamble',
        type: 'middle',
        reqTags: [],
        condition: { vars: [{ key: 'gold', val: 20, op: '>=' }] },
        weight: 1,
        dialogue: [{
            text: { zh:
                "{combo_person_appearance}，手中的骰子在{env_light}下閃著光。<br><br>" +
                "「賭一把？你出二十，我出四十。<br>」猜對了就翻倍，猜錯了⋯⋯那就各憑本事。」"
            }
        }],
        options: [
            {
                label: {
                    zh: "賭一把，花20金幣",
                    jp: "賭ける。金貨20枚",
                    kr: "도박. 금화 20개"
                },
                check: { stat: 'LCK', val: 5 },
                condition: { vars: [{ key: 'gold', val: 20, op: '>=' }] },
                action: "advance_chain",
                rewards: { gold: 40, exp: 15 },
                nextScene: {
                    zh: "你贏了。對方爽快地給出了四十枚金幣，沒有耍賴。<br>" +
                        "「運氣不錯。」他說，眼神帶著一絲複雜的意味。"
                }
            },
            {
                label: {
                    zh: "賭一把，但輸了",
                    jp: "賭けたが負けた",
                    kr: "도박했지만 졌다"
                },
                check: { stat: 'LCK', val: 5 },
                condition: { vars: [{ key: 'gold', val: 20, op: '>=' }] },
                action: "advance_chain",
                rewards: { gold: -20 },
                nextScene: {
                    zh: "你輸了。二十枚金幣就這樣換了個主人。<br>" +
                        "對方拍了拍你的肩膀。「下次。」"
                }
            },
            {
                label: "不賭，繼續前進",
                action: "advance_chain",
                rewards: { exp: 8 }
            }
        ]
    });


    // ════════════════════════════════════════════════════════════════
    // 🔮 類型七：神秘符文 / 古老文字（解謎 + 精力恢復或道具）
    // 低調版的學習鉤，不涉及 learning 標籤
    // ════════════════════════════════════════════════════════════════

    // ── U-M01：壁刻文字（解讀後恢復 + 獎勵）────────────────────
    DB.templates.push({
        id: 'univ_mystery_inscription',
        type: 'middle',
        reqTags: [],
        excludeTags: ['read_inscription'],
        weight: 1,
        dialogue: [{
            text: { zh:
                "{env_pack_visual}<br><br>" +
                "牆上有一段刻字，筆跡古老，語言也不像你熟悉的文字。<br><br>" +
                "字跡中夾雜著幾個符號——你隱約感覺它有意義。"
            }
        }],
        options: [
            {
                label: "嘗試解讀（INT）",
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                rewards: {
                    energy: 10,
                    exp: 25,
                    gold: 15,
                    tags: ["read_inscription", "knowledge_found"]
                },
                nextScene: {
                    zh: "你花了一些時間，拼湊出大意——這段文字描述了一種古老的儀式，<br>" +
                        "或者說，一個出口的方向。某些東西在腦海中鬆動了。"
                }
            },
            {
                label: "拓印下來，之後再研究",
                action: "advance_chain",
                rewards: {
                    exp: 12,
                    tags: ["read_inscription"]
                }
            },
            {
                label: "忽略，繼續前進",
                action: "advance_chain",
                rewards: { energy: 3 }
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
            text: { zh:
                "前方出現了三條路。<br><br>" +
                "左邊：{env_pack_visual}<br>" +
                "右邊：{env_pack_sensory}<br>" +
                "中間：{hidden_space_desc}<br><br>" +
                "你只能選一條。"
            }
        }],
        options: [
            {
                label: "走左邊（視覺引導）",
                action: "advance_chain",
                rewards: {
                    energy: 5,
                    exp: 10,
                    tags: ["took_left_path"]
                }
            },
            {
                label: "走右邊（感官引導）",
                action: "advance_chain",
                rewards: {
                    gold: 10,
                    exp: 10,
                    tags: ["took_right_path"]
                }
            },
            {
                label: "走中間（直覺）",
                action: "advance_chain",
                rewards: {
                    energy: 10,
                    gold: 15,
                    exp: 15,
                    tags: ["took_middle_path"]
                },
                nextScene: {
                    zh: "中間的路沒有地圖，只有你的直覺。<br>" +
                        "但有時候，直覺比任何指引都準確。"
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
            text: { zh:
                "前方的路被封死了。你必須原路折返。<br><br>" +
                "{rest_activity}<br><br>" +
                "回頭的路上，你注意到了一個之前錯過的細節——{hidden_space_desc}"
            }
        }],
        options: [
            {
                label: "停下來調查",
                action: "advance_chain",
                rewards: {
                    gold: 20,
                    energy: 10,
                    exp: 15,
                    tags: ["did_backtrack", "observed"]
                },
                nextScene: {
                    zh: "這次的折返讓你多了{combo_item_simple}。<br>" +
                        "走錯路，有時候也有意外的收穫。"
                }
            },
            {
                label: "繼續往回走，不停",
                action: "advance_chain",
                rewards: {
                    energy: -5,
                    exp: 8,
                    tags: ["did_backtrack"]
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
            text: { zh:
                "你不能停太久。但你必須停一下。<br><br>" +
                "{rest_activity}<br><br>" +
                "幾秒鐘的靜止，讓你意識到：你還活著。這已經比你預期的好。"
            }
        }],
        options: [
            {
                label: "盡快回復，繼續",
                action: "advance_chain",
                rewards: {
                    energy: 12,
                    exp: 10
                }
            },
            {
                label: {
                    zh: "搜查這個角落",
                    jp: "この隅を調べる",
                    kr: "이 구석을 조사하다"
                },
                check: { stat: 'INT', val: 5 },
                action: "advance_chain",
                rewards: {
                    energy: 12,
                    gold: 20,
                    exp: 20,
                    tags: ["item_found"]
                },
                nextScene: {
                    zh: "在緊張中維持觀察力，你看到了{hidden_space_desc}<br><br>" +
                        "裡面有{combo_item_simple}。高壓下的冷靜給了你報酬。"
                }
            }
        ]
    });

    // ── U-H02：risk_high 下的關鍵道具出現機率提升 ───────────────
    DB.templates.push({
        id: 'univ_risk_key_item_drop',
        type: 'middle',
        reqTags: ['risk_high'],
        excludeTags: ['found_risk_item'],
        weight: 2,
        dialogue: [{
            text: { zh:
                "混亂之中，你踢到了什麼東西。<br><br>" +
                "低頭一看——是{combo_item_desc}<br><br>" +
                "{item_use_effect}"
            }
        }],
        options: [
            {
                label: "撿起來，繼續跑",
                action: "advance_chain",
                rewards: {
                    gold: 20,
                    energy: 10,
                    tags: ["found_risk_item", "item_found"]
                }
            },
            {
                label: "沒空管它——太危險了",
                action: "advance_chain",
                rewards: {
                    energy: 5,
                    exp: 8,
                    tags: ["found_risk_item"]
                }
            }
        ]
    });


    const univCount = DB.templates.filter(t => t.id && t.id.startsWith('univ_')).length;
    console.log(`✅ data_piece_universal.js V1.0 已載入`);
	})();