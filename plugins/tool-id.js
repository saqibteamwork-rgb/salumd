

const { cmd } = require('../command');

// lid to pn
async function lidToPhone(conn, lid) {
    try {
        const pn = await conn.signalRepository.lidMapping.getPNForLID(lid);
        if (pn) {
            return cleanPN(pn);
        }
        return lid.split("@")[0];
    } catch (e) {
        return lid.split("@")[0];
    }
}

// cleanPn
function cleanPN(pn) {
    return pn.split(":")[0];
}

cmd({
    pattern: "id",
    alias: ["chatid", "lid", "jid", "gjid", "channelid", "newsletter", "cid"],  
    desc: "Get various IDs (chat, user, group, or channel)",
    react: "⚡",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, reply, sender, fromMe, botNumber2
}) => {
    try {
        // Check if user is asking for channel ID
        if (m.text && m.text.includes('whatsapp.com/channel/')) {
            const match = m.text.match(/whatsapp\.com\/channel\/([\w-]+)/);
            if (!match) return reply("⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx");

            const inviteId = match[1];
            let metadata;
            
            try {
                metadata = await conn.newsletterMetadata("invite", inviteId);
            } catch (e) {
                return reply("❌ Failed to fetch channel metadata. Make sure the link is correct.");
            }

            if (!metadata || !metadata.id) return reply("❌ Channel not found or inaccessible.");

            return reply(`> ${metadata.id}`);
        }

        if (isGroup) {
            // Get group JID only (no LID)
            const groupJID = from.includes('@g.us') ? from : `${from}@g.us`;
            return reply(`> *Group JID:* ${groupJID}`);
            
        } else {
            // Private chat (Inbox) - show s.whatsapp.net format
            if (fromMe) {
                // Owner in inbox - show bot's s.whatsapp.net
                const botPN = botNumber2.split('@')[0];
                return reply(`> *Your ID:* ${botPN}@s.whatsapp.net`);
            } else {
                // Others in inbox - convert LID to s.whatsapp.net
                let senderPN = sender.split('@')[0];
                
                if (sender.includes('@lid')) {
                    senderPN = await lidToPhone(conn, sender);
                }
                
                // Format as s.whatsapp.net only
                return reply(`> *Your ID:* ${senderPN}@s.whatsapp.net`);
            }
        }

    } catch (e) {
        console.error("ID Command Error:", e);
        return reply(`⚠️ Error: ${e.message}`);
    }
});
