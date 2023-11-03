import { asyncError } from "../middlewares/error.js";
import { User } from "../modules/user.js";
import ErrorHandler from "../utils/error.js";

export const login = asyncError(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Incorrect Email or Password", 400));
    }

    // Handle error
    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
        return res.status(400).json({ success: false, message: "Incorrect Email or Password" });
    }

    res.send(200).json({
        success: true,
        message: `Welcome Back, ${user.name}`,
    });
});

export const register = asyncError(async (req, res, next) => {
    const { name, email, password, address, city, country, pinCode } = req.body;

    // Add Cloudinary here

    await User.create({
        name,
        email,
        password,
        address,
        city,
        country,
        pinCode,
    });

    res.status(201).json({
        success: true,
        message: "Registered Successfully"
    })
});