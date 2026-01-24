/* js/core.js - 核心框架層 (不包含業務邏輯) */
window.act = window.act || {};
window.TempState = window.TempState || {};

window.Core = {
    // 1. 純粹的頁面切換 (不判斷權限，只管 DOM)
    switchPage: (pageId) => {
        const targetId = pageId.startsWith('page-') ? pageId : `page-${pageId}`;
        const pages = document.querySelectorAll('.page');
        
        pages.forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('active');
            targetEl.style.display = 'flex';
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
            if (window.EventBus) window.EventBus.emit(window.EVENTS.System.TOAST, msg);
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

window.act.navigate = (pageId) => {
    
    // --- [A] 核心頁面切換 ---
    // 先移除所有頁面的 active 狀態 (包含 content-area 和 layer-full 裡的)
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // 啟用目標頁面
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.add('active');
        window.TempState.currentView = pageId;
    }

    // --- [B] 容器狀態同步 (給舊瀏覽器 CSS 相容用) ---
    const layerFull = document.getElementById('layer-full');
    if (layerFull) {
        // 如果目標頁面在 layer-full 裡面，就啟用 layer-full
        if (target && layerFull.contains(target)) {
            layerFull.classList.add('active');
        } else {
            layerFull.classList.remove('active');
        }
    }

    // --- [C] Navbar 控制 (雖然 CSS 層級夠高，但 display:none 可防誤觸) ---
    const navbar = document.getElementById('navbar');
    const fullPages = ['story', 'avatar']; // 定義哪些是全螢幕頁面
    
    if (navbar) {
        if (fullPages.includes(pageId)) {
            navbar.style.display = 'none';
        } else {
            navbar.style.display = 'flex';
            
            // 同步 Navbar 按鈕狀態
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`nav-${pageId}`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }

    // --- [D] 發送訊號 (給各模組做初始化) ---
    if (window.EventBus) {
        window.EventBus.emit(window.EVENTS.System.NAVIGATE, pageId);
    }
};

// 為了相容舊版 HTML 的呼叫，保留最精簡的 act 映射
window.act.closeModal = (id) => Core.ui.modal(id, 'close');
window.act.validateNumber = Core.utils.validateNumber;