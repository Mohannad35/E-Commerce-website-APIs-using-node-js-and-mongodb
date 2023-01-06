const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
mongoose.Promise = global.Promise; // ES6 - promise

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
  })
  .then(
    () => {
      console.log("Connected to e-commerceDB");
    },
    (error) => {
      console.log("Error => ", error);
    }
  );
