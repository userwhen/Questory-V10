/* js/modules/story_generator.js - V56.0 (Fix History & Dynamic Tags) */

window.StoryGenerator = {
    _sysDict: { investigate: { zh: "調查" }, explore_deeper: { zh: "繼續深入" }, finish: { zh: "完成" }, next: { zh: "繼續" } },
    _t: function(k, l) { return (this._sysDict[k] && this._sysDict[k][l]) || this._sysDict[k]?.zh || k; },

    generate: function(contextTags = [], isStart = false) {
        const gs = window.GlobalState;
        
        // [Fix] 確保 history 陣列存在，防止 push 報錯
        if (!gs.story.chain) gs.story.chain = { depth: 0, maxDepth: 3, accumulatedTags: [], memory: {}, history: [] };
        if (!gs.story.chain.history) gs.story.chain.history = []; 

        const chain = gs.story.chain;
        let depth = chain.depth;
        let maxDepth = chain.maxDepth;
        let targetType = 'event';

        if (isStart) {
            targetType = 'setup';
        } else if (contextTags.includes('combat_defeat')) {
            targetType = 'ending';
        } else if (depth >= maxDepth) {
            // 動態展延: 30% 機率延長
            if (Math.random() < 0.3 && depth < 8) {
                console.log("🎲 觸發動態展延！");
                targetType = 'event';
                chain.maxDepth++; 
            } else {
                targetType = 'ending';
            }
        }

        const template = this.pickTemplate(targetType, contextTags, chain.history);
        const lang = gs.settings?.targetLang || 'zh';

        if (!template) return {
            id: `fallback_${Date.now()}`, text: "迷霧...", options: [{ label: "離開", action: "finish_chain" }]
        };

        if (template.id) {
            chain.history.push(template.id);
            if (chain.history.length > 3) chain.history.shift();
        }

        // 填充內容 (含動態 Tag 處理)
        const filledData = this.fillTemplate(template, lang);
        let finalText = filledData.text;

        let quizWord = null;
        if (finalText.includes('{learning_word}')) {
            quizWord = window.StoryEngine.pickSpiralWord();
            finalText = finalText.replace(/{learning_word}/g, quizWord ? quizWord.word : "???");
        }

        // 處理長對話
        if (template.dialogue && template.dialogue.length > 0) {
            return this.generateDialogueChain(template, filledData, lang);
        } else {
            // [Fix] 確保 dynamicOptions 使用處理過的 rewards (含動態 Tag)
            const opts = this.generateOptions(template, filledData.fragments, lang, targetType, quizWord);
            
            return {
                id: `gen_${Date.now()}`, 
                text: finalText, 
                location: filledData.locationStr || "Adventure",
                options: opts, 
                structure: template.structure, 
                rewards: filledData.rewards // 使用替換後的 rewards
            };
        }
    },

    pickTemplate: function(type, contextTags, history = []) {
        const db = window.FragmentDB;
        if (!db || !db.templates) return null;
        const gs = window.GlobalState;
        const myTags = gs.story.tags || [];
        
        let candidates = db.templates.filter(t => t.type === type);
        
        candidates = candidates.filter(t => {
            if (t.reqTag && !myTags.includes(t.reqTag)) return false;
            if (t.noTag && myTags.includes(t.noTag)) return false;
            return true;
        });

        // 歷史過濾
        const available = candidates.filter(t => !t.id || !history.includes(t.id));
        const finalPool = available.length > 0 ? available : candidates;

        if (finalPool.length > 0) return finalPool[Math.floor(Math.random() * finalPool.length)];
        return null;
    },

    generateDialogueChain: function(template, filledData, lang) {
        const dialogues = template.dialogue;
        const buildNode = (index) => {
            if (index >= dialogues.length) {
                // 對話結束，顯示選項與獎勵
                return {
                    text: filledData.text,
                    options: this.generateOptions(template, filledData.fragments, lang, template.type, null),
                    rewards: filledData.rewards // 確保結尾獲得正確獎勵
                };
            }
            const d = dialogues[index];
            const dText = (d.text[lang] || d.text['zh']).replace(/{(\w+)}/g, (_, k) => filledData.fragments[k]?.val[lang] || filledData.fragments[k]?.val['zh'] || k);
            return {
                text: `【${d.speaker}】\n${dText}`,
                options: [{ label: "繼續", action: "node_next", nextScene: buildNode(index + 1) }]
            };
        };
        return buildNode(0);
    },

    fillTemplate: function(tmpl, lang) {
        const db = window.FragmentDB;
        const gs = window.GlobalState;
        const memory = gs.story.chain.memory || {}; 
        let finalStr = tmpl.text[lang] || tmpl.text['zh'];
        let chosenFragments = {};

        // 1. 填詞
        (tmpl.slots || []).forEach(key => {
            if (memory[key]) {
                 const word = memory[key];
                 finalStr = finalStr.replace(`{${key}}`, word);
            } else {
                const list = db.fragments[key];
                if (list && list.length > 0) {
                    const item = list[Math.floor(Math.random() * list.length)];
                    const word = item.val[lang] || item.val['zh'];
                    finalStr = finalStr.replace(`{${key}}`, word);
                    chosenFragments[key] = item;
                    memory[key] = word; // 記住這一次隨機到的詞
                } else { finalStr = finalStr.replace(`{${key}}`, `(${key}?)`); }
            }
        });
        gs.story.chain.memory = memory;

        // 2. [New] 動態 Tag 替換 (將 {item} 換成 'Old Coin')
        let newRewards = null;
        if (tmpl.rewards) {
            newRewards = JSON.parse(JSON.stringify(tmpl.rewards)); // 深拷貝
            if (newRewards.tags) {
                newRewards.tags = newRewards.tags.map(tag => {
                    // 檢查是否包含 {key}
                    return tag.replace(/{(\w+)}/g, (_, k) => {
                        // 如果 memory 中有這個 key (例如 item="Old Coin")
                        return memory[k] || k;
                    });
                });
            }
        }

        return { text: finalStr, fragments: chosenFragments, rewards: newRewards || tmpl.rewards };
    },

    generateOptions: function(tmpl, fragments, lang, type, quizWord) {
        let opts = [];
        if (quizWord && tmpl.mode === 'learning_event') {
            opts.push({ label: `意思是：${quizWord.meaning}`, action: "answer_quiz", isCorrect: true, wordId: quizWord.id, style: "primary" });
            const wrongWords = window.StoryEngine.pickWrongOptions(quizWord.id, 2);
            wrongWords.forEach(w => opts.push({ label: `意思是：${w.meaning}`, action: "answer_quiz", isCorrect: false, wordId: quizWord.id, style: "normal" }));
            return opts.sort(() => Math.random() - 0.5);
        }
        
        // 處理一般選項的動態 Tag
        if (tmpl.options) {
             return tmpl.options.map(o => {
                 let newRew = o.rewards ? JSON.parse(JSON.stringify(o.rewards)) : undefined;
                 if (newRew && newRew.tags) {
                     newRew.tags = newRew.tags.map(t => t.replace(/{(\w+)}/g, (_, k) => fragments[k]?.val[lang] || fragments[k]?.val['zh'] || k));
                 }
                 return { ...o, label: o.label, action: o.action || 'advance_chain', rewards: newRew };
             });
        }
        
        if (type === 'ending') opts.push({ label: this._t('finish', lang), style: "primary", action: "finish_chain" });
        else opts.push({ label: this._t('explore_deeper', lang), style: "normal", action: "advance_chain" });
        return opts;
    }
};