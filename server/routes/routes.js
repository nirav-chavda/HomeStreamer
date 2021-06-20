const logger = require('../../lib/logger');

module.exports = function (app) {

    const HomeController = require('../controllers/HomeController');
    const ContentController = require('../controllers/ContentController');
    const StreamController = require('../controllers/StreamController');

    app.use((req, res, next) => {
        logger.logRoute(req);
        next();
    });

    app.get('/', HomeController.index);
    app.get('/watch/:id', StreamController.watchVideo);
    app.get('/stream/:id', StreamController.streamVideo);
    app.get('/list', ContentController.list);
    app.post('/add', ContentController.add);
    app.post('/make', ContentController.make);
    app.post('/dir/add', ContentController.addDirectory);
    app.post('/dir/upload', ContentController.uploadDirectory);
    app.post('/delete', ContentController.delete);

    app.use((req, res, next) => {
        res.status(404).render('error_pages/404', {});
    });
};