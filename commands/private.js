async function privateCommand(sock, from, msg, isOwner, session) {
    if (!isOwner) return await sock.sendMessage(from, { text: "❌ Sirf Bot Owner hi mode badal sakta hai." }, { quoted: msg });
    
    session.isPublic = false;
    await sock.sendMessage(from, { 
        text: "🔒 *Bot Mode: PRIVATE*\n\nAb sirf *Owner* aur *Bot User* hi commands use kar sakte hain." 
    }, { quoted: msg });
}

module.exports = privateCommand;
