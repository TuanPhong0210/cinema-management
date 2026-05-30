import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { gqlRequest } from '../../services/graphql';

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const load = () => gqlRequest(`query { employees { id fullName isOnShift } attendances { id clockInTime clockOutTime employee { fullName } } }`).then((d) => { setEmployees(d.employees); setHistory(d.attendances); setEmployeeId((v) => v || d.employees[0]?.id || ''); });
  useEffect(load, []);
  const clock = async (type) => { await gqlRequest(`mutation($employeeId:ID!){ ${type}(employeeId:$employeeId){ id } }`, { employeeId }); load(); };
  return (
    <>
      <PageHeader title="Attendance" subtitle="Clock employees in and out" />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="panel">
          <select className="input mb-4" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>{employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} · {e.isOnShift ? 'on shift' : 'off shift'}</option>)}</select>
          <div className="grid grid-cols-2 gap-3"><button className="btn-primary" onClick={() => clock('clockIn')}>Clock In</button><button className="btn-secondary" onClick={() => clock('clockOut')}>Clock Out</button></div>
        </div>
        <div className="panel overflow-auto"><table className="w-full"><thead><tr><th className="table-th">Employee</th><th className="table-th">Clock In</th><th className="table-th">Clock Out</th></tr></thead><tbody>{history.map((a) => <tr key={a.id}><td className="table-td font-semibold">{a.employee?.fullName}</td><td className="table-td">{new Date(a.clockInTime).toLocaleString()}</td><td className="table-td">{a.clockOutTime ? new Date(a.clockOutTime).toLocaleString() : 'Active'}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}

