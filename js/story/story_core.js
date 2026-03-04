/* js/modules/story_core.js - V79.0 (獨立模組)
 * 職責：系統初始化、資料庫載入、文字解析、對話鏈、精力循環
 * 依賴：story_map.js, story_generator.js
 * 被依賴：story_flow.js, story_state.js, story_controller.js
 * 載入順序：story_map → story_core → story_state → story_flow → story_generator → story_controller
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};

// 定義主物件（其他模組用 Object.assign 往這裡掛）
window.SQ.Engine.Story = {

    // ============================================================
    // ⚙️ [SECTION 0] CONFIG & CONSTANTS
    // ============================================================
    CONSTANTS: {
        TRANSITION_DELAY: 1500,
        CLICK_DELAY: 200,
        ENERGY_COST: 5,
        BASE_ENERGY_MAX: 30,
        ENERGY_REGEN_MS: 60000
    },

    // ============================================================
    // 🚀 [SECTION 1] SYSTEM & INITIALIZATION
    // ============================================================
    init: function() {
        const gs = window.SQ.State;
        if (!gs) return;

        if (!gs.story) gs.story = { energy: this.calculateMaxEnergy(), deck: [], learning: {}, tags: [], vars: {} };

        if (!gs.story.lastEnergyUpdate) gs.story.lastEnergyUpdate = Date.now();
        if (!gs.story.tags)    gs.story.tags = [];
        if (!gs.story.learning) gs.story.learning = {};
        if (!gs.story.vars)    gs.story.vars = {};
        if (!gs.story.flags)   gs.story.flags = {};

        window.SQ.Temp.isProcessing  = false;
        window.SQ.Temp.lockInput     = false;
        window.SQ.Temp.isWaitingInput = false;
        window.SQ.Temp.lastHubNode   = null;

        this.loadDatabase();
        this.checkEnergyLoop();
        console.log("⚙️ StoryEngine V79.0 (Modular) Ready");
    },

    loadDatabase: function() {
        window.StoryData = window.StoryData || {};
        const gs = window.SQ.State;
        const sceneDB = window.SCENE_DB || {};
        const mode = (gs.settings && gs.settings.gameMode) ? gs.settings.gameMode : 'adventurer';

        if (!window.StoryData.sceneMap) window.StoryData.sceneMap = {};

        if (window._SCENE_POOL) {
            Object.assign(window.StoryData.sceneMap, window._SCENE_POOL);
        }

        if (sceneDB[mode]) {
            sceneDB[mode].forEach(scene => {
                if (scene.id) window.StoryData.sceneMap[scene.id] = scene;
            });
        }

        let roots = (sceneDB[mode] || []).filter(s => s.entry);
        window.StoryData.pool = [...roots];

        const RANDOM_CARD_COUNT = 5;
        for (let i = 0; i < RANDOM_CARD_COUNT; i++) window.StoryData.pool.push('GEN_MODULAR');

        if (!gs.story.deck || gs.story.deck.length === 0) {
            gs.story.deck = this._shuffle([...window.StoryData.pool]);
        }

        console.log(`📚 Database Loaded: Mode [${mode}], Map Size: ${Object.keys(window.StoryData.sceneMap).length}`);
    },

    // ============================================================
    // 📝 [SECTION 4] TEXT & DIALOGUE
    // ============================================================
    _processText: function(rawText) {
        let textArr = Array.isArray(rawText) ? rawText : [rawText || "(...)"];

        if (window.SQ.Engine.Map && window.SQ.Engine.Map.currentRoom) {
            const gs = window.SQ.State;
            if (gs.story && gs.story.chain && gs.story.chain.memory) {
                gs.story.chain.memory['combo_location'] = window.SQ.Engine.Map.currentRoom.name;
                gs.story.chain.memory['env_room']       = window.SQ.Engine.Map.currentRoom.name;
            }
        }

        return textArr.map(t => {
            let resolvedText = this._resolveDynamicText(t);

            if (window.StoryGenerator && window.FragmentDB) {
                const gs = window.SQ.State;
                const memory = (gs && gs.story && gs.story.chain && gs.story.chain.memory)
                    ? gs.story.chain.memory : {};
                resolvedText = window.SQ.Engine.Generator._expandGrammar(resolvedText, window.FragmentDB, memory);
            }

            if (typeof resolvedText === 'string') {
                resolvedText = resolvedText
                    .replace(/的\s*的/g, '的')
                    .replace(/的(?=[，。！、？]|$)/g, '')
                    .replace(/^(的|與|和)/, '')
                    .replace(/，\s*，/g, '，')
                    .replace(/。\s*。/g, '。');
            }

            return this._formatText(resolvedText);
        });
    },

    _resolveDynamicText: function(text) {
        if (!text || typeof text !== 'string') return text;
        const gs = window.SQ.State;
        const memory = (gs.story.chain && gs.story.chain.memory) ? gs.story.chain.memory : {};
        const vars   = gs.story.vars  || {};
        const flags  = gs.story.flags || {};
		
		text = text.replace(/{#tags}/g, () => {
        // 取得玩家當前的標籤陣列
        const tags = (window.SQ.State && window.SQ.State.story && window.SQ.State.story.tags) ? window.SQ.State.story.tags : [];
        // 如果有標籤就用頓號串接顯示，沒有就顯示「無」
        return tags.length > 0 ? tags.join('、') : '無';
		});
        return text.replace(/{(\w+)}/g, (match, key) => {
            if (memory[key] !== undefined) return memory[key];
            if (vars[key]   !== undefined) return vars[key];
            if (flags[key]  !== undefined) return flags[key];
            if (typeof gs[key] !== 'undefined' && typeof gs[key] !== 'object') return gs[key];
            return match;
        });
    },

    _formatText: function(text) {
        if (/^[\(（].*[\)）]$/.test(text)) {
            return `<div class="story-narrative" style="color: var(--text-ghost);">${text}</div>`;
        }
        if (text.includes("<b>你</b>：") || text.startsWith("你：")) {
            return `<div class="story-dialogue" style="color: var(--color-gold);">${text}</div>`;
        }
        if (text.includes("：") && text.includes("「")) {
            return `<div class="story-dialogue" style="color: var(--color-info-soft);">${text}</div>`;
        }
        return `<div class="story-action">${text}</div>`;
    },

    playDialogueChain: function(node) {
        const dialogues = node.dialogue;
        if (!dialogues || !Array.isArray(dialogues)) return;

        const lang = (window.SQ.State.settings && window.SQ.State.settings.targetLang)
            ? window.SQ.State.settings.targetLang : 'zh';

        let textQueue = dialogues.map(d => {
            if (!d) return "";
            if (typeof d === 'string') return this._formatText(d);
            if (!d.text) return this._formatText(`<b>${d.speaker || '未知'}</b>：(對話資料遺失)`);

            const txt     = d.text[lang] || d.text['zh'] || (typeof d.text === 'string' ? d.text : '');
            const speaker = d.speaker;
            const rawText = (speaker === '旁白' || !speaker) ? `${txt}` : `<b>${speaker}</b>：「${txt}」`;
            return this._formatText(rawText);
        });

        this.playSceneNode({ ...node, text: textQueue, dialogue: null });
    },

    // ============================================================
    // ⚡ ENERGY LOOP
    // ============================================================
    checkEnergyLoop: function() {
        const updateEnergy = () => {
            const gs = window.SQ.State;
            if (!gs || !gs.story) return;

            const now      = Date.now();
            const timeDiff = now - (gs.story.lastEnergyUpdate || now);
            const REGEN_MS = this.CONSTANTS.ENERGY_REGEN_MS;

            if (timeDiff >= REGEN_MS) {
                const recoverAmount = Math.floor(timeDiff / REGEN_MS);
                const max = this.calculateMaxEnergy();

                if (gs.story.energy < max) {
                    gs.story.energy = Math.min(max, gs.story.energy + recoverAmount);
                    if (window.SQ.View.Story && window.SQ.View.Story.updateTopBar) window.SQ.View.Story.updateTopBar();
                }

                gs.story.lastEnergyUpdate = now - (timeDiff % REGEN_MS);
                if (window.App) App.saveData();
            }
        };

        updateEnergy();

        if (window.SQ.Temp.energyLoopId) clearInterval(window.SQ.Temp.energyLoopId);
        window.SQ.Temp.energyLoopId = setInterval(updateEnergy, 10000);
    },

    setLang: function(lang) {
        const gs = window.SQ.State;
        if (!gs.settings) gs.settings = {};
        gs.settings.targetLang = lang;
        if (window.App) App.saveData();
    },
};

window.StoryEngine = window.SQ.Engine.Story; // 向下相容別名
