'use strict';

/**
 * SALU MD :: Truecaller Caller ID Lookup
 * ============================================================================
 * Commands: .tc / .truecaller / .callerid
 * Usage:
 *   .tc 03367402299
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

async function truecallerCommand(sock, from, msg, args = []) {
    const text = args.join(' ').trim();
    if (!text) {
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('TRUECALLER CALLER ID')} ⚡ 〕━━━┈⊷
┃ 📞 *Usage:* Kisi number ka caller name check karein:
┃
┃ 👉 *.tc 03367402299*
┃ 👉 *.truecaller +923367402299*
┃
┃ 🛡️ *Powered by SALU MD*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    let digits = text.replace(/\D/g, '');
    let tcPhone = '';
    if (digits.startsWith('0092')) {
        tcPhone = '+' + digits.substring(2);
    } else if (digits.startsWith('92') && digits.length >= 12) {
        tcPhone = '+' + digits;
    } else if (digits.startsWith('0') && digits.length === 11) {
        tcPhone = '+92' + digits.substring(1);
    } else if (digits.startsWith('3') && digits.length === 10) {
        tcPhone = '+92' + digits;
    } else {
        tcPhone = '+' + digits;
    }

    await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } }).catch(() => {});

    try {
        const tcUrl = `https://www.clyk.fun/api/tc?phone=${encodeURIComponent(tcPhone)}`;
        const response = await axios.get(tcUrl, {
            timeout: 25000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        let found = false;
        let name = '';
        let carrier = data?.carrier || data?.network || 'N/A';
        let email = data?.email || 'N/A';

        if (data?.found && data?.name) {
            found = true;
            name = String(data.name).trim();
        } else if (data?.success && data?.name) {
            found = true;
            name = String(data.name).trim();
        } else if (data?.truecaller?.name) {
            found = true;
            name = String(data.truecaller.name).trim();
        }

        if (!found || !name) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: `❌ *Truecaller par koi name nahi mila!*\nTarget: \`${tcPhone}\`\n\n💡 *Tip:* Aap *.sim ${tcPhone.replace('+92', '0')}* se SIM database check kar sakte hain!`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        const cardText =
`╭━━━〔 ⚡ ${toSansBold('TRUECALLER CALLER ID')} ⚡ 〕━━━┈⊷
┃ 👤 *Name:* *${name}*
┃ 📞 *Number:* \`${tcPhone}\`
┃ 📡 *Carrier:* ${carrier}
┃ 📧 *Email:* ${email}
┃ 👑 *Bot:* ${toSansBold(settings.botName || 'SALU MD')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        await sock.sendMessage(from, { text: cardText }, { quoted: msg });

    } catch (err) {
        console.error('[Truecaller Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *Truecaller Lookup Failed:*\n_${err.message}_\n\n💡 *Tip:* Pakistani numbers ke liye *.sim ${text}* command use karein!`
        }, { quoted: msg });
    }
}

module.exports = {
    truecallerCommand
};
