// commands/autoreacts.js
'use strict';

async function autoreactsCommand(sock, from, msg, isAdmin, session, args, botData, saveBotData) {
    if (!isAdmin) {
        return await sock.sendMessage(from, { text: "❌ Only owner can use this command." }, { quoted: msg });
    }
    
    const action = args[0]?.toLowerCase();
    const userId = session?.userId || sock?.user?.id?.split('@')[0]?.split(':')[0] || 'default';

    if (action === 'on' || action === 'enable' || action === '1') {
        if (session) session.autoReact = true;
        if (botData) {
            botData.statusSettings = botData.statusSettings || {};
            botData.statusSettings[userId] = botData.statusSettings[userId] || {};
            botData.statusSettings[userId].autoReact = true;
            if (typeof saveBotData === 'function') saveBotData();
        }
        await sock.sendMessage(from, {
            text: "✅ *Auto-React Enabled!*\nBot aane wale har message par automatically random reaction lagayega."
        }, { quoted: msg });
    } else if (action === 'off' || action === 'disable' || action === '0') {
        if (session) session.autoReact = false;
        if (botData) {
            botData.statusSettings = botData.statusSettings || {};
            botData.statusSettings[userId] = botData.statusSettings[userId] || {};
            botData.statusSettings[userId].autoReact = false;
            if (typeof saveBotData === 'function') saveBotData();
        }
        await sock.sendMessage(from, {
            text: "❌ *Auto-React Disabled!*"
        }, { quoted: msg });
    } else {
        const isCurrentlyOn = session?.autoReact || botData?.statusSettings?.[userId]?.autoReact || false;
        await sock.sendMessage(from, {
            text:
`╭━━━〔 🤖 *AUTO-REACT SETTINGS* 〕━━━┈⊷
┃ 📊 *Current Status:* ${isCurrentlyOn ? '🟢 ON' : '🔴 OFF'}
┃
┃ 💡 *Commands:*
┃ 👉 *.autoreact on*  ➜ Auto reaction chalu karein
┃ 👉 *.autoreact off* ➜ Auto reaction band karein
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }
}

module.exports = autoreactsCommand;
