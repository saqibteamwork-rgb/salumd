'use strict';

/**
 * SALU MD :: ANTI-STATUS PROTECTION ENGINE (.antistatus)
 * ============================================================================
 * Protects groups from WhatsApp status broadcast mentions and status forwards.
 * Modes:
 * - .antistatus delete / on : Automatically deletes any status mentioned in the group
 * - .antistatus kick        : Automatically deletes status AND removes/kicks the offender
 * - .antistatus off         : Disables protection
 * ============================================================================
 */

async function antistatusCommand(sock, from, msg, isAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) {
        return await sock.sendMessage(from, { text: "❌ *Sirf Groups mein use ho sakta hai!*" }, { quoted: msg });
    }
    if (!isAdmin) {
        return await sock.sendMessage(from, { text: "❌ *Sirf Group Admins aur Owner ye command chala sakte hain!*" }, { quoted: msg });
    }

    const action = (args[0] || '').toLowerCase().trim();
    if (!botData.antiStatusGroups) botData.antiStatusGroups = {};

    const currentMode = botData.antiStatusGroups[from];

    if (!action) {
        let statusDisplay = '❌ *OFF (Disabled)*';
        if (currentMode === 'kick') statusDisplay = '🚨 *ON (Delete + Kick Sender)*';
        else if (currentMode === 'delete' || currentMode === true || currentMode === 'on') statusDisplay = '🛡️ *ON (Auto Delete Status)*';

        const card =
`╭━━━〔 🛡️ *ANTI-STATUS SYSTEM* 〕━━━┈⊷
┃
┃ 📊 *Current Status:*
┃    ${statusDisplay}
┃
┃ ⚙️ *Available Settings:*
┃ ⋄ *.antistatus delete* / *.antistatus on*
┃   └ Status mention ko chupke se delete karega
┃
┃ ⋄ *.antistatus kick*
┃   └ Status mention delete karega + bhejny wale ko group se remove (kick) karega
┃
┃ ⋄ *.antistatus off*
┃   └ Protection disable karega
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *SALU MD Protection*`;
        return await sock.sendMessage(from, { text: card }, { quoted: msg });
    }

    if (action === 'on' || action === 'delete') {
        botData.antiStatusGroups[from] = 'delete';
        saveBotData();
        return await sock.sendMessage(from, {
            text: "✅ *Anti-Status Enabled (Delete Mode)!*\n\nAb agar koi bhi is group mein status mention ya status share karega toh uska message foran delete ho jayega."
        }, { quoted: msg });
    }

    if (action === 'kick' || action === 'remove') {
        botData.antiStatusGroups[from] = 'kick';
        saveBotData();
        return await sock.sendMessage(from, {
            text: "🚨 *Anti-Status Enabled (KICK Mode)!*\n\nAb agar koi bhi is group mein status mention karega toh message delete hoga aur user ko group se **remove (kick)** kar diya jayega!"
        }, { quoted: msg });
    }

    if (action === 'off' || action === 'disable') {
        delete botData.antiStatusGroups[from];
        saveBotData();
        return await sock.sendMessage(from, {
            text: "❌ *Anti-Status Disabled!*\n\nGroup se status protection band kar di gayi hai."
        }, { quoted: msg });
    }

    return await sock.sendMessage(from, {
        text: "❌ *Invalid Option!*\n\n*Usage:*\n• `.antistatus delete` (Auto delete)\n• `.antistatus kick` (Delete + Kick)\n• `.antistatus off` (Band karein)"
    }, { quoted: msg });
}

module.exports = antistatusCommand;
