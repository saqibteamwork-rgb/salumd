'use strict';

/**
 * SALU MD :: Meta AI Rich HTML & GenAI Card Module
 * ============================================================================
 * Commands: .richhtml / .htmlcard / .foa
 * Usage:
 *   .richhtml <h1>Hello from SALU MD</h1>
 * ============================================================================
 */

const crypto = require('crypto');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const settings = require('../settings');

async function sendRichHtml(sock, jid, html) {
    const slots = {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    unifiedResponse: {
                        data: Buffer.from(JSON.stringify({
                            __typename: 'GenAIUnifiedResponse',
                            response_id: crypto.randomUUID(),
                            sections: [{
                                __typename: 'GenAIUnifiedResponseSection',
                                view_model: {
                                    __typename: 'GenAISingleLayoutViewModel',
                                    primitive: {
                                        __typename: 'FOAHtmlPrimitiveDemoDONOTUSE',
                                        trusted_sources: [],
                                        payload: html
                                    }
                                }
                            }]
                        })).toString('base64')
                    },
                    contextInfo: { isForwarded: true, forwardOrigin: 4 }
                }
            }
        }
    };

    const richMessage = generateWAMessageFromContent(jid, slots, {});
    await sock.relayMessage(jid, richMessage.message, { messageId: richMessage.key.id });
    return richMessage;
}

async function richHtmlCommand(sock, from, msg, args = []) {
    const rawHtml = args.join(' ').trim();
    const defaultHtml = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: -apple-system, sans-serif; background: #0b141a; color: #e9edef; padding: 16px; margin: 0; }
.card { background: #111b21; border-radius: 12px; padding: 18px; border: 1px solid #222d34; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
h1 { color: #00a884; font-size: 20px; margin: 0 0 8px 0; }
p { color: #8696a0; font-size: 14px; line-height: 1.5; margin: 0; }
.badge { display: inline-block; background: #00a884; color: #111b21; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; margin-top: 12px; }
</style>
</head>
<body>
<div class="card">
  <h1>⚡ SALU MD</h1>
  <p>Meta AI GenAI HTML Card Primitive rendered live on WhatsApp!</p>
  <span class="badge">PRO VERSION</span>
</div>
</body>
</html>
`;

    const htmlToSend = rawHtml || defaultHtml;

    await sock.sendMessage(from, { react: { text: '✨', key: msg.key } }).catch(() => {});

    try {
        await sendRichHtml(sock, from, htmlToSend);
    } catch (err) {
        console.error('[RichHTML Error]:', err.message);
        await sock.sendMessage(from, { text: `❌ *Rich HTML Error:* ${err.message}` }, { quoted: msg });
    }
}

module.exports = {
    sendRichHtml,
    richHtmlCommand
};
