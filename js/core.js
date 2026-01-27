/* js/core.js - 核心框架層 (Fixed Navigation Logic) */
window.act = window.act || {};
window.TempState = window.TempState || {};

window.Core = {
    // 1. 純粹的頁面切換 (強制隱藏舊頁面)
    switchPage: (pageId) => {
        const targetId = pageId.startsWith('page-') ? pageId : `page-${pageId}`;
        
        // [修正] 使用更廣泛的選擇器，並強制設定 display: none
        // 這能解決 Controller 設定了 style="display:block" 導致 CSS class 失效的問題
        const allPages = document.querySelectorAll('.page, div[id^="page-"]');
        
        allPages.forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none'; // <--- 關鍵！強制覆蓋行內樣式
        });

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('active');
            targetEl.style.display = 'block'; // 改為 block 確保顯示，若需 flex 可由 CSS .active 控制
        }
    },

    // 2. 核心 UI 元件
    ui: {
        modal: (id, action = 'open') => {
            const m = document.getElementById(id.startsWith('m-') ? id : 'm-' + id);
            if (!m) return;
            if (action === 'open') {
                m.style.display = 'flex';
                setTimeout(() => m.classList.add('active'), 10);
            } else {
                m.classList.remove('active');
                setTimeout(() => m.style.display = 'none', 300);
            }
        },
        toast: (msg) => {
            if (window.EventBus && window.EVENTS) window.EventBus.emit(window.EVENTS.System.TOAST, msg);
            else console.log("[Toast]", msg);
        }
    },

    // 3. 通用工具
    utils: {
        generateId: (prefix = 'id') => prefix + '_' + Date.now() + Math.random().toString(36).substr(2, 9),
        validateNumber: (el, max) => {
            let v = parseInt(el.value);
            if (isNaN(v)) v = ''; else if (max && v > max) v = max;
            el.value = v;
        }
    }
};

// --- [重寫] act.navigate 導航邏輯 ---
window.act.navigate = (pageId) => {
    console.log(`[Nav] Switching to: ${pageId}`);

    // --- [A] 核心頁面切換 (同步執行，不等待 EventBus) ---
    // 1. 強制隱藏所有頁面 (解決殘留 style="display:block" 問題)
    const allPages = document.querySelectorAll('.page, div[id^="page-"]');
    allPages.forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none'; // 強制隱藏
    });
    
    // 2. 顯示目標頁面
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.add('active');
        // 判斷是否需要 flex (通常全屏頁面如 avatar/story 用 flex，其他用 block)
        // 保險起見先用 block，具體佈局交給 CSS .page.active
        target.style.display = (['story', 'avatar'].includes(pageId)) ? 'flex' : 'block';
        
        window.TempState.currentView = pageId;
    } else {
        console.error(`❌ 找不到目標頁面: page-${pageId}`);
    }

    // --- [B] 容器狀態同步 (Layer Full) ---
    const layerFull = document.getElementById('layer-full');
    if (layerFull) {
        if (target && layerFull.contains(target)) {
            layerFull.classList.add('active');
        } else {
            layerFull.classList.remove('active');
        }
    }

    // --- [C] Navbar 控制 ---
    const navbar = document.getElementById('navbar');
    const fullPages = ['story', 'avatar']; 
    
    if (navbar) {
        if (fullPages.includes(pageId)) {
            navbar.style.display = 'none';
        } else {
            navbar.style.display = 'flex';
            
            // 同步 Navbar 按鈕狀態
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            // 嘗試匹配 nav-task, nav-shop 等 ID
            const activeBtn = document.getElementById(`nav-${pageId}`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }

    // --- [D] 關閉干擾視窗 ---
    // 切換頁面時，強制關閉可能開啟的 Modal 或 Overlay
    if (window.ui && window.ui.modal && window.ui.modal.close) {
        window.ui.modal.close('m-overlay'); 
    }

    // --- [E] 發送訊號 (通知 Controller 刷新數據) ---
    if (window.EventBus && window.EVENTS) {
        window.EventBus.emit(window.EVENTS.System.NAVIGATE, pageId);
    }
};

// 兼容性映射
window.act.closeModal = (id) => Core.ui.modal(id, 'close');
window.act.validateNumber = Core.utils.validateNumber;