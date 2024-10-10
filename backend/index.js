const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost/headcookaidb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model
const User = mongoose.model("User", {
  email: String,
  password: String,
  searchCount: { type: Number, default: 0 },
});

// Registration endpoint
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).send("User registered");
  } catch {
    res.status(500).send("Error registering user");
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
    res.json({ token });
  } else {
    res.status(400).send("Invalid credentials");
  }
});

// Search endpoint
app.post("/search", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (user.searchCount === 0) {
    user.searchCount++;
    await user.save();
    // Perform search logic here
    res.json({ result: "Search results" });
  } else {
    res.status(403).send("Free search limit reached");
  }
});

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access denied");

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
}

app.listen(3001, () => console.log("Server running on port 3001"));
