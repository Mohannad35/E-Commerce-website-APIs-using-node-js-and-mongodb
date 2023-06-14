import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import validate from '../middleware/validateReq.js';
import ListController from '../controller/list.js';
import validateObjectId from '../middleware/validateObjectId.js';
import ListValidator from '../validation/list.js';
const router = Router();

// fetch all Lists
router.get('/', [auth], ListController.lists);

// fetch a list
router.get('/li', [auth, validate('query', ListValidator.list)], ListController.list);

// create a list
router.post('/', [auth, validate('body', ListValidator.list)], ListController.addList);

// update a list name
router.patch(
	'/:id',
	[auth, validateObjectId, validate('body', ListValidator.list)],
	ListController.updateList
);

// add item to list
router.post('/items', [auth, validate('body', ListValidator.listItemId)], ListController.addItemToList);

// delete a list item
router.delete(
	'/items',
	[auth, validate('body', ListValidator.listItemId)],
	ListController.removeFromList
);

// delete a list
router.delete('/:id', [auth, validateObjectId], ListController.deleteList);

export default router;
