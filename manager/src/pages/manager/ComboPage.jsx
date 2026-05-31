import { useEffect, useState } from 'react';

const defaultCombos = [
  {
    id: '1',
    name: 'Combo Solo',
    details: '1 Bắp ngọt lớn 60oz + 1 Nước ngọt 22oz',
    price: 85000,
    isActive: true,
    salesCount: 1420,
    category: 'Cá nhân'
  },
  {
    id: '2',
    name: 'Combo Couple',
    details: '1 Bắp phô mai lớn 60oz + 2 Nước ngọt 32oz',
    price: 115000,
    isActive: true,
    salesCount: 3250,
    category: 'Đôi'
  },
  {
    id: '3',
    name: 'Cine Party Pack',
    details: '2 Bắp phô mai lớn + 4 Nước ngọt + 1 Khoai tây chiên',
    price: 245000,
    isActive: true,
    salesCount: 890,
    category: 'Nhóm'
  },
  {
    id: '4',
    name: 'Family Feast',
    details: '2 Bắp lớn tùy chọn vị + 4 Nước lớn + 2 Xúc xích Đức',
    price: 299000,
    isActive: false,
    salesCount: 150,
    category: 'Gia đình'
  }
];

const empty = { name: '', details: '', price: 90000, isActive: true, category: 'Cá nhân' };

