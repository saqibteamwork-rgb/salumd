// commands/mimicVoice.js
'use strict';

/**
 * SALU MD :: Voice Mimic & Mirror Engine (.mt)
 * ============================================================================
 * Features:
 * - .mt                : Replies to any voice note or audio, and sends the EXACT
 *                        same voice note from our side as a native WhatsApp PTT.
 * - .mt fresh          : Sends the voice note without quoting (standalone).
 * - .mt keep           : Does not delete the .mt command message if sent by me.
 * - .mt d              : Full usage guide and examples.
 * ============================================================================
 */

const { downloadContentFromMessage, downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const crypto = require('crypto');

ffmpeg.setFfmpegPath(ffmpegStatic);

const TEMP_DIR = path.join(__dirname, '..', 'temp');
fs.ensureDirSync(TEMP_DIR);

async function streamToBuffer(stream) {
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

/**
 * Inspects msg for any quoted or direct audio/voice/video media
 */
function findAudioMedia(msg) {
    const message = msg?.message;
    const contextInfo = message?.extendedTextMessage?.contextInfo ||
                        message?.imageMessage?.contextInfo ||
                        message?.videoMessage?.contextInfo ||
                        message?.audioMessage?.contextInfo ||
                        message?.documentMessage?.contextInfo;

    const quoted = contextInfo?.quotedMessage;

    // 1. Quoted Message (Priority: user replies to voice note)
    if (quoted) {
        if (quoted.audioMessage) {
            return { media: quoted.audioMessage, type: 'audio', quoted, isQuoted: true, contextInfo };
        }
        if (quoted.viewOnceMessage?.message?.audioMessage) {
            return { media: quoted.viewOnceMessage.message.audioMessage, type: 'audio', quoted, isQuoted: true, contextInfo };
        }
        if (quoted.viewOnceMessageV2?.message?.audioMessage) {
            return { media: quoted.viewOnceMessageV2.message.audioMessage, type: 'audio', quoted, isQuoted: true, contextInfo };
        }
        if (quoted.viewOnceMessageV2Extension?.message?.audioMessage) {
            return { media: quoted.viewOnceMessageV2Extension.message.audioMessage, type: 'audio', quoted, isQuoted: true, contextInfo };
        }
        if (quoted.videoMessage) {
            return { media: quoted.videoMessage, type: 'video', quoted, isQuoted: true, contextInfo };
        }
        if (quoted.viewOnceMessage?.message?.videoMessage) {
            return { media: quoted.viewOnceMessage.message.videoMessage, type: 'video', quoted, isQuoted: true, contextInfo };
        }
        if (quoted.documentMessage && (quoted.documentMessage.mimetype || '').startsWith('audio/')) {
            return { media: quoted.documentMessage, type: 'document', quoted, isQuoted: true, contextInfo };
        }
    }

    // 2. Direct message itself
    if (message?.audioMessage) {
        return { media: message.audioMessage, type: 'audio', quoted: null, isQuoted: false, contextInfo: null };
    }
    if (message?.viewOnceMessage?.message?.audioMessage) {
        return { media: message.viewOnceMessage.message.audioMessage, type: 'audio', quoted: null, isQuoted: false, contextInfo: null };
    }
    if (message?.videoMessage) {
        return { media: message.videoMessage, type: 'video', quoted: null, isQuoted: false, contextInfo: null };
    }

    return null;
}

/**
 * .mt / .mimic / .voicecopy / .mirrorvoice
 * Sends the replied voice note as our own WhatsApp PTT voice note
 */
async function mtCommand(sock, from, msg, args = []) {
    try {
        const rawArgs = (args || []).map(a => String(a).trim().toLowerCase());
        const firstArg = rawArgs[0] || '';

        // If user wants details/help
        if (['d', 'help', 'guide'].includes(firstArg)) {
            return await sock.sendMessage(from, {
                text:
`╭━━━〔 🎙️ *VOICE MIMIC / MIRROR (.mt)* 〕━━━┈⊷
┃ 📌 *Description:*
┃ Kisi bhi aane wali Voice Note ko hamari taraf se
┃ exact same voice note (PTT) bana kar send karta hai!
┃
┃ 💡 *Kaise Use Karein:*
┃ 1️⃣ Kisi ki aayi hui Voice Note ko *Reply* karein.
┃ 2️⃣ Type karein: *.mt*
┃ 3️⃣ Bot wahi voice hamari taraf se send kar dega!
┃
┃ ⚙️ *Options:*
┃ 👉 *.mt*       ➜ Replying directly to original voice note
┃ 👉 *.mt fresh* ➜ Bina kisi quote ke fresh voice note
┃ 👉 *.mt keep*  ➜ .mt message ko chat se delete nahi karega
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: msg });
        }

        const found = findAudioMedia(msg);

        if (!found || !found.media) {
            return await sock.sendMessage(from, {
                text:
`╭━━━〔 🎙️ *VOICE MIMIC ENGINE (.mt)* 〕━━━┈⊷
┃ ⚠️ *Kisi bhi Voice Note ya Audio ko Reply karein!*
┃
┃ 💡 *Kaise Use Karein:*
┃ 1️⃣ Kisi dost ya member ki *Voice Note* ko *Reply* karein.
┃ 2️⃣ Type karein: *.mt*
┃ 3️⃣ Wahi same voice note hamari taraf se send ho jayegi!
┃
┃ 📌 *Examples:*
┃ 👉 *(Voice ko reply karein)* ➜ *.mt*
┃ 👉 *(Voice ko reply karein)* ➜ *.mt fresh*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🎙️', key: msg.key } }).catch(() => {});

        const mediaObj = found.media;
        const downloadType = found.type === 'video' ? 'video' : (found.type === 'document' ? 'document' : 'audio');

        let rawBuffer = null;

        // 1. Try Baileys downloadMediaMessage with automatic reuploadRequest (handles expired 403 CDN URLs)
        try {
            const targetMsgToDownload = {
                key: {
                    remoteJid: from,
                    id: found.contextInfo?.stanzaId || msg.key.id,
                    participant: found.contextInfo?.participant,
                    fromMe: false
                },
                message: found.quoted || msg.message
            };

            rawBuffer = await downloadMediaMessage(
                targetMsgToDownload,
                'buffer',
                {},
                {
                    logger: sock.logger,
                    reuploadRequest: sock.updateMediaMessage ? sock.updateMediaMessage.bind(sock) : undefined
                }
            );
        } catch (downloadErr) {
            console.log('[MimicVoice] downloadMediaMessage failed, falling back to downloadContentFromMessage:', downloadErr.message);
        }

        // 2. Fallback to direct stream if downloadMediaMessage was empty or failed
        if (!rawBuffer || rawBuffer.length === 0) {
            try {
                const stream = await downloadContentFromMessage(mediaObj, downloadType);
                rawBuffer = await streamToBuffer(stream);
            } catch (streamErr) {
                console.error('[MimicVoice] Stream Download Error:', streamErr.message);
            }
        }

        if (!rawBuffer || rawBuffer.length === 0) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: "❌ *Voice note download nahi ho saki!*\nYeh voice note WhatsApp server par expire ho chuki hai. Bara-e-meherbani kisi taaza (fresh) voice note ko reply karein."
            }, { quoted: msg });
        }

        let finalAudioBuffer = rawBuffer;
        const isAlreadyOpusOgg = (mediaObj.mimetype || '').includes('ogg') && (mediaObj.mimetype || '').includes('opus');
        const isPtt = !!mediaObj.ptt;

        // If it's a video, mp3, m4a, or non-opus audio, convert using ffmpeg
        if (!isAlreadyOpusOgg && (!isPtt || found.type === 'video' || found.type === 'document')) {
            const randId = crypto.randomBytes(6).toString('hex');
            const inExt = found.type === 'video' ? 'mp4' : 'audio';
            const inPath = path.join(TEMP_DIR, `${randId}_in.${inExt}`);
            const outPath = path.join(TEMP_DIR, `${randId}_out.ogg`);

            try {
                await fs.writeFile(inPath, rawBuffer);

                await new Promise((resolve, reject) => {
                    ffmpeg(inPath)
                        .toFormat('ogg')
                        .audioCodec('libopus')
                        .audioChannels(1)
                        .audioFrequency(48000)
                        .on('end', resolve)
                        .on('error', reject)
                        .save(outPath);
                });

                finalAudioBuffer = await fs.readFile(outPath);
            } catch (convErr) {
                console.error('[MimicVoice Conversion Error]:', convErr.message);
                // Fall back to original buffer
                finalAudioBuffer = rawBuffer;
            } finally {
                try { await fs.remove(inPath); } catch {}
                try { await fs.remove(outPath); } catch {}
            }
        }

        // Build target quote key
        let targetQuoted = null;
        const wantsFresh = rawArgs.includes('fresh') || rawArgs.includes('noquote') || rawArgs.includes('raw');

        if (!wantsFresh && found.contextInfo?.stanzaId) {
            const isGroup = from.endsWith('@g.us');
            targetQuoted = {
                key: {
                    remoteJid: from,
                    fromMe: false,
                    id: found.contextInfo.stanzaId,
                    ...(isGroup && found.contextInfo.participant ? { participant: found.contextInfo.participant } : {})
                },
                message: found.quoted
            };
        }

        // Send native WhatsApp Voice Note (PTT)
        await sock.sendMessage(from, {
            audio: finalAudioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            seconds: mediaObj.seconds || undefined,
            waveform: mediaObj.waveform || undefined
        }, {
            quoted: targetQuoted || (wantsFresh ? undefined : msg)
        });

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        // If the command was triggered by the bot owner/me, auto-delete the .mt command message
        // so only the voice note appears in the chat (unless .mt keep was requested)
        if (msg.key.fromMe && !rawArgs.includes('keep')) {
            try {
                await sock.sendMessage(from, { delete: msg.key });
            } catch {}
        }

    } catch (e) {
        console.error('[mtCommand Error]:', e);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, {
            text: `❌ Voice mirror fail ho gaya: ${e.message}`
        }, { quoted: msg });
    }
}

module.exports = {
    mtCommand,
    findAudioMedia
};
