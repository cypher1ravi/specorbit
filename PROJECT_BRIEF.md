# SpecOrbit – Project Brief

## What is SpecOrbit?

SpecOrbit automatically keeps your API documentation in sync with your live services by generating, updating, and monitoring OpenAPI specs directly from your backend code.[web:49][web:52][web:71]

## Problem

- Most production APIs drift away from their specifications over time, causing incorrect docs and broken integrations.[web:49][web:52]
- Teams waste many hours debugging mismatches between docs and real responses.[web:52]
- Existing tools rely on manual spec updates or separate API design steps, which often fall behind code changes.[web:31][web:48]

## Solution

SpecOrbit:

1. Parses Node.js/Express routes and annotations to build OpenAPI 3.x specs from your code.[web:67][web:70][web:71]  
2. Generates interactive, “Try it out” API documentation from those specs.[web:31][web:42][web:46]  
3. Hooks into GitHub so every push can trigger automatic spec and docs updates.[web:56][web:57]  
4. Periodically calls your live API and compares responses to the spec to detect drift and alert your team.[web:49][web:50][web:52][web:55]

## Target Users

- Backend engineers building REST APIs  
- SaaS teams exposing partner/internal APIs  
- Platform/DevEx teams responsible for API quality  

## Tech Stack (MVP)

- Frontend: React + TypeScript, Vite, Tailwind, TanStack Query.[web:63][web:65]  
- Backend: Node.js 20, Express, TypeScript, Prisma, PostgreSQL, Redis.[web:62][web:66][web:77][web:80]  
- Infra: Docker, Railway/Render for backend + DB, Vercel for frontend, GitHub Actions for CI/CD.[web:78][web:81]

## MVP Scope (First Release)

- Project & team management (create project, link repo, manage members).  
- Express code parser → OpenAPI 3 spec generator.  
- Hosted Swagger UI/ReDoc docs per project.[web:31][web:42][web:46]  
- GitHub webhook integration for auto‑sync on push.[web:56][web:57]  
- Basic drift detection against one environment (e.g., staging). [web:49][web:50][web:52][web:55]

## Success Criteria (MVP)

- At least 10–20 active projects using SpecOrbit weekly.  
- Docs remain in sync after typical code changes with no manual editing.  
- Developers report reduced time spent debugging integration issues.
