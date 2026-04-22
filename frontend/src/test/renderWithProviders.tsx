import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import authReducer, { type AuthState } from '../store/slices/authSlice';
import bookingReducer, {
  initialBookingState,
  type BookingState,
} from '../store/slices/bookingSlice';
import { theme } from '../theme';

export interface RenderOptionsExt extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  preloadedAuth?: Partial<AuthState>;
  preloadedBooking?: Partial<BookingState>;
}

export function renderWithProviders(ui: ReactElement, options: RenderOptionsExt = {}) {
  const { route = '/', preloadedAuth, preloadedBooking, ...rest } = options;

  const defaultAuth: AuthState = { user: null, status: 'succeeded', error: null };
  const authSlice: AuthState = preloadedAuth
    ? { ...defaultAuth, ...preloadedAuth }
    : defaultAuth;
  const bookingSlice: BookingState = preloadedBooking
    ? { ...initialBookingState, ...preloadedBooking }
    : initialBookingState;

  const store: EnhancedStore = configureStore({
    reducer: { auth: authReducer, booking: bookingReducer },
    preloadedState: { auth: authSlice, booking: bookingSlice },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </LocalizationProvider>
        </ThemeProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...rest }) };
}
