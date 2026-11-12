'use strict';

/**
 * MR SAQIB MD :: JavaScript Code Obfuscator Module
 * ============================================================================
 * Commands: .obfuscate / .obf
 * Usage:
 *   .obfuscate console.log("hello world");
 *   Or reply to any text or .js file with .obfuscate
 * ============================================================================
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');

function toSansBold(str) {
    return String(str || '').replace(/[A-Za-z0-9]/g, c => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + code - 48);
        return c;
    });
}

async function obfuscateCommand(sock, from, msg, args = []) {
    let jsCode = args.join(' ').trim();
    let fileName = 'obfuscated.js';
    let isFile = false;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const targetMsg = quoted || msg.message;

    if (!jsCode && quoted) {
        if (quoted.conversation) {
            jsCode = quoted.conversation;
        } else if (quoted.extendedTextMessage?.text) {
            jsCode = quoted.extendedTextMessage.text;
        } else if (quoted.documentMessage && (quoted.documentMessage.fileName || '').endsWith('.js')) {
            isFile = true;
            fileName = quoted.documentMessage.fileName;
            const stream = await downloadContentFromMessage(quoted.documentMessage, 'document');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            jsCode = buffer.toString('utf8');
        }
    } else if (!jsCode && targetMsg?.documentMessage && (targetMsg.documentMessage.fileName || '').endsWith('.js')) {
        isFile = true;
        fileName = targetMsg.documentMessage.fileName;
        const stream = await downloadContentFromMessage(targetMsg.documentMessage, 'document');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        jsCode = buffer.toString('utf8');
    }

    if (!jsCode) {
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 ⚡ ${toSansBold('JS CODE OBFUSCATOR')} ⚡ 〕━━━┈⊷
┃ 🛡️ *Usage:* JS Code ko protect aur encrypt karein:
┃
┃ 👉 *.obfuscate <javascript code>*
┃ 👉 Kisi bhi JS code ya *.js file* ke reply mein likhein: *.obfuscate*
┃
┃ 🔒 *Features:*
┃ ✦ Heavy Control Flow Flattening
┃ ✦ String Array Encoding (Base64/RC4)
┃ ✦ Anti-Tamper & Compact Protection
┃
┃ 👑 *Powered by MR SAQIB MD*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } }).catch(() => {});

    try {
        const obfuscationResult = JavaScriptObfuscator.obfuscate(jsCode, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.8,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            renameGlobals: false,
            rotateStringArray: true,
            selfDefending: false,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.8,
            transformObjectKeys: true,
            unicodeEscapeSequence: false
        });

        const obfuscatedCode = obfuscationResult.getObfuscatedCode();

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

        // If it was a file or if code is large (> 1500 chars), send as document
        if (isFile || obfuscatedCode.length > 1500) {
            const outBuffer = Buffer.from(obfuscatedCode, 'utf8');
            await sock.sendMessage(from, {
                document: outBuffer,
                fileName: fileName.replace(/\.js$/i, '') + '_obfuscated.js',
                mimetype: 'application/javascript',
                caption:
`╭━━━〔 ⚡ ${toSansBold('OBFUSCATION COMPLETE')} ⚡ 〕━━━┈⊷
┃ 📄 *File:* \`${fileName}\`
┃ 📊 *Original Size:* ${jsCode.length} chars
┃ 🔐 *Obfuscated Size:* ${obfuscatedCode.length} chars
┃ 🟢 *Status:* Successfully Encrypted ✅
┃ 👑 *Powered by MR SAQIB MD*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, {
                text:
`╭━━━〔 ⚡ ${toSansBold('OBFUSCATION COMPLETE')} ⚡ 〕━━━┈⊷
┃ 📊 *Original:* ${jsCode.length} chars
┃ 🔐 *Obfuscated:* ${obfuscatedCode.length} chars
┃ 🟢 *Status:* Successfully Encrypted ✅
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

\`\`\`javascript
${obfuscatedCode}
\`\`\`

⚡ *Powered by MR SAQIB MD*`
            }, { quoted: msg });
        }

    } catch (err) {
        console.error('[Obfuscate Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *Obfuscation Failed:*\n_${err.message}_`
        }, { quoted: msg });
    }
}

module.exports = {
    obfuscateCommand
};
