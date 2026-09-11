# CineBook Backend

Spring Boot backend for the CineBook movie ticket booking system (SE2030 Group Project, 26-MTR-SE2030-09).

## Tech stack
- Java 17
- Spring Boot 3.3.4 (Web, Data JPA, Security, Validation)
- MySQL
- Maven

## Project structure

```
src/main/java/com/cinebook/
├── controller/   # REST endpoints (thin — delegate to services)
├── service/      # Business logic
├── repository/   # Spring Data JPA interfaces
├── model/        # JPA entities (User, Movie, Cinema, Showtime, ...)
├── dto/          # Request/response objects (add as needed per module)
├── config/       # Security, CORS, and other app-wide config
└── exception/    # Custom exceptions + global exception handler (add as needed)
```

`MovieController` → `MovieService` → `MovieRepository` is the reference implementation.
Each module owner should follow this same three-layer pattern for their function
(Seat Selection & Booking Engine, Payment Processing, Admin Reporting, etc.).

## Getting started

1. **Install prerequisites:** JDK 17+, Maven (or use the IDE's bundled Maven), MySQL running locally.
2. **Create the database:**
   ```sql
   CREATE DATABASE cinebook_db;
   ```
3. **Update credentials** in `src/main/resources/application.properties` (`spring.datasource.username` / `password`).
4. **Run the app:**
   ```bash
   mvn spring-boot:run
   ```
   Or run `CineBookApplication.java` directly from your IDE.
5. API is available at `http://localhost:8080/api/...` — try `GET http://localhost:8080/api/movies`.

## Notes for the team

- **Security is currently wide open** (`SecurityConfig.java` permits all requests). This is intentional for early development so nobody is blocked by auth. Whoever owns the auth/RBAC piece (Admin > Cinema Manager > Customer) needs to replace this with real JWT-based auth before the Progress/Final submission.
- **CORS** is configured for the Vite dev server default port (`5173`). Update `SecurityConfig.java` if your frontend runs elsewhere.
- **`spring.jpa.hibernate.ddl-auto=update`** auto-creates/updates tables from your entities — convenient for dev, but don't rely on it for production. Align entity fields with the finalized EER diagram (IT2140) as that gets locked in.
- Branch per function, e.g. `feature/movie-showtime-cinema`, `feature/seat-booking-engine`, PR into `develop`.
