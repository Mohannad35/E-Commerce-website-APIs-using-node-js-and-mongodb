const morgan = require('morgan');
const devDebugger = require('debug')('app:dev');
const path = require('path');
const fs = require('fs');
const logger = require('../middleware/logger');

module.exports = function (app) {
	if (app.get('env') === 'development') {
		const customFormat =
			'[:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] [:response-time ms : :total-time ms] ":user-agent"';
		// log only 4xx and 5xx responses to console
		app.use(morgan(customFormat, { skip: (req, res) => res.statusCode < 400 }));
		// log all requests to access.log
		app.use(
			morgan(customFormat, {
				stream: fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' })
			})
		);
		app.use(
			morgan(
				function (tokens, req, res) {
					return JSON.stringify({
						method: tokens.method(req, res),
						url: tokens.url(req, res),
						status: Number.parseFloat(tokens.status(req, res)),
						content_length: tokens.res(req, res, 'content-length'),
						response_time: Number.parseFloat(tokens['response-time'](req, res))
					});
				},
				{
					stream: {
						// Configure Morgan to use our custom logger with the http severity
						write: message => {
							const data = JSON.parse(message);
							logger.http(`incoming-request`, data);
						}
					}
				}
			)
		);
		devDebugger(`env: ${app.get('env')}. Morgan enabled.`);
	}
};
