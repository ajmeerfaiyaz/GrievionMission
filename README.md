# CivicConnect – AI-Powered Citizen Grievance Management System

> **A modern, transparent, and intelligent municipal grievance management platform bridging the gap between citizens and local urban local bodies (ULBs).**

---

## 1. Project Title
**CivicConnect – AI-Powered Citizen Grievance Management System**

---

## 2. Project Overview
CivicConnect is a full-stack, enterprise-grade digital governance application designed to modernize and streamline public grievance redressal. Traditional grievance management mechanisms—such as physical petition desks, manual ledger registers, and fragmented paper trails—suffer from systemic delays, lack of transparency, absence of real-time progress tracking, and poor administrative accountability.

CivicConnect solves these operational bottlenecks by providing a centralized, responsive web platform paired with a robust RESTful backend and embedded AI-assisted heuristics. Citizens can register, file detailed complaints with multimedia evidence (photos and videos), track status updates in real time, engage in community upvoting/support, and contribute public comments. Municipal administrators and grievance officers are equipped with a dedicated **Admin Command Center** featuring live analytics, AI-assisted priority scoring, duplicate grievance detection, automated department routing, and one-click status transitions.

---

## 3. Problem Statement
Municipal corporations and civic administrative bodies encounter several systemic hurdles when managing public complaints:
- **Opaque Redressal Process:** Citizens submit grievances without visibility into which department or officer is reviewing their case or what actions are underway.
- **Triage Bottlenecks & Priority Inversion:** Critical emergencies (e.g., live electrical cable faults, burst water mains) are frequently queued behind non-critical cosmetic requests due to manual, linear queue processing.
- **Duplicate & Redundant Complaints:** When localized issues (such as traffic signal failure or major road potholes) affect entire neighborhoods, dozens of citizens submit identical complaints, overwhelming administrative staff with redundant triage work.
- **Lack of Verifiable Evidence:** Text-only complaints often lack spatial and visual context, leading to field inspection delays and misallocated repair crews.
- **Absence of Citizen Participation:** Traditional systems do not measure community sentiment or aggregate community backing for neighborhood-level infrastructure repairs.

---

## 4. Proposed Solution
CivicConnect addresses these challenges through an integrated, data-driven architecture:
1. **Centralized Digital Portal:** A single-page, responsive citizen web interface for seamless grievance registration, real-time tracking, and community discussion.
2. **AI-Assisted Triage Engine:** Embedded heuristic NLP rules analyze grievance titles, descriptions, and locations to predict department categories, compute urgency scores (CRITICAL / HIGH / MEDIUM / LOW), and generate concise extractive summaries.
3. **Automated Duplicate Detection:** Token-based Jaccard similarity algorithms scan the database for matching category, location, and keywords, alerting administrators to recurring issues.
4. **Multimedia Proof Verification:** High-capacity (up to 50MB) image and video upload support allowing citizens to attach verifiable visual evidence with instant in-browser previews and media streaming.
5. **Role-Based Access Control (RBAC):** Strict separation between Citizen privileges (create, edit owned, delete owned, upvote, comment) and Administrative controls (status changes, resolution notes, department routing, system-wide analytics).

---

## 5. Objectives
- Develop a secure, RESTful backend using **Java 21**, **Spring Boot 3.3.4**, and **Spring Data JPA**.
- Deliver a responsive, zero-dependency **HTML5 / CSS3 / Vanilla JavaScript** frontend.
- Implement rule-based **AI/NLP triage services** for automatic department categorization, priority calculation, duplicate detection, and automated resolution estimation.
- Provide secure **BCrypt password hashing** and role-based access validation for Citizen and Administrator users.
- Support robust **multipart file storage** for photos (`.jpg`, `.jpeg`, `.png`, `.webp`) and videos (`.mp4`, `.webm`, `.mov`).
- Offer complete **Admin Analytics** including category distributions, resolution metrics, emergency queues, and community support heatmaps.

---

## 6. Key Features

### A. Citizen Portal
- **User Authentication:** Secure registration and login with BCrypt password encryption and persistent session state.
- **Grievance Submission:** Intuitive complaint filing with title, category selection, priority level, location tagging, and detailed description.
- **Multimedia Evidence Upload:** Support for attaching photos and video recordings with real-time browser preview (`URL.createObjectURL`), replace, and remove capabilities before submission.
- **Ownership-Enforced CRUD:** Citizens can view, edit, or delete only their own submitted grievances.
- **Community Upvoting & Support:** Citizens can endorse public grievances to boost community visibility and urgency counters.
- **Public Discussion & Comments:** Interactive comment section on grievances for citizen-official communication and community updates.
- **Real-Time Status Tracking:** Visual timeline badges indicating whether a grievance is `PENDING`, `IN_PROGRESS`, `RESOLVED`, or `REJECTED`.
- **Search & Multi-Filter Engine:** Filter grievances by category, status, priority, or search by keywords and location.

