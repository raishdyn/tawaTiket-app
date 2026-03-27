"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutButton({ event }) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          eventId: event.id,
          quantity: quantity
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Hapus alert usang, langsung arahkan ke tiket dengan mulus
        router.push("/dashboard");
        router.refresh(); 
      } else {
        alert("❌ Transaksi Gagal: " + data.error);
        setLoading(false);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  const isSoldOut = event.quota === 0;
  
  // Sinkronisasi dengan Middleware Zod (Maksimal 5 tiket per transaksi)
  const maxAllowed = Math.min(event.quota, 5);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Itemized Receipt (Rincian Item) */}
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-slate-900 font-bold leading-tight mb-1">{event.title}</p>
            <p className="text-sm font-medium text-slate-500">{formatRupiah(event.price)} &times; {quantity} Tiket</p>
          </div>
          <p className="text-slate-900 font-black text-right">{formatRupiah(event.price * quantity)}</p>
        </div>
      </div>

      {/* Stepper (Pengatur Jumlah Tiket Modern) */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jumlah Tiket</p>
          <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md inline-block">Sisa: {event.quota} Kursi</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isSoldOut}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-bold text-lg"
          >
            &minus;
          </button>
          <span className="font-black text-slate-900 w-6 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(Math.min(maxAllowed, quantity + 1))}
            disabled={quantity >= maxAllowed || isSoldOut}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-bold text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* Baris Total Bayar */}
      <div className="flex justify-between items-center pt-6 border-t border-dashed border-slate-200 mt-2 mb-2">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Bayar</p>
        <p className="text-3xl font-black text-indigo-600">{formatRupiah(event.price * quantity)}</p>
      </div>

      {/* Tombol Bayar Premium (Elevated Button) */}
      <button
        onClick={handlePayment}
        disabled={loading || isSoldOut}
        className={`w-full py-4 rounded-2xl font-black tracking-wide text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
          loading || isSoldOut
            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
            : "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 hover:-translate-y-1"
        }`}
      >
        {isSoldOut 
          ? "TIKET HABIS" 
          : (loading ? (
            <>
              {/* Animasi Loading SVG Native */}
              <svg className="animate-spin h-5 w-5 text-white opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Memproses...
            </>
          ) : `Bayar ${formatRupiah(event.price * quantity)}`)
        }
      </button>
    </div>
  );
}