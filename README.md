# Protect Assistance Backend

Backend API built with NestJS, PostgreSQL, Prisma and JWT authentication.

Current completed parts:

- EPIC 0: Backend setup, health check and Swagger.
- EPIC 1: PostgreSQL database setup with Prisma.
- EPIC 2: Authentication and users with JWT.
- EPIC 3: Users Module, Protected Profiles and Family Links.

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

## Test EPIC 2 — Authentication

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

## Test EPIC 3 — Users, Protected Profiles and Family Links

EPIC 3 includes:

- BE-008: Users Module.
- BE-009: Protected Profiles.
- BE-010: Family Links.

All EPIC 3 routes are protected and require a JWT token.

---

## Test BE-008 — Users Module

Available endpoints:

```http
GET /api/v1/users/me
PATCH /api/v1/users/me
```

### 1. Login first

Use Swagger:

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

Copy the returned `accessToken`.

### 2. Authorize in Swagger

Click on:

```text
Authorize
```

Then enter:

```text
Bearer YOUR_ACCESS_TOKEN
```

### 3. Get current user

```http
GET /api/v1/users/me
```

Expected result: the API returns the connected user information without `passwordHash`.

### 4. Update current user

```http
PATCH /api/v1/users/me
```

Example body:

```json
{
  "firstName": "Yassine Updated",
  "lastName": "Zaghla",
  "phone": "+21699999999"
}
```

Expected result: the API returns the updated user information.

Important: the `passwordHash` must never be returned in the API response.

---

## Test BE-009 — Protected Profiles

Available endpoints:

```http
GET /api/v1/protected-profiles/me
POST /api/v1/protected-profiles/me
PATCH /api/v1/protected-profiles/me
```

### 1. Login and authorize

Login with:

```http
POST /api/v1/auth/login
```

Then copy the returned `accessToken` and authorize in Swagger using:

```text
Bearer YOUR_ACCESS_TOKEN
```

### 2. Create protected profile

```http
POST /api/v1/protected-profiles/me
```

Example body:

```json
{
  "birthDate": "1998-05-12",
  "address": "Tunis, Tunisia",
  "emergencyNote": "Contacter la famille en cas d’urgence.",
  "medicalInfo": "Aucune information médicale particulière.",
  "isActive": true
}
```

Expected result: the API creates the protected profile for the connected user.

### 3. Get protected profile

```http
GET /api/v1/protected-profiles/me
```

Expected result: the API returns the protected profile of the connected user.

### 4. Update protected profile

```http
PATCH /api/v1/protected-profiles/me
```

Example body:

```json
{
  "address": "Sousse, Tunisia",
  "emergencyNote": "Prévenir le contact principal en priorité.",
  "medicalInfo": "Allergie à la pénicilline."
}
```

Expected result: the API returns the updated protected profile.

---

## Test BE-010 — Family Links

Available endpoints:

```http
POST /api/v1/family-links
GET /api/v1/family-links/as-protected-user
GET /api/v1/family-links/as-family-member
PATCH /api/v1/family-links/{id}
DELETE /api/v1/family-links/{id}
```

### 1. Create two users

Create a protected user:

```http
POST /api/v1/auth/register
```

Example body:

```json
{
  "firstName": "Protected",
  "lastName": "User",
  "email": "protected.user@example.com",
  "phone": "+21611111111",
  "password": "Password123!"
}
```

Create a family member:

```http
POST /api/v1/auth/register
```

Example body:

```json
{
  "firstName": "Family",
  "lastName": "Member",
  "email": "family.member@example.com",
  "phone": "+21622222222",
  "password": "Password123!"
}
```

### 2. Login as protected user

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "protected.user@example.com",
  "password": "Password123!"
}
```

Copy the returned `accessToken`.

### 3. Authorize in Swagger

Click on:

```text
Authorize
```

Then enter:

```text
Bearer PROTECTED_USER_ACCESS_TOKEN
```

### 4. Create a family link

```http
POST /api/v1/family-links
```

Example body:

```json
{
  "familyUserEmail": "family.member@example.com",
  "relationship": "Frère",
  "permissionLevel": "RECEIVE_ALERTS"
}
```

Expected result: the API creates a family link.

Copy the returned family link `id`.

### 5. List family members of the protected user

```http
GET /api/v1/family-links/as-protected-user
```

Expected result: the API returns the family members linked to the connected protected user.

### 6. Login as family member

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "family.member@example.com",
  "password": "Password123!"
}
```

Copy the returned `accessToken`.

### 7. Authorize as family member

Click on:

```text
Authorize
```

Then enter:

```text
Bearer FAMILY_MEMBER_ACCESS_TOKEN
```

### 8. List protected users linked to the family member

```http
GET /api/v1/family-links/as-family-member
```

Expected result: the API returns the protected users linked to the connected family member.

### 9. Update a family link

Authorize again with the protected user token:

```text
Bearer PROTECTED_USER_ACCESS_TOKEN
```

Then test:

```http
PATCH /api/v1/family-links/{id}
```

Example body:

```json
{
  "relationship": "Parent",
  "permissionLevel": "MANAGE_CONTACTS"
}
```

Expected result: the API returns the updated family link.

### 10. Delete a family link

```http
DELETE /api/v1/family-links/{id}
```

Expected result:

```json
{
  "message": "Lien familial supprimé avec succès"
}
```

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
