const express = require("express");
const router = express.Router();
const controller = require("../controllers/cartController");

router.post("/", controller.createCartItem);
router.get("/:userId", controller.getCartByUserId);
router.put("/update", controller.updateItemQuantity);
router.delete("/:userId/:itemId", controller.deleteCartItem);
router.delete("/:userId", controller.deleteCart);

module.exports = router;
