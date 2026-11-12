// commands/stickerReact.js
'use strict';

/**
 * MR SAQIB MD :: Sticker Saver & Multi-Sticker Reaction Engine
 * ============================================================================
 * Commands:
 * - .sts <name>        : Save any quoted sticker with custom name (Personal to sender)
 * - .sts list          : View all saved stickers (Personal vs Global)
 * - .sts del <name>    : Delete a saved sticker (Owner/Admin protected)
 * - .rs [count]        : React with sender's own saved stickers (Auto Mixup/Combo!)
 * - .rs <name> [count] : React with specific saved sticker (e.g. .rs dog 5)
 * - .rs10              : Quick 10x reaction using sender's own saved stickers
 * - .rs global [count] : React with global pool of all stickers
 * ============================================================================
 */

const fs = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage, jidNormalizedUser } = require('@whiskeysockets/baileys');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STICKERS_DIR = path.join(DATA_DIR, 'stickers');
const STICKERS_FILE = path.join(DATA_DIR, 'saved_stickers.json');

fs.ensureDirSync(STICKERS_DIR);

function toBase64(val) {
    if (!val) return '';
    if (Buffer.isBuffer(val)) return val.toString('base64');
    if (val instanceof Uint8Array) return Buffer.from(val).toString('base64');
    if (typeof val === 'string') return val;
    return '';
}

function ensureBuffer(val) {
    if (!val) return null;
    if (Buffer.isBuffer(val)) return val;
    if (val instanceof Uint8Array) return Buffer.from(val);
    if (typeof val === 'string') return Buffer.from(val, 'base64');
    return null;
}

function loadSavedStickers() {
    try {
        if (fs.existsSync(STICKERS_FILE)) {
            return fs.readJsonSync(STICKERS_FILE) || {};
        }
    } catch (e) {
        console.error('[StickerStore Load Error]:', e.message);
    }
    return {};
}

function persistStickers(data) {
    try {
        fs.ensureDirSync(DATA_DIR);
        fs.writeJsonSync(STICKERS_FILE, data, { spaces: 2 });
    } catch (e) {
        console.error('[StickerStore Save Error]:', e.message);
    }
}

async function streamToBuffer(stream) {
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

/**
 * Extracts and normalizes all potential user identity markers (Phone JID, LID, digits)
 * so that stickers saved by a user match whether the message comes with JID or LID.
 */
async function extractUserIdentifiers(sock, from, msg) {
    const rawSender = msg?.key?.participant || msg?.participant || (msg?.key?.fromMe ? sock?.user?.id : from) || '';
    let cleanRaw = String(rawSender).split(':')[0];
    let phoneJid = '';
    let lidJid = '';

    if (cleanRaw.endsWith('@lid')) {
        lidJid = cleanRaw;
    } else if (cleanRaw.endsWith('@s.whatsapp.net')) {
        phoneJid = cleanRaw;
    }

    if (msg?.key?.fromMe && sock?.user) {
        if (sock.user.id) {
            phoneJid = jidNormalizedUser(sock.user.id);
        }
        if (sock.user.lid) {
            lidJid = jidNormalizedUser(sock.user.lid);
        }
    }

    // In group chats, resolve both phone JID and LID from group metadata if available
    if (from && from.endsWith('@g.us') && sock?.groupMetadata) {
        try {
            const meta = await sock.groupMetadata(from).catch(() => null);
            if (meta?.participants) {
                const p = meta.participants.find(part => {
                    const pId = (part.id || '').split(':')[0];
                    const pLid = (part.lid || '').split(':')[0];
                    return (pId && (pId === cleanRaw || pId === phoneJid)) ||
                           (pLid && (pLid === cleanRaw || pLid === lidJid));
                });
                if (p) {
                    if (p.id) phoneJid = jidNormalizedUser(p.id);
                    if (p.lid) lidJid = jidNormalizedUser(p.lid);
                }
            }
        } catch {}
    }

    const phoneDigits = phoneJid ? phoneJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '') : '';
    const lidDigits = lidJid ? lidJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '') : '';
    const rawDigits = cleanRaw ? cleanRaw.split('@')[0].split(':')[0].replace(/[^0-9]/g, '') : '';

    const allIds = new Set(
        [cleanRaw, phoneJid, lidJid, phoneDigits, lidDigits, rawDigits]
            .filter(Boolean)
            .map(s => String(s).toLowerCase())
    );

    return {
        rawSender: cleanRaw,
        phoneJid,
        lidJid,
        phoneDigits,
        lidDigits,
        rawDigits,
        allIds
    };
}

