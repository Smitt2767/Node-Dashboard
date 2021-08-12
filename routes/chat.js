const router = require("express").Router();
const { saveAndSendFiles } = require("../controllers/chatController");
const { protect } = require("../controllers/authController");

router.post("/files", protect, saveAndSendFiles);

module.exports = router;
