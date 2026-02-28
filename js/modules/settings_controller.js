/* js/modules/settings_controller.js - V54.0 Force Render Fix */
window.SettingsController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        // 1. 定義 act 行為
        Object.assign(window.act, {
            // UI 入口
            renderSettings: () => {
                if(window.settingsView) window.settingsView.render();
            },
            openSettingsShop: () => {
                window.TempState.activeModal = 'settingsShop'; 
                if(window.settingsView) window.settingsView.renderSettingsShop();
            },
            
            // --- 通用設定操作 (嚴格模式等) ---
            updateSettingsDraft: (key, val) => {
                // 1. 更新數據
                window.TempState.settingsDraft = window.TempState.settingsDraft || {};
                window.TempState.settingsDraft[key] = val;
                
                // 2. 提示訊息
                if (key === 'strictMode') {
                    const msg = val ? "⚡ 嚴格模式: 已開啟" : "⚡ 嚴格模式: 已關閉";
                    if(window.act.toast) window.act.toast(msg);
                }

                // 3. [關鍵修復] 強制刷新畫面
                // 這確保 UI 的勾選狀態跟 Draft 資料絕對同步
                if(window.settingsView) window.settingsView.render();
            },
            
            // --- 卡路里模式專用邏輯 ---
            checkCalMode: (isChecked) => {
                // 1. 更新數據
                window.TempState.settingsDraft = window.TempState.settingsDraft || {};
                window.TempState.settingsDraft['calMode'] = isChecked;
                
                if (isChecked) {
                    // 開啟 -> 彈出數值設定視窗 (這會蓋在上面，所以不用刷新底層)
                    if(window.settingsView) settingsView.renderCalorieModal();
                } else {
                    // 關閉 -> 提示 + 刷新畫面
                    if(window.act.toast) window.act.toast("🔥 卡路里追蹤: 已關閉");
                    
                    // [關鍵修復] 關閉時強制刷新，確保勾勾消失
                    if(window.settingsView) settingsView.render();
                }
            },
            
            // --- 提交卡路里目標 ---
            submitCalTarget: () => {
                const el = document.getElementById('inp-cal-target');
                const val = parseInt(el ? el.value : 0);
                if (val > 0) {
                    if(window.SettingsEngine) {
                         SettingsEngine.saveCalTarget(val);
                         // 同步 Draft
                         window.TempState.settingsDraft = window.TempState.settingsDraft || {};
                         window.TempState.settingsDraft['calMax'] = val;
                         window.TempState.settingsDraft['calMode'] = true;
                         ui.modal.close('m-overlay');
                         
                         if(window.act.toast) window.act.toast(`✅ 目標設定: ${val} Kcal`);
                         
                         // 刷新介面 (顯示為開啟狀態)
                         if(window.settingsView) settingsView.render();
                    }
                } else {
                    if(window.act.toast) window.act.toast("❌ 請輸入有效數值");
                }
            },

            // --- 儲存設定 ---
            saveSettings: () => {
                if(!window.SettingsEngine) return;
                const draft = window.TempState.settingsDraft || {};
                const targetPage = SettingsEngine.applySettings(draft); // 存入硬碟
                
                window.TempState.settingsDraft = {}; // 清空暫存
                ui.modal.close('m-panel');
                
                if (window.act.navigate) window.act.navigate(targetPage);
            },
            
            // --- 其他功能 ---
            buyMode: (id) => SettingsEngine.buyMode(id),
            openResetConfirm: () => { if(window.settingsView) settingsView.renderResetConfirm(); },
            confirmReset: () => SettingsEngine.performReset(),
            openExportModal: () => { if(window.SettingsEngine) SettingsEngine.downloadSaveFile(); },
            openImportModal: () => { if(window.settingsView) settingsView.renderImportModal(); },

            handleFileImport: (inputElement) => {
                if (inputElement.files.length === 0) return;
                const file = inputElement.files[0];
                if(window.SettingsEngine) {
                    SettingsEngine.parseSaveFile(file, (data) => {
                        const msg = "⚠️ 確定要覆蓋當前進度嗎？";
                        const doImport = () => {
                            window.GlobalState = data;
                            if(window.App) App.saveData(); 
                            if(window.act.closeModal) {
                                act.closeModal('overlay');
                                act.closeModal('panel');
                            }
                            alert("✅ 匯入成功！系統將重新啟動。");
                            location.reload();
                        };
                        if(window.sys && sys.confirm) sys.confirm(msg, doImport);
                        else if(confirm(msg)) doImport();
                    });
                }
            }
        });

        // ============================================================
        // [現代化轉接器] 
        // 為了相容 index.html 的 onclick="view.renderSettings()"
        // 我們在這裡建立橋接，這樣就不用修改 html 檔案了
        // ============================================================
        window.view = window.view || {};
        window.view.renderSettings = window.act.renderSettings;
        
        // 監聽更新
        EventBus.on(E.Settings.UPDATED, () => {
            if (window.TempState.activeModal === 'settingsShop') {
                if(window.settingsView) settingsView.renderSettingsShop(); 
            }
            if(E.Stats) EventBus.emit(E.Stats.UPDATED);
        });

        console.log("✅ SettingsController V54.0 Loaded (Force Render Active)");
    }
};