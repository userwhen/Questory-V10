/* js/modules/story_generator_skeletons.js - V84.0 (獨立模組)
 * 職責：劇本骨架定義（Skeletons）+ 流程建構器（buildUnifiedFlow）
 * 說明：只存放「資料」與「結構配置」，不含任何執行邏輯
 *        未來要新增劇本類型，只需在這個檔案的 skeletons 裡加入即可
 * 載入順序：story_generator_skeletons → story_generator_core → story_generator_filters
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};

window.SQ.Engine.Generator = {

    // ============================================================
    // 系統字典（內部翻譯用）
    // ============================================================
    _sysDict: {
        investigate:    { zh: "調查" },
        explore_deeper: { zh: "繼續深入" },
        finish:         { zh: "完成" },
        next:           { zh: "繼續" },
        tension_high:   { zh: "感覺氣氛越來越凝重..." },
        tension_climax: { zh: "決戰時刻到了！" }
    },
    _t: function(k, l) {
        return (this._sysDict[k] && this._sysDict[k][l]) || this._sysDict[k]?.zh || k;
    },

    // ============================================================
    // 流程建構器
    // ============================================================
    buildUnifiedFlow: function(skel) {
        let finalFlow = ['start'];
        const flow = skel.flow || { isSequential: false, minMiddle: 3, maxMiddle: 3 };

        if (flow.isSequential) {
            // 線性模式（戀愛、養成）
            finalFlow.push('middle', 'middle', 'adv');
        } else {
            // 箱庭模式（懸疑、恐怖、冒險）
            let min = flow.minMiddle || 3;
            let max = flow.maxMiddle || 3;
            let middleCount = min + Math.floor(Math.random() * (max - min + 1));
            for (let i = 0; i < middleCount; i++) finalFlow.push('middle');
        }

        finalFlow.push('climax', 'end');
        return finalFlow;
    },

    // ============================================================
    // 全域種子（每局開始時抽取，所有骨架共用）
    // ============================================================
    globalSeeds: {
        player_trait: "global_player_trait",
        world_vibe:   "global_world_vibe",
        env_building: "env_building",
        play_mode:    "global_play_mode"
    },

    // ============================================================
    // 劇本骨架（Skeletons）
    // 新增類型：在這裡加一個 key，其他引擎邏輯自動支援
    // ============================================================
    skeletons: {
        'mystery': {
            tensionName: "暴露度",
            seeds: {
                weather:       "env_weather",
                atmosphere:    "env_atmosphere",
                true_culprit:  "core_identity",     // 開局鎖死兇手
                murder_weapon: "combo_item_simple"  // 開局鎖死凶器
            },
            actors: [
                { key: 'detective', pool: 'core_identity', tags: ['human', 'mystery'] },
                { key: 'victim',    pool: 'core_identity', tags: ['human', 'mystery'] },
                { key: 'suspect_A', pool: 'core_identity', tags: ['human', 'mystery'] },
                { key: 'suspect_B', pool: 'core_identity', tags: ['human', 'mystery'] }
            ],
            flow: { isSequential: false, minMiddle: 3, maxMiddle: 3 }
        },
        'horror': {
            tensionName: "恐懼值",
            seeds: {
                weather:    "env_weather",
                curse_type: "horror_curse_type"
            },
            actors: [
                { key: 'survivor', pool: 'core_identity', tags: ['human'] },
                { key: 'monster',  pool: 'core_identity', tags: ['monster'] }
            ],
            flow: { isSequential: false, minMiddle: 3, maxMiddle: 4 }
        },
        'adventure': {
            tensionName: "危險級別",
            seeds: {
                world_state: "adventure_world_state",
                start_bonus: "adventure_start_bonus"
            },
            actors: [
                { key: 'hero', pool: 'core_identity', tags: ['human'] },
                { key: 'boss', pool: 'core_identity', tags: ['monster', 'boss'] }
            ],
            flow: { isSequential: false, minMiddle: 3, maxMiddle: 5 }
        },
        'romance': {
            tensionName: "流言蜚語",
            seeds: { meet_location: "romance_meet_location" },
            actors: [
                { key: 'lover', pool: 'core_identity', tags: ['human', 'romance'] },
                { key: 'rival', pool: 'core_identity', tags: ['human', 'romance'] }
            ],
            flow: { isSequential: true }
        },
        'raising': {
            tensionName: "壓力值",
            actors: [
                { key: 'trainee', pool: 'core_identity', tags: ['is_trainee'] },
                { key: 'mentor',  pool: 'core_identity', tags: ['human', 'mentor'] },
                { key: 'rival',   pool: 'core_identity', tags: ['human'] }
            ],
            flow: { isSequential: true }
        }
    },
};

window.StoryGenerator = window.SQ.Engine.Generator; // 向下相容別名