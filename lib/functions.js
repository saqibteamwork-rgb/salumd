'use strict';

const axios = require('axios');

const getGroupAdmins = (participants = []) => {
    let admins = [];
    for (let i of participants) {
        if (i.admin === "admin" || i.admin === "superadmin") {
            admins.push(i.id);
        }
    }
    return admins;
};

const getRandom = (ext = '') => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
                'User-Agent': 'Mozilla/5.0'
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return Buffer.from(res.data);
    } catch (e) {
        return null;
    }
};

const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        return null;
    }
};

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
};

const Json = (data) => JSON.stringify(data, null, 2);

const runtime = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " d, " : " d, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " h, " : " h, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " m, " : " m, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " s" : " s") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

const h2k = (number) => {
    var SI_POSTFIXES = ["", " K", " M", " G", " T", " P", " E"];
    var tier = Math.log10(Math.abs(number)) / 3 | 0;
    if(tier == 0) return number;
    var postfix = SI_POSTFIXES[tier];
    var scale = Math.pow(10, tier * 3);
    var scaled = number / scale;
    var formatted = scaled.toFixed(1) + '';
    if (/\.0$/.test(formatted))
      formatted = formatted.substr(0, formatted.length - 2);
    return formatted + postfix;
};

module.exports = {
    getGroupAdmins,
    getRandom,
    getBuffer,
    fetchJson,
    sleep,
    isUrl,
    Json,
    runtime,
    h2k
};
