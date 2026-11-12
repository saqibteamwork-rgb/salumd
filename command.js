'use strict';

const commands = [];

function cmd(info, func) {
    const data = Object.assign({}, info);
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!data.desc) data.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!data.category) data.category = 'misc';
    if (!data.filename) data.filename = "Not Provided";
    if (!data.alias) data.alias = [];
    commands.push(data);
    return data;
}

module.exports = {
    cmd,
    commands
};
