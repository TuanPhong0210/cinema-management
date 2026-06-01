import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { gqlRequest } from '../../services/graphql';

const empty = { movieId: '', roomId: '', showDate: new Date().toISOString().slice(0, 10), startTime: '19:00', endTime: '21:00', ticketPrice: 95000 };

export default function ShowtimesPage() {
  const [items, setItems] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const load = () => gqlRequest(`query { showtimes { id movieId roomId showDate startTime endTime ticketPrice movie { title } room { name screenType } } movies { id title } rooms { id name } }`).then((d) => { setItems(d.showtimes); setMovies(d.movies); setRooms(d.rooms); });
  useEffect(() => {
    load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    const vars = { ...form, ticketPrice: Number(form.ticketPrice) };
    const mutation = editing ? `mutation($id:ID!,$movieId:ID,$roomId:ID,$showDate:String,$startTime:String,$endTime:String,$ticketPrice:Float){ updateShowtime(id:$id,movieId:$movieId,roomId:$roomId,showDate:$showDate,startTime:$startTime,endTime:$endTime,ticketPrice:$ticketPrice){ id } }` : `mutation($movieId:ID!,$roomId:ID!,$showDate:String!,$startTime:String!,$endTime:String!,$ticketPrice:Float!){ createShowtime(movieId:$movieId,roomId:$roomId,showDate:$showDate,startTime:$startTime,endTime:$endTime,ticketPrice:$ticketPrice){ id } }`;
    await gqlRequest(mutation, editing ? { id: editing, ...vars } : vars);
    setForm(empty); setEditing(null); load();
  };
  const edit = (s) => { setEditing(s.id); setForm({ movieId: String(s.movieId), roomId: String(s.roomId), showDate: s.showDate, startTime: s.startTime, endTime: s.endTime, ticketPrice: s.ticketPrice }); };
  const del = async (id) => { await gqlRequest(`mutation($id:ID!){ deleteShowtime(id:$id) }`, { id }); load(); };
  return (
    <>
      <PageHeader title="Showtimes" subtitle="Creating a showtime generates a fresh seat map" />
      <form onSubmit={save} className="panel mb-6 grid gap-3 lg:grid-cols-6">
        <select required className="input lg:col-span-2" value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })}><option value="">Movie</option>{movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
        <select required className="input" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}><option value="">Room</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <input className="input" type="date" value={form.showDate} onChange={(e) => setForm({ ...form, showDate: e.target.value })} />
        <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        <input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        <input className="input" type="number" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} />
        <button className="btn-primary lg:col-span-5">{editing ? 'Update Showtime' : 'Create Showtime'}</button>
      </form>
      <div className="panel overflow-auto"><table className="w-full"><thead><tr><th className="table-th">Movie</th><th className="table-th">Room</th><th className="table-th">Time</th><th className="table-th">Price</th><th className="table-th"></th></tr></thead><tbody>{items.map((s) => <tr key={s.id}><td className="table-td font-semibold">{s.movie?.title}</td><td className="table-td">{s.room?.name}</td><td className="table-td">{s.showDate} {s.startTime}-{s.endTime}</td><td className="table-td">{Number(s.ticketPrice).toLocaleString()}</td><td className="table-td flex gap-2"><button className="btn-secondary" onClick={() => edit(s)}>Edit</button><button className="btn-secondary" onClick={() => del(s.id)}>Delete</button></td></tr>)}</tbody></table></div>
    </>
  );
}
