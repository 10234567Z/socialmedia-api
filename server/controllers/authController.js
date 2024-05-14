const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { supabase, adminAuthClient } = require("../config/db");

exports.signup = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('username').custom(async (value) => {
        const { data, error } = await supabase.from('users').select('username').eq('username', value)
        if (data.length > 0) {
            return Promise.reject('Username already taken')
        }
    }),
    body('email').custom(async (value) => {
        const { data, error } = await supabase.from('users').select('email').eq('email', value)
        if (data.length > 0) {
            return Promise.reject('Email already taken')
        }
    }),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { data: authData, error: authError } = await adminAuthClient.createUser({
            email: req.body.email,
            password: req.body.password,
            email_confirm: true,
            user_metadata: { 
                name: req.body.username,
                posts: 0,
                comments: 0,
                likedposts: 0,
                likedcomments: 0,
                following: 0,
                followers: 0,
                bio: "",
                profile_pic: "",
            }
        })
        if (authError) {
            return res.status(400).json({ error: authError.message })
        }
        const { data, error } = await supabase.from('users').insert({
            uuid: authData.user.id,
            username: req.body.username,
            email: req.body.email,
        }).select()
        if (error) {
            return res.status(400).json({ error: error.message })
        }
        const { data: si_authData, error: si_authError } = await supabase.auth.signInWithPassword({
            email: req.body.email,
            password: req.body.password,
        })
        if (si_authError) {
            return res.status(400).json({ error: si_authError.message })
        }
        res.status(200).json({ supabase_user_data: si_authData})    })
]

exports.signin = asyncHandler(async (req, res) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: req.body.email,
        password: req.body.password,
    })
    if (authError) {
        return res.status(400).json({ error: authError.message })
    }
    res.status(200).json({ supabase_user_data: authData})
})


exports.signOut = asyncHandler(async (req, res) => {
    const { data, error } = await supabase.auth.signOut()
    if (error) {
        return res.status(400).json({ error: error.message })
    }
    res.status(200).json(data)
})
