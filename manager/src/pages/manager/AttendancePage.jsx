import { useEffect, useState } from 'react';
import { gqlRequest } from '../../services/graphql';

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState(localStorage.getItem('managerRole') || 'Admin');
  const [time, setTime] = useState(new Date());
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState(null); // 'clockIn' or 'clockOut'

  useEffect(() => {
    const handleRoleChange = () => setRole(localStorage.getItem('managerRole') || 'Admin');
    window.addEventListener('roleChange', handleRoleChange);
    return () => window.removeEventListener('roleChange', handleRoleChange);
  }, []);

  // Update Clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load backend GraphQL data
  const load = () =>
    gqlRequest(`
      query {
        employees {
          id
          fullName
          isOnShift
          role
        }
        attendances {
          id
          clockInTime
          clockOutTime
          employee {
            fullName
            role
          }
        }
      }
    `).then((d) => {
      if (d) {
        setEmployees(d.employees || []);
        setHistory(d.attendances || []);
        // Automatically default to the first employee if none selected
        setEmployeeId((v) => v || d.employees?.[0]?.id || '');
      }
    });

  useEffect(() => {
    load();
  }, []);

  // Format digital time
  const formatTime = (t) => {
    return t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (t) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const day = days[t.getDay()];
    const date = t.getDate();
    const month = t.getMonth() + 1;
    const year = t.getFullYear();
    return `${day}, ngày ${date} tháng ${month}, ${year}`;
  };

  // GraphQL Clock Action with biometric scanner simulation
  const triggerClockBiometric = async (type) => {
    if (scanning) return;
    setScanning(true);
    setScanType(type);

    // Simulate standard premium 900ms fingerprint laser scan line animation
    setTimeout(async () => {
      try {
        await gqlRequest(
          `mutation($employeeId:ID!){
            ${type}(employeeId:$employeeId){
              id
            }
          }`,
          { employeeId }
        );
        load();
      } catch (err) {
        console.error('Biometric authentication failed:', err);
      } finally {
        setScanning(false);
        setScanType(null);
      }
    }, 900);
  };

  // Find active employee record
  const selectedEmployee = employees.find((e) => e.id === employeeId);
  const activeShift = selectedEmployee?.isOnShift;

  // Stats calculation
  const currentActiveStaffCount = employees.filter((e) => e.isOnShift).length;
  
  // Calculate attendance duration
  const getDuration = (clockIn, clockOut) => {
    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs} giờ ${diffMins} phút`;
    }
    return `${diffMins} phút`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>NHÂN SỰ</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-violet-300">ĐIỂM DANH BIOMETRIC</span>
          </nav>
          <h2 className="font-display-lg text-3xl font-black tracking-tight text-[#e7e0ed]">
            Điểm Danh & Ca Trực
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            Biometric Scanner: Quản lý giờ vào, giờ ra và lịch trực của nhân viên vận hành rạp.
          </p>
        </div>
      </div>

      {/* Bento Attendance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ca Trực Hiện Tại</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-lg">supervised_user_circle</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed] flex items-baseline gap-2">
              {currentActiveStaffCount}
              <span className="text-xs font-semibold text-emerald-400">Nhân viên</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Đang hoạt động tại rạp</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiệu Suất Đúng Giờ</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <span className="material-symbols-outlined text-lg">done_all</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed]">98.7%</div>
            <p className="text-[10px] text-violet-400 mt-1 font-semibold">Tỷ lệ đi làm đúng giờ ca sáng/tối</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trạng Thái Nhân Viên</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-lg">info</span>
            </div>
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-[#e7e0ed] truncate">
              {selectedEmployee ? selectedEmployee.fullName : 'Chưa chọn'}
            </div>
            <p className={`text-[10px] mt-1 font-bold flex items-center gap-1 ${
              activeShift ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeShift ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              {activeShift ? 'ĐANG TRONG CA TRỰC' : 'ĐANG OFF CA'}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lịch Trình Hôm Nay</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <span className="material-symbols-outlined text-lg">date_range</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-[#e7e0ed]">3 Ca</div>
            <p className="text-[10px] text-pink-400 mt-1 font-semibold">Ca Sáng - Ca Chiều - Ca Đêm</p>
          </div>
        </div>
      </div>

      {/* Interactive Biometric Area */}
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        
        {/* Left Side: Realtime clock + Biometric scan panel */}
        <div className="space-y-6">
          
          {/* Hologram Digital Clock */}
          <div className="glass-panel rounded-3xl p-6 border border-violet-500/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)] flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-pink-500/5"></div>
            <span className="text-[10px] font-black tracking-widest text-violet-400 uppercase mb-2">Hologram Digital Time</span>
            <div className="text-4xl font-mono font-black text-[#e7e0ed] tracking-widest drop-shadow-[0_0_15px_rgba(231,224,237,0.3)]">
              {formatTime(time)}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-2">
              {formatDate(time)}
            </div>
          </div>

          {/* Biometric Interactive Card */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="w-full mb-6 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Chọn nhân sự thực hiện
              </label>

              {role === 'Admin' ? (
                <div className="relative">
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-[#15121b]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] focus:ring-1 focus:ring-violet-500 transition-all outline-none appearance-none cursor-pointer"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.role || 'Nhân viên'}) · {e.isOnShift ? 'Đang trực' : 'Nghỉ ca'}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    unfold_more
                  </span>
                </div>
              ) : (
                <div className="bg-[#15121b]/80 border border-white/5 rounded-xl px-4 py-3 text-sm text-[#e7e0ed] flex items-center justify-between">
                  <span className="font-bold">
                    {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.role || 'Staff'})` : 'Đang đồng bộ...'}
                  </span>
                  <span className="text-[9px] bg-violet-600/20 text-violet-300 font-bold border border-violet-500/20 px-2 py-0.5 rounded">
                    Staff Locked
                  </span>
                </div>
              )}
            </div>

            {/* Simulated Fingerprint Biometric Scanner */}
            <div className="relative my-4 group select-none">
              
              {/* Outer Glowing Rings */}
              <div className={`absolute -inset-4 rounded-full bg-violet-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                scanning ? 'opacity-100 animate-pulse bg-violet-600/30' : ''
              }`}></div>

              <button
                onClick={() => triggerClockBiometric(activeShift ? 'clockOut' : 'clockIn')}
                disabled={scanning || !selectedEmployee}
                className={`w-32 h-32 rounded-full border flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden bg-[#1a1721] ${
                  scanning
                    ? 'border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.4)] scale-95'
                    : activeShift
                    ? 'border-emerald-500/40 text-emerald-400 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(52,211,153,0.2)]'
                    : 'border-violet-500/40 text-violet-400 hover:border-violet-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]'
                }`}
              >
                {/* Simulated Neon Scan Line Sweep */}
                {scanning && (
                  <div className="absolute left-0 w-full h-1 bg-violet-400 shadow-[0_0_12px_#a78bfa] animate-[bounce_0.8s_infinite] z-20"></div>
                )}

                <span className={`material-symbols-outlined text-5xl transition-all ${
                  scanning ? 'scale-110 opacity-70 text-violet-300' : 'group-hover:scale-110'
                }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  fingerprint
                </span>

                <span className="text-[8px] font-black uppercase tracking-widest mt-2 block">
                  {scanning ? 'AUTHENTICATING' : 'BIOMETRIC SCAN'}
                </span>
              </button>
            </div>

            <div className="mt-4 space-y-2 w-full">
              <h3 className="font-bold text-sm text-[#e7e0ed]">
                {scanning
                  ? 'Đang nhận diện vân tay...'
                  : activeShift
                  ? 'Nhấn quét để kết thúc ca trực'
                  : 'Nhấn quét để bắt đầu ca trực'}
              </h3>
              <p className="text-slate-500 text-[11px] max-w-xs mx-auto leading-relaxed">
                Hệ thống nhận diện mã vân tay nhân viên để đồng bộ dữ liệu chấm công thời gian thực.
              </p>
            </div>

            {/* Supplementary Manual Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6 w-full border-t border-white/5 pt-5">
              <button
                onClick={() => triggerClockBiometric('clockIn')}
                disabled={scanning || activeShift || !selectedEmployee}
                className="bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 disabled:opacity-30 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Clock In (Vào ca)
              </button>
              <button
                onClick={() => triggerClockBiometric('clockOut')}
                disabled={scanning || !activeShift || !selectedEmployee}
                className="bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 text-red-400 disabled:opacity-30 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Clock Out (Ra ca)
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Detailed Attendance Log Table */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between">
          <div>
            <div className="px-8 py-5 border-b border-white/5 bg-[#1f1b26]/50 flex items-center justify-between">
              <h3 className="font-headline-sm text-sm font-black text-violet-300 uppercase tracking-wider">
                Nhật Ký Chấm Công Rạp Chiếu
              </h3>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400 font-bold font-mono">
                Lượt ghi nhận: {history.length}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-transparent">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Nhân Viên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Vai Trò
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Giờ Bắt Đầu (Clock In)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                      Giờ Kết Thúc (Clock Out)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                      Tổng Thời Gian
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                      Trạng Thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((log) => {
                    const isActiveShift = !log.clockOutTime;

                    return (
                      <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-[#e7e0ed] whitespace-nowrap">
                          {log.employee?.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            log.employee?.role === 'Manager' || log.employee?.role === 'Quản lý'
                              ? 'bg-violet-600/10 border-violet-500/20 text-violet-300'
                              : 'bg-amber-600/10 border-amber-500/20 text-amber-300'
                          }`}>
                            {log.employee?.role || 'Nhân viên'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300 font-mono whitespace-nowrap">
                          {new Date(log.clockInTime).toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'medium'
                          })}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300 font-mono whitespace-nowrap">
                          {log.clockOutTime ? (
                            new Date(log.clockOutTime).toLocaleString('vi-VN', {
                              dateStyle: 'short',
                              timeStyle: 'medium'
                            })
                          ) : (
                            <span className="text-slate-500 italic">Chưa hoàn thành ca</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-bold text-violet-300 whitespace-nowrap">
                          {getDuration(log.clockInTime, log.clockOutTime)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            isActiveShift
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-500/10 border-white/5 text-slate-400'
                          }`}>
                            {isActiveShift && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>}
                            {isActiveShift ? 'ĐANG TRỰC CA' : 'HOÀN THÀNH'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {history.length === 0 && (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">event_busy</span>
              <h4 className="text-sm font-bold text-slate-400">Không có dữ liệu ca trực hôm nay</h4>
              <p className="text-slate-500 text-xs mt-1">Chưa có lượt điểm danh biometric nào được thực hiện.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
