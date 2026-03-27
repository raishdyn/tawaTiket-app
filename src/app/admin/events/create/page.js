"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    quota: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
       // router.push("/admin"); // Kembali ke dashboard admin setelah sukses
       setFormData({
          title: "",
          description: "",
          date: "",
          location: "",
          price: "",
          quota: "",
        });
        router.refresh();
      } else {
        alert("❌ Gagal: " + data.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">Tambah Acara Baru</h1>
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            &larr; Batal & Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Judul Acara</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" placeholder="Contoh: Raditya Dika Spesial..." />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Deskripsi</label>
            <textarea name="description" required value={formData.description} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" placeholder="Ceritakan keseruan acara ini..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Tanggal & Waktu</label>
              {/* Input khusus datetime-local untuk memunculkan kalender bawaan browser */}
              <input type="datetime-local" name="date" required value={formData.date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Lokasi</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" placeholder="Contoh: Balai Sarbini, Jakarta" />
            </div>
          </div>

          {/* Input Foto Performer */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              URL Foto Komika (Opsional)
            </label>
            <input
              type="url"
              name="performerImage"
              placeholder="https://contoh.com/foto-raditya-dika.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">Cari foto di Google, klik kanan "Copy Image Address", lalu paste di sini.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Harga Tiket (Rp)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} min="0" className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" placeholder="150000" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Total Kuota</label>
              <input type="number" name="quota" required value={formData.quota} onChange={handleChange} min="1" className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" placeholder="100" />
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 mt-6 rounded-lg font-bold text-white transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"}`}>
            {loading ? "Menyimpan Acara..." : "Simpan Acara & Publikasikan"}
          </button>
        </form>
      </div>
    </div>
  );
}