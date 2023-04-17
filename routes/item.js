import { Router } from 'express';
import _ from 'lodash';
import multer from 'multer';
import auth from '../middleware/auth.js';
import isVendor from '../middleware/vendor.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/Validator.js';
import ItemController from '../controller/item.js';
import validateObjectId from '../middleware/validateObjectId.js';

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
router.get('/', [validate('query', Validator.getItems)], ItemController.items);

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

export default router;
