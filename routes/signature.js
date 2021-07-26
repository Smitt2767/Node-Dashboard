const router = require("express").Router();
const {
  createSignatureIntoExistingPdf,
  createSignatureIntoNewPdf,
} = require("../controllers/signatureController");

router.route("/").post(createSignatureIntoNewPdf);
router.route("/existing").post(createSignatureIntoExistingPdf);

module.exports = router;