/**
 * Checks if a saved sticker record belongs to a specific user
 */
function isStickerOwnedByUser(s, userIds) {
    if (!s || !userIds || !userIds.allIds) return false;

    const sSavedBy = String(s.savedBy || '').toLowerCase().split(':')[0];
    const sSavedByLid = String(s.savedByLid || '').toLowerCase().split(':')[0];
    const sSavedByPhone = String(s.savedByPhone || '').toLowerCase().split(':')[0];
    const sSavedByDigits = String(s.savedByDigits || '').replace(/[^0-9]/g, '');

    const candidates = [
        sSavedBy,
        sSavedByLid,
        sSavedByPhone,
        sSavedByDigits,
        sSavedBy.split('@')[0].replace(/[^0-9]/g, ''),
        sSavedByLid.split('@')[0].replace(/[^0-9]/g, ''),
        sSavedByPhone.split('@')[0].replace(/[^0-9]/g, '')
    ].filter(Boolean);

    for (const c of candidates) {
        if (userIds.allIds.has(c)) {
            return true;
        }
    }
    return false;
}

/**
 * Retrieves valid sticker keys belonging to a specific user
 */
function getUserStickers(stickers, userIds) {
    const keys = Object.keys(stickers).filter(k => !k.startsWith('_') && stickers[k] && (stickers[k].url || stickers[k].directPath || stickers[k].fileSha256));
    const userKeys = [];
    const seen = new Set();

    for (const k of keys) {
        const s = stickers[k];
        if (isStickerOwnedByUser(s, userIds)) {
            const hash = s.fileSha256 || s.url || k;
            if (!seen.has(hash)) {
                seen.add(hash);
                userKeys.push(k);
            }
        }
    }
    return userKeys;
}

/**
 * .sts / .savesticker
 * Saves a quoted sticker to database with sender identity tagging
 */
