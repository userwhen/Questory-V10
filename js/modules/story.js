/* js/modules/story.js - V76.0 (Refactored & Optimized) */

window.StoryEngine = {
    // ============================================================
    // ⚙️ [SECTION 0] CONFIG & CONSTANTS (參數配置區)
    // ============================================================
    // [Mod] 將所有魔術數字集中管理，方便調整遊戲節奏
    CONSTANTS: {
        TRANSITION_DELAY: 1500, // 過場動畫時間
        CLICK_DELAY: 200,       // 點擊選項後的防誤觸延遲
        ENERGY_COST: 5,         // 探索消耗
        BASE_ENERGY_MAX: 30,    // 基礎精力上限
        ENERGY_REGEN_MS: 60000  // 精力恢復間隔 (1分鐘)
    },

    // ============================================================
    // 🚀 [SECTION 1] SYSTEM & INITIALIZATION (系統啟動區)
    // ============================================================
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        
        // 1. 初始化資料結構
        if (!gs.story) gs.story = { energy: this.calculateMaxEnergy(), deck: [], learning: {}, tags: [], vars: {} };
        if (!gs.story.tags) gs.story.tags = [];
        if (!gs.story.learning) gs.story.learning = {};
        if (!gs.story.vars) gs.story.vars = {}; // [New] 數值變數儲存區
        
        window.TempState.isProcessing = false;
        window.TempState.lockInput = false;
        window.TempState.isWaitingInput = false;

        this.loadDatabase();
        this.checkEnergyLoop();
        console.log("⚙️ StoryEngine V78.0 (Variable System) Ready");
    },

    loadDatabase: function() {
        window.StoryData = window.StoryData || {};
        const gs = window.GlobalState;
        const sceneDB = window.SCENE_DB || {};
        // 預設模式 fallback
        const mode = (gs.settings && gs.settings.gameMode) ? gs.settings.gameMode : 'adventurer';
        
        // 建立全域查找表
        window.StoryData.sceneMap = window._SCENE_POOL || {};
        if (sceneDB[mode]) {
            sceneDB[mode].forEach(scene => {
                if (scene.id) window.StoryData.sceneMap[scene.id] = scene;
            });
        }

        // 建立牌庫 (Deck)
        let roots = (sceneDB[mode] || []).filter(s => s.entry);
        window.StoryData.pool = [...roots];
        // [Opt] 增加更多隨機事件比例
        // [修改] 這裡的數字 5 代表放入 5 張隨機劇本卡 (原為 3)，您可以將 5 改為任何數字來調整機率
		const RANDOM_CARD_COUNT = 5; 
		for(let i=0; i < RANDOM_CARD_COUNT; i++) window.StoryData.pool.push('GEN_MODULAR');
        
        if (!gs.story.deck || gs.story.deck.length === 0) {
            gs.story.deck = this._shuffle([...window.StoryData.pool]);
        }
    },

    // ============================================================
    // 🗺️ [SECTION 2] FLOW & NAVIGATION (導航控制區)
    // ============================================================
    // 核心：播放節點
    playSceneNode: function(node) {
    if (!node) { this.drawAndPlay(); return; }
    
    // [Fix] 確保如果是變數更新導致的重繪，不會被視為舊內容
    // 我們透過深拷貝一個臨時節點來確保文字會被重新解析
    let activeNode = { ...node }; 

    if (activeNode.dialogue && activeNode.dialogue.length > 0) { 
        this.playDialogueChain(activeNode); 
        return; 
    }

    if (!activeNode.id) {
        activeNode.id = `gen_${Date.now()}_${Math.floor(Math.random()*9999)}`;
        // 注意：這裡不一定要存回 Map，除非需要存檔引用
    }

    // 觸發進入事件
    if (activeNode.onEnter) {
        this._distributeRewards(activeNode.onEnter);
    }

    // 註冊子場景
    if (activeNode.options) {
        activeNode.options.forEach(opt => {
            this._registerSubScene(opt.nextScene);
            this._registerSubScene(opt.failScene);
            if (opt.nextScene && !opt.nextSceneId) opt.nextSceneId = opt.nextScene.id;
            if (opt.failScene && !opt.failSceneId) opt.failSceneId = opt.failScene.id;
        });
    }
    
    // 存檔邏輯
    const safeNode = this._sanitizeNodeForSave(activeNode);
    window.GlobalState.story.currentNode = safeNode;
    
    // 設置當前狀態
    window.TempState.currentSceneNode = activeNode;
    window.TempState.storyCard = activeNode;
    
    // [關鍵修正] 這裡會呼叫 _processText -> _resolveDynamicText
    // 因為 activeNode.text 還是原始的 "{time_left}" 字串，所以這裡會解析出最新的數字
    let processedText = this._processText(activeNode.text);
    
    // 處理選項
    let options = (activeNode.options || [])
        .filter(opt => this._checkCondition(opt.condition)) 
        .map(opt => ({
            ...opt, 
            label: this._resolveDynamicText(opt.label),
            action: opt.action || 'node_next'
        }));

    if (options.length === 0 && !node.noDefaultExit) {
    options.push({ label: "離開", action: "finish_chain", style: "primary" });}
	
    window.TempState.storyQueue = processedText;
    window.TempState.storyStep = 0;
    window.TempState.storyOptions = options;
    window.TempState.isWaitingInput = true; 
    window.TempState.isProcessing = false;

    // [關鍵修正] 強制 View 清除畫面並重繪，即使是同一個 Scene ID
    if (window.storyView && storyView.clearScreen) {
        storyView.clearScreen();
        this.playNextChunk();
    }
    if(window.App) App.saveData();
},

    // 2. [核心修改] selectOption - 支援數值運算
    selectOption: function(idx) {
    // 1. 強力防連點
    if (window.TempState.isProcessing) {
        console.warn("⛔ 點擊被攔截：系統忙碌中");
        return;
    }
    
    // 2. [Critical Fix] 防止空節點崩潰
    if (!window.TempState.storyOptions || window.TempState.storyOptions.length === 0) {
        console.warn("⛔ 點擊無效：當前無選項");
        return;
    }

    window.TempState.isProcessing = true;
    
    // 3. 獲取選項數據
    const ts = window.TempState;
    const opt = ts.storyOptions[idx];
    
    if (!opt) {
        window.TempState.isProcessing = false;
        return;
    }

    // 4. 處理 Locked 按鈕
    if (opt.action === 'locked') {
        if (window.act && window.act.toast) act.toast(opt.msg || "🔒 條件不足");
        setTimeout(() => { window.TempState.isProcessing = false; }, 200);
        return;
    }

    // 5. 執行邏輯 (延遲)
    setTimeout(() => {
        // [Safety Check] 再次檢查節點是否還在 (防止延遲期間被 finishChain 清空)
        if (!window.GlobalState.story.currentNode && opt.action !== 'finish_chain') {
             // 如果節點沒了，且動作不是結束，就不要執行了
             window.TempState.isProcessing = false;
             return;
        }

        window.TempState.isProcessing = false;
        
        if (opt.action === 'answer_quiz') {
            this.handleQuizResult(opt.wordId, opt.isCorrect);
            this.finishChain();
            return;
        }

        let passed = true;
        if (opt.check) {
            const stat = this.getPlayerStat(opt.check.stat);
            const roll = Math.floor(Math.random()*20)+1;
            passed = (stat + roll >= opt.check.val);
            if(window.storyView && storyView.appendInlineCheckResult) storyView.appendInlineCheckResult(opt.check.stat, stat+roll, passed);
        }

        if (passed && opt.rewards) this._distributeRewards(opt.rewards);

        if (opt.action === 'node_next') {
            this._handleNodeJump(opt, passed);
        } else if (opt.action === 'investigate') {
            if(opt.result) this.playSceneNode({ ...window.TempState.currentSceneNode, text: [opt.result], options: ts.storyOptions });
            else this.playSceneNode(window.TempState.currentSceneNode);
        } else if (opt.action === 'advance_chain') {
            const tags = passed ? (opt.nextTags||[]) : (opt.failNextTags||[]);
            this.advanceChain(tags);
        } else {
            this.finishChain();
        }
        
        if(window.App) App.saveData();
    }, this.CONSTANTS.CLICK_DELAY);
},

    // 處理節點跳轉 (抽出邏輯)
