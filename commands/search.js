'use strict';

/**
 * SALU MD :: Advanced Search Suite
 * ============================================================================
 * Commands:
 * - .google <query>    : Google / Web search with top ranked results
 * - .lyrics <song>     : Complete song lyrics with artist info
 * - .ringtone <query>  : Search & send high quality MP3 ringtone
 * - .playstore <app>   : Search apps on Google Play Store
 * - .github <user/repo>: Search GitHub profiles & repositories
 * ============================================================================
 */

const axios = require('axios');
const cheerio = require('cheerio');
const yts = require('yt-search');
const { fetchYouTubeMedia } = require('./yt');

async function googleCommand(sock, from, msg, args = []) {
    try {
        const query = args.join(' ').trim();
        if (!query) {
            return await sock.sendMessage(from, {
                text: "❌ *Usage:* `.google <query>`\n_Example: .google Imran Khan current news_"
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } }).catch(() => {});

        const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        const $ = cheerio.load(res.data);
        const items = [];

        $('.result__body').each((i, el) => {
            if (items.length < 5) {
                const title = $(el).find('.result__title a').text().replace(/\s+/g, ' ').trim();
                let url = $(el).find('.result__url').text().trim();
                const snippet = $(el).find('.result__snippet').text().replace(/\s+/g, ' ').trim();

                if (title && snippet) {
                    if (!url.startsWith('http')) url = 'https://' + url;
                    items.push({ title, url, snippet });
                }
            }
        });

        if (items.length === 0) {
            return await sock.sendMessage(from, { text: `❌ Koi results nahi mile for: *${query}*` }, { quoted: msg });
        }

        let out = `╭━━━〔 🌐 *GOOGLE SEARCH* 〕━━━┈⊷\n┃ 🔎 *Query:* _${query}_\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        items.forEach((item, idx) => {
            out += `*${idx + 1}. ${item.title}*\n`;
            out += `📄 _${item.snippet}_\n`;
            out += `🔗 ${item.url}\n\n`;
        });

        out += `🚀 *Powered by SALU MD*`;

        await sock.sendMessage(from, { text: out.trim() }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Google search error: ${e.message}` }, { quoted: msg });
    }
}

async function lyricsCommand(sock, from, msg, args = []) {
    try {
        const query = args.join(' ').trim();
        if (!query) {
            return await sock.sendMessage(from, {
                text: "❌ *Usage:* `.lyrics <song name>`\n_Example: .lyrics Coldplay Yellow_"
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } }).catch(() => {});

        let artist = '';
        let title = query;

        if (query.includes('-')) {
            const parts = query.split('-');
            artist = parts[0].trim();
            title = parts.slice(1).join('-').trim();
        } else if (query.includes('by')) {
            const parts = query.split('by');
            title = parts[0].trim();
            artist = parts[1].trim();
        }

        let lyricsText = null;

        // Try lyrics.ovh
        if (artist && title) {
            try {
                const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 10000 });
                if (res.data?.lyrics) lyricsText = res.data.lyrics.trim();
            } catch {}
        }

        // Fallback: search lyrics API
        if (!lyricsText) {
            try {
                const searchRes = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(query)}`, { timeout: 10000 });
                if (searchRes.data?.lyrics) {
                    lyricsText = searchRes.data.lyrics.trim();
                    title = searchRes.data.title || title;
                    artist = searchRes.data.artist || artist;
                }
            } catch {}
        }

        if (!lyricsText) {
            return await sock.sendMessage(from, {
                text: `❌ *Lyrics nahi mili:* "${query}"\n💡 _Tips: Singer ka naam bhi likhein (e.g. .lyrics Atif Aslam - Aadat)_`
            }, { quoted: msg });
        }

        const caption = 
`╭━━━〔 🎶 *SONG LYRICS* 〕━━━┈⊷
┃ 🎵 *Title:* ${title}
${artist ? `┃ 👤 *Artist:* ${artist}\n` : ''}╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

${lyricsText}

🚀 *SALU MD*`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Lyrics fetch error: ${e.message}` }, { quoted: msg });
    }
}

