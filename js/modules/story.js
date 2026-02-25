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
        
        // ✅ 1. 先建立基礎結構 (如果不存在的話)
        if (!gs.story) gs.story = { energy: this.calculateMaxEnergy(), deck: [], learning: {}, tags: [], vars: {} };
        
        // ✅ 2. 結構存在後，再來檢查或補齊裡面的屬性
        if (!gs.story.lastEnergyUpdate) gs.story.lastEnergyUpdate = Date.now();
        if (!gs.story.tags) gs.story.tags = [];
        if (!gs.story.learning) gs.story.learning = {};
        if (!gs.story.vars) gs.story.vars = {}; // [New] 數值變數儲存區
        if (!gs.story.flags) gs.story.flags = {}; // [新增] 全域 (永久保留)
        
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
        
        // [Critical Fix] 建立或獲取全域查找表
        // 注意：這裡不能直接 = window._SCENE_POOL，因為那樣會清空動態生成的 sub_ 場景
        if (!window.StoryData.sceneMap) window.StoryData.sceneMap = {};

        // 1. 將靜態場景池「合併」進去 (而不是覆蓋)
        if (window._SCENE_POOL) {
            Object.assign(window.StoryData.sceneMap, window._SCENE_POOL);
        }

        // 2. 載入模式特定的場景
        if (sceneDB[mode]) {
            sceneDB[mode].forEach(scene => {
                if (scene.id) window.StoryData.sceneMap[scene.id] = scene;
            });
        }

        // 建立牌庫 (Deck)
        let roots = (sceneDB[mode] || []).filter(s => s.entry);
        window.StoryData.pool = [...roots];
        
        // 增加更多隨機事件比例
		const RANDOM_CARD_COUNT = 5; 
		for(let i=0; i < RANDOM_CARD_COUNT; i++) window.StoryData.pool.push('GEN_MODULAR');
        
        // 只有當牌庫真的為空時才重新洗牌，避免頻繁重置
        if (!gs.story.deck || gs.story.deck.length === 0) {
            gs.story.deck = this._shuffle([...window.StoryData.pool]);
        }
        
        console.log(`📚 Database Loaded: Mode [${mode}], Map Size: ${Object.keys(window.StoryData.sceneMap).length}`);
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
	if (window.storyView && storyView.disableOptions) {
        storyView.disableOptions(idx);
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
        
        // [Fix] 針對 finish_chain 的特殊處理
        } else if (opt.action === 'finish_chain') {
            // 檢查是否有「結局劇情」需要播放 (nextScene 或 nextSceneId)
            // 如果檢定有過用 next，沒過用 fail
            let hasEndingScene = passed 
                ? (opt.nextScene || opt.nextSceneId) 
                : (opt.failScene || opt.failSceneId);

            if (hasEndingScene) {
                // A. 如果有結局文本 -> 把它當作一次普通的跳轉
                // 引擎會播放這段文字。因為這段文字通常沒有 options，
                // playSceneNode 會自動幫它加上一個「離開」按鈕 (這個按鈕的 action 也是 finish_chain)
                this._handleNodeJump(opt, passed);
            } else {
                // B. 如果沒有結局文本 (直接結束) -> 才執行清理
                this.finishChain();
            }
            
        } else {
            // 預設行為
            this.finishChain();
        }
        
        if(window.App) App.saveData();
    }, this.CONSTANTS.CLICK_DELAY);
},

    // 處理節點跳轉 (抽出邏輯)
