import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      error: "A question is required.",
    });
  }

  try {
    const perplexityResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content:
                "You are a friendly, concise assistant. Explain answers in plain language. If uncertain, say so.",
            },
            {
              role: "user",
              content: question,
            },
          ],
        }),
      }
    );

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error(errorText);

      return res.status(502).json({
        error: "The AI service could not answer right now.",
      });
    }

    const data = await perplexityResponse.json();

    return res.json({
      answer: data.choices?.[0]?.message?.content ?? "",
      citations: data.citations ?? [],
      relatedQuestions: data.related_questions ?? [],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error.",
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("AI backend is running.");
});