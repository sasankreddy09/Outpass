const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    isAdmin: { type: Boolean, default: false },
    isWarden: { type: Boolean, default: false },
    isSecurity: { type: Boolean, default: false }
});

// Create User Model
const User = mongoose.model("User", userSchema);

module.exports = User;

