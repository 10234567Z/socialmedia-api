const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { supabase } = require("../config/db");
const axios = require("axios");

exports.getRecentFollowerPosts = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  /** Check if following count is 0 */
  const { data: followingData, error: followingError } = await supabase
    .from("following")
    .select()
    .eq("user_id", user.id);
  if (followingError) {
    return res.status(400).json({ error: followingError.message });
  }
  if (followingData.length === 0) {
    return res.status(200).json({ message: "You are not following anyone" });
  }

  /** Get recent 5 recent posts from each following and shuffle them in descending date order in array */
  const followingPost = [];
  const { data } = await axios.get(
    `http://localhost:3000/u/${user.user_metadata.name}/following`
  );
  for (let i = 0; i < data.length; i++) {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select()
      .eq("user_id", data[i].id)
      .order("i_at", { ascending: false })
      .limit(3);
    if (postError) {
      return res.status(400).json({ error: postError.message });
    }
    followingPost.push(...post);
  }
  followingPost.sort((a, b) => {
    new Date(b.i_at) - new Date(a.i_at);
  });
  res.status(200).json(followingPost);
});

exports.getCommentLikes = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { data: likes, error: fetchError } = await supabase
    .from("commentlikes")
    .select()
    .eq("likedcomment", req.params.commentId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }
  res.status(200).json(likes);
});

exports.getRandomPosts = asyncHandler(async (req, res) => {
  res.json({ message: "Random Posts" });
});
