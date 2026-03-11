window.SQ.View.Main = window.SQ.View.Main || {};

window.SQ.View.Main.renderquickNoteModal = function(defaultText = '') {
    const helpText = `
    <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px; background:var(--bg-box); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div><b style="color:var(--text);">/</b> 標題 (例如: /買晚餐)</div>
        <div><b style="color:var(--text);">**</b> 備註 (例如: **要去巷口那家)</div>
        <div><b style="color:var(--text);">1.</b> 子任務 (例如: 1.領錢)</div>
		<div><b style="color:var(--text);"></b>💡若不小心關閉生成任務視窗不必擔心，系統會貼心地幫您自動備份草稿~</div>
	</div>`;

    const bodyHtml = `
        ${helpText}
        <textarea id="quick-input" class="inp" placeholder="在此輸入隨手記..." 
            style="width:100%; height:200px; resize:none;">${defaultText}</textarea>
    `;

    // [V50] 使用純淨的 data-action，不夾帶 DOM 查詢程式碼
    const footHtml = `
        <div style="display:flex; gap:10px; width:100%;">
            ${ui.atom.buttonBase({ label: '🚀 生成任務', theme: 'ghost', style: 'flex:1;', action: "transferToTask" })}
            ${ui.atom.buttonBase({ label: '💾 儲存', theme: 'correct', style: 'flex:2;', action: "saveQuickDraft" })}
        </div>
    `;

    ui.modal.render('📝 隨手記', bodyHtml, footHtml, 'panel');
};