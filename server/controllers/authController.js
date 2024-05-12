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
            user_metadata: { name: req.body.username }
        })
        if (authError) {
            return res.status(400).json({ error: authError.message })
        }
        const { data, error } = await supabase.from('users').insert({
            username: req.body.username,
            email: req.body.email,
            i_at: ((new Date()).toISOString()).toLocaleString('en-US')
        }).select()
        if (error) {
            return res.status(400).json({ error: error.message })
        }
        res.json({ supabase_user_data: authData, user_data: data })
    })
]

exports.signin = asyncHandler(async (req, res) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: req.body.email,
        password: req.body.password,
    })
    if (authError) {
        return res.status(400).json({ error: authError.message })
    }
    res.json({ supabase_user_data: authData})
})


exports.signOut = asyncHandler(async (req, res) => {
    const { data, error } = await supabase.auth.signOut()
    res.json(data)
})
