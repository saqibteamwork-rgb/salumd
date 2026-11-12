const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
  pattern: "updategname",
  alias: ["gname", "setname", "groupname"],
  desc: "Change the group name",
  category: "group",
  react: "📝",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isAdmins,
  isGroup,
  q,
  reply
}) => {
  try {
    if (!isGroup) return await reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return await reply("❌ I must be admin to change group name.");
    if (!isAdmins && !isCreator) return await reply("🔐 Only admins can use this command.");
    
    if (!q) return await reply("❌ Please provide a new group name.\nExample: `gname My New Group`");

    // Limit group name length
    if (q.length > 100) {
      return await reply("⚠️ Group name is too long (max 100 characters).");
    }

    await conn.groupUpdateSubject(from, q);
    await reply(`✅ Group name changed to: *${q}*`);

  } catch (err) {
    console.error(err);
    await reply("❌ Failed to update group name.");
  }
});
