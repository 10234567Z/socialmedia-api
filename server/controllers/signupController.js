const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.getSignup = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: Signup Page');
})