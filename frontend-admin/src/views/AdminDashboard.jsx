import { useState } from 'react';
import AdminAkunTab from './AdminAkunTab.jsx';
import AdminAnggotaTab from './AdminAnggotaTab.jsx';
import AdminKelasTab from './AdminKelasTab.jsx';
import AbsenTab from './AbsenTab.jsx';

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('admin');

  const tabs = [
    { id: 'admin', label: 'Kelola Admin' },
    { id: 'anggota', label: 'Anggota' },
    { id: 'kelas', label: 'Kelas' },
    { id: 'absen', label: 'Absensi Hari Ini' },
  ];

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ marginBottom: 0 }}>Dashboard Admin</h2>
          <button className="btn secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tabbar" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'admin' && <AdminAkunTab />}
      {tab === 'anggota' && <AdminAnggotaTab />}
      {tab === 'kelas' && <AdminKelasTab />}
      {tab === 'absen' && <AbsenTab />}
    </div>
  );
}