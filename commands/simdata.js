'use strict';

/**
 * SALU MD :: Pakistani SIM & CNIC Live Database Lookup
 * ============================================================================
 * Commands: .sim / .simdata / .cnic
 * Usage:
 *   .sim 03338570120
 *   .cnic 32402-1402507-1
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

function formatPhone(num) {
    const d = String(num || '').replace(/\D/g, '');
    if (d.startsWith('92') && d.length === 12) return '0' + d.slice(2);
    if (d.length === 11 && d.startsWith('0')) return d;
    if (d.length === 10 && d.startsWith('3')) return '0' + d;
    return num;
}

function formatCNIC(cnic) {
    const d = String(cnic || '').replace(/\D/g, '');
    if (d.length === 13) {
        return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
    }
    return cnic;
}

async function simdataCommand(sock, from, msg, args = []) {
    const text = args.join(' ').trim();
    if (!text) {
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('PAKISTAN SIM & CNIC DATA')} ⚡ 〕━━━┈⊷
┃ 🔍 *Usage:* Phone number ya CNIC likhein:
┃
┃ 👉 *.sim 03338570120*
┃ 👉 *.cnic 32402-1402507-1*
┃
┃ 💡 *Formats:*
┃ • Phone: 03XX-XXXXXXX ya 03XXXXXXXXX
┃ • CNIC: 13 Digits (Dashes ke sath ya baghair)
┃
┃ 🛡️ *Powered by SALU MD*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    const cleanInput = text.replace(/[^\d+-]/g, '');
    const isCNIC = /^\d{5}[-]?\d{7}[-]?\d{1}$/.test(cleanInput) || /^\d{13}$/.test(cleanInput);

    let queryValue = '';
    let queryType = 'phone';

    if (isCNIC) {
        queryType = 'cnic';
        queryValue = cleanInput.replace(/-/g, '');
        if (queryValue.length !== 13) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: "❌ *Invalid CNIC!* Must be exactly 13 digits (e.g. 32402-1402507-1)"
            }, { quoted: msg });
        }
    } else {
        queryType = 'phone';
        let phone = cleanInput.replace(/\D/g, '');
        if (phone.length === 12 && phone.startsWith('92')) phone = '0' + phone.substring(2);
        else if (phone.length === 10 && phone.startsWith('3')) phone = '0' + phone;
        else if (phone.length > 11) phone = '0' + phone.slice(-10);

        if (!/^03\d{9}$/.test(phone)) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: "❌ *Invalid Phone Number!*\nFormat: 03XX-XXXXXXX (e.g. 03338570120)"
            }, { quoted: msg });
        }
        queryValue = phone;
    }

    await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } }).catch(() => {});

    try {
        const apiUrl = `https://famofc.sbs/famofcapi/sim.php?q=${encodeURIComponent(queryValue)}`;
        const response = await axios.get(apiUrl, {
            timeout: 25000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        let records = [];

        if (data.success && data.data && Array.isArray(data.data.records)) {
            records = data.data.records;
        } else if (data.success && Array.isArray(data.records)) {
            records = data.records;
        }

        if (!records.length) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: `❌ *Koi record nahi mila!*\nTarget: \`${queryValue}\`\n\n_Note: Sirf registered Pakistani numbers ka database check hota hai._`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        let resultText = 
`╭━━━〔 ⚡ ${toSansBold('SIM DATABASE RESULTS')} ⚡ 〕━━━┈⊷
┃ 🔍 *Queried:* \`${queryValue}\`
┃ 📊 *Records Found:* ${records.length}
┃ 👑 *Bot:* ${toSansBold(settings.botName || 'SALU MD')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n`;

        records.forEach((rec, idx) => {
            const name = rec.full_name || rec.name || 'N/A';
            const cnic = formatCNIC(rec.cnic || 'N/A');
            const phone = formatPhone(rec.phone || rec.mobile || 'N/A');
            const address = rec.address || 'N/A';

            resultText += `\n╭───〔 📋 *RECORD #${idx + 1}* 〕───┈⊷\n`;
            resultText += `┃ 👤 *Name:* ${name}\n`;
            resultText += `┃ 📞 *Phone:* ${phone}\n`;
            resultText += `┃ 🪪 *CNIC:* ${cnic}\n`;
            resultText += `┃ 🏠 *Address:* ${address}\n`;
            resultText += `╰────────────────────────┈⊷`;
        });

        resultText += `\n\n⚡ *Powered by SALU MD*`;

        await sock.sendMessage(from, { text: resultText }, { quoted: msg });

    } catch (err) {
        console.error('[SIM Data Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *Database Server Error:*\n_${err.message || 'API request timed out'}_\n\nKuch dair baad dobara koshish karein.`
        }, { quoted: msg });
    }
}

module.exports = {
    simdataCommand
};
