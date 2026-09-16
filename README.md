# CineBook — Web-Based Movie Booking System

> **Module**: SE2030 – Software Engineering (Year 2, Semester 1 - 2026)  
> **Institution**: Sri Lanka Institute of Information Technology (SLIIT)  
> **Group ID**: `26-MTR-SE2030-09`  
> **Repository**: [IT25102109/26-MTR-SE2030-09-CineBook](https://github.com/IT25102109/26-MTR-SE2030-09-CineBook)

---

## 👥 Team Member & Function Allocation

Each team member is individually responsible for the end-to-end design, implementation, and testing of their assigned major function.

| # | Student ID | Member Name | GitHub Username | Assigned Major Function | Dedicated Feature Branch |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `IT25100588` | Kariyawasam K.K.S.S | [`@IT25100588`](https://github.com/IT25100588) | **Movie & Content Discovery** *(Customer side)* | `feature/movie-content-discovery` |
| **2** | `IT25101655` | Liyanagama P.B | [`@IT25101655`](https://github.com/IT25101655) | **Booking History, Cancellation & Refunds** | `feature/booking-history-refunds` |
| **3** | `IT25101943` | Janaka P.G.C. | [`@IT25101943`](https://github.com/IT25101943) | **Seat Selection & Booking Engine** | `feature/seat-booking-engine` |
| **4** | `IT25101952` | Lekamwasam N.L.P.M | [`@IT25101952`](https://github.com/IT25101952) | **Admin Reporting & Analytics Dashboard** | `feature/admin-reporting-analytics` |
| **5** | `IT25102109` | Bhanuka N.A.D. *(Leader)* | [`@IT25102109`](https://github.com/IT25102109) | **Movie, Showtime & Cinema Management** | `feature/movie-showtime-cinema` |
| **6** | `IT25102892` | Thathsara M.A.B. | [`@IT25102892`](https://github.com/IT25102892) | **Payment Processing & E-Ticket Generation** | `feature/payment-eticket` |

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5.5, Vite 5, Tailwind CSS 3.4, React Router DOM 7, Lucide Icons, Recharts |
| **Backend** | Java 17, Spring Boot 3.3.4 (Web, Data JPA, Security, Validation), Project Lombok, Maven |
| **Database** | MySQL 8.x (`cinebook_db`), Hibernate ORM |
| **Version Control** | Git & GitHub, GitFlow branching strategy |

---

## 📁 Repository Structure

```text
26-MTR-SE2030-09-CineBook/
├── backend/                       # Spring Boot REST API
│   ├── src/main/java/com/cinebook/
│   │   ├── config/                # Security & CORS configuration
│   │   ├── controller/            # REST Controllers (Movie, Cinema, Showtime...)
│   │   ├── model/                 # JPA Entities (Movie, Cinema, CinemaHall, Showtime, User...)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   └── service/               # Business Logic & Service Layer
│   ├── src/main/resources/
│   │   └── application.properties # Server port (8080) & MySQL DB configuration
│   └── pom.xml                    # Maven dependencies
├── frontend/                      # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── api/                   # REST API client services (movieApi, branchApi, showtimeApi...)
│   │   ├── components/            # Reusable UI & layout components (Navbar, Footer, Modal, Card...)
│   │   ├── contexts/              # Global React Contexts (AuthContext, ToastContext, NotificationContext)
│   │   ├── data/                  # Persistent store & mock data engine
│   │   ├── pages/                 # Full application pages (Home, Movies, SeatSelection, Admin...)
│   │   ├── types/                 # Unified TypeScript domain interfaces
│   │   ├── App.tsx                # Main router configuration
│   │   └── main.tsx               # Entry point
│   ├── package.json               # Frontend scripts & dependencies
│   └── vite.config.ts             # Vite configuration with '@' path alias
├── docs/                          # SE2030 documentation (Proposal, Use Case, ERD, Scrum, Diagrams)
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Java**: JDK 17 or higher
* **Node.js**: v18 or higher (with npm)
* **Database**: MySQL Server (MAMP, XAMPP, or standalone MySQL)
* **IDE**: IntelliJ IDEA / VS Code / Eclipse

---

### 2. Database Setup
1. Start your local MySQL service.
2. Create the database:
   ```sql
   CREATE DATABASE cinebook_db;
   ```
3. Open `backend/src/main/resources/application.properties` and verify your credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:8889/cinebook_db?useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=root
   ```
   *(Note: Adjust the port to `3306` if your MySQL is not on port `8889`)*

---

### 3. Running the Backend
From the root directory or inside `backend/`:
```bash
# Using Maven in terminal
mvn spring-boot:run --prefix backend

# Or open backend in IntelliJ / Eclipse and run CineBookApplication.java
```
Backend API will be live at: **`http://localhost:8080/api/`**

Test the endpoints:
```bash
curl http://localhost:8080/api/movies
curl http://localhost:8080/api/branches
curl http://localhost:8080/api/showtimes
```

---

### 4. Running the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

To verify code quality and build:
```bash
npm run typecheck    # Check TypeScript types
npm run build        # Production build verification
```

---

## 🌿 Team Git Workflow & Contribution Rules

### Branch Strategy
* `main`: Production-ready release code. Locked for direct commits.
* `dev`: Shared integration branch. All feature branches merge here via Pull Requests.
* `feature/<function-name>`: Individual work branches for each team member.

### Step-by-Step for Each Team Member:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/IT25102109/26-MTR-SE2030-09-CineBook.git
   cd 26-MTR-SE2030-09-CineBook
   ```

2. **Switch to Your Assigned Feature Branch**:
   ```bash
   # Fetch all remote branches
   git fetch origin

   # Checkout your branch (example for IT25100588)
   git checkout feature/movie-content-discovery
   ```

3. **Keep Your Branch Updated with `dev`**:
   Before starting work each day, pull the latest shared changes:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout <your-feature-branch>
   git merge dev
   ```

4. **Make Your Changes & Commit**:
   Use meaningful commit messages:
   ```bash
   git add .
   git commit -m "feat(module): description of what you implemented"
   ```

5. **Push to Your Feature Branch**:
   ```bash
   git push origin <your-feature-branch>
   ```

6. **Create a Pull Request**:
   - Go to [GitHub Pull Requests](https://github.com/IT25102109/26-MTR-SE2030-09-CineBook/pulls)
   - Base branch: `dev` $\leftarrow$ Compare branch: `<your-feature-branch>`
   - Request review from teammates before merging.

---

## 🎯 SE2030 Major Functions Scope Summary

* **Function 1 (`IT25100588`)**: Movie search/filter (genre, date, language, 2D/3D/IMAX), movie details, trailers, ratings/reviews, wishlist.
* **Function 2 (`IT25102109`)**: Full CRUD for movies, branches, hall layouts, showtime scheduling, pricing rules (peak/off-peak), promotions.
* **Function 3 (`IT25101943`)**: Real-time interactive seat matrix, temporary seat hold with timeout lock, seat category differential pricing.
* **Function 4 (`IT25102892`)**: Checkout payment simulation (card/wallet/bank), promo codes, e-ticket with QR code generation, PDF receipt.
* **Function 5 (`IT25101655`)**: Customer booking history, cancellation policy with time-based refund calculation, showtime rescheduling.
* **Function 6 (`IT25101952`)**: Admin/Manager analytics dashboard (revenue, occupancy rates, genre popularity), loyalty points engine.