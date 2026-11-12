'use strict';

/**
 * SALU MD :: Uncensored Free AI Chat Module (No API Key Needed)
 * ============================================================================
 * Commands: .ai2 / .notrack / .ask2
 * Usage:
 *   .ai2 write a python script to ping a server
 * ============================================================================
 */

const { notrackAI } = require('../lib/notrackAI');
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

async function notrackAICommand(sock, from, msg, args = []) {
    const prompt = args.join(' ').trim();
    if (!prompt) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('UNCENSORED AI CHAT')} ⚡ 〕━━━┈⊷
┃ 🤖 *Usage:* Kuch bhi poochhein (Bina kisi API key ke):
┃
┃ 👉 *.ai2 Python code likho website scraper ke liye*
┃ 👉 *.ai2 Explain quantum computing in Roman Urdu*
┃
┃ 🛡️ *Powered by SALU MD*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '🤖', key: msg.key } }).catch(() => {});

    try {
        const reply = await notrackAI(prompt);
        if (!reply || !reply.trim()) throw new Error("AI ne koi jawab nahi diya");

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        const responseText =
`╭━━━〔 ⚡ ${toSansBold('AI RESPONSE')} ⚡ 〕━━━┈⊷
┃ 💬 *Query:* _${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

${reply.trim()}

⚡ *Powered by SALU MD*`;

        await sock.sendMessage(from, { text: responseText }, { quoted: msg });

    } catch (err) {
        console.error('[NoTrack AI Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *AI Error:* ${err.message || 'Server did not respond'}`
        }, { quoted: msg });
    }
}

module.exports = {
    notrackAICommand
};
