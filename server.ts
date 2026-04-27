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

  // Load initial data
  let posts: any[] = [];
  let categories: any[] = [];

  const loadData = () => {
    try {
      // Load Categories
      if (fs.existsSync(categoriesFile)) {
        categories = JSON.parse(fs.readFileSync(categoriesFile, "utf-8"));
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
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
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
    // Dynamically calculate counts based on current posts
    const catsWithCounts = categories.map(cat => {
      // Helper function to get all descendant IDs
      const getDescendants = (id: string): string[] => {
        const searchId = id.toLowerCase();
        const children = categories.filter(c => (c.parentId || "").toLowerCase() === searchId);
        let ids = [searchId];
        children.forEach(child => {
          ids = [...ids, ...getDescendants(child.id)];
        });
        return ids;
      };

      const descendantIds = getDescendants(cat.id);
      const postCount = posts.filter(p => 
        descendantIds.includes((p.category || "").toLowerCase())
      ).length;

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
      // Also clear parentId of children
      categories.forEach(c => {
        if (c.parentId === req.params.id) delete c.parentId;
      });
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
