'use strict';

/**
 * SALU MD :: Voice Note & Meme Audio Module
 * ============================================================================
 * Commands:
 * - .malik : Sends Malik voice note (PTT)
 * - .sigma : Sends Sigma voice note (PTT)
 * - .promo : Sends Promo Video
 * - .bondo : Sends Bondo Video
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const MEDIA_DIR = path.join(__dirname, '..', 'media');

async function handleMemeVoiceCommand(sock, from, msg, cmd) {
    try {
        const cleanCmd = String(cmd || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        if (cleanCmd === 'malik') {
            const malikPath = path.join(MEDIA_DIR, 'Malik.mp3');
            if (fs.existsSync(malikPath)) {
                const buffer = fs.readFileSync(malikPath);
                await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
                return;
            }
        }

        if (cleanCmd === 'sigma') {
            const sigmaPath = path.join(MEDIA_DIR, 'sigma.mp3');
            if (fs.existsSync(sigmaPath)) {
                const buffer = fs.readFileSync(sigmaPath);
                await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
                return;
            }
        }

        if (cleanCmd === 'promo') {
            const promoPath = path.join(MEDIA_DIR, 'promo.mp4');
            if (fs.existsSync(promoPath)) {
                const buffer = fs.readFileSync(promoPath);
                await sock.sendMessage(from, { video: buffer, caption: "⚡ *SALU MD Official Promo*" }, { quoted: msg });
                return;
            }
        }

        if (cleanCmd === 'bondo') {
            const bondoPath = path.join(MEDIA_DIR, 'bondo.mp4');
            if (fs.existsSync(bondoPath)) {
                const buffer = fs.readFileSync(bondoPath);
                await sock.sendMessage(from, { video: buffer, caption: "🔥 *Bondo Video*" }, { quoted: msg });
                return;
            }
        }

        await sock.sendMessage(from, { text: `❌ Audio file for ${cmd} not found!` }, { quoted: msg });

    } catch (err) {
        console.error('[Meme Voice Error]:', err.message);
        await sock.sendMessage(from, { text: `❌ *Error:* ${err.message}` }, { quoted: msg });
    }
}

module.exports = {
    handleMemeVoiceCommand
};