async function saveStickerCommand(sock, from, msg, args = []) {
    try {
        const rawArgs = (args || []).map(a => String(a).trim()).filter(Boolean);
        const firstArg = (rawArgs[0] || '').toLowerCase();

        const stickers = loadSavedStickers();
        const userIds = await extractUserIdentifiers(sock, from, msg);

        // 1. List saved stickers (Separating User's own stickers from Global ones)
        if (['list', 'all', 'ls'].includes(firstArg)) {
            const allKeys = Object.keys(stickers).filter(k => !k.startsWith('_') && stickers[k]?.url);
            const myKeys = getUserStickers(stickers, userIds);
            const otherKeys = allKeys.filter(k => !myKeys.includes(k));

            if (allKeys.length === 0) {
                return await sock.sendMessage(from, {
                    text:
`╭━━━〔 💾 *SAVED STICKERS* 〕━━━┈⊷
┃ 📭 Abhi tak koi sticker save nahi kiya gaya.
┃
┃ 💡 *Sticker Save Karne Ka Tarika:*
┃ 1️⃣ Kisi bhi sticker ko *Reply* karein.
┃ 2️⃣ Type karein: *.sts <name>*  (e.g. *.sts dog*)
┃ 3️⃣ Phir message ko reply karke likhein: *.rs 5*
┃    ➜ *Aapke apne stickers react honge!*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
                }, { quoted: msg });
            }

            let listText = `╭━━━〔 💾 *SAVED STICKERS MANAGER* 〕━━━┈⊷\n`;

            if (myKeys.length > 0) {
                listText += `┃ 👤 *Aapke Personal Stickers (${myKeys.length}):*\n`;
                myKeys.forEach((k, idx) => {
                    const s = stickers[k];
                    const typeLabel = s.isAnimated ? 'Animated' : 'Static';
                    listText += `┃  ${idx + 1}. *${k}* ➜ _${typeLabel}_\n`;
                });
                listText += `┃\n`;
            } else {
                listText += `┃ 👤 *Aapke Personal Stickers:* _(Koi nahi mila)_\n`;
                listText += `┃    👉 *Save karein:* Sticker ko reply karke *.sts <name>*\n┃\n`;
            }

            if (otherKeys.length > 0) {
                listText += `┃ 🌐 *Public / Other Stickers (${otherKeys.length}):*\n`;
                const displayOthers = otherKeys.slice(0, 10);
                displayOthers.forEach((k, idx) => {
                    listText += `┃  • *${k}*\n`;
                });
                if (otherKeys.length > 10) {
                    listText += `┃  _...aur ${otherKeys.length - 10} mazeed stickers_\n`;
                }
            }
            listText += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            listText += `💡 *React Karne Ke Tareeqay:*\n`;
            if (myKeys.length > 0) {
                listText += `👉 *.rs 5*  _(Aapke apne ${myKeys.length} stickers ka Mixup combo!)_\n`;
                listText += `👉 *.rs 10*  _(10 bar aapke stickers ka combo react)_\n`;
            } else {
                listText += `👉 *.rs dog 5*  _(Default dog sticker react)_\n`;
            }
            listText += `👉 *.rs global 5*  _(Tamam stickers ka global mixup)_\n`;
            listText += `👉 *.was*  _(Single sticker reaction)_`;

            return await sock.sendMessage(from, { text: listText }, { quoted: msg });
        }

        // 2. Delete sticker (Protected: Only the owner or bot admin can delete)
        if (['del', 'delete', 'remove', 'rm'].includes(firstArg)) {
            const targetName = (rawArgs[1] || '').toLowerCase();
            if (!targetName) {
                return await sock.sendMessage(from, {
                    text: "❌ *Usage:* `.sts del <sticker_name>`"
                }, { quoted: msg });
            }
            const s = stickers[targetName];
            if (!s) {
                return await sock.sendMessage(from, {
                    text: `❌ Sticker *"${targetName}"* save nahi mila.`
                }, { quoted: msg });
            }

            const isOwner = isStickerOwnedByUser(s, userIds);
            const isBotAdmin = msg.key.fromMe || (sock.user?.id && userIds.allIds.has(jidNormalizedUser(sock.user.id).split('@')[0]));

            if (!isOwner && !isBotAdmin) {
                return await sock.sendMessage(from, {
                    text: `❌ *Permission Denied!* Aap sirf apne save kiye hue stickers delete kar sakte hain.`
                }, { quoted: msg });
            }

            const filePath = path.join(STICKERS_DIR, `${targetName}.webp`);
            try { await fs.remove(filePath); } catch {}

            delete stickers[targetName];
            if (stickers._latest === targetName) {
                const remaining = Object.keys(stickers).filter(k => !k.startsWith('_'));
                stickers._latest = remaining[0] || null;
            }
            persistStickers(stickers);

            await sock.sendMessage(from, { react: { text: '🗑️', key: msg.key } }).catch(() => {});
            return await sock.sendMessage(from, {
                text: `✅ Sticker *"${targetName}"* successfully delete ho gaya!`
            }, { quoted: msg });
        }

        // 3. Save new sticker
        let quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.ephemeralMessage?.message) quoted = quoted.ephemeralMessage.message;
        if (quoted?.viewOnceMessage?.message) quoted = quoted.viewOnceMessage.message;
        if (quoted?.viewOnceMessageV2?.message) quoted = quoted.viewOnceMessageV2.message;
        if (quoted?.documentWithCaptionMessage?.message) quoted = quoted.documentWithCaptionMessage.message;

        const targetSticker = quoted?.stickerMessage || msg.message?.stickerMessage;

        if (!targetSticker) {
            return await sock.sendMessage(from, {
                text:
`╭━━━〔 💾 *SAVE STICKER ENGINE* 〕━━━┈⊷
┃ 📌 *Sticker Save Karne Ka Tarika:*
┃ 1️⃣ Apne phone ke kisi bhi sticker ko *Reply* karein.
┃ 2️⃣ Type karein: *.sts <name>*
┃    Example: *.sts dog* ya *.sts fire*
┃
┃ ⚡ *Auto Personal Isolation:*
┃    Jo sticker aap save karenge, *.rs* likhne par
┃    sirf *Aapke Apne* stickers react honge!
┃
┃ 📋 *Commands:*
┃ 👉 *.sts list* ➜ Saved stickers list
┃ 👉 *.sts del <name>* ➜ Delete sticker
┃ 👉 *.rs 5* ➜ React with your saved stickers
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } }).catch(() => {});

        let stickerName = (rawArgs[0] || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!stickerName) {
            const count = Object.keys(stickers).filter(k => !k.startsWith('_')).length + 1;
            stickerName = `stk_${count}`;
        }

        let stickerBuffer = null;
        try {
            const stream = await downloadContentFromMessage(targetSticker, 'sticker');
            stickerBuffer = await streamToBuffer(stream);
            if (stickerBuffer && stickerBuffer.length > 0) {
                const filePath = path.join(STICKERS_DIR, `${stickerName}.webp`);
                await fs.writeFile(filePath, stickerBuffer);
            }
        } catch {}

        const finalFileLength = targetSticker.fileLength ? Number(targetSticker.fileLength) : (stickerBuffer?.length || 134248);

        // Save complete WhatsApp CDN payload with full dimensions, byte lengths, and user identity tags
        stickers[stickerName] = {
            name: stickerName,
            url: targetSticker.url || '',
            fileSha256: toBase64(targetSticker.fileSha256),
            fileEncSha256: toBase64(targetSticker.fileEncSha256),
            mediaKey: toBase64(targetSticker.mediaKey),
            fileLength: finalFileLength,
            height: 512,
            width: 512,
            mimetype: targetSticker.mimetype || 'image/webp',
            directPath: targetSticker.directPath || '',
            isAnimated: !!targetSticker.isAnimated,
            isAvatar: !!targetSticker.isAvatar,
            isLottie: !!targetSticker.isLottie,
            savedAt: Date.now(),
            savedBy: userIds.phoneJid || userIds.rawSender,
            savedByLid: userIds.lidJid || '',
            savedByPhone: userIds.phoneJid || '',
            savedByDigits: userIds.phoneDigits || userIds.lidDigits || userIds.rawDigits || '',
            savedByPushName: msg.pushName || ''
        };

        stickers._latest = stickerName;
        stickers._userLatest = stickers._userLatest || {};
        const userKey = userIds.phoneDigits || userIds.lidDigits || userIds.rawDigits;
        if (userKey) {
            stickers._userLatest[userKey] = stickerName;
        }

        persistStickers(stickers);

        const myTotal = getUserStickers(stickers, userIds).length;

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ✅ *STICKER SAVED TO YOUR PERSONAL POOL!* 〕━━━┈⊷
┃ 🏷️ *Name:* ${stickerName}
┃ ✨ *Type:* ${targetSticker.isAnimated ? 'Animated' : 'Static'}
┃ 👤 *Aapke Saved Stickers:* ${myTotal} Stickers
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

💡 *Ab kisi bhi message ko reply karke likhein:*
👉 *.rs 5*  _(Aapke save kiye hue stickers ka Mixup/Combo react hoga!)_
👉 *.rs 10*  _(10 bar Mixup combo reaction)_
👉 *.rs ${stickerName} 5*  _(Sirf ${stickerName} react hoga)_
👉 *.was*  _(Single sticker reaction)_`
        }, { quoted: msg });

    } catch (e) {
        console.error('[saveStickerCommand Error]:', e);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
    }
}

/**
 * .rs / .rs10 / .sreact
 * Sends WhatsApp native sticker reaction (associationType: 11) onto the target message.
 * User Isolation:
 * - If user types .rs or .rs <count>, it uses ONLY stickers saved by THAT USER!
 * - If user has 1 sticker, repeats that sticker.
 * - If user has multiple stickers, cycles/mixes through only that user's stickers!
 * - If user specifically requests a sticker name (e.g. .rs dog 5), it reacts with that sticker.
 * - If user has no saved stickers, prompts them with instructions or allows .rs dog / .rs global.
 */
async function repeatReactCommand(sock, from, msg, args = [], commandName = 'rs') {
    try {
        const rawArgs = (args || []).map(a => String(a).trim()).filter(Boolean);
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const stanzaId = contextInfo?.stanzaId;
        const participant = contextInfo?.participant;
        const quotedMsgContent = contextInfo?.quotedMessage;

        if (!stanzaId) {
            return await sock.sendMessage(from, {
                text:
`╭━━━〔 ⚡ *STICKER REACTION (.rs)* 〕━━━┈⊷
┃ ⚠️ *Jis message par sticker react karna hai,*
┃    *us message ko Reply karein!*
┃
┃ 📌 *Syntax:*
┃ 👉 *.rs 5*  _(Aapke apne saved stickers ka Mixup/Combo react)_
┃ 👉 *.rs 10*  _(10 bar aapke stickers ka combo react)_
┃ 👉 *.rs <name> <times>*  _(e.g. *.rs dog 5* - Sirf ek sticker)_
┃ 👉 *.rs global 5*  _(Tamam stickers ka global mixup)_
┃ 👉 *.was*  _(Single sticker reaction)_
┃
┃ 💡 *Saved stickers dekhne ke liye:* *.sts list*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: msg });
        }

        // Determine repeat count
        let count = 5; // default 5
        let specifiedName = null;

        const numInCmd = commandName.replace(/[^0-9]/g, '');
        if (numInCmd) {
            count = parseInt(numInCmd, 10);
        }

        for (const arg of rawArgs) {
            const num = parseInt(arg, 10);
            if (!isNaN(num) && num > 0) {
                count = num;
            } else if (!specifiedName) {
                specifiedName = arg.toLowerCase();
            }
        }

        // Safety cap: min 1, max 20
        if (count < 1) count = 1;
        if (count > 20) count = 20;

        const isGroup = from.endsWith('@g.us');
        const myJid = sock.user?.id ? jidNormalizedUser(sock.user.id) : '';
        const myLid = sock.user?.lid ? jidNormalizedUser(sock.user.lid) : '';
        const quotedNorm = participant ? jidNormalizedUser(participant) : '';

        // Detect if the replied message was sent by the bot
        let isFromMe = false;
        if (quotedNorm) {
            if (quotedNorm === myJid || quotedNorm === myLid) {
                isFromMe = true;
            }
        } else if (!isGroup && msg.key.fromMe) {
            isFromMe = true;
        }

        let isMixupMode = false;
        let chosenKey = null;
        let stickerPayload = null;
        let poolPayloads = [];

        // 1. Quoted message itself is a sticker!
        if (quotedMsgContent?.stickerMessage && !specifiedName) {
            const sm = quotedMsgContent.stickerMessage;
            stickerPayload = {
                url: sm.url,
                fileSha256: ensureBuffer(sm.fileSha256),
                fileEncSha256: ensureBuffer(sm.fileEncSha256),
                mediaKey: ensureBuffer(sm.mediaKey),
                fileLength: sm.fileLength ? Number(sm.fileLength) : 134248,
                height: 512,
                width: 512,
                mimetype: sm.mimetype || 'image/webp',
                directPath: sm.directPath,
                isAnimated: !!sm.isAnimated,
                isAvatar: false,
                isLottie: false
            };
            poolPayloads = [stickerPayload];
        } else {
            // 2. Load from saved stickers
            const stickers = loadSavedStickers();
            const userIds = await extractUserIdentifiers(sock, from, msg);
            const myStickerKeys = getUserStickers(stickers, userIds);

            const allKeys = Object.keys(stickers).filter(k => !k.startsWith('_') && stickers[k] && (stickers[k].url || stickers[k].directPath || stickers[k].fileSha256));

            // Check if user specifically requested a single sticker by name
            const isGlobalRequested = ['global', 'all', 'everyone', 'public'].includes(specifiedName);
            const isPersonalRequested = ['my', 'mine', 'me', 'mix', 'combo', 'random', 'any'].includes(specifiedName);

            if (specifiedName && !isGlobalRequested && !isPersonalRequested) {
                // User asked for a specific sticker by name, e.g. .rs dog 5 or .rs stk_5 10
                if (stickers[specifiedName]) {
                    chosenKey = specifiedName;
                } else {
                    chosenKey = Object.keys(stickers).find(k => k.toLowerCase() === specifiedName);
                }

                if (!chosenKey || !stickers[chosenKey]) {
                    return await sock.sendMessage(from, {
                        text:
`❌ Sticker *"${specifiedName}"* save nahi mila!

💡 *Aapke saved stickers dekhne ke liye:* *.sts list*
👉 *Apne stickers react karne ke liye:* *.rs 5*
👉 *Default sticker ke liye:* *.rs dog 5*`
                    }, { quoted: msg });
                }
            } else if (isGlobalRequested) {
                // Explicitly requested global mixup
                isMixupMode = true;
                const seen = new Set();
                const globalUniqueKeys = [];
                for (const k of allKeys) {
                    const s = stickers[k];
                    const hash = s.fileSha256 || s.url || k;
                    if (!seen.has(hash)) {
                        seen.add(hash);
                        globalUniqueKeys.push(k);
                    }
                }
                for (const k of globalUniqueKeys) {
                    const s = stickers[k];
                    if (s) {
                        poolPayloads.push({
                            url: s.url || '',
                            fileSha256: ensureBuffer(s.fileSha256),
                            fileEncSha256: ensureBuffer(s.fileEncSha256),
                            mediaKey: ensureBuffer(s.mediaKey),
                            fileLength: s.fileLength || 134248,
                            height: 512,
                            width: 512,
                            mimetype: s.mimetype || 'image/webp',
                            directPath: s.directPath || '',
                            isAnimated: !!s.isAnimated,
                            isAvatar: false,
                            isLottie: false
                        });
                    }
                }
            } else {
                // USER PERSONAL ISOLATION MODE:
                // No specific sticker name given or .rs / .rs 5 / .rs my 5
                // Check if this sender has their own saved stickers!
                if (myStickerKeys.length > 0) {
                    isMixupMode = myStickerKeys.length > 1;
                    for (const k of myStickerKeys) {
                        const s = stickers[k];
                        if (s) {
                            poolPayloads.push({
                                url: s.url || '',
                                fileSha256: ensureBuffer(s.fileSha256),
                                fileEncSha256: ensureBuffer(s.fileEncSha256),
                                mediaKey: ensureBuffer(s.mediaKey),
                                fileLength: s.fileLength || 134248,
                                height: 512,
                                width: 512,
                                mimetype: s.mimetype || 'image/webp',
                                directPath: s.directPath || '',
                                isAnimated: !!s.isAnimated,
                                isAvatar: false,
                                isLottie: false
                            });
                        }
                    }
                } else {
                    // Sender has NOT saved any personal stickers yet!
                    return await sock.sendMessage(from, {
                        text:
`╭━━━〔 ⚠️ *NO PERSONAL STICKERS SAVED* 〕━━━┈⊷
┃ 👤 *Aapne abhi tak apna koi sticker save nahi kiya!*
┃
┃ 💡 *Apna Sticker Save Kaise Karein:*
┃ 1️⃣ Apne phone ke kisi bhi sticker ko *Reply* karein.
┃ 2️⃣ Type karein: *.sts*  (ya *.sts <name>*)
┃ 3️⃣ Phir message ko reply karke likhein: *.rs 5*
┃    ➜ *Aapke apne save kiye hue stickers react honge!*
┃
┃ 🌐 *Default / Global Sticker React Karne Ke Liye:*
┃ 👉 *.rs dog 5*  _(Default animated dog sticker)_
┃ 👉 *.rs global 5*  _(Tamam stickers ka mixup)_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
                    }, { quoted: msg });
                }
            }

            if (chosenKey && stickers[chosenKey]) {
                const s = stickers[chosenKey];
                stickerPayload = {
                    url: s.url || '',
                    fileSha256: ensureBuffer(s.fileSha256),
                    fileEncSha256: ensureBuffer(s.fileEncSha256),
                    mediaKey: ensureBuffer(s.mediaKey),
                    fileLength: s.fileLength || 134248,
                    height: 512,
                    width: 512,
                    mimetype: s.mimetype || 'image/webp',
                    directPath: s.directPath || '',
                    isAnimated: !!s.isAnimated,
                    isAvatar: false,
                    isLottie: false
                };
                poolPayloads = [stickerPayload];
            }
        }

        if (!poolPayloads || poolPayloads.length === 0) {
            return await sock.sendMessage(from, {
                text:
`⚠️ *Koi valid sticker nahi mila!*
💡 Pehle kisi sticker ko reply karke *.sts* likhein, phir *.rs 5* karein.`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '⚡', key: msg.key } }).catch(() => {});

        console.log(`[StickerReact] Relaying ${count}x sticker reaction (Pool: ${poolPayloads.length}, Mixup: ${isMixupMode}) on message: ${stanzaId}...`);

        const targetKey = {
            remoteJid: from,
            fromMe: isFromMe,
            id: stanzaId,
            ...(isGroup && quotedNorm ? { participant: quotedNorm } : {})
        };

        // Send sticker reactions cleanly cycling through the mixup pool
        for (let i = 0; i < count; i++) {
            const currentPayload = poolPayloads[i % poolPayloads.length];
            if (!currentPayload) continue;

            try {
                await sock.relayMessage(from, {
                    messageContextInfo: {
                        messageAssociation: {
                            associationType: 11, // STICKER_ANNOTATION
                            parentMessageKey: targetKey
                        }
                    },
                    stickerMessage: currentPayload
                }, {});
            } catch (sendErr) {
                console.error(`[StickerReact Relay Error ${i + 1}]:`, sendErr.message);
            }

            if (i < count - 1) {
                await new Promise(r => setTimeout(r, 260));
            }
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

    } catch (e) {
        console.error('[repeatReactCommand Error]:', e);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
    }
}

module.exports = {
    saveStickerCommand,
    repeatReactCommand,
    loadSavedStickers,
    extractUserIdentifiers,
    isStickerOwnedByUser,
    getUserStickers
};
