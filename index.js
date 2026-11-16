
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Render server check
app.get("/", (req, res) => {
  res.status(200).send("BOSS AI Server Running");
});

// AI Chat API
app.post("/chat", async (req, res) => {
  try {
    const message =
      (req.body && req.body.message)
        ? req.body.message
        : "";

    if (!message.trim()) {
      return res.status(400).json({
        status: "server_error",
        reply: "Message is empty"
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.4-mini",
      input: "সব সময় বাংলায় উত্তর দাও। প্রশ্ন: " + message
    });

    const reply = response.output_text || "";

    if (!reply.trim()) {
      return res.status(200).json({
        status: "ai_error",
        reply: "AI উত্তর দিতে পারছে না।"
      });
    }

    return res.status(200).json({
      status: "ok",
      reply: reply
    });

  } catch (err) {
    console.error("OpenAI API Error:", err);

    return res.status(200).json({
      status: "ai_error",
      reply: "AI উত্তর দিতে পারছে না।"
    });
  }
});

// Server চালু
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("BOSS AI Server Running on Port " + PORT);
});
