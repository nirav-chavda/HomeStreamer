const {
    v4: uuidv4
} = require('uuid');

const sendSessionIDCookie = (sessionID, res) => {
    res.cookie('sessionID', sessionID, {
        maxAge: 30 * 24 * 60 * 60, // One Month
        httpOnly: false,
        path: '/',
    });
};

const getAppCookies = (req) => {
    if (req.headers.cookie !== undefined) {
        const rawCookies = req.headers.cookie.split('; ');
        const parsedCookies = {};
        rawCookies.forEach(rawCookie => {
            const parsedCookie = rawCookie.split('=');
            parsedCookies[parsedCookie[0]] = parsedCookie[1];
        });
        return parsedCookies;
    }
    return [];
};

const getSessionID = (req, res) => getAppCookies(req, res)['sessionID'];

const sessionHandler = (req, res, next) => {

    let sessionID = getSessionID(req, res);

    if (!sessionID) {
        sessionID = uuidv4();
        res.clearCookie('sessionID');
        sendSessionIDCookie(sessionID, res);
    }

    req.sessionID = sessionID;

    next();
};

module.exports = {
    sessionHandler
}