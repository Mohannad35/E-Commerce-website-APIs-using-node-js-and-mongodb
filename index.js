const config = require('config');
const express = require('express');
require('express-async-errors');
const debug = require('debug');
const routing = require('./start/routes.js');
const { init } = require('./database/db.js');
const logging = require('./start/logging.js');
const production = require('./start/prod.js');
const configuration = require('./start/config.js');

const sDebugger = debug('app:startup');
const app = express();

logging(app);
configuration();
routing(app);
init();
production(app);

const port = config.get('port') || 3000;
const server = app.listen(port, () => sDebugger(`Listening on port ${port}...`));

module.exports = server;
