import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Tambahkan Image
import CheckoutButton from "@/components/CheckoutButton";

export default async function CheckoutPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/checkout/${id}`);
  }

  const event = await prisma.event.findUnique({
    where: { id: id },
  });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-4">Acara Tidak Ditemukan</h1>
          <p className="text-slate-500 mb-8">Acara yang kamu cari mungkin sudah dihapus atau tidak tersedia.</p>
          <Link href="/" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="text-slate-500 hover:text-indigo-600 font-bold mb-8 inline-flex items-center gap-2 transition-colors">
          <span>&larr;</span> Kembali ke Katalog
        </Link>

        {/* SPLIT LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* KOLOM KIRI: INFO ACARA PREMIUM (7 Kolom) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Gambar Cover Acara */}
              <div className="relative w-full aspect-21/9 bg-linear-to-br from-indigo-500 to-purple-600">
                {event.performerImage && (
                  <Image
                    src={event.performerImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-full border border-white/20 shadow-sm mb-3 inline-block">
                    {event.quota} Kursi Tersedia
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    {event.title}
                  </h1>
                </div>
              </div>

              {/* Detail Waktu & Lokasi */}
              <div className="p-6 sm:p-8 bg-white flex flex-col sm:flex-row gap-6 border-b border-slate-100">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shrink-0">📅</div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal & Waktu</p>
                    <p className="font-bold text-slate-900">
                      {new Date(event.date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(event.date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl shrink-0">📍</div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lokasi</p>
                    <p className="font-bold text-slate-900">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="p-6 sm:p-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Deskripsi Acara</p>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: RINGKASAN PEMBAYARAN (Sticky 5 Kolom) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-6 border-b border-dashed border-slate-200">
                Ringkasan Pesanan
              </h2>

              {/* Informasi Pemesan yang lebih elegan */}
              <div className="mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Informasi Pemesan</p>
                <p className="font-bold text-slate-900">{session.user.name}</p>
                <p className="text-sm text-slate-500">{session.user.email}</p>
              </div>

              {/* Komponen Input Jumlah Tiket & Tombol Bayar */}
              <CheckoutButton event={event} />

              {/* TRUST SIGNALS (Efek Psikologis Rasa Aman) */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="text-xs font-medium uppercase tracking-wider">Transaksi 100% Aman & Terenkripsi</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}