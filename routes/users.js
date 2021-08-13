const router = require("express").Router();
const {
  getUsers,
  getUserMessages,
  getUserProfile,
  updateUserProfileImage,
  updateUserProfile,
} = require("../controllers/usersController");
const { protect } = require("../controllers/authController");

router.route("/").get(protect, getUsers);
router.route("/messages").get(protect, getUserMessages);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route("/profileImage").put(protect, updateUserProfileImage);

module.exports = router;
