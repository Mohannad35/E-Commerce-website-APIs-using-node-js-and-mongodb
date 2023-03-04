const User = require('../model/user');
const userDebugger = require('debug')('app:user');
const _ = require('lodash');

class UserController {
	static async users(req, res) {
		userDebugger(req.headers['user-agent']);
		const { pageNumber, pageSize, sortBy } = req.query;
		const users = await User.getUsers(pageNumber, pageSize, sortBy);
		const remainingUsers = await User.remainingUsers(pageNumber, pageSize, 100);
		res.send({ pageLength: users.length, remainingUsers, users });
	}

	// create a user account and return the user and the logged in token
	static async signup(req, res) {
		userDebugger(req.headers['user-agent']);
		const { name, email, password, phoneNumber } = req.body;
		const exist = await User.getUserByEmail(email);
		if (exist) return res.status(400).send({ error: true, message: 'Email already exists' });
		const user = new User({ name, email, password, phoneNumbers: [{ phoneNumber }] });
		const token = await user.generateAuthToken();
		// await user.save();
		res.status(201).header('x-auth-token', token).send({ userid: user._id, signup: true });
	}

	// login a user and return the user logged in token
	static async login(req, res) {
		userDebugger(req.headers['user-agent']);
		const { email, password } = req.body;
		const { err, status, message, token, user } = await User.loginUser(email, password);
		if (err) return res.status(status).send({ message });
		// await user.save();
		res.header('x-auth-token', token).send({ userid: user._id, login: true });
	}

	static async refreshToken(req, res) {
		const { user, token } = req;
		const keys = Object.keys(req.query);
		let resp = {};
		keys.forEach(key => _.set(resp, key, req.query[key]));
		const newToken = await User.refreshAuthToken(user._id, token);
		res.status(200).header('x-auth-token', newToken).send(resp);
	}

	// logout a user session (should return the logged out token?)
	static async logout(req, res) {
		userDebugger(req.headers['user-agent']);
		const { _id } = req.user;
		const user = await User.logoutUser(_id, req.token);
		// await user.save();
		res.status(200).send({ userid: user._id, logout: true });
	}

	// logout a user from all sessions (delete all tokens from the Database)
	static async logoutSessions(req, res) {
		userDebugger(req.headers['user-agent']);
		const { _id } = req.user;
		const { user, sessions } = await User.logoutSessions(_id, req.token);
		await user.save();
		res.send({ userid: user._id, logout: true, sessions });
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
		const { _id } = req.user;
		const user = await User.editInfo(_id, req.body);
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
		const { _id } = req.user;
		const { oldPassword, newPassword } = req.body;
		if (oldPassword === newPassword)
			return res
				.status(400)
				.send({ err: true, message: `new password can't be the same as old password` });
		const { isMatch, user } = await User.changePassword(_id, oldPassword, newPassword);
		if (!isMatch) return res.status(400).send({ message: 'Password is incorrect' });
		const { name, email } = user;
		await user.save();
		res
			.header('Authorization', `Bearer ${user.token}`)
			.redirect(`/api/user/refresh-jwt?update=true&id=${_id}`);
		// res.send({ userid: user._id, update: true });
	}

	// add new phone number
	static async addPhoneNumber(req, res) {
		userDebugger(req.headers['user-agent']);
		const { _id } = req.user;
		const { phoneNumber } = req.body;
		const { err, status, message, user } = await User.addPhone(_id, phoneNumber);
		if (err) return res.status(status).send({ error: true, message });
		await user.save();
		res.send({ userid: user._id, update: true, message: `${phoneNumber} added` });
	}

	// delete phone number
	static async delPhoneNumber(req, res) {
		userDebugger(req.headers['user-agent']);
		const { _id } = req.user;
		const { phoneNumber } = req.body;
		const { err, status, message, user } = await User.delPhone(_id, phoneNumber);
		if (err) return res.status(status).send({ error: true, message });
		await user.save();
		res.send({ userid: user._id, delete: true, message: `${phoneNumber} deleted` });
	}
}

module.exports = UserController;
