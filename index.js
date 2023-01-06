const express = require("express");
const userRouter = require("./routes/UserRoute");
const itemRouter = require("./routes/ItemRoute");
const cartRouter = require("./routes/CartRoute");
const orderRouter = require("./routes/OrderRoute");
const dotenv = require("dotenv");
dotenv.config();
require("./config/db");
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(userRouter);
app.use(itemRouter);
app.use(cartRouter);
app.use(orderRouter);

app.listen(port, () => console.log(`Listening on port ${port}...`));
