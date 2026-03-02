/* js/modules/story.js - V76.0 (Refactored & Optimized) */

// ============================================================
// 🗺️ 山中小屋地圖系統 (Map Manager) - 內文與抽屜連動版
// ============================================================
window.MapManager = {
    map: [],             
    currentRoom: null,   
    building: "未知建築", 

    init: function(buildingName, startRoomName) {
        this.map = [];
        this.building = buildingName || "未知區域"; 
        let startRoom = this.generateRoom(startRoomName); 
        this.map.push(startRoom);
        this.currentRoom = startRoom;
        this.updateLocationString();
    },

    clear: function() {
        this.map = [];
        this.currentRoom = null;
        this.building = "未知建築";
        window.TempState.storyLocation = "未知區域";
    },

    generateRoom: function(forceName = null) {
        let roomName = forceName;
        if (!roomName && window.FragmentDB && window.StoryGenerator) {
            roomName = window.StoryGenerator._expandGrammar("{env_adj}的{env_room}", window.FragmentDB, {});
        } else if (!roomName) {
            roomName = "未知房間";
        }
        // 使用 crypto.randomUUID 確保絕對不碰撞
        let uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'room_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
        return { id: uuid, name: roomName };
    },
	
    injectMapOptions: function(baseOptions) {
        let newOptions = [...baseOptions]; 
        
        // 🌟 動態判斷按鈕名稱與圖示
        let actionLabel = "探索未知";
        let actionIcon = "🚪";
        
        // 安全地取得當前主題
        const currentTheme = window.GlobalState && window.GlobalState.story && window.GlobalState.story.chain 
                             ? window.GlobalState.story.chain.theme : null;

        if (currentTheme === 'mystery') { actionLabel = "前往下一個地點"; actionIcon = "🔎"; }
        else if (currentTheme === 'horror') { actionLabel = "推開未知的門"; actionIcon = "🚪"; }
        else if (currentTheme === 'adventure') { actionLabel = "深入未知區域"; actionIcon = "⚔️"; }
        else if (currentTheme === 'romance') { actionLabel = "轉換場景"; actionIcon = "☕"; }
        else if (currentTheme === 'raising') { actionLabel = "推進排程"; actionIcon = "📅"; }

        // 將動態文字注入按鈕
        newOptions.push({ label: `${actionIcon} ${actionLabel}`, action: "map_explore_new", style: "primary" });
        
        this.map.forEach(room => {
            if (room.id !== this.currentRoom.id) {
                newOptions.push({ label: `🔙 退回 [${room.name}]`, action: "map_move_to", targetId: room.id });
            }
        });
        return newOptions;
    },

    handleMapAction: function(action, targetId) {
        if (action === "map_explore_new") {
            let newRoom = this.generateRoom();
            this.map.push(newRoom);
            this.currentRoom = newRoom;
            this.updateLocationString();
            return `你推開了一扇沉重的木門，來到了 **[${newRoom.name}]**。`;
        } else if (action === "map_move_to") {
            let targetRoom = this.map.find(r => r.id === targetId);
            if (targetRoom) {
                this.currentRoom = targetRoom;
                this.updateLocationString();
                return `你決定原路折返，退回到了 **[${targetRoom.name}]**。`;
            }
        }
        return "";
    },
    // 🌟 修改：將建築與房間組合，存入全域讓 View 讀取
    updateLocationString: function() {
        let room = this.currentRoom ? this.currentRoom.name : "未知房間";
        window.TempState.storyLocation = `${this.building} - ${room}`;
    },
};

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
	// 👇 👇 👇 貼上這段：將地圖資訊安插在文本末端與選項中
    if (activeNode.type && (activeNode.type === 'univ_filler' || activeNode.type.includes('mid') || activeNode.type.includes('adv'))) {
        if (window.MapManager && window.MapManager.map.length > 0) {
            options = window.MapManager.injectMapOptions(options);
        }
    }

    if (options.length === 0 && !node.noDefaultExit) {
        options.push({ label: "離開", action: "finish_chain", style: "primary" });
    }

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
		
		if (opt.action.startsWith('map_')) {
            let transitionText = window.MapManager.handleMapAction(opt.action, opt.targetId);
            if (window.storyView && storyView.updateTopBar) storyView.updateTopBar(); 
            
            // 🌟 動態判斷動作名稱 (根據當前主線的主題)
            let actionLabel = "探索未知";
            let actionIcon = "🗺️";
            const currentTheme = window.GlobalState.story.chain.theme;
            
            if (opt.action === "map_explore_new") {
                if (currentTheme === 'mystery') { actionLabel = "前往下一個地點"; actionIcon = "🔎"; }
                else if (currentTheme === 'horror') { actionLabel = "推開未知的門"; actionIcon = "🚪"; }
                else if (currentTheme === 'adventure') { actionLabel = "深入未知區域"; actionIcon = "⚔️"; }
                else if (currentTheme === 'romance') { actionLabel = "轉換場景"; actionIcon = "☕"; }
                else if (currentTheme === 'raising') { actionLabel = "推進排程"; actionIcon = "📅"; }
            } else {
                actionLabel = "原路折返";
                actionIcon = "🔙";
            }

            const roomName = window.MapManager.currentRoom.name;
            const pathStr = window.MapManager.map.map(r => r.id === window.MapManager.currentRoom.id ? `📍[${r.name}]` : `[${r.name}]`).join(" ─ ");
            
            const inlineHtml = 
			`<span style="color: var(--text-ghost); font-family: monospace, sans-serif; font-size: 0.95rem;">${actionIcon} ${actionLabel}........ </span><span style="font-weight:bold; color:var(--color-info); font-size: 0.95rem;">來到了 [${roomName}]</span><br><span style="color: var(--text-ghost); font-family: monospace, sans-serif; font-size: 0.85rem;">📍 路徑: ${pathStr}</span><br><br>`;
            
            window.TempState.deferredHtml = (window.TempState.deferredHtml || "") + inlineHtml;

            this.advanceChain(); 
            if(window.App) App.saveData();
            return;
        }
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
    if (window.storyView && window.storyView.updateTopBar) window.storyView.updateTopBar();
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
        // [關鍵修復] 改用 StatsEngine 統一接口，確保必定觸發升級檢查與 UI 更新
        if (window.StatsEngine && StatsEngine.addPlayerExp) {
            StatsEngine.addPlayerExp(rewards.exp);
        } else {
            gs.exp = (gs.exp || 0) + rewards.exp; // 備用方案
        }
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

                // 🌟 [升級] 顯示邏輯：支援動態張力名稱
                if (op.msg) {
                    msgs.push(op.msg);
                } else {
                    let displayKey = k;
                    if (k === 'tension' && gs.story.chain && gs.story.chain.tensionName) {
                        displayKey = gs.story.chain.tensionName; // 使用劇本專屬名稱 (如: 暴露度)
                    } else {
                        displayKey = window.t_tag ? window.t_tag(k) : k;
                    }
                    msgs.push(`📊 ${displayKey}: ${v > 0 ? '+' : ''}${v}`);
                }
            }
        });
    }

    // ==========================================
    // 3. 發送 Toast 與 更新介面
    // ==========================================
    
    // [Check] 這裡使用 act.toast 發送訊息
    if (msgs.length > 0) {
        if (window.EventBus && window.EVENTS) {
            // [修復 STORY-2] 錯用字串，改為標準系統常數
            window.EventBus.emit(window.EVENTS.System.TOAST, msgs.join("  "));
        } else if (window.act && window.act.toast) {
            act.toast(msgs.join("  "));
        }
    }
    
    if (window.storyView && window.storyView.updateTopBar) window.storyView.updateTopBar();
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

        const transitionTexts = [
            "探索中...", "正在前往未知的區域...", "腳步聲在迴廊中迴盪...",
            "四周變得越來越暗...", "似乎發現了什麼..."
        ];
        const randomText = transitionTexts[Math.floor(Math.random() * transitionTexts.length)];

        // [修復 STORY-8] 播放過場文字
        this.playSceneNode({ text: randomText, options: [],noDefaultExit: true }); 
        
        // 【重要】確保安全鎖定，如果 timeout 失敗也能解鎖
        window.TempState.isProcessing = true; 
        window.TempState.lockInput = true;    
        
        setTimeout(() => { 
            // 在 callback 內才解除鎖定，確保狀態機一致
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
        // 這樣劇本內文只要呼叫 {env_room} 或 {combo_location}，都會直接印出地圖的名字，絕不亂跳！
        if (window.MapManager && window.MapManager.currentRoom) {
             const gs = window.GlobalState;
             if (gs.story && gs.story.chain && gs.story.chain.memory) {
                 gs.story.chain.memory['combo_location'] = window.MapManager.currentRoom.name;
                 gs.story.chain.memory['env_room'] = window.MapManager.currentRoom.name;
             }
        }
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

            // 🌟 自動文法修復：消除多餘的贅字與標點衝突
            if (typeof resolvedText === 'string') {
                resolvedText = resolvedText
                    .replace(/的\s*的/g, '的')               // 消除連續兩個「的」 (例如：廢棄的的房間 -> 廢棄的房間)
                    .replace(/的(?=[，。！、？]|$)/g, '')    // 消除緊接著標點符號或句尾的「的」 (例如：他看著空蕩蕩的。 -> 他看著空蕩蕩。)
                    .replace(/^(的|與|和)/, '')             // 消除句首多出來的連接詞
                    .replace(/，\s*，/g, '，')               // 消除連續逗號
                    .replace(/。\s*。/g, '。');              // 消除連續句號
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
        const flags = gs.story.flags || {}; 

        return text.replace(/{(\w+)}/g, (match, key) => {
            if (memory[key]) return memory[key];
            if (typeof vars[key] !== 'undefined') return vars[key];
            if (typeof flags[key] !== 'undefined') return flags[key];

            // [修復 STORY-7] 增加 typeof 檢查，過濾掉 gs.settings 等物件，避免印出 [object Object]
            if (typeof gs[key] !== 'undefined' && typeof gs[key] !== 'object') return gs[key];

            return match;
        });
    },

    _formatText: function(text) {
        // 1. 旁白/內心戲 (使用設計系統的幽靈色，完美融入深色背景)
        if (/^[\(（].*[\)）]$/.test(text)) {
            return `<div class="story-narrative" style="color: var(--text-ghost);">${text}</div>`;
        }

        // 2. 主角說話時 (使用設計系統的金色)
        if (text.includes("<b>你</b>：") || text.startsWith("你：")) {
            return `<div class="story-dialogue" style="color: var(--color-gold);">${text}</div>`;
        }

        // 3. 「其他人」說話時 (使用設計系統的資訊藍/柔和藍) 
        if (text.includes("：")&&text.includes("「")) {
            return `<div class="story-dialogue" style="color: var(--color-info-soft);">${text}</div>`; 
        }

        // 4. 一般動作/描述 (★ 關鍵：不寫死 color，讓它自然使用你現在喜歡的預設米白色！)
        return `<div class="story-action">${text}</div>`;
    },

    playDialogueChain: function(node) {
        const dialogues = node.dialogue;
        if (!dialogues || !Array.isArray(dialogues)) return; // 防呆：確保 dialogues 是陣列

        const lang = (window.GlobalState.settings && window.GlobalState.settings.targetLang) ? window.GlobalState.settings.targetLang : 'zh';
        
        let textQueue = dialogues.map(d => {
             // 【防呆 1】如果這行資料完全是空的
             if (!d) return "";
             
             // 【防呆 2】如果不小心只寫了字串 (例如 "救命啊")，沒有包裝成物件
             if (typeof d === 'string') return this._formatText(d); // ★ 記得這裡也要上色
             
             // 【防呆 3】如果物件裡漏寫了 text 屬性
             if (!d.text) {
                 return this._formatText(`<b>${d.speaker || '未知'}</b>：(對話資料遺失)`);
             }

             // 安全讀取文字
             const txt = d.text[lang] || d.text['zh'] || (typeof d.text === 'string' ? d.text : '');
             const speaker = d.speaker;
             
             // 先組合出原本的文字 (包含名字與台詞)
             const rawText = (speaker === '旁白' || !speaker) ? `${txt}` : `<b>${speaker}</b>：「${txt}」`;
             
             // ★ 【關鍵修復】：在存入 Queue 之前，直接呼叫 _formatText 進行上色！
             // 這樣打字機拿到這段字的時候，就已經帶有 <div style="color:..."> 了
             return this._formatText(rawText);
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

    _renderSimple: function(textArr, options) {
        // Fallback for debugging without View
        console.log("TEXT:", textArr.join("\n"));
        console.log("OPTS:", options);
    },

    _shuffle: function(arr) { 
        // 標準 Fisher-Yates 洗牌演算法 (解決機率不均問題)
        let currentIndex = arr.length, randomIndex;
        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        return arr;
    },
	
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
		if (window.MapManager) window.MapManager.init(); // 🌟 每次開局啟動地圖！
        // 🌟 [新增] 1. 初始化全域劇本歷史紀錄 (跨劇本記憶)
        if (!gs.story.skeletonHistory) gs.story.skeletonHistory = [];

        if (window.StoryGenerator && window.StoryGenerator.initChain) {
            // 🌟 [修改] 2. 抓取所有可用的劇本骨架 (mystery, horror, adventure...)
            const availableModes = Object.keys(window.StoryGenerator.skeletons);

            // 🌟 [新增] 3. 過濾掉最近兩次抽過的骨架
            let safeModes = availableModes.filter(m => !gs.story.skeletonHistory.includes(m));

            // 防呆：如果你的總劇本數量很少(例如只有3個)，扣掉2個剩1個。如果少於等於2個會被扣光，這時退回全名單
            if (safeModes.length === 0) safeModes = availableModes;

            // 4. 從安全名單中隨機抽一個
            const randomMode = safeModes[Math.floor(Math.random() * safeModes.length)];

            // 🌟 [新增] 5. 更新歷史紀錄，將這次抽到的推進去，並保持最多記錄 2 筆
            gs.story.skeletonHistory.push(randomMode);
            if (gs.story.skeletonHistory.length > 2) {
                gs.story.skeletonHistory.shift();
            }

            // 先產生劇本鏈，讓系統決定好這次的標籤與記憶
            gs.story.chain = window.StoryGenerator.initChain(randomMode);
            
            // 👇 👇 👇 【修改這裡】抓取引擎抽出的建築物與房間，餵給地圖初始化
            let initialBuilding = gs.story.chain.memory['env_building'] || "未知地點";
            let initialRoom = window.StoryGenerator._expandGrammar("{env_room}", window.FragmentDB, gs.story.chain.memory);
            
            if (window.MapManager) window.MapManager.init(initialBuilding, initialRoom);
            // 👆 👆 👆

            console.log(`🎲 隨機劇本啟動，模式: [${randomMode}] | 歷史紀錄:`, gs.story.skeletonHistory);
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
	if (window.MapManager) window.MapManager.clear(); // 🌟 結束時清空地圖！
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
    if (window.storyView && window.storyView.updateTopBar) window.storyView.updateTopBar();
    
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
        const updateEnergy = () => {
            const gs = window.GlobalState;
            if (!gs || !gs.story) return; 

            const now = Date.now();
            const timeDiff = now - (gs.story.lastEnergyUpdate || now);
            const REGEN_MS = this.CONSTANTS.ENERGY_REGEN_MS;

            if (timeDiff >= REGEN_MS) {
                const recoverAmount = Math.floor(timeDiff / REGEN_MS);
                const max = this.calculateMaxEnergy();
                
                if (gs.story.energy < max) {
                    const potentialEnergy = gs.story.energy + recoverAmount;
                    gs.story.energy = Math.min(max, potentialEnergy);
                    if (window.storyView && storyView.updateTopBar) storyView.updateTopBar();
                }

                gs.story.lastEnergyUpdate = now - (timeDiff % REGEN_MS);
                if(window.App) App.saveData();
            }
        };

        updateEnergy();

        // [修復 STORY-4] 儲存 interval ID 並在重複呼叫時清除舊的，防止速度疊加！
        if (window.TempState.energyLoopId) {
            clearInterval(window.TempState.energyLoopId);
        }
        window.TempState.energyLoopId = setInterval(updateEnergy, 10000); 
    },
	
};