const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");
const upload = require("../config/multerConfig");

router.post("/", upload.single("image"), restaurantController.addRestaurant);
router.get("/", restaurantController.getRestaurants);
router.get("/nearby", restaurantController.getNearbyRestaurants);

router.get("/menu", restaurantController.getMenuItems);
router.post("/menu", upload.single("image"), restaurantController.addMenuItem);
router.get("/menu/:id", restaurantController.getMenuItemById);
router.put("/menu/:id", upload.single("image"), restaurantController.updateMenuItem);
router.delete("/menu/:id", restaurantController.deleteMenuItem);

router.get("/:id", restaurantController.getRestaurantById);
router.put("/:id", upload.single("image"), restaurantController.updateRestaurant);
router.delete("/:id", restaurantController.deleteRestaurant);

router.post("/:restaurantId/reviews", restaurantController.addReview);
router.get("/:restaurantId/reviews", restaurantController.getRestaurantReviews);

module.exports = router;