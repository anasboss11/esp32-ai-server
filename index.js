
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.LITEROUTER_API_KEY,
  baseURL: "https://api.literouter.com/v1"
});

// LiteRouter AI-তে প্রশ্ন পাঠানো
async function askAI(message) {
  const response = await client.chat.completions.create({
    model: "glm-5.3-flash:free",
    messages: [
      {
        role: "system",
        content: "তুমি BOS AI। সব সময় সহজ ও সুন্দর বাংলায় উত্তর দাও।"
      },
      {
        role: "user",
        content: message
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return response.choices?.[0]?.message?.content || "";
}

app.get("/", (req, res) => {
  res.send("BOS AI Server Running");
});

// আগের Text Chat ব্যবস্থা
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message || "";

    if (!message.trim()) {
      return res.status(400).json({
        status: "error",
        reply: "কোনো প্রশ্ন পাওয়া যায়নি।"
      });
    }

    const reply = await askAI(message);

    if (!reply.trim()) {
      throw new Error("Empty AI reply");
    }

    res.json({
      status: "ok",
      reply: reply
    });

  } catch (err) {
    console.error("Chat Error:", err);

    res.status(502).json({
      status: "ai_error",
      reply: "দুঃখিত, AI এখন উত্তর দিতে পারছে না।"
    });
  }
});
// নতুন Voice API
app.post(
  "/voice",
  express.raw({
    type: ["audio/wav", "application/octet-stream"],
    limit: "10mb"
  }),
  async (req, res) => {
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY missing");
      }

      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({
          status: "error",
          reply: "অডিও পাওয়া যায়নি।"
        });
      }

      // WAV অডিও Groq-তে পাঠানো
      const form = new FormData();

      form.append(
        "file",
        new Blob([req.body], { type: "audio/wav" }),
        "bos-ai.wav"
      );

      form.append("model", "whisper-large-v3-turbo");
      form.append("language", "bn");
      form.append("response_format", "json");

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: form
        }
      );

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        throw new Error("Groq Error: " + errorText);
      }

      const transcription = await groqResponse.json();
      const transcript = transcription.text || "";

      console.log("বাংলা কথা:", transcript);

      if (!transcript.trim()) {
        return res.json({
          status: "empty",
          transcript: "",
          reply: "আপনার কথা বুঝতে পারিনি।"
        });
      }

      // বাংলা লেখা LiteRouter AI-তে পাঠানো
      const reply = await askAI(transcript);

      res.json({
        status: "ok",
        transcript: transcript,
        reply: reply
      });

    } catch (err) {
      console.error("Voice Error:", err);

      res.status(502).json({
        status: "voice_error",
        reply: "দুঃখিত, ভয়েস প্রসেস করতে সমস্যা হয়েছে।"
      });
    }
  }
);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("BOS AI Voice Server Running on Port " + PORT);
});
