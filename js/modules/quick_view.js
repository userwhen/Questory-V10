/* js/modules/quick_view.js - V43.0 Pure Architecture Upgrade */
window.view = window.view || {};

window.view.renderquickNoteModal = function(defaultText = '') {
    
    const helpText = `
    <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px; background:var(--bg-box); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div><b style="color:var(--text);">/</b> 標題 (例如: /買晚餐)</div>
        <div><b style="color:var(--text);">**</b> 備註 (例如: **要去巷口那家)</div>
        <div><b style="color:var(--text);">1.</b> 子任務 (例如: 1.領錢)</div>
    </div>`;

    // [V43] 改用 ui.atom.inputBase
    const bodyHtml = `
        ${helpText}
        ${ui.atom.inputBase({
            type: 'textarea', 
            id: 'quick-input', 
            val: defaultText, 
            placeholder: '在此輸入隨手記...', 
            style: 'width:100%; height:200px; resize:none;'
        })}
    `;

    // [V43] 放棄 footRow 的參數魔法，直接用乾淨的 flex 排版與 atom 按鈕
    const footHtml = `
        <div style="display:flex; gap:10px; width:100%;">
            ${ui.atom.buttonBase({
                label: '🚀 生成任務', theme: 'ghost', style: 'flex:1;', 
                action: "act.transferToTask(document.getElementById('quick-input').value)"
            })}
            ${ui.atom.buttonBase({
                label: '💾 儲存', theme: 'correct', style: 'flex:2;', 
                action: "act.saveQuickDraft(document.getElementById('quick-input').value)"
            })}
        </div>
    `;

    ui.modal.render('📝 隨手記', bodyHtml, footHtml, 'panel');
};