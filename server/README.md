# Shop Management Backend API

A NestJS backend application with authentication, shop management, and subdomain support using Drizzle ORM and PostgreSQL.

## Features

- **Authentication System**
  - User signup with password validation
  - JWT-based authentication with httpOnly cookies
  - Login with "Remember Me" functionality (7 days vs 30 minutes)
  - Secure logout

- **Shop Management**
  - Create shops during user registration
  - Global unique shop names validation
  - Shop details retrieval by name or ID
  - Subdomain-based shop access

- **Security Features**
  - Helmet for security headers
  - CSRF protection (production)
  - Secure cookie configuration
  - Password hashing with bcrypt
  - Input validation and sanitization

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API explorer

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository and navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
NODE_ENV=development
CSRF_SECRET="your-csrf-secret-key-change-this-in-production"
```

5. Set up the database:
```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

The application will be available at:
- API: `http://localhost:3000`
- Swagger Documentation: `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Users
- `GET /users/me` - Get current user info (requires authentication)

### Shops
- `GET /shops/by-name/:shopName` - Get shop by name
- `GET /shops/:id` - Get shop by ID

### Subdomain Support

Access shops via subdomains:
- `http://coffee-shop.localhost:3000` - Returns shop information
- `http://book-store.localhost:3000` - Returns shop information

## Database Schema

### Users Table
- `id` - UUID primary key
- `username` - Unique username
- `password` - Hashed password
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Shops Table
- `id` - UUID primary key
- `name` - Unique shop name
- `ownerId` - Foreign key to users table
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

## Development Commands

```bash
# Start development server
npm run start:dev

# Build the application
npm run build

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint

# Database operations
npm run db:generate  # Generate Drizzle schema
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## Security Configuration

### Cookies
- httpOnly: true
- secure: true (production)
- sameSite: 'lax'
- domain: '.localhost' (for subdomain support)

### Password Requirements
- Minimum 8 characters
- At least 1 number
- At least 1 special character

### Shop Name Requirements
- Minimum 3 unique shop names during signup
- Globally unique shop names

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | Secret key for JWT tokens | Required |
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| CSRF_SECRET | Secret key for CSRF protection | Required |

## Testing Subdomain Functionality

To test subdomain functionality locally:

1. Add entries to your hosts file (`/etc/hosts` on Linux/Mac, `C:\Windows\System32\drivers\etc\hosts` on Windows):
```
127.0.0.1 localhost
127.0.0.1 coffee-shop.localhost
127.0.0.1 book-store.localhost
127.0.0.1 tech-gadgets.localhost
```

2. Access the application via subdomains:
- `http://coffee-shop.localhost:3000`
- `http://book-store.localhost:3000`

## Production Deployment

1. Set NODE_ENV to 'production'
2. Use a strong JWT_SECRET
3. Configure proper DATABASE_URL
4. Set up SSL certificates for HTTPS
5. Configure reverse proxy (nginx) for subdomain routing
6. Enable CSRF protection

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Authentication Issues
- Verify JWT_SECRET is set
- Check cookie domain configuration
- Ensure CORS is properly configured

### Subdomain Issues
- Update hosts file for local development
- Check subdomain middleware configuration
- Verify shop names exist in database
