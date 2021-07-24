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

router
  .route("/")
  .post(handlePostData)
  .get(getCKEditorData)
  .delete(handleDelete);
router.post("/uploadImg", handleUploadImg);

router.route("/:id").get(handleGetDataById).put(handleUpdateDataById);

module.exports = router;
