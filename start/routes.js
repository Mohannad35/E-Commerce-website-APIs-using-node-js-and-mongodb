import express from 'express';
import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import error from '../middleware/error.js';
import userRouter from '../routes/user.js';
import itemRouter from '../routes/item.js';
import cartRouter from '../routes/cart.js';
import listRouter from '../routes/list.js';
import brandRouter from '../routes/brand.js';
import orderRouter from '../routes/order.js';
import googleRouter from '../routes/googleAuth.js';
import categoryRouter from '../routes/category.js';
import facebookRouter from '../routes/facebookAuth.js';
mongoose.plugin(slug);

export default function (app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(express.static('public'));
	app.use(cookieParser());
	app.use(helmet());
	app.use(cors());
	app.use('/api/user', userRouter);
	app.use('/api/item', itemRouter);
	app.use('/api/cart', cartRouter);
	app.use('/api/list', listRouter);
	app.use('/api/brand', brandRouter);
	app.use('/api/order', orderRouter);
	app.use('/auth/google', googleRouter);
	app.use('/api/category', categoryRouter);
	app.use('/auth/facebook', facebookRouter);
	app.use(error);
}
