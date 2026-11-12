// commands/pinterest.js - Search and Download Pinterest Images
const axios = require('axios');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pinterestCommand(sock, from, msg, args) {
    try {
        const fullQuery = (args || []).join(' ').trim();
        if (!fullQuery) {
            return await sock.sendMessage(from, {
                text: "📌 *PINTEREST SEARCH - SALU MD*\n\nUsage: *.pinterest <search> | <count>*\n\nExample:\n👉 *.pinterest cute cat | 2*\n👉 *.pin dark aesthetic*"
            }, { quoted: msg });
        }

        const parts = fullQuery.split('|');
        const query = parts[0].trim();
        let amount = parseInt(parts[1]?.trim()) || 1;
        if (amount > 5) amount = 5; // Safe cap to prevent spam
        if (amount < 1) amount = 1;

        await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } }).catch(() => {});

        const apiUrl = `https://apis.davidcyril.name.ng/search/pinterest?text=${encodeURIComponent(query)}&apikey=`;
        const response = await axios.get(apiUrl, { timeout: 20000 });
        const res = response.data;

        if (!res || !res.success || !Array.isArray(res.result) || res.result.length === 0) {
            return await sock.sendMessage(from, {
                text: `❌ Koi results nahi mile for: *${query}*`
            }, { quoted: msg });
        }

        const total = Math.min(amount, res.result.length);
        await sock.sendMessage(from, {
            text: `🔍 *Pinterest par ${res.result.length} results mile.*\nSending *${total}* image(s)...`
        }, { quoted: msg });

        for (let i = 0; i < total; i++) {
            const item = res.result[i];
            const caption = 
`╭━━━〔 📌 *PINTEREST IMAGE* 〕━━━┈⊷
┃ 📝 *Caption:* ${item.caption?.trim() || 'No caption'}
┃ 👤 *Uploader:* ${item.fullName || item.uploader || 'Pinterest User'}
┃ 👥 *Followers:* ${item.followers || 'N/A'}
┃ 🔗 *Source:* ${item.source || 'pinterest.com'}
┃ 📊 *Result:* ${i + 1} of ${total}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

🚀 *Powered by SALU MD*`;

            await sock.sendMessage(from, {
                image: { url: item.image },
                caption: caption
            }, { quoted: msg });

            if (i < total - 1) await delay(1200);
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

    } catch (e) {
        console.error('[Pinterest Command Error]:', e);
        await sock.sendMessage(from, {
            text: `❌ *Pinterest Search Failed:* ${e.message || 'Network error'}`
        }, { quoted: msg });
    }
}

module.exports = pinterestCommand;
