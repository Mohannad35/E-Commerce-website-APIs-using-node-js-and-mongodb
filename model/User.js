const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
var { sha224, sha256 } = require('js-sha256');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('config');
const Request = require('./request');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 255,
			match: /^[\p{L}].*$/u
		},
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
		isVerified: {
			type: Boolean,
			default: false
		},
		token: { type: String },
		expireAt: { type: Date },
		password: {
			type: String,
			minlength: 8,
			maxlength: 1024
		},
		accountType: {
			type: String,
			lowercase: true,
			default: 'client',
			enum: {
				values: ['admin', 'vendor', 'client'],
				message: '{VALUE} is not valid. Must be admin, vendor, or client'
			}
		},
		phoneNumber: {
			type: String,
			unique: true,
			sparse: true,
			index: true
		},
		country: {
			type: String,
			minlength: 3,
			maxlength: 255
		},
		city: {
			type: String,
			minlength: 3,
			maxlength: 255
		},
		address: {
			type: String,
			minlength: 3,
			maxlength: 1024
		},
		birthday: {
			type: Date,
			min: moment().subtract(120, 'years').format('YYYY-MM-DD'),
			max: moment().subtract(10, 'years').format('YYYY-MM-DD')
		},
		gender: {
			type: String,
			lowercase: true,
			enum: {
				values: ['male', 'female'],
				message: '{VALUE} is not a gender'
			}
		},
		companyName: {
			type: String,
			minlength: 3,
			maxlength: 255
		},
		businessAddress: {
			type: String,
			minlength: 3,
			maxlength: 1024
		},
		websiteAddress: {
			type: String,
			minlength: 3,
			maxlength: 1024
		},
		accountId: {
			type: String
		},
		provider: {
			type: String
		}
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
		config.get('jwtPrivateKey'),
		{ expiresIn: '7d', issuer: config.get('project_issuer') }
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
	const user = await User.findOne({ email }, 'name email password accountType tokens __v');
	if (!user) return { err: true, status: 400, message: 'Incorrect email or password.' };
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return { err: true, status: 400, message: 'Incorrect email or password.' };
	const token = await user.generateAuthToken();
	return { user, token };
};

userSchema.statics.getUsers = async function (query) {
	let { skip, sort, limit, accountType, name, email, age, maxAge, gender } = query;
	skip = skip || 0;
	sort = sort || 'name';
	limit = limit || 1000;
	if (name) {
		name = new RegExp(name.replace('-', ' '), 'i');
		return await User.find({ name }, '-password', { skip, limit, sort });
	}
	if (email) {
		email = new RegExp(email, 'i');
		return await User.find({ email }, '-password', { skip, limit, sort });
	}
	if (accountType) return await User.find({ accountType }, '-password', { skip, limit, sort });
	if (gender) return await User.find({ gender }, '-password', { skip, limit, sort });
	if (age)
		return await User.find(
			{ birthday: { $lte: moment().subtract(age, 'years').format('YYYY-MM-DD') } },
			'-password',
			{ skip, limit, sort }
		);
	if (maxAge)
		return await User.find(
			{ birthday: { $gte: moment().subtract(maxAge, 'years').format('YYYY-MM-DD') } },
			'-password',
			{ skip, limit, sort }
		);
	return await User.find({}, '-password', { skip, limit, sort });
};

userSchema.statics.getUserByEmail = async function (email) {
	return await User.findOne({ email });
};

userSchema.statics.getUserById = async function (id) {
	return await User.findById(id, '-password');
};

userSchema.statics.remainingUsers = async function (pageNumber = 1, pageSize = 20, limit = 100) {
	const count = await User.countDocuments({}, { skip: pageNumber * pageSize, limit });
	return count <= 100 ? count : '+100';
};

userSchema.statics.vendorReq = async function (id, details) {
	const request = Request.findById(id);
	if (request) return { err: true, status: 400, message: 'Request already submitted' };
	const result = await Request.create({
		_id: id,
		type: 'vendor',
		details: details || 'Want to be a vendor'
	});
	return { request: true };
};

userSchema.statics.getVendorReq = async function () {
	return await Request.find({});
};

userSchema.statics.changeAccountType = async function (userId, type) {
	const user = await User.findById(userId, 'name accountType __v');
	if (!user) return null;
	user.accountType = type;
	return user;
};

userSchema.statics.editInfo = async function (userId, body) {
	const user = await User.findById(userId);
	const updates = Object.keys(body);
	updates.forEach(update => (user[update] = body[update]));
	return user;
};

userSchema.statics.changePassword = async function (userId, oldPassword, newPassword) {
	const user = await User.findById(userId, 'password __v');
	const isMatch = await bcrypt.compare(oldPassword, user.password);
	user.password = newPassword;
	return { isMatch, user };
};

const User = mongoose.model('User', userSchema, 'user');
module.exports = User;
