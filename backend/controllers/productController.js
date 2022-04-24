const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");



//create Product -- Admin
exports.createProduct = catchAsyncErrors(
    async (req, res, next) => {
        
        req.body.user = req.user.id
        
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        });
    });

// Get all product
exports.getAllProducts = catchAsyncErrors(

    async (req, res) => {
        const resultPerPage = 5;
        const productCount = await Product.countDocuments();
        const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
        const products = await apiFeature.query;
        res.status(200).json({
            success: true,
            products
        });
    }
);

//get product details

exports.getProductDetails = catchAsyncErrors(
    async (req, res, next) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHander("product not found", 404))
        }
        res.status(200).json({
            success: true,
            product,
            productCount
        });
    }
);

//update product --admin

exports.updateProduct = catchAsyncErrors(
    async (req, res, next) => {
        let product = Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHander("product not found", 404))
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            product
        });
    }
);

// Delete Product -- Admin

exports.deleteProduct = catchAsyncErrors(
    async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHander("product not found", 404))
        }
        await product.remove();
        res.status(200).json({
            success: true,
            message: "Product Deleted Successfully"
        });
    }
);

// Create New Review or Update the review
exports.CreateProductReview = catchAsyncErrors(async (req, res, next) =>{
    const {rating, comment, productId} = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };
    const product = await Product.findById(productId);

    //Await likhna par sakta ha
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString());
    if(isReviewed){
        product.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment);
        });
    }
    else{
        product.reviews.push(review)
    }

    // Rating average
    let avg = 0;
    product.ratings = product.reviews.forEach(rev => {
        avg+=rev.ratimg
    })
    
    product.ratings = avg
    /product.reviews.length;

    await product.save({ validateBeforesave:false });

    res.status(200).json({
        success: true
    });

});

// Get all reviews of a single Product

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHander("product not foud", 404));
    }

    res.status(200).json({
        success : true,
        reviews : product.reviews,
    });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if(!product) {
        return next(new ErrorHander("product not found", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews,
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        succcess: true,
        message: `review deleted Successfully`
    });
});