async function ringtoneCommand(sock, from, msg, args = []) {
    try {
        const query = args.join(' ').trim();
        if (!query) {
            return await sock.sendMessage(from, {
                text: "❌ *Usage:* `.ringtone <query>`\n_Example: .ringtone Ertugrul Gazi ya .ringtone iPhone_"
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '📲', key: msg.key } }).catch(() => {});

        // Search YouTube for short audio / ringtone
        const searchResults = await yts(`${query} ringtone`);
        const video = searchResults.videos?.[0];

        if (!video) {
            return await sock.sendMessage(from, { text: `❌ Koi ringtone nahi mili for: *${query}*` }, { quoted: msg });
        }

        const media = await fetchYouTubeMedia(video.url, 'mp3');
        if (!media || !media.downloadUrl) {
            throw new Error("Ringtone download link generate nahi ho saki.");
        }

        const caption = 
`╭━━━〔 📲 *RINGTONE DOWNLOADER* 〕━━━┈⊷
┃ 🎵 *Title:* ${video.title}
┃ ⏱️ *Duration:* ${video.timestamp || 'N/A'}
┃ 👤 *Channel:* ${video.author?.name || 'Unknown'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *SALU MD*`;

        await sock.sendMessage(from, {
            audio: { url: media.downloadUrl },
            mimetype: 'audio/mp4',
            fileName: `${video.title.slice(0, 30)}.mp3`,
            ptt: false
        }, { quoted: msg });

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }).catch(() => {});

    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Ringtone error: ${e.message}` }, { quoted: msg });
    }
}

async function playstoreCommand(sock, from, msg, args = []) {
    try {
        const query = args.join(' ').trim();
        if (!query) {
            return await sock.sendMessage(from, {
                text: "❌ *Usage:* `.playstore <app name>`\n_Example: .playstore WhatsApp Messenger_"
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '📱', key: msg.key } }).catch(() => {});

        const searchUrl = `https://html.duckduckgo.com/html/?q=site:play.google.com/store/apps/details+${encodeURIComponent(query)}`;
        const res = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const $ = cheerio.load(res.data);
        let appTitle = '';
        let appUrl = '';
        let appSnippet = '';

        $('.result__body').each((i, el) => {
            if (!appUrl) {
                const u = $(el).find('.result__url').text().trim();
                if (u.includes('play.google.com/store/apps/details')) {
                    appTitle = $(el).find('.result__title a').text().replace(/\s+/g, ' ').trim();
                    appUrl = u.startsWith('http') ? u : 'https://' + u;
                    appSnippet = $(el).find('.result__snippet').text().replace(/\s+/g, ' ').trim();
                }
            }
        });

        if (!appUrl) {
            appUrl = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`;
            appTitle = query;
            appSnippet = "Direct search link for Google Play Store.";
        }

        const out = 
`╭━━━〔 🛍️ *GOOGLE PLAY STORE* 〕━━━┈⊷
┃ 📦 *App:* ${appTitle}
┃ 📄 *Info:* ${appSnippet.slice(0, 200)}...
┃ 🔗 *Download Link:*
┃ ${appUrl}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *SALU MD*`;

        await sock.sendMessage(from, { text: out }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ PlayStore error: ${e.message}` }, { quoted: msg });
    }
}

async function githubCommand(sock, from, msg, args = []) {
    try {
        const query = args.join(' ').trim();
        if (!query) {
            return await sock.sendMessage(from, {
                text: "❌ *Usage:* `.github <username>` ya `.github <user/repo>`\n_Example: .github torvalds_"
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🐙', key: msg.key } }).catch(() => {});

        const headers = { 'User-Agent': 'MR-SAQIB-MD-Bot' };

        // Check if query is repo (user/repo)
        if (query.includes('/')) {
            const res = await axios.get(`https://api.github.com/repos/${query}`, { headers, timeout: 15000 });
            const repo = res.data;

            const text = 
`╭━━━〔 🐙 *GITHUB REPOSITORY* 〕━━━┈⊷
┃ 📦 *Repo:* ${repo.full_name}
┃ 👤 *Owner:* ${repo.owner?.login}
┃ 📝 *Description:* ${repo.description || 'No description provided'}
┃ ⭐ *Stars:* ${repo.stargazers_count}
┃ 🍴 *Forks:* ${repo.forks_count}
┃ 💻 *Language:* ${repo.language || 'Multiple'}
┃ 🐛 *Open Issues:* ${repo.open_issues_count}
┃ 🌐 *URL:* ${repo.html_url}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *SALU MD*`;

            return await sock.sendMessage(from, { text }, { quoted: msg });
        }

        // Query is username
        const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(query)}`, { headers, timeout: 15000 });
        const user = res.data;

        const text = 
`╭━━━〔 🐙 *GITHUB USER PROFILE* 〕━━━┈⊷
┃ 👤 *Username:* ${user.login}
┃ 📛 *Name:* ${user.name || 'N/A'}
┃ 📝 *Bio:* ${user.bio || 'No bio'}
┃ 🏢 *Company:* ${user.company || 'N/A'}
┃ 📍 *Location:* ${user.location || 'N/A'}
┃ 📦 *Public Repos:* ${user.public_repos}
┃ 👥 *Followers:* ${user.followers} | *Following:* ${user.following}
┃ 🌐 *Profile URL:* ${user.html_url}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *SALU MD*`;

        if (user.avatar_url) {
            await sock.sendMessage(from, { image: { url: user.avatar_url }, caption: text }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text }, { quoted: msg });
        }

    } catch (e) {
        await sock.sendMessage(from, { text: `❌ GitHub lookup error: ${e.response?.status === 404 ? 'User / Repo not found.' : e.message}` }, { quoted: msg });
    }
}

module.exports = {
    googleCommand,
    lyricsCommand,
    ringtoneCommand,
    playstoreCommand,
    githubCommand
};
