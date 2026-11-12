'use strict';

/**
 * MR SAQIB MD :: Anime Suite
 * ============================================================================
 * Commands:
 * - .waifu      : Random waifu image
 * - .neko       : Random neko girl image
 * - .animequote : Random inspiring anime quote with character
 * - .anime <q>  : Anime info, episodes, score, and synopsis from Kitsu
 * ============================================================================
 */

const axios = require('axios');

const ANIME_QUOTES = [
    { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece" },
    { quote: "Hard work is worthless for those that don't believe in themselves.", character: "Naruto Uzumaki", anime: "Naruto" },
    { quote: "Power comes in response to a need, not a desire.", character: "Goku", anime: "Dragon Ball Z" },
    { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", character: "Kenshin Himura", anime: "Rurouni Kenshin" },
    { quote: "Fear is not evil. It tells you what your weakness is.", character: "Gildarts Clive", anime: "Fairy Tail" },
    { quote: "If you really want to be strong... Stop caring about what your surroundings think of you!", character: "Saitama", anime: "One Punch Man" },
    { quote: "A person can change, at the moment when the person wishes to change.", character: "Haruhi Fujioka", anime: "Ouran High School Host Club" },
    { quote: "The world is not beautiful; and that, in a way, lends it a sort of beauty.", character: "Kino", anime: "Kino's Journey" },
    { quote: "Push through the pain, giving up hurts more.", character: "Vegeta", anime: "Dragon Ball Z" }
];

async function waifuCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { react: { text: '🌸', key: msg.key } }).catch(() => {});
        const res = await axios.get('https://nekos.best/api/v2/waifu', { timeout: 15000 });
        const item = res.data?.results?.[0];
        if (!item || !item.url) throw new Error("Could not fetch waifu image");

        const caption = 
`╭━━━〔 🌸 *ANIME WAIFU* 〕━━━┈⊷
┃ 👤 *Artist:* ${item.artist_name || 'Unknown'}
┃ 🎨 *Source:* ${item.source_url ? item.source_url.slice(0, 30) + '...' : 'nekos.best'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *MR SAQIB MD*`;

        await sock.sendMessage(from, {
            image: { url: item.url },
            caption: caption
        }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Waifu fetch error: ${e.message}` }, { quoted: msg });
    }
}

async function nekoCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { react: { text: '🐱', key: msg.key } }).catch(() => {});
        const res = await axios.get('https://nekos.best/api/v2/neko', { timeout: 15000 });
        const item = res.data?.results?.[0];
        if (!item || !item.url) throw new Error("Could not fetch neko image");

        const caption = 
`╭━━━〔 🐱 *ANIME NEKO* 〕━━━┈⊷
┃ 👤 *Artist:* ${item.artist_name || 'Unknown'}
┃ 🎨 *Source:* ${item.source_url ? item.source_url.slice(0, 30) + '...' : 'nekos.best'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *MR SAQIB MD*`;

        await sock.sendMessage(from, {
            image: { url: item.url },
            caption: caption
        }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Neko fetch error: ${e.message}` }, { quoted: msg });
    }
}

async function animeQuoteCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { react: { text: '💬', key: msg.key } }).catch(() => {});
        const pick = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
        const text = 
`╭━━━〔 📜 *ANIME QUOTE* 〕━━━┈⊷
┃ “${pick.quote}”
┃
┃ 👤 *Character:* ${pick.character}
┃ 🎬 *Anime:* ${pick.anime}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *MR SAQIB MD*`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
    }
}

async function animeSearchCommand(sock, from, msg, args = []) {
    try {
        const query = args.join(' ').trim();
        if (!query) {
            return await sock.sendMessage(from, {
                text: "❌ *Usage:* `.anime <name>`\n_Example: .anime Naruto_"
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } }).catch(() => {});
        const res = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=1`, { timeout: 15000 });
        const anime = res.data?.data?.[0]?.attributes;
        if (!anime) {
            return await sock.sendMessage(from, { text: `❌ Koi anime nahi mila for: *${query}*` }, { quoted: msg });
        }

        const title = anime.canonicalTitle || anime.titles?.en || query;
        const synopsis = (anime.synopsis || 'No synopsis available.').slice(0, 400) + '...';
        const poster = anime.posterImage?.large || anime.posterImage?.medium || anime.posterImage?.original;
        const rating = anime.averageRating ? `${anime.averageRating}%` : 'N/A';
        const episodes = anime.episodeCount || 'Ongoing / Unknown';
        const status = anime.status || 'N/A';
        const subtype = anime.subtype || 'TV';

        const text = 
`╭━━━〔 🎬 *ANIME INFO* 〕━━━┈⊷
┃ 📌 *Title:* ${title}
┃ 📺 *Type:* ${subtype.toUpperCase()}
┃ 🌟 *Score:* ${rating}
┃ 🎞️ *Episodes:* ${episodes}
┃ 📡 *Status:* ${status}
┃ 📅 *Aired:* ${anime.startDate || 'N/A'}
┃
┃ 📖 *Synopsis:*
┃ ${synopsis}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *MR SAQIB MD*`;

        if (poster) {
            await sock.sendMessage(from, { image: { url: poster }, caption: text }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text }, { quoted: msg });
        }
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Anime search error: ${e.message}` }, { quoted: msg });
    }
}

module.exports = {
    waifuCommand,
    nekoCommand,
    animeQuoteCommand,
    animeSearchCommand
};
