const { cmd } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed", "pong", "latency", "p"],
    use: '.ping',
    desc: "Check bot response time",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender }) => {
    try {
        const start = Date.now();
        await conn.sendMessage(from, { react: { text: "⚡", key: mek.key } }).catch(() => {});
        const end = Date.now();
        const diff = Math.max(1, end - start);

        const text = 
`╭━━━〔 ⚡ *SALU MD SPEED* 〕━━━┈⊷
┃ 🚀 *Response Speed:* ${diff}ms (${(diff/1000).toFixed(3)}s)
┃ 🟢 *Status:* Online & Active
┃ 👑 *Owner:* SALU
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421389121979@newsletter',
                    newsletterName: "SALU MD",
                    serverMessageId: 1
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in ping command:", e);
    }
});
