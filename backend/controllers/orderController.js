const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");

//create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});

//get Single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
    if(!order){
        return next(new ErrorHander("order not Found with this Id", 404));
    }
    res.status(200).json({
        success: true,
        order,
    });
});

//get logged in user order
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({user: req.user._id});
    if (!orders) {
        return next(new ErrorHander("you dont have any Order", 404));
    }
    res.status(200).json({
        success: true,
        orders,
    });
});

//get All order  --Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    if (!orders) {
        return next(new ErrorHander("doesnt have any Order Yet", 404));
    }
    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});

//update Order Status  --Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === "Delivered") {
        return next(new ErrorHander("you have already delivered this Order", 400));
    }

    order.orderItems.forEach(async (o) =>{
        await UpdateStock(o.Product,o.quantity);
    });

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});

async function UpdateStock (id, quantity){
    const product = await Product.findById(id);
    product.Stock -= quantity;
    await product.save({validateBeforeSave: false})
}

//Delete order  --Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHander("doesnt have any Order Yet", 404));
    }

    await order.remove

    res.status(200).json({
        success: true,
        message:`order Deleted Successfully`
    });
});