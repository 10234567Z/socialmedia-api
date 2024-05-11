const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const supabase = require("../config/db");

exports.getHome = asyncHandler(async (req, res) => {
    // const posts = await supabase.from('posts').select('*')
    res.json({ message: "Welcome to the home page" })
})