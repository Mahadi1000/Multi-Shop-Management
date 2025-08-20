# Multi-Shop Management Platform

A full-stack shop management platform with subdomain-based multi-tenancy, built with Next.js and NestJS.

## 🏗️ Project Overview

This application allows users to:

- Create and manage multiple shops
- Access individual shop dashboards via subdomains
- Authenticate seamlessly across main domain and subdomains
- Manage shop-specific content and settings

### Tech Stack

**Frontend (Client):**

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui Components

**Backend (Server):**

- NestJS
- TypeScript
- JWT Authentication
- Drizzle ORM
- PostgreSQL/SQLite

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (recommended)
- **PostgreSQL** or **SQLite** (for database)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd job-task
   ```

2. **Install dependencies for both client and server**

   ```bash
   # Install client dependencies
   cd client
   pnpm install

   # Install server dependencies
   cd ../server
   npm install
   ```

### Environment Setup

#### Server Environment (.env)

Create a `.env` file in the `server/` directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/shop_management"
# OR for SQLite (development)
# DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Client Environment (.env.local)

Create a `.env.local` file in the `client/` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Database Setup

1. **Run database migrations**

   ```bash
   cd server
   npm run db:push
   # OR if you have migration files
   npm run db:migrate
   ```

2. **Generate database types (if needed)**
   ```bash
   npm run db:generate
   ```

### Development Setup

#### 1. Start the Backend Server

```bash
cd server
npm run start:dev
```

The server will start on `http://localhost:3000`

#### 2. Start the Frontend Client

```bash
cd client
pnpm dev
```

The client will start on `http://localhost:3001`

### 🌐 Subdomain Configuration

For subdomain functionality to work properly on localhost, you need to configure your local environment:

#### Option 1: Edit Hosts File (Recommended)

Add these entries to your hosts file:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**macOS/Linux:** `/etc/hosts`

```
127.0.0.1 localhost
127.0.0.1 shop1.localhost
127.0.0.1 shop2.localhost
127.0.0.1 shop3.localhost
```

#### Option 2: Use a Local DNS Tool

You can also use tools like:

- **dnsmasq** (macOS/Linux)
- **Acrylic DNS Proxy** (Windows)

## 📱 Usage

### 1. User Registration

1. Navigate to `http://localhost:3001/signup`
2. Create an account with at least 3 shop names
3. Complete the registration process

### 2. User Login

1. Go to `http://localhost:3001/signin`
2. Enter your credentials
3. You'll be redirected to the main dashboard

### 3. Main Dashboard

- View all your registered shops
- Click on any shop to open its subdomain
- Manage your account settings

### 4. Shop Subdomains

Each shop gets its own subdomain:

- `http://shop1.localhost:3001`
- `http://shop2.localhost:3001`
- etc.

### 5. Cross-Subdomain Authentication

The system automatically handles authentication across:

- Main domain (`localhost:3001`)
- All shop subdomains (`*.localhost:3001`)

## 🛠️ Development

### Available Scripts

#### Client Scripts

```bash
cd client

# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

#### Server Scripts

```bash
cd server

# Development server with hot reload
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Database operations
npm run db:push      # Push schema changes
npm run db:studio    # Open database studio
```

### Project Structure

```
job-task/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and API
│   └── public/            # Static assets
├── server/                # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   ├── shops/         # Shops module
│   │   └── common/        # Shared modules
│   └── drizzle/           # Database migrations
└── README.md
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Subdomain Not Working

**Problem:** `shop1.localhost:3001` doesn't load

**Solutions:**

- Check your hosts file configuration
- Clear browser cache and cookies
- Try a different browser or incognito mode
- Ensure both client and server are running

#### 2. Authentication Issues

**Problem:** "Session expired" on subdomains

**Solutions:**

- Clear browser localStorage and cookies
- Check browser console for authentication logs
- Verify JWT_SECRET is set in server environment
- Restart both client and server

#### 3. Database Connection Issues

**Problem:** Cannot connect to database

**Solutions:**

- Verify DATABASE_URL in server/.env
- Ensure PostgreSQL/SQLite is running
- Check database permissions
- Run `npm run db:push` to sync schema

#### 4. CORS Issues

**Problem:** API requests blocked by CORS

**Solutions:**

- Verify NEXT_PUBLIC_API_URL in client/.env.local
- Check server CORS configuration
- Ensure correct ports (client: 3001, server: 3000)

### Debug Mode

To enable detailed logging:

1. **Client:** Open browser DevTools → Console
2. **Server:** Check terminal output with `npm run start:dev`

### Reset Everything

If you encounter persistent issues:

```bash
# Clear all node_modules and reinstall
cd client && rm -rf node_modules && pnpm install
cd ../server && rm -rf node_modules && npm install

# Reset database
cd server && npm run db:push

# Clear browser data
# Manually clear cookies, localStorage, and cache
```

## 🚀 Production Deployment

### Environment Variables

Update your production environment variables:

```env
# Server
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
DATABASE_URL=your-production-database-url

# Client
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Build Commands

```bash
# Build client
cd client && pnpm build

# Build server
cd server && npm run build
```

## 📝 API Documentation

Once the server is running, visit:

- **Swagger Documentation:** `http://localhost:3000/api`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check this README's troubleshooting section
2. Review browser console and server logs
3. Ensure all environment variables are set correctly
4. Verify database connectivity

For additional support, please check the project's issue tracker or contact the development team.
