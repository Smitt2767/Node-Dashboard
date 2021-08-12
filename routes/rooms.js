const router = require("express").Router();
const {
  getRooms,
  createRoom,
  getRoomInfo,
  leaveRoom,
  updateRoom,
  getRoomMessages,
} = require("../controllers/roomsController");
const { protect } = require("../controllers/authController");

router.route("/messages").get(protect, getRoomMessages);
router
  .route("/:roomId/users")
  .get(protect, getRoomInfo)
  .put(protect, updateRoom);
router.route("/").get(protect, getRooms).post(protect, createRoom);
router.route("/leave/:roomId").delete(protect, leaveRoom);

module.exports = router;
