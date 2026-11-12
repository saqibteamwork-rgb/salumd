'use strict';

/**
 * ProBoy-MD / MR SAQIB MD :: Persistent WhatsApp Poll Store
 * Stores poll creation messages and their encryption keys (messageSecret)
 * for both in-chat polls (groups/DMs) and WhatsApp Channels (newsletters).
 */

const fs = require('fs');
const path = require('path');

const POLLS_FILE = path.join(__dirname, '..', 'data', 'polls.json');
const pollMap = new Map();

// Seed known channel poll 1432 for instant resolution
const KNOWN_SEEDS = [
    {
        id: '1432',
        serverId: '1432',
        remoteJid: '120363426969260431@newsletter',
        name: 'Hi',
        options: ['Assalamualaikum', 'Ws'],
        selectableOptionsCount: 1,
        timestamp: Date.now()
    }
];

// Load existing polls from disk
function loadPolls() {
    try {
        // First insert known seeds
        for (const item of KNOWN_SEEDS) {
            pollMap.set(item.id, item);
            pollMap.set(`${item.remoteJid}/${item.serverId}`, item);
        }

        if (fs.existsSync(POLLS_FILE)) {
            const data = JSON.parse(fs.readFileSync(POLLS_FILE, 'utf8'));
            for (const item of data) {
                if (item && item.id) {
                    pollMap.set(item.id, item);
                    if (item.serverId) {
                        pollMap.set(String(item.serverId), item);
                    }
                    if (item.remoteJid && item.serverId) {
                        pollMap.set(`${item.remoteJid}/${item.serverId}`, item);
                    }
                }
            }
            console.log(`[PollStore] Loaded ${pollMap.size} cached polls from disk.`);
        }
    } catch (err) {
        console.error('[PollStore] Failed to load polls:', err.message);
    }
}

// Save polls to disk (debounced)
let saveTimeout = null;
function persistPolls() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            const items = Array.from(new Set(pollMap.values())).slice(-500); // keep last 500 polls
            fs.writeFileSync(POLLS_FILE, JSON.stringify(items, null, 2));
        } catch (err) {
            console.error('[PollStore] Failed to persist polls:', err.message);
        }
    }, 1500);
}

// Save poll message from incoming upsert or channel fetch
function savePollMessage(msg) {
    if (!msg || !msg.message || !msg.key) return null;

    const mContent = msg.message.ephemeralMessage?.message 
        || msg.message.viewOnceMessage?.message 
        || msg.message.viewOnceMessageV2?.message 
        || msg.message.documentWithCaptionMessage?.message 
        || msg.message;

    const poll = mContent.pollCreationMessage 
        || mContent.pollCreationMessageV2 
        || mContent.pollCreationMessageV3
        || mContent.pollCreationMessageV4
        || mContent.pollCreationMessageV5;

    if (!poll) return null;

    const rawSecret = mContent.messageContextInfo?.messageSecret 
        || msg.message.messageContextInfo?.messageSecret;

    let secretBase64 = null;
    if (rawSecret) {
        secretBase64 = Buffer.isBuffer(rawSecret) ? rawSecret.toString('base64') : Buffer.from(rawSecret).toString('base64');
    }

    const options = (poll.options || []).map(opt => typeof opt === 'string' ? opt : (opt.optionName || ''));
    const serverId = msg.key.server_id || msg.server_id || null;
    const msgId = msg.key.id || (serverId ? String(serverId) : null);

    if (!msgId) return null;

    const record = {
        id: msgId,
        serverId: serverId ? String(serverId) : null,
        remoteJid: msg.key.remoteJid,
        participant: msg.key.participant || msg.participant || msg.key.remoteJid,
        fromMe: Boolean(msg.key.fromMe),
        name: poll.name || 'Poll',
        options,
        selectableOptionsCount: poll.selectableOptionsCount || 1,
        secretBase64,
        timestamp: Date.now()
    };

    pollMap.set(msgId, record);
    if (serverId) {
        pollMap.set(String(serverId), record);
        if (record.remoteJid) {
            pollMap.set(`${record.remoteJid}/${serverId}`, record);
        }
    }
    persistPolls();
    console.log(`[PollStore] 🗳️ Saved poll "${record.name}" (${record.id}) - HasSecret: ${Boolean(secretBase64)}`);
    return record;
}

// Manual register or cache a poll
function registerPoll(id, data) {
    if (!id || !data) return;
    const record = {
        id: String(id),
        serverId: data.serverId ? String(data.serverId) : String(id),
        remoteJid: data.remoteJid || null,
        name: data.name || 'Poll',
        options: data.options || [],
        timestamp: Date.now()
    };
    pollMap.set(String(id), record);
    if (record.remoteJid && record.serverId) {
        pollMap.set(`${record.remoteJid}/${record.serverId}`, record);
    }
    persistPolls();
    return record;
}

// Retrieve poll by message ID, server ID, or JID/serverId
function getPoll(pollId, jid = null) {
    if (!pollId) return null;
    let record = null;
    if (jid) {
        record = pollMap.get(`${jid}/${pollId}`);
    }
    if (!record) {
        record = pollMap.get(String(pollId));
    }
    if (!record) return null;

    return {
        ...record,
        secret: record.secretBase64 ? Buffer.from(record.secretBase64, 'base64') : null
    };
}

loadPolls();

module.exports = {
    savePollMessage,
    registerPoll,
    getPoll,
    pollMap
};
