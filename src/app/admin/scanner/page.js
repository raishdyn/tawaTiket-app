"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Link from "next/link";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inisialisasi Scanner dengan frame kotak
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    async function onScanSuccess(decodedText) {
      // 1. Saat tiket terbaca, hentikan sementara kamera agar tidak menembak API berkali-kali
      scanner.pause();
      setLoading(true);
      setScanResult(null);

      try {
        // 2. Kirim teks QR Code ke API Gatekeeper kita
        const res = await fetch("/api/tickets/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: decodedText }),
        });

        const data = await res.json();

        // 3. Tampilkan UI Hijau (Sukses) atau Merah (Gagal)
        if (res.ok) {
          setScanResult({ type: "success", message: data.message, detail: data.data });
        } else {
          setScanResult({ type: "error", message: data.error });
        }
      } catch (error) {
        setScanResult({ type: "error", message: "Gagal terhubung ke server." });
      } finally {
        setLoading(false);
        // 4. Lanjutkan scanner secara otomatis setelah 3 detik untuk antrean pengunjung berikutnya
        setTimeout(() => {
          setScanResult(null);
          scanner.resume();
        }, 3000);
      }
    }

    function onScanFailure(error) {
      // Diabaikan (Kamera akan terus mencari QR Code)
    }

    // Cleanup memori kamera saat user keluar dari halaman
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner.", error));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-white">Pintu Masuk VIP</h1>
          <Link href="/admin" className="text-gray-300 hover:text-white text-sm font-medium bg-gray-800 px-4 py-2 rounded-lg">
            &larr; Tutup
          </Link>
        </div>

        {/* Layar Kamera */}
        <div className="bg-white p-4 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div id="reader" className="w-full rounded-xl overflow-hidden [&_span]:text-black! [&_button]:text-black! [&_select]:text-black! [&_a]:text-blue-600! [&_select]:bg-gray-50 [&_select]:border [&_select]:border-gray-300 [&_button]:bg-gray-200 [&_button]:px-4 [&_button]:py-1 [&_button]:rounded-lg [&_button]:font-bold [&_button]:mt-2"></div>
          <p className="text-center text-sm text-gray-900 mt-4 font-medium">Arahkan kamera ke QR Code HP penonton</p>
        </div>

        {/* Notifikasi Hasil Scan */}
        {loading && (
          <div className="bg-blue-500 text-white p-4 rounded-xl text-center font-bold animate-pulse">
            Memverifikasi ke Database...
          </div>
        )}

        {scanResult && scanResult.type === "success" && (
          <div className="bg-green-500 text-white p-6 rounded-xl text-center shadow-lg border-2 border-green-400 transform transition-all scale-105">
            <h2 className="text-3xl font-black mb-2">✅ DIIZINKAN</h2>
            <p className="font-bold text-green-100 mb-4">{scanResult.message}</p>
            <div className="bg-green-600 rounded-lg p-3 text-sm text-left">
              <p><strong>Pembeli:</strong> {scanResult.detail.buyerName}</p>
              <p><strong>Acara:</strong> {scanResult.detail.eventName}</p>
            </div>
          </div>
        )}

        {scanResult && scanResult.type === "error" && (
          <div className="bg-red-600 text-white p-6 rounded-xl text-center shadow-lg border-2 border-red-500 transform transition-all scale-105">
            <h2 className="text-3xl font-black mb-2">❌ DITOLAK</h2>
            <p className="font-bold">{scanResult.message}</p>
          </div>
        )}

      </div>
    </div>
  );
}