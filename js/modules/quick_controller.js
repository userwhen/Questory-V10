/* js/modules/quick_controller.js - V50.0 DOM Read Sync */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Quick = {
	_initialized: false,
    init: function() {
        Object.assign(window.SQ.Actions, {
            openquickModal: () => {
                const savedDraft = localStorage.getItem('SQ_QUICK_DRAFT') || '';
                if (window.SQ.View.Main && typeof window.SQ.View.Main.renderquickNoteModal === 'function') {
                    window.SQ.View.Main.renderquickNoteModal(savedDraft);
                }
            },
            
            saveQuickDraft: (text) => {
                // [V50] 如果委派沒有傳入 text，自己去 DOM 拿
                if (typeof text !== 'string') text = document.getElementById('quick-input')?.value || '';
                localStorage.setItem('SQ_QUICK_DRAFT', text);
               window.SQ.Actions.toast("💾 隨手記已暫存");
            },

            transferToTask: (text) => {
                // [V50] 如果委派沒有傳入 text，自己去 DOM 拿
                if (typeof text !== 'string') text = document.getElementById('quick-input')?.value || '';
                
                if (!text || text.trim() === '') {
                     if(window.SQ.Actions &&window.SQ.Actions.toast)window.SQ.Actions.toast("⚠️ 請輸入內容");
                     return;
                }

                const parsedData = window.QuickController.parseText(text);

                if (!parsedData.title) {
                    localStorage.setItem('SQ_QUICK_DRAFT', text);
                    if(window.SQ.Actions &&window.SQ.Actions.toast)window.SQ.Actions.toast("⚠️ 無法識別標題 (請使用 / 開頭)");
                    return;
                }

                localStorage.removeItem('SQ_QUICK_DRAFT');
                window.SQ.Temp.importedTaskData = parsedData;

                if(window.SQ.Actions && window.SQ.Actions.navigate) window.SQ.Actions.navigate('task'); 
                if(window.SQ.Actions && window.SQ.Actions.switchTaskTab) window.SQ.Actions.switchTaskTab('list');
                
                // 👇 [修復] 改用統一的 Actions API 關閉 Modal
                if(window.SQ.Actions && window.SQ.Actions.closeModal) {
                    window.SQ.Actions.closeModal('overlay');
                    window.SQ.Actions.closeModal('panel');
                    window.SQ.Actions.closeModal('system');
                }

                setTimeout(() => {
                    if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Task.EDIT_MODE, { taskId: null });
                }, 400);
            }
        });
    },

    parseText: (text) => {
        const lines = text.split('\n');
        const task = { title: '', desc: '', subs: [], type: 'normal', cat: '每日', importance: 2, urgency: 2 };
        lines.forEach(line => {
            const t = line.trim();
            if (!t) return;
            if (t.startsWith('/')) task.title = t.substring(1).trim();
            else if (t.startsWith('**')) task.desc = task.desc ? task.desc + '\n' + t.substring(2).trim() : t.substring(2).trim();
            else if (/^\d+\./.test(t)) {
                const subText = t.replace(/^\d+\./, '').trim();
                if (subText) task.subs.push({ text: subText, done: false });
            } else {
                if (task.title || t.startsWith('/')) task.desc = task.desc ? task.desc + '\n' + t : t;
            }
        });
        return task;
    }
};
window.QuickController = window.SQ.Controller.Quick;