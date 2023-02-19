const logger = require('./logger');

module.exports = function (req, res, next) {
	if (!['vendor', 'admin'].includes(req.user.accountType)) {
		logger.warn('vendor: Access denied', req);
		return res.status(403).send({ message: 'Access denied.' });
	}
	next();
};
