# 🔄 Backend Workflows

This document describes the main business workflows implemented in the Protect Assistance Backend.

It explains how each feature behaves internally, from the client request to the final response.

---

# Table of Contents

- Authentication
- Protected Profile
- Family Links
- Alert Creation
- Alert Consultation
- Notifications
- Firebase Push Notifications
- Dashboard
- Safety Zones
- Subscriptions
- Admin Dashboard

---

# Authentication Workflow

## User Registration

```text
Android App

        │

POST /auth/register

        │

AuthController

        │

AuthService

        │

Check email uniqueness

        │

Check phone uniqueness

        │

Hash password (bcrypt)

        │

UsersService

        │

Prisma

        │

PostgreSQL

        │

Generate JWT

        │

Return Access Token + User
```

---

## User Login

```text
Android App

        │

POST /auth/login

        │

AuthController

        │

Find user by email

        │

Compare password (bcrypt)

        │

Generate JWT

        │

Return Access Token
```

---

# Protected Profile Workflow

Each protected user owns exactly one protected profile.

## Create Profile

```text
Authenticated User

        │

POST /protected-profiles/me

        │

Check if profile already exists

        │

Create profile

        │

Save in database

        │

Return created profile
```

---

## Update Profile

```text
Authenticated User

        │

PATCH /protected-profiles/me

        │

Retrieve profile

        │

Update fields

        │

Save changes

        │

Return updated profile
```

---

# Family Links Workflow

A protected user can associate several family members.

```text
Protected User

        │

POST /family-links

        │

Verify family member exists

        │

Check duplicate link

        │

Create FamilyLink

        │

Store relationship

        │

Return created link
```

---

# Alert Creation Workflow

This is the most important workflow of the application.

```text
Protected User

        │

POST /alerts

        │

Jwt Authentication

        │

Retrieve Protected Profile

        │

Create Alert

        │

Create GPS Location

        │

Save Alert

        │

NotificationsService

        │

Retrieve linked family members

        │

Create notifications

        │

Return Alert
```

---

# Notification Workflow

Immediately after an alert is created:

```text
Alert

        │

Retrieve Family Links

        │

For each linked family member

        │

Create Notification

        │

Status = PENDING

        │

Save Notification
```

---

# Firebase Push Notification Workflow

Notifications are sent using Firebase Cloud Messaging.

```text
Pending Notifications

        │

Retrieve active FCM Tokens

        │

FirebasePushService

        │

Firebase Admin SDK

        │

Firebase Cloud Messaging

        │

Android Devices
```

If successful:

```text
Notification

↓

Status = SENT

↓

sentAt updated
```

If an error occurs:

```text
Notification

↓

Status = FAILED

↓

Store error message
```

---

# Alert Consultation Workflow

## Protected User

```text
GET /alerts

        │

Retrieve authenticated user

        │

Retrieve protected profile

        │

Return user's alerts
```

---

## Family Member

```text
GET /alerts/family

        │

Retrieve Family Links

        │

Retrieve linked protected users

        │

Retrieve alerts

        │

Return alerts
```

---

# Alert Details Workflow

```text
GET /alerts/:id

        │

Retrieve Alert

        │

Is user owner?

        │

YES

↓

Return alert

──────────────

NO

↓

Check Family Link

↓

Authorized?

↓

YES

↓

Return alert

──────────────

NO

↓

403 Forbidden
```

---

# Dashboard Workflow

The dashboard is dedicated to family members.

## Protected Profiles

```text
Family Member

        │

GET /dashboard/protected-profiles

        │

Retrieve Family Links

        │

Retrieve Protected Profiles

        │

Return profiles
```

---

## Dashboard Alerts

```text
Family Member

        │

GET /dashboard/alerts

        │

Retrieve Family Links

        │

Retrieve linked alerts

        │

Return alerts
```

---

# Evidence Workflow

Evidence is attached to an existing alert.

```text
POST /evidence

        │

Retrieve Alert

        │

Verify ownership

        │

Create Evidence

        │

Store metadata

        │

Return Evidence
```

---

# Safety Zones Workflow

```text
Protected User

        │

POST /safety-zones

        │

Retrieve user profile

        │

Create safety zone

        │

Store coordinates

        │

Return created zone
```

---

# Subscription Workflow

Each user owns one subscription.

```text
Authenticated User

        │

GET /subscriptions/me

        │

Retrieve Subscription

        │

Return Plan

(FREE / PREMIUM)
```

---

# Admin Dashboard Workflow

Only ADMIN users can access these endpoints.

## Users

```text
Admin

↓

GET /admin/users

↓

Retrieve all users

↓

Return list
```

---

## Alerts

```text
Admin

↓

GET /admin/alerts

↓

Retrieve all alerts

↓

Return alerts
```

---

## Statistics

```text
Admin

↓

GET /admin/stats

↓

Count users

↓

Count alerts

↓

Count subscriptions

↓

Return statistics
```

---

# Logging Workflow

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

↓

Console Log
```

Logged information:

- HTTP method
- Endpoint
- Response time
- Authenticated user (if available)

---

# Exception Workflow

```text
Service

↓

Throw Exception

↓

HttpExceptionFilter

↓

Standardized JSON Response
```

Example:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Alert not found",
  "path": "/api/v1/alerts/123"
}
```

---

# Complete Alert Flow

```text
Protected User
        │
        ▼
Create Alert
        │
        ▼
Create GPS Location
        │
        ▼
Save Alert
        │
        ▼
Retrieve Family Links
        │
        ▼
Create Notifications
        │
        ▼
Retrieve Active FCM Tokens
        │
        ▼
Firebase Cloud Messaging
        │
        ▼
Android Family Devices
        │
        ▼
Receive Push Notification
        │
        ▼
(Open Alert Screen)
        │
        ▼
Android (Future)
        ├── Send SMS
        └── Call Highest Priority Emergency Contact
```

---

# Summary

The backend follows a service-oriented workflow where every request:

1. is authenticated (when required);
2. is validated using DTOs and ValidationPipe;
3. executes business logic inside a Service;
4. accesses PostgreSQL through Prisma;
5. optionally communicates with Firebase Cloud Messaging;
6. returns a standardized JSON response.

This architecture keeps responsibilities separated, simplifies testing, and makes the backend easy to maintain and extend.
