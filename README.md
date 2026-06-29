# Protect Assistance Backend

Backend API built with NestJS, PostgreSQL, Prisma and JWT authentication.

Current completed parts:

- EPIC 0: Backend setup, health check and Swagger.
- EPIC 1: PostgreSQL database setup with Prisma.
- EPIC 2: Authentication and users with JWT.

---

## Installation and setup

### 1. Clone the project

```bash
git clone https://github.com/zaghla-yassine/ProtectAssistance_Backend.git
cd ProtectAssistance_Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the `.env` file

Create a `.env` file at the root of the project and add:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://protect_user:protect_password@127.0.0.1:55432/protect_assistance_db?schema=public"

JWT_SECRET="protect_assistance_dev_secret_change_me"
JWT_EXPIRES_IN="1d"
```

### 4. Start PostgreSQL with Docker

Make sure Docker Desktop is running, then run:

```bash
docker compose up -d
```

Check that the database container is running:

```bash
docker ps
```

### 5. Run Prisma commands

```bash
npx prisma validate
npx prisma migrate dev
npx prisma generate
```

Optional: open Prisma Studio to view the database tables:

```bash
npx prisma studio
```

Prisma Studio will open at:

```text
http://localhost:5555
```

### 6. Start the backend

```bash
npm run start:dev
```

The backend will run at:

```text
http://localhost:3000
```

---

## Swagger

Swagger is available at:

```text
http://localhost:3000/api/docs
```

---

## Test EPIC 0

### Health check

```http
GET /api/v1/health
```

Expected result: the API returns status `ok`.

---

## Test EPIC 1

### Database health check

```http
GET /api/v1/health/db
```

Expected result: the API returns database status `connected`.

---

## Test EPIC 2

### 1. Register a user

```http
POST /api/v1/auth/register
```

Example body:

```json
{
  "firstName": "Yassine",
  "lastName": "Zaghla",
  "email": "yassine.test@example.com",
  "phone": "+21612345678",
  "password": "Password123!"
}
```

Expected result: the API returns an `accessToken` and the created user.

---

### 2. Login

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "yassine.test@example.com",
  "password": "Password123!"
}
```

Expected result: the API returns an `accessToken`.

---

### 3. Test authenticated user

Copy the `accessToken`, then in Swagger click on:

```text
Authorize
```

Enter:

```text
Bearer YOUR_ACCESS_TOKEN
```

Then test:

```http
GET /api/v1/auth/me
```

Expected result: the API returns the connected user information.

---

## Useful commands

Build the project:

```bash
npm run build
```

Check Prisma schema:

```bash
npx prisma validate
```

Check migration status:

```bash
npx prisma migrate status
```

Start Docker database:

```bash
docker compose up -d
```

Stop Docker database:

```bash
docker compose down
```
