// plugins/ytdl-ultra.js
'use strict';

const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
const { ytdlAuto } = require('../lib/ytdlScraper');

cmd({
    pattern: "ytv",
    alias: ["ytmp4", "video"],
    desc: "Download YouTube video (MP4)",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a YouTube video name or URL!\n\nExample: `.ytv alone marshmello`");

        let url = q.trim();
        let videoInfo = null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            const search = await yts({ videoId: getVideoId(url) });
            videoInfo = search || { title: 'YouTube Video', url };
        } else {
            const search = await yts(url);
            videoInfo = search.videos[0];
            if (!videoInfo) return await reply("❌ No video results found!");
            url = videoInfo.url;
        }

        function getVideoId(u) {
            const match = u.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } }).catch(() => {});

        const res = await ytdlAuto(url, '360');
        if (!res || !res.status || !res.download_url) {
            return await reply("❌ Failed to fetch video download link! Try again later.");
        }

        const caption = `🎬 *${videoInfo.title || res.title || 'YouTube Video'}*\n\n> *Powered by SALU MD ✅*`;

        // Direct buffer fetch with timeout
        let sent = false;
        try {
            const vidRes = await axios.get(res.download_url, {
                responseType: 'arraybuffer',
                timeout: 75000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
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
            console.warn('[Plugin ytv Buffer Warning]:', bufErr.message);
        }

        if (!sent) {
            await conn.sendMessage(from, {
                video: { url: res.download_url },
                mimetype: 'video/mp4',
                caption
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .ytv command:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

cmd({
    pattern: "play",
    alias: ["song", "ytmp3"],
    desc: "Download YouTube audio with thumbnail",
    category: "download",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎧 Please provide a song name!\n\nExample: .play Faded Alan Walker");

        await conn.sendMessage(from, { react: { text: '⚡', key: m.key } }).catch(() => {});

        let videoUrl = q.trim();
        let vid = null;

        if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
            vid = { url: videoUrl, title: 'YouTube Audio', timestamp: 'N/A', author: { name: 'YouTube' } };
        } else {
            const search = await yts(videoUrl);
            if (!search.videos || search.videos.length === 0) return await reply("❌ No results found!");
            vid = search.videos[0];
            videoUrl = vid.url;
        }

        // Send thumbnail card
        if (vid.thumbnail) {
            await conn.sendMessage(from, {
                image: { url: vid.thumbnail },
                caption: `- *AUDIO DOWNLOADER 🎧*\n╭━━❐━⪼\n┇๏ *Title* - ${vid.title}\n┇๏ *Duration* - ${vid.timestamp || 'N/A'}\n┇๏ *Author* - ${vid.author?.name || 'YouTube'}\n┇๏ *Status* - Downloading...\n╰━━❑━⪼\n> *© Powered by SALU MD*`
            }, { quoted: mek }).catch(() => {});
        }

        // Multi-tier ytdlAuto (ytdl-lite + savetube.vip + savenow)
        const res = await ytdlAuto(videoUrl, 'mp3');
        if (!res || !res.status || !res.download_url) {
            return await reply("❌ Download link generate nahi hua. Thori der baad dobara koshish karein!");
        }

        const cleanTitle = (vid.title || res.title || 'song').replace(/[\\/:*?"<>|]/g, '').slice(0, 60);

        // Download audio buffer
        let audioBuffer = null;
        try {
            const aRes = await axios.get(res.download_url, {
                responseType: 'arraybuffer',
                timeout: 75000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (aRes.data && aRes.data.length > 1000) {
                audioBuffer = Buffer.from(aRes.data);
            }
        } catch (bufErr) {
            console.warn('[Plugin Play Buffer Warning]:', bufErr.message);
        }

        // Send Playable Audio with proper 'audio/mpeg'
        if (audioBuffer && audioBuffer.length > 0) {
            await conn.sendMessage(from, {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                fileName: `${cleanTitle}.mp3`,
                ptt: false
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                audio: { url: res.download_url },
                mimetype: "audio/mpeg",
                fileName: `${cleanTitle}.mp3`,
                ptt: false
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play command:", e);
        await reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
