const router = require("express").Router();
const { getUsers, getUserMessages } = require("../controllers/usersController");
const { protect } = require("../controllers/authController");

router.route("/").get(protect, getUsers);
router.route("/messages").get(protect, getUserMessages);

module.exports = router;
