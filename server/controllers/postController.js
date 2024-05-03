const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");


exports.getPost = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: Post Page');
})

exports.createPost = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: Post create Page');
})

exports.updatePost = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: Post update Page');
})

exports.deletePost = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: Post delete Page');
})