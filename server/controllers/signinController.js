const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");


exports.getSignin = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: Signin Page');
})