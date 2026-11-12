'use strict';

/**
 * SALU MD :: Extended Fun & Entertainment Suite
 * ============================================================================
 * Commands:
 * - .shayari    : Urdu / Hindi poetry
 * - .flirt      : Cute & romantic pickup lines
 * - .lovequote  : Heartfelt love quotes
 * - .motivation : Inspiring motivational quotes
 * - .cat        : Random cat photo + fun fact
 * - .dog        : Random dog photo + fun fact
 * - .fact       : Interesting world facts
 * - .insult     : Funny burns & roasts
 * - .advice     : Wise life advice
 * - .gayrate    : Fun percentage meter
 * - .dice       : Roll a 6-sided dice
 * - .coin       : Flip a coin (Heads/Tails)
 * ============================================================================
 */

const axios = require('axios');

const SHAYARI_LIST = [
    "دل ناداں تجھے ہوا کیا ہے، آخر اس درد کی دوا کیا ہے؟\nہم ہیں مشتاق اور وہ بے زار، یا الٰہی یہ ماجرا کیا ہے؟",
    "ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے،\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے۔",
    "وہ آئے بزم میں اتنا تو ہم نے دیکھا تھا،\nپھر اس کے بعد چراغوں میں روشنی نہ رہی۔",
    "نہ جانے کس لیے امید وار بیٹھا ہوں،\nاک ایسی راہ پہ جس کا کوئی سرا ہی نہیں۔",
    "محبت میں نہیں ہے فرق جینے اور مرنے کا،\nاسی کو دیکھ کر جیتے ہیں جس کافر پہ دم نکلے۔",
    "تیرے ہوتے ہوئے محفل میں جلاتے ہیں چراغ،\nلوگ کیا سادہ ہیں سورج کو دکھاتے ہیں چراغ۔",
    "ہم کو معلوم ہے جنت کی حقیقت لیکن،\nدل کے خوش رکھنے کو غالبؔ یہ خیال اچھا ہے۔",
    "زندگی سے یہی گلہ ہے مجھے،\nتو بڑی دیر سے ملا ہے مجھے۔"
];

const FLIRT_LINES = [
    "Kya aapke paas Google Map hai? Kyunki main aapki aankhon me kho gaya hoon! 😉",
    "Agar khubsurti time hoti, to aap hamesha ke liye timeless hotay! ✨",
    "Aap koi Wi-Fi ho kya? Kyunki mujhe aapse instant connection feel ho raha hai! 📶",
    "Doctor ne mujhe Vitamin U ki kami batai hai! ❤️",
    "Kya aap thak nahi gaye? Kyunki aap saara din mere dimaag me ghoomte rehte ho! 🥰",
    "Aapko koi ticket lagi hai? Kyunki aap pure shehar me sabse pyare lag rahe ho! 🌹"
];

const LOVE_QUOTES = [
    "I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more.",
    "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    "If I know what love is, it is because of you.",
    "I would rather spend one lifetime with you, than face all the ages of this world alone.",
    "You are my today and all of my tomorrows."
];

const MOTIVATION_QUOTES = [
    "Kamiyabi unhi ko milti hai jo haar manne se inkaar kar dete hain! 🚀",
    "Mausam badalne se pehle parwaz shuru karo, waqt kisi ka intezar nahi karta! 🦅",
    "Mushkilein har kisi ke raste me aati hain, lekin jeet usi ki hoti hai jo dat kar khada rehta hai! 💪",
    "The harder you work for something, the greater you will feel when you achieve it! 🌟",
    "Don't watch the clock; do what it does. Keep going! ⏰"
];

const INSULTS = [
    "Aapki aqal to aisi hai jaise Nokia 3310 me 5G search karna! 😂",
    "Agar bewakoofi koi art hoti, to aap uske Picasso hotay! 🎨",
    "Aapki baatein sun kar lagta hai ke dimaag bas sar me weight balance karne ke liye diya gaya tha! 🤦‍♂️",
    "Aap itne slow ho ke buffer hone me bhi time lagta hai! ⏳",
    "Aapke views sun kar Wikipedia ne bhi resign de diya! 📉"
];

async function shayariCommand(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: '📜', key: msg.key } }).catch(() => {});
    const s = SHAYARI_LIST[Math.floor(Math.random() * SHAYARI_LIST.length)];
    const text = 
`╭━━━〔 📜 *URDU SHAYARI* 〕━━━┈⊷
┃
┃ ${s.replace(/\n/g, '\n┃ ')}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *SALU MD*`;
    await sock.sendMessage(from, { text }, { quoted: msg });
}

