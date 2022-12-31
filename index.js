const express = require('express');
const userRouter = require('./routes/User_route');
const itemRouter =require('./routes/Item_route');
const cartRouter = require('./routes/Cart_route');
require('./config/db');
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(userRouter);
// app.use(itemRouter);
// app.use(cartRouter);
// app.use(orderRouter);

app.listen(port, () => console.log(`Listening on port ${port}...`));