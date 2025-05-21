# School Admin Database Package

This package contains the database schema and configuration for the School Admin Dashboard. It uses PostgreSQL as the database system and Prisma as the ORM.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file in the `packages/database` directory with the following content:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_admin?schema=public"
```
Update the connection string according to your PostgreSQL setup.

3. Start your PostgreSQL database. If you're using Docker, you can use the provided docker-compose file in the root directory.

4. Initialize the database:
```bash
# Generate Prisma Client
pnpm db:generate

# Create and apply migrations
pnpm db:migrate

# (Optional) If you need to reset the database
pnpm db:migrate:reset
```

## Available Scripts

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema changes to the database without creating migrations
- `pnpm db:studio` - Open Prisma Studio to view and edit data
- `pnpm db:migrate` - Create and apply migrations
- `pnpm db:migrate:reset` - Reset the database and apply all migrations

## Database Schema

The database schema includes the following main entities:

- School
- User
- Student
- Teacher
- Parent
- Class
- AttendanceRecord
- Announcement

For detailed information about the schema, relationships, and constraints, please refer to the `prisma/schema.prisma` file.

## Development

When making changes to the schema:

1. Modify the `prisma/schema.prisma` file
2. Run `pnpm db:migrate` to create and apply migrations
3. Run `pnpm db:generate` to update the Prisma Client

## Best Practices

1. Always use migrations for schema changes in production
2. Keep sensitive information in environment variables
3. Use the provided enums for status fields
4. Follow the established naming conventions
5. Maintain referential integrity with appropriate foreign key constraints 