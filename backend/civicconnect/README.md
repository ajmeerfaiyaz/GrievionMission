# Grievion Mission - Backend (Spring Boot)

AI-Powered Citizen Grievance Management System backend application.  
**“Every Grievance. A Step Toward Resolution.”**

## Tech Stack
- **Language**: Java 21
- **Framework**: Spring Boot 3.3.4
- **Build Tool**: Apache Maven
- **Modules Included**:
  - `spring-boot-starter-web` (REST APIs)
  - `spring-boot-starter-data-jpa` (Spring Data JPA)
  - `mysql-connector-j` (MySQL JDBC Driver)
  - `spring-boot-starter-validation` (Jakarta Validation)
  - `spring-boot-starter-test` (Unit/Integration Testing)

---

## Project Structure
```
backend/
└── civicconnect/
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/
    │   │   │       └── civicconnect/
    │   │   │           ├── controller/
    │   │   │           │   └── TestController.java
    │   │   │           └── CivicConnectApplication.java
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/
    ├── pom.xml
    └── README.md
```

---

## Running the Application

### 1. Build the Project
From `backend/civicconnect/`:
```bash
mvn clean compile
```

### 2. Run the Spring Boot Application
```bash
mvn spring-boot:run
```
Or build the executable JAR:
```bash
mvn clean package
java -jar target/civicconnect-0.0.1-SNAPSHOT.jar
```

---

## Verifying Step 3.1 Test Endpoint

Once running, open your browser or use curl:
```bash
curl http://localhost:8080/api/test
```

**Expected Response**:
```
Grievion Mission Backend is running successfully!
```
