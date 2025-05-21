# **RESTful Backend Plan: School Admin Dashboard**

This document outlines the revised plan for the backend development of the School Admin Dashboard as a Service, transitioning from tRPC to a RESTful API using Node.js with NestJS and JWT for authentication.  
**Technology Stack:**

* **Framework:** NestJS (Node.js)  
* **Language:** TypeScript  
* **Package Manager:** pnpm  
* **Database:** PostgreSQL  
* **ORM:** Prisma  
* **Authentication:** JWT (JSON Web Tokens)  
* **API Style:** RESTful  
* **Validation:** Class-validator, NestJS ValidationPipe  
* **Testing:** Jest (default with NestJS)  
* **API Documentation:** OpenAPI (Swagger)  
* **Type Generation (Optional but Recommended):** OpenAPI client generators

**1\. Goals and Objectives:**

* Build a secure, scalable, and maintainable backend application using NestJS.  
* Implement the core business logic for managing school data and processes, leveraging the structured database schema and Prisma.  
* Expose backend functionality via a **standard RESTful API**, consumable by the frontend.  
* Implement **JWT-based authentication** for secure user access to REST endpoints.  
* Ensure the integrity and security of all stored data through coordinated backend and database-level measures.  
* Handle user authentication and authorization based on roles and the multi-tenancy model within the NestJS request context.  
* Facilitate interaction with the PostgreSQL database via Prisma.  
* Design the backend to be modular and extensible to accommodate future features and database tables, exposed via REST endpoints.

**2\. Technology Choice Rationale (Node.js / NestJS, REST, JWT, Impacted by DB Choice):**

* **Node.js & NestJS:** Remains an excellent choice for structured backend development. NestJS's modularity, use of TypeScript, and built-in support for building REST APIs integrate well with Prisma and provide a solid foundation.  
* **RESTful API:** A widely adopted architectural style that provides a clear and standardized way to expose resources and their operations using HTTP methods (GET, POST, PUT, DELETE). This offers broad compatibility with various frontend technologies and third-party services.  
* **JWT:** A standard for creating tokens that contain information (claims) about an entity (the user). It's suitable for stateless authentication. JWTs will be generated upon login and verified for access to protected REST endpoints.

**3\. Core Features (MVP REST Endpoints), Influenced by Database:**  
The backend will implement NestJS services and logic, which will then be exposed via NestJS controllers as REST endpoints. All endpoints operating on school-specific data must incorporate multi-tenancy filtering based on the user's school ID obtained during authentication.

* **Controller Setup:** Define NestJS controllers for each major resource (e.g., AuthController, UsersController, StudentsController, AttendanceController).  
* **Authentication Endpoints (AuthController):**  
  * POST /auth/login: Receive credentials, authenticate against the User table via Prisma. If valid, generate a JWT containing user ID, role, and schoolId. Return the JWT.  
  * GET /auth/me (Protected): Verify JWT from the request header. Retrieve the authenticated user's details from the User table via Prisma (filtered by ID and potentially schoolId).  
* **User Endpoints (UsersController):**  
  * GET /users (Protected \- Admin role): Retrieve users from the User table via Prisma, **filtering by the authenticated user's schoolId**. Use Prisma includes to fetch related Teacher/Parent data (Phase 2).  
  * GET /users/:id (Protected): Retrieve a user by ID from the User table via Prisma, **ensuring the user belongs to the authenticated user's schoolId**.  
  * POST /users (Protected \- Admin role): Receive user data, validate. Create a new user in the User table via Prisma. **Assign the authenticated user's schoolId to the new user.**  
  * PUT /users/:id or PATCH /users/:id (Protected \- Admin role): Receive user ID and data, validate. Update user details in the User table via Prisma, **ensuring the user belongs to the correct schoolId**.  
  * DELETE /users/:id (Protected \- Admin role): Receive user ID. Mark user as inactive in the User table via Prisma, **ensuring school ownership**.  
