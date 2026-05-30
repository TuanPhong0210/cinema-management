import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCalendarDay,
  faClock,
  faTicket,
  faVideo,
  faPlus,
  faMinus,
  faShieldHalved,
  faCartShopping,
  faCreditCard,
  faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookingSteps from '../../components/client/BookingSteps';
import EmptyState from '../../components/client/EmptyState';
import SeatMap from '../../components/common/SeatMap';
import { gqlRequest } from '../../services/graphql';

const combosData = [
  { id: 'combo-my', name: 'My Combo', description: '1x Bắp rang bơ ngọt lớn + 1x Nước ngọt Coke lớn', price: 115000, icon: '🍿🥤' },
  { id: 'combo-cheese', name: 'Cheese Combo', description: '1x Bắp rang phô mai lớn + 1x Nước ngọt Coke lớn', price: 125000, icon: '🧀🍿🥤' },
  { id: 'combo-caramel', name: 'Caramel Combo', description: '1x Bắp rang Caramel lớn + 1x Nước ngọt Pepsi lớn', price: 125000, icon: '🍯🍿🥤' },
  { id: 'combo-couple', name: 'Couple Combo', description: '1x Bắp rang lớn (tự chọn vị) + 2x Nước ngọt tự chọn', price: 165000, icon: '🍿🥤🥤' },
  { id: 'combo-family', name: 'Family Combo', description: '2x Bắp lớn tự chọn vị + 4x Nước ngọt lớn', price: 295000, icon: '🍿🍿🥤🥤🥤' }
];

