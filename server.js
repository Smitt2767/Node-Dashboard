const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 3001;

// routes
const ckEditorRoute = require("./routes/ckEditor");

app.use(express.json());
app.use(express.static("public"));
app.use(fileUpload());

app.use("/ck", ckEditorRoute);

app.listen(PORT, console.log(`server is running on port ${PORT}`));
