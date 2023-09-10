import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from 'config';
import Request from './request.js';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, minlength: 3, maxlength: 255, match: /^[\p{L}].*$/u },
		email: {
			type: String,
			unique: true,
			lowercase: true,
			sparse: true,
			index: true,
			validate: {
				validator: function (value) {
					return validator.isEmail(value);
				},
				message: 'Invalid email address'
			}
		},
		isVerified: { type: Boolean, default: false },
		status: {
			type: String,
			lowercase: true,
			default: 'active',
			enum: {
				values: ['active', 'idle', 'offline', 'banned'],
				message: '{VALUE} is not valid. Must be active, idle, offline, or banned'
			}
		},
		code: { type: String },
		token: { type: String },
		expireAt: { type: Date },
		password: { type: String, minlength: 8, maxlength: 1024 },
		accountType: {
			type: String,
			lowercase: true,
			default: 'client',
			enum: {
				values: ['admin', 'vendor', 'client', 'support'],
				message: '{VALUE} is not valid. Must be admin, support, vendor, or client'
			}
		},
		phoneNumber: { type: String, unique: true, sparse: true, index: true },
		country: { type: String, minlength: 3, maxlength: 255 },
		city: { type: String, minlength: 3, maxlength: 255 },
		address: { type: String, minlength: 3, maxlength: 1024 },
		birthday: {
			type: Date,
			min: moment().subtract(120, 'years').format('YYYY-MM-DD'),
			max: moment().subtract(10, 'years').format('YYYY-MM-DD')
		},
		gender: {
			type: String,
			lowercase: true,
			enum: { values: ['male', 'female'], message: '{VALUE} is not a gender' }
		},
		companyName: { type: String, minlength: 3, maxlength: 255 },
		businessAddress: { type: String, minlength: 3, maxlength: 1024 },
		websiteAddress: { type: String, minlength: 3, maxlength: 1024 },
		accountId: { type: String },
		provider: { type: String }
	},
	{
		timestamps: true
	}
);

// used before any save op to hash plain password
userSchema.pre('save', async function (next) {
	const user = this;
	user.increment();
	if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 10);
	next();
});

// used to generate auth tokens for login and signup
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign(
		{
			_id: user._id.toString(),
			name: user.name,
			accountType: user.accountType,
			email_verified: user.isVerified,
			__v: user.__v
		},
		process.env.ECOMMERCE_JWT_PRIVATE_KEY,
		{ expiresIn: '7d', issuer: process.env.PROJECT_ISSUER }
	);
	return token;
};

userSchema.statics.signup = async function (body) {
	let exist = await User.getUserByEmail(body.email);
	if (exist) return { err: true, status: 400, message: 'Email already exists.' };
	exist = await User.findOne({ phoneNumber: body.phoneNumber });
	if (exist) return { err: true, status: 400, message: 'Phone number already exists.' };
	const user = new User(body);
	const token = await user.generateAuthToken();
	if (body.isVendor) {
		await Request.create({ _id: user._id, type: 'vendor', details: 'Want to be a vendor' });
	}
	return { user, token };
};

// static methods to use on class itself
userSchema.statics.loginUser = async function (email, password) {
	const user = await User.findOne({ email });
	if (!user) return { err: true, status: 400, message: 'Incorrect email or password.' };
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return { err: true, status: 400, message: 'Incorrect email or password.' };
	const token = await user.generateAuthToken();
	return { user, token };
};

