import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarDay, faClock, faMoneyBillWave, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookingSteps from '../../components/client/BookingSteps';
import EmptyState from '../../components/client/EmptyState';
import { gqlRequest } from '../../services/graphql';

export default function ShowtimeSelectPage() {
  const { id } = useParams();
  const [showtimes, setShowtimes] = useState([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    gqlRequest(`query($id:ID!){ showtimesByMovie(id:$id){ id showDate startTime endTime ticketPrice room { name screenType } movie { title posterUrl genre durationMinutes description } } }`, { id }, false)
      .then((d) => {
        setShowtimes(d.showtimesByMovie);
        setDate(d.showtimesByMovie[0]?.showDate || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const dates = useMemo(() => [...new Set(showtimes.map((s) => s.showDate))], [showtimes]);
  const visible = showtimes.filter((s) => !date || s.showDate === date);
  const movie = showtimes[0]?.movie;

  return (
    <>
      <BookingSteps current={2} />
      <Link to="/" className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-pearl/15 bg-brand-black/20 px-4 py-2 text-sm font-bold text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach"><FontAwesomeIcon icon={faArrowLeft} /> Back to movies</Link>

      {loading && <div className="h-72 animate-pulse rounded-lg bg-brand-black/30" />}
      {error && <EmptyState title="Cannot load showtimes" text={error} />}
      {!loading && !error && !movie && <EmptyState title="No showtimes available" text="This movie does not have active schedules yet." />}

      {!loading && !error && movie && (
        <>
          <section className="client-surface mb-6 grid overflow-hidden rounded-[24px] lg:grid-cols-[280px_1fr]">
            <img src={movie.posterUrl} alt={movie.title} className="h-72 w-full object-cover lg:h-full" />
            <div className="p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-studio">Select Showtime</p>
              <h1 className="mt-2 text-3xl font-extrabold text-brand-peach">{movie.title}</h1>
              <p className="mt-2 text-sm font-semibold text-brand-pearl">{movie.genre} · {movie.durationMinutes} min</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-brand-pearl/90">{movie.description}</p>
            </div>
          </section>

          <div className="mb-5 flex flex-wrap gap-2">
            {dates.map((item) => (
              <button key={item} onClick={() => setDate(item)} className={item === date ? 'inline-flex items-center justify-center gap-2 rounded-full bg-brand-studio px-4 py-2.5 text-sm font-semibold text-brand-peach shadow-[0_0_22px_rgba(95,67,178,0.34)] transition hover:bg-brand-studio/80' : 'inline-flex items-center justify-center gap-2 rounded-full border border-brand-pearl/20 bg-brand-black/20 px-4 py-2.5 text-sm font-semibold text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach'}>
                <FontAwesomeIcon icon={faCalendarDay} /> {new Date(`${item}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>

          {visible.length === 0 ? <EmptyState title="No showtimes on this date" text="Pick another date to continue booking." /> : (
            <div className="grid gap-4 md:grid-cols-2">
              {visible.map((s) => (
                <Link key={s.id} to={`/showtimes/${s.id}/seats`} className="client-surface block rounded-[20px] p-5 transition hover:-translate-y-1 hover:border-brand-studio/70 hover:shadow-[0_22px_70px_rgba(95,67,178,0.28)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-brand-peach"><FontAwesomeIcon icon={faClock} className="mr-2 text-brand-studio" />{s.startTime} - {s.endTime}</h2>
                      <p className="mt-3 text-sm font-semibold text-brand-pearl"><FontAwesomeIcon icon={faVideo} className="mr-2 text-brand-studio" />{s.room?.name} · {s.room?.screenType}</p>
                    </div>
                    <span className="rounded-full border border-brand-pearl/15 bg-brand-studio/25 px-3 py-1 text-xs font-bold text-brand-peach">{s.room?.screenType}</span>
                  </div>
                  <p className="mt-5 font-extrabold text-brand-studio"><FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />{Number(s.ticketPrice).toLocaleString()} VND</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
