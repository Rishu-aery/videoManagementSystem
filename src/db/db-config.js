import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb = async () => {
    try {
        const mongoUri = `${process.env.MONGODB_URI}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(mongoUri);
        console.log("MongoDb Instance Connected: DB host: ", connectionInstance.connection.host );
    } catch (error) {
        console.log("MongoDB Connection Failed: ", error);
        process.exit(1);
    }
}

export default connectDb;