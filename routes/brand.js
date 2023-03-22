const multer = require('multer');
const { Router } = require('express');
const auth = require('../middleware/auth.js');
const isAdmin = require('../middleware/admin.js');
const validate = require('../middleware/validateReq.js');
const Validator = require('../middleware/validator.js');
const BrandController = require('../controller/brand.js');
const validateObjectId = require('../middleware/validateObjectId.js');

const router = Router();
const storage = multer.diskStorage({
	destination: 'public/brands',
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
	}
});
const upload = multer({ storage });

// fetch all Brands
router.get('/', BrandController.brands);

// fetch a Brand
router.get('/:id', [validateObjectId], BrandController.brand);

// create a Brand
router.post(
	'/',
	[upload.single('image'), auth, isAdmin, validate('body', Validator.addBrand)],
	BrandController.addBrand
);

// update a Brand
router.patch(
	'/:id',
	[
		upload.single('image'),
		auth,
		isAdmin,
		validateObjectId,
		validate('body', Validator.updateBrand)
	],
	BrandController.updateBrand
);

// delete a Brand
router.delete('/:id', [auth, isAdmin, validateObjectId], BrandController.deleteBrand);

module.exports = router;