### B. Municipal Admin Command Center
- **Executive Analytics Dashboard:** Real-time metrics displaying Total Complaints, Pending Cases, In-Progress Investigations, and Resolved Grievances.
- **AI Triage & Urgency Assessment:** Automatic emergency priority tagging based on grievance text and historical category benchmarks.
- **Duplicate Grievance Detection:** Highlights potential duplicate submissions with similarity scores to prevent redundant resource dispatch.
- **Official Workflow Management:** Update grievance lifecycle status (`PENDING` -> `IN_PROGRESS` -> `RESOLVED` / `REJECTED`) with official administrative resolution notes.
- **Department Reassignment:** Dynamically route complaints to appropriate municipal wings (Roads, Water Supply, Electricity, Sanitation, Health, Public Works).
- **System-Wide Oversight:** Ability to review, moderate, or remove inappropriate submissions and comments across the entire municipality.

---

## 7. AI & Intelligent Triage Engine
CivicConnect implements an explainable, in-house **Natural Language Processing (NLP) & Heuristic Intelligence Service** (`AIService.java`) that operates without external cloud dependencies:

1. **Intelligent Department Categorization:**
   - Tokenizes and cleans grievance text using custom stop-word filtering.
   - Evaluates keyword distributions across municipal taxonomies (e.g., "pothole", "asphalt" -> *Roads & Infrastructure*; "drainage", "sewage", "leak" -> *Water & Sanitation*; "blackout", "transformer", "wire" -> *Electricity & Power*).
2. **Automated Priority & Urgency Scoring:**
   - Analyzes high-risk trigger terms (e.g., "sparking", "accident", "hospital", "danger", "burst", "flood", "fire").
   - Assigns priority tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with dynamic expected resolution timeframes (e.g., Critical: 4–12 hours; Low: 5–7 days).
3. **Duplicate Detection via Jaccard Similarity:**
   - Computes n-gram and token-set intersection over union ($J(A, B) = \frac{|A \cap B|}{|A \cup B|}$) across existing open complaints within the same category and geographical zone.
   - Flags grievances with similarity index $\ge 0.40$ (40%) to administrative officers.
4. **Extractive Summarization:**
   - Generates condensed 1–2 sentence executive summaries for quick administrative briefing.

---

## 8. Technology Stack

| Layer | Technology / Tool | Version | Purpose |
|---|---|---|---|
| **Frontend** | HTML5 / CSS3 / JavaScript | ES6+ | Responsive Single-Page Application (SPA) with CSS Grid & Flexbox |
| **Icons & Fonts** | FontAwesome / Google Inter | Latest CDN | Modern UI typography and iconography |
| **Backend Framework** | Java / Spring Boot | Java 21 / Spring Boot 3.3.4 | REST API services, business logic, security, and multipart file routing |
| **ORM / Persistence** | Spring Data JPA / Hibernate | 3.3.4 | Object-Relational Mapping, entity lifecycle, and automated schema generation |
| **Security & Auth** | Spring Security Crypto | BCrypt | Password hashing, salting, and authorization filtering |
| **Database** | MySQL Server | 8.0+ | Relational persistence with foreign key constraints and UTF-8 collation |
| **Build & Dependency** | Apache Maven | 3.9+ | Dependency resolution and artifact compilation |
| **Media Storage** | Local Multipart Storage | NIO.2 | High-throughput photo and video streaming backend |

---

## 9. System Architecture

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|   +-----------------------------------------------------------------+   |
|   |   HTML5 + CSS3 + Vanilla JavaScript (script.js)                 |   |
|   |   - Citizen Portal & Dashboard   - Admin Command Center         |   |
|   |   - Real-Time Media Previews     - Dynamic Filtering & Search   |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
                                    |
                            HTTP / REST (JSON)
                            Multipart Form-Data
                                    |