async function flirtCommand(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: '😉', key: msg.key } }).catch(() => {});
    const line = FLIRT_LINES[Math.floor(Math.random() * FLIRT_LINES.length)];
    await sock.sendMessage(from, { text: `🌹 *FLIRT LINE:*\n\n${line}` }, { quoted: msg });
}

async function lovequoteCommand(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: '❤️', key: msg.key } }).catch(() => {});
    const q = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
    await sock.sendMessage(from, { text: `💖 *LOVE QUOTE:*\n\n“${q}”` }, { quoted: msg });
}

async function motivationCommand(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: '🔥', key: msg.key } }).catch(() => {});
    const m = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    await sock.sendMessage(from, { text: `⚡ *MOTIVATION:*\n\n${m}` }, { quoted: msg });
}

async function catCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { react: { text: '🐱', key: msg.key } }).catch(() => {});
        const res = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 });
        const imgUrl = res.data?.[0]?.url;
        if (!imgUrl) throw new Error("Cat image nahi mili.");

        await sock.sendMessage(from, {
            image: { url: imgUrl },
            caption: `🐱 *Meow! Have a cute cat!* 💕\n🚀 _SALU MD_`
        }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Cat error: ${e.message}` }, { quoted: msg });
    }
}

async function dogCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { react: { text: '🐶', key: msg.key } }).catch(() => {});
        const res = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 });
        const imgUrl = res.data?.message;
        if (!imgUrl) throw new Error("Dog image nahi mili.");

        await sock.sendMessage(from, {
            image: { url: imgUrl },
            caption: `🐶 *Woof! Here is a lovely doggo!* 🐕\n🚀 _SALU MD_`
        }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Dog error: ${e.message}` }, { quoted: msg });
    }
}

async function factCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { react: { text: '💡', key: msg.key } }).catch(() => {});
        const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 10000 });
        const fact = res.data?.text || "Cats have 32 muscles in each ear.";
        await sock.sendMessage(from, {
            text: `╭━━━〔 💡 *DID YOU KNOW?* 〕━━━┈⊷\n┃ 📌 ${fact}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n🚀 *SALU MD*`
        }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Fact error: ${e.message}` }, { quoted: msg });
    }
}

async function insultCommand(sock, from, msg) {
    await sock.sendMessage(from, { react: { text: '🔥', key: msg.key } }).catch(() => {});
    const burn = INSULTS[Math.floor(Math.random() * INSULTS.length)];
    await sock.sendMessage(from, { text: `🔥 *ROAST / INSULT:*\n\n${burn}` }, { quoted: msg });
}

async function adviceCommand(sock, from, msg) {
    try {
        await sock.sendMessage(from, { react: { text: '🧠', key: msg.key } }).catch(() => {});
        const res = await axios.get('https://api.adviceslip.com/advice', { timeout: 10000 });
        const adv = res.data?.slip?.advice || "Always treat people with respect.";
        await sock.sendMessage(from, { text: `🧠 *ADVICE:*\n\n“${adv}”` }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ Advice error: ${e.message}` }, { quoted: msg });
    }
}

async function gayrateCommand(sock, from, msg) {
    const rate = Math.floor(Math.random() * 101);
    await sock.sendMessage(from, { text: `🏳️‍🌈 *GAY RATE METER:*\n\nAap *${rate}%* gay hain! 😂` }, { quoted: msg });
}

async function diceCommand(sock, from, msg) {
    const diceFaces = ['⚀ 1', '⚁ 2', '⚂ 3', '⚃ 4', '⚄ 5', '⚅ 6'];
    const roll = diceFaces[Math.floor(Math.random() * diceFaces.length)];
    await sock.sendMessage(from, { text: `🎲 *DICE ROLLED:*\n\nNateeja: *${roll}*` }, { quoted: msg });
}

async function coinCommand(sock, from, msg) {
    const outcomes = ['HEADS 🪙 (Sar)', 'TAILS 🪙 (Poochh)'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    await sock.sendMessage(from, { text: `🪙 *COIN FLIP:*\n\nNateeja: *${result}*` }, { quoted: msg });
}

module.exports = {
    shayariCommand,
    flirtCommand,
    lovequoteCommand,
    motivationCommand,
    catCommand,
    dogCommand,
    factCommand,
    insultCommand,
    adviceCommand,
    gayrateCommand,
    diceCommand,
    coinCommand
};
