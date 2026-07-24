# 🐳 Docker Guide

This document explains how Docker is used in the Protect Assistance Backend project.

---

# Table of Contents

- Overview
- Prerequisites
- Docker Services
- Starting the Environment
- Stopping the Environment
- Database Access
- Common Docker Commands
- Troubleshooting

---

# Overview

Docker is used to run the PostgreSQL database locally.

Using Docker ensures that every developer works with the same database version and configuration without installing PostgreSQL directly on their machine.

Current Docker services:

- PostgreSQL

---

# Prerequisites

Before starting Docker, make sure the following software is installed:

- Docker Desktop
- Docker Compose

Verify installation:

```bash
docker --version

docker compose version
```

---

# Docker Services

The project uses a PostgreSQL container.

Typical configuration:

| Service    | Port  |
| ---------- | ----- |
| PostgreSQL | 55432 |

Database credentials are defined inside:

```
.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/protect_assistance"
```

---

# Starting the Environment

Start every Docker service:

```bash
docker compose up -d
```

Example output:

```text
✔ Container protect-assistance-postgres Started
```

Verify that the container is running:

```bash
docker ps
```

Expected result:

```text
CONTAINER ID

IMAGE

STATUS

PORTS
```

---

# Stopping the Environment

Stop all services:

```bash
docker compose down
```

To stop without deleting the container:

```bash
docker stop <container-name>
```

Restart:

```bash
docker start <container-name>
```

---

# Database Access

Once Docker is running, Prisma can connect to PostgreSQL.

Run database migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Open Prisma Studio:

```bash
npx prisma studio
```

Default Studio URL:

```
http://localhost:5555
```

---

# Viewing Logs

Display PostgreSQL logs:

```bash
docker logs <container-name>
```

Follow logs continuously:

```bash
docker logs -f <container-name>
```

---

# Common Docker Commands

## List running containers

```bash
docker ps
```

---

## List every container

```bash
docker ps -a
```

---

## Restart a container

```bash
docker restart <container-name>
```

---

## Remove stopped containers

```bash
docker container prune
```

---

## Remove unused images

```bash
docker image prune
```

---

## View Docker networks

```bash
docker network ls
```

---

## View Docker volumes

```bash
docker volume ls
```

---

# Reset the Database

If a clean database is required:

Stop Docker:

```bash
docker compose down
```

Remove the PostgreSQL volume:

```bash
docker volume rm <volume-name>
```

Restart Docker:

```bash
docker compose up -d
```

Recreate the schema:

```bash
npx prisma migrate dev
```

---

# Troubleshooting

## Container does not start

Check Docker logs:

```bash
docker logs <container-name>
```

---

## Database connection refused

Verify that:

- Docker Desktop is running.
- PostgreSQL container is running.
- The port matches the `.env` configuration.
- `DATABASE_URL` is correct.

---

## Prisma cannot connect

Check:

```bash
docker ps
```

Then verify:

```bash
npx prisma db pull
```

or

```bash
npx prisma migrate dev
```

---

## Port already in use

Check which process is using the PostgreSQL port.

Windows:

```bash
netstat -ano | findstr 55432
```

Linux/macOS:

```bash
lsof -i :55432
```

---

# Recommended Development Workflow

Start Docker:

```bash
docker compose up -d
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run start:dev
```

Run tests:

```bash
npm run test
```

Open Swagger:

```
http://localhost:3000/api/docs
```

---

# Notes

- Docker is only used to provide the PostgreSQL database for local development.
- The backend application itself runs directly with NestJS (`npm run start:dev`).
- Prisma is responsible for communicating with the PostgreSQL container.
- Database schema changes should always be applied through Prisma migrations rather than modifying the database manually.
