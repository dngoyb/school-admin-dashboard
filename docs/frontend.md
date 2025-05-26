# **RESTful Frontend Plan: School Admin Dashboard**

This document outlines the revised plan for the frontend development of the School Admin Dashboard as a Service, transitioning to consuming a RESTful API using React, TypeScript, and standard HTTP communication methods.  
**Technology Stack:**

* **Core Library:** React  
* **Language:** TypeScript  
* **Package Manager:** pnpm  
* **Styling:** Tailwind CSS with Shadcn UI  
* **Form Validation:** Zod  
* **State Management:** Zustand (for UI state, global settings)  
* **API Data Management:** React Query (Recommended for server state/caching)  
* **API Communication:** Standard Fetch API or a library like Axios (Used by React Query)  
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

**12. API Layer Organization:**

* **Feature-based API Modules:**
  * Organize API calls into feature-based modules (e.g., `api/auth.ts`, `api/students.ts`)
  * Create custom hooks for common API patterns (e.g., `useAuth`, `useStudents`)
  * Implement consistent error handling and response typing
  * Example structure:
    ```typescript
    // api/students.ts
    export const studentsApi = {
      getAll: (params: StudentQueryParams) => 
        api.get('/students', { params }),
      getById: (id: string) => 
        api.get(`/students/${id}`),
      create: (data: CreateStudentDto) => 
        api.post('/students', data),
      // ... other student-related API calls
    };

    // hooks/useStudents.ts
    export const useStudents = (params: StudentQueryParams) => {
      return useQuery(['students', params], () => 
        studentsApi.getAll(params)
      );
    };
    ```

* **API Versioning Strategy:**
  * Implement version prefix in API URLs (e.g., `/api/v1/students`)
  * Create version-specific API clients
  * Handle version deprecation gracefully
  * Document version migration guides

**13. Enhanced Error Handling Strategy:**

* **Global Error Handling:**
  * Implement React Error Boundaries for component-level errors
  * Create a global error handler for API errors
  * Define custom error types and messages
  * Example error boundary:
    ```typescript
    class ErrorBoundary extends React.Component {
      state = { hasError: false, error: null };
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      render() {
        if (this.state.hasError) {
          return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
      }
    }
    ```

* **Error Notification System:**
  * Implement toast notifications for non-critical errors
  * Create dedicated error pages for critical failures
  * Add error logging and monitoring
  * Example toast implementation:
    ```typescript
    const useErrorToast = () => {
      return useToast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    };
    ```

**14. Performance Optimization:**

* **Code Splitting:**
  * Implement dynamic imports for route-based code splitting
  * Use React.lazy for component-level code splitting
  * Example:
    ```typescript
    const Dashboard = React.lazy(() => import('./pages/Dashboard'));
    const Students = React.lazy(() => import('./pages/Students'));
    ```

* **Bundle Optimization:**
  * Configure webpack/vite for optimal bundle size
  * Implement tree shaking
  * Use dynamic imports for large dependencies
  * Monitor bundle size with tools like `webpack-bundle-analyzer`

* **Caching Strategies:**
  * Configure React Query caching policies
  * Implement stale-while-revalidate pattern
  * Use service workers for offline support
  * Example React Query cache configuration:
    ```typescript
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          cacheTime: 30 * 60 * 1000, // 30 minutes
        },
      },
    });
    ```

**15. Testing Strategy:**

* **Unit Testing:**
  * Use Jest and React Testing Library
  * Test component rendering and interactions
  * Test custom hooks and utilities
  * Example component test:
    ```typescript
    describe('StudentList', () => {
      it('renders student data correctly', () => {
        render(<StudentList students={mockStudents} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
    ```

* **Integration Testing:**
  * Test component interactions
  * Test API integration
  * Use MSW for API mocking
  * Example integration test:
    ```typescript
    describe('StudentForm', () => {
      it('submits form data correctly', async () => {
        render(<StudentForm />);
        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.click(screen.getByText('Submit'));
        expect(mockApi.createStudent).toHaveBeenCalledWith({
          name: 'John Doe',
        });
      });
    });
    ```

