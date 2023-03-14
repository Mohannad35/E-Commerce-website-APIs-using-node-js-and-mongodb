const config = require('config');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const router = require('express').Router();
const User = require('../model/user');

passport.use(
	new FacebookStrategy(
		{
			clientID: config.get('facebookClientId'),
			clientSecret: config.get('facebookSecretKey'),
			callbackURL: config.get('facebookCallbackUrl'),
			profileFields: ['id', 'displayName', 'email', 'gender']
		},
		async function (accessToken, refreshToken, profile, done) {
			const user = await User.findOne({
				accountId: profile.id,
				provider: 'facebook'
			});
			if (!user) {
				const exist = await User.findOne({ email: profile._json.email });
				if (exist)
					return done(null, { err: true, msg: `This email already linked to ${exist.provider}` });
				console.log('Adding new facebook user to DB..');
				const user = new User({
					accountId: profile._json.id,
					provider: profile.provider,
					name: profile._json.name,
					email: profile._json.email,
					isVerified: true
				});
				await user.save();
				const token = generateToken(user);
				_.set(user, 'jwtToken', token);
				return done(null, user);
			} else {
				console.log('Facebook User already exist in DB..');
				const token = generateToken(user);
				_.set(user, 'jwtToken', token);
				return done(null, user);
			}
		}
	)
);

router.get('/', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
	'/callback',
	passport.authenticate('facebook', {
		session: false,
		failureRedirect: '/auth/facebook/error'
	}),
	(req, res) => {
		if (req.user.err) return res.status(400).redirect(`/auth/facebook/error?msg=${req.user.msg}`);
		const token = req.user.jwtToken;
		res.cookie('x-auth-token', token);
		res.redirect(`/auth/facebook/success?id=${req.user._id}`);
	}
);

router.get('/error', (req, res) => {
	const { msg } = req.query;
	res.send({ msg: msg || 'Something went wrong while signing with facebook.' });
});

router.get('/success', (req, res) => {
	const token = req.cookies['x-auth-token'];
	res.clearCookie('x-auth-token');
	res.header('x-auth-token', token).send({ msg: 'login successfully.' });
});

function generateToken(user) {
	return jwt.sign(
		{
			_id: user._id.toString(),
			name: user.name,
			accountType: user.accountType,
			email_verified: true
		},
		config.get('jwtPrivateKey'),
		{
			expiresIn: '7d',
			issuer: config.get('project_issuer')
		}
	);
}

module.exports = router;
