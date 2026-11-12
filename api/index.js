const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('*', (req, res) => {
    const publicIndex = path.join(__dirname, '..', 'public', 'index.html');
    if (fs.existsSync(publicIndex)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(publicIndex);
    }
    const rootHtml = path.join(__dirname, '..', 'index.html');
    if (fs.existsSync(rootHtml)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(rootHtml);
    }
    res.status(200).send('SALU MD ONLINE');
});

module.exports = app;
