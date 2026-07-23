# 👨‍💻 Developer Guide

This document explains how the Protect Assistance backend is organized and provides guidelines for developing new features.

---

# Table of Contents

- Project Overview
- Technology Stack
- Project Structure
- Request Lifecycle
- Backend Architecture
- Module Organization
- Database Layer
- Authentication
- Authorization
- Validation
- Error Handling
- Logging
- Notifications
- Testing
- Development Workflow
- Coding Guidelines

---

# Project Overview

Protect Assistance Backend is a REST API built with **NestJS** following a modular architecture.

The application provides:

- User authentication
- Protected profiles
- Family management
- SOS alerts
- GPS locations
- Media evidence
- Firebase notifications
- Safety zones
- Subscriptions
- Family dashboard
- Administration dashboard

---

# Technology Stack

| Technology               | Purpose              |
| ------------------------ | -------------------- |
| NestJS                   | Backend Framework    |
| TypeScript               | Programming Language |
| Prisma                   | ORM                  |
| PostgreSQL               | Database             |
| Docker                   | Database Container   |
| JWT                      | Authentication       |
| Swagger                  | API Documentation    |
| Firebase Cloud Messaging | Push Notifications   |
| Jest                     | Unit Testing         |

---

# Project Structure

```text
src
│
├── common
│
├── config
│
├── database
│
├── modules
│   ├── admin
│   ├── alerts
│   ├── auth
│   ├── dashboard
│   ├── evidence
│   ├── family-links
│   ├── firebase
│   ├── locations
│   ├── notifications
│   ├── protected-profiles
│   ├── safety-zones
│   ├── subscriptions
│   └── users
│
├── prisma
│
└── main.ts
```

Every business feature is implemented as an independent NestJS module.

---

# Request Lifecycle

Every request follows the same path.

```text
Client

↓

Controller

↓

Validation

↓

Guard

↓

Service

↓

Prisma

↓

Database

↓

Response
```

Business logic must always stay inside Services.

Controllers should remain lightweight.

---

# Backend Architecture

Each module follows the same architecture.

```text
module

├── controller
├── service
├── dto
├── entity (optional)
├── tests
└── module
```

Example:

```text
alerts

├── alerts.controller.ts
├── alerts.service.ts
├── alerts.module.ts
└── dto
```

---

# Controllers

Controllers expose REST endpoints.

Responsibilities:

- receive HTTP requests
- validate DTOs
- authenticate users
- call services
- return responses

Controllers should **never** contain business logic.

---

# Services

Services contain business logic.

Responsibilities:

- perform validations
- call Prisma
- execute workflows
- communicate with Firebase
- throw exceptions

Business rules belong here.

---

# DTOs

DTOs validate every incoming request.

Validation is performed automatically using ValidationPipe.

Example:

```typescript
@IsEmail()
email: string;

@MinLength(8)
password: string;
```

Never validate request data manually inside controllers.

---

# Database Layer

Database access is performed exclusively through Prisma.

```text
Service

↓

Prisma Client

↓

PostgreSQL
```

Controllers must never communicate directly with Prisma.

---

# Authentication

Authentication uses JWT.

Workflow:

```text
Register

↓

Hash Password

↓

Store User

↓

Login

↓

Verify Password

↓

Generate JWT

↓

Return Access Token
```

Passwords are hashed using bcrypt.

---

# Authorization

Protected routes use:

- JwtAuthGuard
- CurrentUser decorator

Some modules additionally verify ownership.

Example:

- alerts
- dashboard
- family links

Only authorized users may access resources.

---

# Roles

Current roles:

```text
PROTECTED_USER

FAMILY_MEMBER

ADMIN

SUPER_ADMIN
```

Each role has different permissions.

### Protected User

- create alerts
- manage profile
- manage safety zones

### Family Member

- view linked profiles
- receive notifications
- access dashboard

### Admin

- manage users
- monitor alerts
- view statistics

### Super Admin

Reserved for future administration features.

---

# Validation

Validation is centralized.

Global ValidationPipe is enabled.

Features:

- whitelist
- forbidNonWhitelisted
- transform

Invalid requests never reach the services.

---

# Error Handling

Exceptions are handled centrally.

HttpExceptionFilter returns standardized JSON responses.

Example:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Alert not found"
}
```

Never return custom error objects inside services.

Throw NestJS exceptions instead.

---

# Logging

LoggingInterceptor logs every request.

Example:

```text
POST /auth/login

↓

REQUEST

↓

Controller

↓

Service

↓

RESPONSE

↓

Execution Time
```

This simplifies debugging and monitoring.

---

# Notifications

Notification workflow:

```text
Alert

↓

NotificationsService

↓

Notification records

↓

FirebasePushService

↓

Firebase

↓

Android
```

The backend only sends push notifications.

SMS and phone calls are handled by the Android application.

---

# Database Relationships

Main entities:

```text
User

│

├── ProtectedProfile

├── Subscription

├── SafetyZones

├── FcmTokens

└── FamilyLinks
```

Alerts:

```text
ProtectedProfile

↓

Alert

↓

Location

↓

Evidence

↓

Notifications
```

---

# Adding a New Module

Recommended steps:

1. Generate module

```bash
nest g module modules/example
```

2. Generate controller

```bash
nest g controller modules/example
```

3. Generate service

```bash
nest g service modules/example
```

4. Create DTOs

5. Add Prisma model

6. Create migration

```bash
npx prisma migrate dev
```

7. Generate Prisma Client

```bash
npx prisma generate
```

8. Implement service

9. Implement controller

10. Write tests

---

# Development Workflow

Typical workflow:

```text
Create DTO

↓

Implement Service

↓

Implement Controller

↓

Update Prisma

↓

Migration

↓

Swagger Test

↓

Unit Tests
```

---

# Testing

Run all tests:

```bash
npm run test
```

Run specific tests:

```bash
npm run test alerts

npm run test notifications
```

Swagger is available at:

```
http://localhost:3000/api/docs
```

Detailed API validation scenarios are documented in:

```
docs/api-validation-scenario.md
```

---

# Coding Guidelines

## Controllers

✔ Keep controllers small.

✔ Delegate all logic to services.

---

## Services

✔ One responsibility per method.

✔ Throw exceptions when needed.

✔ Never return HTTP responses directly.

---

## DTOs

✔ Validate all incoming data.

✔ Never trust client input.

---

## Prisma

✔ Access the database only through PrismaService.

✔ Prefer transactions for multi-step operations.

---

## Naming

Use consistent naming.

Examples:

```text
UsersService

AlertsService

NotificationsService

DashboardService
```

Methods:

```text
create()

update()

findAll()

findOne()

delete()
```

---

# Best Practices

- Keep modules independent.
- Avoid duplicated business logic.
- Validate every request.
- Use dependency injection.
- Write unit tests for new features.
- Keep controllers lightweight.
- Use services for business rules.
- Follow existing project conventions.

---

# Additional Documentation

See also:

- `README.md`
- `docs/project-architecture.md`
- `docs/api-validation-scenario.md`

These documents provide installation instructions, architecture diagrams, and complete API validation scenarios.
