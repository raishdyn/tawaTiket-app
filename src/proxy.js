import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Inisialisasi Redis dan Rate Limiter (Membutuhkan kredensial Upstash di .env)
const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis: redis,
  // Mengizinkan 5 request per 10 detik dari IP yang sama
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

export async function proxy(request) {
  // Terapkan rate limiter untuk rute transaksi DAN autentikasi (login)
  if (request.nextUrl.pathname.startsWith("/api/transaction") || request.nextUrl.pathname.startsWith("/api/auth/callback/credentials")) {
    // Ambil IP address pengguna (bergantung pada platform: Vercel, AWS, dll)
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    try {
      const { success } = await ratelimit.limit(ip);
      
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Terlalu banyak request. Silakan coba beberapa saat lagi." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (err) {
      console.error("Rate Limiter Error:", err);
      // Lanjutkan request jika Redis gagal (fail-open) agar sistem tidak terblokir total
    }
  }
  
  return NextResponse.next();
}

// Konfigurasi endpoint mana saja yang akan dilewati middleware ini
export const config = {
  matcher: ["/api/transaction/:path*", "/api/auth/:path*"],
};