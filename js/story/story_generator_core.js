/* js/modules/story_generator_core.js - V85.0 (情境感知升級版)
 * 核心升級：加入 pickByContext 情境感知選擇器
 *   - _expandGrammar 現在根據當前 tags 加權選詞，而非純隨機
 *   - 同主題 tag 越多的詞條，被選中機率越高
 *   - 不符合 reqTags 的詞條直接過濾掉（不會出現在錯誤氣氛的場景）
 *   - 其他邏輯完全不變，向下相容
 *
 * 依賴：story_generator_skeletons.js
 * 載入順序：story_generator_skeletons → story_generator_core → story_generator_filters
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Generator = window.SQ.Engine.Generator || {};

Object.assign(window.SQ.Engine.Generator, {

    // ============================================================
    // 🌟 [新增] 情境感知選擇器 (pickByContext)
    // 用途：從詞庫中根據當前 contextTags 加權選出最合適的詞條
    // 原理：
    //   1. 過濾掉有 reqTags 但不符合當前情境的詞條
    //   2. 計算每個詞條與當前 tags 的匹配數，匹配越多權重越高
    //   3. 用加權隨機選出結果（保留隨機性，但偏向主題）
    // ============================================================
    pickByContext: function(fragmentKey, contextTags, db) {
        const pool = (db || window.FragmentDB).fragments[fragmentKey];
        if (!pool || pool.length === 0) return null;

        const ctx = Array.isArray(contextTags) ? contextTags : [];

        // Step 1: 過濾不符合 reqTags 的詞條
        const eligible = pool.filter(entry => {
            if (!entry.reqTags) return true;
            const req = Array.isArray(entry.reqTags) ? entry.reqTags : [entry.reqTags];
            return req.some(t => ctx.includes(t));
        });

        const finalPool = eligible.length > 0 ? eligible : pool;

        // Step 2: 計算加權
        const gs = window.SQ.State;
        const memory = (gs.story && gs.story.chain && gs.story.chain.memory) ? gs.story.chain.memory : {};
        
        const weighted = finalPool.map(entry => {
            let weight = 1;
            
            // 劇情標籤加權 (原有邏輯)
            const entryTags = [];
            if (entry.tag)  entryTags.push(...(Array.isArray(entry.tag)  ? entry.tag  : [entry.tag]));
            if (entry.tags) entryTags.push(...(Array.isArray(entry.tags) ? entry.tags : [entry.tags]));
            weight += entryTags.filter(t => ctx.includes(t)).length * 2;
            
            // 🌟 風味標籤加權 (新邏輯：比對 memory 中的 world_vibe_tag 或 env_weather_tag)
            if (entry.worldTag && (entry.worldTag === memory['world_vibe_tag'] || entry.worldTag === memory['global_world_vibe_tag'])) {
                weight += 3; // 風味相符，大幅增加抽中機率
            }
            if (entry.envTag && entry.envTag === memory['env_weather_tag']) {
                weight += 3;
            }

            return { entry, weight: weight };
        });

        // Step 3: 加權隨機
        const total = weighted.reduce((sum, x) => sum + x.weight, 0);
        let r = Math.random() * total;
        for (const { entry, weight } of weighted) {
            r -= weight;
            if (r <= 0) return entry;
        }
        return weighted[weighted.length - 1].entry;
    },

    // ============================================================
    // 3. 啟動新冒險 (initChain)
    // ============================================================
    initChain: function(skeletonKey = null, themeTag = null) {
        let memory = {};         // 👈 補上這行
        let initialTags = [];

        // 1. 決定骨架
        let selectedSkeleton = skeletonKey;
        if (!selectedSkeleton || !this.skeletons[selectedSkeleton]) {
            const keys = Object.keys(this.skeletons);
            selectedSkeleton = keys[Math.floor(Math.random() * keys.length)];
        }

        const skel    = this.skeletons[selectedSkeleton];
        let mainTag   = themeTag || selectedSkeleton;

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
                        // 🌟 修正：worldTag/envTag 只存進 memory，不推進 initialTags
                        if (pick.worldTag) memory[`${key}_worldTag`] = pick.worldTag;
                        if (pick.envTag)   memory[`${key}_envTag`]   = pick.envTag;
                        // 舊格式的 tag 欄位也不推進（防止污染）
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
                        // 🌟 修正：骨架種子的 tag 同樣只存 memory，不推進 initialTags
                        if (pick.worldTag) memory[`${key}_worldTag`] = pick.worldTag;
                        if (pick.envTag)   memory[`${key}_envTag`]   = pick.envTag;
                        // 舊格式的 tag 欄位不推進
                        val = pick.val.zh || pick.val;
                    } else {
                        val = pick;
                    }
                    if (typeof val === 'string' && val.includes('{')) {
                        val = this._expandGrammar(val, window.FragmentDB, memory, 0, null);
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
                    let validPool = pool.filter(item => {
                        // 1. 檢查 requiredTags (必須包含)
                        if (requiredTags.length > 0) {
                            let itemTags = [];
                            if (item.tag)  itemTags.push(...(Array.isArray(item.tag)  ? item.tag  : [item.tag]));
                            if (item.tags) itemTags.push(...(Array.isArray(item.tags) ? item.tags : [item.tags]));
                            if (!requiredTags.every(t => itemTags.includes(t))) return false;
                        }

                        // 2. 檢查 excludeTags (與當前世界種子 initialTags 衝突則排除)
                        let itemExcludeTags = [];
                        if (item.excludeTags) itemExcludeTags.push(...(Array.isArray(item.excludeTags) ? item.excludeTags : [item.excludeTags]));
                        if (itemExcludeTags.length > 0 && initialTags) {
                            if (itemExcludeTags.some(t => initialTags.includes(t))) return false;
                        }

                        return true;
                    });
                    
                    if (validPool.length === 0) validPool = pool;

                    const pick = validPool[Math.floor(Math.random() * validPool.length)];
                    let val    = pick.val.zh || pick.val;
                    if (val.includes('{')) val = this._expandGrammar(val, window.FragmentDB, memory, 0, null);

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

        let targetType;
		if (chain.currentStageIdx >= chain.stages.length - 2) {
			// 已到達 climax/end 的固定區段，照舊走
			targetType = chain.stages[chain.currentStageIdx];
		} else if (chain.currentStageIdx === 0) {
			targetType = 'start';
		} else {
			// 動態決定：計算進入 climax 的機率
			const tension = this._getTensionValue(chain);
			const baseClimaxChance = 0.15;                    // 基礎 15% 機率
			const depthBonus = chain.depth * 0.05;             // 每深一層 +5%
			const tensionBonus = tension >= 80 ? 0.4           // 高壓 +40%
							   : tension >= 50 ? 0.2 : 0;      // 中壓 +20%
			const climaxChance = Math.min(0.85, baseClimaxChance + depthBonus + tensionBonus);
			
			targetType = Math.random() < climaxChance ? 'climax' : 'middle';
			
			// 如果抽中 climax，把指針推到倒數第二格（確保接著是 end）
			if (targetType === 'climax') {
				chain.currentStageIdx = chain.stages.length - 2;
			}
		}

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
            if (chain.history.length > 10) chain.history.shift();
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
	_getTensionValue: function(chain) {
    const vars = (window.SQ.State && window.SQ.State.story && window.SQ.State.story.vars) || {};
    const tensionKey = {
        horror:    'curse_val',
        mystery:   'tension',
        romance:   'pressure',
        raising:   'stress',
        adventure: 'skill_points'  // adventure 反向，另外處理
    }[chain.skeleton] || 'curse_val';
    return Number(vars[tensionKey]) || 0;
},

    // ============================================================
    // 5. 文法展開器（_expandGrammar）- V85 情境感知升級版
    // 
    // 改動說明：
    //   - 原版：從詞庫中純隨機抽取
    //   - 新版：呼叫 pickByContext，根據 collectedTags 加權選取
    //   - 效果：horror 場景下 {env_sound} 大概率出「淒厲的尖叫聲」
    //           mystery 場景下 {env_room} 大概率出「書房」「密室」
    //           romance 場景下 {env_sound} 大概率出「遠處傳來的鐘聲」
    //   - 向下相容：collectedTags 為空時退化為純隨機（行為不變）
    // ============================================================
    _expandGrammar: function(text, db, memory, depth = 0, collectedTags = null) {
        if (!text) return "";
        if (depth > 10) return text; // 這裡的 depth 是防無限迴圈的層數，不是遊戲天數

        // 🌟 抓取當前遊戲的真實推進天數/步數
        const gs = window.SQ.State;
        const chainDepth = (gs && gs.story && gs.story.chain && gs.story.chain.depth) ? gs.story.chain.depth : 1;

        return text.replace(/{(\w+)}/g, (match, key) => {
            // 🌟 系統內建變數攔截
            if (key === 'depth') return chainDepth;

            // 優先：記憶庫（烤死的值不受情境影響，保持一致性）
            if (memory && memory[key]) {
                let val = memory[key];
                if (typeof val === 'string' && val.includes('{')) {
                    return this._expandGrammar(val, db, memory, depth + 1, collectedTags);
                }
                return val;
            }

            // 次優：詞庫碎片（情境感知加權選取）
            if (db.fragments[key]) {
                const pick = this.pickByContext(key, collectedTags || [], db);
                if (!pick) return match;

                let val = (pick.val && typeof pick.val === 'object') ? (pick.val.zh || pick.val) : pick.val;
                if (!val) return match;

                // 標籤注入
                if (collectedTags) {
                    if (pick.tag)  Array.isArray(pick.tag)  ? collectedTags.push(...pick.tag)  : collectedTags.push(pick.tag);
                    if (pick.tags) Array.isArray(pick.tags) ? collectedTags.push(...pick.tags) : collectedTags.push(pick.tags);
                }

                if (typeof val === 'string' && val.includes('{')) {
                    // 這裡會把 depth + 1，代表進入了底層詞彙（如形容詞）的展開
                    val = this._expandGrammar(val, db, memory, depth + 1, collectedTags);
                }

                return val;
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