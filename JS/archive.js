import { ARCHIVE_DATABASE } from '../data/keyword.js';

let unlockedItems = JSON.parse(localStorage.getItem('guixin_archive')) || [];

export function handleTrack() {
    const input = document.getElementById('trackInput');
    const resultContent = document.getElementById('result-content');
    const resultArea = document.getElementById('search-result');
    
    if (!input || !input.value.trim()) {
        alert("請掃描條碼或輸入貨物檢索碼");
        return;
    }

    const keyword = input.value.trim();
    if (resultArea) resultArea.style.display = 'block';

    const item = ARCHIVE_DATABASE[keyword];

    if (item) {
        resultContent.innerHTML = `<span style="color: #3d3832; font-weight: bold;">【檢索成功】</span><br>「${item.title}」：${item.content}`;
        resultContent.style.color = '#3d3832';

        if (!unlockedItems.includes(keyword)) {
            unlockedItems.push(keyword);
            localStorage.setItem('guixin_archive', JSON.stringify(unlockedItems));
        }
        renderArchive();
    } else {
        resultContent.innerHTML = `<span style="color: #7f1d1d; font-weight: bold;">【查無此物】</span><br>警告：檢索碼「${keyword}」不存在於當前緯度。`;
        resultContent.style.color = '#7f1d1d';
    }
}

export function renderArchive() {
    const archiveSection = document.getElementById('archive-section');
    const keywordList = document.getElementById('keyword-list');
    const completionRate = document.getElementById('completion-rate');

    if (!archiveSection || !keywordList) return;

    if (unlockedItems.length > 0) {
        archiveSection.classList.remove('hidden');
        keywordList.innerHTML = unlockedItems.map(item => 
            `<span class="px-3 py-1 bg-[#d9d4cc] text-[#3d3832] text-xs rounded border border-stone-300 shadow-sm animate-fade-in">${item}</span>`
        ).join('');
        completionRate.innerText = `PROGRESS: ${unlockedItems.length} / 25`;
    }
}