# TEDx Damascus Dashboard

dashboard application for managing TEDx Damascus events, speakers, and content. Built with React 19, Redux Toolkit, and Material-UI.

![TEDx Damascus](public/images/tedx-logo.jpg)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:3000`

### Default Credentials
- **Email:** admin@tedxdamascus.com
- **Password:** password

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Architecture](#architecture)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## 🎯 Overview

The TEDx Damascus Dashboard is a comprehensive content management system designed to help TEDx Damascus organizers manage their events, speakers, talks, and attendees. The application features a modern, intuitive interface with full CRUD operations, real-time updates, and responsive design.

### Key Highlights

- ✅ **React 19** - Latest React version with improved performance
- ✅ **Redux Toolkit** - Simplified state management with RTK Query
- ✅ **Material-UI v6** - Modern, accessible component library
- ✅ **Vite** - Lightning-fast development and build tool
- ✅ **TypeScript-ready** - Full support for TypeScript (via JSDoc)
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Mock API** - Development-ready with axios-mock-adapter
- ✅ **Form Validation** - React Hook Form + Zod schema validation
- ✅ **TEDx Branding** - Custom theme with TEDx Damascus colors

---

## 🛠️ Technology Stack

### Core Framework
- **[React 19.0.0](https://react.dev/)** - UI library with improved rendering and hooks
- **[React DOM 19.0.0](https://react.dev/)** - DOM rendering for React
- **[Vite 6.0.7](https://vitejs.dev/)** - Next-generation frontend build tool

### State Management
- **[@reduxjs/toolkit 2.5.0](https://redux-toolkit.js.org/)** - Official Redux toolset
- **[react-redux 9.2.0](https://react-redux.js.org/)** - React bindings for Redux
- **[RTK Query](https://redux-toolkit.js.org/rtk-query/overview)** - Data fetching and caching (included in @reduxjs/toolkit)

### Routing
- **[react-router-dom 7.1.1](https://reactrouter.com/)** - Declarative routing for React

### UI Components & Styling
- **[@mui/material 6.3.0](https://mui.com/)** - Material Design component library
- **[@mui/icons-material 6.3.0](https://mui.com/material-ui/material-icons/)** - Material Design icons
- **[@emotion/react 11.14.0](https://emotion.sh/)** - CSS-in-JS library
- **[@emotion/styled 11.14.0](https://emotion.sh/)** - Styled components for Emotion
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[material-react-table 3.0.0](https://www.material-react-table.com/)** - Advanced data tables
- **[framer-motion 11.15.0](https://www.framer.com/motion/)** - Animation library
- **[notistack 3.0.1](https://notistack.com/)** - Notification/snackbar library

### Form Management
- **[react-hook-form 7.54.2](https://react-hook-form.com/)** - Performant form library
- **[@hookform/resolvers 3.9.1](https://github.com/react-hook-form/resolvers)** - Form validation resolvers
- **[zod 3.24.1](https://zod.dev/)** - TypeScript-first schema validation

### HTTP & API
- **[axios 1.7.9](https://axios-http.com/)** - HTTP client
- **[axios-mock-adapter 1.22.0](https://github.com/ctimmerm/axios-mock-adapter)** - Mock API for development

### Utilities
- **[lodash 4.17.21](https://lodash.com/)** - Utility library
- **[date-fns 4.1.0](https://date-fns.org/)** - Modern date utility library
- **[clsx 2.1.1](https://github.com/lukeed/clsx)** - Utility for constructing className strings

### Development Tools
- **[ESLint 9.18.0](https://eslint.org/)** - JavaScript linter
- **[PostCSS 8.4.49](https://postcss.org/)** - CSS transformation tool
- **[Autoprefixer 10.4.20](https://github.com/postcss/autoprefixer)** - PostCSS plugin for vendor prefixes
- **[vite-jsconfig-paths 2.0.1](https://github.com/aleclarson/vite-jsconfig-paths)** - Support for jsconfig path mapping

---

## 📁 Project Structure

```
dashboard/
├── public/                      # Static assets
│   └── images/                  # Images (logos, backgrounds)
│       ├── tedx-logo.jpg
│       └── login-background.jpg
├── src/
│   ├── @mock-api/              # Mock API setup
│   │   └── index.js            # Mock endpoints (speakers CRUD)
│   ├── app/
│   │   ├── auth/               # Authentication module
│   │   │   ├── AuthContext.jsx      # Auth context provider
│   │   │   ├── AuthGuard.jsx        # Protected route guard
│   │   │   └── store/
│   │   │       └── userSlice.js     # User state slice
│   │   ├── configs/            # Application configuration
│   │   │   ├── navigationConfig.js  # Sidebar navigation
│   │   │   ├── routesConfig.jsx     # Route definitions
│   │   │   └── themeConfig.js       # MUI theme configuration
│   │   ├── main/               # Feature modules
│   │   │   ├── dashboard/           # Dashboard overview
│   │   │   │   ├── DashboardAppConfig.jsx
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── sign-in/             # Login page
│   │   │   │   ├── SignInConfig.jsx
│   │   │   │   └── SignInPage.jsx
│   │   │   └── speakers-app/        # Speakers management
│   │   │       ├── SpeakersAppConfig.jsx
│   │   │       ├── SpeakersApi.js   # RTK Query API
│   │   │       ├── speakers-list/
│   │   │       │   ├── SpeakersList.jsx
│   │   │       │   ├── SpeakersListHeader.jsx
│   │   │       │   └── SpeakersListTable.jsx
│   │   │       └── speaker-detail/
│   │   │           ├── Speaker.jsx
│   │   │           ├── SpeakerHeader.jsx
│   │   │           ├── models/
│   │   │           │   └── SpeakerModel.js
│   │   │           └── tabs/
│   │   │               ├── BasicInfoTab.jsx
│   │   │               └── SocialLinksTab.jsx
│   │   ├── shared-components/  # Reusable components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── PageLayout.jsx
│   │   ├── store/              # Redux store
│   │   │   ├── store.js        # Store configuration
│   │   │   ├── apiService.js   # RTK Query base API
│   │   │   └── index.js        # Store exports
│   │   ├── theme-layouts/      # Layout components
│   │   │   ├── AuthLayout/
│   │   │   │   └── AuthLayout.jsx
│   │   │   └── MainLayout/
│   │   │       ├── MainLayout.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Header.jsx
│   │   └── App.jsx             # Root component
│   ├── styles/                 # Global styles
│   │   └── index.css
│   ├── utils/                  # Utility functions
│   │   └── helpers.js
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global CSS + Tailwind
├── .env                        # Environment variables
├── .env.example                # Example environment file
├── .eslintrc.cjs               # ESLint configuration
├── index.html                  # HTML entry point
├── jsconfig.json               # Path aliases configuration
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

