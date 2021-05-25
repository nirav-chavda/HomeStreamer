var os = require('os');

exports.index = (req, res) => {
    res.render('index', {
        'server': os.hostname(),
    });
}