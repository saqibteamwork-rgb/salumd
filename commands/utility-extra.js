'use strict';

/**
 * MR SAQIB MD :: Extended Utility & Power Tools Suite
 * ============================================================================
 * Commands:
 * - .define <word>       : English dictionary definitions & synonyms
 * - .readmore <t1> | <t2>: WhatsApp ReadMore spoiler fold
 * - .base64 <enc/dec> <t>: Base64 encoder/decoder
 * - .binary <enc/dec> <t>: Binary code converter
 * - .pastebin <text>     : Create online text paste
 * - .fetch <url>         : HTTP GET tester for APIs & URLs
 * - .getcid <link>       : WhatsApp channel ID resolver
 * ============================================================================
 */

const axios = require('axios');

async function defineCommand(sock, from, msg, args = []) {
    try {
        const word = (args[0] || '').trim();
        if (!word) {
            return await sock.sendMessage(from, {
                text: "❌ *Usage:* `.define <word>`\n_Example: .define perseverance_"
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '📖', key: msg.key } }).catch(() => {});

        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { timeout: 12000 });
        const entry = res.data?.[0];

        if (!entry) {
            return await sock.sendMessage(from, { text: `❌ Definition nahi mili for: *${word}*` }, { quoted: msg });
        }

        const phonetic = entry.phonetic || entry.phonetics?.[0]?.text || '';
        let meaningsText = '';

        (entry.meanings || []).slice(0, 3).forEach((m, idx) => {
            meaningsText += `*${idx + 1}. [${m.partOfSpeech.toUpperCase()}]*\n`;
            (m.definitions || []).slice(0, 2).forEach(d => {
                meaningsText += `  • ${d.definition}\n`;
                if (d.example) meaningsText += `    _Example:_ "${d.example}"\n`;
            });
            if (m.synonyms && m.synonyms.length > 0) {
                meaningsText += `  🔗 _Synonyms:_ ${m.synonyms.slice(0, 4).join(', ')}\n`;
            }
            meaningsText += '\n';
        });

        const caption = 
`╭━━━〔 📖 *DICTIONARY DEFINITION* 〕━━━┈⊷
┃ 🔤 *Word:* ${entry.word} ${phonetic ? `(${phonetic})` : ''}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

${meaningsText.trim()}

🚀 *MR SAQIB MD*`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Definition error: ${e.response?.status === 404 ? 'Word not found in dictionary.' : e.message}` }, { quoted: msg });
    }
}

async function readmoreCommand(sock, from, msg, args = []) {
    const raw = args.join(' ');
    let part1 = "Click Read More...";
    let part2 = "Surprise! 🎉";

    if (raw.includes('|')) {
        const split = raw.split('|');
        part1 = split[0].trim();
        part2 = split.slice(1).join('|').trim();
    } else if (raw) {
        part1 = raw;
        part2 = "Hidden content revealed! 🚀";
    }

    const readMoreChar = String.fromCharCode(8206).repeat(4001);
    const fullText = `${part1}${readMoreChar}${part2}`;

    await sock.sendMessage(from, { text: fullText }, { quoted: msg });
}

async function base64Command(sock, from, msg, args = []) {
    const mode = (args[0] || '').toLowerCase();
    const content = args.slice(1).join(' ').trim();

    if (!['enc', 'encode', 'dec', 'decode'].includes(mode) || !content) {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:*\n👉 `.base64 enc <text>` (Encode)\n👉 `.base64 dec <base64_string>` (Decode)"
        }, { quoted: msg });
    }

    try {
        if (mode.startsWith('enc')) {
            const encoded = Buffer.from(content, 'utf8').toString('base64');
            await sock.sendMessage(from, {
                text: `🔐 *BASE64 ENCODED:*\n\n\`\`\`${encoded}\`\`\``
            }, { quoted: msg });
        } else {
            const decoded = Buffer.from(content, 'base64').toString('utf8');
            await sock.sendMessage(from, {
                text: `🔓 *BASE64 DECODED:*\n\n${decoded}`
            }, { quoted: msg });
        }
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Base64 error: ${e.message}` }, { quoted: msg });
    }
}

async function binaryCommand(sock, from, msg, args = []) {
    const mode = (args[0] || '').toLowerCase();
    const content = args.slice(1).join(' ').trim();

    if (!['enc', 'encode', 'dec', 'decode'].includes(mode) || !content) {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:*\n👉 `.binary enc <text>` (Text to Binary)\n👉 `.binary dec <0100...>` (Binary to Text)"
        }, { quoted: msg });
    }

    try {
        if (mode.startsWith('enc')) {
            const binary = content.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            await sock.sendMessage(from, {
                text: `💻 *BINARY CODE:*\n\n\`\`\`${binary}\`\`\``
            }, { quoted: msg });
        } else {
            const clean = content.replace(/[^01]/g, ' ');
            const text = clean.split(/\s+/).filter(Boolean).map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
            await sock.sendMessage(from, {
                text: `📝 *DECODED TEXT:*\n\n${text}`
            }, { quoted: msg });
        }
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Binary error: ${e.message}` }, { quoted: msg });
    }
}

async function pastebinCommand(sock, from, msg, args = []) {
    const text = args.join(' ').trim();
    if (!text) {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:* `.pastebin <your text or code>`"
        }, { quoted: msg });
    }

    try {
        await sock.sendMessage(from, { react: { text: '📋', key: msg.key } }).catch(() => {});

        // Rent-a-paste / pastebin alternative
        const res = await axios.post('https://hastebin.com/documents', text, {
            headers: { 'Content-Type': 'text/plain' },
            timeout: 10000
        }).catch(async () => {
            return await axios.post('https://paste.rs', text, { timeout: 10000 });
        });

        let pasteUrl = '';
        if (res.data?.key) {
            pasteUrl = `https://hastebin.com/${res.data.key}`;
        } else if (typeof res.data === 'string' && res.data.startsWith('http')) {
            pasteUrl = res.data.trim();
        } else {
            pasteUrl = 'https://pastebin.com';
        }

        const out = 