* **Student Endpoints (StudentsController):**  
  * GET /students (Protected): Retrieve students from the Student table via Prisma, **filtering by the authenticated user's schoolId**. For teachers, add further filtering based on classes they teach (requires joining via Enrollment/StudentClass in Prisma queries).  
  * GET /students/:id (Protected): Retrieve student details by ID from the Student table via Prisma, **ensuring school ownership**.  
  * POST /students (Protected \- Admin role): Receive student data, validate. Create a new student in the Student table via Prisma. **Assign the authenticated user's schoolId.** Ensure uniqueness of studentId within the school using Prisma constraints.  
  * PUT /students/:id or PATCH /students/:id (Protected): Receive student ID and data, validate. Update student information in the Student table via Prisma, **ensuring school ownership**.  
* **Attendance Endpoints (AttendanceController):**  
  * POST /attendance: Receive attendance data (student ID, date, status, session ID). Validate input. Create new AttendanceRecord entries via Prisma. Link records to Student, Class, User (recorder), and **importantly, the authenticated user's schoolId**. Utilize Prisma transactions if marking attendance for multiple students.  
  * GET /students/:studentId/attendance (Protected): Retrieve attendance records for a student from AttendanceRecord via Prisma, **ensuring the student and records belong to the authenticated user's school**.  
  * GET /classes/:classId/attendance (Protected): Retrieve attendance records for a class from AttendanceRecord via Prisma, **ensuring the class and records belong to the authenticated user's school**.  
  * GET /attendance/summary (Protected): Aggregate attendance data from AttendanceRecord via Prisma, **filtered by schoolId** and date range.  
* **Announcement Endpoints (AnnouncementsController):**  
  * GET /announcements (Protected): Retrieve announcements from the Announcement table via Prisma, **filtering by schoolId** and potentially audience.  
  * POST /announcements (Protected \- Admin role): Create a new announcement in the Announcement table via Prisma. **Assign the authenticated admin user's schoolId and createdByUserId.**

**4\. Future Backend Enhancements, Driven by Database Expansion (Exposed via REST):**  
As new tables are added (Teacher, Parent, Subject, Assignment, Grade, Fees, etc.), the backend will implement corresponding NestJS services and expose them as new REST endpoints within relevant controllers (e.g., adding endpoints like POST /grades, GET /students/:studentId/grades, POST /invoices, POST /payments):

* Develop services and controllers for managing Teacher profiles, Parents, and linking them to students.  
* Implement academic endpoints for managing Subjects, Assignments, Assessments, and Grades, leveraging the new academic tables.  
* Develop financial endpoints for Fee types, Invoicing, Invoice Items, and Payments, interacting with the new financial tables and potentially external payment gateway APIs.  
* Add endpoints for Discipline Incidents, Health Records, Communication Logs, School Settings, etc., as their corresponding tables are implemented.  
* Utilize NestJS modules to organize services, controllers, and other components logically (e.g., an AcademicModule containing Subject, Assignment, Grade services and their corresponding controllers).

**5\. Impact of Database Design on Backend Implementation (Continued):**  
The detailed database plan continues to heavily influence backend development:

