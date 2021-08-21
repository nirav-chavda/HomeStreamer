const fs = require('fs');
const _path = require('path');
const HistoryController = require('./HistoryController')
const {
    uploadsPath
} = require('../config').config;

const contentTypeMapper = {
    'mp4': 'video/mp4',
    'mkv': 'video/mp4'
}

exports.watchVideo = (req, res) => {
    const name = Buffer.from(req.params.id, 'base64').toString('ascii');
    const extension = _path.extname(name);
    const contentType = contentTypeMapper[extension.substr(1)];

    HistoryController.setHistory(req.sessionID, req.params.id, _path.basename(name.substr(0, name.lastIndexOf('.'))))

    res.render('stream', {
        'src': req.params.id,
        'name': _path.basename(name.substr(0, name.lastIndexOf('.'))),
        'content_type': contentType,
        'streamPage': true
    });
}

exports.streamVideo = (req, res) => {

    const path = _path.normalize(`${uploadsPath}${_path.sep}${Buffer.from(req.params.id, 'base64').toString('ascii')}`);
    const extension = _path.extname(path);
    const contentType = contentTypeMapper[extension.substr(1)];

    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ?
            parseInt(parts[1], 10) :
            fileSize - 1;
        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(path, {
            start,
            end
        });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': contentType,
        }
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
};