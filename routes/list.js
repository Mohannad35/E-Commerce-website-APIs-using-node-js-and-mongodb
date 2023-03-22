const { Router } = require('express');
const _ = require('lodash');
const auth = require('../middleware/auth.js');
const validate = require('../middleware/validateReq.js');
const Validator = require('../middleware/validator.js');
const ListController = require('../controller/list.js');
const validateObjectId = require('../middleware/validateObjectId.js');
const router = Router();

// fetch all Lists
router.get('/', [auth], ListController.lists);

// fetch a list
router.get('/:id', [auth, validateObjectId], ListController.list);

// create a list
router.post('/', [auth, validate('body', Validator.list)], ListController.addList);

// update a list name
router.patch(
	'/:id',
	[auth, validateObjectId, validate('body', Validator.list)],
	ListController.updateList
);

// add item to list
router.post(
	'/items/:id',
	[auth, validateObjectId, validate('body', Validator.listItemId)],
	ListController.addItemToList
);

// delete a list item
router.delete('/items/:id', [auth, validateObjectId], ListController.removeFromList);

// delete a list
router.delete('/:id', [auth, validateObjectId], ListController.deleteList);

module.exports = router;
