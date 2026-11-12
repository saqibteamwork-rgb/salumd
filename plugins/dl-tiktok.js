const axios = require("axios");
const { cmd } = require("../command");
const config = require('../config');

cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl"],
    desc: "Download TikTok video using resilient multi-tier APIs",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        const rawText = (typeof q === 'string' ? q : '').trim();
        const urlMatch = rawText.match(/https?:\/\/(?:[a-zA-Z0-9_-]+\.)?tiktok\.com\/[^\s]+/i);
        const targetUrl = urlMatch ? urlMatch[0].trim() : rawText;

        if (!targetUrl || !targetUrl.includes('tiktok.com')) {
            return await reply("🎯 Please provide a valid TikTok link!\n\nExample:\n.tt https://vt.tiktok.com/ZSp9fXCWS/");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        let videoUrl = null;
        let title = "TikTok Video";
        let author = "TikTok Creator";
        let username = "creator";

        // Tier 1: TikWM Direct GET
        try {
            const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                }
            });
            if (res.data && res.data.code === 0 && res.data.data) {
                const d = res.data.data;
                videoUrl = d.play || d.hdplay || d.wmplay;
                if (videoUrl && videoUrl.startsWith('/')) {
                    videoUrl = 'https://www.tikwm.com' + videoUrl;
                }
                title = d.title || title;
                author = d.author?.nickname || author;
                username = d.author?.unique_id || username;
            }
        } catch (err) {
            console.warn('[Plugin TikTok] TikWM GET error:', err.message);
        }

        // Tier 2: Jawad-Tech Vercel API
        if (!videoUrl) {
            try {
                const res = await axios.get(`https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(targetUrl)}`, {
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (res.data?.status && res.data?.result) {
                    videoUrl = res.data.result;
                    title = res.data.metadata?.title || title;
                    author = res.data.metadata?.author || author;
                    username = res.data.metadata?.username || username;
                }
            } catch (err) {
                console.warn('[Plugin TikTok] Jawad-Tech error:', err.message);
            }
        }

        // Tier 3: TikWM POST Mirror
        if (!videoUrl) {
            try {
                const params = new URLSearchParams();
                params.append('url', targetUrl);
                params.append('count', '12');
                params.append('cursor', '0');
                params.append('web', '1');
                params.append('hd', '1');

                const res = await axios.post('https://tikwm.com/api/', params, {
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    }
                });

                if (res.data && res.data.code === 0 && res.data.data) {
                    const d = res.data.data;
                    videoUrl = d.play || d.hdplay || d.wmplay;
                    if (videoUrl && videoUrl.startsWith('/')) {
                        videoUrl = 'https://www.tikwm.com' + videoUrl;
                    }
                    title = d.title || title;
                    author = d.author?.nickname || author;
                    username = d.author?.unique_id || username;
                }
            } catch (err) {
                console.warn('[Plugin TikTok] TikWM POST error:', err.message);
            }
        }

        if (!videoUrl) return await reply("❌ Download failed! Video download link nahi mil saka.");

        const BOT_NAME = userConfig?.BOT_NAME || config.BOT_NAME || "SALU MD";
        const cleanTitle = (title || 'TikTok Video').replace(/\s+/g, ' ').trim().slice(0, 80);
        const caption = `🎵 *${cleanTitle}*\n👤 *Author:* ${author}\n⚡ *Username:* @${username}\n\n> *Powered by ${BOT_NAME} ✅*`;

        let sent = false;
        try {
            const vidRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Referer': 'https://www.tiktok.com/'
                }
            });
            if (vidRes.data && vidRes.data.length > 1000) {
                await conn.sendMessage(from, {
                    video: Buffer.from(vidRes.data),
                    mimetype: 'video/mp4',
                    caption
                }, { quoted: mek });
                sent = true;
            }
        } catch (bufErr) {
            console.warn('[Plugin TikTok] Buffer fetch failed, using stream fallback:', bufErr.message);
        }

        if (!sent) {
            await conn.sendMessage(from, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                caption
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok:", e);
        await reply(`❌ Error occurred while downloading TikTok video: ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

cmd({
    pattern: "tiktok2",
    alias: ["tt2", "ttdl2"],
    desc: "Download TikTok video using JawadTech API",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("🎯 Please provide a valid TikTok link!\n\nExample:\n.tt2 link");

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const api = `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result)
            return await reply("❌ Download failed! Try again later.");

        const meta = json.metadata;
        const BOT_NAME = userConfig?.BOT_NAME || config.BOT_NAME || "SALU MD";

        await conn.sendMessage(from, {
            video: { url: json.result },
            mimetype: 'video/mp4',
            caption: `🎵 *${meta?.title || 'TikTok Video'}*\n👤 *Author:* ${meta?.author || 'Creator'}\n📱 *Username:* @${meta?.username || 'user'}\n🌍 *Region:* ${meta?.region || 'Global'}\n\n✨ *Powered by ${BOT_NAME}*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok2:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

cmd({
    pattern: "tiktok3",
    alias: ["tt3", "ttdl3"],
    desc: "Download HD TikTok videos using JawadTechXD API",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("🎯 Please provide a valid TikTok link!\n\nExample:\n.tt3 link ");

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const api = `https://jawad-tech.vercel.app/download/ttdl?url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result)
            return await reply("❌ Download failed! Try again later.");

        const meta = json.metadata;
        const BOT_NAME = userConfig?.BOT_NAME || config.BOT_NAME || "SALU MD";

        const caption = `
🎬 *${meta?.title || 'TikTok Video'}*

👤 *Author:* ${meta?.author?.nickname || meta?.author || 'Creator'} (${meta?.author?.username || ''})
🎵 *Music:* ${meta?.music?.title || 'Audio'}
💿 *By:* ${meta?.music?.author || 'Unknown'}

✨ *Powered by ${BOT_NAME}*
        `.trim();

        await conn.sendMessage(from, {
            video: { url: json.result },
            mimetype: 'video/mp4',
            caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok3:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
