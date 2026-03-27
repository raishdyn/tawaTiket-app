// Perintah ini wajib agar Next.js tahu file ini berjalan di browser (Client-Side), bukan di server
"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react"; 

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError("");

    try {
      // 1. Daftarkan User ke Database
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. AUTO-LOGIN DI BELAKANG LAYAR
        const loginRes = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false, // Kita larang NextAuth melempar layar, kita yang atur!
        });

        if (loginRes?.error) {
          // Jika entah kenapa login otomatis gagal, arahkan ke halaman login manual
          router.push("/login");
        } else {
          // Jika sukses, lemparkan langsung ke halaman utama!
          router.push("/");
          router.refresh(); // Memaksa navigasi memperbarui status "Logged In"
        }
      } else {
        setError(data.message || "Gagal mendaftar.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Daftar Akun Ticketing</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input 
              type="text" name="name" required onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" name="email" required onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" name="password" required onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
            <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
              Sign In di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}