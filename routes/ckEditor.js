const express = require("express");
const router = express.Router();
const {
  handlePostData,
  handleUploadImg,
  getCKEditorData,
  handleDelete,
  handleGetDataById,
  handleUpdateDataById,
} = require("../controllers/ckEditorController");
const { protect } = require("../controllers/authController");

router
  .route("/")
  .post(protect, handlePostData)
  .get(protect, getCKEditorData)
  .delete(protect, handleDelete);

router.post("/uploadImg", protect, handleUploadImg);

router
  .route("/:id")
  .get(protect, handleGetDataById)
  .put(protect, handleUpdateDataById);

module.exports = router;
