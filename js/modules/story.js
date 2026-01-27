/* js/modules/story.js - V36 (RPG Core Upgrade: Checks, Rewards, Conditions) */

window.StoryEngine = {
    
    // ============================================================
    // 1. 初始化與數據加載
    // ============================================================
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;

        // A. 確保資料結構存在
        if (!gs.story) {
            gs.story = { 
                energy: 100, 
                maxEnergy: 100, 
                dailyExploreCount: 0,
                deck: [],       
                discard: [],    
                tags: [],       // 關鍵：用來記錄劇情標籤 (Flags)
                history: [],
                locationName: '冒險者大廳',
                lastRecTime: Date.now()
            };
        }
        
        // 補齊基礎屬性 (如果還沒有的話，給予預設值以便檢定)
        if (!gs.stats) gs.stats = { str: 1, dex: 1, int: 1, cha: 1 };
        
        ['deck', 'discard', 'tags'].forEach(k => { if(!gs.story[k]) gs.story[k] = []; });
        
        this.loadSceneDB();

        if (gs.story.deck.length === 0 && gs.story.discard.length === 0) {
            this.reloadDeck();
        }

        this.checkEnergyLoop();
        console.log("⚙️ StoryEngine V36 (RPG Core) Ready");
    },

    // 載入劇本 (維持不變)
    loadSceneDB: function() {
        window.StoryData = window.StoryData || {};
        window.StoryData.scenes = {}; 
        
        const RANDOM_RATIO = 9; 
        let fixedCardIds = [];
        const nestedDB = window.SCENE_DB || {};
        
        Object.keys(nestedDB).forEach(categoryKey => {
            const categoryScenes = nestedDB[categoryKey];
            Object.keys(categoryScenes).forEach(sceneId => {
                const sceneData = categoryScenes[sceneId];
                sceneData.id = sceneId; 
                sceneData.category = categoryKey;
                window.StoryData.scenes[sceneId] = sceneData;
                fixedCardIds.push(sceneId);
            });
        });

        window.StoryData.pool = [...fixedCardIds];
        if (fixedCardIds.length > 0) {
            const genCount = Math.max(5, fixedCardIds.length * RANDOM_RATIO);
            for(let i=0; i < genCount; i++) window.StoryData.pool.push('GEN_MODULAR');
        }
    },

    // 洗牌 (維持不變)
    reloadDeck: function() {
        const gs = window.GlobalState;
        let pool = [...(window.StoryData.pool || ['GEN_MODULAR', 'GEN_MODULAR'])];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        gs.story.deck = pool;
        gs.story.discard = [];
        if(window.App) App.saveData();
    },

    calculateMaxEnergy: function() {
        const gs = window.GlobalState;
        const lv = gs.lv || 1;
        return Math.min(100, 30 + (lv - 1) * 2);
    },

    // ============================================================
    // 2. 探索核心 (維持不變)
    // ============================================================
    explore: function() {
        const gs = window.GlobalState;
        if (!gs.story) this.init();

        const cost = 5;
        const currentEnergy = gs.story.energy || 0;

        if (currentEnergy < cost) return { success: false, msg: `精力不足 (需要 ${cost} 點)` };

        gs.story.energy -= cost;
        if (gs.story.energy < 0) gs.story.energy = 0;
        gs.story.dailyExploreCount = (gs.story.dailyExploreCount || 0) + 1;

        this.drawAndPlay();

        if(window.App) App.saveData();
        return { success: true };
    },

    drawAndPlay: function() {
        const gs = window.GlobalState;
        if (gs.story.deck.length === 0) {
            if (gs.story.discard.length > 0) {
                gs.story.deck = [...gs.story.discard];
                gs.story.discard = [];
                for (let i = gs.story.deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [gs.story.deck[i], gs.story.deck[j]] = [gs.story.deck[j], gs.story.deck[i]];
                }
                if (window.act && act.toast) act.toast("🔄 重洗棄牌堆...");
            } else {
                this.reloadDeck();
            }
        }
        const cardId = gs.story.deck.shift() || 'GEN_MODULAR';
        window.TempState.currentSceneId = cardId;

        if (cardId === 'GEN_MODULAR') {
            this.generateModularScene();
        } else {
            this.playFixedScene(cardId);
        }
    },

    // ============================================================
    // 3. 場景處理 (🔥 增強：條件過濾)
    // ============================================================
    playFixedScene: function(id) {
        const data = window.StoryData.scenes ? window.StoryData.scenes[id] : null;
        if (!data) { this.generateSimpleScene(); return; }

        // [New] 過濾選項：檢查 visibleIf 條件
        // 如果選項設定了 condition: { hasTag: 'xxx' }，只有玩家有該標籤才會顯示
        const validOptions = (data.options || []).filter(opt => {
            return this.checkCondition(opt.condition);
        });

        const sceneForView = {
            id: id, // 確保 View 有 ID 用於比對
            text: data.text,
            location: data.location || "未知區域",
            options: validOptions.map(opt => ({
                text: opt.text || opt.label,
                label: opt.text || opt.label,
                style: opt.style || 'normal',
                
                // 將邏輯數據傳遞給 View (雖然 View 不處理，但可以擴充顯示)
                req: opt.req,       // 需求 (金幣/精力)
                check: opt.check,   // 檢定 (屬性)
                
                next: opt.next || opt.nextSceneId,
                action: opt.action
            }))
        };
        
        window.TempState.storyCard = sceneForView;
    },

    // [New] 條件檢查 Helper
    checkCondition: function(cond) {
        if (!cond) return true; // 沒條件 = 通過
        const gs = window.GlobalState;
        const myTags = gs.story.tags || [];

        // 1. 檢查標籤 (hasTag)
        if (cond.hasTag && !myTags.includes(cond.hasTag)) return false;
        
        // 2. 檢查反向標籤 (noTag)
        if (cond.noTag && myTags.includes(cond.noTag)) return false;

        // 3. 檢查屬性 (例如: str >= 5)
        if (cond.stat) {
            const playerVal = (gs.stats && gs.stats[cond.stat.key]) || 0;
            if (playerVal < cond.stat.val) return false;
        }

        return true;
    },

    // 生成模組化場景 (V34 高級生成)
    generateModularScene: function() {
        const rules = window.StoryData.learningRules;
        // 如果沒有規則庫，降級使用簡單生成
        if (!rules || !rules.patterns) {
            this.generateSimpleScene();
            return;
        }

        // ... (保留 V34 的語言混合邏輯) ...
        const settings = window.GlobalState.settings || {};
        let lang = settings.targetLang || 'mix';
        if (lang === 'mix') {
            const pool = ['zh', 'en', 'jp']; 
            lang = pool[Math.floor(Math.random() * pool.length)];
        }

        // 簡單模擬文字 (實際應從 rules 組合)
        const text = `(語言: ${lang}) 你正在探索這片未知的領域... [模組化生成系統運作中]`;
        
        const dynamicOptions = [
            { label: "繼續前進", style: "correct", action: "explore" },
            { label: "觀察四周", style: "normal", action: "explore" },
            { label: "返回", style: "danger", action: "back" }
        ];

        window.TempState.storyCard = {
            text: text,
            location: "隨機生成的迷宮",
            options: dynamicOptions
        };
    },

