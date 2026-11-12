// commands/npm.js
'use strict';

const axios = require('axios');

async function npmCommand(sock, from, msg, args = []) {
    const pkgName = args[0]?.trim();
    if (!pkgName) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 📦 *NPM PACKAGE EXPLORER* 〕━━━┈⊷
┃ 📌 *Usage:*
┃ 👉 *.npm <package-name>*
┃
┃ 💡 *Example:*
┃ .npm @whiskeysockets/baileys
┃ .npm axios
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } }).catch(() => {});

    try {
        const res = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(pkgName)}`, {
            timeout: 10000
        });
        const data = res.data;
        if (!data || data.error) throw new Error('Package nahi mila.');

        const latestVersion = data['dist-tags']?.latest || 'Unknown';
        const vInfo = data.versions?.[latestVersion] || {};
        const desc = data.description || 'No description provided.';
        const author = data.author?.name || (typeof data.author === 'string' ? data.author : 'Unknown');
        const license = data.license || 'ISC';
        const homepage = data.homepage || `https://www.npmjs.com/package/${pkgName}`;

        await sock.sendMessage(from, { react: { text: '📦', key: msg.key } }).catch(() => {});

        const resultText =
`╭━━━〔 📦 *NPM: ${pkgName}* 〕━━━┈⊷
┃ 🏷️ *Latest Version:* \`v${latestVersion}\`
┃ 📝 *Description:* ${desc}
┃ 👤 *Author:* ${author}
┃ 📜 *License:* ${license}
┃ 🔗 *NPM Link:* ${homepage}
┃ 💻 *Install Command:* \`npm install ${pkgName}\`
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        await sock.sendMessage(from, { text: resultText }, { quoted: msg });

    } catch (e) {
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *NPM Package nahi mila:*\n_${e.message}_`
        }, { quoted: msg });
    }
}

module.exports = { npmCommand };