+-------------------------------------------------------------------------+
|                           APPLICATION TIER                              |
|   +-----------------------------------------------------------------+   |
|   |   Spring Boot 3.3.4 REST Controllers                            |   |
|   |   - AuthController      - ComplaintController                   |   |
|   |   - AdminController     - MediaController                       |   |
|   +-----------------------------------------------------------------+   |
|                                   |                                     |
|   +-----------------------------------------------------------------+   |
|   |   Service Layer                                                 |   |
|   |   - UserService         - ComplaintService                      |   |
|   |   - AIService (NLP)     - FileStorageService (NIO.2)            |   |
|   +-----------------------------------------------------------------+   |
|                                   |                                     |
|   +-----------------------------------------------------------------+   |
|   |   Spring Data JPA Repositories                                  |   |
|   |   - UserRepository      - ComplaintRepository                   |   |
|   |   - SupportRepository   - CommentRepository                     |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
                    |                                   |
         JDBC / Hibernate ORM                 Local File System (NIO.2)
                    |                                   |
+-----------------------------------+   +---------------------------------+
|          DATABASE TIER            |   |          STORAGE TIER           |
|   MySQL 8.0+ ("civicconnect")     |   |   backend/civicconnect/uploads/ |
|   - users       - complaints      |   |   - Photos (.jpg, .png, .webp)  |
|   - supports    - comments        |   |   - Videos (.mp4, .webm, .mov)  |
+-----------------------------------+   +---------------------------------+
```

---

## 10. Project Structure

```
AI-Citizen-Grievance-System/
├── index.html                           # Main Citizen & Admin Single-Page Application UI
├── style.css                            # Modern, responsive design system and stylesheets
├── script.js                            # Frontend controller, API bridge, media handlers
├── README.md                            # Comprehensive project documentation
└── backend/
    └── civicconnect/
        ├── pom.xml                      # Maven build descriptor and dependencies
        ├── uploads/                     # Dedicated local storage for uploaded photos/videos
        └── src/
            ├── main/
                ├── java/
                │   └── com/
                │       └── civicconnect/
                │           ├── CivicConnectApplication.java   # Spring Boot Application Entrypoint
                │           ├── config/
                │           │   └── WebMvcConfig.java          # CORS & Resource Mapping Config
                │           ├── controller/
                │           │   ├── AdminController.java       # Admin dashboard & analytics endpoints
                │           │   ├── AuthController.java        # User registration and login
                │           │   ├── ComplaintController.java   # Core grievance CRUD & voting
                │           │   ├── MediaController.java       # Multipart file upload/stream handler
                │           │   └── TestController.java        # Health check and diagnostic API
                │           ├── dto/
                │           │   ├── AdminStatsResponse.java    # Aggregated system metrics DTO
                │           │   ├── AuthResponse.java          # Authentication payload DTO
                │           │   ├── CommentRequest.java        # Comment creation DTO
                │           │   ├── ComplaintRequest.java      # Grievance creation/update DTO
                │           │   ├── LoginRequest.java          # Login credentials DTO
                │           │   ├── RegisterRequest.java       # Citizen registration DTO
                │           │   └── StatusUpdateRequest.java   # Admin status transition DTO
                │           ├── entity/
                │           │   ├── Comment.java               # Public discussion entity
                │           │   ├── Complaint.java             # Core grievance entity
                │           │   ├── Support.java               # Community upvoting entity
                │           │   └── User.java                  # User profile & credentials entity
                │           ├── exception/
                │           │   ├── GlobalExceptionHandler.java# Centralized REST error handler
                │           │   └── ResourceNotFoundException.java
                │           ├── repository/
                │           │   ├── CommentRepository.java
                │           │   ├── ComplaintRepository.java
                │           │   ├── SupportRepository.java
                │           │   └── UserRepository.java
                │           └── service/
                │               ├── AIService.java             # Keyword NLP, priority, duplicate logic
                │               ├── ComplaintService.java      # Business logic & ownership checks
                │               ├── FileStorageService.java    # Disk persistence & media validation
                │               └── UserService.java           # Authentication & BCrypt hashing
                └── resources/
                    └── application.properties                 # Server port, MySQL, and upload settings
```

---

## 11. Database Entities & Schema Design

### 1. `users` Table (`User.java`)
Represents registered citizens and administrative officers.
- `id` (BIGINT, Primary Key, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL) — BCrypt Hashed
- `role` (VARCHAR(50), NOT NULL) — `ROLE_CITIZEN` or `ROLE_ADMIN`
- `created_at` (TIMESTAMP)

### 2. `complaints` Table (`Complaint.java`)
Stores public grievances and lifecycle tracking information.
- `id` (BIGINT, Primary Key, AUTO_INCREMENT)
- `title` (VARCHAR(255), NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (VARCHAR(100), NOT NULL) — *Roads, Electricity, Water Supply, Sanitation, etc.*
- `location` (VARCHAR(255), NOT NULL)
- `priority` (VARCHAR(50), NOT NULL) — `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `status` (VARCHAR(50), NOT NULL) — `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`
- `image_url` (VARCHAR(500), NULLABLE) — Stored relative URL to photo proof
- `video_url` (VARCHAR(500), NULLABLE) — Stored relative URL to video proof
- `created_by` (BIGINT, NOT NULL) — User ID of the filing citizen
- `created_by_name` (VARCHAR(255))
- `support_count` (INT, DEFAULT 0)
- `admin_notes` (TEXT, NULLABLE) — Official resolution notes provided by admins
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. `supports` Table (`Support.java`)
Enforces one upvote per user per complaint.
- `id` (BIGINT, Primary Key, AUTO_INCREMENT)
- `complaint_id` (BIGINT, NOT NULL)
- `user_id` (BIGINT, NOT NULL)
- `created_at` (TIMESTAMP)
- *Unique Constraint:* `(complaint_id, user_id)`

