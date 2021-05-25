const fs = require('fs');
const os = require('os');
const path = require('path');
const logger = require('../../lib/logger');
let {
    uploadsPath
} = require('../config').config;

const supportedTypes = ['.mp4', '.mkv'];
const permissionMessage = {
    win32: "Run this application as Administrator",
    other: "Not have enough permission! Try to run with sudo"
}

function checkValidPath(full_path) {
    stat = fs.lstatSync(full_path);
    return (stat.isFile() && !stat.isSymbolicLink() && supportedTypes.includes(path.extname(full_path)))
}

exports.list = (req, res) => {

    let targetDir = uploadsPath;

    if (req.query.dir) {
        req.query.dir = Buffer.from(req.query.dir, 'base64').toString('ascii');
        if (req.query.dir === './..') {
            delete req.query.dir;
            targetDir = uploadsPath;
        } else {
            if (path.basename(req.query.dir) === '..') {
                targetDir = `${targetDir}${path.sep}${path.dirname(req.query.dir)}`;
                req.query.dir = req.query.dir.replace('/..', '');
            } else {
                targetDir = `${targetDir}${path.sep}${req.query.dir}`;
            }
        }
        targetDir = path.normalize(targetDir);
    }

    let list = [];
    uploadsPath = path.resolve(uploadsPath);
    targetDir = path.resolve(targetDir);

    if (targetDir !== uploadsPath) {
        backDir = path.relative(uploadsPath, targetDir);
        if (backDir != '') {
            list.push({
                name: 'Back',
                value: Buffer.from(`${path.dirname(backDir)}/..`).toString('base64'),
                type: 'dir',
                isBack: true
            });
        }
    }

    fs.readdirSync(targetDir).forEach(file => {
        list.push({
            name: file,
            value: Buffer.from((req.query.dir) ? path.normalize(`${req.query.dir}/${file}`) : file).toString('base64'),
            type: (fs.lstatSync(path.normalize(`${targetDir}/${file}`)).isDirectory()) ? 'dir' : 'file'
        });
    });

    res.status(200).json({
        list
    });
}

exports.add = async (req, res) => {
    const full_path = req.body.path;

    if (!path.isAbsolute(full_path)) {
        res.status(400).json({
            success: false,
            message: 'Path is not absolute'
        });
    } else {
        try {
            if (checkValidPath(full_path)) {
                res.status(200).json({
                    success: true,
                    path: full_path,
                    name: path.basename(full_path)
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: (stat.isDirectory()) ? 'Directory is passed! Please pass a file path' : 'This file type is not supported'
                });
            }
        } catch (error) {
            console.error(error);
            logger.log(error);
            res.status(400).json({
                success: false,
                message: 'File does not exists'
            });
        }
    }
};

exports.make = (req, res) => {

    const full_path = req.body.path;
    const fileName = path.basename(req.body.name);
    const destination = `${uploadsPath}/${fileName}`

    if (!checkValidPath(full_path)) {
        res.status(400).json({
            success: false,
            message: 'Path is invalid'
        });
        return;
    }

    if (fs.existsSync(destination)) {
        res.status(400).json({
            success: false,
            message: 'File name is already in use'
        });
    } else {
        try {
            fs.symlinkSync(full_path, destination, 'file');
            console.log("\nSymlink created\n");
            res.status(200).json({
                success: true,
                message: 'Added'
            });
        } catch (err) {
            console.log(err);
            logger.log(err);
            res.status(400).json({
                success: false,
                message: (err.code === 'EPERM') ? ((os.platform() === 'win32') ? permissionMessage.win32 : permissionMessage.win32) : 'Operation Failed'
            });
        }
    }
}