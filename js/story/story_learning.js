/* js/modules/story_learning.js - V2.3 (多語言按鈕 MIX 支援版)
 * 職責：螺旋式語言學習 + 語言切換引擎 + 答案延遲顯示 + 多語言按鈕
 * 依賴：story_core.js, story_state.js, story_flow.js
 *
 * V2.3 修正：
 * - 新增 resolveLabel：支援選項 label 傳入 { zh, jp, kr } 物件
 * - 在 MIX 模式下，每個按鈕會獨立隨機抽取一種語言，增加解謎難度
 */

window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Story = window.SQ.Engine.Story || {};

Object.assign(window.SQ.Engine.Story, {

    // ──────────────────────────────────────────────
    // 🌐 語言解析核心
    // ──────────────────────────────────────────────

    resolveText: function(textObj) {
        if (!textObj) return '';
        if (typeof textObj === 'string') return textObj;

        const gs   = window.SQ.State || window.GlobalState;
        const lang = (gs && gs.settings && gs.settings.targetLang) || 'zh';

        // 🌟 升級版 MIX：整個文本隨機抽取一種語言顯示，不再逐句穿插
        if (lang === 'mix') {
            const availableLangs = ['zh', 'jp', 'kr'].filter(l => textObj[l]);
            if (availableLangs.length === 0) return textObj.zh || '';
            const randomLang = availableLangs[Math.floor(Math.random() * availableLangs.length)];
            return textObj[randomLang];
        } else if (lang === 'jp') {
            return textObj.jp || textObj.zh || '';
        } else if (lang === 'kr') {
            return textObj.kr || textObj.zh || '';
        } else {
            return textObj.zh || '';
        }
    },

    // 🌟 [新增] 專門處理選項 Label 的語言分配器
    resolveLabel: function(labelObj) {
        if (!labelObj) return '';
        if (typeof labelObj === 'string') return labelObj;

        const gs   = window.SQ.State || window.GlobalState;
        const lang = (gs && gs.settings && gs.settings.targetLang) || 'zh';

        if (lang === 'mix') {
            // MIX 模式：從該選項擁有的語言中，隨機抽一個顯示
            const availableLangs = ['zh', 'jp', 'kr'].filter(l => labelObj[l]);
            if (availableLangs.length === 0) return labelObj.zh || '';
            const randomLang = availableLangs[Math.floor(Math.random() * availableLangs.length)];
            return labelObj[randomLang];
        } else if (lang === 'jp') {
            return labelObj.jp || labelObj.zh || '';
        } else if (lang === 'kr') {
            return labelObj.kr || labelObj.zh || '';
        } else {
            return labelObj.zh || '';
        }
    },
	
    resolveDialogueText: function(textObj) {
        const resolved = this.resolveText(textObj);
        if (this._processText && typeof this._processText === 'function') {
            return this._processText(resolved);
        }
        return [resolved];
    },


    // ──────────────────────────────────────────────
    // 📖 答案延遲顯示（Next Reveal）
    // ──────────────────────────────────────────────

    hasNextReveal: function(opt) {
        if (!opt || !opt.next) return false;
        return !!this.resolveText(opt.next);
    },

    showNextReveal: function(nextObj, onContinue) {
        if (!nextObj) { if (onContinue) onContinue(); return; }

        const text = this.resolveText(nextObj);
        if (!text) { if (onContinue) onContinue(); return; }

        if (window.SQ.View && window.SQ.View.Story) {
            const view = window.SQ.View.Story;

            if (view.clearScreen) view.clearScreen();

            const headerHtml = `<div style="font-size:0.75rem; letter-spacing:0.12em; color:var(--text-ghost); margin-bottom:8px;">📖 解析</div>`;

            if (view.appendChunk) {
                view.appendChunk(headerHtml + text, true);
            }

            const continueOption = [{
                label: "繼續 →",
                action: "_next_reveal_continue",
                style: "primary"
            }];

            setTimeout(() => {
                if (view.showOptions) {
                    view.showOptions(continueOption);
                }

                const originalOptions = window.SQ.Temp.storyOptions;
                window.SQ.Temp.storyOptions = [{
                    label: "繼續 →",
                    action: "_next_reveal_continue",
                    _revealCallback: onContinue
                }];

                const originalSelect = window.SQ.Engine.Story._revealIntercepting;
                window.SQ.Engine.Story._revealIntercepting = true;
                window.SQ.Temp._revealCallback = onContinue;

            }, 800);
            return;
        }

        if (onContinue) onContinue();
    },
    // ──────────────────────────────────────────────
    // 📚 螺旋式單字學習
    // ──────────────────────────────────────────────
    pickSpiralWord: function() {
        if (!window.LearningDB || !window.LearningDB.words) return null;
        const gs       = window.SQ.State;
        const words    = window.LearningDB.words;
        const learning = gs.story.learning || {};

        let unfamiliar = words.filter(w => {
            const rec = learning[w.id];
            if (!rec) return true;
            return rec.wrong > rec.correct;
        });

        const pool = unfamiliar.length > 0 ? unfamiliar : words;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    pickWrongOptions: function(correctId, count) {
        if (!window.LearningDB || !window.LearningDB.words) return [];
        const words = window.LearningDB.words.filter(w => w.id !== correctId);
        return this._shuffle(words).slice(0, count);
    },

    handleQuizResult: function(wordId, isCorrect) {
        const gs = window.SQ.State;
        if (!gs.story.learning) gs.story.learning = {};
        if (!gs.story.learning[wordId]) gs.story.learning[wordId] = { correct: 0, wrong: 0 };

        if (isCorrect) {
            gs.story.learning[wordId].correct++;
            if (window.SQ.Actions) window.SQ.Actions.toast("✅ 回答正確！記憶加深。");
            this._distributeRewards({ exp: 10, gold: 5 });
        } else {
            gs.story.learning[wordId].wrong++;
            if (window.SQ.Actions) window.SQ.Actions.toast("❌ 答錯了... 請再接再厲。");
        }
    },

    _shuffle: function(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
});