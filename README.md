# ☕ Coffee Management System

A comprehensive full-stack coffee shop management system built with Next.js 16, TypeScript, PostgreSQL, and Drizzle ORM. Features role-based access control for Admin, Manager, Staff, Delivery agents, and Customers.

## � Documentation

- **[Database Schema & ERD](docs/DATABASE_SCHEMA.md)** - Complete database structure, relationships, and relational algebra
- **[System Architecture](docs/ARCHITECTURE.md)** - Application architecture, data flow, and component hierarchy
- **[Transaction Guide](docs/TRANSACTIONS.md)** - Database transaction implementation and best practices
- **[Diagrams Reference](docs/DIAGRAMS_REFERENCE.md)** - All Mermaid diagrams in one place

## 🚀 Features

### 🔐 Authentication & Authorization
- **Secure JWT Authentication** with httpOnly cookies
- **Email Verification** system
- **Role-Based Access Control (RBAC)**: ADMIN, MANAGER, STAFF, DELIVERY, CUSTOMER
- **Bcrypt Password Hashing** (10 rounds)
- **7-Day Session Expiry**
- **Database Transactions** for atomic user registration

### 👥 User Roles & Capabilities

#### 🔑 Admin
- Complete system overview and analytics
- User management (view, create, edit, delete all users)
- Coffee menu management (CRUD operations)
- Order management and monitoring
- Payment tracking and verification
- Delivery assignment and tracking
- Branch management
- Review moderation
- System-wide statistics and reports

#### 🏪 Manager
- Branch-specific analytics
- Branch staff management
- Branch order monitoring
- Branch inventory oversight
- Access to admin features for assigned branch

#### 👨‍💼 Staff
- View assigned branch orders
- Update order status
- Coffee availability management
- Basic order processing

#### 🚚 Delivery Agent
- View assigned deliveries
- Update delivery status (PENDING → PICKED_UP → IN_TRANSIT → DELIVERED)
- Real-time delivery tracking
- Delivery history

#### 🛒 Customer
- Browse coffee menu by categories
- Add items to cart
- Place orders (PICKUP or DELIVERY)
- Track order status
- Payment processing
- Order history
- Write and manage reviews

### 📊 Admin Dashboard Features
- **Analytics Dashboard**: Orders, Revenue, Users, Deliveries, Reviews
- **User Management**: Full CRUD with role assignment
- **Coffee Management**: Menu items, categories, pricing, availability
- **Order Management**: View all orders, filter by status, update orders
- **Payment Tracking**: Monitor all payments, transaction history
- **Delivery Management**: Assign deliveries, track status
- **Branch Management**: Multi-branch support
- **Reviews Management**: View and moderate customer reviews

### ☕ Coffee Features
- **Category Management**: Hot Coffee, Cold Coffee, Specialty
- **16 Pre-seeded Coffee Items** with real images
- **Pricing Management**: Dynamic pricing ($3.50 - $7.00 range)
- **Availability Toggle**: Mark items in/out of stock
- **Image Management**: High-quality Unsplash images

### 📦 Order Management
- **Order Types**: PICKUP or DELIVERY
- **Order Status Flow**: CREATED → ACCEPTED → ASSIGNED → PICKED_UP → DELIVERED
- **Order Items**: Multiple items per order
- **Total Calculation**: Automatic price calculation
- **Order History**: Full order tracking for customers
- **Database Transactions**: Atomic order creation with cart clearing

### 💳 Payment System
- **Multiple Payment Methods**: CASH, CARD, MOBILE_BANKING, WALLET
- **Payment Status**: PENDING, COMPLETED, FAILED, REFUNDED
- **Transaction Tracking**: Unique transaction IDs
- **Payment History**: Complete payment logs
- **Atomic Processing**: Payment and order status updated together in transactions

### 🚚 Delivery System
- **Delivery Assignment**: Auto/manual assignment to agents
- **Status Tracking**: PENDING → PICKED_UP → IN_TRANSIT → DELIVERED
- **Delivery History**: Agent performance tracking
- **Address Management**: Customer delivery addresses
- **Transactional Updates**: Agent assignment and order status synchronized

