# School Admin Dashboard

A modern, secure, and scalable School Administration Dashboard built as a Software-as-a-Service (SaaS) platform. This application provides comprehensive tools for managing school operations, student information, attendance, and more, with support for multiple schools (multi-tenant architecture).

## 🌟 Features

### Core Features
- **Multi-tenant Platform**: Each school operates independently with isolated data
- **Role-based Access Control**: Different interfaces for Administrators, Teachers, Parents, and Students
- **User Management**: Secure user authentication and profile management
- **Student Management**: Comprehensive student profiles and enrollment tracking
- **Class Management**: Organize classes and link them to teachers and students
- **Attendance Tracking**: Record and monitor student attendance
- **Announcements**: Create and display school-wide or targeted announcements
- **Data Auditing**: Track significant data changes for accountability
- **Soft Deletes**: Non-destructive removal of records

### Future Enhancements
- Academic Management (Subjects, Assignments, Grades)
- Financial Management (Fees, Invoices, Payments)
- Health Records
- Discipline Tracking
- Communication Logs
- Advanced Reporting

## 🛠 Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **API**: RESTful
- **Validation**: Class-validator, NestJS ValidationPipe
- **Testing**: Jest
- **Documentation**: OpenAPI (Swagger)

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with Shadcn UI
- **State Management**: 
  - Zustand (UI state)
  - React Query/SWR (Server state)
- **Form Handling**: 
  - React Hook Form
  - Zod (Validation)
- **API Communication**: Fetch API/Axios

### Development Tools
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS version)
- pnpm
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/school-admin-dashboard.git
   cd school-admin-dashboard
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. Start the development environment:
   ```bash
   docker-compose up -d
   pnpm dev
   ```

### Development

- Backend API will be available at: `http://localhost:3000`
- Frontend application will be available at: `http://localhost:3001`
- API Documentation (Swagger) will be available at: `http://localhost:3000/api`

## 📁 Project Structure

```
school-admin-dashboard/
├── apps/                      # Applications
│   ├── backend/              # NestJS backend
│   └── frontend/             # React frontend
├── packages/                 # Shared packages
│   ├── eslint-config/       # ESLint configuration
│   ├── tsconfig/            # TypeScript configuration
│   └── ui/                  # Shared UI components
├── docker/                  # Docker configuration
├── docs/                    # Project documentation
└── scripts/                 # Utility scripts
```

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Row-Level Security (RLS) in PostgreSQL
- Input validation and sanitization
- Secure password hashing
- HTTPS enforcement
- Rate limiting on sensitive endpoints

## 🧪 Testing

```bash
# Run backend tests
pnpm test:backend

# Run frontend tests
pnpm test:frontend

# Run all tests
pnpm test
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:
- [Project Summary](docs/summary.md)
- [Backend Documentation](docs/backend.md)
- [Frontend Documentation](docs/frontend.md)
- [Database Documentation](docs/database.md)
