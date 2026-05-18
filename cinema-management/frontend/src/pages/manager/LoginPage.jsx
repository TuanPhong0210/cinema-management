import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gqlRequest } from '../../services/graphql';

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@cinema.com', password: 'admin123' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await gqlRequest(`mutation Login($email:String!, $password:String!){ login(email:$email,password:$password){ token manager{ name email } } }`, form, false);
      localStorage.setItem('managerToken', data.login.token);
      navigate('/manager');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-cinema-950 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-md bg-cinema-900 text-white"><FontAwesomeIcon icon={faLock} /></div>
          <h1 className="text-2xl font-extrabold text-cinema-950">Manager Login</h1>
          <p className="text-sm text-slate-500">Access the cinema operations dashboard.</p>
        </div>
        {error && <div className="mb-4 rounded-md bg-pink-50 px-3 py-2 text-sm text-pink-700">{error}</div>}
        <label className="mb-3 block text-sm font-semibold">Email<input className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="mb-5 block text-sm font-semibold">Password<input type="password" className="input mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn-primary w-full">Login</button>
      </form>
    </div>
  );
}

