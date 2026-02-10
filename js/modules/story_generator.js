/* js/modules/story_generator.js - V79.1 (Fix Dialogue & Options Display) */

window.StoryGenerator = {
    // ============================================================
    // 1. 系統設定與字典
    // ============================================================
    _sysDict: { 
        investigate: { zh: "調查" }, 
        explore_deeper: { zh: "繼續深入" }, 
        finish: { zh: "完成" }, 
        next: { zh: "繼續" },
        tension_high: { zh: "感覺氣氛越來越凝重..." },
        tension_climax: { zh: "決戰時刻到了！" }
    },
    _t: function(k, l) { return (this._sysDict[k] && this._sysDict[k][l]) || this._sysDict[k]?.zh || k; },

    // ============================================================
    // 2. 劇本骨架定義 (Skeletons)
    // ============================================================
    skeletons: {
        'mystery': {
            stages: ['setup_crime', 'investigate', 'interrogate', 'deduction_moment', 'confrontation'],
            actors: ['detective', 'victim', 'suspect_A', 'suspect_B', 'killer'], 
            baseTension: 10
        },
        'horror': {
            stages: ['setup_omen', 'explore_eerie', 'encounter_monster', 'escape_chase', 'final_survival'],
            actors: ['survivor', 'monster', 'haunted_place'],
            baseTension: 20
        },
        'random': {
            stages: ['setup', 'event', 'event', 'event', 'boss'],
            actors: ['enemy'],
            baseTension: 0
        },
		'romance': {
        // 戀愛劇本的五個階段：相遇 -> 了解 -> 約會 -> 危機 -> 告白
        stages: ['love_meet', 'love_chat', 'love_date', 'love_crisis', 'love_confession'],
        // 角色：戀人 (lover)、情敵 (rival)
        actors: ['lover', 'rival'], 
        // 戀愛劇本通常從 0 張力開始，甚至可以是負的（輕鬆氣氛）
        baseTension: 0 
		},
		'raising': {
        // 階段：出身 -> 童年 -> 青春期 -> 慶典/競賽 -> 職業結局
        stages: ['r_birth', 'r_childhood', 'r_adolescence', 'r_event', 'r_ending'],
        actors: ['daughter', 'butler', 'rival'], 
        baseTension: 0 
		},
    },

    // ============================================================
    // 3. 啟動新冒險 (Start Chain)
    // ============================================================
    initChain: function(mode = 'random') {
        // 1. 取得基礎骨架
        const skel = this.skeletons[mode] || this.skeletons['random'];
        
        // 2. [New] 動態調整骨架長度 (彈性機制)
        let dynamicStages = [...skel.stages]; // 複製一份
        
        // 隨機增減中間環節 (不影響開頭與結尾)
        // 只有當骨架長度 > 3 時才進行變異，避免太短
        if (dynamicStages.length > 3) {
            const variant = Math.random();
            
            if (mode === 'random') {
                // 純隨機模式：大幅波動 (3 ~ 7 層)
                const len = 3 + Math.floor(Math.random() * 5); 
                dynamicStages = ['setup'];
                for(let i=0; i<len; i++) dynamicStages.push('event');
                dynamicStages.push('boss');
            } 
            else {
                // 敘事模式 (Mystery/Horror)：微調節奏
                // 30% 機率插入一個額外事件 (延長)
                if (variant > 0.7) {
                    // 在 Setup 後面插入一個通用填充事件
                    const fillType = mode === 'mystery' ? 'investigate' : 'explore_eerie';
                    dynamicStages.splice(1, 0, fillType); 
                    console.log(`📏 劇本延長: 插入 ${fillType}`);
                }
                // 20% 機率移除一個中間事件 (加速)
                else if (variant < 0.2 && dynamicStages.length > 4) {
                    dynamicStages.splice(2, 1);
                    console.log(`⏩ 劇本加速: 移除階段`);
                }
            }
        }

        // 3. 初始化記憶
        const memory = {};
        if (skel.actors && window.FragmentDB) {
            skel.actors.forEach(role => {
                const pool = window.FragmentDB.fragments[role] || window.FragmentDB.fragments['npc_name'] || [{val:{zh:"神秘人"}}];
                const pick = pool[Math.floor(Math.random() * pool.length)];
                memory[role] = pick.val.zh || pick.val; 
            });
        }

        return {
            depth: 0,
            maxDepth: dynamicStages.length, // 更新為動態長度
            skeletonKey: mode,
            stages: dynamicStages,          // 使用動態骨架
            tension: skel.baseTension,    
            memory: memory,               
            history: [],
            accumulatedTags: []
        };
    },

    // ============================================================
    // 4. 生成下一層 (Generate)
    // ============================================================
    generate: function(contextTags = [], isStart = false) {
    const gs = window.GlobalState;
    
    // 初始化檢查
    if (!gs.story.chain || !gs.story.chain.stages || isStart) {
        console.log("🔄 L3 Generator: 初始化...");
        const modes = ['mystery', 'horror', 'random']; 
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        gs.story.chain = this.initChain(randomMode); 
    }

    const chain = gs.story.chain;
    let depth = chain.depth;
    
    // 張力計算
    let tensionDelta = 10; 
    if (contextTags.includes('risk_high')) tensionDelta += 20;
    if (contextTags.includes('safe_spot')) tensionDelta -= 10;
    if (contextTags.includes('clue_found')) tensionDelta += 15; 
    
    chain.tension = Math.min(100, Math.max(0, (chain.tension || 0) + tensionDelta));
    console.log(`🎬 Director: Depth ${depth}, Tension ${chain.tension}%`);

    // 決定目標類型
    let targetType = 'event'; 

    if (chain.tension >= 100 && depth > 2) {
        if (chain.stages && chain.stages.length > 0) {
            targetType = chain.stages[chain.stages.length - 1];
        } else {
            targetType = 'ending'; 
        }
        console.log(`🔥 Tension Overload! Director forcing jump to: ${targetType}`);
    } 
    else if (depth < chain.stages.length) {
        targetType = chain.stages[depth];
    } 
    else {
        targetType = 'ending';
    }

    // 挑選模板
    const template = this.pickTemplate(targetType, contextTags, chain.history, chain.tension);
    const lang = gs.settings?.targetLang || 'zh';

    if (!template) {
        return {
            id: `fallback_${Date.now()}`, 
            text: `(導演找不到劇本: ${targetType}) \n你繼續在迷霧中前行...`, 
            options: [{ label: "離開", action: "finish_chain" }]
        };
    }

    // [記錄邏輯]
    if (template.id) {
        // A. 記錄到單局歷史 (避免本局重複)
        chain.history.push(template.id);
        if (chain.history.length > 4) chain.history.shift();

        // B. [Critical New] 如果是開頭，記錄到全域歷史 (跨局防重複)
        if (targetType === 'setup' || isStart) {
            if (!gs.story.recentOpenings) gs.story.recentOpenings = [];
            
            // 只有當 ID 不在清單中才加入 (雖然 pickTemplate 已經過濾了，但雙重保險)
            if (!gs.story.recentOpenings.includes(template.id)) {
                gs.story.recentOpenings.push(template.id);
            }
            
            // [設定] 至少 2 次不重複 -> 我們保留最近的 2 個 ID
            // 您可以把 2 改成 3 或 5 來增加不重複的週期
            if (gs.story.recentOpenings.length > 2) {
                gs.story.recentOpenings.shift(); // 移除最舊的，讓它重新變為可用
            }
            console.log("📚 全域開頭歷史更新:", gs.story.recentOpenings);
        }
    }

    // 填充內容
    const filledData = this.fillTemplate(template, lang, chain.memory);
    let finalText = filledData.text;

    // 選項生成
    const opts = this.generateOptions(template, filledData.fragments, lang, targetType, chain.tension);
    
    return {
        id: `gen_${Date.now()}`,
        // 傳遞原始模板類型給 Engine (用於診斷)
        type: targetType, 
        text: finalText,
        dialogue: filledData.dialogue, 
        location: filledData.locationStr || "Mystery Scene",
        options: opts, 
        rewards: filledData.rewards
    };
},

    // ============================================================
    // 5. 輔助函數
    // ============================================================
    pickTemplate: function(type, contextTags, history = [], currentTension) {
    const db = window.FragmentDB;
    if (!db || !db.templates) return null;
    const gs = window.GlobalState;
    const myTags = gs.story.tags || [];
    
    // 1. 篩選類型
    let candidates = db.templates.filter(t => t.type === type);
    
    // 2. 篩選標籤條件
    candidates = candidates.filter(t => {
        if (t.reqTag && !myTags.includes(t.reqTag)) return false;
        if (t.noTag && myTags.includes(t.noTag)) return false;
        // [新增] 骨架專屬過濾 (如果未來有加入 reqChain 屬性)
        if (t.reqChain && gs.story.chain && gs.story.chain.skeletonKey !== t.reqChain) return false;
        return true;
    });

    // 3. 篩選張力區間
    candidates = candidates.filter(t => {
        if (t.minTension && currentTension < t.minTension) return false;
        if (t.maxTension && currentTension > t.maxTension) return false;
        return true;
    });

    // 4. [Critical New] 全域開頭過濾 (Global Opening Filter)
    // 如果是 'setup' 類型，檢查全域歷史紀錄
    if (type === 'setup' && gs.story.recentOpenings && gs.story.recentOpenings.length > 0) {
        // 過濾掉最近用過的開頭
        const filtered = candidates.filter(t => !gs.story.recentOpenings.includes(t.id));
        // 防呆：如果過濾完沒東西了(例如模板太少)，就還是用原本的候選池，避免卡死
        if (filtered.length > 0) {
            candidates = filtered;
        }
    }

    // 5. 單局歷史過濾 (Local History Filter)
    // 避免同一場冒險重複出現同樣的事件
    const available = candidates.filter(t => !t.id || !history.includes(t.id));
    const finalPool = available.length > 0 ? available : candidates;

    if (finalPool.length > 0) return finalPool[Math.floor(Math.random() * finalPool.length)];
    return null;
},
    // [Fix] 升級版填詞：同時處理 Text 和 Dialogue
    fillTemplate: function(tmpl, lang, memory) {
        const db = window.FragmentDB;
        
        // A. 準備 Main Text
        let rawContent = tmpl.text[lang] || tmpl.text['zh'];
        let textArr = Array.isArray(rawContent) ? [...rawContent] : [rawContent];
        
        // B. 準備 Dialogue (如果有)
        // 先解析語言，轉成物件結構，稍後再填詞
        let dialogueArr = null;
        if (tmpl.dialogue) {
            dialogueArr = tmpl.dialogue.map(d => ({
                speaker: d.speaker, // 暫時保留 {slot}
                text: d.text[lang] || d.text['zh']
            }));
        }

        let chosenFragments = {};

        // C. 遍歷 Slots 進行統一填詞
        (tmpl.slots || []).forEach(key => {
            let word = "";
            
            // 優先從記憶讀取 (確保角色一致性)
            if (memory && memory[key]) {
     word = memory[key];
     chosenFragments[key] = { val: { zh: word } }; 
} 
// 否則隨機抽取
else {
    const list = db.fragments[key];
    if (list && list.length > 0) {
        const item = list[Math.floor(Math.random() * list.length)];
        word = item.val[lang] || item.val['zh'];
        chosenFragments[key] = item;
        
        // [修正] 新增這行：將隨機抽到的詞寫入記憶，確保後續一致
        if (memory) memory[key] = word; 
        
    } else { 
        word = `(${key}?)`; 
    }
}

            // D. 執行替換 (Regex Global)
            const regex = new RegExp(`{${key}}`, 'g');
            
            // 1. 替換 Main Text
            textArr = textArr.map(line => line.replace(regex, word));
            
            // 2. 替換 Dialogue (Speaker 和 Text 都要換)
            if (dialogueArr) {
                dialogueArr.forEach(d => {
                    if (d.speaker) d.speaker = d.speaker.replace(regex, word);
                    if (d.text) d.text = d.text.replace(regex, word);
                });
            }
        });

        // 處理動態獎勵標籤
        let newRewards = null;
        if (tmpl.rewards) {
            newRewards = JSON.parse(JSON.stringify(tmpl.rewards));
            if (newRewards.tags) {
                newRewards.tags = newRewards.tags.map(tag => {
                    return tag.replace(/{(\w+)}/g, (_, k) => memory[k] || k); // 這裡只支援從 memory 讀取
                });
            }
        }

        return { 
            text: textArr, 
            dialogue: dialogueArr, // 回傳處理好的對話
            fragments: chosenFragments, 
            rewards: newRewards || tmpl.rewards 
        };
    },

    generateOptions: function(tmpl, fragments, lang, type, tension) {
        let opts = [];

        // [Fix] 只有當 options 陣列有內容時才使用
        if (tmpl.options && tmpl.options.length > 0) {
             return tmpl.options.map(o => {
                 let newRew = o.rewards ? JSON.parse(JSON.stringify(o.rewards)) : undefined;
                 if (newRew && newRew.tags) {
                     newRew.tags = newRew.tags.map(t => t.replace(/{(\w+)}/g, (_, k) => fragments[k]?.val?.zh || k));
                 }
                 
                 // [Smart Fix] 自動判斷 action
                 let defaultAction = (o.nextScene || o.nextSceneId) ? 'node_next' : 'advance_chain';
                 
                 return { 
                     ...o, 
                     action: o.action || defaultAction, 
                     rewards: newRew,
                 };
             });
        }
        
        // 自動生成按鈕 (Fallback)
        if (type === 'climax' || type === 'confrontation' || type === 'final_survival') {
            opts.push({ label: "決一死戰！", style: "danger", action: "finish_chain" }); 
        } else if (type === 'ending') {
            opts.push({ label: this._t('finish', lang), style: "primary", action: "finish_chain" });
        } else {
            opts.push({ 
                label: this._t('explore_deeper', lang), 
                action: "advance_chain",
                nextTags: ['risk_high'] 
            });
            opts.push({ 
                label: "小心前進", 
                action: "advance_chain",
                nextTags: ['safe_spot'] 
            });
        }
        return opts;
    }
};