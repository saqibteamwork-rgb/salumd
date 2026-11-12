'use strict';

/**
 * MR SAQIB MD :: Textmaker & Visual Effects Suite
 * ============================================================================
 * Instant Offline HD Banner Generation with Sharp & SVG:
 * 1.  .neon        - Cyberpunk neon cyan glow
 * 2.  .glitch      - Chromatic RGB split glitch
 * 3.  .fire        - Flaming crimson & orange blaze
 * 4.  .devil       - Gothic blood red devil
 * 5.  .hacker      - Monospace green matrix terminal
 * 6.  .matrix      - Matrix digital code rain
 * 7.  .thunder     - Electric lightning flash
 * 8.  .ice         - Frozen crystal frost
 * 9.  .sand        - Golden desert dunes
 * 10. .snow        - Winter blizzard glow
 * 11. .purple      - Vaporwave synthwave purple
 * 12. .leaves      - Organic emerald forest
 * 13. .light       - Solar celestial gold radiance
 * 14. .metallic    - Brushed chrome steel bevel
 * 15. .arena       - Esports battle arena red/cyan
 * 16. .birthday    - Festive confetti celebration
 * 17. .blackpink   - Signature Blackpink luxury aesthetic
 * 18. .1917        - Vintage sepia letterpress
 * 19. .impressive  - Embossed royal gold medallion
 * ============================================================================
 */

const sharp = require('sharp');
const settings = require('../settings');

const THEMES = {
    neon: {
        bg: '#0a0a16',
        c1: '#00f2fe',
        c2: '#4facfe',
        stroke: '#00f2fe',
        glow: '#00f2fe',
        label: 'NEON CYBER'
    },
    glitch: {
        bg: '#0d0d12',
        c1: '#ff0055',
        c2: '#00ffff',
        stroke: '#ff0055',
        glow: '#ff0077',
        label: 'CYBER GLITCH'
    },
    fire: {
        bg: '#140502',
        c1: '#ff416c',
        c2: '#ff4b1f',
        stroke: '#ff4b1f',
        glow: '#ff2a00',
        label: 'BLAZING FIRE'
    },
    devil: {
        bg: '#160205',
        c1: '#e52d27',
        c2: '#b31217',
        stroke: '#ff0022',
        glow: '#8b0000',
        label: 'DEVIL GOTHIC'
    },
    hacker: {
        bg: '#020d04',
        c1: '#00ff66',
        c2: '#10b981',
        stroke: '#00ff66',
        glow: '#00ff44',
        label: 'ROOT TERMINAL'
    },
    matrix: {
        bg: '#010c05',
        c1: '#22c55e',
        c2: '#15803d',
        stroke: '#22c55e',
        glow: '#16a34a',
        label: 'DIGITAL MATRIX'
    },
    thunder: {
        bg: '#050a18',
        c1: '#38bdf8',
        c2: '#818cf8',
        stroke: '#38bdf8',
        glow: '#60a5fa',
        label: 'THUNDER BOLT'
    },
    ice: {
        bg: '#05111d',
        c1: '#e0f2fe',
        c2: '#38bdf8',
        stroke: '#7dd3fc',
        glow: '#bae6fd',
        label: 'FROZEN ICE'
    },
    sand: {
        bg: '#1c1308',
        c1: '#fde047',
        c2: '#ca8a04',
        stroke: '#eab308',
        glow: '#a16207',
        label: 'GOLDEN DESERT'
    },
    snow: {
        bg: '#090d14',
        c1: '#ffffff',
        c2: '#cbd5e1',
        stroke: '#94a3b8',
        glow: '#f8fafc',
        label: 'WINTER BLIZZARD'
    },
    purple: {
        bg: '#0e0517',
        c1: '#c084fc',
        c2: '#9333ea',
        stroke: '#a855f7',
        glow: '#7e22ce',
        label: 'VAPORWAVE PURPLE'
    },
    leaves: {
        bg: '#04130a',
        c1: '#4ade80',
        c2: '#16a34a',
        stroke: '#22c55e',
        glow: '#15803d',
        label: 'EMERALD NATURE'
    },
    light: {
        bg: '#141108',
        c1: '#fef08a',
        c2: '#f59e0b',
        stroke: '#fbbf24',
        glow: '#d97706',
        label: 'CELESTIAL LIGHT'
    },
    metallic: {
        bg: '#111215',
        c1: '#f1f5f9',
        c2: '#64748b',
        stroke: '#94a3b8',
        glow: '#475569',
        label: 'CHROME METALLIC'
    },
    arena: {
        bg: '#12040b',
        c1: '#f43f5e',
        c2: '#06b6d4',
        stroke: '#f43f5e',
        glow: '#06b6d4',
        label: 'ESPORTS ARENA'
    },
    birthday: {
        bg: '#150616',
        c1: '#ec4899',
        c2: '#facc15',
        stroke: '#f472b6',
        glow: '#e11d48',
        label: 'HAPPY BIRTHDAY'
    },
    blackpink: {
        bg: '#08080a',
        c1: '#ff5c8a',
        c2: '#ff99b6',
        stroke: '#ff5c8a',
        glow: '#e0245e',
        label: 'BLACKPINK EDITION'
    },
    '1917': {
        bg: '#1b1712',
        c1: '#e7d8c9',
        c2: '#b89b72',
        stroke: '#8c704f',
        glow: '#594532',
        label: 'VINTAGE 1917'
    },
    impressive: {
        bg: '#0a0d14',
        c1: '#fbbf24',
        c2: '#f59e0b',
        stroke: '#d97706',
        glow: '#b45309',
        label: 'IMPRESSIVE GOLD'
    }
};

