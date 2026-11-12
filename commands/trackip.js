'use strict';

/**
 * SALU MD :: IP Geolocation & Network Tracker
 * ============================================================================
 * Commands: .trackip / .iptrack / .ip
 * Usage:
 *   .trackip 112.90.150.204
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

async function trackipCommand(sock, from, msg, args = []) {
    const text = args.join(' ').trim();
    if (!text) {
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('IP GEOLOCATION TRACKER')} ⚡ 〕━━━┈⊷
┃ 🌐 *Usage:* Kisi bhi IP address ko track karein:
┃
┃ 👉 *.trackip 112.90.150.204*
┃ 👉 *.ip 8.8.8.8*
┃
┃ 🛡️ *Powered by SALU MD*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(text)) {
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, {
            text: "❌ *Invalid IPv4 Address!*\nExample: `112.90.150.204` ya `8.8.8.8`"
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } }).catch(() => {});

    try {
        const response = await axios.get(`https://ipwho.is/${text}`, { timeout: 15000 });
        const info = response.data;

        if (!info || !info.success) {
            throw new Error(info?.message || `IP ${text} not found or invalid!`);
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        const mapsUrl = (info.latitude && info.longitude) 
            ? `https://www.google.com/maps?q=${info.latitude},${info.longitude}`
            : 'N/A';

        const cardText =
`╭━━━〔 ⚡ ${toSansBold('IP TRACKER DETAILS')} ⚡ 〕━━━┈⊷
┃ 🌐 *IP Address:* \`${info.ip || 'N/A'}\`
┃ 🌍 *Type:* ${info.type || 'IPv4'}
┃ 🏳️ *Country:* ${info.country || 'N/A'} (${info.country_code || ''}) ${info.flag?.emoji || '🗺️'}
┃ 🏙️ *Region / State:* ${info.region || 'N/A'} (${info.region_code || ''})
┃ 🌆 *City:* ${info.city || 'N/A'}
┃ 📮 *Postal Code:* ${info.postal || 'N/A'}
┃ 🧭 *Coordinates:* ${info.latitude || 'N/A'}, ${info.longitude || 'N/A'}
┃ 🏢 *ISP:* ${info.connection?.isp || 'N/A'}
┃ 📡 *Organization:* ${info.connection?.org || 'N/A'}
┃ 🔢 *ASN:* ${info.connection?.asn ? `AS${info.connection.asn}` : 'N/A'}
┃ 🕒 *Timezone:* ${info.timezone?.id || 'N/A'} (${info.timezone?.utc || 'UTC'})
┃ ⏰ *Local Time:* ${info.timezone?.current_time ? new Date(info.timezone.current_time).toLocaleTimeString() : 'N/A'}
┃ 📍 *Google Maps:* ${mapsUrl}
┃ 👑 *Bot:* ${toSansBold(settings.botName || 'SALU MD')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        await sock.sendMessage(from, { text: cardText }, { quoted: msg });

    } catch (err) {
        console.error('[TrackIP Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *IP Tracking Error:*\n_${err.message}_`
        }, { quoted: msg });
    }
}

module.exports = {
    trackipCommand
};
