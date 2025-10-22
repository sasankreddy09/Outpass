const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    idNo: { type: String, required: true },          // Student ID
    name: { type: String, required: true },          // Student Name
    dormNo: { type: String, required: true },        // Dorm Number
    branch: { type: String, required: true },        // Branch
    year: { type: Number, required: true },          // Year
    expectedOutTime: { type: Date, default: () => new Date() }, // Expected Out-time
    expectedInTime: { type: Date, required:true },  // Expected In-time
    causeOfOutpass: { type: String, required: true }, // Reason for Outpass
    phoneNumber: { type: String, required: true },   // Phone Number
    goingPlace: { type: String, required: true },    // Destination
    actualOutTime: { type: Date, default: null },    // Actual Out-time
    actualInTime: { type: Date, default: null }      // Actual In-time
});
module.exports = mongoose.model("Outpass", studentSchema);
