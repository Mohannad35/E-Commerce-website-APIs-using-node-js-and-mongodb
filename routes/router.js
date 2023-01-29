const router = require('express').Router();
const Auth = require('../middleware/auth');
const UserController = require('../controller/UserController');
const flash = require('connect-flash');

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
	// console.log('aaaaaa');
	// console.log(req.cookies);
	const name = req.cookies.name;
	res.render('index', { name });
});

router.get('/login', (req, res) => {
	if (req.cookies.userToken) res.redirect('/homepage');
	const errorMessage = req.flash('err');
	res.render('login', { errorMessage });
});

router.post('/login', UserController.login);

router.get('/user-form', (req, res) => {
	const name = req.flash('name');
	const email = req.flash('email');
	const accountType = req.flash('accountType');
	// res.clearCookie('userType');
	// res.clearCookie('userToken');
	res.render('user_form', { name, email, accountType });
});

module.exports = router;
