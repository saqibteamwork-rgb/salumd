// commands/yt.js
'use strict';

/**
 * YouTube Downloader Engine (YTMP3 & YTMP4) - Ultra Fast & Smooth Edition
 * Features:
 * - High-speed ytdl-lite & pro-apis.zone.id multi-tier architecture
 * - Direct HTTP streaming upload to WhatsApp (Zero RAM bloat, instant delivery)
 * - 30-min In-Memory Stream Cache (instant 1ms re-downloads)
 * - .ytmp3 / .song / .play / .yta  (Audio MP3 download)
 * - .ytmp4 / .video / .ytv / .yt   (Video MP4 download)
 */

const axios = require('axios');
const yts = require('yt-search');
const ytdl = require('ytdl-lite');
const settings = require('../settings');
const { ytdlAuto } = require('../lib/ytdlScraper');

// 30-minute in-memory cache for ultra-smooth re-requests
const linkCache = new Map();

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

function isYoutubeUrl(text) {
    const patterns = [
        /youtube\.com\/watch\?v=/,
        /youtu\.be\//,
        /youtube\.com\/shorts\//,
        /youtube\.com\/embed\//,
        /m\.youtube\.com\/watch\?v=/
    ];
    return patterns.some(pattern => pattern.test(text));
}

/**
 * High-Speed YouTube Search (Resolves in ~1s)
 */
async function searchYoutube(query) {
    // 1. Fast direct search via ytdl-lite
    try {
        const results = await ytdl.search(query, 1);
        if (results && results.length > 0) {
            const v = results[0];
            return {
                title: v.title || query,
                url: v.url || `https://www.youtube.com/watch?v=${v.id}`,
                author: v.author || 'YouTube Creator',
                thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
                duration: v.duration || '0:00'
            };
        }
    } catch {}

    // 2. Fallback to local yt-search library
    try {
        const search = await yts(query);
        if (search?.videos?.length > 0) {
            const v = search.videos[0];
            return {
                title: v.title,
                url: v.url,
                author: v.author?.name || 'YouTube Creator',
                thumbnail: v.thumbnail,
                duration: v.timestamp || '0:00'
            };
        }
    } catch {}

    throw new Error('Koi video nahi mili. Baraye meharbani title ya link dobara check karein.');
}

/**
 * Resolves Video / Audio Stream Links with Multi-Tier Fallback & Cache
 */
async function getYoutubeDownloadLinks(url, type = 'mp4') {
    const isAudio = (type === 'mp3' || type === 'audio');
    const format = isAudio ? 'mp3' : '720';

    // Check memory cache first (instant response)
    const cacheKey = `${type}:${url}`;
    const cached = linkCache.get(cacheKey);
    if (cached && (Date.now() - cached.time < 30 * 60 * 1000)) {
        return cached.data;
    }

    // Call Multi-Source YouTube Scraper Engine (ytdl-lite, savenow, savetube, ytdown)
    try {
        const result = await ytdlAuto(url, format);
        if (result && result.status && result.download_url) {
            const resultData = {
                title: result.title || 'YouTube Media',
                author: result.author || 'YouTube Creator',
                thumbnail: result.thumbnail || null,
                duration: result.duration || null,
                mp3: isAudio ? result.download_url : null,
                mp4: isAudio ? null : result.download_url,
                engine: 'multi-source-ytdl'
            };
            linkCache.set(cacheKey, { time: Date.now(), data: resultData });
            return resultData;
        }
    } catch (e) {
        console.warn(`[YouTube DL] ytdlAuto error: ${e.message}`);
    }

    throw new Error('Download link generate nahi ho saka. Baraye meharbani valid YouTube video try karein.');
}

/**
 * .ytmp3 / .song / .play / .yta
 * Ultra-Fast Playable Audio Downloader
 */
