/* js/modules/story.js - V34.Final (Logic Engine) */
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
                energy: 30, 
                maxEnergy: 30, 
                dailyExploreCount: 0,
                deck: [],     
                discard: [],  
                tags: [],     
                history: [],
                locationName: '冒險者大廳',
                lastRecTime: Date.now() // [Fix] 補回時間戳
            };
        }
        
        // 補齊缺失欄位
        ['deck', 'discard', 'tags'].forEach(k => { if(!gs.story[k]) gs.story[k] = []; });
        
        // B. 載入外部劇本
        this.loadSceneDB();

        // C. 牌庫檢查
        if (gs.story.deck.length === 0 && gs.story.discard.length === 0) {
            this.reloadDeck();
        }

        // D. 啟動精力機制 (含離線計算)
        this.checkEnergyLoop();

        console.log("⚙️ StoryEngine (Final) 就緒");
    },

    // [Adapter] 資料載入
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
        const genCount = Math.max(5, fixedCardIds.length * RANDOM_RATIO);
        for(let i=0; i < genCount; i++) window.StoryData.pool.push('GEN_MODULAR');
        
        console.log(`📚 劇本載入: 固定 ${fixedCardIds.length} / 隨機 ${genCount}`);
    },

    // [Deck] 洗牌
    reloadDeck: function() {
        const gs = window.GlobalState;
        let pool = [...(window.StoryData.pool || ['GEN_MODULAR', 'GEN_MODULAR', 'GEN_MODULAR'])];

        // Fisher-Yates 洗牌
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        gs.story.deck = pool;
        gs.story.discard = [];
        if(window.App) App.saveData();
    },

    // ============================================================
    // 2. 核心循環：探索
    // ============================================================
    explore: function() {
        const gs = window.GlobalState;
        if (gs.story.energy < 5) {
            EventBus.emit(window.EVENTS.System.TOAST, "精力不足 (需要 5) 💤");
            return;
        }
        
        gs.story.energy -= 5;
        gs.story.dailyExploreCount = (gs.story.dailyExploreCount || 0) + 1;
        EventBus.emit(window.EVENTS.Story.UPDATED);

        // 模擬讀取延遲
        setTimeout(() => {
            this.drawAndPlay();
        }, 300);
    },

    drawAndPlay: function() {
        const gs = window.GlobalState;

        // 牌庫枯竭處理
        if (gs.story.deck.length === 0) {
            if (gs.story.discard.length > 0) {
                gs.story.deck = [...gs.story.discard];
                gs.story.discard = [];
                // 洗牌
                for (let i = gs.story.deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [gs.story.deck[i], gs.story.deck[j]] = [gs.story.deck[j], gs.story.deck[i]];
                }
                EventBus.emit(window.EVENTS.System.TOAST, "重洗棄牌堆...");
            } else {
                this.reloadDeck();
            }
        }

        const cardId = gs.story.deck.shift();
        window.TempState.currentSceneId = cardId;

        if (cardId === 'GEN_MODULAR') {
            this.generateModularScene();
        } else {
            this.playFixedScene(cardId);
        }
        
        if(window.App) App.saveData();
    },

    // ============================================================
    // 3. 場景處理 (Fixed & Modular)
    // ============================================================
    playFixedScene: function(id) {
        const data = window.StoryData.scenes[id];
        if (!data) {
            this.generateModularScene(); 
            return;
        }

        const sceneForView = {
            text: data.text,
            // [Remove BG] 這裡不傳遞 bg 屬性
            options: (data.options || []).map(opt => ({
                text: opt.text || opt.label,
                style: opt.style || 'primary',
                req: opt.req,
                check: opt.check
            }))
        };
        EventBus.emit(window.EVENTS.Story.SCENE_PLAYED, sceneForView);
    },

    // 隨機生成模組 (V29 邏輯)
    generateModularScene: function() {
        const rules = window.StoryData.learningRules;
        if (!rules || !rules.patterns) {
            this.playFixedScene('fallback_scene'); 
            return;
        }

        // 語言設定
        const settings = window.GlobalState.settings || {};
        let lang = settings.targetLang || 'mix';
        if (lang === 'mix') {
            const pool = ['zh', 'en', 'jp']; 
            lang = pool[Math.floor(Math.random() * pool.length)];
        }
        window.TempState.narrativeLang = lang;

        // 組合模板
        const setups = rules.patterns.setups;
        const conflicts = rules.patterns.conflicts;
        const sPat = setups[Math.floor(Math.random() * setups.length)];
        const cPat = conflicts[Math.floor(Math.random() * conflicts.length)];

        let text = this.getLocaleText(sPat.templates, lang) + "\n\n" + this.getLocaleText(cPat.templates, lang);
        text = this.parseTags(text, lang);

        // 生成選項
        const dynamicOptions = this.generateContextOptions(lang);

        EventBus.emit(window.EVENTS.Story.SCENE_PLAYED, {
            text: text,
            options: dynamicOptions
        });
    },

    generateContextOptions: function(lang) {
        const rules = window.StoryData.learningRules?.optionRules || [];
        let options = [];
        const genericOpts = rules.filter(r => r.reqTag === 'generic');
        
        genericOpts.forEach(r => {
             r.options.forEach(o => {
                 options.push({
                     text: this.getLocaleText(o.label, lang),
                     style: 'normal',
                     action: 'explore'
                 });
             });
        });
        return options.sort(()=>Math.random()-0.5).slice(0, 3);
    },

    // ============================================================
    // 4. 選項執行與工具
    // ============================================================
    makeChoice: function(optionIndex) {
        const card = window.TempState.storyCard;
        if (!card || !card.options || !card.options[optionIndex]) return;
        const opt = card.options[optionIndex];

        // 消耗
        if (opt.req) {
            if (opt.req.gold) window.GlobalState.gold -= opt.req.gold;
            if (opt.req.energy) window.GlobalState.story.energy -= opt.req.energy;
            EventBus.emit(window.EVENTS.Story.UPDATED);
        }

        // 檢定
        if (opt.check) {
            this.runCheck(opt);
            return;
        }

        // 跳轉與結束
        const nextId = opt.next || opt.nextSceneId;
        if (nextId) {
            this.playFixedScene(nextId);
        } else if (opt.action === 'explore') {
            this.finishScene();
            this.explore();
        } else if (opt.action === 'back' || opt.action === 'main') {
            this.finishScene();
            if(window.act.navigate) window.act.navigate('main');
        } else {
            this.finishScene();
        }
    },

    runCheck: function(opt) {
        const check = opt.check;
        const key = (check.stat || 'str').toUpperCase();
        const val = (window.GlobalState.attrs?.[key]?.v) || 1;
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + Math.floor(val / 2);
        const isSuccess = total >= (check.val || 10);

        EventBus.emit(window.EVENTS.System.TOAST, `🎲 檢定: ${total} (目標 ${check.val}) -> ${isSuccess?'成功':'失敗'}`);

        setTimeout(() => {
            const nextId = isSuccess ? (opt.pass || opt.next) : opt.fail;
            if (nextId) this.playFixedScene(nextId);
            else this.finishScene();
        }, 1000);
    },

    finishScene: function() {
        const gs = window.GlobalState;
        const currentId = window.TempState.currentSceneId;
        if (currentId) gs.story.discard.push(currentId);
        
        if(window.storyView) window.storyView.renderIdle();
        if(window.App) App.saveData();
    },

    // ============================================================
    // 5. 系統與工具
    // ============================================================
    // [Fix] 恢復語言切換
    setLang: function(val) {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        gs.settings.targetLang = val;
        if(window.App) App.saveData();
        console.log(`語言切換為: ${val}`);
    },

    // [Fix] 恢復離線精力計算
    checkEnergyLoop: function() {
        const recover = () => {
            const gs = window.GlobalState;
            const now = Date.now();
            const max = this.calculateMaxEnergy();
            
            if (!gs.story.lastRecTime) gs.story.lastRecTime = now;
            
            // 計算經過時間 (毫秒)
            const elapsed = now - gs.story.lastRecTime;
            const interval = 60000; // 1分鐘回1點
            
            if (elapsed >= interval) {
                const recoveredPoints = Math.floor(elapsed / interval);
                if (recoveredPoints > 0 && gs.story.energy < max) {
                    gs.story.energy = Math.min(max, gs.story.energy + recoveredPoints);
                    // 更新最後恢復時間，保留餘數以免時間虧損
                    gs.story.lastRecTime = now - (elapsed % interval);
                    
                    EventBus.emit(window.EVENTS.Story.UPDATED);
                    if(window.App) App.saveData();
                } else {
                    // 如果滿了或沒回，只更新時間
                    gs.story.lastRecTime = now;
                }
            }
        };
        recover(); // 立即執行一次
        setInterval(recover, 10000); // 之後每10秒檢查一次
    },

    calculateMaxEnergy: () => 30 + (Math.max(1, window.GlobalState.lv||1)-1)*2,

    parseTags: function(text, lang) {
        if (!text) return "";
        return text.replace(/\{(\w+)\}/g, (match, tag) => {
            const banks = window.StoryData.learningRules?.wordBanks;
            if (banks && banks[tag]) {
                const wordObj = banks[tag][Math.floor(Math.random() * banks[tag].length)];
                return this.getLocaleText(wordObj.text, lang);
            }
            return tag;
        });
    },

    getLocaleText: function(content, lang) {
        if (typeof content === 'string') return content;
        return content[lang] || content['zh'] || Object.values(content)[0];
    }
};