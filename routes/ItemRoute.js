const express = require("express");
const Auth = require("../middleware/auth");
const ItemController = require("../controller/ItemController");

const router = new express.Router();

// fetch all items
router.get("/items", ItemController.getAllItems);

// fetch an item
router.get("/item", ItemController.getOneItem);

// create an item
router.post("/items", Auth, ItemController.addItem);

// update an item
router.patch("/items/:id", Auth, ItemController.updateItem);

// delete item (need to check if the user has admin permissions or he's the owner of the item)
router.delete("/items/:id", Auth, ItemController.deleteItem);

module.exports = router;
