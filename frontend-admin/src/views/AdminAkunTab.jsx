import { useEffect, useState } from 'react';
import api, { getToken } from '../api.js';

export default function AdminAkunTab() {
  const token = getToken();
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({ username: '', password: '' });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '' });

  const load = async () => {
    const res = await api('/admin/daftar-admin', { token });
    if (!res.ok) {
      setError(res.data.message || 'Gagal memuat daftar admin.');
      return;
    }
    setAdmins(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    const res = await api('/admin/admin-baru', {
      method: 'POST',
      token,
      body: form,
    });
    if (!res.ok) {
      setError(res.data.message || 'Gagal menambah admin.');
      return;
    }
    setMsg(res.data.message);
    setForm({ username: '', password: '' });
    load();
  };

  const startEdit = (admin) => {
    setEditing(admin.id);
    setEditForm({ username: admin.username, password: '' });
    setError('');
  };

  const saveEdit = async (id) => {
    setError('');
    setMsg('');
    const body = {};
    if (editForm.username) body.username = editForm.username;
    if (editForm.password) body.password = editForm.password;

    const res = await api(`/admin/ubah-admin/${id}`, { method: 'PUT', token, body });
    if (!res.ok) {
      setError(res.data.message || 'Gagal memperbarui admin.');
      return;
    }
    setMsg(res.data.message);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus admin ini?')) return;
    setError('');
    setMsg('');
    const res = await api(`/admin/hapus-admin/${id}`, { method: 'DELETE', token });
    if (!res.ok) {
      setError(res.data.message || 'Gagal menghapus admin.');
      return;
    }
    setMsg(res.data.message);
    load();
  };

  return (
    <div className="card">
      <h3>Tambah Admin Baru</h3>
      <form className="form-grid" onSubmit={add}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div className="full">
          <button className="btn">Tambah Admin</button>
        </div>
      </form>

      {msg && <div className="msg ok">{msg}</div>}
      {error && <div className="msg err">{error}</div>}

      <h3>Daftar Admin</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th style={{ textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>
                {editing === a.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="Password baru (opsional)"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                  </div>
                ) : (
                  a.username
                )}
              </td>
              <td>
                <div className="inline-actions">
                  {editing === a.id ? (
                    <>
                      <button className="btn small" onClick={() => saveEdit(a.id)}>
                        Simpan
                      </button>
                      <button className="btn small secondary" onClick={() => setEditing(null)}>
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn small" onClick={() => startEdit(a)}>
                        Ubah
                      </button>
                      <button className="btn small danger" onClick={() => remove(a.id)}>
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {admins.length === 0 && (
            <tr>
              <td colSpan={3} className="muted">
                Belum ada admin.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}