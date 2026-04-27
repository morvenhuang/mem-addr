import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static uploads
  app.use("/uploads", express.static(uploadsDir));

  // Mock Database
  const posts = [
    {
      id: "architecture-of-silence",
      title: "The Architecture of Silence: Finding Meaning in the Void.",
      excerpt: "In an age of fragmented attention, the act of deep reading becomes a radical gesture of intellectual autonomy. We explore how classical literature serves as an anchor.",
      content: `# The Architecture of Silence

To speak of silence is to acknowledge the space between breaths. In our modern digital landscape, the 'void' is often seen as an enemy—a failure of engagement or a loss of signal.

## The Monastic Core

The monastic corridors of the 12th century weren't designed to be "empty"; they were designed to be containers for resonance. When we strip away the visual noise of the 1px border and the vibrant notification badge, we are returning to a structural hierarchy that relies on tonal depth and spatial intentionality.

> "The world is full of things that are visible. The curator’s task is to make the invisible felt through the deliberate arrangement of absence."

### The Geometry of Pause

In typography, we call this white space. In music, we call it the rest. In a gallery, it is the distance between two canvases that allows each to breathe. Without the pause, the message becomes a monochromatic blur. 

* **Focus**: The ability to hold a single thread.
* **Resonance**: The depth of understanding.
* **Intentionality**: The choice of what to exclude.

\`\`\`javascript
const focus = (attention, noise) => attention / noise;
\`\`\`

Designers are often prohibited from using 1px solid borders to section off the UI in high-end editorial spaces. Why? Because borders create visual noise. Background shifts create visual flow.`,
      author: "Julian Thorne",
      category: "LITERATURE",
      date: "March 24, 2024",
      readTime: "12 min read",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAglzAaO2AbjnDBaH6BqX3A37FzUAf88r5AgoU0s8CceuMjN93Z8CI2V7YUgkWuZqDrk11t-kzUR1YE4THW4NagITf9I1KdWsS1ym2ROdV24c9AsSbxDDBuaKkWCsev0z_2JL5VhmKCKs5M2n8ov2bYN23dPkPhGwFhiElMTNK3N3iInYkbH506biTaoBJ6V4X40qapq_dAItsiIezPVxfQzIpX6zMeWlKchOw_kQVMz_XXW0q-iGIQq6AJU5WlZ6TN9gX1G6ki5vE",
      heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVlR9d-Xv2ZFeeXTryF1gpV9QRGg9cseOCP3ictNiX2RXmjuVg2VQ_li8UtagL9pJErhHb0o06s-5ljx_t7Kx6rA7EIRIQ-G8TX6TN90YW6ZQ8XxCLHKKtG0OIoOm3ztp9_IKHvq5mcJzOcbYrt2CE1XQyB-ZCUq9FkVV-Sx_NB3G9fLYYFof1QXIe8i8CHUlmBgHoXCN66cykcEBcY4jEnj482WHw4SPPWfE3J0OCNCVliYVK_3JjcEQnnMSuLS0FgVe1-Uz10sg"
    },
    {
      id: "ai-philosophy-boundaries",
      title: "大语言模型的哲学边界：意识与模拟的博弈",
      excerpt: "Exploring the fine line between sophisticated statistical prediction and the emergence of structural understanding in modern transformers.",
      content: `# 大语言模型的哲学边界

在复杂的统计预测与现代 Transformer 中结构化理解的出现之间，存在着一条微妙的分界线。

## 意识还是模拟？

我们是在构建能够理解世界的机器，还是仅仅在完善能够完美模仿理解的镜子？

1. **统计概率**: 模型通过预测下一个词来运行。
2. **潜在空间**: 知识在多维向量中的映射。
3. **人类感知**: 我们将意识赋予那些看起来聪明的系统。

> '语言是思维的边界，但代码是逻辑的骨架。'

### 技术的诗学

代码不仅仅是逻辑，它是一种新的文学形式——一种构建世界而不仅仅是描述世界的语法。`,
      author: "Mem Addr",
      category: "AI",
      date: "March 24, 2024",
      readTime: "15 min read",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBs2G3rLTNjhc9x9Dc3TbDuwu1lIL6qU-nNQ9eUgdO2DugU9uPwkMZ0RG-SdGLq6-7pBrCMbWIqnkq6pUcCr5IYkoMvS6gJTB7NG3EDGNVX26Xyv_4iJ_3j7dYUvEpHsp_xyJU8ne1gCxAPLNtp1ES4lLAfZcPljm5ntBFVUfgy5IPuIZGYNCu4Zf744NBuHvEJmp21nM-hInRsSKuJCcRa8-t_z9Ps2hCzMCDuBKkhMM1kkPNaqa3nhKjj8NjdZGn6GirF8T7daSA"
    }
  ];

  const categories = [
    { id: "literature", name: "Literature", count: 1, description: "Exploring the intersection of classical narratives and contemporary intellectual discourse." },
    { id: "ai", name: "AI", count: 1, description: "Dissecting the ethical and technical evolution of artificial intelligence." },
    { id: "programming", name: "Programming", count: 0, description: "The craft of code, systems architecture, and the philosophy of building digital tools." },
    { id: "python", name: "Python", count: 0, description: "Dynamic language for modern systems.", parentId: "programming" },
    { id: "java", name: "Java", count: 0, description: "Robust enterprise applications.", parentId: "programming" },
    { id: "thinking", name: "Thinking", count: 0, description: "Critical analysis of mental models, epistemology, and cognitive biases." },
    { id: "life", name: "Life", count: 0, description: "Reflections on intentionality, slow living, and the pursuit of a meaningful existence." }
  ];

  // API Routes
  app.get("/api/posts", (req, res) => {
    res.json(posts);
  });

  app.get("/api/posts/:id", (req, res) => {
    const post = posts.find(p => p.id === req.params.id);
    if (post) res.json(post);
    else res.status(404).json({ message: "Post not found" });
  });

  app.get("/api/categories", (req, res) => {
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const newCategory = { 
      ...req.body, 
      id: req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      count: 0
    };
    categories.push(newCategory);
    res.status(201).json(newCategory);
  });

  app.put("/api/categories/:id", (req, res) => {
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...req.body };
      res.json(categories[index]);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  });

  app.delete("/api/categories/:id", (req, res) => {
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      // Also clear parentId of children
      categories.forEach(c => {
        if (c.parentId === req.params.id) delete c.parentId;
      });
      categories.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  });

  app.post("/api/posts", (req, res) => {
    const newPost = { ...req.body, id: req.body.title.toLowerCase().replace(/\s+/g, '-') };
    posts.unshift(newPost);
    res.status(201).json(newPost);
  });

  app.put("/api/posts/:id", (req, res) => {
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...req.body };
      res.json(posts[index]);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });

  app.delete("/api/posts/:id", (req, res) => {
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      posts.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });

  app.post("/api/upload", (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "No image data" });

    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const extension = image.split(";")[0].split("/")[1];
      const filename = `upload_${Date.now()}.${extension}`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, base64Data, "base64");
      res.json({ url: `/uploads/${filename}` });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed" });
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
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
