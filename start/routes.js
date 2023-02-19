const helmet = require('helmet');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const userRouter = require('../routes/user');
const itemRouter = require('../routes/item');
const cartRouter = require('../routes/cart');
const orderRouter = require('../routes/order');
const error = require('../middleware/error');
// const router = require('./routes/router');

module.exports = function (app) {
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.use(cookieParser());
	app.use(helmet());
	app.use(
		session({ secret: 'secret', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true })
	);
	app.use('/user', userRouter);
	app.use('/item', itemRouter);
	app.use('/cart', cartRouter);
	app.use('/order', orderRouter);
	app.use(error);
};
