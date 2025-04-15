const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");
const isAdmin = require("../middlewares/isAdmin");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/profile", verifyToken, controller.getProfile);

// Admin-style user management
router.get("/users", verifyToken, isAdmin, controller.getAllUsers);
router.get("/users/:id", verifyToken, controller.getUserById);
router.put("/users/:id", verifyToken, controller.updateUser);
router.delete("/users/:id", verifyToken, isAdmin, controller.deleteUser);


module.exports = router;
