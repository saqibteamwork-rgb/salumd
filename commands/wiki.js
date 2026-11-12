// commands/wiki.js
'use strict';

const axios = require('axios');

async function wikiCommand(sock, from, msg, args = []) {
    const query = args.join(' ').trim();
    if (!query) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 📖 *WIKIPEDIA SEARCH* 〕━━━┈⊷
┃ 📌 *Usage:*
┃ 👉 *.wiki <topic>*
┃ 👉 *.wikipedia <topic>*
┃
┃ 💡 *Example:*
┃ .wiki Pakistan
┃ .wiki Albert Einstein
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } }).catch(() => {});

    try {
        const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const res = await axios.get(apiUrl, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const data = res.data;
        if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
            throw new Error('Topic nahi mila.');
        }

        const title = data.title || query;
        const extract = data.extract || 'No summary available.';
        const pageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
        const thumb = data.thumbnail?.source;

        await sock.sendMessage(from, { react: { text: '📚', key: msg.key } }).catch(() => {});

        const caption =
`╭━━━〔 📖 *WIKIPEDIA: ${title.toUpperCase()}* 〕━━━┈⊷
${extract}

🔗 *Read more:* ${pageUrl}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        if (thumb) {
            await sock.sendMessage(from, {
                image: { url: thumb },
                caption: caption
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: caption }, { quoted: msg });
        }

    } catch (e) {
        console.error('[Wiki Error]:', e.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *Wikipedia search fail ho gaya:*\n_Topic "${query}" par koi article nahi mila._`
        }, { quoted: msg });
    }
}

module.exports = { wikiCommand };
