const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');
const axios = require('axios');

// Helper functions
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

function cleanPN(pn) {
    return pn.split(":")[0];
}

// Settings command
cmd({
    pattern: "settings",
    alias: ["setting", "env", "config"],
    desc: "Bot settings management",
    category: "settings",
    react: "⚙️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, prefix, userConfig }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }
    
    const formatEmojiList = (emojis) => {
        if (!emojis || !Array.isArray(emojis) || emojis.length === 0) {
            return "│   Not Set";
        }
        
        let result = "";
        for (let i = 0; i < Math.min(emojis.length, 10); i++) {
            if (i === 0) {
                result += `│   ${emojis[i]}`;
            } else {
                result += ` ${emojis[i]}`;
            }
        }
        
        if (emojis.length > 10) {
            result += ` +${emojis.length - 10} more`;
        }
        
        return result;
    };
    
    const settingsText = `
┌─⧽ *${config.BOT_NAME} Sᴇᴛᴛɪɴɢs* ⚙️
│
│ 📁 *Available Commands*
│ • statusview on/off
│ • statuslike on/off
│ • recording on/off
│ • autoreact on/off
│ • antilink on/off
│ • antidelete on/off
│ • welcome on/off
│ • adminaction on/off
│ • autotyping on/off
│ • online on/off
│ • mode public/private/inbox
│ • delpath same/inbox
│ • statusemojis ❤️,😍,🔥
│ • reactemojis 😂,❤️,🔥
│ • stickername <name>
│ • prefix <new_prefix>
│ • botname <new_name>
│ • ownername <new_name>
│ • ownernumber <new_number>
│ • description <new_desc>
│ • botdp <image_url>
│
│ ═══════════════
│
│ 🧩 *Current Configuration*
│ 🪄 Auto View Status: ${userConfig.AUTO_VIEW_STATUS}
│ 💖 Auto Like Status: ${userConfig.AUTO_LIKE_STATUS}
│ 🎙 Auto Recording: ${userConfig.AUTO_RECORDING}
│ 🤖 Auto React: ${userConfig.AUTO_REACT}
│ 🚫 Anti-Link: ${userConfig.ANTI_LINK}
│ 🗑️ Anti-Delete: ${userConfig.ANTI_DELETE || 'false'}
│ 📍 Delete Path: ${userConfig.ANTI_DELETE_PATH || 'inbox'}
│ 🎉 Welcome: ${userConfig.WELCOME}
│ 👑 Admin Action: ${userConfig.ADMIN_ACTION}
│ ⌨️ Auto Typing: ${userConfig.AUTO_TYPING || 'false'}
│ 💚 Always Online: ${userConfig.ALWAYS_ONLINE || 'false'}
│ ⚙️ Bot Mode: ${userConfig.MODE}
│ 🪟 Prefix: ${userConfig.PREFIX}
│ 🤖 Bot Name: ${config.BOT_NAME}
│ 👑 Owner Name: ${userConfig.OWNER_NAME || config.OWNER_NAME}
│ 📞 Owner Number: ${userConfig.OWNER_NUMBER || config.OWNER_NUMBER}
│ 📝 Description: ${userConfig.DESCRIPTION || config.DESCRIPTION}
│ 🖼️ Bot Image: ${userConfig.BOT_IMAGE ? 'Set ✓' : 'Not Set'}
│
│ ══════════════════
│
│ 🎨 *Emoji & Media Settings*
│ 💌 Status Emojis: 
${formatEmojiList(userConfig.AUTO_LIKE_EMOJI)}
│
│ 🔥 React Emojis:
${formatEmojiList(userConfig.REACTXEMOJIS)}
│
│ 🏷️ Sticker Name: ${userConfig.STICKER_NAME || 'Not Set'}
│
└───────────⧽`;

    await reply(settingsText);
});