* **Data Model and Type Safety:** The schema.prisma file is the source of truth for both the database and the backend types used by Prisma Client. Changes in the database schema lead to updates in schema.prisma, which then updates Prisma Client types. You will need to manually ensure your DTOs and response interfaces align with these types or use tools like OpenAPI generators.  
* **Multi-Tenancy Logic:** The schoolId column requires filtering in almost every endpoint that accesses school-specific data. This filtering logic should ideally be abstracted into a service or guard that's applied consistently. The future implementation of RLS will be a significant backend improvement, potentially allowing the removal of explicit WHERE schoolId \= ... clauses in many service methods as the database handles it.  
* **Relationship Handling:** Prisma simplifies working with database relationships. Services will use Prisma's include and nested operations to fetch and modify related data efficiently (e.g., getting a student and their linked parent contact info in one endpoint request).  
* **Data Integrity & Validation:** Backend validation (using class-validator and NestJS pipes) remains crucial to validate incoming data *before* it reaches the database. This complements the database constraints defined in schema.prisma, providing a layered approach to data integrity and better error feedback via REST responses.  
* **Performance:** Backend performance is directly tied to database query performance.  
  * Design service methods called by controllers to use Prisma's select, include efficiently.  
  * Implement pagination and filtering logic in GET endpoints for large datasets using query parameters.  
  * Use Prisma's batch operations and transactions appropriately.  
  * Monitor database query performance and optimize backend data access based on EXPLAIN ANALYZE.  
  * Consider Prisma Accelerate in the future for global caching and connection pooling improvements.  
* **Audit Logging:** Implement logic within relevant service methods called by mutation endpoints (POST, PUT, PATCH, DELETE) to record changes to the AuditLog table via Prisma whenever sensitive data is created, updated, or deleted.

**6\. Authentication and Authorization (JWT & NestJS Guards/Context):**

* **JWT Generation:** Upon successful login (via the POST /auth/login endpoint), a JWT is generated containing claims (e.g., user ID, role, school ID). This token is returned in the response body.  
* **JWT Verification Guard:** Implement a NestJS AuthGuard that intercepts incoming requests to protected endpoints. This guard will extract the JWT (typically from the Authorization: Bearer \<token\> header), verify its signature and expiration.  
* **Request Context:** Information from the verified JWT (user ID, role, school ID) is attached to the request object or a custom execution context. This context is then available to controllers, guards, and services, allowing them to access the authenticated user's information and apply authorization/multi-tenancy logic.  
* **Authorization:** Implement checks within NestJS Guards or using custom decorators/interceptors to ensure the authenticated user's role (from the request context) is authorized to perform the requested action. Crucially, verify that any resource being accessed or modified belongs to the user's schoolId (from the context), enforcing multi-tenancy.

**7\. Security Considerations:**

* Implement input validation using NestJS pipes and class-validator with DTOs for all incoming request bodies and query parameters.  
* Sanitize user inputs.  
* **Strictly enforce authorization and multi-tenancy checks using NestJS Guards and logic within services based on the authenticated user's context.** This is your primary line of defense after authentication.  
* Secure handling of JWTs (signing with a strong secret, appropriate expiration times). Consider refresh tokens for managing long sessions more securely.  
* Implement rate limiting on sensitive endpoints (e.g., POST /auth/login).  
* Use HTTPS for all communication.

**8\. Development Environment:**

* Use pnpm.  
* Docker Compose for local PostgreSQL DB.  
* NestJS CLI.  
* Jest for testing.  
* **Set up OpenAPI (Swagger) documentation generation** using @nestjs/swagger. This will help document your REST API.  
* Consider using OpenAPI client generators to create type-safe API clients for your frontend based on the generated documentation.

**9\. API Design (REST Endpoints):**

* Define backend capabilities as resources exposed through URLs.  
* Use appropriate HTTP methods (GET for fetching, POST for creating, PUT/PATCH for updating, DELETE for deleting).  
* Use clear and consistent URL structures (e.g., /resources, /resources/:id, nested resources like /resources/:resourceId/subresources).  
* Define explicit DTOs for request bodies and response structures.  
* Use HTTP status codes to indicate the outcome of requests (e.g., 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).  
* Provide meaningful error messages in the response body for client-side handling.

**10\. Deployment:**

* Containerize your NestJS application.  
* Deploy to a cloud platform.  
* Set up CI/CD, including steps for building the application and potentially generating OpenAPI documentation.  
* Implement monitoring and logging.

By transitioning to a RESTful architecture with NestJS controllers, you will build a backend that adheres to widely accepted standards, making it easily consumable by various clients and facilitating integration with other services.