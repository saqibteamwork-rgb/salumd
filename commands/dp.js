// commands/dp.js
'use strict';

const axios = require('axios');
const { getProfilePictureUrl } = require('../utils/pfpFetcher');

/**
 * .dp / .getpp / .pfp command
 */
async function dpCommand(sock, from, msg, args = []) {
    try {
        let target = null;
        let isGroupTarget = false;

        const rawArgs = (args || []).map(a => String(a).trim()).filter(Boolean);
        const firstArg = (rawArgs[0] || '').toLowerCase();

        // 1. Group DP check
        if (['group', 'gc', 'groupdp', 'gpp'].includes(firstArg)) {
            if (!from.endsWith('@g.us')) {
                return await sock.sendMessage(from, { text: "❌ Yeh command sirf groups mein kaam karti hai." }, { quoted: msg });
            }
            target = from;
            isGroupTarget = true;
        }

        // 2. Phone number in args (e.g. .getpp 923468616487 or .getpp 03468616487)
        if (!target) {
            const combined = rawArgs.join('');
            const digits = combined.replace(/[^0-9]/g, '');
            if (digits.length >= 7 && digits.length <= 15) {
                let cleanNumber = digits;
                if (cleanNumber.startsWith('03') && cleanNumber.length === 11) {
                    cleanNumber = '92' + cleanNumber.slice(1);
                }
                target = `${cleanNumber}@s.whatsapp.net`;
            }
        }

        // 3. Mentioned user (@mention)
        if (!target) {
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (mentions && mentions.length > 0) {
                target = mentions[0];
            }
        }

        // 4. Quoted message participant
        if (!target) {
            const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (participant) {
                target = participant;
            }
        }

        // 5. Default fallback to sender
        if (!target) {
            target = from.endsWith('@g.us') ? (msg.key.participant || msg.participant) : from;
        }

        if (!target) target = msg.key.participant || msg.participant || from;

        const rawTargetNumber = target.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
        const cleanTargetJid = isGroupTarget ? target : `${rawTargetNumber}@s.whatsapp.net`;

        await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } }).catch(() => {});

        console.log(`[DP] Querying DP for ${cleanTargetJid} (isGroup: ${isGroupTarget})`);

        // Fetch DP URL (Direct Raw IQ bypass + Multi-Session fallback)
        const pfpResult = await getProfilePictureUrl(sock, cleanTargetJid);

        if (!pfpResult || !pfpResult.url) {
            await sock.sendMessage(from, { react: { text: '🔒', key: msg.key } }).catch(() => {});
            const targetDisplay = isGroupTarget ? "iss Group" : `@${rawTargetNumber}`;
            return await sock.sendMessage(from, {
                text: 
`⚠️ *Profile Picture Not Available*

${isGroupTarget ? "Iss group par koi DP nahi lagi hui." : `User ${targetDisplay} ne apni WhatsApp profile picture hide kar rakhi hai ya koi DP nahi lagai hui.`}

🔒 _WhatsApp Privacy Settings ki wajah se DP load nahi ho saki._`,
                mentions: isGroupTarget ? [] : [cleanTargetJid]
            }, { quoted: msg });
        }

        // Download picture
        let imageBuffer = null;
        try {
            const res = await axios.get(pfpResult.url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 12000
            });
            imageBuffer = Buffer.from(res.data);
        } catch (dlErr) {
            console.error('[DP] Download error:', dlErr.message);
        }

        if (!imageBuffer || imageBuffer.length === 0) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: "❌ Profile picture download karne mein masla aaya. Baraye meharbani dubara try karein."
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        // Fetch WhatsApp Business metadata if target is a business account
        let bizDetails = '';
        if (!isGroupTarget) {
            try {
                const bizRes = await sock.query({
                    tag: 'iq',
                    attrs: {
                        to: 's.whatsapp.net',
                        type: 'get',
                        xmlns: 'w:biz'
                    },
                    content: [{
                        tag: 'business_profile',
                        attrs: { v: '244' },
                        content: [{ tag: 'profile', attrs: { jid: cleanTargetJid } }]
                    }]
                }, 3000).catch(() => null);

                if (bizRes) {
                    const { getBinaryNodeChild } = require('@whiskeysockets/baileys');
                    const bProfile = getBinaryNodeChild(bizRes, 'business_profile');
                    const profileNode = getBinaryNodeChild(bProfile, 'profile');
                    if (profileNode) {
                        const desc = getBinaryNodeChild(profileNode, 'description')?.content?.toString();
                        const address = getBinaryNodeChild(profileNode, 'address')?.content?.toString();
                        const email = getBinaryNodeChild(profileNode, 'email')?.content?.toString();
                        const website = getBinaryNodeChild(profileNode, 'website')?.content?.toString();
                        const cat = getBinaryNodeChild(profileNode, 'category')?.content?.toString();

                        let bParts = [];
                        if (desc) bParts.push(`📝 *Bio:* ${desc.slice(0, 100)}`);
                        if (cat) bParts.push(`🏢 *Category:* ${cat}`);
                        if (email) bParts.push(`✉️ *Email:* ${email}`);
                        if (website) bParts.push(`🌐 *Web:* ${website}`);
                        if (address) bParts.push(`📍 *Address:* ${address}`);

                        if (bParts.length > 0) {
                            bizDetails = `\n┃\n┃ 💼 *WhatsApp Business Account:*\n┃ ` + bParts.join('\n┃ ');
                        }
                    }
                }
            } catch {}
        }

        const caption = isGroupTarget
            ? `╭━━━〔 🖼️ *GROUP PROFILE PICTURE* 〕━━━┈⊷\n┃ 🏷️ *Group:* ${from}\n┃ ✨ *Quality:* ${pfpResult.quality}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
            : `╭━━━〔 🖼️ *USER / BUSINESS DP* 〕━━━┈⊷\n┃ 👤 *User:* @${rawTargetNumber}\n┃ 📱 *Number:* +${rawTargetNumber}\n┃ ✨ *Quality:* ${pfpResult.quality}${bizDetails}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        await sock.sendMessage(
            from,
            {
                image: imageBuffer,
                caption: caption,
                mentions: isGroupTarget ? [] : [cleanTargetJid]
            },
            { quoted: msg }
        );

    } catch (e) {
        console.error('[DP Command Error]:', e);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
    }
}

module.exports = dpCommand;
