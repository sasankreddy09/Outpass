const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    idNo: { type: String, required: true },          // Student ID
    name: { type: String, required: true },
    dormNo:{type:String, required:true},         // Student Name
    branch: { type: String, required: true },       // Branch
    year: { type: Number, required: true },         // Year
    expectedOutTime: { type: Date,default:new Date(), required: true }, // Expected Out-time
    expectedInTime: { type: Date, default:new Date(),required: true },  // Expected In-time
    causeOfOutpass: { type: String, required: true }, // Reason for Outpass
    phoneNumber: { type: String, required: true },   // Phone Number
    goingPlace: { type: String, required: true },    // Destination
    actualOutTime: { type: Date },                   // Actual Out-time
    actualInTime: { type: Date }                     // Actual In-time
});

module.exports = mongoose.model("Outpass", studentSchema);