function escapeXml(unsafe) {
    return String(unsafe || '').replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

async function generateTextBanner(text, themeName) {
    const t = THEMES[themeName] || THEMES.neon;
    const safeText = escapeXml(text.toUpperCase().slice(0, 30));
    const botTitle = escapeXml((settings.botName || 'MR SAQIB MD').toUpperCase());

    const svg = `
<svg width="900" height="360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.c1}"/>
      <stop offset="100%" stop-color="${t.c2}"/>
    </linearGradient>
    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="${t.bg}"/>

  <!-- Aesthetic Grid & Border -->
  <rect x="25" y="25" width="850" height="310" rx="20" fill="none" stroke="${t.stroke}" stroke-width="2.5" opacity="0.4"/>
  <circle cx="50" cy="50" r="5" fill="${t.c1}" opacity="0.7"/>
  <circle cx="850" cy="50" r="5" fill="${t.c2}" opacity="0.7"/>
  <circle cx="50" cy="310" r="5" fill="${t.c2}" opacity="0.7"/>
  <circle cx="850" cy="310" r="5" fill="${t.c1}" opacity="0.7"/>

  <!-- Subtitle Tag -->
  <text x="450" y="90" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="${t.c1}" text-anchor="middle" letter-spacing="5" opacity="0.8">⚡ ${t.label} ⚡</text>

  <!-- Main Styled Text -->
  <text x="450" y="190" font-family="Arial Black, Impact, sans-serif" font-size="52" font-weight="900" fill="url(#textGrad)" filter="url(#glowEffect)" text-anchor="middle" dominant-baseline="middle">${safeText}</text>

  <!-- Footer Branding -->
  <line x1="250" y1="260" x2="650" y2="260" stroke="${t.stroke}" stroke-width="1.5" opacity="0.3"/>
  <text x="450" y="295" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#94a3b8" text-anchor="middle" letter-spacing="3">${botTitle} • OFFICIAL</text>
</svg>
`;

    return await sharp(Buffer.from(svg))
        .png({ quality: 95 })
        .toBuffer();
}

async function textmakerCommand(sock, from, msg, args = [], effectName = 'neon') {
    try {
        const text = args.join(' ').trim();
        if (!text) {
            return await sock.sendMessage(from, {
                text: `❌ *Usage:* \`.${effectName} <text>\`\n_Example: .${effectName} Saqib MD_`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } }).catch(() => {});

        const imageBuffer = await generateTextBanner(text, effectName);

        const caption = 
`╭━━━〔 🎨 *TEXT EFFECT: ${effectName.toUpperCase()}* 〕━━━┈⊷
┃ 🔤 *Text:* ${text}
┃ 🖼️ *Quality:* Ultra HD 900x360
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
🚀 *MR SAQIB MD*`;

        await sock.sendMessage(from, {
            image: imageBuffer,
            caption
        }, { quoted: msg });

    } catch (e) {
        console.error(`[Textmaker Error ${effectName}]:`, e);
        await sock.sendMessage(from, { text: `❌ Text effect generate nahi ho saka: ${e.message}` }, { quoted: msg });
    }
}

module.exports = {
    textmakerCommand,
    THEMES
};
