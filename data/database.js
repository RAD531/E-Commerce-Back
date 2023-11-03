import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "E-Commerce",
        });
        console.log(`Server connected to database ${connection.host}`);
    }

    catch (error) {
        console.log("Some Error Occured Connecting To Database: ", error);
        process.exit(1);
    }
}