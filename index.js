
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.LITEROUTER_API_KEY,
  baseURL: "https://api.literouter.com/v1"
});

app.get("/", (req, res) => {
  res.send("BOS AI Server Running");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message || "";

    if (!message.trim()) {
      return res.status(400).json({
        status: "error",
        reply: "কোনো প্রশ্ন পাওয়া যায়নি।"
      });
    }

    const response = await client.chat.completions.create({
      model: "glm-5.3-flash:free",
      messages: [
        {
          role: "system",
          content: "তুমি BOS AI। সব সময় বাংলায় সহজ ও সুন্দরভাবে উত্তর দাও।"
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const reply =
      response.choices?.[0]?.message?.content || "";
        if (!reply.trim()) {
      throw new Error("AI returned empty reply");
    }

    res.json({
      status: "ok",
      reply: reply
    });

  } catch (err) {
    console.error("LiteRouter Error:", err);

    res.status(502).json({
      status: "ai_error",
      reply: "দুঃখিত, AI এখন উত্তর দিতে পারছে না।"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("BOS AI Server Running on Port " + PORT);
});
