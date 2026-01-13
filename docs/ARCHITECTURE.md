# Coffee Management System - Application Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Next.js Application Layer"
        subgraph "App Router"
            Pages[Pages<br/>Server Components]
            Layouts[Layouts<br/>Nested Routing]
            API[API Routes<br/>/api/*]
        end

        subgraph "Client Components"
            AuthUI[Auth Forms<br/>Login/Register]
            CartUI[Cart Management<br/>Add/Remove Items]
            OrderUI[Order Forms<br/>Checkout]
            DashUI[Dashboards<br/>Admin/Customer/Delivery]
        end

        subgraph "Contexts"
            AuthCtx[Auth Context<br/>User Session]
            CartCtx[Cart Context<br/>Cart State]
            OrderCtx[Order Context<br/>Order State]
        end
    end

    subgraph "Service Layer"
        AuthSvc[Auth Service<br/>Login/Register/JWT]
        UserSvc[User Service<br/>CRUD Operations]
        CoffeeSvc[Coffee Service<br/>Menu Management]
        OrderSvc[Order Service<br/>Order Processing]
        PaymentSvc[Payment Service<br/>Payment Processing]
        DeliverySvc[Delivery Service<br/>Delivery Tracking]
        CartSvc[Cart Service<br/>Cart Operations]
    end

    subgraph "Data Access Layer"
        Drizzle[Drizzle ORM<br/>Type-Safe Queries]
        PGPool[PostgreSQL Pool<br/>Connection Management]
    end

    subgraph "Database Layer"
        PostgreSQL[(PostgreSQL<br/>Primary Database)]
    end

    subgraph "External Services"
        Email[Email Service<br/>Verification]
        SMS[SMS Service<br/>Notifications]
    end

    Browser --> Pages
    Mobile --> Pages

    Pages --> API
    Pages --> Layouts

    AuthUI --> AuthCtx
    CartUI --> CartCtx
    OrderUI --> OrderCtx
    DashUI --> AuthCtx

    AuthCtx --> API
    CartCtx --> API
    OrderCtx --> API

    API --> AuthSvc
    API --> UserSvc
    API --> CoffeeSvc
    API --> OrderSvc
    API --> PaymentSvc
    API --> DeliverySvc
    API --> CartSvc

    AuthSvc --> Drizzle
    UserSvc --> Drizzle
    CoffeeSvc --> Drizzle
    OrderSvc --> Drizzle
    PaymentSvc --> Drizzle
    DeliverySvc --> Drizzle
    CartSvc --> Drizzle

    Drizzle --> PGPool
    PGPool --> PostgreSQL

    AuthSvc -.-> Email
    AuthSvc -.-> SMS

    style Pages fill:#4CAF50
    style API fill:#2196F3
    style Drizzle fill:#FF9800
    style PostgreSQL fill:#9C27B0
```

## Request Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client Browser
    participant SC as Server Component
    participant AR as API Route
    participant Svc as Service Layer
    participant ORM as Drizzle ORM
    participant DB as PostgreSQL

    Note over C,DB: Order Creation Flow

    C->>SC: Navigate to /customer/cart
    SC->>ORM: Fetch cart items
    ORM->>DB: SELECT * FROM cart...
    DB-->>ORM: Cart data
    ORM-->>SC: Cart items
    SC-->>C: Render cart page

    C->>AR: POST /api/orders (create order)
    AR->>Svc: orderService.create()

    Note over Svc,DB: Transaction Begins
    Svc->>ORM: BEGIN TRANSACTION

    Svc->>ORM: INSERT INTO orders
    ORM->>DB: INSERT statement
    DB-->>ORM: Order created

    Svc->>ORM: INSERT INTO order_items
    ORM->>DB: INSERT statements
    DB-->>ORM: Items created

    Svc->>ORM: INSERT INTO payments
    ORM->>DB: INSERT statement
    DB-->>ORM: Payment created

    Svc->>ORM: INSERT INTO deliveries (if delivery)
    ORM->>DB: INSERT statement
    DB-->>ORM: Delivery created

    Svc->>ORM: DELETE FROM cart
    ORM->>DB: DELETE statement
    DB-->>ORM: Cart cleared

    Svc->>ORM: COMMIT TRANSACTION

    Note over Svc,DB: Transaction Complete

    Svc-->>AR: Order details
    AR-->>C: 201 Created (JSON)
    C->>C: Redirect to /customer/orders
```

## Authentication Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> CheckAuth{Has JWT Cookie?}

    CheckAuth -->|Yes| ValidateToken[Validate JWT Token]
    CheckAuth -->|No| LoginPage[Show Login Page]

    ValidateToken --> TokenValid{Token Valid?}
    TokenValid -->|Yes| FetchUser[Fetch User Data]
    TokenValid -->|No| LoginPage

    FetchUser --> CheckRole{Check User Role}

    CheckRole -->|ADMIN| AdminDash[Admin Dashboard]
    CheckRole -->|MANAGER| ManagerDash[Manager Dashboard]
    CheckRole -->|STAFF| StaffDash[Staff Dashboard]
    CheckRole -->|DELIVERY| DeliveryDash[Delivery Dashboard]
    CheckRole -->|CUSTOMER| CustomerDash[Customer Dashboard]

    LoginPage --> LoginForm[Enter Credentials]
    LoginForm --> SubmitLogin[POST /api/auth/login]
    SubmitLogin --> VerifyCredentials{Credentials Valid?}

    VerifyCredentials -->|No| LoginError[Show Error]
    LoginError --> LoginForm

    VerifyCredentials -->|Yes| CheckVerified{Email Verified?}
    CheckVerified -->|No| VerifyEmail[Show Verify Email]
    CheckVerified -->|Yes| GenerateJWT[Generate JWT Token]

    GenerateJWT --> SetCookie[Set httpOnly Cookie]
    SetCookie --> LogHistory[Log Login History]
    LogHistory --> CheckRole

    VerifyEmail --> EnterCode[Enter Verification Code]
    EnterCode --> ValidateCode{Code Valid?}
    ValidateCode -->|Yes| UpdateVerified[Update verified=true]
    ValidateCode -->|No| VerifyEmail
    UpdateVerified --> GenerateJWT
```

## Order Processing State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: Customer places order

    CREATED --> ACCEPTED: Admin/Staff accepts
    CREATED --> CANCELLED: Customer/Admin cancels

    ACCEPTED --> ASSIGNED: Delivery agent assigned (DELIVERY orders)
    ACCEPTED --> PICKED_UP: Customer picks up (PICKUP orders)
    ACCEPTED --> CANCELLED: Admin cancels

    ASSIGNED --> PICKED_UP: Agent picks up order
    ASSIGNED --> CANCELLED: Admin cancels

    PICKED_UP --> IN_TRANSIT: Agent starts delivery (DELIVERY)
    PICKED_UP --> DELIVERED: Pickup complete (PICKUP)
    PICKED_UP --> CANCELLED: Issue occurs

    IN_TRANSIT --> DELIVERED: Delivery complete
    IN_TRANSIT --> CANCELLED: Delivery failed

    DELIVERED --> [*]
    CANCELLED --> [*]

    note right of CREATED
        Payment: PENDING
        Delivery: Not created
    end note

    note right of ACCEPTED
        Payment: PENDING
        Delivery: PENDING (if DELIVERY)
    end note

    note right of DELIVERED
        Payment: COMPLETED
        Delivery: DELIVERED
    end note

    note right of CANCELLED
        Payment: REFUNDED
        Delivery: CANCELLED
    end note
```

## Component Hierarchy

```mermaid
graph TD
    RootLayout[Root Layout<br/>app/layout.tsx]

    RootLayout --> AuthLayout[Auth Layout<br/>app/auth/layout.tsx]
    RootLayout --> DashLayout[Dashboard Layout<br/>app/dashboard/layout.tsx]

    AuthLayout --> Login[Login Page<br/>app/auth/login/page.tsx]
    AuthLayout --> Register[Register Page<br/>app/auth/register/page.tsx]

    DashLayout --> AdminLayout[Admin Layout<br/>app/admin/layout.tsx]
    DashLayout --> CustomerLayout[Customer Layout<br/>app/customer/layout.tsx]
    DashLayout --> DeliveryLayout[Delivery Layout<br/>app/delivery/layout.tsx]

    AdminLayout --> AdminDash[Admin Dashboard<br/>app/admin/page.tsx]
    AdminLayout --> AdminUsers[User Management<br/>app/admin/users/page.tsx]
    AdminLayout --> AdminMenu[Menu Management<br/>app/admin/menu/page.tsx]
    AdminLayout --> AdminOrders[Order Management<br/>app/admin/orders/page.tsx]
    AdminLayout --> AdminPayments[Payment Tracking<br/>app/admin/payments/page.tsx]
    AdminLayout --> AdminDeliveries[Delivery Management<br/>app/admin/deliveries/page.tsx]

    CustomerLayout --> CustomerDash[Customer Dashboard<br/>app/customer/page.tsx]
    CustomerLayout --> CustomerMenu[Browse Menu<br/>app/customer/menu/page.tsx]
    CustomerLayout --> CustomerCart[Shopping Cart<br/>app/customer/cart/page.tsx]
    CustomerLayout --> CustomerOrders[Order History<br/>app/customer/orders/page.tsx]

    DeliveryLayout --> DeliveryDash[Delivery Dashboard<br/>app/delivery/page.tsx]
    DeliveryLayout --> DeliveryActive[Active Deliveries<br/>app/delivery/active/page.tsx]

    Login --> LoginForm[LoginForm Component]
    Register --> RegisterForm[RegisterForm Component]

    AdminOrders --> OrderTable[OrderTable Component]
    CustomerCart --> CartItem[CartItem Component]
    CustomerMenu --> CoffeeCard[CoffeeCard Component]

    style RootLayout fill:#4CAF50
    style AuthLayout fill:#2196F3
    style DashLayout fill:#FF9800
    style AdminLayout fill:#F44336
    style CustomerLayout fill:#9C27B0
    style DeliveryLayout fill:#00BCD4
```

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Client Side"
        UI[UI Components]
        Context[React Context]
        LocalState[Local State]
    end

    subgraph "Server Side"
        Pages[Server Components]
        APIRoutes[API Routes]
        Services[Service Layer]
    end

    subgraph "Database"
        ORM[Drizzle ORM]
        PG[(PostgreSQL)]
    end

    UI -->|User Action| Context
    Context -->|State Change| UI

    UI -->|Server Action| Pages
    UI -->|API Call| APIRoutes

    Pages -->|Direct DB Call| Services
    APIRoutes -->|Business Logic| Services

    Services -->|Type-Safe Query| ORM
    ORM -->|SQL| PG

    PG -->|Result Set| ORM
    ORM -->|Typed Data| Services

    Services -->|Response| APIRoutes
    Services -->|Props| Pages

    APIRoutes -->|JSON| UI
    Pages -->|SSR HTML| UI

    style UI fill:#4CAF50
    style Services fill:#FF9800
    style PG fill:#9C27B0
```

## Technology Stack

```mermaid
mindmap
    root((Coffee Management System))
        Frontend
            Next.js 16
                App Router
                Server Components
                Turbopack
            TypeScript
                Type Safety
                Interfaces
                Enums
            React
                Contexts
                Hooks
                Client Components
            Tailwind CSS
                Utility Classes
                Responsive Design
            Radix UI
                Accessible Components
                Primitives
        Backend
            Next.js API Routes
                RESTful APIs
                Route Handlers
            Services
                Auth Service
                Order Service
                Payment Service
                Delivery Service
            Drizzle ORM
                Type-Safe
                SQL-like Syntax
                Migrations
        Database
            PostgreSQL
                ACID Transactions
                JSON Support
                Full-Text Search
            Schema
                10 Main Tables
                Enums
                Indexes
                Foreign Keys
        Security
            Authentication
                JWT Tokens
                httpOnly Cookies
                Bcrypt Hashing
            Authorization
                RBAC
                Route Guards
                API Middleware
        DevOps
            pnpm
                Fast Package Manager
                Workspace Support
            TypeScript
                Compile-Time Checks
            Environment
                .env Variables
                Multi-Environment
```

## Folder Structure

```
coffee-management-system/
├── app/                                # Next.js App Router
│   ├── (auth)/                        # Auth group routes
│   │   ├── login/                     # Login page
│   │   └── register/                  # Register page
│   ├── (dashboard)/                   # Dashboard group routes
│   │   ├── admin/                     # Admin dashboard
│   │   │   ├── users/                 # User management
│   │   │   ├── menu/                  # Menu management
│   │   │   ├── orders/                # Order management
│   │   │   ├── payments/              # Payment tracking
│   │   │   └── deliveries/            # Delivery management
│   │   ├── customer/                  # Customer dashboard
│   │   │   ├── menu/                  # Browse menu
│   │   │   ├── cart/                  # Shopping cart
│   │   │   └── orders/                # Order history
│   │   └── delivery/                  # Delivery dashboard
│   ├── api/                           # API routes
│   │   ├── auth/                      # Auth endpoints
│   │   ├── coffees/                   # Coffee endpoints
│   │   ├── orders/                    # Order endpoints
│   │   ├── payments/                  # Payment endpoints
│   │   └── deliveries/                # Delivery endpoints
│   └── layout.tsx                     # Root layout
│
├── src/
│   ├── backend/
│   │   ├── database/
│   │   │   ├── schema/                # Database schemas
│   │   │   │   ├── auth.schema.ts
│   │   │   │   ├── order.schema.ts
│   │   │   │   ├── coffee.schema.ts
│   │   │   │   └── ...
│   │   │   ├── client.ts              # DB connection
│   │   │   ├── enums.ts               # Enum definitions
│   │   │   └── seed.ts                # Seed script
│   │   └── services/                  # Business logic
│   │       ├── auth.service.ts
│   │       ├── order.service.ts
│   │       ├── payment.service.ts
│   │       └── ...
│   │
│   ├── components/
│   │   └── ui/                        # Reusable UI components
│   │
│   ├── contexts/                      # React contexts
│   │   ├── auth-context.tsx
│   │   ├── cart-context.tsx
│   │   └── order-context.tsx
│   │
│   ├── lib/                           # Utilities
│   │   └── utils.ts
│   │
│   └── types/                         # TypeScript types
│       └── index.ts
│
├── docs/                              # Documentation
│   ├── DATABASE_SCHEMA.md
│   └── ARCHITECTURE.md
│
├── .env.example                       # Environment template
├── drizzle.config.ts                  # Drizzle configuration
├── tsconfig.json                      # TypeScript config
└── package.json                       # Dependencies
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Coffee Menu
- `GET /api/coffees` - List all coffees
- `GET /api/coffees/:id` - Get coffee details
- `POST /api/coffees` - Create coffee (Admin)
- `PUT /api/coffees/:id` - Update coffee (Admin)
- `DELETE /api/coffees/:id` - Delete coffee (Admin)

### Orders
- `GET /api/orders` - List orders (filtered by role)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Payments
- `GET /api/payments` - List payments
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments` - Process payment
- `PUT /api/payments/:id` - Update payment status

### Deliveries
- `GET /api/deliveries` - List deliveries
- `GET /api/deliveries/:id` - Get delivery details
- `PUT /api/deliveries/:id` - Update delivery status

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get system analytics
- `GET /api/admin/stats` - Get dashboard stats

## Security Measures

1. **Authentication**
   - JWT tokens with 7-day expiry
   - httpOnly cookies (XSS protection)
   - Bcrypt password hashing (10 rounds)
   - Email verification required

2. **Authorization**
   - Role-based access control (RBAC)
   - Middleware protection on API routes
   - Server-side session validation
   - Route guards for pages

3. **Data Protection**
   - SQL injection prevention (Drizzle ORM)
   - Input validation (Zod schemas)
   - CORS configuration
   - Environment variable security

4. **Database Security**
   - Connection pooling
   - Prepared statements
   - Foreign key constraints
   - Cascade delete protection
