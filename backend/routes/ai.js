import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Choose a valid model from your list
const MODEL = "models/gemini-2.0-flash";

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Query received:", message);

    // 1️⃣ CALL ListModels to check availability
    const list = await axios.get(
      "https://generativelanguage.googleapis.com/v1/models",
      {
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    console.log("Available models:", list.data.models);

    // 2️⃣ Make sure model exists
    const valid = list.data.models.some((m) => m.name === MODEL);
    if (!valid) {
      console.log("❌ Model not found:", MODEL);
      return res
        .status(500)
        .json({ reply: "Selected model is not available for your API key" });
    }

    // 3️⃣ Generate response
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent`,
      {
        contents: [{ parts: [{ text: message }] }],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    res.status(500).json({ reply: "AI request failed" });
  }
});

export default router;
