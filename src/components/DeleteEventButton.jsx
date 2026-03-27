"use client";

import { useRouter } from "next/navigation";

export default function DeleteEventButton({ eventId }) {
  const router = useRouter();

  const handleDelete = async () => {
    // Beri peringatan (friksi UX) agar Admin tidak salah pencet
    const isConfirm = window.confirm("🚨 PERINGATAN: Yakin ingin menghapus acara ini secara permanen?");
    
    if (isConfirm) {
      try {
        const res = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
          alert("✅ " + data.message);
          router.refresh(); // Segarkan tabel secara instan
        } else {
          alert("❌ " + data.error);
        }
      } catch (error) {
        alert("Terjadi kesalahan jaringan.");
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition text-sm font-bold"
    >
      Hapus
    </button>
  );
}