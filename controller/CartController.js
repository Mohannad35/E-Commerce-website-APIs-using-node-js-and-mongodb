const Cart = require("../model/Cart");
const Item = require("../model/Item");

class CartController {
  // get all the items in a user cart from the Database and return them as JSON
  static async getCartItems(req, res) {
    const owner = req.user._id;
    try {
      const cart = await Cart.findOne({ owner });
      if (cart && cart.items.length > 0) {
        res.status(200).send(cart);
      } else {
        res.send(null);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }

  // add an item to a user cart or create a new cart if the user does not have an existing cart
  static async addCart(req, res) {
    const owner = req.user._id;
    const { itemId, quantity } = req.body;
    try {
      const cart = await Cart.findOne({ owner });
      const item = await Item.findOne({ _id: itemId });
      if (!item) {
        res.status(404).send({ message: "item not found" });
        return;
      }
      const price = item.price;
      const name = item.name;
      // If cart already exists for the user just add the item to it
      if (cart) {
        const itemIndex = cart.items.findIndex((item) => item.itemId == itemId);
        // check if product exists or not
        if (itemIndex > -1) {
          let product = cart.items[itemIndex];
          product.quantity += quantity;
          cart.bill = cart.items.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.quantity * currentValue.price;
          }, 0);
          cart.items[itemIndex] = product;
          await cart.save();
          res.status(200).send(cart);
        } else {
          cart.items.push({ itemId, name, quantity, price });
          cart.bill = cart.items.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.quantity * currentValue.price;
          }, 0);
          await cart.save();
          res.status(200).send(cart);
        }
      } else {
        // the user have no cart so we create one for him and add the item to it
        const newCart = await Cart.create({
          owner,
          items: [{ itemId, name, quantity, price }],
          bill: quantity * price,
        });
        return res.status(201).send(newCart);
      }
    } catch (error) {
      // console.log(error);
      res.status(500).send("Error", error);
    }
  }

  // delete an item from a user cart
  static async deleteItemInCart(req, res) {
    const owner = req.user._id;
    const itemId = req.query.itemId;
    try {
      // get the user cart and the item
      let cart = await Cart.findOne({ owner });
      const itemIndex = cart.items.findIndex((item) => item.itemId == itemId);
      // if the item exists we delete it
      if (itemIndex > -1) {
        let item = cart.items[itemIndex];
        cart.bill -= item.quantity * item.price;
        if (cart.bill < 0) {
          cart.bill = 0;
        }
        cart.items.splice(itemIndex, 1);
        cart.bill = cart.items.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);
        cart = await cart.save();
        res.status(200).send(cart);
      } else {
        // if the item does not exist we return 404
        res.status(404).send("item not found");
      }
    } catch (error) {
      // console.log(error);
      res.status(500).send("Error", error);
    }
  }
}

module.exports = CartController;
