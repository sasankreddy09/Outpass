const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    idNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: Number, required: true },
    dormNo: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    totalOutpassesAllowed: { type: Number, default: 10 },
    outpassesUsed: { type: Number, default: 0 }
});

// ✅ Prevent model overwriting issue
const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

module.exports = Student;
