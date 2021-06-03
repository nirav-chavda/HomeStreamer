var os = require('os');

exports.index = (req, res) => {
    res.render('index', {
        'server': (os.hostname() == undefined || os.hostname() == null) ? false : os.hostname(),
    });
}