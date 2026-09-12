import { useEffect, useState } from 'react';
import api, { getToken } from '../api.js';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function fmtDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtTime(t) {
  return t ? String(t).slice(0, 5) : '-';
}

export default function AdminKelasTab() {
  const token = getToken();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    hari: 'Senin',
    tanggal: '',
    waktu: '19:00',
    materi: '',
    link: '',
  });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    hari: '',
    tanggal: '',
    waktu: '',
    materi: '',
    selesai: 'belum',
    link: '',
  });

  const load = async () => {
    const res = await api('/daftar/kelas', { token });
    if (!res.ok) {
      setError(res.data.message || 'Gagal memuat kelas.');
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
    if (!form.hari || !form.tanggal || !form.waktu) {
      setError('Hari, tanggal, dan waktu wajib diisi!');
      return;
    }
    const res = await api('/admin/kelas-baru', {
      method: 'POST',
      token,
      body: form,
    });
    if (!res.ok) {
      setError(res.data.message || 'Gagal menambah kelas.');
      return;
    }
    setMsg(res.data.message);
    setForm({ hari: 'Senin', tanggal: '', waktu: '19:00', materi: '', link: '' });
    load();
  };

  const startEdit = (row) => {
    setEditing(row.id);
    setEditForm({
      hari: row.hari,
      tanggal: new Date(row.tanggal).toISOString().slice(0, 10),
      waktu: fmtTime(row.waktu),
      materi: row.materi || '',
      selesai: row.selesai || 'belum',
      link: row.link || '',
    });
    setError('');
  };

  const saveEdit = async (id) => {
    setError('');
    setMsg('');
    if (!editForm.hari || !editForm.tanggal || !editForm.waktu || !editForm.selesai) {
      setError('Hari, tanggal, waktu, dan status selesai wajib diisi!');
      return;
    }
    const res = await api(`/ubah/kelas/${id}`, {
      method: 'PUT',
      token,
      body: editForm,
    });
    if (!res.ok) {
      setError(res.data.message || 'Gagal memperbarui kelas.');
      return;
    }
    setMsg(res.data.message);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus kelas ini?')) return;
    setError('');
    setMsg('');
    const res = await api(`/hapus/kelas/${id}`, { method: 'DELETE', token });
    if (!res.ok) {
      setError(res.data.message || 'Gagal menghapus kelas.');
      return;
    }
    setMsg(res.data.message);
    load();
  };

  return (
    <div className="card">
      <h3>Jadwalkan Kelas</h3>
      <form className="form-grid" onSubmit={add}>
        <div>
          <label>Hari</label>
          <select value={form.hari} onChange={(e) => setForm({ ...form, hari: e.target.value })}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Tanggal</label>
          <input
            type="date"
            value={form.tanggal}
            onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Waktu</label>
          <input
            type="time"
            value={form.waktu}
            onChange={(e) => setForm({ ...form, waktu: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Link Kelas (opsional)</label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="https://meet.example/..."
          />
        </div>
        <div className="full">
          <label>Materi (opsional)</label>
          <input
            type="text"
            value={form.materi}
            onChange={(e) => setForm({ ...form, materi: e.target.value })}
          />
        </div>
        <div className="full">
          <button className="btn">Tambah Kelas</button>
        </div>
      </form>

      {msg && <div className="msg ok">{msg}</div>}
      {error && <div className="msg err">{error}</div>}

      <h3>Daftar Kelas</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hari</th>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th>Materi</th>
            <th>Status</th>
            <th>Link</th>
            <th style={{ textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>
                {editing === r.id ? (
                  <select
                    value={editForm.hari}
                    onChange={(e) => setEditForm({ ...editForm, hari: e.target.value })}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  r.hari
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="date"
                    value={editForm.tanggal}
                    onChange={(e) => setEditForm({ ...editForm, tanggal: e.target.value })}
                  />
                ) : (
                  fmtDate(r.tanggal)
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="time"
                    value={editForm.waktu}
                    onChange={(e) => setEditForm({ ...editForm, waktu: e.target.value })}
                  />
                ) : (
                  fmtTime(r.waktu)
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editForm.materi}
                    onChange={(e) => setEditForm({ ...editForm, materi: e.target.value })}
                  />
                ) : (
                  r.materi || '-'
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <select
                    value={editForm.selesai}
                    onChange={(e) => setEditForm({ ...editForm, selesai: e.target.value })}
                  >
                    <option value="belum">Belum</option>
                    <option value="sudah">Sudah</option>
                  </select>
                ) : (
                  r.selesai
                )}
              </td>
              <td>
                {editing === r.id ? (
                  <input
                    type="text"
                    value={editForm.link}
                    onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                  />
                ) : r.link ? (
                  <a href={r.link} target="_blank" rel="noopener noreferrer">
                    Buka
                  </a>
                ) : (
                  '-'
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
              <td colSpan={8} className="muted">
                Belum ada kelas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}