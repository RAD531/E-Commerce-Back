import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { cookieOptions, getDataUri, sendEmail, sendToken } from "../utils/features.js";
import cloudinary from "cloudinary";

export const login = asyncError(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Incorrect Email or Password", 400));

    if (!password) return next(new ErrorHandler("Please Enter Password", 400));

    // Handle error
    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
        return next(new ErrorHandler("Incorrect Email or Password", 400));
    }

    sendToken(user, res, `Welcome Back, ${user.name}`, 200);
});

export const register = asyncError(async (req, res, next) => {
    const { name, email, password, address, city, country, pinCode } = req.body;

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User Already Exist", 400));

    let avatar = undefined;

    if (req.file) {

        // req.file
        const file = getDataUri(req.file);

        // Add Cloudinary here
        const myCloud = await cloudinary.v2.uploader.upload(file.content, {
            folder: `E-Commerce/users/${email}/`,
        });

        avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }

    user = await User.create({
        avatar,
        name,
        email,
        password,
        address,
        city,
        country,
        pinCode,
    });

    sendToken(user, res, "Registered Successfully", 201);
});

export const getMyProfile = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        succes: true,
        user,
    })
});

export const updateProfile = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const { name, email, address, city, country, pinCode } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (pinCode) user.pinCode = pinCode;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
    });
});

export const updatePic = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    // req.file
    const file = getDataUri(req.file);

    // destroy cloudinary avatar picture first
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    // now upload new image
    const myCloud = await cloudinary.v2.uploader.upload(file.content, {
        folder: `E-Commerce/users/${user.email}/`,
    });

    // update user avatar details from cloudinary
    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
    }

    await user.save();

    res.status(200).json({
        succes: true,
        message: "Avatar Updated Successfully",
    })
});

export const changePassword = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) return next(new ErrorHandler("Please Provide Old and New Password", 400));

    const isMatched = await user.comparePassword(oldPassword);

    if (!isMatched) return next(new ErrorHandler("Incorrect Old Password", 400));

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
    });
});

export const logOut = asyncError(async (req, res, next) => {
    res.status(200)
        .cookie("token", "", {
            ...cookieOptions,
            expires: new Date(Date.now()),
        }).json({
            succes: true,
            message: "Logged Out Successfully",
        });
});

export const forgetPassword = asyncError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("Incorrect Email Entered", 404));

    // max, min 2000, 10000
    const randomNumber = Math.random() * (999999 - 100000) + 100000;
    const OTP = Math.floor(randomNumber);
    // 15 mins expiry
    const OTP_Expire = 15 * 60 * 1000;

    user.otp = OTP;
    user.otp_expire = new Date(Date.now() + OTP_Expire);

    await user.save();

    // Send OTP Email
    const message = `Your OTP for Resetting Password is ${OTP}.\n Please ignore if you haven't requested this`;
    try {
        sendEmail("OTP for Resetting Password", user.email, message);
    }
    catch (error) {
        user.otp = null;
        user.otp_expire = null;
        await user.save();
        return next(error);
    }

    res.status(200).json({
        succes: true,
        message: `Email Sent to ${user.email} `,
    })
});

export const resetPassword = asyncError(async (req, res, next) => {
    const { otp, password } = req.body;
    const user = await User.findOne({
        otp,
        otp_expire: {
            $gt: Date.now()
        }
    });

    if (!user) return next(new ErrorHandler("Incorrect OTP or has been expired", 400));
    if (!password) return next(new ErrorHandler("Please Enter New Password", 400));

    user.password = password;
    user.otp = undefined;
    user.otp_expire = undefined;

    await user.save();

    res.status(200).json({
        succes: true,
        message: "Password Changed Successfully, You can now login",
    })
});