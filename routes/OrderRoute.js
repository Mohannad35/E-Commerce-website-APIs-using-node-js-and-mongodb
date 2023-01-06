const express = require("express");
const Auth = require("../middleware/auth");
const OrderController = require("../controller/OrderController");

const router = new express.Router();

//get orders
router.get("/orders", Auth, OrderController.getOrders);

//checkout
router.post("/order/checkout", Auth, OrderController.checkout);

module.exports = router;
