// commands/capcut.js
'use strict';

const axios = require('axios');
const settings = require('../settings');

async function capcutCommand(sock, from, msg, args = []) {
    const url = args[0]?.trim();
    if (!url || !url.includes('capcut.com')) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 🎬 *CAPCUT TEMPLATE DOWNLOADER* 〕━━━┈⊷
┃ 📌 *Usage:*
┃ 👉 *.capcut <capcut template link>*
┃ 👉 *.cc <capcut link>*
┃
┃ 💡 *Example:*
┃ .capcut https://www.capcut.com/template-detail/...
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } }).catch(() => {});

    try {
        const res = await axios.get(`https://backend1.tioo.eu.org/capcut?url=${encodeURIComponent(url)}`, {
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const data = res.data;
        const videoUrl = data?.originalVideoUrl || data?.video_url || data?.result?.video;

        if (!videoUrl) throw new Error('Capcut video URL extract nahi ho saka.');

        const title = data.title || 'CapCut Template';
        const author = data.authorName || data.author || 'Creator';

        await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } }).catch(() => {});

        const caption =
`╭━━━〔 🎬 *CAPCUT VIDEO* 〕━━━┈⊷
┃ 📌 *Title:* ${title}
┃ 👤 *Author:* ${author}
┃ ⚡ *Powered by:* ${settings.botName || 'MR SAQIB MD'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        await sock.sendMessage(from, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: caption
        }, { quoted: msg });

    } catch (e) {
        console.error('[CapCut Error]:', e.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *CapCut video download fail ho gayi:*\n_${e.message}_`
        }, { quoted: msg });
    }
}

module.exports = { capcutCommand };
