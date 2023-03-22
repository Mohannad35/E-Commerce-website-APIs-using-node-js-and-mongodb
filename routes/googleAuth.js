const { Router } = require('express');
const config = require('config');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
const User = require('../model/user.js');
const router = Router();

passport.use(
	new GoogleStrategy(
		{
			clientID: config.get('googleClientId'),
			clientSecret: config.get('googleSecretKey'),
			callbackURL: config.get('googleCallbackUrl')
		},
		async function (accessToken, refreshToken, profile, done) {
			const user = await User.findOne({
				accountId: profile.id,
				provider: 'google'
			});
			if (!user) {
				const exist = await User.findOne({ email: profile._json.email });
				if (exist)
					return done(null, { err: true, msg: `This email already linked to ${exist.provider}` });
				console.log('Adding new google user to DB..');
				const user = new User({
					accountId: profile._json.sub,
					provider: profile.provider,
					name: profile._json.name,
					email: profile._json.email,
					isVerified: profile._json.email_verified
				});
				await user.save();
				const token = generateToken(user);
				_.set(user, 'jwtToken', token);
				return done(null, user);
			} else {
				console.log('Google User already exist in DB..');
				const token = generateToken(user);
				_.set(user, 'jwtToken', token);
				return done(null, user);
			}
		}
	)
);

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
	'/callback',
	passport.authenticate('google', {
		session: false,
		failureRedirect: '/auth/google/error'
	}),
	(req, res) => {
		if (req.user.err) return res.status(400).redirect(`/auth/google/error?msg=${req.user.msg}`);
		const token = req.user.jwtToken;
		res.cookie('x-auth-token', token);
		res.redirect(`/auth/google/success?id=${req.user._id}`);
	}
);

router.get('/error', (req, res) => {
	const { msg } = req.query;
	res.send({ msg: msg || 'Something went wrong while signing with google.' });
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
