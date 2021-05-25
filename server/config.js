const path = require('path');

require('dotenv').config()

const rootPath = path.resolve(__dirname.replace(`${path.sep}server`, ''));

process.env.NODE_ENV = (process.env.ENV) ? ((process.env.ENV == 'prod') ? 'production' : 'development') : 'development';

delete process.env.ENV;

exports.config = {
    appName: process.env.APP_NAME || 'Home Streamer',
    env: process.env.NODE_ENV,
    addr: '127.0.0.1',
    port: process.env.SERVER_PORT || 3000,
    access_logs: (process.env.ACCESS_LOGS) ? process.env.ACCESS_LOGS : 'enabled',
    debugs_logs: (process.env.DEBUG_LOGS) ? process.env.DEBUG_LOGS : 'enabled',
    rootPath: rootPath,
    uploadsPath: `${rootPath}/resources/uploads`,
}