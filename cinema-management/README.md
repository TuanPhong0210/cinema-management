# Cinema Management System

A full-stack Cinema Management System built with React, Go, GraphQL, gRPC, and PostgreSQL. The manager area supports cinema operations after login, while the client area lets guests browse movies and book seats.

## Tech Stack

- Frontend: ReactJS, Vite, Tailwind CSS, React Router DOM, Axios, Font Awesome, Google Fonts
- Backend: Golang, GraphQL, gRPC, GORM, PostgreSQL, JWT, bcrypt, godotenv, CORS
- Database: PostgreSQL 16 in Docker

## Folder Structure

```text
cinema-management/
  README.md
  docker-compose.yml
  frontend/
  backend/
```

## Run PostgreSQL

From the project root:

```bash
docker compose up -d
```

PostgreSQL runs on `localhost:5432`.

## Run Backend

```bash
cd backend
cp .env.example .env
go mod tidy
go run cmd/server/main.go
```

Backend services:

- GraphQL: `http://localhost:8080/graphql`
- gRPC: `localhost:50051`

The backend uses GORM auto-migration on startup and seeds:

- Default manager account
- Sample movies
- Sample rooms and seats
- Sample showtimes and showtime seats

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Default Manager Account

- Email: `admin@cinema.com`
- Password: `admin123`

## Main User Flows

1. Manager logs in at `/manager/login`.
2. Manager creates movies in Movie Management.
3. Manager creates cinema rooms; seats are generated automatically.
4. Manager creates showtimes; showtime seat maps are generated automatically.
5. Client opens the home page and selects a now-showing movie.
6. Client selects a show date, showtime, and cinema room.
7. Client selects available seats and confirms booking.
8. Booked seats become pink in the seat map after reload.

## API Notes

The React app mainly consumes the GraphQL endpoint. Manager mutations require a JWT bearer token. Client movie, showtime, seat-map, and booking operations do not require login.

The gRPC server runs on `localhost:50051` and registers the main service names. Proto definitions are available in `backend/proto/cinema.proto`.