// Status View command
cmd({
    pattern: "statusview",
    alias: ["autoview"],
    desc: "Toggle auto view status",
    category: "settings",
    react: "👁️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autoview on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_VIEW_STATUS}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_VIEW_STATUS = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Vɪᴇᴡ Sᴛᴀᴛᴜs sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// Status Like command
cmd({
    pattern: "statuslike",
    alias: ["autolike"],
    desc: "Toggle auto like status",
    category: "settings",
    react: "❤️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autolike on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_LIKE_STATUS}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_LIKE_STATUS = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Lɪᴋᴇ Sᴛᴀᴛᴜs sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// Auto React command
cmd({
    pattern: "autoreact",
    alias: ["autoreaction", "reactauto"],
    desc: "Toggle auto react to messages",
    category: "settings",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autoreact on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_REACT}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_REACT = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Rᴇᴀᴄᴛ sᴇᴛ ᴛᴏ:* ${newValue}\n\nBot will ${newValue === 'true' ? 'now' : 'no longer'} automatically react to messages.`);
});

// Anti Link command
cmd({
    pattern: "antilink",
    alias: ["linkblock"],
    desc: "Toggle anti-link protection",
    category: "settings",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* antilink on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ANTI_LINK}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ANTI_LINK = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ Lɪɴᴋ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Users sending links will be removed from groups.`);
});

// Anti Delete command
cmd({
    pattern: "antidelete",
    alias: ["antidel", "delblock"],
    desc: "Toggle anti-delete message protection",
    category: "settings",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* antidelete on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ANTI_DELETE || 'false'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ANTI_DELETE = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ Dᴇʟᴇᴛᴇ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Bot will detect and notify when messages are deleted.`);
});

// Recording command
cmd({
    pattern: "recording",
    alias: ["autorecording"],
    desc: "Toggle auto recording presence",
    category: "settings",
    react: "🎙️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autorecord on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_RECORDING}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_RECORDING = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Rᴇᴄᴏʀᴅɪɴɢ sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// Welcome command
cmd({
    pattern: "welcome",
    alias: ["welcome"],
    desc: "Toggle welcome/goodbye messages",
    category: "settings",
    react: "🎉",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* welcome on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.WELCOME}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.WELCOME = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Wᴇʟᴄᴏᴍᴇ/Goodbye sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// Admin Action command
cmd({
    pattern: "adminaction",
    alias: ["adminnotify"],
    desc: "Toggle admin action notifications",
    category: "settings",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* adminaction on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ADMIN_ACTION}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ADMIN_ACTION = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴅᴍɪɴ Aᴄᴛɪᴏɴ Nᴏᴛɪғɪᴄᴀᴛɪᴏɴs sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// NEW: Auto Typing command
cmd({
    pattern: "autotyping",
    alias: ["typing"],
    desc: "Toggle auto typing in chats",
    category: "settings",
    react: "⌨️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autotyping on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_TYPING || 'false'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_TYPING = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Tʏᴘɪɴɢ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Bot will show typing indicator in chats.`);
});

// NEW: Online/Always Online command
cmd({
    pattern: "online",
    alias: ["alwaysonline", "alwayson"],
    desc: "Toggle always online status",
    category: "settings",
    react: "💚",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* online on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ALWAYS_ONLINE || 'false'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ALWAYS_ONLINE = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aʟᴡᴀʏs Oɴʟɪɴᴇ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Bot will always show online status.`);
});

// Mode command
cmd({
    pattern: "mode",
    alias: ["mod"],
    desc: "Change bot mode (public/private/inbox)",
    category: "settings",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* mode public/private/inbox\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.MODE}`);
    }

    const mode = args[0].toLowerCase();
    if (!['public', 'private', 'inbox'].includes(mode)) {
        return reply('❌ *Aᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs:* public, private, inbox');
    }

    userConfig.MODE = mode;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    const modeDescriptions = {
        public: 'Cᴏᴍᴍᴀɴᴅs ᴡᴏʀᴋ ᴇᴠᴇʀʏᴡʜᴇʀᴇ',
        private: 'Oɴʟʏ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅs ᴡᴏʀᴋ',
        inbox: 'Cᴏᴍᴍᴀɴᴅs ᴡᴏʀᴋ ᴏɴʟʏ ɪɴ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛs'
    };
    
    await reply(`✅ *Bᴏᴛ ᴍᴏᴅᴇ sᴇᴛ ᴛᴏ:* ${mode}\n📝 *Dᴇsᴄʀɪᴘᴛɪᴏɴ:* ${modeDescriptions[mode]}`);
});

