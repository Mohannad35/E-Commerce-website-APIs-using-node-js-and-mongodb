const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const CategoryController = require('../controller/category');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validateReq');
const Validator = require('../middleware/Validator');

// fetch all Categories
router.get('/', CategoryController.categories);

// fetch a Category
router.get('/:id', [validateObjectId], CategoryController.category);

// create a Category
router.post(
	'/',
	[auth, isAdmin, validate('body', Validator.addCategory)],
	CategoryController.addCategory
);

// update a Category
router.patch(
	'/:id',
	[auth, isAdmin, validateObjectId, validate('body', Validator.updateCategory)],
	CategoryController.updateCategory
);

// delete a Category
router.delete('/:id', [auth, isAdmin, validateObjectId], CategoryController.deleteCategory);

module.exports = router;
