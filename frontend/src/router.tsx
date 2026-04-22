import { Route, Routes } from 'react-router-dom';
import App from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { HomePage } from './features/home/HomePage';
import { AccountPage } from './features/account/AccountPage';
import { PetsListPage } from './features/pets/PetsListPage';
import { PetDetailPage } from './features/pets/PetDetailPage';
import { AppointmentsPage } from './features/appointments/AppointmentsPage';
import { BookingPage } from './features/booking/BookingPage';

function NotFoundStub() {
  return (
    <section>
      <h1 tabIndex={-1}>Page not found</h1>
      <p>The page you were looking for doesn&rsquo;t exist.</p>
    </section>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="account" element={<AccountPage />} />
          <Route path="pets" element={<PetsListPage />} />
          <Route path="pets/:id" element={<PetDetailPage />} />
          <Route path="book" element={<BookingPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
        </Route>
        <Route path="*" element={<NotFoundStub />} />
      </Route>
    </Routes>
  );
}
