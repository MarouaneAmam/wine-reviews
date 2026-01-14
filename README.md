# 🍷 Wine Reviews (Node.js + Express + SQLite)

Application web (SSR) permettant de **rechercher des vins**, **filtrer par domaine**, consulter une fiche vin et **laisser des avis (notes + commentaires)**.

---

## ✨ Fonctionnalités

### Côté utilisateur
- 🔎 Recherche par nom / domaine / cépage
- 🏷️ Filtre par domaine
- ⭐ Ajout / modification / suppression d’avis (1 à 5)
- 📌 Page **My reviews** (avis de l’utilisateur connecté)

### Côté admin
- 🏛️ CRUD Domaines (ajouter / modifier / supprimer)
- 🍾 CRUD Vins (ajouter / modifier / supprimer)
- 📝 Description en **Markdown** pour la fiche vin
- 🔐 Accès protégé (Admin only)

---

## 🧱 Architecture (simple & claire)

- **Frontend SSR** : Nunjucks (`views/*.njk`)
- **Backend** : Express (`app.js`)
- **Base de données** : SQLite (`database.sqlite`)
- **Auth** : sessions + bcrypt

> Le site est rendu côté serveur (Server-Side Rendering), pas besoin de framework front.

---

## 🗂️ Structure du projet