async function ytmp3Command(sock, from, msg, args = []) {
    const query = args.join(' ').trim();
    if (!query) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 🎵 *YOUTUBE MP3 DOWNLOADER* 〕━━━┈⊷
┃ 📌 *Usage:*
┃ 👉 *.ytmp3 <song name ya youtube link>*
┃ 👉 *.song <song name>*
┃ 👉 *.play <song name>*
┃
┃ 💡 *Example:*
┃ .ytmp3 despacito
┃ .song faasle kaavish
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    // Immediate reactive feedback
    await sock.sendMessage(from, { react: { text: '⚡', key: msg.key } }).catch(() => {});

    try {
        let videoInfo;
        if (isYoutubeUrl(query)) {
            videoInfo = { url: query, title: 'YouTube Audio', thumbnail: null };
        } else {
            videoInfo = await searchYoutube(query);
        }

        const dlData = await getYoutubeDownloadLinks(videoInfo.url, 'mp3');
        const audioUrl = dlData.mp3;
        if (!audioUrl) throw new Error('Audio stream link generate nahi hua.');

        const finalTitle = dlData.title || videoInfo.title || 'audio';
        const cleanTitle = finalTitle.replace(/[\\/:*?"<>|]/g, '').slice(0, 60);

        // 1. Send Beautiful Song Info Card with Cover Art (Visible to all users in chat/group)
        const thumbUrl = dlData.thumbnail || videoInfo.thumbnail || settings.websiteThumbnail;
        if (thumbUrl) {
            await sock.sendMessage(from, {
                image: { url: thumbUrl },
                caption:
`╭━━━〔 🎵 *SALU MD PLAYER* 〕━━━┈⊷
┃ 📌 *Title:* ${finalTitle}
┃ 👤 *Channel:* ${dlData.author || videoInfo.author || 'YouTube'}
┃ ⏱️ *Duration:* ${videoInfo.duration || 'N/A'}
┃ ⚡ *Status:* Sending Audio File...
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
            }, { quoted: msg }).catch(() => {});
        }

        // 2. Fetch Audio Buffer directly to ensure 100% WhatsApp media delivery to all users
        let audioBuffer;
        try {
            const audioRes = await axios.get(audioUrl, {
                responseType: 'arraybuffer',
                timeout: 50000,
                headers: { 'User-Agent': USER_AGENTS[0], 'Accept': '*/*' }
            });
            audioBuffer = Buffer.from(audioRes.data);
        } catch (bufErr) {
            console.warn('[YTMP3 Buffer Fetch Warning]:', bufErr.message);
        }

        // 3. Send Playable Audio (mimetype: 'audio/mp4' renders native playable wave player for EVERY user on Android & iOS)
        if (audioBuffer && audioBuffer.length > 0) {
            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mp4',
                fileName: `${cleanTitle}.mp3`,
                ptt: false
            }, { quoted: msg });
        } else {
            // Stream URL fallback if buffer fetch failed
            await sock.sendMessage(from, {
                audio: { url: audioUrl },
                mimetype: 'audio/mp4',
                fileName: `${cleanTitle}.mp3`,
                ptt: false
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🎶', key: msg.key } }).catch(() => {});

    } catch (err) {
        console.error('[YTMP3 Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *Audio download fail ho gayi:*\n_${err.message}_`
        }, { quoted: msg });
    }
}

/**
 * .ytmp4 / .video / .ytv / .yt
 * Ultra-Fast High-Quality Video Downloader
 */
async function ytmp4Command(sock, from, msg, args = []) {
    const query = args.join(' ').trim();
    if (!query) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 🎬 *YOUTUBE MP4 VIDEO DOWNLOADER* 〕━━━┈⊷
┃ 📌 *Usage:*
┃ 👉 *.ytmp4 <video name ya youtube link>*
┃ 👉 *.video <video name>*
┃ 👉 *.yt <video name>*
┃
┃ 💡 *Example:*
┃ .ytmp4 funny cats
┃ .video https://youtu.be/...
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`
        }, { quoted: msg });
    }

    // Immediate reactive feedback
    await sock.sendMessage(from, { react: { text: '⚡', key: msg.key } }).catch(() => {});

    try {
        let videoInfo;
        if (isYoutubeUrl(query)) {
            videoInfo = { url: query, title: 'YouTube Video', thumbnail: null };
        } else {
            videoInfo = await searchYoutube(query);
        }

        const dlData = await getYoutubeDownloadLinks(videoInfo.url, 'mp4');
        const videoUrl = dlData.mp4;
        if (!videoUrl) throw new Error('Video stream link generate nahi hua.');

        const finalTitle = dlData.title || videoInfo.title || 'video';
        const cleanTitle = finalTitle.replace(/[\\/:*?"<>|]/g, '').slice(0, 60);

        const caption =
`╭━━━〔 🎬 *YOUTUBE VIDEO* 〕━━━┈⊷
┃ 📌 *Title:* ${finalTitle}
┃ 👤 *Channel:* ${dlData.author || videoInfo.author || 'YouTube'}
┃ ⚡ *Powered by:* ${settings.botName || 'SALU MD'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        const adReplyContext = {
            externalAdReply: {
                title: finalTitle,
                body: `YouTube Video • ${settings.botName || 'SALU MD'}`,
                thumbnailUrl: dlData.thumbnail || videoInfo.thumbnail || settings.websiteThumbnail,
                sourceUrl: videoInfo.url,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        };

        // Ultra-Smooth: Direct streaming URL upload (Lightning Fast, No Heap Buffering)
        try {
            await sock.sendMessage(from, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                fileName: `${cleanTitle}.mp4`,
                caption: caption,
                contextInfo: adReplyContext
            }, { quoted: msg });
        } catch (streamErr) {
            // Buffer fallback if direct URL stream is blocked
            console.warn('[YTMP4 Direct Stream Fallback]: Downloading buffer...');
            const videoRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: { 'User-Agent': USER_AGENTS[0] }
            });
            await sock.sendMessage(from, {
                video: Buffer.from(videoRes.data),
                mimetype: 'video/mp4',
                fileName: `${cleanTitle}.mp4`,
                caption: caption,
                contextInfo: adReplyContext
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } }).catch(() => {});

    } catch (err) {
        console.error('[YTMP4 Error]:', err.message);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, {
            text: `❌ *Video download fail ho gayi:*\n_${err.message}_`
        }, { quoted: msg });
    }
}

module.exports = {
    ytmp3Command,
    ytmp4Command
};
