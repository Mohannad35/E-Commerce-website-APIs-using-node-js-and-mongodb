const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const userRouter = require('./routes/UserRoute');
const itemRouter = require('./routes/ItemRoute');
const cartRouter = require('./routes/CartRoute');
const orderRouter = require('./routes/OrderRoute');
const router = require('./routes/router');

const dotenv = require('dotenv');
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

// Setting ejs as the used templating engine to create dynamic website content
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('views'));
app.use('/css', express.static(__dirname + 'views/css'));
app.use('/img', express.static(__dirname + 'views/images'));
app.use('/js', express.static(__dirname + 'views/js'));

app.use(userRouter);
app.use(itemRouter);
app.use(cartRouter);
app.use(orderRouter);
app.use(router);

app.listen(port, () => console.log(`Listening on port ${port}...`));
