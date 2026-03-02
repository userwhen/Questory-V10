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
        let finalFlow = ['start'];
        const flow = skel.flow || { isSequential: false, minMiddle: 3, maxMiddle: 3 };
        
        if (flow.isSequential) {
            // 💖【循序漸進模式】(適用：戀愛、養成)
            finalFlow.push('middle', 'middle', 'adv');
        } else {
            // ⚔️【箱庭/隨機抽取模式】(適用：懸疑、恐怖、冒險)
            let min = flow.minMiddle || 3;
            let max = flow.maxMiddle || 3;
            let middleCount = min + Math.floor(Math.random() * (max - min + 1));

            for (let i = 0; i < middleCount; i++) {
                finalFlow.push('middle');
            }
        }

        finalFlow.push('climax', 'end');
        return finalFlow;
    },

    // ============================================================
    // 2. 劇本骨架定義 (Skeletons - 極致瘦身動態版)
    // ============================================================
	globalSeeds: {
        player_trait: "global_player_trait", 
        world_vibe: "global_world_vibe",
        env_building: "env_building", 
        
        // 🌟 新增：開局擲骰決定這場遊戲是「箱庭」還是「線性」
        play_mode: "global_play_mode" 
    },
    skeletons: {
        'mystery': {
            tensionName: "暴露度",
            seeds: {
                weather: "env_weather",       
                atmosphere: "env_atmosphere",
                // 🌟 核心修復：直接對接 Layer 0 和 Layer 1 的組合詞庫！
                true_culprit: "core_identity",      // 從核心身份抽人 (如: 傲嬌寡婦)
                murder_weapon: "combo_item_simple"  // 從物品組合抽 (如: 生鏽的匕首)
            },
            actors: [
                { key: 'detective', pool: 'core_identity', tags: ['human', 'mystery'] },
                { key: 'victim', pool: 'core_identity', tags: ['human', 'mystery'] },
                { key: 'suspect_A', pool: 'core_identity', tags: ['human', 'mystery'] },
                { key: 'suspect_B', pool: 'core_identity', tags: ['human', 'mystery'] }
            ], 
            flow: { isSequential: false, minMiddle: 3, maxMiddle: 3 }
        },
        'horror': {
            tensionName: "恐懼值",
            seeds: { weather: "env_weather", curse_type: "horror_curse_type" },
            actors: [
                { key: 'survivor', pool: 'core_identity', tags: ['human'] },
                { key: 'monster', pool: 'core_identity', tags: ['monster'] }
            ],
            flow: { isSequential: false, minMiddle: 3, maxMiddle: 4 }
        },
        'adventure': { 
            tensionName: "危險級別",
            seeds: { world_state: "adventure_world_state", start_bonus: "adventure_start_bonus" },
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
                { key: 'mentor', pool: 'core_identity', tags: ['human', 'mentor'] },
                { key: 'rival', pool: 'core_identity', tags: ['human'] }
            ],
            flow: { isSequential: true }
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
                        if (pick.tag) initialTags.push(...(Array.isArray(pick.tag) ? pick.tag : [pick.tag]));
                        if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));
                        
                        let val = pick.val.zh || pick.val;
                        // 🌟 核心修復：開局時就把組合文法展開並「烤死 (Bake)」，存入記憶庫！
                        // 這樣凶器就不會在這行是「匕首」，下一行變成「手槍」了。
                        if (typeof val === 'string' && val.includes('{')) {
                            val = this._expandGrammar(val, window.FragmentDB, memory, 0, initialTags);
                        }
                        memory[key] = val; 
                    } else {
                        let val = pick;
                        if (typeof val === 'string' && val.includes('{')) {
                            val = this._expandGrammar(val, window.FragmentDB, memory, 0, initialTags);
                        }
                        memory[key] = val; 
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
                            // 必須包含所有需要的標籤 (例如 lover 必須要有 human 和 romance)
                            return requiredTags.every(t => itemTags.includes(t)); 
                        });
                    }
                    if (validPool.length === 0) validPool = pool; 

                    const pick = validPool[Math.floor(Math.random() * validPool.length)];
                    let val = pick.val.zh || pick.val;
                    
                    // 🌟 確保前綴 (trait_prefix) 等巢狀變數被正確展開
                    if (val.includes('{')) {
                         val = this._expandGrammar(val, window.FragmentDB, memory, 0, initialTags);
                    }

                    if (pick.tag) initialTags.push(...(Array.isArray(pick.tag) ? pick.tag : [pick.tag]));
                    if (pick.tags) initialTags.push(...(Array.isArray(pick.tags) ? pick.tags : [pick.tags]));
                    
                    // 🌟 存入 memory，讓後續的 _expandGrammar 能夠替換
                    memory[roleKey] = val; 
                    console.log(`👤 抽出角色 [${roleKey}]: ${val}`); // 加上這行，我們可以在 Console 看到到底抽了誰
                } else {
                    memory[roleKey] = "神祕人";
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
            tensionName: skel.tensionName || "張力值", // 🌟 記住這個劇本的專屬張力名稱
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
        
        // 4. 選擇劇本 (Pick Template) - 改為傳入 mergedTags
        // [修復 STORY-3] 合併確保力量/敏捷等屬性檢定能生效
    const currentStats = { 
        ...(gs.attrs || {}), 
        ...(gs.story && gs.story.vars ? gs.story.vars : {}) 
    };
    
    // 將 currentStats 傳遞給 pickTemplate
    const template = this.pickTemplate(targetType, mergedTags, chain.history, currentStats, chain);
        
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
                
                // 🌟 核心修復：使用 _expandGrammar 去解析 speakerName 和 rawDiagText，
                // 把 memory 傳進去，這樣遇到 {lover} 就會變成 "傲嬌的青梅竹馬"
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
    // 升級版：挑選模板 (模組化拆分版)
    // ============================================================
    pickTemplate: function(type, currentTags, history, currentStats = {}, chain) {
        const db = window.FragmentDB;
        
        // 1. 狀態判定
        const isDangerState = currentTags.includes('risk_high') || (currentStats.tension !== undefined && currentStats.tension >= 80);
        const isCritical = type.includes('setup') || type.includes('climax') || type.includes('end') || type.includes('start');
        
        // 2. 初步篩選類型
        let candidates = db.templates.filter(t => t.type === type);
        
        // 3. 模組化過濾流水線
        candidates = this._filterByTheme(candidates, chain);
        candidates = this._filterByTags(candidates, currentTags, isDangerState);
        candidates = this._filterByStats(candidates, currentStats);
        
        // 4. 高危攔截與日常安全隔離
        candidates = this._applyDangerOverride(candidates, db, isDangerState, isCritical);
        
        // 5. 歷史防重複過濾
        let finalPool = this._filterByHistory(candidates, history, isCritical);

        // 6. 最終抽取與備案機制
        if (finalPool.length === 0) {
            return this._getFallbackTemplate(db, type, isCritical, history, candidates);
        }

        return finalPool[Math.floor(Math.random() * finalPool.length)];
    },
	// ------------------------------------------------------------
    // 輔助函式群 (Filters)
    // ------------------------------------------------------------
    _filterByTheme: function(candidates, chain) {
        // 定義系統的五大核心主題
        const coreThemes = ['mystery', 'horror', 'adventure', 'romance', 'raising'];
        
        return candidates.filter(t => {
            // 1. 通用劇本 (univ_filler) 永遠放行
            if (t.type === 'univ_filler') return true;
            
            // 2. 防呆：沒有主題的主線直接放行
            if (!chain || !chain.theme) return true;

            // 3. 🌟 關鍵修復：檢查卡片本身定義的「需求標籤 (reqTags)」
            if (t.reqTags && Array.isArray(t.reqTags)) {
                // 看看這張卡片有沒有綁定任何核心主題
                const cardThemes = t.reqTags.filter(tag => coreThemes.includes(tag));

                if (cardThemes.length > 0) {
                    return cardThemes.includes(chain.theme);
                }
            }
            
            // 4. 如果卡片有明確的 theme 屬性 (雙重保險)
            if (t.theme) {
                if (Array.isArray(t.theme)) return t.theme.includes(chain.theme);
                return t.theme === chain.theme;
            }

            // 5. 如果都沒有明確標示，則視為中立卡片放行
            return true;
        });
    },

    _filterByTags: function(candidates, currentTags, isDangerState) {
        return candidates.filter(t => {
            // A. 排除檢查 (身上有此標籤則不抽)
            if (t.excludeTags && Array.isArray(t.excludeTags)) {
                if (t.excludeTags.some(tag => currentTags.includes(tag))) return false;
            }
            // B. 需求檢查 (必須有此標籤才能抽)
            if (t.reqTags && Array.isArray(t.reqTags)) {
                let tempTags = isDangerState ? [...currentTags, 'risk_high'] : currentTags;
                if (!t.reqTags.some(tag => tempTags.includes(tag))) return false;
            }
            return true;
        });
    },

    _filterByStats: function(candidates, currentStats) {
        return candidates.filter(t => {
            if (t.conditions) {
                for (let [key, val] of Object.entries(t.conditions)) {
                    let userVal = currentStats[key] || 0;
                    if (typeof val === 'string') {
                        let num = parseFloat(val.substring(1));
                        if (val.startsWith('>') && userVal <= num) return false;
                        if (val.startsWith('<') && userVal >= num) return false;
                    } else {
                        if (userVal < val) return false;
                    }
                }
            }
            return true;
        });
    },

    _applyDangerOverride: function(candidates, db, isDangerState, isCritical) {
        if (isDangerState && !isCritical) {
            // 嘗試從當前候選中找出高危劇本
            let dangerOnly = candidates.filter(t => t.reqTags && t.reqTags.includes('risk_high'));
            
            // 💀 如果當前進度沒有專屬高危劇本，跨維度去 univ_filler 抓
            if (dangerOnly.length === 0) {
                 dangerOnly = db.templates.filter(t => t.type === 'univ_filler' && t.reqTags && t.reqTags.includes('risk_high'));
            }
            
            if (dangerOnly.length > 0) {
                console.log("🚨 玩家狀態不穩，強制鎖定 [高危牌庫]！");
                return dangerOnly;
            }
        } else if (!isCritical) {
            // 🕊️ 安全狀態：強制把會嚇人的劇本全部濾掉
            return candidates.filter(t => !(t.reqTags && t.reqTags.includes('risk_high')));
        }
        return candidates;
    },

    _filterByHistory: function(candidates, history, isCritical) {
        let historyFiltered = candidates.filter(t => !t.id || !history.includes(t.id));
        return historyFiltered.length > 0 ? historyFiltered : (isCritical ? candidates : []);
    },

    _getFallbackTemplate: function(db, type, isCritical, history, originalCandidates) {
        console.warn(`⚠️ [${type}] 無可用劇本，啟動備案...`);
        if (isCritical && originalCandidates.length > 0) return originalCandidates[0];
        
        // 抽一張絕對安全的通用劇本來頂替
        let safeFillers = db.templates.filter(t => t.type === 'univ_filler' && !history.includes(t.id) && !(t.reqTags && t.reqTags.includes('risk_high')));
        if (safeFillers.length > 0) return safeFillers[Math.floor(Math.random() * safeFillers.length)];
        
        // 最終防呆
        return db.templates.find(t => t.type === 'univ_filler'); 
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