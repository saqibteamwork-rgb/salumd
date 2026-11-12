async function publicCommand(sock, from, msg, isOwner, session) {
    if (!isOwner) return await sock.sendMessage(from, { text: "❌ Sirf Bot Owner hi mode badal sakta hai." }, { quoted: msg });
    
    session.isPublic = true;
    await sock.sendMessage(from, { 
        text: "🌍 *Bot Mode: PUBLIC*\n\nAb sabhi users aur groups mein bot commands use kar sakte hain." 
    }, { quoted: msg });
}

module.exports = publicCommand;
