const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(express.json());

// Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// সার্ভার চালু আছে কিনা
app.get("/", (req, res) => {
  res.send("BOSS AI Server Running");
});

// ESP32 এখানে প্রশ্ন পাঠাবে
app.post("/chat", async (req, res) => {

  try {

    const message = req.body.message || "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
      "সব সময় বাংলায় উত্তর দিবে। প্রশ্ন: " + message
    });

    res.json({
      reply: response.text
    });

  } catch (err) {

    console.log(err);

    res.json({
      reply: "দুঃখিত, AI এখন উত্তর দিতে পারছে না।"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("BOSS AI Server Running on Port " + PORT);
});
