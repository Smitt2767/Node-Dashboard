const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;

    const startIndex = (page - 1) * limit;
    const totalRecords = await User.totalDocuments();

    const users = await User.find({
      startIndex,
      limit,
      user_id: req.user.user_id,
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
