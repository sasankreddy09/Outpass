const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const session = require("express-session");
const Outpass = require("./models/outpass.js");
const Student = require("./models/student.js");
const path = require("path");
const bcrypt=require("bcrypt");
const LocalPassport=require("passport-local");
const morgan=require("morgan");
const user=require("./models/User.js");
const mongoSanitize = require("express-mongo-sanitize");
const app = express();
const PORT = 3000;
const passport=require("passport");
// Middleware & Configurations
app.use(morgan("combined"));
app.use(mongoSanitize());
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req,res,next)=>{
    res.locals.currUser=req.user;
    if(req.user){
    res.locals.role=req.user.role;
    }
    next();
  })
app.set("view engine", "ejs");
// Session Middleware
app.use(
    session({
        secret: "sasank",
        saveUninitialized: true,
        resave: false,
        cookie: {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ✅ Corrected: Use new Date()
          maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ No issues here
          httpOnly: true, // ✅ Good for security
        } // ✅ Closing bracket correctly placed
    })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalPassport(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
const deletePendingOutpasses = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // End of today

        // Delete outpasses where expectedOutTime is today and actualOutTime is still null
        const result = await Outpass.deleteMany({ 
            expectedOutTime: { $gte: today, $lt: tomorrow }, 
            actualOutTime: null 
        });

        console.log(`Deleted ${result.deletedCount} pending outpasses that expired today.`);
    } catch (error) {
        console.error("Error deleting expired outpasses:", error);
    }
};

// Schedule the function to run every day at midnight (12:00 AM)
cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled cleanup of pending outpasses...");
    await deletePendingOutpasses();
});

// Authentication Middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Role-based Authorization Middleware
const authorizeRole = (role) => {
    return (req, res, next) => {
      if (!req.user || req.user.role != role) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
      next();
    };
  };

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
app.get("/warden/data", requireAuth, authorizeRole("Warden"), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const students = await Student.find({});
        const totalOutpass = await Outpass.find({});
        const todayOutpasses = await Outpass.find({
            expectedOutTime: { $gte: today, $lt: tomorrow }
        }).populate("idNo");
        res.json({ totalOutpass, todayOutpasses, students });
    } catch (error) {
        console.error("Error fetching outpasses:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/warden", requireAuth, authorizeRole("Warden"), (req, res) => {
    res.render("warden");
});

app.post("/warden", requireAuth, authorizeRole("Warden"), async (req, res) => {
    try {
        let { idNo, name, dormNo, phoneNumber, branch, year, expectedInTime, expectedOutTime, goingPlace, causeOfOutpass } = req.body;

        expectedInTime = new Date();
        expectedOutTime = new Date();

        if (!idNo || !name || !dormNo || !phoneNumber || !goingPlace || !causeOfOutpass) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const student = await Student.findOne({ idNo });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        if (student.outpassesRemaining <= 0) {
            return res.status(400).json({ error: "No outpasses remaining" });
        }

        const newOutpass = new Outpass({
            idNo, name, dormNo, phoneNumber, branch, year, expectedInTime, expectedOutTime, causeOfOutpass, goingPlace,
        });

        await newOutpass.save();
        res.status(201).json({ message: "Outpass request submitted successfully!" });
    } catch (error) {
        console.error("Error submitting outpass:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/security/data", requireAuth, authorizeRole("Security"), async (req, res) => {
    const checkOut = await Outpass.find({ actualOutTime: null });
    const checkIn = await Outpass.find({ actualOutTime: { $ne: null }, actualInTime: null });
    res.json({ checkIn, checkOut });
});
app.post('/wardens', authorizeRole("Admin"), async (req, res) => {
    const { username, password } = req.body;

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    const newWarden = new user({ username,role:"Warden" });
    await user.register(newWarden, password);
    await newWarden.save();
    res.status(201).json({ message: "Warden added successfully" });
});
app.post('/remove-warden', authorizeRole("Admin"),async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Warden name is required' });
        }
        const deletedWarden = await user.findOneAndDelete({ username: new RegExp(`^${name}$`, 'i'),role: "Warden" });

        if (!deletedWarden) {
            return res.status(404).json({ message: `Warden '${name}' not found` });
        }

        res.json({ message: `Warden '${name}' removed successfully`, deletedWarden });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
app.post('/security', authorizeRole("Admin"), async (req, res) => {
    const { username, password } = req.body;

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    const newWarden = new user({ username,role:"Security" });
    await user.register(newWarden, password);
    await newWarden.save();
    res.status(201).json({ message: "security added successfully" });
});
app.post('/remove-security',authorizeRole("Admin"), async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'security name is required' });
        }
        const deletesecurity = await user.findOneAndDelete({ username: new RegExp(`^${name}$`, 'i'),role: "Security" });

        if (!deletesecurity) {
            return res.status(404).json({ message: `security '${name}' not found` });
        }

        res.json({ message: `security '${name}' removed successfully`, deletesecurity });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
app.post('/admin/update', authorizeRole("Admin"), async (req, res) => {
    try {
        const { currentUsername, newUsername, newPassword } = req.body;

        const admin = await user.findOne({ role: "Admin", username: currentUsername });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        if (newUsername) {
            admin.username = newUsername;
        }

        if (newPassword) {
            await admin.setPassword(newPassword); // This securely updates the password using Passport
        }

        await admin.save();

        res.status(200).json({ message: "Admin details updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post("/security/Outpasses/:id/check-out", requireAuth, authorizeRole("Security"), async (req, res) => {
    const { id } = req.params;
    try {
        const outpass = await Outpass.findById(id);
        if (!outpass) return res.status(404).json({ error: "Outpass not found" });
        const student = await Student.findOne({ idNo: outpass.idNo });
        if (!student) return res.status(404).json({ error: "Student not found" });
        outpass.actualOutTime = new Date();
        if (student.outpassesRemaining > 0) {
            student.outpassesRemaining -= 1;
        }
        if (!student.outpassHistory) {
            student.outpassHistory = []; // Initialize if not present
        }
        student.outpassHistory.push(outpass._id);
        await outpass.save();
        await student.save();
        res.json({ message: "Check-out successful!", outpass, remainingOutpasses: student.outpassesRemaining });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/security/outpasses/:id/check-in", requireAuth, authorizeRole("Security"), async (req, res) => {
    const { id } = req.params;
    try {
        const outpass = await Outpass.findById(id);
        if (!outpass) return res.status(404).json({ error: "Outpass not found" });
        outpass.actualInTime = new Date();
        await outpass.save();
        res.json({ message: "Check-in successful!", outpass });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Role-based Views
app.get("/security", requireAuth, authorizeRole("Security"), (req, res) => {
    res.render("security");
});

app.get("/admin", requireAuth, authorizeRole("Admin"), (req, res) => {
    res.render("admin");
});
app.get("/login",(req,res)=>{
        if (req.user) {
            return res.redirect(`/${req.user.role.toLowerCase()}`);  // Redirect to dashboard if already logged in
        }
        res.render("login");  // Show login page only if user is not logged in
})
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
}), (req, res) => {
    res.redirect(`/${req.user.role.toLowerCase()}`); // Redirect to a dashboard or home page after login
});
app.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.redirect("/login"); // Redirect to login page after logout
    });    
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
app.listen(8080, () => console.log(`Server running on http://localhost:8080`));