// Prefix command
cmd({
    pattern: "prefix",
    desc: "Change command prefix",
    category: "settings",
    react: "🪟",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* prefix <new_prefix>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.PREFIX}`);
    }

    const newPrefix = args[0];
    if (newPrefix.length > 2) {
        return reply('❌ *Pʀᴇғɪx ᴍᴜsᴛ ʙᴇ 1-2 ᴄʜᴀʀᴀᴄᴛᴇʀs ᴍᴀx*');
    }

    userConfig.PREFIX = newPrefix;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Pʀᴇғɪx ᴄʜᴀɴɢᴇᴅ ᴛᴏ:* ${newPrefix}\n\n*Exᴀᴍᴘʟᴇ:* ${newPrefix}menu`);
});

// Bot Name command
cmd({
    pattern: "botname",
    alias: ["name"],
    desc: "Change bot name",
    category: "settings",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* botname <new_name>\n*Cᴜʀʀᴇɴᴛ:* ${config.BOT_NAME}`);
    }

    const newName = args.join(' ');
    if (newName.length > 30) {
        return reply('❌ *Bᴏᴛ ɴᴀᴍᴇ ᴍᴜsᴛ ʙᴇ ᴜɴᴅᴇʀ 30 ᴄʜᴀʀᴀᴄᴛᴇʀs*');
    }

    // Update userConfig instead of config
    userConfig.BOT_NAME = newName;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Bᴏᴛ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ:* ${newName}`);
});

// NEW: Owner Name command
cmd({
    pattern: "ownername",
    alias: ["owner"],
    desc: "Change owner name",
    category: "settings",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* ownername <new_name>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.OWNER_NAME || config.OWNER_NAME}`);
    }

    const newName = args.join(' ');
    if (newName.length > 30) {
        return reply('❌ *Oᴡɴᴇʀ ɴᴀᴍᴇ ᴍᴜsᴛ ʙᴇ ᴜɴᴅᴇʀ 30 ᴄʜᴀʀᴀᴄᴛᴇʀs*');
    }

    userConfig.OWNER_NAME = newName;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Oᴡɴᴇʀ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ:* ${newName}`);
});

// NEW: Owner Number command
cmd({
    pattern: "ownernumber",
    alias: ["ownernum", "ownerphone"],
    desc: "Change owner number",
    category: "settings",
    react: "📞",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* ownernumber <new_number>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.OWNER_NUMBER || config.OWNER_NUMBER}`);
    }

    const newNumber = args[0];
    // Basic phone number validation
    if (!newNumber.match(/^\d{10,15}$/)) {
        return reply('❌ *Pʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ (10-15 ᴅɪɢɪᴛs)*');
    }

    userConfig.OWNER_NUMBER = newNumber;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Oᴡɴᴇʀ ɴᴜᴍʙᴇʀ sᴇᴛ ᴛᴏ:* ${newNumber}`);
});

// NEW: Description command
cmd({
    pattern: "description",
    alias: ["desc", "about"],
    desc: "Change bot description",
    category: "settings",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* description <new_description>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.DESCRIPTION || config.DESCRIPTION}`);
    }

    const newDesc = args.join(' ');
    if (newDesc.length > 200) {
        return reply('❌ *Dᴇsᴄʀɪᴘᴛɪᴏɴ ᴍᴜsᴛ ʙᴇ ᴜɴᴅᴇʀ 200 ᴄʜᴀʀᴀᴄᴛᴇʀs*');
    }

    userConfig.DESCRIPTION = newDesc;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Bᴏᴛ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ sᴇᴛ ᴛᴏ:* ${newDesc}`);
});

