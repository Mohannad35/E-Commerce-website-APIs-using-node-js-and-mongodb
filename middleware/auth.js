const jwt = require('jsonwebtoken');
const logger = require('./logger');
const config = require('config');
const _ = require('lodash');

module.exports = (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		if (!token) return res.status(401).send({ message: 'Access denied. No token provided.' });
		const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
		req.token = token;
		req.user = decoded;
		next();
	} catch (error) {
		logger.warn('auth: Access denied. Invalid token.', error);
		res.status(400).send({ message: 'Access denied. Invalid token.' });
	}
};
