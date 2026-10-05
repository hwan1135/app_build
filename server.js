const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json({ limit: "20mb" }));
app.use(express.static("public"));

app.post("/api/detect-wine", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in environment."
      });
    }

    const { imageDataUrl } = req.body;

    if (!imageDataUrl) {
      return res.status(400).json({
        error: "imageDataUrl is required."
      });
    }

    const prompt = `
You are identifying a wine bottle from a user-provided label image.

Return ONLY valid JSON with this exact schema:
{
  "wineName": "string",
  "producer": "string",
  "vintage": "string",
  "confidence": "low|medium|high",
  "labelImageUrl": "string",
  "notes": "string"
}

Rules:
- Use the visible label image to identify the bottle as best as possible.
- If the exact wine name is unclear, provide the best likely answer.
- If vintage is unclear, return an empty string.
- If you do not know an authoritative external label image URL, return an empty string for labelImageUrl.
- notes should be a brief explanation of what was recognized from the image.
- Return JSON only. No markdown.
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt
              },
              {
                type: "input_image",
                image_url: imageDataUrl,
                detail: "auto"
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "OpenAI API request failed",
        details: errorText
      });
    }

    const data = await response.json();

    const outputText =
      data.output_text ||
      extractOutputText(data) ||
      "";

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch (err) {
      return res.status(500).json({
        error: "Model response was not valid JSON.",
        raw: outputText
      });
    }

    res.json(parsed);
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

function extractOutputText(apiResponse) {
  try {
    if (!apiResponse.output || !Array.isArray(apiResponse.output)) {
      return "";
    }

    let text = "";

    for (const item of apiResponse.output) {
      if (item.type === "message" && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (content.type === "output_text" && content.text) {
            text += content.text;
          }
        }
      }
    }

    return text;
  } catch {
    return "";
  }
}

app.listen(PORT, () => {
  console.log(`Wine Cellar app running at http://localhost:${PORT}`);
});