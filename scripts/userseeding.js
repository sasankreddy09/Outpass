const mongoose = require("mongoose");
const User = require("../models/User");

mongoose.connect("mongodb://localhost:27017/outpassDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const users = [
    { username: "Security", role: "Security" },
    { username: "Warden", role: "Warden" },
    { username: "Admin", role: "Admin" }
];

async function seedUsers() {
    try {
        await User.deleteMany({}); // Clear existing users

        for (const user of users) {
            const newUser = new User({ username: user.username, role: user.role });
            await User.register(newUser, "password123"); // Default password for all users
            console.log(`Created user: ${user.username} - Role: ${user.role}`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding users:", error);
    }
}

seedUsers();
