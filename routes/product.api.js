const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller.js");

router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

router.get("/", productController.getProducts);

router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);

router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

router.get(
  "/deletedProducts",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.getDeletedProducts
);

router.patch(
  "/restore/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.restoreProduct
);

router.get("/:id", productController.getProductDetail);

module.exports = router;
