const { cmd } = require('../command');

cmd({
  pattern: "end",
  alias: ["byeall", "kickall", "endgc", "nuke"],
  desc: "Removes all members from group except specified numbers",
  category: "group",
  react: "⚠️",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  botNumber2,
  botNumber,
  isGroup,
  sender,
  metadata,
  reply
}) => {
  try {
    if (!isGroup) return await reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return await reply("❌ I must be admin to remove members.");
    if (!isCreator) return await reply("🔐 Only bot owner can use this command.");

    // List of JIDs to ignore (not remove)
    const ignoreJids = [
      botNumber2,
      botNumber,
      sender
    ];

    const groupData = metadata || await conn.groupMetadata(from);
    const participants = groupData.participants || [];
    
    // 🔥 GET ALL ADMIN JIDS (talash karo kon kon admin hai)
    const groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id);
    
    // 🔥 ADD ALL ADMINS TO IGNORE LIST (admir ko kick mat karo)
    const finalIgnoreJids = [...ignoreJids, ...groupAdmins];

    // Filter out ignored JIDs
    const targets = participants.filter(p => !finalIgnoreJids.includes(p.id));
    const jids = targets.map(p => p.id);

    if (jids.length === 0) {
      return await reply("✅ No members to remove (everyone is excluded).");
    }

    await conn.groupParticipantsUpdate(from, jids, "remove");
    await reply(`✅ Successfully ${jids.length} member${jids.length > 1 ? 's' : ''} Fucked from the group.`);

  } catch (err) {
    console.error(err);
    await reply("❌ Failed to remove members. I may not have admin permission.");
  }
});