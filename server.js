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

const TIMEOUT = 8000; // 8 seconds request timeout

/**
 * Handles requests from the frontend to generate AI content.
 */
app.post("/api/gemini", async (req, res) => {
  // Set a timeout for Vercel's function execution
  res.setTimeout(9000, () => {
    return res
      .status(504)
      .json({ error: "Request timed out. Try again later." });
  });

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, req.body, {
      headers: { "Content-Type": "application/json" },
      timeout: TIMEOUT, // Prevents long API waits
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching response:", error);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "AI API request timed out." });
    }

    res.status(500).json({
      error: "Error connecting to AI",
      details: error.response?.data || error.message,
    });
  }
});

// Start the server locally
const PORT = process.env.PORT || 8090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export for Vercel deployment
