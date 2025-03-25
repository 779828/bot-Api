require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const MAX_TIMEOUT = 20000; // 20 seconds max timeout
const MAX_RETRIES = 3; // Retry up to 3 times

/**
 * Function to fetch AI response with retries.
 */
const fetchGeminiResponse = async (data, retries = 0) => {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, data, {
      headers: { "Content-Type": "application/json" },
      timeout: MAX_TIMEOUT, // Prevents long waits
    });

    return response.data;
  } catch (error) {
    console.error(`Attempt ${retries + 1} failed:`, error.message);

    if (retries < MAX_RETRIES) {
      console.log(`Retrying (${retries + 1}/${MAX_RETRIES})...`);
      return fetchGeminiResponse(data, retries + 1); // Retry request
    }

    throw error; // Throw after max retries
  }
};

/**
 * AI Endpoint: Generates AI content based on user input.
 */
app.post("/api/gemini", async (req, res) => {
  res.setTimeout(25000, () => {
    return res.status(504).json({ error: "Server timed out. Try again." });
  });

  try {
    const aiResponse = await fetchGeminiResponse(req.body);
    res.json(aiResponse);
  } catch (error) {
    console.error("Final AI API error:", error);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "AI API request timed out." });
    }

    res.status(500).json({
      error: "Error connecting to AI",
      details: error.response?.data || error.message,
    });
  }
});

// Start server locally
const PORT = process.env.PORT || 8090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export for Vercel
