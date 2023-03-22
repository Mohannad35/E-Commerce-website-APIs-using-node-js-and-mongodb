const multer = require('multer');
const { Router } = require('express');
const auth = require('../middleware/auth.js');
const isAdmin = require('../middleware/admin.js');
const validate = require('../middleware/validateReq.js');
const Validator = require('../middleware/validator.js');
const CategoryController = require('../controller/category.js');
const validateObjectId = require('../middleware/validateObjectId.js');

const router = Router();
const storage = multer.diskStorage({
	destination: 'public/categories',
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
	}
});
const upload = multer({ storage });

// fetch all Categories
router.get('/', [validate('query', Validator.categories)], CategoryController.categories);

// fetch sub Categories
router.get('/sub/:id', [validateObjectId], CategoryController.subCategories);

// fetch a Category
router.get('/:id', [validateObjectId], CategoryController.category);

// create a Category
router.post(
	'/',
	[upload.single('image'), auth, isAdmin, validate('body', Validator.addCategory)],
	CategoryController.addCategory
);

// update a Category
router.patch(
	'/:id',
	[
		upload.single('image'),
		auth,
		isAdmin,
		validateObjectId,
		validate('body', Validator.updateCategory)
	],
	CategoryController.updateCategory
);

// delete a Category
router.delete('/:id', [auth, isAdmin, validateObjectId], CategoryController.deleteCategory);

module.exports = router;
