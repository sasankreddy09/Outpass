const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Outpass = require("./models/outpass.js");
const Student = require("./models/student.js");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware & Configurations
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Connect to MongoDB
(async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/outpassDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
})();

// Routes
app.get("/warden", async (req, res) => {
    try {
        // Get today's date without time
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Midnight start
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Midnight end
        const totalOutpass=await Outpass.find({});
        // Query for today's outpasses and populate student details
        const outpasses = await Outpass.find({
            actualOutTime: { $gte: today, $lt: tomorrow }
        }).populate("idNo"); // Linking student data

        res.render("warden",{outpasses,totalOutpass});
    } catch (error) {
        console.error("Error fetching total outpasses today:", error);
        res.status(500).json({ error: "Internal server error" });
    }

    
});

app.post("/warden", async (req, res) => {
    try {
        let { idNo, name, dormNo, phoneNumber, branch, year, expectedInTime, expectedOutTime, goingPlace, causeOfOutpass } = req.body;

        console.log(idNo, name, dormNo, phoneNumber, branch, year, expectedInTime, expectedOutTime, goingPlace, causeOfOutpass);

        // Convert expectedInTime & expectedOutTime from string to Date
        expectedInTime = expectedInTime ? new Date(expectedInTime) : null;
        expectedOutTime = expectedOutTime ? new Date(expectedOutTime) : null;

        // Validate required fields
        if (!idNo || !name || !dormNo || !phoneNumber || !goingPlace || !causeOfOutpass) {
            return res.status(400).json({ error: "Missing required fields. Please fill out all fields." });
        }

        if (!expectedInTime || isNaN(expectedInTime.getTime()) || !expectedOutTime || isNaN(expectedOutTime.getTime())) {
            return res.status(400).json({ error: "Invalid date format. Please select valid Date & Time." });
        }

        // Check if Student Exists
        const student = await Student.findOne({ idNo });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if student has outpasses remaining
        if (student.outpassesRemaining <= 0) {
            return res.status(400).json({ error: "No outpasses remaining" });
        }

        // Create and Save Outpass
        const newOutpass = new Outpass({
            idNo,
            name,
            dormNo,
            phoneNumber,
            branch,
            year,
            expectedInTime,
            expectedOutTime,
            causeOfOutpass,
            goingPlace,
        });

        await newOutpass.save();

        // Reduce outpasses remaining for the student
        student.outpassesUsed += 1;
        student.outpassesRemaining -= 1;
        await student.save();

        res.status(201).json({ message: "Outpass request submitted successfully!" });
    } catch (error) {
        console.error("Error submitting outpass:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
