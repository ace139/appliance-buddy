# Appliance Buddy Backend

This is the Express.js backend for the Appliance Buddy application, built with PostgreSQL and Drizzle ORM.

## Features

- **RESTful API** with Express.js
- **PostgreSQL** database with Drizzle ORM
- **TypeScript** for type safety
- **Zod validation** for request validation
- **CORS** enabled for frontend integration
- **Error handling** middleware
- **Database migrations** with Drizzle Kit

## API Endpoints

### Appliances
- `GET /api/appliances` - Get all appliances with filtering
- `GET /api/appliances/:id` - Get appliance by ID
- `POST /api/appliances` - Create new appliance
- `PUT /api/appliances/:id` - Update appliance
- `DELETE /api/appliances/:id` - Delete appliance
- `GET /api/appliances/:id/warranty-status` - Get warranty status

### Maintenance Tasks
- `GET /api/maintenance` - Get all maintenance tasks with filtering
- `GET /api/maintenance/:id` - Get maintenance task by ID
- `POST /api/maintenance` - Create new maintenance task
- `PUT /api/maintenance/:id` - Update maintenance task
- `DELETE /api/maintenance/:id` - Delete maintenance task
- `PATCH /api/maintenance/:id/complete` - Mark task as completed
- `GET /api/maintenance/appliances/:applianceId` - Get tasks for appliance

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and navigate to the backend directory:**
```bash
cd appliance-buddy-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/appliance_buddy
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
CORS_ORIGIN=http://localhost:5173
```

4. **Generate and run database migrations:**
```bash
npm run db:generate
npm run db:migrate
```

5. **Seed the database (optional):**
```bash
npm run db:seed
```

6. **Start the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Database Schema

The database consists of four main tables:

- **appliances** - Main appliance records
- **support_contacts** - Support contact information for appliances
- **maintenance_tasks** - Scheduled maintenance tasks
- **linked_documents** - Document references for appliances

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
src/
├── config/          # Database and environment configuration
├── controllers/     # Request handlers
├── db/             # Database schema and migrations
├── middleware/     # Express middleware
├── routes/         # API route definitions
├── services/       # Business logic layer
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and validation schemas
├── app.ts          # Express app configuration
└── server.ts       # Server entry point
```

## Environment Variables

- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (minimum 32 characters)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)

## Contributing

1. Make sure all tests pass
2. Follow the existing code style
3. Add proper TypeScript types
4. Update documentation as needed

## License

MIT License