// [替換] 修正版跳轉處理
_handleNodeJump: function(opt, passed) {
    let targetId = passed ? opt.nextSceneId : opt.failSceneId;
    
    // [Critical Fix] 攔截特殊指令 GEN_MODULAR
    if (targetId === 'GEN_MODULAR') {
        console.log("🎲 偵測到隨機冒險指令，啟動生成器...");
        this.startRandomChain();
        return;
    }

    // 正常場景跳轉
    let targetNode = this.findSceneById(targetId);
    
    // Fallback: 如果 ID 找不到，嘗試直接使用物件引用
    if (!targetNode) {
        targetNode = passed ? opt.nextScene : opt.failScene;
    }
    
    if (targetNode) {
        this.playSceneNode(targetNode);
    } else {
        console.error(`❌ Scene ID not found: ${targetId} (且無物件 fallback)`);
        // 防止卡死，回到大廳或結束
        if (targetId !== 'GEN_MODULAR') this.finishChain(); 
    }
},
	
	// ============================================================
    // 🔄 [SECTION 2.5] SESSION MANAGEMENT (補回這部分)
    // ============================================================
    // [Fix] 恢復冒險
    resumeStory: function() {
        const gs = window.GlobalState;
        if (window.TempState.currentSceneNode) {
            this.playSceneNode(window.TempState.currentSceneNode);
        }
        else if (gs.story.currentNode) {
            if (!gs.story.chain && gs.story.savedChain) {
                gs.story.chain = this._deepClone(gs.story.savedChain);
            }
            this.playSceneNode(gs.story.currentNode);
        } else {
            this.finishChain();
        }
    },

    // [Fix] 放棄冒險
    abandonStory: function() {
        window.GlobalState.story.chain = null;
        window.GlobalState.story.currentNode = null;
        window.GlobalState.story.savedChain = null;
        window.TempState.currentSceneNode = null;
        window.TempState.storyCard = null;
        
        window.TempState.isProcessing = false;
        window.TempState.lockInput = false;
        
        if(window.act && window.act.toast) act.toast("🗑️ 已放棄目前的冒險");
        
        if (window.storyView) storyView.renderIdle();
        if(window.App) App.saveData();
    },

    // ============================================================
    // 📊 [SECTION 3] STATE & LOGIC (數值與狀態區)
    // ============================================================
    // 獲取玩家屬性
    getPlayerStat: function(key) {
        const gs = window.GlobalState;
        // [Fix] 增加容錯：同時支援 'STR' 和 'str'
        const k = key.toUpperCase();
        if (gs.attrs && gs.attrs[k]) return gs.attrs[k].v || 0;
        return 0;
    },

    // 計算精力上限
    calculateMaxEnergy: function() {
        const lv = window.GlobalState.lv || 1;
        return Math.min(100, this.CONSTANTS.BASE_ENERGY_MAX + (lv - 1) * 2);
    },

    // 檢查條件 (Tags, Stats)
    _checkCondition: function(cond) {
    if (!cond) return true;
    
    const gs = window.GlobalState;
    const myTags = (gs.story && gs.story.tags) ? gs.story.tags : [];
    const myVars = (gs.story && gs.story.vars) ? gs.story.vars : {};
    const chainMem = (gs.story && gs.story.chain && gs.story.chain.memory) ? gs.story.chain.memory : {};

    // 1. Tag 檢查
    if (cond.hasTag && !myTags.includes(cond.hasTag)) return false;
    if (cond.noTag && myTags.includes(cond.noTag)) return false;
    
    // 2. 屬性檢查
    if (cond.stat) { 
        const val = this.getPlayerStat(cond.stat.key || cond.stat); 
        if (val < (cond.val || 0)) return false; 
    }

    // 3. [Critical Fix] 多重變數檢查 (vars 陣列)
    // 解決 JS 物件 key 覆蓋問題
    let checks = [];
    if (cond.vars && Array.isArray(cond.vars)) {
        checks = cond.vars;
    } else if (cond.var) {
        checks = [cond.var];
    }

    for (let i = 0; i < checks.length; i++) {
        const check = checks[i];
        let key, targetVal, op;

        if (typeof check === 'object') {
            key = check.key;
            targetVal = (check.val !== undefined) ? check.val : 0;
            op = check.op || '>=';
        } else {
            // 容錯舊格式
            continue; 
        }

        // 數值來源查找
        let currentVal = 0;
        if (key === 'gold') currentVal = gs.gold || 0;
        else if (key === 'exp') currentVal = gs.exp || 0;
        else if (key === 'energy') currentVal = gs.story.energy || 0;
        else if (myVars[key] !== undefined) currentVal = myVars[key]; 
        else if (chainMem[key] !== undefined) currentVal = chainMem[key];
        else currentVal = 0;

        currentVal = Number(currentVal);
        targetVal = Number(targetVal);

        // 判定
        if (op === '>' && currentVal <= targetVal) return false;
        if (op === '>=' && currentVal < targetVal) return false;
        if (op === '<' && currentVal >= targetVal) return false;
        if (op === '<=' && currentVal > targetVal) return false;
        if (op === '==' && currentVal !== targetVal) return false;
        if (op === '!=' && currentVal === targetVal) return false;
    }

    return true;
},

    // 4. [核心修改] distributeRewards - 支援變數加減 (Action Points)
    _distributeRewards: function(rewards) {
    const gs = window.GlobalState;
    if (!gs.story.vars) gs.story.vars = {};
    let msgs = [];
    
    // A. 基礎資源 (直接修改 GlobalState)
    if (rewards.gold) { 
        gs.gold = (gs.gold || 0) + rewards.gold; 
        msgs.push(`💰 ${rewards.gold > 0 ? '+' : ''}${rewards.gold}`); 
    }
    if (rewards.exp) { 
        gs.exp = (gs.exp || 0) + rewards.exp; 
        msgs.push(`✨ ${rewards.exp > 0 ? '+' : ''}${rewards.exp}`); 
    }
    if (rewards.energy) { 
        gs.story.energy = Math.min(this.calculateMaxEnergy(), (gs.story.energy || 0) + rewards.energy); 
        msgs.push(`⚡ ${rewards.energy > 0 ? '+' : ''}${rewards.energy}`); 
    }
    
    // B. Tags 操作
    if (rewards.tags) rewards.tags.forEach(tag => { 
        const finalTag = this._resolveDynamicText(tag);
        if (!gs.story.tags.includes(finalTag)) { gs.story.tags.push(finalTag); msgs.push(`🏷️ 獲得: ${finalTag}`); } 
    });
    if (rewards.removeTags) rewards.removeTags.forEach(tag => { 
        const idx = gs.story.tags.indexOf(tag); 
        if (idx > -1) { gs.story.tags.splice(idx, 1); msgs.push(`🗑️ 消耗: ${tag}`); } 
    });

    // C. 變數運算
    if (rewards.varOps) {
        rewards.varOps.forEach(op => {
            const k = op.key;
            const v = op.val || 0;
            
            // 特殊處理 gold/exp 的 varOps (如果有的話)
            if (k === 'gold') {
                 if (op.op === '+' || op.op === 'add') gs.gold += v;
                 else if (op.op === '-' || op.op === 'sub') gs.gold -= v;
            } else {
                // 一般劇情變數
                if (typeof gs.story.vars[k] === 'undefined') gs.story.vars[k] = 0;
                let oldVal = gs.story.vars[k];
                if (op.op === '+' || op.op === 'add') gs.story.vars[k] += v;
                else if (op.op === '-' || op.op === 'sub') gs.story.vars[k] -= v;
                else if (op.op === '=' || op.op === 'set') gs.story.vars[k] = v;
                
                // 顯示提示
                if (op.msg) msgs.push(op.msg);
                else if (k === 'maid_love') msgs.push(`❤️ ${gs.story.vars[k] - oldVal > 0 ? '+' : ''}${gs.story.vars[k] - oldVal}`);
            }
        });
    }

    // [Critical Fix] 立即刷新 UI
    if (msgs.length > 0 && window.act && window.act.toast) act.toast(msgs.join("  "));
    
    if (window.view && window.view.updateStoryHUD) {
        window.view.updateStoryHUD(); // 強制刷新頂部欄
    } else if (window.storyView && window.storyView.updateTopBar) {
        window.storyView.updateTopBar(); // Fallback
    }
},

    // 探索入口
    explore: function() { 
    const gs = window.GlobalState; 
    if (!gs.story) this.init(); 
    
    if (gs.story.energy < this.CONSTANTS.ENERGY_COST) { 
        if(window.act) act.toast("❌ 精力不足"); 
        return { success: false, msg: "精力不足" }; 
    }
    
    gs.story.energy -= this.CONSTANTS.ENERGY_COST;
    if (window.storyView) storyView.updateTopBar();

    // 定義過場文字庫
    const transitionTexts = [
        "探索中...",
        "正在前往未知的區域...",
        "腳步聲在迴廊中迴盪...",
        "四周變得越來越暗...",
        "似乎發現了什麼..."
    ];
    const randomText = transitionTexts[Math.floor(Math.random() * transitionTexts.length)];

    // 1. 播放過場文字 (這會重置 isProcessing 為 false)
    this.playSceneNode({ text: randomText, options: [],noDefaultExit: true }); 
    
    // 2. [修正] 在播放後「再次強制鎖定」，確保過場期間不可互動
    window.TempState.isProcessing = true; 
    window.TempState.lockInput = true;    // 額外防止點擊文字換頁
    
    setTimeout(() => { 
        window.TempState.lockInput = false; 
        window.TempState.isProcessing = false; 
        this.drawAndPlay(); 
        if(window.App) App.saveData(); 
    }, this.CONSTANTS.TRANSITION_DELAY);
    
    return { success: true }; 
},

    // ============================================================
    // 📝 [SECTION 4] TEXT & DIALOGUE (文字處理區)
    // ============================================================
    _processText: function(rawText) {
        let textArr = Array.isArray(rawText) ? rawText : [rawText || "(...)"];
        return textArr.map(t => this._formatText(this._resolveDynamicText(t)));
    },

    // 5. [核心修改] resolveDynamicText - 支援顯示變數值
    _resolveDynamicText: function(text) {
        if (!text || typeof text !== 'string') return text;
        const gs = window.GlobalState;
        const memory = (gs.story.chain && gs.story.chain.memory) ? gs.story.chain.memory : {};
        const vars = gs.story.vars || {};

        return text.replace(/{(\w+)}/g, (match, key) => {
            // 優先找 Chain 記憶 (演員名)
            if (memory[key]) return memory[key];
            // 其次找 全局變數 (數值)
            if (typeof vars[key] !== 'undefined') return vars[key];
            return match;
        });
    },

    _formatText: function(text) {
        // [Opt] 簡單的正則樣式替換
        if (/^[\(（].*[\)）]$/.test(text)) return `<div class="story-narrative" style="color:#aaa;">${text}</div>`;
        if (text.includes("：") || text.includes("「")) return `<div class="story-dialogue" style="color:#ffd700;">${text}</div>`;
        return `<div class="story-action" style="color:#fff;">${text}</div>`;
    },

    playDialogueChain: function(node) {
        const dialogues = node.dialogue;
        const lang = (window.GlobalState.settings && window.GlobalState.settings.targetLang) ? window.GlobalState.settings.targetLang : 'zh';
        
        let textQueue = dialogues.map(d => {
             const txt = d.text[lang] || d.text['zh'] || d.text;
             const speaker = d.speaker;
             return (speaker === '旁白' || !speaker) ? `（${txt}）` : `<b>${speaker}</b>：「${txt}」`;
        });
        
        // 將對話轉為單一節點播放，結束後保留原有的 options
        this.playSceneNode({ ...node, text: textQueue, dialogue: null });
    },

    // ============================================================
    // 👁️ [SECTION 5] VIEW BRIDGE & HELPERS (視圖與輔助區)
    // ============================================================
    // 代理 Controller 的點擊
    makeChoice: function(idx) { this.selectOption(idx); },
    
    // UI 點擊畫面 (打字機加速)
    clickScreen: function() {
        if (window.TempState.isWaitingInput && !window.TempState.lockInput) {
            this.playNextChunk();
        }
    },

    playNextChunk: function() {
        const ts = window.TempState;
        if (ts.lockInput || !ts.storyQueue) return;

        if (ts.storyStep < ts.storyQueue.length) {
            let html = ts.storyQueue[ts.storyStep];
            let isLast = (ts.storyStep === ts.storyQueue.length - 1);
            if (window.storyView) storyView.appendChunk(html, isLast);
            ts.storyStep++;
        } 
        
        if (ts.storyStep >= ts.storyQueue.length) {
            ts.isWaitingInput = false; 
            if (window.storyView) storyView.showOptions(ts.storyOptions);
        }
    },

    // 輔助：深拷貝 (效能優化版)
    _deepClone: function(obj) {
        if (!obj) return obj;
        if (typeof structuredClone === 'function') {
            try { return structuredClone(obj); } catch(e) { /* Fallback if contains functions */ }
        }
        return JSON.parse(JSON.stringify(obj));
    },

    // 輔助：存檔淨化
    _sanitizeNodeForSave: function(node) {
        const safe = {
            id: node.id, text: node.text, type: node.type, rewards: node.rewards
        };
        if (node.options) {
            safe.options = node.options.map(opt => {
                const safeOpt = { ...opt };
                
                // 檢查 nextScene
                if (safeOpt.nextScene) {
                    // 如果這個場景 ID 存在於靜態庫 (SCENE_POOL) 中，我們只存 ID，省空間
                    const isStatic = (window._SCENE_POOL && window._SCENE_POOL[safeOpt.nextScene.id]);
                    if (isStatic) {
                        delete safeOpt.nextScene; 
                    } 
                    // 否則 (隨機生成的 sub_...), 我們保留整個物件，以便讀檔時恢復
                }

                // 檢查 failScene (同上)
                if (safeOpt.failScene) {
                    const isStatic = (window._SCENE_POOL && window._SCENE_POOL[safeOpt.failScene.id]);
                    if (isStatic) delete safeOpt.failScene;
                }
                
                return safeOpt;
            });
        }
        return safe;
    },
    
    _registerSubScene: function(subNode) {
        if (subNode && !subNode.id) {
            subNode.id = `sub_${Date.now()}_${Math.floor(Math.random()*999)}`;
            window.StoryData.sceneMap[subNode.id] = subNode;
        }
    },
    
    // 輔助：註冊子場景
    _registerSubScene: function(subNode) {
        if (subNode && !subNode.id) {
            subNode.id = `sub_${Date.now()}_${Math.floor(Math.random()*999)}`;
            window.StoryData.sceneMap[subNode.id] = subNode;
        }
    },
    
    _renderSimple: function(textArr, options) {
        // Fallback for debugging without View
        console.log("TEXT:", textArr.join("\n"));
        console.log("OPTS:", options);
    },

    _shuffle: function(arr) { return arr.sort(() => Math.random() - 0.5); },

    findSceneById: function(id) {
        if (!window.StoryData.sceneMap) this.loadDatabase();
        return window.StoryData.sceneMap[id] || null;
    },

    // ============================================================
    // 📚 [SECTION 6] LEARNING & GEN (學習與生成區)
    // ============================================================
    // [Fix] 實作螺旋學習邏輯 (填補原本的空缺)
    pickSpiralWord: function() {
        if (!window.LearningDB || !window.LearningDB.words) return null;
        // 簡單邏輯：隨機挑選一個單字
        // 進階邏輯可讀取 gs.story.learning 來挑選「不熟悉」的字
        const words = window.LearningDB.words;
        return words[Math.floor(Math.random() * words.length)];
    },

    pickWrongOptions: function(correctId, count) {
        if (!window.LearningDB || !window.LearningDB.words) return [];
        const words = window.LearningDB.words.filter(w => w.id !== correctId);
        return this._shuffle(words).slice(0, count);
    },

    handleQuizResult: function(wordId, isCorrect) {
        const gs = window.GlobalState;
        if (!gs.story.learning[wordId]) gs.story.learning[wordId] = { correct: 0, wrong: 0 };
        
        if (isCorrect) {
            gs.story.learning[wordId].correct++;
            if(window.act) act.toast("✅ 回答正確！記憶加深。");
            // 給予少量獎勵
            this._distributeRewards({ exp: 10, gold: 5 });
        } else {
            gs.story.learning[wordId].wrong++;
            if(window.act) act.toast("❌ 答錯了... 請再接再厲。");
        }
    },

    // 隨機鏈生成
    startRandomChain: function() {
        const gs = window.GlobalState;
        // 這裡呼叫生成器
        if (window.StoryGenerator && window.StoryGenerator.initChain) {
            // [Fix] 改回隨機，不再強制 mystery
            const modes = ['mystery', 'horror', 'random'];
            const randomMode = modes[Math.floor(Math.random() * modes.length)];
            gs.story.chain = window.StoryGenerator.initChain(randomMode);
            console.log("🎲 隨機劇本啟動，模式:", randomMode);
        } else {
            gs.story.chain = { depth: 0, maxDepth: 5, history: [] };
        }
        this.playSceneNode(StoryGenerator.generate([], true));
    },

    advanceChain: function(nextTags) {
        const gs = window.GlobalState;
        if (!gs.story.chain) return;
        gs.story.chain.depth++;
        this.playSceneNode(StoryGenerator.generate(nextTags, false));
    },

    // 結束鏈
    finishChain: function() {
    // 1. 清除導航狀態
    window.GlobalState.story.chain = null; 
    window.GlobalState.story.currentNode = null; 
    window.GlobalState.story.savedChain = null;
    window.TempState.currentSceneNode = null; 
    window.TempState.storyCard = null;
    
    // 2. [Critical Fix] 清除劇情暫存數據 (Tags 和 Vars)
    // 注意：gold/exp/energy 屬於全局資源，不應該被清除
    if (window.GlobalState.story) {
        window.GlobalState.story.tags = []; // 清空標籤
        window.GlobalState.story.vars = {}; // 清空劇情變數 (好感度、警報值等)
    }

    // 3. UI 復原
    if (window.storyView) storyView.renderIdle();
    if (window.App) App.saveData();
    
    // 4. 再次刷新 HUD 確保狀態正確
    if (window.view && window.view.updateStoryHUD) window.view.updateStoryHUD();
    
    console.log("🏁 Story Chain Finished & Data Cleared.");
},

    drawAndPlay: function() {
    const gs = window.GlobalState;
    
    // 如果牌庫沒了，嘗試載入
    if (!gs.story.deck || gs.story.deck.length === 0) {
        this.loadDatabase();
    }
    
    // [Safety] 如果載入後還是空的 (或者剛初始化)，不要硬抽
    if (!gs.story.deck || gs.story.deck.length === 0) {
        console.warn("⚠️ 牌庫為空，無法抽卡");
        return;
    }

    const card = gs.story.deck.shift();
    
    // [Critical Fix] 確保 card 有值
    if (!card) return;

    if (card === 'GEN_MODULAR') {
        // 這裡不要自動開始，而是確保這是玩家意圖
        // (通常 GEN_MODULAR 是按鈕觸發的，不應該由 drawAndPlay 自動觸發)
        // 但為了兼容舊邏輯，我們先保留，但加上 log
        console.log("🎲 drawAndPlay 抽到了隨機卡");
        this.startRandomChain(); 
    }
    else {
        this.playSceneNode(card);
    }
},

    // 設置語言 (供外部調用)
    setLang: function(lang) {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        gs.settings.targetLang = lang;
        if(window.App) App.saveData();
    },
    
    // 循環：精力恢復
    checkEnergyLoop: function() {
        setInterval(() => { 
            const max = this.calculateMaxEnergy();
            if (window.GlobalState.story.energy < max) {
                window.GlobalState.story.energy++; 
                if (window.storyView && storyView.updateTopBar) storyView.updateTopBar();
            }
        }, this.CONSTANTS.ENERGY_REGEN_MS); 
    }
};