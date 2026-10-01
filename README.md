# E-Commerce Website & REST API

A lightweight, full-stack ready e-commerce backend built with Node.js, Express, SQLite3, and JSON Web Tokens (JWT). This project provides authentication, user management, and persistent data storage tailored for e-commerce platforms.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Products](#products)
  - [Cart & Orders](#cart--orders)
- [Database Overview](#database-overview)
- [License](#license)

---

## Features

- **Authentication & Security**: User signup, login, and protected routes using `bcryptjs` for password hashing and `jsonwebtoken` (JWT) for stateless sessions.
- **Persistent Storage**: Lightweight, file-based relational database setup using `sqlite3` (`ecommerce.db`).
- **RESTful Endpoints**: Modular controllers and routes for catalog browsing, user accounts, and transactions.
- **Middleware Integration**: Fully configured for CORS handling, cookie parsing, and JSON request processing.

---

## Tech Stack

- **Runtime Environment**: Node.js
- **Server Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Utilities & Middleware**: `cors`, `cookie-parser`, `body-parser`

---

## Directory Structure

```text
ecommerce-website-main/
├── db.js                 # SQLite database connection & schema initialization
├── ecommerce.db          # SQLite relational database file
├── server.js             # Express application entry point
├── package.json          # Project dependencies & run scripts
└── README.md             # Project documentation
