const fs = require('fs');
const {
    rootPath,
    access_logs,
    debugs_logs
} = require('../server/config').config;

const logsDir = `${rootPath}/logs`;
const logsPath = `${logsDir}/debug.log`;
const accessLogsPath = `${logsDir}/access.log`;

const separator = '\n--------------------------------------------------------------------------------------------------------\n';

exports.log = (data) => {
    if (debugs_logs === 'enabled') {
        data = `${ new Date().toString() } : ${data}${separator}`;
        fs.appendFileSync(`${logsPath}`, data, (err) => {
            if (err) {
                console.error('Error while writing debug log \n', err);
            }
        });
    }
}

exports.logRoute = (req) => {
    if (access_logs === 'enabled') {
        const data = `${ new Date().toString() } : ${req.method} - ${req.url} - ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`;
        fs.appendFileSync(`${accessLogsPath}`, `${data}${separator}`, (err) => {
            if (err) {
                return console.log('Error while writing access log \n', err);
            }
        });
    }
}