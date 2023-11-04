import { asyncError } from "../middlewares/error.js";
import ErrorHandler from "../utils/error.js";
import { Order } from "../models/order.js"
import { Product } from "../models/product.js";

export const createOrder = asyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount
    } = req.body;

    await Order.create({
        user: req.user._id,
        shippingInfo,
        orderItems,
        paymentMethod,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount
    });

    for (let index = 0; index < orderItems.length; index++) {
        const product = await Product.findById(orderItems[index].product);
        product.stock -= orderItems[index].quantity;
        await product.save();
    }

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });

});

export const getMyOrders = asyncError(async (req, res, next) => {

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });

});