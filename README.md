# Protect Assistance Backend

Backend API built with NestJS, PostgreSQL, Prisma and JWT authentication.

Current completed parts:

- EPIC 0: Backend setup, health check and Swagger.
- EPIC 1: PostgreSQL database setup with Prisma.
- EPIC 2: Authentication and users with JWT.
- EPIC 3: Users Module, Protected Profiles and Family Links.
- EPIC 4: Emergency Contacts.
- EPIC 5: Alerts Module.
- EPIC 6: Locations Module.

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

DATABASE_URL="postgresql://protect_user:protect_password@127.0.0.1:15432/protect_assistance_db?schema=public"

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

Expected result:

```text
protect_assistance_postgres   0.0.0.0:15432->5432/tcp
```

### 5. Run Prisma commands

```bash
npx prisma validate
npx prisma migrate status
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

## Test EPIC 0 — Backend setup

### Health check

```http
GET /api/v1/health
```

Expected result: the API returns status `ok`.

---

## Test EPIC 1 — Database setup

### Database health check

```http
GET /api/v1/health/db
```

Expected result: the API returns database status `connected`.

You can also check Prisma with:

```bash
npx prisma validate
npx prisma migrate status
```

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
  "email": "user@example.com",
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
  "email": "user@example.com",
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
  "email": "user@example.com",
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

Example body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
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

### 1. Create a family member user

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

If the account already exists, login directly with this account.

### 2. Login as protected user

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "user@example.com",
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

## Test EPIC 4 — Emergency Contacts

EPIC 4 includes:

- BE-011: Emergency Contacts.

All EPIC 4 routes are protected and require a JWT token.

---

## Test BE-011 — Emergency Contacts

Available endpoints:

```http
POST /api/v1/emergency-contacts
GET /api/v1/emergency-contacts
GET /api/v1/emergency-contacts/{id}
PATCH /api/v1/emergency-contacts/{id}
DELETE /api/v1/emergency-contacts/{id}
```

Before creating emergency contacts, the connected user must have a protected profile.

### 1. Login and authorize

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Copy the returned `accessToken`, then authorize in Swagger:

```text
Bearer YOUR_ACCESS_TOKEN
```

### 2. Verify protected profile

```http
GET /api/v1/protected-profiles/me
```

If the API returns `404`, create the protected profile first:

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

### 3. Create an emergency contact

```http
POST /api/v1/emergency-contacts
```

Example body:

```json
{
  "name": "Mère",
  "phone": "+21612345678",
  "email": "mere@example.com",
  "priority": 1,
  "receiveSms": true,
  "receivePush": false,
  "receiveEmail": true,
  "receiveCall": false
}
```

Expected result: the API creates an emergency contact linked to the protected profile.

Copy the returned emergency contact `id`.

### 4. List emergency contacts

```http
GET /api/v1/emergency-contacts
```

Expected result: the API returns all emergency contacts of the connected protected user.

### 5. Get one emergency contact

```http
GET /api/v1/emergency-contacts/{id}
```

Expected result: the API returns the selected emergency contact.

### 6. Update emergency contact

```http
PATCH /api/v1/emergency-contacts/{id}
```

Example body:

```json
{
  "name": "Mère updated",
  "phone": "+21699999999",
  "priority": 2,
  "receiveSms": true,
  "receiveEmail": false
}
```

Expected result: the API returns the updated emergency contact.

### 7. Delete emergency contact

```http
DELETE /api/v1/emergency-contacts/{id}
```

Expected result:

```json
{
  "message": "Contact d’urgence supprimé avec succès"
}
```

---

## Test EPIC 5 — Alerts

EPIC 5 includes:

- BE-012: Create Alert.
- BE-013: Get Alerts.
- BE-014: Update Alert Status.

All EPIC 5 routes are protected and require a JWT token.

---

## Test BE-012 — Create Alert

Available endpoint:

```http
POST /api/v1/alerts
```

Before creating an alert, the connected user must have a protected profile.

### 1. Login and authorize

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Copy the returned `accessToken`, then authorize in Swagger:

```text
Bearer YOUR_ACCESS_TOKEN
```

### 2. Create an alert

```http
POST /api/v1/alerts
```

Example body:

```json
{
  "type": "PANIC_BUTTON",
  "severity": "CRITICAL",
  "message": "Alerte déclenchée depuis le bouton panique.",
  "location": {
    "latitude": 36.8065,
    "longitude": 10.1815,
    "accuracy": 20
  }
}
```

Expected result: the API creates an alert with status `CREATED`.

Copy the returned alert `id`.

---

## Test BE-013 — Get Alerts

Available endpoints:

```http
GET /api/v1/alerts
GET /api/v1/alerts/family
GET /api/v1/alerts/{id}
```

### 1. Login and authorize as protected user

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Authorize with:

```text
Bearer PROTECTED_USER_ACCESS_TOKEN
```

### 2. List my alerts

```http
GET /api/v1/alerts
```

Expected result: the API returns alerts created by the connected protected user.

Optional filters:

```http
GET /api/v1/alerts?status=CREATED
GET /api/v1/alerts?type=PANIC_BUTTON
GET /api/v1/alerts?severity=CRITICAL
GET /api/v1/alerts?limit=10
```

### 3. Get one alert by ID

```http
GET /api/v1/alerts/{id}
```

Expected result: the API returns the requested alert if the connected user is allowed to view it.

### 4. List family alerts

Login as a family member linked to the protected user:

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

Authorize with:

```text
Bearer FAMILY_MEMBER_ACCESS_TOKEN
```

Then test:

```http
GET /api/v1/alerts/family
```

Expected result: the API returns alerts from protected users linked to the connected family member.

### 5. Get protected user alert as family member

Still authorized as family member, test:

```http
GET /api/v1/alerts/{id}
```

Expected result: the family member can view the alert of the linked protected user.

---

## Test BE-014 — Update Alert Status

Available endpoint:

```http
PATCH /api/v1/alerts/{id}/status
```

### 1. Login and authorize as protected user

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Authorize with:

```text
Bearer PROTECTED_USER_ACCESS_TOKEN
```

### 2. Get an alert ID

```http
GET /api/v1/alerts
```

Copy one alert `id`.

### 3. Update alert status

```http
PATCH /api/v1/alerts/{id}/status
```

Example body:

```json
{
  "status": "ACKNOWLEDGED"
}
```

Expected result: the API returns the alert with the updated status.

Other possible statuses:

```text
CREATED
SENT
ACKNOWLEDGED
IN_PROGRESS
RESOLVED
FALSE_ALARM
```

### 4. Test resolved status

```http
PATCH /api/v1/alerts/{id}/status
```

Example body:

```json
{
  "status": "RESOLVED"
}
```

Expected result: the field `resolvedAt` is automatically filled.

### 5. Test update status as family member

Login and authorize as family member, then test:

```http
PATCH /api/v1/alerts/{id}/status
```

Example body:

```json
{
  "status": "ACKNOWLEDGED"
}
```

Expected result: a linked family member can update the status of the protected user alert.

---

## Test EPIC 6 — Locations Module

EPIC 6 includes:

- BE-015: Locations Module.

All EPIC 6 routes are protected and require a JWT token.

---

## Test BE-015 — Locations Module

Available endpoints:

```http
GET /api/v1/locations/alerts/{alertId}
PUT /api/v1/locations/alerts/{alertId}
```

### 1. Login and authorize as protected user

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Authorize with:

```text
Bearer PROTECTED_USER_ACCESS_TOKEN
```

### 2. Get an alert ID

Use:

```http
GET /api/v1/alerts
```

Copy the `id` of one alert.

### 3. Get alert location

```http
GET /api/v1/locations/alerts/{alertId}
```

Expected result: the API returns the location linked to the alert.

### 4. Update alert location

```http
PUT /api/v1/locations/alerts/{alertId}
```

Example body:

```json
{
  "latitude": 35.8256,
  "longitude": 10.63699,
  "accuracy": 15
}
```

Expected result: the API updates the alert location and returns the new coordinates.

### 5. Verify updated location

```http
GET /api/v1/locations/alerts/{alertId}
```

Expected result: the API returns the updated coordinates.

### 6. Test family member access

Login and authorize as family member:

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

Authorize with:

```text
Bearer FAMILY_MEMBER_ACCESS_TOKEN
```

A linked family member can view the alert location:

```http
GET /api/v1/locations/alerts/{alertId}
```

Expected result: the API returns the alert location.

A linked family member cannot update the alert location:

```http
PUT /api/v1/locations/alerts/{alertId}
```

Example body:

```json
{
  "latitude": 34.0,
  "longitude": 9.0,
  "accuracy": 30
}
```

Expected result: the API returns `403 Forbidden`.

The update route is reserved for the protected user who owns the alert.

---

## Test EPIC 7 — Evidence Module

EPIC 7 includes:

- BE-016: Evidence Module.

All EPIC 7 routes are protected and require a JWT token.

---

## Test BE-016 — Audio and Video Evidence

Available endpoints:

```http
POST /api/v1/evidence/alerts/{alertId}/upload
GET /api/v1/evidence/alerts/{alertId}
GET /api/v1/evidence/{id}
DELETE /api/v1/evidence/{id}
```

### 1. Login and authorize as protected user

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Authorize in Swagger with:

```text
Bearer PROTECTED_USER_ACCESS_TOKEN
```

### 2. Get an alert ID

```http
GET /api/v1/alerts
```

Copy one alert `id`.

### 3. Upload audio or video evidence

```http
POST /api/v1/evidence/alerts/{alertId}/upload
```

In Swagger, select a file in the `file` field.

Allowed file types:

```text
audio/*
video/*
```

Expected result: the API creates an evidence record linked to the alert.

### 4. List evidence of an alert

```http
GET /api/v1/evidence/alerts/{alertId}
```

Expected result: the API returns all evidence linked to the alert.

### 5. Get one evidence by ID

```http
GET /api/v1/evidence/{id}
```

Expected result: the API returns the selected evidence.

### 6. Family member access

A linked family member can view evidence:

```http
GET /api/v1/evidence/alerts/{alertId}
GET /api/v1/evidence/{id}
```

However, a family member cannot upload or delete evidence.

### 7. Delete evidence

Only the protected user who owns the alert can delete evidence:

```http
DELETE /api/v1/evidence/{id}
```

Expected result:

```json
{
  "message": "Preuve supprimée avec succès"
}
```

## Prisma Studio verification

Open Prisma Studio:

```bash
npx prisma studio
```

Check the following tables:

```text
User
ProtectedProfile
FamilyLink
EmergencyContact
Alert
Location
```

Expected result:

- `User`: contains the protected user and the family member.
- `ProtectedProfile`: contains the profile linked to `user@example.com`.
- `FamilyLink`: contains the relation between `user@example.com` and `family.member@example.com`.
- `EmergencyContact`: contains emergency contacts linked to the protected profile.
- `Alert`: contains alerts created by the protected user.
- `Location`: contains alert locations.

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

Generate Prisma Client:

```bash
npx prisma generate
```

Start Docker database:

```bash
docker compose up -d
```

Stop Docker database:

```bash
docker compose down
```

Start backend:

```bash
npm run start:dev
```
