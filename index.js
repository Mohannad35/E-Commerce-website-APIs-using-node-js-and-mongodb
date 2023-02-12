const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const startupDebugger = require('debug')('app:startup');
const morgan = require('morgan');
// const helmet = require('helmet');

const userRouter = require('./routes/user');
const itemRouter = require('./routes/item');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const router = require('./routes/router');

dotenv.config();
require('./config/db');

const port = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
	session({
		secret: 'something',
		cookie: { maxAge: 60000 },
		resave: true,
		saveUninitialized: true,
	})
);
app.use(flash());
// app.use(helmet());
if (app.get('env') === 'development') {
	app.use(morgan('combined'));
	startupDebugger('Morgan enabled...');
}

// Setting ejs as the used templating engine to create dynamic website content
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('views'));
app.use('/css', express.static(__dirname + 'views/css'));
app.use('/img', express.static(__dirname + 'views/images'));
app.use('/js', express.static(__dirname + 'views/js'));

app.use('/users', userRouter);
app.use('/items', itemRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use(router);

app.listen(port, () => startupDebugger(`Listening on port ${port}...`));
