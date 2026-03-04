/* js/modules/story_generator_core.js - V84.0 (獨立模組)
 * 職責：劇本鏈初始化（initChain）、下一層生成（generate）、
 *        文法展開器（_expandGrammar）、模板填充（fillTemplate）
 * 依賴：story_generator_skeletons.js (主物件必須已存在)
 * 載入順序：story_generator_skeletons → story_generator_core → story_generator_filters
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Generator = window.SQ.Engine.Generator || {};

Object.assign(window.SQ.Engine.Generator, {

    // ============================================================
    // 3. 啟動新冒險 (initChain)
    // ============================================================
    initChain: function(skeletonKey = null, themeTag = null) {

        // 1. 決定骨架
        let selectedSkeleton = skeletonKey;
        if (!selectedSkeleton || !this.skeletons[selectedSkeleton]) {
            const keys = Object.keys(this.skeletons);
            selectedSkeleton = keys[Math.floor(Math.random() * keys.length)];
        }

        const skel    = this.skeletons[selectedSkeleton];
        let mainTag   = themeTag || selectedSkeleton;
        let initialTags = [];
        let memory    = {};

        // 2. 抽全域種子
        if (this.globalSeeds) {
            for (let [key, options] of Object.entries(this.globalSeeds)) {
                let pool = options;
                if (typeof options === 'string' && window.FragmentDB && window.FragmentDB.fragments[options]) {
                    pool = window.FragmentDB.fragments[options];
                }
                if (Array.isArray(pool) && pool.length > 0) {
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    if (pick && typeof pick === 'object') {
                        if (pick.tag)  initialTags.push(...(Array.isArray(pick.tag)  ? pick.tag  : [pick.tag]));
                        if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));
                        memory[key] = pick.val;
                    } else {
                        memory[key] = pick;
                    }
                }
            }
        }

        initialTags.push(mainTag);
        initialTags.push(`struct_${selectedSkeleton}`);
        console.log(`🎬 引擎啟動 | 結構: [${selectedSkeleton}] | 風格: [${mainTag}]`);

        // 3. 抽骨架專屬種子（Bake 烤死）
        if (skel.seeds) {
            for (let [key, options] of Object.entries(skel.seeds)) {
                let pool = options;
                if (typeof options === 'string' && window.FragmentDB && window.FragmentDB.fragments[options]) {
                    pool = window.FragmentDB.fragments[options];
                }
                if (Array.isArray(pool) && pool.length > 0) {
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    let val;
                    if (pick && typeof pick === 'object' && pick.val) {
                        if (pick.tag)  initialTags.push(...(Array.isArray(pick.tag)  ? pick.tag  : [pick.tag]));
                        if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));
                        val = pick.val.zh || pick.val;
                    } else {
                        val = pick;
                    }
                    if (typeof val === 'string' && val.includes('{')) {
                        val = this._expandGrammar(val, window.FragmentDB, memory, 0, initialTags);
                    }
                    memory[key] = val;
                }
            }
        }

        // 4. 抽角色（Actors）
        if (skel.actors && window.FragmentDB) {
            skel.actors.forEach(actorDef => {
                let roleKey      = typeof actorDef === 'string' ? actorDef : actorDef.key;
                let poolName     = typeof actorDef === 'string' ? actorDef : (actorDef.pool || 'core_identity');
                let requiredTags = typeof actorDef === 'string' ? [] : (actorDef.tags || []);

                let pool = window.FragmentDB.fragments[poolName] || [];
                if (pool.length > 0) {
                    let validPool = pool;
                    if (requiredTags.length > 0) {
                        validPool = pool.filter(item => {
                            let itemTags = [];
                            if (item.tag)  itemTags.push(...(Array.isArray(item.tag)  ? item.tag  : [item.tag]));
                            if (item.tags) itemTags.push(...(Array.isArray(item.tags) ? item.tags : [item.tags]));
                            return requiredTags.every(t => itemTags.includes(t));
                        });
                    }
                    if (validPool.length === 0) validPool = pool;

                    const pick = validPool[Math.floor(Math.random() * validPool.length)];
                    let val    = pick.val.zh || pick.val;
                    if (val.includes('{')) val = this._expandGrammar(val, window.FragmentDB, memory, 0, initialTags);

                    if (pick.tag)  initialTags.push(...(Array.isArray(pick.tag)  ? pick.tag  : [pick.tag]));
                    if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));

                    memory[roleKey] = val;
                    console.log(`👤 抽出角色 [${roleKey}]: ${val}`);
                } else {
                    memory[roleKey] = "神祕人";
                }
            });
        }

        // 5. 生成流程
        let dynamicStages = this.buildUnifiedFlow(skel);
        console.log(`🎬 Director: Skeleton [${selectedSkeleton}], Seeds:`, memory, `Flow:`, dynamicStages);

        return {
            skeleton:       selectedSkeleton,
            theme:          mainTag,
            depth:          0,
            maxDepth:       dynamicStages.length,
            stages:         dynamicStages,
            currentStageIdx: 0,
            tensionName:    skel.tensionName || "張力值",
            memory:         memory,
            history:        [],
            tags:           initialTags
        };
    },

    // ============================================================
    // 4. 生成下一層 (generate)
    // ============================================================
    generate: function(contextTags = [], isStart = false) {
        const gs = window.SQ.State;

        if (!gs.story.chain || !gs.story.chain.stages) {
            console.log("🔄 Generator: 偵測到無鏈結，自動隨機初始化...");
            gs.story.chain = this.initChain();
        } else if (isStart) {
            gs.story.chain.currentStageIdx = 0;
            gs.story.chain.depth = 0;
            console.log(`▶️ Generator: 確認開始執行 [${gs.story.chain.skeleton}] 劇本...`);
        }

        const chain = gs.story.chain;

        if (contextTags.length > 0) {
            chain.tags = [...new Set([...chain.tags, ...contextTags])];
        }

        const playerTags = (gs.story && gs.story.tags) ? gs.story.tags : [];
        const mergedTags = [...new Set([...chain.tags, ...playerTags])];

        if (chain.currentStageIdx >= chain.stages.length) return null;

        let targetType = chain.stages[chain.currentStageIdx];

        const currentStats = {
            ...(gs.attrs || {}),
            ...(gs.story && gs.story.vars ? gs.story.vars : {})
        };

        const template = this.pickTemplate(targetType, mergedTags, chain.history, currentStats, chain);
        const lang     = gs.settings?.targetLang || 'zh';

        if (!template) {
            console.error(`❌ 無法生成劇本: Type=${targetType}`);
            return {
                id: `err_${Date.now()}`,
                text: "（系統錯誤：迷霧太濃...找不到符合條件的劇本）",
                options: [{ label: "強制結束", action: "finish_chain" }]
            };
        }

        if (template.id) {
            chain.history.push(template.id);
            if (chain.history.length > 10) chain.history.shift(); // HUB 迴圈：最近 10 筆
        }

        const filledData = this.fillTemplate(template, lang, chain.memory, chain.tags);

        const updatedPlayerTags = (gs.story && gs.story.tags) ? gs.story.tags : [];
        const finalMergedTags   = [...new Set([...chain.tags, ...updatedPlayerTags])];
        console.log("🕵️ 當前場景標籤 ->", finalMergedTags);

        const opts = this.generateOptions(template, filledData.fragments, lang, targetType, finalMergedTags, currentStats);

        chain.currentStageIdx++;
        chain.depth++;

        return {
            id:       template.id || `gen_${Date.now()}`,
            type:     targetType,
            text:     filledData.text[0],
            dialogue: filledData.dialogue,
            options:  opts,
            rewards:  filledData.rewards,
            onEnter:  template.onEnter
        };
    },

    // ============================================================
    // 5. 文法展開器（_expandGrammar）
    // ============================================================
    _expandGrammar: function(text, db, memory, depth = 0, collectedTags = null) {
        if (!text) return "";
        if (depth > 10) return text;

        return text.replace(/{(\w+)}/g, (match, key) => {
            // 優先：記憶庫
            if (memory && memory[key]) {
                let val = memory[key];
                if (typeof val === 'string' && val.includes('{')) {
                    return this._expandGrammar(val, db, memory, depth + 1, collectedTags);
                }
                return val;
            }

            // 次優：詞庫碎片
            if (db.fragments[key]) {
                const list = db.fragments[key];
                if (list.length > 0) {
                    const pick = list[Math.floor(Math.random() * list.length)];
                    let val    = pick.val.zh || pick.val;

                    // 標籤注入
                    if (collectedTags) {
                        if (pick.tag)  Array.isArray(pick.tag)  ? collectedTags.push(...pick.tag)  : collectedTags.push(pick.tag);
                        if (pick.tags) Array.isArray(pick.tags) ? collectedTags.push(...pick.tags) : collectedTags.push(pick.tags);
                    }

                    if (val.includes('{')) {
                        return this._expandGrammar(val, db, memory, depth + 1, collectedTags);
                    }
                    return val;
                }
            }
            return match;
        });
    },

    // ============================================================
    // 6. 模板填充（fillTemplate）
    // ============================================================
    fillTemplate: function(tmpl, lang, memory, collectedTags = null) {
        const db = window.FragmentDB;

        // 主文本
        let finalTxT   = "";
        let rawTextArr = [];
        if (tmpl.text) {
            if (typeof tmpl.text === 'string')      rawTextArr.push(tmpl.text);
            else if (Array.isArray(tmpl.text))       rawTextArr = tmpl.text;
            else {
                let t = tmpl.text[lang] || tmpl.text['zh'] || "";
                if (typeof t === 'string') rawTextArr.push(t);
                else if (Array.isArray(t)) rawTextArr = t;
            }
            finalTxT = rawTextArr.map(t => this._expandGrammar(t, db, memory, 0, collectedTags)).join('<br><br>');
        }

        // 對話
        let dialogueArr = null;
        if (tmpl.dialogue) {
            dialogueArr = tmpl.dialogue.map(d => {
                let rawDiagText = "";
                if (d && d.text) {
                    rawDiagText = typeof d.text === 'string' ? d.text : (d.text[lang] || d.text['zh'] || '');
                }
                let speakerName = (d && d.speaker) ? d.speaker : "旁白";
                return {
                    speaker: this._expandGrammar(speakerName, db, memory, 0, collectedTags),
                    text:    this._expandGrammar(rawDiagText, db, memory, 0, collectedTags)
                };
            });
        }

        // 獎勵
        let newRewards = tmpl.rewards ? JSON.parse(JSON.stringify(tmpl.rewards)) : undefined;
        if (newRewards && newRewards.tags) {
            newRewards.tags = newRewards.tags.map(t => this._expandGrammar(t, db, memory, 0, collectedTags));
        }

        return {
            text:      finalTxT ? [finalTxT] : [],
            dialogue:  dialogueArr,
            fragments: {},
            rewards:   newRewards
        };
    },
});
