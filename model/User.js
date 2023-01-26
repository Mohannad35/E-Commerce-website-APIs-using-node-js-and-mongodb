const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!value.match(/^[A-Za-z][A-Za-z0-9_]{2,29}$/g)) {
					throw new Error(
						"{VALUE} must contain only alphanumeric characters or underscores with length (3,30)"
					);
				}
			},
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Email is invalid");
				}
			},
		},
		password: {
			type: String,
			required: true,
			minLength: 7,
			trim: true,
			// validate(value) {
			// 	// To check a password between 8 to 15 characters which contain at least one
			// 	// lowercase letter, one uppercase letter, one numeric digit, and one special character
			// 	if (!value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/g)) {
			// 		throw new Error(
			// 			"{VALUE} must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character length(8,30)"
			// 		);
			// 	}
			// },
		},
		accountType: {
			type: String,
			lowercase: true,
			default: "client",
			enum: {
				values: ["admin", "vendor", "client"],
				message: "{VALUE} is not valid must be admin, or vendor, or client",
			},
		},
		phoneNumbers: [
			{
				phoneNumber: {
					type: String,
					minlength: 10,
					maxlength: 12,
					unique: true,
					required: true,
				},
			},
		],
		tokens: [
			{
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
	const user = await User.findOne({ _id: id });
	user.accountType = type;
	await user.save();
	return user;
};

// used before any save op to hash plain password
userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) user.password = await bcrypt.hash(user.password, 8);
	if (user.tokens.length > 5) throw new Error("max tokens exceeded");
	next();
});

// used in login route to find user with given email and password
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) throw new Error("Unable to log in (Unable to find email)");
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw new Error("Unable to login (Password is incorrect)");
	return user;
};

// used in show all users
userSchema.statics.findAllUsers = async () => {
	const users = await User.find({}, { _id: 0, name: 1, accountType: 1 });
	if (!users) throw new Error("Database is empty!)");
	return users;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
