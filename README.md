🍷 Wine Reviews

A Server-Side Rendering (SSR) web application built with Node.js, Express, and SQLite.
This project allows users to browse wines, filter by domain, and leave reviews (ratings + comments).

🎯 Project Description

Wine Reviews is an educational web application created to demonstrate a complete full-stack web architecture:

Backend with Node.js and Express

Server-side rendered frontend using Nunjucks

Local relational database with SQLite

Authentication and role management (User / Admin)

The application does not use a frontend framework. All pages are rendered on the server.

✨ Features
👤 User Features

Search wines by name or domain

Filter wines by domain

View detailed wine pages

Add, edit, and delete reviews (rating from 1 to 5)

Personal page: My Reviews

🔐 Admin Features

Create, edit, and delete domains

Create, edit, and delete wines

Write wine descriptions using Markdown

Access protected admin pages (Admin only)

🧱 Application Architecture

Browser
↓
Nunjucks templates (SSR)
↓
Express (Node.js backend)
↓
SQLite database

🗂️ Project Structure

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
│ ├── bottle.jpg
│ ├── corks.jpg
│ └── hero.jpg
└── views/
├── layout.njk
├── index.njk
├── login.njk
├── register.njk
├── wine_detail.njk
├── my_reviews.njk
├── admin_domains.njk
├── admin_domain_form.njk
├── admin_wines.njk
└── admin_wine_form.njk

🛠️ Technologies Used

Node.js

Express

Nunjucks (SSR templates)

SQLite

express-session

bcrypt

showdown (Markdown to HTML)

nodemon (development)

🚀 Installation

Install Node.js (LTS)

Clone the repository

Install dependencies:

npm install

▶️ Run the Application

Development mode (auto-reload):

npm run dev

Then open your browser at:

http://localhost:3000

🔐 Admin Access

Register a user via /register

Open make_admin.js

Set your username inside the file

Run:

node make_admin.js

Log in again → Admin access enabled

🔗 Main Routes

/ → Home

/login → Login

/register → Register

/me/reviews → User reviews

/admin/domains → Domain management

/admin/wines → Wine management

📌 Notes

node_modules is excluded using .gitignore

The database is local (SQLite)

This is an educational / academic project

👤 Author

Marouane Amam
University project – Node.js / Express / SQLite
