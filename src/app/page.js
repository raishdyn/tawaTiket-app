import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";


export default async function HomePage() {
  const session = await getServerSession(authOptions);

  let currentUser = null;
  if (session) {
    currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  }

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  });


  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Fungsi kecil untuk memformat tanggal
  const formatTanggal = (tanggal) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
    }).format(new Date(tanggal));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. NAVBAR (Navigasi Atas) */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="shrink-0">
              <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter">
                Tawa<span className="text-gray-900">Tiket.</span>
              </Link>
            </div>
            <div className="flex space-x-4 items-center">
              {session ? (
    /* Jika User SUDAH Login, tampilkan sapaan dan tombol Dashboard/Keluar */
                <>
                  <span className="text-sm text-gray-600 hidden md:block">
                  Halo, <span className="font-bold text-gray-900">{session.user.name}</span>
                  </span>
                  {currentUser?.role === "ADMIN" ? (
                    <Link href="/admin" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">
                      Admin Panel
                    </Link>
                    ) : (
                    <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">
                    Ticket saya
                    </Link>
                    )}
                    {/* ------------------------------- */}
                  <LogoutButton />
                </>
              ) : (
                /* Jika User BELUM Login, tampilkan tombol Masuk dan Daftar aslimu */
                <>
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">
                  Masuk
                  </Link>
                  <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition shadow-sm">
                  Daftar
                  </Link>
                </>
              )}
            </div>
            
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Banner Utama) */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ketawa Sampai Lupa Cicilan.
          </h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mb-8">
            Amankan kursimu untuk pertunjukan Stand-Up Comedy paling pecah tahun ini. Jangan sampai kehabisan kuota!
          </p>
          <a href="#katalog" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 font-bold px-8 py-4 rounded-full text-lg transition shadow-lg transform hover:-translate-y-1">
            Lihat Jadwal Acara
          </a>
        </div>
      </div>

      {/* 3. SECTION KATALOG ACARA (Grid Cards) */}
      <div id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Upcoming Shows</h2>
            <p className="text-gray-500 mt-1">Pilih acara dan amankan tiketmu sekarang.</p>
          </div>
        </div>

        {/* Perulangan (Mapping) data dari PostgreSQL ke dalam Card Tailwind */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
              
              {/* Bagian Atas Card (Visual/Warna) */}
              <div className="relative h-56 w-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-start p-6">
                
                {/* 1. Jika URL gambar ada di database, kita render fotonya! */}
                {event.performerImage && (
                  <Image
                    src={event.performerImage}
                    alt={event.title}
                    fill
                    className="object-cover z-0 group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                
                {/* 2. Overlay Gradien Tipis agar gambar tidak terlalu menyilaukan & teks tetap terbaca */}
                <div className="absolute inset-0 bg-linear-to-br from-slate-900/90 via-slate-900/20 to-transparent z-10"></div>
                
                {/* 3. Badge Sisa Kuota (Sekarang melayang di atas gambar) */}
                <span className="relative z-20 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-sm">
                  SISA KUOTA: {event.quota} KURSI
                </span>
              </div>
              {/* ----------------------------------- */}
              
              {/* Bagian Bawah Card (Informasi Text) */}
              <div className="p-6 grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📅</span> {formatTanggal(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📍</span> {event.location}
                    </div>
                  </div>
                </div>
                
                {/* Tombol Action (Jebakan CRO) */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                  <span className="text-lg font-bold text-blue-600">{formatRupiah(event.price)}</span>
                  <Link href={`/checkout/${event.id}`} className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition">
                    Beli Tiket
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}