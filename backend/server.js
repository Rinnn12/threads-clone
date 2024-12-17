import express, { json } from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notification.route.js";
import { v2 as cloudinary } from "cloudinary";
import { app,server } from "./socket/socket.js";

dotenv.config();

connectDB();


const PORT = process.env.PORT || 5000;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// **Increase the request size limit to handle large payloads**
app.use(express.json({ limit: "50mb" })); // Adjust "50mb" to a larger size if needed
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Adjust for form data

app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/messages", messageRoutes);

// Start the server
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));