const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController = {};
const PAGE_SIZE = 10;

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    res.status(200).json({ status: "success", data: orderList });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    let cond = {};
    if (ordernum) {
      cond = {
        orderNum: { $regex: ordernum, $options: "i" },
      };
    }
    const orderList = await Order.find(cond)
      .populate("userId")
      .populate({
        path: "items",
        populate: { path: "productId", model: "Product" },
        select: "image name",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);
    const totalItemNum = await Order.find(cond).countDocuments();
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    if (!order) throw new Error("주문 내역이 없습니다.");
    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
