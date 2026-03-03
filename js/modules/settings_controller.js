/* js/modules/settings_controller.js - V51.4 Pure CSP Controller */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Settings = {
	_initialized: false,
    init: function() {
        const E = window.SQ.Events;
        if (!window.SQ.EventBus || !E) return;

        Object.assign(window.SQ.Actions, {
            renderSettings: () => {
                // 🌟 修復：每次打開主設定頁面時，強制清空所有子視窗的暫存狀態
                window.SQ.Temp.activeModal = null; 
                if(window.SQ.View.Settings) window.SQ.View.Settings.render();
            },
            openSettingsShop: () => {
            // Force the flag immediately
            window.SQ.Temp.activeModal = 'settingsShop'; 

            // Render immediately without waiting for an event
            if (window.SQ.View.Settings && window.SQ.View.Settings.renderSettingsShop) {
                window.SQ.View.Settings.renderSettingsShop();
            }

            // Emit the event so other systems (like audio/visual updates) sync up
            if (window.SQ.EventBus && window.SQ.Events && window.SQ.Events.Settings) {
                window.SQ.EventBus.emit(window.SQ.Events.Settings.UPDATED);
            }
        },
            
            updateSettingsDraft: (key, val) => {
                window.SQ.Temp.settingsDraft = window.SQ.Temp.settingsDraft || {};
                window.SQ.Temp.settingsDraft[key] = val;
                
                if (key === 'strictMode') {
                    const msg = val ? "⚡ 嚴格模式: 已開啟" : "⚡ 嚴格模式: 已關閉";
                    if(window.SQ.Actions.toast) window.SQ.Actions.toast(msg);
                }
                if(window.SQ.View.Settings) window.SQ.View.Settings.render();
            },
            
            checkCalMode: (isChecked) => {
				window.SQ.Temp.settingsDraft = window.SQ.Temp.settingsDraft || {};
				window.SQ.Temp.settingsDraft['calMode'] = isChecked;
				
				if (isChecked) {
					// ✨ 關鍵修復：既然要開啟熱量視窗，就代表目前不在商店視窗狀態了
					window.SQ.Temp.activeModal = null; 
					
					if(window.SQ.View.Settings) window.SQ.View.Settings.renderCalorieModal();
				} else {
					if(window.SQ.Actions.toast) window.SQ.Actions.toast("🔥 卡路里追蹤: 已關閉");
					if(window.SQ.View.Settings) window.SQ.View.Settings.render();
				}
			},

			// 2. 修改 submitCalTarget：確保儲存並觸發事件前，狀態是乾淨的
			submitCalTarget: () => {
				const el = document.getElementById('inp-cal-target');
				const val = parseInt(el ? el.value : 0);
				if (val > 0) {
					if(window.SettingsEngine) {
						 // ✨ 關鍵修復：在發出 UPDATED 事件前，確保 activeModal 為 null
						 // 這樣監聽器就不會誤判需要重新渲染商店
						 window.SQ.Temp.activeModal = null;

						 window.SQ.Engine.Settings.saveCalTarget(val); // 這裡會發出 UPDATED
						 
						 window.SQ.Temp.settingsDraft = window.SQ.Temp.settingsDraft || {};
						 window.SQ.Temp.settingsDraft['calMax'] = val;
						 window.SQ.Temp.settingsDraft['calMode'] = true;
						 
						 ui.modal.close('m-overlay');
						 
						 if(window.SQ.Actions.toast) window.SQ.Actions.toast(`✅ 目標設定: ${val} Kcal`);
						 if(window.SQ.View.Settings) window.SQ.View.Settings.render();
					}
				} else {
					if(window.SQ.Actions.toast) window.SQ.Actions.toast("❌ 請輸入有效數值");
				}
			},

            saveSettings: () => {
                if(!window.SettingsEngine) return;
                const draft = window.SQ.Temp.settingsDraft || {};
                const targetPage = window.SQ.Engine.Settings.applySettings(draft); 
                
                window.SQ.Temp.settingsDraft = {}; 
                ui.modal.close('m-panel');
                if (window.SQ.Actions.navigate) window.SQ.Actions.navigate(targetPage);
            },
            
            buyMode: (id) => window.SQ.Engine.Settings.buyMode(id),
            openResetConfirm: () => { if(window.SQ.View.Settings) window.SQ.View.Settings.renderResetConfirm(); },
            confirmReset: () => window.SQ.Engine.Settings.performReset(),
            openExportModal: () => { if(window.SettingsEngine) window.SQ.Engine.Settings.downloadSaveFile(); },
            openImportModal: () => { if(window.SQ.View.Settings) window.SQ.View.Settings.renderImportModal(); },

            handleFileImport: () => {
                const el = document.getElementById('inp-import-file');
                if (!el || !el.files || el.files.length === 0) return;
                const file = el.files[0];
                
                if (window.SettingsEngine) {
                    window.SQ.Temp.activeModal = null;

                    window.SQ.Engine.Settings.parseSaveFile(file, (data) => {
                        const msg = "⚠️ 確定要覆蓋當前進度嗎？\n此操作將覆蓋所有存檔且無法復原。";
                        
                        const doImport = () => {
                            window.SQ.State = data;
                            if (window.App) App.saveData(); 
                            
                            window.SQ.Temp.activeModal = null;
                            
                            if (window.ui && ui.modal) {
                                ui.modal.close('m-overlay');
                                ui.modal.close('m-panel');
                            } else if (window.SQ.Actions.closeModal) {
                                window.SQ.Actions.closeModal('overlay');
                                window.SQ.Actions.closeModal('panel');
                            }
                            
                            alert("✅ 匯入成功！系統將重新啟動。");
                            location.reload();
                        };

                        if (window.sys && sys.confirm) {
                            sys.confirm(msg, doImport);
                        } else if (confirm(msg)) {
                            doImport();
                        }
                    });
                }
            } // handleFileImport 結束
        }); // ✨ 這裡補上了缺失的 )，用來結束 Object.assign

        // 🌟 這裡也要記得放回原本的更新監聽器
        window.SQ.EventBus.on(window.SQ.Events.Settings.UPDATED, () => {
            if (window.SQ.Temp.activeModal === 'settingsShop') {
                if (window.SQ.View.Settings) window.SQ.View.Settings.renderSettingsShop(); 
            } else {
                window.SQ.Temp.activeModal = null;
            }

            if (window.SQ.Events.Stats) {
                window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            }
        });

        console.log("✅ SettingsController V51.4 Active");
    } // init 結束
}; // window.SQ.Controller.Settings 結束

window.SettingController = window.SQ.Controller.Settings;