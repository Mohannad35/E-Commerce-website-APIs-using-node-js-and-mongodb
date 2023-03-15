const userDebugger = require('debug')('app:user');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const config = require('config');
const User = require('../model/user');
const logger = require('../middleware/logger');
sgMail.setApiKey(config.get('sendgrid_apikey'));

class UserController {
	static async users(req, res) {
		userDebugger(req.headers['user-agent']);
		const { query } = req;
		const { pageNumber, pageSize, users } = await User.getUsers(query);
		if (users.length > 0) return res.send({ pageNumber, pageSize, length: users.length, users });
		res.send({ length: 0, users });
	}

	static async stats(req, res) {
		userDebugger(req.headers['user-agent']);
		const { query } = req;
		const count = await User.stats(query);
		return res.send({ length: count });
	}

	static async deleteUser(req, res) {
		userDebugger(req.headers['user-agent']);
		const { id } = req.body;
		const { err, status, message, user } = await User.deleteUser(id);
		if (err) return res.status(status).send({ message });
		res.send({ delete: true, user });
	}

	static async banUser(req, res) {
		userDebugger(req.headers['user-agent']);
		const { id } = req.body;
		if (id === req.user._id) return res.status(400).send({ message: `You can't ban yourself` });
		const { err, status, message, user } = await User.banUser(id);
		if (err) return res.status(status).send({ message });
		await user.save();
		res.send({ user });
	}

