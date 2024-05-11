const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { supabase, adminAuthClient } = require("../config/db");

exports.signup = asyncHandler(async (req, res) => {
    const { data: authData, error: authError } = await adminAuthClient.createUser({
        email: req.body.email,
        password: req.body.password,
        email_confirm: true,
        user_metadata: { name: req.body.username}
    })
    res.json(authData)
    if (authError) {
        res.json(authError)
    }
    const { data: userData, error: insError } = await supabase.from('users').insert({
        username: authData.user_metadata.name,
        email: authData.email,
        i_at: ((new Date()).toISOString()).toLocaleString('en-US')
    }).select()
    if (insError) {
        res.json(insError)
    }
    res.json(userData)
})

exports.signin = asyncHandler(async (req, res) => {
    const { data, erro } = await supabase.auth.signInWithPassword({
        email: req.body.email,
        password: req.body.password
    })
    res.json(data.user.email)
})

exports.signOut = asyncHandler(async (req, res) => {
    const { data, error } = await supabase.auth.signOut()
    res.json(data)
})