`╭━━━〔 📋 *ONLINE PASTEBIN* 〕━━━┈⊷
┃ 🔗 *Shareable Link:*
┃ ${pasteUrl}
┃ 📊 *Length:* ${text.length} characters
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *MR SAQIB MD*`;

        await sock.sendMessage(from, { text: out }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Paste error: ${e.message}` }, { quoted: msg });
    }
}

async function fetchCommand(sock, from, msg, args = []) {
    const url = (args[0] || '').trim();
    if (!url || !url.startsWith('http')) {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:* `.fetch <url>`\n_Example: .fetch https://api.github.com_"
        }, { quoted: msg });
    }

    try {
        await sock.sendMessage(from, { react: { text: '🌐', key: msg.key } }).catch(() => {});
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 MR-SAQIB-MD' },
            timeout: 15000
        });

        let output = typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : String(res.data);
        if (output.length > 2000) {
            output = output.slice(0, 2000) + '\n\n...[Output truncated]';
        }

        await sock.sendMessage(from, {
            text: `╭━━━〔 🌐 *FETCH RESPONSE* 〕━━━┈⊷\n┃ 🔗 *URL:* ${url.slice(0, 35)}...\n┃ ⚡ *Status:* ${res.status} ${res.statusText}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n\`\`\`${output}\`\`\``
        }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Fetch error: ${e.message}` }, { quoted: msg });
    }
}

async function getcidCommand(sock, from, msg, args = []) {
    const link = (args[0] || '').trim();
    if (!link || !link.includes('whatsapp.com/channel/')) {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:* `.getcid <whatsapp_channel_link>`\n_Example: .getcid https://whatsapp.com/channel/0029Va..._"
        }, { quoted: msg });
    }

    try {
        await sock.sendMessage(from, { react: { text: '🔎', key: msg.key } }).catch(() => {});
        const code = link.split('channel/')[1].split('/')[0].split('?')[0];

        const metadata = await sock.newsletterMetadata('invite', code);
        if (!metadata || !metadata.id) {
            throw new Error("Channel metadata resolve nahi ho saka.");
        }

        const out = 
`╭━━━〔 📢 *CHANNEL METADATA* 〕━━━┈⊷
┃ 🏷️ *Name:* ${metadata.name || 'N/A'}
┃ 🆔 *JID:* ${metadata.id}
┃ 👥 *Subscribers:* ${metadata.subscribers || 'N/A'}
┃ 🛡️ *Verified:* ${metadata.verification === 'VERIFIED' ? 'Yes ✅' : 'No ❌'}
┃ 🔗 *Invite Code:* ${code}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *MR SAQIB MD*`;

        await sock.sendMessage(from, { text: out }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Channel lookup error: ${e.message}` }, { quoted: msg });
    }
}

module.exports = {
    defineCommand,
    readmoreCommand,
    base64Command,
    binaryCommand,
    pastebinCommand,
    fetchCommand,
    getcidCommand
};
