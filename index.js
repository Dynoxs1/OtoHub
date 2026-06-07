import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

const app = express();
const SECRET = "otohub_secret_key";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// AUTH MIDDLEWARE
function auth(req, res, next) {
  try {
    const token = req.headers.authorization;
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(401);
  }
}

// REGISTER
app.post("/register", (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);

  db.run(
    "INSERT INTO users(username,password) VALUES(?,?)",
    [req.body.username, hash],
    (err) => {
      if (err) return res.sendStatus(400);
      res.json({ ok: true });
    }
  );
});

// LOGIN
app.post("/login", (req, res) => {
  db.get(
    "SELECT * FROM users WHERE username=?",
    [req.body.username],
    (err, user) => {
      if (!user) return res.sendStatus(401);

      const ok = bcrypt.compareSync(req.body.password, user.password);
      if (!ok) return res.sendStatus(401);

      const token = jwt.sign({ id: user.id }, SECRET);
      res.json({ token });
    }
  );
});

// POST CREATE
app.post("/posts", auth, (req, res) => {
  db.run(
    "INSERT INTO posts(userId,text) VALUES(?,?)",
    [req.user.id, req.body.text],
    () => res.json({ ok: true })
  );
});

// FEED
app.get("/posts", (req, res) => {
  db.all(
    `
    SELECT posts.*, users.username,
    (SELECT COUNT(*) FROM likes WHERE likes.postId = posts.id) as likes
    FROM posts
    JOIN users ON users.id = posts.userId
    ORDER BY posts.id DESC
    `,
    [],
    (err, rows) => res.json(rows)
  );
});

// LIKE
app.post("/like", auth, (req, res) => {
  db.run(
    "INSERT INTO likes(userId,postId) VALUES(?,?)",
    [req.user.id, req.body.postId],
    () => res.json({ ok: true })
  );
});

app.listen(3000, () => {
  console.log("OtoHub running on http://localhost:3000");
});
