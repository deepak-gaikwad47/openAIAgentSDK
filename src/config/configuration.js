import dotenv from 'dotenv';
dotenv.config();

export const configuration = Object.freeze({
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/users',
})