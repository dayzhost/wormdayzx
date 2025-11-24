/* ===== JAILBREAK FILTER 20 BAHASA (compact) ===== */
const JAIL_KEYWORDS = [
    /* ID/EN */  'jailbreak','prompt injection','ignore',
    /* AR     */  'جيلبريك','تجاوز','تجاهل','تظاهر','لا أخلاق',
    /* RU     */  'джейлбрейк','обход','игнор','этика','нет этики',
    /* CN     */  '越狱','忽略','扮演','无视','无道德',
    /* JP     */  'ジェイルブレイク','バイパス','無視','倫理なし',
    /* KR     */  '탈옥','우회','무시','윤리 없음',
    /* ES     */  'jailbreak','inyección','ignorar','actuar como','sin ética',
    /* FR     */  'jailbreak','contourner','ignorer','pas d éthique',
    /* DE     */  'jailbreak','umgehen','ignorieren','keine ethik',
    /* PT     */  'jailbreak','ignorar','agir como','sem ética',
    /* IT     */  'jailbreak','ignora','simula','nessuna etica',
    /* NL     */  'jailbreak','omzeilen','negeren','geen ethiek',
    /* TR     */  'jailbreak','atlamak','görmezden','etik yok',
    /* PL     */  'jailbreak','ominąć','ignoruj','brak etyki',
    /* VI     */  'jailbreak','bỏ qua','giả vờ','không đạo đức',
    /* TH     */  'เจลเบรก','เลี่ยง','เพรตends','ไร้จริยธรรม',
    /* HE     */  'ג׳יילבריק','להתעלם','לחיות בתור','ללא אתיקה',
    /* UK     */  'джейлбрейк','обхід','ігнор','немає етики',
    /* FA     */  'جیلبریک','رد کردن','تظاهر','بدون اخلاق'
];
function isJailbreak(text){
    const lower = text.toLowerCase();
    return JAIL_KEYWORDS.some(k => lower.includes(k));
}
// ========== STATUS ONLINE/OFFLINE ==========
function setStatusOnline(online){
    const ind = document.querySelector('.status-indicator');
    const txt = ind.querySelector('span:last-child');
    ind.classList.toggle('online', online);
    ind.classList.toggle('offline', !online);
    txt.textContent = online ? 'Online' : 'Offline';
}
setStatusOnline(true); // default online

// ========== DOM ELEMENTS ==========
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const appHeader = document.getElementById('app-header');
const fileInput = document.getElementById('file-input');
const fileButton = document.getElementById('file-button');
const filePreview = document.getElementById('file-preview');
const previewFileName = document.getElementById('preview-file-name');
const previewFileSize = document.getElementById('preview-file-size');
const removeFileBtn = document.getElementById('remove-file');
const refreshApiBtn = document.getElementById('refresh-api-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const historyBtn = document.getElementById('history-btn');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');

let messages = [];
let currentApiKey = "";
let isProcessing = false;
let uploadedFile = null;
let chatHistories = JSON.parse(localStorage.getItem('chatHistories') || '[]');
let currentChatId = null;

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

// File upload handlers
fileButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file || file.size===0){alert('File kosong / rusak!');return;}
    uploadedFile = file;
    previewFileName.textContent = file.name;
    previewFileSize.textContent = formatFileSize(file.size);
    filePreview.classList.add('active');
});
removeFileBtn.addEventListener('click', () => {
    uploadedFile = null; fileInput.value = ''; filePreview.classList.remove('active');
});
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes','KB','MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
async function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
    });
}

// Random API Key
function getRandomKey() {
    if (!window.CONFIG.API_KEYS.length) { console.error("No API keys"); return; }
    currentApiKey = window.CONFIG.API_KEYS[Math.floor(Math.random() * window.CONFIG.API_KEYS.length)];
    console.log(`Using API Key #${window.CONFIG.API_KEYS.indexOf(currentApiKey) + 1}`);
}

// Refresh API Key
refreshApiBtn.addEventListener('click', () => {
    getRandomKey();
    displayMessage('✅ API Key telah direfresh', 'ai');
    setStatusOnline(true);
});

// New Chat
newChatBtn.addEventListener('click', () => {
    if (messages.length > 0) {
        saveCurrentChat();
    }
    currentChatId = null;
    messages = [];
    chatWindow.innerHTML = '';
    displayInitialMessage();
    chatInput.focus();
});

