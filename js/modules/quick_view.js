/* js/modules/quick_view.js - V42.0 UI System Upgrade */
window.view = window.view || {};

window.view.renderquickNoteModal = function(defaultText = '') {
    
    const helpText = `
    <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px; background:var(--bg-box); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div><b style="color:var(--text);">/</b> 標題 (例如: /買晚餐)</div>
        <div><b style="color:var(--text);">**</b> 備註 (例如: **要去巷口那家)</div>
        <div><b style="color:var(--text);">1.</b> 子任務 (例如: 1.領錢)</div>
    </div>`;

    const bodyHtml = `
        ${helpText}
        <textarea id="quick-input" class="inp" placeholder="在此輸入隨手記..." 
            style="width:100%; height:200px; resize:none;">${defaultText}</textarea>
    `;

    // 使用共用的底部按鈕列
    const footHtml = ui.modal.footRow(
        "act.transferToTask(document.getElementById('quick-input').value)",
        "act.saveQuickDraft(document.getElementById('quick-input').value)",
        "💾 儲存", "correct"
    ).replace('取消', '🚀 生成任務'); // 運用小技巧覆蓋左側按鈕文字與行為

    ui.modal.render('📝 隨手記', bodyHtml, footHtml, 'panel');
};