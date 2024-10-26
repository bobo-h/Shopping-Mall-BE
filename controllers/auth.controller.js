// const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();
// const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compareSync(password, user.password);
      if (isMatch) {
        const token = await user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("이메일 또는 비밀번호를 다시 확인해주세요");
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// authController.authenticate = (req, res, next) => {
//   try {
//     const tokenString = req.headers.authorization;
//     if (!tokenString) {
//       throw new Error("invalid token");
//     }
//     const token = tokenString.replace("Bearer ", "");
//     jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
//       if (error) {
//         throw new Error("invalid token");
//       }
//       req.userId = payload._id;
//     });
//     next();
//   } catch (error) {
//     res.status(400).json({ status: "fail", message: error.message });
//   }
// };

// authController.getUser = async (req, res) => {
//     try {
//       const { userId } = req;
//       const user = await User.findById(userId);
//       if (!user) {
//         throw new Error("can not find user");
//       }
//       res.status(200).json({ status: "success", user });
//     } catch (error) {
//       res.status(400).json({ status: "fail", message: error.message });
//     }
//   };

module.exports = authController;
