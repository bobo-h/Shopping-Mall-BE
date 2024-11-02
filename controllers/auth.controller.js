const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Cart = require("../models/Cart");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compareSync(password, user.password);
      if (isMatch) {
        const token = await user.generateToken();

        // 유저의 장바구니 가져오기
        const cart = await Cart.findOne({ userId: user._id });
        const cartItemQty = cart ? cart.items.length : 0;
        return res
          .status(200)
          .json({ status: "success", user, token, cartItemQty });
      }
    }
    throw new Error("이메일 또는 비밀번호를 다시 확인해주세요");
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.authenticate = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error("Token not found");
    }
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        throw new Error("invalid token");
      }
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== "admin") {
      throw new Error("No permission");
    }
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = authController;
