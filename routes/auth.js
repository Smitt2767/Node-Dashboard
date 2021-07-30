const router = require("express").Router();
const { signupUser, loginUser } = require("../controllers/authController");

router.route("/signup").post(signupUser);
router.route("/login").post(loginUser);

module.exports = router;
