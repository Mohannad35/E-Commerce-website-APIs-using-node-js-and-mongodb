import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/Validator.js';
import RateController from '../controller/rate.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router();

// fetch all rates
router.get('/', [validate('query', Validator.getRates)], RateController.rates);

// fetch an rate
router.get('/:id', [validateObjectId], RateController.rate);

// create an rate
router.post('/', [auth, validate('body', Validator.addRate)], RateController.addRate);

// update an rate
router.patch(
	'/:id',
	[auth, validateObjectId, validate('body', Validator.editRate)],
	RateController.updateRate
);

// delete rate
router.delete('/:id', [auth, validateObjectId], RateController.deleteRate);

export default router;
