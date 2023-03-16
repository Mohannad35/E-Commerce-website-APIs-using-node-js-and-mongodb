import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import OrderController from '../controller/order.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// get order
router.get('/', [auth], OrderController.getOrders);

// checkout
router.post('/checkout', [auth, validate('body', Validator.order)], OrderController.checkout);

// cancel order
router.delete('/:id', [auth, validateObjectId], OrderController.cancelOrder);

// confirm order
router.put('/:id', [auth, isAdmin, validateObjectId], OrderController.confirmOrder);

// order shipped
router.patch('/:id', [auth, isAdmin, validateObjectId], OrderController.orderShipped);

export default router;
