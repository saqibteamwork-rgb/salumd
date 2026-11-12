const { igdl } = require("ruhend-scraper");
const settings = require('../settings');

async function instaCommand(sock, from, msg, q) {
    if (!q) return await sock.sendMessage(from, { text: "❌ Please provide an Instagram URL." }, { quoted: msg });

    try {
        await sock.sendMessage(from, { react: { text: '⚡', key: msg.key } }).catch(() => {});

        const data = await igdl(q);
        if (!data || !data.data || data.data.length === 0) {
            return await sock.sendMessage(from, { text: "❌ No media found or account is private." }, { quoted: msg });
        }

        for (const media of data.data.slice(0, 5)) {
            const isVideo = media.type === 'video' || /\.(mp4|mov|avi|mkv|webm)/i.test(media.url);
            if (isVideo) {
                await sock.sendMessage(from, { video: { url: media.url }, caption: "✅ Downloaded by " + settings.botName }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { image: { url: media.url }, caption: "✅ Downloaded by " + settings.botName }, { quoted: msg });
            }
        }
    } catch (e) {
        await sock.sendMessage(from, { text: "❌ Error downloading Instagram content: " + e.message }, { quoted: msg });
    }
}

module.exports = instaCommand;
