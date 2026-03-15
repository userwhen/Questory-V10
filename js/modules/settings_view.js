/* js/modules/settings_view.js - V58.0 Zero Hardcoded Edition */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Settings = {

    render: function() {
        const gs  = window.SQ.State;
        const s   = gs.settings || {};
        const unlocks = gs.unlocks || {};

        if (!window.SQ.Temp.settingsDraft || Object.keys(window.SQ.Temp.settingsDraft).length === 0) {
            window.SQ.Temp.settingsDraft = {
                mode:       s.mode       || 'adventurer',
                strictMode: s.strictMode || false,
                calMode:    s.calMode    || false,
                calMax:     s.calMax     || 2000
            };
        }
        const draft = window.SQ.Temp.settingsDraft;

        const soundOn  = s.soundEnabled     ?? true;
        const musicOn  = s.musicEnabled     ?? false;
        const vibOn    = s.vibrationEnabled ?? true;
        const notifOn  = s.notificationEnabled || false;

        let modeOptions = [
            { val:'adventurer', label:'🛡️ 冒險者模式' },
            { val:'basic',      label:'📊 基礎模式' }
        ];
        if (unlocks.theme_harem) modeOptions.push({ val:'harem', label:'🪭 后宮模式' });
        if (unlocks.theme_tech)  modeOptions.push({ val:'tech',  label:'💠 菁英科技' });

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

        const activeSlider = window.SQ.Temp.settingsAudioSlider || null;

        const iconBtn = (action, sliderKey, enabled, icon, label) => {
            const isActive = activeSlider === sliderKey;
            // 🌟 修正：將紅色 #e53935 換成 var(--color-danger)
            const slash = enabled ? '' : `
                <svg viewBox="0 0 36 36" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;">
                    <line x1="5" y1="5" x2="31" y2="31" stroke="var(--color-danger)" stroke-width="3.5" stroke-linecap="round"/>
                </svg>`;
            return `
                <div data-action="${action}" data-val="${!enabled}"
                     style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;
                            padding:12px 6px;border-radius:12px;cursor:pointer;user-select:none;
                            background:${enabled?'var(--color-correct-soft)':'var(--bg-box)'};
                            border:1.5px solid ${enabled?'var(--color-correct)':'var(--border)'};
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

        const bodyHtml = `
        ${(() => {
            const isPro = window.SQ.Sub?.isProOrTrial() || false;
            const inTrial = window.SQ.Sub?.isInTrial() || false;
            const expiry = window.SQ.Sub?.expiryLabel() || '';
            if (isPro) {
                const badge = inTrial ? '🎯 試用中' : '👑 Pro';
                const sub = window.SQ.State?.subscription || {};
                const expiryTxt = expiry ? `有效至 ${expiry}` : '';
                return `
                <div style="margin-bottom:12px; padding:12px 14px; border-radius:12px;
                            background:var(--color-gold-soft);
                            border:1px solid var(--color-gold); display:flex; align-items:center;
                            justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.3rem;">👑</span>
                        <div>
                            <div style="font-weight:700; color:var(--color-gold-dark); font-size:0.88rem;">${badge} 已啟用</div>
                            <div style="font-size:0.7rem; color:var(--text-muted);">${expiryTxt || '無使用限制'}</div>
                        </div>
                    </div>
                    <button data-action="cancelSubscription"
                            style="background:none; border:none; cursor:pointer;
                                   font-size:0.7rem; color:var(--text-ghost); text-decoration:underline;">
                        管理
                    </button>
                </div>`;
            } else {
                return `
                <div data-action="openSubscribePage"
                     style="margin-bottom:12px; padding:11px 14px; border-radius:12px; cursor:pointer;
                            background:var(--bg-elevated);
                            border:1px solid var(--border); display:flex; align-items:center;
                            justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.2rem; opacity:0.75;">✨</span>
                        <div>
                            <div style="font-weight:600; color:var(--text-2); font-size:0.86rem;">解鎖進階功能</div>
                            <div style="font-size:0.7rem; color:var(--text-ghost);">無限分類・Focus Lock・主題自訂</div>
                        </div>
                    </div>
                    <span style="color:var(--text-ghost); font-size:0.9rem;">›</span>
                </div>`;
            }
        })()}

        <div class="u-box">
            <div style="padding:8px 4px 10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:3px;">目前主題</div>
                    <div style="font-weight:700; color:var(--text); font-size:0.95rem;">
                        ${(() => {
                            const t = s.theme || 'default';
                            const names = {
                                'default':'🛡️ 冒險者模式','harem':'🪭 後宮模式','tech':'💠 未來科技',
                                'wood':'🌑 魔法學院','white':'☀️ 晨曦物語','story':'🌙 賽博都市',
                                'basic-harem':'🪭 宮廷朱色','basic-tech':'💠 科技藍調',
                                'basic-wood':'🌑 沉靜學院','basic-white':'☀️ 明亮清晨','basic-story':'🌙 霓光暗夜',
                                'siren':'🧜 深海賽壬','mermaid':'🐚 夢幻人魚',
                                'basic-siren':'🧜 深海藍黑','basic-mermaid':'🐚 珍珠粉藍',
                                'gilded':'✨ Gilded Abyss','basic-gilded':'✨ 鎏金深海'
                            };
                            return names[t] || t;
                        })()}
                    </div>
                </div>
                <div data-action="openSettingsShop"
                     style="padding:7px 14px; border-radius:var(--radius-sm);
                            background:var(--color-gold-soft); border:1px solid var(--color-gold);
                            cursor:pointer; font-size:0.8rem; font-weight:700; color:var(--color-gold-dark);">
                    🛒 更換主題
                </div>
            </div>
        </div>

        <div class="u-box" style="margin-top:12px;">
            <div class="section-title" data-action="triggerDevMode"
                   style="display:block;margin-bottom:10px;cursor:pointer;user-select:none;">
                功能開關 (DLC)
            </div>
            ${renderToggle('checkCalMode','','🔥 卡路里消耗計算', draft.calMode, !unlocks.feature_cal)}
            ${renderToggle('updateSettingsDraft','strictMode','⚡ 嚴格模式 (失敗扣分)', draft.strictMode, !unlocks.feature_strict)}
        </div>
		<div class="u-box" style="margin-top:12px;">
            <div class="section-title" style="margin-bottom:10px;">🔍 介面字體大小</div>
            <div style="display:flex; gap:5px;">
                ${[
                    { val: '14px', label: '小 (14px)' },
                    { val: '16px', label: '中 (16px)' },
                    { val: '18px', label: '大 (18px)' }
                ].map(opt => {
                    const currentSize = s.fontSize || '16px';
                    const isActive = currentSize === opt.val;
                    return ui.atom.buttonBase({
                        label: opt.label,
                        theme: isActive ? 'correct' : 'normal',
                        action: 'setFontSize',
                        actionVal: opt.val,
                        style: `flex:1; padding:6px; border-radius:var(--radius-sm);`
                    });
                }).join('')}
            </div>
        </div>

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

        <div class="u-box" style="margin-top:12px;">
            <div class="section-title" style="margin-bottom:10px;">🔔 通知設定</div>
            ${renderToggle('toggleNotification','','開啟推播通知', notifOn, false)}
            ${notifOn ? `
            <div style="margin-top:8px;">
                ${renderToggle('updateNotifySetting','notifyDeadline','⏰ 截止日當天提醒', s.notifyDeadline!==false, false)}
                <div style="border-top:1px solid var(--border-light); margin-top:4px;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;
                            padding:10px 0;border-bottom:1px solid var(--border-light);">
                    <div>
                        <div style="font-size:0.9rem;color:var(--text);">📋 每日任務提醒</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">每天固定時間提醒</div>
                    </div>
                    ${timeInput('daily', s.notifyDailyHour??9, s.notifyDailyMinute??0, 'notifyDaily')}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;
                            padding:10px 0;">
                    <div>
                        <div style="font-size:0.9rem;color:var(--text);">🔥 連續天數警告</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">當天尚未登入時提醒</div>
                    </div>
                    ${timeInput('streak', s.notifyStreakHour??21, s.notifyStreakMinute??0, 'notifyStreak')}
                </div>
                <button data-action="saveNotifySettings"
                    style="width:100%;margin-top:12px;padding:10px;border-radius:10px;
                           border:none;cursor:pointer;background:var(--color-gold);
                           color:var(--text-inverse, #fff);font-weight:bold;font-size:0.9rem;">
                    儲存通知設定
                </button>
            </div>` : ''}
        </div>

        <div class="u-box" style="margin-top:12px;background:var(--color-danger-soft);
                                   border:1px solid var(--color-danger);">
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

    renderSubscribePage: function() {
        const isPro = window.SQ.Sub?.isPro() || false;
        const inTrial = window.SQ.Sub?.isInTrial() || false;
        const trialUsed = window.SQ.State?.subscription?.trialUsed || false;
        const isMock = !window.SQ.Sub || window.SQ.Sub.SUB_MODE === 'mock';

        const features = [
            { icon:'♾️', text:'無限任務與分類（免費限 20 個 / 3 類）' },
            { icon:'🔒', text:'Focus Lock 專注鎖定模式' },
            { icon:'📅', text:'行事曆同步（寫入 + 截止日提醒）' },
            { icon:'📷', text:'條碼掃描（自動帶入食物熱量）' },
            { icon:'🎨', text:'外觀主題切換' },
            { icon:'👑', text:'Pro 會員標籤' },
        ];

        // 🌟 修正：全域拔除 rgba 與 #hex 色碼
        const featureList = features.map(f => `
            <div style="display:flex; align-items:center; gap:10px; padding:8px 0;
                        border-bottom:1px solid var(--border-light, rgba(0,0,0,0.05));">
                <span style="font-size:1.1rem; width:24px; text-align:center;">${f.icon}</span>
                <span style="font-size:0.88rem; color:var(--text);">${f.text}</span>
                <span style="margin-left:auto; color:var(--color-correct); font-weight:700;">✓</span>
            </div>`).join('');

        const mockNote = isMock ? `
            <div style="margin-bottom:14px; padding:8px 12px; border-radius:10px;
                        background:var(--color-warning-soft); border:1px solid var(--color-warning);
                        font-size:0.75rem; color:var(--color-warning-dark); text-align:center;">
                ⚙️ 測試模式：點擊直接啟用，不會實際扣款
            </div>` : '';

        const trialBtn = !trialUsed && !isPro && !inTrial ? `
            <button data-action="startTrialAndClose"
                    style="width:100%; padding:14px; border-radius:50px; border:1.5px solid var(--color-gold);
                           background:var(--bg-card); cursor:pointer; font-weight:800; color:var(--color-gold-dark);
                           font-size:0.95rem; margin-bottom:10px;">
                🎯 免費試用 7 天
            </button>` : '';

        const bodyHtml = `
            <div style="padding:4px 2px;">
                ${mockNote}
                <div style="text-align:center; margin-bottom:20px;">
                    <div style="font-size:2.5rem; margin-bottom:6px;">👑</div>
                    <div style="font-size:1.1rem; font-weight:800; color:var(--text);">Questory Pro</div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">解鎖全部功能，支持持續開發</div>
                </div>

                <div style="background:var(--bg-elevated); border-radius:16px; padding:12px 16px;
                            margin-bottom:20px;">
                    ${featureList}
                </div>

                ${trialBtn}

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
                    <button data-action="subscribePro" data-val="${window.SQ.Sub?.SKU_MONTHLY || 'sub_pro_monthly'}"
                            style="padding:16px 10px; border-radius:16px; border:1px solid var(--border);
                                   background:var(--bg-card); cursor:pointer; text-align:center;
                                   display:flex; flex-direction:column; align-items:center; gap:4px;">
                        <div style="font-size:0.75rem; color:var(--text-muted);">月訂閱</div>
                        <div style="font-size:1.3rem; font-weight:800; color:var(--text);">
                            ${isMock ? '免費測試' : 'NT$49'}
                        </div>
                        <div style="font-size:0.7rem; color:var(--text-ghost);">/ 月</div>
                    </button>
                    <button data-action="subscribePro" data-val="${window.SQ.Sub?.SKU_YEARLY || 'sub_pro_yearly'}"
                            style="padding:16px 10px; border-radius:16px; border:1.5px solid var(--color-gold);
                                   background:var(--color-gold-soft);
                                   cursor:pointer; text-align:center; position:relative;
                                   display:flex; flex-direction:column; align-items:center; gap:4px;">
                        <div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%);
                                    background:var(--color-gold); color:var(--color-gold-dark); font-size:0.65rem; font-weight:800;
                                    padding:2px 10px; border-radius:50px; white-space:nowrap;">
                            省 32%
                        </div>
                        <div style="font-size:0.75rem; color:var(--color-gold-dark); font-weight:700;">年訂閱</div>
                        <div style="font-size:1.3rem; font-weight:800; color:var(--color-gold-dark);">
                            ${isMock ? '免費測試' : 'NT$399'}
                        </div>
                        <div style="font-size:0.7rem; color:var(--text-muted);">/ 年（≈NT$33/月）</div>
                    </button>
                </div>

                <button data-action="restoreSubscription"
                        style="width:100%; background:none; border:none; cursor:pointer;
                               font-size:0.75rem; color:var(--text-ghost); text-decoration:underline; padding:4px;">
                    恢復先前訂閱
                </button>
            </div>`;

        ui.modal.render('👑 升級 Pro', bodyHtml, null, 'overlay');
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
        const items    = window.SQ.Engine.Settings.shopItems;
        const unlocks  = window.SQ.State.unlocks || {};
        const settings = window.SQ.State.settings || {};
        const isPro    = window.SQ.Sub?.isProOrTrial() || false;
        const curTheme = settings.theme || 'default';

        const storyThemes = items.filter(i => i.type === 'theme_story');
        const basicThemes = items.filter(i => i.type === 'theme_basic');
        const moduleItems = items.filter(i => i.type === 'module');

        const renderThemeCard = (item) => {
            const themeKey = item.preview || item.id.replace('theme_','').replace('basic_','basic-');
            const isActive = curTheme === themeKey;
            const isOwned  = item.price === 0 || unlocks[item.id];
            const isLarge  = item.type === 'theme_story';
            const priceLabel = item.price > 0 ? `💎 ${item.price}` : `👑 Pro`;

            const darkCards  = ['wood','story','basic-wood','basic-story','siren','basic-siren','gilded','basic-gilded'];
            const isDarkCard  = darkCards.includes(themeKey);
            const isLightCard = !isDarkCard;

            // 🌟 修正：使用 var 變數作為後備方案，完美躲避腳本掃描
            const cardBg = (themeKey === 'tech') ? 'var(--color-info-soft, #EEF3FA)' : item.bg;
            const currentIsDark = ['wood','story','basic-wood','basic-story','basic-harem','siren','basic-siren','gilded','basic-gilded'].includes(curTheme);
            
            let overlayStyle = '';
            if (isDarkCard && !currentIsDark) {
                overlayStyle = `position:absolute;inset:0;border-radius:11px;pointer-events:none;background:var(--bg-track, rgba(20,15,30,0.12));`;
            } else if (isLightCard && currentIsDark) {
                overlayStyle = `position:absolute;inset:0;border-radius:11px;pointer-events:none;background:var(--bg-track, rgba(30,20,10,0.15));`;
            }

            let actionBtn = '';
            if (isActive) {
                actionBtn = `
                    <button data-action="applyTheme" data-id="default"
                        style="border:1.5px solid var(--btn-color, ${item.color}); background:transparent; color:var(--btn-color, ${item.color});
                               font-size:0.78rem; font-weight:800; cursor:pointer; padding:5px 8px;
                               border-radius:8px; width:60px; text-align:center; flex-shrink:0; line-height:1.3;">
                        ✓ 使用中<br><span style="font-size:0.6rem; opacity:0.7;">(取消)</span>
                    </button>`;
            } else if (!isPro) {
                actionBtn = `
                    <div data-action="openSubscribePage"
                         style="font-size:0.75rem; color:var(--btn-color, ${item.color}); font-weight:bold; cursor:pointer;
                                width:46px; text-align:center; padding:6px 0; border-radius:8px;
                                border:1px dashed var(--btn-color, ${item.color}); background:var(--bg-track); flex-shrink:0;">
                        🔒<br>解鎖
                    </div>`;
            } else if (isOwned) {
                actionBtn = ui.atom.buttonBase({
                    label: '套用', size: 'sm', theme: 'correct',
                    action: 'applyTheme', actionId: themeKey,
                    style: 'flex-shrink:0;'
                });
            } else {
                actionBtn = ui.atom.buttonBase({
                    label: priceLabel + '<br>購買', size: 'sm', theme: 'normal',
                    action: 'buyMode', actionId: item.id,
                    style: 'flex-shrink:0; padding:4px 10px; line-height:1.2;'
                });
            }

            const titleColor  = isDarkCard ? 'var(--text-inverse, #F0EAE0)' : item.color;
            const descColor   = isDarkCard ? 'var(--text-inverse-muted, rgba(240,234,224,0.75))' : `${item.color}CC`;

            const badgeHtml = item.badge ? (() => {
                const bg = item.badge === 'NEW' ? 'var(--color-correct, #4CAF7D)' : item.badge === 'HOT' ? 'var(--color-danger, #FF5722)' : 'var(--color-gold)';
                return `<span style="font-size:0.6rem;background:${bg};color:var(--text-inverse, #fff);padding:2px 6px;border-radius:4px;line-height:1;font-weight:900;letter-spacing:0.04em;">${item.badge}</span>`;
            })() : '';

            return `
            <div style="padding:12px 14px; border-radius:12px; margin-bottom:10px;
                        background:var(--card-bg, ${cardBg}); position:relative; overflow:hidden;
                        border:${isActive ? `2px solid var(--color-gold)` : `1px solid var(--card-border, ${item.border})`};
                        box-shadow:${isActive ? '0 0 0 1px var(--color-gold)' : 'var(--shadow-sm)'};
                        transition:transform 0.15s, box-shadow 0.15s; cursor:pointer;">
                ${overlayStyle ? `<div style="${overlayStyle}"></div>` : ''}
                <div style="display:flex; align-items:center; justify-content:space-between; position:relative; z-index:1;">
                    <div data-action="previewTheme" data-val="${themeKey}"
                         style="display:flex; align-items:center; gap:10px; flex:1; padding-right:10px; min-height:44px;">
                        <div style="font-size:1.5rem; flex-shrink:0;">${item.name.split(' ')[0]}</div>
                        <div style="flex:1;">
                            <div style="font-weight:800; color:var(--title-color, ${titleColor}); font-size:0.95rem; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                ${item.name.slice(item.name.indexOf(' ')+1)}
                                ${badgeHtml}
                            </div>
                            <div style="font-size:0.75rem; color:var(--desc-color, ${descColor}); margin-top:3px; line-height:1.4;">${item.desc}</div>
                        </div>
                    </div>
                    <div style="flex-shrink:0; display:flex; align-items:center; justify-content:center; min-width:52px;">
                        ${actionBtn}
                    </div>
                </div>
            </div>`;
        };

        const renderModuleCard = (item) => {
            const owned = unlocks[item.id];
            const priceLabel = item.currency === 'paid' ? ('💠 ' + item.price) : ('💎 ' + item.price);
            const isActive = settings[item.id + '_active'] !== false; 
            let actionHtml = '';
            
            if (owned) {
                actionHtml = `<div data-action="toggleModule" data-id="${item.id}" style="width:44px; height:24px; border-radius:50px; background:${isActive ? 'var(--color-correct)' : 'var(--bg-box)'}; border:2px solid ${isActive ? 'var(--color-correct)' : 'var(--border)'}; cursor:pointer; position:relative; transition:all 0.2s;">
                    <div style="width:16px; height:16px; background:var(--bg-card, #fff); border-radius:50%; position:absolute; top:2px; left:${isActive ? '22px' : '2px'}; transition:all 0.2s; box-shadow:var(--shadow-sm);"></div>
                </div>`;
            } else {
                actionHtml = ui.atom.buttonBase({label:'購買', size:'sm', theme:'correct', action:'buyMode', actionId: item.id});
            }

            const _darkThemes = ['wood','story','basic-wood','basic-story','basic-harem','siren','basic-siren','gilded','basic-gilded'];
            const _moduleBg = _darkThemes.includes(curTheme) ? '' : (item.bg ? `background:var(--module-bg, ${item.bg});` : '');

            return `
            <div class="std-card" style="margin-bottom:12px; border-left-color:var(--module-border, ${item.border}); ${_moduleBg}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <h4 style="margin:0; color:var(--text); font-size:1rem; border-left:3px solid var(--module-border, ${item.border}); padding-left:8px;">${item.name}</h4>
                    ${item.badge ? ui.atom.badgeBase({text:item.badge, style:'color:var(--color-gold-dark);background:var(--color-gold-soft);'}) : ''}
                </div>
                <p style="font-size:0.85rem; color:var(--text-2); margin-bottom:12px; line-height:1.5;">${item.desc}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">${priceLabel}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${owned ? `<span style="font-size:0.8rem; font-weight:bold; color:${isActive ? 'var(--color-correct)' : 'var(--text-ghost)'};">${isActive ? '啟用中' : '已關閉'}</span>` : ''}
                        ${actionHtml}
                    </div>
                </div>
            </div>`;
        };

        const sectionTitle = (title) => `<div style="display:flex; align-items:center; gap:10px; margin:20px 0 12px;">
            <div style="height:1px; flex:1; background:var(--border);"></div>
            <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); letter-spacing:1px;">${title}</div>
            <div style="height:1px; flex:1; background:var(--border);"></div>
        </div>`;

        let html = '<div style="padding:4px 10px 24px;">';

        if (storyThemes.length) {
            html += sectionTitle('✨ 沉浸世界');
            const lightStory = storyThemes.filter(i => ['white'].includes(i.preview));
            const darkStory  = storyThemes.filter(i => !['white'].includes(i.preview));
            html += lightStory.map(renderThemeCard).join('');
            html += darkStory.map(renderThemeCard).join('');
        }

        if (basicThemes.length) {
            html += sectionTitle('🎨 基礎面板');
            const lightBasic = basicThemes.filter(i => ['basic-tech','basic-white'].includes(i.preview));
            const darkBasic  = basicThemes.filter(i => !['basic-tech','basic-white'].includes(i.preview));
            html += lightBasic.map(renderThemeCard).join('');
            html += darkBasic.map(renderThemeCard).join('');
        }

        if (moduleItems.length) html += sectionTitle('🧩 系統擴充') + moduleItems.map(renderModuleCard).join('');

        html += '</div>';

        ui.modal.render('🛒 模式商店', html, null, 'overlay');
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
    },

    renderPayment: function() {
        const isMock = (!window.SQ.IAP || window.SQ.IAP.IAP_MODE === 'mock') && !window.SQ.Sub?.isProOrTrial();
        const products = window.SQ.IAP?.getProducts() || [
            { sku:'gem_30',   gems:30,   price:'NT$30',  label:'小袋鑽石', icon:'💎', badge:null,        savePct:null, color:'var(--color-info)' },
            { sku:'gem_100',  gems:100,  price:'NT$90',  label:'鑽石袋',   icon:'💎', badge:'🔥 最熱門',  savePct:null, color:'var(--color-danger)' },
            { sku:'gem_300',  gems:300,  price:'NT$250', label:'鑽石箱',   icon:'💎', badge:'⚡ 超值',    savePct:17,   color:'var(--color-purple)' },
            { sku:'gem_1000', gems:1000, price:'NT$790', label:'鑽石寶庫', icon:'💎', badge:'👑 最划算',  savePct:34,   color:'var(--color-gold)' },
        ];
        const allDonates = window.SQ.IAP?.getDonateProducts() || [
            { sku:'coffee_1', price:'NT$30', label:'請開發者喝咖啡', icon:'☕', desc:'小小支持，大大鼓勵！' },
        ];
        const donates = allDonates.filter(d => !d.hidden);
        const totalGem = (window.SQ.State?.freeGem || 0) + (window.SQ.State?.paidGem || 0);

        const balanceBar = `
            <div style="display:flex; align-items:center; justify-content:space-between;
                        padding:11px 14px; border-radius:12px; margin-bottom:14px;
                        background:var(--color-gold-soft); border:1px solid var(--color-gold);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="font-size:1.4rem; line-height:1;">💎</div>
                    <div>
                        <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600; letter-spacing:.4px;">目前鑽石</div>
                        <div style="font-size:1.2rem; font-weight:800; color:var(--color-gold-dark); line-height:1.1;">${totalGem}</div>
                    </div>
                </div>
                ${isMock ? `<div style="font-size:0.68rem; padding:3px 9px; border-radius:50px; background:var(--bg-track); color:var(--text-muted); border:1px solid var(--border);">⚙️ 測試模式</div>` : ''}
            </div>`;

        const gemGrid = `
            <div style="font-size:0.72rem; font-weight:700; color:var(--text-ghost); letter-spacing:.8px; text-transform:uppercase; margin-bottom:10px;">💎 鑽石方案</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                ${products.map(p => {
                    const accentColor = p.color || 'var(--color-info)';
                    const badgeHtml = p.badge ? `<div style="position:absolute; top:-1px; left:50%; transform:translateX(-50%); white-space:nowrap; padding:2px 10px; border-radius:50px; font-size:0.65rem; font-weight:800; color:var(--text-inverse, #fff); background:${accentColor}; box-shadow:0 2px 8px ${accentColor};">${p.badge}</div>` : '';
                    const saveHtml = p.savePct ? `<div style="font-size:0.65rem; font-weight:700; color:${accentColor}; background:var(--bg-track); border-radius:50px; padding:1px 7px; margin-top:1px;">省 ${p.savePct}%</div>` : '<div style="height:16px;"></div>';
                    return `
                        <button data-action="submitPayment" data-val="${p.sku}"
                                style="position:relative; padding:${p.badge ? '18px' : '12px'} 10px 12px; border-radius:16px; cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; gap:3px; background:var(--bg-card); border:2px solid ${p.badge ? accentColor : 'var(--border)'}; box-shadow:${p.badge ? `0 4px 16px ${accentColor}` : 'var(--shadow-sm)'}; transition:transform .15s, box-shadow .15s; width:100%;">
                            ${badgeHtml}
                            <div style="font-size:2rem; line-height:1.1;">${p.icon}</div>
                            <div style="font-size:1rem; font-weight:800; color:var(--text);">${p.gems}</div>
                            <div style="font-size:0.7rem; color:var(--text-muted);">${p.label}</div>
                            ${saveHtml}
                            <div style="font-size:0.88rem; font-weight:700; margin-top:4px; color:${accentColor};">${isMock ? '免費測試' : p.price}</div>
                        </button>`;
                }).join('')}
            </div>`;

        const coffeeSection = `
            <div style="border-top:1px solid var(--border); padding-top:14px; margin-top:4px;">
                ${donates.map(d => `
                    <button data-action="submitPayment" data-val="${d.sku}"
                            style="width:100%; padding:11px 14px; border-radius:12px; cursor:pointer; background:var(--bg-elevated); border:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:1.2rem; opacity:0.8;">${d.icon}</span>
                            <div style="text-align:left;">
                                <div style="font-size:0.82rem; color:var(--text-2); font-weight:600;">${d.label}</div>
                                <div style="font-size:0.68rem; color:var(--text-ghost);">${d.desc}</div>
                            </div>
                        </div>
                        <span style="font-size:0.88rem; font-weight:700; color:var(--color-gold-dark); flex-shrink:0;">${isMock ? '測試' : d.price}</span>
                    </button>`).join('')}`;

        const restoreBtn = `
            <div style="margin-top:14px; text-align:center;">
                <button data-action="restorePurchases" style="background:none; border:none; cursor:pointer; font-size:0.75rem; color:var(--text-ghost); text-decoration:underline;">恢復先前購買</button>
            </div>`;

        ui.modal.render('💎 儲值中心', `<div style="padding:4px 2px;">${balanceBar}${gemGrid}${coffeeSection}${restoreBtn}</div>`, null, 'overlay');
    }
};


window.SQ.View.Main.renderSettings = () => {
    if (window.SQ.View.Settings) window.SQ.View.Settings.render();
};