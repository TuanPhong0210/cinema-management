import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTicket, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import BookingSteps from '../../components/client/BookingSteps';
import EmptyState from '../../components/client/EmptyState';
import MovieCard from '../../components/client/MovieCard';
import { gqlRequest } from '../../services/graphql';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    gqlRequest(`query { activeMovies { id title genre durationMinutes posterUrl description } }`, {}, false)
      .then((d) => setMovies(d.activeMovies))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const genres = useMemo(() => ['All', ...new Set(movies.map((m) => m.genre).filter(Boolean))], [movies]);
  const filtered = useMemo(() => movies.filter((movie) => {
    const matchesGenre = genre === 'All' || movie.genre === genre;
    const text = `${movie.title} ${movie.genre} ${movie.description}`.toLowerCase();
    return matchesGenre && text.includes(search.toLowerCase());
  }), [movies, search, genre]);
  const featured = filtered[0] || movies[0];

  return (
    <>
      <BookingSteps current={1} />
      <section className="relative mb-8 min-h-[460px] overflow-hidden rounded-[28px] border border-brand-pearl/15 bg-brand-black text-brand-peach shadow-[0_34px_100px_rgba(1,1,1,0.34)]">
        {featured?.posterUrl && <img src={featured.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 saturate-150" />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(139,92,246,0.92),rgba(139,92,246,0.2)_18%,transparent_34%),linear-gradient(180deg,rgba(1,1,1,0.4),rgba(33,30,39,0.76)_45%,rgba(1,1,1,0.86))]" />
        <div className="absolute left-1/2 top-28 h-36 w-36 -translate-x-1/2 rounded-full bg-brand-studio/80 blur-2xl" />
        <div className="absolute left-1/2 top-28 grid h-32 w-32 -translate-x-1/2 place-items-center rounded-full border border-brand-pearl/20 bg-brand-studio/45 shadow-[0_0_80px_rgba(139,92,246,0.9)] backdrop-blur-md">
          <FontAwesomeIcon icon={faVideo} className="text-4xl text-brand-peach drop-shadow-[0_0_18px_rgba(254,253,253,0.45)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(rgba(203,195,215,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(203,195,215,0.12)_1px,transparent_1px)] bg-[size:100%_28px,54px_100%] opacity-70 [transform:perspective(420px)_rotateX(58deg)] [transform-origin:bottom]" />
        <div className="relative flex min-h-[460px] flex-col items-center justify-end px-6 pb-12 text-center md:px-10">
          <p className="text-xs font-display font-black uppercase tracking-[0.4em] text-brand-pearl">Now Showing</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-display font-black tracking-widest text-brand-peach drop-shadow-[0_0_18px_rgba(254,253,253,0.18)] uppercase md:text-6xl">Violet Cinema</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-brand-pearl md:text-base">A cinematic booking experience with live seats, glowing screens, and one-step reservations.</p>
          <a href="#movie-grid" className="client-btn mt-7 px-6 py-3 text-sm font-display uppercase tracking-widest"><FontAwesomeIcon icon={faTicket} /> Browse Movies</a>
        </div>
      </section>

      <div className="client-surface mb-8 rounded-[18px] p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-pearl" />
            <input className="w-full rounded-full border border-brand-pearl/20 bg-brand-black/25 px-4 py-3 pl-10 text-sm text-brand-peach outline-none transition placeholder:text-brand-pearl/70 focus:border-brand-studio focus:ring-2 focus:ring-brand-studio/30" placeholder="Search movies, genres, stories" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((item) => <button key={item} onClick={() => setGenre(item)} className={item === genre ? 'inline-flex items-center justify-center rounded-full bg-brand-studio px-4 py-2.5 text-sm font-display font-extrabold uppercase tracking-wider text-brand-peach shadow-[0_0_22px_rgba(139,92,246,0.38)] transition hover:bg-brand-studio/80' : 'inline-flex items-center justify-center rounded-full border border-brand-pearl/20 bg-brand-black/20 px-4 py-2.5 text-sm font-display font-bold uppercase tracking-wider text-brand-pearl transition hover:border-brand-studio hover:text-brand-peach'}>{item}</button>)}
          </div>
        </div>
      </div>

      {loading && <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="aspect-[2/3] animate-pulse rounded-2xl bg-brand-black/20" />)}</div>}
      {error && <EmptyState title="Cannot load movies" text={error} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="No movies match your search" text="Try a different title or genre filter." />}
      {!loading && !error && filtered.length > 0 && (
        <div id="movie-grid" className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </>
  );
}
