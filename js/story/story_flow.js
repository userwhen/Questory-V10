/* js/modules/story_flow.js - V80.0 (終極修復版)
 * 職責：流程與節點控制（播放場景、選項點擊、鏈進退、探索、打字機）
 * 包含：Next Reveal 解析無縫接合、多段對話打字機修復、清空舊標籤防污染
 * 依賴：story_core.js, story_state.js, story_map.js, story_generator.js
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
        if (gs.story.chain && gs.story.chain.tags) {
            if (!gs.story.tags) gs.story.tags = [];
            gs.story.tags = [...new Set([...gs.story.chain.tags, ...gs.story.tags])];
        }
		// ✅ 核心機制：如果玩家已購買學習模式，將 learning 標籤常駐，啟動語言事件！
        if (gs.unlocks && (Array.isArray(gs.unlocks) ? gs.unlocks.includes('learning') : gs.unlocks['learning'])) {
            if (!gs.story.tags) gs.story.tags = [];
            if (!gs.story.tags.includes('learning')) gs.story.tags.push('learning');
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

        // 存檔
        const safeNode = this._sanitizeNodeForSave(activeNode);
        window.SQ.State.story.currentNode = safeNode;

        window.SQ.Temp.currentSceneNode = activeNode;
        window.SQ.Temp.storyCard        = activeNode;

        let processedText = this._processText(activeNode.text);

        // 處理選項（條件過濾）
        let options = (activeNode.options || [])
            .filter(opt => this._checkCondition(opt.condition))
            .map(opt => {
                // 🌟 [新增] 攔截 label 並判斷是否為多語言物件
                let rawLabel = opt.label;
                if (typeof rawLabel === 'object' && rawLabel !== null) {
                    rawLabel = this.resolveLabel ? this.resolveLabel(rawLabel) : (rawLabel.zh || "");
                }
                return {
                    ...opt,
                    label:  this._resolveDynamicText ? this._resolveDynamicText(rawLabel) : rawLabel,
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
    // 🖱️ SELECT OPTION (包含 Next Reveal 完美接合)
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

            // ✅ 完美接合 1：攔截解析頁面的「繼續」按鈕
            if (opt.action === '_next_reveal_continue') {
                const cb = window.SQ.Temp._revealCallback;
                window.SQ.Temp._revealCallback = null;
                if (cb) cb();
                return;
            }

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

                if (opt.action === 'map_explore_new') {
                    this.advanceChain();
                } else {
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

            // ✅ 完美接合 2：邏輯分流與 Next Reveal 解析處理
            if (opt.action === 'node_next') {
                this._handleNodeJump(opt, passed);
            } else if (opt.action === 'investigate') {
                if (opt.result) this.playSceneNode({ ...window.SQ.Temp.currentSceneNode, text: [opt.result], options: ts.storyOptions });
                else this.playSceneNode(window.SQ.Temp.currentSceneNode);
            } else if (opt.action === 'advance_chain') {
                const executeAdvance = () => {
                    let hasEndingScene = passed ? (opt.nextScene || opt.nextSceneId) : (opt.failScene || opt.failSceneId);
                    if (hasEndingScene) {
                        this._handleNodeJump(opt, passed);
                    } else {
                        const tags = passed ? (opt.nextTags || []) : (opt.failNextTags || []);
                        this.advanceChain(tags);
                    }
                };
                if (window.SQ.Engine.Story.hasNextReveal && window.SQ.Engine.Story.hasNextReveal(opt)) {
                    window.SQ.Engine.Story.showNextReveal(opt.next, executeAdvance);
                } else {
                    executeAdvance();
                }
            } else if (opt.action === 'finish_chain') {
                const executeFinish = () => {
                    let hasEndingScene = passed ? (opt.nextScene || opt.nextSceneId) : (opt.failScene || opt.failSceneId);
                    if (hasEndingScene) {
                        this._handleNodeJump(opt, passed);
                    } else {
                        this.finishChain();
                    }
                };
                if (window.SQ.Engine.Story.hasNextReveal && window.SQ.Engine.Story.hasNextReveal(opt)) {
                    window.SQ.Engine.Story.showNextReveal(opt.next, executeFinish);
                } else {
                    executeFinish();
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
        window.SQ.Temp.lastHubNode      = null;

        // ✅ 清除標籤防污染
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
        window.SQ.Temp.lastHubNode      = null;

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
            // ✅ 完美接合 3：支援多段對話點擊
            if (window.SQ.Temp.isWaitingInput) {
                this.playNextChunk();
            } else if (window.SQ.Temp._dialogueNextCallback) {
                window.SQ.Temp._dialogueNextCallback();
            }
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
            
            // ✅ 完美接合 4：防止舊選項在對話中途提早跳出
            if (!ts._dialogueNextCallback) {
                if (window.SQ.View.Story) window.SQ.View.Story.showOptions(ts.storyOptions);
            }
        }
    },
});