const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 255,
			match: /^[A-Za-z][A-Za-z0-9 ]{2,255}$/
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

userSchema.post('save', function (error, doc, next) {
	if (error.name.match(/^Mongo.*/g) && error.code === 11000)
		next(new Error('Email already exists'));
	else next(error);
});

// used before any save op to hash plain password
userSchema.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 10);
	if (user.isModified('tokens'))
		if (user.tokens.length > 10) throw new Error('max tokens exceeded');
	if (user.isModified('phoneNumbers')) {
		if (user.phoneNumbers.length < 1) throw new Error('A user must have at least one phone number');
		if (user.phoneNumbers.length > 10) throw new Error('max phone numbers exceeded');
		let numbers = [];
		user.phoneNumbers.forEach(element => numbers.push(element.phoneNumber));
		if (new Set(numbers).size !== user.phoneNumbers.length)
			throw new Error('phone number already added');
	}
	next();
});

// used to generate auth tokens for login and signup
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign(
		{
			_id: user._id.toString(),
			name: user.name,
			accountType: user.accountType
		},
		config.get('jwtPrivateKey')
	);
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

const User = mongoose.model('User', userSchema, 'user');
module.exports = User;