* **E2E Testing:**
  * Use Cypress or Playwright
  * Test critical user flows
  * Implement visual regression testing
  * Example Cypress test:
    ```typescript
    describe('Student Management', () => {
      it('creates a new student', () => {
        cy.visit('/students');
        cy.get('[data-testid="add-student"]').click();
        cy.get('[name="name"]').type('John Doe');
        cy.get('[type="submit"]').click();
        cy.contains('Student created successfully');
      });
    });
    ```

**16. Security Considerations:**

* **JWT Token Management:**
  * Implement secure token storage
  * Handle token refresh flow
  * Implement token expiration handling
  * Example token refresh:
    ```typescript
    const refreshToken = async () => {
      const response = await api.post('/auth/refresh');
      setToken(response.data.token);
      return response.data.token;
    };
    ```

* **Security Headers:**
  * Configure Content Security Policy
  * Implement CORS policies
  * Set up XSS protection
  * Example security headers:
    ```typescript
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }));
    ```

**17. Component Architecture:**

* **Component Organization:**
  * Follow atomic design principles
  * Create reusable component library
  * Implement compound components
  * Example component structure:
    ```
    components/
      atoms/
        Button/
        Input/
      molecules/
        FormField/
        Card/
      organisms/
        StudentCard/
        Navigation/
      templates/
        DashboardLayout/
        AuthLayout/
    ```

* **Component Documentation:**
  * Use Storybook for component documentation
  * Document props and usage examples
  * Include accessibility information
  * Example Storybook story:
    ```typescript
    export default {
      title: 'Components/Button',
      component: Button,
      argTypes: {
        variant: {
          options: ['primary', 'secondary'],
          control: { type: 'select' },
        },
      },
    };
    ```

**18. Internationalization (i18n):**

* **Implementation:**
  * Use react-i18next for translations
  * Implement language detection
  * Handle RTL languages
  * Example i18n setup:
    ```typescript
    const resources = {
      en: { translation: enTranslations },
      fr: { translation: frTranslations },
    };

    i18n.init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
    });
    ```

* **Formatting:**
  * Use date-fns for date formatting
  * Implement number formatting
  * Handle currency display
  * Example formatting:
    ```typescript
    const formatDate = (date: Date) => {
      return format(date, 'PPP', { locale: i18n.language });
    };
    ```

**19. Monitoring and Analytics:**

* **Error Tracking:**
  * Implement Sentry for error tracking
  * Set up error logging
  * Create error reporting dashboard
  * Example Sentry setup:
    ```typescript
    Sentry.init({
      dsn: "your-dsn",
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
    ```

* **Performance Monitoring:**
  * Implement Google Analytics
  * Track user interactions
  * Monitor page load times
  * Example analytics setup:
    ```typescript
    const trackPageView = (path: string) => {
      gtag('config', 'GA-MEASUREMENT-ID', {
        page_path: path,
      });
    };
    ```

**20. Development Workflow:**

* **Git Workflow:**
  * Follow Git Flow or GitHub Flow
  * Use conventional commits
  * Implement branch protection
  * Example commit message:
    ```
    feat(students): add student creation form
    
    - Add form component with validation
    - Implement API integration
    - Add success/error handling
    ```

* **PR Review Process:**
  * Create PR template
  * Define review checklist
  * Implement automated checks
  * Example PR checklist:
    ```markdown
    ## PR Checklist
    - [ ] Tests added/updated
    - [ ] Documentation updated
    - [ ] Accessibility reviewed
    - [ ] Performance impact assessed
    - [ ] Security considerations addressed
    ```

* **Documentation Requirements:**
  * Document component usage
  * Update API documentation
  * Maintain changelog
  * Example component documentation:
    ```typescript
    /**
     * StudentCard component displays student information
     * @param {Student} student - Student data
     * @param {boolean} editable - Whether the card is editable
     * @returns {JSX.Element} StudentCard component
     */
    export const StudentCard: React.FC<StudentCardProps> = ({
      student,
      editable,
    }) => {
      // Component implementation
    };
    ```

