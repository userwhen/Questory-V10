/* js/modules/quick_controller.js - quick Note Logic */
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

                // 1. 保存當前內容
                localStorage.setItem('SQ_QUICK_DRAFT', text);

                // 2. 解析
                // [注意] 這裡要呼叫自己 (window.quickController)
                const parsedData = window.quickController.parseText(text);

                if (!parsedData.title) {
                    if(window.act && act.toast) act.toast("⚠️ 無法識別標題 (請使用 / 開頭)");
                    return;
                }

                // 3. 設定暫存資料
                window.TempState.importedTaskData = parsedData;

                // 4. [修正] 跳轉頁面並自動開啟編輯視窗
                if(window.act && act.navigate) act.navigate('task'); 
                if(window.act && act.switchTaskTab) act.switchTaskTab('list');

                // 5. 關閉隨手記視窗
                if(window.ui && ui.modal) ui.modal.close('m-quick');

                // 6. [新增] 延遲一點點時間，強制打開新增任務視窗
                setTimeout(() => {
                    console.log("🚀 自動開啟新增任務視窗...");
                    if (window.taskView && taskView.renderCreateTaskForm) {
                        taskView.renderCreateTaskForm(null); // null 代表新增模式
                    }
                }, 100); // 100ms 緩衝確保頁面已切換
            }
        });
        
        console.log("✅ QuickController Active (Functions Registered)");
    },

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
                     // 標題防呆可選
                } else {
                    task.desc = task.desc ? task.desc + '\n' + t : t;
                }
            }
        });

        return task;
    }
};