import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation de connexion (en production, appeler une vraie API)
    setTimeout(() => {
      if (email && password) {
        // Generer un faux JWT pour la demo
        const fakeToken = btoa(JSON.stringify({ email, role: 'forwarder', exp: Date.now() + 86400000 }));
        localStorage.setItem('forwarder_jwt', fakeToken);
        router.push('/dashboard');
      } else {
        alert('Veuillez remplir tous les champs');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 48,
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            RT Forwarder
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            Connectez-vous a votre espace Affret.IA
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="forwarder@example.com"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: 14,
              borderRadius: 8,
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#666' }}>
          <a href="/" style={{ color: '#667eea', fontWeight: 600 }}>
            Retour a l'accueil
          </a>
        </div>

        <div style={{
          marginTop: 32,
          padding: 16,
          background: '#f0f9ff',
          borderRadius: 8,
          fontSize: 12,
          color: '#1e3a8a'
        }}>
          <strong>Mode demo:</strong> Utilisez n'importe quel email et mot de passe pour vous connecter
        </div>
      </div>
    </div>
  );
}
