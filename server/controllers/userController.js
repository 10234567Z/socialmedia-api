const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");


exports.getUser = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User Page');
})

exports.updateUser = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User update Page');
})

exports.deleteUser = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User delete Page');
})

exports.getFollowers = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User followers Page');
})

exports.getFollowing = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User following Page');
})