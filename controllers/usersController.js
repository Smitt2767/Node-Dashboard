const User = require("../models/User");
const { v4: uuidV4 } = require("uuid");

exports.getUsers = async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;

    const startIndex = (page - 1) * limit;
    const totalRecords = await User.totalDocuments();
    const search = `%${req.query.search}%`;

    const users = await User.find({
      startIndex,
      limit,
      user_id: req.user.user_id,
      search,
    });

    return res.json({
      sucess: true,
      data: users,
      totalRecords: totalRecords - 1,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getUserMessages = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const fromId = req.user.user_id;
    const toId = req.query.toUserId;

    if (!page || !limit || !fromId || !toId) {
      return res.status(400).json({
        success: false,
        message: "invalid data",
      });
    }

    const startIndex = (page - 1) * limit;
    const totalRecords = await User.totalUserMessages(fromId, toId);

    const data = await User.getUserMessages(fromId, toId, startIndex, limit);
    return res.json({
      success: true,
      data,
      totalRecords,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findById(userId);

    return res.json({
      sucess: true,
      data: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.updateUserProfileImage = async (req, res) => {
  try {
    if (!req.files.avatar) {
      return res.status(400).json({
        success: false,
        message: "Profile image must be required",
      });
    }

    const fileName = `${uuidV4()}_${req.files.avatar.name}`;

    req.files.avatar.mv(`./public/${fileName}`, (err) => {
      if (err) {
        return res.status(500).json({
          uploaded: false,
          message: "something went wrong! while uploading file...",
        });
      }
    });

    await User.finfByIdAndUpdateAvatar(req.user.user_id, fileName);

    return res.json({
      success: true,
      message: "Profile Image Updated",
      data: fileName,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      mobile_number,
      gender,
      address,
      address2,
      city,
      state,
      zipcode,
    } = req.body;

    if (
      !username ||
      !email ||
      !mobile_number ||
      !gender ||
      !address ||
      !address2 ||
      !city ||
      !state ||
      !zipcode
    )
      return res.status(400).json({
        success: false,
        message: `${
          !username
            ? "username"
            : !email
            ? "email"
            : !mobile_number
            ? "mobile number"
            : !gender
            ? "gender"
            : !address
            ? "address"
            : !address2
            ? "address2"
            : !city
            ? "city"
            : !state
            ? "state"
            : !zipcode
            ? "zipcode"
            : ""
        } must be required`,
      });

    const user = await User.findByIdAndUpdateProfile({
      username,
      email,
      mobile_number,
      gender,
      address,
      address2,
      city,
      state,
      zipcode,
      userId: req.user.user_id,
    });

    return res.json({
      success: true,
      message: "Profile updated",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
