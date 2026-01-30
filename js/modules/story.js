window.StoryGenerator = {
    _sysDict: { investigate: { zh: "調查" }, explore_deeper: { zh: "繼續深入" }, finish: { zh: "完成" } },
    _t: function(k, l) { return (this._sysDict[k] && this._sysDict[k][l]) || this._sysDict[k]?.zh || k; },

    generate: function(contextTags = []) {
        const gs = window.GlobalState;
        if (!gs.story.chain) gs.story.chain = { depth: 0, maxDepth: 3, accumulatedTags: [], memory: {} };
        
        const depth = gs.story.chain.depth;
        const maxDepth = gs.story.chain.maxDepth;
        let targetType = (depth === 0) ? 'setup' : (depth >= maxDepth ? 'ending' : 'event');

        // [Fix] 失敗斷鏈保底
        if (contextTags.includes('combat_defeat')) targetType = 'ending';

        const template = this.pickTemplate(targetType, contextTags);
        const lang = gs.settings?.targetLang || 'zh';
        
        if (!template) {
            // [Fallback]
            return {
                id: `gen_fallback_${Date.now()}`,
                text: "前方充滿了未知的迷霧...",
                options: [{ label: "完成", action: "finish_chain", style: 'primary' }],
                type: targetType
            };
        }

        const filledData = this.fillTemplate(template, lang);
        const dynamicOptions = this.generateOptions(template, filledData.fragments, lang, targetType);

        return {
            id: `gen_${Date.now()}`,
            text: filledData.text,
            location: filledData.locationStr || "Event",
            options: dynamicOptions,
            meta: filledData.fragments,
            type: targetType
        };
    },

    pickTemplate: function(type, contextTags) {
        const db = window.FragmentDB;
        if (!db || !db.templates) return null;
        const currentMode = window.GlobalState.settings?.gameMode || 'adventurer';

        let candidates = db.templates.filter(t => {
            if (t.type !== type) return false;
            if (t.mode && t.mode !== currentMode) return false;
            return true;
        });

        if (contextTags.length > 0) {
            const match = candidates.filter(t => t.reqTag && contextTags.includes(t.reqTag));
            if (match.length > 0) return this.weightedRandom(match);
        }
        
        const fallback = candidates.filter(t => !t.reqTag);
        if (fallback.length > 0) return this.weightedRandom(fallback);
        return null;
    },

    fillTemplate: function(tmpl, lang) {
        const db = window.FragmentDB;
        const gs = window.GlobalState;
        const memory = gs.story.chain.memory || {}; 

        let finalStr = tmpl.text[lang] || tmpl.text['zh'];
        let chosenFragments = {};
        
        finalStr = finalStr.replace(/\{memory:(\w+)\}/g, (m, k) => memory[k] || "某人");

        (tmpl.slots || []).forEach(key => {
            const list = db.fragments[key];
            if (list && list.length > 0) {
                const item = this.weightedRandom(list);
                const word = item.val[lang] || item.val['zh'];
                finalStr = finalStr.replace(`{${key}}`, word);
                chosenFragments[key] = item;
                memory[key] = word; 
            } else if (memory[key]) {
                finalStr = finalStr.replace(`{${key}}`, memory[key]);
            } else {
                // [Fix] 使用圓括號避免 Ruby 解析錯誤
                finalStr = finalStr.replace(`{${key}}`, `(未知${key})`);
            }
        });
        gs.story.chain.memory = memory;
        return { text: finalStr, fragments: chosenFragments };
    },

    // [Fix] 修復變數名稱錯誤 (random -> r)
    weightedRandom: function(list) {
        if (!list || list.length === 0) return null;
        let total = 0; 
        list.forEach(item => { total += (item.weight || 1); });
        
        let r = Math.random() * total; // 這裡定義的是 r
        
        for (let i = 0; i < list.length; i++) {
            r -= (list[i].weight || 1);
            if (r <= 0) return list[i]; // [修正] 這裡原本寫成 random <= 0，已改為 r
        }
        return list[0];
    },
    generateOptions: function(tmpl, fragments, lang, type) {
        let opts = [];
        const db = window.FragmentDB;
        
        let activeTags = [];
        Object.values(fragments).forEach(item => {
            if (item.tags) activeTags = activeTags.concat(item.tags);
        });
        if (tmpl.outTags) activeTags = activeTags.concat(tmpl.outTags);

        if (type === 'ending') {
            opts.push({
                label: this._t('finish', lang),
                style: "primary",
                action: "finish_chain"
            });
            return opts;
        }

        if (db.optionRules) {
            db.optionRules.forEach(rule => {
                if (activeTags.includes(rule.reqTag)) {
                    rule.options.forEach(ruleOpt => {
                        let labelStr = ruleOpt.label[lang] || ruleOpt.label['zh'];
                        opts.push({
                            label: labelStr,
                            style: ruleOpt.style || "normal",
                            action: ruleOpt.action || "advance_chain",
                            nextTags: ruleOpt.nextTags || [],
                            failNextTags: ruleOpt.failNextTags || [], // [Fix] 支援失敗分支
                            req: ruleOpt.req,
                            check: ruleOpt.check,
                            failNext: ruleOpt.failNext
                        });
                    });
                }
            });
        }

        if (opts.length === 0) {
            opts.push({
                label: this._t('explore_deeper', lang),
                style: "normal",
                action: "advance_chain",
                nextTags: [] 
            });
        }
        return opts;
    }
};

