const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const studentSchema = new mongoose.Schema({
    name: { type: String, require: true, trim: true },
    uniqueId: { type: String, require: true, trim: true },
    subjectMarks: [{
        subject: { type: String, require: true, trim: true },
        marks: { type: Number, required: true, trim: true, },
        _id:false
    }],
    teacherId: { type: ObjectId, ref: "Teacher", required: true, trim: true, },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
})

module.exports = mongoose.model("Student", studentSchema)