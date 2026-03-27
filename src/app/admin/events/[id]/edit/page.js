"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams(); 
  const { id } = params;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    quota: "",
    performerImage: "", // WAJIB ADA DI STATE AWAL
  });

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();

        if (res.ok) {
          const formattedDate = new Date(data.date).toISOString().slice(0, 16);
          
          setFormData({
            title: data.title,
            description: data.description,
            date: formattedDate,
            location: data.location,
            price: data.price,
            quota: data.quota,
            performerImage: data.performerImage || "", // Tarik gambar lama jika ada
          });
        } else {
          alert("Gagal mengambil data acara.");
        }
      } catch (error) {
        alert("Terjadi kesalahan jaringan.");
      } finally {
        setFetching(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
        router.push("/admin"); 
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

  if (fetching) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Memuat data acara...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">Edit Data Acara</h1>
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            &larr; Batal & Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Judul Acara</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Deskripsi</label>
            <textarea name="description" required value={formData.description} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Tanggal & Waktu</label>
              <input type="datetime-local" name="date" required value={formData.date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Lokasi</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Harga Tiket (Rp)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} min="0" className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Total Kuota</label>
              <input type="number" name="quota" required value={formData.quota} onChange={handleChange} min="1" className="w-full border border-gray-300 rounded-lg p-3 text-gray-950" />
            </div>
          </div>

          {/* INPUT FOTO DIBENARKAN STATE-NYA */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              URL Foto Komika (Opsional)
            </label>
            <input
              type="url"
              name="performerImage"
              value={formData.performerImage} // MENGIKAT INPUT DENGAN STATE REACT
              onChange={handleChange}
              placeholder="https://contoh.com/foto.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Jika ada URL lama, ganti dengan yang baru.</p>

            {formData.performerImage && (
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative h-48 w-full bg-gray-50 flex flex-col items-center justify-center">
                <p className="absolute text-xs font-bold text-gray-400 z-0">Live Preview</p>
                {/* Gunakan tag img standar (bukan Next Image) karena ini sumber eksternal dinamis */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={formData.performerImage} 
                  alt="Preview" 
                  className="object-contain h-full w-full z-10"
                  // Jika link yang dimasukkan ternyata rusak/diblokir, tampilkan gambar error
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://via.placeholder.com/400x300?text=URL+Gambar+Rusak/Diblokir";
                  }}
                />
              </div>
            )}
          </div>

          

          <button type="submit" disabled={loading} className={`w-full py-4 mt-6 rounded-lg font-bold text-white transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"}`}>
            {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}