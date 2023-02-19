const logger = require('../middleware/logger');
const config = require('config');

module.exports = function () {
	if (config.get('env') === 'development') {
		if (!config.has('jwtPrivateKey')) {
			logger.error('FATAL ERROR: jwtPrivateKey is not defined.');
			process.exit(1);
		}
		if (!config.has('mongodb_url')) {
			logger.error('FATAL ERROR: mongodb_url is not defined.');
			process.exit(1);
		}
		if (!config.has('logtailSourceToken')) {
			logger.error('FATAL ERROR: logtailSourceToken is not defined.');
			process.exit(1);
		}
	}
};
