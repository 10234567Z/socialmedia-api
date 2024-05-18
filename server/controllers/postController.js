const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { supabase, adminAuthClient } = require("../config/db");

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
    const { error } = await adminAuthClient.updateUserById(user.id, {
      user_metadata: { posts: user.user_metadata.posts + 1 },
    });
    if (error) {
      return res.status(400).json({ error: error.message });
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
  const { error } = await adminAuthClient.updateUserById(user.id, {
    user_metadata: { posts: user.user_metadata.posts - 1 },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(200).json(postData);
});

/**********************************
 *  Likes Controller
 * ********************************/

exports.likePost = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  /** Check if the post is already liked by user */
  const { data: duplicate, error: duplicateError } = await supabase
    .from("postlikes")
    .select()
    .eq("likedpost", req.params.postId)
    .eq("user_id", user.id);
  if (duplicate.length !== 0) {
    return res.status(400).json({ error: "You have already liked this post" });
  }

  /** Fetch the post */
  const { data: fetchPost, error: fetchError } = await supabase
    .from("posts")
    .select()
    .eq("post_id", req.params.postId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  /** Update likes on fetched post */
  const { error: updateError } = await supabase
    .from("posts")
    .update({
      likes: fetchPost[0].likes + 1,
    })
    .eq("post_id", req.params.postId);
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  /** Add the like record in postlikes table */
  const { error: likeError } = await supabase.from("postlikes").insert({
    likedpost: req.params.postId,
    user_id: user.id,
  });
  if (likeError) {
    return res.status(400).json({ error: likeError.message });
  }

  /** Finally, update the number of likes in user profile */
  const { error } = await adminAuthClient.updateUserById(user.id, {
    user_metadata: { likedposts: user.user_metadata.likedposts + 1 },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Post Liked" });
});

exports.unlikePost = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  /** Delete the like record in postlikes table */
  const { error: likeError } = await supabase
    .from("postlikes")
    .delete()
    .eq("likedpost", req.params.postId)
    .eq("user_id", user.id);
  if (likeError) {
    return res.status(400).json({ error: likeError.message });
  }

  /** Fetch the post */
  const { data: fetchPost, error: fetchError } = await supabase
    .from("posts")
    .select()
    .eq("post_id", req.params.postId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  /** Update likes on fetched post */
  const { error: updateError } = await supabase
    .from("posts")
    .update({
      likes: fetchPost[0].likes - 1,
    })
    .eq("post_id", req.params.postId);
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  /** Finally, update the number of likes in user profile */
  const { error } = await adminAuthClient.updateUserById(user.id, {
    user_metadata: { likedposts: user.user_metadata.likedposts + 1 },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Post unliked" });
});

exports.getLikes = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { data: likes, error: fetchError } = await supabase
    .from("postlikes")
    .select()
    .eq("likedpost", req.params.postId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }
  res.status(200).json(likes);
});

/**********************************
 *  Comments Controller
 **********************************/
exports.postNewComment = [
  body("comment").notEmpty().withMessage("Comment cannot be empty"),
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

    /** Fetch the post for updating later */
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select()
      .eq("post_id", req.params.postId);
    if (postError) {
      return res.status(400).json({ error: postError.message });
    }
    const date = new Date();

    /** Insert the comment */
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        post_id: req.params.postId,
        content: req.body.comment,
        i_at: date.toISOString(),
        replied_to: null,
      })
      .select();
    if (commentError) {
      return res.status(400).json({ error: commentError.message });
    }

    /** Update the post */
    const { error: postUpdateError } = await supabase
      .from("posts")
      .update({
        comments: post[0].comments + 1,
      })
      .eq("post_id", req.params.postId);
    if (postUpdateError) {
      return res.status(400).json({ error: postUpdateError.message });
    }

    /** Update the user */
    const { error } = await adminAuthClient.updateUserById(user.id, {
      user_metadata: { comments: user.user_metadata.comments + 1 },
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ comment: commentData });
  }),
];

exports.getComments = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { data: comments, error: fetchError } = await supabase
    .from("comments")
    .select()
    .eq("post_id", req.params.postId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }
  res.status(200).json(comments);
});

