const mongoose = require("mongoose");

async function connectDB() {
  mongoose.connection.on("disconnected", () =>
    console.warn("MongoDB отключена"),
  );

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = connectDB;
