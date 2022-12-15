const express = require("express")
const route = require("./routes/route")
const app = express();
const mongoose = require("mongoose")

app.use(express.json());
mongoose.connect("mongodb+srv://Salman:g0Yrkp0tTQ2sVPBP@cluster0.eekagxa.mongodb.net/student-Marks").then(()=>console.log("MongoDb is connected")).catch(err=>console.log(err))

app.use('/',route);

app.use("/*", function (req, res) {
    return res.status(400).send({ status: false, message: "invalid request params (path not found)" })
});

app.listen((process.env.PORT || 3000), function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
