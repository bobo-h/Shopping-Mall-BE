const Product = require("../models/Product");
const productController = {};

const PAGE_SIZE = 5;
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
    const cond = { isDelete: false };
    if (name) {
      cond.name = { $regex: name, $options: "i" };
    }
    let query = Product.find(cond).sort({ createdAt: -1 });
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      // 데이터 총 몇개인지 = 총 개수 / PAGE_SIZE
      const totalItemNum = await Product.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }
    // query를 실행시키고 싶을 때 하겠다는 것 = exec()
    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
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

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, category, description, price, stock, status },
      { new: true }
    );
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDelete: true },
      { new: true }
    );
    if (!product) throw new Error("Item doesn't exist");
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product || product.isDelete) {
      throw new Error("Item doesn't exist");
    }
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.checkStock = async (item) => {
  // 사려는 아이템 하나씩 들고와 재고 정보 가져오기
  const product = await Product.findById(item.productId);
  // 사려는 아이템 수량(qty), 재고 비교
  if (product.stock[item.size] < item.qty) {
    // 재고가 불충분하면 불충분 메세지와 함께 데이터 반환
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size}재고가 부족합니다`,
    };
  }
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  // 충분하다면, 재고에서 qty 성공
  return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = []; // 재고가 불충분한 아이템을 저장할 예정
  // 재고 확인 로직(하나하나 비교하기 위해 매핑)
  // 비동기를 한거번에 처리하는 방법 = promise.all
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );
  return insufficientStockItems;
};

productController.getDeletedProducts = async (req, res) => {
  try {
    const { page } = req.query;
    const cond = { isDelete: true };
    let query = Product.find(cond).sort({ createdAt: -1 });
    let response = { status: "success" };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const deletedProductList = await query.exec();
    response.data = deletedProductList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.restoreProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDelete: false },
      { new: true }
    );
    if (!product) throw new Error("Item doesn't exist or is already active");
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
