/* js/modules/story_flow.js - V79.1 (獨立模組 - 包含 Horror Patch)
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

        // ✅ 修正一：提早判斷並註冊 HUB，避免被 dialogue 提早 return 跳過
        if (activeNode.isHub) {
            window.SQ.Temp.lastHubNode = { ...activeNode };
            const flagKey = `visited_${activeNode.id || 'temp'}`;
            const gs2 = window.SQ.State;
            if (!gs2.story.flags) gs2.story.flags = {};
            if (gs2.story.flags[flagKey]) {
                activeNode.text = activeNode.briefText || activeNode.text;
                // 加入 briefDialogue 判斷，讓重返房間時不用再看一次超長對話
                activeNode.dialogue = activeNode.briefDialogue || activeNode.dialogue;
            } else {
                gs2.story.flags[flagKey] = true;
            }
        }

        // 如果有 dialogue，導向對話播放器 (現在 HUB 已經安全註冊了)
        if (activeNode.dialogue && activeNode.dialogue.length > 0) {
            this.playDialogueChain(activeNode);
            return;
        }

        if (!activeNode.id) {
            activeNode.id = `gen_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
        }

		// 【同步 chain tags → story.tags】
		const gs = window.SQ.State;

		// 觸發進入事件
		if (activeNode.onEnter && !window.SQ.Temp._isNodeSelfReplay) {
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

        // 處理選項（條件過濾 + 語系解析 + 變數替換 + 自動修正）
        let options = (activeNode.options || [])
            .filter(opt => this._checkCondition(opt.condition))
            .map(opt => {
                // 1. 拆解多語系物件，取得純字串
                let labelStr = opt.label;
                if (typeof labelStr === 'object' && labelStr !== null) {
                    labelStr = labelStr[currentLang] || labelStr['zh'] || Object.values(labelStr)[0] || "未命名";
                }

                // 🌟 自動修正機制：如果帶有子場景，卻誤寫成 advance_chain，強制轉為 node_next
                let finalAction = opt.action || 'node_next';
                let hasSubScene = (opt.nextScene || opt.failScene || opt.nextSceneId || opt.failSceneId);
                
                if (hasSubScene && finalAction === 'advance_chain') {
                    finalAction = 'node_next';
                    console.log(`🔧 自動修正: 選項 [${labelStr}] 包含子場景，action 已強制轉為 node_next`);
                }
                
                // 2. 送入引擎替換 {lover} 等變數
                return {
                    ...opt,
                    label:  this._resolveDynamicText(labelStr),
                    action: finalAction
                };
            });

        // 🌟 【新增】：強制同步劇本地點與 UI 地圖名稱
        if (window.SQ.Engine.Map && gsLang.story.chain && gsLang.story.chain.memory && gsLang.story.chain.memory['env_room']) {
            if (!window.SQ.Engine.Map.currentRoom) {
                window.SQ.Engine.Map.currentRoom = { id: 'room_auto', name: gsLang.story.chain.memory['env_room'] };
            } else {
                window.SQ.Engine.Map.currentRoom.name = gsLang.story.chain.memory['env_room'];
            }
            window.SQ.Engine.Map.updateLocationString();
        }

        // 地圖按鈕注入：只有 isHub 節點才顯示完整地圖按鈕
        if (activeNode.isHub) {
            window.SQ.Temp.lastHubNode = { ...activeNode };
            if (window.SQ.Engine.Map) {
                // 🌟 新增：如果地圖還是空的，自動幫玩家建一張地圖！
                if (window.SQ.Engine.Map.map.length === 0) {
                    const gs = window.SQ.State;
                    const defaultRoom = (gs.story.chain && gs.story.chain.memory && gs.story.chain.memory['env_room']) ? gs.story.chain.memory['env_room'] : "大廳";
                    window.SQ.Engine.Map.init("未知建築", defaultRoom);
                }
                options = window.SQ.Engine.Map.injectMapOptions(options);
            }
        }
        // 🌟 修正：只有「非 HUB」的劇情才會洗牌，保護箱庭選單固定順序
        if (options.length > 1 && !activeNode.isHub && activeNode.id !== 'root_hub') {
            options = this._shuffle(options);
        }

        // 🌟 修正：事件結束時自動顯示地圖按鈕把玩家留住
        if (options.length === 0 && !activeNode.noDefaultExit) {
            if (window.SQ.Engine.Map && window.SQ.Engine.Map.map.length > 0 && window.SQ.Temp.lastHubNode) {
                options = window.SQ.Engine.Map.injectMapOptions(options);
            } else {
                options.push({ label: "離開", action: "finish_chain", style: "primary" });
            }
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
		// 確保每一次點擊都是乾淨的，清空上一動可能殘留的獎勵 HTML
        window.SQ.Temp.pendingRewardHtml = null; 

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

                // 🌟 【新增】時間/次數耗盡攔截器
                const gs = window.SQ.State;
                const exploreCount = (gs.story.vars && gs.story.vars.explore_count !== undefined) ? gs.story.vars.explore_count : 
                                     ((gs.story.vars && gs.story.vars.free_time !== undefined) ? gs.story.vars.free_time : 999);

                // 如果次數歸零，強制進入「時間到了」的過渡劇情，並將指針指向 climax
                if (exploreCount <= 0 && gs.story.chain) {
                    const chain = gs.story.chain;
                    const climaxIdx = chain.stages.indexOf('climax');
                    if (climaxIdx !== -1) chain.currentStageIdx = climaxIdx;

                    const timeUpNode = {
                        id: 'time_up_transition',
                        text: "時間到了……周圍的氣氛突然改變，你已經沒有機會再四處探索了。",
                        options: [{ label: "迎接命運", action: "advance_chain", style: "danger" }]
                    };
                    
                    this.playSceneNode(timeUpNode);
                    if (window.App) App.saveData();
                    return;
                }
				// ✅ 地圖行為分流（各自獨立處理）
                if (opt.action === 'map_explore_new') {
                    const gs = window.SQ.State;
                    if (gs.story && gs.story.chain && gs.story.chain.memory && window.SQ.Engine.Map.currentRoom) {
                        gs.story.chain.memory['env_room'] = window.SQ.Engine.Map.currentRoom.name;
                    }
                    
                    // 扣除次數
                    if (gs.story.vars && gs.story.vars.explore_count !== undefined) {
                        gs.story.vars.explore_count--;
                    } else if (gs.story.vars && gs.story.vars.free_time !== undefined) {
                        gs.story.vars.free_time--;
                    }

                    // 🌟 核心修復：改用 generate 產生一個 middle 節點，但不推進主線 stage 指針
                    const node = window.SQ.Engine.Generator.generate([], false);
                    if (gs.story.chain) {
                        gs.story.chain.currentStageIdx = Math.max(0, gs.story.chain.currentStageIdx - 1);
                        gs.story.chain.depth = Math.max(0, gs.story.chain.depth - 1);
                    }
                    this.playSceneNode(node);

                } else if (opt.action === 'map_move_to' || opt.action === 'map_return_hub') {
                    // 退回舊房間或返回 HUB
                    const hubNode = window.SQ.Temp.lastHubNode;
                    if (hubNode) {
                        window.SQ.Temp._isNodeSelfReplay = true;
                        this.playSceneNode(hubNode);
                        window.SQ.Temp._isNodeSelfReplay = false;
                    } else {
                        this.advanceChain();
                    }
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

            // ── [修改二] onFail：判定失敗時執行懲罰 ──────────────
            if (!passed && opt.onFail) {
                this._distributeRewards(opt.onFail);
                if (opt.onFail.text) {
                    const failLines = this._processText(opt.onFail.text);
                    if (window.SQ.View.Story && window.SQ.View.Story.appendChunk) {
                        failLines.forEach((line, i) =>
                            window.SQ.View.Story.appendChunk(line, i === failLines.length - 1)
                        );
                    }
                }
            }

            if (opt.action === 'node_next') {
                this._handleNodeJump(opt, passed);

            // ── [修改一] node_self：留在同一個 hub 節點（箱庭迴圈）──
            } else if (opt.action === 'node_self') {
                const currentNode = window.SQ.Temp.currentSceneNode;
                if (currentNode) {
                    // 加上防護旗標，告訴 playSceneNode 這是重播，不要再給 onEnter 獎勵
                    window.SQ.Temp._isNodeSelfReplay = true;
                    this.playSceneNode(currentNode);
                    window.SQ.Temp._isNodeSelfReplay = false;
                } else {
                    console.warn("⚠️ node_self：找不到 currentSceneNode，改為推進鏈");
                    this.advanceChain();
                }

            } else if (opt.action === 'investigate') {
                if (opt.result) this.playSceneNode({ ...window.SQ.Temp.currentSceneNode, text: [opt.result], options: ts.storyOptions });
                else this.playSceneNode(window.SQ.Temp.currentSceneNode);

            } else if (opt.action === 'advance_chain') {
                const tags = passed ? (opt.nextTags || []) : (opt.failNextTags || []);
                // ── [修改三] 在推進前，檢查 curse_val 是否觸發強制 climax ──
                this._checkCurseOverflow();
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
            // 🌟 防呆機制：找不到場景時，發出警告但不中斷遊戲
            console.warn(`⚠️ 找不到目標場景 (ID: ${targetId})。可能劇本漏寫了 nextScene 或 failScene。系統已自動推進劇情。`);
            if (targetId !== 'GEN_MODULAR') {
                this.advanceChain(); // 👈 改成 advanceChain，讓遊戲繼續抽下一張卡！
            }
        }
    },

    // ============================================================
    // 🔄 SESSION MANAGEMENT
    // ============================================================
    resumeStory: function() {
        const gs = window.SQ.State;
 
        // 🌟 核心修復：一進來就先確保 chain 被還原，絕對不能等判斷節點才還原！
        if (!gs.story.chain && gs.story.savedChain) {
            gs.story.chain = this._deepClone(gs.story.savedChain);
        }

        // 過渡節點偵測：如果存的節點是「探索中...」這類無選項過渡節點，直接跳過
        const isTransitionNode = (node) => {
            if (!node) return false;
            const hasNoOptions = !node.options || node.options.length === 0;
            const hasNoExit    = node.noDefaultExit === true;
            return hasNoOptions && hasNoExit;
        };
 
        const memNode  = window.SQ.Temp.currentSceneNode;
        const saveNode = gs.story.currentNode;
 
        if (memNode && !isTransitionNode(memNode)) {
            this.playSceneNode(memNode);
        } else if (saveNode && !isTransitionNode(saveNode)) {
            this.playSceneNode(saveNode);
        } else if (gs.story.chain) {
            // 有鏈但沒有可恢復的節點（被過渡節點蓋掉），重新 generate 當前 stage
            console.warn("⚠️ resumeStory：偵測到過渡節點，重新生成當前場景");
            // 退一格 index 讓 generate 重新生成同一個 stage
            if (gs.story.chain.currentStageIdx > 0) gs.story.chain.currentStageIdx--;
            if (gs.story.chain.depth > 0) gs.story.chain.depth--;
            this.advanceChain([]);
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

        if (gs.story) { 
            gs.story.tags = []; 
            gs.story.vars = {}; 
            gs.story.flags = {}; 
            gs.story._curseOverflowTriggered = false; 
        }

        window.SQ.Temp.isProcessing = false;
        window.SQ.Temp.lockInput    = false;
        window.SQ.Temp.pendingRewardHtml = null; // ← 加入這行

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
            const gsForLearn = window.SQ.State;
            // 只有在設定中有開啟學習模式 (或有解鎖) 時，才加入 learning 標籤
            if (gsForLearn.settings && gsForLearn.settings.learningMode) {
                if (!gs.story.chain.tags.includes('learning')) {
                    gs.story.chain.tags.push('learning');
                }
            }

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

    // ── [修改三] curse_val 強制 climax 檢查 ──────────────────────
    _checkCurseOverflow: function() {
		const gs = window.SQ.State;
		if (!gs.story || !gs.story.chain) return;
		if (gs.story._curseOverflowTriggered) return;

		// 根據骨架決定要監控哪個變數
		const tensionKey = {
			horror:    'curse_val',
			mystery:   'tension',
			romance:   'pressure',
			raising:   'stress'
			// adventure 是反向，skill_points 越低越危險，另外處理
		}[gs.story.chain.skeleton] || 'curse_val';

		const val = (gs.story.vars && gs.story.vars[tensionKey]) || 0;
		if (val < 100) return;

        const chain = gs.story.chain;
        const climaxIdx = chain.stages.indexOf('climax');
        if (climaxIdx === -1) return;  // 這個骨架沒有 climax，不處理

        // 只有在還沒到 climax 的時候才強制跳
        if (chain.currentStageIdx <= climaxIdx) {
            console.warn(`💀 作祟值爆表（${curseVal}），強制跳至 climax！`);
            gs.story._curseOverflowTriggered = true;
            chain.currentStageIdx = climaxIdx;  // 指針強制設為 climax 位置

            if (window.SQ.Actions && window.SQ.Actions.toast) {
                window.SQ.Actions.toast("💀 作祟值爆表——它來了！");
            }
        }
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
            gs.story._curseOverflowTriggered = false; 
			console.log("🧹 區域變數、標籤與 flags 已清空");
        }
        
        window.SQ.Temp.pendingRewardHtml = null; // ← 加入這行

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
            
            // 🌟 修正：把 showOptions 放進回呼函式，確保打字機播完才顯示按鈕與獎勵
            if (window.SQ.View.Story && window.SQ.View.Story.appendChunk) {
                window.SQ.View.Story.appendChunk(html, isLast, () => {
                    if (isLast) {
                        ts.isWaitingInput = false;
                        if (window.SQ.View.Story.showOptions) {
                            window.SQ.View.Story.showOptions(ts.storyOptions);
                        }
                    }
                });
            }
            ts.storyStep++;
        }
    },

    // ============================================================
    // 📝 TEXT PROCESSING
    // ============================================================

    // _processText(raw)把節點的 text 欄位（字串 / 字串陣列 / 物件{zh,jp,...}）統一轉成 HTML 字串陣列，供 storyQueue 逐段播放。同時呼叫 _resolveDynamicText 展開 {fragment} 佔位符。
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
     * 1. 先查 chain.memory（固定記憶值）
     * 2. 再查 FragmentDB.fragments，隨機挑一個 val，遞迴展開
     * 3. 找不到的 key 原樣保留（顯示 {key}）
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
     * { text: "..." }               → 普通旁白
     * { text: {zh:"...", jp:"..."}} → 多語言旁白
     * { speaker: "角色", text: "..."} → 帶說話者的對話，渲染為加粗名字
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

            // 判斷是否為旁白
            if (item.speaker && item.speaker !== "旁白") {
                let speakerName = item.speaker;
                // 支援 speaker 也是多語言物件
                if (typeof speakerName === 'object' && speakerName !== null) {
                    const gs = window.SQ.State;
                    const lang = (gs.settings && gs.settings.targetLang) || 'zh';
                    speakerName = speakerName[lang] || speakerName['zh'] || '';
                }
                return `<b>${speakerName}</b>：${txt}`;
            }
            
            // 👇 凶手就是漏了這行！如果不是上述條件，必須把 txt 回傳！
            return txt;

        }).filter(s => s.trim() !== '');

        // 走與 playSceneNode 相同的後半段流程
        // 先觸發 onEnter、再設 storyQueue
        const gs = window.SQ.State;
        if (!gs.story) return;

        // ✅ 修正二-A：加上防護旗標，避免對話節點重播時無限發獎勵
        if (node.onEnter && !window.SQ.Temp._isNodeSelfReplay) {
            this._distributeRewards(node.onEnter);
        }

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

        // 處理選項（條件過濾 + 語系解析 + 變數替換 + 自動修正）
        let options = (node.options || [])
            .filter(opt => this._checkCondition(opt.condition))
            .map(opt => {
                // 1. 拆解多語系物件，取得純字串
                let labelStr = opt.label;
                if (typeof labelStr === 'object' && labelStr !== null) {
                    labelStr = labelStr[currentLang] || labelStr['zh'] || Object.values(labelStr)[0] || "未命名";
                }

                // 🌟 自動修正機制：如果帶有子場景，卻誤寫成 advance_chain，強制轉為 node_next
                let finalAction = opt.action || 'node_next';
                let hasSubScene = (opt.nextScene || opt.failScene || opt.nextSceneId || opt.failSceneId);
                
                if (hasSubScene && finalAction === 'advance_chain') {
                    finalAction = 'node_next';
                    console.log(`🔧 自動修正: 選項 [${labelStr}] 包含子場景，action 已強制轉為 node_next`);
                }
                
                // 2. 送入引擎替換 {lover} 等變數
                return {
                    ...opt,
                    label:  this._resolveDynamicText(labelStr),
                    action: finalAction
                };
            });
			
		// 🌟 修正：只有「非 HUB」的劇情才會洗牌
                if (options.length > 1 && !node.isHub && node.id !== 'root_hub') {
                    options = this._shuffle(options);
                }

                // 🌟 修正：事件結束時自動顯示地圖按鈕把玩家留住
                if (options.length === 0 && !node.noDefaultExit) {
                    if (window.SQ.Engine.Map && window.SQ.Engine.Map.map.length > 0 && window.SQ.Temp.lastHubNode) {
                        options = window.SQ.Engine.Map.injectMapOptions(options);
                    } else {
                        options.push({ label: "離開", action: "finish_chain", style: "primary" });
                    }
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