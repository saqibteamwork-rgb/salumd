const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');
const axios = require('axios');
// Import lidToPhone function from lib/functions
const { lidToPhone, cleanPN } = require('../lib/functions');    

// Helper function to convert target to proper format
async function getTargetJid(conn, target) {
    if (!target) return null;
    
    if (target.includes('@s.whatsapp.net')) return target;
    
    if (target.includes('@lid')) {
        const phoneNumber = await lidToPhone(conn, target);
        return phoneNumber + '@s.whatsapp.net';
    }
    
    return target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
}

// Helper function to extract number from JID
function extractNumber(jid) {
    if (!jid) return '';
    return jid.split('@')[0];
}

// Helper function to validate if target is a valid number
function isValidNumber(target) {
    if (!target) return false;
    const number = target.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
    return number.length >= 10;
}



// ===============================
// BAN COMMAND
// ===============================
cmd({
    pattern: "ban",
    alias: ["ban"],
    desc: "Ban a user from using the bot",
    category: "moderation",
    react: "🔨",
    filename: __filename
},
async (conn, mek, m, { from, reply, botNumber2, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let target = m.mentionedJid?.[0] || (m.quoted?.sender ?? null);

    if (!target && args[0]) {
        const cleanedNumber = args[0].replace(/[^0-9]/g, '');
        if (cleanedNumber && cleanedNumber.length >= 10) {
            target = cleanedNumber + "@s.whatsapp.net";
        }
    }

    if (!target || !isValidNumber(target)) {
        return reply("⚠️ Please provide a target to ban!\n\n*Usage:* .ban @user or .ban 923******** or reply to a message");
    }

    target = await getTargetJid(conn, target);
    if (!target) return reply("❌ Invalid target format.");

    if (target === conn.user.id.split(':')[0] + '@s.whatsapp.net' || target === botNumber2) 
        return reply("🤖 I can't ban myself!");
    
    if (target.includes(extractNumber(config.OWNER_NUMBER))) {
        return reply("👑 Cannot ban the owner!");
    }

    let bannedList = Array.isArray(userConfig.BANNED) ? [...userConfig.BANNED] : [];

    if (bannedList.includes(target)) {
        return reply("❌ This user is already banned!");
    }

    bannedList.push(target);
    userConfig.BANNED = bannedList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *User banned successfully!*\n\nUser: ${target}`);
});

// ===============================
// UNBAN COMMAND
// ===============================
cmd({
    pattern: "unban",
    alias: ["unban"],
    desc: "Unban a user from using the bot",
    category: "moderation",
    react: "🔓",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let target = m.mentionedJid?.[0] || (m.quoted?.sender ?? null);

    if (!target && args[0]) {
        const cleanedNumber = args[0].replace(/[^0-9]/g, '');
        if (cleanedNumber && cleanedNumber.length >= 10) {
            target = cleanedNumber + "@s.whatsapp.net";
        }
    }

    if (!target || !isValidNumber(target)) {
        return reply("⚠️ Please provide a target to unban!\n\n*Usage:* .unban @user or .unban 92******* or reply to a message");
    }

    target = await getTargetJid(conn, target);
    if (!target) return reply("❌ Invalid target format.");

    let bannedList = Array.isArray(userConfig.BANNED) ? [...userConfig.BANNED] : [];

    if (!bannedList.includes(target)) {
        return reply("❌ This user is not banned!");
    }

    bannedList = bannedList.filter(jid => jid !== target);
    userConfig.BANNED = bannedList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *User unbanned successfully!*\n\nUser: ${target}`);
});

// ===============================
// BANLIST COMMAND
// ===============================
cmd({
    pattern: "banlist",
    alias: ["banlist", "banned"],
    desc: "Show list of banned users",
    category: "moderation",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let bannedList = Array.isArray(userConfig.BANNED) ? userConfig.BANNED : [];

    if (bannedList.length === 0) {
        return reply("📋 *No banned users found.*");
    }

    let listText = "*📋 Banned Users List:*\n\n";
    for (let i = 0; i < bannedList.length; i++) {
        const user = bannedList[i];
        const userNumber = extractNumber(user);
        listText += `${i + 1}. ${userNumber}\n`;
    }

    await reply(listText);
});

// ===============================
// SUDO COMMAND
// ===============================
cmd({
    pattern: "sudo",
    alias: ["sudo"],
    desc: "Add a user to sudo list",
    category: "moderation",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, botNumber2, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let target = m.mentionedJid?.[0] || (m.quoted?.sender ?? null);

    if (!target && args[0]) {
        const cleanedNumber = args[0].replace(/[^0-9]/g, '');
        if (cleanedNumber && cleanedNumber.length >= 10) {
            target = cleanedNumber + "@s.whatsapp.net";
        }
    }

    if (!target || !isValidNumber(target)) {
        return reply("⚠️ Please provide a target to add to sudo!\n\n*Usage:* .sudo @user or .sudo 923******* or reply to a message");
    }

    target = await getTargetJid(conn, target);
    if (!target) return reply("❌ Invalid target format.");

    if (target === conn.user.id.split(':')[0] + '@s.whatsapp.net' || target === botNumber2) 
        return reply("🤖 I can't sudo myself!");
    
    let sudoList = Array.isArray(userConfig.SUDO) ? [...userConfig.SUDO] : [];

    if (sudoList.includes(target)) {
        return reply("❌ This user is already in sudo list!");
    }

    sudoList.push(target);
    userConfig.SUDO = sudoList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *User added to sudo list successfully!*\n\nUser: ${target}`);
});

// ===============================
// DELSUDO COMMAND
// ===============================
cmd({
    pattern: "delsudo",
    alias: ["delsudo", "removesudo"],
    desc: "Remove a user from sudo list",
    category: "moderation",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let target = m.mentionedJid?.[0] || (m.quoted?.sender ?? null);

    if (!target && args[0]) {
        const cleanedNumber = args[0].replace(/[^0-9]/g, '');
        if (cleanedNumber && cleanedNumber.length >= 10) {
            target = cleanedNumber + "@s.whatsapp.net";
        }
    }

    if (!target || !isValidNumber(target)) {
        return reply("⚠️ Please provide a target to remove from sudo!\n\n*Usage:* .delsudo @user or .delsudo 923******* or reply to a message");
    }

    target = await getTargetJid(conn, target);
    if (!target) return reply("❌ Invalid target format.");

    let sudoList = Array.isArray(userConfig.SUDO) ? [...userConfig.SUDO] : [];

    if (!sudoList.includes(target)) {
        return reply("❌ This user is not in sudo list!");
    }

    sudoList = sudoList.filter(jid => jid !== target);
    userConfig.SUDO = sudoList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *User removed from sudo list successfully!*\n\nUser: ${target}`);
});

// ===============================
// LISTSUDO COMMAND
// ===============================
cmd({
    pattern: "listsudo",
    alias: ["listsudo", "sudoers"],
    desc: "Show list of sudo users",
    category: "moderation",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let sudoList = Array.isArray(userConfig.SUDO) ? userConfig.SUDO : [];

    if (sudoList.length === 0) {
        return reply("📋 *No sudo users found.*");
    }

    let listText = "*📋 Sudo Users List:*\n\n";
    for (let i = 0; i < sudoList.length; i++) {
        const user = sudoList[i];
        const userNumber = extractNumber(user);
        listText += `${i + 1}. ${userNumber}\n`;
    }

    await reply(listText);
});