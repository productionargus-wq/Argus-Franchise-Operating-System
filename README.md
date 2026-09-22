# ARGUSCNC - Franchise Operating System

A centralized multi-franchise platform for sales, quotation control, order execution, installation, support, renewals, commissions, and head-office monitoring built using Next.js 14+ (App Router), Node.js, and MongoDB.

## Features

- **Multi-Tenant Franchise Isolation**: Complete data segregation by franchise with Head Office central administration.
- **Live Role-Based Access Control (RBAC)**: Supports Head Office Super Admin, Franchise Admin, Franchise Sales, Service Engineer, and Finance / Accounts with live persona switcher.
- **Price Control Engine**: Head Office owns the Price Master. Real-time enforcement prevents discounting below minimum allowed selling prices without Head Office special authorization.
- **Lead & Opportunity Pipeline**: Comprehensive stages from inquiry, automated territory conflict checks, technical demo trial cuts, to quotation.
- **Order & Milestone Payments**: PO tracking with Advance (30%), Before Dispatch (60%), and Post-Installation (10%) payment schedules.
- **Field Installation & Digital Sign-off**: 5-step commissioning checklist and HTML5 Canvas digital customer signature capture.
- **Support & SLA Countdown**: Live incident tracker with critical 4-hour SLA monitoring and on-site engineer notes.
- **Warranty & AMC Renewals**: Automated multi-stage reminders at 60, 30, 15, and 7 days with escalation logic.
- **Customer 360° Profile**: Single unified customer dashboard with fleet overview, history, and intelligent upsell recommendations.
- **Commission Settlement Engine**: Transaction-based ledger following strict rules: Payment Received ➔ Eligible Revenue ➔ Calculation ➔ HO Approval ➔ Disbursed.

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Route Handlers (Node.js runtime)
- **Database**: MongoDB with Mongoose ODM (includes in-memory repository fallback for zero-config startup)

## Getting Started

1. Clone repository:
   ```bash
   git clone https://github.com/productionargus-wq/Argus-Franchise-Operating-System.git
   cd Argus-Franchise-Operating-System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
