import Order from '../models/orderModel.js';
import Shop from './../models/shopModel.js';

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "Delivery address is invalid" });
        }
        const groupItemsByShop = {}
        cartItems.forEach(item => {
            const shopId = item.shop;
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item);
        })
        const shopOrders = await Promise.all(
            Object.keys(groupItemsByShop).map(async (shopId) => {
                const shop = await Shop.findById(shopId).populate("owner");
                if (!shop) throw new Error(`Shop with id ${shopId} not found`);

                const items = groupItemsByShop[shopId];
                const subTotal = items.reduce(
                    (total, item) => total + Number(item.price) * Number(item.quantity),
                    0
                );

                return {
                    shop: shop._id,
                    owner: shop.owner._id,
                    subTotal,
                    shopOrderItems: items.map((item) => ({
                        item: item._id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                }
            })
        )

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders,
        })
        return res.status(201).json(newOrder);
    } catch (error) {
        return res.status(500).json({ message: `Place order failed. Error: ${error.message}` });
    }
}