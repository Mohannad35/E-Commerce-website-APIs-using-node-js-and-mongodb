const User = require('../model/user');
const bcrypt = require('bcryptjs');
const Validator = require('../middleware/Validator');
const userDebugger = require('debug')('app:user');

class UserController {
	// create a user account and return the user and the logged in token
	static async signup(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			if (req.body.password !== req.body.repeatedPassword)
				throw new Error('Password dose not match');
			const { error } = Validator.validateNewAccount(req.body);
			if (error)
				throw new Error(
					error.details[0].message
						.replace(
							/"password".*/,
							'Password should consist of small letter, capital letter, and minimum length of 8'
						)
						.replace(/"phoneNumber".*/, 'Phone number should be a valid phone number')
				);
			const user = new User({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				phoneNumbers: [req.body.phoneNumber],
			});
			await user.save();
			const token = await user.generateAuthToken();
			if (req.headers['user-agent'].match(/.*postman.*|.*Thunder.*/i))
				return res.status(201).send(token);
			res.cookie('name', user.name);
			res.cookie('userToken', token);
			res.cookie('userType', user.accountType);
			res.redirect('/');
		} catch (error) {
			if (req.headers['user-agent'].match(/.*postman.*|.*Thunder.*/i))
				return res.status(400).send(error.message);
			req.flash('err', error.message);
			res.redirect('/sign-up');
		}
	}

	// login a user and return the user logged in token
	static async login(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			const { error } = Validator.validateLogin(req.body);
			if (error)
				throw new Error(
					error.details[0].message.replace(/"email".*/, 'Please use a valid email address')
				);
			const user = await User.findByCredentials(req.body.email, req.body.password);
			const token = await user.generateAuthToken();
			if (req.headers['user-agent'].match(/.*postman.*|.*Thunder.*/i)) return res.send(token);
			res.cookie('name', user.name);
			res.cookie('userToken', token);
			res.cookie('userType', user.accountType);
			res.redirect('/');
		} catch (error) {
			if (req.headers['user-agent'].match(/.*postman.*|.*Thunder.*/i))
				return res.status(400).send(error.message);
			req.flash('err', error.message);
			res.redirect('/login');
		}
	}

	// logout a user session (should return the logged out token?)
	static async logout(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			// filter out the current token
			req.user.tokens = req.user.tokens.filter(T => T.token !== req.token);
			await req.user.save();
			if (req.headers['user-agent'].match(/.*postman.*|.*Thunder.*/i))
				return res.send('Logged out from this session successfully');
			res.clearCookie('userToken');
			res.clearCookie('name');
			res.cookie('userType', 'guest');
			res.redirect('/');
		} catch (error) {
			if (req.headers['user-agent'].match(/.*postman.*|.*Thunder.*/i))
				return res.status(400).send(error.message);
			req.flash('err', error.message);
			res.redirect('/');
		}
	}

	// logout a user from all sessions (delete all tokens from the Database)
	static async logoutAll(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			req.user.tokens = [];
			await req.user.save();
			res.send('Logged out from all sessions successfully');
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	static async showAllUsers(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			const pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
			const pageSize = req.query.pageSize ? req.query.pageSize : 10;
			if (req.user.accountType !== 'admin')
				throw new Error('you must be an administrator to see all users');
			const users = await User.find()
				.select('-_id name accountType')
				.skip((pageNumber - 1) * pageSize)
				.limit(pageSize)
				.sort('name');
			const userCount = await User.find().count();
			res.status(200).send({ pageLength: users.length, length: userCount, users: users });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// change user account type
	static async changeAccountType(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			if (req.user.accountType !== 'admin')
				throw new Error('you must be an administrator to change account type');
			const { error } = Validator.validateAccountType(req.body);
			if (error) throw new Error(error.details[0].message);
			const user = await User.setAccountType(req.body.id, req.body.type);
			res.send({ name: user.name, email: user.email, accountType: user.accountType });
		} catch (error) {
			res.status(400).send(error.message.replace(/User validation failed(:.*: )?(:)?/, ''));
		}
	}

	// edit user information (name and email)
	static async editInfo(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			const { error } = Validator.validateUserInfo(req.body);
			if (error) throw new Error(error.details[0].message);
			const user = req.user;
			const updates = Object.keys(req.body);
			updates.forEach(update => (user[update] = req.body[update]));
			await user.save();
			res.send({ name: user.name, email: user.email });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// change user password
	static async changePassword(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			const { error } = Validator.validatePassword(req.body);
			if (error) throw new Error(error.details[0].message);
			const user = req.user;
			const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
			if (!isMatch) throw new Error('Password is incorrect');
			user.password = req.body.newPassword;
			await user.save();
			res.send('Password Changed');
		} catch (error) {
			res
				.status(400)
				.send(
					error.message.replace(
						/"newPassword".*/,
						'new Password should consist of small letter, capital letter, and minimum length of 8'
					)
				);
		}
	}

	// add new phone number
	static async addPhoneNumber(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			const { error } = Validator.validatePhoneNumber(req.body);
			if (error) throw new Error(error.details[0].message);
			const user = req.user;
			const phoneNumber = req.body.phoneNumber;
			if (user.phoneNumbers.includes(phoneNumber)) throw new Error('phone number already exists');
			user.phoneNumbers = user.phoneNumbers.concat(phoneNumber);
			await user.save();
			res.send('added');
		} catch (error) {
			res
				.status(400)
				.send(error.message.replace(/"phoneNumber".*/, 'Pleae enter a valid phone number'));
		}
	}

	// delete phone number
	static async delPhoneNumber(req, res) {
		try {
			userDebugger(req.headers['user-agent']);
			const { error } = Validator.validatePhoneNumber(req.body);
			if (error) throw new Error(error.details[0].message);
			if (!req.user.phoneNumbers.includes(req.body.phoneNumber))
				throw new Error(`phone number dosn't exist`);
			req.user.phoneNumbers = req.user.phoneNumbers.filter(P => P !== req.body.phoneNumber);
			await req.user.save();
			res.send(req.body.phoneNumber + ' deleted');
		} catch (error) {
			res
				.status(400)
				.send(error.message.replace(/"phoneNumber".*/, 'Pleae enter a valid phone number'));
		}
	}
}

module.exports = UserController;
