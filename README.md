# Golf Platform

A subscription-based golf gaming platform with integrated lottery draw system and charity contributions.

## Project Overview

Golf Platform is a full-stack web application that allows golf enthusiasts to:

- Subscribe to monthly or yearly membership plans
- Submit and track golf scores
- Participate in monthly draws with prize distribution
- Support charities through automatic contributions from subscription fees
- View analytics and draw results

## Features

### User Features

- **Authentication**: Secure Supabase-based authentication
- **Subscriptions**: Flexible monthly (₹299) and yearly (₹3,299) plans
- **Score Tracking**: Log golf scores and view performance history
- **Monthly Draws**: Participate in random or algorithmic-weighted draws
- **Charity Support**: Automatic 10% contribution to chosen charity
- **Prize Pools**: Win prizes from distributed pool based on score matches

### Admin Features

- **Dashboard Analytics**: Real-time statistics on users, subscriptions, and draws
- **User Management**: View and manage user accounts
- **Draw Control**: Execute and simulate draws with different strategies
- **Charity Management**: Add, edit, and manage charity partners
- **Winner Verification**: Verify winner proofs and manage payouts
- **Prize Configuration**: Monitor prize pool distribution

## Tech Stack

### Frontend

- **Framework**: React 19.2 with Vite 8.0
- **Styling**: CSS with Glass-morphism design
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Icons**: Lucide React
- **Router**: React Router DOM 7.13

### Backend

- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17+
- **Database**: PostgreSQL (Supabase)
- **ORM**: Hibernate/Spring Data JPA
- **Payment**: Stripe API
- **CORS**: Configured for local development
- **Build Tool**: Maven

### Database

- **Provider**: Supabase (PostgreSQL)
- **Tables**: Users, Subscriptions, Scores, Draws, Winners, UserCharities
- **Authentication**: Supabase Auth integration

## Project Structure

```
golf-platform/
├── frontend/                 # React Vite application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # Auth context
│   │   ├── lib/             # API client & Supabase config
│   │   └── assets/          # Static assets
│   ├── .env                 # Frontend environment variables
│   └── package.json
│
├── backend/                  # Spring Boot application
│   ├── src/
│   │   ├── main/java/com/golf/platform/
│   │   │   ├── controller/  # API endpoints
│   │   │   ├── service/     # Business logic & Draw system
│   │   │   ├── entity/      # Domain models
│   │   │   ├── repository/  # Data access
│   │   │   ├── dto/         # Data transfer objects
│   │   │   └── config/      # Spring configuration
│   │   └── resources/
│   │       └── application.yml
│   ├── .env                 # Backend environment variables
│   ├── pom.xml              # Maven dependencies
│   └── Dockerfile
│
└── README.md                # This file
```

## Installation & Setup

### Prerequisites

- **Frontend**: Node.js 18+ with npm
- **Backend**: Java 17+ (Eclipse Adoptium recommended)
- **Maven**: 3.8+
- **Database**: Supabase account with PostgreSQL
- **Payment**: Stripe account for payment processing

### Environment Configuration

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
VITE_STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key>
```

#### Backend (.env)

```env
STRIPE_SECRET_KEY=<your_stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
STRIPE_PRICE_ID_MONTHLY=<monthly_price_id>
STRIPE_PRICE_ID_YEARLY=<yearly_price_id>

SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

SUPABASE_DB_HOST=<db_host>
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=<db_user>
SUPABASE_DB_PASSWORD=<db_password>

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<your_email>
MAIL_PASSWORD=<app_password>
```

## Running the Application

### Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8081`

### Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Subscription Plans & Pricing

| Plan  | Monthly | Yearly | Charity Contribution |
| ----- | ------- | ------ | -------------------- |
| Basic | ₹299    | -      | ₹30                  |
| Pro   | -       | ₹3,299 | ₹330                 |

**Charity**: 10% of every subscription automatically goes to user's chosen charity

## Draw System

### How It Works

1. Users submit golf scores (values 1-45)
2. Monthly draw picks 5 random/weighted numbers
3. Winners matched by score value matching
4. Prizes distributed by match type

### Prize Distribution

- **5-Match (Jackpot)**: 40% of pool
- **4-Match**: 35% of pool
- **3-Match**: 25% of pool

### Draw Types

- **Random**: Standard lottery selection
- **Algorithmic**: Weighted by score frequency for fairness

## Key API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/sync` - Sync user to backend

### Subscriptions

- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/checkout` - Create checkout session
- `POST /api/subscriptions/confirm` - Confirm subscription

### Scores

- `GET /api/scores` - List user scores
- `POST /api/scores` - Submit new score

### Draws

- `GET /api/draws` - List all draws
- `POST /api/draws/execute` - Execute a draw
- `POST /api/draws/simulate` - Simulate draw (no save)

### Admin

- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/users` - List all users
- `GET /api/admin/draws/config` - Draw configuration
- `POST /api/admin/charities` - Manage charities
- `GET /api/admin/winners` - List winners

## Database Schema

### Key Tables

- **users**: User accounts and authentication
- **subscriptions**: Active subscription plans
- **scores**: Golf score submissions
- **draws**: Monthly lottery draws
- **draw_results**: Score matching results
- **winners**: Prize winners and payouts
- **charities**: Registered charity organizations
- **user_charities**: User-charity associations

## Features Implemented

✅ User Authentication & Authorization
✅ Subscription Management (Stripe integration)
✅ Golf Score Tracking
✅ Monthly Draw System (Random & Algorithmic)
✅ Admin Dashboard with Analytics
✅ Charity Management
✅ Winner Verification & Payout Tracking
✅ Terms of Service & Privacy Policy
✅ Responsive UI Design
✅ CORS Configuration
✅ Error Handling & Validation

## Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (User/Admin)
- **Payment**: PCI-compliant Stripe integration
- **Database**: Row-level security policies
- **CORS**: Restricted to authorized origins
- **Encryption**: SSL/TLS for all data transmission

## Notes for Assignment

This is a fully functional golf platform with:

- Complete backend API with Spring Boot
- Interactive React frontend with real-time updates
- PostgreSQL database with Supabase
- Integrated payment processing via Stripe
- Comprehensive draw system with prize distribution
- Admin controls for platform management

The project demonstrates full-stack development capabilities including:

- RESTful API design
- Database modeling and management
- Authentication and authorization
- Payment integration
- Frontend-backend integration
- Admin dashboard development

## Contact & Support

For issues or questions about the implementation, refer to the API documentation or check the admin dashboard for live analytics.

---
