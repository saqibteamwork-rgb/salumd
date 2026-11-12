/**
 * ╭━━━[ MR SAQIB MD — MULTI-SOURCE YOUTUBE ENGINE ]━━━╮
 * ┃ Sources: ytdl-lite → savenow → savetube → ytdown
 * ┃ Supported: MP3 Audio & MP4 Video (360p / 720p)
 * ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
 */

'use strict';

const axios = require('axios');
const https = require('https');
const qs = require('querystring');
const crypto = require('crypto');
const yts = require('yt-search');
const ytdl = require('ytdl-lite');

const agent = new https.Agent({ rejectUnauthorized: false });

// ═══════════════════════════════════════════════════════
// SOURCE 1: SaveNow Engine (from user)
// ═══════════════════════════════════════════════════════
const SaveNow = {
    _api: 'https://p.savenow.to',
    _key: 'dfcb6d76f2f6a9894gjkege8a4ab232222',
    _agent: agent,
    poll: async (url, limit = 20) => {
        for (let i = 0; i < limit; i++) {
            try {
                const { data } = await axios.get(url, {
                    httpsAgent: SaveNow._agent,
                    timeout: 30000,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                if (data && data.success === 1 && data.download_url) return data;
                if (data && data.success === -1) break;
            } catch {}
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        return null;
    }
};

async function ytdlv3_savenow(url, res = 'mp3') {
    try {
        const format = res === 'audio' || res === 'mp3' ? 'mp3' : (res || '720');
        const { data: init } = await axios.get(`${SaveNow._api}/ajax/download.php`, {
            params: {
                copyright: 0,
                format,
                url,
                api: SaveNow._key
            },
            httpsAgent: SaveNow._agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://savenow.to/'
            },
            timeout: 30000
        });

        if (!init || !init.success || !init.progress_url) return { status: false };
        const result = await SaveNow.poll(init.progress_url);
        if (result && result.download_url) {
            return {
                status: true,
                title: init.info?.title || 'YouTube Media',
                download_url: result.download_url
            };
        }
        return { status: false };
    } catch {
        return { status: false };
    }
}

// ═══════════════════════════════════════════════════════
// SOURCE 2: SaveTube AES Decryption Engine (from user)
// ═══════════════════════════════════════════════════════
const savetube = {
    api: {
        base: 'https://media.savetube.me/api',
        cdn: '/random-cdn',
        info: '/v2/info',
        download: '/download'
    },
    headers: {
        accept: '*/*',
        'content-type': 'application/json',
        origin: 'https://yt.savetube.me',
        referer: 'https://yt.savetube.me/',
        'user-agent': 'Postify/1.0.0'
    },
    crypto: {
        hexToBuffer: (hexString) => {
            const matches = hexString.match(/.{1,2}/g) || [];
            return Buffer.from(matches.join(''), 'hex');
        },
        decrypt: async (enc) => {
            const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
            const data = Buffer.from(enc, 'base64');
            const iv = data.slice(0, 16);
            const content = data.slice(16);
            const key = savetube.crypto.hexToBuffer(secretKey);
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(content);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
        }
    },
    youtubeId: (url) => {
        if (!url) return null;
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/
        ];
        for (const p of patterns) {
            const match = url.match(p);
            if (match && match[1]) return match[1];
        }
        return null;
    },
    download: async (link, format = 'mp3') => {
        const id = savetube.youtubeId(link);
        if (!id) return { status: false };

        try {
            const { data: cdnRes } = await axios.get(`${savetube.api.base}${savetube.api.cdn}`, {
                headers: savetube.headers,
                timeout: 20000
            });
            const cdn = cdnRes.cdn;
            if (!cdn) return { status: false };

            const { data: infoRes } = await axios.post(`https://${cdn}${savetube.api.info}`, {
                url: `https://www.youtube.com/watch?v=${id}`
            }, { headers: savetube.headers, timeout: 20000 });

            if (!infoRes || !infoRes.data) return { status: false };
            const decrypted = await savetube.crypto.decrypt(infoRes.data);

            const isAudio = format === 'mp3' || format === 'audio';
            const { data: dlRes } = await axios.post(`https://${cdn}${savetube.api.download}`, {
                id,
                downloadType: isAudio ? 'audio' : 'video',
                quality: isAudio ? '128' : (format || '720'),
                key: decrypted.key
            }, { headers: savetube.headers, timeout: 20000 });

            if (dlRes?.data?.downloadUrl) {
                return {
                    status: true,
                    title: decrypted.title || 'YouTube Media',
                    download_url: dlRes.data.downloadUrl
                };
            }
            return { status: false };
        } catch {
            return { status: false };
        }
    }
};

// ═══════════════════════════════════════════════════════
// SOURCE 3: ytdl-lite Direct Stream Engine (PROVEN FAST)
// ═══════════════════════════════════════════════════════
async function ytdl_lite_engine(url, type = 'audio') {
    try {
        if (type === 'audio' || type === 'mp3') {
            const res = await ytdl.ytmp3(url);
            if (res && res.url) {
                return {
                    status: true,
                    title: res.title || 'YouTube Audio',
                    download_url: res.url,
                    thumbnail: res.thumbnail || ''
                };
            }
        } else {
            const res = await ytdl.ytmp4(url, '360');
            if (res && res.url) {
                return {
                    status: true,
                    title: res.title || 'YouTube Video',
                    download_url: res.url,
                    thumbnail: res.thumbnail || ''
                };
            }
        }
    } catch {}
    return { status: false };
}

// ═══════════════════════════════════════════════════════
// SOURCE 4: ytdown & ytdlpyton Fallbacks (from user)
// ═══════════════════════════════════════════════════════
async function ytdlv1_python(url, type) {
    try {
        const endpoint = type === 'audio' || type === 'mp3'
            ? `https://ytdlpyton.nvlgroup.my.id/download/audio?url=${encodeURIComponent(url)}&mode=url`
            : `https://ytdlpyton.nvlgroup.my.id/download/?url=${encodeURIComponent(url)}&resolution=720&mode=url`;
        const { data } = await axios.get(endpoint, { timeout: 20000 });
        if (data && data.download_url) {
            return { status: true, title: data.title || 'YouTube Media', download_url: data.download_url };
        }
    } catch {}
    return { status: false };
}

async function ytdlv2_ytdown(url, res = 'mp3') {
    try {
        const { data } = await axios.post(
            'https://app.ytdown.to/proxy.php',
            qs.stringify({ url }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    Referer: 'https://app.ytdown.to/id12/'
                },
                timeout: 30000
            }
        );
        const api = data && data.api;
        if (!api || !api.mediaItems) return { status: false };

        const isAudio = res === 'audio' || res === 'mp3';
        const target = isAudio
            ? (api.mediaItems.find((v) => v.type === 'Audio' && v.mediaQuality === '128K') || api.mediaItems.find((v) => v.type === 'Audio'))
            : (api.mediaItems.find((v) => v.type === 'Video' && v.mediaQuality === 'HD') || api.mediaItems.find((v) => v.type === 'Video'));

        if (!target || !target.mediaUrl) return { status: false };

        for (let i = 0; i < 10; i++) {
            try {
                const { data: check } = await axios.get(target.mediaUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    timeout: 15000
                });
                if (check && check.status === 'completed' && check.fileUrl) {
                    return { status: true, title: api.title || 'YouTube Media', download_url: check.fileUrl };
                }
            } catch {}
            await new Promise((r) => setTimeout(r, 2000));
        }
    } catch {}
    return { status: false };
}

