// ============================================================
// 2. 主引擎 (StoryEngine) - V53.0 Tag Fix
// ============================================================
window.StoryEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        if (!gs.story) gs.story = { energy: this.calculateMaxEnergy(), deck: [], learning: {}, tags: [] };
        if (!gs.story.tags) gs.story.tags = [];
        if (!gs.story.learning) gs.story.learning = {};
        this.loadDatabase();
        this.checkEnergyLoop();
        console.log("⚙️ StoryEngine V53.0 (Tag Refresh Fixed) Ready");
    },

    loadDatabase: function() {
        window.StoryData = window.StoryData || {};
        const gs = window.GlobalState;
        const sceneDB = window.SCENE_DB || {};
        const mode = gs.settings?.gameMode || 'adventurer';
        let roots = (sceneDB[mode] || []).filter(s => s.entry);
        window.StoryData.pool = [...roots];
        for(let i=0; i<3; i++) window.StoryData.pool.push('GEN_MODULAR');
        gs.story.deck = this.shuffle([...window.StoryData.pool]);
    },

    checkCondition: function(cond) {
        if (!cond) return true;
        const gs = window.GlobalState;
        const myTags = gs.story.tags || [];
        if (cond.hasTag && !myTags.includes(cond.hasTag)) return false;
        if (cond.noTag && myTags.includes(cond.noTag)) return false;
        if (cond.stat) {
            const val = this.getPlayerStat(cond.stat.key || cond.stat);
            if (val < (cond.val || 0)) return false;
        }
        return true;
    },

    // [Fix] 播放節點 (支援 Dialogue)
    playSceneNode: function(node) {
        if (!node) { this.drawAndPlay(); return; }
        
        // 🟢 1. 攔截對話陣列
        if (node.dialogue && node.dialogue.length > 0) {
            this.playDialogueChain(node);
            return;
        }

        window.TempState.currentSceneNode = node; 
        
        // 2. 過濾選項
        let options = (node.options || [])
            .filter(opt => this.checkCondition(opt.condition)) 
            .map(opt => ({
                label: opt.label, action: opt.action || 'node_next',
                nextScene: opt.nextScene, failScene: opt.failScene, ...opt
            }));
        
        // 3. 死路防呆
        if (options.length === 0) {
            options.push({ label: "離開", action: "finish_chain", style: "primary" });
        }
        
        // 4. 確保有文字 (防止 View 崩潰)
        const safeText = node.text || "(...)";

        this.renderSceneContent({
            text: safeText, 
            location: "Story", 
            options: options
        });
    },

    // [New] 處理固定劇本的對話鏈
    playDialogueChain: function(node) {
        const dialogues = node.dialogue;
        
        // 遞迴構建顯示節點
        const build = (idx) => {
             const d = dialogues[idx];
             const lang = window.GlobalState.settings.targetLang || 'zh';
             const txt = d.text[lang] || d.text['zh'] || d.text;
             const displayText = `【${d.speaker}】\n${txt}`;

             // 如果是最後一句對話
             if (idx === dialogues.length - 1) {
                 // 回傳一個包含「原本選項」的節點
                 // 這樣對話結束後，玩家就能看到 "記錄證詞" 或 "購買" 等選項
                 return {
                     text: displayText,
                     options: node.options, // 接回原本的選項
                     rewards: node.rewards
                 };
             }

             // 如果還有下一句，顯示「繼續」
             return {
                 text: displayText,
                 options: [{
                     label: "繼續",
                     action: "node_next",
                     nextScene: build(idx+1)
                 }]
             };
        };
        
        // 開始播放第一句
        this.playSceneNode(build(0));
    },

    selectOption: function(idx) {
        if (window.TempState.isProcessing) return;
        window.TempState.isProcessing = true;

        const card = window.TempState.storyCard;
        const opt = card.options[idx];

        if (opt.action === 'answer_quiz') {
            this.handleQuizResult(opt.wordId, opt.isCorrect);
            setTimeout(() => { window.TempState.isProcessing = false; this.finishChain(); }, 1000);
            return;
        }

        const gs = window.GlobalState;
        if (opt.req) {
            if ((opt.req.gold && (gs.gold||0) < opt.req.gold)) {
                 if(window.act) act.toast("❌ 金幣不足"); 
                 window.TempState.isProcessing = false; return;
            }
            if (opt.req.gold) gs.gold -= opt.req.gold;
        }

        setTimeout(() => {
            window.TempState.isProcessing = false;
            
            let passed = true;
            if (opt.check) {
                const stat = this.getPlayerStat(opt.check.stat);
                const roll = Math.floor(Math.random()*20)+1;
                passed = (stat + roll >= opt.check.val);
                if(window.storyView) window.storyView.appendInlineCheckResult(opt.check.stat, stat+roll, passed);
            }

            let newTagGained = false;
            if (passed && opt.rewards) {
                newTagGained = this.distributeRewards(opt.rewards);
            }

            if (opt.action === 'node_next') {
                const target = passed ? opt.nextScene : opt.failScene;
                if (target) this.playSceneNode(target);
                else this.finishChain();
            } 
            else if (opt.action === 'investigate') {
                if(opt.result) {
                    window.TempState.currentSceneNode.text = opt.result;
                    if (newTagGained) window.TempState.currentSceneNode.text += "\n\n(🔍 發現新選項！)";
                }
                this.playSceneNode(window.TempState.currentSceneNode);
            } 
            else if (opt.action === 'advance_chain') {
                const tags = passed ? (opt.nextTags||[]) : (opt.failNextTags||[]);
                this.advanceChain(tags);
            } 
            else {
                this.finishChain();
            }
            
            if(window.App) App.saveData();

        }, 500);
    },

    distributeRewards: function(rewards) {
        const gs = window.GlobalState;
        let msgs = [];

        if (rewards.gold) { gs.gold += rewards.gold; msgs.push(`💰 +${rewards.gold}`); }
        if (rewards.exp) { gs.exp += rewards.exp; msgs.push(`✨ +${rewards.exp}`); }
        if (rewards.energy) { gs.story.energy = Math.min(this.calculateMaxEnergy(), gs.story.energy + rewards.energy); msgs.push(`⚡ +${rewards.energy}`); }
        
        let tagAdded = false;
        if (rewards.tags) {
            rewards.tags.forEach(tag => {
                if (!gs.story.tags.includes(tag)) {
                    gs.story.tags.push(tag);
                    msgs.push(`🏷️ 獲得: ${tag}`);
                    tagAdded = true;
                }
            });
        }
        if (rewards.removeTags) {
            rewards.removeTags.forEach(tag => {
                const idx = gs.story.tags.indexOf(tag);
                if (idx > -1) {
                    gs.story.tags.splice(idx, 1);
                    msgs.push(`🗑️ 消耗: ${tag}`);
                }
            });
        }

        if (msgs.length > 0 && window.act) act.toast(msgs.join("  "));
        return tagAdded;
    },

    startRandomChain: function() {
        const gs = window.GlobalState;
        const sceneData = StoryGenerator.generate([], true);
        let depth = 3;
        if (sceneData.structure) {
            const base = sceneData.structure.baseDepth || 3;
            const vari = sceneData.structure.variance || 0;
            depth = base + Math.floor(Math.random() * (vari + 1));
        }
        gs.story.chain = { depth: 0, maxDepth: depth, accumulatedTags: [], memory: {} };
        this.renderSceneContent(sceneData);
    },
    advanceChain: function(nextTags = []) {
        const gs = window.GlobalState;
        if (!gs.story.chain) return;
        gs.story.chain.depth++;
        const scene = StoryGenerator.generate(nextTags, false);
        this.renderSceneContent(scene);
    },
    finishChain: function() {
        window.GlobalState.story.chain = null;
        this.showLocationIdle();
        if(window.App) App.saveData();
    },
    pickSpiralWord: function() {
        const db = window.LearningDB;
        if (!db || !db.words) return null;
        const gs = window.GlobalState;
        const progress = gs.story.learning;
        const now = Date.now();
        let candidates = db.words.filter(w => {
            const p = progress[w.id];
            return !p || (p.nextReview && p.nextReview <= now);
        });
        if (candidates.length === 0) candidates = db.words.filter(w => !progress[w.id]);
        if (candidates.length === 0) candidates = db.words;
        return candidates[Math.floor(Math.random() * candidates.length)];
    },
    pickWrongOptions: function(correctId, count) {
        const db = window.LearningDB;
        if (!db || !db.words) return [];
        return db.words.filter(w => w.id !== correctId).sort(() => Math.random() - 0.5).slice(0, count);
    },
    handleQuizResult: function(wordId, isCorrect) {
        const gs = window.GlobalState;
        if (!gs.story.learning[wordId]) gs.story.learning[wordId] = { seen: 0, correct: 0, level: 0 };
        const rec = gs.story.learning[wordId];
        rec.seen++;
        if (isCorrect) {
            rec.correct++; rec.level++;
            const intervals = [60000, 600000, 3600000, 86400000];
            const wait = intervals[Math.min(rec.level, intervals.length)-1] || 86400000;
            rec.nextReview = Date.now() + wait;
            if(window.act) act.toast("✅ 正確！記憶加深");
            gs.exp += 15;
        } else {
            rec.level = Math.max(0, rec.level - 1);
            rec.nextReview = Date.now() + 30000;
            if(window.act) act.toast("❌ 錯誤... 加油");
        }
    },
    drawAndPlay: function() {
        const gs = window.GlobalState;
        if (gs.story.deck.length === 0) this.loadDatabase();
        const card = gs.story.deck.shift();
        if (card === 'GEN_MODULAR') this.startRandomChain();
        else this.playSceneNode(card);
    },
    shuffle: function(arr) { return arr.sort(() => Math.random() - 0.5); },
    renderSceneContent: function(s) {
        window.TempState.storyCard = s;
        if (window.storyView && window.storyView.render) window.storyView.render();
    },
    showLocationIdle: function() {
        window.TempState.storyCard = null;
        if (window.storyView && window.storyView.render) window.storyView.render();
    },
    getPlayerStat: function(key) {
        const gs = window.GlobalState;
        const k = key.toUpperCase();
        return (gs.attrs && gs.attrs[k]) ? gs.attrs[k].v : 0;
    },
    calculateMaxEnergy: function() { 
        const gs = window.GlobalState;
        const lv = (gs && gs.lv) ? gs.lv : 1;
        return Math.min(100, 30 + (lv - 1) * 2); 
    },
    checkEnergyLoop: function() {
        const recover = () => {
             const gs = window.GlobalState;
             if (!gs || !gs.story) return;
             const max = this.calculateMaxEnergy();
             if (gs.story.energy < max) {
                 gs.story.energy = Math.min(max, gs.story.energy + 1);
                 if(window.view && view.updateHUD) view.updateHUD(gs);
             }
        };
        setInterval(recover, 60000);
    },
    // [New] 過場動畫邏輯
    transitToEncounter: function() {
        const loadingText = "探索中......";
        
        // 1. 創建一個沒有選項的場景卡，模擬 Loading 畫面
        const loadingScene = {
            text: loadingText,
            location: "...",
            options: [] // 空選項，玩家無法操作
        };

        // 第一遍渲染
        this.renderSceneContent(loadingScene);

        // 模擬兩段式 Loading 的節奏
        setTimeout(() => {
            // 第二遍渲染 (刷新打字機效果)
            this.renderSceneContent({ ...loadingScene }); // 複製物件以觸發 View 重繪

            setTimeout(() => {
                // 最後進入正式抽卡
                this.drawAndPlay();
            }, 600); // 第二段停頓 (原本是 500ms + 速度)

        }, 800); // 第一段停頓 (原本是 250ms + 速度)
    },

    // [Mod] 探索入口
    explore: function() {
        const gs = window.GlobalState;
        if (!gs.story) this.init();
        
        // 檢查與扣除
        if (gs.story.energy < 5) return { success: false, msg: "精力不足" };
        gs.story.energy -= 5;
        
        // [Change] 改為呼叫過場動畫，而非直接抽卡
        this.transitToEncounter();
        
        return { success: true };
    },
};