/* js/modules/settings_view.js - V55.0 */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Settings = {

    render: function() {
        const gs  = window.SQ.State;
        const s   = gs.settings || {};
        const unlocks = gs.unlocks || {};

        // draft 只用於「按儲存才生效」的設定 (mode, strictMode, calMode)
        // 音效/震動/通知是即時開關，直接讀 s（已被 toggle action 更新）
        if (!window.SQ.Temp.settingsDraft || Object.keys(window.SQ.Temp.settingsDraft).length === 0) {
            window.SQ.Temp.settingsDraft = {
                mode:       s.mode       || 'adventurer',
                strictMode: s.strictMode || false,
                calMode:    s.calMode    || false,
                calMax:     s.calMax     || 2000
            };
        }
        const draft = window.SQ.Temp.settingsDraft;

        // 即時開關直接從 s（已存檔的真實值）讀取
        const soundOn  = s.soundEnabled     ?? true;
        const musicOn  = s.musicEnabled     ?? false;
        const vibOn    = s.vibrationEnabled ?? true;
        const notifOn  = s.notificationEnabled || false;

        // ── 模式選項 ──────────────────────────────────────
        let modeOptions = [
            { val:'adventurer', label:'🛡️ 冒險者模式' },
            { val:'basic',      label:'📊 基礎模式' }
        ];
        if (unlocks.harem)    modeOptions.push({ val:'harem',    label:'💕 后宮模式' });
        if (unlocks.learning) modeOptions.push({ val:'learning', label:'📚 語言學習' });

        // ── Toggle 渲染器 ─────────────────────────────────
        const renderToggle = (action, actionId, label, checked, locked, icon='') => {
            if (locked) return `
                <div style="padding:12px;color:var(--text-ghost);border-bottom:1px solid var(--border);
                     display:flex;justify-content:space-between;align-items:center;">
                    <span>${icon?icon+' ':''}🔒 ${label}</span>
                    <span style="font-size:0.8rem;background:var(--bg-box);padding:2px 8px;
                          border-radius:var(--radius-sm);">未解鎖</span>
                </div>`;
            const uid = 'tog-' + action + (actionId||'').replace(/[^a-z]/gi,'');
            return `
                <div class="u-toggle-row ${checked?'on':''}"
                     data-action="${action}"
                     ${actionId ? `data-id="${actionId}"` : ''}
                     data-val="${!checked}"
                     style="cursor:pointer;">
                    <div class="toggle-track"></div>
                    ${icon ? `<span style="font-size:1.2rem;margin-left:4px;">${icon}</span>` : ''}
                    <label for="${uid}" style="flex:1;cursor:pointer;font-size:0.9rem;
                                               font-weight:600;color:var(--text-2);">
                        ${label}
                    </label>
                    <input type="checkbox" id="${uid}" name="${uid}"
                           ${checked?'checked':''} style="position:absolute;opacity:0;pointer-events:none;">
                </div>`;
        };

        // ── 音效圖示按鈕 ──────────────────────────────────
        const activeSlider = window.SQ.Temp.settingsAudioSlider || null;

        const iconBtn = (action, sliderKey, enabled, icon, label) => {
            const isActive = activeSlider === sliderKey;
            const slash = enabled ? '' : `
                <svg viewBox="0 0 36 36" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;">
                    <line x1="5" y1="5" x2="31" y2="31" stroke="#e53935" stroke-width="3.5" stroke-linecap="round"/>
                </svg>`;
            return `
                <div data-action="${action}" data-val="${!enabled}"
                     style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;
                            padding:12px 6px;border-radius:12px;cursor:pointer;user-select:none;
                            background:${enabled?'var(--color-correct-soft)':'var(--bg-box)'};
                            border:1.5px solid ${enabled?'rgba(46,158,116,0.4)':'var(--border)'};
                            ${isActive?'box-shadow:0 0 0 2px var(--color-gold);':''}
                            transition:all 0.2s;">
                    <div style="position:relative;width:36px;height:36px;
                                display:flex;align-items:center;justify-content:center;
                                pointer-events:none;">
                        <span style="font-size:1.6rem;opacity:${enabled?1:0.35};">${icon}</span>
                        ${slash}
                    </div>
                    <span style="font-size:0.75rem;font-weight:600;pointer-events:none;
                                 color:${enabled?'var(--color-correct)':'var(--text-muted)'};">
                        ${label}
                    </span>
                </div>`;
        };

        // ── 滑桿（依選中項目顯示）─────────────────────────
        const sliders = {
            sound: { label:'🔊 音效音量', key:'volume',      val:Math.round((s.volume??0.7)*100),      action:'setVolume',      enabled:soundOn },
            music: { label:'🎵 音樂音量', key:'musicVolume', val:Math.round((s.musicVolume??0.5)*100), action:'setMusicVolume', enabled:musicOn },
            vib:   { label:'📳 震動強度', key:'vibStrength', val:s.vibStrength??50,                   action:'setVibStrength', enabled:vibOn,
                     hint:'App 版限定' }
        };
        let sliderHtml = '';
        if (activeSlider && sliders[activeSlider]) {
            const sc = sliders[activeSlider];
            sliderHtml = `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 2px 2px;">
                    <span style="font-size:0.82rem;color:var(--text-muted);white-space:nowrap;min-width:60px;">
                        ${sc.label}
                    </span>
                    <input type="range" id="slider-${sc.key}" name="slider-${sc.key}"
                           aria-label="${sc.label}"
                           min="0" max="100" value="${sc.val}"
                           data-input="${sc.action}" data-is-num="true"
                           style="flex:1;accent-color:var(--color-gold);height:4px;">
                    <span id="slider-${sc.key}-val"
                          style="font-size:0.82rem;color:var(--text-muted);min-width:36px;text-align:right;">
                        ${sc.val}%
                    </span>
                </div>`;
        }

        // ── 通知區塊 ──────────────────────────────────────
        const timeInput = (idSuffix, hour, minute, actionId) => `
            <div style="display:flex;align-items:center;gap:6px;">
                <input type="number" id="inp-${idSuffix}-h" name="inp-${idSuffix}-h"
                    aria-label="${idSuffix} 小時"
                    value="${hour}" min="0" max="23" inputmode="numeric"
                    data-action="updateNotifySetting" data-id="${actionId}Hour"
                    style="width:52px;text-align:center;padding:6px;border-radius:8px;
                           border:1.5px solid var(--border);background:var(--bg-input);
                           color:var(--text);font-size:1rem;">
                <span style="font-weight:bold;color:var(--text-muted);">:</span>
                <input type="number" id="inp-${idSuffix}-m" name="inp-${idSuffix}-m"
                    aria-label="${idSuffix} 分鐘"
                    value="${String(minute).padStart(2,'0')}" min="0" max="59" inputmode="numeric"
                    data-action="updateNotifySetting" data-id="${actionId}Minute"
                    style="width:52px;text-align:center;padding:6px;border-radius:8px;
                           border:1.5px solid var(--border);background:var(--bg-input);
                           color:var(--text);font-size:1rem;">
            </div>`;

        // ── 組合主體 ───────────────────────────────────────
        const bodyHtml = `

        <!-- 1. 核心設定 -->
        <div class="u-box">
            ${ui.composer.formField({ label:'核心設定',
                inputHtml: ui.atom.inputBase({
                    type:'select', val: draft.mode || 'adventurer',
                    action:'updateSettingsDraft', actionId:'mode', options: modeOptions
                })
            })}
            <div data-action="openSettingsShop"
                 style="margin-top:10px;padding:12px;border:1px solid var(--color-gold);
                        background:var(--color-gold-soft);border-radius:var(--radius-sm);
                        cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span>🛒</span>
                    <span style="font-weight:bold;color:var(--color-gold-dark);">前往模式商店</span>
                </div>
                <span style="color:var(--color-gold-dark);">&gt;</span>
            </div>
        </div>

        <!-- 2. 功能開關 DLC -->
        <div class="u-box" style="margin-top:12px;">
            <div class="section-title" data-action="triggerDevMode"
                   style="display:block;margin-bottom:10px;cursor:pointer;user-select:none;">
                功能開關 (DLC)
            </div>
            ${renderToggle('checkCalMode','','🔥 卡路里消耗計算', draft.calMode, !unlocks.feature_cal)}
            ${renderToggle('updateSettingsDraft','strictMode','⚡ 嚴格模式 (失敗扣分)', draft.strictMode, !unlocks.feature_strict)}
        </div>

        <!-- 3. 音效與震動 -->
        <div class="u-box" style="margin-top:12px;">
            <div class="section-title" style="margin-bottom:12px;">🔊 音效與震動</div>
            <div style="display:flex;gap:10px;margin-bottom:6px;">
                ${iconBtn('toggleSound',     'sound', soundOn, '🔊', '音效')}
                ${iconBtn('toggleMusic',     'music', musicOn, '🎵', '音樂')}
                ${iconBtn('toggleVibration', 'vib',   vibOn,   '📳', '震動')}
            </div>
            ${sliderHtml}
            <p style="font-size:0.75rem;color:var(--text-ghost);margin:8px 0 0;text-align:center;">
                點擊圖示切換開關 · 再次點擊已開啟的項目可調整音量${activeSlider==='vib'?' · App 版限定':''}
            </p>
        </div>

        <!-- 4. 通知設定 -->
        <div class="u-box" style="margin-top:12px;">
            <div class="section-title" style="margin-bottom:10px;">🔔 通知設定</div>
            ${renderToggle('toggleNotification','','開啟推播通知', notifOn, false)}
            ${notifOn ? `
            <div style="margin-top:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;
                            padding:10px 0;border-bottom:1px solid var(--border-light);">
                    <div>
                        <div style="font-size:0.9rem;color:var(--text);">📋 每日任務提醒</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">每天固定時間提醒</div>
                    </div>
                    ${timeInput('daily', s.notifyDailyHour??9, s.notifyDailyMinute??0, 'notifyDaily')}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;
                            padding:10px 0;border-bottom:1px solid var(--border-light);">
                    <div>
                        <div style="font-size:0.9rem;color:var(--text);">🔥 連續天數警告</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">當天尚未登入時提醒</div>
                    </div>
                    ${timeInput('streak', s.notifyStreakHour??21, s.notifyStreakMinute??0, 'notifyStreak')}
                </div>
                ${renderToggle('updateNotifySetting','notifyDeadline','⏰ 截止日當天提醒', s.notifyDeadline!==false, false)}
                <button data-action="saveNotifySettings"
                    style="width:100%;margin-top:12px;padding:10px;border-radius:10px;
                           border:none;cursor:pointer;background:var(--color-gold);
                           color:#fff;font-weight:bold;font-size:0.9rem;">
                    儲存通知設定
                </button>
            </div>` : ''}
        </div>

        <!-- 5. 存檔管理 -->
        <div class="u-box" style="margin-top:12px;background:var(--color-danger-soft);
                                   border:1px solid rgba(192,57,43,0.3);">
            <div class="section-title" style="color:var(--color-danger-dark);">存檔管理</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                ${ui.atom.buttonBase({label:'📥 匯入',size:'sm',theme:'normal',action:'openImportModal'})}
                ${ui.atom.buttonBase({label:'📤 匯出',size:'sm',theme:'normal',action:'openExportModal'})}
            </div>
            ${ui.atom.buttonBase({label:'⚠️ 重置所有資料',theme:'danger',size:'sm',
                style:'width:100%;margin-top:10px;',action:'openResetConfirm'})}
        </div>
        `;

        ui.modal.render('⚙️ 系統設定', bodyHtml,
            ui.atom.buttonBase({label:'儲存變更',theme:'correct',style:'width:100%;',action:'saveSettings'}),
            'panel');
    },

    renderCalorieModal: function() {
        const val = window.SQ.Temp.settingsDraft?.calMax || window.SQ.State.settings?.calMax || 2000;
        const extraHtml = `
            <div style="display:flex;justify-content:center;align-items:center;gap:10px;">
                <input type="text" id="inp-cal-target" name="inp-cal-target"
                    aria-label="每日熱量目標"
                    value="${val}" maxlength="4" inputmode="numeric" data-is-num="true" placeholder="2000"
                    style="font-size:1.5rem;width:120px;text-align:center;padding:5px;
                           border:2px solid var(--color-info);border-radius:var(--radius-sm);
                           outline:none;color:var(--text);background:var(--bg-input);">
            </div>`;
        ui.modal.render('🔥 目標設定',
            ui.composer.centeredModalBody({icon:'🎯',title:'請設定每日熱量目標 (Kcal)',desc:'',extraHtml}),
            ui.atom.buttonBase({label:'確定',theme:'correct',style:'width:100%;',action:'submitCalTarget'}),
            'overlay');
    },

    renderSettingsShop: function() {
        if (window.SQ.Temp.activeModal !== 'settingsShop') return;
        const items = window.SQ.Engine.Settings.shopItems;
        const unlocks = window.SQ.State.unlocks || {};
        const listHtml = items.map(item => `
            <div class="std-card" style="margin-bottom:10px;border-left-color:${item.border};
                                         ${item.bg?'background:'+item.bg+';':''}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <h4 style="margin:0;color:${item.color};font-size:1.1rem;">${item.name}</h4>
                    ${item.badge?ui.atom.badgeBase({text:item.badge,
                        style:'color:var(--color-gold-dark);background:var(--color-gold-soft);'}):''}
                </div>
                <p style="font-size:0.9rem;color:var(--text-2);margin-bottom:12px;line-height:1.5;">
                    ${item.desc}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:bold;color:var(--text-muted);">
                        ${item.currency==='paid'?'💠':'💎'} ${item.price}</span>
                    ${unlocks[item.id]
                        ? `<span style="color:var(--text-ghost);font-size:0.9rem;font-weight:bold;">✅ 已擁有</span>`
                        : ui.atom.buttonBase({label:'購買',size:'sm',theme:'correct',
                                              action:'buyMode',actionId:item.id})}
                </div>
            </div>`).join('');
        ui.modal.render('🛒 模式商店',`<div style="padding:10px;">${listHtml}</div>`,null,'overlay');
    },

    renderResetConfirm: function() {
        ui.modal.render('系統警告',
            ui.composer.centeredModalBody({icon:'⚠️',title:'危險操作',
                desc:'確定要刪除所有進度嗎？<br>此操作<b>無法復原</b>。'}),
            `${ui.atom.buttonBase({label:'取消',theme:'ghost',style:'flex:1;',
                action:'closeModal',actionId:'m-system'})}
             ${ui.atom.buttonBase({label:'確定重置',theme:'danger',style:'flex:2;',
                action:'confirmReset'})}`, 'system');
    },

    renderImportModal: function() {
        const extraHtml = `
            <input type="file" id="inp-import-file" name="inp-import-file"
                aria-label="選擇存檔檔案" accept=".json" data-change="handleFileImport"
                style="display:block;width:100%;padding:10px;border:1px dashed var(--border);
                       background:var(--bg-box);border-radius:var(--radius-sm);color:var(--text);">`;
        ui.modal.render('📥 讀取存檔',
            ui.composer.centeredModalBody({icon:'📥',title:'讀取存檔',desc:'請選擇 .json 存檔檔案',extraHtml}),
            ui.atom.buttonBase({label:'關閉',theme:'ghost',style:'width:100%;',
                action:'closeModal',actionId:'m-overlay'}), 'overlay');
    }
};

window.view = window.view || {};
window.SQ.View.Main.renderSettings = () => {
    if (window.SQ.View.Settings) window.SQ.View.Settings.render();
};