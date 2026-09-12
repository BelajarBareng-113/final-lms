import { useState } from 'react';
import api, { setToken } from '../api.js';

export default function LoginAdmin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api('/auth/login', {
      method: 'POST',
      body: { username, password },
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.data.message || 'Login gagal.');
      return;
    }

    setToken(res.data.token);
    onLogin();
  };

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <h2>Login Admin</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <div className="msg err">{error}</div>}

        <button className="btn" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}