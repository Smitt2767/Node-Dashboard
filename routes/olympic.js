const router = require("express").Router();
const {
  getData,
  create,
  generateXlsx,
  generatePdfTable,
} = require("../controllers/olympicController");

router.route("/").get(getData).post(create);
router.route("/generateXlsx").get(generateXlsx);
router.route("/generatePdfTable").get(generatePdfTable);

module.exports = router;
