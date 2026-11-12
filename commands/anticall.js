async function anticallCommand(sock, from, msg, isOwner, botData, saveBotData, userId, args) {
    if (!isOwner) return await sock.sendMessage(from, { text: "❌ *Access Denied:* Sirf Bot Owner hi anticall command use kar sakta hai." }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
        botData.antiCall[userId] = true;
        saveBotData();
        await sock.sendMessage(from, { text: "✅ Anti-Call Enabled!" }, { quoted: msg });
    } else if (action === 'off') {
        botData.antiCall[userId] = false;
        saveBotData();
        await sock.sendMessage(from, { text: "❌ Anti-Call Disabled!" }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: "❌ Usage: .anticall [on/off]" }, { quoted: msg });
    }
}

module.exports = anticallCommand;
