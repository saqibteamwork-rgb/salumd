// commands/ai-image.js - AI Image Generator (Flux & PixArt via Pollinations AI)
const axios = require('axios');

async function aiImageCommand(sock, from, msg, args, commandName = 'flux') {
    try {
        const prompt = (args || []).join(' ').trim();
        if (!prompt) {
            return await sock.sendMessage(from, {
                text: `🎨 *AI IMAGE GENERATOR - MR SAQIB MD*\n\nUsage: *${commandName.startsWith('.') ? '' : '.'}${commandName} <description>*\n\nExample:\n👉 *.flux a futuristic cyberpunk city with neon lights*\n👉 *.imagine a cute baby lion wearing a crown*`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, { text: "🎨 *AI Image generate ho rahi hai... Baraye meharbani intazar karein.* ⏳" }, { quoted: msg });

        const model = (commandName.toLowerCase().includes('pixart')) ? 'pixart' : 'flux';
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=${model}&nologo=true&enhance=true&seed=${seed}`;

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        if (!response.data || response.data.length < 1000) {
            return await sock.sendMessage(from, { text: "❌ AI Image generate nahi ho saki. Dobara try karein." }, { quoted: msg });
        }

        const caption = 
`╭━━━〔 ✨ *AI IMAGE GENERATED* 〕━━━┈⊷
┃ 🤖 *Model:* ${model.toUpperCase()}
┃ 📝 *Prompt:* ${prompt}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

🚀 *Powered by MR SAQIB MD*`;

        await sock.sendMessage(from, {
            image: response.data,
            caption: caption
        }, { quoted: msg });

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

    } catch (e) {
        console.error('[AI Image Command Error]:', e);
        await sock.sendMessage(from, {
            text: `❌ *Image Generation Error:* ${e.message || 'Server timeout'}`
        }, { quoted: msg });
    }
}

module.exports = aiImageCommand;
