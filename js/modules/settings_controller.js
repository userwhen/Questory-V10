/* js/modules/settings_controller.js - V34.Final */
window.SettingsController = {
    init: function() {
        const E = window.EVENTS;
        if (!window.EventBus || !E) return;

        Object.assign(window.act, {
            // UI 入口
            renderSettings: () => settingsView.render(),
            openSettingsShop: () => settingsView.renderSettingsShop(),
            
            // 設定操作
            updateSettingsDraft: (key, val) => {
                window.TempState.settingsDraft = window.TempState.settingsDraft || {};
                window.TempState.settingsDraft[key] = val;
            },
            
            // [New] 卡路里開關邏輯
            checkCalMode: (isChecked) => {
                window.TempState.settingsDraft = window.TempState.settingsDraft || {};
                window.TempState.settingsDraft['calMode'] = isChecked;
                if (isChecked) {
                    settingsView.renderCalorieModal();
                }
            },
            
            // [New] 提交卡路里目標
            submitCalTarget: () => {
                const el = document.getElementById('inp-cal-target');
                const val = parseInt(el ? el.value : 0);
                if (val > 0) {
                    SettingsEngine.saveCalTarget(val);
                    window.TempState.settingsDraft['calMax'] = val; // 同步到 Draft
                    ui.modal.close('m-overlay');
                } else {
                    EventBus.emit(E.System.TOAST, "❌ 請輸入有效數值");
                }
            },

            saveSettings: () => {
                const targetPage = SettingsEngine.applySettings(window.TempState.settingsDraft);
                window.TempState.settingsDraft = {}; 
                ui.modal.close('m-panel');
                
                // 如果模式改變，導航到新首頁
                if (window.GlobalState.settings.mode !== window.TempState.lastMode) {
                    act.navigate(targetPage);
                }
            },
            
            buyMode: (id) => SettingsEngine.buyMode(id),
            
            // [New] 重置流程 (取代 confirm)
            openResetConfirm: () => settingsView.renderResetConfirm(),
            confirmReset: () => SettingsEngine.performReset(),

            // 匯入匯出
            openExportModal: () => {
                const code = SettingsEngine.exportData();
                settingsView.renderExportModal(code);
            },
            openImportModal: () => settingsView.renderImportModal(),
            submitImport: () => {
                const input = document.getElementById('inp-import-area');
                if (input && input.value) SettingsEngine.importData(input.value);
            }
        });

        // 監聽更新 (刷新商店 UI 狀態)
        EventBus.on(E.Settings.UPDATED, () => {
            const overlay = document.getElementById('m-overlay');
            // 如果商店開著，刷新它以更新購買按鈕狀態
            if (overlay && overlay.classList.contains('active') && overlay.innerText.includes('模式商店')) {
                settingsView.renderSettingsShop(); 
            }
            EventBus.emit(E.Stats.UPDATED); // 更新 HUD 鑽石
        });

        console.log("✅ SettingsController (Final) 就緒");
    }
};
window.view = window.view || {};
window.view.renderSettings = () => window.settingsView.render();