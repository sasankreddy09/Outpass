const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String }, // Handled by passport-local-mongoose
    role: { type: String, enum: ["Security", "Warden", "Admin"], required: true }
});

// Plugin to handle hashing & authentication
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
