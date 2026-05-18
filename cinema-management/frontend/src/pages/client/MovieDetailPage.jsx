import { Navigate, useParams } from 'react-router-dom';

export default function MovieDetailPage() {
  const { id } = useParams();
  return <Navigate to={`/movies/${id}/showtimes`} replace />;
}

