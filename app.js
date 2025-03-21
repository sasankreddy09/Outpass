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
app.get("/warden/data", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const students=await Student.find({});
        const totalOutpass = await Outpass.find({});
        const todayOutpasses = await Outpass.find({
            expectedOutTime: { $gte: today, $lt: tomorrow }
        }).populate("idNo");
        console.log(todayOutpasses);
        res.json({ totalOutpass, todayOutpasses,students });
    } catch (error) {
        console.error("Error fetching outpasses:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/warden", async (req, res) => {

        res.render("warden");
})

app.post("/warden", async (req, res) => {
    try {
        let { idNo, name, dormNo, phoneNumber, branch, year, expectedInTime, expectedOutTime, goingPlace, causeOfOutpass } = req.body;

        console.log(idNo, name, dormNo, phoneNumber, branch, year, expectedInTime, expectedOutTime, goingPlace, causeOfOutpass);

        // Convert expectedInTime & expectedOutTime from string to Date
        expectedInTime = new Date();
        expectedOutTime =new Date();

        // Validate required fields
        if (!idNo || !name || !dormNo || !phoneNumber || !goingPlace || !causeOfOutpass) {
            return res.status(400).json({ error: "Missing required fields. Please fill out all fields." });
        }

        // if (!expectedInTime || isNaN(expectedInTime.getTime()) || !expectedOutTime || isNaN(expectedOutTime.getTime())) {
        //     return res.status(400).json({ error: "Invalid date format. Please select valid Date & Time." });
        // }

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

        res.status(201).json({ message: "Outpass request submitted successfully!" });
    } catch (error) {
        console.error("Error submitting outpass:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/security/data",async (req,res)=>{
    const checkOut=await Outpass.find({actualOutTime:null});
    const checkIn=await Outpass.find({actualOutTime:{$ne:null},actualInTime:null});
    res.json({ checkIn,checkOut});
})
app.post("/security/Outpasses/:id/check-out",async (req,res)=>{
    const {id}=req.params;
    try {
        const outpass = await Outpass.findById(id);
        if (!outpass) return res.status(404).json({ error: "Outpass not found" });

        outpass.actualOutTime = new Date(); // Set check-out time
        await outpass.save();

        res.json({ message: "Check-out successful!", outpass });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
})
app.post("/security/outpasses/:id/check-in", async (req, res) => {
    const { id } = req.params;
    try {
        const outpass = await Outpass.findById(id);
        if (!outpass) return res.status(404).json({ error: "Outpass not found" });

        outpass.actualInTime = new Date(); // Set check-in time
        await outpass.save();

        res.json({ message: "Check-in successful!", outpass });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/security",(req,res)=>{
    res.render("security");
})
app.get("/admin",(req,res)=>{
    res.render("admin");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/logout",(req,res)=>{
    res.send("First Login Then we talk about logout")
})
// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