### ⭐ Review System
- **Star Ratings**: 1-5 star reviews
- **Written Reviews**: Customer feedback
- **Coffee-specific Reviews**: Reviews linked to specific items
- **Average Rating Calculation**: Automatic rating aggregation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.10 (App Router, Server Components, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL (Neon Cloud)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod schemas
- **Migrations**: Drizzle Kit

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler
- **Database Studio**: Drizzle Kit Studio
- **Seed Data**: @faker-js/faker + tsx

## 📋 Prerequisites

- **Node.js**: v18.17 or higher
- **pnpm**: v8 or higher (recommended) or npm
- **PostgreSQL Database**: Neon Cloud account or local PostgreSQL instance
- **Git**: For version control

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd coffee-management-system
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```
### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Database Configuration (Neon Cloud)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
# Alternative: DB_URL (either works)
DB_URL="postgresql://username:password@host/database?sslmode=require"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Generate JWT Secret:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Database Setup

#### Option A: Fresh Setup (Recommended)
```bash
# Generate migration files
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed database with demo data
pnpm seed
```

#### Option B: Reset Database (Clean Slate)
```bash
# Drop all tables, recreate schema, and seed data
pnpm db:reset
```

### 5. Start Development Server
```bash
pnpm dev
```

Visit: `http://localhost:3000`

## 📝 Demo Credentials

After running `pnpm seed`, use these credentials to login:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@coffeehub.com | Admin@123 |
| **Manager** | manager@coffeehub.com | Manager@123 |
| **Staff** | staff@coffeehub.com | Staff@123 |
| **Delivery** | delivery@coffeehub.com | Delivery@123 |
| **Customer** | customer@coffeehub.com | Customer@123 |

**Additional Seeded Data:**
- 3 Coffee Categories (Hot, Cold, Specialty)
- 16 Coffee Items with real images
- 3 Branches (Downtown, Airport, University)
- 5 Delivery Agents
- 15 Random Customers
- 24+ Sample Orders
- 20+ Reviews

## 📜 Available Scripts

### Development
```bash
pnpm dev          # Start Next.js dev server (http://localhost:3000)
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database
```bash
pnpm db:generate  # Generate migration files from schema
pnpm db:push      # Push schema to database (no migration files)
pnpm db:migrate   # Run pending migrations
pnpm db:studio    # Open Drizzle Studio (database GUI)
pnpm seed         # Seed database (idempotent, safe to run multiple times)
pnpm db:reset     # Reset database + seed (full clean slate)
```

### Type Checking
```bash
pnpm tsc --noEmit # Type check without emitting files
```

## 🗂️ Project Structure

```
coffee-management-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   └── _components/         # Auth UI components
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── analytics/      # Analytics & stats
│   │   │   ├── users/          # User management
│   │   │   ├── menu/           # Coffee menu management
│   │   │   ├── orders/         # Order management
│   │   │   ├── payments/       # Payment tracking
│   │   │   ├── deliveries/     # Delivery management
│   │   │   ├── branches/       # Branch management
│   │   │   └── reviews/        # Review management
│   │   ├── customer/            # Customer dashboard
│   │   │   ├── cart/           # Shopping cart
│   │   │   └── orders/         # Order history
│   │   ├── delivery/            # Delivery agent dashboard
│   │   └── dashboard/           # Main dashboard
│   ├── api/                     # API Routes
│   │   ├── auth/               # Authentication APIs
│   │   ├── admin/              # Admin APIs
│   │   ├── coffees/            # Coffee APIs
│   │   ├── orders/             # Order APIs
│   │   ├── payments/           # Payment APIs
│   │   └── deliveries/         # Delivery APIs
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── src/backend/                 # Backend services & database
│   ├── database/
│   │   ├── client.ts           # Database connection
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── seed.ts             # Database seeder (MAIN)
│   │   └── repositories.ts     # Data access layer
│   └── services/               # Business logic layer
│       ├── auth.service.ts     # Authentication service
│       ├── user.service.ts     # User management service
│       ├── coffee.service.ts   # Coffee service
│       ├── order.service.ts    # Order service
│       ├── payment.service.ts  # Payment service
│       └── delivery.service.ts # Delivery service
├── components/                  # Reusable UI components
│   ├── ui/                     # Shadcn/ui components
│   ├── providers.tsx           # React context providers
│   └── theme-provider.tsx      # Theme provider
├── contexts/                    # React contexts
│   ├── auth-context.tsx        # Authentication context
│   ├── cart-context.tsx        # Shopping cart context
│   └── order-context.tsx       # Order context
├── hooks/                       # Custom React hooks
│   ├── use-mobile.ts           # Mobile detection hook
│   └── use-toast.ts            # Toast notification hook
├── lib/                         # Utility functions
│   ├── utils.ts                # General utilities
│   └── store.ts                # State management
├── types/                       # TypeScript type definitions
│   └── index.ts                # Shared types
├── public/                      # Static assets
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
└── README.md                   # This file
```

## 🗄️ Database Schema

### Core Tables
- **auth_users**: User authentication & roles
- **user_profiles**: User profile information
- **coffee_categories**: Coffee categories
- **coffees**: Coffee menu items
- **branches**: Coffee shop branches
- **orders**: Customer orders
- **order_items**: Order line items
- **payments**: Payment records
- **deliveries**: Delivery tracking
- **reviews**: Customer reviews
- **cart_items**: Shopping cart (temporary)

### Relationships
- User → UserProfile (1:1)
- User → Orders (1:N)
- Order → OrderItems (1:N)
- Order → Payment (1:1)
- Order → Delivery (1:1)
- Coffee → OrderItems (1:N)
- Coffee → Reviews (1:N)
- Branch → Orders (1:N)
- DeliveryAgent → Deliveries (1:N)

## 🔒 Security Features

- **JWT Tokens**: Secure, httpOnly cookies
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Fine-grained permissions
- **Email Verification**: Required for account activation
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **CSRF Protection**: Next.js built-in protection
- **Environment Variables**: Sensitive data in .env
- **Input Validation**: Zod schemas for all inputs
- **Secure Headers**: Next.js security headers

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify` - Verify email

### Coffees
- `GET /api/coffees` - List all coffees
- `GET /api/coffees/[id]` - Get coffee by ID
- `POST /api/coffees` - Create coffee (Admin)
- `PATCH /api/coffees/[id]` - Update coffee (Admin)
- `DELETE /api/coffees/[id]` - Delete coffee (Admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order by ID
- `PATCH /api/orders/[id]` - Update order status

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments?orderId=xxx` - Get payment by order

### Deliveries
- `GET /api/deliveries` - List deliveries (Delivery agent)
- `PATCH /api/deliveries/[id]` - Update delivery status

### Admin APIs
- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/users` - List all users
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/payments` - List all payments

## 🌱 Seeding Data

The seed script (`src/backend/database/seed.ts`) is **idempotent** and safe to run multiple times.

### What Gets Seeded?
```typescript
✅ 3 Coffee Categories (Hot, Cold, Specialty)
✅ 16 Coffee Items ($3.50 - $7.00, with images)
✅ 3 Branches (Downtown, Airport, University)
✅ 5 Demo Users (all roles with known passwords)
✅ 5 Delivery Agents (assigned to branches)
✅ 15 Random Customers (Faker.js generated)
✅ 24+ Orders (with items, payments, deliveries)
✅ 20+ Reviews (3-5 star ratings)
```

### Idempotent Behavior
- **Checks for existing data** before inserting
- **Skips duplicates** automatically
- **Safe to run multiple times** without data duplication
- **Logs progress** with emoji indicators

### Run Seeder
```bash
# First time or to add more data
pnpm seed

# Full database reset + seed
pnpm db:reset
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Build for Production
```bash
pnpm build
pnpm start
```

## 🧪 Testing

### Type Checking
```bash
pnpm tsc --noEmit
```

### Linting
```bash
pnpm lint
```

### Build Test
```bash
pnpm build
```

## 📊 Database Management

### Drizzle Studio
Visual database browser:
```bash
pnpm db:studio
```
```
Access at: `https://local.drizzle.studio`

### Migrations
```bash
# Generate new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema without migrations (dev)
pnpm db:push
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection timeout (increased to 10s for cloud DB)
# Check src/backend/database/client.ts
```

### Seed Script Issues
```bash
# Clear database and re-seed
pnpm db:reset

# Run seed manually
pnpm tsx src/backend/database/seed.ts
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

### Type Errors
```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Auto-fix linting issues
pnpm lint --fix
```

## 📚 Learn More

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Drizzle ORM
- [Drizzle Documentation](https://orm.drizzle.team)
- [Drizzle with PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)

### UI Components
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

This is a university project for demonstration purposes.

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Developed as a university project for Coffee Management System.

---

## 🎓 University Project Notes

### Submission Checklist
- ✅ All user roles implemented (Admin, Manager, Staff, Delivery, Customer)
- ✅ Complete CRUD operations for all entities
- ✅ Role-based access control (RBAC)
- ✅ Database schema with proper relationships
- ✅ Seed data for demonstration
- ✅ Authentication & authorization
- ✅ Payment processing system
- ✅ Delivery tracking system
- ✅ Review & rating system
- ✅ Responsive UI with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Production build successful
- ✅ No mock data, all real implementations

### Demo Walkthrough
1. **Admin Login**: `admin@coffeehub.com` / `Admin@123`
2. **View Analytics**: Complete system overview
3. **Manage Users**: Create, edit, delete users
4. **Manage Menu**: Add/edit coffee items
5. **Customer Login**: `customer@coffeehub.com` / `Customer@123`
6. **Browse Menu**: View all coffees by category
7. **Place Order**: Add to cart, checkout, pay
8. **Delivery Login**: `delivery@coffeehub.com` / `Delivery@123`
9. **Track Delivery**: Update delivery status

### Key Features Demonstrated
- **Full-Stack TypeScript**: End-to-end type safety
- **Server Components**: Next.js 16 App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with httpOnly cookies
- **Authorization**: Role-based access control
- **Real-Time Updates**: Order status tracking
- **Payment Integration**: Multiple payment methods
- **Review System**: Star ratings and comments
- **Multi-Branch Support**: Branch management
- **Responsive Design**: Mobile-friendly UI

---

**Built with ❤️ using Next.js, TypeScript, PostgreSQL, and Drizzle ORM**
