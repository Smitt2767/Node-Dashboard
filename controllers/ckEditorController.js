const CKEditor = require("../models/CKEditor");
const { v4: uuidV4 } = require("uuid");

exports.handlePostData = async (req, res, next) => {
  try {
    const data = await CKEditor.create(req.body.data);
    if (!data) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    return res.json({
      sucesss: true,
      data,
      message: "Successfully created",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.handleUploadImg = async (req, res, next) => {
  const fileName = `${uuidV4()}_${req.files.upload.name}`;

  req.files.upload.mv(`./public/${fileName}`, (err) => {
    if (err) {
      return res.status(500).json({
        uploaded: false,
        message: "something went wrong! while uploading file...",
      });
    }
  });

  return res.json({
    uploaded: true,
    url: `http://127.0.0.1:3001/${fileName}`,
  });
};

exports.getCKEditorData = async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;

    const startIndex = (page - 1) * limit;
    const totalRecords = await CKEditor.totalDocuments();
    const data = await CKEditor.find({ startIndex, limit });

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

exports.handleDelete = async (req, res, next) => {
  try {
    const deletedData = await CKEditor.findByIdAndDelete(req.body.id);
    return res.json({
      sucesss: true,
      data: deletedData,
      message: "Data deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.handleGetDataById = async (req, res, next) => {
  try {
    const data = await CKEditor.findById(req.params.id * 1);
    return res.json({
      sucesss: true,
      data: data[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.handleUpdateDataById = async (req, res, next) => {
  try {
    const data = await CKEditor.findByIdAndUpdate({
      id: req.params.id * 1,
      data: req.body.data,
    });
    if (!data) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    return res.json({
      success: true,
      message: "Data updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
