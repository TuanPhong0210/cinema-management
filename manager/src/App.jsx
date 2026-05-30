import { Route, Routes } from 'react-router-dom';
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ManagerLayout />}>
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

