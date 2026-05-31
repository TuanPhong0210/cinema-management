import { useEffect, useState } from 'react';
import { gqlRequest } from '../../services/graphql';

const defaultDiscounts = [
  {
    id: '1',
    name: 'Mừng Hè Rực Rỡ',
    code: 'SUMMER20',
    targetMovie: 'Tất cả phim',
    discountType: 'percentage', // 'percentage' or 'fixed'
    value: 20,
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    isActive: true,
    usageCount: 340
  },
  {
    id: '2',
    name: 'Siêu Phẩm Điện Ảnh',
    code: 'NOIRBLOCK',
    targetMovie: 'Dune: Part Two',
    discountType: 'fixed',
    value: 30000,
    startDate: '2026-05-15',
    endDate: '2026-06-15',
    isActive: true,
    usageCount: 820
  },
  {
    id: '3',
    name: 'Thành Viên Thân Thiết',
    code: 'CINEVIP',
    targetMovie: 'Tất cả phim',
    discountType: 'percentage',
    value: 15,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    usageCount: 1450
  },
  {
    id: '4',
    name: 'Black Friday Cinematic',
    code: 'BLACKNOIR',
    targetMovie: 'Tất cả phim',
    discountType: 'fixed',
    value: 50000,
    startDate: '2025-11-20',
    endDate: '2025-11-30',
    isActive: false,
    usageCount: 210
  }
];

const empty = {
  name: '',
  code: '',
  targetMovie: 'Tất cả phim',
  discountType: 'percentage',
  value: 10,
  startDate: '',
  endDate: '',
  isActive: true
};

