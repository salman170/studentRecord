const studentModel = require("../models/studentModel")
const { isValid, isValidRequestBody, isValidName, alphaNumericValid } = require("../validator/validator")


const createStudent = async (req, res) => {
    try {
        if (!req.teacherId) return res.status(403).send({ status: false, message: "Unauthorized access!" });

        let data = req.body

        if (!isValidRequestBody(data)) { return res.status(400).send({ status: false, message: 'No data provided for user' }) }

        let { name, subject, marks, uniqueId } = data

        if (!name || !isValid(name)) { return res.status(400).send({ status: false, message: "Student Name is required" }) }

        if (!isValidName(name)) return res.status(400).send({ status: false, message: "Enter valid Student Name" });

        if (!subject || typeof subject !== "string") { return res.status(400).send({ status: false, message: "Subject is required in string format" }) }

        if (!alphaNumericValid(subject)) return res.status(400).send({ status: false, message: "Enter valid Subject Name" });

        if (!marks || !isValid(marks)) return res.status(400).send({ status: false, message: "Marks is required" })

        if (typeof marks !== "number") return res.status(400).send({ status: false, message: "Marks will be in number" })

        if (!uniqueId || typeof uniqueId !== "string") { return res.status(400).send({ status: false, message: "uniqueId is required in string format" }) }

        if (!alphaNumericValid(uniqueId)) return res.status(400).send({ status: false, message: "Enter valid uniqueId" });

        let isUnique = await studentModel.findOne({ uniqueId: uniqueId, teacherId: req.teacherId })

        // adding new students
        if (!isUnique) {
            isUnique = new studentModel({
                name: name,
                uniqueId: uniqueId,
                subjectMarks: [{
                    subject: subject,
                    marks: Math.round(marks)
                }],
                teacherId: req.teacherId,
            })

            const studentAdded = await (await isUnique.save()).populate({
                path: 'teacherId', select: { _id: 0, 'fname': 1 }
            })

            return res.status(201).send({ status: true, message: "Student added successfully", data: studentAdded })
        } else {
            //updating marks
            for (let i = 0; i < isUnique.subjectMarks.length; i++) {
                let sub = isUnique.subjectMarks[i]
                if (sub.subject === subject) {
                    sub.marks += Math.round(marks)
                    const studentAdded = await isUnique.save()
                    const resData = await studentAdded.populate({
                        path: 'teacherId', select: { _id: 0, 'fname': 1 }
                    })
                    return res.status(200).send({ status: true, message: "Marks updated successfully", data: resData })
                }
            }
            //pushing new subject
            const pushSub = await studentModel.findOneAndUpdate({ uniqueId: uniqueId, teacherId: req.teacherId, isDeleted: false }, {
                $push: { "subjectMarks": { subject: subject, marks: Math.round(marks) } },
            }, { new: true }).populate({
                path: 'teacherId', select: { _id: 0, 'fname': 1 }
            })
            return res.status(200).send({ status: true, message: "subject added successfully", data: pushSub })
        }
    }
    catch (error) {
        console.log(error.message)
        res.status(500).send({ status: false, message: error.message })
    }
}

const getStudent = async function (req, res) {

    try {
        if (!req.teacherId) return res.status(403).send({ status: false, message: "Unauthorized access!" });

        let queries = req.query

        if (Object.keys(queries).length == 0) {
            const studentsData = await studentModel.find({ teacherId: req.teacherId, isDeleted: false }).select({ isDeleted: 0, deletedAt: 0, __v: 0, teacherId: 0, _id: 0 })

            console.log(studentsData)

            if (studentsData.length === 0) return res.status(404).send({ status: false, message: `No student data found. Add new student.` })

            return res.status(200).send({ status: true, message: "Success", data: studentsData })
        }

        const { name, subject, marks, ...rest } = req.query

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `You can not get for these:-( ${Object.keys(rest)} ) data ` })

        const filter = { teacherId: req.teacherId, isDeleted: false }

        if (name) {
            if (name == undefined || name.trim() == "") {
                return res.status(404).send({ status: false, message: "please give value of name" })
            }
            filter.name = name.trim()
        }

        if (subject && marks) {
            if (subject == undefined || subject.trim() == "") {
                return res.status(404).send({ status: false, message: "please give value of subject" })
            }
            if (marks == undefined || marks.trim() == "") {
                return res.status(404).send({ status: false, message: "please give value of marks" })
            }
            filter.subjectMarks = { $elemMatch: { subject: subject, marks: JSON.parse(marks) } }
        } else {
            if (subject) {
                if (subject == undefined || subject.trim() == "") {
                    return res.status(404).send({ status: false, message: "please give value of subject" })
                }
                filter.subjectMarks = { $elemMatch: { subject: subject } }
            }

            if (marks) {
                if (marks == undefined || marks.trim() == "") {
                    return res.status(404).send({ status: false, message: "please give value of marks" })
                }
                filter.subjectMarks = { $elemMatch: { marks: JSON.parse(marks) } }
            }
        }

        const studentsData = await studentModel.find(filter).select({ isDeleted: 0, deletedAt: 0, __v: 0, teacherId: 0, _id: 0 })

        if (studentsData.length === 0) return res.status(404).send({ status: false, message: `No student data found for this filter.` })

        return res.status(200).send({ status: true, message: "Success", data: studentsData })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}

const updateStudent = async (req, res) => {
    try {

        let uniqueId = req.params.uniqueId

        let student = await studentModel.findOne({ uniqueId: uniqueId, isDeleted: false })

        if (!student) return res.status(404).send({ status: false, message: "No student data found." })
        console.log(student.teacherId, req.teacherId)

        if (student.teacherId.toString() !== req.teacherId) return res.status(403).send({ status: false, message: "Unauthorized access!" });

        let data = req.body

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please enter require data to update student details." })

        const { name, subject, marks, ...rest } = data

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `You can not update these:-( ${Object.keys(rest)} ) data ` })

        if (name) {
            if (name == undefined || name.trim() == "") return res.status(404).send({ status: false, message: "please give value of filter" })
            if (typeof (name) !== "string") return res.status(400).send({ status: false, message: "name will be in string format only" })
        }

        const studentD = await studentModel.findOneAndUpdate({ uniqueId: uniqueId, teacherId: req.teacherId, isDeleted: false }, {
            $pull: { "subjectMarks": { subject: data.subject } },
            name: name,
        }, { new: true }).populate({
            path: 'teacherId', select: { _id: 0, 'fname': 1 }
        })

        if (!studentD) return res.status(404).send({ status: false, message: "no student found" })

        return res.status(200).send({ status: true, message: "updated successfully", data: studentD })

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ status: false, message: error.message })
    }
}

const deleteStudent = async (req, res) => {
    try {
        let uniqueId = req.params.uniqueId

        let student = await studentModel.findOne({ uniqueId: uniqueId, isDeleted: false })

        if (!student) return res.status(404).send({ status: false, message: "No student data found." })
        console.log(student.teacherId, req.teacherId)

        if (student.teacherId.toString() !== req.teacherId) return res.status(403).send({ status: false, message: "Unauthorized access!" });

        await studentModel.findOneAndUpdate({ uniqueId: uniqueId},
            { $set: { isDeleted: true, deletedAt: new Date() } })

        res.status(200).send({ status: true, message: "Student data is successfully deleted" })

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createStudent, getStudent, updateStudent, deleteStudent }

