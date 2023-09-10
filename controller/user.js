import _ from 'lodash';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import config from 'config';
import User from './../model/user.js';
import logger from '../middleware/logger.js';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class UserController {
	static async users(req, res) {
		const { query } = req;
		const { pageNumber, pageSize, users } = await User.getUsers(query);
		if (users.length > 0) return res.send({ pageNumber, pageSize, length: users.length, users });
		res.send({ length: 0, users });
	}

	static async user(req, res) {
		const user = await User.findById(req.user._id);
		if (!user) return res.send({ error: true, message: 'User not found' });
		res.send({ user });
	}

	static async stats(req, res) {
		const { query } = req;
		const count = await User.stats(query);
		return res.send({ length: count });
	}

	static async deleteUser(req, res) {
		const { id } = req.body;
		const { err, status, message, user } = await User.deleteUser(id);
		if (err) return res.status(status).send({ message });
		res.send({ delete: true, user });
	}

	static async banUser(req, res) {
		const { id } = req.body;
		if (id === req.user._id) return res.status(400).send({ message: `You can't ban yourself` });
		const { err, status, message, user } = await User.banUser(id);
		if (err) return res.status(status).send({ message });
		await user.save();
		res.send({ user });
	}

	// create a user account and return the user and the logged in token
	static async signup(req, res) {
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
				res.status(201).header('x-auth-token', token).send({ signup: true, user });
			})
			.catch(error => {
				logger.error(error.message, error);
				res.status(400).send({ message: error.message });
			});
	}

	// login a user and return the user logged in token
	static async login(req, res) {
		const { email, password } = req.body;
		const { err, status, message, token, user } = await User.loginUser(email, password);
		if (err) return res.status(status).send({ message });
		res.header('x-auth-token', token).send({ login: true, user });
	}

	static async refreshToken(req, res) {
		const { _id } = req.user;
		const user = await User.getUserById(_id);
		const token = await user.generateAuthToken();
		res.status(204).header('x-auth-token', token).send();
	}

	static async vendorRequest(req, res) {
		const { details } = req.body;
		if (req.user.accountType !== 'client')
			return res.status(400).send({ message: 'only client can make vendor requests' });
		const { err, status, message } = await User.vendorReq(req.user._id, details);
		if (err) return res.status(status).send({ message });
		res.status(200).send({ message: 'vendor request submitted' });
	}

	static async cancelVendorRequest(req, res) {
		const { id } = req.params;
		const { user, request } = await User.cancelVendorReq(id);
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: process.env.PROJECT_ISSUER + ' Vendor Request Declined',
			html:
				'Hi ' +
				user.name +
				',<br>Your vendor request have been declined.<br>' +
				'Please apply another request with more details.<br>' +
				'Thank you for choosing ' +
				process.env.PROJECT_ISSUER +
				'!'
		};
		await sgMail.send(msg);
		res.status(200).send({ request });
	}

	static async getVendorRequests(req, res) {
		const requests = await User.getVendorReq();
		res.status(200).send({ length: requests.length, requests });
	}

	// change user account type
	static async changeAccountType(req, res) {
		const { id } = req.params;
		const { type } = req.body;
		const user = await User.changeAccountType(id, type);
		if (!user) return res.status(404).send({ error: true, message: 'User not found' });
		await user.save();
		const link = `${process.env.CLIENT_URL}user/profile?refresh=true`;
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: process.env.PROJECT_ISSUER + ' Vendor Request Accepted',
			html:
				'Hi ' +
				user.name +
				',<br>Congratulations! Your vendor request have been accepted.<br>' +
				'You can now access all the vendor features and benefits of our app.<br>' +
				'Please note that you have to log out and log back in to see changes.<br>Or ' +
				'<a href=' +
				link +
				'>Click here</a> to see changes.<br>' +
				'Thank you for choosing ' +
				process.env.PROJECT_ISSUER +
				'!'
		};
		await sgMail.send(msg);
		res.send({ update: true, user: _.pick(user, ['name', 'accountType']) });
	}

	// edit user information
	static async editInfo(req, res) {
		// prettier-ignore
		const { user: { _id } , body } = req;
		const { err, status, message, user } = await User.editInfo(_id, body);
		if (err) return res.status(status).send({ message });
		try {
			await user.save();
			// res.redirect(`/api/user/refresh-token?update=true&id=${_id}&name=${name}&email=${email}`);
			res.send({ update: true, user });
		} catch (err) {
			res.status(400).send({ err: true, message: 'Invalid updates', reason: err.message });
		}
	}

	// change user password
	static async changePassword(req, res) {
		// prettier-ignore
		const { user: { _id }, body: { oldPassword, newPassword } } = req
		if (oldPassword === newPassword)
			return res.status(400).send({ err: true, message: `You can't use the same password` });
		const { isMatch, user } = await User.changePassword(_id, oldPassword, newPassword);
		if (!isMatch) return res.status(400).send({ message: 'Password is incorrect' });
		await user.save();
		// res.redirect(`/api/user/refresh-token?update=true&id=${_id}`);
		res.send({ update: true, user });
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
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: process.env.PROJECT_ISSUER + ' Email Verification Complete',
			html:
				'Hi ' +
				user.name +
				',<br>Congratulations! You have successfully verified your email address for your ' +
				process.env.PROJECT_ISSUER +
				' account.<br>You can now access all the features and benefits of our app.<br>Thank you for choosing ' +
				process.env.PROJECT_ISSUER +
				'!'
		};
		await sgMail.send(msg);
		res.redirect(`${process.env.CLIENT_URL}user/profile?refresh=true`);
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
			.then(async response => {
				logger.info('Message sent: ' + response);
				user.expireAt = moment().add(2, 'days').format('YYYY-MM-DD');
				await user.save();
				res.send({ message: 'Email sent.' });
			})
			.catch(err => {
				logger.error(err.message, err);
				res.status(400).send({ error: true, message: 'Something went wrong.' });
			});
	}

	static async forgetPassword(req, res) {
		const { email } = req.body;
		const user = await User.getUserByEmail(email);
		if (!user) return res.status(404).send({ message: 'User not found.' });
		const code = crypto.randomBytes(32).toString('hex');
		const token = jwt.sign({ code }, process.env.ECOMMERCE_JWT_PRIVATE_KEY, {
			expiresIn: '1h',
			issuer: process.env.PROJECT_ISSUER
		});
		_.set(user, 'code', code);
		await user.save();
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
				'this link expires in 1 hour<br>' +
				`If you didn't ask for this just ignore the email.<br>`
		};
		await sgMail
			.send(msg)
			.then(response => {
				logger.info('Message sent: ' + response);
				res.send({ message: 'Email sent to reset your password.' });
			})
			.catch(err => {
				logger.error(err.message, err);
				res.status(500).send({
					error: true,
					message: 'Something went wrong while sending the email please try again.'
				});
			});
	}

	static async redirectForgetPassword(req, res) {
		const { token } = req.query;
		try {
			const decoded = jwt.verify(token, process.env.ECOMMERCE_JWT_PRIVATE_KEY);
			const user = await User.findOne({ code: decoded.code });
			if (!user) return res.status(400).send('<h1>Code is not valid anymore<h1/>');
			// render or redirect to change password page with decoded._id
			res.redirect(`${process.env.CLIENT_URL}user/reset-password?code=${decoded.code}`);
		} catch (error) {
			console.log(error);
			res
				.status(400)
				.send({ error: true, message: 'Code is not valid anymore', reason: error.message });
		}
	}

	static async changeForgetPassword(req, res) {
		const { code, password } = req.body;
		const user = await User.findOne({ code });
		if (!user) return res.status(404).send({ error: true, message: 'Code is not valid anymore' });
		user.password = password;
		user.code = undefined;
		await user.save();
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: 'Password Change Confirmation',
			html:
				'Hello ' +
				user.name +
				',<br>This email is to confirm that you have successfully changed your password for your ' +
				process.env.PROJECT_ISSUER +
				' account.<br>If you did not request this change, please contact our support team immediately.<br>Thank you for using ' +
				process.env.PROJECT_ISSUER +
				'!'
		};
		await sgMail
			.send(msg)
			.then(response => {
				logger.info('Message sent: ' + response);
				res.send({ message: 'password changed.' });
			})
			.catch(err => {
				logger.error(err.message, err);
				res.status(500).send({
					error: true,
					message: 'Something went wrong while sending the email please try again.'
				});
			});
	}
}
