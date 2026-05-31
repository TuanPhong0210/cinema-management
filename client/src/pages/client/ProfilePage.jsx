import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faTicket,
  faSignOutAlt,
  faPhone,
  faEnvelope,
  faCalendarDay,
  faClock,
  faVideo,
  faChair,
  faArrowRight,
  faQrcode,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { gqlRequest } from '../../services/graphql';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('clientToken');
    if (!token) {
      navigate('/login');
      return;
    }

    gqlRequest(
      `query { me { id fullName email phone role tickets { id showtime { startTime showDate ticketPrice movie { title posterUrl genre durationMinutes } room { name } } customerName totalPrice status seats { seatCode price } createdAt } } }`,
      {},
      true
    )
      .then((data) => setUser(data.me))
      .catch((err) => {
        setError(err.message);
        if (err.message.includes('unauthorized') || err.message.includes('token')) {
          localStorage.removeItem('clientToken');
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    navigate('/');
  };

  const getStatusBadge = (ticket) => {
    const showtimeDateStr = `${ticket.showtime?.showDate}T${ticket.showtime?.startTime || '00:00'}:00`;
    const isPast = new Date(showtimeDateStr) < new Date();
    if (isPast) {
      return (
        <span className="bg-brand-pearl/10 text-brand-pearl text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
          Đã xem
        </span>
      );
    }
    return (
      <span className="bg-brand-studio/15 text-brand-studio border border-brand-studio/25 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded animate-pulse">
        Sắp chiếu
      </span>
    );
  };

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-brand-black/25" />;
  }

  if (error && !user) {
    return (
      <div className="client-surface rounded-2xl p-8 text-center text-brand-peach max-w-md mx-auto my-12">
        <h2 className="text-lg font-display font-bold">Không thể tải thông tin</h2>
        <p className="text-xs text-brand-pearl mt-2">{error}</p>
        <button onClick={() => navigate('/')} className="client-btn mt-6 px-6 py-2.5 text-xs">Quay về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <main className="max-w-6xl mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Sidebar Profile Section */}
          <section className="md:col-span-4 flex flex-col gap-6">
            <div className="client-surface rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-studio/30 shadow-lg mb-4 flex items-center justify-center bg-brand-studio/10 text-brand-studio">
                  <FontAwesomeIcon icon={faUser} className="text-4xl" />
                </div>
              </div>
              <h1 className="font-display font-black text-xl text-brand-peach uppercase tracking-wide mt-2">{user?.fullName}</h1>
              <p className="text-xs font-display font-bold text-brand-studio uppercase tracking-widest mt-1.5">{user?.role || 'Thành viên V.I.P'}</p>
              
              <div className="w-full h-px bg-brand-pearl/10 my-5"></div>
              
              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-studio/10 text-brand-studio">
                    <FontAwesomeIcon icon={faPhone} className="text-xs" />
                  </span>
                  <div>
                    <p className="text-[10px] text-brand-pearl font-bold uppercase tracking-wider">Số điện thoại</p>
                    <p className="text-xs font-bold text-brand-peach">{user?.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-studio/10 text-brand-studio">
                    <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                  </span>
                  <div>
                    <p className="text-[10px] text-brand-pearl font-bold uppercase tracking-wider">Email</p>
                    <p className="text-xs font-bold text-brand-peach truncate max-w-[200px]" title={user?.email}>{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="client-surface rounded-2xl overflow-hidden p-3 flex flex-col gap-1.5">
              <button className="flex items-center justify-between p-3 bg-brand-studio/10 text-brand-studio rounded-xl text-xs font-display font-black uppercase tracking-wider transition">
                <span className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faTicket} />
                  Vé đã đặt
                </span>
                <span className="h-6 px-2 rounded-full bg-brand-studio text-white text-[10px] font-bold grid place-items-center">
                  {user?.tickets?.length || 0}
                </span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-pink-500 hover:bg-pink-500/10 rounded-xl text-xs font-display font-black uppercase tracking-wider transition">
                <FontAwesomeIcon icon={faSignOutAlt} />
                Đăng xuất
              </button>
            </div>
          </section>

          {/* Right Main Content Area */}
          <section className="md:col-span-8">
            <h2 className="font-display font-black text-2xl tracking-wide text-brand-peach flex items-center gap-3 uppercase mb-6 border-b border-brand-pearl/10 pb-4">
              <FontAwesomeIcon icon={faTicket} className="text-brand-studio" />
              Vé đã đặt
            </h2>

            {(!user?.tickets || user.tickets.length === 0) ? (
              <div className="client-surface rounded-2xl p-12 text-center text-brand-pearl">
                <FontAwesomeIcon icon={faTicket} className="text-5xl text-brand-pearl/20 mb-4" />
                <h3 className="text-sm font-display font-bold text-brand-peach">Bạn chưa đặt vé nào</h3>
                <p className="text-xs mt-1 text-brand-pearl/70">Mọi suất vé xem phim đã đặt trực tuyến sẽ được lưu giữ tại đây.</p>
                <button onClick={() => navigate('/')} className="client-btn mt-6 px-6 py-2.5 text-xs font-display uppercase tracking-widest">Đặt vé ngay</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {user.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex flex-col lg:flex-row client-surface rounded-2xl overflow-hidden hover:shadow-[0_10px_35px_rgba(139,92,246,0.1)] transition duration-200">
                    <div className="lg:w-40 aspect-[2/3] lg:h-auto overflow-hidden bg-brand-black/50 border-b lg:border-b-0 lg:border-r border-brand-pearl/10">
                      <img src={ticket.showtime?.movie?.posterUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          {getStatusBadge(ticket)}
                          <strong className="text-[10px] font-bold text-brand-studio font-display uppercase tracking-wider">Mã vé: CV-{ticket.id * 123 + 456}</strong>
                        </div>
                        <h3 className="font-display font-black tracking-wide text-lg text-brand-peach leading-snug uppercase mb-3 truncate max-w-[340px]" title={ticket.showtime?.movie?.title}>
                          {ticket.showtime?.movie?.title}
                        </h3>
                        <div className="grid gap-2 text-xs text-brand-pearl font-semibold">
                          <span className="flex items-center gap-2"><FontAwesomeIcon icon={faCalendarDay} className="text-brand-studio shrink-0 text-[11px]" /> {new Date(`${ticket.showtime?.showDate}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</span>
                          <span className="flex items-center gap-2"><FontAwesomeIcon icon={faClock} className="text-brand-studio shrink-0 text-[11px]" /> {ticket.showtime?.startTime}</span>
                          <span className="flex items-center gap-2"><FontAwesomeIcon icon={faVideo} className="text-brand-studio shrink-0 text-[11px]" /> {ticket.showtime?.room?.name}</span>
                          <span className="flex items-center gap-2"><FontAwesomeIcon icon={faChair} className="text-brand-studio shrink-0 text-[11px]" /> Ghế: {ticket.seats?.map((s) => s.seatCode).join(', ')}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-dashed border-brand-pearl/10 flex items-center justify-between">
                        <strong className="text-sm font-display font-black text-brand-studio">Tổng cộng: {ticket.totalPrice.toLocaleString()}đ</strong>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-brand-studio flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wider hover:underline"
                        >
                          Chi tiết vé <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                    {/* QR Code section */}
                    <div className="lg:w-44 bg-brand-studio/5 lg:border-l border-t lg:border-t-0 border-dashed border-brand-pearl/10 p-5 flex flex-col items-center justify-center text-center">
                      <div
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-white p-2 rounded-xl border border-brand-pearl/15 shadow-sm mb-2.5 cursor-pointer hover:scale-105 transition"
                      >
                        <div className="w-24 h-24 text-brand-studio flex items-center justify-center bg-brand-studio/5 rounded border border-dashed border-brand-studio/20">
                          <FontAwesomeIcon icon={faQrcode} className="text-5xl" />
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-brand-pearl uppercase tracking-wider leading-relaxed">Quét tại quầy soát vé</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Ticket QR Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-brand-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="client-surface rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in border border-brand-pearl/15 relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute right-4 top-4 text-brand-pearl hover:text-brand-peach transition"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
            <div className="p-6 text-center mt-6">
              <div className="bg-white p-3 rounded-2xl border border-brand-pearl/10 shadow-lg mb-4 w-fit mx-auto">
                <div className="w-40 h-40 text-brand-studio flex items-center justify-center bg-brand-studio/5 rounded-lg border border-dashed border-brand-studio/25">
                  <FontAwesomeIcon icon={faQrcode} className="text-8xl" />
                </div>
              </div>
              <h5 className="font-display font-black text-xl text-brand-studio tracking-widest mb-1.5">
                CV-{selectedTicket.id * 123 + 456}
              </h5>
              <h4 className="font-display font-black text-sm text-brand-peach uppercase tracking-wide line-clamp-1 mb-2">
                {selectedTicket.showtime?.movie?.title}
              </h4>
              <p className="text-xs text-brand-pearl leading-normal mb-5 px-3">
                Vui lòng xuất trình mã QR Code này cho nhân viên tại quầy soát vé rạp để vào phòng chiếu.
              </p>
              <button
                onClick={() => setSelectedTicket(null)}
                className="client-btn w-full py-3 text-xs font-display font-extrabold uppercase tracking-widest"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
