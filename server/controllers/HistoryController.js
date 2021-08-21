const fs = require('fs');
const path = require('path');

let {
    dataPath
} = require('../config').config;

exports.getHistory = (req, res) => {

    const fileName = 'history.json';
    const destinationPath = `${dataPath}${path.sep}${fileName}`;
    const sessionID = req.sessionID
    
    let content = {};
    let data = null;
    let success = true;
    let status = 200;

    if (sessionID != "") {
        content[sessionID] = null
        try {
            if (fs.existsSync(destinationPath)) {
                content = JSON.parse(fs.readFileSync(destinationPath, 'utf8'));
            }
            data = (content[sessionID] === undefined || content[sessionID] === null) ? null : content[sessionID];
        } catch (err) {
            success = false;
            status = 500;
        }
    }

    res.status(status).json({
        success,
        data
    });
}

exports.setHistory = (sessionID = "", link = "", name = "") => {

    if (['icon.png'].indexOf(link) != -1) {
        return
    }

    const fileName = 'history.json';
    const destinationPath = `${dataPath}${path.sep}${fileName}`;

    if (sessionID == "" || link == "") {
        return
    }

    let content = {}

    if (fs.existsSync(destinationPath)) {
        content = JSON.parse(fs.readFileSync(destinationPath, 'utf8'));
    }

    content[sessionID] = {
        'history_link': link,
        'history_name': name
    }

    fs.writeFileSync(destinationPath, JSON.stringify(content, null, "\t"));
}