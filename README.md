# BinoManager 🏪

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-10-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A modern, production-ready multi-tenant SaaS wholesale inventory and sales management system with real-time stock tracking, subscription billing, and comprehensive reporting.**

[Features](#-features) • [Installation](#-installation) • [Architecture](#-architecture) • [Security](#-security) • [License](#-license)

</div>

---

## ⚠️ Repository Access

**This is a source-available proprietary project.** The code is publicly viewable for transparency and educational purposes, but:

- ❌ **NOT open source** - No license to use, modify, or distribute
- ❌ **NOT free to use** - Commercial use requires explicit permission
- ✅ **Read-only access** - View code for learning and evaluation
- ✅ **Contributions welcome** - Submit issues and pull requests

For licensing inquiries, contact: **404Softwares**

---

## ✨ Features

### 🏢 Multi-Tenancy & SaaS
- **Path-based Tenant Isolation** - Each workspace gets unique URL (`/workspace-slug/`)
- **Subscription Management** - Paystack integration with monthly/annual billing
- **Flexible Plans** - Starter, Business, Enterprise with custom limits
- **Trial System** - 14-day free trial with grace period
- **Super Admin Portal** - Platform management dashboard

### 🎯 Core Functionality
- **Product Management** - Barcode support, categories, inventory tracking
- **Stock Management** - FIFO inventory with price history
- **Sales Processing** - Multi-product sales with concurrent transaction safety
- **Customer Management** - Credit tracking, payment history
- **Financial Reports** - Profit/loss, inventory valuation, sales analytics
- **Team Collaboration** - Role-based access, email invitations

### 🔒 Security & Performance
- **Database Locking** - Pessimistic locking prevents race conditions
- **Tenant Isolation** - Global scopes ensure data separation
- **CSRF Protection** - Laravel's built-in security
- **Password Security** - Bcrypt hashing with strength requirements
- **Session Management** - Database-backed sessions with tenant context
- **Input Sanitization** - XSS prevention on all user inputs

### 🎨 Modern UI/UX
- **React SPA** - Fast, responsive single-page application
- **Dark Mode** - System-aware theme switching
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Real-time Charts** - Chart.js powered analytics
- **Thermal Printing** - 80mm POS receipt format

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Laravel 10 (PHP 8.1+)
- MySQL 8.0+ with InnoDB
- Laravel Fortify (Authentication)
- Laravel Jetstream (Teams)

**Frontend:**
- React 18 with TypeScript
- Vite (Build tool)
- Tailwind CSS 3
- Chart.js

**Infrastructure:**
- Paystack (Payment processing)
- Database sessions
- File-based cache

### Multi-Tenant Architecture

```
Central Domain (/)              Tenant Workspaces
├── Landing page                /{slug}/home
├── Pricing                     /{slug}/sales
├── Registration                /{slug}/products
└── Super Admin (/superadmin)   /{slug}/reports
                                /{slug}/team
                                └── /{slug}/settings
```

**Tenant Resolution Order:**
1. Path segment (`/{slug}/...`)
2. Session (`_bino_tenant`)
3. Authenticated user's `tenant_id`

**Data Isolation:**
- `BelongsToTenant` global scope on all models
- Middleware enforces tenant context
- Foreign key constraints prevent cross-tenant access

---

## 🚀 Installation

### Prerequisites

- PHP >= 8.1 (with extensions: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML)
- Composer
- MySQL >= 8.0
- Node.js >= 18.x
- NPM or Yarn



## 📊 Database Schema

### Core Tables

**tenants** - Workspace/business accounts
- `id`, `name`, `slug`, `email`, `phone`
- `plan_id`, `status`, `trial_ends_at`, `next_payment_date`

**users** - User accounts (scoped to tenants)
- `id`, `tenant_id`, `name`, `email`, `password`
- `usertype` (1=Admin, 0=Sales), `status`

**plans** - Subscription plans
- `id`, `name`, `slug`, `billing_cycle`
- `price_kobo`, `max_users`, `max_products`

**products** - Product catalog (tenant-scoped)
- `id`, `tenant_id`, `name`, `barcode`, `quantity`

**stocks** - Inventory entries with FIFO tracking
- `id`, `tenant_id`, `product_id`, `quantity`, `price`, `date`

**sales** - Sales transactions
- `id`, `tenant_id`, `product_id`, `user_id`
- `quantity`, `price`, `total`, `customer_name`, `sale_date`

**customers** - Customer accounts with credit tracking
- `id`, `tenant_id`, `name`, `email`, `phone`, `balance`

---

## 🔐 Security Features

### Authentication & Authorization
- Laravel Fortify with custom tenant-aware authentication
- Role-based access control (Admin vs Sales)
- User status enforcement (active/deactivated)
- Session-based authentication with CSRF protection

### Data Protection
- SQL injection prevention (Eloquent ORM)
- XSS protection (Blade escaping + InputSanitizer)
- Password hashing (Bcrypt)
- Secure session management
- File upload validation

### Multi-Tenant Security
- Global scopes prevent cross-tenant queries
- Middleware enforces tenant context
- User-tenant association validation
- Soft deletes for tenant data

### Concurrency Safety
- Database row locking (`lockForUpdate()`)
- Transaction isolation for sales
- FIFO stock deduction with atomic operations

---

## 👥 User Roles

### Super Admin
- Platform-wide access
- Tenant management
- Plan configuration
- Payment gateway settings
- System monitoring

### Tenant Admin (usertype = 1)
- Full workspace access
- Product & stock management
- User management
- Reports and analytics
- Billing and subscription

### Sales User (usertype = 0)
- Sales processing
- View products and stock
- Limited reports
- No administrative access

---

## 🔌 API Endpoints

### Tenant Routes (Prefix: `/{tenant_slug}`)

**Dashboard**
- `GET /api/dashboard` - Dashboard metrics

**Products**
- `GET /products-list` - List products
- `POST /add-product` - Create product (Admin)
- `PUT /update-product/{id}` - Update product (Admin)
- `DELETE /delete-product/{id}` - Delete product (Admin)

**Stock**
- `GET /stock-list` - List stock entries
- `POST /add-stock` - Add stock (Admin)
- `PATCH /update-stock/{id}` - Update quantity (Admin)
- `DELETE /delete-stock/{id}` - Delete stock (Admin)

**Sales**
- `POST /add-sale` - Process sale (with locking)
- `GET /track-sales-data` - Sales report

**Team**
- `GET /api/team` - List team members
- `POST /team/invite` - Send invitation (Admin)
- `DELETE /team/members/{id}` - Remove member (Admin)

**Billing**
- `GET /billing` - Subscription details
- `POST /billing/checkout` - Initialize payment
- `GET /billing/verify` - Verify payment

### Super Admin Routes (Prefix: `/superadmin`)

- `GET /api/dashboard` - Platform metrics
- `GET /api/tenants` - List all tenants
- `GET /api/plans` - Manage plans
- `POST /tenants/{id}/suspend` - Suspend tenant
- `POST /tenants/{id}/change-plan` - Change plan

---

## 🛠️ Development

### Run Development Server
```bash
php artisan serve
npm run dev
```

### Clear Cache
```bash
php artisan optimize:clear
# or individually:
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Database Operations
```bash
# Run migrations
php artisan migrate

# Rollback
php artisan migrate:rollback

# Fresh migration (WARNING: deletes all data)
php artisan migrate:fresh
```

### Testing
```bash
php artisan test
```

---

## 🚀 Production Deployment

### 1. Optimize Application
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```




### 4. Security Checklist
- [ ] Set strong `APP_KEY`
- [ ] Configure HTTPS/SSL
- [ ] Set `APP_DEBUG=false`
- [ ] Configure proper file permissions
- [ ] Set up database backups
- [ ] Configure Paystack webhook signature verification
- [ ] Review `.env` for sensitive data

---

## 📝 License

**Proprietary License - All Rights Reserved**

Copyright © 2026 404Softwares

This software and associated documentation files (the "Software") are proprietary and confidential. Unauthorized copying, modification, distribution, or use of this Software, via any medium, is strictly prohibited.

**Permissions:**
- ✅ View source code for evaluation purposes
- ✅ Report issues and suggest improvements
- ✅ Fork for contributing via pull requests

**Restrictions:**
- ❌ Commercial use without license
- ❌ Redistribution or resale
- ❌ Modification for production use
- ❌ Removal of copyright notices

For licensing inquiries: **contact@404softwares.com**

---



---

## 🙏 Acknowledgments

- Built with [Laravel](https://laravel.com)
- UI powered by [Tailwind CSS](https://tailwindcss.com)
- Charts by [Chart.js](https://www.chartjs.org)
- Payments by [Paystack](https://paystack.com)
- Icons by [Heroicons](https://heroicons.com)

---

<div align="center">

**Version**: 2.0.0 | **Last Updated**: March 2026

Made with ❤️ by [404Softwares](https://github.com/salvationndu-png)

[Report Bug](https://github.com/salvationndu-png/BinoManager/issues) • [Request Feature](https://github.com/salvationndu-png/BinoManager/issues)

</div>
