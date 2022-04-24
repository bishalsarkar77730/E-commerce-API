const mongoose = require("mongoose");
// const user = require("./userModel")
Schema = mongoose.Schema

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter product name"],
        trim:true
    },
    description: {
        type: String,
        required: [true, "please Enter Product Description"]
    },
    price: {
        type: Number,
        required: [true, "please Enter product price"],
        maxLength: [8, "price cannot exceed 8 characters"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"please Enter Product Category"]
    },
    Stock:{
        type:Number,
        required:[true, "Please Enter Prodct Stock"],
        maxLength:[4,"Stock cannot exceed 4 characters"],
        default:1
    },
    numofReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            Comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("product", productSchema)
