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
        for(let i=0; i<3; i++) window.StoryData.pool.push('GEN_MODULAR');
        
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
        if (node.dialogue && node.dialogue.length > 0) { this.playDialogueChain(node); return; }

        if (!node.id) {
            node.id = `gen_${Date.now()}_${Math.floor(Math.random()*9999)}`;
            window.StoryData.sceneMap[node.id] = node;
        }

        // [New] 節點進入時的自動邏輯 (可選：扣行動點、初始化變數)
        if (node.onEnter) {
            this._distributeRewards(node.onEnter);
        }

        // 註冊子場景 & 存檔邏輯 (保持 V76.3 的修復)
        if (node.options) {
            node.options.forEach(opt => {
                this._registerSubScene(opt.nextScene);
                this._registerSubScene(opt.failScene);
                if (opt.nextScene && !opt.nextSceneId) opt.nextSceneId = opt.nextScene.id;
                if (opt.failScene && !opt.failSceneId) opt.failSceneId = opt.failScene.id;
            });
        }
        
        const safeNode = this._sanitizeNodeForSave(node);
        window.GlobalState.story.currentNode = safeNode;
        if (window.GlobalState.story.chain && !window.GlobalState.story.savedChain) {
            window.GlobalState.story.savedChain = this._deepClone(window.GlobalState.story.chain);
        }

        window.TempState.currentSceneNode = node;
        window.TempState.storyCard = node;
        
        let processedText = this._processText(node.text);
        
        // [Logic Update] 選項過濾現在支援數值判斷
        let options = (node.options || [])
            .filter(opt => this._checkCondition(opt.condition)) 
            .map(opt => ({
                ...opt, 
                label: this._resolveDynamicText(opt.label),
                action: opt.action || 'node_next'
            }));

        if (options.length === 0) options.push({ label: "離開", action: "finish_chain", style: "primary" });

        window.TempState.storyQueue = processedText;
        window.TempState.storyStep = 0;
        window.TempState.storyOptions = options;
        window.TempState.isWaitingInput = true; 
        window.TempState.isProcessing = false;

        if (window.storyView && storyView.clearScreen) {
            storyView.clearScreen();
            this.playNextChunk();
        } else {
            console.log("TEXT:", processedText.join("\n"));
        }
        if(window.App) App.saveData();
    },

    // 2. [核心修改] selectOption - 支援數值運算
    selectOption: function(idx) {
        if (window.TempState.isProcessing) return;
        window.TempState.isProcessing = true;
        setTimeout(() => { window.TempState.isProcessing = false; }, 1000);

        const ts = window.TempState;
        const opt = ts.storyOptions[idx];
        if (!opt) return;

        // 處理 Quiz
        if (opt.action === 'answer_quiz') {
            this.handleQuizResult(opt.wordId, opt.isCorrect);
            setTimeout(() => { window.TempState.isProcessing = false; this.finishChain(); }, 1000);
            return;
        }

        setTimeout(() => {
            window.TempState.isProcessing = false;
            let passed = true;
            
            // A. 屬性檢定 (原有)
            if (opt.check) {
                const stat = this.getPlayerStat(opt.check.stat);
                const roll = Math.floor(Math.random()*20)+1;
                passed = (stat + roll >= opt.check.val);
                if(window.storyView && storyView.appendInlineCheckResult) storyView.appendInlineCheckResult(opt.check.stat, stat+roll, passed);
            }

            // B. 發放獎勵 (含數值運算)
            if (passed && opt.rewards) this._distributeRewards(opt.rewards);

            // C. 執行動作
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
    _handleNodeJump: function(opt, passed) {
        let targetId = passed ? opt.nextSceneId : opt.failSceneId;
        let targetNode = this.findSceneById(targetId);
        
        // [Fix] Fallback: 如果 ID 找不到，嘗試直接使用物件引用
        if (!targetNode) {
            targetNode = passed ? opt.nextScene : opt.failScene;
        }
        
        if (targetNode) {
            this.playSceneNode(targetNode);
        } else {
            console.error(`Scene ID not found: ${targetId} and no object fallback.`);
            this.finishChain(); 
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
        const myTags = gs.story.tags || [];
        const myVars = gs.story.vars || {};

        // A. Tag 檢查 (原有)
        if (cond.hasTag && !myTags.includes(cond.hasTag)) return false;
        if (cond.noTag && myTags.includes(cond.noTag)) return false;
        
        // B. 屬性檢查 (原有)
        if (cond.stat) { 
            const val = this.getPlayerStat(cond.stat.key || cond.stat); 
            if (val < (cond.val || 0)) return false; 
        }

        // C. [New] 變數數值檢查 (Variable Check)
        // 格式: { var: 'maid_love', val: 50, op: '>' }
        if (cond.var) {
            const key = cond.var.key || cond.var;
            const targetVal = cond.val || 0;
            const currentVal = myVars[key] || 0;
            const op = cond.op || '>=';

            if (op === '>' && currentVal <= targetVal) return false;
            if (op === '>=' && currentVal < targetVal) return false;
            if (op === '<' && currentVal >= targetVal) return false;
            if (op === '<=' && currentVal > targetVal) return false;
            if (op === '==' && currentVal !== targetVal) return false;
        }

        return true;
    },

    // 4. [核心修改] distributeRewards - 支援變數加減 (Action Points)
    _distributeRewards: function(rewards) {
        const gs = window.GlobalState;
        if (!gs.story.vars) gs.story.vars = {};
        let msgs = [];
        
        // A. 基礎資源
        if (rewards.gold) { gs.gold += rewards.gold; msgs.push(`💰 +${rewards.gold}`); }
        if (rewards.exp) { gs.exp += rewards.exp; msgs.push(`✨ +${rewards.exp}`); }
        if (rewards.energy) { 
            gs.story.energy = Math.min(this.calculateMaxEnergy(), gs.story.energy + rewards.energy); 
            msgs.push(`⚡ ${rewards.energy>0?'+':''}${rewards.energy}`); 
        }
        
        // B. Tags 操作
        if (rewards.tags) rewards.tags.forEach(tag => { 
            const finalTag = this._resolveDynamicText(tag);
            if (!gs.story.tags.includes(finalTag)) { gs.story.tags.push(finalTag); msgs.push(`🏷️ 獲得: ${finalTag}`); } 
        });
        // [Fix] 支援 removeTags
        if (rewards.removeTags) rewards.removeTags.forEach(tag => { 
            const idx = gs.story.tags.indexOf(tag); 
            if (idx > -1) { gs.story.tags.splice(idx, 1); msgs.push(`🗑️ 消耗: ${tag}`); } 
        });

        // C. [New] 變數運算 (Variable Operations)
        // 格式: varOps: [ { key: 'maid_love', val: 10, op: '+' }, { key: 'ap', val: 1, op: '-' } ]
        if (rewards.varOps) {
            rewards.varOps.forEach(op => {
                const k = op.key;
                const v = op.val || 0;
                if (typeof gs.story.vars[k] === 'undefined') gs.story.vars[k] = 0;
                
                let oldVal = gs.story.vars[k];
                if (op.op === '+' || op.op === 'add') gs.story.vars[k] += v;
                else if (op.op === '-' || op.op === 'sub') gs.story.vars[k] -= v;
                else if (op.op === '=' || op.op === 'set') gs.story.vars[k] = v;

                // 顯示提示 (可選)
                if (op.msg) msgs.push(op.msg); 
                else if (k === 'time_left') msgs.push(`⏳ 時間 ${gs.story.vars[k] - oldVal}`);
                else if (k === 'maid_love') msgs.push(`❤️ 好感度 ${gs.story.vars[k] - oldVal > 0 ? '+' : ''}${gs.story.vars[k] - oldVal}`);
            });
        }

        if (msgs.length > 0 && window.act && window.act.toast) act.toast(msgs.join("  "));
        if (window.storyView && storyView.updateTopBar) storyView.updateTopBar();
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

        // 過場動畫
        window.TempState.lockInput = false; 
        
        window.TempState.isProcessing = true; // 保持 true 以防止玩家在讀取時亂按
        
        this.playSceneNode({ text: ["探索中...", "正在前往未知的區域..."], options: [] }); 
        
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
        window.GlobalState.story.chain = null; 
        window.GlobalState.story.currentNode = null; 
        window.GlobalState.story.savedChain = null;
        window.TempState.currentSceneNode = null; 
        window.TempState.storyCard = null;
        
        // 呼叫 View 回到 Idle 狀態
        if (window.storyView) storyView.renderIdle();
        if(window.App) App.saveData();
    },

    drawAndPlay: function() {
        const gs = window.GlobalState;
        if (gs.story.deck.length === 0) this.loadDatabase();
        const card = gs.story.deck.shift();
        if (card === 'GEN_MODULAR') this.startRandomChain(); 
        else this.playSceneNode(card);
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