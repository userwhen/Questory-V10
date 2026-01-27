/* js/modules/quick_view.js */
// 確保 view 物件存在
window.view = window.view || {};

// [修正] 必須使用 "賦值" (=) 的寫法，不能用冒號 (:)
// [修正] 依照您的要求，這裡改為小寫 q (renderquickNoteModal)
window.view.renderquickNoteModal = function(defaultText = '') {
    
    const helpText = `
    <div style="font-size:0.8rem; color:#888; margin-bottom:10px; background:#f5f5f5; padding:8px; border-radius:8px;">
        <div><b>/</b> 標題 (例如: /買晚餐)</div>
        <div><b>**</b> 備註 (例如: **要去巷口那家)</div>
        <div><b>1.</b> 子任務 (例如: 1.領錢)</div>
    </div>`;

    const bodyHtml = `
        ${helpText}
        <textarea id="quick-input" placeholder="在此輸入隨手記..." 
            style="width:100%; height:200px; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:1rem; resize:none; font-family:inherit; box-sizing:border-box;">${defaultText}</textarea>
    `;

    // [修正] 按鈕位置對調：生成在左，儲存在右
    const footHtml = `
        <div style="display:flex; gap:10px; width:100%;">
            ${ui.component.btn({
                label: '🚀 生成任務', 
                theme: 'normal', // 次要動作
                style: 'flex:1;', 
                action: "act.transferToTask(document.getElementById('quick-input').value)"
            })}
            ${ui.component.btn({
                label: '💾 儲存', 
                theme: 'correct', // 主要/預設動作 (綠色)
                style: 'flex:1;', 
                action: "act.saveQuickDraft(document.getElementById('quick-input').value)"
            })}
        </div>
    `;

    // 呼叫底層 modal 渲染
    ui.modal.render('📝 隨手記', bodyHtml, footHtml, 'quick');

}; // <--- 這裡原本可能少了分號或大括號