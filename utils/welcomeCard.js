'use strict';

/**
 * MR SAQIB MD :: Dynamic Group Welcome & Goodbye Banner Generator
 * ============================================================================
 * Creates a modern glowing aesthetic banner card with:
 * - Dark burgundy / crimson radial gradient background
 * - Glowing neon ring surrounding the member's circular avatar
 * - Bold white "WELCOME" typography
 * - Dynamic "Member #XX" subtitle
 * - Anti-aliased particle stars and ambient dust
 * ============================================================================
 */

const sharp = require('sharp');
const axios = require('axios');

/**
 * Generate default avatar silhouette if user has no profile picture
 */
async function generateDefaultAvatar(size = 250) {
    const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="#2e050c"/>
        <circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.18}" fill="#ff4d6d" opacity="0.85"/>
        <path d="M ${size * 0.2} ${size * 0.88} C ${size * 0.2} ${size * 0.65}, ${size * 0.35} ${size * 0.62}, ${size * 0.5} ${size * 0.62} C ${size * 0.65} ${size * 0.62}, ${size * 0.8} ${size * 0.65}, ${size * 0.8} ${size * 0.88} Z" fill="#ff4d6d" opacity="0.85"/>
    </svg>`;
    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Generate Welcome Banner Image Buffer
 * @param {Buffer|null} rawAvatarBuffer - Buffer of user's DP (or null)
 * @param {object} options - { type: 'WELCOME'|'GOODBYE', memberNumber: number|string, groupName: string }
 * @returns {Promise<Buffer>} - High-res JPEG buffer
 */
async function generateWelcomeCard(rawAvatarBuffer, options = {}) {
    const {
        type = 'WELCOME',
        memberNumber = '46',
        groupName = 'The Group'
    } = options;

    const width = 1200;
    const height = 675;
    const avatarSize = 250;
    const avatarCenterX = 600;
    const avatarCenterY = 215;

    // 1. Process or create circular avatar
    let avatarInput = rawAvatarBuffer;
    if (!avatarInput || !Buffer.isBuffer(avatarInput) || avatarInput.length === 0) {
        avatarInput = await generateDefaultAvatar(avatarSize);
    }

    const circleMask = Buffer.from(
        `<svg width="${avatarSize}" height="${avatarSize}">
            <circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" fill="#ffffff"/>
        </svg>`
    );

    let circularAvatar;
    try {
        circularAvatar = await sharp(avatarInput)
            .resize(avatarSize, avatarSize, { fit: 'cover', position: 'center' })
            .composite([{ input: circleMask, blend: 'dest-in' }])
            .png()
            .toBuffer();
    } catch (err) {
        console.error('[welcomeCard] Error creating circular avatar:', err.message);
        try {
            const fallback = await generateDefaultAvatar(avatarSize);
            circularAvatar = await sharp(fallback)
                .composite([{ input: circleMask, blend: 'dest-in' }])
                .png()
                .toBuffer();
        } catch {
            circularAvatar = await generateDefaultAvatar(avatarSize);
        }
    }

    // 2. Build SVG Canvas with radial gradient, particles, glow ring & typography
    const isWelcome = (type.toUpperCase() === 'WELCOME');
    const mainTitle = isWelcome ? 'WELCOME' : 'GOODBYE';
    const subTitle = isWelcome ? `Member #${memberNumber}` : `Left the Group`;

    const svgBackground = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="bgGradient" cx="50%" cy="32%" r="75%">
                <stop offset="0%" stop-color="#4d0b16"/>
                <stop offset="42%" stop-color="#26050b"/>
                <stop offset="100%" stop-color="#0d0204"/>
            </radialGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12"/>
            </filter>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="22"/>
            </filter>
        </defs>

        <!-- Base Background with subtle rounded border -->
        <rect width="${width}" height="${height}" rx="32" fill="url(#bgGradient)"/>

        <!-- Ambient Particle Dots -->
        <circle cx="130" cy="180" r="2.5" fill="#ffffff" opacity="0.35"/>
        <circle cx="1060" cy="220" r="3" fill="#ffffff" opacity="0.3"/>
        <circle cx="310" cy="100" r="2" fill="#ffffff" opacity="0.45"/>
        <circle cx="910" cy="120" r="2.5" fill="#ffffff" opacity="0.4"/>
        <circle cx="210" cy="490" r="2" fill="#ffffff" opacity="0.25"/>
        <circle cx="1020" cy="470" r="2" fill="#ffffff" opacity="0.3"/>
        <circle cx="600" cy="35" r="1.5" fill="#ffffff" opacity="0.4"/>
        <circle cx="440" cy="580" r="1.8" fill="#ffffff" opacity="0.25"/>
        <circle cx="780" cy="570" r="2.2" fill="#ffffff" opacity="0.28"/>

        <!-- Outer Glowing Aura -->
        <circle cx="${avatarCenterX}" cy="${avatarCenterY}" r="148" stroke="#ff1a40" stroke-width="26" fill="none" opacity="0.22" filter="url(#softGlow)"/>

        <!-- Middle Neon Ring -->
        <circle cx="${avatarCenterX}" cy="${avatarCenterY}" r="137" stroke="#ff2d55" stroke-width="12" fill="none" opacity="0.75" filter="url(#neonGlow)"/>

        <!-- Inner Crisp Ring -->
        <circle cx="${avatarCenterX}" cy="${avatarCenterY}" r="128" stroke="#ff5c7c" stroke-width="4.5" fill="none"/>

        <!-- Main Title: WELCOME -->
        <text x="${avatarCenterX}" y="435" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="64" fill="#ffffff" text-anchor="middle" letter-spacing="10">${mainTitle}</text>

        <!-- Subtitle: Member #46 -->
        <text x="${avatarCenterX}" y="492" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="28" fill="#ff758f" text-anchor="middle" letter-spacing="3">${subTitle}</text>
    </svg>
    `);

    // 3. Composite avatar onto SVG background
    const finalBuffer = await sharp(svgBackground)
        .composite([
            {
                input: circularAvatar,
                top: Math.round(avatarCenterY - avatarSize / 2),
                left: Math.round(avatarCenterX - avatarSize / 2)
            }
        ])
        .jpeg({ quality: 95 })
        .toBuffer();

    return finalBuffer;
}

const { fetchUserPfpBuffer } = require('./pfpFetcher');

module.exports = {
    generateWelcomeCard,
    fetchUserPfpBuffer,
    generateDefaultAvatar
};
