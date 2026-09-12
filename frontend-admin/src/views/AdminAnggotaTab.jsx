import { useEffect, useState } from 'react';
import api, { getToken } from '../api.js';

export default function AdminAnggotaTab() {
  const token = getToken();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({ nama: '', whatsapp: '', email: '' });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ nama: '', whatsapp: '', email: '' });

  const load = async () => {
    const res = await api('/daftar/anggota', { token });
    if (!res.ok) {
      setError(res.data.message || 'Gagal memuat anggota.');
      return;
    }
    setRows(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!form.nama || !form.whatsapp) {
      setError('Nama dan WhatsApp wajib diisi!');
      return;
    }
    const res = await api('/admin/anggota-baru', {
      method: 'POST',
      token,
      body: form,
    });
    if (!res.ok) {
      setError(res.data.message || 'Gagal menambah anggota.');
      return;
    }
    setMsg(res.data.message);
    setForm({ nama: '', whatsapp: '', email: '' });
    load();
  };

  const startEdit = (row) => {
    setEditing(row.id);
    setEditForm({ nama: row.nama, whatsapp: row.whatsapp, email: row.email || '' });
    setError('');
  };

  const saveEdit = async (id) => {
    setError('');
    setMsg('');
    if (!editForm.nama || !editForm.whatsapp) {
      setError('Nama dan WhatsApp wajib diisi!');
      return;
    }
    const res = await api(`/ubah/anggota/${id}`, {
      method: 'PUT',
      token,
      body: editForm,
    });
    if (!res.ok) {
      setError(res.data.message || 'Gagal memperbarui anggota.');
      return;
    }
    setMsg(res.data.message);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus anggota ini?')) return;
    setError('');
    setMsg('');
    const res = await api(`/hapus/anggota/${id}`, { method: 'DELETE', token });
    if (!res.ok) {
      setError(res.data.message || 'Gagal menghapus anggota.');
      return;
    }
    setMsg(res.data.message);
    load();
  };

  return (
    <div className="card">
      <h3>Tambah Anggota</h3>
      <form className="form-grid" onSubmit={add}>
        <div>
          <label>Nama</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
          />
        </div>
        <div>
          <label>WhatsApp</label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            required
          />
        </div>
        <div className="full">
          <label>Email (opsional)</label>
          <input
            type="text"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="full">
          <button className="btn">Tambah Anggota</button>
        </div>
      </form>

      {msg && <div className="msg ok">{msg}</div>}
      {error && <div className="msg err">{error}</div>}

      <h3>Daftar Anggota</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>WhatsApp</th>
            <th>Email</th>
            <th style={{ textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editForm.nama}
                    onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  />
                ) : (
                  r.nama
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  />
                ) : (
                  r.whatsapp
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : (
                  r.email || '-'
                )}
              </td>
              <td>
                <div className="inline-actions">
                  {editing === r.id ? (
                    <>
                      <button className="btn small" onClick={() => saveEdit(r.id)}>
                        Simpan
                      </button>
                      <button className="btn small secondary" onClick={() => setEditing(null)}>
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn small" onClick={() => startEdit(r)}>
                        Ubah
                      </button>
                      <button className="btn small danger" onClick={() => remove(r.id)}>
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                Belum ada anggota.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}