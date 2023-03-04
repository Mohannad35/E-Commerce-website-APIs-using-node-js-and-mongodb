const express = require('express');
// const session = require('express-session');
// const cookieParser = require('cookie-parser');
const userRouter = require('../routes/user');
const itemRouter = require('../routes/item');
const cartRouter = require('../routes/cart');
const orderRouter = require('../routes/order');
const listRouter = require('../routes/list');
const categoryRouter = require('../routes/category');
const error = require('../middleware/error');
// const router = require('./routes/router');

module.exports = function (app) {
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	// app.use(cookieParser());
	// app.use(
	// 	session({ secret: 'secret', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true })
	// );
	app.use('/api/user', userRouter);
	app.use('/api/item', itemRouter);
	app.use('/api/cart', cartRouter);
	app.use('/api/order', orderRouter);
	app.use('/api/list', listRouter);
	app.use('/api/category', categoryRouter);
	app.use(error);
};
