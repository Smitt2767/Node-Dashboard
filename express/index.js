const { app } = require("../server");

// routes
const ckEditorRoute = require("../routes/ckEditor");
const signatureRoute = require("../routes/signature");
const authRoute = require("../routes/auth");
const userRoute = require("../routes/users");
const roomsRoute = require("../routes/rooms");
const chatRoute = require("../routes/chat");
// Routes
app.use("/ck", ckEditorRoute);
app.use("/signature", signatureRoute);
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/rooms", roomsRoute);
app.use("/chat", chatRoute);
