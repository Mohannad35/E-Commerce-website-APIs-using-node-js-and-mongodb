const router = require('express').Router();
const Auth = require('../middleware/auth');
const UserController = require('../controller/UserController');
const flash = require('connect-flash');
const User = require('../model/User');

router.get('/api/test', (req, res) => {
	res.send('test is successfull');
});

/** GET /  Home Page */
// router.get('/', function (req, res) {
// 	// Set a flash name and pass it to the home page.
// 	// If empty, we won't display. That's handled by EJS.
// 	const userName = req.flash('user');
// 	res.render('index', { userName });
// });
router.get('/homepage', (req, res) => {
	// console.log(req.cookies);
	const name = req.cookies.name? req.cookies.name : '';
	const userType = req.cookies.userType? req.cookies.userType : 'guest';
	res.render('index', { name, userType });
});

router.get('/login', (req, res) => {
	if (req.cookies.userToken) res.redirect('/homepage');
	const errorMessage = req.flash('err');
	res.render('Login', { errorMessage });
});

router.post('/login', UserController.login);

router.get('/sign-out', Auth, UserController.logout);

// not user anymore
router.get('/user-form', async (req, res) => {
	try{
		const user = await User.findOne({
			'tokens.token': req.cookies.userToken,
		});
		// console.log(user);
		const name = req.cookies.name? req.cookies.name : '';
		const userType = req.cookies.userType? req.cookies.userType : '';
		const email = user.email;
		// res.clearCookie('userType');
		// res.clearCookie('userToken');
		res.render('user_form', { name, email, userType });
	} catch (error) {
		// res.status(500).send(error.message);
		req.flash('err', error.message);
		res.redirect('/homepage');
	}
});

module.exports = router;