// ============================================================
// 2. 主引擎 (StoryEngine)
// ============================================================
window.StoryEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        
        if (!gs.story) gs.story = { energy: 100, deck: [], discard: [], tags: [], cooldowns: [] };
        if (!Array.isArray(gs.story.deck)) gs.story.deck = [];
        // [Fix] 確保模式存在
        if (!gs.settings) gs.settings = { targetLang: 'zh', gameMode: 'adventurer' };
        if (!gs.settings.gameMode) gs.settings.gameMode = 'adventurer';

        this.loadDatabase();
        this.checkEnergyLoop(); // 假設外部有定義
        console.log("⚙️ StoryEngine V48.5 (Integrated) Ready");
    },

    selectOption: function(idx) { this.makeChoice(idx); },

    // [V45 Feature] 統一屬性讀取 (Stats Integration)
    getPlayerStat: function(key) {
        const gs = window.GlobalState;
        if (!gs.attrs) return 0;
        const direct = gs.attrs[key];
        if (direct && typeof direct.v === 'number') return direct.v;
        const upperKey = key.toUpperCase();
        const mapped = gs.attrs[upperKey];
        if (mapped && typeof mapped.v === 'number') return mapped.v;
        return 0;
    },

    addPlayerStat: function(key, val) {
        const gs = window.GlobalState;
        if (!gs.attrs) return;
        const upperKey = key.toUpperCase();
        if (gs.attrs[upperKey]) {
            gs.attrs[upperKey].v += val;
            if (window.EventBus && window.EVENTS) EventBus.emit(EVENTS.Stats.UPDATED, gs.attrs);
        }
    },

    // [V46+V48 Feature] 載入資料庫 (巢狀節點 + 入口過濾)
    loadDatabase: function() {
        window.StoryData = window.StoryData || {};
        window.StoryData.pool = [];
        
        const gs = window.GlobalState;
        const currentMode = gs.settings.gameMode || 'adventurer';
        const nestedDB = window.SCENE_DB || {}; // V48 巢狀資料庫
        
        // 1. 讀取該模式下的所有根劇本 (Root Nodes)
        let roots = [];
        if (Array.isArray(nestedDB[currentMode])) {
            // 如果是 V48 陣列結構
            roots = nestedDB[currentMode]; 
        } else if (nestedDB[currentMode]) {
            // 如果是 V46 物件結構，轉為陣列並過濾 entry
            const group = nestedDB[currentMode];
            Object.values(group).forEach(scene => {
                if (scene.entry === true) roots.push(scene);
            });
        }

        // 2. 混合牌庫 (1 固定 : 1 隨機)
        window.StoryData.pool = [...roots]; 
        const genCount = Math.max(2, roots.length); 
        for(let i=0; i<genCount; i++) window.StoryData.pool.push('GEN_MODULAR');
        
        // 3. 洗牌並寫入 Deck
        gs.story.deck = this.shuffle([...window.StoryData.pool]);
        console.log(`🎴 牌庫重建: 模式[${currentMode}], 固定入口[${roots.length}], 隨機卡[${genCount}]`);
    },

    reloadDeck: function() { this.loadDatabase(); },

    shuffle: function(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    explore: function() {
        const gs = window.GlobalState;
        if (!gs.story) this.init();

        const cost = 5;
        if ((gs.story.energy || 0) < cost) {
            if(window.act && act.toast) act.toast("❌ 精力不足");
            return { success: false, msg: "精力不足" }; 
        }
        
        gs.story.energy -= cost;
        this.drawAndPlay();
        
        if(window.App) App.saveData();
        return { success: true }; 
    },

    // [Core] 抽卡與播放
    drawAndPlay: function() {
        const gs = window.GlobalState;
        if (gs.story.deck.length === 0) this.reloadDeck();
        
        // 20% 洗牌檢測
        const total = gs.story.deck.length + gs.story.discard.length;
        if (total > 0 && gs.story.deck.length / total < 0.2) {
            gs.story.deck = this.shuffle(gs.story.deck.concat(gs.story.discard));
            gs.story.discard = [];
        }

        const cardOrId = gs.story.deck.shift();
        
        if (cardOrId === 'GEN_MODULAR') {
            this.startRandomChain();
        } else if (typeof cardOrId === 'object') {
            // V48 巢狀物件
            this.playSceneNode(cardOrId);
        } else if (typeof cardOrId === 'string') {
            // V46 舊版 ID 兼容
            this.playFixedSceneID(cardOrId);
        } else {
            this.drawAndPlay(); // 異常，重抽
        }
    },

    // [V48 Core] 播放節點 (巢狀結構)
    playSceneNode: function(node) {
        if (!node) { this.drawAndPlay(); return; }
        
        // 暫存當前節點 (供 investigate 刷新使用)
        window.TempState.currentSceneNode = node;

        // 轉換選項
        const options = (node.options || []).filter(opt => this.checkCondition(opt.condition)).map(opt => ({
            label: opt.label || opt.text,
            action: opt.action || 'node_next', 
            nextScene: opt.nextScene,
            failScene: opt.failScene,
            ...opt
        }));

        // 自動追加離開
        if (options.length === 0) {
            options.push({ label: "離開", action: "finish_scene" });
        }

        this.renderSceneContent({
            text: node.text,
            location: "Adventure",
            options: options
        });
    },

    // --- Chain Logic ---
    startRandomChain: function() {
        const gs = window.GlobalState;
        gs.story.chain = { depth: 0, maxDepth: 2, accumulatedTags: [], memory: {} }; // Depth 0->1->2 (End)
        const scene = StoryGenerator.generate([]);
        this.renderSceneContent(scene);
    },

    advanceChain: function(nextTags) {
        const gs = window.GlobalState;
        if (!gs.story.chain) return;
        gs.story.chain.depth++;
        if (nextTags) gs.story.chain.accumulatedTags = gs.story.chain.accumulatedTags.concat(nextTags);
        
        const scene = StoryGenerator.generate(nextTags);
        this.renderSceneContent(scene);
    },

    finishChain: function() {
        window.GlobalState.story.chain = null;
        this.showLocationIdle();
    },

   // [V46 Compat] 舊版 ID 播放 (相容性保留)
    playFixedSceneID: function(id) {
        // 為了支援舊邏輯，如果你還沒完全轉移到 V48
        const data = window.StoryData.scenes ? window.StoryData.scenes[id] : null;
        if(data) this.playSceneNode(data); // 嘗試轉為 node 播放
        else this.drawAndPlay();
    },

    // [V48.5 Feature] 互動與鎖定
    makeChoice: function(input) {
        // 1. 防連點鎖定
        if (window.TempState.isProcessing) return;

        const card = window.TempState.storyCard;
        const opt = (typeof input === 'number') ? card.options[input] : input;
        if (!opt) return;

        const gs = window.GlobalState;

        // 2. 消耗檢查
        if (opt.req) {
            if ((opt.req.gold && (gs.gold||0) < opt.req.gold) || (opt.req.energy && (gs.story.energy||0) < opt.req.energy)) {
                 if(window.act && act.toast) act.toast("❌ 條件不足"); return;
            }
            if (opt.req.gold) gs.gold -= opt.req.gold;
            if (opt.req.energy) gs.story.energy -= opt.req.energy;
        }

        // 3. 鎖定 UI
        window.TempState.isProcessing = true;
        if(window.storyView && window.storyView.setButtonsDisabled) {
            window.storyView.setButtonsDisabled(true);
        }

        // 4. 檢定邏輯
        let passed = true;
        if (opt.check) {
            const playerStat = this.getPlayerStat(opt.check.stat);
            const roll = Math.floor(Math.random() * 20) + 1;
            passed = (roll + playerStat >= opt.check.val);
            
            if (window.storyView) window.storyView.appendInlineCheckResult(opt.check.stat, roll + playerStat, passed);
            
            // 延遲以顯示動畫
            setTimeout(() => {
                this.executeRouting(opt, passed);
                // 解鎖在 executeRouting 後處理 (或切換場景時自動解鎖)
            }, 1200);
        } else {
            // 無檢定，直接執行
            this.executeRouting(opt, true);
        }
    },

    // [V48.5 Core] 統一路由與獎勵
    executeRouting: function(opt, passed) {
        // 1. 發放獎勵
        if (passed && opt.rewards) this.distributeRewards(opt.rewards);

        // 2. 解鎖 UI (為了讓下一個畫面能點擊，這裡先解鎖狀態)
        window.TempState.isProcessing = false;

        // 3. 路由分支
        // A. 巢狀節點跳轉
        if (opt.action === 'node_next') {
            const target = passed ? opt.nextScene : opt.failScene;
            if (target) this.playSceneNode(target);
            else this.finishChain();
            return;
        }

        // B. 隨機劇本鏈
        if (opt.action === 'advance_chain') {
            if (!passed && opt.failNextTags) this.advanceChain(opt.failNextTags);
            else this.advanceChain(opt.nextTags);
            return;
        }

        // C. 原地刷新 (密室調查)
        if (opt.action === 'investigate') {
            if (opt.result && window.act) act.toast(opt.result);
            this.playSceneNode(window.TempState.currentSceneNode); // 重新渲染當前節點
            return;
        }

        // D. 結束
        if (opt.action === 'finish_scene' || opt.action === 'finish_chain') {
            this.finishChain();
            return;
        }

        // Default
        this.finishChain();
        if(window.App) App.saveData();
    },

    // [Fix] 修復 distributeRewards 報錯
    distributeRewards: function(rewards) {
        const gs = window.GlobalState;
        if (!gs) return;
        
        // 防呆初始化
        if (!gs.story) gs.story = { energy: 100, tags: [] };
        if (!Array.isArray(gs.story.tags)) gs.story.tags = [];

        if (rewards.gold) gs.gold = (gs.gold || 0) + rewards.gold;
        if (rewards.energy) gs.story.energy = Math.min(100, (gs.story.energy || 0) + rewards.energy);
        if (rewards.stats) Object.keys(rewards.stats).forEach(k => this.addPlayerStat(k, rewards.stats[k]));
        
        if (rewards.tags) {
            rewards.tags.forEach(tag => {
                if (!gs.story.tags.includes(tag)) gs.story.tags.push(tag);
            });
        }
    },
    
    // [New Helper] 通知 View 鎖定按鈕
    disableButtons: function(disabled) {
        if (window.storyView && window.storyView.setButtonsDisabled) {
            window.storyView.setButtonsDisabled(disabled);
        }
    },
    

    finishSceneDiscard: function() {
        const currentId = window.TempState.currentSceneId;
        if (currentId && !String(currentId).startsWith('gen_') && currentId !== 'GEN_MODULAR') {
            window.GlobalState.story.discard.push(currentId);
        }
    },

    renderSceneContent: function(s) {
        window.TempState.storyCard = s;
        window.TempState.currentSceneId = s.id;
        if (s.location) window.TempState.storyLocation = s.location;
        if (window.storyView && window.storyView.render) window.storyView.render();
    },

    showLocationIdle: function() {
        window.TempState.storyCard = null;
        if (window.storyView && window.storyView.render) window.storyView.render();
    },

    checkCondition: function(cond) {
        if (!cond) return true;
        const gs = window.GlobalState;
        const myTags = gs.story.tags || [];
        if (cond.hasTag && !myTags.includes(cond.hasTag)) return false;
        if (cond.noTag && myTags.includes(cond.noTag)) return false;
        if (cond.stat) {
            // [Fix] 使用 getPlayerStat
            const playerVal = this.getPlayerStat(cond.stat.key);
            if (playerVal < cond.stat.val) return false;
        }
        return true;
    },

    isCooldown: function(id) {
        return window.GlobalState.story.cooldowns.some(c => c.id === id);
    },
    addCooldown: function(id, turns) {
        window.GlobalState.story.cooldowns.push({ id: id, turns: turns });
    },
    tickCooldowns: function() {
        const cs = window.GlobalState.story.cooldowns;
        cs.forEach(c => c.turns--);
        window.GlobalState.story.cooldowns = cs.filter(c => c.turns > 0);
    },
    
    checkEnergyLoop: function() {
        const recover = () => {
            const gs = window.GlobalState;
            if (!gs || !gs.story) return;
            const now = Date.now();
            const max = this.calculateMaxEnergy();
            if (!gs.story.lastRecTime) gs.story.lastRecTime = now;
            
            const elapsed = now - gs.story.lastRecTime;
            const interval = 60000; 
            if (elapsed >= interval) {
                const points = Math.floor(elapsed / interval);
                if (points > 0 && (gs.story.energy < max)) {
                    gs.story.energy = Math.min(max, gs.story.energy + points);
                    gs.story.lastRecTime = now - (elapsed % interval);
                    if (window.view && view.updateHUD) view.updateHUD(gs);
                } else {
                    if (gs.story.energy >= max) gs.story.lastRecTime = now;
                }
            }
        };
        recover();
        if (window._energyTimer) clearInterval(window._energyTimer);
        window._energyTimer = setInterval(recover, 10000); 
    },

    setLang: function(val) {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        gs.settings.targetLang = val;
        if(window.App) App.saveData();
    },
    calculateMaxEnergy: function() { return 100; }
};

if (typeof window.act === 'undefined') window.act = {};

console.log("✅ StoryEngine V44.0 (Stable) Loaded.");