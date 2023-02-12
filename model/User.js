const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 255,
			match: /^[A-Za-z]\w+/g,
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
				message: 'Invalid email address',
			},
		},
		// (conflicts btw .pre function and this validation which runs first).
		password: {
			type: String,
			required: true,
			minLength: 8,
		},
		accountType: {
			type: String,
			lowercase: true,
			default: 'client',
			enum: {
				values: ['admin', 'vendor', 'client'],
				message: '{VALUE} is not valid. Must be admin, vendor, or client',
			},
		},
		phoneNumbers: {
			type: Array,
			validate: {
				validator: function (v) {
					return v.length > 0;
				},
				message: 'A user must have at least one phone number',
			},
		},
		tokens: [
			{
				_id: false,
				token: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// used before any save op to hash plain password
userSchema.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 8);
	if (user.tokens.length > 5) throw new Error('max tokens exceeded');
	if (user.isModified('phoneNumbers'))
		if (new Set(user.phoneNumbers).size !== user.phoneNumbers.length)
			throw new Error('phone number already added');
	next();
});

// used to generate auth tokens for login and signup
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

// used to set accountType
userSchema.statics.setAccountType = async function (id, type) {
	const user = await User.findById(id);
	user.accountType = type;
	await user.save();
	return user;
};

// used in login route to find user with given email and password
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) throw new Error('Unable to log in (Unable to find email)');
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw new Error('Unable to login (Password is incorrect)');
	return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