export default function SeatSelectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // App views: 'seats' | 'combos' | 'payment'
  const [view, setView] = useState('seats');
  
  const [seats, setSeats] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // Combos quantities
  const [combos, setCombos] = useState({
    'combo-my': 0,
    'combo-cheese': 0,
    'combo-caramel': 0,
    'combo-couple': 0,
    'combo-family': 0
  });

  // Selected Payment Method
  const [paymentMethod, setPaymentMethod] = useState('momo');

  useEffect(() => {
    gqlRequest(`query($id:ID!){ showtimeSeats(id:$id){ id status seat { rowLabel seatNumber seatCode } } showtime(id:$id){ id showDate startTime ticketPrice movie { id title genre posterUrl durationMinutes description } room { name screenType } } }`, { id }, false)
      .then((d) => {
        setSeats(d.showtimeSeats);
        setShowtime(d.showtime);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedSeats = seats.filter((s) => selected.includes(String(s.id)));
  
  // Cost calculations
  const ticketCost = useMemo(() => selected.length * Number(showtime?.ticketPrice || 0), [selected, showtime]);
  
  const comboCost = useMemo(() => {
    return Object.entries(combos).reduce((sum, [cId, qty]) => {
      const price = combosData.find((c) => c.id === cId)?.price || 0;
      return sum + qty * price;
    }, 0);
  }, [combos]);

  const total = useMemo(() => ticketCost + comboCost, [ticketCost, comboCost]);
  const availableCount = seats.filter((s) => s.status !== 'booked').length;
  const bookedCount = seats.length - availableCount;

  const toggleSeat = (seatId) => {
    setSelected((prev) => prev.includes(seatId) ? prev.filter((x) => x !== seatId) : [...prev, seatId]);
  };

  const changeComboQty = (comboId, delta) => {
    setCombos((prev) => ({
      ...prev,
      [comboId]: Math.max(0, prev[comboId] + delta)
    }));
  };

  const formattedDate = useMemo(() => {
    if (!showtime?.showDate) return '';
    try {
      const dateObj = new Date(`${showtime.showDate}T00:00:00`);
      return dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });
    } catch {
      return showtime.showDate;
    }
  }, [showtime]);

  const parsedTheater = useMemo(() => {
    if (!showtime?.room?.name) return { cinemaName: 'Violet Cinema', hallName: '' };
    const name = showtime.room.name;
    if (name.includes(' - ')) {
      const parts = name.split(' - ');
      return { cinemaName: parts[0], hallName: parts[1] };
    }
    return { cinemaName: 'Violet Cinema', hallName: name };
  }, [showtime]);

  // Execute Ticket Booking
  const handlePaymentSubmit = async () => {
    if (!selected.length) return;
    setBooking(true);
    setError('');
    try {
      // Execute the book mutation
      const data = await gqlRequest(
        `mutation($showtimeId:ID!,$seatIds:[ID!]!,$customerName:String){ bookTickets(showtimeId:$showtimeId,seatIds:$seatIds,customerName:$customerName){ id totalPrice } }`,
        { showtimeId: id, seatIds: selected, customerName: 'Guest' },
        false
      );
      navigate(`/booking-success/${data.bookTickets.id}`);
    } catch (err) {
      setError(err.message);
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="h-80 animate-pulse rounded-lg bg-brand-black/20" />;
  }

  if (error && !seats.length) {
    return <EmptyState title="Cannot load seats" text={error} />;
  }

  return (
    <>
      {/* Dynamic Booking Steps Indicator */}
      <BookingSteps current={view === 'seats' ? 3 : view === 'combos' ? 3 : 4} />

      {/* VIEW 1: SEAT SELECTION */}
      {view === 'seats' && (
        <>
          <Link
            to={showtime ? `/movies/${showtime.movie?.id || ''}/showtimes` : '/'}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-pearl/15 bg-brand-black/20 px-4 py-2 text-sm font-bold text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại lịch chiếu
          </Link>

          <section className="client-surface mb-5 rounded-[20px] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-studio">Chọn Ghế</p>
            <h1 className="mt-1 text-2xl font-extrabold text-brand-peach leading-tight">{showtime?.movie?.title}</h1>
            <div className="mt-4 grid gap-3 text-xs font-bold text-brand-pearl sm:grid-cols-3">
              <span><FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-brand-studio" />{formattedDate}</span>
              <span><FontAwesomeIcon icon={faClock} className="mr-2 text-brand-studio" />{showtime?.startTime}</span>
              <span><FontAwesomeIcon icon={faVideo} className="mr-2 text-brand-studio" />{parsedTheater.cinemaName} · {parsedTheater.hallName}</span>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="client-surface overflow-x-auto rounded-[20px] p-6 flex flex-col items-center">
              <div className="mb-6 flex gap-4 text-xs font-extrabold text-brand-pearl">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-pearl/20 border border-brand-pearl/30" /> Trống ({availableCount})</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-pink-500/30 border border-pink-500/50" /> Đã đặt ({bookedCount})</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-studio shadow-[0_0_8px_rgba(95,67,178,0.7)]" /> Bạn chọn ({selected.length})</span>
              </div>
              <div className="w-full min-w-[500px]">
                <SeatMap seats={seats} selected={selected} onToggle={toggleSeat} />
              </div>
            </div>
            
            <aside className="client-surface h-fit rounded-[20px] p-5 lg:sticky lg:top-24">
              <h2 className="font-extrabold text-brand-peach border-b border-brand-pearl/10 pb-3 mb-4">
                <FontAwesomeIcon icon={faTicket} className="mr-2 text-brand-studio" />
                Tóm Tắt Đặt Vé
              </h2>
              <p className="text-xs font-bold text-brand-pearl uppercase tracking-wider">Ghế đã chọn</p>
              <div className="mt-2 flex min-h-[40px] flex-wrap gap-2">
                {selectedSeats.length ? (
                  selectedSeats.map((seat) => (
                    <span key={seat.id} className="rounded-md bg-brand-studio px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
                      {seat.seat.seatCode}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-brand-pearl/70 italic">Vui lòng nhấp chọn ghế trên bản đồ để tiếp tục.</span>
                )}
              </div>
              <div className="my-5 border-t border-brand-pearl/10" />
              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between"><span className="text-brand-pearl">Đơn giá vé</span><strong className="text-brand-peach">{Number(showtime?.ticketPrice || 0).toLocaleString()}đ</strong></div>
                <div className="flex justify-between"><span className="text-brand-pearl">Số lượng ghế</span><strong className="text-brand-peach">{selected.length}</strong></div>
              </div>
              <div className="my-5 border-t border-brand-pearl/10" />
              <p className="text-xs font-bold text-brand-pearl uppercase tracking-wider">Tạm tính</p>
              <p className="text-2xl font-extrabold text-brand-studio mt-1">{ticketCost.toLocaleString()}đ</p>
              <button
                disabled={!selected.length}
                onClick={() => setView('combos')}
                className="client-btn mt-5 w-full py-3.5 text-xs uppercase tracking-wider font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Chọn Bắp & Nước
              </button>
            </aside>
          </div>
        </>
      )}

      {/* VIEW 2: POPCORN & DRINKS COMBO SELECTION */}
      {view === 'combos' && (
        <>
          <button
            onClick={() => setView('seats')}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-pearl/15 bg-brand-black/20 px-4 py-2 text-sm font-bold text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại chọn ghế
          </button>

          <section className="client-surface mb-5 rounded-[20px] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-studio">Chọn Combo</p>
            <h1 className="mt-1 text-2xl font-extrabold text-brand-peach">Bắp & Nước Ngon</h1>
            <p className="mt-1 text-xs text-brand-pearl">Ưu đãi giảm giá combo mua kèm cực lớn chỉ dành cho khách đặt vé trước!</p>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="client-surface rounded-[20px] p-5 space-y-4">
              <h2 className="text-base font-extrabold text-brand-peach border-b border-brand-pearl/10 pb-3 mb-4">
                <FontAwesomeIcon icon={faCartShopping} className="mr-2 text-brand-studio" />
                Danh sách Combo Ưu Đãi
              </h2>
              {combosData.map((item) => {
                const qty = combos[item.id] || 0;
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-brand-pearl/10 hover:border-brand-studio/30 bg-brand-black/5 dark:bg-white/5 transition">
                    <div className="flex gap-4 items-start">
                      <span className="text-3xl sm:text-4xl p-2 rounded-lg bg-brand-studio/10 border border-brand-studio/15">{item.icon}</span>
                      <div>
                        <h3 className="text-sm font-extrabold text-brand-peach">{item.name}</h3>
                        <p className="text-xs text-brand-pearl mt-1 max-w-md">{item.description}</p>
                        <p className="text-sm font-extrabold text-brand-studio mt-2">{item.price.toLocaleString()}đ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        onClick={() => changeComboQty(item.id, -1)}
                        disabled={qty === 0}
                        className="h-8 w-8 rounded-full border border-brand-pearl/30 hover:border-brand-studio bg-brand-black/10 hover:bg-brand-studio/15 flex items-center justify-center text-xs font-bold text-brand-peach transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="text-sm font-extrabold text-brand-peach min-w-[20px] text-center">{qty}</span>
                      <button
                        onClick={() => changeComboQty(item.id, 1)}
                        className="h-8 w-8 rounded-full border border-brand-pearl/30 hover:border-brand-studio bg-brand-black/10 hover:bg-brand-studio/15 flex items-center justify-center text-xs font-bold text-brand-peach transition"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="client-surface h-fit rounded-[20px] p-5 lg:sticky lg:top-24">
              <h2 className="font-extrabold text-brand-peach border-b border-brand-pearl/10 pb-3 mb-4">
                <FontAwesomeIcon icon={faTicket} className="mr-2 text-brand-studio" />
                Tóm Tắt Đơn Hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-brand-pearl uppercase tracking-wider mb-2">Vé ({selected.length} ghế)</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((seat) => (
                      <span key={seat.id} className="rounded bg-brand-studio/10 border border-brand-studio/15 px-2 py-0.5 text-[11px] font-bold text-brand-peach">
                        {seat.seat.seatCode}
                      </span>
                    ))}
                  </div>
                </div>

                {Object.values(combos).some((q) => q > 0) && (
                  <div>
                    <p className="text-xs font-bold text-brand-pearl uppercase tracking-wider mb-2">Combo đã chọn</p>
                    <div className="space-y-1 text-xs font-semibold text-brand-peach">
                      {Object.entries(combos).map(([cId, qty]) => {
                        if (qty === 0) return null;
                        const c = combosData.find((x) => x.id === cId);
                        return (
                          <div key={cId} className="flex justify-between">
                            <span>{qty}x {c?.name}</span>
                            <strong>{(c?.price * qty).toLocaleString()}đ</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="my-5 border-t border-brand-pearl/10" />
              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between"><span className="text-brand-pearl">Tiền vé</span><strong className="text-brand-peach">{ticketCost.toLocaleString()}đ</strong></div>
                <div className="flex justify-between"><span className="text-brand-pearl">Tiền bắp nước</span><strong className="text-brand-peach">{comboCost.toLocaleString()}đ</strong></div>
              </div>
              <div className="my-5 border-t border-brand-pearl/10" />
              <p className="text-xs font-bold text-brand-pearl uppercase tracking-wider">Tổng cộng</p>
              <p className="text-2xl font-extrabold text-brand-studio mt-1">{total.toLocaleString()}đ</p>
              <button
                onClick={() => setView('payment')}
                className="client-btn mt-5 w-full py-3.5 text-xs uppercase tracking-wider font-extrabold"
              >
                Tiếp Tục Thanh Toán
              </button>
            </aside>
          </div>
        </>
      )}

      {/* VIEW 3: HIGH-FIDELITY CHECKOUT & PAYMENT PAGE */}
      {view === 'payment' && (
        <>
          <button
            onClick={() => setView('combos')}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-pearl/15 bg-brand-black/20 px-4 py-2 text-sm font-bold text-brand-pearl backdrop-blur transition hover:border-brand-studio hover:text-brand-peach"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại chọn combo
          </button>

          <h1 className="text-2xl font-extrabold text-brand-peach mb-6 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faCreditCard} className="text-brand-studio" />
            Thanh Toán
          </h1>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left Column: Tickets Card & Payment Methods Grid */}
            <div className="space-y-6">
              
              {/* High-Fidelity Movie Ticket Details Card */}
              <div className="client-surface rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <img
                    src={showtime?.movie?.posterUrl}
                    alt={showtime?.movie?.title}
                    className="w-32 aspect-[4/3] object-cover rounded-xl border border-brand-pearl/10 shadow"
                  />
                  <div className="flex-grow space-y-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg font-extrabold text-brand-peach leading-tight">{showtime?.movie?.title}</h2>
                      <span className="rounded bg-brand-studio px-2 py-0.5 text-[10px] font-bold text-white shadow-sm uppercase">C13</span>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-2 text-xs font-semibold text-brand-peach border-t border-brand-pearl/10 pt-3">
                      <div>
                        <p className="text-[10px] text-brand-pearl uppercase tracking-wider font-bold">Thời gian</p>
                        <strong className="mt-1 block text-brand-peach">{showtime?.startTime} · {formattedDate}</strong>
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-pearl uppercase tracking-wider font-bold">Rạp</p>
                        <strong className="mt-1 block text-brand-peach">{parsedTheater.cinemaName} · {parsedTheater.hallName}</strong>
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-pearl uppercase tracking-wider font-bold">Ghế</p>
                        <strong className="mt-1 block text-brand-peach">
                          {selectedSeats.map((s) => s.seat.seatCode).join(', ')} (VIP)
                        </strong>
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-pearl uppercase tracking-wider font-bold">Combo đã chọn</p>
                        <strong className="mt-1 block text-brand-peach line-clamp-1" title={Object.entries(combos).map(([cId, qty]) => qty > 0 ? `${qty}x ${combosData.find(x => x.id === cId)?.name}` : null).filter(Boolean).join(', ')}>
                          {Object.entries(combos).map(([cId, qty]) => {
                            if (qty === 0) return null;
                            const c = combosData.find((x) => x.id === cId);
                            return `${qty}x ${c?.name}`;
                          }).filter(Boolean).join(', ') || 'Không chọn combo'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-brand-peach">Phương Thức Thanh Toán</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  
                  {/* Momo Card */}
                  <label
                    onClick={() => setPaymentMethod('momo')}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition cursor-pointer select-none ${paymentMethod === 'momo' ? 'border-brand-studio bg-brand-studio/10 shadow-[0_0_15px_rgba(95,67,178,0.15)]' : 'border-brand-pearl/10 bg-brand-black/5 dark:bg-white/5 hover:border-brand-studio/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-lg bg-[#a50064] text-white flex items-center justify-center font-extrabold text-sm shadow">MoMo</span>
                      <div>
                        <strong className="text-sm font-extrabold text-brand-peach block">Ví điện tử MoMo</strong>
                        <span className="text-[10px] text-brand-pearl font-bold">Thanh toán nhanh qua ứng dụng</span>
                      </div>
                    </div>
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'momo' ? 'border-brand-studio bg-brand-studio' : 'border-brand-pearl/30'}`}>
                      {paymentMethod === 'momo' && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </span>
                  </label>

                  {/* International Cards (Visa/Mastercard) */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition cursor-pointer select-none ${paymentMethod === 'card' ? 'border-brand-studio bg-brand-studio/10 shadow-[0_0_15px_rgba(95,67,178,0.15)]' : 'border-brand-pearl/10 bg-brand-black/5 dark:bg-white/5 hover:border-brand-studio/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-lg bg-brand-studio/10 border border-brand-studio/15 text-brand-studio flex items-center justify-center font-bold text-lg shadow">💳</span>
                      <div>
                        <strong className="text-sm font-extrabold text-brand-peach block">Thẻ Quốc Tế</strong>
                        <span className="text-[10px] text-brand-pearl font-bold">Visa, Mastercard, JCB</span>
                      </div>
                    </div>
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'border-brand-studio bg-brand-studio' : 'border-brand-pearl/30'}`}>
                      {paymentMethod === 'card' && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </span>
                  </label>

                  {/* Apple Pay */}
                  <label
                    onClick={() => setPaymentMethod('applepay')}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition cursor-pointer select-none ${paymentMethod === 'applepay' ? 'border-brand-studio bg-brand-studio/10 shadow-[0_0_15px_rgba(95,67,178,0.15)]' : 'border-brand-pearl/10 bg-brand-black/5 dark:bg-white/5 hover:border-brand-studio/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm shadow">🍏 Pay</span>
                      <div>
                        <strong className="text-sm font-extrabold text-brand-peach block">Apple Pay</strong>
                        <span className="text-[10px] text-brand-pearl font-bold">Bảo mật bằng FaceID/TouchID</span>
                      </div>
                    </div>
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'applepay' ? 'border-brand-studio bg-brand-studio' : 'border-brand-pearl/30'}`}>
                      {paymentMethod === 'applepay' && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </span>
                  </label>

                  {/* ATM / Bank Transfer */}
                  <label
                    onClick={() => setPaymentMethod('atm')}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition cursor-pointer select-none ${paymentMethod === 'atm' ? 'border-brand-studio bg-brand-studio/10 shadow-[0_0_15px_rgba(95,67,178,0.15)]' : 'border-brand-pearl/10 bg-brand-black/5 dark:bg-white/5 hover:border-brand-studio/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-lg bg-brand-studio/10 border border-brand-studio/15 text-brand-studio flex items-center justify-center font-bold text-lg shadow">🏛️</span>
                      <div>
                        <strong className="text-sm font-extrabold text-brand-peach block">Chuyển khoản / ATM</strong>
                        <span className="text-[10px] text-brand-pearl font-bold">Napas, QR Ngân hàng</span>
                      </div>
                    </div>
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'atm' ? 'border-brand-studio bg-brand-studio' : 'border-brand-pearl/30'}`}>
                      {paymentMethod === 'atm' && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </span>
                  </label>

                </div>
              </div>

            </div>

            {/* Right Column: Sticky Order Summary breakdown */}
            <aside className="client-surface h-fit rounded-2xl p-5 lg:sticky lg:top-24 flex flex-col">
              <h3 className="font-extrabold text-brand-peach border-b border-brand-pearl/10 pb-3 mb-4 text-base">
                Tóm tắt đơn hàng
              </h3>
              
              <div className="space-y-3 text-xs font-semibold text-brand-peach">
                <div className="flex justify-between items-center">
                  <span className="text-brand-pearl">Vé xem phim ({selected.length}x)</span>
                  <strong>{ticketCost.toLocaleString()}đ</strong>
                </div>

                {Object.entries(combos).map(([cId, qty]) => {
                  if (qty === 0) return null;
                  const c = combosData.find((x) => x.id === cId);
                  return (
                    <div key={cId} className="flex justify-between items-center">
                      <span className="text-brand-pearl">{c?.name} ({qty}x)</span>
                      <strong>{(c?.price * qty).toLocaleString()}đ</strong>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center">
                  <span className="text-brand-pearl">Phí dịch vụ</span>
                  <strong>0đ</strong>
                </div>
              </div>

              <div className="my-5 border-t border-brand-pearl/10" />

              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-xs font-bold text-brand-pearl uppercase tracking-wider block">Tổng cộng</span>
                  <span className="text-[10px] text-brand-pearl/70 italic mt-0.5 block">Đã bao gồm VAT</span>
                </div>
                <strong className="text-2xl font-extrabold text-brand-studio">{total.toLocaleString()}đ</strong>
              </div>

              {error && <p className="mb-4 rounded bg-pink-50 dark:bg-pink-950/20 px-3 py-2 text-xs font-bold text-pink-700 dark:text-pink-400">{error}</p>}

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-brand-studio/10 border border-brand-studio/15 text-[10px] font-bold text-brand-pearl leading-normal mb-5">
                <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 text-brand-studio text-sm shrink-0" />
                <span>Giao dịch được bảo mật bởi hệ thống mã hóa 256-bit chuẩn quốc tế.</span>
              </div>

              <button
                disabled={booking}
                onClick={handlePaymentSubmit}
                className="client-btn w-full py-4 text-xs font-extrabold uppercase tracking-widest shadow-md hover:shadow-brand-studio/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {booking ? 'Đang xử lý...' : 'Thanh Toán Ngay'}
              </button>

              <span className="text-[9px] text-brand-pearl/70 text-center mt-3 font-semibold leading-normal">
                Bằng việc nhấn Thanh toán, bạn đồng ý với <a href="#" className="underline hover:text-brand-studio">Điều khoản sử dụng</a> của CineVerse.
              </span>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
