const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/ai", async (req, res) => {
  try {
    const { message, businessData } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const prompt = `
You are the AI Business Assistant inside a Business OS.

Your job is to help a small business owner understand
their business data and decide what to focus on.

Business data:
${JSON.stringify(businessData, null, 2)}

User question:
${message}

Rules:
- Give a clear, practical answer.
- Use the supplied business data.
- Do not invent numbers.
- If the data does not contain the answer, say that clearly.
- Keep the answer concise.
- Use bullet points when useful.
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    res.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      error: "AI request failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});