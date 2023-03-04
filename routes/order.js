const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const OrderController = require('../controller/order');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validateReq');
const Validator = require('../middleware/Validator');

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
