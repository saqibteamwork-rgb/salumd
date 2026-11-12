'use strict';

const fs = require('fs');
const path = require('path');
const settings = require('../settings');

async function ownerCommand(sock, from, msg) {
    const rawNumber = settings.ownerNumber && !settings.ownerNumber.includes('nmbr') && !settings.ownerNumber.includes('HERE')
        ? settings.ownerNumber.replace(/[^0-9]/g, '')
        : '923468616487';

    const formattedNumber = rawNumber.length >= 10 
        ? `+${rawNumber.slice(0, 2)} ${rawNumber.slice(2, 5)} ${rawNumber.slice(5)}`
        : `+${rawNumber}`;

    const websiteUrl = settings.websiteUrl || 'https://mrsaqib.me';
    const googleSearchUrl = 'https://www.google.com/search?q=mr+saqib';

    const ownerText =
`╭━━━〔 👑 *SALU — DEVELOPER* 〕━━━┈⊷
┃ 👤 *Name:* SALU
┃ 🎂 *Age:* 17 Years Old
┃ 📍 *City:* Faisalabad, Pakistan 🇵🇰
┃ 💻 *Role:* Cyber Security & Full-Stack Dev
┃ 🤖 *Engine:* ${settings.botName} · v2.0 Premium
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

⚡ *DIRECT ACTIONS (TAP TO OPEN)* ⚡

🌐 *Official Website:*
${websiteUrl}

💬 *Direct WhatsApp Chat:*
https://wa.me/${rawNumber}

📱 *Contact Number:*
${formattedNumber}

↩ *Main Commands Menu:*
.menu

───────────────────────
🚀 *Crafted with ❤️ by SALU*`;

    const channelContext = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: settings.newsletterJid || '120363421389121979@newsletter',
            newsletterName: settings.botName || 'SALU MD',
            serverMessageId: 1
        }
    };

    let imagePayload = null;
    if (settings.menuImage && settings.menuImage.trim() !== '') {
        const trimmed = settings.menuImage.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            imagePayload = { url: trimmed };
        } else if (fs.existsSync(trimmed)) {
            imagePayload = fs.readFileSync(trimmed);
        }
    }
    if (!imagePayload) {
        const localImgPath = path.join(__dirname, '..', 'data', 'mrsaqib_preview.png');
        if (fs.existsSync(localImgPath)) {
            try { imagePayload = fs.readFileSync(localImgPath); } catch {}
        }
    }

    try {
        if (imagePayload) {
            await sock.sendMessage(from, { image: imagePayload, caption: ownerText, contextInfo: channelContext }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: ownerText, contextInfo: channelContext }, { quoted: msg });
        }
    } catch (err) {
        console.error('[ownerCommand] Send failed:', err.message);
        await sock.sendMessage(from, { text: ownerText }, { quoted: msg }).catch(() => {});
    }
}

module.exports = ownerCommand;
