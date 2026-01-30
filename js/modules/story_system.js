/* js/modules/story_system.js - Phase 3: Simulation & Mode Logic */

window.StorySystem = {
    
    // ============================
    // 1. 模式管理 (Mode Manager)
    // ============================
    // 切換遊戲模式，並初始化對應的屬性
    setGameMode: function(mode) {
        const gs = window.GlobalState;
        if (!gs.settings) gs.settings = {};
        
        gs.settings.gameMode = mode;
        console.log(`🎮 遊戲模式已切換: ${mode}`);

        // 初始化該模式專屬的數值 (如果不存的話)
        if (!gs.simStats) gs.simStats = {};

        if (mode === 'star_maker') {
            // [明星志願模式] 初始數值
            gs.simStats = { charm: 10, vocal: 10, dance: 10, stress: 0, day: 1 };
        } else if (mode === 'adventurer') {
            // [冒險者模式] 初始數值 (回歸 RPG 屬性)
            // 這裡可以不重置，保留 RPG 的 stats
        }
        
        if (window.App) App.saveData();
    },

    // ============================
    // 2. 養成行動 (Simulation Action)
    // ============================
    // 執行一個養成指令 (例如：練習跳舞)
    // actionId: 定義在 FragmentDB.simActions 裡的 ID
    executeSimAction: function(actionId) {
        const db = window.FragmentDB;
        const action = db.simActions ? db.simActions[actionId] : null;
        
        if (!action) {
            console.error("找不到養成行動:", actionId);
            return;
        }

        const gs = window.GlobalState;
        
        // 1. 消耗檢查 (精力/金錢)
        if (action.cost) {
            if (action.cost.energy && gs.story.energy < action.cost.energy) {
                act.toast("精力不足，無法行動！");
                return;
            }
            // 扣除
            if (action.cost.energy) gs.story.energy -= action.cost.energy;
        }

        // 2. 數值變化 (Stats Change)
        if (action.effects) {
            let msg = [];
            for (let key in action.effects) {
                const val = action.effects[key];
                if (!gs.simStats[key]) gs.simStats[key] = 0;
                gs.simStats[key] += val;
                
                const icon = val > 0 ? '🔺' : '🔻';
                msg.push(`${key} ${icon}${Math.abs(val)}`);
            }
            act.toast(`行動結果: ${msg.join(', ')}`);
        }

        // 3. 結局/狀態判定 (Check Conditions)
        this.checkSimStatus();

        // 4. 生成一段劇情描述 (Flavor Text)
        // 這裡我們呼叫 StoryGenerator，但傳入特殊的 context
        // 這樣生成器就會去撈 "與跳舞有關" 的模板
        gs.story.contextTags = action.tags || []; // 例如 ['dance_practice']
        
        // 強制進入 Story 介面顯示結果
        if (window.StoryEngine) StoryEngine.drawAndPlay(); 
    },

    // 狀態檢查 (是否變胖？是否遇到王子？是否結局？)
    checkSimStatus: function() {
        const stats = window.GlobalState.simStats;
        if (!stats) return;

        // 範例：壓力過大
        if (stats.stress > 100) {
            act.toast("⚠️ 壓力過大！強制生病！");
            // 這裡可以插入強制生病的劇情卡
            // window.TempState.storyCard = ...
        }

        // 範例：變胖 (假設有 weight 屬性)
        if (stats.weight > 60) {
            // 獲得 'fat' 標籤，這會影響之後生成的劇情
            if (!window.GlobalState.story.tags.includes('fat')) {
                window.GlobalState.story.tags.push('fat');
                act.toast("你感覺裙子變緊了...");
            }
        }
    }
};