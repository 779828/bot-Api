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

/**
 * Handles requests from the frontend to generate AI content.
 */
app.post("/api/gemini", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, req.body, {
      headers: { "Content-Type": "application/json" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Error connecting to AI" });
  }
});

// Start the server
const PORT = 8090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
