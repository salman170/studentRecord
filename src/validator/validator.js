const mongoose = require("mongoose");


const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null)  return false 
    if (typeof (value) === "string" && value.trim().length == 0)  return false 
    if (typeof (value) === "number" && value.toString().trim().length == 0)  return false 
    if (typeof (value) === "object" && Object.keys(value).length == 0)  return false 
    return true
}

const isValidName = function (value) {
    return /^[a-zA-Z ]{2,30}$/.test(value)
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};


const isRightFormatemail = function (email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

const isRightFormatmobile = function (phone) {
    return /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone);
}


const isValidPassword = function (pass) {
    if (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(pass)) return true
}

const alphaNumericValid = (value) => {
    let alphaRegex = /^[a-zA-Z0-9-_ ]+$/;
    if (alphaRegex.test(value)) return true; // /^[- a-zA-Z'\.,][^/]{1,150}/ allows every things
  }



module.exports = { isValid, isValidRequestBody, isRightFormatemail, isRightFormatmobile, isValidName, isValidPassword, alphaNumericValid };
