const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.getHome = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: Home Page');
})