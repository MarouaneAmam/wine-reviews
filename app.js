const express = require("express");
const path = require("path");
const nunjucks = require("nunjucks");
const session = require("express-session");
const bcrypt = require("bcrypt");
const showdown = require("showdown");

const db = require("./db");

const app = express();
const PORT = 3000;

// Markdown converter (admin writes Markdown, we display HTML)
const md = new showdown.Converter({
  tables: true,
  strikethrough: true,
  simpleLineBreaks: true,
});

// ✅ Middleware = “things that run before routes”
app.use(express.urlencoded({ extended: true })); // read form data
app.use(express.static(path.join(__dirname, "public"))); // serve CSS

// Session = keeps users logged in
app.use(
  session({
    secret: "change-this-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Make user available inside templates (.njk)
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Nunjucks templates
nunjucks.configure("views", { autoescape: true, express: app });

// Helpers to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "admin") return res.status(403).send("Admin only");
  next();
}

/* =======================
   ROUTES (pages + actions)
   ======================= */

// Home: list wines + search/filter
app.get("/", (req, res) => {
  const q = (req.query.q || "").trim();
  const domainId = req.query.domain_id ? Number(req.query.domain_id) : null;

  const domains = db.prepare("SELECT id, name FROM domains ORDER BY name ASC").all();

  let sql = `
    SELECT
      w.id, w.name, w.year, w.grape,
      d.name AS domain_name,
      COUNT(r.id) AS reviews_count,
      ROUND(AVG(r.rating), 2) AS avg_rating
    FROM wines w
    JOIN domains d ON d.id = w.domain_id
    LEFT JOIN reviews r ON r.wine_id = w.id
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    sql += ` AND (w.name LIKE ? OR d.name LIKE ? OR w.grape LIKE ?) `;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (domainId) {
    sql += ` AND w.domain_id = ? `;
    params.push(domainId);
  }

  sql += ` GROUP BY w.id ORDER BY w.created_at DESC `;
  const wines = db.prepare(sql).all(...params);

  res.render("index.njk", {
    title: "Wine Reviews",
    wines,
    domains,
    filters: { q, domain_id: domainId || "" },
  });
});

// Wine detail + reviews
app.get("/wines/:id", (req, res) => {
  const wineId = Number(req.params.id);

  const wine = db.prepare(`
    SELECT w.*, d.name AS domain_name, d.region, d.country
    FROM wines w
    JOIN domains d ON d.id = w.domain_id
    WHERE w.id = ?
  `).get(wineId);

  if (!wine) return res.status(404).send("Wine not found");

  const reviews = db.prepare(`
    SELECT r.id, r.rating, r.comment, r.created_at, u.username, u.id AS user_id
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.wine_id = ?
    ORDER BY r.created_at DESC
  `).all(wineId);

  const stats = db.prepare(`
    SELECT COUNT(*) AS count, ROUND(AVG(rating), 2) AS avg
    FROM reviews
    WHERE wine_id = ?
  `).get(wineId);

  let myReview = null;
  if (req.session.user) {
    myReview = db.prepare(`
      SELECT id, rating, comment
      FROM reviews
      WHERE wine_id = ? AND user_id = ?
    `).get(wineId, req.session.user.id);
  }

  const description_html = wine.description_md ? md.makeHtml(wine.description_md) : "";

  res.render("wine_detail.njk", {
    title: wine.name,
    wine,
    description_html,
    reviews,
    stats: { count: stats.count || 0, avg: stats.avg || null },
    myReview,
  });
});

/* ===== AUTH ===== */

app.get("/register", (req, res) => res.render("register.njk", { title: "Inscription" }));

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).render("register.njk", {
      title: "Inscription",
      error: "Username (>=3) et mot de passe (>=6) requis.",
    });
  }

  const exists = db.prepare("SELECT id FROM users WHERE username=?").get(username);
  if (exists) {
    return res.status(400).render("register.njk", {
      title: "Inscription",
      error: "Ce nom d'utilisateur est déjà pris.",
    });
  }

  const password_hash = await bcrypt.hash(password, 10);
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')").run(
    username,
    password_hash
  );

  res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login.njk", { title: "Connexion" }));

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT id, username, password_hash, role FROM users WHERE username=?")
    .get(username);

  if (!user) {
    return res.status(400).render("login.njk", { title: "Connexion", error: "Identifiants invalides." });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(400).render("login.njk", { title: "Connexion", error: "Identifiants invalides." });
  }

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.redirect("/");
});

app.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/")));


/* ===== REVIEWS ===== */

app.post("/wines/:id/review", requireLogin, (req, res) => {
  const wineId = Number(req.params.id);
  const userId = req.session.user.id;

  const rating = Number(req.body.rating);
  const comment = (req.body.comment || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).send("Rating must be 1..5");
  }

  const existing = db.prepare("SELECT id FROM reviews WHERE wine_id=? AND user_id=?").get(wineId, userId);

  if (existing) {
    db.prepare(`UPDATE reviews SET rating=?, comment=?, created_at=datetime('now') WHERE id=?`)
      .run(rating, comment || null, existing.id);
  } else {
    db.prepare(`INSERT INTO reviews (wine_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`)
      .run(wineId, userId, rating, comment || null);
  }

  res.redirect(`/wines/${wineId}`);
});

app.post("/reviews/:id/delete", requireLogin, (req, res) => {
  const reviewId = Number(req.params.id);

  const review = db.prepare("SELECT id, wine_id, user_id FROM reviews WHERE id=?").get(reviewId);
  if (!review) return res.status(404).send("Review not found");

  const isOwner = req.session.user.id === review.user_id;
  const isAdmin = req.session.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).send("Forbidden");

  db.prepare("DELETE FROM reviews WHERE id=?").run(reviewId);
  res.redirect(`/wines/${review.wine_id}`);
});

/* ===== MY REVIEWS ===== */

app.get("/me/reviews", requireLogin, (req, res) => {
  const userId = req.session.user.id;

  const myReviews = db.prepare(`
    SELECT r.id, r.rating, r.comment, r.created_at,
           w.id AS wine_id, w.name AS wine_name, w.year,
           d.name AS domain_name
    FROM reviews r
    JOIN wines w ON w.id = r.wine_id
    JOIN domains d ON d.id = w.domain_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(userId);

  res.render("my_reviews.njk", { title: "Mes avis", myReviews });
});

/* ===== ADMIN ===== */

app.get("/admin", requireAdmin, (req, res) => res.redirect("/admin/wines"));

app.get("/admin/domains", requireAdmin, (req, res) => {
  const domains = db.prepare("SELECT * FROM domains ORDER BY created_at DESC").all();
  res.render("admin_domains.njk", { title: "Admin - Domains", domains });
});

app.get("/admin/domains/new", requireAdmin, (req, res) => {
  res.render("admin_domain_form.njk", { title: "New Domain", domain: null });
});

app.post("/admin/domains/new", requireAdmin, (req, res) => {
  const { name, region, country } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).render("admin_domain_form.njk", {
      title: "New Domain",
      domain: { name, region, country },
      error: "Name required.",
    });
  }

  db.prepare("INSERT INTO domains (name, region, country) VALUES (?, ?, ?)").run(
    name.trim(),
    region?.trim() || null,
    country?.trim() || null
  );

  res.redirect("/admin/domains");
});

app.get("/admin/domains/:id/edit", requireAdmin, (req, res) => {
  const domain = db.prepare("SELECT * FROM domains WHERE id=?").get(Number(req.params.id));
  if (!domain) return res.status(404).send("Domain not found");
  res.render("admin_domain_form.njk", { title: "Edit Domain", domain });
});

app.post("/admin/domains/:id/edit", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { name, region, country } = req.body;

  db.prepare("UPDATE domains SET name=?, region=?, country=? WHERE id=?").run(
    name.trim(),
    region?.trim() || null,
    country?.trim() || null,
    id
  );

  res.redirect("/admin/domains");
});

