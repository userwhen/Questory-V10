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
                    label: "仔細調查 (INT檢定)", 
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
        })
    );

    console.log("✅ data_piece.js 已升級為 V8.1 極簡動態版（9 個母模板）");
})();