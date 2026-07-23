# 🏗 Project Architecture

## Overview

Protect Assistance Backend is built using a **layered modular architecture** based on **NestJS**.

The application follows the Controller → Service → Database pattern, making the project easy to maintain, test and extend.

---

# Global Architecture

```text
                    Android Application
                            │
                            │ HTTPS REST API
                            ▼
                 ┌────────────────────────┐
                 │     NestJS Backend     │
                 └────────────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
      ▼                     ▼                     ▼
 Controllers            Services             Common Layer
      │                     │                     │
      ▼                     ▼                     ▼
                Prisma ORM (Database Layer)
                            │
                            ▼
                     PostgreSQL Database
                            │
                            ▼
                  Firebase Cloud Messaging
```

---

# Backend Layers

The backend is divided into four main layers.

## 1. Controllers

Controllers expose REST endpoints.

Responsibilities:

- Receive HTTP requests
- Validate incoming DTOs
- Authenticate users
- Call the appropriate service
- Return responses

Example:

```text
POST /api/v1/auth/login

↓

AuthController

↓

AuthService
```

---

## 2. Services

Services contain all business logic.

Responsibilities:

- Execute business rules
- Access the database
- Perform validations
- Throw exceptions
- Communicate with Firebase

Examples:

- AuthService
- AlertsService
- NotificationsService
- DashboardService

---

## 3. Prisma Layer

Services never communicate directly with PostgreSQL.

All database access is performed through Prisma.

```text
Service

↓

Prisma Client

↓

PostgreSQL
```

---

## 4. Database

PostgreSQL stores all project data.

Main entities:

- Users
- Protected Profiles
- Family Links
- Alerts
- Locations
- Evidence
- Notifications
- FCM Tokens
- Safety Zones
- Subscriptions

---

# Authentication Flow

```text
User

↓

POST /auth/login

↓

AuthController

↓

AuthService

↓

UsersService

↓

Prisma

↓

PostgreSQL

↓

Password Verification

↓

JWT Generation

↓

Access Token

↓

Android Application
```

---

# Alert Workflow

When a protected user creates an alert, the following workflow is executed.

```text
Protected User

↓

POST /alerts

↓

AlertsController

↓

AlertsService

↓

Create Alert

↓

Create Location

↓

Retrieve Family Links

↓

Create Notifications

↓

Retrieve Active FCM Tokens

↓

FirebasePushService

↓

Firebase Cloud Messaging

↓

Android Devices
```

---

# Notification Architecture

```text
Alert

↓

Notification

↓

Notification Status = PENDING

↓

Firebase Push Service

↓

Firebase Cloud Messaging

↓

Notification Status = SENT
```

If the notification cannot be delivered:

```text
Notification

↓

Firebase Error

↓

Notification Status = FAILED

↓

Error Message Stored
```

---

# Dashboard Architecture

The dashboard is reserved for family members.

```text
Family Member

↓

Dashboard Endpoint

↓

DashboardService

↓

Family Links

↓

Protected Profiles

↓

Alerts

↓

Dashboard Response
```

The dashboard never accesses data directly.

It only retrieves data linked to the authenticated family member.

---

# Security Architecture

Authentication is based on JWT.

```text
Login

↓

JWT

↓

Authorization Header

↓

JwtAuthGuard

↓

CurrentUser Decorator

↓

Controller

↓

Service
```

Unauthorized users receive **401 Unauthorized**.

Users without permission receive **403 Forbidden**.

---

# Validation Flow

Every incoming request is validated before reaching the service.

```text
HTTP Request

↓

DTO

↓

ValidationPipe

↓

Controller

↓

Service
```

Examples:

- required fields
- email format
- phone format
- enum validation
- minimum password length

---

# Exception Handling

All exceptions are centralized.

```text
Service

↓

Throw Exception

↓

HttpExceptionFilter

↓

JSON Error Response
```

Example response:

```json
{
  "success": false,
  "statusCode": 404,
  "timestamp": "...",
  "path": "/api/v1/alerts/123",
  "method": "GET",
  "message": "Alerte introuvable",
  "error": "Not Found"
}
```

---

# Logging Architecture

Every request passes through the LoggingInterceptor.

```text
Incoming Request

↓

LoggingInterceptor

↓

Controller

↓

Service

↓

Response

↓

LoggingInterceptor
```

Logged information:

- HTTP Method
- Endpoint
- Response time
- Authenticated user (when available)

---

# Firebase Integration

Firebase Cloud Messaging is used for push notifications.

```text
Notification

↓

FirebasePushService

↓

Firebase Admin SDK

↓

FCM

↓

Android Device
```

The backend is only responsible for:

- creating notifications
- sending push notifications

The Android application is responsible for:

- displaying notifications
- opening the correct screen
- triggering local actions (call/SMS if implemented)

---

# Project Modules

```text
src
│
├── auth
├── users
├── protected-profiles
├── family-links
├── alerts
├── locations
├── evidence
├── notifications
├── firebase
├── safety-zones
├── subscriptions
├── dashboard
├── admin
│
├── common
│   ├── decorators
│   ├── dto
│   ├── filters
│   ├── guards
│   ├── interceptors
│   └── interfaces
│
├── database
├── prisma
└── config
```

---

# Design Principles

The backend follows several software engineering principles:

- Modular architecture
- Separation of concerns
- Dependency Injection
- RESTful API design
- Centralized exception handling
- DTO validation
- Reusable services
- Role-based authorization
- Clean project structure

---

# Summary

The Protect Assistance backend is designed around a modular NestJS architecture that separates HTTP handling, business logic, database access and external integrations.

This architecture facilitates:

- maintainability
- scalability
- testing
- future feature additions
- collaboration between backend and mobile developers