exports.updateComment = [
  body("comment").notEmpty().withMessage("Comment cannot be empty"),
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

    /** Update the comment */
    const { data: commentData, error: updateError } = await supabase
      .from("comments")
      .update({
        content: req.body.comment,
      })
      .eq("comment_id", req.params.commentId)
      .select();
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }
    res.status(200).json({ comment: commentData });
  }),
];

exports.deleteComment = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  /** Fetch the post */
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select()
    .eq("post_id", req.params.postId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  /** Delete the comment */
  const { data: commentData, error: deleteError } = await supabase
    .from("comments")
    .delete()
    .eq("comment_id", req.params.commentId);
  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  /** Update the post */
  const { error: postUpdateError } = await supabase
    .from("posts")
    .update({
      comments: post[0].comments - 1,
    })
    .eq("post_id", req.params.postId);
  if (postUpdateError) {
    return res.status(400).json({ error: postUpdateError.message });
  }

  /** Update the user */
  const { error } = await adminAuthClient.updateUserById(user.id, {
    user_metadata: { comments: user.user_metadata.comments - 1 },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(200).json(commentData);
});

exports.replyToComment = [
  body("comment").notEmpty().withMessage("Comment cannot be empty"),
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

    /** Fetch the post for updating later */
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select()
      .eq("post_id", req.params.postId);
    if (postError) {
      return res.status(400).json({ error: postError.message });
    }
    const date = new Date();

    /** Insert the comment */
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        post_id: req.params.postId,
        content: req.body.comment,
        i_at: date.toISOString(),
        replied_to: req.params.replyId,
      })
      .select();
    if (commentError) {
      return res.status(400).json({ error: commentError.message });
    }

    /** Update the post */
    const { error: postUpdateError } = await supabase
      .from("posts")
      .update({
        comments: post[0].comments + 1,
      })
      .eq("post_id", req.params.postId);
    if (postUpdateError) {
      return res.status(400).json({ error: postUpdateError.message });
    }

    /** Update the user */
    const { error } = await adminAuthClient.updateUserById(user.id, {
      user_metadata: { comments: user.user_metadata.comments + 1 },
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ comment: commentData });
  }),
];

/***************************
 * Comment Likes Controller
 ***************************/

exports.likeComment = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  /** Check if the comment is already liked by user */
  const { data: duplicate, error: duplicateError } = await supabase
    .from("commentlikes")
    .select()
    .eq("likedcomment", req.params.commentId)
    .eq("user_id", user.id);
  if (duplicate.length !== 0) {
    return res
      .status(400)
      .json({ error: "You have already liked this comment" });
  }

  /** Fetch the comment */
  const { data: fetchComment, error: fetchError } = await supabase
    .from("comments")
    .select()
    .eq("comment_id", req.params.commentId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  /** Add the like record in commentlikes table */
  const { error: likeError } = await supabase.from("commentlikes").insert({
    likedcomment: req.params.commentId,
    user_id: user.id,
  });
  if (likeError) {
    return res.status(400).json({ error: likeError.message });
  }

  /** Update likes on fetched comment */
  const { error: updateError } = await supabase
    .from("comments")
    .update({
      likes: fetchComment[0].likes + 1,
    })
    .eq("comment_id", req.params.commentId);
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  /** Finally, update the number of likes in user profile */
  const { error } = await adminAuthClient.updateUserById(user.id, {
    user_metadata: { likedcomments: user.user_metadata.likedcomments + 1 },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Comment Liked" });
});

exports.unlikeComment = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  /** Delete the like record in commentlikes table */
  const { error: likeError } = await supabase
    .from("commentlikes")
    .delete()
    .eq("likedcomment", req.params.commentId)
    .eq("user_id", user.id);
  if (likeError) {
    return res.status(400).json({ error: likeError.message });
  }

  /** Fetch the comment */
  const { data: fetchComment, error: fetchError } = await supabase
    .from("comments")
    .select()
    .eq("comment_id", req.params.commentId);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  /** Update likes on fetched comment */
  const { error: updateError } = await supabase
    .from("comments")
    .update({
      likes: fetchComment[0].likes - 1,
    })
    .eq("comment_id", req.params.commentId);
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  /** Finally, update the number of likes in user profile */
  const { error } = await adminAuthClient.updateUserById(user.id, {
    user_metadata: { likedcomments: user.user_metadata.likedcomments - 1 },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Comment unliked" });
});