export default function ComboPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [role, setRole] = useState(localStorage.getItem('managerRole') || 'Admin');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleRoleChange = () => setRole(localStorage.getItem('managerRole') || 'Admin');
    window.addEventListener('roleChange', handleRoleChange);
    return () => window.removeEventListener('roleChange', handleRoleChange);
  }, []);

  // Initialize and load combos from local storage
  const load = () => {
    const data = localStorage.getItem('cineNoirCombos');
    if (data) {
      setItems(JSON.parse(data));
    } else {
      localStorage.setItem('cineNoirCombos', JSON.stringify(defaultCombos));
      setItems(defaultCombos);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = (e) => {
    e.preventDefault();
    if (role === 'Employee') return;

    let updated;
    if (editing) {
      updated = items.map((item) =>
        item.id === editing ? { ...item, ...form, price: Number(form.price) } : item
      );
    } else {
      const newCombo = {
        ...form,
        id: String(Date.now()),
        price: Number(form.price),
        salesCount: 0
      };
      updated = [...items, newCombo];
    }

    localStorage.setItem('cineNoirCombos', JSON.stringify(updated));
    setItems(updated);
    setForm(empty);
    setEditing(null);
    setModalOpen(false);
  };

  const startEdit = (c) => {
    if (role === 'Employee') return;
    setEditing(c.id);
    setForm({
      name: c.name,
      details: c.details,
      price: c.price,
      isActive: c.isActive,
      category: c.category || 'Cá nhân'
    });
    setModalOpen(true);
  };

  const startAdd = () => {
    if (role === 'Employee') return;
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };

  const del = (id) => {
    if (role === 'Employee') return;
    if (window.confirm('Bạn có chắc chắn muốn xóa combo F&B này khỏi thực đơn?')) {
      const updated = items.filter((item) => item.id !== id);
      localStorage.setItem('cineNoirCombos', JSON.stringify(updated));
      setItems(updated);
    }
  };

  const toggleStatus = (combo) => {
    if (role === 'Employee') return;
    const updated = items.map((item) =>
      item.id === combo.id ? { ...item, isActive: !item.isActive } : item
    );
    localStorage.setItem('cineNoirCombos', JSON.stringify(updated));
    setItems(updated);
  };

  // Derived statistics
  const totalCombos = items.length;
  const activeCombos = items.filter((i) => i.isActive).length;
  const avgPrice = totalCombos ? Math.round(items.reduce((sum, i) => sum + i.price, 0) / totalCombos) : 0;
  const highestSalesCombo = items.length
    ? [...items].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))[0]?.name
    : 'N/A';

  // Filter and search logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.details.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterActive === 'all' ||
      (filterActive === 'active' && item.isActive) ||
      (filterActive === 'inactive' && !item.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>DỊCH VỤ</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-violet-300">ẨM THỰC & COMBO</span>
          </nav>
          <h2 className="font-display-lg text-3xl font-black tracking-tight text-[#e7e0ed]">
            Combo Bắp Nước & F&B
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            Quản lý thực đơn thức ăn, đồ uống và các gói ưu đãi ẩm thực đi kèm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#1d1a23] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            </button>
          </div>
          {role === 'Admin' && (
            <button
              onClick={startAdd}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 text-sm"
            >
              <span className="material-symbols-outlined text-base">restaurant_menu</span>
              <span>Thêm Combo</span>
            </button>
          )}
        </div>
      </div>

      {/* Bento Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng Thực Đơn</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <span className="material-symbols-outlined text-lg">fastfood</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed]">{totalCombos}</div>
            <p className="text-[10px] text-violet-400 mt-1 font-semibold">Gói ẩm thực hiện có</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang Phục Vụ</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed]">{activeCombos}</div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Khả dụng tại quầy</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Giá Trung Bình</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-[#e7e0ed]">
              {avgPrice.toLocaleString()}đ
            </div>
            <p className="text-[10px] text-amber-400 mt-1 font-semibold">Phù hợp mọi phân khúc</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bán Chạy Nhất</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <span className="material-symbols-outlined text-lg">local_fire_department</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-[#e7e0ed] truncate">
              {highestSalesCombo}
            </div>
            <p className="text-[10px] text-pink-400 mt-1 font-semibold">Yêu thích của các mọt phim</p>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#211e27]/40 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:max-w-xs group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm tên hoặc chi tiết combo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 placeholder-slate-500 text-xs transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterActive('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterActive === 'all'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                : 'text-slate-400 border-white/5 hover:bg-white/5'
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterActive === 'active'
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                : 'text-slate-400 border-white/5 hover:bg-white/5'
            }`}
          >
            Đang phục vụ ({activeCombos})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterActive === 'inactive'
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/30'
                : 'text-slate-400 border-white/5 hover:bg-white/5'
            }`}
          >
            Tạm dừng ({items.length - activeCombos})
          </button>
        </div>
      </div>

      {/* Grid Layout of Combo Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredItems.map((combo) => {
            const categoriesGradients = {
              'Cá nhân': 'from-indigo-600 to-violet-500 shadow-indigo-500/10',
              'Đôi': 'from-violet-600 to-fuchsia-500 shadow-violet-500/10',
              'Nhóm': 'from-fuchsia-600 to-pink-500 shadow-fuchsia-500/10',
              'Gia đình': 'from-amber-500 to-orange-500 shadow-amber-500/10'
            };
            const gradClass = categoriesGradients[combo.category] || 'from-violet-600 to-slate-500';

            return (
              <div
                key={combo.id}
                className={`glass-panel rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden transition-all duration-300 group hover:-translate-y-1.5 ${
                  !combo.isActive ? 'opacity-65' : ''
                }`}
              >
                {/* Neon Background Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradClass} opacity-5 blur-3xl group-hover:opacity-15 transition-all`}></div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      ID: {combo.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        combo.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {combo.isActive ? 'ĐANG PHỤC VỤ' : 'TẠM NGƯNG'}
                    </span>
                  </div>

                  {/* Elegant Food Icon Graphic Overlay */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${gradClass} flex items-center justify-center shadow-lg`}>
                      <span className="material-symbols-outlined text-2xl text-white">
                        {combo.category === 'Đôi' ? 'two_wheeler' : combo.category === 'Nhóm' ? 'groups' : 'popcorn'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline-sm text-lg font-extrabold text-[#e7e0ed] tracking-tight group-hover:text-violet-300 transition-colors">
                          {combo.name}
                        </h3>
                        <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-violet-300 font-bold uppercase">
                          {combo.category || 'Cá nhân'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
                        {combo.details}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 mt-6 pt-5 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      GIÁ BÁN NIÊM YẾT
                    </span>
                    <span className="text-2xl font-black text-violet-300 tracking-tight">
                      {combo.price.toLocaleString()}đ
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {role === 'Admin' ? (
                      <>
                        <button
                          onClick={() => toggleStatus(combo)}
                          className={`p-2 rounded-xl border transition-all ${
                            combo.isActive
                              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                              : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                          }`}
                          title={combo.isActive ? 'Tạm ngưng phục vụ' : 'Phục vụ trở lại'}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {combo.isActive ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <button
                          onClick={() => startEdit(combo)}
                          className="p-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => del(combo.id)}
                          className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold italic">Xem chi tiết</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Table Grid) */
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1f1b26]/50">
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Tên Combo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Phân Loại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Chi Tiết Sản Phẩm
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Giá Bán
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
                {filteredItems.map((combo) => (
                  <tr
                    key={combo.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold whitespace-nowrap">
                      #{combo.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#e7e0ed] whitespace-nowrap">
                      {combo.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] bg-violet-600/10 border border-violet-500/20 px-2 py-0.5 rounded text-violet-300 font-bold uppercase">
                        {combo.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                      {combo.details}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-violet-300 text-right whitespace-nowrap">
                      {combo.price.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          combo.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}
                      >
                        {combo.isActive ? 'ĐANG BÁN' : 'TẠM DỪNG'}
                      </span>
                    </td>
                    {role === 'Admin' && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(combo)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              combo.isActive
                                ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                                : 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {combo.isActive ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                          <button
                            onClick={() => startEdit(combo)}
                            className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">edit</span>
                          </button>
                          <button
                            onClick={() => del(combo.id)}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">restaurant_menu</span>
          <h3 className="text-lg font-bold text-slate-400">Không tìm thấy combo nào phù hợp</h3>
          <p className="text-slate-500 text-xs mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc lọc trạng thái khác.</p>
        </div>
      )}

      {/* Add / Edit Combo Glassmorphic Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#0c0a10]/80 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg rounded-3xl bg-[#1e1b26] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400">
                <span className="material-symbols-outlined">restaurant_menu</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-xl font-black text-[#e7e0ed]">
                  {editing ? 'Cập Nhật Combo' : 'Thêm Combo Mới'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Điền các thông tin của sản phẩm F&B cho menu của rạp.
                </p>
              </div>
            </div>

            <form onSubmit={save} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tên gói Combo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Combo Solo Sweet"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 placeholder-slate-600 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Đơn giá (VND)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 placeholder-slate-600 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Phân loại
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 transition-all outline-none appearance-none"
                  >
                    <option value="Cá nhân">Cá nhân (Solo)</option>
                    <option value="Đôi">Nhóm Đôi (Couple)</option>
                    <option value="Nhóm">Nhóm Lớn (Party)</option>
                    <option value="Gia đình">Gia đình (Family)</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Chi tiết vật phẩm bên trong
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Mô tả chi tiết, ví dụ: 1 bắp ngọt lớn 60oz + 1 Coca-Cola 22oz"
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 placeholder-slate-600 transition-all outline-none resize-none"
                  />
                </div>

                <div className="col-span-2 py-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 bg-white/5 border-white/10 focus:ring-violet-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-xs font-semibold text-[#e7e0ed] select-none cursor-pointer"
                  >
                    Kích hoạt phục vụ ngay tại quầy
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
                  {editing ? 'Cập Nhật' : 'Lưu Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
