// Method 1=========================

// import dotenv from "dotenv"
// import connectDB from "./db/index.js";
// import { app } from "./app.js";

// dotenv.config({
//   path: '../.env'
// })

// connectDB()
// .then(() => {
//   app.listen(process.env.PORT || 3000, () => {
//     console.log(`Server is running at port : ${process.env.PORT}`);
//   })
// })
// .catch((err) => {
//   console.log("MongoDB connection failed !!!", err);
// })

// Method 2===============================
/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants"

import express from "express";
const app = express()

  (async () => {
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

      app.on("error : ", (error) => {
        console.log("ERROR", error);
        throw error
      })

      app.listen(process.env.PORT, () => {
        console.log(`App is listing on port ${process.env.PORT}`);
      })

    } catch (error) {
      console.log("ERROR : ", error);
      throw error
    }
  })()

  */

  // Method 3 ==============================

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";

dotenv.config();

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`\n ✅ Server is running at port : ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`⚠️ Port ${PORT} is already in use. Trying another port...`);
        server.listen(0, () => {
          console.log(`✅ Server started on available port: ${server.address().port}`);
        });
      } else {
        console.error("❌ Server error:", err);
      }
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();
