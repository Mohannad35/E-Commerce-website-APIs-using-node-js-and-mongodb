import multer from 'multer';
import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import CategoryController from '../controller/category.js';
import validateObjectId from '../middleware/validateObjectId.js';

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

export default router;
