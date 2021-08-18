const router = require("express").Router();
const { getData, create } = require("../controllers/olympicController");

router.route("/").get(getData).post(create);

module.exports = router;
