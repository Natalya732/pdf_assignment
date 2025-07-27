import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { SocketHandler } from "./utils/socketHandler.js";

import chatRoutes from "@routes/chat";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO
SocketHandler.getInstance(server);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI ?? "";
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully ✅");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT} `);
    console.log(`Socket.IO server initialized 🚀`);

    await connectDB();
  });
};

startServer().catch(console.error);
