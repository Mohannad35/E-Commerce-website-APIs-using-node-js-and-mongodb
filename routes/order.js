import { Router } from 'express';
import _ from 'lodash';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';
import isVendor from '../middleware/vendor.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import OrderController from '../controller/order.js';
import validateObjectId from '../middleware/validateObjectId.js';
const router = Router();

// get orders
router.get('/', [auth], OrderController.getOrders);

// get order by id
router.get('/:id', [auth, validateObjectId], OrderController.getOrder);

// checkout
router.post('/checkout', [auth, validate('body', Validator.order)], OrderController.checkout);

// delete order
router.delete('/:id', [auth, validateObjectId], OrderController.cancelOrder);

// edit order status
router.patch('/:id', [auth, isVendor, validateObjectId], OrderController.editOrderStatus);

// // confirm order
// router.put('/:id', [auth, isAdmin, validateObjectId], OrderController.confirmOrder);

// // order shipped
// router.patch('/:id', [auth, isAdmin, validateObjectId], OrderController.orderShipped);

export default router;