// NEW: Bot DP command
cmd({
    pattern: "botdp",
    alias: ["botimage", "botpic", "botphoto"],
    desc: "Set bot display picture",
    category: "settings",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
        const quotedMsg = m.quoted;
        const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
        if (!mimeType.startsWith("image")) return reply("❌ Please reply to an image.");

        const mediaBuffer = await quotedMsg.download();
        const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
        const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        const form = new FormData();
        form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
        form.append("reqtype", "fileupload");

        const response = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });

        fs.unlinkSync(tempFilePath);

        if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
            throw new Error(`Catbox upload failed: ${response.data}`);
        }

        imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
        return reply("❌ Provide a valid image URL or reply to an image.");
    }

    // Save to userConfig
    userConfig.BOT_IMAGE = imageUrl;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    // Send confirmation with image
    await conn.sendMessage(from, {
        image: { url: imageUrl },
        caption: `✅ *Bᴏᴛ Dɪsᴘʟᴀʏ Pɪᴄᴛᴜʀᴇ ᴜᴘᴅᴀᴛᴇᴅ!*\n\n📁 *Image URL:* ${imageUrl}\n\nImage will be used as bot's profile picture.`
    }, { quoted: mek });
});



// Sticker name setting command
cmd({
    pattern: "stickername",
    alias: ["stickertext", "stname"],
    desc: "Set sticker pack name",
    category: "settings",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        const currentName = userConfig.STICKER_NAME || 'Sticker Pack';
        return reply(`📌 *Usᴀɢᴇ:* .stickername Your Pack Name\n*Cᴜʀʀᴇɴᴛ:* ${currentName}`);
    }

    const stickerName = args.join(' ');
    
    userConfig.STICKER_NAME = stickerName;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ:* ${stickerName}`);
});

cmd({
    pattern: "delpath",
    alias: ["deletepath", "antidelete"],
    desc: "Set anti-delete path (same/inbox)",
    category: "settings",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    // lidToPhone conversion for sender
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* .delpath same/inbox\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ANTI_DELETE_PATH || 'inbox'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'same' && value !== 'inbox') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* same ᴏʀ inbox\n- *same*: Delete from same chat\n- *inbox*: Delete only from inbox');
    }

    userConfig.ANTI_DELETE_PATH = value;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴘᴀᴛʜ sᴇᴛ ᴛᴏ:* ${value}`);
});

