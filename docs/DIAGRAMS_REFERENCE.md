# Coffee Management System - Diagrams Quick Reference

This file contains all visual diagrams for the system. Use Mermaid Live Editor to view: https://mermaid.live

## 📊 Database Entity-Relationship Diagram

Full ERD with all relationships → See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

**Quick Overview:**
```mermaid
graph LR
    Users[AUTH_USERS] --> Profiles[USER_PROFILES]
    Users --> Orders[ORDERS]
    Users --> Cart[CART]
    Users --> Reviews[REVIEWS]
    Users --> Payments[PAYMENTS]

    Orders --> OrderItems[ORDER_ITEMS]
    Orders --> Deliveries[DELIVERIES]
    Orders --> Payments

    Coffees[COFFEES] --> OrderItems
    Coffees --> Cart
    Coffees --> Reviews

    Branches[BRANCHES] --> Orders
    Branches --> Deliveries
    Branches --> Profiles

    Categories[COFFEE_CATEGORIES] --> Coffees
```

## 🏗️ Application Architecture

Full architecture → See [ARCHITECTURE.md](./ARCHITECTURE.md)

**Layered Architecture:**
```mermaid
graph TD
    Client[Client Layer<br/>Browser/Mobile]

    Client --> NextJS[Next.js App Router<br/>Pages & Layouts]

    NextJS --> API[API Routes<br/>/api/*]
    NextJS --> ServerComp[Server Components<br/>SSR]

    API --> Services[Service Layer<br/>Business Logic]
    ServerComp --> Services

    Services --> ORM[Drizzle ORM<br/>Type-Safe Queries]

    ORM --> DB[(PostgreSQL<br/>Database)]

    style Client fill:#4CAF50
    style NextJS fill:#2196F3
    style Services fill:#FF9800
    style DB fill:#9C27B0
```

## 🔄 Transaction Flow

Full transaction docs → See [TRANSACTIONS.md](./TRANSACTIONS.md)

**Order Creation Transaction:**
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant DB

    Client->>API: POST /api/orders
    API->>Service: orderService.create()

    Service->>DB: BEGIN TRANSACTION

    Service->>DB: INSERT INTO orders
    Service->>DB: INSERT INTO order_items
    Service->>DB: INSERT INTO payments
    Service->>DB: INSERT INTO deliveries
    Service->>DB: DELETE FROM cart

    alt All operations succeed
        Service->>DB: COMMIT
        DB-->>Service: Success
        Service-->>API: Order created
        API-->>Client: 201 Created
    else Any operation fails
        Service->>DB: ROLLBACK
        DB-->>Service: All changes undone
        Service-->>API: Error
        API-->>Client: 400 Bad Request
    end
```

## 🔐 Authentication Flow

**Complete Auth Flow:**
```mermaid
stateDiagram-v2
    [*] --> LoginPage

    LoginPage --> Authenticate: Submit credentials

    Authenticate --> ValidateDB: Check email/password
    ValidateDB --> EmailVerified: Credentials valid
    EmailVerified --> GenerateJWT: Email verified
    EmailVerified --> VerifyEmail: Email not verified

    VerifyEmail --> EnterCode: Send code
    EnterCode --> UpdateVerified: Code valid
    UpdateVerified --> GenerateJWT

    GenerateJWT --> SetCookie: JWT created
    SetCookie --> CheckRole: Cookie set

    CheckRole --> AdminDash: ADMIN
    CheckRole --> ManagerDash: MANAGER
    CheckRole --> StaffDash: STAFF
    CheckRole --> DeliveryDash: DELIVERY
    CheckRole --> CustomerDash: CUSTOMER

    AdminDash --> [*]
    ManagerDash --> [*]
    StaffDash --> [*]
    DeliveryDash --> [*]
    CustomerDash --> [*]

    ValidateDB --> LoginPage: Invalid credentials
    EnterCode --> VerifyEmail: Invalid code
