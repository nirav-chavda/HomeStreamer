const {
    appName: app
} = require('../server/config').config;

module.exports = {
    appName: () => (app && app.trim() != '') ? app : 'Home Streamer',
    isStreamPage: (flag = false) => flag
}