const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
var { sha224, sha256 } = require('js-sha256');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 255,
			match: /^[A-Za-z].*/
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			validate: {
				validator: function (value) {
					return validator.isEmail(value);
				},
				message: 'Invalid email address'
			}
		},
		// (conflicts btw .pre function and this validation which runs first).
		password: {
			type: String,
			required: true,
			minLength: 8,
			maxLength: 1024
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
		phoneNumbers: [
			{
				phoneNumber: {
					type: String,
					required: true
				}
			}
		],
		tokens: [
			{
				token: {
					type: String,
					required: true
				}
			}
		]
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
			__v: user.__v
		},
		config.get('jwtPrivateKey'),
		{
			expiresIn: '7d'
		}
	);
	const hashedToken = await bcrypt.hash(sha256(token), 10);
	await User.updateOne({ _id: user._id }, { $push: { tokens: { token: hashedToken } } });
	return token;
};

userSchema.statics.refreshAuthToken = async function (_id, token) {
	const user = await User.logoutUser(_id, token);
	const newToken = jwt.sign(
		{
			_id: user._id.toString(),
			name: user.name,
			accountType: user.accountType,
			__v: user.__v
		},
		config.get('jwtPrivateKey'),
		{
			expiresIn: '7d'
		}
	);
	const hashedToken = await bcrypt.hash(sha256(newToken), 10);
	await User.updateOne({ _id: user._id }, { $push: { tokens: { token: hashedToken } } });
	return newToken;
};

// static methods to use on class itself
userSchema.statics.loginUser = async function (email, password) {
	const user = await User.findOne({ email }, 'name email password accountType tokens __v');
	if (!user) return { err: true, status: 400, message: 'Incorrect email or password.' };
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return { err: true, status: 400, message: 'Incorrect email or password.' };
	if (user.tokens.length >= 10) return { err: true, status: 406, message: 'Max tokens exceeded.' };
	const token = await user.generateAuthToken();
	return { user, token };
};

async function filter(arr, callback) {
	const fail = Symbol();
	return (await Promise.all(arr.map(async item => ((await callback(item)) ? item : fail)))).filter(
		i => i !== fail
	);
}

userSchema.statics.logoutUser = async function (userId, token) {
	const user = await User.findById(userId, 'name email password accountType tokens __v');
	user.tokens = await filter(
		user.tokens,
		async obj => !(await bcrypt.compare(sha256(token), obj.token))
	);
	await User.updateOne({ _id: user._id }, { $set: { tokens: user.tokens } });
	return user;
};

userSchema.statics.logoutSessions = async function (userId, token) {
	const user = await User.findById(userId, 'name email password accountType tokens __v');
	const sessions = user.tokens.length;
	user.tokens = [];
	// user.increment();
	return { user, sessions };
};

userSchema.statics.getUsers = async function (pageNumber = 1, pageSize = 20, sort = 'name') {
	const users = await User.find({}, 'name email accountType phoneNumbers.phoneNumber __v', {
		skip: (pageNumber - 1) * pageSize,
		limit: pageSize,
		sort
	});
	return users;
};

userSchema.statics.getUserByEmail = async function (email) {
	return await User.findOne({ email }, 'name email accountType phoneNumbers.phoneNumber __v');
};

userSchema.statics.getUserById = async function (id) {
	return await User.findById(id, 'name email accountType phoneNumbers.phoneNumber __v');
};

userSchema.statics.remainingUsers = async function (pageNumber = 1, pageSize = 20, limit = 100) {
	const count = await User.countDocuments({}, { skip: pageNumber * pageSize, limit });
	return count <= 100 ? count : '+100';
};

userSchema.statics.changeAccountType = async function (userId, type) {
	const user = await User.findById(userId, 'name accountType');
	if (!user) return null;
	user.accountType = type;
	return user;
};

userSchema.statics.editInfo = async function (userId, body) {
	const user = await User.findById(userId, 'name email __v');
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

userSchema.statics.addPhone = async function (userId, phoneNumber) {
	const user = await User.findById(userId, 'phoneNumbers __v');
	if (user.phoneNumbers.length >= 10)
		return { err: true, status: 406, message: 'Max phone numbers exceeded.' };
	const numbers = [];
	user.phoneNumbers.forEach(obj => numbers.push(obj.phoneNumber));
	if (numbers.includes(phoneNumber))
		return { err: true, status: 400, message: 'Phone number already added.' };
	user.phoneNumbers = user.phoneNumbers.concat({ phoneNumber });
	return { user };
};

userSchema.statics.delPhone = async function (userId, phoneNumber) {
	const user = await User.findById(userId, 'phoneNumbers __v');
	const numbers = [];
	user.phoneNumbers.forEach(obj => numbers.push(obj.phoneNumber));
	if (!numbers.includes(phoneNumber))
		return { err: true, status: 400, message: `Phone number doesn't exists.` };
	if (user.phoneNumbers.length <= 1)
		return { err: true, status: 406, message: 'A user must have at least one phone number.' };
	user.phoneNumbers = user.phoneNumbers.filter(obj => obj.phoneNumber !== phoneNumber);
	return { user };
};

const User = mongoose.model('User', userSchema, 'user');
module.exports = User;
