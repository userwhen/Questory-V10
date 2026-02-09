/* js/modules/story_generator.js - V79.0 (Smart Action & Auto-Button Fix) */

window.StoryGenerator = {
    // ============================================================
    // 1. 系統設定與字典
    // ============================================================
    _sysDict: { 
        investigate: { zh: "調查" }, 
        explore_deeper: { zh: "繼續深入" }, 
        finish: { zh: "完成" }, 
        next: { zh: "繼續" },
        tension_high: { zh: "感覺氣氛越來越凝重..." },
        tension_climax: { zh: "決戰時刻到了！" }
    },
    _t: function(k, l) { return (this._sysDict[k] && this._sysDict[k][l]) || this._sysDict[k]?.zh || k; },

    // ============================================================
    // 2. 劇本骨架定義 (Skeletons)
    // ============================================================
    skeletons: {
        'mystery': {
            stages: ['setup_crime', 'investigate', 'interrogate', 'deduction_moment', 'confrontation'],
            actors: ['detective', 'victim', 'suspect_A', 'suspect_B', 'killer'], 
            baseTension: 10
        },
        'horror': {
            stages: ['setup_omen', 'explore_eerie', 'encounter_monster', 'escape_chase', 'final_survival'],
            actors: ['survivor', 'monster', 'haunted_place'],
            baseTension: 20
        },
        'random': {
            stages: ['setup', 'event', 'event', 'event', 'boss'],
            actors: ['enemy'],
            baseTension: 0
        }
    },

    // ============================================================
    // 3. 啟動新冒險 (Start Chain)
    // ============================================================
    initChain: function(mode = 'random') {
        const skel = this.skeletons[mode] || this.skeletons['random'];
        
        const memory = {};
        if (skel.actors && window.FragmentDB) {
            skel.actors.forEach(role => {
                const pool = window.FragmentDB.fragments[role] || window.FragmentDB.fragments['npc_name'] || [{val:{zh:"神秘人"}}];
                const pick = pool[Math.floor(Math.random() * pool.length)];
                memory[role] = pick.val.zh || pick.val; 
            });
        }

        return {
            depth: 0,
            maxDepth: skel.stages.length, 
            skeletonKey: mode,
            stages: skel.stages,          
            tension: skel.baseTension,    
            memory: memory,               
            history: [],
            accumulatedTags: []
        };
    },

    // ============================================================
    // 4. 生成下一層 (Generate)
    // ============================================================
    generate: function(contextTags = [], isStart = false) {
        const gs = window.GlobalState;
        
        // 1. 初始化檢查
        if (!gs.story.chain || !gs.story.chain.stages || isStart) {
            console.log("🔄 L3 Generator: 初始化...");
            const modes = ['mystery', 'horror', 'random']; 
            const randomMode = modes[Math.floor(Math.random() * modes.length)];
            gs.story.chain = this.initChain(randomMode); 
        }

        const chain = gs.story.chain;
        let depth = chain.depth;
        
        // 2. 張力計算
        let tensionDelta = 10; 
        if (contextTags.includes('risk_high')) tensionDelta += 20;
        if (contextTags.includes('safe_spot')) tensionDelta -= 10;
        if (contextTags.includes('clue_found')) tensionDelta += 15; 
        
        chain.tension = Math.min(100, Math.max(0, (chain.tension || 0) + tensionDelta));
        console.log(`🎬 Director: Depth ${depth}, Tension ${chain.tension}%`);

        // 3. 決定目標類型
        let targetType = 'event'; 

        if (chain.tension >= 100 && depth > 2) {
            if (chain.stages && chain.stages.length > 0) {
                targetType = chain.stages[chain.stages.length - 1];
            } else {
                targetType = 'ending'; 
            }
            console.log(`🔥 Tension Overload! Director forcing jump to: ${targetType}`);
        } 
        else if (depth < chain.stages.length) {
            targetType = chain.stages[depth];
        } 
        else {
            targetType = 'ending';
        }

        // 4. 挑選模板
        const template = this.pickTemplate(targetType, contextTags, chain.history, chain.tension);
        const lang = gs.settings?.targetLang || 'zh';

        if (!template) {
            return {
                id: `fallback_${Date.now()}`, 
                text: `(導演找不到劇本: ${targetType}) \n你繼續在迷霧中前行...`, 
                options: [{ label: "離開", action: "finish_chain" }]
            };
        }

        if (template.id) {
            chain.history.push(template.id);
            if (chain.history.length > 4) chain.history.shift();
        }

        // 5. 填充內容
        const filledData = this.fillTemplate(template, lang, chain.memory);
        let finalText = filledData.text;

        // 6. 選項生成
        const opts = this.generateOptions(template, filledData.fragments, lang, targetType, chain.tension);
        
        return {
            id: `gen_${Date.now()}`, 
            text: finalText, 
            location: filledData.locationStr || "Mystery Scene",
            options: opts, 
            rewards: filledData.rewards
        };
    },

    // ============================================================
    // 5. 輔助函數
    // ============================================================
    pickTemplate: function(type, contextTags, history = [], currentTension) {
        const db = window.FragmentDB;
        if (!db || !db.templates) return null;
        const gs = window.GlobalState;
        const myTags = gs.story.tags || [];
        
        let candidates = db.templates.filter(t => t.type === type);
        
        candidates = candidates.filter(t => {
            if (t.reqTag && !myTags.includes(t.reqTag)) return false;
            if (t.noTag && myTags.includes(t.noTag)) return false;
            return true;
        });

        candidates = candidates.filter(t => {
            if (t.minTension && currentTension < t.minTension) return false;
            if (t.maxTension && currentTension > t.maxTension) return false;
            return true;
        });

        const available = candidates.filter(t => !t.id || !history.includes(t.id));
        const finalPool = available.length > 0 ? available : candidates;

        if (finalPool.length > 0) return finalPool[Math.floor(Math.random() * finalPool.length)];
        return null;
    },

    fillTemplate: function(tmpl, lang, memory) {
        const db = window.FragmentDB;
        let rawContent = tmpl.text[lang] || tmpl.text['zh'];
        let textArr = Array.isArray(rawContent) ? [...rawContent] : [rawContent];
        let chosenFragments = {};

        (tmpl.slots || []).forEach(key => {
            let word = "";
            if (memory && memory[key]) {
                 word = memory[key];
                 chosenFragments[key] = { val: { zh: word } }; 
            } 
            else {
                const list = db.fragments[key];
                if (list && list.length > 0) {
                    const item = list[Math.floor(Math.random() * list.length)];
                    word = item.val[lang] || item.val['zh'];
                    chosenFragments[key] = item;
                } else { 
                    word = `(${key}?)`; 
                }
            }
            textArr = textArr.map(line => line.replace(new RegExp(`{${key}}`, 'g'), word));
        });

        let newRewards = null;
        if (tmpl.rewards) {
            newRewards = JSON.parse(JSON.stringify(tmpl.rewards));
            if (newRewards.tags) {
                newRewards.tags = newRewards.tags.map(tag => {
                    return tag.replace(/{(\w+)}/g, (_, k) => memory[k] || k);
                });
            }
        }

        return { text: textArr, fragments: chosenFragments, rewards: newRewards || tmpl.rewards };
    },

    generateOptions: function(tmpl, fragments, lang, type, tension) {
        let opts = [];

        // [Fix] 只有當 options 陣列有內容時才使用，空陣列視為無選項
        if (tmpl.options && tmpl.options.length > 0) {
             return tmpl.options.map(o => {
                 let newRew = o.rewards ? JSON.parse(JSON.stringify(o.rewards)) : undefined;
                 if (newRew && newRew.tags) {
                     newRew.tags = newRew.tags.map(t => t.replace(/{(\w+)}/g, (_, k) => fragments[k]?.val?.zh || k));
                 }
                 
                 // [Critical Fix] 智能判斷：如果有 nextScene，動作必須是 node_next
                 // 這解決了偵探結局無限迴圈的問題
                 let defaultAction = (o.nextScene || o.nextSceneId) ? 'node_next' : 'advance_chain';
                 
                 return { 
                     ...o, 
                     action: o.action || defaultAction, 
                     rewards: newRew,
                 };
             });
        }
        
        // 自動生成按鈕 (Fallback)
        if (type === 'climax' || type === 'confrontation' || type === 'final_survival') {
            opts.push({ label: "決一死戰！", style: "danger", action: "finish_chain" }); 
        } else if (type === 'ending') {
            opts.push({ label: this._t('finish', lang), style: "primary", action: "finish_chain" });
        } else {
            opts.push({ 
                label: this._t('explore_deeper', lang), 
                action: "advance_chain",
                nextTags: ['risk_high'] 
            });
            opts.push({ 
                label: "小心前進", 
                action: "advance_chain",
                nextTags: ['safe_spot'] 
            });
        }
        return opts;
    }
};