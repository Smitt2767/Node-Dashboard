const router = require("express").Router();
const { protect } = require("../controllers/authController");
const {
  handlePostData,
  getData,
  handleDelete,
  getDataById,
  updateData,
} = require("../controllers/ccController");

router.use(protect);
router.route("/").post(handlePostData).get(getData);
router.route("/:id").delete(handleDelete).get(getDataById).put(updateData);

module.exports = router;
