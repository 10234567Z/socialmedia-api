const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { adminAuthClient, supabase } = require("../config/db");
const getUuid = require("uuid-by-string");

exports.getUser = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("username", req.params.username);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  const { data: userData, error: fetchError } =
    await adminAuthClient.getUserById(data[0].uuid);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }
  res.status(200).json(userData.user.user_metadata);
});

exports.updateUser = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Username must be specified."),
  body("username").custom(async (value) => {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("username", value);
    if (data.length > 0) {
      return Promise.reject("Username already taken");
    }
  }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    /** Update the user */
    const { error } = await adminAuthClient.updateUserById(user.id, {
      user_metadata: {
        username: req.body.username,
        bio: req.body.bio,
        profile_pic: req.body.profile_pic,
        name: req.body.name,
      },
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data, error: fetchError } = await supabase
      .from("users")
      .update({
        username: req.body.username,
      })
      .eq("email", user.email)
      .select();
    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: user.email,
      data: data,
    });
  }),
];

exports.deleteUser = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { error } = await adminAuthClient.deleteUser(user.id);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(200).json({ message: "User deleted successfully" });
});

/********************************
 * Follow and Unfollow controller
 ********************************/

exports.followUser = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.params.username == user.user_metadata.name) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  /** Fetch the user you want to follow */
  const { data: followUser, error: fetchError } = await supabase
    .from("users")
    .select()
    .eq("username", req.params.username);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  /** Check if user already followed this user */
  const { data: alreadyFollowed, error: checkError } = await supabase
    .from("following")
    .select()
    .eq("user_id", user.id)
    .eq("following", followUser[0].uuid);
  if (checkError) {
    return res.status(400).json({ error: checkError.message });
  }
  if (alreadyFollowed.length > 0) {
    return res.status(400).json({ error: "You already follow this user" });
  }

  /** Post a record in following table */
  const { data, error } = await supabase
    .from("following")
    .insert({
      user_id: user.id,
      following: followUser[0].uuid,
    })
    .select();
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    message: "User followed successfully",
    followUser: req.params.username,
  });
});

exports.unfollowUser = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.params.username == user.user_metadata.name) {
    return res.status(400).json({ error: "You cannot unfollow yourself" });
  }

  /** Fetch the user you want to unfollow */
  const { data: followUser, error: fetchError } = await supabase
    .from("users")
    .select()
    .eq("username", req.params.username);
  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  /** Check if user already followed this user */
  const { data: alreadyFollowed, error: checkError } = await supabase
    .from("following")
    .select()
    .eq("user_id", user.id)
    .eq("following", followUser[0].uuid);
  if (checkError) {
    return res.status(400).json({ error: checkError.message });
  }
  if (alreadyFollowed.length === 0) {
    return res.status(400).json({ error: "You do not follow this user" });
  }

  /** Delete the record from following table */
  const { data, error } = await supabase
    .from("following")
    .delete()
    .eq("user_id", user.id)
    .eq("following", followUser[0].uuid)
    .select();
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    message: "User unfollowed successfully",
    followUser: req.params.username,
  });
});

exports.getFollowers = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { data: paramUserData, error: paramUserError } = await supabase
    .from("users")
    .select()
    .eq("username", req.params.username);
  if (paramUserError) {
    return res.status(400).json({ error: paramUserError.message });
  }

  const { data, error } = await supabase
    .from("following")
    .select()
    .eq("following", paramUserData[0].uuid);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const followers = [];
  for (let i = 0; i < data.length; i++) {
    const { data: userData, error: fetchError } =
      await adminAuthClient.getUserById(data[i].user_id);
    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }
    followers.push(userData.user.user_metadata);
  }
  res.status(200).json(followers);
});

exports.getFollowing = asyncHandler(async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { data: paramUserData, error: paramUserError } = await supabase
    .from("users")
    .select()
    .eq("username", req.params.username);
  if (paramUserError) {
    return res.status(400).json({ error: paramUserError.message });
  }

  const { data, error } = await supabase
    .from("following")
    .select()
    .eq("user_id", paramUserData[0].uuid);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const followers = [];
  for (let i = 0; i < data.length; i++) {
    const { data: userData, error: fetchError } =
      await adminAuthClient.getUserById(data[i].following);
    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }
    followers.push(userData.user.user_metadata);
  }
  res.status(200).json(followers);
});
