import { useState } from 'react';
import LoginAdmin from './views/LoginAdmin.jsx';
import AdminDashboard from './views/AdminDashboard.jsx';
import { getToken, clearToken } from './api.js';

export default function App() {
  const [view, setView] = useState('login');
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  const handleLogin = () => {
    setLoggedIn(true);
    setView('admin');
  };

  const handleLogout = () => {
    clearToken();
    setLoggedIn(false);
    setView('login');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Belajar Bahasa Jepang</div>
      </header>

      <main>
        {view === 'login' && <LoginAdmin onLogin={handleLogin} />}
        {view === 'admin' && loggedIn && <AdminDashboard onLogout={handleLogout} />}
      </main>
    </div>
  );
}