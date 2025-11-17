import { useState } from 'react';

const AUTHZ_URL = process.env.NEXT_PUBLIC_AUTHZ_URL || 'http://localhost:3007';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${AUTHZ_URL}/auth/admin/login`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ email, adminKey }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login échoué');
      localStorage.setItem('admin_jwt', json.token);
      location.href = '/orgs';
    } catch (e: any) { setError(e.message || 'Erreur réseau'); }
    finally { setLoading(false); }
  };

  return (
    <main>
      <h2>Connexion Admin</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Admin Key" value={adminKey} onChange={e=>setAdminKey(e.target.value)} />
        <button onClick={login} disabled={loading}>Se connecter</button>
      </div>
    </main>
  );
}
