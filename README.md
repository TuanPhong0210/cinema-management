# Cinema Management System

A full-stack Cinema Management System built with React, Go, GraphQL, gRPC, and PostgreSQL. The system is split into three independent top-level folders for better modularity and scalability:
1. **`server`**: Golang backend (GraphQL, gRPC, PostgreSQL database operations).
2. **`client`**: Independent React + Vite frontend for guest users to browse movies and book seats.
3. **`manager`**: Independent React + Vite frontend for cinema admins and managers.

## Tech Stack

- Frontends: ReactJS, Vite, Tailwind CSS, React Router DOM, Axios, Font Awesome, Google Fonts
- Backend: Golang, GraphQL, gRPC, GORM, PostgreSQL, JWT, bcrypt, godotenv, CORS
- Database: PostgreSQL 16 in Docker

## Folder Structure

```text
cinema-management/               (Root Repository)
├── server/                      (Golang backend)
├── client/                      (Guest UI - Runs on http://localhost:5173)
└── manager/                     (Manager UI - Runs on http://localhost:5174)
```

## Run PostgreSQL

From the project root:

```bash
docker compose up -d
```

PostgreSQL runs on `localhost:5432`.

## Run Backend

```bash
cd server
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

## Run Guest Frontend (Client)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run Admin Frontend (Manager)

```bash
cd manager
npm install
npm run dev
```

Open `http://localhost:5174`.

## Default Manager Account

- Email: `admin@cinema.com`
- Password: `admin123`

## Main User Flows

1. Client opens the guest app (`http://localhost:5173/`) and selects a now-showing movie.
2. Client selects a show date, showtime, cinema room, and selects available seats to book.
3. In the header, the Client can click the **Manager** link to redirect to the manager panel (`http://localhost:5174/login`).
4. Manager logs in with `admin@cinema.com` / `admin123` to access:
   - Dashboard statistics
   - Movie management
   - Room management (auto-generates seat map)
   - Showtime management (auto-generates showtime seat availability)
   - Ticket sales tracking
   - Employee directory
   - Employee shift attendance (Clock In / Clock Out)

## API Notes

Both React apps consume the backend GraphQL endpoint at `http://localhost:8080/graphql`. Manager mutations require a JWT bearer token. Client movie, showtime, seat-map, and booking operations do not require login.

The gRPC server runs on `localhost:50051` and registers the main service names. Proto definitions are available in `server/proto/cinema.proto`.

