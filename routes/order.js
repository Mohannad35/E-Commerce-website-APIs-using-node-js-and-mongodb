const { Router } = require('express');
const _ = require('lodash');
const auth = require('../middleware/auth.js');
const isAdmin = require('../middleware/admin.js');
const validate = require('../middleware/validateReq.js');
const Validator = require('../middleware/validator.js');
const OrderController = require('../controller/order.js');
const validateObjectId = require('../middleware/validateObjectId.js');
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

module.exports = router;
