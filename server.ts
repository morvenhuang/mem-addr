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

  // Persistence Setup
  const dataDir = path.join(process.cwd(), "data");
  const postsDir = path.join(dataDir, "posts");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const categoriesFile = path.join(dataDir, "categories.json");
  const profileFile = path.join(dataDir, "profile.json");

  // Load initial data
  const passwordFile = path.join(dataDir, "password.json");
  let posts: any[] = [];
  let categories: any[] = [];
  let profile: any = {
    name: "Morven",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    bio: "A lover of classical Chinese poetry and calligraphy, a data nomad wandering through bits and bytes, a traditional programmer and a vibe coder."
  };

  const loadPassword = (): string => {
    try {
      return fs.existsSync(passwordFile)
        ? JSON.parse(fs.readFileSync(passwordFile, "utf-8")).password
        : "admin123";
    } catch { return "admin123"; }
  };
    const savePassword = (pw: string) => fs.writeFileSync(passwordFile, JSON.stringify({ password: pw }, null, 2));

  const loadData = () => {
    try {
      // Load Categories
      if (fs.existsSync(categoriesFile)) {
        categories = JSON.parse(fs.readFileSync(categoriesFile, "utf-8"));
      }

      // Load Profile
      if (fs.existsSync(profileFile)) {
        profile = JSON.parse(fs.readFileSync(profileFile, "utf-8"));
      }

      // Load Posts (metadata from .json, content from .md)
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir);
        const jsonFiles = files.filter(f => f.endsWith(".json"));
        
        posts = jsonFiles.map(f => {
          const id = f.replace(".json", "");
          const jsonPath = path.join(postsDir, f);
          const mdPath = path.join(postsDir, `${id}.md`);
          
          try {
            const metadata = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
            
            // Migration: if content still exists in JSON, move it to MD
            if (metadata.content) {
              fs.writeFileSync(mdPath, metadata.content);
              delete metadata.content;
              fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
              console.log(`Migrated content of ${id} to .md file`);
            } else if (fs.existsSync(mdPath)) {
              metadata.content = fs.readFileSync(mdPath, "utf-8");
            }
            
            return metadata;
          } catch (e) {
            console.error(`Error loading post ${id}:`, e);
            return null;
          }
        }).filter(p => p !== null);
        
        posts.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.date || 0);
          const dateB = new Date(b.updatedAt || b.date || 0);
          return dateB.getTime() - dateA.getTime();
        });
      }

      // Old legacy migration (posts.json -> individual files)
      const oldPostsFile = path.join(dataDir, "posts.json");
      if (fs.existsSync(oldPostsFile) && posts.length === 0) {
        const oldPosts = JSON.parse(fs.readFileSync(oldPostsFile, "utf-8"));
        oldPosts.forEach((post: any) => {
          const { content, ...metadata } = post;
          fs.writeFileSync(path.join(postsDir, `${post.id}.json`), JSON.stringify(metadata, null, 2));
          if (content) {
            fs.writeFileSync(path.join(postsDir, `${post.id}.md`), content);
          }
          posts.push(post);
        });
        fs.unlinkSync(oldPostsFile);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const saveCategories = () => {
    try {
      fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
    } catch (err) {
      console.error("Error saving categories:", err);
    }
  };

  const savePost = (post: any) => {
    try {
      const { content, ...metadata } = post;
      const jsonPath = path.join(postsDir, `${post.id}.json`);
      const mdPath = path.join(postsDir, `${post.id}.md`);
      
      fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
      fs.writeFileSync(mdPath, content || "");
    } catch (err) {
      console.error(`Error saving post ${post.id}:`, err);
    }
  };

  const deletePostFile = (id: string) => {
    try {
      const jsonPath = path.join(postsDir, `${id}.json`);
      const mdPath = path.join(postsDir, `${id}.md`);
      if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
      if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
    } catch (err) {
      console.error(`Error deleting post files ${id}:`, err);
    }
  };

  loadData();

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
    const catsWithCounts = categories.map(cat => {
      const postCount = posts.filter(p => (p.category || "").toLowerCase() === cat.id.toLowerCase()).length;
      return { ...cat, count: postCount };
    });
    res.json(catsWithCounts);
  });

  app.post("/api/categories", (req, res) => {
    const newCategory = { 
      ...req.body, 
      id: req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      count: 0
    };
    categories.push(newCategory);
    saveCategories();
    res.status(201).json(newCategory);
  });

  app.put("/api/categories/:id", (req, res) => {
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...req.body };
      saveCategories();
      res.json(categories[index]);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  });

  app.delete("/api/categories/:id", (req, res) => {
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      
      categories.splice(index, 1);
      saveCategories();
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  });

  app.post("/api/posts", (req, res) => {
    const newId = req.body.title.toLowerCase().replace(/\s+/g, '-');
    const newPost = { ...req.body, id: newId };
    posts.unshift(newPost);
    savePost(newPost);
    res.status(201).json(newPost);
  });

  app.put("/api/posts/:id", (req, res) => {
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...req.body };
      savePost(posts[index]);
      res.json(posts[index]);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });

  app.delete("/api/posts/:id", (req, res) => {
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      const postId = posts[index].id;
      posts.splice(index, 1);
      deletePostFile(postId);
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });

  app.get("/api/profile", (req, res) => {
    res.json(profile);
  });

  app.put("/api/profile", (req, res) => {
    profile = { ...profile, ...req.body };
    fs.writeFileSync(profileFile, JSON.stringify(profile, null, 2));
    res.json(profile);
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


  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    if (password === loadPassword()) {
      return res.json({ success: true });
    }
    res.status(401).json({ success: false });
  });

  app.put("/api/auth/password", (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (currentPassword !== loadPassword()) {
      return res.status(403).json({ message: "Current password is incorrect" });
    }
    savePassword(newPassword);
    res.json({ success: true });

  app.get("/api/unsplash/search", async (req, res) => {
    const query = req.query.query as string;
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!query) return res.status(400).json({ message: "Query required" });
    if (!accessKey) return res.status(500).json({ message: "UNSPLASH_ACCESS_KEY not configured on server" });
    try {
      const params = new URLSearchParams({
        query,
        per_page: "12",
        orientation: "landscape",
      });
      const apiRes = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
        headers: { Authorization: `Client-ID ${accessKey}` },
      });
      if (!apiRes.ok) {
        return res.status(apiRes.status).json({ message: "Unsplash API error" });
      }
      const data = await apiRes.json();
      const results = (data.results || []).map((img: any) => ({
        id: img.id,
        description: img.description || img.alt_description || "",
        thumb: img.urls.thumb,
        small: img.urls.small,
        regular: img.urls.regular,
        full: img.urls.full,
        raw: img.urls.raw,
        author: img.user.name,
        authorLink: img.user.links.html,
        width: img.width,
        height: img.height,
      }));
      res.json({ results, total: data.total });
    } catch (err) {
      console.error("Unsplash search error:", err);
      res.status(500).json({ message: "Search failed" });
    }
  });  });  // Vite middleware for development
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
  }).on('error', (err) => {
    console.error('Server failed to start:', err);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
