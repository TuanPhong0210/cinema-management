import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarDay, faClock, faFilm } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookingSteps from '../../components/client/BookingSteps';
import EmptyState from '../../components/client/EmptyState';
import { gqlRequest } from '../../services/graphql';

export default function ShowtimeSelectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('clientToken');
    if (!token) {
      navigate(`/login?redirect=/movies/${id}/showtimes`);
      return;
    }

    gqlRequest(`query($id:ID!){ showtimesByMovie(id:$id){ id showDate startTime endTime ticketPrice room { name screenType } movie { title posterUrl genre durationMinutes description } } }`, { id }, false)
      .then((d) => {
        setShowtimes(d.showtimesByMovie);
        setDate(d.showtimesByMovie[0]?.showDate || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const dates = useMemo(() => [...new Set(showtimes.map((s) => s.showDate))], [showtimes]);
  const visible = showtimes.filter((s) => !date || s.showDate === date);
  const movie = showtimes[0]?.movie;

  const groupedCinemas = useMemo(() => {
    const groups = {};
    visible.forEach((s) => {
      const roomName = s.room?.name || '';
      let cinemaName = 'Violet Cinema';
      let hallName = roomName;
      if (roomName.includes(' - ')) {
        const parts = roomName.split(' - ');
        cinemaName = parts[0];
        hallName = parts[1];
      }

      if (!groups[cinemaName]) {
        groups[cinemaName] = {};
      }

      const screenType = s.room?.screenType || '2D';
      if (!groups[cinemaName][screenType]) {
        groups[cinemaName][screenType] = [];
      }

      groups[cinemaName][screenType].push({
        ...s,
        hallName
      });
    });
    return groups;
  }, [visible]);

  return (
    <>
      <BookingSteps current={2} />
      <Link to="/" className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-pearl/15 bg-brand-black/20 px-4 py-2 text-sm font-display font-bold text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach"><FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách phim</Link>

      {loading && <div className="h-72 animate-pulse rounded-lg bg-brand-black/30" />}
      {error && <EmptyState title="Cannot load showtimes" text={error} />}
      {!loading && !error && !movie && <EmptyState title="No showtimes available" text="This movie does not have active schedules yet." />}

      {!loading && !error && movie && (
        <>
          <section className="client-surface mb-6 grid overflow-hidden rounded-[24px] lg:grid-cols-[220px_1fr]">
            <div className="relative aspect-[2/3] w-full bg-brand-black/50 shadow-sm">
              <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover animate-fade-in" />
            </div>
            <div className="p-6 flex flex-col justify-center">
              <p className="text-xs font-display font-black uppercase tracking-[0.25em] text-brand-studio mb-1">Đang Chiếu</p>
              <h1 className="text-3xl font-display font-black tracking-wide text-brand-peach leading-tight uppercase">{movie.title}</h1>
              <p className="mt-2 text-xs font-semibold text-brand-pearl bg-brand-studio/10 w-fit px-2.5 py-1 rounded-full">{movie.genre} · {movie.durationMinutes} Phút</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-brand-pearl/90">{movie.description}</p>
            </div>
          </section>

          <div className="mb-6 flex flex-wrap gap-2">
            {dates.map((item) => (
              <button key={item} onClick={() => setDate(item)} className={item === date ? 'inline-flex items-center justify-center gap-2 rounded-full bg-brand-studio px-4 py-2.5 text-sm font-display font-extrabold uppercase tracking-wider text-brand-peach shadow-[0_0_22px_rgba(139,92,246,0.38)] transition hover:bg-brand-studio/80' : 'inline-flex items-center justify-center gap-2 rounded-full border border-brand-pearl/20 bg-brand-black/10 px-4 py-2.5 text-sm font-display font-bold uppercase tracking-wider text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach'}>
                <FontAwesomeIcon icon={faCalendarDay} /> {new Date(`${item}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>

          {Object.keys(groupedCinemas).length === 0 ? (
            <EmptyState title="Không có lịch chiếu vào ngày này" text="Vui lòng chọn ngày khác để tiếp tục đặt vé." />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedCinemas).map(([cinemaName, screens]) => (
                <div key={cinemaName} className="client-surface rounded-2xl p-5 shadow-sm">
                  <h2 className="text-lg font-display font-extrabold tracking-wide text-brand-peach border-b border-brand-pearl/10 pb-3 mb-4 uppercase">
                    <FontAwesomeIcon icon={faFilm} className="mr-2.5 text-brand-studio" />
                    {cinemaName}
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(screens).map(([screenType, list]) => (
                      <div key={screenType} className="grid items-start gap-4 sm:grid-cols-[80px_1fr]">
                        <span className="mt-1 flex w-16 justify-center rounded-md bg-brand-studio/15 border border-brand-studio/20 px-2 py-1 text-[11px] font-display font-black text-brand-studio uppercase tracking-widest">
                          {screenType}
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {list.map((s) => (
                            <Link key={s.id} to={`/showtimes/${s.id}/seats`} className="flex flex-col items-center justify-center rounded-xl border border-brand-pearl/20 hover:border-brand-studio hover:bg-brand-studio/10 px-4 py-2.5 transition text-center min-w-[100px] hover:scale-[1.03]">
                              <strong className="text-sm font-display font-black text-brand-peach">{s.startTime}</strong>
                              <span className="text-[10px] font-display font-bold text-brand-pearl mt-0.5">{(s.ticketPrice / 1000).toFixed(0)}k VND</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
