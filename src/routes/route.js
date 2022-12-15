const express = require("express")
const router = express.Router()
const { register, teacherLogin } = require("../controller/teacherController")
const { createStudent, getStudent, updateStudent, deleteStudent } = require("../controller/studentController")
const { authentication } = require("../middleware/auth")

//-------------------------Api's------------------------------
router.post("/register", register)
router.post("/login", teacherLogin)
router.post("/createstudent", authentication, createStudent)
router.get("/getstudent", authentication, getStudent)
router.put("/updatestudent/:uniqueId", authentication, updateStudent);
router.delete("/deletestudent/:uniqueId", authentication, deleteStudent)


module.exports = router;