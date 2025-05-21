# **RESTful Frontend Plan: School Admin Dashboard**

This document outlines the revised plan for the frontend development of the School Admin Dashboard as a Service, transitioning to consuming a RESTful API using React, TypeScript, and standard HTTP communication methods.  
**Technology Stack:**

* **Core Library:** React  
* **Language:** TypeScript  
* **Package Manager:** pnpm  
* **Styling:** Tailwind CSS with Shadcn UI  
* **Form Validation:** Zod  
* **State Management:** Zustand (for UI state, global settings)  
* **API Data Management:** React Query or SWR (Recommended for server state/caching)  
* **API Communication:** Standard Fetch API or a library like Axios (Used by React Query/SWR or directly)  
* **Authentication:** JWT (JSON Web Tokens)

**1\. Goals and Objectives:**

* Develop a responsive, intuitive, and user-friendly web interface for school administrators, teachers, parents, and potentially students.  
* Provide a clear and efficient way to access and manage school-related information based on user roles.  
* Consume the backend's **standard RESTful API** for data exchange.  
* Implement **JWT-based authentication** for secure user access.  
* Utilize **Zod for type-safe and robust form validation**.  
* Manage frontend state efficiently using **Zustand** (for UI-specific state) and **React Query/SWR** (for server data state).  
* Ensure a smooth and performant user experience with effective caching and background updates.  
* Implement robust security measures to protect sensitive data displayed on the frontend.

**2\. Technology Choice Rationale (React, Tailwind CSS, Shadcn UI, Zod, Zustand, React Query/SWR, REST, JWT):**

* **React:** Provides a strong foundation for building a dynamic, component-based UI. Its large ecosystem and community support ensure access to numerous libraries and resources.  
* **Tailwind CSS & Shadcn UI:** Provide a powerful combination for rapid styling and accessible, pre-built UI components, accelerating frontend development and ensuring a consistent look and feel.  
* **Zod:** A TypeScript-first schema declaration and validation library. It allows you to define data schemas (e.g., for forms, API responses) with static type inference, providing powerful, type-safe validation and reducing runtime errors. It integrates well with form libraries (like React Hook Form) and can be used to validate data received from REST API responses.  
* **Zustand:** A small, fast, and scalable bearbones state management solution. It has a simple API based on hooks and requires less boilerplate compared to other solutions. It's suitable for managing UI-specific state, global application settings, or data not directly fetched from the server.  
* **React Query / SWR:** Libraries for managing, caching, and synchronizing server state in React. They simplify data fetching, reduce boilerplate for loading/error states, handle background re-fetching, and improve perceived performance through caching and optimistic updates. Highly recommended when working with REST APIs.  
* **Standard Fetch API / Axios:** Standard and widely used methods for making HTTP requests to a REST API. They are well-supported and flexible, often used *by* data fetching libraries like React Query/SWR.  
* **JWT (JSON Web Tokens):** A standard, stateless method for authenticating users.

**3\. Core Features (MVP Frontend):**  
Based on the overall MVP plan and the RESTful backend endpoints, the frontend will implement the user interface and interactions for:

* **User Authentication:**  
  * Login page with input fields. **Use Zod schemas to validate login form input** on the client side before sending.  
  * Make a **POST request** (via Fetch/Axios, potentially wrapped in a mutation hook from React Query/SWR) to the /auth/login endpoint with validated credentials.  
  * Receive JWT token(s) from the backend response.  
  * Store the JWT token securely (e.g., in localStorage or an HTTP-only cookie).  
  * Redirect user based on role, potentially storing basic user/role info in a **Zustand store** for easy access across components.  
* **Dashboard Overview:**  
  * Use **React Query/SWR query hooks** to fetch key metrics from relevant endpoints (e.g., /dashboard/summary). These hooks will manage loading/error states automatically.  
  * Use a **React Query/SWR query hook** to fetch recent announcements from /announcements.  
  * Utilize Shadcn UI components for layout and data presentation, displaying loading/error states provided by the data fetching hooks.  
* **Student Information (Lite View):**  
  * Use a **React Query/SWR query hook** to fetch a list of students from /students. The library will handle caching and background updates. Implement pagination and filtering by passing parameters to the hook.  
  * Use a **React Query/SWR query hook** to fetch basic student profile details from /students/:id.  
  * Use Shadcn UI components for tables, forms (with **Zod validation**), and display elements, showing loading/error states from the hooks.  
* **Attendance Tracking Interface:**  
  * Interface for teachers/admins to select a class and date (UI components from Shadcn UI).  
  * Use a **React Query/SWR query hook** to fetch a list of students for the class from /classes/:classId/students (or similar).  
  * Use interactive elements (Shadcn UI) to mark attendance status. **If using a form, use Zod to validate the attendance submission data structure.**  
  * Use a **React Query/SWR mutation hook** to make a **POST request** to /attendance to submit attendance data. Manage the state of the form submission (loading, success, error) using the mutation hook's state.  
  * View attendance records by using **React Query/SWR query hooks** to fetch data from endpoints like /students/:studentId/attendance or /classes/:classId/attendance, displayed using Shadcn UI tables.  
* **Basic Communication Display:**  
  * Use a **React Query/SWR query hook** to fetch announcements from /announcements.  
* **Basic User Management Interface:**  
  * Use a **React Query/SWR query hook** to fetch a list of users from /users. Implement pagination and filtering.  
  * Display basic user details fetched by using a **React Query/SWR query hook** to fetch from /users/:id. Use Shadcn UI components, including forms for editing user info with **Zod validation** and a **React Query/SWR mutation hook** for submission.

**4\. Future Frontend Enhancements:**  
As the backend and features expand (driven by database additions and new REST endpoints), the frontend will evolve to include interfaces for:

