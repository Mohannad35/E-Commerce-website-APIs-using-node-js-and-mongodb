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
			clientID: process.env.FACEBOOK_CLIENT_ID,
			clientSecret: process.env.FACEBOOK_SECRET_KEY,
			callbackURL: process.env.FACEBOOK_CALLBACK_URL,
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
	if (req.user.err) return res.redirect(`${process.env.CLIENT_URL}error?msg=${req.user.msg}`);
	const token = req.user.jwtToken;
	res.cookie('x-auth-token', token);
	const user = JSON.stringify(req.user);
	res.cookie('x-auth-user', user);
	res.redirect(`${process.env.CLIENT_URL}error?token=${token}&user=${user}`);
});

function generateToken(user) {
	return jwt.sign(
		{
			_id: user._id.toString(),
			name: user.name,
			accountType: user.accountType,
			email_verified: true
		},
		process.env.ECOMMERCE_JWT_PRIVATE_KEY,
		{
			expiresIn: '7d',
			issuer: process.env.PROJECT_ISSUER
		}
	);
}

export default router;
