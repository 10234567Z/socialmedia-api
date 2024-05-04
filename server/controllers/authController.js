const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const supabase = require("../config/db");

exports.signup = asyncHandler(async (req, res) => {
    const {data , error} = await supabase.auth.signUp({
        email: req.body.email,
        password: req.body.password
    })
    res.json(data)
})

exports.signin = asyncHandler(async (req, res) => {
    const { data , erro } = await supabase.auth.signInWithPassword({
        email: req.body.email,
        password: req.body.password
    })
    res.json(data)
})

exports.signOut = asyncHandler(async (req, res) => {
    const { data , error } = await supabase.auth.signOut()
    res.json(data)
})

exports.signinGoogle = asyncHandler(async (req, res) => {
    const { data , error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
    })
    res.json(data)
})