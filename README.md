# PG Web App - Super Admin Panel

Modern web application for super admin to manage PG operations, tickets, and organizations.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Features

### Authentication
- OTP-based login
- Super Admin role verification
- Persistent auth state

### Dashboard
- System overview
- Quick stats
- Recent activity

### Ticket Management
- View all tickets across organizations
- Update ticket status
- Assign tickets
- Add comments
- Filter and search

### Organization Management
- View all organizations
- Organization statistics
- Manage PG locations

## API Integration

The app connects to the existing NestJS backend at `/api/v1`. All API calls include:
- Authorization header with JWT token
- X-User-Id header
- X-Organization-Id header (when applicable)

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── lib/            # Utilities and API client
├── store/          # Zustand stores
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Development

- Hot module replacement enabled
- TypeScript strict mode
- ESLint configured
- Tailwind CSS with custom config

## Login Credentials

Use your super admin phone number to receive OTP for login.
