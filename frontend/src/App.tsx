import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { MoviesPage } from '@/pages/MoviesPage';
import { MovieDetailsPage } from '@/pages/MovieDetailsPage';
import { SeatSelectionPage } from '@/pages/SeatSelectionPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ETicketPage } from '@/pages/ETicketPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ManageMoviesPage } from '@/pages/ManageMoviesPage';
import { ManageShowtimesPage } from '@/pages/ManageShowtimesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { BranchManagementPage } from '@/pages/BranchManagementPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { NotificationCenterPage } from '@/pages/NotificationCenterPage';
import { AdminNotificationsPage } from '@/pages/AdminNotificationsPage';
import { seedData, syncFromBackend } from '@/data/store';

function App() {
  useEffect(() => {
    seedData();
    syncFromBackend();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage />} />
              <Route path="/booking/:showtimeId" element={<SeatSelectionPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/ticket/:bookingId" element={<ETicketPage />} />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage/movies"
                element={
                  <ProtectedRoute roles={['cinemaManager', 'admin']}>
                    <ManageMoviesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage/showtimes"
                element={
                  <ProtectedRoute roles={['cinemaManager', 'admin']}>
                    <ManageShowtimesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/branches"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <BranchManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationCenterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminNotificationsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
