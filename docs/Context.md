# Meal Box Subscription App

## Overview
The Meal Box Subscription App allows users to subscribe to meal plans, manage their subscriptions, and make payments seamlessly. This document outlines the app's user flow and key features for developers.


## Tech Stack
- Frontend: React Native with TypeScript, Expo, and Expo Router
- Backend/Database: Supabase
- UI Framework: React Native Paper
- Payment Processing: Stripe

## User Flow

### 1. Welcome Screen
- Clean and simple welcome interface
- Options to Sign Up or Log In

### 2. User Registration & Login
#### Sign Up
- Email and phone number registration
- Delivery address collection
- Verification process (email/SMS OTP)

#### Login
- Email/phone and password authentication
- Password reset functionality

### 3. Main Dashboard
Users land on a dashboard displaying:
- Available meal box subscription plans
- Plan sorting by popularity
- Detailed plan information:
  - Meal types
  - Pricing
  - Delivery frequency
  - Dietary preferences

### 4. Subscription Plan Selection
Users can:
- Browse and select meal box plans
- Customize their selected plan:
  - Set meal preferences
  - Choose weekly meal quantity
  - Add optional extras (snacks, drinks)
- Proceed to checkout

### 5. Checkout & Payment
- Multiple payment method options
  - Credit/debit cards
  - PayPal integration
- Payment information storage option
- Order summary review
- Confirmation messaging (in-app and email)

### 6. Subscription Management
#### View Details
- Active plan status
- Upcoming delivery schedule
- Payment timeline

#### Modification Options
- Subscription pausing
- Plan cancellation
- Delivery address updates
- Payment method changes

## Key Features

### Authentication & User Management
- User registration/login system
- Verification processes
- Account recovery options

### Subscription Management
- Plan browsing and selection
- Customization options
- Payment processing
- Active subscription oversight

### Payment Integration
- Multiple payment method support
- Order confirmation system
- Transaction history tracking

### User Dashboard
- Personalized subscription view
- Easy modification access
- Subscription control features

### Notifications & Alerts
- Order status updates
- Renewal reminders
- Promotional communications

## Database Schema

### Users Table
```sql
users (
    id: uuid PRIMARY KEY,
    email: string UNIQUE,
    phone: string UNIQUE,
    password_hash: string,
    created_at: timestamp,
    updated_at: timestamp
)
```

### Profiles Table
```sql
profiles (
  id: uuid PRIMARY KEY REFERENCES users(id),
  first_name: string,
  last_name: string,
  delivery_address: string,
  dietary_preferences: string[],
  created_at: timestamp,
  updated_at: timestamp
)
```

### Subscription_Plans Table
```sql
subscription_plans (
  id: uuid PRIMARY KEY,
  name: string,
  description: text,
  price: decimal,
  meals_per_week: integer,
  servings_per_meal: integer,
  is_popular: boolean,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Subscriptions Table
```sql
subscriptions (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  plan_id: uuid REFERENCES subscription_plans(id),
  status: enum('active', 'paused', 'cancelled'),
  start_date: timestamp,
  next_delivery_date: timestamp,
  payment_method_id: string,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Orders Table
```sql
orders (
  id: uuid PRIMARY KEY,
  subscription_id: uuid REFERENCES subscriptions(id),
  user_id: uuid REFERENCES users(id),
  total_amount: decimal,
  status: enum('pending', 'paid', 'failed'),
  payment_intent_id: string,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Delivery_Schedules Table
```sql
delivery_schedules (
  id: uuid PRIMARY KEY,
  subscription_id: uuid REFERENCES subscriptions(id),
  delivery_date: timestamp,
  status: enum('scheduled', 'delivered', 'failed'),
  created_at: timestamp,
  updated_at: timestamp
)
```

## Project Structure
```
meal-box-app/
├── app/                      # Expo Router app directory
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (main)/              # Main app routes
│   │   ├── dashboard.tsx
│   │   ├── plans/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── subscriptions/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   └── profile/
│   │       └── index.tsx
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── assets/                  # Static assets
│   ├── images/
│   └── fonts/
├── components/              # Reusable components
│   ├── common/             # Shared components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── auth/               # Auth-related components
│   ├── plans/              # Plan-related components
│   └── subscription/       # Subscription components
├── constants/              # App constants
│   ├── theme.ts
│   └── config.ts
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   └── usePlans.ts
├── services/              # API and external services
│   ├── supabase.ts
│   ├── stripe.ts
│   └── api/
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utility functions
│   ├── validation.ts
│   └── helpers.ts
├── .env                   # Environment variables
├── app.json              # Expo config
├── package.json
└── tsconfig.json
```

### Key Directories Explained

#### `app/`
Contains all the routes and screens using Expo Router's file-based routing system.

#### `components/`
Reusable UI components organized by feature/domain.

#### `services/`
External service integrations (Supabase, Stripe) and API calls.

#### `hooks/`
Custom React hooks for shared logic and state management.

#### `types/`
TypeScript type definitions and interfaces.

#### `utils/`
Helper functions and utilities used across the app.

This structure follows the feature-based organization principle, making it easy to:
- Locate related code quickly
- Scale the application
- Maintain separation of concerns
- Share components and logic effectively