// ═══════════════════════════════════════════════════════
// MASTER MULTI-SOURCE YOUTUBE AUTO ENGINE
// ═══════════════════════════════════════════════════════
async function ytdlAuto(url, res = 'mp3') {
    console.log(`[YTDL-Engine] Attempting download for: ${url} (format: ${res})`);

    // Tier 1: ytdl-lite (Fastest, verified working!)
    try {
        const r1 = await ytdl_lite_engine(url, res);
        if (r1 && r1.status && r1.download_url) {
            console.log('[YTDL-Engine] ✅ Tier 1 (ytdl-lite) succeeded!');
            return r1;
        }
    } catch {}

    // Tier 2: savetube with AES Decryption
    try {
        const r2 = await savetube.download(url, res);
        if (r2 && r2.status && r2.download_url) {
            console.log('[YTDL-Engine] ✅ Tier 2 (savetube) succeeded!');
            return r2;
        }
    } catch {}

    // Tier 3: SaveNow Engine
    try {
        const r3 = await ytdlv3_savenow(url, res);
        if (r3 && r3.status && r3.download_url) {
            console.log('[YTDL-Engine] ✅ Tier 3 (savenow) succeeded!');
            return r3;
        }
    } catch {}

    // Tier 4: ytdown Engine
    try {
        const r4 = await ytdlv2_ytdown(url, res);
        if (r4 && r4.status && r4.download_url) {
            console.log('[YTDL-Engine] ✅ Tier 4 (ytdown) succeeded!');
            return r4;
        }
    } catch {}

    // Tier 5: ytdlpyton
    try {
        const r5 = await ytdlv1_python(url, res);
        if (r5 && r5.status && r5.download_url) {
            console.log('[YTDL-Engine] ✅ Tier 5 (ytdlpyton) succeeded!');
            return r5;
        }
    } catch {}

    return { status: false, error: 'All YouTube download sources exhausted.' };
}

module.exports = {
    ytdlAuto,
    ytdl_lite_engine,
    savetube,
    SaveNow,
    ytdlv3_savenow,
    ytdlv2_ytdown,
    ytdlv1_python
};
