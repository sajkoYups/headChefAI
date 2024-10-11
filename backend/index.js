const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      clientEmail: process.env.REACT_APP_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.REACT_APP_FIREBASE_PRIVATE_KEY.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.REACT_APP_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error("MongoDB URI:", process.env.REACT_APP_MONGODB_URI);
  });

// User model
const User = mongoose.model("User", {
  email: String,
  searchCount: { type: Number, default: 0 },
  firebaseUid: String,
});

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Protected search endpoint
app.post("/search", verifyToken, async (req, res) => {
  try {
    let user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      user = new User({ email: req.user.email, firebaseUid: req.user.uid });
    }
    user.searchCount++;
    await user.save();

    const recipes = await fetchRecipes(req.body.ingredients, req.body.cuisines);
    res.json({ recipes, searchCount: user.searchCount });
  } catch (error) {
    console.error("Search error:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ error: "Error performing search", details: error.message });
  }
});

async function fetchRecipes(ingredients, cuisines) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are an expert chef and know all possible recipes. You will only give recipes based on the ingredients provided. Dont forget just the ingredients provided. You will not give any other response no matter what. You will generate 4 recipes using the provided ingredients. " +
          (cuisines && cuisines.length > 0
            ? `Give recipes that are from the following cuisine(s): ${cuisines.join(
                ", "
              )}. `
            : "") +
          "You will give detailed instructions on how to make the recipes. Leave no step unexplained. Format the response as a valid JSON array with objects containing 'name' and 'instructions' properties. Do not include any markdown formatting or code block syntax in your response.",
      },
      { role: "user", content: ingredients },
    ];

    if (cuisines && cuisines.length > 0) {
      messages.push({ role: "user", content: cuisines.join(", ") });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
      }
    );
    let recipesString = response.data.choices[0].message.content;
    recipesString = recipesString.replace(/```json\n?|\n?```/g, "").trim();
    try {
      return JSON.parse(recipesString);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Raw response:", recipesString);
      throw new Error("Failed to parse API response");
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
}

// Image generation endpoint
app.post("/generate-image", verifyToken, async (req, res) => {
  try {
    const imageUrl = await generateImage(req.body.recipeName);
    res.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).send("Error generating image");
  }
});

async function generateImage(recipeName) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-3",
        prompt: `Create a realistic image of a plate of ${recipeName}. It should look appetizing and realistic. It should be a high quality image. It should be a picture of a plate of food.`,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
