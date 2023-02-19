const User = require('../model/user');
const bcrypt = require('bcryptjs');
const Validator = require('../middleware/Validator');
const userDebugger = require('debug')('app:user');
const _ = require('lodash');

class UserController {
	// create a user account and return the user and the logged in token
	static async signup(req, res) {
		userDebugger(req.headers['user-agent']);
		const err = Validator.validateNewAccount(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		await User.create(_.pick(req.body, ['name', 'email', 'password']))
			.then(async user => {
				user.phoneNumbers = user.phoneNumbers.concat({ phoneNumber: req.body.phoneNumber });
				const token = await user.generateAuthToken();
				res.status(201).header('x-auth-token', token).send({ userid: user._id, signup: true });
			})
			.catch(err => res.status(400).send({ error: true, message: err.message }));
	}

	// login a user and return the user logged in token
	static async login(req, res) {
		userDebugger(req.headers['user-agent']);
		const err = Validator.validateLogin(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const email = req.body.email;
		const password = req.body.password;
		const user = await User.findOne({ email }, 'name email password accountType tokens');
		if (!user) return res.status(400).send({ message: 'Incorrect email or password.' });
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(400).send({ message: 'Incorrect email or password.' });
		const token = await user.generateAuthToken();
		res.header('x-auth-token', token).send({ userid: user._id, login: true });
	}

	// logout a user session (should return the logged out token?)
	static async logout(req, res) {
		userDebugger(req.headers['user-agent']);
		const user = await User.findById(req.user._id).select('tokens');
		user.tokens = user.tokens.filter(T => T.token !== req.token);
		await user.save();
		res.status(200).send({ userid: user._id, logout: true });
	}

	// logout a user from all sessions (delete all tokens from the Database)
	static async logoutAll(req, res) {
		userDebugger(req.headers['user-agent']);
		const user = await User.findById(req.user._id).select('tokens');
		const sessions = user.tokens.length;
		user.tokens = [];
		await user.save();
		res.send({ userid: user._id, logout: true, sessions: sessions });
	}

	static async showAllUsers(req, res) {
		userDebugger(req.headers['user-agent']);
		const pageNum = req.query.pageNumber ? req.query.pageNumber : 1;
		const pageSize = req.query.pageSize ? req.query.pageSize : 10;
		const users = await User.find({}, 'name email accountType phoneNumbers.phoneNumber', {
			skip: (pageNum - 1) * pageSize,
			limit: pageSize,
			sort: 'name'
		});
		const count = await User.countDocuments({}, { skip: pageNum * pageSize, limit: 100 });
		res.send({ pageLength: users.length, remLength: count > 99 ? '+100' : count, users });
	}

	// change user account type
	static async changeAccountType(req, res) {
		userDebugger(req.headers['user-agent']);
		const err = Validator.validateAccountType(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const user = await User.findById(req.params.id).select('name accountType');
		if (!user) return res.status(404).send({ error: true, message: 'User not found' });
		user.accountType = req.body.type;
		await user.save();
		res.send({ userid: user._id, update: true, user: _.pick(user, ['name', 'accountType']) });
	}

	// edit user information (name and email)
	static async editInfo(req, res) {
		userDebugger(req.headers['user-agent']);
		const err = Validator.validateUserInfo(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const user = await User.findById(req.user._id);
		const updates = Object.keys(req.body);
		updates.forEach(update => (user[update] = req.body[update]));
		await user.save();
		res.send({ userid: user._id, updates: true, user: _.pick(user, ['name', 'email']) });
	}

	// change user password
	static async changePassword(req, res) {
		userDebugger(req.headers['user-agent']);
		const err = Validator.validatePassword(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const user = await User.findById(req.user._id);
		const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
		if (!isMatch) return res.status(400).send({ message: 'Password is incorrect' });
		user.password = req.body.newPassword;
		await user.save();
		res.send({ userid: user._id, update: true });
	}

	// add new phone number
	static async addPhoneNumber(req, res) {
		userDebugger(req.headers['user-agent']);
		const err = Validator.validatePhoneNumber(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const user = await User.findById(req.user._id);
		const phoneNumber = req.body.phoneNumber;
		if (user.phoneNumbers.includes(phoneNumber))
			return res.status(400).send({ message: 'Phone number already exists.' });
		user.phoneNumbers = user.phoneNumbers.concat({ phoneNumber });
		res.send({ userid: user._id, update: true, message: `${phoneNumber} added` });
	}

	// delete phone number
	static async delPhoneNumber(req, res) {
		userDebugger(req.headers['user-agent']);
		const err = Validator.validatePhoneNumber(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const user = await User.findById(req.user._id);
		const phoneNumber = req.body.phoneNumber;
		const numbers = [];
		user.phoneNumbers.forEach(n => numbers.push(n.phoneNumber));
		if (!numbers.includes(phoneNumber))
			return res.status(400).send({ message: `Phone number doesn't exists.` });
		user.phoneNumbers = user.phoneNumbers.filter(P => P.phoneNumber !== phoneNumber);
		await user.save();
		res.status(200).send({ userid: user._id, delete: true, message: `${phoneNumber} deleted` });
	}
}

module.exports = UserController;