generateSimpleScene: function() {
        // 這是兜底用的簡單場景
        const scenes = [
            {
                text: "你在森林深處發現了一個發光的祭壇。",
                location: "迷霧森林",
                options: [
                    { label: "獻上金幣 (10G)", req: { gold: 10 }, rewards: { tags: ['blessed'] }, style: "correct", next: "scene_blessing" }, 
                    { label: "仔細觀察", check: { stat: 'int', val: 5 }, style: "normal", action: "explore" },
                    { label: "無視離開", style: "ghost", action: "back" }
                ]
            }
        ];
        const randomScene = scenes[Math.floor(Math.random() * scenes.length)];
        // 給予一個虛擬 ID 避免 View 比對出錯
        randomScene.id = 'gen_' + Date.now(); 
        window.TempState.storyCard = randomScene;
    },

    // ============================================================
    // 4. 選項執行 (🔥 核心增強：檢定、獎勵、標籤)
    // ============================================================
    makeChoice: function(optionIndex) {
        const card = window.TempState.storyCard;
        // 注意：這裡是去拿 TempState 裡的，但最好是對照原始 DB 資料以策安全
        // 為了簡單，我們直接用 TempState，但要小心 options 索引對應問題
        if (!card || !card.options || !card.options[optionIndex]) return;
        
        // 這裡需要一個技巧：因為 playFixedScene 過濾了選項，
        // 所以 View 傳回來的 index 是「過濾後」的 index。
        // 我們直接用 card.options[optionIndex] 是正確的，因為 TempState 存的就是過濾後的。
        const opt = card.options[optionIndex];
        const gs = window.GlobalState;

        // 1. [Check] 處理需求 (Requirement)
        if (opt.req) {
            if (opt.req.gold && (gs.gold || 0) < opt.req.gold) {
                if(window.act && act.toast) act.toast(`❌ 金幣不足！需要 ${opt.req.gold}G`);
                return; // 阻止執行
            }
            if (opt.req.energy && (gs.story.energy || 0) < opt.req.energy) {
                if(window.act && act.toast) act.toast(`❌ 精力不足！需要 ${opt.req.energy}⚡`);
                return;
            }
            
            // 扣除資源
            if (opt.req.gold) gs.gold -= opt.req.gold;
            if (opt.req.energy) gs.story.energy -= opt.req.energy;
        }

        // 2. [Check] 處理屬性檢定 (Roll Logic)
        let checkPassed = true;
        if (opt.check) {
            const statKey = opt.check.stat || 'str'; // 預設力量
            const targetVal = opt.check.val || 10;
            const playerStat = (gs.stats && gs.stats[statKey]) ? gs.stats[statKey] : 0;
            
            // D20 系統：1~20隨機數 + 屬性值
            const roll = Math.floor(Math.random() * 20) + 1;
            const total = roll + playerStat;
            
            checkPassed = (total >= targetVal);

            if(window.act && act.toast) {
                const resultText = checkPassed ? "成功" : "失敗";
                const color = checkPassed ? "#4caf50" : "#f44336";
                act.toast(`🎲 ${statKey.toUpperCase()} 檢定: ${roll}+${playerStat}=${total} (目標${targetVal}) <span style="color:${color}; font-weight:bold;">[${resultText}]</span>`);
            }
            
            // 如果檢定失敗，且選項有定義 failNext (失敗跳轉)，則改變路徑
            if (!checkPassed && opt.failNext) {
                this.finishScene();
                this.playFixedScene(opt.failNext);
                return; // 中斷，不再發放獎勵
            }
        }

        // 3. [Rewards] 發放獎勵 (只有檢定通過，或沒檢定時才發)
        if (checkPassed && opt.rewards) {
            this.distributeRewards(opt.rewards);
        }

        // 4. [System] 執行跳轉
        this.finishScene(); // 將當前卡片移入棄牌堆

        if (opt.next) {
            this.playFixedScene(opt.next);
        } else if (opt.action === 'back' || opt.action === 'main') {
            if(window.act.navigate) window.act.navigate('main');
        } else {
            // 預設行為：繼續探索
            this.drawAndPlay();
        }
        
        if(window.App) App.saveData();
    },

    // [New] 獎勵發放 Helper
    distributeRewards: function(rewards) {
        const gs = window.GlobalState;
        
        // A. 金幣/精力
        if (rewards.gold) {
            gs.gold = (gs.gold || 0) + rewards.gold;
            act.toast(`💰 獲得 ${rewards.gold} 金幣`);
        }
        if (rewards.energy) {
            gs.story.energy = Math.min(this.calculateMaxEnergy(), (gs.story.energy || 0) + rewards.energy);
            act.toast(`⚡ 恢復 ${rewards.energy} 精力`);
        }

        // B. 標籤 (Tags)
        if (rewards.tags) {
            rewards.tags.forEach(tag => {
                if (!gs.story.tags.includes(tag)) {
                    gs.story.tags.push(tag);
                    act.toast(`🏷️ 獲得標籤: [${tag}]`);
                }
            });
        }
        if (rewards.removeTags) {
            rewards.removeTags.forEach(tag => {
                const idx = gs.story.tags.indexOf(tag);
                if (idx > -1) gs.story.tags.splice(idx, 1);
            });
        }

        // C. 道具 (Items) - 串接 ShopEngine 或直接操作
        if (rewards.items) {
            rewards.items.forEach(item => {
                // 嘗試使用 ShopEngine 加入背包 (如果有的話)
                if (window.ShopEngine && ShopEngine.addItemToBag) {
                    ShopEngine.addItemToBag(item.id, item.count || 1);
                    act.toast(`🎒 獲得道具: ${item.id} x${item.count||1}`);
                } else {
                    // Fallback: 如果沒有 ShopEngine，簡單存入
                    if (!gs.bag) gs.bag = [];
                    gs.bag.push({ id: item.id, count: item.count || 1 });
                }
            });
        }
    },

    finishScene: function() {
        const gs = window.GlobalState;
        const currentId = window.TempState.currentSceneId;
        if (currentId && currentId !== 'GEN_MODULAR' && !String(currentId).startsWith('gen_')) {
            gs.story.discard.push(currentId);
        }
    },

    setLang: function(val) {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        gs.settings.targetLang = val;
        if(window.App) App.saveData();
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
                if (points > 0 && gs.story.energy < max) {
                    gs.story.energy = Math.min(max, gs.story.energy + points);
                    gs.story.lastRecTime = now - (elapsed % interval);
                    
                    if (window.EventBus) window.EventBus.emit(window.EVENTS.Story.UPDATED);
                    if (window.App) App.saveData();
                } else {
                    gs.story.lastRecTime = now;
                }
            }
        };
        recover();
        setInterval(recover, 10000); 
    }
};