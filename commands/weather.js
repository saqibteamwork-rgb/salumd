const fetch = require('node-fetch');
const settings = require('../settings');

async function weatherCommand(sock, chatId, msg) {
    const fullText = msg.message?.conversation?.trim() ||
                     msg.message?.extendedTextMessage?.text?.trim() || '';

    const q = fullText.split(' ').slice(1).join(' ').trim();

    if (!q) {
        await sock.sendMessage(chatId, {
            text: '🌦️ *Usage:* .weather <city name>\n\nExample:\n.weather Lahore'
        }, { quoted: msg });
        return;
    }

    try {
        const city = q.trim();
        const apiKey = settings.openWeatherApiKey;

        // 1. If OpenWeather API key is provided, use OpenWeather
        if (apiKey && apiKey !== 'YOUR_OPENWEATHER_API_KEY') {
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.cod === 200) {
                    const condition = data.weather?.[0]?.main || 'N/A';
                    const description = data.weather?.[0]?.description || 'N/A';

                    const text =
                        `🌤️ *Weather in ${data.name}, ${data.sys?.country || ''}*\n\n` +
                        `🌡️ *Temperature:* ${data.main.temp}°C\n` +
                        `🥵 *Feels like:* ${data.main.feels_like}°C\n` +
                        `📉 *Min / Max:* ${data.main.temp_min}°C / ${data.main.temp_max}°C\n` +
                        `💧 *Humidity:* ${data.main.humidity}%\n` +
                        `💨 *Wind:* ${data.wind?.speed ?? 'N/A'} m/s\n` +
                        `☁️ *Condition:* ${description}\n` +
                        `🔽 *Pressure:* ${data.main.pressure} hPa\n\n` +
                        `🚀 _${settings.botName || 'MR SAQIB MD'}_`;

                    return await sock.sendMessage(chatId, { text }, { quoted: msg });
                }
            } catch (err) {
                console.warn('[OpenWeather Error, falling back to wttr.in]:', err.message);
            }
        }

        // 2. Built-in Zero-Config Fallback: wttr.in (100% Free, No API Key needed!)
        const fallbackUrl = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
        const res = await fetch(fallbackUrl, { headers: { 'User-Agent': 'curl/7.68.0' } });
        const wttrData = await res.json();

        if (wttrData?.current_condition?.[0]) {
            const current = wttrData.current_condition[0];
            const area = wttrData.nearest_area?.[0]?.areaName?.[0]?.value || city;
            const country = wttrData.nearest_area?.[0]?.country?.[0]?.value || '';
            const desc = current.weatherDesc?.[0]?.value || 'Clear';

            const text =
`╭━━━〔 🌦️ *WEATHER REPORT* 〕━━━┈⊷
┃ 📍 *City:* ${area}, ${country}
┃ 🌡️ *Temperature:* ${current.temp_C}°C (${current.temp_F}°F)
┃ 🥵 *Feels Like:* ${current.FeelsLikeC}°C
┃ ☁️ *Condition:* ${desc}
┃ 💧 *Humidity:* ${current.humidity}%
┃ 💨 *Wind Speed:* ${current.windspeedKmph} km/h
┃ 👁️ *Visibility:* ${current.visibility} km
┃ 🔽 *Pressure:* ${current.pressure} mb
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *${settings.botName || 'MR SAQIB MD'}*`;

            return await sock.sendMessage(chatId, { text }, { quoted: msg });
        }

        throw new Error(`City info nahi mili: ${city}`);

    } catch (error) {
        console.error('Error in weather command:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Weather info hasil karne mein masla aya.\n_Error: ${error.message || error}_`
        }, { quoted: msg });
    }
}

module.exports = weatherCommand;
