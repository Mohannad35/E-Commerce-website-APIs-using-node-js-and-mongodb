const router = require('express').Router();
// const db = require('../config/db');
// const usercontroller = require('../controllers/UserController');
// const itemcontroller = require('../controllers/ItemController');

router.get('/api/test', (req, res) => {
	res.send("test is successfull");
});

module.exports = router;