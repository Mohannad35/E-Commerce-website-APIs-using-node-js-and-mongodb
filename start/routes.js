const express = require('express');
const mongoose = require('mongoose');
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const cookieParser = require('cookie-parser');
const facebookRouter = require('../routes/facebookAuth');
const googleRouter = require('../routes/googleAuth');
const userRouter = require('../routes/user');
const itemRouter = require('../routes/item');
const cartRouter = require('../routes/cart');
const listRouter = require('../routes/list');
const orderRouter = require('../routes/order');
const categoryRouter = require('../routes/category');
const error = require('../middleware/error');

module.exports = function (app) {
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.use(cookieParser());
	app.use('/api/user', userRouter);
	app.use('/api/item', itemRouter);
	app.use('/api/cart', cartRouter);
	app.use('/api/order', orderRouter);
	app.use('/api/list', listRouter);
	app.use('/api/category', categoryRouter);
	app.use('/auth/facebook', facebookRouter);
	app.use('/auth/google', googleRouter);
	app.use(error);
};
