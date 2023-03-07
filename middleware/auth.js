const jwt = require('jsonwebtoken');
const logger = require('./logger');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const config = require('config');
const _ = require('lodash');
var { sha224, sha256 } = require('js-sha256');

module.exports = async (req, res, next) => {
	try {
		let token = req.header('Authorization');
		if (!token)
			return res.status(401).send({ message: 'Access denied.', reason: 'No token provided.' });
		token = token.replace('Bearer ', '');
		const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
		req.token = token;
		req.user = decoded;
		next();
	} catch (error) {
		logger.info(error.message, error);
		res.status(400).send({ message: 'Access denied.', reason: error.message });
	}
};