export default function DiscountPage() {
  const [items, setItems] = useState([]);
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'percentage', 'fixed'
  const [role, setRole] = useState(localStorage.getItem('managerRole') || 'Admin');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleRoleChange = () => setRole(localStorage.getItem('managerRole') || 'Admin');
    window.addEventListener('roleChange', handleRoleChange);
    return () => window.removeEventListener('roleChange', handleRoleChange);
  }, []);

  // Fetch movies from GraphQL to populate "Target Movie" dropdown
  const loadMovies = async () => {
    try {
      const d = await gqlRequest(`query { movies { title } }`);
      if (d && d.movies) {
        setMovies(d.movies);
      }
    } catch (e) {
      console.error('Error loading movies for discount targets:', e);
    }
  };

  const loadDiscounts = () => {
    const data = localStorage.getItem('cineNoirDiscounts');
    if (data) {
      setItems(JSON.parse(data));
    } else {
      localStorage.setItem('cineNoirDiscounts', JSON.stringify(defaultDiscounts));
      setItems(defaultDiscounts);
    }
  };

  useEffect(() => {
    loadDiscounts();
    loadMovies();
  }, []);

  const save = (e) => {
    e.preventDefault();
    if (role === 'Employee') return;

    let updated;
    if (editing) {
      updated = items.map((item) =>
        item.id === editing ? { ...item, ...form, value: Number(form.value) } : item
      );
    } else {
      const newDiscount = {
        ...form,
        id: String(Date.now()),
        value: Number(form.value),
        usageCount: 0
      };
      updated = [...items, newDiscount];
    }

    localStorage.setItem('cineNoirDiscounts', JSON.stringify(updated));
    setItems(updated);
    setForm(empty);
    setEditing(null);
    setModalOpen(false);
  };

  const startEdit = (d) => {
    if (role === 'Employee') return;
    setEditing(d.id);
    setForm({
      name: d.name,
      code: d.code,
      targetMovie: d.targetMovie,
      discountType: d.discountType,
      value: d.value,
      startDate: d.startDate,
      endDate: d.endDate,
      isActive: d.isActive
    });
    setModalOpen(true);
  };

  const startAdd = () => {
    if (role === 'Employee') return;
    setEditing(null);
    
    // Set default dates: today and next month
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const end = nextMonth.toISOString().split('T')[0];

    setForm({
      ...empty,
      startDate: today,
      endDate: end
    });
    setModalOpen(true);
  };

  const del = (id) => {
    if (role === 'Employee') return;
    if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch ưu đãi này?')) {
      const updated = items.filter((item) => item.id !== id);
      localStorage.setItem('cineNoirDiscounts', JSON.stringify(updated));
      setItems(updated);
    }
  };

  const toggleStatus = (discount) => {
    if (role === 'Employee') return;
    const updated = items.map((item) =>
      item.id === discount.id ? { ...item, isActive: !item.isActive } : item
    );
    localStorage.setItem('cineNoirDiscounts', JSON.stringify(updated));
    setItems(updated);
  };

  // Derived statistics
  const totalCampaigns = items.length;
  const activeCampaigns = items.filter((i) => i.isActive).length;
  const totalUsage = items.reduce((sum, i) => sum + (i.usageCount || 0), 0);
  const totalSavingsMock = items.reduce((sum, i) => {
    // Mocking a savings calc: usage * value (if fixed) or usage * 20000 (average savings if percentage)
    const multiplier = i.discountType === 'fixed' ? i.value : (i.value / 100) * 110000;
    return sum + (i.usageCount || 0) * multiplier;
  }, 0);

  // Filter and search
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.targetMovie.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      item.discountType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>CHIẾN DỊCH</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-violet-300">KHUYẾN MÃI & KHÁCH HÀNG</span>
          </nav>
          <h2 className="font-display-lg text-3xl font-black tracking-tight text-[#e7e0ed]">
            Chương Trình Khuyến Mãi
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            Quản lý mã giảm giá, chiến dịch voucher và ưu đãi giá vé cho khách hàng thành viên.
          </p>
        </div>
        <div>
          {role === 'Admin' && (
            <button
              onClick={startAdd}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 text-sm"
            >
              <span className="material-symbols-outlined text-base">local_offer</span>
              <span>Tạo Mã Giảm Giá</span>
            </button>
          )}
        </div>
      </div>

      {/* Bento Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang Chạy</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <span className="material-symbols-outlined text-lg">campaign</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed]">{activeCampaigns}</div>
            <p className="text-[10px] text-violet-400 mt-1 font-semibold">Voucher đang hoạt động</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lượt Sử Dụng</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-lg">supervised_user_circle</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed]">{totalUsage.toLocaleString()}</div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Được áp dụng tại quầy/online</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiết Kiệm Khách Hàng</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <span className="material-symbols-outlined text-lg">savings</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-[#e7e0ed]">
              {Math.round(totalSavingsMock).toLocaleString()}đ
            </div>
            <p className="text-[10px] text-pink-400 mt-1 font-semibold">Tổng giá trị đã giảm cho khách</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tỉ Lệ Chuyển Đổi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-lg">query_stats</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed]">76.2%</div>
            <p className="text-[10px] text-amber-400 mt-1 font-semibold">Tăng trưởng doanh số bán vé</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#211e27]/40 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:max-w-xs group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm tên, mã hoặc phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 placeholder-slate-500 text-xs transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterType === 'all'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                : 'text-slate-400 border-white/5 hover:bg-white/5'
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            onClick={() => setFilterType('percentage')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterType === 'percentage'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                : 'text-slate-400 border-white/5 hover:bg-white/5'
            }`}
          >
            Theo Tỷ Lệ (%)
          </button>
          <button
            onClick={() => setFilterType('fixed')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterType === 'fixed'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                : 'text-slate-400 border-white/5 hover:bg-white/5'
            }`}
          >
            Cố Định (VND)
          </button>
        </div>
      </div>

      {/* Main Campaign Data Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1f1b26]/50">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Chương Trình
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Mã Giảm Giá
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Áp Dụng Cho Phim
                </th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Mức Ưu Đãi
                </th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Thời Gian Hiệu Lực
                </th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Lượt Dùng
                </th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Trạng Thái
                </th>
                {role === 'Admin' && (
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Hành Động
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((discount) => {
                const now = new Date().toISOString().split('T')[0];
                const isExpired = discount.endDate < now;

                return (
                  <tr
                    key={discount.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      !discount.isActive || isExpired ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-bold text-[#e7e0ed]">{discount.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          ID: #{discount.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs bg-violet-600/10 border border-violet-500/30 px-3 py-1 rounded-xl text-violet-300 font-mono font-black tracking-wider">
                        {discount.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-500">
                          {discount.targetMovie === 'Tất cả phim' ? 'check_circle' : 'movie'}
                        </span>
                        {discount.targetMovie}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-sm font-black text-fuchsia-400">
                        {discount.discountType === 'percentage'
                          ? `Giảm ${discount.value}%`
                          : `-${discount.value.toLocaleString()}đ`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="text-xs text-slate-400">
                        <span className="font-mono">{discount.startDate}</span>
                        <span className="mx-1.5 text-slate-600">đến</span>
                        <span className="font-mono">{discount.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-[#e7e0ed] font-bold whitespace-nowrap">
                      {discount.usageCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {isExpired ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-red-500/10 border-red-500/20 text-red-400">
                          HẾT HẠN
                        </span>
                      ) : discount.isActive ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                          HOẠT ĐỘNG
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-400">
                          TẠM DỪNG
                        </span>
                      )}
                    </td>
                    {role === 'Admin' && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(discount)}
                            disabled={isExpired}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isExpired
                                ? 'border-white/5 text-slate-600 cursor-not-allowed'
                                : discount.isActive
                                ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                                : 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {discount.isActive ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                          <button
                            onClick={() => startEdit(discount)}
                            className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">edit</span>
                          </button>
                          <button
                            onClick={() => del(discount.id)}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">sell</span>
          <h3 className="text-lg font-bold text-slate-400">Không tìm thấy mã giảm giá nào phù hợp</h3>
          <p className="text-slate-500 text-xs mt-1">Hãy nhập từ khóa khác hoặc chuyển bộ lọc loại giảm giá.</p>
        </div>
      )}

      {/* Add / Edit Discount Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#0c0a10]/80 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-xl rounded-3xl bg-[#1e1b26] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400">
                <span className="material-symbols-outlined">local_offer</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-xl font-black text-[#e7e0ed]">
                  {editing ? 'Cập Nhật Chiến Dịch' : 'Tạo Chiến Dịch Ưu Đãi'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thiết lập các điều kiện chiết khấu giá vé hoặc combo cho hệ thống rạp.
                </p>
              </div>
            </div>

            <form onSubmit={save} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tên chương trình khuyến mãi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Ưu Đãi Thành Viên VIP Tháng 6"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 placeholder-slate-600 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Mã Code Giảm Giá (Viết hoa liền)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: CINEVIP30"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })
                    }
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] font-mono focus:ring-1 focus:ring-violet-500 placeholder-slate-600 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Áp dụng cho phim
                  </label>
                  <select
                    value={form.targetMovie}
                    onChange={(e) => setForm({ ...form, targetMovie: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 transition-all outline-none appearance-none"
                  >
                    <option value="Tất cả phim">Tất cả phim đang chiếu</option>
                    {movies.map((m) => (
                      <option key={m.title} value={m.title}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Loại giảm giá
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 transition-all outline-none appearance-none"
                  >
                    <option value="percentage">Giảm theo tỷ lệ (%)</option>
                    <option value="fixed">Giảm số tiền cụ thể (đ)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Mức giảm giá
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="col-span-2 py-1 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="discountIsActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 bg-white/5 border-white/10 focus:ring-violet-500"
                  />
                  <label
                    htmlFor="discountIsActive"
                    className="text-xs font-semibold text-[#e7e0ed] select-none cursor-pointer"
                  >
                    Kích hoạt chương trình ngay lập tức
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white hover:bg-violet-700 px-5 py-3 rounded-xl font-bold shadow-lg shadow-violet-500/10 transition-all text-xs"
                >
                  {editing ? 'Cập Nhật' : 'Tạo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
