'use strict';
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'bot_data.json');

module.exports = {
  getGlobalSetting: (key) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readJsonSync(DATA_FILE);
        return data[key];
      }
    } catch {}
    return null;
  },
  setGlobalSetting: (key, val) => {
    try {
      let data = {};
      if (fs.existsSync(DATA_FILE)) {
        try {
          data = fs.readJsonSync(DATA_FILE);
        } catch {}
      }
      data[key] = val;
      fs.writeJsonSync(DATA_FILE, data);
    } catch (e) {
      console.error('[database.js] setGlobalSetting error:', e.message);
    }
  }
};