// Status emojis setting command
cmd({
    pattern: "statusemojis",
    alias: ["statusreacts", "statemojis"],
    desc: "Set auto like status emojis",
    category: "settings",
    react: "❤️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        const currentEmojis = userConfig.AUTO_LIKE_EMOJI || ['❤️', '💚', '🌚', '😍', '💀', '🧡', '💛', '💙', '👻', '🖤', '🤍', '🥀'];
        return reply(`📌 *Usᴀɢᴇ:* .statusemojis ❤️,💚,🌚,😍,💀\n*Cᴜʀʀᴇɴᴛ:* ${currentEmojis.join(', ')}`);
    }

    // Join all arguments and validate strict comma separation
    const input = args.join(' ');
    
    // Check if input contains any emojis without commas between them
    // This regex matches any two consecutive emojis without a comma between them
    const consecutiveEmojisRegex = /[\p{Emoji}\u200d]+(?![,])[\p{Emoji}\u200d]+/gu;
    
    if (consecutiveEmojisRegex.test(input)) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Pʟᴇᴀsᴇ sᴇᴘᴀʀᴀᴛᴇ ᴀʟʟ ᴇᴍᴏᴊɪs ᴡɪᴛʜ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .statusemojis 💗,😍,😄,😃');
    }
    
    // Split by commas and clean up
    const emojis = input.split(',').map(e => e.trim()).filter(e => e);
    
    // Additional validation: each item should be a single emoji
    const invalidEntries = emojis.filter(emoji => {
        // Count the number of emoji characters (considering zero-width joiners for complex emojis)
        const emojiCount = Array.from(emoji).filter(c => {
            // Check if character is an emoji or emoji component
            const regex = /\p{Emoji}/u;
            return regex.test(c) || c === '\u200d'; // Include zero-width joiner
        }).length;
        
        // If there are multiple emoji characters without zero-width joiners in between, it's invalid
        const hasMultipleEmojis = Array.from(emoji).some((c, i, arr) => {
            if (i === 0) return false;
            const prev = arr[i-1];
            const regex = /\p{Emoji}/u;
            return regex.test(c) && regex.test(prev) && c !== '\u200d' && prev !== '\u200d';
        });
        
        return hasMultipleEmojis;
    });
    
    if (invalidEntries.length > 0) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Dᴏɴ\'ᴛ ᴜsᴇ ᴍᴜʟᴛɪᴘʟᴇ ᴇᴍᴏᴊɪs ᴡɪᴛʜᴏᴜᴛ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .statusemojis 💗,😍,😄,😃');
    }
    
    if (emojis.length === 0) {
        return reply('❌ *Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴠᴀʟɪᴅ ᴇᴍᴏᴊɪs*');
    }

    userConfig.AUTO_LIKE_EMOJI = emojis;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Sᴛᴀᴛᴜs ᴀᴜᴛᴏ-ʟɪᴋᴇ ᴇᴍᴏᴊɪs sᴇᴛ:*\n${emojis.join(', ')}`);
});

// React emojis setting command
cmd({
    pattern: "reactemojis",
    alias: ["reacts", "reactset"],
    desc: "Set auto react emojis",
    category: "settings",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    let senderNumber = from.split('@')[0];
    if (from.includes('@lid')) {
        senderNumber = await lidToPhone(conn, from);
    }
    
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        const currentEmojis = userConfig.REACTXEMOJIS || ['😂', '❤️', '🔥', '👏', '😮', '😢', '🤣', '👍', '🎉', '🤔', '🙏', '😍', '😊', '🥰', '💕', '🤩', '✨', '😎', '🥳', '🙌'];
        return reply(`📌 *Usᴀɢᴇ:* .reactemojis 😂,❤️,🔥,👏,😮\n*Cᴜʀʀᴇɴᴛ:* ${currentEmojis.join(', ')}`);
    }

    // Join all arguments and validate strict comma separation
    const input = args.join(' ');
    
    // Check if input contains any emojis without commas between them
    const consecutiveEmojisRegex = /[\p{Emoji}\u200d]+(?![,])[\p{Emoji}\u200d]+/gu;
    
    if (consecutiveEmojisRegex.test(input)) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Pʟᴇᴀsᴇ sᴇᴘᴀʀᴀᴛᴇ ᴀʟʟ ᴇᴍᴏᴊɪs ᴡɪᴛʜ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .reactemojis 😂,❤️,🔥,👏,😮');
    }
    
    // Split by commas and clean up
    const emojis = input.split(',').map(e => e.trim()).filter(e => e);
    
    // Additional validation: each item should be a single emoji
    const invalidEntries = emojis.filter(emoji => {
        const hasMultipleEmojis = Array.from(emoji).some((c, i, arr) => {
            if (i === 0) return false;
            const prev = arr[i-1];
            const regex = /\p{Emoji}/u;
            return regex.test(c) && regex.test(prev) && c !== '\u200d' && prev !== '\u200d';
        });
        
        return hasMultipleEmojis;
    });
    
    if (invalidEntries.length > 0) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Dᴏɴ\'ᴛ ᴜsᴇ ᴍᴜʟᴛɪᴘʟᴇ ᴇᴍᴏᴊɪs ᴡɪᴛʜᴏᴜᴛ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .reactemojis 😂,❤️,🔥,👏,😮');
    }
    
    if (emojis.length === 0) {
        return reply('❌ *Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴠᴀʟɪᴅ ᴇᴍᴏᴊɪs*');
    }

    userConfig.REACTXEMOJIS = emojis;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ ʀᴇᴀᴄᴛ ᴇᴍᴏᴊɪs sᴇᴛ:*\n${emojis.join(', ')}`);
});
