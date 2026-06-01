import { useEffect, useState } from 'react';
import { gqlRequest } from '../../services/graphql';

const empty = { fullName: '', email: '', phone: '', role: 'Cashier', isOnShift: false };

export default function EmployeesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [role, setRole] = useState(localStorage.getItem('managerRole') || 'Admin');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Additional mock fields for rich UI forms
  const [gender, setGender] = useState('Nữ');
  const [birthdate, setBirthdate] = useState('1998-05-24');
  const [startDate, setStartDate] = useState('2023-10-12');
  const [defaultShift, setDefaultShift] = useState('afternoon');

  useEffect(() => {
    const handleRoleChange = () => setRole(localStorage.getItem('managerRole') || 'Admin');
    window.addEventListener('roleChange', handleRoleChange);
    return () => window.removeEventListener('roleChange', handleRoleChange);
  }, []);

  const load = () => gqlRequest(`query { employees { id fullName email phone role isOnShift } }`).then((d) => setItems(d.employees));
  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (role === 'Employee') return;
    const mutation = editing
      ? `mutation($id:ID!,$fullName:String,$email:String,$phone:String,$role:String,$isOnShift:Boolean){ updateEmployee(id:$id,fullName:$fullName,email:$email,phone:$phone,role:$role,isOnShift:$isOnShift){ id } }`
      : `mutation($fullName:String!,$email:String!,$phone:String!,$role:String!,$isOnShift:Boolean!){ createEmployee(fullName:$fullName,email:$email,phone:$phone,role:$role,isOnShift:$isOnShift){ id } }`;
    await gqlRequest(mutation, editing ? { id: editing, ...form } : form);
    setForm(empty);
    setEditing(null);
    setDrawerOpen(false);
    load();
  };

  const startEdit = (e) => {
    if (role === 'Employee') return;
    setEditing(e.id);
    setForm({ fullName: e.fullName, email: e.email, phone: e.phone, role: e.role, isOnShift: e.isOnShift });
    setDrawerOpen(true);
  };

  const startAdd = () => {
    if (role === 'Employee') return;
    setEditing(null);
    setForm(empty);
    setDrawerOpen(true);
  };

  const del = async (id) => {
    if (role === 'Employee') return;
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?')) {
      await gqlRequest(`mutation($id:ID!){ deleteEmployee(id:$id) }`, { id });
      load();
    }
  };

  // Static assets/mock data for rich display
  const getAvatarUrl = (id) => {
    const avatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBeLecrZDl13gDu0GjYB69G5m1fin7oQvQ99opbX_i9w57DFfqlUY4VflSvWrs9ACJJL1-3U9iNwdILiZQGF0BEL7eafKqFyFU93CsbXJDKJwp_H4q8XXGkd3__kRD7hFDvk5fVMLJJY-rvscDBET4o7Ep-SBT_rpZLfbaD5ksx5YhHy4KTz2zPVQsX01fr_xXQK7SrCpiocqzTpdWlUupiIljLGR1lMnkhjA0O_uThx_9j7wM5qdgBczetj2zS-7WaeSTVpA12mIM7',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCscsg3pbA6cRuH3ZImEx07_L5qSZblmRm2BjQF65P0yr0LYGM5e9G2yGVU4uU2kdu5lrqdEmsOjuGkJQ14Bm-ZXON_WSUuep98DQVmfaUmy0a9JDQE87-MPPUAaWgU_uPVzWn16sqodx6uX4WsKfAkHqmt0xCA4unSdSRkOmCZHK5De9ryi9zX5F_EvUQbQOK5qVvqU2bmygilmrIZvv5GTJV398fuDB-998DObReF6eqfDcZzoRzwqxqvNRnxBZ3rHSdpuHDodkxs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA2fMAyq2DiVDGqEdpBw8ZeB4g-wXN-whKMtfPzaWojyxJFFqnwafo5DvplwkqwTtDYkpcFXByovzccPbvv62yXcwXGUy7Xt1FjEV_YjQEE4y5RI1t60Qytql5dj4-eDyoPtYaWbc2NOiw8NWsFMGuxmza6Lu32VmOJxjbDN2vHXMdXjceLDAzfh7fByGCO8Yq-isbqc_SVToSckZQy_BQ2gbu0sBwQ5t2TfWMFBSST4JbO3LTwd0qZhwSK-yh-17jt8Jgh8OZdZ9fu',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAFSIRV3bLEYv4akdzmrWthrnMVm4wYqez5WbUdgVPHm0jUUYpi2T-SmSLCwhtUbNiIRpp43Xv2jMiem4Tlp2i6sv8GhewUKAQkKk7mFwAs_F3VlQkdL_kUjDHAfeZCnqiXcPPoEi0h0S_vQFL4LuVHWTwW0kjwUsWoZiiPdAkFyKozdQTv0Ii0p9DiTHHJyWEkMw-pqGYeTapY5tcVAnu-XHavsUOXTHFBXdZBd0NNzmp-SXtHvwh16eeDbBq5AeadFmALFKGB6Zew'
    ];
    return avatars[Number(id) % avatars.length];
  };

  const getRoleClass = (r) => {
    if (r === 'Manager' || r === 'Quản lý') return 'role-chip-manager';
    if (r === 'Cashier' || r === 'Bán vé') return 'role-chip-ticket';
    return 'bg-white/5 border border-white/10 text-slate-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>QUẢN TRỊ</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-violet-300">NHÂN VIÊN</span>
          </nav>
          <h2 className="font-display-lg text-3xl font-black tracking-tight text-[#e7e0ed]">Danh Sách Nhân Viên</h2>
          <p className="text-slate-400 mt-1 text-sm">Quản lý đội ngũ vận hành hệ thống CineAdmin Noir.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#1d1a23] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
            </button>
          </div>
          {role === 'Admin' && (
            <button
              onClick={startAdd}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 text-sm"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Thêm Nhân Viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ['Tổng nhân sự', items.length, 'groups', 'text-violet-400', 'bg-violet-500/10'],
          ['Đang trong ca', items.filter((x) => x.isOnShift).length, 'how_to_reg', 'text-emerald-400', 'bg-emerald-500/10'],
          ['Ngoại ca trực', items.filter((x) => !x.isOnShift).length, 'badge', 'text-amber-400', 'bg-amber-500/10'],
          ['Tình trạng máy', '8/8', 'warning', 'text-red-400', 'bg-red-500/10']
        ].map(([label, val, icon, color, bg], index) => (
          <div key={label} className="glass-panel p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${bg} rounded-2xl ${color}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <span className="text-emerald-400 font-bold text-xs">{index === 3 ? '100%' : '+12%'}</span>
            </div>
            <p className="text-slate-400 font-medium text-xs mb-1 uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-black text-[#e7e0ed]">{val}</h3>
          </div>
        ))}
      </div>

      {/* List View Data Table */}
      {viewMode === 'list' && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-5">Nhân Viên</th>
                  <th className="px-6 py-5">Liên Hệ</th>
                  <th className="px-6 py-5">Vai Trò</th>
                  <th className="px-6 py-5">Trạng Thái</th>
                  <th className="px-6 py-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#e7e0ed]">
                {items.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-violet-500/20 bg-[#1d1a23]">
                          <img alt="Portrait" className="w-full h-full object-cover" src={getAvatarUrl(e.id)} />
                        </div>
                        <div>
                          <p className="font-bold text-[#e7e0ed]">{e.fullName}</p>
                          <p className="text-[10px] text-slate-500">ID: #NV00{e.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#e7e0ed]">{e.phone}</p>
                      <p className="text-xs text-slate-500">{e.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleClass(e.role)}`}>
                        {e.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 font-bold text-xs ${e.isOnShift ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${e.isOnShift ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                        {e.isOnShift ? 'Đang trực' : 'Ngoại ca'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {role === 'Admin' ? (
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => startEdit(e)} className="p-2 text-slate-400 hover:text-violet-300 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => del(e.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
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

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((e) => (
            <div key={e.id} className="glass-panel p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl border-2 border-violet-500/20 overflow-hidden">
                  <img alt="Portrait" className="w-full h-full object-cover" src={getAvatarUrl(e.id)} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2 ${getRoleClass(e.role)}`}>
                    {e.role}
                  </span>
                  <div className={`flex items-center gap-1.5 font-bold text-[10px] ${e.isOnShift ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${e.isOnShift ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    {e.isOnShift ? 'Đang trực' : 'Ngoại ca'}
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-[#e7e0ed] text-base mb-1">{e.fullName}</h4>
              <p className="text-slate-500 text-xs mb-4">ID: #NV00{e.id}</p>
              <div className="space-y-2 border-t border-white/5 pt-4 mb-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>{e.phone}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span>{e.email}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {role === 'Admin' ? (
                  <>
                    <button onClick={() => startEdit(e)} className="flex-1 py-2.5 bg-white/5 hover:bg-violet-600 hover:text-white rounded-xl font-bold text-xs transition-all">Chi tiết</button>
                    <button onClick={() => del(e.id)} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all active:scale-90">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-xs text-slate-500 py-2.5 bg-white/5 rounded-xl">Chỉ xem</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide drawer / Details dialog modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <div className="glass w-full max-w-3xl rounded-3xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-violet-600/20 px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-display-lg text-lg text-violet-300 font-bold">{editing ? 'Chỉnh Sửa Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
              <button className="text-slate-400 hover:text-white" onClick={() => setDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={save} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left profile block */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-[#1d1a23] overflow-hidden border-2 border-violet-500/30 group-hover:border-violet-500 transition-all duration-300">
                      <img alt="Portrait" className="w-full h-full object-cover" src={getAvatarUrl(editing || '1')} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#e7e0ed] text-base">{form.fullName || 'Nhân Viên Mới'}</h4>
                    <p className="text-violet-400 text-xs font-semibold mt-1">{form.role}</p>
                  </div>
                </div>

                {/* Right form block */}
                <div className="md:col-span-2 space-y-6">
                  {/* Basic Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Họ và tên</label>
                      <input className="w-full px-4 py-2.5 rounded-xl cyber-input text-xs" placeholder="Nguyễn Văn A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ Email</label>
                      <input className="w-full px-4 py-2.5 rounded-xl cyber-input text-xs" placeholder="a.nguyen@email.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Số điện thoại</label>
                      <input className="w-full px-4 py-2.5 rounded-xl cyber-input text-xs" placeholder="0901234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ngày sinh</label>
                      <input className="w-full px-4 py-2.5 rounded-xl cyber-input text-xs" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
                    </div>
                  </div>

                  {/* Radio buttons for Gender */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Giới tính</label>
                    <div className="flex gap-6">
                      {['Nam', 'Nữ', 'Khác'].map((g) => (
                        <label key={g} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#e7e0ed]">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={gender === g}
                            onChange={() => setGender(g)}
                            className="text-violet-600 focus:ring-violet-500 bg-[#15121b] border-white/20"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Role & Duty Selects */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Chức vụ (Vai trò)</label>
                      <select className="w-full px-4 py-2.5 rounded-xl cyber-input text-xs bg-[#15121b]" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="Bán vé">Bán vé</option>
                        <option value="Bán combo">Bán combo</option>
                        <option value="Manager">Quản lý</option>
                        <option value="Quét dọn">Quét dọn</option>
                        <option value="Soát vé">Soát vé</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ca làm mặc định</label>
                      <select className="w-full px-4 py-2.5 rounded-xl cyber-input text-xs bg-[#15121b]" value={defaultShift} onChange={(e) => setDefaultShift(e.target.value)}>
                        <option value="morning">Ca Sáng (08:00 - 16:00)</option>
                        <option value="afternoon">Ca Chiều (15:00 - 23:00)</option>
                        <option value="night">Ca Đêm (22:00 - 06:00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ngày vào làm</label>
                      <input className="w-full px-4 py-2.5 rounded-xl cyber-input text-xs" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-1 flex items-center pt-5">
                      <label className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isOnShift}
                          onChange={(e) => setForm({ ...form, isOnShift: e.target.checked })}
                          className="rounded text-violet-600 focus:ring-violet-500 bg-[#15121b] border-white/20"
                        />
                        <span>Đang trong ca trực</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-4">
                <button type="button" className="px-6 py-3 rounded-xl text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider" onClick={() => setDrawerOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-violet-500/30 shadow-lg transition-all active:scale-95 text-xs uppercase tracking-wider">Lưu hồ sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

