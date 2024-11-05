const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");
const Schema = mongoose.Schema;
const orderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required: true },
    shipTo: { type: Object, required: true },
    contact: { type: Object, required: true },
    totalPrice: { type: Number, required: true, default: 0 },
    status: { type: String, default: "preparing" },
    orderNum: { type: String },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product, required: true },
        size: { type: String, required: true },
        qty: { type: Number, default: 1, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
};

// 카트 찾고 비워주기
orderSchema.post("save", async function () {
  // 카트 찾기
  const cart = await Cart.findOne({ userId: this.userId });
  // 비워주기
  cart.items = [];
  await cart.save();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
