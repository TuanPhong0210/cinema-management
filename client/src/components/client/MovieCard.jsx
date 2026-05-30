import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTicket } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <article className="group overflow-hidden rounded-[18px] client-surface transition hover:-translate-y-1 hover:border-brand-studio/70 hover:shadow-[0_22px_70px_rgba(95,67,178,0.28)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-black/50">
        <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-80" />
        <span className="absolute left-3 top-3 rounded-full border border-brand-pearl/20 bg-brand-black/55 px-3 py-1 text-xs font-bold text-brand-peach backdrop-blur">{movie.genre}</span>
      </div>
      <div className="p-5">
        <h2 className="line-clamp-1 text-lg font-extrabold text-brand-peach">{movie.title}</h2>
        <p className="mt-1 text-sm font-semibold text-brand-pearl"><FontAwesomeIcon icon={faClock} className="mr-2 text-brand-studio" />{movie.durationMinutes} min</p>
        <p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-brand-pearl/90">{movie.description}</p>
        <Link className="client-btn mt-5 w-full px-4 py-2.5 text-sm" to={`/movies/${movie.id}/showtimes`}><FontAwesomeIcon icon={faTicket} /> Book Ticket</Link>
      </div>
    </article>
  );
}
