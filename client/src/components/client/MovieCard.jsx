import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTicket } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <article className="group relative flex flex-col rounded-2xl client-surface p-2.5 transition hover:-translate-y-1 hover:border-brand-studio/70 hover:shadow-[0_15px_40px_rgba(95,67,178,0.14)] dark:hover:shadow-[0_20px_60px_rgba(95,67,178,0.24)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-brand-black/50 shadow-sm">
        <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-80" />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-brand-studio px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">{movie.genre}</span>
      </div>
      <div className="mt-3 flex flex-col flex-grow text-center">
        <h2 className="line-clamp-1 text-sm font-extrabold text-brand-peach" title={movie.title}>{movie.title}</h2>
        <p className="mt-1 text-[11px] font-bold text-brand-pearl">
          <FontAwesomeIcon icon={faClock} className="mr-1 text-brand-studio" />
          {movie.durationMinutes} Phút
        </p>
        <div className="mt-auto pt-3">
          <Link className="client-btn flex w-full py-2 text-xs font-bold uppercase tracking-wider transition hover:scale-[1.02]" to={`/movies/${movie.id}/showtimes`}>
            <FontAwesomeIcon icon={faTicket} /> Đặt vé
          </Link>
        </div>
      </div>
    </article>
  );
}
