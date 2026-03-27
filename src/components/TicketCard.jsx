"use client";

import { useState } from "react";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { toPng } from "html-to-image";

export default function TicketCard({ trx }) {
  const [downloadingTickets, setDownloadingTickets] = useState({});

  const handleDownload = async (ticketId, ticketIndex) => {
    setDownloadingTickets((prev) => ({ ...prev, [ticketId]: true }));
    const ticketElement = document.getElementById(`ticket-${ticketId}`);
    
    if (ticketElement) {
      try {
        const dataUrl = await toPng(ticketElement, {
          quality: 1.0,
          pixelRatio: 3, // Kualitas cetak super tajam
          backgroundColor: "#ffffff",
          filter: (node) => node.tagName !== "BUTTON"
        });

        const link = document.createElement("a");
        link.download = `Tiket-${trx.event.title.substring(0, 15)}-${ticketIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Gagal mengunduh tiket:", error);
        alert("Terjadi kesalahan saat menyimpan tiket.");
      }
    }
    setDownloadingTickets((prev) => ({ ...prev, [ticketId]: false }));
  };

  return (
    <div className="flex flex-col gap-6">
      {trx.status === "SUCCESS" ? (
        trx.tickets.map((ticket, index) => {
          // Logika Mode Warna: Hidup (Valid) vs Mati (Used)
          const isUsed = ticket.isUsed;
          const glowEffect = isUsed ? "shadow-md shadow-slate-200" : "shadow-xl shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300";
          const bgColor = isUsed ? "bg-slate-50" : "bg-white";
          const qrBgColor = isUsed ? "bg-slate-100" : "bg-indigo-50/50";
          
          return (
            <div 
              key={ticket.id} 
              id={`ticket-${ticket.id}`} 
              className={`relative flex flex-col md:flex-row rounded-3xl border ${isUsed ? 'border-slate-200' : 'border-indigo-100'} overflow-hidden ${glowEffect} ${bgColor}`}
            >
              
              {/* --- BAGIAN KIRI: INFO ACARA --- */}
              <div className="p-8 md:w-8/12 flex flex-col justify-between relative z-10">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 text-xs font-black tracking-widest uppercase rounded-full border ${isUsed ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                      {isUsed ? "Scanned" : "Valid"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-bold tracking-wider">
                      INV-{trx.id.split("-")[0].toUpperCase()}
                    </span>
                  </div>
                  
                  <h2 className={`text-3xl font-black tracking-tight mb-2 ${isUsed ? 'text-slate-400' : 'text-slate-900'}`}>
                    {trx.event.title}
                  </h2>
                  
                  <div className={`space-y-1 mt-6 text-sm font-medium ${isUsed ? 'text-slate-400' : 'text-slate-600'}`}>
                    <p className="flex items-center gap-3">
                      <span className="text-lg">📅</span> 
                      {new Date(trx.event.date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-lg">📍</span> 
                      {trx.event.location}
                    </p>
                  </div>
                </div>

                {isUsed && (
                  <div className="mt-8">
                    <p className="inline-block bg-red-50 text-red-600 text-xs font-black px-4 py-2 rounded-lg border border-red-100 uppercase tracking-widest">
                      ❌ Tiket ini sudah di-scan
                    </p>
                  </div>
                )}
              </div>

              {/* --- GARIS PEMBATAS DENGAN EFEK SOBEKAN (PERFORATED EDGE) --- */}
              <div className="relative w-full md:w-1 flex items-center justify-center">
                {/* Garis Putus-putus */}
                <div className="absolute inset-x-0 top-1/2 md:inset-y-0 md:left-1/2 md:top-0 w-full md:w-0.5 h-0.5 md:h-full bg-slate-200 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-300 -translate-y-1/2 md:-translate-x-1/2 z-0"></div>
                
                {/* Lingkaran Sobekan Atas (Hanya tampil di Desktop) */}
                <div className={`hidden md:block absolute -top-4 left-1/2 w-8 h-8 rounded-full -translate-x-1/2 border-b ${isUsed ? 'border-slate-200' : 'border-indigo-100'} bg-slate-50 shadow-inner z-20`}></div>
                {/* Lingkaran Sobekan Bawah (Hanya tampil di Desktop) */}
                <div className={`hidden md:block absolute -bottom-4 left-1/2 w-8 h-8 rounded-full -translate-x-1/2 border-t ${isUsed ? 'border-slate-200' : 'border-indigo-100'} bg-slate-50 shadow-inner z-20`}></div>
              </div>

              {/* --- BAGIAN KANAN: QR CODE & DOWNLOAD --- */}
              <div className={`p-8 md:w-4/12 flex flex-col items-center justify-center text-center relative z-10 ${qrBgColor}`}>
                
                <p className={`text-xs font-black uppercase tracking-widest mb-4 ${isUsed ? 'text-slate-400' : 'text-indigo-600'}`}>
                  TIKET {index + 1} / {trx.tickets.length}
                </p>

                <div className={`p-3 rounded-2xl shadow-sm mb-4 ${isUsed ? 'bg-slate-200 opacity-50 grayscale' : 'bg-white'}`}>
                  <QRCodeDisplay value={ticket.id} />
                </div>
                
                <p className="text-[10px] text-slate-400 font-mono mb-6 break-all px-2 uppercase tracking-widest">
                  ID: {ticket.id.split("-")[0]}
                </p>
                
                <button
                  onClick={() => handleDownload(ticket.id, index)}
                  disabled={downloadingTickets[ticket.id]}
                  // Tombol disembunyikan jika tiket sudah dipakai (tidak perlu didownload lagi)
                  className={`${isUsed ? 'hidden' : 'flex'} w-full items-center justify-center gap-2 bg-slate-900 text-white text-sm font-bold py-3 px-6 rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-indigo-500/30 disabled:opacity-50`}
                >
                  {downloadingTickets[ticket.id] ? "⏳ Menyimpan..." : "↓ Simpan Gambar"}
                </button>
              </div>

            </div>
          );
        })
      ) : (
        // STATE JIKA MENUNGGU PEMBAYARAN (Belum Relevan di MVP ini, tapi kita rapikan)
        <div className="bg-white p-6 rounded-2xl border border-yellow-200 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-4">
             <span className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-xl">⏳</span>
             <div>
               <h3 className="font-bold text-slate-900">Menunggu Pembayaran</h3>
               <p className="text-sm text-slate-500">INV: {trx.id.split("-")[0].toUpperCase()}</p>
             </div>
           </div>
           <p className="text-sm font-bold text-yellow-600">Pending</p>
        </div>
      )}
    </div>
  );
}