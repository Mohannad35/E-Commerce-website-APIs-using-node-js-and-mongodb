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
import functions from 'firebase-functions';

const sDebugger = debug('app:startup');
const app = express();

issues(app);
logging(app);
configuration();
routing(app);
init();
production(app);

const port = config.get('port') || 3000;
const server = app.listen(port, () => sDebugger(`Listening on port ${port}...`));

export default server;
export const api = functions.https.onRequest(app);
