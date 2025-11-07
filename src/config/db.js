import mongoose from "mongoose";
import dotenv from "dotenv";
import { configuration } from "./configuration.js";
dotenv.config();

export const connectDB = async () => {
    await mongoose
    .connect(configuration.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));    
};
