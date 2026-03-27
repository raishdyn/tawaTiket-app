"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 1. Komponen isi form (Tanpa export default)
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(callbackUrl); 
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In Ticketing</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" name="email" required onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" name="password" required onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// 2. PINTU UTAMA (Ini yang dicari Vercel dan tadi kemungkinan tidak ter-copy)
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 font-medium">Memuat halaman login...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}