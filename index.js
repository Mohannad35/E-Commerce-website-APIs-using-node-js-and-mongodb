import config from 'config';
import express from 'express';
import 'express-async-errors';
import debug from 'debug';
import routing from './start/routes.js';
import { init } from './database/db.js';
import logging from './start/logging.js';
import production from './start/prod.js';
import configuration from './start/config.js';
import issues from './start/issues.js';

const sDebugger = debug('app:startup');
const app = express();

issues(app);
logging(app);
configuration();
routing(app);
init();
production(app);

const port = process.env.PORT || 3000;
app.listen(port, () => sDebugger(`Listening on http://localhost:${port}`));

// export default server;
