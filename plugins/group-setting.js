const { cmd } = require("../command");

// ==================== KICK COMMAND ====================
cmd({
pattern: "kick",
alias: ["k", "remove", "fuck"],
desc: "Remove a user from the group",
category: "group",
react: "💀",
filename: __filename
}, async (conn, mek, m, {
from,
isCreator,
isBotAdmins,
isAdmins,
isGroup,
quoted,
reply,
botNumber2,
botNumber
}) => {
try {
if (!isGroup) return await reply("⚠️ This command only works in groups.");
if (!isBotAdmins) return await reply("❌ I must be admin to remove someone.");
if (!isCreator && !isAdmins) return await reply("🔐 Only bot owner or group admins can use this command.");

// Consistent user extraction logic
if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
return await reply("❓ You did not give me a user to remove!");
}
let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
if (!users) return await reply("⚠️ Couldn't determine target user.");

// Protection checks
if (users === botNumber || users === botNumber2) return await reply("🤖 I can't kick myself!");
const self = conn.user.id.split(":")[0] + '@s.whatsapp.net';
if (users === self) return await reply("👑 That's the owner! I can't remove them.");

await conn.groupParticipantsUpdate(from, [users], "remove");
await reply(`*_This Tata Has Been Fucked Successfully ✅🤡_*`, { mentions: [users] });

} catch (err) {
console.error(err);
await reply("❌ Failed to remove user. Something went wrong.");
}
});

// ==================== PROMOTE COMMAND ====================
cmd({
pattern: "promote",
alias: ["p", "giveadmin", "permote", "admin"],
desc: "Promote a user to admin",
category: "group",
react: "💀",
filename: __filename
}, async (conn, mek, m, {
from,
isCreator,
isBotAdmins,
isAdmins,
isGroup,
quoted,
reply,
botNumber2,
botNumber
}) => {
try {
if (!isGroup) return await reply("⚠️ This command only works in groups.");
if (!isBotAdmins) return await reply("❌ I must be admin to promote someone.");
if (!isAdmins && !isCreator) return await reply("🔐 Only group admins or owner can use this command.");

// Consistent user extraction logic
if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
return await reply("❓ You did not give me a user to promote!");
}
let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
if (!users) return await reply("⚠️ Couldn't determine target user.");

// Protection checks
if (users === botNumber || users === botNumber2) return await reply("🤖 I can't promote myself!");
const self = conn.user.id.split(":")[0] + '@s.whatsapp.net';
if (users === self) return await reply("👑 Owner is already super admin!");

await conn.groupParticipantsUpdate(from, [users], "promote");
// 🔥 🔥 🔥 YAHAN SE HATAYA SUCCESS MSG 🔥 🔥 🔥
// Pehle tha: await reply(`*✅ Successfully Promoted to Admin.*`, { mentions: [users] });
// Ab: KUCH NAHI - Bilkul silent

// 👇 SIRF YAHAN KUCH MAT LIKHO - SUCCESS MSG MAT BHEJO

} catch (err) {
console.error(err);
await reply("❌ Failed to promote. Something went wrong.");
}
});

// ==================== DEMOTE COMMAND ====================
cmd({
pattern: "demote",
alias: ["d", "dismiss", "removeadmin"],
desc: "Demote a group admin",
category: "group",
react: "💀",
filename: __filename
}, async (conn, mek, m, {
from,
isCreator,
isBotAdmins,
isAdmins,
isGroup,
quoted,
reply,
botNumber2,
botNumber
}) => {
try {
if (!isGroup) return await reply("⚠️ This command only works in groups.");
if (!isBotAdmins) return await reply("❌ I must be admin to demote someone.");
if (!isAdmins && !isCreator) return await reply("🔐 Only group admins or owner can use this command.");

// Consistent user extraction logic
if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
return await reply("❓ You did not give me a user to demote!");
}
let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
if (!users) return await reply("⚠️ Couldn't determine target user.");

// Protection checks
if (users === botNumber || users === botNumber2) return await reply("🤖 I can't demote myself!");
const self = conn.user.id.split(":")[0] + '@s.whatsapp.net';
if (users === self) return await reply("👑 I can't demote the owner!");

await conn.groupParticipantsUpdate(from, [users], "demote");
await reply(`*✅ Admin Successfully demoted to a normal member.*`, { mentions: [users] });

} catch (err) {
console.error(err);
await reply("❌ Failed to demote. Something went wrong.");
}
});
