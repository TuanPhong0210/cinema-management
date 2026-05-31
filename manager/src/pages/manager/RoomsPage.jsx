import { useEffect, useState } from 'react';
import SeatMap from '../../components/common/SeatMap';
import { gqlRequest } from '../../services/graphql';

const empty = { name: '', rows: 6, seatsPerRow: 10, screenType: '2D' };

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [activeRegion, setActiveRegion] = useState('TP. Hồ Chí Minh');
  const [activeTheater, setActiveTheater] = useState('CineNoir District 1');
  const [role, setRole] = useState(localStorage.getItem('managerRole') || 'Admin');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleRoleChange = () => setRole(localStorage.getItem('managerRole') || 'Admin');
    window.addEventListener('roleChange', handleRoleChange);
    return () => window.removeEventListener('roleChange', handleRoleChange);
  }, []);

  const load = () => gqlRequest(`query { rooms { id name rows seatsPerRow screenType } }`).then((d) => {
    setRooms(d.rooms);
    if (d.rooms.length > 0 && !selectedRoomId) {
      // Default select the first room
      edit(d.rooms[0]);
    }
  });

  useEffect(load, []);

  const showSeats = (id) => gqlRequest(`query($id:ID!){ roomSeats(id:$id){ id rowLabel seatNumber seatCode } }`, { id }).then((d) => setSeats(d.roomSeats));

  const save = async (e) => {
    e.preventDefault();
    if (role === 'Employee') return;
    const vars = { ...form, rows: Number(form.rows), seatsPerRow: Number(form.seatsPerRow) };
    const mutation = editing
      ? `mutation($id:ID!,$name:String,$rows:Int,$seatsPerRow:Int,$screenType:String){ updateRoom(id:$id,name:$name,rows:$rows,seatsPerRow:$seatsPerRow,screenType:$screenType){ id } }`
      : `mutation($name:String!,$rows:Int!,$seatsPerRow:Int!,$screenType:String!){ createRoom(name:$name,rows:$rows,seatsPerRow:$seatsPerRow,screenType:$screenType){ id } }`;
    await gqlRequest(mutation, editing ? { id: editing, ...vars } : vars);
    setForm(empty);
    setEditing(null);
    setModalOpen(false);
    load();
  };

  const edit = (r) => {
    setSelectedRoomId(r.id);
    setForm({ name: r.name, rows: r.rows, seatsPerRow: r.seatsPerRow, screenType: r.screenType });
    showSeats(r.id);
  };

  const startEdit = (r) => {
    if (role === 'Employee') return;
    setEditing(r.id);
    setForm({ name: r.name, rows: r.rows, seatsPerRow: r.seatsPerRow, screenType: r.screenType });
    setModalOpen(true);
  };

  const del = async (id) => {
    if (role === 'Employee') return;
    if (confirm('Bạn có chắc chắn muốn xóa phòng chiếu này không?')) {
      await gqlRequest(`mutation($id:ID!){ deleteRoom(id:$id) }`, { id });
      setSeats([]);
      setSelectedRoomId(null);
      load();
    }
  };

  // Mock static layout meta based on name/screenType for gorgeous visuals
  const getRoomMeta = (name, screenType) => {
    if (screenType === 'IMAX') {
      return { badge: 'Phòng VIP', rating: '4.9', tags: ['Double Seats', 'Dolby Atmos', 'Leather Seats'] };
    }
    if (screenType === '3D') {
      return { badge: 'Phòng Đặc Biệt', rating: '4.6', tags: ['Double Seats', 'Couple Zone', '4D Motion'] };
    }
    return { badge: 'Tiêu Chuẩn', rating: '4.2', tags: ['Standard Sound', 'Double Seats'] };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-violet-300">Quản lý phòng chiếu</span>
          </nav>
          <h1 className="font-display-lg text-3xl text-violet-300 tracking-tight">Rạp Chiếu Toàn Quốc</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 glass-panel rounded-xl hover:bg-white/5 transition-all text-sm font-semibold text-slate-300">
            <span className="material-symbols-outlined text-base">filter_alt</span>
            <span>Bộ lọc</span>
          </button>
          {role === 'Admin' && (
            <button
              onClick={() => { setForm(empty); setEditing(null); setModalOpen(true); }}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 text-sm"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Thêm Phòng</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Region Sidebar & Halls Display */}
      <div className="grid grid-cols-12 gap-8">
        {/* City/Theater List Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <h3 className="font-headline-sm text-sm text-slate-400 font-bold uppercase tracking-widest px-2">Khu Vực</h3>

          {/* TP. HCM */}
          <div
            onClick={() => setActiveRegion('TP. Hồ Chí Minh')}
            className={`glass-panel p-6 rounded-2xl border-l-4 cursor-pointer hover:translate-x-1 transition-all duration-300 ${
              activeRegion === 'TP. Hồ Chí Minh' ? 'border-violet-500 shadow-md shadow-violet-500/5' : 'border-transparent opacity-70'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-headline-sm text-base text-violet-300 font-bold mb-1">TP. Hồ Chí Minh</h4>
                <p className="text-slate-400 text-xs font-semibold">8 Cụm rạp | {rooms.length} Phòng chiếu</p>
              </div>
              <span className="material-symbols-outlined text-violet-400">location_city</span>
            </div>
            {activeRegion === 'TP. Hồ Chí Minh' && (
              <div className="space-y-2 mt-4">
                {['CineNoir District 1', 'CineNoir Landmark 81', 'CineNoir Thảo Điền'].map((theater) => (
                  <div
                    key={theater}
                    onClick={(e) => { e.stopPropagation(); setActiveTheater(theater); }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${
                      activeTheater === theater
                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    <span>{theater}</span>
                    <span className="material-symbols-outlined text-sm">{activeTheater === theater ? 'check_circle' : 'chevron_right'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ha Noi */}
          <div
            onClick={() => setActiveRegion('Hà Nội')}
            className={`glass-panel p-6 rounded-2xl border-l-4 cursor-pointer hover:translate-x-1 transition-all duration-300 ${
              activeRegion === 'Hà Nội' ? 'border-violet-500 shadow-md shadow-violet-500/5' : 'border-transparent opacity-70'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-headline-sm text-base text-[#e7e0ed] font-bold mb-1">Hà Nội</h4>
                <p className="text-slate-400 text-xs">6 Cụm rạp | 30 Phòng chiếu</p>
              </div>
              <span className="material-symbols-outlined text-slate-400">location_on</span>
            </div>
          </div>

          {/* Da Nang */}
          <div
            onClick={() => setActiveRegion('Đà Nẵng')}
            className={`glass-panel p-6 rounded-2xl border-l-4 cursor-pointer hover:translate-x-1 transition-all duration-300 ${
              activeRegion === 'Đà Nẵng' ? 'border-violet-500 shadow-md shadow-violet-500/5' : 'border-transparent opacity-70'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-headline-sm text-base text-[#e7e0ed] font-bold mb-1">Đà Nẵng</h4>
                <p className="text-slate-400 text-xs">3 Cụm rạp | 15 Phòng chiếu</p>
              </div>
              <span className="material-symbols-outlined text-slate-400">waves</span>
            </div>
          </div>
        </div>

        {/* Room display and Seat map preview */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-600/20 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-violet-300 text-2xl">theater_comedy</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg text-[#e7e0ed] font-bold">{activeTheater}</h3>
                  <p className="text-slate-400 text-xs">Khu vực {activeRegion} · Quản lý phòng & sơ đồ ghế</p>
                </div>
              </div>
            </div>

            {/* Room cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((r) => {
                const meta = getRoomMeta(r.name, r.screenType);
                const isSelected = selectedRoomId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => edit(r)}
                    className={`room-card glass-panel rounded-2xl p-6 flex flex-col group cursor-pointer border hover:-translate-y-1 transition-all duration-300 ${
                      isSelected ? 'border-violet-500 shadow-lg shadow-violet-500/10' : 'border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.screenType === 'IMAX' ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300' : 'bg-white/10 border border-white/20 text-slate-400'
                      }`}>
                        {meta.badge}
                      </div>
                      <div className="flex items-center text-amber-400 gap-0.5">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold">{meta.rating}</span>
                      </div>
                    </div>

                    <h5 className="font-headline-sm text-base text-[#e7e0ed] font-bold mb-2 group-hover:text-violet-300 transition-colors">{r.name}</h5>

                    <div className="flex items-center gap-4 mb-6 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">airline_seat_recline_extra</span>
                        <span>{r.rows * r.seatsPerRow} Ghế</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">aspect_ratio</span>
                        <span>{r.screenType}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {meta.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400 font-semibold">{tag}</span>
                      ))}
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); edit(r); }}
                        className={`flex-grow py-2.5 rounded-xl font-bold text-xs transition-all ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-white/5 hover:bg-violet-600 hover:text-white'
                        }`}
                      >
                        Sơ đồ ghế
                      </button>
                      {role === 'Admin' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(r); }}
                            className="p-2 bg-white/5 hover:bg-violet-600/20 text-slate-400 hover:text-violet-300 rounded-xl transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); del(r.id); }}
                            className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seat Mapper preview panel */}
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h4 className="font-display-lg text-sm text-slate-400 font-bold uppercase tracking-wider">Preview Sơ Đồ Ghế Chi Tiết</h4>
            {seats.length > 0 ? (
              <div className="flex flex-col items-center py-6 border border-white/5 bg-[#1d1a23]/30 rounded-2xl">
                <div className="w-4/5 h-2 bg-violet-600/30 rounded-full mb-8 text-center text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center justify-center">MÀN HÌNH</div>
                <SeatMap seats={seats} />
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm font-medium">Vui lòng chọn phòng chiếu phía trên để xem sơ đồ chi tiết.</div>
            )}
          </div>
        </div>
      </div>

      {/* CRUD Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="glass w-full max-w-xl rounded-3xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-violet-600/20 px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-display-lg text-lg text-violet-300 font-bold">{editing ? 'Chỉnh Sửa Phòng Chiếu' : 'Thêm Phòng Chiếu Mới'}</h3>
              <button className="text-slate-400 hover:text-white" onClick={() => setModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={save} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tên phòng chiếu</label>
                <input className="w-full px-4 py-3 rounded-xl cyber-input text-sm" placeholder="VD: Phòng Chiếu 01 (VIP)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hàng ghế (Rows)</label>
                  <input className="w-full px-4 py-3 rounded-xl cyber-input text-sm" type="number" min="1" max="15" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ghế mỗi hàng</label>
                  <input className="w-full px-4 py-3 rounded-xl cyber-input text-sm" type="number" min="1" max="20" value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Loại phòng</label>
                  <select className="w-full px-4 py-3 rounded-xl cyber-input text-sm bg-[#15121b]" value={form.screenType} onChange={(e) => setForm({ ...form, screenType: e.target.value })}>
                    <option value="2D">2D Tiêu Chuẩn</option>
                    <option value="3D">3D Đặc Biệt</option>
                    <option value="IMAX">IMAX Cinema</option>
                  </select>
                </div>
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

