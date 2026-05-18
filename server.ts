import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API route for AI Bible Insights
  app.post("/api/bible/insights", async (req, res) => {
    try {
      const { book, chapter, verses, text } = req.body;
      
      let passage = `${book} ${chapter}`;
      if (verses && verses.length > 0) {
        passage += `:${verses.sort((a: number, b: number) => a - b).join(', ')}`;
      }

      const prompt = `Provide spiritual and historical insights for the following Bible passage:
      
      Passage: ${passage}
      Text: "${text}"
      
      Give me:
      1. A short summary of the context.
      2. 3 key spiritual takeaways.
      3. A practical application for daily life.
      
      Format as JSON with keys: context, takeaways (array), application.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
