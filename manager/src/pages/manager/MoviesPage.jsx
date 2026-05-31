import { useEffect, useState } from 'react';
import { gqlRequest } from '../../services/graphql';

const empty = { title: '', description: '', genre: '', durationMinutes: 100, posterUrl: '', status: 'now showing' };
const fields = `id title description genre durationMinutes posterUrl status`;

export default function MoviesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'now showing', 'coming soon', 'inactive'
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [role, setRole] = useState(localStorage.getItem('managerRole') || 'Admin');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleRoleChange = () => setRole(localStorage.getItem('managerRole') || 'Admin');
    window.addEventListener('roleChange', handleRoleChange);
    return () => window.removeEventListener('roleChange', handleRoleChange);
  }, []);

  const load = () => gqlRequest(`query { movies { ${fields} } }`).then((d) => setItems(d.movies));
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    if (role === 'Employee') return;
    const vars = { ...form, durationMinutes: Number(form.durationMinutes) };
    const mutation = editing
      ? `mutation($id:ID!,$title:String,$description:String,$genre:String,$durationMinutes:Int,$posterUrl:String,$status:String){ updateMovie(id:$id,title:$title,description:$description,genre:$genre,durationMinutes:$durationMinutes,posterUrl:$posterUrl,status:$status){ id } }`
      : `mutation($title:String!,$description:String!,$genre:String!,$durationMinutes:Int!,$posterUrl:String!,$status:String!){ createMovie(title:$title,description:$description,genre:$genre,durationMinutes:$durationMinutes,posterUrl:$posterUrl,status:$status){ id } }`;
    await gqlRequest(mutation, editing ? { id: editing, ...vars } : vars);
    setForm(empty);
    setEditing(null);
    setModalOpen(false);
    load();
  };

  const edit = (m) => {
    if (role === 'Employee') return;
    setEditing(m.id);
    setForm({ title: m.title, description: m.description, genre: m.genre, durationMinutes: m.durationMinutes, posterUrl: m.posterUrl, status: m.status });
    setModalOpen(true);
  };

  const del = async (id) => {
    if (role === 'Employee') return;
    if (confirm('Bạn có chắc chắn muốn xóa phim này không?')) {
      await gqlRequest(`mutation($id:ID!){ deleteMovie(id:$id) }`, { id });
      load();
    }
  };

  // Sort and filter logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredItems = items
    .filter(item => filterStatus === 'all' || item.status === filterStatus)
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display-lg text-3xl font-black text-violet-300 mb-1">Quản lý Phim</h2>
          <p className="font-body-md text-sm text-slate-400">Thư viện nội dung Noir Cinematic ({items.length} phim)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#1d1a23] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-violet-600/20 text-violet-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
              <span className="font-label-sm text-xs">Lưới</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-violet-600/20 text-violet-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">list</span>
              <span className="font-label-sm text-xs">Danh sách</span>
            </button>
          </div>
          {role === 'Admin' && (
            <button
              onClick={() => { setForm(empty); setEditing(null); setModalOpen(true); }}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 text-sm"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Phim Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {[
          ['all', 'Tất cả Phim'],
          ['now showing', 'Đang chiếu'],
          ['coming soon', 'Sắp ra mắt'],
          ['inactive', 'Ngừng chiếu']
        ].map(([status, label]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-5 py-2 rounded-full border text-xs font-semibold transition-all ${
              filterStatus === status
                ? 'border-violet-500 bg-violet-600/10 text-violet-300 font-bold'
                : 'border-white/10 text-slate-400 hover:border-violet-500/50 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((m) => (
            <div key={m.id} className="group relative rounded-2xl overflow-hidden glass-panel flex flex-col hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-[2/3] overflow-hidden relative">
                <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg ${
                  m.status === 'now showing' ? 'bg-violet-600 text-white' : 'bg-[#1d1a23] text-slate-400'
                }`}>
                  {m.status === 'now showing' ? 'Đang chiếu' : m.status === 'coming soon' ? 'Sắp chiếu' : 'Ngừng chiếu'}
                </div>
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-amber-400">
                  <span className="font-bold text-sm">8.4</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#15121b] via-[#15121b]/40 to-transparent opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex flex-col justify-end p-5 z-10">
                  {role === 'Admin' ? (
                    <div className="flex gap-2">
                      <button onClick={() => edit(m)} className="flex-1 py-2 bg-violet-600 text-white rounded-lg font-bold text-xs hover:bg-violet-500 active:scale-95 transition-all">Sửa</button>
                      <button onClick={() => del(m.id)} className="flex-1 py-2 bg-[#2c2832] text-[#e7e0ed] rounded-lg font-bold text-xs hover:bg-[#37333d] active:scale-95 transition-all">Xóa</button>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400 bg-black/60 py-2 rounded-lg">Chỉ xem (Employee)</div>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display-lg text-[18px] text-[#e7e0ed] font-bold truncate mb-1">{m.title}</h3>
                <p className="text-slate-400 font-label-sm text-xs mb-4">{m.genre} · {m.durationMinutes} phút</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Giá vé</span>
                    <span className="font-bold text-violet-300">120.000đ</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Suất chiếu</span>
                    <span className="font-bold">24</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th onClick={() => handleSort('title')} className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2">Phim {sortField === 'title' && <span className="material-symbols-outlined text-xs">{sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}</span>}</div>
                  </th>
                  <th onClick={() => handleSort('genre')} className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2">Thể loại {sortField === 'genre' && <span className="material-symbols-outlined text-xs">{sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}</span>}</div>
                  </th>
                  <th onClick={() => handleSort('durationMinutes')} className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors text-center">
                    <div className="flex items-center justify-center gap-2">Thời lượng {sortField === 'durationMinutes' && <span className="material-symbols-outlined text-xs">{sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}</span>}</div>
                  </th>
                  <th onClick={() => handleSort('status')} className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors text-center">
                    <div className="flex items-center justify-center gap-2">Trạng thái {sortField === 'status' && <span className="material-symbols-outlined text-xs">{sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}</span>}</div>
                  </th>
                  <th className="px-6 py-4 text-center">Đánh giá</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#e7e0ed]">
                {filteredItems.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold">
                      <div className="flex items-center gap-4">
                        <img src={m.posterUrl} alt={m.title} className="w-10 h-14 rounded object-cover border border-white/10" />
                        <span className="group-hover:text-violet-300 transition-colors">{m.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{m.genre}</td>
                    <td className="px-6 py-4 text-center text-slate-400">{m.durationMinutes} phút</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status === 'now showing' ? 'bg-violet-600/10 text-violet-300' : 'bg-white/5 text-slate-400'
                      }`}>
                        {m.status === 'now showing' ? 'Đang chiếu' : m.status === 'coming soon' ? 'Sắp chiếu' : 'Ngừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-400">
                        <span className="font-bold">8.4</span>
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {role === 'Admin' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => edit(m)} className="p-2 text-slate-400 hover:text-violet-300 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => del(m.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="glass w-full max-w-2xl rounded-3xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-violet-600/20 px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-display-lg text-lg text-violet-300 font-bold">{editing ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}</h3>
              <button className="text-slate-400 hover:text-white" onClick={() => setModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={save} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tên phim</label>
                  <input className="w-full px-4 py-3 rounded-xl cyber-input text-sm" placeholder="VD: Oppenheimer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Thể loại</label>
                  <input className="w-full px-4 py-3 rounded-xl cyber-input text-sm" placeholder="VD: Hành động, Viễn tưởng" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Thời lượng (phút)</label>
                  <input className="w-full px-4 py-3 rounded-xl cyber-input text-sm" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Trạng thái</label>
                  <select className="w-full px-4 py-3 rounded-xl cyber-input text-sm bg-[#15121b]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="now showing">Đang chiếu</option>
                    <option value="coming soon">Sắp chiếu</option>
                    <option value="inactive">Ngừng chiếu</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">URL Poster</label>
                <input className="w-full px-4 py-3 rounded-xl cyber-input text-sm" placeholder="https://images.unsplash.com/..." value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mô tả phim</label>
                <textarea className="w-full h-28 px-4 py-3 rounded-xl cyber-input text-sm" placeholder="Mô tả nội dung cốt truyện..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" className="px-6 py-3 rounded-xl text-slate-400 hover:text-white transition-colors" onClick={() => setModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-violet-500/30 shadow-lg transition-all active:scale-95">Lưu cấu hình</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