userSchema.statics.getUsers = async function (query) {
	let { skip, sort, limit, pageNumber, pageSize, accountType, name, email, age, maxAge, gender } =
		query;
	if (pageNumber || pageSize) {
		limit = undefined;
		skip = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || 'name';
	if (sort) sort = sort.split(',').join(' ');
	let users;
	if (name) {
		name = new RegExp(name.replace('-', ' '), 'i');
		users = await User.find({ name }, '-password', { skip, limit, sort }).collation({
			locale: 'en'
		});
	} else if (email) {
		email = new RegExp(email, 'i');
		users = await User.find({ email }, '-password', { skip, limit, sort }).collation({
			locale: 'en'
		});
	} else if (accountType)
		users = await User.find({ accountType }, '-password', { skip, limit, sort }).collation({
			locale: 'en'
		});
	else if (gender)
		users = await User.find({ gender }, '-password', { skip, limit, sort }).collation({
			locale: 'en'
		});
	else if (age)
		users = await User.find(
			{ birthday: { $lte: moment().subtract(age, 'years').format('YYYY-MM-DD') } },
			'-password',
			{ skip, limit, sort }
		).collation({ locale: 'en' });
	else if (maxAge)
		users = await User.find(
			{ birthday: { $gte: moment().subtract(maxAge, 'years').format('YYYY-MM-DD') } },
			'-password',
			{ skip, limit, sort }
		).collation({ locale: 'en' });
	else users = await User.find({}, '-password', { skip, limit, sort }).collation({ locale: 'en' });
	return { pageNumber, pageSize, users };
};

userSchema.statics.getUserByEmail = async function (email) {
	return await User.findOne({ email });
};

userSchema.statics.getUserById = async function (id) {
	return await User.findById(id, '-password');
};

userSchema.statics.stats = async function (query) {
	let { date, accountType, gender } = query;
	let count;
	if (date) date = date.split(',');
	if (gender) count = await User.countDocuments({ gender });
	else if (accountType) count = await User.countDocuments({ accountType });
	else if (date && date.length === 1)
		count = await User.countDocuments({ createdAt: { $gte: date[0] } });
	else if (date && date.length === 2)
		count = await User.countDocuments({
			$and: [{ createdAt: { $gte: date[0] } }, { createdAt: { $lte: date[1] } }]
		});
	else count = await User.countDocuments();
	return count;
};

userSchema.statics.vendorReq = async function (id, details) {
	const request = await Request.findOne({ userId: id });
	if (request) return { err: true, status: 400, message: 'Request already submitted' };
	const result = await Request.create({
		userId: id,
		type: 'vendor',
		details: details || 'Want to be a vendor'
	});
	return { request: true };
};

userSchema.statics.getVendorReq = async function () {
	return await Request.find({}).populate('userId', '-password').collation({ locale: 'en' });
};

userSchema.statics.cancelVendorReq = async function (id) {
	const request = await Request.findByIdAndDelete(id);
	const user = await User.findOne({ _id: request.userId });
	return { user, request };
};

userSchema.statics.changeAccountType = async function (userId, type) {
	const user = await User.findById(userId, '-password');
	if (!user) return null;
	user.accountType = type;
	const req = await Request.findOne({ userId });
	if (req) await Request.deleteOne({ userId });
	return user;
};

userSchema.statics.editInfo = async function (userId, body) {
	const user = await User.findById(userId, '-password');
	const updates = Object.keys(body);
	if (updates.includes('email')) {
		const u = await User.findOne({ email: body['email'] });
		if (u) return { err: true, status: 400, message: 'Email already in use!' };
	}
	if (updates.includes('phoneNumber')) {
		const u = await User.findOne({ phoneNumber: body.phoneNumber });
		if (u) return { err: true, status: 400, message: 'Phone already in use!' };
	}
	updates.forEach(update => (user[update] = body[update]));
	return { user };
};

userSchema.statics.changePassword = async function (userId, oldPassword, newPassword) {
	const user = await User.findById(userId);
	const isMatch = await bcrypt.compare(oldPassword, user.password);
	user.password = newPassword;
	return { isMatch, user };
};

userSchema.statics.deleteUser = async function (userId) {
	const user = await User.findById(userId, '-password');
	if (!user) return { err: true, status: 404, message: 'User not found.' };
	await User.deleteOne({ _id: userId });
	return { user };
};

userSchema.statics.banUser = async function (userId) {
	const user = await User.findById(userId, '-password');
	if (!user) return { err: true, status: 404, message: 'User not found.' };
	user.status = 'banned';
	return { user };
};

const User = mongoose.model('User', userSchema, 'user');
export default User;
