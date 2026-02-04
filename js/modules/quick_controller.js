/* js/modules/quick_controller.js - V39.1 Clears Draft & Fixes Race Condition */
window.quickController = {
    init: function() {
        // 註冊到 act
        Object.assign(window.act, {
            openquickModal: () => {
                // 讀取暫存 (如果有)
                const savedDraft = localStorage.getItem('SQ_QUICK_DRAFT') || '';
                if (window.view && view.renderquickNoteModal) {
                    view.renderquickNoteModal(savedDraft);
                }
            },
            
            saveQuickDraft: (text) => {
                localStorage.setItem('SQ_QUICK_DRAFT', text);
                act.toast("💾 隨手記已暫存");
            },

            // 核心：解析並傳送至任務表單
            transferToTask: (text) => {
                if (!text || text.trim() === '') {
                     if(window.act && act.toast) act.toast("⚠️ 請輸入內容");
                     return;
                }

                // 1. 解析內容
                // [注意] 這裡要呼叫自己 (window.quickController)
                const parsedData = window.quickController.parseText(text);

                if (!parsedData.title) {
                    // 如果解析失敗，保留內容讓使用者修改
                    localStorage.setItem('SQ_QUICK_DRAFT', text);
                    if(window.act && act.toast) act.toast("⚠️ 無法識別標題 (請使用 / 開頭)");
                    return;
                }

                // ==========================================
                // [新增] 2. 清除隨手記暫存
                // 既然解析成功，就清空草稿，下次打開就是乾淨的
                // ==========================================
                localStorage.removeItem('SQ_QUICK_DRAFT');

                // 3. 設定暫存資料 (傳遞給 TaskView)
                window.TempState.importedTaskData = parsedData;

                // 4. 導航與關閉視窗 (觸發 CSS 關閉動畫)
                if(window.act && act.navigate) act.navigate('task'); 
                if(window.act && act.switchTaskTab) act.switchTaskTab('list');
                if(window.ui && ui.modal) ui.modal.close('m-quick');

                // 5. [優化] 延遲 400ms 開啟新視窗
                // 避開「關閉動畫」的 300ms 期間，確保新視窗不會被舊的關閉指令誤殺
                setTimeout(() => {
                    console.log("🚀 隨手記傳送：開啟新增任務視窗...");
                    // 使用 EventBus 觸發，與 TaskController 邏輯統一
                    if (window.EventBus) {
                        window.EventBus.emit(window.EVENTS.Task.EDIT_MODE, { taskId: null });
                    }
                }, 400); 
            }
        });
        
        console.log("✅ QuickController Active (Auto-Clear Enabled)");
    },

    // 解析邏輯保持不變
    parseText: (text) => {
        const lines = text.split('\n');
        const task = {
            title: '',
            desc: '',
            subs: [],
            type: 'normal',
            cat: '每日',
            importance: 2,
            urgency: 2
        };

        lines.forEach(line => {
            const t = line.trim();
            if (!t) return;

            if (t.startsWith('/')) {
                task.title = t.substring(1).trim();
            } else if (t.startsWith('**')) {
                const d = t.substring(2).trim();
                task.desc = task.desc ? task.desc + '\n' + d : d;
            } else if (/^\d+\./.test(t)) {
                const subText = t.replace(/^\d+\./, '').trim();
                if (subText) {
                    task.subs.push({ text: subText, done: false });
                }
            } else {
                if (!task.title && !t.startsWith('/')) {
                     // 標題前的雜訊忽略
                } else {
                    task.desc = task.desc ? task.desc + '\n' + t : t;
                }
            }
        });

        return task;
    }
};