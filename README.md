# 🍷 Wine Reviews

A **Server-Side Rendering (SSR)** web application built with **Node.js, Express, and SQLite**.  
It allows users to browse wines, filter by domain, and leave reviews.

---

## 🎯 Project Description

Wine Reviews is an educational web application designed to:
- manage a wine database
- handle user authentication
- distinguish between **user** and **admin** roles
- demonstrate a complete web architecture (backend + frontend + database)

Pages are rendered **server-side** (SSR), without using a frontend framework.

---

## ✨ Features

### 👤 User
- Search wines (name / domain)
- Filter by domain
- View wine details
- Add / edit / delete reviews (rating 1 to 5)
- **My reviews** page

### 🔐 Admin
- Manage domains (CRUD)
- Manage wines (CRUD)
- Wine descriptions written in **Markdown**
- Protected routes (Admin only)

---

## 🧱 Architecture

Browser
↓
Nunjucks (SSR)
↓
Express (Node.js)
↓
SQLite

yaml
Copier le code

---

## 🗂️ Project Structure

wine-reviews/
├── app.js
├── db.js
├── make_admin.js
├── database.sqlite
├── package.json
├── package-lock.json
├── public/
│ ├── style.css
│ └── img/
└── views/
├── layout.njk
├── index.njk
├── login.njk
├── register.njk
├── wine_detail.njk
├── my_reviews.njk
├── admin_domains.njk
└── admin_wines.njk

yaml
Copier le code

---

## 🛠️ Technologies Used

- Node.js
- Express
- Nunjucks
- SQLite
- express-session
- bcrypt
- showdown
- nodemon

---

## 🚀 Installation

```bash
npm install
▶️ Run the Application
bash
Copier le code
npm run dev
Then open:

arduino
Copier le code
http://localhost:3000
🔐 Admin Access
Create a user account

Edit the make_admin.js file

Run:

bash
Copier le code
node make_admin.js
Log in again → Admin access enabled

🔗 Main Routes
/ : Home

/login : Login

/register : Register

/me/reviews : My reviews

/admin/domains : Domain management

/admin/wines : Wine management

📌 Notes
node_modules is ignored via .gitignore

Database is local (SQLite)

Educational project

👤 Author
Marouane Amam
University project – Node.js / Express / SQLite

yaml
Copier le code

---

### 3️⃣ Click **Commit changes**
Commit message:
