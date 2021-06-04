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

const encodePath = (path) => Buffer.from(path).toString('base64');

const decodePath = (path) => Buffer.from(path, 'base64').toString('ascii');

function checkValidPath(full_path) {
    stat = fs.lstatSync(full_path);
    return (stat.isFile() && !stat.isSymbolicLink() && supportedTypes.includes(path.extname(full_path)))
}

function resolveTargetDirectory(req) {
    let targetDir = uploadsPath;

    if ('body' in req && 'path' in req.body && req.body.path != null) {
        req.query = (req.query == undefined || req.query == null) ? {} : req.query;
        req.query.dir = (req.query.dir == undefined || req.query.dir == null) ? req.body.path : req.query.dir;
    }

    if (req.query.dir) {
        req.query.dir = decodePath(req.query.dir);
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

    return targetDir;
}

exports.list = (req, res) => {

    let targetDir = resolveTargetDirectory(req);

    let list = [];
    uploadsPath = path.resolve(uploadsPath);
    targetDir = path.resolve(targetDir);

    if (targetDir !== uploadsPath) {
        backDir = path.relative(uploadsPath, targetDir);
        if (backDir != '') {
            list.push({
                name: 'Back',
                value: encodePath(`${path.dirname(backDir)}/..`),
                type: 'dir',
                isBack: true
            });
        }
    }

    fs.readdirSync(targetDir).forEach(file => {
        const isDir = fs.lstatSync(path.normalize(`${targetDir}/${file}`)).isDirectory();
        if (supportedTypes.includes(path.extname(file)) || isDir) {
            list.push({
                name: file,
                value: encodePath((req.query.dir) ? path.normalize(`${req.query.dir}/${file}`) : file),
                type: (isDir) ? 'dir' : 'file'
            });
        }
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

    const currDir = ('path' in req.body && req.body.path != null) ? resolveTargetDirectory(req) : uploadsPath;
    const full_path = req.body.dir;
    const fileName = path.basename(req.body.name);
    const destination = path.resolve(`${currDir}/${fileName}`);

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

exports.addDirectory = (req, res) => {
    const currDir = ('path' in req.body && req.body.path != null) ? resolveTargetDirectory(req) : uploadsPath;
    const newDirName = path.basename(req.body.name).replace(/'/g, '').replace(/"/g, '');
    const destination = path.resolve(`${currDir}/${newDirName}`);
    let message;

    try {
        if (fs.existsSync(destination)) {
            message = `'${newDirName}' already exists`;
        } else {
            fs.mkdirSync(destination);
            message = `${newDirName} added!`;
        }

        res.status(200).json({
            success: true,
            message,
            dir: (currDir === uploadsPath) ? null : encodePath(path.relative(uploadsPath, path.dirname(destination)))
        });
    } catch (err) {
        const code = ('code' in err && err.code === 'EPERM') ? 400 : 500;
        res.status(code).json({
            success: false,
            message: ('code' in err && err.code === 'EPERM') ? ((os.platform() === 'win32') ? permissionMessage.win32 : permissionMessage.win32) : 'Operation Failed'
        });
        console.error(err);
    }
}

exports.delete = (req, res) => {
    const pathname = path.resolve(`${uploadsPath}/${decodePath(req.body.path)}`);

    try {
        if (!fs.existsSync(pathname)) {
            throw 'Invalid Path passed!|400';
        }
        if (fs.statSync(pathname).isDirectory()) {
            fs.rmdirSync(pathname, {
                recursive: true
            });
        } else {
            fs.unlinkSync(pathname);
        }
        res.status(200).json({
            success: true,
            message: 'Removed'
        });
    } catch (e) {
        let statusCode = 500;
        let message = 'Something went wrong';
        if (typeof e === 'string' && e == '') {
            if (e.includes('|')) {
                const error = e.split('|');
                message = error[0];
                statusCode = error[1];
            } else {
                message = e;
            }
        } else {
            console.error(e);
        }
        res.status(statusCode).json({
            success: false,
            message
        });
    }
}