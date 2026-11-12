'use strict';

/**
 * MR SAQIB MD :: GROUP STATUS SENDER (.gcstatus / .groupstatus)
 * ============================================================================
 * Posts media (Image, Video, Audio) or text as a Group Status Mention
 * to notify all members in the group.
 * Works with:
 *   1. Direct image/video with caption: .gcstatus [optional text]
 *   2. Quoted media (image, video, voice note) with: .gcstatus [optional text]
 *   3. Text only: .gcstatus <message> or quoted text
 * Allowed for: Group Admins and Bot Owners.
 * ============================================================================
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function gcstatusCommand(sock, from, msg, isOwner, isAdmin, args = []) {
    if (!from.endsWith('@g.us')) {
        return await sock.sendMessage(from, { text: "❌ *Yeh command sirf WhatsApp Groups mein kaam karti hai!*" }, { quoted: msg });
    }

    if (!isOwner && !isAdmin) {
        return await sock.sendMessage(from, { text: "❌ *Sirf Group Admins aur Bot Owner yeh command use kar sakte hain!*" }, { quoted: msg });
    }

    try {
        // Send loading reaction
        await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } }).catch(() => {});

        // Fetch group participants for status mention
        const groupMeta = await sock.groupMetadata(from).catch(() => null);
        const participants = groupMeta?.participants ? groupMeta.participants.map(p => p.id) : [];

        // Context info with group status mention
        const contextInfo = {
            isGroupStatus: true,
            mentionedJid: participants
        };

        const captionText = args.join(' ').trim();

        // Check if the current message itself contains media (e.g. image with caption .gcstatus)
        const directMsg = msg.message;
        const directImage = directMsg?.imageMessage;
        const directVideo = directMsg?.videoMessage;

        // Check quoted message
        const quotedCtx = msg.message?.extendedTextMessage?.contextInfo;
        let quoted = quotedCtx?.quotedMessage;
        if (quoted?.ephemeralMessage?.message) quoted = quoted.ephemeralMessage.message;
        if (quoted?.viewOnceMessage?.message) quoted = quoted.viewOnceMessage.message;
        if (quoted?.viewOnceMessageV2?.message) quoted = quoted.viewOnceMessageV2.message;

        const quotedImage = quoted?.imageMessage;
        const quotedVideo = quoted?.videoMessage;
        const quotedAudio = quoted?.audioMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text;

        // 1. Direct Image Message
        if (directImage) {
            const stream = await downloadContentFromMessage(directImage, 'image');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await sock.sendMessage(from, {
                image: buffer,
                caption: captionText || "",
                mimetype: directImage.mimetype || 'image/jpeg',
                contextInfo
            });
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
            return;
        }

        // 2. Direct Video Message
        if (directVideo) {
            const stream = await downloadContentFromMessage(directVideo, 'video');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await sock.sendMessage(from, {
                video: buffer,
                caption: captionText || "",
                mimetype: directVideo.mimetype || 'video/mp4',
                contextInfo
            });
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
            return;
        }

        // 3. Quoted Image
        if (quotedImage) {
            const stream = await downloadContentFromMessage(quotedImage, 'image');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const finalCaption = captionText || quotedImage.caption || "";
            await sock.sendMessage(from, {
                image: buffer,
                caption: finalCaption,
                mimetype: quotedImage.mimetype || 'image/jpeg',
                contextInfo
            });
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
            return;
        }

        // 4. Quoted Video
        if (quotedVideo) {
            const stream = await downloadContentFromMessage(quotedVideo, 'video');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const finalCaption = captionText || quotedVideo.caption || "";
            await sock.sendMessage(from, {
                video: buffer,
                caption: finalCaption,
                mimetype: quotedVideo.mimetype || 'video/mp4',
                contextInfo
            });
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
            return;
        }

        // 5. Quoted Audio / Voice note
        if (quotedAudio) {
            const stream = await downloadContentFromMessage(quotedAudio, 'audio');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const isPtt = quotedAudio.ptt || false;
            await sock.sendMessage(from, {
                audio: buffer,
                mimetype: isPtt ? 'audio/ogg; codecs=opus' : (quotedAudio.mimetype || 'audio/mp4'),
                ptt: isPtt,
                contextInfo
            });
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
            return;
        }

        // 6. Text Status (From args or quoted text)
        const statusText = captionText || quotedText;
        if (statusText) {
            await sock.sendMessage(from, {
                text: statusText,
                contextInfo
            });
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } }).catch(() => {});
            return;
        }

        // 7. No media or text provided
        await sock.sendMessage(from, { react: { text: "❓", key: msg.key } }).catch(() => {});
        const helpText = 
`╭━━━〔 📢 *GROUP STATUS MENTION* 〕━━━┈⊷
┃
┃ 📌 *Use kaise karein:*
┃
┃ 1️⃣ *Direct Photo / Video:*
┃    Photo attach karein aur caption mein likhein:
┃    👉 *.gcstatus* [koi text agar chahein]
┃
┃ 2️⃣ *Media ko Reply karke:*
┃    Kisi bhi photo/video ko reply karke likhein:
┃    👉 *.gcstatus*
┃
┃ 3️⃣ *Text Status:*
┃    👉 *.gcstatus Hello Group Members!*
┃
┃ 👥 *Yeh message group ke tamam members*
┃ *ko status mention ki tarah notify karega!*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        await sock.sendMessage(from, { text: helpText }, { quoted: msg });

    } catch (err) {
        console.error('[gcstatusCommand Error]:', err);
        await sock.sendMessage(from, { react: { text: "❌", key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, { text: `❌ *Error:* ${err.message}` }, { quoted: msg });
    }
}

module.exports = { gcstatusCommand };
