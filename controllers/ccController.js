const CC = require("../models/CC");

exports.handlePostData = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cardHolderName = req.body.cardHolderName;
    const cardNumber = req.body.cardNumber;
    const expiryDate = req.body.expiryDate;
    const expiryMonth = expiryDate.slice(0, 2) * 1;
    const expiryYear = expiryDate.slice(2) * 1;
    const cvv = req.body.cvv;
    const balance = req.body.balance * 1;

    if (
      (!cardHolderName, !cardNumber, !expiryMonth, !expiryYear, !cvv, !balance)
    ) {
      return res.staus(400).json({
        success: false,
        message: "all fields must be required",
      });
    }

    const newUser = await CC.create({
      userId,
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      balance,
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    return res.json({
      sucess: true,
      message: "card added sucessfully",
    });
  } catch (err) {
    console.log(err); //
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getData = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    const startIndex = (page - 1) * limit;
    const totalRecords = await CC.totalDocuments(req.user.user_id);

    const data = await CC.find({
      startIndex,
      limit,
      user_id: req.user.user_id,
    });

    return res.json({
      success: true,
      data,
      totalRecords,
    });
  } catch (err) {
    console.log(err); //
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.handleDelete = async (req, res) => {
  try {
    const record = await CC.findById(req.params.id * 1);
    if (record && record.user_id !== req.user.user_id) {
      return res.status(401).json({
        sucess: false,
        message: "Unauthorized user",
      });
    }
    await CC.findByIdAndDelete(req.params.id * 1);

    return res.json({
      sucesss: true,
      message: "Data deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getDataById = async (req, res) => {
  try {
    const id = req.params.id * 1;

    const data = await CC.findById(id);
    return res.json({
      sucess: true,
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateData = async (req, res) => {
  try {
    const id = req.params.id * 1;

    const record = await CC.findById(id);
    if (record && record.user_id !== req.user.user_id) {
      return res.status(401).json({
        sucess: false,
        message: "Unauthorized user",
      });
    }

    const userId = req.user.user_id;
    const cardHolderName = req.body.cardHolderName;
    const cardNumber = req.body.cardNumber;
    const expiryDate = req.body.expiryDate;
    const expiryMonth = expiryDate.slice(0, 2) * 1;
    const expiryYear = expiryDate.slice(2) * 1;
    const cvv = req.body.cvv;
    const balance = req.body.balance * 1;

    await CC.findByIdAndUpdate({
      id,
      userId,
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      balance,
    });

    return res.json({
      success: true,
      message: "Data updated succesfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
