const userModel = require("../model/User");

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
}

module.exports = UserController;
