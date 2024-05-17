const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { adminAuthClient, supabase } = require("../config/db");


exports.getUser = asyncHandler(async (req, res) => {
    const { data: {user}} = await supabase.auth.getUser()
    if(!user){
        return res.status(403).json({error: 'Unauthorized'})
    }
    const { data, error } = await supabase.from('users').select().eq('username' , req.params.username)
    if(error){
        return res.status(400).json({error: error.message})
    }
    const { data: userData , error: fetchError } = await adminAuthClient.getUserById(data[0].uuid)
    if(fetchError){
        return res.status(400).json({error: fetchError.message})
    }
    res.status(200).json(userData.user.user_metadata)
})

exports.updateUser = [
    body('username').trim().isLength({ min: 1 }).escape().withMessage('Username must be specified.'),
    body('username').custom(async (value) => {
        const { data, error } = await supabase.from('users').select('username').eq('username', value)
        if (data.length > 0) {
            return Promise.reject('Username already taken')
        }
    }),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if(!user){
            return res.status(403).json({error: 'Unauthorized'})
        }

        /** Update the user */
        const { error } = await adminAuthClient.updateUserById(user.id, {
            user_metadata: {
                username: req.body.username,
                bio: req.body.bio,
                profile_pic: req.body.profile_pic,
                name: req.body.name,
            }
        })
        if(error){
            return res.status(400).json({error: error.message})
        }

        const { data, error: fetchError } = await supabase.from('users').update({
            username: req.body.username
        }).eq('email', user.email).select()
        if(fetchError){
            return res.status(400).json({error: fetchError.message})
        }

        res.status(200).json({message: 'User updated successfully' , user: user.email , data: data})
    })
]

exports.deleteUser = asyncHandler(async (req, res) => {
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){
        return res.status(403).json({error: 'Unauthorized'})
    }
    const { error } = await adminAuthClient.deleteUser(user.id)
    if(error){
        return res.status(400).json({error: error.message})
    }
    res.status(200).json({message: 'User deleted successfully'})
})

/********************************
 * Follow and Unfollow controller
 ********************************/

exports.followUser = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User follow Page');
})

exports.unfollowUser = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User unfollow Page');
})

exports.getFollowers = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User followers Page');
})

exports.getFollowing = asyncHandler(async (req, res) => {
    res.json('NOT IMPLEMENTED: User following Page');
})