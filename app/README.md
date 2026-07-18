# Production-Ready E-Commerce Platform

A full-stack, scalable, and modern e-commerce platform built with React (Next.js) for the frontend, Node.js (Express) for the backend, PostgreSQL for primary data storage, and Redis for caching.

# Preview
---
<img width="1366" height="692" alt="image" src="https://github.com/user-attachments/assets/65a6a1ac-fa21-4ed9-a961-977b8bbaa54c" />
<img width="1365" height="700" alt="image" src="https://github.com/user-attachments/assets/1b791c95-1f5f-4109-9872-8b1d641cc3b7" />
<img width="1361" height="687" alt="image" src="https://github.com/user-attachments/assets/b5a425d9-56cf-4d32-9262-26692235c7a8" />
<img width="1364" height="690" alt="image" src="https://github.com/user-attachments/assets/57fc7e97-8fff-49a1-a745-1bf9eef6d3a9" />
<img width="1365" height="698" alt="image" src="https://github.com/user-attachments/assets/89805f92-0d27-4c91-b4ab-4a18bf943fcd" />

---
## Architecture

* **Frontend (`/frontend`)**: A modern React application built using the Next.js App Router. It features a responsive, premium glassmorphism design with Vanilla CSS.
* **Backend (`/backend`)**: A robust Express.js REST API using Sequelize ORM to interact with PostgreSQL. It handles authentication (JWT & bcrypt), product catalog management, and order processing.
* **Database**: PostgreSQL (relational data).
* **Caching**: Redis (caching frequent catalog queries for high performance).

## Features

- **User Authentication**: Secure JWT-based login and signup system.
- **Product Catalog**: High-performance product listing cached via Redis.
- **Shopping Cart**: Client-side cart management.
- **Checkout Process**: Secure backend order processing and total calculation.
- **Dockerized**: Fully containerized setup for easy deployment.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed on your machine.
- Node.js (if running locally without Docker).

## Getting Started (Docker - Recommended)

The easiest way to get the entire stack (Database, Cache, Backend, and Frontend) running is via Docker Compose.

1. Clone this repository or navigate to the project root.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
3. The platform will be available at:
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:5000

## Running Locally (Without Docker)

If you prefer to run the services individually on your host machine:

### 1. Start Services
Make sure you have an instance of **PostgreSQL** (running on port 5432) and **Redis** (running on port 6379) active on your machine.

### 2. Run Backend
```bash
cd backend
npm install
npm start
```
*The database models will automatically sync on server startup.*

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Default environment variables are baked into the `docker-compose.yml` and backend files. For production, you should override these:
- `JWT_SECRET`: Secret key for signing tokens.
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: Database credentials.
- `REDIS_URL`: URL to your Redis instance.

