const userModel = require("../model/User");
const bcrypt = require("bcryptjs");

class UserController {
	// create a user account and return the user and the logged in token
	static async signup(req, res) {
		try {
			const user = new userModel(req.body);
			await user.save();
			const token = await user.generateAuthToken();
			res.status(201).send({ user, token });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// login a user and return the user logged in token
	static async login(req, res) {
		try {
			const user = await userModel.findByCredentials(req.body.email, req.body.password);
			const token = await user.generateAuthToken();
			res.send(token);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// logout a user session (should return the logged out token?)
	static async logout(req, res) {
		try {
			// get the token for the current session to delete it
			req.user.tokens = req.user.tokens.filter(token => {
				return token.token !== req.token;
			});
			await req.user.save();
			res.send("Logged out from this session successfully");
		} catch (error) {
			res.status(500).send(error.message);
		}
	}

	// logout a user from all sessions (delete all tokens from the Database)
	static async logoutAll(req, res) {
		try {
			req.user.tokens = [];
			await req.user.save();
			res.send("Logged out from all sessions successfully");
		} catch (error) {
			res.status(500).send(error.message);
		}
	}

	// show all users (need editing to show only user information and not Tokens, Email and Password)
	// also need to check if the user has the permissions required (admin maybe?)
	static async showAllUsers(req, res) {
		try {
			if (req.user.accountType !== "admin")
				throw new Error("you must be an administrator to see all users");
			const users = await userModel.findAllUsers();
			res.send(users);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// change user account type
	static async changeAccountType(req, res) {
		try {
			if (req.user.accountType !== "admin")
				throw new Error("you must be an administrator to change account type");
			const user = await userModel.setAccountType(req.body.id, req.body.type);
			res.send({ name: user.name, email: user.email, accountType: user.accountType });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// edit user information (name and email)
	static async editInfo(req, res) {
		const updates = Object.keys(req.body);
		const allowedUpdates = ["name", "email"];
		const isValidOperation = updates.every(update => allowedUpdates.includes(update));
		if (!isValidOperation) return res.status(400).send({ error: "invalid updates" });
		try {
			const user = req.user;
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
			const user = req.user;
			const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
			if (!isMatch) throw new Error("Password is incorrect");
			user.password = req.body.newPassword;
			await user.save();
			res.send("Password Changed");
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// add new phone number
	static async addPhoneNumber(req, res) {
		try {
			const user = req.user;
			const phoneNumber = req.body.phoneNumber;
			user.phoneNumbers = user.phoneNumbers.concat({ phoneNumber });
			await user.save();
			res.send("added");
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// delete phone number
	static async delPhoneNumber(req, res) {
		try {
			req.user.phoneNumbers = req.user.phoneNumbers.filter(phoneNumber => {
				return phoneNumber.phoneNumber !== req.body.phoneNumber;
			});
			await req.user.save();
			res.send("deleted");
		} catch (error) {
			res.status(500).send(error.message);
		}
	}
}

module.exports = UserController;