### 4. `comments` Table (`Comment.java`)
Facilitates citizen-official communication threads on grievances.
- `id` (BIGINT, Primary Key, AUTO_INCREMENT)
- `complaint_id` (BIGINT, NOT NULL)
- `user_id` (BIGINT, NOT NULL)
- `user_name` (VARCHAR(255), NOT NULL)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP)

---

## 12. Media Storage & Upload System
- **Physical Storage Path:** `D:\AI-Citizen-Grievance-System\backend\civicconnect\uploads\`
- **Web Endpoint:** `http://localhost:8080/uploads/{filename}`
- **Supported Formats:**
  - **Images:** `.jpg`, `.jpeg`, `.png`, `.webp`
  - **Videos:** `.mp4`, `.webm`, `.mov`
- **File Size Limits:** Up to **50 MB** per individual file, **60 MB** per multipart request.
- **Security & Integrity:** Files are assigned unique UUID-based prefixes (`UUID_filename.ext`) upon arrival to avoid directory traversal and filename collisions.

---

## 13. REST API Overview

### Authentication (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/users/register` | Register new citizen account | Public |
| `POST` | `/api/users/login` | Authenticate user (Citizen / Admin) | Public |
| `GET` | `/api/users/{id}` | Retrieve user profile by ID | Authenticated |

### Complaints (`/api/complaints`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/complaints` | Get all public grievances | Public / User |
| `GET` | `/api/complaints/{id}` | Get grievance details by ID | Public / User |
| `GET` | `/api/complaints/my` | Get grievances submitted by current user | Citizen |
| `POST` | `/api/complaints` | Submit a new grievance | Citizen |
| `PUT` | `/api/complaints/{id}` | Update grievance details (Title, Desc, Loc, Media) | Owner Only |
| `DELETE` | `/api/complaints/{id}` | Delete a grievance | Owner / Admin |
| `POST` | `/api/complaints/{id}/support` | Toggle community upvote / support | Citizen |
| `GET` | `/api/complaints/{id}/comments` | Fetch comments for a grievance | Public / User |
| `POST` | `/api/complaints/{id}/comments` | Post a comment on a grievance | Citizen / Admin |

### Admin Operations (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Retrieve aggregate KPI metrics & category counts | Admin Only |
| `PUT` | `/api/admin/complaints/{id}/status` | Update grievance status & add resolution notes | Admin Only |
| `GET` | `/api/admin/ai/triage/{id}` | Run real-time AI triage & duplicate check on case | Admin Only |

### Media Management (`/api/media`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/media/upload` | Upload photo or video file | Authenticated |

### Diagnostic (`/api/test`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/test` | Backend health check & connectivity probe | Public |

---

## 14. Setup Requirements

Ensure the following dependencies are installed on your workstation:
1. **Java Development Kit (JDK):** Version 21 (or 17+)
2. **Apache Maven:** Version 3.9+
3. **MySQL Server:** Version 8.0+
4. **Modern Web Browser:** Chrome, Firefox, Edge, or Brave
5. **Code Editor / IDE:** VS Code (with Live Server extension) or IntelliJ IDEA

---

## 15. Database Setup

1. Open your MySQL client (Command Line, MySQL Workbench, or phpMyAdmin) and log in with your root credentials:
```sql
mysql -u root -p
```
2. Execute the database initialization script:
```sql
CREATE DATABASE IF NOT EXISTS civicconnect;
USE civicconnect;
```
3. *Note:* Spring Boot's Hibernate integration (`spring.jpa.hibernate.ddl-auto=update`) will automatically construct all tables and relationships on application boot.

---

## 16. How to Run the Application

### Step 1: Start the Spring Boot Backend
1. Open a terminal or command prompt and navigate to the backend directory:
   ```powershell
   cd D:\AI-Citizen-Grievance-System\backend\civicconnect
   ```
