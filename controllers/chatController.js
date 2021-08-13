const { v4: uuidV4 } = require("uuid");
const Message = require("../models/Message");
const {
  getConnectedUserByUserId,
} = require("../services/privateChatUserService");

exports.saveAndSendFiles = async (req, res) => {
  try {
    let files = [];
    files = files.concat(req.files.file);

    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: "Atleast one file is required",
      });
    }

    const newMessage = await Message.create({
      text: "",
      type: "file",
      from_user: req.user.user_id,
      to_user: req.body.to_user,
    });

    const filesData = [];

    if (!!!newMessage) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    const message_id = newMessage.insertId;

    files.forEach(async (file) => {
      const name = file.name;
      const path = `${uuidV4()}_${file.name}`;
      const size = file.size;
      const type = file.mimetype;

      filesData.push([name, path, size, type, message_id]);
      file.mv(`./public/${path}`, (err) => {
        if (err) {
          return res.status(500).json({
            uploaded: false,
            message: "something went wrong! while uploading file...",
          });
        }
      });
    });

    await Message.createFile(filesData);

    const message = await Message.findById(message_id);

    const io = req.app.get("socketIo");
    const sender = getConnectedUserByUserId(req.user.user_id);
    const receiver = getConnectedUserByUserId(req.body.to_user * 1);

    if (sender?.socketId) {
      io.to(sender.socketId).emit("sendMessageToUser", {
        ...message,
        by_me: 1,
      });
    }
    if (receiver?.socketId) {
      io.to(receiver.socketId).emit("sendMessageToUser", {
        ...message,
        by_me: 0,
      });
    }

    return res.json({
      success: true,
      data: message,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
