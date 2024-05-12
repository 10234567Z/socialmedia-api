const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const {supabase} = require("../config/db");

exports.getHome = asyncHandler(async (req, res) => {
    const { data: { user } } = await supabase.auth.getUser();
    if(user.user_metadata.following !== 0){
        const { data: following , error: fetchError} = await supabase.from('following').select().eq('user_id', user.id)
        if(fetchError){
            return res.status(400).json({error: fetchError.message})
        }
        res.json("//TODO: Get posts from following users")
    }
    else{
        res.json({message: "You are not following anyone"})
    }
    
})