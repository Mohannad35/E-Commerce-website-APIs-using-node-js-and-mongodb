const { Router } = require('express');
const _ = require('lodash');
const multer = require('multer');
const auth = require('../middleware/auth.js');
const isVendor = require('../middleware/vendor.js');
const validate = require('../middleware/validateReq.js');
const Validator = require('../middleware/validator.js');
const ItemController = require('../controller/item.js');
const validateObjectId = require('../middleware/validateObjectId.js');

const router = Router();
const storage = multer.diskStorage({
	destination: 'public/images',
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
	}
});
const upload = multer({ storage });

// fetch all items
router.get('/', ItemController.items);

// fetch an item
router.get('/:id', [validateObjectId], ItemController.getOneItem);

// create an item
router.post(
	'/',
	[upload.array('images', 5), auth, isVendor, validate('body', Validator.addItem)],
	ItemController.addItem
);

// update an item
router.patch(
	'/:id',
	[
		upload.array('images', 5),
		auth,
		isVendor,
		validateObjectId,
		validate('body', Validator.updateItem)
	],
	ItemController.updateItem
);

// delete item
router.delete('/:id', [auth, isVendor, validateObjectId], ItemController.deleteItem);

module.exports = router;