---

## ✨ Features

### 1. **Dashboard Overview**
- Statistics cards showing key metrics (speakers, events, talks, attendees)
- Quick action buttons
- Recent activity feed (placeholder)

### 2. **Speakers Management**
Complete CRUD operations for speaker management:

#### List View
- Sortable, searchable data table with Material React Table
- Filterable columns
- Pagination support
- Row actions (view, edit, delete)
- Avatar/image display
- Featured/Active status badges

#### Detail View
- **Basic Information Tab**
  - Full name, email, phone
  - Title, company/organization
  - Biography (multi-line)
  - Image URL
  - Featured speaker toggle
  - Active status toggle

- **Social Links Tab**
  - LinkedIn profile
  - Twitter/X profile
  - Facebook profile
  - Personal website

#### Features
- Form validation with Zod schemas
- Real-time error messages
- Optimistic UI updates
- Automatic cache invalidation

### 3. **Authentication**
- Mock authentication system
- Token-based auth (localStorage)
- Protected routes with AuthGuard
- Auto-redirect for unauthenticated users
- Session persistence
- Modern split-screen login page

### 4. **Responsive Design**
- Mobile-first approach
- Collapsible sidebar
- Responsive tables
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### 5. **Theme & Branding**
- TEDx Damascus color scheme (#EB0028 primary red)
- Custom Material-UI theme
- Dark sidebar with light content area
- Consistent spacing and typography

---

## 🏗️ Architecture

### State Management Pattern

The application uses **Redux Toolkit** with **RTK Query** for all state management:

```
┌─────────────────┐
│   Components    │
└────────┬────────┘
         │
         ├─────────────┐
         │             │
    ┌────▼────┐   ┌───▼──────┐
    │  Redux  │   │   RTK    │
    │  Store  │   │  Query   │
    └────┬────┘   └───┬──────┘
         │            │
         └──────┬─────┘
                │
         ┌──────▼──────┐
         │ API Service │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │   Axios     │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │  Mock API   │
         │  (Dev Mode) │
         └─────────────┘
```

### Routing Structure

```
/ (redirect to /dashboard)
├── /sign-in (public)
└── Protected Routes
    ├── /dashboard
    ├── /speakers
    │   ├── / (list)
    │   └── /:speakerId (detail/edit)
    ├── /events (placeholder)
    └── /settings (placeholder)
```

### Component Patterns

1. **Feature-based organization** - Each feature has its own folder with all related components
2. **Config-based routing** - Route configurations are separate from components
3. **Smart/Dumb components** - Container components handle logic, presentational components handle UI
4. **Custom hooks** - Reusable logic extracted into custom hooks (e.g., useAuth)
5. **Model pattern** - Data models define default structures for entities

---

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint to check code quality
```

---

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=/api
VITE_APP_NAME=TEDx Damascus Dashboard
```

### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for API endpoints | `/api` |
| `VITE_APP_NAME` | Application name | `TEDx Damascus Dashboard` |

**Note:** All environment variables must be prefixed with `VITE_` to be exposed to the application.

---

## 🔧 Configuration

### Path Aliases

The project uses path aliases for cleaner imports:

```javascript
import { store } from 'app/store';
import LoadingSpinner from 'app/shared-components/LoadingSpinner';
import apiService from '@mock-api';
```

Defined in `jsconfig.json`:
- `@/*` → `./src/*`
- `app/store` → `./src/app/store`
- `app/shared-components` → `./src/app/shared-components`
- `app/configs` → `./src/app/configs`
- `@mock-api/*` → `./src/@mock-api/*`

### Tailwind Custom Colors

```css
.text-tedx-red { color: #EB0028; }
.bg-tedx-red { background-color: #EB0028; }
.text-tedx-dark { color: #1a1a1a; }
.bg-tedx-dark { background-color: #1a1a1a; }
```

---

## 🔌 API Integration

### Mock API (Development)

The application includes a complete mock API using `axios-mock-adapter`. This allows development without a backend:

**Speakers Endpoints:**
- `GET /api/speakers` - Get paginated speakers list
- `GET /api/speakers/:id` - Get single speaker
- `POST /api/speakers` - Create new speaker
- `PATCH /api/speakers/:id` - Update speaker
- `DELETE /api/speakers/:id` - Delete speaker

### Switching to Real API

1. Update `VITE_API_URL` in `.env`
2. Remove mock API import from `src/main.jsx`:
   ```javascript
   // Remove this line:
   import '@mock-api';
   ```
3. Configure authentication headers in `apiService.js`
4. Update endpoints in feature API files as needed

---

## 🎨 Customization

### Theme Customization

Edit `src/app/configs/themeConfig.js`:

```javascript
const themeConfig = createTheme({
  palette: {
    primary: {
      main: '#EB0028',  // TEDx red
      // ... customize colors
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // ... customize typography
  }
});
```

### Adding New Features

1. Create feature folder in `src/app/main/`
2. Create feature config file (e.g., `MyFeatureConfig.jsx`)
3. Add routes to feature config
4. Create RTK Query API file if needed
5. Import config in `routesConfig.jsx`
6. Add navigation item to `navigationConfig.js`

---

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deployment Options

The application can be deployed to:
- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **AWS S3 + CloudFront** - AWS static hosting
- **Docker** - Containerized deployment
- **Traditional hosting** - Any static file server

### Environment-Specific Builds

Create multiple `.env` files:
- `.env.development`
- `.env.production`
- `.env.staging`

Vite automatically loads the appropriate file based on the mode.

---

## 🤝 Contributing

### Code Style
- Use ESLint configuration provided
- Follow React best practices
- Use functional components and hooks
- Keep components small and focused
- Write meaningful commit messages

### Pull Request Process
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit PR with clear description

---

## 📄 License

This project is proprietary and confidential. All rights reserved by TEDx Damascus.

---

## 🆘 Support

For issues, questions, or contributions:
- Create an issue in the repository
- Contact the development team
- Check existing documentation

---

## 🔄 Changelog

### Version 1.0.0 (2026-01-27)
- ✅ Initial release
- ✅ React 19 upgrade
- ✅ Complete speakers management CRUD
- ✅ Authentication system
- ✅ Dashboard overview
- ✅ Responsive design
- ✅ Mock API integration
- ✅ Material-UI v6 + Tailwind CSS
- ✅ Redux Toolkit + RTK Query
- ✅ Modern split-screen login page

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for the TEDx Damascus community.

**TEDx Damascus** - Ideas Worth Spreading

---

Made with ❤️ for TEDx Damascus

```


```
TEDX-Damascus-Dashboard
├─ .eslintrc.cjs
├─ .idea
│  ├─ codeStyles
│  │  ├─ codeStyleConfig.xml
│  │  └─ Project.xml
│  ├─ dashboard.iml
│  ├─ inspectionProfiles
│  │  └─ Project_Default.xml
│  ├─ modules.xml
│  ├─ prettier.xml
│  └─ vcs.xml
├─ .prettierignore
├─ .prettierrc
├─ eslint.config.js
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ images
│  │  ├─ login-background.jpg
│  │  └─ tedx-logo.jpg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ @mock-api
│  │  └─ index.js
│  ├─ app
│  │  ├─ App.jsx
│  │  ├─ auth
│  │  │  ├─ AuthContext.jsx
│  │  │  ├─ AuthGuard.jsx
│  │  │  ├─ PermissionGate.jsx
│  │  │  └─ store
│  │  │     └─ userSlice.js
│  │  ├─ configs
│  │  │  ├─ navigationConfig.js
│  │  │  ├─ routesConfig.jsx
│  │  │  └─ themeConfig.js
│  │  ├─ main
│  │  │  ├─ analytics-app
│  │  │  │  └─ AnalyticsApi.js
│  │  │  ├─ blog-app
│  │  │  │  ├─ blog-categories
│  │  │  │  │  ├─ BlogCategoriesApi.js
│  │  │  │  │  ├─ BlogCategoriesList.jsx
│  │  │  │  │  └─ BlogCategory.jsx
│  │  │  │  ├─ blog-detail
│  │  │  │  │  ├─ Blog.jsx
│  │  │  │  │  ├─ blogAuthorUtils.js
│  │  │  │  │  ├─ blogFontUtils.js
│  │  │  │  │  ├─ blogMapper.js
│  │  │  │  │  ├─ BlogView.jsx
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ BlogModel.js
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ AuthorSection.jsx
│  │  │  │  │     └─ BlogContentSeoTab.jsx
│  │  │  │  ├─ blogs-list
│  │  │  │  │  └─ BlogsList.jsx
│  │  │  │  ├─ BlogsApi.js
│  │  │  │  └─ BlogsAppConfig.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ DashboardAppConfig.jsx
│  │  │  │  └─ DashboardPage.jsx
│  │  │  ├─ events-app
│  │  │  │  ├─ events-detail
│  │  │  │  │  ├─ Event.jsx
│  │  │  │  │  ├─ EventHeader.jsx
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ events-model.js
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ events-list
│  │  │  │  │  ├─ EventsList.jsx
│  │  │  │  │  ├─ EventsListHeader.jsx
│  │  │  │  │  └─ EventsListTable.jsx
│  │  │  │  ├─ EventsApi.js
│  │  │  │  └─ EventsAppConfig.jsx
│  │  │  ├─ forms-app
│  │  │  │  ├─ form-submissions
│  │  │  │  │  ├─ FormSubmissionDetail.jsx
│  │  │  │  │  └─ FormSubmissions.jsx
│  │  │  │  ├─ forms-list
│  │  │  │  │  ├─ FormsList.jsx
│  │  │  │  │  ├─ FormsListHeader.jsx
│  │  │  │  │  └─ FormsListTable.jsx
│  │  │  │  ├─ FormsApi.js
│  │  │  │  └─ FormsAppConfig.jsx
│  │  │  ├─ home-settings-app
│  │  │  │  ├─ home-settings
│  │  │  │  │  └─ HomeSettingsPage.jsx
│  │  │  │  └─ HomeSettingsApi.js
│  │  │  ├─ not-found
│  │  │  │  └─ NotFoundPage.jsx
│  │  │  ├─ organizers-app
│  │  │  │  ├─ organizer-detail
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ organizerModel.js
│  │  │  │  │  ├─ organizer.jsx
│  │  │  │  │  ├─ organizerHeader.jsx
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ organizers-list
│  │  │  │  │  ├─ organizersList.jsx
│  │  │  │  │  ├─ organizersListHeader.jsx
│  │  │  │  │  └─ organizersListTable.jsx
│  │  │  │  ├─ organizersApi.js
│  │  │  │  └─ organizersAppConfig.jsx
│  │  │  ├─ partners-app
│  │  │  │  ├─ customTiersSlice.js
│  │  │  │  ├─ partners-details
│  │  │  │  │  ├─ components
│  │  │  │  │  │  ├─ CustomTierField.jsx
│  │  │  │  │  │  └─ TierSizePicker.jsx
│  │  │  │  │  ├─ models
│  │  │  │  │  │  ├─ PartnerModel.js
│  │  │  │  │  │  └─ partnerTiers.js
│  │  │  │  │  ├─ Partner.jsx
│  │  │  │  │  ├─ PartnerHeader.jsx
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     ├─ ServicesTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ partners-list
│  │  │  │  │  ├─ PartnersList.jsx
│  │  │  │  │  ├─ PartnersListHeader.jsx
│  │  │  │  │  └─ PartnersListTable.jsx
│  │  │  │  ├─ PartnersApi.js
│  │  │  │  └─ PartnersAppConfig.jsx
│  │  │  ├─ sign-in
│  │  │  │  ├─ SignInConfig.jsx
│  │  │  │  └─ SignInPage.jsx
│  │  │  ├─ speakers-app
│  │  │  │  ├─ speaker-detail
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ SpeakerModel.js
│  │  │  │  │  ├─ Speaker.jsx
│  │  │  │  │  ├─ SpeakerHeader.jsx
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ speakers-list
│  │  │  │  │  ├─ SpeakersList.jsx
│  │  │  │  │  ├─ SpeakersListHeader.jsx
│  │  │  │  │  └─ SpeakersListTable.jsx
│  │  │  │  ├─ SpeakersApi.js
│  │  │  │  └─ SpeakersAppConfig.jsx
│  │  │  ├─ storage
│  │  │  │  └─ StorageApi.js
│  │  │  ├─ team-app
│  │  │  │  ├─ team-details
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ TeamMemberModel.js
│  │  │  │  │  ├─ tabs
│  │  │  │  │  │  ├─ BasicInfoTab.jsx
│  │  │  │  │  │  └─ SocialLinksTab.jsx
│  │  │  │  │  └─ TeamMember.jsx
│  │  │  │  ├─ team-list
│  │  │  │  │  ├─ TeamList.jsx
│  │  │  │  │  ├─ TeamListHeader.jsx
│  │  │  │  │  └─ TeamListTable.jsx
│  │  │  │  ├─ teamApi.js
│  │  │  │  └─ teamAppConfig.jsx
│  │  │  ├─ unauthorized
│  │  │  │  └─ UnauthorizedPage.jsx
│  │  │  ├─ users-app
│  │  │  │  ├─ user-detail
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ UserModel.js
│  │  │  │  │  ├─ tabs
│  │  │  │  │  │  └─ BasicInfoTab.jsx
│  │  │  │  │  └─ User.jsx
│  │  │  │  ├─ users-list
│  │  │  │  │  ├─ UsersList.jsx
│  │  │  │  │  ├─ UsersListHeader.jsx
│  │  │  │  │  └─ UsersListTable.jsx
│  │  │  │  ├─ UsersApi.js
│  │  │  │  └─ UsersAppConfig.jsx
│  │  │  └─ wall-app
│  │  │     ├─ banned-words
│  │  │     │  └─ BannedWordsPage.jsx
│  │  │     ├─ wall-question
│  │  │     │  └─ WallQuestion.jsx
│  │  │     ├─ WallApi.js
│  │  │     ├─ WallAppConfig.jsx
│  │  │     └─ walls-list
│  │  │        ├─ WallList.jsx
│  │  │        ├─ WallListHeader.jsx
│  │  │        └─ WallListTable.jsx
│  │  ├─ providers
│  │  │  └─ IntlProviderWrapper.jsx
│  │  ├─ services
│  │  │  ├─ authService.js
│  │  │  ├─ axiosInstance.js
│  │  │  └─ tokenService.js
│  │  ├─ shared-components
│  │  │  ├─ breadcrumb
│  │  │  │  ├─ Breadcrumb.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ confirm-modal
│  │  │  │  ├─ ConfirmModal.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ custom-autocomplete
│  │  │  │  ├─ autocompleteSlice.js
│  │  │  │  ├─ autocompleteUtils.js
│  │  │  │  ├─ CustomAutocomplete.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ custom-table
│  │  │  │  ├─ CustomTable.jsx
│  │  │  │  ├─ index.js
│  │  │  │  ├─ tableSlice.js
│  │  │  │  └─ useTableState.js
│  │  │  ├─ Dialog
│  │  │  │  ├─ Dialog.jsx
│  │  │  │  └─ DialogProvider.jsx
│  │  │  ├─ filter-icon
│  │  │  │  └─ FilterIcon.jsx
│  │  │  ├─ image-picker
│  │  │  │  ├─ ImagePickerDialog.jsx
│  │  │  │  ├─ ImagePickerField.jsx
│  │  │  │  ├─ index.js
│  │  │  │  └─ mediaRefUtils.js
│  │  │  ├─ loading-spinner
│  │  │  │  ├─ index.js
│  │  │  │  └─ LoadingSpinner.jsx
│  │  │  ├─ locale-input
│  │  │  │  ├─ index.js
│  │  │  │  ├─ LocaleInput.jsx
│  │  │  │  ├─ translations.js
│  │  │  │  └─ utils.js
│  │  │  ├─ locale-switcher
│  │  │  │  ├─ index.js
│  │  │  │  └─ LocaleSwitcher.jsx
│  │  │  ├─ page-layout
│  │  │  │  ├─ index.js
│  │  │  │  └─ PageLayout.jsx
│  │  │  ├─ rich-text-editor
│  │  │  │  ├─ fontFamilies.js
│  │  │  │  ├─ FontSize.js
│  │  │  │  ├─ imageAlignPlugin.js
│  │  │  │  ├─ imageAlignUtils.js
│  │  │  │  ├─ imageNodeUtils.js
│  │  │  │  ├─ ImageToolbar.jsx
│  │  │  │  ├─ index.js
│  │  │  │  ├─ ResizableImage.js
│  │  │  │  ├─ RichTextContent.jsx
│  │  │  │  ├─ RichTextEditor.jsx
│  │  │  │  ├─ ToolbarTooltip.jsx
│  │  │  │  ├─ UrlInputDialog.jsx
│  │  │  │  └─ urlUtils.js
│  │  │  ├─ status-badge
│  │  │  │  ├─ index.js
│  │  │  │  └─ StatusBadge.jsx
│  │  │  └─ wysiwyg-editor
│  │  │     └─ WYSIWYGEditor.jsx
│  │  ├─ store
│  │  │  ├─ apiService.js
│  │  │  ├─ index.js
│  │  │  ├─ localeSlice.js
│  │  │  └─ store.js
│  │  └─ theme-layouts
│  │     ├─ AuthLayout
│  │     │  └─ AuthLayout.jsx
│  │     └─ MainLayout
│  │        ├─ Header.jsx
│  │        ├─ MainLayout.jsx
│  │        └─ Sidebar.jsx
│  ├─ assets
│  │  └─ img
│  │     └─ no-section.png
│  ├─ index.css
│  ├─ locales
│  │  ├─ ar.js
│  │  ├─ en.js
│  │  └─ index.js
│  ├─ main.jsx
│  ├─ styles
│  │  └─ index.css
│  └─ utils
│     └─ helpers.js
├─ tailwind.config.js
├─ vercel.json
└─ vite.config.js

```