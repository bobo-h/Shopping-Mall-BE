const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    // 프론트에서 보낸 데이터 받아옴(userId, totalprice, shipTp, contact, orderList..)
    const { userId } = req;
    const { shipTp, contact, totalprice, orderList } = req.body;
    // 재고 확인(주문 때 말고 장바구니에서 확인하는 방법도 있다.) & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    // checkItemListStock에서 재고가 부족한 아이템이 있었다면 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }
    // order 생성
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTp,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    // orderNum 생성
    await newOrder.save();
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;