import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { MoviesPage } from '@/pages/MoviesPage';
import { MovieDetailsPage } from '@/pages/MovieDetailsPage';
import { SeatSelectionPage } from '@/pages/SeatSelectionPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { TicketPage } from '@/pages/TicketPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ManageMoviesPage } from '@/pages/ManageMoviesPage';
import { ManageShowtimesPage } from '@/pages/ManageShowtimesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ManageBranchesPage } from '@/pages/ManageBranchesPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public / Customer routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailsPage />} />
            <Route path="/booking/:showtimeId" element={<SeatSelectionPage />} />
            <Route path="/checkout/:showtimeId" element={<CheckoutPage />} />
            <Route path="/ticket/:bookingId" element={<TicketPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Cinema Manager routes */}
            <Route
              path="/manage/movies"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ManageMoviesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage/showtimes"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ManageShowtimesPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/branches"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageBranchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
