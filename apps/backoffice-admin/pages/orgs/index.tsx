import { useEffect, useState } from 'react';

const ADMIN_GATEWAY = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3008';

interface OrgItem { id: string; name: string; role: string; status: string; plan?: string; addons?: string[] }

export default function OrgsList() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrgItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setLoading(true); setError(null);
    try {
      const headers: any = {};
      if (typeof window !== 'undefined') {
        const t = window.localStorage.getItem('admin_jwt');
        if (t) headers['authorization'] = `Bearer ${t}`;
      }
      const res = await fetch(`${ADMIN_GATEWAY}/admin/orgs?query=${encodeURIComponent(query)}`, { headers });
      const json = await res.json();
      setItems(json.items || []);
    } catch (e: any) {
      setError(e.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  return (
    <main>
      <h2>Organisations</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher (nom/email/id)" />
        <button onClick={search} disabled={loading}>Rechercher</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border={1} cellPadding={6}>
        <thead>
          <tr><th>ID</th><th>Nom</th><th>Rôle</th><th>Statut</th><th>Plan</th><th>Addons</th><th></th></tr>
        </thead>
        <tbody>
          {items.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.name}</td>
              <td>{o.role}</td>
              <td>{o.status}</td>
              <td>{o.plan}</td>
              <td>{(o.addons||[]).join(', ')}</td>
              <td><a href={`/orgs/${o.id}`}>Ouvrir</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
