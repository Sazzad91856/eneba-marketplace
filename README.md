# Eneba Marketplace

A full-stack gaming marketplace inspired by Eneba, built as an internship assignment.

## Project Overview

Eneba Marketplace is a web application where users can browse digital games, compare offers from different sellers, add products to their cart, and place simulated orders.

The application uses a React and TypeScript frontend, a PHP REST API backend, and Supabase PostgreSQL for database storage.

## Technologies Used

**Frontend**
- React
- TypeScript
- Vite
- React Router
- CSS
- Lucide React

**Backend**
- PHP
- REST API
- PDO

**Database**
- Supabase
- PostgreSQL

## Features

- Homepage with dynamic content from the backend
- Game catalog with search, filters and sorting
- Product details and multiple seller offers
- Shopping cart with seller-specific offers
- User registration and login
- PHP session-based authentication
- Checkout with simulated payment
- Order confirmation
- Order history for authenticated users
- Supabase database integration

## Project Structure

```text
eneba-marketplace/
├── backend/
│   ├── api/
│   ├── config/
│   ├── .gitignore
│   └── index.php
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Sazzad91856/eneba-marketplace.git
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

http://localhost:5173

### 3. Configure the backend

Create a `backend/.env` file with your own Supabase database connection settings.

Do not upload this file to GitHub.

### 4. Start the PHP backend

Open another terminal:

```bash
cd backend
php -S localhost:8000
```

Backend runs at:

http://localhost:8000

## Payment Information

This project uses a simulated checkout process. It does not process real payments or collect actual card details.

## Current Status

This project was developed as a full-stack gaming marketplace demonstration. Features have been tested locally. Public deployment and production payment integration are not yet implemented.

## Repository

https://github.com/Sazzad91856/eneba-marketplace
