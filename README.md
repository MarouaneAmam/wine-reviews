🍷 Wine Reviews

A Server-Side Rendering (SSR) web application built with Node.js, Express, and SQLite.
The platform allows users to browse wines, filter them by domain, and leave reviews (ratings and comments).

This project was developed as an academic full-stack web application, focusing on backend logic, database management, and server-rendered views.

📌 Project Overview

Wine Reviews is a complete CRUD-based web application with authentication and role management.

It demonstrates:

Backend development with Express

Server-side rendering with Nunjucks

Persistent storage using SQLite

User authentication and authorization (User / Admin)

No frontend framework is used — all pages are rendered on the server.

✨ Features
👤 User Features

Search wines by name, domain, or grape

Filter wines by domain

View detailed wine pages

Add, edit, and delete reviews (rating from 1 to 5)

View personal reviews in My Reviews

🔐 Admin Features

Create, edit, and delete wine domains

Create, edit, and delete wines

Write wine descriptions using Markdown

Access restricted admin pages (Admin only)

🧱 Application Architecture

Client (Browser)
→ Server-side templates (Nunjucks)
→ Express backend (Node.js)
→ SQLite database

The application follows a simple MVC-like architecture:

Views: Nunjucks templates

Controllers: Express routes

Model: SQLite database

🗂️ Project Structure

wine-reviews

app.js → Main server and routes

db.js → Database connection and queries

make_admin.js → Script to promote a user to admin

database.sqlite → SQLite database

package.json → Project configuration and dependencies

package-lock.json → Dependency lock file

public

style.css → Global styling

img → Images used by the site

views

layout.njk → Base layout

index.njk → Home page

login.njk → Login page

register.njk → Registration page

wine_detail.njk → Wine detail page

my_reviews.njk → User reviews

admin_domains.njk → Admin domain list

admin_domain_form.njk → Domain form

admin_wines.njk → Admin wine list

admin_wine_form.njk → Wine form

🛠️ Technologies Used

Node.js

Express

Nunjucks (SSR templating)

SQLite

express-session

bcrypt (password hashing)

showdown (Markdown rendering)

nodemon (development auto-reload)

🚀 Installation

Install Node.js (LTS)

Clone the repository

Install dependencies:

npm install

▶️ Run the Application

Development mode (automatic reload):

npm run dev

Open in your browser:

http://localhost:3000

🔐 Admin Setup

Create a user account from /register

Open make_admin.js

Replace the username with your own

Run:

node make_admin.js

Log in again — admin access is now enabled

🔗 Main Routes

/ → Home page

/login → Login

/register → Register

/me/reviews → User reviews

/admin/domains → Manage domains

/admin/wines → Manage wines

📸 Screenshots (Optional)

You can add screenshots by creating a screenshots/ folder and inserting:




📌 Notes

node_modules is excluded via .gitignore

SQLite database is local

Designed for learning and demonstration purposes

👤 Author

Marouane Amam
Academic project — Full-Stack Web Development
Node.js • Express • SQLite
