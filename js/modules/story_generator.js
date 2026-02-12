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

    // ============================================================
    // 2. 劇本骨架定義 (Skeletons) - 保留在此處
    // ============================================================
    skeletons: {
        'mystery': {
            // [New] 導演種子：決定這場戲的背景
            seeds: {
                weather: [
                    { val: "暴風雨之夜", tag: "env_storm" },
                    { val: "濃霧瀰漫的清晨", tag: "env_fog" },
                    { val: "原本平靜的午後", tag: "env_normal" }
                ],
                atmosphere: ["詭異的", "悲傷的", "充滿敵意的"], // 形容詞種子
                motive: ["遺產爭奪", "情殺", "復仇"] // 動機種子 (可作為文本變數)
            },
            // [New] 動態流程：每次長度不一樣
            getStages: function() {
                // 基礎結構
                let flow = ['setup', 'univ_filler'];
                
                // 隨機插入 1~3 個調查階段
                let investCount = 1 + Math.floor(Math.random() * 3);
                for(let i=0; i<investCount; i++) {
                    // 隨機決定是「單純調查」還是「遭遇事件」
                    flow.push(Math.random() > 0.3 ? 'investigate' : 'univ_filler');
                }
                
                flow.push('twist');
                flow.push('deduction');
                return flow;
            },
            // 角色分配 (從 FragmentDB 抓取)
            actors: ['detective', 'victim', 'suspect_A', 'suspect_B', 'noun_npc_generic'], 
            baseTension: 10
        },

        'horror': {
            seeds: {
                weather: [
                    { val: "伸手不見五指的深夜", tag: "risk_high" }, // 一開場就很危險
                    { val: "雷雨交加的夜晚", tag: "env_storm" }
                ],
                curse_type: ["古代詛咒", "怨靈附身", "生物變異"]
            },
            // 恐怖片的節奏比較快，直線型
            stages: ['setup_omen', 'univ_filler', 'encounter_stalk', 'univ_filler', 'encounter_climax', 'final_survival'],
            actors: ['survivor', 'noun_role_monster', 'noun_location_building'], 
            baseTension: 30
        },

        'isekai': { 
            seeds: {
                world_state: ["戰亂", "魔物肆虐", "和平但腐敗"],
                start_bonus: ["神聖", "被詛咒的", "生鏽的"] // 起始武器的形容詞
            },
            getStages: function() {
                // 異世界冒險可能是「戰鬥-探索-戰鬥-Boss」
                return ['setup', 'event_battle', 'univ_filler', 'event_explore', 'event_battle', 'boss'];
            },
            actors: ['noun_role_monster', 'noun_location_building', 'noun_item_weapon'], 
            baseTension: 20 
        },
        
        // ... (其他骨架可依此類推，若不修改也可保留舊格式，initChain 會相容)
        'romance': {
             stages: ['love_meet', 'love_bond', 'love_scheme', 'love_counter', 'love_confession'],
             actors: ['lover', 'rival', 'noun_npc_generic'], 
             baseTension: 5 
        },
        'raising': {
             stages: ['raise_meet', 'raise_train', 'raise_debut', 'raise_climax', 'raise_ending'],
             actors: ['trainee', 'rival', 'butler'], 
             baseTension: 0 
        }
    },

    // ============================================================
    // 3. 啟動新冒險 (Start Chain)
    // ============================================================
    initChain: function(forcedMode = null) {
        // 1. 決定模式 (Genre Selection)
        let mode = forcedMode;
        if (!mode || !this.skeletons[mode]) {
            const keys = Object.keys(this.skeletons);
            mode = keys[Math.floor(Math.random() * keys.length)];
            console.log(`🎲 隨機選擇骨架: ${mode}`);
        }

        const skel = this.skeletons[mode];
        
        // 2. 初始化 Memory 與 Tags (Seed Injection)
        let memory = {};
        let initialTags = [];

        // [New] 處理環境種子 (Seeds)
        // 這些變數決定了整篇故事的「背景設定」
        if (skel.seeds) {
            for (let [key, options] of Object.entries(skel.seeds)) {
                // 隨機選一個設定 (例如 weather: 'storm')
                const pick = options[Math.floor(Math.random() * options.length)];
                
                // 如果選項是物件，可以包含 tag 和 val
                if (typeof pick === 'object') {
                    memory[key] = pick.val;
                    if (pick.tag) initialTags.push(pick.tag);
                } else {
                    // 如果只是字串
                    memory[key] = pick;
                }
            }
        }

        // 3. 處理角色 (Actors) - 維持原本邏輯，但加上防呆
        if (skel.actors && window.FragmentDB) {
            skel.actors.forEach(roleKey => {
    const pool = window.FragmentDB.fragments[roleKey];
    if (pool && pool.length > 0) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        let val = pick.val.zh || pick.val;
        
        // [Pro Tip] 在存入記憶前，先解析一次，把變數固定下來！
        // 這樣 "一位{base_npc_id}" 就會變成 "一位老人" 並永遠固定
        if (val.includes('{')) {
             // 注意：此時 memory 還沒完全建立好，傳入 memory 主要是為了讀取前面的 seeds
             val = this._expandGrammar(val, window.FragmentDB, memory);
        }

        if (pick.tags) initialTags.push(...pick.tags);
        memory[roleKey] = val; 
    } else {
        memory[roleKey] = "???";
    }
            });
        }

        // 4. 動態生成流程 (Dynamic Flow)
        // 如果骨架有定義 getStages 函數，就用它；否則用靜態陣列
        let dynamicStages = skel.getStages ? skel.getStages() : [...skel.stages];

        console.log(`🎬 Director: Mode [${mode}], Seeds:`, memory, `Flow:`, dynamicStages);

        return {
            mode: mode,
            depth: 0,
            maxDepth: dynamicStages.length,
            stages: dynamicStages,
            currentStageIdx: 0,
            tension: skel.baseTension || 0,
            memory: memory,               
            history: [],
            tags: initialTags // 初始標籤現在包含了天氣、氛圍等資訊
        };
    },

    // ============================================================
    // 4. 生成下一層 (Generate)
    // ============================================================
    generate: function(contextTags = [], isStart = false) {
        const gs = window.GlobalState;
        
        if (!gs.story.chain || !gs.story.chain.stages || isStart) {
            console.log("🔄 Generator: 初始化新鏈結...");
            gs.story.chain = this.initChain(); 
        }

        const chain = gs.story.chain;
        if(contextTags.length > 0) {
            chain.tags = [...new Set([...chain.tags, ...contextTags])];
        }

        if (chain.currentStageIdx >= chain.stages.length) return null;
        
        let targetType = chain.stages[chain.currentStageIdx];
        
        // 張力調整
        let tensionDelta = 5; 
        if (chain.tags.includes('risk_high')) tensionDelta += 15;
        chain.tension = Math.min(100, Math.max(0, (chain.tension || 0) + tensionDelta));
        console.log(`🎬 Director: Stage [${targetType}], Tension ${chain.tension}%`);

        // [Logic Fix] 傳遞完整參數給 pickTemplate
        const template = this.pickTemplate(targetType, chain.tags, chain.history, chain.tension);
        const lang = gs.settings?.targetLang || 'zh';

        if (!template) {
            console.error(`❌ 無法生成劇本: Type=${targetType}`);
            return {
                id: `err_${Date.now()}`,
                text: "（系統錯誤：迷霧太濃...）",
                options: [{ label: "強制結束", action: "finish_chain" }]
            };
        }

        // 記錄歷史
        if (template.id) {
            chain.history.push(template.id);
            if (chain.history.length > 5) chain.history.shift();
        }

        // 填充內容
        const filledData = this.fillTemplate(template, lang, chain.memory);
        const opts = this.generateOptions(template, filledData.fragments, lang, targetType);
        
        chain.currentStageIdx++;
        chain.depth++; 

        return {
            id: template.id || `gen_${Date.now()}`,
            type: targetType, 
            text: filledData.text[0],
            dialogue: filledData.dialogue, 
            options: opts, 
            rewards: filledData.rewards
        };
    },

    // ============================================================
    // 5. 輔助函數 (Helpers)
    // ============================================================
    
   _expandGrammar: function(text, db, memory, depth = 0) {
    if (!text) return "";
    if (depth > 10) return text; // 防止無窮迴圈
    
    // 尋找所有 {key} 格式的標籤
    return text.replace(/{(\w+)}/g, (match, key) => {
        // ==========================================
        // 優先順序 1: 記憶 (Memory)
        // ==========================================
        if (memory && memory[key]) {
            let val = memory[key];
            
            // [Fix] 關鍵修正：
            // 即使是從記憶取出的值，如果它包含 '{'，代表它是一個尚未解析的複合詞
            // 我們必須對它進行遞迴解析 (Recursive Expand)
            if (typeof val === 'string' && val.includes('{')) {
                return this._expandGrammar(val, db, memory, depth + 1);
            }
            
            return val;
        }
        
        // ==========================================
        // 優先順序 2: 資料庫碎片 (FragmentDB)
        // ==========================================
        if (db.fragments[key]) {
            const list = db.fragments[key];
            if (list.length > 0) {
                const pick = list[Math.floor(Math.random() * list.length)];
                let val = pick.val.zh || pick.val; 
                
                // 遞迴關鍵：如果抽到的詞裡面還有 {tag}，繼續展開
                if (val.includes('{')) {
                    return this._expandGrammar(val, db, memory, depth + 1);
                }
                return val;
            }
        }
        
        // 如果都找不到，保留原樣以免報錯 (或方便Debug看到是誰沒被解析)
        return match;
    });
},

    // ============================================================
    // 修改：填充模板 (使用新引擎)
    // ============================================================
    fillTemplate: function(tmpl, lang, memory) {
        const db = window.FragmentDB;
        
        // 1. 取得原始文本
        let rawText = tmpl.text[lang] || tmpl.text['zh'];
        if (Array.isArray(rawText)) rawText = rawText.join("\n");

        // 2. 使用新的遞迴引擎展開主文本
        // 注意：這裡移除了舊的 slots.forEach 迴圈，因為 _expandGrammar 會自動處理所有括號
        const finalTxT = this._expandGrammar(rawText, db, memory);
        
        // 3. 處理對話 (如果有的話)
        let dialogueArr = null;
        if (tmpl.dialogue) {
            dialogueArr = tmpl.dialogue.map(d => ({
                speaker: this._expandGrammar(d.speaker, db, memory), 
                text: this._expandGrammar((d.text[lang] || d.text['zh']), db, memory)
            }));
        }

        // 4. 處理獎勵中的變數
        let newRewards = tmpl.rewards ? JSON.parse(JSON.stringify(tmpl.rewards)) : undefined;
        if (newRewards && newRewards.tags) {
            newRewards.tags = newRewards.tags.map(t => this._expandGrammar(t, db, memory));
        }

        return { 
            text: [finalTxT], // 統一回傳陣列格式
            dialogue: dialogueArr, 
            fragments: {}, // 舊系統需要這個，新系統已內化，回傳空物件即可
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
        // A. 基本 Tag 過濾
        if (t.reqTag && !currentTags.includes(t.reqTag)) return false;
        if (t.noTag && currentTags.includes(t.noTag)) return false;

        // B. 數值/狀態條件過濾
        if (t.conditions) {
            for (let [key, val] of Object.entries(t.conditions)) {
                let userVal = currentStats[key] || 0;
                // 處理字串運算符 (>50, <10) 或純數值
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
        // 優先使用：符合條件 且 沒出現過的
        finalPool = historyFiltered;
    } else if (validCandidates.length > 0) {
        // 次要選擇：符合條件 但 出現過的 (因為沒新劇本了，只好重複)
        // 只有在非一次性劇情才允許重複，但在這裡我們先寬容處理
        finalPool = validCandidates;
    } 
    // 此時 finalPool 可能仍為空 (如果連 validCandidates 都是空的)

    // ===========================
    // 步驟 5: 救命機制 (Fallback Logic)
    // ===========================
    if (finalPool.length === 0) {
        console.warn(`⚠️ [${type}] 無可用劇本 (Tags不符或耗盡)。啟動備案機制...`);

        // 情境 A: 關鍵劇情 (Boss, Ending, Setup) -> 不能隨便略過
        // 強制放寬條件：回頭去拿原始 candidates 的第一張，無視 Tag/History
        const isCritical = type.includes('setup') || type.includes('boss') || type.includes('ending') || type.includes('climax');
        
        if (isCritical) {
            if (candidates.length > 0) {
                console.warn(`🚨 強制執行關鍵劇情: ${candidates[0].id}`);
                return candidates[0];
            } else {
                // 連原始候選都沒有，這通常是打錯字，或者該類型還沒寫
                console.error(`❌ 致命錯誤: 資料庫完全沒有類型為 [${type}] 的劇本！`);
                // 死馬當活馬醫，回傳通用填充，避免 crash
                return db.templates.find(t => t.type === 'univ_filler') || null;
            }
        }

        // 情境 B: 非關鍵劇情 (Investigate, Event) -> 轉為通用填充 (Filler)
        // 這是您提到的「從通用劇本拿一個來用」
        console.log(`🔄 切換至通用填充 (Universal Filler)`);
        
        // 嘗試找 univ_filler
        let fillers = db.templates.filter(t => t.type === 'univ_filler');
        
        // 如果是「高張力/危險」狀態，優先找危險 filler
        if (tension > 50 || currentTags.includes('risk_high')) {
            let dangerFillers = fillers.filter(t => t.conditions && t.conditions.risk_high);
            if (dangerFillers.length > 0) fillers = dangerFillers;
        }

        if (fillers.length > 0) {
            return fillers[Math.floor(Math.random() * fillers.length)];
        }
        
        // 真的什麼都沒有了，回傳 null 讓 generate 處理
        return null;
    }

    // ===========================
    // 步驟 6: 隨機抽出
    // ===========================
    return finalPool[Math.floor(Math.random() * finalPool.length)];
},

    generateOptions: function(tmpl, fragments, lang, type) {
        let opts = [];
        if (tmpl.options && tmpl.options.length > 0) {
             return tmpl.options.map(o => {
                 let newRew = o.rewards ? JSON.parse(JSON.stringify(o.rewards)) : undefined;
                 let defaultAction = (o.nextScene || o.nextSceneId) ? 'node_next' : 'advance_chain';
                 return { ...o, action: o.action || defaultAction, rewards: newRew };
             });
        }
        
        if (type.includes('climax') || type.includes('boss')) {
            opts.push({ label: "決一死戰！", style: "danger", action: "finish_chain" }); 
        } else if (type.includes('ending')) {
            opts.push({ label: this._t('finish', lang), style: "primary", action: "finish_chain" });
        } else {
            opts.push({ label: this._t('explore_deeper', lang), action: "advance_chain", nextTags: ['risk_high'] });
        }
        return opts;
    }
};