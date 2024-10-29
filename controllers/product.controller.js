const Product = require("../models/Product");
const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    // 정규화로 키워드가 포함인 상품까지 = regex / 대소문자 구분 없이 = options:"i"
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(cond);

    // query를 실행시키고 싶을 때 하겠다는 것 = exec()
    const productList = await query.exec();
    res.status(200).json({ status: "success", data: productList });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
