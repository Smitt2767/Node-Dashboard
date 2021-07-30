const router = require("express").Router();
const {
  createSignatureIntoExistingPdf,
  createSignatureIntoNewPdf,
} = require("../controllers/signatureController");
const { protect } = require("../controllers/authController");
router.route("/").post(protect, createSignatureIntoNewPdf);
router.route("/existing").post(protect, createSignatureIntoExistingPdf);

module.exports = router;
