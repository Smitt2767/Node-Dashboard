const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "username, email and password must be required",
      });
    }

    await User.create(username, email, password);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY" && err.errno === 1062) {
      return res.status(400).json({
        success: false,
        message: `${req.body.email} is already registered`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findByEmail(email);

    if (!user.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user[0].user_id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      data: {
        token,
        user: {
          email: user[0].email,
          username: user[0].username,
        },
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized access",
    });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decode.id);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
      });
    }
    req.user = user;
  } catch (e) {
    return res.status(401).json({
      error: e,
      status: false,
      message: "Unauthorized access",
    });
  }
  next();
};