**21. Suggested Implementation Plan (Claude's Suggestion)**

Below is a detailed plan (suggested by Claude) for implementing the frontend as outlined in this document. This plan is intended to guide you from initial setup to a working MVP and beyond.

---

**1. Project Foundation & Core Setup**

- **Folder Structure:** Already organized (e.g., components, hooks, lib, pages, providers, store, types, assets).
- **Dependencies:** Already installed (react-router-dom, @tanstack/react-query, zustand, zod, react-hook-form, axios, shadcn-ui, etc.).
- **Tailwind CSS:** Already configured (no separate styles folder needed).
- **Vite/React/TypeScript:** Already set up.

---

**2. Core App Architecture**

- **Routing:** Use react-router-dom for page navigation.
- **State Management:** Use zustand for UI/global state (e.g., auth, sidebar, theme) and @tanstack/react-query for server state (students, attendance, announcements, etc.).
- **API Layer:** Create a reusable API utility (using Axios or Fetch) and organize feature-based API modules (e.g., lib/api/auth.ts, lib/api/students.ts).
- **Form Handling:** Use react-hook-form with zod for robust form validation.
- **UI Components:** Use Shadcn UI (or your own atomic components) in components/ui/ and feature components in components/features/.

---

**3. Authentication Flow**

- **Pages:** Create pages/auth/Login.tsx (and, if needed, pages/auth/Register.tsx).
- **Logic:**
  - Build a login form (with zod validation) that POSTs to /auth/login.
  - Store the JWT (e.g., in localStorage or a zustand store) and redirect based on user role.
  - Implement an auth context/provider (in providers/) to manage user state.
- **Protected Routes:** Use a route guard (or HOC) to restrict access to authenticated pages.

---

**4. Dashboard & Main Pages**

- **Dashboard:** In pages/dashboard/, fetch summary data and announcements (using React Query) and display them using Shadcn UI (cards, tables, etc.).
- **Students:** In pages/students/, implement a list view (and CRUD) for students (using React Query for data fetching and zod for form validation).
- **Attendance:** In pages/attendance/, build an interface for marking and viewing attendance (using forms, tables, and mutation/query hooks).
- **Announcements:** In pages/announcements/, list and create announcements.

---

**5. Reusable Components & Hooks**

- **UI Components:** Create atomic components (buttons, inputs, modals, etc.) in components/ui/.
- **Feature Components:** Build feature-specific components (StudentCard, AttendanceTable, etc.) in components/features/.
- **Custom Hooks:** Write custom hooks (for API calls, auth, etc.) in hooks/.

---

**6. State & API Management**

- **Zustand Stores:** Define stores (e.g., authStore, uiStore) in store/ for global UI state.
- **React Query:** Use React Query (or SWR) for all server data (students, attendance, announcements, etc.).
- **API Modules:** Organize API calls into feature-based modules (e.g., lib/api/students.ts, lib/api/auth.ts).

---

**7. Error Handling & UX**

- **Global Error Boundary:** Implement a React Error Boundary (in providers/) to catch and display component errors.
- **API Error Handling:** Use toast notifications (or alerts) for API errors.
- **Loading States:** Use skeleton loaders (or spinners) (via Shadcn UI) for loading states.

---

**8. Testing & Linting**

- **Component Tests:** Write unit tests (using Jest and React Testing Library) for components and custom hooks.
- **API/Hook Tests:** Mock API calls (using MSW) for integration tests.
- **E2E Tests:** (Optional for MVP) Use Cypress or Playwright for end-to-end tests.

---

**9. Future Enhancements**

- **Role-based UI:** Adjust navigation and UI based on user roles.
- **Advanced Features:** Reporting, file uploads, notifications, etc.
- **Internationalization (i18n):** Add support (e.g., using react-i18next).
- **Analytics & Monitoring:** Integrate Sentry (for error tracking) and Google Analytics.

---

**Suggested Implementation Order**

1. **Set up routing and a basic layout (sidebar, header, etc.).**
2. **Implement authentication (login page, JWT storage, protected routes).**
3. **Build the dashboard page (fetch and display summary/announcements).**
4. **Implement students and attendance pages (CRUD, forms, tables).**
5. **Add announcements and user management pages.**
6. **Refine UI with reusable components and error/loading states.**
7. **Add global state management (Zustand) and custom hooks.**
8. **Write tests for critical flows.**
9. **Polish, document, and prepare for deployment.**

---