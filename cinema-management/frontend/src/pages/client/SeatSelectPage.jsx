import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarDay, faClock, faTicket, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookingSteps from '../../components/client/BookingSteps';
import EmptyState from '../../components/client/EmptyState';
import SeatMap from '../../components/common/SeatMap';
import { gqlRequest } from '../../services/graphql';

export default function SeatSelectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    gqlRequest(`query($id:ID!){ showtimeSeats(id:$id){ id status seat { rowLabel seatNumber seatCode } } showtime(id:$id){ id showDate startTime ticketPrice movie { id title genre } room { name screenType } } }`, { id }, false)
      .then((d) => {
        setSeats(d.showtimeSeats);
        setShowtime(d.showtime);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedSeats = seats.filter((s) => selected.includes(String(s.id)));
  const total = useMemo(() => selected.length * Number(showtime?.ticketPrice || 0), [selected, showtime]);
  const availableCount = seats.filter((s) => s.status !== 'booked').length;
  const bookedCount = seats.length - availableCount;
  const toggle = (seatId) => setSelected((prev) => prev.includes(seatId) ? prev.filter((x) => x !== seatId) : [...prev, seatId]);

  const book = async () => {
    if (!selected.length) return;
    setBooking(true);
    setError('');
    try {
      const data = await gqlRequest(`mutation($showtimeId:ID!,$seatIds:[ID!]!,$customerName:String){ bookTickets(showtimeId:$showtimeId,seatIds:$seatIds,customerName:$customerName){ id totalPrice } }`, { showtimeId: id, seatIds: selected, customerName: 'Guest' }, false);
      navigate(`/booking-success/${data.bookTickets.id}`);
    } catch (err) {
      setError(err.message);
      setBooking(false);
    }
  };

  return (
    <>
      <BookingSteps current={3} />
      <Link to={showtime ? `/movies/${showtime.movie?.id || ''}/showtimes` : '/'} className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-pearl/15 bg-brand-black/20 px-4 py-2 text-sm font-bold text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach"><FontAwesomeIcon icon={faArrowLeft} /> Back to showtimes</Link>

      {loading && <div className="h-80 animate-pulse rounded-lg bg-brand-black/30" />}
      {error && !seats.length && <EmptyState title="Cannot load seats" text={error} />}

      {!loading && seats.length > 0 && (
        <>
          <section className="client-surface mb-5 rounded-[20px] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-studio">Seat Selection</p>
            <h1 className="mt-2 text-2xl font-extrabold text-brand-peach">{showtime?.movie?.title}</h1>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-brand-pearl sm:grid-cols-3">
              <span><FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-brand-studio" />{showtime?.showDate}</span>
              <span><FontAwesomeIcon icon={faClock} className="mr-2 text-brand-studio" />{showtime?.startTime}</span>
              <span><FontAwesomeIcon icon={faVideo} className="mr-2 text-brand-studio" />{showtime?.room?.name} · {showtime?.room?.screenType}</span>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="client-surface overflow-x-auto rounded-[20px] p-5">
              <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-brand-pearl">
                <span className="rounded-full bg-brand-pearl/10 px-3 py-1">{availableCount} available</span>
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-pink-100">{bookedCount} booked</span>
              </div>
              <SeatMap seats={seats} selected={selected} onToggle={toggle} />
            </div>
            <aside className="client-surface h-fit rounded-[20px] p-5 lg:sticky lg:top-24">
              <h2 className="font-extrabold text-brand-peach"><FontAwesomeIcon icon={faTicket} className="mr-2 text-brand-studio" />Booking Summary</h2>
              <p className="mt-4 text-sm font-semibold text-brand-pearl">Selected seats</p>
              <div className="mt-2 flex min-h-10 flex-wrap gap-2">
                {selectedSeats.length ? selectedSeats.map((seat) => <span key={seat.id} className="rounded-full bg-brand-studio/30 px-3 py-1 text-sm font-bold text-brand-peach">{seat.seat.seatCode}</span>) : <span className="text-sm text-brand-pearl">Tap available seats to select them.</span>}
              </div>
              <div className="my-5 border-t border-brand-pearl/30 dark:border-white/10" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-brand-pearl">Ticket price</span><strong className="text-brand-peach">{Number(showtime?.ticketPrice || 0).toLocaleString()} VND</strong></div>
                <div className="flex justify-between"><span className="text-brand-pearl">Quantity</span><strong className="text-brand-peach">{selected.length}</strong></div>
              </div>
              <div className="my-5 border-t border-brand-pearl/30 dark:border-white/10" />
              <p className="text-sm font-semibold text-brand-pearl">Total price</p>
              <p className="text-2xl font-extrabold text-brand-studio">{total.toLocaleString()} VND</p>
              {error && <p className="mt-3 rounded bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700">{error}</p>}
              <button disabled={!selected.length || booking} onClick={book} className="client-btn mt-5 w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">{booking ? 'Booking...' : 'Confirm Booking'}</button>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
