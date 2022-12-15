const teacherModel = require("../models/teacherModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { isValid, isValidRequestBody, isRightFormatemail, isRightFormatmobile, isValidName, isValidPassword } = require("../validator/validator")



const register = async (req, res) => {
    try{
        let data = req.body

        if (!isValidRequestBody(data)) { return res.status(400).send({ status: false, message: 'No data provided for user' }) }

        let { fname, lname, email, phone, password } = data

        if (!fname || !isValid(fname)) { return res.status(400).send({ status: false, message: "First Name is required" }) }

        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Enter valid First Name" });

        if (!lname || !isValid(lname)) { return res.status(400).send({ status: false, message: "Last name is required" }) }

        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Enter valid Last name" });

        if (!email || !isValid(email)) { return res.status(400).send({ status: false, message: "Email is required" }) }

        if (!isRightFormatemail(email)) { return res.status(400).send({ status: false, message: "Please provide a valid email" }) }

        if (await teacherModel.findOne({ email: email })) { return res.status(400).send({ status: false, message: `User already exist with this ${email}` }) }

        if (!phone || !isValid(phone)) { return res.status(400).send({ status: false, message: "Phone number is required" }) }

        if (!isRightFormatmobile(phone)) { return res.status(400).send({ status: false, message: "Please provide a valid Indian phone number" }) }

        if (await teacherModel.findOne({ phone: phone })) { return res.status(400).send({ status: false, message: `User already exist with this ${phone}.` }) }

        if (!password || !isValid(password)) { return res.status(400).send({ status: false, message: "Password is required" }) }

        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is not in correct format(length should be from 8-15)" })

        const saltRounds = 10;
        hash = await bcrypt.hash(password, saltRounds);
        data.password = hash;

        const newUser = await teacherModel.create(data);

        return res.status(201).send({ status: true, message: 'success', data: newUser })
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({status:false, message :err.message})
    }
}

const teacherLogin = async function (req, res) {
    try {

        let data = req.body;
        if (!isValidRequestBody(data)) { return res.status(400).send({ status: false, message: 'No credential provided for login' }) }
        let { email, password } = req.body

        if (!email || !isValid(email)) { return res.status(400).send({ status: false, message: 'EMAIL is required' }) }

        if (!isRightFormatemail(email)) { return res.status(400).send({ status: false, message: 'Please provide a valid email' }) }

        if (!password) { return res.status(400).send({ status: false, message: 'Password is required' }) }

        if (password.trim().length < 8 || password.trim().length > 15) { return res.status(400).send({ status: false, message: 'Password should be of minimum 8 characters & maximum 15 characters' }) }

        const mailMatch = await teacherModel.findOne({ email: email }).select({ _id: 1, password: 1 })
        if (!mailMatch) return res.status(400).send({ status: false, message: `No data found with this ${email} email.` })

        const teacherId = mailMatch._id;
        checkPassword = mailMatch.password;

        const passMatch = await bcrypt.compare(password, checkPassword)

        if (!mailMatch || !passMatch) return res.status(400).send({ status: false, message: "Password is incorrect." })

        const token = jwt.sign({
            teacherId : teacherId.toString(), iat: new Date().getTime() / 1000,
        }, "FunctionUp Group No 26", { expiresIn: "2h" });

        res.setHeader("authorization", "token");
        return res.status(200).send({ status: true, message: "You have successfully logged in", data: { teacherId: teacherId, token: token } })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}



module.exports = {register,teacherLogin}