```

## 📦 Order State Machine

**Order Status Transitions:**
```mermaid
stateDiagram-v2
    [*] --> CREATED: Customer places order

    CREATED --> ACCEPTED: Admin accepts & payment completes
    CREATED --> CANCELLED: Customer/Admin cancels

    ACCEPTED --> ASSIGNED: Delivery agent assigned
    ACCEPTED --> PICKED_UP: Pickup order ready
    ACCEPTED --> CANCELLED: Admin cancels

    ASSIGNED --> PICKED_UP: Agent picks up
    ASSIGNED --> CANCELLED: Issue occurs

    PICKED_UP --> IN_TRANSIT: Agent starts delivery
    PICKED_UP --> DELIVERED: Pickup complete

    IN_TRANSIT --> DELIVERED: Delivery complete
    IN_TRANSIT --> CANCELLED: Delivery failed

    DELIVERED --> [*]
    CANCELLED --> [*]

    note right of CREATED
        Payment: PENDING
    end note

    note right of ACCEPTED
        Payment: COMPLETED
    end note

    note right of DELIVERED
        Payment: COMPLETED
        Delivery: DELIVERED
    end note

    note right of CANCELLED
        Payment: REFUNDED
    end note
```

## 🚀 Data Flow

**Request → Response Flow:**
```mermaid
flowchart LR
    User[User Action] --> UI[UI Component]

    UI --> Context[React Context]
    Context --> API[API Route]

    API --> AuthMW[Auth Middleware]
    AuthMW --> Validate[Validate JWT]

    Validate --> Service[Service Layer]

    Service --> Transaction{Transaction<br/>Needed?}

    Transaction -->|Yes| TX[Begin Transaction]
    Transaction -->|No| Query[Execute Query]

    TX --> DBOps[Multiple DB Operations]
    DBOps --> Commit{All<br/>Success?}

    Commit -->|Yes| CommitTX[COMMIT]
    Commit -->|No| Rollback[ROLLBACK]

    Query --> Result[Query Result]
    CommitTX --> Result
    Rollback --> Error[Error Response]

    Result --> Response[JSON Response]
    Error --> Response

    Response --> UI
    UI --> User

    style Transaction fill:#FF9800
    style Commit fill:#FF9800
    style Error fill:#F44336
    style Result fill:#4CAF50
```

## 🗂️ Folder Structure

```
coffee-management-system/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth routes group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Dashboard routes group
│   │   ├── admin/               # Admin panel
│   │   │   ├── users/
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   └── deliveries/
│   │   ├── customer/            # Customer panel
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   └── delivery/            # Delivery panel
│   └── api/                     # API routes
│       ├── auth/
│       ├── coffees/
│       ├── orders/
│       ├── payments/
│       └── deliveries/
│
├── src/
│   ├── backend/
│   │   ├── database/
│   │   │   ├── schema/          # 📊 Database schemas
│   │   │   │   ├── auth.schema.ts
│   │   │   │   ├── order.schema.ts
│   │   │   │   ├── coffee.schema.ts
│   │   │   │   └── ...
│   │   │   ├── client.ts        # 🔌 DB connection
│   │   │   ├── enums.ts         # 🏷️ Enum definitions
│   │   │   └── seed.ts          # 🌱 Seed script
│   │   └── services/            # 💼 Business logic
│   │       ├── auth.service.ts
│   │       ├── order.service.ts      # ⚡ WITH TRANSACTIONS
│   │       ├── payment.service.ts    # ⚡ WITH TRANSACTIONS
│   │       └── ...
│   │
│   ├── components/ui/           # 🎨 Reusable UI components
│   ├── contexts/                # 🔄 React contexts
│   ├── lib/                     # 🛠️ Utilities
│   └── types/                   # 📝 TypeScript types
│
└── docs/                        # 📚 Documentation
    ├── DATABASE_SCHEMA.md       # ERD & Relational Algebra
    ├── ARCHITECTURE.md          # System Architecture
    ├── TRANSACTIONS.md          # Transaction Guide
    └── DIAGRAMS_REFERENCE.md    # This file
