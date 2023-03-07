const logger = require('./logger');

module.exports = function (req, res, next) {
	if (!['admin'].includes(req.user.accountType)) {
		return res.status(403).send({ message: 'Access denied.' });
	}
	next();
};
