const compression = require('compression');
const helmet = require('helmet');
const config = require('config');

module.exports = function (app) {
	if (config.get('env') === 'production') {
		app.use(helmet());
		app.user(compression());
	}
};
