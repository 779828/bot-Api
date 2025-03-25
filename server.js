require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent";

const MAX_TIMEOUT = 10000; // Reduce timeout to 10s
const MAX_RETRIES = 2; // Reduce retries to avoid long waits

/**
 * Function to fetch AI response with retries.
 */
const fetchGeminiResponse = async (data, retries = 0) => {
  try {
    console.log(`Requesting Gemini API (Attempt ${retries + 1})...`);

    const response = await axios.post(`${API_URL}?key=${API_KEY}`, data, {
      headers: { "Content-Type": "application/json", Connection: "keep-alive" },
      timeout: MAX_TIMEOUT, // 10 seconds timeout to prevent long waits
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
  req.setTimeout(25000); // Prevents Vercel from cutting off request early

  try {
    const aiResponse = await fetchGeminiResponse(req.body);
    res.set("Connection", "keep-alive"); // Helps with cold starts
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

// Export app for Vercel
module.exports = app;
