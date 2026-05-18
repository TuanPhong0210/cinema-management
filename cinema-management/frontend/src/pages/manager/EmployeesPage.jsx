import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { gqlRequest } from '../../services/graphql';

const empty = { fullName: '', email: '', phone: '', role: 'Cashier', isOnShift: false };

export default function EmployeesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const load = () => gqlRequest(`query { employees { id fullName email phone role isOnShift } }`).then((d) => setItems(d.employees));
  useEffect(load, []);
  const save = async (e) => {
    e.preventDefault();
    const mutation = editing ? `mutation($id:ID!,$fullName:String,$email:String,$phone:String,$role:String,$isOnShift:Boolean){ updateEmployee(id:$id,fullName:$fullName,email:$email,phone:$phone,role:$role,isOnShift:$isOnShift){ id } }` : `mutation($fullName:String!,$email:String!,$phone:String!,$role:String!,$isOnShift:Boolean!){ createEmployee(fullName:$fullName,email:$email,phone:$phone,role:$role,isOnShift:$isOnShift){ id } }`;
    await gqlRequest(mutation, editing ? { id: editing, ...form } : form);
    setForm(empty); setEditing(null); load();
  };
  const edit = (e) => { setEditing(e.id); setForm({ fullName: e.fullName, email: e.email, phone: e.phone, role: e.role, isOnShift: e.isOnShift }); };
  const del = async (id) => { await gqlRequest(`mutation($id:ID!){ deleteEmployee(id:$id) }`, { id }); load(); };
  return (
    <>
      <PageHeader title="Employees" subtitle="Manage staff and shift status" />
      <form onSubmit={save} className="panel mb-6 grid gap-3 md:grid-cols-5">
        <input className="input" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input className="input" placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isOnShift} onChange={(e) => setForm({ ...form, isOnShift: e.target.checked })} /> On shift</label>
        <button className="btn-primary md:col-span-5">{editing ? 'Update Employee' : 'Create Employee'}</button>
      </form>
      <div className="panel overflow-auto"><table className="w-full"><thead><tr><th className="table-th">Name</th><th className="table-th">Contact</th><th className="table-th">Role</th><th className="table-th">Shift</th><th className="table-th"></th></tr></thead><tbody>{items.map((e) => <tr key={e.id}><td className="table-td font-semibold">{e.fullName}</td><td className="table-td">{e.email}<p className="text-xs text-slate-500">{e.phone}</p></td><td className="table-td">{e.role}</td><td className="table-td"><span className={`rounded px-2 py-1 text-xs font-bold ${e.isOnShift ? 'bg-violet-100 text-cinema-700' : 'bg-slate-100 text-slate-600'}`}>{e.isOnShift ? 'on shift' : 'off shift'}</span></td><td className="table-td flex gap-2"><button className="btn-secondary" onClick={() => edit(e)}>Edit</button><button className="btn-secondary" onClick={() => del(e.id)}>Delete</button></td></tr>)}</tbody></table></div>
    </>
  );
}

