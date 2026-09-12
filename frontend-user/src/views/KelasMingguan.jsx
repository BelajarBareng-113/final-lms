import { useEffect, useState } from 'react';
import api from '../api.js';

const DAYS = [
  { value: 'senin', label: 'Senin' },
  { value: 'selasa', label: 'Selasa' },
  { value: 'rabu', label: 'Rabu' },
  { value: 'kamis', label: 'Kamis' },
  { value: 'jumat', label: 'Jumat' },
  { value: 'sabtu', label: 'Sabtu' },
  { value: 'minggu', label: 'Minggu' },
];

function formatTanggal(tanggal) {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function KelasMingguan() {
  const [hari, setHari] = useState('senin');
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [bookingTanggal, setBookingTanggal] = useState(null);
  const [form, setForm] = useState({ nama: '', whatsapp: '', status_hadir: 'hadir', keterangan: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState('');

  const load = async (day) => {
    setLoading(true);
    setFetchError('');
    const res = await api(`/absensi/${day}`);
    setLoading(false);
    if (!res.ok) {
      setFetchError(res.data.message || 'Gagal memuat jadwal.');
      setJadwal([]);
      return;
    }
    setJadwal(res.data);
  };

  useEffect(() => {
    load(hari);
  }, [hari]);

  const openBooking = (kelas) => {
    setResult(null);
    setResultError('');
    setBookingTanggal(kelas.tanggal);
  };

  // setiap keluar dari form, reset ke default
  const closeBooking = () => {
    setBookingTanggal(null);
    setForm({ nama: '', whatsapp: '', status_hadir: 'hadir', keterangan: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.whatsapp) {
      setResultError('Nama dan WhatsApp wajib diisi!');
      return;
    }
    if (form.status_hadir === 'izin' && !form.keterangan) {
      setResultError('Keterangan wajib diisi jika status izin!');
      return;
    }

    setSubmitting(true);
    setResultError('');
    setResult(null);

    const res = await api('/user/absen', {
      method: 'POST',
      body: {
        nama: form.nama,
        whatsapp: form.whatsapp,
        status_hadir: form.status_hadir,
        keterangan: form.keterangan,
        hari,
      },
    });

    setSubmitting(false);

    if (!res.ok) {
      setResultError(res.data.message || 'Terjadi kesalahan.');
      return;
    }

    setResult(res.data);
    setForm({ nama: '', whatsapp: '', status_hadir: 'hadir', keterangan: '' });
  };

  return (
    <div>
      <div className="card">
        <h2>Kelas Satu Minggu ke Depan</h2>
        <p className="muted">Pilih hari untuk melihat jadwal kelas minggu ini.</p>
        <div className="row">
          {DAYS.map((d) => (
            <button
              key={d.value}
              className={`day-btn ${hari === d.value ? 'active' : ''}`}
              onClick={() => setHari(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {fetchError && <div className="msg err">{fetchError}</div>}
        {loading && <p className="muted">Memuat jadwal...</p>}

        {!loading && !fetchError && jadwal.length === 0 && (
          <p className="muted">Tidak ada kelas pada hari ini.</p>
        )}

        {!loading &&
          jadwal.map((kelas, i) => (
            <div className="card" key={i}>
              <h3>{formatTanggal(kelas.tanggal)}</h3>

              {bookingTanggal !== kelas.tanggal ? (
                <button className="btn" onClick={() => openBooking(kelas)}>
                  Buat Janji
                </button>
              ) : (
                <form onSubmit={submit}>
                  <div className="form-grid">
                    <div>
                      <label>Nama</label>
                      <input
                        type="text"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div>
                      <label>WhatsApp</label>
                      <input
                        type="text"
                        value={form.whatsapp}
                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                        placeholder="contoh: 085123456789"
                      />
                    </div>
                    <div>
                      <label>Status</label>
                      <select
                        value={form.status_hadir}
                        onChange={(e) => setForm({ ...form, status_hadir: e.target.value })}
                      >
                        <option value="hadir">Hadir</option>
                        <option value="izin">Izin (tidak hadir)</option>
                      </select>
                    </div>
                    <div>
                      {form.status_hadir === 'izin' && (
                        <>
                          <label>Keterangan Izin</label>
                          <input
                            type="text"
                            value={form.keterangan}
                            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                            placeholder="Alasan izin"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {resultError && <div className="msg err">{resultError}</div>}
                  {result && (
                    <div className="msg ok">
                      {result.message}
                      {result.link && (
                        <div className="link-box">
                          <a href={result.link} target="_blank" rel="noopener noreferrer">
                            Bergabung ke kelas
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="row" style={{ marginTop: 12 }}>
                    <button className="btn" disabled={submitting}>
                      {submitting ? 'Mengirim...' : 'Kirim Janji'}
                    </button>
                    <button type="button" className="btn secondary" onClick={closeBooking}>
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}