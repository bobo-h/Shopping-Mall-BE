const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/", userController.createUser);
// 토큰이 valid한지 찾고(미들웨어), 토큰으로 user찾기
router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;
