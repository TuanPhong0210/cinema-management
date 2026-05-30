import { Route, Routes } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
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
    </Routes>
  );
}

