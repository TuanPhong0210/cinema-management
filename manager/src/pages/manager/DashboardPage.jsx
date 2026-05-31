import { useEffect, useState } from 'react';
import { gqlRequest } from '../../services/graphql';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Tuần');

  useEffect(() => {
    gqlRequest(`query { dashboard { totalMovies totalShowtimes totalTicketsSold employeesOnShift revenue } }`)
      .then((d) => setData(d.dashboard))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div>
        <h2 className="font-display-lg text-4xl text-violet-300 font-bold mb-2">Chào buổi sáng, CineMaster.</h2>
        <p className="text-slate-400 font-body-md text-sm">Chào mừng quay trở lại. Dưới đây là tổng quan về hoạt động rạp của bạn hôm nay.</p>
      </div>

      {/* Metric Cards (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Bookings */}
        <div className="glass-panel p-6 rounded-3xl hover:-translate-y-1.5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-300">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +12.5%
            </span>
          </div>
          <p className="text-slate-400 font-medium text-sm mb-1">Tổng Vé Đặt</p>
          <h3 className="font-display-lg text-3xl text-[#e7e0ed] font-bold">{data?.totalTicketsSold ?? 12845}</h3>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Cập nhật 5 phút trước</p>
          </div>
        </div>

        {/* Active Screens */}
        <div className="glass-panel p-6 rounded-3xl hover:-translate-y-1.5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-300">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>screenshot_monitor</span>
            </div>
            <span className="text-slate-400 text-xs font-bold">
              {data?.totalShowtimes ?? 8}/12 phòng
            </span>
          </div>
          <p className="text-slate-400 font-medium text-sm mb-1">Màn Hình Hoạt Động</p>
          <h3 className="font-display-lg text-3xl text-[#e7e0ed] font-bold">
            {String(data?.totalShowtimes ?? 8).padStart(2, '0')}{' '}
            <span className="text-sm font-normal text-slate-400">Suất Chiếu</span>
          </h3>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full w-[66%] rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Staff On-Duty */}
        <div className="glass-panel p-6 rounded-3xl hover:-translate-y-1.5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-300">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
            <span className="text-violet-400 text-xs font-bold">Quản lý</span>
          </div>
          <p className="text-slate-400 font-medium text-sm mb-1">Nhân Viên Trực</p>
          <h3 className="font-display-lg text-3xl text-[#e7e0ed] font-bold">
            {data?.employeesOnShift ?? 24}{' '}
            <span className="text-sm font-normal text-slate-400">Thành Viên</span>
          </h3>
          <div className="mt-4 flex -space-x-2">
            <img alt="Staff" className="w-8 h-8 rounded-full border-2 border-[#15121b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBprSW1MUmEysELtDP2IRvK2pN5e_H5uSxcx6hAgja0rdK94d1-YxkwvTbmHa9Dsm9XnXJzuU2ZrpgRjWEJ3CX2hnKVeuae4BKjh2O4uy-JXkhDmSJmi1QFSHaN6eqmdadH9TyNol9V50XSHRat-xQrFU5QR_wkhYdMgUQ8F6ndX3iKrPvP82mYvF2bCudCSBlEIexU6bvcVfMQkKn0Mg2_WNVhV3npCmwUYkNT8LAH8muvMJec9sjjZFKmPJKpRL4aqlkNPO7lv4b-" />
            <img alt="Staff" className="w-8 h-8 rounded-full border-2 border-[#15121b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNh9Ps8qDXk1Oz_7pra23GDQUykOIgjj3xuvs9CDkXClOmKN73oMcC7uwoz0WubBp3JMB5IMNrg_NivyNMM9iaWducldCgLJ6owP0Z35smM873Psn5Wq5EJZIOSzSFxrL6hFHLb6LKCtpT8ClV5KOEIZmTJJldBz_r0KI5C8jcAJNTssshy7gksNDIyl8daD-w9kMWQq5gk7X5sbjYJSB72Ha7rxs8GpM-Oknhs0caUM-O89kgeLEB0GEUmC_wczgl3sxKb6wp0u2n" />
            <img alt="Staff" className="w-8 h-8 rounded-full border-2 border-[#15121b]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3AJHWLDXccvc6j23nYd3GLRGo4beptJTreuXYdA9DornIfT20-aVEQslDsCgLuBk1xpEcw-3DnbXNGXd3j8JlKhvTpzZtbVNtNzJv1HCR8idAoSXybbZ_0qMeDWd6RZTD-Sw6Y1Kz3DUeAp57Lhevxw-f7O8JZrNV73ELdDS6LJtjdkixpsQSiyaBUqi8ub5nXnIv0eUM0I9VRKHysO-h4hZgAzYHgckMJ1-99iZeeADfLc9YsfUvnqbKIkaLf2CLFjc2rGDzp-Y0" />
            <div className="w-8 h-8 rounded-full border-2 border-[#15121b] bg-[#2d2832] flex items-center justify-center text-[10px] font-bold text-slate-300">+21</div>
          </div>
        </div>
      </div>

      {/* Revenue and Movie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-display-lg text-lg text-[#e7e0ed] font-bold mb-1">Phân Tích Doanh Thu</h4>
              <p className="text-slate-400 text-xs">Theo dõi dòng tiền định kỳ từ vé bán và quầy bắp nước</p>
            </div>
            <div className="flex bg-[#1d1a23] p-1 rounded-xl">
              {['Tuần', 'Tháng', 'Quý', 'Năm'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    selectedTimeframe === tf ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          {/* SVG Area Line Chart */}
          <div className="w-full h-72 relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
              {/* Grid Lines */}
              <line stroke="rgba(255,255,255,0.05)" x1="0" x2="800" y1="50" y2="50"></line>
              <line stroke="rgba(255,255,255,0.05)" x1="0" x2="800" y1="150" y2="150"></line>
              <line stroke="rgba(255,255,255,0.05)" x1="0" x2="800" y1="250" y2="250"></line>
              {/* Main Area Chart */}
              <path d="M0,280 Q100,100 200,180 T400,120 T600,220 T800,80 V300 H0 Z" fill="url(#chartGradient)" opacity="0.15"></path>
              <path d="M0,280 Q100,100 200,180 T400,120 T600,220 T800,80" fill="none" stroke="#8b5cf6" strokeLinecap="round" strokeWidth="4" className="filter drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"></path>
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between px-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>
          </div>
        </div>

        {/* Top 5 Movies */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="font-display-lg text-lg text-[#e7e0ed] font-bold mb-6">Top 5 Phim Doanh Thu</h4>
            <div className="space-y-5">
              {[
                ['Oppenheimer: Noir', '820tr', '95%', 'bg-violet-500'],
                ['Dune: Part Two', '640tr', '78%', 'bg-indigo-500'],
                ['The Batman: Vengeance', '510tr', '62%', 'bg-slate-400'],
                ['Blade Runner 2049', '420tr', '50%', 'bg-slate-500'],
                ['Interstellar: IMAX', '380tr', '45%', 'bg-slate-600']
              ].map(([title, amount, percent, color]) => (
                <div key={title} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-end text-sm">
                    <span className="text-[#e7e0ed] font-medium truncate pr-4">{title}</span>
                    <span className="font-bold text-violet-300">{amount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: percent }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full mt-6 py-3 border border-white/10 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider">
            Xem Chi Tiết Báo Cáo
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Bookings & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-display-lg text-lg text-[#e7e0ed] font-bold">Giao Dịch Gần Đây</h4>
              <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-violet-300">filter_list</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Khách Hàng</th>
                    <th className="px-6 py-4">Phim</th>
                    <th className="px-6 py-4">Số Ghế</th>
                    <th className="px-6 py-4">Số Tiền</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-[#e7e0ed]">
                  {[
                    ['Lê Minh Quân', 'Oppenheimer', 'H12, H13', '250.000đ', 'Thành công', 'bg-emerald-400/10 text-emerald-400'],
                    ['Nguyễn Thu Hà', 'Dune: Part Two', 'A05', '120.000đ', 'Thành công', 'bg-emerald-400/10 text-emerald-400'],
                    ['Trần Đại Nghĩa', 'The Batman', 'F08, F09', '220.000đ', 'Đã Hủy', 'bg-red-400/10 text-red-400']
                  ].map(([customer, movie, seats, price, status, statusClass], idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{customer}</td>
                      <td className="px-6 py-4 text-slate-300">{movie}</td>
                      <td className="px-6 py-4 text-slate-400">{seats}</td>
                      <td className="px-6 py-4 font-semibold text-violet-300">{price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border-t border-white/5 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
            Doanh thu thực tế: {Number(data?.revenue ?? 0).toLocaleString()} VND
          </div>
        </div>

        {/* System Health & Quick Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col justify-center">
            <h4 className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Tình Trạng Hệ Thống</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Máy Chiếu (8/8)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Hệ Thống Âm Thanh</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ki-ốt Tự Động</span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              </div>
            </div>
          </div>

          <div className="bg-violet-600 p-6 rounded-3xl shadow-lg shadow-violet-500/20 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full"></div>
            <div>
              <h4 className="font-display-lg text-lg text-white font-bold mb-1">Báo Cáo Nhanh</h4>
              <p className="text-violet-100 text-xs mb-6">Xuất toàn bộ dữ liệu kinh doanh của cụm rạp sang tệp PDF ngay lập tức.</p>
            </div>
            <button className="w-full py-3 bg-[#15121b] text-violet-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#15121b]/80 transition-all text-sm shadow-md">
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Tải PDF Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

