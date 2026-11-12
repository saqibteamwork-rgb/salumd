// commands/fancy.js
'use strict';

/**
 * Fancy Text Generator
 * Converts normal text into 30+ stunning Unicode styles instantly without API limits.
 */

const FANCY_STYLES = [
    {
        name: 'Math Sans Bold',
        transform: s => s.replace(/[A-Za-z0-9]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + code - 97);
            if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + code - 48);
            return c;
        })
    },
    {
        name: 'Serif Bold',
        transform: s => s.replace(/[A-Za-z0-9]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + code - 97);
            if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + code - 48);
            return c;
        })
    },
    {
        name: 'Italic Serif',
        transform: s => s.replace(/[A-Za-z]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D434 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D44E + code - 97);
            return c;
        })
    },
    {
        name: 'Gothic / Fraktur',
        transform: s => s.replace(/[A-Za-z]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D504 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D51E + code - 97);
            return c;
        })
    },
    {
        name: 'Gothic Bold',
        transform: s => s.replace(/[A-Za-z]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D56C + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D586 + code - 97);
            return c;
        })
    },
    {
        name: 'Double Struck (Blackboard)',
        transform: s => s.replace(/[A-Za-z0-9]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D538 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D552 + code - 97);
            if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7D8 + code - 48);
            return c;
        })
    },
    {
        name: 'Circled Letters Ⓢⓣⓨⓛⓔ',
        transform: s => s.replace(/[A-Za-z0-9]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
            if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
            if (code === 48) return '⓪';
            return c;
        })
    },
    {
        name: 'Squared Letters 🅂🅃🅈🄻🄴',
        transform: s => s.replace(/[A-Za-z]/g, c => {
            const code = c.toUpperCase().charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F130 + code - 65);
            return c;
        })
    },
    {
        name: 'Negative Squared 🆂🆃🆈🅻🅴',
        transform: s => s.replace(/[A-Za-z]/g, c => {
            const code = c.toUpperCase().charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F170 + code - 65);
            return c;
        })
    },
    {
        name: 'Monospace 𝚌𝚘𝚍𝚎',
        transform: s => s.replace(/[A-Za-z0-9]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D670 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D68A + code - 97);
            if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7F6 + code - 48);
            return c;
        })
    },
    {
        name: 'Small Caps sᴛʏʟᴇ',
        transform: s => {
            const map = {
                a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ғ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ',
                n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ', s:'s', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
            };
            return s.toLowerCase().split('').map(ch => map[ch] || ch).join('');
        }
    },
    {
        name: 'Wide / Fullwidth Ｓｔｙｌｅ',
        transform: s => s.replace(/[A-Za-z0-9]/g, c => {
            const code = c.charCodeAt(0);
            return String.fromCodePoint(0xFF00 + code - 0x20);
        })
    },
    {
        name: 'Underline S̲t̲y̲l̲e̲',
        transform: s => s.split('').map(c => c + '\u0332').join('')
    },
    {
        name: 'Strikethrough S̶t̶y̶l̶e̶',
        transform: s => s.split('').map(c => c + '\u0336').join('')
    },
    {
        name: 'Circled Ⓢⓣⓨⓛⓔ',
        transform: s => s.replace(/[A-Za-z0-9]/g, c => {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
            if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
            if (code === 48) return '⓪';
            return c;
        })
    },
    {
        name: 'Gamer Tag 亗 VIP',
        transform: s => `亗 ${s.toUpperCase()} 亗`
    },
    {
        name: 'Gamer Tag ★彡 Killer',
        transform: s => `★彡[${s}]彡★`
    },
    {
        name: 'Gamer Tag ꧁༒ Master',
        transform: s => `꧁༒☬${s.toUpperCase()}☬༒꧂`
    },
    {
        name: 'Gamer Tag ⚡ Thunder',
        transform: s => `⚡${s.toUpperCase()}⚡`
    },
    {
        name: 'Gamer Tag ♛ King',
        transform: s => `♛ ${s.toUpperCase()} ♛`
    },
    {
        name: 'Gamer Tag ░▒▓ Ghost',
        transform: s => `░▒▓█ ${s} █▓▒░`
    },
    {
        name: 'Gamer Tag ×͜× Devil',
        transform: s => `×͜× ${s.toUpperCase()}`
    },
    {
        name: 'Gamer Tag 『PRO』 Legend',
        transform: s => `★ᴾᴿᴼ★ ${s}`
    },
    {
        name: 'Gamer Tag 𝄟⃝🖤 Heart',
        transform: s => `𝄟⃝🖤${s}𝄟⃝🖤`
    },
    {
        name: 'Gamer Tag ✿ Cute Aesthetic',
        transform: s => `✿ ${s} ✿`
    }
];

async function fancyCommand(sock, from, msg, args = []) {
    const text = args.join(' ').trim();
    if (!text) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ✨ *STYLISH & FANCY TEXT GENERATOR* 〕━━━┈⊷
┃ 📌 *Usage:*
┃ 👉 *.fancy <name/text>*
┃ 👉 *.style <name/text>*
┃ 👉 *.stylish <name/text>*
┃
┃ 💡 *Example:*
┃ .style Ramzan
┃ .fancy SALU
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    let result = `╭━━━〔 ✨ *STYLISH FONT RESULTS* 〕━━━┈⊷\n┃ 📝 *Input:* ${text}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

    FANCY_STYLES.forEach((st, idx) => {
        const styled = st.transform(text);
        result += `*${idx + 1}. ${st.name}:*\n${styled}\n\n`;
    });

    result += `⚡ *Powered by SALU MD*`;

    await sock.sendMessage(from, { text: result.trim() }, { quoted: msg });
}

module.exports = { fancyCommand };
