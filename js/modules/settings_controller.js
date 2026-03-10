/* js/modules/settings_controller.js - V56.0 */
window.SQ = window.SQ || {};
window.SQ.Controller = window.SQ.Controller || {};
window.SQ.Controller.Settings = {
    _initialized: false,
    init: function() {
        const E = window.SQ.Events;
        if (!window.SQ.EventBus || !E) return;

        Object.assign(window.SQ.Actions, {

            // ── 主設定頁 ────────────────────────────────────
            renderSettings: () => {
                window.SQ.Temp.activeModal = null;
                window.SQ.Temp.settingsDraft = {};     // 清空 draft，讓 render() 重新從 State 初始化
                window.SQ.Temp.settingsAudioSlider = null;
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            openSettingsShop: () => {
                window.SQ.Temp.activeModal = 'settingsShop';
                if (window.SQ.View.Settings) window.SQ.View.Settings.renderSettingsShop();
                window.SQ.EventBus.emit(E.Settings.UPDATED);
            },

            // draft 只用於 mode / strictMode / calMode（按儲存才生效）
            updateSettingsDraft: (key, val) => {
                window.SQ.Temp.settingsDraft = window.SQ.Temp.settingsDraft || {};
                window.SQ.Temp.settingsDraft[key] = val;
                if (key === 'strictMode') {
                    window.SQ.Actions.toast(val ? "⚡ 嚴格模式: 已開啟" : "⚡ 嚴格模式: 已關閉");
                }
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            checkCalMode: (isChecked) => {
                window.SQ.Temp.settingsDraft = window.SQ.Temp.settingsDraft || {};
                window.SQ.Temp.settingsDraft['calMode'] = isChecked;
                if (isChecked) {
                    window.SQ.Temp.activeModal = null;
                    if (window.SQ.View.Settings) window.SQ.View.Settings.renderCalorieModal();
                } else {
                    window.SQ.Actions.toast("🔥 卡路里追蹤: 已關閉");
                    if (window.SQ.View.Settings) window.SQ.View.Settings.render();
                }
            },

            submitCalTarget: () => {
                const el = document.getElementById('inp-cal-target');
                const val = parseInt(el ? el.value : 0);
                if (val > 0) {
                    window.SQ.Temp.activeModal = null;
                    window.SQ.Engine.Settings.saveCalTarget(val);
                    window.SQ.Temp.settingsDraft = window.SQ.Temp.settingsDraft || {};
                    window.SQ.Temp.settingsDraft['calMax'] = val;
                    window.SQ.Temp.settingsDraft['calMode'] = true;
                    ui.modal.close('m-overlay');
                    window.SQ.Actions.toast(`✅ 目標設定: ${val} Kcal`);
                    if (window.SQ.View.Settings) window.SQ.View.Settings.render();
                } else {
                    window.SQ.Actions.toast("❌ 請輸入有效數值");
                }
            },

            saveSettings: () => {
                if (!window.SettingsEngine) return;
                const draft = window.SQ.Temp.settingsDraft || {};
                const targetPage = window.SQ.Engine.Settings.applySettings(draft);
                window.SQ.Temp.settingsDraft = {};
                ui.modal.close('m-panel');
                if (window.SQ.Actions.navigate) window.SQ.Actions.navigate(targetPage);
            },

            buyMode: (id) => window.SQ.Engine.Settings.buyMode(id),
            openResetConfirm: () => { if (window.SQ.View.Settings) window.SQ.View.Settings.renderResetConfirm(); },
            confirmReset: () => window.SQ.Engine.Settings.performReset(),
            openExportModal: () => { if (window.SettingsEngine) window.SQ.Engine.Settings.downloadSaveFile(); },
            openImportModal: () => { if (window.SQ.View.Settings) window.SQ.View.Settings.renderImportModal(); },

            handleFileImport: () => {
                const el = document.getElementById('inp-import-file');
                if (!el || !el.files || el.files.length === 0) return;
                window.SQ.Temp.activeModal = null;
                window.SQ.Engine.Settings.parseSaveFile(el.files[0], (data) => {
                    const msg = "⚠️ 確定要覆蓋當前進度嗎？\n此操作將覆蓋所有存檔且無法復原。";
                    const doImport = () => {
                        window.SQ.State = data;
                        if (window.App) App.saveData();
                        window.SQ.Temp.activeModal = null;
                        ui.modal.close('m-overlay');
                        ui.modal.close('m-panel');
                        alert("✅ 匯入成功！系統將重新啟動。");
                        location.reload();
                    };
                    if (window.sys && sys.confirm) sys.confirm(msg, doImport);
                    else if (confirm(msg)) doImport();
                });
            },

            // ── 訂閱相關 ─────────────────────────────────────
            openSubscribePage: () => {
                if (window.SQ.View.Settings) window.SQ.View.Settings.renderSubscribePage();
            },

            subscribePro: async (sku) => {
                if (!window.SQ.Sub) {
                    window.SQ.Actions.toast('❌ 訂閱模組未載入');
                    return;
                }
                await window.SQ.Sub.subscribe(sku);
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            startTrial: () => {
                if (!window.SQ.Sub) return;
                window.SQ.Sub.startTrial();
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            startTrialAndClose: () => {
                if (!window.SQ.Sub) return;
                const ok = window.SQ.Sub.startTrial();
                if (!ok) return;
                // 關閉所有 modal 並跳回主頁
                ui?.modal?.close('m-overlay');
                ui?.modal?.close('m-panel');
                setTimeout(() => {
                    window.SQ.Actions.navigate?.('main');
                }, 150);
            },

            restoreSubscription: async () => {
                if (!window.SQ.Sub) return;
                await window.SQ.Sub.restoreSubscription();
            },

            cancelSubscription: () => {
                if (!window.SQ.Sub) return;
                window.SQ.Sub.cancelSubscription();
            },

            applyTheme: (theme) => {
                // Pro 功能鎖
                if (theme !== 'default' && window.SQ.Sub) {
                    const check = window.SQ.Sub.canUseTheme();
                    if (!check.ok) {
                        window.SQ.Sub.showUpgradePrompt(check.reason);
                        return;
                    }
                }
                if (window.SQ.Engine.Settings?.applyTheme) {
                    window.SQ.Engine.Settings.applyTheme(theme);
                    window.SQ.Actions.save();
                    window.SQ.Audio?.play('save');
                    if (window.SQ.View.Settings) window.SQ.View.Settings.render();
                }
            },

            // ── 重新教學 ──────────────────────────────────────
            restartTutorial: () => {
                if (window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('panel');
                if (window.SQ.Actions.closeModal) window.SQ.Actions.closeModal('overlay');
                if (window.SQ.Actions.restartTutorial) {
                    window.SQ.Actions.restartTutorial();
                } else {
                    window.SQ.Actions.toast('❌ 教學模組未載入');
                }
            },

            // ── 即時音效開關（直接改 State 並重繪）─────────
            toggleSound: (val) => {
                const enabled = val === 'true' || val === true;
                window.SQ.State.settings.soundEnabled = enabled;
                window.SQ.Actions.save();
                if (window.SQ.Audio) window.SQ.Audio.setEnabled(enabled);
                if (enabled && window.SQ.Audio) window.SQ.Audio.play('click');
                // 切換滑桿顯示：已開啟→展開音效滑桿；已關閉→收合
                window.SQ.Temp.settingsAudioSlider = enabled ? 'sound' : null;
                window.SQ.Audio?.feedback(enabled ? 'toggle_on' : 'toggle_off');
                window.SQ.Audio?.feedback(enabled ? 'toggle_on' : 'toggle_off');
                window.SQ.Audio?.feedback(enabled ? 'toggle_on' : 'toggle_off');
                window.SQ.Actions.toast(enabled ? '🔊 音效已開啟' : '🔇 音效已關閉');
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            toggleMusic: (val) => {
                const enabled = val === 'true' || val === true;
                window.SQ.State.settings.musicEnabled = enabled;
                window.SQ.Actions.save();
                if (window.SQ.Audio) window.SQ.Audio.setMusicEnabled(enabled);
                window.SQ.Temp.settingsAudioSlider = enabled ? 'music' : null;
                window.SQ.Audio?.feedback(enabled ? 'toggle_on' : 'toggle_off');
                window.SQ.Audio?.feedback(enabled ? 'toggle_on' : 'toggle_off');
                window.SQ.Audio?.feedback(enabled ? 'toggle_on' : 'toggle_off');
                window.SQ.Actions.toast(enabled ? '🎵 音樂已開啟' : '🎵 音樂已關閉');
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            toggleVibration: (val) => {
                const enabled = val === 'true' || val === true;
                window.SQ.State.settings.vibrationEnabled = enabled;
                window.SQ.Actions.save();
                if (enabled && navigator.vibrate) navigator.vibrate(50);
                window.SQ.Temp.settingsAudioSlider = enabled ? 'vib' : null;
                window.SQ.Audio?.play('toggle_on');
                window.SQ.Audio?.play('toggle_on');
                window.SQ.Audio?.play('toggle_on');
                window.SQ.Actions.toast(enabled ? '📳 震動已開啟' : '📴 震動已關閉');
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            setVolume: (val) => {
                const volume = Math.min(1, Math.max(0, (parseFloat(val)||70) / 100));
                window.SQ.State.settings.volume = volume;
                window.SQ.Actions.save();
                if (window.SQ.Audio) window.SQ.Audio.setVolume(volume);
                const el = document.getElementById('slider-volume-val');
                if (el) el.textContent = Math.round(volume*100) + '%';
            },

            setMusicVolume: (val) => {
                const volume = Math.min(1, Math.max(0, (parseFloat(val)||50) / 100));
                window.SQ.State.settings.musicVolume = volume;
                window.SQ.Actions.save();
                if (window.SQ.Audio) window.SQ.Audio.setMusicVolume(volume);
                const el = document.getElementById('slider-musicVolume-val');
                if (el) el.textContent = Math.round(volume*100) + '%';
            },

            setVibStrength: (val) => {
                const strength = Math.min(100, Math.max(0, parseInt(val)||50));
                window.SQ.State.settings.vibStrength = strength;
                window.SQ.Actions.save();
                const el = document.getElementById('slider-vibStrength-val');
                if (el) el.textContent = strength + '%';
            },

            // ── 通知設定 ───────────────────────────────────
            toggleNotification: async (val) => {
                const enabled = val === 'true' || val === true;
                // 在 Capacitor 環境下才操作通知插件
                if (window.Capacitor && window.SQ.Notification) {
                    if (enabled) {
                        const granted = await window.SQ.Notification.requestPermission();
                        if (!granted) { window.SQ.Actions.toast('❌ 通知權限被拒絕'); return; }
                        await window.SQ.Notification.createChannels();
                    } else {
                        await window.SQ.Notification.disableAll();
                    }
                }
                window.SQ.State.settings.notificationEnabled = enabled;
                window.SQ.Actions.save();
                window.SQ.Audio?.feedback(enabled ? 'toggle_on' : 'toggle_off');
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            },

            updateNotifySetting: (key, val) => {
                const s = window.SQ.State.settings;
                if (key.endsWith('Hour') || key.endsWith('Minute')) {
                    s[key] = parseInt(val) || 0;
                } else {
                    // 截止日開關：即時存並重繪
                    s[key] = (val === 'true' || val === true);
                    window.SQ.Actions.save();
                    if (window.SQ.View.Settings) window.SQ.View.Settings.render();
                }
            },

            saveNotifySettings: async () => {
                const s = window.SQ.State.settings;
                const readInput = (id) => {
                    const el = document.getElementById(id);
                    return el ? parseInt(el.value) : null;
                };
                const dh = readInput('inp-daily-h');
                const dm = readInput('inp-daily-m');
                const sh = readInput('inp-streak-h');
                const sm = readInput('inp-streak-m');
                if (dh !== null) s.notifyDailyHour   = Math.min(23, Math.max(0, dh));
                if (dm !== null) s.notifyDailyMinute  = Math.min(59, Math.max(0, dm));
                if (sh !== null) s.notifyStreakHour   = Math.min(23, Math.max(0, sh));
                if (sm !== null) s.notifyStreakMinute = Math.min(59, Math.max(0, sm));
                window.SQ.Actions.save();
                if (window.SQ.Notification) await window.SQ.Notification.scheduleAll();
                window.SQ.Actions.toast('🔔 通知設定已儲存！');
            }

        }); // Object.assign 結束

        // ── 事件監聽 ────────────────────────────────────────
        window.SQ.EventBus.on(E.Settings.UPDATED, () => {
            if (window.SQ.Temp.activeModal === 'settingsShop') {
                if (window.SQ.View.Settings) window.SQ.View.Settings.renderSettingsShop();
            }
            if (window.SQ.Events.Stats) {
                window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            }
        });

        console.log("✅ SettingsController V55.0 Active");
    }
};

window.SettingsController = window.SQ.Controller.Settings;