const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "please Enter Your name"],
        maxlength:[30, "name cannot exeed 30 letters"],
        minlength:[4, "name schould have more than 4 character"]
    },
    email:{
        type: String,
        required: [true, "please Enter your Email"],
        unique: true,
        validate: [validator.isEmail, "please Enter a valid Email"]
    },
    password:{
        type: String,
        required: [true, "please Enter Your password"],
        minlength: [8, "password Should be greater than 8 characters"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role:{
        type: String,
        default: "user"
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password,12);
});

// JWT TOKEN
userSchema.methods.getJWTTOKEN = function (){
    return JWT.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
};

//Compare Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};


//generating password reset token
userSchema.methods.getResetPasswordToken = function() {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and adding resetPasswordToken to UserSchema
    this.resetPasswordToken = crypto.createHash("sha256") // sha256 it is a  algorithm for crypto for more info goole
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken
};

module.exports = mongoose.model("user", userSchema);
