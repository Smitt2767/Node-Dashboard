const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 3001;

// routes
const ckEditorRoute = require("./routes/ckEditor");
const signatureRoute = require("./routes/signature");

app.use(express.json({ limit: 500000 }));
app.use(express.static("public"));
app.use(fileUpload());

app.use("/ck", ckEditorRoute);
app.use("/signature", signatureRoute);

app.listen(PORT, console.log(`server is running on port ${PORT}`));
