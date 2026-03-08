/* js/modules/story_flow.js - V79.0 (獨立模組)
 * 職責：流程與節點控制（播放場景、選項點擊、鏈進退、探索、打字機）
 * 依賴：story_core.js, story_state.js, story_map.js, story_generator.js
 * 載入順序：story_core → story_state → story_flow → story_generator → story_controller
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Story = window.SQ.Engine.Story || {};

Object.assign(window.SQ.Engine.Story, {

    // ============================================================
    // 🗺️ [SECTION 2] FLOW & NAVIGATION
    // ============================================================
    playSceneNode: function(node) {
        // ✅ 修復突然結束：如果沒有節點，判斷是該結束劇本還是抽新卡
        if (!node) { 
            const gs = window.SQ.State;
            if (gs.story && gs.story.chain) {
                this.finishChain();
            } else {
                this.drawAndPlay();
            }
            return; 
        }

        let activeNode = { ...node };

        if (activeNode.dialogue && activeNode.dialogue.length > 0) {
            this.playDialogueChain(activeNode);
            return;
        }

        if (!activeNode.id) {
            activeNode.id = `gen_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
        }

        // 【雙態 HUB】首次完整描述，重訪只顯示 briefText
        if (activeNode.isHub) {
            const flagKey = `visited_${activeNode.id}`;
            const gs = window.SQ.State;
            if (!gs.story.flags) gs.story.flags = {};
            if (gs.story.flags[flagKey]) {
                activeNode.text = activeNode.briefText || activeNode.text;
            } else {
                gs.story.flags[flagKey] = true;
            }
        }
		// 【同步 chain tags → story.tags】
		const gs = window.SQ.State;

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

        // 存檔
        const safeNode = this._sanitizeNodeForSave(activeNode);
        window.SQ.State.story.currentNode = safeNode;

        window.SQ.Temp.currentSceneNode = activeNode;
        window.SQ.Temp.storyCard        = activeNode;

        let processedText = this._processText(activeNode.text);

        // 取得當前語言設定
        const gsLang = window.SQ.State;
        const currentLang = (gsLang.settings && gsLang.settings.targetLang && gsLang.settings.targetLang !== 'mix') ? gsLang.settings.targetLang : 'zh';

        // 處理選項（條件過濾 + 語系解析 + 變數替換）
        let options = (activeNode.options || [])
            .filter(opt => this._checkCondition(opt.condition))
            .map(opt => {
                // 1. 拆解多語系物件，取得純字串
                let labelStr = opt.label;
                if (typeof labelStr === 'object' && labelStr !== null) {
                    labelStr = labelStr[currentLang] || labelStr['zh'] || Object.values(labelStr)[0] || "未命名";
                }
                
                // 2. 送入引擎替換 {lover} 等變數
                return {
                    ...opt,
                    label:  this._resolveDynamicText(labelStr),
                    action: opt.action || 'node_next'
                };
            });

        // 地圖按鈕注入：只有 isHub 節點才顯示完整地圖按鈕
        if (activeNode.isHub) {
            window.SQ.Temp.lastHubNode = { ...activeNode };
            if (window.SQ.Engine.Map && window.SQ.Engine.Map.map.length > 0) {
                options = window.SQ.Engine.Map.injectMapOptions(options);
            }
        }

        if (options.length === 0 && !node.noDefaultExit) {
            options.push({ label: "離開", action: "finish_chain", style: "primary" });
        }

        window.SQ.Temp.storyQueue     = processedText;
        window.SQ.Temp.storyStep      = 0;
        window.SQ.Temp.storyOptions   = options;
        window.SQ.Temp.isWaitingInput = true;
        window.SQ.Temp.isProcessing   = false;

        if (window.SQ.View.Story && window.SQ.View.Story.clearScreen) {
            window.SQ.View.Story.clearScreen();
            this.playNextChunk();
        }
        if (window.App) App.saveData();
    },

    // ============================================================
    // 🖱️ SELECT OPTION
    // ============================================================
    selectOption: function(idx) {
        if (window.SQ.Temp.isProcessing) {
            console.warn("⛔ 點擊被攔截：系統忙碌中");
            return;
        }
        if (window.SQ.View.Story && window.SQ.View.Story.disableOptions) {
            window.SQ.View.Story.disableOptions(idx);
        }
        if (!window.SQ.Temp.storyOptions || window.SQ.Temp.storyOptions.length === 0) {
            console.warn("⛔ 點擊無效：當前無選項");
            return;
        }

        window.SQ.Temp.isProcessing = true;

        const ts  = window.SQ.Temp;
        const opt = ts.storyOptions[idx];
        if (!opt) { window.SQ.Temp.isProcessing = false; return; }

        if (opt.action === 'locked') {
            if (window.SQ.Actions && window.SQ.Actions.toast) window.SQ.Actions.toast(opt.msg || "🔒 條件不足");
            setTimeout(() => { window.SQ.Temp.isProcessing = false; }, 200);
            return;
        }

        setTimeout(() => {
            if (!window.SQ.State.story.currentNode && opt.action !== 'finish_chain') {
                window.SQ.Temp.isProcessing = false;
                return;
            }

            window.SQ.Temp.isProcessing = false;

            // --- 地圖行為分流 ---
            if (opt.action.startsWith('map_')) {
				if (opt.rewards) {
					this._distributeRewards(opt.rewards);
				}
                let transitionText = window.SQ.Engine.Map.handleMapAction(opt.action, opt.targetId);
                if (window.SQ.View.Story && window.SQ.View.Story.updateTopBar) window.SQ.View.Story.updateTopBar();

                let actionLabel = "探索未知";
                let actionIcon  = "🗺️";
                const currentTheme = window.SQ.State.story.chain ? window.SQ.State.story.chain.theme : null;

                if (opt.action === "map_explore_new") {
                    if (currentTheme === 'mystery')   { actionLabel = "前往下一個地點"; actionIcon = "🔎"; }
                    else if (currentTheme === 'horror')    { actionLabel = "推開未知的門";   actionIcon = "🚪"; }
                    else if (currentTheme === 'adventure') { actionLabel = "深入未知區域";   actionIcon = "⚔️"; }
                    else if (currentTheme === 'romance')   { actionLabel = "轉換場景";       actionIcon = "☕"; }
                    else if (currentTheme === 'raising')   { actionLabel = "推進排程";       actionIcon = "📅"; }
                } else {
                    actionLabel = "原路折返";
                    actionIcon  = "🔙";
                }

                const roomName = window.SQ.Engine.Map.currentRoom ? window.SQ.Engine.Map.currentRoom.name : "?";
                const pathStr  = window.SQ.Engine.Map.map
                    .map(r => r.id === window.SQ.Engine.Map.currentRoom.id ? `📍[${r.name}]` : `[${r.name}]`)
                    .join(" ─ ");

                const inlineHtml = `<span style="color: var(--text-ghost); font-family: monospace, sans-serif; font-size: 0.95rem;">${actionIcon} ${actionLabel}........ </span><span style="font-weight:bold; color:var(--color-info); font-size: 0.95rem;">來到了 [${roomName}]</span><br><span style="color: var(--text-ghost); font-family: monospace, sans-serif; font-size: 0.85rem;">📍 路徑: ${pathStr}</span><br><br>`;

                window.SQ.Temp.deferredHtml = (window.SQ.Temp.deferredHtml || "") + inlineHtml;

                // ✅ 行為分流：開新門 → 推進劇情 / 退回 → 重播 HUB
                if (opt.action === 'map_explore_new') {
                    this.advanceChain();
                } else {
                    // map_move_to 或 map_return_hub → 重播最後的 HUB，不推進劇情
                    const hubNode = window.SQ.Temp.lastHubNode;
                    if (hubNode) this.playSceneNode(hubNode);
                }
                if (window.App) App.saveData();
                return;
            }

            // --- quiz ---
            if (opt.action === 'answer_quiz') {
                this.handleQuizResult(opt.wordId, opt.isCorrect);
                this.finishChain();
                return;
            }

            // --- 屬性檢定 ---
            let passed = true;
            if (opt.check) {
                const stat = this.getPlayerStat(opt.check.stat);
                const roll = Math.floor(Math.random() * 20) + 1;
                passed = (stat + roll >= opt.check.val);
                if (window.SQ.View.Story && window.SQ.View.Story.appendInlineCheckResult)
                    window.SQ.View.Story.appendInlineCheckResult(opt.check.stat, stat + roll, passed);
            }

            if (passed && opt.rewards) this._distributeRewards(opt.rewards);

            if (opt.action === 'node_next') {
                this._handleNodeJump(opt, passed);
            } else if (opt.action === 'investigate') {
                if (opt.result) this.playSceneNode({ ...window.SQ.Temp.currentSceneNode, text: [opt.result], options: ts.storyOptions });
                else this.playSceneNode(window.SQ.Temp.currentSceneNode);
            } else if (opt.action === 'advance_chain') {
                const tags = passed ? (opt.nextTags || []) : (opt.failNextTags || []);
                this.advanceChain(tags);
            } else if (opt.action === 'finish_chain') {
                let hasEndingScene = passed
                    ? (opt.nextScene || opt.nextSceneId)
                    : (opt.failScene || opt.failSceneId);
                if (hasEndingScene) {
                    this._handleNodeJump(opt, passed);
                } else {
                    this.finishChain();
                }
            } else {
                this.finishChain();
            }

            if (window.App) App.saveData();
        }, this.CONSTANTS.CLICK_DELAY);
    },

    _handleNodeJump: function(opt, passed) {
        let targetId = passed ? opt.nextSceneId : opt.failSceneId;

        if (Array.isArray(targetId)) {
            targetId = targetId[Math.floor(Math.random() * targetId.length)];
            console.log(`🎲 陣列隨機跳轉觸發！抽中路線: ${targetId}`);
        }

        if (targetId === 'GEN_MODULAR') {
            this.startRandomChain();
            return;
        }

        let targetNode = this.findSceneById(targetId);
        if (!targetNode) targetNode = passed ? opt.nextScene : opt.failScene;

        if (targetNode) {
            this.playSceneNode(targetNode);
        } else {
            console.error(`❌ Scene ID not found: ${targetId}`);
            if (targetId !== 'GEN_MODULAR') this.finishChain();
        }
    },

    // ============================================================
    // 🔄 SESSION MANAGEMENT
    // ============================================================
    resumeStory: function() {
        const gs = window.SQ.State;
        if (window.SQ.Temp.currentSceneNode) {
            this.playSceneNode(window.SQ.Temp.currentSceneNode);
        } else if (gs.story.currentNode) {
            if (!gs.story.chain && gs.story.savedChain) {
                gs.story.chain = this._deepClone(gs.story.savedChain);
            }
            this.playSceneNode(gs.story.currentNode);
        } else {
            this.finishChain();
        }
    },

    abandonStory: function() {
        const gs = window.SQ.State;
        if (window.SQ.Engine.Map) window.SQ.Engine.Map.clear();
        if (window.SQ.Temp) window.SQ.Temp.storyLocation = "未知區域";

        gs.story.chain        = null;
        gs.story.currentNode  = null;
        gs.story.savedChain   = null;
        window.SQ.Temp.currentSceneNode = null;
        window.SQ.Temp.storyCard        = null;
        window.SQ.Temp.lastHubNode      = null; // ✅ HUB 記憶清理

        if (gs.story) { gs.story.tags = []; gs.story.vars = {}; gs.story.flags = {}; }

        window.SQ.Temp.isProcessing = false;
        window.SQ.Temp.lockInput    = false;

        if (window.SQ.Actions && window.SQ.Actions.toast) window.SQ.Actions.toast("🗑️ 已放棄目前的冒險");
        if (window.SQ.View.Story) window.SQ.View.Story.renderIdle();
        if (window.SQ.View.Story && window.SQ.View.Story.updateTopBar) window.SQ.View.Story.updateTopBar();
    },

    // ============================================================
    // 📚 CHAIN MANAGEMENT
    // ============================================================
    startRandomChain: function() {
        const gs = window.SQ.State;
        if (window.SQ.Engine.Map) window.SQ.Engine.Map.init();
        if (!gs.story.skeletonHistory) gs.story.skeletonHistory = [];
		// ✅ 清除標籤污染：在啟動新劇本前，徹底清空上一局的殘留狀態
        if (gs.story) {
            gs.story.tags = [];
            gs.story.vars = {};
            gs.story.flags = {};
        }

        if (window.StoryGenerator && window.SQ.Engine.Generator.initChain) {
            const availableModes = Object.keys(window.SQ.Engine.Generator.skeletons);
            let safeModes = availableModes.filter(m => !gs.story.skeletonHistory.includes(m));
            if (safeModes.length === 0) safeModes = availableModes;

            const randomMode = safeModes[Math.floor(Math.random() * safeModes.length)];
            gs.story.skeletonHistory.push(randomMode);
            if (gs.story.skeletonHistory.length > 2) gs.story.skeletonHistory.shift();

            gs.story.chain = window.SQ.Engine.Generator.initChain(randomMode);

            let initialBuilding = gs.story.chain.memory['env_building'] || "未知地點";
            let initialRoom     = window.SQ.Engine.Generator._expandGrammar("{env_room}", window.FragmentDB, gs.story.chain.memory);
            if (window.SQ.Engine.Map) window.SQ.Engine.Map.init(initialBuilding, initialRoom);

            console.log(`🎲 隨機劇本啟動，模式: [${randomMode}]`);
        } else {
            gs.story.chain = { depth: 0, maxDepth: 5, history: [] };
        }
        this.playSceneNode(window.SQ.Engine.Generator.generate([], true));
    },

    advanceChain: function(nextTags) {
        const gs = window.SQ.State;
        if (!gs.story.chain) return;
        gs.story.chain.depth++;
        this.playSceneNode(window.SQ.Engine.Generator.generate(nextTags, false));
    },

    finishChain: function() {
        const gs = window.SQ.State;
        if (window.SQ.Engine.Map) window.SQ.Engine.Map.clear();

        gs.story.chain       = null;
        gs.story.currentNode = null;
        gs.story.savedChain  = null;
        window.SQ.Temp.currentSceneNode = null;
        window.SQ.Temp.storyCard        = null;
        window.SQ.Temp.lastHubNode      = null; // ✅ HUB 記憶清理

        if (gs.story) {
            gs.story.tags = [];
			gs.story.vars = {};
			gs.story.flags = {};
			console.log("🧹 區域變數、標籤與 flags 已清空");
        }

        if (window.SQ.View.Story) window.SQ.View.Story.renderIdle();
        if (window.App) App.saveData();
        if (window.SQ.View.Story && window.SQ.View.Story.updateTopBar) window.SQ.View.Story.updateTopBar();
        console.log("🏁 劇本流程結束");
    },

    drawAndPlay: function() {
        const gs = window.SQ.State;
        if (!gs.story.deck || gs.story.deck.length === 0) this.loadDatabase();
        if (!gs.story.deck || gs.story.deck.length === 0) {
            console.warn("⚠️ 牌庫為空，無法抽卡");
            return;
        }

        const card = gs.story.deck.shift();
        if (!card) return;

        if (card === 'GEN_MODULAR') {
            console.log("🎲 drawAndPlay 抽到了隨機卡");
            this.startRandomChain();
        } else {
            this.playSceneNode(card);
        }
    },

    explore: function() {
        const gs = window.SQ.State;
        if (!gs.story) this.init();

        if (gs.story.energy < this.CONSTANTS.ENERGY_COST) {
            if (window.SQ.Actions) window.SQ.Actions.toast("❌ 精力不足");
            return { success: false, msg: "精力不足" };
        }

        gs.story.energy -= this.CONSTANTS.ENERGY_COST;
        if (window.SQ.View.Story) window.SQ.View.Story.updateTopBar();

        const transitionTexts = [
            "探索中...", "正在前往未知的區域...", "腳步聲在迴廊中迴盪...",
            "四周變得越來越暗...", "似乎發現了什麼..."
        ];
        const randomText = transitionTexts[Math.floor(Math.random() * transitionTexts.length)];

        this.playSceneNode({ text: randomText, options: [], noDefaultExit: true });

        window.SQ.Temp.isProcessing = true;
        window.SQ.Temp.lockInput    = true;

        setTimeout(() => {
            window.SQ.Temp.lockInput    = false;
            window.SQ.Temp.isProcessing = false;
            this.drawAndPlay();
            if (window.App) App.saveData();
        }, this.CONSTANTS.TRANSITION_DELAY);

        return { success: true };
    },

    // ============================================================
    // 📺 VIEW BRIDGE (打字機 + 輔助)
    // ============================================================
    makeChoice: function(idx) { this.selectOption(idx); },

    clickScreen: function() {
        if (window.SQ.Temp.lockInput) return;

        if (window.SQ.Temp.typingTimer) {
            window.SQ.Temp.skipRendering = true;
            window.SQ.Temp.lockInput = true;
            setTimeout(() => { window.SQ.Temp.lockInput = false; }, 300);
        } else {
            if (window.SQ.Temp.isWaitingInput) this.playNextChunk();
        }
    },

    playNextChunk: function() {
        const ts = window.SQ.Temp;
        if (ts.lockInput || !ts.storyQueue) return;

        if (ts.storyStep < ts.storyQueue.length) {
            let html   = ts.storyQueue[ts.storyStep];
            let isLast = (ts.storyStep === ts.storyQueue.length - 1);
            if (window.SQ.View.Story) window.SQ.View.Story.appendChunk(html, isLast);
            ts.storyStep++;
        }

        if (ts.storyStep >= ts.storyQueue.length) {
            ts.isWaitingInput = false;
            if (window.SQ.View.Story) window.SQ.View.Story.showOptions(ts.storyOptions);
        }
    },

    // ============================================================
    // 📝 TEXT PROCESSING
    // ============================================================

    /**
     * _processText(raw)
     * 把節點的 text 欄位（字串 / 字串陣列 / 物件{zh,jp,...}）
     * 統一轉成 HTML 字串陣列，供 storyQueue 逐段播放。
     * 同時呼叫 _resolveDynamicText 展開 {fragment} 佔位符。
     */
    _processText: function(raw) {
        if (!raw) return [];

        // 多語言物件 { zh, jp, kr, mix }
        if (typeof raw === 'object' && !Array.isArray(raw)) {
            const gs  = window.SQ.State;
            const lang = (gs.settings && gs.settings.targetLang) || 'zh';
            raw = raw[lang] || raw['zh'] || '';
        }

        // 字串陣列 → 每項各自展開後回傳
        if (Array.isArray(raw)) {
            return raw
                .map(item => {
                    // 陣列裡也可能是多語言物件
                    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                        const gs   = window.SQ.State;
                        const lang = (gs.settings && gs.settings.targetLang) || 'zh';
                        item = item[lang] || item['zh'] || '';
                    }
                    return this._resolveDynamicText(String(item));
                })
                .filter(s => s.trim() !== '');
        }

        // 純字串
        return [this._resolveDynamicText(String(raw))];
    },

    /**
     * _resolveDynamicText(str)
     * 展開字串中所有 {key} 佔位符：
     *   1. 先查 chain.memory（固定記憶值）
     *   2. 再查 FragmentDB.fragments，隨機挑一個 val，遞迴展開
     *   3. 找不到的 key 原樣保留（顯示 {key}）
     * 同時替換 story.vars 中的數值佔位符（如 {time_left}）。
     */
    _resolveDynamicText: function(str) {
        if (!str || typeof str !== 'string') return str || '';

        const gs      = window.SQ.State;
        const memory  = (gs.story && gs.story.chain && gs.story.chain.memory) || {};
        const vars    = (gs.story && gs.story.vars)  || {};
        const db      = (window.FragmentDB && window.FragmentDB.fragments) || {};
        
        // 🌟 抓取當前遊戲的真實推進天數/步數
        const chainDepth = (gs.story && gs.story.chain && gs.story.chain.depth) ? gs.story.chain.depth : 1;

        // 防無限迴圈
        let safety = 0;
        const MAX  = 20;

        while (/{[^{}]+}/.test(str) && safety++ < MAX) {
            str = str.replace(/{([^{}]+)}/g, (match, key) => {
                // 🌟 系統內建變數攔截
                if (key === 'depth') return chainDepth;

                // 1. story.vars 中的數值
                if (vars[key] !== undefined) return vars[key];

                // 2. chain.memory 中的固定值
                if (memory[key] !== undefined) return memory[key];

                // 3. FragmentDB：隨機取一個 val
                if (db[key] && db[key].length > 0) {
                    const pool = db[key];
                    return pool[Math.floor(Math.random() * pool.length)].val;
                }

                // 找不到：原樣保留
                return match;
            });
        }

        return str;
    },

    /**
     * playDialogueChain(node)
     * 把 node.dialogue 陣列轉成打字機佇列播放。
     * 每個 dialogue 項目格式：
     *   { text: "..." }               → 普通旁白
     *   { text: {zh:"...", jp:"..."}} → 多語言旁白
     *   { speaker: "角色", text: "..."} → 帶說話者的對話，渲染為加粗名字
     * 選項沿用 node.options，走相同的條件過濾流程。
     */
    playDialogueChain: function(node) {
        const lines = (node.dialogue || []).map(item => {
            // 取出 text，支援多語言物件
            let txt = item.text;
            if (typeof txt === 'object' && txt !== null && !Array.isArray(txt)) {
                const gs   = window.SQ.State;
                const lang = (gs.settings && gs.settings.targetLang) || 'zh';
                txt = txt[lang] || txt['zh'] || '';
            }
            txt = this._resolveDynamicText(String(txt || ''));

            // 🌟 核心修改區塊：判斷是否為旁白
            if (item.speaker && item.speaker !== "旁白") {
                // 如果有說話者，且不是旁白，渲染為「<b>角色</b>：文字」
                return `<b>${item.speaker}</b>：${txt}`;
            }
            
            // 如果 speaker 是 "旁白"，或是根本沒有 speaker，就只顯示對話內容
            return txt;

        }).filter(s => s.trim() !== '');

        // 走與 playSceneNode 相同的後半段流程
        // 先觸發 onEnter、再設 storyQueue
        const gs = window.SQ.State;
        if (!gs.story) return;

        if (node.onEnter) this._distributeRewards(node.onEnter);

        // 確保子場景都被註冊
        if (node.options) {
            node.options.forEach(opt => {
                this._registerSubScene(opt.nextScene);
                this._registerSubScene(opt.failScene);
                if (opt.nextScene && !opt.nextSceneId) opt.nextSceneId = opt.nextScene.id;
                if (opt.failScene && !opt.failSceneId) opt.failSceneId = opt.failScene.id;
            });
        }
		
        // 取得當前語言設定
        const gsLang = window.SQ.State;
        const currentLang = (gsLang.settings && gsLang.settings.targetLang && gsLang.settings.targetLang !== 'mix') ? gsLang.settings.targetLang : 'zh';

        let options = (node.options || [])
            .filter(opt => this._checkCondition(opt.condition))
            .map(opt => {
                // 1. 拆解多語系物件，取得純字串
                let labelStr = opt.label;
                if (typeof labelStr === 'object' && labelStr !== null) {
                    labelStr = labelStr[currentLang] || labelStr['zh'] || Object.values(labelStr)[0] || "未命名";
                }
                
                // 2. 送入引擎替換 {lover} 等變數
                return {
                    ...opt,
                    label:  this._resolveDynamicText(labelStr),
                    action: opt.action || 'node_next'
                };
            });

        if (options.length === 0 && !node.noDefaultExit) {
            options.push({ label: "繼續", action: "finish_chain", style: "primary" });
        }

        window.SQ.Temp.currentSceneNode  = node;
        window.SQ.Temp.storyCard         = node;
        window.SQ.Temp.storyQueue        = lines;
        window.SQ.Temp.storyStep         = 0;
        window.SQ.Temp.storyOptions      = options;
        window.SQ.Temp.isWaitingInput    = true;
        window.SQ.Temp.isProcessing      = false;

        if (window.SQ.View.Story && window.SQ.View.Story.clearScreen) {
            window.SQ.View.Story.clearScreen();
            this.playNextChunk();
        }
        if (window.App) App.saveData();
    },
});