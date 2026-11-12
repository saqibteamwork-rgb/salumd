const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('*', (req, res) => {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(htmlPath);
    }
    res.status(200).send('MR SAQIB MD ONLINE');
});

module.exports = app;
