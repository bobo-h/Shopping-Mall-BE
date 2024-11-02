const Cart = require("../models/Cart");
const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 해당 유저의 카트 찾고 없다면 만들어주고
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    // 있다면 이미 들어있는 아이템의 id와 사이즈가 같은지 확인
    const existItem = cart.items.fine(
      // mongoose.ObjectId(=productId)는 str값이 아니기에 size 비교와 다르게 equals 함수를 사용해 비교
      (item) => item.productId.equals(productId) && item.size === size
    );
    // 같다면 에러 던지기(수 추가되게 수정하기)
    if (existItem) {
      throw new Error("아이템이 이미 카드에 담겨 있습니다.");
    }
    // 아이템 저장
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    // 아이템 개수와 함께 보내주기
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;
