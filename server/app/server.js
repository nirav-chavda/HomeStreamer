const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const morgan = require('morgan');
const helpers = require('../../lib/handlebarsHelper');
const {
    rootPath,
    env
} = require('../config').config;

const app = express();

app.set('views', path.join(rootPath, '/resources/views'));
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'home',
    layoutsDir: rootPath + '/resources/views/layouts',
    helpers
}));
app.set('view engine', 'hbs');

app.use(express.json());
if (env === 'development') {
    app.use(morgan('dev'));
}
app.use(express.static(rootPath + '/public'));

require('../routes/routes')(app);

module.exports = app;