const express = require('express');
const Auth = require('../middleware/auth');
const OrderController = require('../controller/order');

const router = new express.Router();

//get order
router.get('/', Auth, OrderController.getOrders);

//checkout
router.post('/checkout', Auth, OrderController.checkout);

module.exports = router;
