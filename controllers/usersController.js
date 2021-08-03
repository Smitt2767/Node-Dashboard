const User = require("../models/User");

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
