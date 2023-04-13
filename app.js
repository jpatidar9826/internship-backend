require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const users = [
  {
    name: "dummmy ",
    email: "hey@gmail.com",
    password: "$2b$10$ZVzyOgeZAusgTlhoc2ifBuf2UEfI9rAret70sIKQc579Xz6mB49sG",
  },
];
const app = express();

app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE_KEY, {
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
});

const User = new mongoose.model("User", userSchema);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.post("/signup", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed, please try again" });
  }

  if (user == null) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name: name, email: email, password: hashedPassword });
      await newUser.save();
      console.log("successful signup");
      console.log(newUser);
      res.status(200).json({ name: newUser.name, email: newUser.email });
    } catch (err) {
      res.status(500).json({ msg: "Signup failed, please try again" });
    }
  } else {
    return res.status(500).json({ msg: "User already exist" });
  }
});

app.post("/login", async (req, res) => {
  
  let isValidPassword = false;
  const email = req.body.email;
  const password = req.body.password;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    res.status(500).json({ msg: "Login failed, please try again" });
  }

  if (user == null) {
    return res.status(400).json({ msg: "User does not exist" });
  }
  
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Unexpected error" });
  }

  if (isValidPassword) {
    console.log("Succesful Login");
    res
      .status(200)
      .json({ name: user.name, email: user.email, msg: "Success" });
  } else {
    res.status(500).json({ msg: "Invalid Password" });
  }
});


const hostname = "0.0.0.0";
const port = 3000;

app.listen(port, hostname, () => {
  console.log("Server running at http://$(hostname):$(port)/");
});

