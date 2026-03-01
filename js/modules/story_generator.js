/* js/modules/story_generator.js - V83.3 (Logic Fixed: Skeletons Included) */

window.StoryGenerator = {
    // ============================================================
    // 1. 系統核心設定
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

	buildUnifiedFlow: function(skel) {
        // 相容舊版：如果沒有設定 flow，就退回使用固定的 stages
        if (!skel.flow) return skel.stages || ['univ_filler']; 

        let finalFlow = [];
        const flow = skel.flow;
        
        // 1. 開頭 (Start)
        if (flow.start) finalFlow.push(...(Array.isArray(flow.start) ? flow.start : [flow.start]));

        // 2. 中間主線 (Middle) + 通用劇情 (univ_filler)
        let middleArr = flow.middle || [];
        
        if (flow.isSequential) {
            // 💖 【循序漸進模式】(適用：戀愛、養成)
            // 照著陣列順序走，但每個主線節點前，有 30% 機率插入通用劇情
            for (let i = 0; i < middleArr.length; i++) {
                if (Math.random() < 0.3) finalFlow.push('univ_filler');
                finalFlow.push(middleArr[i]);
            }
        } else {
            // ⚔️ 【隨機抽取模式】(適用：懸疑、冒險、恐怖)
            // 決定中間要跑幾回合
            let min = flow.minMiddle || 2;
            let max = flow.maxMiddle || 4;
            let middleCount = min + Math.floor(Math.random() * (max - min + 1));

            for (let i = 0; i < middleCount; i++) {
                // 30% 機率是通用碎片，70% 從中間主線池裡隨機抽
                if (Math.random() < 0.3) {
                    finalFlow.push('univ_filler');
                } else if (middleArr.length > 0) {
                    finalFlow.push(middleArr[Math.floor(Math.random() * middleArr.length)]);
                }
            }
        }

        // 3. 結尾 (End)
        if (flow.end) finalFlow.push(...(Array.isArray(flow.end) ? flow.end : [flow.end]));

        return finalFlow;
    },

    // ============================================================
    // 2. 劇本骨架定義 (Skeletons - 極致瘦身動態版)
    // ============================================================
	globalSeeds: {
        // 1. 玩家開局特質 (Player Traits)
        player_trait: "global_player_trait", 
        
        // 2. 世界底層氛圍 (World Atmosphere)
        world_vibe: "global_world_vibe",

        // 🌟 新增這行：讓每一次的冒險，都固定在一棟建築物裡！(例如永遠在工廠)
        env_building: "env_building" 
    },
    skeletons: {
        'mystery': {
            seeds: {
                weather: "env_weather",       // 👈 去詞庫抓天氣
                atmosphere: "env_atmosphere", // 👈 去詞庫抓氛圍
                motive: "mystery_motive"      // 👈 去詞庫抓動機
            },
            actors: [
                { key: 'detective', pool: 'core_identity', tags: ['human'] },
                { key: 'victim', pool: 'core_identity', tags: ['human'] },
                { key: 'suspect_A', pool: 'core_identity', tags: ['human'] },
                { key: 'suspect_B', pool: 'core_identity', tags: ['human'] }
            ], 
            baseTension: 10,
            flow: {
                isSequential: false,
                start: ['mystery_start'],
                middle: ['mystery_mid'], 
                adv: ['mystery_adv'],    
                end: ['mystery_climax', 'mystery_end'],
                minMiddle: 2, maxMiddle: 4 
            }
        },

        'horror': {
            seeds: {
                weather: "env_weather",         // 👈 天氣庫共用！(這就是正規化的好處)
                curse_type: "horror_curse_type" // 👈 專屬恐怖詞庫
            },
            actors: [
                { key: 'survivor', pool: 'core_identity', tags: ['human'] },
                { key: 'monster', pool: 'core_identity', tags: ['monster'] } // 👈 強制抽怪物
            ],
            baseTension: 30,
            flow: {
                isSequential: false, 
                start: ['horror_start'],
                middle: ['horror_mid'],
                adv: ['horror_adv'],    
                end: ['horror_climax', 'horror_end'], 
                minMiddle: 2, maxMiddle: 3
            }
        },

        'adventure': { 
            seeds: {
                world_state: "adventure_world_state",
                start_bonus: "adventure_start_bonus"
            },
			actors: [
                { key: 'hero', pool: 'core_identity', tags: ['human'] },
                { key: 'monster', pool: 'core_identity', tags: ['monster'] },
				{ key: 'boss', pool: 'core_identity', tags: ['monster'] }// 👈 強制抽怪物
            ],
            baseTension: 20,
            flow: {
                isSequential: false,
                start: ['adventure_start'],
                middle: ['adventure_mid'],
                adv: ['adventure_adv'],    
                end: ['adventure_climax', 'adventure_end'], 
                minMiddle: 3, maxMiddle: 5
            }
        },
        
        'romance': {
             seeds: {
                 meet_location: "romance_meet_location"
             },
			 actors: [
			 { key: 'lover', pool: 'core_identity', tags: ['human'] },
             { key: 'rival', pool: 'core_identity', tags: ['human'] },],
             baseTension: 5,
             flow: {
                 isSequential: true, 
                 start: ['romance_start'],
                 middle: ['romance_mid', 'romance_adv'], 
                 end: ['romance_climax', 'romance_end']  
             }
        },

        'raising': {
			actors: [
			 { key: 'humantrainee', pool: 'core_identity', tags: ['human'] },
			 { key: 'animaltrainee', pool: 'core_identity', tags: ['monster'] },
			 { key: 'mentor', pool: 'core_identity', tags: ['human'] },
             { key: 'rival', pool: 'core_identity', tags: ['human'] },],
             baseTension: 0,
             flow: {
                 isSequential: true, 
                 start: ['raising_start'],
                 middle: ['raising_mid', 'raising_adv'], 
                 end: ['raising_climax', 'raising_end']  
             }
        }
    },
    // ============================================================
    // 3. 啟動新冒險 (Start Chain)
    // ============================================================
    initChain: function(skeletonKey = null, themeTag = null) {
        
        // 1. 決定骨架 (Skeleton) - 這決定了「劇情的節奏與結構」
        let selectedSkeleton = skeletonKey;
        
        // 防呆：如果沒傳骨架，或骨架不存在，就隨機選一個
        if (!selectedSkeleton || !this.skeletons[selectedSkeleton]) {
            const keys = Object.keys(this.skeletons);
            selectedSkeleton = keys[Math.floor(Math.random() * keys.length)];
        }

        const skel = this.skeletons[selectedSkeleton];
        
        // 2. 決定風格 (Theme) - 這決定了「劇情的內容與文字」
        let mainTag = themeTag || selectedSkeleton;

        // 3. 初始化標籤
        let initialTags = [];
        let memory = {};

        // ==========================================
        // [New] 1. 先抽全域種子 (支援動態詞庫讀取)
        // ==========================================
        if (this.globalSeeds) {
            for (let [key, options] of Object.entries(this.globalSeeds)) {
                let pool = options;
                
                // 💡 【關鍵魔法】如果 options 是一串字（例如 "global_player_trait"），去詞庫抓資料！
                if (typeof options === 'string' && window.FragmentDB && window.FragmentDB.fragments[options]) {
                    pool = window.FragmentDB.fragments[options];
                }

                if (Array.isArray(pool) && pool.length > 0) {
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    if (pick && typeof pick === 'object') {
                        if (pick.tag) initialTags.push(...(Array.isArray(pick.tag) ? pick.tag : [pick.tag]));
                        if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));
                        memory[key] = pick.val; 
                    } else {
                        memory[key] = pick;
                    }
                }
            }
        }
        
        // 將風格打上標籤
        initialTags.push(mainTag);
        initialTags.push(`struct_${selectedSkeleton}`); 

        console.log(`🎬 引擎啟動 | 結構: [${selectedSkeleton}] | 風格: [${mainTag}]`);

        // 🌟 [升級版] 處理環境種子 (動態連動 FragmentDB)
        if (skel.seeds) {
            for (let [key, options] of Object.entries(skel.seeds)) {
                let pool = options;
                
                if (typeof options === 'string' && window.FragmentDB && window.FragmentDB.fragments[options]) {
                    pool = window.FragmentDB.fragments[options];
                }

                if (Array.isArray(pool) && pool.length > 0) {
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    
                    if (pick && typeof pick === 'object' && pick.val) {
                        memory[key] = pick.val; 
                        if (pick.tag) initialTags.push(...(Array.isArray(pick.tag) ? pick.tag : [pick.tag]));
                        if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));
                    } else {
                        memory[key] = pick; 
                    }
                }
            }
        }

        // 3. 處理角色 (Actors) - 動態標籤與上下文感知抽取
        if (skel.actors && window.FragmentDB) {
            skel.actors.forEach(actorDef => {
                let roleKey = typeof actorDef === 'string' ? actorDef : actorDef.key;
                let poolName = typeof actorDef === 'string' ? actorDef : (actorDef.pool || 'core_identity');
                let requiredTags = typeof actorDef === 'string' ? [] : (actorDef.tags || []);
                
                let pool = window.FragmentDB.fragments[poolName] || [];
                
                if (pool.length > 0) {
                    let validPool = pool;
                    if (requiredTags.length > 0) {
                        validPool = validPool.filter(item => {
                            let itemTags = [];
                            if (item.tag) itemTags.push(...(Array.isArray(item.tag) ? item.tag : [item.tag]));
                            if (item.tags) itemTags.push(...(Array.isArray(item.tags) ? item.tags : [item.tags]));
                            return requiredTags.every(t => itemTags.includes(t));
                        });
                    }
                    if (validPool.length === 0) validPool = pool; 

                    let contextualPool = validPool.filter(item => {
                        let itemTags = [];
                        if (item.tag) itemTags.push(...(Array.isArray(item.tag) ? item.tag : [item.tag]));
                        if (item.tags) itemTags.push(...(Array.isArray(item.tags) ? item.tags : [item.tags]));
                        return itemTags.some(t => initialTags.includes(t));
                    });

                    let finalPool = contextualPool.length > 0 ? contextualPool : validPool;
                    const pick = finalPool[Math.floor(Math.random() * finalPool.length)];
                    let val = pick.val.zh || pick.val;
                    
                    if (val.includes('{')) {
                         val = this._expandGrammar(val, window.FragmentDB, memory, 0, initialTags);
                    }

                    if (pick.tag) initialTags.push(...(Array.isArray(pick.tag) ? pick.tag : [pick.tag]));
                    if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));
                    
                    memory[roleKey] = val; 
                } else {
                    memory[roleKey] = "???";
                }
            });
        }
        // 🚨 這裡原本多餘的殘留代碼已被安全刪除！

        // 4. 動態生成流程 (Dynamic Flow)
        let dynamicStages = this.buildUnifiedFlow(skel);

        console.log(`🎬 Director: Skeleton [${selectedSkeleton}], Theme [${mainTag}], Seeds:`, memory, `Flow:`, dynamicStages);

        return {
            skeleton: selectedSkeleton,
            theme: mainTag,             
            depth: 0,
            maxDepth: dynamicStages.length,
            stages: dynamicStages,
            currentStageIdx: 0,
            tension: skel.baseTension || 0,
            memory: memory,               
            history: [],
            tags: initialTags
        };
    },

    // ============================================================
    // 4. 生成下一層 (Generate)
    // ============================================================
    generate: function(contextTags = [], isStart = false) {
        const gs = window.GlobalState;
        
        // 1. 初始化檢查(修復「劇本失憶」Bug)
        // 只有在「真的沒有劇本鏈結」的時候，才自動補生成。
        // 如果外部 (story.js) 已經幫我們建好 chain 了，就絕對不可以覆蓋它！
        if (!gs.story.chain || !gs.story.chain.stages) {
            console.log("🔄 Generator: 偵測到無鏈結，自動隨機初始化...");
            gs.story.chain = this.initChain(); 
        } else if (isStart) {
            // 如果是新開局，我們只把進度歸零，確保從頭開始，但不改變已經決定的劇本骨架！
            gs.story.chain.currentStageIdx = 0;
            gs.story.chain.depth = 0;
            console.log(`▶️ Generator: 確認開始執行 [${gs.story.chain.skeleton}] 劇本...`);
        }

        const chain = gs.story.chain;

        // 2. 合併外部傳入的 Tags
        if(contextTags.length > 0) {
            chain.tags = [...new Set([...chain.tags, ...contextTags])];
        }

        // 🌟【關鍵修復】將玩家身上的實體標籤與劇本標籤合併！
        const playerTags = (gs.story && gs.story.tags) ? gs.story.tags : [];
        const mergedTags = [...new Set([...chain.tags, ...playerTags])];

        // 3. 檢查流程是否結束
        if (chain.currentStageIdx >= chain.stages.length) return null;
        
        let targetType = chain.stages[chain.currentStageIdx];
        
        // 4. 張力調整 (Tension)
        let tensionDelta = 5; 
        if (mergedTags.includes('risk_high')) tensionDelta += 15;
        chain.tension = Math.min(100, Math.max(0, (chain.tension || 0) + tensionDelta));
        console.log(`🎬 Director: Stage [${targetType}], Tension ${chain.tension}%`);

        // 5. 選擇劇本 (Pick Template) - 改為傳入 mergedTags
        // [修復 STORY-3] 合併確保力量/敏捷等屬性檢定能生效
    const currentStats = { ...(gs['stats'] || {}), ...(gs.attrs || {}) };
    
    // 將 currentStats 傳遞給 pickTemplate
    const template = this.pickTemplate(targetType, mergedTags, chain.history, chain.tension, currentStats);
        
        const lang = gs.settings?.targetLang || 'zh';

        // 6. 錯誤處理 (找不到劇本)
        if (!template) {
            console.error(`❌ 無法生成劇本: Type=${targetType}`);
            return {
                id: `err_${Date.now()}`,
                text: "（系統錯誤：迷霧太濃...找不到符合條件的劇本）",
                options: [{ label: "強制結束", action: "finish_chain" }]
            };
        }

        // 7. 記錄歷史 (避免重複)
        if (template.id) {
            chain.history.push(template.id);
            // 🌟 [修改] 確保只記錄最近的 2 次 (原本是 5 次，依你需求精準改為 2 次)
            if (chain.history.length > 2) chain.history.shift();
        }
        // 8. 填充內容 (Fill Content) 並收集動態標籤
        // 將 chain.tags 傳遞進去，如果抽到 {core_identity} 等帶有 tag 的詞，就會被塞進 chain.tags
        const filledData = this.fillTemplate(template, lang, chain.memory, chain.tags);

        // 🌟【終極合併】因為 fillTemplate 剛剛可能抽到了「怪物」或「人類」等新標籤塞進 chain.tags
        // 所以我們在這裡必須「重新合併」一次，確保選項過濾器能拿到最熱騰騰的標籤！
        const updatedPlayerTags = (gs.story && gs.story.tags) ? gs.story.tags : [];
        const finalMergedTags = [...new Set([...chain.tags, ...updatedPlayerTags])];
		console.log("🕵️ 診斷：當前場景收集到的標籤 ->", finalMergedTags);
        const opts = this.generateOptions(
            template, 
            filledData.fragments, 
            lang, 
            targetType, 
            finalMergedTags, // 傳入最新合併的標籤！
            currentStats
        );
        
        // 9. 推進進度
        chain.currentStageIdx++;
        chain.depth++; 

        // 10. 回傳結果
        return {
            id: template.id || `gen_${Date.now()}`,
            type: targetType, 
            text: filledData.text[0],
            dialogue: filledData.dialogue, 
            options: opts, 
            rewards: filledData.rewards,
			onEnter: template.onEnter // 🌟 【關鍵修復】確保劇本的 onEnter 設定被完整送進引擎執行！
        };
    },

    // ============================================================
    // 5.升級版：文法展開器 (支援 Context Injection 標籤注入)
    // ============================================================
    _expandGrammar: function(text, db, memory, depth = 0, collectedTags = null) {
        if (!text) return "";
        if (depth > 10) return text; // 防止無窮迴圈
        
        return text.replace(/{(\w+)}/g, (match, key) => {
            // 優先順序 1: 記憶 (Memory)
            if (memory && memory[key]) {
                let val = memory[key];
                if (typeof val === 'string' && val.includes('{')) {
                    return this._expandGrammar(val, db, memory, depth + 1, collectedTags);
                }
                return val;
            }
            
            // 優先順序 2: 資料庫碎片 (FragmentDB)
            if (db.fragments[key]) {
                const list = db.fragments[key];
                if (list.length > 0) {
                    const pick = list[Math.floor(Math.random() * list.length)];
                    let val = pick.val.zh || pick.val; 
                    
                    // 🌟 【關鍵注入】在這裡把抽出來的詞彙標籤，悄悄塞進當前劇本中！
                    if (collectedTags) {
                        if (pick.tag) {
                            if (Array.isArray(pick.tag)) collectedTags.push(...pick.tag);
                            else collectedTags.push(pick.tag);
                        }
                        // 兼容 tags 陣列寫法
                        if (pick.tags) {
                            if (Array.isArray(pick.tags)) collectedTags.push(...pick.tags);
                            else collectedTags.push(pick.tags);
                        }
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
    // 修改：填充模板 (將標籤收集器往下傳)
    // ============================================================
    fillTemplate: function(tmpl, lang, memory, collectedTags = null) {
        const db = window.FragmentDB;
        
        // 1. 處理主文本 (Text)
        let finalTxT = "";
        let rawTextArr = []; 

        if (tmpl.text) {
            if (typeof tmpl.text === 'string') rawTextArr.push(tmpl.text);
            else if (Array.isArray(tmpl.text)) rawTextArr = tmpl.text;
            else {
                let t = tmpl.text[lang] || tmpl.text['zh'] || "";
                if (typeof t === 'string') rawTextArr.push(t);
                else if (Array.isArray(t)) rawTextArr = t;
            }
            // 將 collectedTags 傳入展開器
            finalTxT = rawTextArr.map(t => this._expandGrammar(t, db, memory, 0, collectedTags)).join('<br><br>');
        }

        // 2. 處理對話 (Dialogue)
        let dialogueArr = null;
        if (tmpl.dialogue) {
            dialogueArr = tmpl.dialogue.map(d => {
                let rawDiagText = "";
                if (d && d.text) {
                    if (typeof d.text === 'string') rawDiagText = d.text;
                    else rawDiagText = d.text[lang] || d.text['zh'] || '';
                }
                let speakerName = (d && d.speaker) ? d.speaker : "旁白";
                
                return {
                    speaker: this._expandGrammar(speakerName, db, memory, 0, collectedTags), 
                    text: this._expandGrammar(rawDiagText, db, memory, 0, collectedTags) 
                };
            });
        }

        // 3. 處理獎勵與變數
        let newRewards = tmpl.rewards ? JSON.parse(JSON.stringify(tmpl.rewards)) : undefined;
        if (newRewards && newRewards.tags) {
            newRewards.tags = newRewards.tags.map(t => this._expandGrammar(t, db, memory, 0, collectedTags));
        }

        return { 
            text: finalTxT ? [finalTxT] : [], 
            dialogue: dialogueArr, 
            fragments: {}, 
            rewards: newRewards
        };
    },

    // ============================================================
    // 修改：挑選模板 (加入數值條件判斷)
    // ============================================================
    pickTemplate: function(type, currentTags, history, tension, currentStats = {}) {
    const db = window.FragmentDB;
    
    // ===========================
    // 步驟 1: 初步篩選 (Type)
    // ===========================
    // 先找出所有類型符合的劇本
    let candidates = db.templates.filter(t => t.type === type);

    // ===========================
    // 步驟 2: 嚴格過濾 (Tags & Conditions)
    // ===========================
    let validCandidates = candidates.filter(t => {
        
        // 🌟 A. 終極陣列標籤過濾器 (Tags)
        
        // 1. 檢查「排除 (NOR)」：只要踩中任何一個地雷，直接淘汰
        if (t.excludeTags && Array.isArray(t.excludeTags)) {
            if (t.excludeTags.some(tag => currentTags.includes(tag))) return false;
        } else if (t.excludeTag && currentTags.includes(t.excludeTag)) { // 相容舊寫法 excludeTag
            return false;
        } else if (t.noTag && currentTags.includes(t.noTag)) {         // 相容舊寫法 noTag
            return false;
        }

        // 2. 檢查「需求 (OR)」：必須擁有陣列中至少一個標籤，否則淘汰
        if (t.reqTags && Array.isArray(t.reqTags)) {
            if (!t.reqTags.some(tag => currentTags.includes(tag))) return false;
        } else if (t.reqTag && !currentTags.includes(t.reqTag)) {      // 相容舊寫法 reqTag
            return false;
        }

        // B. 數值/狀態條件過濾 (保持你原本的寫法不動)
        if (t.conditions) {
            for (let [key, val] of Object.entries(t.conditions)) {
                let userVal = currentStats[key] || 0;
                if (typeof val === 'string') {
                    if (val.startsWith('>')) {
                        if (userVal <= parseFloat(val.substring(1))) return false;
                    } else if (val.startsWith('<')) {
                        if (userVal >= parseFloat(val.substring(1))) return false;
                    } else if (val !== userVal.toString()) {
                        return false; 
                    }
                } else {
                    if (userVal !== val) return false;
                }
            }
        }
        return true;
    });

    // ===========================
    // 步驟 3: 歷史過濾 (History)
    // ===========================
    // 從「符合條件」的清單中，濾掉「最近出現過」的
    let historyFiltered = validCandidates.filter(t => !t.id || !history.includes(t.id));

    // ===========================
    // 步驟 4: 決定最終候選池 (Final Pool) - 這是修正重點
    // ===========================
    let finalPool = [];

    if (historyFiltered.length > 0) {
        // 首選：符合條件 且 沒出現過的新劇本
        finalPool = historyFiltered;
    } else {
        // 🚨 牌庫被抽乾了！(所有符合條件的牌都在歷史紀錄裡)
        
        // 判斷是否為「絕對不能被替換」的關鍵劇情
        const isCritical = type.includes('setup') || type.includes('adventure_climax') || type.includes('ending') || type.includes('climax');
        
        if (isCritical && validCandidates.length > 0) {
            // 只有關鍵劇情 (例如魔王只有一隻)，才允許重複上演
            console.warn(`⚠️ [${type}] 牌庫耗盡，但因屬於關鍵劇情，允許重複抽取。`);
            finalPool = validCandidates;
        } else {
            // 一般劇情 (像調查、追蹤) 絕對不允許重複！
            // 我們故意讓 finalPool 保持為空 []
            // 這樣系統就會自動掉進下一步驟的「救命機制」，去抽一張 univ_filler (通用事件) 來完美頂替！
            finalPool = [];
        }
    }
    // 此時 finalPool 可能仍為空 (如果連 validCandidates 都是空的)

    // ===========================
    // 步驟 5: 救命機制 (Fallback Logic)
    // ===========================
    if (finalPool.length === 0) {
        console.warn(`⚠️ [${type}] 無可用劇本 (Tags不符或耗盡)。啟動備案機制...`);

        const isCritical = type.includes('setup') || type.includes('adventure_climax') || type.includes('ending') || type.includes('climax');
        
        if (isCritical) {
            if (candidates.length > 0) {
                console.warn(`🚨 強制執行關鍵劇情: ${candidates[0].id}`);
                return candidates[0];
            } else {
                return db.templates.find(t => t.type === 'univ_filler') || null;
            }
        }

        console.log(`🔄 切換至通用填充 (Universal Filler)`);
        let fillers = db.templates.filter(t => t.type === 'univ_filler');
        
        // 🌟 [關鍵修復] 讓通用 Filler 也遵守歷史紀錄，避免連續抽到同一個 uni_env_danger！
        let safeFillers = fillers.filter(t => !history.includes(t.id));

        if (tension > 50 || currentTags.includes('risk_high')) {
            let dangerFillers = safeFillers.filter(t => t.conditions && t.conditions.risk_high);
            if (dangerFillers.length > 0) safeFillers = dangerFillers;
        }

        // 優先從過濾過歷史的「安全牌庫」抽
        if (safeFillers.length > 0) {
            return safeFillers[Math.floor(Math.random() * safeFillers.length)];
        } else if (fillers.length > 0) {
            // 防呆：如果牌真的太少，安全牌庫空了，只好無視歷史硬抽一張 (總比系統 crash 好)
            return fillers[Math.floor(Math.random() * fillers.length)];
        }
        
        return null;
    }

    // ===========================
    // 步驟 6: 隨機抽出
    // ===========================
    return finalPool[Math.floor(Math.random() * finalPool.length)];
},

    generateOptions: function(tmpl, fragments, lang, type, currentTags = [], currentStats = {}) {
    let opts = [];
    
    // 1. 檢查劇本自帶的選項
    if (tmpl.options && tmpl.options.length > 0) {
        // [Fix] 增加 .filter() 來過濾不符合 condition 的選項
        let validOpts = tmpl.options.filter(o => {
            // 如果沒有條件，直接通過
            if (!o.condition) return true;

            // A. 檢查標籤條件 (Tags)
            if (o.condition.tags) {
                // 必須包含所有指定的 tag
                for (let tag of o.condition.tags) {
                    if (!currentTags.includes(tag)) return false;
                }
            }
            
            // B. 檢查數值條件 (Stats)
            if (o.condition.stats) {
                for (let [key, val] of Object.entries(o.condition.stats)) {
                    let userVal = currentStats[key] || 0;
                    // 處理 ">50", "<10" 這種字串
                    if (typeof val === 'string') {
                        let num = parseFloat(val.substring(1));
                        if (val.startsWith('>') && userVal <= num) return false;
                        if (val.startsWith('<') && userVal >= num) return false;
                    } else {
                        if (userVal < val) return false;
                    }
                }
            }

            return true; // 所有條件都通過
        });

        // 映射並回傳
        opts = validOpts.map(o => {
             let newRew = o.rewards ? JSON.parse(JSON.stringify(o.rewards)) : undefined;
             let defaultAction = (o.nextScene || o.nextSceneId) ? 'node_next' : 'advance_chain';
             return { ...o, action: o.action || defaultAction, rewards: newRew };
         });
    }
    
    // 2. 處理 Boss/Ending 的自動選項 (保持原本邏輯)
    if (opts.length === 0) {
        if (type.includes('climax') || type.includes('adventure_climax')) {
            opts.push({ label: "決一死戰！", style: "danger", action: "finish_chain" }); 
        } else if (type.includes('ending')) {
            opts.push({ label: "結束冒險", action: "finish_chain" });
        } else {
            opts.push({ label: "繼續...", action: "advance_chain" });
        }
    }

    return opts;
},
};