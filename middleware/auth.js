const jwt = require('jsonwebtoken');
const logger = require('./logger');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const config = require('config');
const _ = require('lodash');
var { sha224, sha256 } = require('js-sha256');

async function filter(arr, callback) {
	const fail = Symbol();
	return (await Promise.all(arr.map(async item => ((await callback(item)) ? item : fail)))).filter(
		i => i !== fail
	);
}

module.exports = async (req, res, next) => {
	try {
		let token = req.header('Authorization');
		if (!token)
			return res.status(401).send({ message: 'Access denied.', reason: 'No token provided.' });
		token = token.replace('Bearer ', '');
		const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
		const user = await User.findById(decoded._id, 'name tokens accountType');
		if (!user)
			return res.status(400).send({ message: 'Access denied.', reason: 'User not found.' });
		const isMatch = await filter(
			user.tokens,
			async obj => await bcrypt.compare(sha256(token), obj.token)
		);
		if (!isMatch.length)
			return res.status(400).send({ message: 'Access denied.', reason: 'Invalid token.' });
		req.token = token;
		req.user = decoded;
		next();
	} catch (error) {
		logger.warn(error);
		res.status(400).send({ message: 'Access denied.', reason: error.message });
	}
};