	// create a user account and return the user and the logged in token
	static async signup(req, res) {
		userDebugger(req.headers['user-agent']);
		const { body } = req;
		const { err, status, message, user, token } = await User.signup(body);
		if (err) return res.status(status).send({ message });
		_.set(user, 'token', crypto.randomBytes(16).toString('hex'));
		_.set(user, 'expireAt', moment().add(2, 'days').format('YYYY-MM-DD'));
		const host = req.get('host');
		const link = 'http://' + host + '/api/user/verify?token=' + user.token;
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: 'Account Verification Link',
			html:
				'Hello ' +
				user.name +
				',<br> Please Click on the link to verify your email.<br><a href=' +
				link +
				'>Click here to verify</a>'
		};
		await sgMail
			.send(msg)
			.then(async () => {
				await user.save();
				res.status(201).header('x-auth-token', token).send({ userid: user._id, signup: true });
			})
			.catch(error => {
				logger.error(error.message, error);
				res.status(400).send({ message: `error` });
			});
	}

	// login a user and return the user logged in token
	static async login(req, res) {
		userDebugger(req.headers['user-agent']);
		const { email, password } = req.body;
		const { err, status, message, token, user } = await User.loginUser(email, password);
		if (err) return res.status(status).send({ message });
		res.header('x-auth-token', token).send({ userid: user._id, login: true });
	}

	static async refreshToken(req, res) {
		const keys = Object.keys(req.query);
		const user = await User.getUserById(req.user._id);
		let resp = {};
		keys.forEach(key => _.set(resp, key, req.query[key]));
		const token = await user.generateAuthToken();
		res.status(200).header('x-auth-token', token).send(resp);
	}

	static async vendorRequest(req, res) {
		const { details } = req.body;
		if (req.user.accountType !== 'client')
			return res.status(400).send({ message: 'only client can make vendor requests' });
		const { err, status, message } = await User.vendorReq(req.user._id, details);
		if (err) return res.status(status).send({ message });
		res.status(200).send({ message: 'vendor request submitted' });
	}

	static async getVendorRequests(req, res) {
		const requests = await User.getVendorReq();
		res.status(200).send({ length: requests.length, requests });
	}

	// change user account type
	static async changeAccountType(req, res) {
		userDebugger(req.headers['user-agent']);
		const { id } = req.params;
		const { type } = req.body;
		const user = await User.changeAccountType(id, type);
		if (!user) return res.status(404).send({ error: true, message: 'User not found' });
		await user.save();
		res.send({ update: true, user: _.pick(user, ['name', 'accountType']) });
	}

	// edit user information (name and email)
	static async editInfo(req, res) {
		userDebugger(req.headers['user-agent']);
		// prettier-ignore
		const { user: { _id } , body } = req;
		const user = await User.editInfo(_id, body);
		const { name, email } = user;
		try {
			await user.save();
			res
				.header('Authorization', `Bearer ${user.token}`)
				.redirect(`/api/user/refresh-jwt?update=true&id=${_id}&name=${name}&email=${email}`);
		} catch (err) {
			res.status(400).send({ err: true, message: 'Invalid updates', reason: err.message });
		}
	}

	// change user password
	static async changePassword(req, res) {
		userDebugger(req.headers['user-agent']);
		// prettier-ignore
		const { user: { _id }, body: { oldPassword, newPassword } } = req
		if (oldPassword === newPassword)
			return res.status(400).send({ err: true, message: `You can't use the same password` });
		const { isMatch, user } = await User.changePassword(_id, oldPassword, newPassword);
		if (!isMatch) return res.status(400).send({ message: 'Password is incorrect' });
		await user.save();
		res
			.header('Authorization', `Bearer ${user.token}`)
			.redirect(`/api/user/refresh-jwt?update=true&id=${_id}`);
	}

	static async verify(req, res) {
		const { token } = req.query;
		const user = await User.findOne({ token }, '-password');
		if (!user) return res.status(404).send({ message: 'user not found' });
		if (user.isVerified) return res.status(400).send({ message: 'user already verified' });
		if (user.expireAt > moment().format('YYYY-MM-DD'))
			return res.status(400).send({ message: 'Email expired. Please hit resend email' });
		user.isVerified = true;
		user.token = undefined;
		user.expireAt = undefined;
		await user.save();
		res.send('<h1>Email ' + user.email + ' is now verified</h1>');
	}

	static async resend(req, res) {
		// prettier-ignore
		const { user: { _id } } = req;
		const user = await User.findById(_id);
		if (!user) return res.status(404).send({ message: 'user not found' });
		if (user.isVerified) return res.status(400).send({ message: 'user already verified' });
		const host = req.get('host');
		const link = 'http://' + host + '/api/user/verify?token=' + user.token;
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: 'Account Verification Link',
			html:
				'Hello ' +
				user.name +
				',<br> Please Click on the link to verify your email.<br><a href=' +
				link +
				'>Click here to verify</a>'
		};
		await sgMail
			.send(msg)
			.then(response => console.log('Message sent: ' + response))
			.catch(err => console.log(err));
		user.expireAt = moment().add(2, 'days').format('YYYY-MM-DD');
		await user.save();
		res.send({ message: 'Email sent.' });
	}

	static async forgetPassword(req, res) {
		const { email } = req.body;
		const user = await User.getUserByEmail(email);
		if (!user) return res.status(404).send({ message: 'User not found.' });
		const token = jwt.sign({ _id: user._id.toString() }, config.get('jwtPrivateKey'), {
			expiresIn: '7d',
			issuer: config.get('project_issuer')
		});
		const host = req.get('host');
		const link = 'http://' + host + '/api/user/forget-password?token=' + token;
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: 'Rsest password Link',
			html:
				'Hello ' +
				user.name +
				',<br> Please Click on the link to change your password.<br><a href=' +
				link +
				'>Click here to verify</a><br>' +
				`If you didn't ask for this just ignore the email.<br>`
		};
		await sgMail
			.send(msg)
			.then(response => console.log('Message sent: ' + response))
			.catch(err => console.log(err));
		res.send({ message: 'Email sent to reset your password.' });
	}

	static async redirectForgetPassword(req, res) {
		const { token } = req.query;
		const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
		// render or redirect to change password page with decoded._id
	}

	static async changeForgetPassword(req, res) {
		const { _id, password } = req.body;
		const user = await User.findById(_id);
		user.password = password;
		await user.save();
		res.status(200).send({ msg: 'password changed' });
		// render or redirect to change password page
	}
}

module.exports = UserController;
