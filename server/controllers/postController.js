const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { supabase } = require("../config/db");

exports.getPost = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select()
      .eq("post_id", req.params.postId);
    if (postError) {
      return res.status(400).json({ error: postError.message });
    }
    res.status(200).json(postData);
  });

exports.createPost = [
  body("caption").notEmpty().withMessage("Caption cannot be empty"),
  body("content").notEmpty().withMessage("Content cannot be empty"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const date = new Date();
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        caption: req.body.caption,
        content: req.body.content,
        date: date.toLocaleString(),
        i_at: date.toISOString(),
      })
      .select();
    if (postError) {
      return res.status(400).json({ error: postError.message });
    }
    res.status(200).json({ post: postData });
  }),
];

exports.updatePost = [
  body("caption").notEmpty().withMessage("Caption cannot be empty"),
  body("content").notEmpty().withMessage("Content cannot be empty"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const date = new Date();
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .update({
        user_id: user.id,
        caption: req.body.caption,
        content: req.body.content,
        date: date.toLocaleString(),
        i_at: date.toISOString(),
      })
      .eq("post_id", req.params.postId)
      .select();
    if (postError) {
      return res.status(400).json({ error: postError.message });
    }
    res.status(200).json({ post: postData });
  }),
];

exports.deletePost = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { data: postData, error: postError } = await supabase
    .from("posts")
    .delete()
    .eq("post_id", req.params.postId);
  if (postError) {
    return res.status(400).json({ error: postError.message });
  }
  res.status(200).json(postData);
});
