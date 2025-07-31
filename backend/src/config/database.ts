import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const dbUrl: string = process.env.DB_CONN_STRING as string;

const connectToDatabase = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to the db");
    } catch (err) {
        console.error("Failed to connect to the db", err);
        throw err; // Re-throw to prevent server startup with no DB
    }
};

export default connectToDatabase;