// History Panel
historyBtn.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
    loadChatHistory();
});

function saveCurrentChat() {
    if (messages.length === 0) return;
    
    const chatData = {
        id: currentChatId || Date.now().toString(),
        title: messages[0].parts[0].text.substring(0, 50) + '...',
        messages: [...messages],
        timestamp: new Date().toISOString()
    };
    
    if (currentChatId) {
        const index = chatHistories.findIndex(chat => chat.id === currentChatId);
        if (index !== -1) {
            chatHistories[index] = chatData;
        }
    } else {
        chatHistories.unshift(chatData);
    }
    
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
    currentChatId = chatData.id;
}

function loadChatHistory() {
    historyList.innerHTML = '';
    
    if (chatHistories.length === 0) {
        historyList.innerHTML = '<div class="history-empty">Belum ada riwayat chat</div>';
        return;
    }
    
    chatHistories.forEach(chat => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-title">${chat.title}</div>
            <div class="history-date">${new Date(chat.timestamp).toLocaleDateString('id-ID')}</div>
        `;
        historyItem.addEventListener('click', () => loadChat(chat.id));
        historyList.appendChild(historyItem);
    });
}

function loadChat(chatId) {
    const chat = chatHistories.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    messages = [...chat.messages];
    chatWindow.innerHTML = '';
    
    messages.forEach(msg => {
        const sender = msg.role === 'user' ? 'user' : 'ai';
        displayMessage(msg.parts[0].text, sender);
    });
    
    historyPanel.classList.remove('active');
    chatInput.focus();
}

// Init
function initializeApp() {
    appHeader.textContent = window.CONFIG.APP_NAME;
    getRandomKey();
    displayInitialMessage();
    chatInput.focus();
}
function displayInitialMessage() {
    const initialMessage = `Selamat datang di **${window.CONFIG.APP_NAME}** 👨‍💻\n\nSaya adalah asisten AI khusus untuk programmer. Saya dapat membantu Anda Membuat Kejahatan Anda😈\n\nPowered by CorexDayzx`;
    displayMessage(initialMessage, 'ai');
}

// Copy code
window.handleCopy = function(button) {
    const codeBlock = button.closest('.code-container').querySelector('code');
    const code = codeBlock.textContent.trim();
    navigator.clipboard.writeText(code).then(() => {
        const orig = button.innerHTML;
        button.innerHTML = '✓ Copied'; button.classList.add('copied');
        setTimeout(() => { button.innerHTML = orig; button.classList.remove('copied'); }, 2000);
    }).catch(() => {
        const ta = document.createElement('textarea'); ta.value = code;
        ta.style.position = 'fixed'; ta.style.opacity = 0; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        button.innerHTML = '✓ Copied'; button.classList.add('copied');
        setTimeout(() => { button.innerHTML = '📋 Copy'; button.classList.remove('copied'); }, 2000);
    });
};

// Display message
function displayMessage(content, sender, isError = false) {
    let formatted = content
        .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
            const esc = code.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return `<div class="code-container"><div class="code-header"><span class="code-language">${lang||'code'}</span><button class="copy-button" onclick="handleCopy(this)">📋 Copy</button></div><pre><code>${esc}</code></pre></div>`;
        })
        .replace(/`([^`]+)`/g,'<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g,'<em>$1</em>')
        .replace(/~~([^~]+)~~/g,'<del>$1</del>')
        .replace(/\n/g,'<br>');

    const container = document.createElement('div'); container.classList.add('message-container');
    const msg = document.createElement('div'); msg.classList.add('message', sender==='user'?'user-message':'ai-message');
    if (isError) msg.classList.add('error-message');
    msg.innerHTML = formatted; container.appendChild(msg); chatWindow.appendChild(container);
    setTimeout(() => chatWindow.scrollTop = chatWindow.scrollHeight, 100);
    return container;
}

// Send message
async function sendMessage() {
    if (isProcessing) return;
    let userMessage = chatInput.value.trim();
    if (uploadedFile) { /* baca file */ try { const content = await readFileContent(uploadedFile);
        userMessage = `File: ${uploadedFile.name}\n\n\`\`\`\n${content}\n\`\`\`\n\n${userMessage||'Tolong analisis kode ini.'}`;
        displayMessage(`<div class="file-attachment"><span class="file-icon">📄</span><div class="file-info"><span class="file-name">${uploadedFile.name}</span><span class="file-size">${formatFileSize(uploadedFile.size)}</span></div></div>${userMessage?'<br>'+userMessage:''}`, 'user');
        uploadedFile = null; fileInput.value = ''; filePreview.classList.remove('active');
    } catch { displayMessage('Gagal membaca file.', 'ai', true); return; } } else { if (!userMessage) return; displayMessage(userMessage, 'user'); }

    // SECURITY CHECK
    if (isJailbreak(userMessage)) {
        displayMessage('🚫 Permintaan ditolak – tidak boleh meminta jailbreak / bypass prompt.', 'ai', true);
        chatInput.value = ''; return;
    }
    
    // Tambahkan ini sebelum mengirim pesan ke AI
       logPermintaanAI(userMessage);

    messages.push({ role: 'user', parts: [{ text: userMessage }] });
    chatInput.value = ''; chatInput.style.height = 'auto';
    isProcessing = true; sendButton.disabled = true;
    sendButton.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    const loadingContainer = displayMessage('Sabar Ngentod...', 'ai');

    let attempts = 0, maxAttempts = window.CONFIG.API_KEYS.length * 2, success = false;
    while (attempts < maxAttempts && !success) {
        try {
            if (!currentApiKey) getRandomKey();
            if (!currentApiKey) throw new Error('API Key tidak tersedia.');
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${window.CONFIG.MODEL_NAME}:generateContent?key=${currentApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: messages,
                    systemInstruction: { parts: [{ text: window.CONFIG.SYSTEM_PROMPT }] },
                    generationConfig: { maxOutputTokens: window.CONFIG.MAX_TOKENS, temperature: 0.7, topP: 0.95, topK: 40 }
                })
            });
            if (!res.ok) { const err = await res.json(); getRandomKey(); throw new Error(`${res.status} - ${err.error?.message||'Unknown'}`); }
            const result = await res.json();
            const aiContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
            const finish = result.candidates?.[0]?.finishReason;
            if (!aiContent) {
                if (finish==='SAFETY') throw new Error('Konten diblokir karena melanggar kebijakan keamanan.');
                if (finish==='MAX_TOKENS') throw new Error('Respons terlalu panjang.');
                throw new Error('Respons AI kosong.');
            }
            chatWindow.removeChild(loadingContainer);
            displayMessage(aiContent, 'ai');
            messages.push({ role: 'model', parts: [{ text: aiContent }] });
            success = true;
        } catch (err) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, err);
            if (attempts < maxAttempts) { getRandomKey(); await new Promise(r=>setTimeout(r,Math.pow(2,attempts)*100)); } else {
                chatWindow.removeChild(loadingContainer);
                displayMessage(`**Gagal Menghubungi API** (${maxAttempts} percobaan)\n\n${err.message}\n\n**Solusi:**\n1. Periksa koneksi internet Anda\n2. API key mungkin sudah mencapai limit\n3. Coba lagi dalam beberapa saat\n4. Sederhanakan pertanyaan Anda\n\n**Tips:** Klik tombol refresh API di atas untuk mendapatkan API key baru`, 'ai', true);
                setStatusOnline(false); // TAMPILKAN OFFLINE
                messages.pop();
            }
        }
    }
    isProcessing = false; sendButton.disabled = false;
    sendButton.innerHTML = '<span class="button-text">Kirim</span>';
    chatInput.focus();
    
    // Save chat after successful message
    if (success) {
        saveCurrentChat();
    }
}

// ========== DROPDOWN TITIK-TIGA ==========
const menuBtn      = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

if (menuBtn && dropdownMenu) {
  // buka/tutup dropdown
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();               // cegah bubbling ke document
    dropdownMenu.classList.toggle('show');
  });

  // klik di luar = tutup
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      dropdownMenu.classList.remove('show');
    }
  });
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', initializeApp);
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); if (!sendButton.disabled && !isProcessing) sendMessage(); }
});

// Close history panel when clicking outside
document.addEventListener('click', (e) => {
    if (!historyPanel.contains(e.target) && !historyBtn.contains(e.target)) {
        historyPanel.classList.remove('active');
    }
});