```

## 🔍 Key Relational Algebra Examples

Full algebra → See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md#relational-algebra-operations)

**1. Customer Orders with Items:**
```
π order_id, customer_name, coffee_name, total_amount (
  ORDERS ⋈ AUTH_USERS ⋈ ORDER_ITEMS ⋈ COFFEES
)
```

**2. Branch Revenue:**
```
π branch_name, SUM(total_amount) (
  σ status='DELIVERED' (ORDERS) ⋈ BRANCHES
)
```

**3. Coffee Ratings:**
```
π coffee_name, AVG(rating) (
  COFFEES ⟕ REVIEWS
)
```

## 📱 Component Hierarchy

```mermaid
graph TD
    Root[Root Layout] --> Providers[Context Providers]

    Providers --> AuthProvider[Auth Provider]
    Providers --> CartProvider[Cart Provider]
    Providers --> ThemeProvider[Theme Provider]

    Root --> AuthGroup[Auth Group]
    Root --> DashGroup[Dashboard Group]

    AuthGroup --> Login[Login Page]
    AuthGroup --> Register[Register Page]

    DashGroup --> AdminLayout[Admin Layout]
    DashGroup --> CustomerLayout[Customer Layout]
    DashGroup --> DeliveryLayout[Delivery Layout]

    AdminLayout --> AdminDash[Admin Dashboard]
    AdminLayout --> UserMgmt[User Management]
    AdminLayout --> MenuMgmt[Menu Management]
    AdminLayout --> OrderMgmt[Order Management]

    CustomerLayout --> CustomerDash[Customer Dashboard]
    CustomerLayout --> BrowseMenu[Browse Menu]
    CustomerLayout --> Cart[Shopping Cart]
    CustomerLayout --> OrderHistory[Order History]

    DeliveryLayout --> DeliveryDash[Delivery Dashboard]
    DeliveryLayout --> ActiveDeliveries[Active Deliveries]

    style Root fill:#4CAF50
    style Providers fill:#2196F3
    style AdminLayout fill:#F44336
    style CustomerLayout fill:#9C27B0
    style DeliveryLayout fill:#00BCD4
```

## 🔧 Tech Stack Overview

```mermaid
mindmap
    root((Coffee System))
        Frontend
            Next.js 16
            TypeScript
            React
            Tailwind
            Radix UI
        Backend
            Next.js API
            Services Layer
            Drizzle ORM
            **Transactions**
        Database
            PostgreSQL
            ACID Properties
            Foreign Keys
            Indexes
        Security
            JWT Auth
            httpOnly Cookies
            Bcrypt
            RBAC
```

## 📊 Database Tables Summary

| Table | Purpose | Key Relations | Transactions |
|-------|---------|---------------|--------------|
| `auth_users` | Authentication | → user_profiles, orders, cart | Registration |
| `user_profiles` | User details | ← auth_users, → branches | Registration |
| `orders` | Order records | → order_items, payments, deliveries | Creation, Cancellation |
| `order_items` | Order contents | ← orders, → coffees | Order Creation |
| `payments` | Payments | ← orders | Processing, Refund |
| `deliveries` | Deliveries | ← orders, → auth_users (agent) | Assignment |
| `coffees` | Menu items | → order_items, cart, reviews | - |
| `cart` | Shopping cart | ← auth_users, → coffees | Order Creation |
| `branches` | Coffee shops | → orders, deliveries, staff | - |
| `reviews` | Coffee reviews | ← auth_users, → coffees | - |

## 🎯 Transaction Summary

| Operation | Service | Method | Tables Affected | Why Transaction |
|-----------|---------|--------|-----------------|-----------------|
| Order Creation | orderService | create() | orders, order_items, payments, deliveries, cart | 5 tables must be consistent |
| Payment Processing | paymentService | processPayment() | payments, orders | Payment + order status sync |
| User Registration | authService | register() | auth_users, user_profiles, verifications | Complete user account |
| Order Cancellation | orderService | cancelOrder() | orders, deliveries, payments | Status + refund sync |
| Agent Assignment | orderService | assignDeliveryAgent() | deliveries, orders | Assignment + status sync |

---

**For detailed information, see:**
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Complete ERD and relational algebra
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design
- [TRANSACTIONS.md](./TRANSACTIONS.md) - Transaction implementation guide

**View Mermaid Diagrams:** https://mermaid.live
