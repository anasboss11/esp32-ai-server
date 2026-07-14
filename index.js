const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("BOSS AI Server Running");
});

app.post("/chat", async (req, res) => {

  try {

    const message = req.body.message || "";

    const response = await openai.responses.create({
      model: "gpt-5.4-mini",
      input: "সব সময় বাংলায় উত্তর দাও। প্রশ্ন: " + message
    });

    res.json({
      reply: response.output_text
    });

  } catch (err) {

    console.error(err);

    res.json({
      reply: "দুঃখিত, OpenAI এখন উত্তর দিতে পারছে না।"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("BOSS AI Server Running on Port " + PORT);
});
