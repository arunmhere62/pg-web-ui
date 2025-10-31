# PG Web App - Setup Guide

## ✅ Super Admin Web Application Created

A modern React + TypeScript web application for super admin to manage the PG system.

## 📁 Project Structure

```
pg-web-app/
├── src/
│   ├── components/
│   │   └── DashboardLayout.tsx    # Main layout with sidebar
│   ├── pages/
│   │   ├── LoginPage.tsx          # OTP-based authentication
│   │   ├── DashboardPage.tsx      # Dashboard with stats
│   │   ├── TicketsPage.tsx        # All tickets list
│   │   ├── TicketDetailsPage.tsx  # Ticket details & management
│   │   └── OrganizationsPage.tsx  # Organizations list
│   ├── lib/
│   │   ├── api.ts                 # Axios instance with interceptors
│   │   └── utils.ts               # Utility functions
│   ├── store/
│   │   └── authStore.ts           # Zustand auth state
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind CSS
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd pg-web-app
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 🔐 Authentication

- **Login**: OTP-based authentication
- **Access**: Super Admin role required
- **Flow**:
  1. Enter phone number
  2. Receive OTP
  3. Verify OTP
  4. System checks for SUPER_ADMIN role
  5. Redirect to dashboard

## 📊 Features

### Dashboard
- System overview
- Ticket statistics by status
- Category and priority distribution
- Real-time data from API

### Ticket Management
- View all tickets across organizations
- Filter by status (Open, In Progress, Resolved, Closed)
- Search tickets by title, description, or ticket number
- Update ticket status
- Add comments to tickets
- View ticket details and history

### Organization Management
- View all organizations
- Organization details
- Contact information

## 🔌 API Integration

The web app connects to your existing NestJS backend:

- **Base URL**: `http://localhost:5000/api/v1`
- **Authentication**: JWT Bearer token
- **Headers**:
  - `Authorization: Bearer {token}`
  - `X-User-Id: {userId}`
  - `X-Organization-Id: {orgId}` (when applicable)

### API Endpoints Used

- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP & login
- `GET /tickets` - List all tickets
- `GET /tickets/:id` - Get ticket details
- `PATCH /tickets/:id` - Update ticket
- `POST /tickets/:id/comments` - Add comment
- `GET /tickets/stats` - Get statistics
- `GET /organizations` - List organizations

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Structure

- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Lib**: Utilities and API client
- **Store**: Global state management

## 📝 Notes

- All TypeScript errors shown are expected until dependencies are installed
- The app uses the existing backend API - no backend changes needed
- Super admin role verification happens on login
- Persistent authentication using localStorage
- Responsive design for desktop use

## 🔄 Next Steps

1. **Install dependencies**: `npm install`
2. **Start backend API**: Ensure your NestJS backend is running on port 5000
3. **Start web app**: `npm run dev`
4. **Login**: Use your super admin phone number
5. **Manage tickets**: Update status, add comments, view all tickets

## 🎯 Key Features for Super Admin

✅ **Ticket Management**
- View all tickets across all organizations
- Update ticket status (Open → In Progress → Resolved → Closed)
- Add comments and track conversations
- Filter and search tickets

✅ **Organization Overview**
- View all registered organizations
- Access organization details
- Monitor system-wide activity

✅ **Dashboard Analytics**
- Total tickets count
- Status distribution
- Category breakdown
- Priority levels

✅ **Secure Authentication**
- OTP-based login
- Role verification
- Persistent sessions
- Auto-logout on token expiry

## 🚨 Troubleshooting

**Port already in use?**
```bash
# Change port in vite.config.ts
server: { port: 3001 }
```

**API connection issues?**
- Check backend is running on port 5000
- Verify VITE_API_URL in .env file
- Check CORS settings in backend

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Created**: Super Admin Web Application
**Framework**: React + TypeScript + Vite
**Styling**: Tailwind CSS
**State**: Zustand + TanStack Query
**Backend**: Existing NestJS API (no changes needed)
