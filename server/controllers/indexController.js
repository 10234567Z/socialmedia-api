const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const {supabase} = require("../config/db");

exports.getHome = asyncHandler(async (req, res) => {
    const { data: { user } } = await supabase.auth.getSession();
    if(!user) {
        return res.status(401).json({error: "Unauthorized"})
    }
    if(user.user_metadata.following !== 0){
        const { data: following , error: fetchError} = await supabase.from('following').select().eq('user_id', user.id)
        if(fetchError){
            return res.status(400).json({error: fetchError.message})
        }
        res.status(200).json("//TODO: Get posts from following users")
    }
    else{
        res.status(200).json({message: "You are not following anyone"})
    }
})