// [替換] 修正版跳轉處理
_handleNodeJump: function(opt, passed) {
        let targetId = passed ? opt.nextSceneId : opt.failSceneId;
        
        // 🌟 【全新升級】如果 targetId 是一個陣列，系統就會自動幫你隨機抽一個！
        if (Array.isArray(targetId)) {
            targetId = targetId[Math.floor(Math.random() * targetId.length)];
            console.log(`🎲 陣列隨機跳轉觸發！抽中路線: ${targetId}`);
        }

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
    const gs = window.GlobalState;
    gs.story.chain = null;
    gs.story.currentNode = null;
    gs.story.savedChain = null;
    window.TempState.currentSceneNode = null;
    window.TempState.storyCard = null;
    if (gs.story) {
        gs.story.tags = []; // 清空標籤
        gs.story.vars = {}; // 清空區域數值
    }

    window.TempState.isProcessing = false;
    window.TempState.lockInput = false;
    
    if(window.act && window.act.toast) act.toast("🗑️ 已放棄目前的冒險");
    
    if (window.storyView) storyView.renderIdle();
    if(window.App) App.saveData();
    // 更新介面，確保金幣/精力顯示正確
    if (window.view && window.view.updateStoryHUD) window.view.updateStoryHUD();
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
    let checks = Array.isArray(cond.vars) ? cond.vars : (cond.var ? [cond.var] : []);

    for (let check of checks) {
        let key = check.key;
        let targetVal = Number(check.val);
        let op = check.op || '>=';
        let currentVal = 0;

        // 【讀取分流】
        if (key === 'gold') currentVal = gs.gold || 0;
        else if (key === 'energy') currentVal = gs.story.energy || 0;
        else if (key === 'exp') currentVal = gs.exp || 0;
        else if (myVars[key] !== undefined) currentVal = Number(myVars[key]); // 查區域
		else if (gs.story.flags && gs.story.flags[key] !== undefined) currentVal = Number(gs.story.flags[key]); // 查全域
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
    
    // 計算最大精力
    const maxEnergy = this.calculateMaxEnergy ? this.calculateMaxEnergy() : 30;

    // ==========================================
    // 1. 處理【直接資源】 (Direct Rewards)
    // ==========================================
    
    // 金幣 (Gold)
    if (rewards.gold) { 
        gs.gold = (gs.gold || 0) + rewards.gold; 
        // ✅ [Check] 確保顯示 Toast
        msgs.push(`💰 ${rewards.gold > 0 ? '+' : ''}${rewards.gold}`); 
    }
    
    // 精力 (Energy)
    if (rewards.energy) { 
        let oldE = gs.story.energy || 0;
        let newE = oldE + rewards.energy;
        
        if (rewards.energy > 0) {
            gs.story.energy = Math.min(maxEnergy, newE); // 加法鎖上限
        } else {
            gs.story.energy = Math.max(0, newE); // 減法鎖 0
        }
        
        // ✅ [Check] 數值有變才顯示
        if (gs.story.energy !== oldE) {
            msgs.push(`⚡ ${rewards.energy > 0 ? '+' : ''}${rewards.energy}`); 
        }
    }
    
    // 經驗 (Exp)
    if (rewards.exp) { 
        gs.exp = (gs.exp || 0) + rewards.exp; 
        // ✅ [Check] 確保顯示 Toast
        msgs.push(`✨ ${rewards.exp > 0 ? '+' : ''}${rewards.exp}`); 
    }
    
    // 標籤 (Tags) - 您原本的代碼有顯示，若想保留則不動
    if (rewards.tags) rewards.tags.forEach(tag => { 
        const finalTag = this._resolveDynamicText(tag);
        if (!gs.story.tags.includes(finalTag)) { 
            gs.story.tags.push(finalTag);  
            // msgs.push(`🏷️ 獲得: ${finalTag}`); // 如果您想隱藏 Tag 提示，請註解此行
        } 
    });
    if (rewards.removeTags) rewards.removeTags.forEach(tag => { 
        const idx = gs.story.tags.indexOf(tag); 
        if (idx > -1) { 
            gs.story.tags.splice(idx, 1);  
            // msgs.push(`🗑️ 消耗: ${tag}`); // 如果您想隱藏 Tag 提示，請註解此行
        } 
    });

    // ==========================================
    // 2. 處理【變數運算】 (VarOps)
    // ==========================================
    if (rewards.varOps) {
        rewards.varOps.forEach(op => {
            const k = op.key;
            const v = Number(op.val) || 0;

            // --- 分流 A: 金幣 (Gold) ---
            if (k === 'gold') {
                if (op.op === '+' || op.op === 'add') gs.gold += v;
                else if (op.op === '-' || op.op === 'sub') gs.gold -= v;
                else if (op.op === '=' || op.op === 'set') gs.gold = v;
                
                // ✅ [Fix] 補上金幣的 Toast
                msgs.push(`💰 金幣: ${v > 0 ? '+' : ''}${v}`);
            } 
            // --- 分流 B: 精力 (Energy) ---
            else if (k === 'energy') {
                let oldE = gs.story.energy || 0;
                let targetE = oldE;

                if (op.op === '+' || op.op === 'add') targetE += v;
                else if (op.op === '-' || op.op === 'sub') targetE -= v;
                else if (op.op === '=' || op.op === 'set') targetE = v;

                if (targetE > oldE) gs.story.energy = Math.min(maxEnergy, targetE);
                else gs.story.energy = Math.max(0, targetE);

                let diff = gs.story.energy - oldE;
                
                // ✅ [Fix] 修復原本的空語句錯誤 "if (diff !== 0) ;"
                if (diff !== 0) {
                    msgs.push(`⚡ 精力: ${diff > 0 ? '+' : ''}${diff}`);
                }
            }
            // --- 分流 C: 全域變數 (Global Flags) ---
            else if (k.startsWith("g_")) {
                const realKey = k.substring(2);
                if (!gs.story.flags) gs.story.flags = {};
                if (typeof gs.story.flags[realKey] === 'undefined') gs.story.flags[realKey] = 0;

                if (op.op === '+' || op.op === 'add') gs.story.flags[realKey] += v;
                else if (op.op === '-' || op.op === 'sub') gs.story.flags[realKey] -= v;
                else if (op.op === '=' || op.op === 'set') gs.story.flags[realKey] = v;
                
                // 這裡通常不顯示 Toast，除非有設定 msg
            }
            // --- 分流 D: 區域變數 (Local Vars) ---
            else {
                if (typeof gs.story.vars[k] === 'undefined') gs.story.vars[k] = 0;
                
                if (op.op === '+' || op.op === 'add') gs.story.vars[k] += v;
                else if (op.op === '-' || op.op === 'sub') gs.story.vars[k] -= v;
                else if (op.op === '=' || op.op === 'set') gs.story.vars[k] = v;

                // 顯示邏輯：如果有 msg 就顯示
                if (op.msg) {
                    msgs.push(op.msg);
                }
            }
        });
    }

    // ==========================================
    // 3. 發送 Toast 與 更新介面
    // ==========================================
    
    // [Check] 這裡使用 act.toast 發送訊息
    if (msgs.length > 0) {
        // 優先使用 EventBus (解耦)，如果沒有則嘗試 act.toast
        if (window.EventBus) {
            window.EventBus.emit('SYSTEM_TOAST', msgs.join("  "));
        } else if (window.act && window.act.toast) {
            act.toast(msgs.join("  "));
        }
    }
    
    if (window.view && window.view.updateStoryHUD) window.view.updateStoryHUD();
    // 如果有 storyView，也更新它的頂部欄 (精力條)
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
        
        return textArr.map(t => {
            // 1. 先解析你原本的靜態變數 (例如 {detective}, {sanity}, {gold})
            let resolvedText = this._resolveDynamicText(t);

            // 🌟 2. 終極攔截：呼叫引擎解析隨機詞庫 (例如 {atom_weather}, {atom_smell})
            if (window.StoryGenerator && window.FragmentDB) {
                 const gs = window.GlobalState;
                 const memory = (gs && gs.story && gs.story.chain && gs.story.chain.memory) 
                                ? gs.story.chain.memory 
                                : {};
                 // 強制經過翻譯引擎
                 resolvedText = window.StoryGenerator._expandGrammar(resolvedText, window.FragmentDB, memory);
            }

            // 3. 最後套用 CSS 顏色與排版
            return this._formatText(resolvedText);
        });
    },

    // 5. [核心修改] resolveDynamicText - 支援顯示變數值
    _resolveDynamicText: function(text) {
    if (!text || typeof text !== 'string') return text;
    const gs = window.GlobalState;
    const memory = (gs.story.chain && gs.story.chain.memory) ? gs.story.chain.memory : {};
    const vars = gs.story.vars || {};
    // [新增] 讀取全域變數 (flags)
    const flags = gs.story.flags || {}; 

    return text.replace(/{(\w+)}/g, (match, key) => {
        // 1. 優先找 Chain 記憶 (劇本角色名, e.g. "detective")
        if (memory[key]) return memory[key];
        
        // 2. 其次找 區域變數 (當前劇本數值, e.g. "sanity")
        if (typeof vars[key] !== 'undefined') return vars[key];
        
        // 3. 再找 全域標記 (跨劇本數值, e.g. "total_wins")
        if (typeof flags[key] !== 'undefined') return flags[key];

        // 4. 【核心修復】最後找 全域狀態 (金幣, 經驗, 等級)
        // 這樣 {gold} 就能正確顯示 gs.gold 的值了
        if (typeof gs[key] !== 'undefined') return gs[key];

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
             return (speaker === '旁白' || !speaker) ? `${txt}` : `<b>${speaker}</b>：「${txt}」`;
        });
        
        // 將對話轉為單一節點播放，結束後保留原有的 options
        this.playSceneNode({ ...node, text: textQueue, dialogue: null });
    },

    // ============================================================
    //  [SECTION 5] VIEW BRIDGE & HELPERS (視圖與輔助區)
    // ============================================================
    // 代理 Controller 的點擊
    makeChoice: function(idx) { this.selectOption(idx); },
    
    // UI 點擊畫面 (打字機加速)
    clickScreen: function() {
    // 1. 如果處於輸入鎖定狀態 (防連點冷卻中)，直接無視點擊
    if (window.TempState.lockInput) return;

    // 2. 判斷現在是「正在打字」還是「等待閱讀」
    // 我們透過檢查 typingTimer 是否存在來判斷
    if (window.TempState.typingTimer) {
        // [情況 A] 正在打字 -> 玩家想加速顯示 (Skip)
        window.TempState.skipRendering = true;
        
        // 【核心修復】 加速後，強制鎖定 0.3 秒
        // 這能防止玩家點太快，把「加速」變成「下一頁」
        window.TempState.lockInput = true;
        setTimeout(() => {
            window.TempState.lockInput = false;
        }, 300); 
        
    } else {
        // [情況 B] 打字已完成 -> 玩家想看下一段 (Next)
        if (window.TempState.isWaitingInput) {
            this.playNextChunk();
        }
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
    const gs = window.GlobalState;
    // 1. 清除導航狀態
    gs.story.chain = null; 
    gs.story.currentNode = null; 
    gs.story.savedChain = null;
    window.TempState.currentSceneNode = null; 
    window.TempState.storyCard = null;
    
    // 2. 【關鍵】徹底清空區域變數與標籤 (這部分不會影響 gs.gold 與 gs.exp)
    if (gs.story) {
        gs.story.tags = []; // 清空標籤
        gs.story.vars = {}; // 清空此劇本專屬數值 (如 SAN、好感度)
        console.log("🧹 區域變數與標籤已清空");
    }

    // 3. UI 復原與存檔
    if (window.storyView) storyView.renderIdle();
    if (window.App) App.saveData();
    if (window.view && window.view.updateStoryHUD) window.view.updateStoryHUD();
    
    console.log("🏁 劇本流程結束，全域數值已保留。");
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
        // 定義更新邏輯函式
        const updateEnergy = () => {
            const gs = window.GlobalState;
            
            // ✅ 加上防呆：如果故事系統還沒初始化完畢，直接跳過不計算
            if (!gs || !gs.story) return; 

            const now = Date.now();
            const timeDiff = now - (gs.story.lastEnergyUpdate || now);
            const REGEN_MS = this.CONSTANTS.ENERGY_REGEN_MS;

        // 如果經過時間大於 1 個週期
        if (timeDiff >= REGEN_MS) {
            const recoverAmount = Math.floor(timeDiff / REGEN_MS);
            const max = this.calculateMaxEnergy();
            
            // 只有未滿時才計算
            if (gs.story.energy < max) {
                // 計算回復後的數值，但不超過上限
                // 注意：這裡不應該用 += recoverAmount 直接加，因為可能溢出
                // 邏輯：(當前 + 回復量) 與 Max 取小
                const potentialEnergy = gs.story.energy + recoverAmount;
                gs.story.energy = Math.min(max, potentialEnergy);
                
                // 更新 UI
                if (window.storyView && storyView.updateTopBar) storyView.updateTopBar();
            }

            // 更新時間戳 (扣除餘數，保留未滿一分鐘的時間累計)
            gs.story.lastEnergyUpdate = now - (timeDiff % REGEN_MS);
            
            // 存檔 (重要，避免刷新後時間重置)
            if(window.App) App.saveData();
        }
    };

    // 1. 啟動時先算一次 (處理離線回復)
    updateEnergy();

    // 2. 之後每 10 秒檢查一次即可 (不用精準對齊 60秒，因為是靠時間戳算)
    setInterval(updateEnergy, 10000); 
},
};