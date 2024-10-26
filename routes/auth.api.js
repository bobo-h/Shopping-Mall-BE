const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", authController.loginWithEmail);
// router.get("/me", authController.authenticate, authController.getUser);

module.exports = router;
