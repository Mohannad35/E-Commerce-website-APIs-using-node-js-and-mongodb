const Auth = require('../middleware/auth');
const OrderController = require('../controller/order');
const router = require('express').Router();

// get order
router.get('/', Auth, OrderController.getOrders);

// checkout
router.post('/checkout', Auth, OrderController.checkout);

// cancel order
router.delete('/', Auth, OrderController.cancelOrder);

// confirm order
router.put('/', Auth, OrderController.confirmOrder);

// order shipped
router.patch('/', Auth, OrderController.orderShipped);

module.exports = router;
