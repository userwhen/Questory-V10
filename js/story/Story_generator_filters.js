/* js/modules/story_generator_filters.js - V84.0 (獨立模組)
 * 職責：模板挑選流水線（pickTemplate）、過濾器群、選項生成（generateOptions）
 * 依賴：story_generator_core.js (主物件必須已存在)
 * 載入順序：story_generator_skeletons → story_generator_core → story_generator_filters
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Generator = window.SQ.Engine.Generator || {};

Object.assign(window.SQ.Engine.Generator, {

    // ============================================================
    // 7. 模板挑選（pickTemplate）— 過濾流水線
    // ============================================================
    pickTemplate: function(type, currentTags, history, currentStats = {}, chain) {
        const db = window.FragmentDB;

        const isDangerState = currentTags.includes('risk_high') ||
            (currentStats.tension !== undefined && currentStats.tension >= 80);
        const isCritical = type.includes('setup') || type.includes('climax') ||
            type.includes('end') || type.includes('start');

        let candidates = db.templates.filter(t => t.type === type);

        candidates = this._filterByTheme(candidates, chain);
        candidates = this._filterByTags(candidates, currentTags, isDangerState);
        candidates = this._filterByStats(candidates, currentStats);
        candidates = this._applyDangerOverride(candidates, db, isDangerState, isCritical);

        let finalPool = this._filterByHistory(candidates, history, isCritical);

        if (finalPool.length === 0) {
            return this._getFallbackTemplate(db, type, isCritical, history, candidates);
        }

        return finalPool[Math.floor(Math.random() * finalPool.length)];
    },

    // ============================================================
    // 過濾器群 (Filters)
    // ============================================================
    _filterByTheme: function(candidates, chain) {
        const coreThemes = ['mystery', 'horror', 'adventure', 'romance', 'raising'];

        return candidates.filter(t => {
            if (t.type === 'univ_filler') return true;
            if (!chain || !chain.theme) return true;

            if (t.reqTags && Array.isArray(t.reqTags)) {
                const cardThemes = t.reqTags.filter(tag => coreThemes.includes(tag));
                if (cardThemes.length > 0) return cardThemes.includes(chain.theme);
            }

            if (t.theme) {
                if (Array.isArray(t.theme)) return t.theme.includes(chain.theme);
                return t.theme === chain.theme;
            }

            return true; // 中立卡片放行
        });
    },

    _filterByTags: function(candidates, currentTags, isDangerState) {
        return candidates.filter(t => {
            if (t.excludeTags && Array.isArray(t.excludeTags)) {
                if (t.excludeTags.some(tag => currentTags.includes(tag))) return false;
            }
            if (t.reqTags && Array.isArray(t.reqTags)) {
                let tempTags = isDangerState ? [...currentTags, 'risk_high'] : currentTags;
                if (!t.reqTags.some(tag => tempTags.includes(tag))) return false;
            }
            return true;
        });
    },

    _filterByStats: function(candidates, currentStats) {
        return candidates.filter(t => {
            if (t.conditions) {
                for (let [key, val] of Object.entries(t.conditions)) {
                    let userVal = currentStats[key] || 0;
                    if (typeof val === 'string') {
                        let num = parseFloat(val.substring(1));
                        if (val.startsWith('>') && userVal <= num) return false;
                        if (val.startsWith('<') && userVal >= num) return false;
                    } else {
                        if (userVal < val) return false;
                    }
                }
            }
            return true;
        });
    },

    _applyDangerOverride: function(candidates, db, isDangerState, isCritical) {
        if (isDangerState && !isCritical) {
            let dangerOnly = candidates.filter(t => t.reqTags && t.reqTags.includes('risk_high'));
            if (dangerOnly.length === 0) {
                dangerOnly = db.templates.filter(t =>
                    t.type === 'univ_filler' && t.reqTags && t.reqTags.includes('risk_high'));
            }
            if (dangerOnly.length > 0) {
                console.log("🚨 玩家狀態不穩，強制鎖定 [高危牌庫]！");
                return dangerOnly;
            }
        } else if (!isCritical) {
            return candidates.filter(t => !(t.reqTags && t.reqTags.includes('risk_high')));
        }
        return candidates;
    },

    _filterByHistory: function(candidates, history, isCritical) {
        let filtered = candidates.filter(t => !t.id || !history.includes(t.id));
        return filtered.length > 0 ? filtered : (isCritical ? candidates : []);
    },

    _getFallbackTemplate: function(db, type, isCritical, history, originalCandidates) {
        console.warn(`⚠️ [${type}] 無可用劇本，啟動備案...`);
        if (isCritical && originalCandidates.length > 0) return originalCandidates[0];

        let safeFillers = db.templates.filter(t =>
            t.type === 'univ_filler' &&
            !history.includes(t.id) &&
            !(t.reqTags && t.reqTags.includes('risk_high'))
        );
        if (safeFillers.length > 0) return safeFillers[Math.floor(Math.random() * safeFillers.length)];

        return db.templates.find(t => t.type === 'univ_filler');
    },

    // ============================================================
    // 8. 選項生成（generateOptions）
    // ============================================================
    generateOptions: function(tmpl, fragments, lang, type, currentTags = [], currentStats = {}) {
        let opts = [];

        if (tmpl.options && tmpl.options.length > 0) {
            let validOpts = tmpl.options.filter(o => {
                if (!o.condition) return true;

                // Tag 條件
                if (o.condition.tags) {
                    for (let tag of o.condition.tags) {
                        if (!currentTags.includes(tag)) return false;
                    }
                }

                // Stats 條件
                if (o.condition.stats) {
                    for (let [key, val] of Object.entries(o.condition.stats)) {
                        let userVal = currentStats[key] || 0;
                        if (typeof val === 'string') {
                            let num = parseFloat(val.substring(1));
                            if (val.startsWith('>') && userVal <= num) return false;
                            if (val.startsWith('<') && userVal >= num) return false;
                        } else {
                            if (userVal < val) return false;
                        }
                    }
                }

                return true;
            });

            opts = validOpts.map(o => {
                let newRew = o.rewards ? JSON.parse(JSON.stringify(o.rewards)) : undefined;
                let defaultAction = (o.nextScene || o.nextSceneId) ? 'node_next' : 'advance_chain';
                return { ...o, action: o.action || defaultAction, rewards: newRew };
            });
        }

        // 自動選項（Boss/Ending）
        if (opts.length === 0) {
            if (type.includes('climax') || type.includes('adventure_climax')) {
                opts.push({ label: "決一死戰！", style: "danger", action: "finish_chain" });
            } else if (type.includes('ending')) {
                opts.push({ label: "結束冒險", action: "finish_chain" });
            } else {
                opts.push({ label: "繼續...", action: "advance_chain" });
            }
        }

        return opts;
    },
});