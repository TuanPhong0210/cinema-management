import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { gqlRequest } from '../../services/graphql';

const empty = { title: '', description: '', genre: '', durationMinutes: 100, posterUrl: '', status: 'now showing' };
const fields = `id title description genre durationMinutes posterUrl status`;

export default function MoviesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const load = () => gqlRequest(`query { movies { ${fields} } }`).then((d) => setItems(d.movies));
  useEffect(load, []);
  const save = async (e) => {
    e.preventDefault();
    const vars = { ...form, durationMinutes: Number(form.durationMinutes) };
    const mutation = editing ? `mutation($id:ID!,$title:String,$description:String,$genre:String,$durationMinutes:Int,$posterUrl:String,$status:String){ updateMovie(id:$id,title:$title,description:$description,genre:$genre,durationMinutes:$durationMinutes,posterUrl:$posterUrl,status:$status){ id } }` : `mutation($title:String!,$description:String!,$genre:String!,$durationMinutes:Int!,$posterUrl:String!,$status:String!){ createMovie(title:$title,description:$description,genre:$genre,durationMinutes:$durationMinutes,posterUrl:$posterUrl,status:$status){ id } }`;
    await gqlRequest(mutation, editing ? { id: editing, ...vars } : vars);
    setForm(empty); setEditing(null); load();
  };
  const edit = (m) => { setEditing(m.id); setForm({ title: m.title, description: m.description, genre: m.genre, durationMinutes: m.durationMinutes, posterUrl: m.posterUrl, status: m.status }); };
  const del = async (id) => { await gqlRequest(`mutation($id:ID!){ deleteMovie(id:$id) }`, { id }); load(); };
  return (
    <>
      <PageHeader title="Movie Management" subtitle="Create and maintain cinema catalog" />
      <form onSubmit={save} className="panel mb-6 grid gap-3 lg:grid-cols-3">
        {['title', 'genre', 'posterUrl'].map((k) => <input key={k} className="input" placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required />)}
        <input className="input" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>now showing</option><option>coming soon</option><option>inactive</option></select>
        <textarea className="input lg:col-span-3" placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <button className="btn-primary lg:col-span-3">{editing ? 'Update Movie' : 'Create Movie'}</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((m) => <div key={m.id} className="panel"><img src={m.posterUrl} className="mb-4 h-48 w-full rounded-md object-cover" /><h3 className="font-bold">{m.title}</h3><p className="text-sm text-slate-500">{m.genre} · {m.durationMinutes} min · {m.status}</p><p className="mt-2 line-clamp-2 text-sm">{m.description}</p><div className="mt-4 flex gap-2"><button className="btn-secondary" onClick={() => edit(m)}>Edit</button><button className="btn-secondary" onClick={() => del(m.id)}>Delete</button></div></div>)}
      </div>
    </>
  );
}

