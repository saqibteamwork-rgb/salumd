// ✅ Coded by JawadTechX for JAWAD MD
// ⚙️ API: https://jawad-tech.vercel.app/download/ytdl?url=

const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

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

        let url = q;
        let videoInfo = null;

        // 🔍 Detect URL or search by title
        if (q.startsWith('http://') || q.startsWith('https://')) {
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
            const videoId = getVideoId(q);
            if (!videoId) return await reply("❌ Invalid YouTube URL!");
            const searchFromUrl = await yts({ videoId });
            videoInfo = searchFromUrl;
        } else {
            const search = await yts(q);
            videoInfo = search.videos[0];
            if (!videoInfo) return await reply("❌ No video results found!");
            url = videoInfo.url;
        }

        // 🎯 Extract YouTube video ID
        function getVideoId(url) {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        }

        // 🖼️ Send thumbnail + video info
        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `*🎬 VIDEO DOWNLOADER*\n\n🎞️ *Title:* ${videoInfo.title}\n📺 *Channel:* ${videoInfo.author.name}\n🕒 *Duration:* ${videoInfo.timestamp}\n\n*Status:* Downloading Video...\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙏𝙚𝙘𝙝𝙓 𝙈𝘿*`
        }, { quoted: mek });

        // ⚙️ Fetch from JawadTech API
        const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data?.status || !data?.result?.mp4) {
            return await reply("❌ Failed to fetch download link! Try again later.");
        }

        const vid = data.result;

        // 📹 Send as video
        await conn.sendMessage(from, {
            video: { url: vid.mp4 },
            caption: `🎬 *${vid.title}*\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓*`
        }, { quoted: mek });

        // ✅ Success Reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .ytv command:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});


// jawad tech

cmd({
    pattern: "play",
    desc: "Download YouTube audio with thumbnail (Your API)",
    category: "download",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎧 Please provide a song name!\n\nExample: .play Faded Alan Walker");

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return await reply("❌ No results found!");

        const vid = videos[0];
        const videoUrl = vid.url;

        // 🎵 Send thumbnail + info first
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `- *AUDIO DOWNLOADER 🎧*\n╭━━❐━⪼\n┇๏ *Title* - ${vid.title}\n┇๏ *Duration* - ${vid.timestamp}\n┇๏ *Views* - ${vid.views.toLocaleString()}\n┇๏ *Author* - ${vid.author.name}\n┇๏ *Status* - Downloading...\n╰━━❑━⪼\n> *© Pᴏᴡᴇʀᴇᴅ Bʏ 𝙏𝙚𝙘𝙝𝙓 𝙈𝘿*`
        }, { quoted: mek });

        // === Your API ===
        const apiUrl = `https://adeelmdmp3.vercel.app/download?url=${encodeURIComponent(videoUrl)}&key=adeelbaloch.dev`;

        let audioUrl = null;
        let title = vid.title || "Unknown Song";

        try {
            const res = await axios.get(apiUrl, { timeout: 30000 }); // Increased timeout
            const json = res.data;

            if (json?.status === true && json?.result) {
                audioUrl = typeof json.result === 'string' 
                    ? json.result 
                    : json.result.download || json.result.url || json.result.link;
            }
        } catch (err) {
            console.log("Your API Error:", err.message);
        }

        if (!audioUrl) {
            return await reply("❌ API se audio nahi mila. Thori der baad try karen!");
        }

        // 🎧 Send audio
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play command:", e);
        await reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
