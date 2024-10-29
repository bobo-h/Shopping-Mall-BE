const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller.js");
const authController = require("../controllers/auth.controller");

router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

router.get("/", productController.getProducts);

module.exports = router;
