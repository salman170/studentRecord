const mongoose = require("mongoose")

const teacherSchema = new mongoose.Schema({
    fname: { type: String, require: true, trim: true },
    lname: { type: String, require: true, trim: true },
    email: { type: String, require: true, unique: true, trim: true },
    phone: { type: String, require: true, unique: true, trim: true },
    password: { type: String, require: true, trim: true },
},
{ timestamps: true })

module.exports = mongoose.model("Teacher", teacherSchema)
