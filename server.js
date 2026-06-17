import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// 强制返回首页
app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.get("/index.html", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question, r, angle, area } = req.body;

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个初中数学老师，用中文回答，讲得简单清楚，不要太长。"
        },
        {
          role: "user",
          content: `
当前知识点：扇形面积
半径 r = ${r}
圆心角 θ = ${angle}
面积 ≈ ${area}

学生问题：${question}

请结合当前动态图参数讲解。
          `
        }
      ],
      temperature: 0.3,
    });

    res.json({
      answer: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI请求失败，请检查 DeepSeek API Key、余额或网络。"
    });
  }
});

app.listen(3001, () => {
  console.log("服务已启动：http://localhost:3001");
});