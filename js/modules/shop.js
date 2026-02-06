/* js/modules/shop.js - V35.8 (Daily Reset & Inventory Logic) */

window.ShopEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        
        if (!gs.shop) gs.shop = { user: [] };
        if (!gs.bag) gs.bag = [];
        if (!gs.sysShop) gs.sysShop = {}; // 紀錄系統商品狀態 (如庫存)

        // 定義系統商品原型 (Base Data)
        this.systemPrototypes = [
            { id: 'sys_apple', name: '蘋果', price: 10, currency: 'gold', maxQty: 99, category: '熱量', icon: '🍎', desc: '回復少量熱量', type: 'daily' },
            { id: 'sys_potion', name: '精力藥水', price: 50, currency: 'gem', maxQty: 10, category: '其他', icon: '🧪', desc: '回復精力 (需鑽石)', type: 'daily' },
            { id: 'sys_sword', name: '鐵劍', price: 500, currency: 'gold', maxQty: 1, category: '金錢', icon: '🗡️', desc: '新手冒險者的好夥伴', type: 'once' },
            { id: 'sys_clock', name: '懷錶', price: 200, currency: 'gold', maxQty: 5, category: '時間', icon: '⏱️', desc: '掌控時間的道具', type: 'daily' }
        ];

        // 檢查跨日重置
        this.checkDailyReset();
        
        console.log("🏪 ShopEngine Initialized");
    },
	
	// 恢復精力邏輯 (防止溢出)
    recoverStamina: function(amount, cost) {
        const gs = window.GlobalState;
        const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);

        // 1. 檢查鑽石
        if (totalGem < cost) {
            return { success: false, msg: '💎 鑽石不足！' };
        }

        // 2. 扣除鑽石
        if (gs.freeGem >= cost) {
            gs.freeGem -= cost;
        } else {
            const remain = cost - gs.freeGem;
            gs.freeGem = 0;
            gs.paidGem -= remain;
        }

        // 3. 計算當前玩家的 "真實上限"
        // 呼叫 StoryEngine 的公式 (Lv1=30 ... Lv36=100)
        const currentMax = (window.StoryEngine && StoryEngine.calculateMaxEnergy) 
                           ? StoryEngine.calculateMaxEnergy() 
                           : 30; // 預設防呆
        
        if (!gs.story) gs.story = { energy: 0 };
        
        // 4. 恢復精力 (防止超出)
        let newEnergy = gs.story.energy + amount;
        
        // 如果超過 "當前等級上限"，就切齊上限
        if (newEnergy > currentMax) {
            newEnergy = currentMax;
        }

        gs.story.energy = newEnergy;

        if(window.App) App.saveData();
        return { success: true, current: newEnergy };
    },

    // [核心] 跨日重置邏輯
    checkDailyReset: function() {
        const gs = window.GlobalState;
        
        // [新增] 安全檢查：如果 Core 還沒讀完檔 (tasks 不存在)，絕對不准執行重置邏輯
        if (!gs || !gs.tasks) {
            console.warn("🛡️ [Shop] GlobalState 未就緒，跳過每日重置檢查");
            return;
        }
        const today = new Date().toDateString(); // 例如 "Mon Jan 26 2026"
        
        if (gs.lastLoginDate !== today) {
            console.log("🌅 New Day Detected! Resetting Shop...");
            
            // 1. 重置/清理系統商品
            // 這裡我們直接清空 sysShop 紀錄，讓 getShopItems 重新生成預設值
            // 但對於 'once' 商品，如果已經買過(庫存變0)，應該要標記永久移除
            
            // 簡化邏輯：
            // daily -> 自動補滿 (因為我們只紀錄扣除量，或者直接重置狀態)
            // once -> 如果 sold out，則移除
            
            // 實作：遍歷目前的 sysShop 狀態
            for (let id in gs.sysShop) {
                const itemState = gs.sysShop[id];
                const proto = this.systemPrototypes.find(p => p.id === id);
                
                if (proto && proto.type === 'daily') {
                    // 常駐商品：重置庫存 (刪除紀錄等於恢復預設滿庫存)
                    delete gs.sysShop[id];
                } else if (proto && proto.type === 'once') {
                    // 單次商品：如果已售完 (qty 0)，保留狀態 (或根據需求移除)
                    // 你的需求：單次商品庫存清空後，跨日清除
                    if (itemState.qty <= 0) {
                        itemState.removed = true; // 標記為永久移除
                    }
                }
            }
            
            gs.lastLoginDate = today;
            App.saveData();
        }
    },

    getShopItems: function(cat) {
        if (!this.systemPrototypes) this.init();
        const gs = window.GlobalState;
        
        // 1. 處理系統商品
        const sysItems = this.systemPrototypes.map(proto => {
            // 讀取存檔中的狀態 (庫存)
            const state = gs.sysShop[proto.id] || {};
            
            // 如果被標記為永久移除，則不回傳
            if (state.removed) return null;

            return {
                ...proto,
                // 如果存檔有紀錄 qty 就用存檔的，否則用預設 maxQty
                qty: (state.qty !== undefined) ? state.qty : proto.maxQty
            };
        }).filter(i => i !== null); // 過濾掉 null

        // 2. 合併用戶商品
        const all = [...sysItems, ...gs.shop.user];
        
        if (!cat || cat === '全部') return all;
        return all.filter(i => i.category === cat);
    },

    getStackedBag: function(cat) {
        const gs = window.GlobalState;
        let items = gs.bag || [];
        if (cat && cat !== '全部') items = items.filter(i => i.category === cat);
        return items;
    },

    buyItem: function(id, qty) {
        const gs = window.GlobalState;
        const items = this.getShopItems('全部');
        const item = items.find(i => i.id === id); // 這裡是 reference 還是 copy?
        
        if (!item) return { success: false, msg: '商品不存在' };
        if (item.qty < qty) return { success: false, msg: '庫存不足' };

        const totalCost = item.price * qty;
        const currency = item.currency || 'gold'; 

        // 1. 扣款
        if (currency === 'gold') {
            if (gs.gold < totalCost) return { success: false, msg: '金幣不足' };
            gs.gold -= totalCost;
        } else {
            const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
            if (totalGem < totalCost) return { success: false, msg: '鑽石不足' };
            if (gs.freeGem >= totalCost) { gs.freeGem -= totalCost; } 
            else { const remain = totalCost - gs.freeGem; gs.freeGem = 0; gs.paidGem -= remain; }
        }

        // 2. 扣庫存 (關鍵修正：寫入 GlobalState)
        if (id.startsWith('sys_')) {
            // 系統商品：更新 sysShop
            if (!gs.sysShop[id]) gs.sysShop[id] = { qty: item.qty }; // 初始化狀態
            gs.sysShop[id].qty -= qty;
        } else {
            // 用戶商品：直接扣
            const userItem = gs.shop.user.find(u => u.id === id);
            if (userItem) userItem.qty -= qty;
        }

        // 3. 進背包
        const existing = gs.bag.find(b => b.id === id);
        if (existing) {
            existing.count += qty;
        } else {
            gs.bag.push({ ...item, count: qty });
        }

        App.saveData();
        return { success: true };
    },

    uploadItem: function(data) {
        const gs = window.GlobalState;
        if (data.id) {
            const idx = gs.shop.user.findIndex(i => i.id === data.id);
            if (idx >= 0) gs.shop.user[idx] = { ...gs.shop.user[idx], ...data };
        } else {
            gs.shop.user.push({ ...data, id: 'usr_' + Date.now(), currency: 'gold', icon: '📦' });
        }
        App.saveData(); return true;
    },
    deleteItem: function(id) { const gs = window.GlobalState; gs.shop.user = gs.shop.user.filter(i => i.id !== id); App.saveData(); },
    useItem: function(id) { this.discardItem(id, 1); return { success: true }; },
    discardItem: function(id, qty) {
        const gs = window.GlobalState; const idx = gs.bag.findIndex(i => i.id === id);
        if (idx >= 0) { gs.bag[idx].count -= qty; if (gs.bag[idx].count <= 0) gs.bag.splice(idx, 1); App.saveData(); }
    },
    addGem: function(amount) { const gs = window.GlobalState; gs.paidGem = (gs.paidGem || 0) + amount; App.saveData(); }
};