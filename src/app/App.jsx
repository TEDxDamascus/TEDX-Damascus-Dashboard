import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { SnackbarProvider } from 'notistack';
import store from './store/store';
import themeConfig from './configs/themeConfig';
import AuthGuard from './auth/AuthGuard';
import { AuthProvider } from './auth/AuthContext';
import IntlProviderWrapper from './providers/IntlProviderWrapper';
import MainLayout from './theme-layouts/MainLayout/MainLayout';
import AuthLayout from './theme-layouts/AuthLayout/AuthLayout';
import SignInConfig from './main/sign-in/SignInConfig';
import DashboardAppConfig from './main/dashboard/DashboardAppConfig';
import SpeakersAppConfig from './main/speakers-app/SpeakersAppConfig';
import FormsAppConfig from './main/forms-app/FormsAppConfig';
import BlogsAppConfig from './main/blog-app/BlogsAppConfig';
import WallAppConfig from './main/wall-app/WallAppConfig';
import EventsAppConfig from './main/events-app/EventsAppConfig.jsx';
import TeamAppConfig from './main/team-app/teamAppConfig';
import PartnersAppConfig from './main/partners-app/PartnersAppConfig';
import organizersAppConfig from './main/organizers-app/organizersAppConfig.jsx';
import UsersAppConfig from './main/users-app/UsersAppConfig';
import NotFoundPage from './main/not-found/NotFoundPage';
import UnauthorizedPage from './main/unauthorized/UnauthorizedPage';

const ALLOWED_ROLES = ['superadmin', 'admin'];

const protectedConfigs = [
  DashboardAppConfig,
  SpeakersAppConfig,
  FormsAppConfig,
  UsersAppConfig,
  EventsAppConfig,
  BlogsAppConfig,
  WallAppConfig,
  TeamAppConfig,
  PartnersAppConfig,
  organizersAppConfig,
];

function renderRoutes(config, keyPrefix) {
  return config.routes.map((route, index) => (
    <Route key={`${keyPrefix}-${index}`} path={route.path} element={route.element}>
      {route.children?.map((child, childIndex) => (
        <Route key={childIndex} path={child.path} element={child.element} />
      ))}
    </Route>
  ));
}

function App() {
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={themeConfig}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <IntlProviderWrapper>
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <BrowserRouter>
                  <AuthProvider>
                    <Routes>
                      {/* Public routes */}
                      <Route element={<AuthLayout />}>
                        {SignInConfig.routes.map((route, index) => (
                          <Route key={index} path={route.path} element={route.element} />
                        ))}
                      </Route>

                      <Route path="/unauthorized" element={<UnauthorizedPage />} />

                      {/* Protected routes — superadmin and admin only */}
                      <Route
                        element={
                          <AuthGuard allowedRoles={ALLOWED_ROLES}>
                            <MainLayout />
                          </AuthGuard>
                        }
                      >
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        {protectedConfigs.map((config, i) => renderRoutes(config, i))}
                      </Route>

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AuthProvider>
                </BrowserRouter>
              </SnackbarProvider>
            </IntlProviderWrapper>
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
}

export default App;
