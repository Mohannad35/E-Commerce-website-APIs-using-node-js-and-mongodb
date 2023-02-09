const router = require('express').Router();
const Auth = require('../middleware/auth');
const UserController = require('../controller/user');
// const flash = require('connect-flash');
const User = require('../model/user');

/** GET /  Home Page */
router.get('/', (req, res) => {
	// console.log(req.cookies);
	// Get name and type from cookies if any and pass them to the home page.
	// If empty, we won't display name and set type to guest to be handled by EJS.
	const name = req.cookies.name ? req.cookies.name : '';
	const userType = req.cookies.userType ? req.cookies.userType : 'guest';
	res.render('index', { name, userType });
});

router.get('/login', (req, res) => {
	if (req.cookies.userToken) res.redirect('/');
	const errorMessage = req.flash('err');
	res.render('Login', { errorMessage });
});

router.get('/sign-up', (req, res) => {
	if (req.cookies.userToken) res.redirect('/');
	const errorMessage = req.flash('err');
	res.render('Signup', { errorMessage });
});

router.post('/sign-up', UserController.signup);

router.post('/login', UserController.login);

router.get('/sign-out', Auth, UserController.logout);

router.get('/faq', (req, res) => {
	res.render('FAQ');
});

router.get('/user-form', async (req, res) => {
	try {
		const user = await User.findOne({
			'tokens.token': req.cookies.userToken,
		});
		const name = req.cookies.name ? req.cookies.name : '';
		const userType = req.cookies.userType ? req.cookies.userType : '';
		const email = user.email;
		res.render('user_form', { name, email, userType });
	} catch (error) {
		// res.status(500).send(error.message);
		req.flash('err', error.message);
		res.redirect('/');
	}
});

module.exports = router;
