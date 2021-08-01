const router = require("express").Router();
const { getUsers } = require("../controllers/usersController");
const { protect } = require("../controllers/authController");

router.route("/").get(protect, getUsers);

module.exports = router;
