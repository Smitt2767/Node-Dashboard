const { app } = require("../server");

// routes
const ckEditorRoute = require("../routes/ckEditor");
const signatureRoute = require("../routes/signature");
const authRoute = require("../routes/auth");
const userRoute = require("../routes/users");

// Routes
app.use("/ck", ckEditorRoute);
app.use("/signature", signatureRoute);
app.use("/auth", authRoute);
app.use("/users", userRoute);