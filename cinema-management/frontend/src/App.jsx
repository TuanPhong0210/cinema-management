import { Route, Routes } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import ManagerLayout from './layouts/ManagerLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/manager/LoginPage';
import DashboardPage from './pages/manager/DashboardPage';
import MoviesPage from './pages/manager/MoviesPage';
import RoomsPage from './pages/manager/RoomsPage';
import ShowtimesPage from './pages/manager/ShowtimesPage';
import TicketsPage from './pages/manager/TicketsPage';
import EmployeesPage from './pages/manager/EmployeesPage';
import AttendancePage from './pages/manager/AttendancePage';
import HomePage from './pages/client/HomePage';
import MovieDetailPage from './pages/client/MovieDetailPage';
import ShowtimeSelectPage from './pages/client/ShowtimeSelectPage';
import SeatSelectPage from './pages/client/SeatSelectPage';
import BookingSuccessPage from './pages/client/BookingSuccessPage';

export default function App() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/movies/:id/showtimes" element={<ShowtimeSelectPage />} />
        <Route path="/showtimes/:id/seats" element={<SeatSelectPage />} />
        <Route path="/booking-success/:ticketId" element={<BookingSuccessPage />} />
      </Route>
      <Route path="/manager/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="showtimes" element={<ShowtimesPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