app.post("/admin/domains/:id/delete", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM domains WHERE id=?").run(Number(req.params.id));
  res.redirect("/admin/domains");
});

app.get("/admin/wines", requireAdmin, (req, res) => {
  const wines = db.prepare(`
    SELECT w.id, w.name, w.year, w.grape, d.name AS domain_name
    FROM wines w JOIN domains d ON d.id = w.domain_id
    ORDER BY w.created_at DESC
  `).all();

  res.render("admin_wines.njk", { title: "Admin - Wines", wines });
});

app.get("/admin/wines/new", requireAdmin, (req, res) => {
  const domains = db.prepare("SELECT id, name FROM domains ORDER BY name ASC").all();
  res.render("admin_wine_form.njk", { title: "New Wine", wine: null, domains });
});

app.post("/admin/wines/new", requireAdmin, (req, res) => {
  const { domain_id, name, year, grape, description_md } = req.body;

  db.prepare(`
    INSERT INTO wines (domain_id, name, year, grape, description_md)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    Number(domain_id),
    name.trim(),
    year ? Number(year) : null,
    grape?.trim() || null,
    description_md || null
  );

  res.redirect("/admin/wines");
});

app.get("/admin/wines/:id/edit", requireAdmin, (req, res) => {
  const wine = db.prepare("SELECT * FROM wines WHERE id=?").get(Number(req.params.id));
  const domains = db.prepare("SELECT id, name FROM domains ORDER BY name ASC").all();
  res.render("admin_wine_form.njk", { title: "Edit Wine", wine, domains });
});

app.post("/admin/wines/:id/edit", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { domain_id, name, year, grape, description_md } = req.body;

  db.prepare(`UPDATE wines SET domain_id=?, name=?, year=?, grape=?, description_md=? WHERE id=?`).run(
    Number(domain_id),
    name.trim(),
    year ? Number(year) : null,
    grape?.trim() || null,
    description_md || null,
    id
  );

  res.redirect("/admin/wines");
});

app.post("/admin/wines/:id/delete", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM wines WHERE id=?").run(Number(req.params.id));
  res.redirect("/admin/wines");
});

// Start server
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