2. Ensure database credentials in `src/main/resources/application.properties` match your local MySQL configuration (Default: `root` / `root` on port `3306`).
3. Run the application using Maven:
   ```powershell
   mvn spring-boot:run
   ```
4. The backend service will initialize on `http://localhost:8080`.
5. Verify health check by visiting `http://localhost:8080/api/test` in your browser (should return `Backend is working`).

### Step 2: Launch the Frontend Web Portal
- **Option A (VS Code Live Server - Recommended):**
  1. Open `D:\AI-Citizen-Grievance-System` in VS Code.
  2. Right-click `index.html` and select **"Open with Live Server"**.
  3. The web portal will open at `http://127.0.0.1:5500`.
- **Option B (Direct Browser Launch):**
  1. Double-click `D:\AI-Citizen-Grievance-System\index.html` to open it directly in any modern browser.

---

## 17. Default Demo Accounts

CivicConnect includes pre-configured demo credentials for rapid evaluation:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Municipal Administrator** | `admin@civicconnect.com` | `admin123` | Full administrative control, status updates, triage oversight, global deletion |
| **Citizen (Demo 1)** | `faiz@test.com` | `123456` | File grievances, upload media proof, edit/delete own posts, upvote, comment |
| **Citizen (Demo 2)** | `arun@test.com` | `123456` | File grievances, upvote community posts, post discussion comments |

*Note: New citizens can also register instantly using the "Register" tab on the web portal.*

---

## 18. Testing & Quality Assurance

### Automated Compilation & Testing
Run the following Maven command in `backend/civicconnect` to verify that all entity mappings, Spring components, and repositories compile cleanly:
```powershell
mvn clean test-compile
```
*Expected Result:* `BUILD SUCCESS` (0 compilation errors).

### End-to-End Functional Test Checklist
- [x] **User Registration & Login:** Validates credential hashing and role assignment.
- [x] **Complaint Submission:** Verifies persistence in MySQL with category and location.
- [x] **Image Proof Attachment:** Tests `.jpg`/`.png` upload, storage in `uploads/`, and in-browser preview.
- [x] **Video Proof Attachment:** Tests `.mp4`/`.webm` upload, storage, and HTML5 video streaming.
- [x] **Ownership Enforcement:** Verifies that Citizen A cannot edit or delete Citizen B's complaint.
- [x] **Community Support:** Verifies atomic upvoting with duplicate vote prevention.
- [x] **Admin Redressal Workflow:** Verifies status transition (`PENDING` -> `RESOLVED`) and resolution note persistence.
- [x] **AI Triage Validation:** Verifies automatic department suggestions, duplicate detection flags, and urgency scoring.

---

## 19. Project Workflow

```
[ Citizen ]                                          [ Admin / ULB ]
     |                                                      |
     |-- 1. Register / Login                                |
     |-- 2. Fill Complaint Form (Title, Category, Location) |
     |-- 3. Attach Proof (Photo / Video Preview)            |
     |-- 4. Submit Complaint -----------------------------> |
     |                                                      |-- 5. AI Analyzes Priority & Duplicates
     |                                                      |-- 6. Assign Department & Review Proof
     |                                                      |-- 7. Change Status to "IN_PROGRESS"
     |<-- 8. Real-Time Status Notification -----------------|
     |                                                      |
     |-- 9. Community Upvotes & Adds Comments               |
     |                                                      |-- 10. Field Crew Resolves Issue
     |                                                      |-- 11. Mark "RESOLVED" with Notes
     |<-- 12. Verification & Closure -----------------------|
```

---

## 20. Future Enhancements
- **GPS Geolocation & Map Integration:** Interactive OpenStreetMap / Leaflet integration for map-based pin dropping and cluster heatmaps.
- **Automated SMS & WhatsApp Alerts:** Real-time push notifications to citizens upon milestone status updates via Twilio or WhatsApp Business API.
- **Computer Vision Model for Automated Proof Verification:** Deep learning model to analyze uploaded damage photos (detecting potholes, garbage overflow, or water logging).
- **Citizen Feedback & Satisfaction Rating:** Post-resolution citizen rating (1–5 stars) to evaluate municipal department efficiency.

---

## 21. Conclusion
CivicConnect bridges the divide between citizens and urban local bodies by replacing opaque manual grievance registers with an intelligent, transparent, and participatory digital platform. By pairing robust Spring Boot REST services with explainable AI triage heuristics and high-capacity multimedia handling, the system empowers citizens to hold administration accountable while providing municipal officers with the data-driven tools needed for rapid, prioritized civic redressal.

---
*Developed for Academic & Municipal Governance Redressal Evaluation.*
