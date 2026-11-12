'use strict';

/**
 * SALU MD :: Credit Card Generator & BIN Checker
 * ============================================================================
 * Commands: .gencc / .gen / .bin
 * Usage:
 *   .gencc 523938|10|2026
 *   .gencc 523938
 * ============================================================================
 */

const axios = require('axios');
const settings = require('../settings');

function toSansBold(str) {
    return String(str || '').replace(/[A-Za-z0-9]/g, c => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + code - 48);
        return c;
    });
}

async function genccCommand(sock, from, msg, args = []) {
    const text = args.join(' ').trim();
    if (!text) {
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('CREDIT CARD GENERATOR')} ⚡ 〕━━━┈⊷
┃ 💳 *Usage:* BIN number likhein:
┃
┃ 👉 *.gencc 523938|10|2026*
┃ 👉 *.gencc 453590*
┃
┃ ⚠️ *Note:* For testing & development purposes only!
┃ 🛡️ *Powered by SALU MD*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '💳', key: msg.key } }).catch(() => {});

    try {
        const binInput = encodeURIComponent(text);
        const apiUrl = `https://fam-official.serv00.net/api/ccgen.php?bin=${binInput}&count=10`;

        const response = await axios.get(apiUrl, { timeout: 20000 });
        const data = response.data;

        if (!Array.isArray(data) || !data.length) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: "❌ *Cards generate nahi huay!* Baraye meharbani durust BIN enter karein."
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        let cardText =
`╭━━━〔 ⚡ ${toSansBold('CREDIT CARD GENERATOR')} ⚡ 〕━━━┈⊷
┃ 🔢 *BIN:* \`${text}\`
┃ 📊 *Count:* ${data.length}
┃ 👑 *Bot:* ${toSansBold(settings.botName || 'SALU MD')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        data.forEach((cc, idx) => {
            cardText += `\`${cc}\`\n`;
        });

        cardText += `\n💡 *1-Tap Copy:* Kisi bhi line par tap kar ke copy karein!\n⚡ *Powered by SALU MD*`;

        await sock.sendMessage(from, { text: cardText }, { quoted: msg });

    } catch (err) {
        console.error('[GenCC Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *CC Generation Failed:*\n_${err.message}_`
        }, { quoted: msg });
    }
}

module.exports = {
    genccCommand
};
