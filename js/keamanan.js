// keamanan.js
// Fungsi untuk mengirim log ke Telegram

const TELEGRAM_BOT_TOKEN = '8481319777:AAE-gUzAwTmZDs528QnUg1Lokiw5Vws7nyI'; // <-- Ganti dengan API key dari BotFather
const TELEGRAM_CHAT_ID = '7351202102'; // <-- Ganti dengan chat ID kamu (bisa ke kamu sendiri atau grup)

// Fungsi untuk mengirim pesan ke Telegram
async function kirimLogKeTelegram(pesan) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = {
        chat_id: TELEGRAM_CHAT_ID,
        text: pesan,
        parse_mode: 'HTML'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.warn('Gagal mengirim log ke Telegram:', response.statusText);
        }
    } catch (error) {
        console.error('Error saat mengirim log Telegram:', error);
    }
}

// Fungsi untuk log permintaan AI
function logPermintaanAI(userInput, timestamp = new Date().toISOString()) {
    const pesan = `
🔐 <b>Log Permintaan AI</b>
📅 Waktu: ${timestamp}
👤 User: ${localStorage.getItem('username') || 'Tidak dikenal'}
💬 Input: <code>${userInput}</code>
    `.trim();

    kirimLogKeTelegram(pesan);
}

// Fungsi untuk log error (opsional)
function logErrorAI(errorMessage) {
    const pesan = `
⚠️ <b>Error AI Terdeteksi</b>
📅 Waktu: ${new Date().toISOString()}
❌ Error: <code>${errorMessage}</code>
    `.trim();

    kirimLogKeTelegram(pesan);
}
