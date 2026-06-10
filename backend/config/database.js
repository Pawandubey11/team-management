const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb+srv://pawandubeycs27_db_user:awan12345@cluster0.xxxxx.mongodb.net/teamDB?retryWrites=true&w=majority",
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
