import { useEffect, useState } from 'react';
import api, { getToken } from '../api.js';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
}

function fmtTime(t) {
  return t ? String(t).slice(0, 8) : '-';
}

export default function AbsenTab() {
  const token = getToken();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    gabung_meet: 'belum',
  });


  const load = async () => {
    const res = await api('/sekarang', { token });
    if (!res.ok) {
      setError(res.data.message || 'Gagal memuat absensi.');
      return;
    }
    setRows(res.data);
  };

  useEffect(() => {
    load();
  }, []);


  const startEdit = (row) => {
    setEditing(row.id);
    setEditForm({
      gabung_meet: 'tidak',
    });
    setError('');
  };

  const saveEdit = async (id) => {
    setError('');
    if (!editForm.gabung_meet) {
      setError('Gabung meet wajib diisi!');
      return;
    }
    const res = await api(`/ubah/absen/${id}`, {
      method: 'PUT',
      token,
      body: editForm,
    });
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus absensi ini?')) return;
    const res = await api(`/hapus/absen/${id}`, { method: 'DELETE', token });
    load();
  };

  return (
    <div className="card">
      <h3>Absensi Hari Ini</h3>
      {error && <div className="msg err">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>WhatsApp</th>
            <th>Status</th>
            <th>Keterangan</th>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th>Gabung Meet</th>
            <th style={{ textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.nama}</td>
              <td>{r.whatsapp}</td>
              <td>{r.status_hadir}</td>
              <td>{r.alasan || '-'}</td>
              <td>{fmtDate(r.tanggal_absen)}</td>
              <td>{fmtTime(r.waktu_absen)}</td>
              <td>
                {editing === r.id ? (
                  <select
                    value={editForm.gabung_meet}
                    onChange={(e) => setEditForm({ ...editForm, gabung_meet: e.target.value })}
                  >
                    <option value="tidak">Tidak</option>
                    <option value="ya">Ya</option>
                  </select>
                ) : (
                  r.gabung_meet
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
                Belum ada absensi hari ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}