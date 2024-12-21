
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config(
    {
        path : "./env"
    }
);


connectDB();


/*
import express from "express";
const app = express();

;( async () => {
    try {
        mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error connecting to database");
            throw error;
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error(error);
        throw error;
    }
}) () */
// The code snippet above is a refactored version of the code snippet in src/db/index.js.