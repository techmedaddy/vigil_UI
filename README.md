# Vigil Monitoring System

<div align="center">

**A professional, production-ready dashboard for monitoring self-healing infrastructure, managing policies, and tracking remediation actions.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [API Integration](#api-integration)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Vigil** is a comprehensive monitoring and self-healing infrastructure management system. It provides real-time visibility into your infrastructure health, automated policy-based remediation, and powerful testing tools for policy validation.

The frontend dashboard offers:
- **Real-time metrics monitoring** with live updates
- **Policy management** with CRUD operations and evaluation testing
- **Action tracking** for automated remediation workflows
- **Queue monitoring** for background job processing
- **Metric simulation** for testing and development
- **Policy testing** with custom metric scenarios

---

## ✨ Features

### 🎛️ Dashboard
- **Overview cards** displaying active actions, policies, and queue statistics
- **Recent activity feed** with real-time updates every 5 seconds
- **Quick navigation** to detailed views
- **Status indicators** with color-coded severity levels

### 📊 Metrics Ingestion
- Manual metric injection for testing
- Support for tagged metrics (host, region, environment)
- Real-time validation and feedback
- Integration with backend policy evaluation engine

### 📋 Policy Management
- **Full CRUD operations** for policy configuration
- **Severity levels:** info, warning, critical
- **Condition types:** metric_exceeds, metric_below, all, any
- **Actions:** scale-up, restart, drain-pod, custom
- **Enable/disable** policies without deletion
- **Real-time policy statistics** and filtering

### ⚡ Actions Tracking
- View all remediation actions with filtering (by status, target)
- **Status types:** pending, running, completed, failed, cancelled
- **Auto-refresh** capabilities with manual refresh option
- Detailed action information with timestamps

### 🧪 Policy Testing
- Test policies against custom metric scenarios
- Support for single and multi-condition policies
- Real-time evaluation results
- Detailed policy match information

### 📈 Queue Monitor
- View background job queue statistics
- Monitor queue length and processing status
- Track queue health metrics

### 🔄 Simulator
- Simulate various infrastructure scenarios
- Generate test metrics for policy validation
- Support for multiple simulation patterns

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vigil Frontend (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Policies │  │ Actions  │  │  Tester  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘           │
│                         │                                    │
│                    ┌────▼─────┐                             │
│                    │ API      │                             │
│                    │ Service  │                             │
│                    └────┬─────┘                             │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                 Vigil Backend (FastAPI)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Ingest  │  │ Policies │  │ Actions  │  │  Queue   │   │
│  │ Service  │  │ Engine   │  │ Manager  │  │ Monitor  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘           │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │                     │                         │
│         ┌────▼─────┐         ┌────▼─────┐                  │
│         │PostgreSQL│         │  Redis   │                   │
│         └──────────┘         └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn** package manager
- **Vigil Backend** running at `http://localhost:8000` (see backend setup)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vigil-monitoring-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Backend URL

The frontend is configured to connect to `http://localhost:8000` by default. If your backend runs on a different URL, update the `API_BASE` constant in [services/api.ts](services/api.ts).

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### 5. Build for Production

```bash
npm run build
```

The optimized production build will be created in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
vigil-monitoring-system/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard with overview
│   ├── Layout.tsx       # Application layout wrapper
│   ├── MetricsIngestion.tsx  # Manual metric injection
│   ├── Policies.tsx     # Policy CRUD management
│   ├── PolicyTester.tsx # Policy evaluation testing
│   ├── Actions.tsx      # Action tracking and filtering
│   ├── QueueMonitor.tsx # Queue statistics viewer
│   └── Simulator.tsx    # Metric simulation tool
├── services/
│   └── api.ts           # API client for backend communication
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── constants.tsx        # Shared constants and enums
├── types.ts             # TypeScript type definitions
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
├── index.html           # HTML entry point
├── metadata.json        # Application metadata
├── API_QUICK_REFERENCE.MD      # Quick API reference
├── FRONTEND_API_REFERENCE.MD   # Detailed API documentation
└── README.md            # This file
```

---

## 🧩 Core Components

### Dashboard
**File:** [components/Dashboard.tsx](components/Dashboard.tsx)

The main landing page displaying:
- Overview statistics (actions, policies, queue)
- Recent activity feed
- Quick navigation cards
- Auto-refresh every 5 seconds

### Policies
**File:** [components/Policies.tsx](components/Policies.tsx)

Complete policy management interface:
- Create, read, update, delete policies
- Enable/disable toggles
- Severity-based filtering
- Real-time policy statistics

### Policy Tester
**File:** [components/PolicyTester.tsx](components/PolicyTester.tsx)

Test policies against custom scenarios:
- Input custom metric values
- Evaluate single or multiple policies
- View matching policies and evaluation results
- Support for complex condition testing

### Actions
**File:** [components/Actions.tsx](components/Actions.tsx)

Track and manage remediation actions:
- Filter by status and target
- View detailed action information
- Auto-refresh with configurable intervals
- Status-based color coding

### Metrics Ingestion
**File:** [components/MetricsIngestion.tsx](components/MetricsIngestion.tsx)

Manual metric injection for testing:
- Metric name and value input
- Optional tags (key-value pairs)
- Real-time validation
- Success/error feedback

### Queue Monitor
**File:** [components/QueueMonitor.tsx](components/QueueMonitor.tsx)

Monitor background job processing:
- Queue length and status
- Job statistics
- Health indicators

### Simulator
**File:** [components/Simulator.tsx](components/Simulator.tsx)

Generate test scenarios for policy validation:
- Multiple simulation patterns
- Configurable parameters
- Batch metric generation

---

## 🔌 API Integration

The frontend communicates with the Vigil backend via a REST API. All API calls are centralized in [services/api.ts](services/api.ts).

### Base Configuration

```typescript
const API_BASE = 'http://localhost:8000';
const API_VERSION = '/api/v1';
```

### Available Endpoints

See comprehensive documentation in:
- **[API_QUICK_REFERENCE.MD](API_QUICK_REFERENCE.MD)** - Quick lookup guide
- **[FRONTEND_API_REFERENCE.MD](FRONTEND_API_REFERENCE.MD)** - Detailed integration guide

### Key Services

```typescript
// Health checks
api.checkHealth()
api.getMetrics()

// Metrics
api.ingestMetric(data)

// Policies
api.getPolicies()
api.getPolicy(name)
api.createPolicy(data)
api.updatePolicy(name, data)
api.deletePolicy(name)
api.evaluatePolicy(data)

// Actions
api.getActions(limit, status, target)
api.getAction(id)
api.createAction(data)

// Queue
api.getQueueStats()
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=/api/v1
VITE_REFRESH_INTERVAL=5000
```

### TypeScript Configuration

The project uses strict TypeScript configuration. See [tsconfig.json](tsconfig.json) for details.

### Vite Configuration

Build and development settings are configured in [vite.config.ts](vite.config.ts).

---

## 💻 Development

### Development Mode

```bash
npm run dev
```

Features:
- Hot module replacement (HMR)
- Fast refresh
- Source maps
- Development error overlay

### Type Checking

TypeScript types are automatically checked during development. For manual type checking:

```bash
npx tsc --noEmit
```

### Code Style

The project follows standard React/TypeScript conventions:
- Functional components with hooks
- Named exports for components
- Type-safe API calls
- Modular component structure

### Adding New Components

1. Create component in `components/` directory
2. Add route in [constants.tsx](constants.tsx) if needed
3. Register in [App.tsx](App.tsx) routing
4. Add navigation in [Layout.tsx](components/Layout.tsx)

### Adding New API Endpoints

1. Define types in [types.ts](types.ts)
2. Add API method in [services/api.ts](services/api.ts)
3. Update API documentation files

---

## 🚢 Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in `dist/` with:
- Minified JavaScript and CSS
- Code splitting
- Tree shaking
- Asset optimization

### Static Hosting

The built application can be deployed to any static hosting service:

- **Vercel:** `vercel deploy`
- **Netlify:** Connect repository or drag-and-drop `dist/`
- **GitHub Pages:** Use GitHub Actions workflow
- **AWS S3 + CloudFront:** Upload `dist/` to S3 bucket
- **Docker:** Build container with nginx

### Docker Deployment

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t vigil-frontend .
docker run -p 80:80 vigil-frontend
```

### Environment-Specific Configuration

Use environment variables for different deployments:

```bash
# Production
VITE_API_BASE_URL=https://api.vigil.example.com npm run build

# Staging
VITE_API_BASE_URL=https://api-staging.vigil.example.com npm run build
```

---

## 📚 Documentation

- **[API_QUICK_REFERENCE.MD](API_QUICK_REFERENCE.MD)** - Quick API endpoint reference
- **[FRONTEND_API_REFERENCE.MD](FRONTEND_API_REFERENCE.MD)** - Complete API integration guide
- **[types.ts](types.ts)** - TypeScript type definitions
- **[constants.tsx](constants.tsx)** - Application constants

---

## 🔍 Troubleshooting

### Backend Connection Issues

**Problem:** Cannot connect to backend API

**Solution:**
1. Verify backend is running at `http://localhost:8000`
2. Check `/health` endpoint: `curl http://localhost:8000/health`
3. Review CORS configuration in backend
4. Update `API_BASE` in [services/api.ts](services/api.ts) if needed

### Build Errors

**Problem:** TypeScript compilation errors

**Solution:**
1. Clear node_modules: `rm -rf node_modules`
2. Reinstall dependencies: `npm install`
3. Clear Vite cache: `rm -rf node_modules/.vite`
4. Check TypeScript version compatibility

### Performance Issues

**Problem:** Slow dashboard refresh

**Solution:**
1. Increase refresh interval in component
2. Optimize backend query performance
3. Enable caching in backend
4. Reduce data fetch frequency

### CORS Errors

**Problem:** CORS policy blocking requests

**Solution:**
Configure backend to allow frontend origin:

```python
# FastAPI backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** changes: `git commit -am 'Add new feature'`
4. **Push** to branch: `git push origin feature/your-feature`
5. **Submit** a pull request

### Code Standards

- Follow existing code style
- Add TypeScript types for all functions
- Write descriptive commit messages
- Update documentation for API changes
- Test changes locally before submitting

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check documentation in `/docs`

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Vite**

*Monitoring made simple. Infrastructure that heals itself.*

</div>
