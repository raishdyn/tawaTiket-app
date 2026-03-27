"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  
  // Fungsi untuk mencegat klik tombol
  const handleLogout = () => {
    // Memunculkan pop-up konfirmasi bawaan browser (Mengembalikan nilai True/False)
    const isConfirm = window.confirm("Apakah Anda yakin ingin keluar?");

    if (isConfirm) {
      // Jika user menekan "OK" (True), maka eksekusi fungsi sign out NextAuth
      // dan arahkan kembali ke halaman utama ("/")
      signOut({ callbackUrl: "/" });
    }
    // Jika user menekan "Cancel" (False), maka kode berhenti di sini.
    // Tidak ada proses sign out, dan user tetap berada di halaman saat ini.
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-md text-sm font-medium transition shadow-sm"
    >
      Keluar
    </button>
  );
}