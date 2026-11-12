const axios = require('axios');
const { ttdl } = require('ruhend-scraper');
const settings = require('../settings');

/**
 * Enhanced TikTok Video Downloader (.tt / .tiktok / .tik / .tktok)
 * - Auto-resolves vt.tiktok.com & full tiktok.com URLs
 * - Multi-tier engine: ruhend-scraper + tikwm + buffer streaming
 * - Clean caption with title, author, and bot branding
 */
async function tiktokCommand(sock, from, msg, q) {
    const rawText = (typeof q === 'string' ? q : '').trim();
    const urlMatch = rawText.match(/https?:\/\/(?:[a-zA-Z0-9_-]+\.)?tiktok\.com\/[^\s]+/i);
    const targetUrl = urlMatch ? urlMatch[0] : rawText;

    if (!targetUrl || !targetUrl.includes('tiktok.com')) {
        return await sock.sendMessage(from, {
            text:
`╭━━━〔 📱 *TIKTOK DOWNLOADER* 〕━━━┈⊷
┃ 📌 *Usage:*
┃ 👉 *.tt <tiktok url>*
┃ 👉 *.tiktok <tiktok url>*
┃
┃ 💡 *Example:*
┃ .tt https://vt.tiktok.com/...
┃ .tiktok https://www.tiktok.com/@user/video/...
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *${settings.botName || 'SALU MD'}*`
        }, { quoted: msg });
    }

    try {
        await sock.sendMessage(from, { react: { text: '⚡', key: msg.key } }).catch(() => {});

        let videoUrl = null;
        let title = 'TikTok Video';
        let author = 'TikTok Creator';

        // 1. Primary Engine: ruhend-scraper ttdl
        try {
            const data = await ttdl(targetUrl);
            if (data && (data.video || data.video_hd || data.video_wm)) {
                videoUrl = data.video_hd || data.video || data.video_wm;
                title = data.title || title;
                author = data.author || data.username || author;
            }
        } catch (err) {
            console.warn('[TikTok] ruhend-scraper error:', err.message);
        }

        // 2. Fallback Engine: tikwm API
        if (!videoUrl) {
            try {
                // Expand short redirect if needed
                let resolvedUrl = targetUrl;
                try {
                    const redirectCheck = await axios.get(targetUrl, {
                        maxRedirects: 5,
                        timeout: 10000,
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                    });
                    if (redirectCheck?.request?.res?.responseUrl) {
                        resolvedUrl = redirectCheck.request.res.responseUrl;
                    }
                } catch {}

                const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(resolvedUrl)}`, {
                    timeout: 15000,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });

                if (res.data?.data) {
                    const d = res.data.data;
                    videoUrl = d.play || d.hdplay || d.wmplay;
                    title = d.title || title;
                    author = d.author?.nickname || d.author?.unique_id || author;
                }
            } catch (err) {
                console.warn('[TikTok] tikwm fallback error:', err.message);
            }
        }

        if (!videoUrl) {
            throw new Error('Video download link nahi mil saka. Baraye meharbani link check karein.');
        }

        const caption =
`╭━━━〔 📱 *TIKTOK DOWNLOADED* 〕━━━┈⊷
┃ 📌 *Title:* ${title.slice(0, 70)}
┃ 👤 *Author:* ${author}
┃ ⚡ *Powered by:* ${settings.botName || 'SALU MD'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷`;

        // Direct URL stream with buffer fallback
        try {
            await sock.sendMessage(from, {
                video: { url: videoUrl },
                caption,
                mimetype: 'video/mp4'
            }, { quoted: msg });
        } catch (streamErr) {
            console.warn('[TikTok] Direct stream failed, buffering video...', streamErr.message);
            const vidRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            await sock.sendMessage(from, {
                video: Buffer.from(vidRes.data),
                caption,
                mimetype: 'video/mp4'
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } }).catch(() => {});

    } catch (e) {
        console.error('[TikTok Command Error]:', e);
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }).catch(() => {});
        await sock.sendMessage(from, { text: `❌ TikTok download fail ho gaya: ${e.message}` }, { quoted: msg });
    }
}

module.exports = tiktokCommand;
