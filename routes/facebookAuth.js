import { Router } from 'express';
import config from 'config';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../model/user.js';
import logger from '../middleware/logger.js';
const router = Router();

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
				logger.info('Adding new facebook user to DB..');
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
				logger.info('Facebook User already exist in DB..');
				const token = generateToken(user);
				_.set(user, 'jwtToken', token);
				return done(null, user);
			}
		}
	)
);

router.get('/', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
	if (req.user.err) return res.redirect(`${config.get('client_url')}error?msg=${req.user.msg}`);
	const token = req.user.jwtToken;
	res.cookie('x-auth-token', token);
	const user = JSON.stringify(req.user);
	res.cookie('x-auth-user', user);
	res.redirect(`${config.get('client_url')}error`);
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

export default router;
