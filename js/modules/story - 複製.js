/* js/modules/story.js - V69.0 (ID Lookup & Circular Fix) */

window.StoryEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        
        if (!gs.story) gs.story = { energy: this.calculateMaxEnergy(), deck: [], learning: {}, tags: [] };
        if (!gs.story.tags) gs.story.tags = [];
        if (!gs.story.learning) gs.story.learning = {};
        
        window.TempState.isProcessing = false;
        window.TempState.lockInput = false;
        window.TempState.isWaitingInput = false;

        this.loadDatabase();
        this.checkEnergyLoop();
        console.log("⚙️ StoryEngine V69.0 Ready");
    },

    loadDatabase: function() {
        window.StoryData = window.StoryData || {};
        const gs = window.GlobalState;
        const sceneDB = window.SCENE_DB || {};
        const mode = gs.settings?.gameMode || 'adventurer';
        
        // 建立 ID 索引表 (Flatten DB)
        window.StoryData.sceneMap = {};
        
        // 遍歷所有劇本包，建立 ID 索引
        for (let key in sceneDB) {
            sceneDB[key].forEach(scene => {
                this.registerSceneRecursive(scene);
            });
        }

        let roots = (sceneDB[mode] || []).filter(s => s.entry);
        window.StoryData.pool = [...roots];
        for(let i=0; i<3; i++) window.StoryData.pool.push('GEN_MODULAR');
        
        if (!gs.story.deck || gs.story.deck.length === 0) {
            gs.story.deck = this.shuffle([...window.StoryData.pool]);
        }
    },

    // [New] 遞迴註冊所有場景到 Map 中
    registerSceneRecursive: function(scene) {
        if (!scene) return;
        if (scene.id) window.StoryData.sceneMap[scene.id] = scene;
        
        // 檢查選項中是否包含內嵌場景 (雖然現在建議用 ID，但相容舊版)
        if (scene.options) {
            scene.options.forEach(opt => {
                if (opt.nextScene && opt.nextScene.id) {
                    this.registerSceneRecursive(opt.nextScene);
                }
            });
        }
    },

    // [New] 透過 ID 查找場景
    findSceneById: function(id) {
        if (!window.StoryData.sceneMap) this.loadDatabase();
        // 1. 查表
        if (window.StoryData.sceneMap[id]) return window.StoryData.sceneMap[id];
        // 2. 查全域變數 (相容舊寫法)
        if (window[id]) return window[id];
        return null;
    },

    resumeStory: function() {
        console.log("🔄 Resuming story...");
        const gs = window.GlobalState;
        
        if (window.TempState.currentSceneNode) {
            this.playSceneNode(window.TempState.currentSceneNode);
            return;
        } 
        
        if (gs.story.currentNode) {
            console.log("📂 Loading saved node...");
            if (!gs.story.chain && gs.story.savedChain) {
                gs.story.chain = gs.story.savedChain;
            }
            this.playSceneNode(gs.story.currentNode);
            return;
        }

        console.warn("❌ No resume data found.");
        this.finishChain();
    },

    abandonStory: function() {
        window.GlobalState.story.chain = null;
        window.GlobalState.story.currentNode = null;
        window.GlobalState.story.savedChain = null;
        window.TempState.currentSceneNode = null;
        window.TempState.storyCard = null;
        window.TempState.isProcessing = false;
        window.TempState.lockInput = false;
        
        this.showLocationIdle();
        if(window.act) act.toast("🗑️ 已放棄目前的冒險");
        if(window.App) App.saveData();
    },

    // ============================================================
    // 播放邏輯
    // ============================================================
    
    playSceneNode: function(node) {
        if (!node) { this.drawAndPlay(); return; }

        if (node.dialogue && node.dialogue.length > 0) {
            this.playDialogueChain(node);
            return;
        }

        // [Fix] 存檔前進行淨化 (Sanitize)，移除循環參照
        const safeNode = this.sanitizeNode(node);
        window.GlobalState.story.currentNode = safeNode;
        
        if (window.GlobalState.story.chain) {
            window.GlobalState.story.savedChain = window.GlobalState.story.chain;
        }
        
        // TempState 使用原始 node (保持物件參照以供運作)
        window.TempState.currentSceneNode = node;
        window.TempState.storyCard = node;
        
        let rawText = node.text || "(...)";
        let processedText;
        if (Array.isArray(rawText)) {
            processedText = rawText.map(t => this.resolveDynamicText(t));
        } else {
            processedText = [this.resolveDynamicText(rawText)];
        }

        let options = (node.options || [])
            .filter(opt => this.checkCondition(opt.condition)) 
            .map(opt => ({
                label: this.resolveDynamicText(opt.label),
                action: opt.action || 'node_next',
                nextScene: opt.nextScene, // 記憶體中保留物件
                nextSceneId: opt.nextSceneId, // 優先使用 ID
                failScene: opt.failScene,
                ...opt
            }));

        if (options.length === 0) {
            options.push({ label: "離開", action: "finish_chain", style: "primary" });
        }

        window.TempState.storyQueue = processedText;
        window.TempState.storyStep = 0;
        window.TempState.storyOptions = options;
        window.TempState.isWaitingInput = true; 
        window.TempState.isProcessing = false;

        if (window.storyView && storyView.clearScreen) {
            storyView.clearScreen();
            this.playNextChunk();
        } else {
            this.renderSceneContent({
                text: processedText.join("\n"), 
                location: "Story", 
                options: options
            });
        }
        
        if(window.App) App.saveData();
    },

    // [New] 淨化節點：移除循環物件，只保留資料
    sanitizeNode: function(node) {
        // 淺拷貝
        const safe = { ...node };
        
        // 處理選項
        if (safe.options) {
            safe.options = safe.options.map(opt => {
                const safeOpt = { ...opt };
                // [Critical] 移除可能造成循環的物件參照
                // 如果有 nextSceneId，我們就不需要 nextScene 物件了，刪掉它以確保 JSON 安全
                if (safeOpt.nextSceneId) {
                    delete safeOpt.nextScene; 
                }
                // 對於隨機生成的樹狀結構，nextScene 通常是安全的，保留
                // 但如果是 Hub 結構，必須依賴 nextSceneId
                return safeOpt;
            });
        }
        // 移除 dialogue 避免重複處理
        if (safe.dialogue) delete safe.dialogue; 
        
        return safe;
    },

    resolveDynamicText: function(text) {
        if (!text || typeof text !== 'string') return text;
        const gs = window.GlobalState;
        const memory = (gs.story.chain && gs.story.chain.memory) ? gs.story.chain.memory : {};
        
        return text.replace(/{(\w+)}/g, (match, key) => {
            if (memory[key]) return memory[key];
            if (key === 'player') return '冒險者';
            if (key === 'gold') return gs.gold;
            return match; 
        });
    },

    playNextChunk: function() {
        const ts = window.TempState;
        if (ts.lockInput) return;

        if (!ts.storyQueue) return;

        if (ts.storyStep < ts.storyQueue.length) {
            let rawTxt = ts.storyQueue[ts.storyStep];
            let formattedHtml = this.formatText(rawTxt);
            let isLastChunk = (ts.storyStep === ts.storyQueue.length - 1);

            if (window.storyView && storyView.appendChunk) {
                storyView.appendChunk(formattedHtml, isLastChunk);
            }

            ts.storyStep++;
        } 
        
        if (ts.storyStep >= ts.storyQueue.length) {
            ts.isWaitingInput = false; 
            if (window.storyView && storyView.showOptions) {
                storyView.showOptions(ts.storyOptions);
            }
        }
    },

    clickScreen: function() {
        if (window.TempState.isWaitingInput && !window.TempState.lockInput) {
            this.playNextChunk();
        }
    },

    formatText: function(text) {
        if (/^[\(（].*[\)）]$/.test(text)) {
            return `<div class="story-narrative">${text}</div>`;
        }
        if (text.includes("：") || text.includes("「") || text.includes('"')) {
            return `<div class="story-dialogue">${text}</div>`;
        }
        return `<div class="story-action">${text}</div>`;
    },

    playDialogueChain: function(node) {
        const dialogues = node.dialogue;
        const lang = window.GlobalState.settings.targetLang || 'zh';

        let textQueue = dialogues.map(d => {
             const txt = d.text[lang] || d.text['zh'] || d.text;
             if (d.speaker === '旁白' || !d.speaker) {
                 return `（${txt}）`;
             }
             return `<b>${d.speaker}</b>：「${txt}」`;
        });

        this.playSceneNode({
            text: textQueue,
            options: node.options,
            rewards: node.rewards
        });
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

    selectOption: function(idx) {
        if (window.TempState.isProcessing) return;
        window.TempState.isProcessing = true;
        
        setTimeout(() => { if (window.TempState.isProcessing) window.TempState.isProcessing = false; }, 3000);

        const ts = window.TempState;
        if (!ts.storyOptions || !ts.storyOptions[idx]) {
            window.TempState.isProcessing = false;
            return;
        }
        
        const opt = ts.storyOptions[idx];

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
                if(window.storyView && storyView.appendInlineCheckResult) {
                    storyView.appendInlineCheckResult(opt.check.stat, stat+roll, passed);
                }
            }

            let newTagGained = false;
            if (passed && opt.rewards) {
                newTagGained = this.distributeRewards(opt.rewards);
            }

            if (opt.action === 'node_next') {
                // [Critical Fix] 優先處理 ID
                let target = null;
                if (passed) {
                    if (opt.nextSceneId) target = this.findSceneById(opt.nextSceneId);
                    else target = opt.nextScene;
                } else {
                    target = opt.failScene;
                }

                if (target) this.playSceneNode(target);
                else this.finishChain();
            } 
            else if (opt.action === 'investigate') {
                if(opt.result) {
                    this.playSceneNode({ text: [opt.result], options: ts.storyOptions });
                } else {
                    this.playSceneNode(window.TempState.currentSceneNode);
                }
            } 
            else if (opt.action === 'advance_chain') {
                const tags = passed ? (opt.nextTags||[]) : (opt.failNextTags||[]);
                this.advanceChain(tags);
            } 
            else {
                this.finishChain();
            }
            
            if(window.App) App.saveData();

        }, 200);
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
                let resolvedTag = this.resolveDynamicText(tag);
                if (!gs.story.tags.includes(resolvedTag)) {
                    gs.story.tags.push(resolvedTag);
                    msgs.push(`🏷️ 獲得: ${resolvedTag}`);
                    tagAdded = true;
                }
            });
        }
        if (rewards.removeTags) {
            rewards.removeTags.forEach(tag => {
                let resolvedTag = this.resolveDynamicText(tag);
                const idx = gs.story.tags.indexOf(resolvedTag);
                if (idx > -1) {
                    gs.story.tags.splice(idx, 1);
                    msgs.push(`🗑️ 消耗: ${resolvedTag}`);
                }
            });
        }

        if (msgs.length > 0 && window.act) act.toast(msgs.join("  "));
        return tagAdded;
    },

    transitToEncounter: function() {
        const gs = window.GlobalState;
        if (gs.story.energy < 5) {
            if(window.act) act.toast("❌ 精力不足 (需要 5)");
            return;
        }
        gs.story.energy -= 5;
        window.TempState.lockInput = true;
        window.TempState.isProcessing = true;
        this.playSceneNode({ text: ["探索中...", "正在前往未知的區域..."], options: [] });
        setTimeout(() => {
            window.TempState.lockInput = false;
            window.TempState.isProcessing = false;
            this.drawAndPlay();
            if(window.App) App.saveData();
        }, 1500);
    },

    explore: function() {
        const gs = window.GlobalState;
        if (!gs.story) this.init();
        this.transitToEncounter();
        return { success: true };
    },

    // 輔助函數
    startRandomChain: function() {
        const gs = window.GlobalState;
        const sceneData = StoryGenerator.generate([], true);
        let depth = 3;
        if (sceneData.structure) {
            const base = sceneData.structure.baseDepth || 3;
            const vari = sceneData.structure.variance || 0;
            depth = base + Math.floor(Math.random() * (vari + 1));
        }
        gs.story.chain = { depth: 0, maxDepth: depth, accumulatedTags: [], memory: {}, history: [] };
        this.playSceneNode(sceneData);
    },
    advanceChain: function(nextTags = []) {
        const gs = window.GlobalState;
        if (!gs.story.chain) return;
        gs.story.chain.depth++;
        const scene = StoryGenerator.generate(nextTags, false);
        this.playSceneNode(scene);
    },
    finishChain: function() {
        window.GlobalState.story.chain = null;
        window.GlobalState.story.currentNode = null;
        window.GlobalState.story.savedChain = null;
        window.TempState.currentSceneNode = null;
        window.TempState.storyCard = null;
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
        if (window.storyView && window.storyView.render) {
            window.TempState.storyCard = s;
            window.storyView.render();
        }
    },
    showLocationIdle: function() {
        window.TempState.storyCard = null;
        if (window.storyView && window.storyView.renderIdle) window.storyView.renderIdle();
        else if (window.storyView && window.storyView.render) window.storyView.render();
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
    }
};