* Forms for full student profiles, teacher profiles, parent profiles, etc., all utilizing **Zod for comprehensive validation** before sending data via POST/PUT/PATCH requests using **React Query/SWR mutation hooks** to the relevant endpoints.  
* Complex workflows like admissions, scheduling, fee payment, etc., where form data structures are validated with **Zod** before making REST API calls using mutation hooks.  
* Utilizing **Zustand stores** to manage state for complex components or shared application state not related to server data (e.g., filtering options *applied* on the frontend, notification states, UI preferences like dark mode).  
* Using **Zod schemas to validate data received from REST API responses** within your data fetching logic (potentially in your API service/hook or directly in data fetching functions used by React Query/SWR) to ensure data integrity and type safety on the frontend.  
* Advanced reporting dashboards, fetching data via **React Query/SWR query hooks**, and potentially using **Zustand** to manage the state of report parameters or visualization configurations.  
* Implementing **optimistic updates** for mutations using React Query/SWR to improve perceived performance.  
* Implementing **pagination, sorting, and filtering** logic comprehensively for all list views, managed via query parameters and passed to data fetching hooks.

**5\. UI/UX Considerations:**

* **Role-Based Design:** The interface adapts based on the user's role, leveraging data fetched securely via REST API calls (managed by React Query/SWR) and potentially user role information stored in a **Zustand store**.  
* **Form Validation Feedback:** Display clear and immediate validation error messages to the user based on **Zod validation** results, ideally integrated with a form management library (like React Hook Form). Display backend validation errors received in API responses next to the relevant fields.  
* **State Management for UI:** Use **Zustand** to manage UI-specific state (e.g., modal open/closed states, step in a multi-step form, sidebar visibility, **dark mode setting**).  
* **Accessibility:** Leverage Shadcn UI's built-in accessibility features, complemented by proper form labeling and error reporting informed by **Zod validation** and backend error responses. Ensure keyboard navigation and ARIA attributes are correctly implemented.  
* **Responsiveness:** Utilize Tailwind CSS's responsive utilities.  
* **Error Handling:** Handle errors from REST API calls gracefully using the error states provided by **React Query/SWR hooks**. Display informative feedback to the user using appropriate HTTP status codes and parse error messages from the response body. Implement strategies like toast notifications for non-critical errors and dedicated error pages for critical failures.  
* **Loading States:** Implement clear visual feedback for loading states using the loading indicators provided by **React Query/SWR hooks**, including spinners, disabled elements, and skeleton loaders.

**6\. State Management (Zustand Implementation):**

* Create small, focused **Zustand stores** for different parts of your application state *not* related to server data (e.g., an authStore for authentication status and user info, a uiStore for general UI states like sidebar visibility or **dark mode preference**, potentially feature-specific stores for complex UI flows).  
* Define state slices and actions within your Zustand stores.  
* Use Zustand's hooks (useStore) to select and consume specific pieces of state in your React components.

**7\. Form Validation (Zod Implementation):**

* Define **Zod schemas** for the expected structure and validation rules of your forms.  
* Integrate Zod with a form management library (like **React Hook Form** with its Zod resolver) to handle form state, input registration, submission, and displaying validation errors based on the Zod schema.  
* Use **Zod schemas to validate data received from REST API responses** within your data fetching logic (e.g., in the queryFn for React Query/SWR) to ensure the data conforms to the expected structure and types. This adds a layer of safety even without tRPC's end-to-end types.

**8\. API Communication (Fetch API / Axios / React Query/SWR Implementation):**

* Choose between the built-in fetch API or a library like axios as the underlying HTTP client. axios often provides a slightly nicer API and features useful for an API service.  
* **Implement React Query or SWR** for managing server state.  
* Create a core API utility function (using Fetch or Axios) that handles:  
  * Taking the endpoint URL, HTTP method (GET, POST, etc.), and data as arguments.  
  * Reading the JWT token from secure storage (e.g., localStorage or the authStore).  
  * Including the JWT token in the Authorization: Bearer \<token\> header for protected endpoints.  
  * Handling request and response transformations (e.g., converting data to JSON for POST/PUT requests, parsing JSON responses).  
  * Implementing basic error handling based on HTTP status codes.  
  * Potentially validating the response structure using Zod schemas.  
* Use this API utility function within your **React Query/SWR queryFn or mutationFn** to interact with the backend REST API.

**9\. Development Environment:**

* Use pnpm.  
* Set up a development server.  
* Implement linting and formatting configured for TypeScript, React, **Zod**, and the chosen form/data fetching libraries.  
* Write tests for components, **Zustand stores**, **Zod schemas**, and API service functions (mocking HTTP requests). Ensure validation logic is well-tested.  
* Refer to the backend's OpenAPI (Swagger) documentation to understand available endpoints, request/response structures, and validation rules. Consider using tools to generate TypeScript types from the OpenAPI spec.

**10\. Integration with Backend (REST):**

* Collaborate with the backend team on the REST API endpoint definitions, request/response structures, and error handling conventions.  
* Use the backend's OpenAPI (Swagger) documentation as the source of truth for API details and potentially generate frontend types from it.  
* Implement error handling for REST API calls using **React Query/SWR's error handling capabilities**, including handling specific HTTP status codes and parsing error messages from the response body to provide meaningful user feedback.

**11\. Deployment:**

* Choose a hosting provider.  
* Set up a CI/CD pipeline.  
* Consider performance optimizations like code splitting and lazy loading components.

By incorporating a dedicated data fetching library like React Query or SWR and centralizing your API communication logic, you can significantly improve the efficiency and maintainability of your frontend when working with a RESTful backend.