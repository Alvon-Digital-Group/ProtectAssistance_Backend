# Protect Assistance — API Validation Scenario

This document describes the full backend MVP validation scenario.

## 1. Register protected user

POST /api/v1/auth/register

## 2. Login protected user

POST /api/v1/auth/login

Use returned token in Swagger:

Bearer PROTECTED_USER_ACCESS_TOKEN

## 3. Create protected profile

POST /api/v1/protected-profiles/me

## 4. Create family member

POST /api/v1/auth/register

## 5. Create family link

POST /api/v1/family-links

## 6. Create emergency contact

POST /api/v1/emergency-contacts

## 7. Create alert

POST /api/v1/alerts

Expected:

- alert status = CREATED
- location created
- notifications created with PENDING status

## 8. Update alert location

PUT /api/v1/locations/alerts/{alertId}

## 9. Upload evidence

POST /api/v1/evidence/alerts/{alertId}/upload

## 10. Login as family member

POST /api/v1/auth/login

Use returned token:

Bearer FAMILY_MEMBER_ACCESS_TOKEN

## 11. Family dashboard

GET /api/v1/dashboard/protected-profiles
GET /api/v1/dashboard/alerts
GET /api/v1/dashboard/alerts/{id}

## 12. Family access checks

Family member can:

- view alert
- view location
- view evidence
- update alert status

Family member cannot:

- upload evidence
- delete evidence
- update alert location

## 13. Admin checks

Login as ADMIN user.

GET /api/v1/admin/users
GET /api/v1/admin/alerts
GET /api/v1/admin/stats

Normal USER should receive 403 Forbidden.

## 14. Prisma Studio verification

Check:

- User
- ProtectedProfile
- FamilyLink
- EmergencyContact
- Alert
- Location
- Evidence
- Notification
- FcmToken
- SafeZone
- Subscription
