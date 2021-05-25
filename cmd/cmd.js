const {
    config
} = require('../server/config');
const ip = require('../lib/prompter');
const logger = require('../lib/logger');
const app = require('../server/app/server');

(async () => {
    const addr = await ip.prompt(config.addr, config.port);
    const port = config.port;

    app.listen(port, () => {
        console.log(`Magic happens at ${addr}:${port}`);
        var data = `Server Started at ${addr}:${port}`;
        logger.log(data);
    });
})();