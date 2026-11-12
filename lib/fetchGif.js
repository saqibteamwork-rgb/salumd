'use strict';
const axios = require('axios');

async function fetchGif(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
}

async function gifToVideo(buffer) {
    return buffer;
}

module.exports = {
    fetchGif,
    gifToVideo
};
