const settings = require('../settings');
module.exports = {
    get channelInfo() {
        return {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: settings.newsletterJid,
                    newsletterName: settings.botName,
                    serverMessageId: -1
                }
            }
        };
    }
};
