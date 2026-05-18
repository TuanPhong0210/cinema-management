import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SeatMap from '../../components/common/SeatMap';
import { gqlRequest } from '../../services/graphql';

const empty = { name: '', rows: 5, seatsPerRow: 8, screenType: '2D' };

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const load = () => gqlRequest(`query { rooms { id name rows seatsPerRow screenType } }`).then((d) => setRooms(d.rooms));
  useEffect(load, []);
  const showSeats = (id) => gqlRequest(`query($id:ID!){ roomSeats(id:$id){ id rowLabel seatNumber seatCode } }`, { id }).then((d) => setSeats(d.roomSeats));
  const save = async (e) => {
    e.preventDefault();
    const vars = { ...form, rows: Number(form.rows), seatsPerRow: Number(form.seatsPerRow) };
    const mutation = editing ? `mutation($id:ID!,$name:String,$rows:Int,$seatsPerRow:Int,$screenType:String){ updateRoom(id:$id,name:$name,rows:$rows,seatsPerRow:$seatsPerRow,screenType:$screenType){ id } }` : `mutation($name:String!,$rows:Int!,$seatsPerRow:Int!,$screenType:String!){ createRoom(name:$name,rows:$rows,seatsPerRow:$seatsPerRow,screenType:$screenType){ id } }`;
    await gqlRequest(mutation, editing ? { id: editing, ...vars } : vars);
    setForm(empty); setEditing(null); setSeats([]); load();
  };
  const edit = (r) => { setEditing(r.id); setForm({ name: r.name, rows: r.rows, seatsPerRow: r.seatsPerRow, screenType: r.screenType }); showSeats(r.id); };
  const del = async (id) => { await gqlRequest(`mutation($id:ID!){ deleteRoom(id:$id) }`, { id }); load(); };
  return (
    <>
      <PageHeader title="Cinema Rooms" subtitle="Rooms generate seats automatically from rows and seats per row" />
      <form onSubmit={save} className="panel mb-6 grid gap-3 md:grid-cols-5">
        <input className="input md:col-span-2" placeholder="Room name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" type="number" min="1" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })} />
        <input className="input" type="number" min="1" value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: e.target.value })} />
        <select className="input" value={form.screenType} onChange={(e) => setForm({ ...form, screenType: e.target.value })}><option>2D</option><option>3D</option><option>IMAX</option></select>
        <button className="btn-primary md:col-span-5">{editing ? 'Update Room' : 'Create Room'}</button>
      </form>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="panel overflow-auto"><table className="w-full"><thead><tr><th className="table-th">Room</th><th className="table-th">Layout</th><th className="table-th"></th></tr></thead><tbody>{rooms.map((r) => <tr key={r.id}><td className="table-td font-semibold">{r.name}<p className="text-xs text-slate-500">{r.screenType}</p></td><td className="table-td">{r.rows} x {r.seatsPerRow}</td><td className="table-td flex gap-2"><button className="btn-secondary" onClick={() => edit(r)}>Edit</button><button className="btn-secondary" onClick={() => del(r.id)}>Delete</button></td></tr>)}</tbody></table></div>
        <div className="panel">{seats.length ? <SeatMap seats={seats} /> : <p className="text-sm text-slate-500">Select a room to preview its seat layout.</p>}</div>
      </div>
    </>
  );
}

