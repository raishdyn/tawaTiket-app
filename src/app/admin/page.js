import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteEventButton from "@/components/DeleteEventButton";

// Tambahkan searchParams untuk menangkap parameter URL (?page=X)
export default async function AdminDashboard({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-black text-red-600 mb-2">403 FORBIDDEN</h1>
        <p className="text-gray-600">Akses Ditolak. Halaman ini khusus Panitia/Admin.</p>
        <Link href="/" className="mt-6 text-blue-600 underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  // --- LOGIKA PAGINATION ---
  const ITEMS_PER_PAGE = 10;
  
  // Tangkap parameter 'page' dari URL. Jika tidak ada, jadikan 1.
  // Peringatan: di Next.js 15, searchParams adalah Promise
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1; 

  // Hitung jumlah data yang harus dilewati
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // 2. TARIK DATA TABEL (Acara & Transaksi)
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Ambil transaksi hanya sesuai halaman yang sedang aktif
  const transactions = await prisma.transaction.findMany({
    take: ITEMS_PER_PAGE,
    skip: skip,
    include: { user: true, event: true },
    orderBy: { createdAt: "desc" },
  });

  // Hitung TOTAL SEMUA transaksi untuk mengetahui total halaman
  const totalTransactionsCount = await prisma.transaction.count();
  const totalPages = Math.ceil(totalTransactionsCount / ITEMS_PER_PAGE);

  // 3. TARIK DATA ANALITIK (Perhitungan Otomatis Database)
  const revenueData = await prisma.transaction.aggregate({
    where: { status: "SUCCESS" },
    _sum: { totalAmount: true },
  });
  const totalRevenue = revenueData._sum.totalAmount || 0;

  const ticketsSold = await prisma.ticket.count({
    where: { transaction: { status: "SUCCESS" } },
  });

  const activeEventsCount = await prisma.event.count();

  // Fungsi format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Dasbor */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Selamat datang, Komandan {currentUser.name}.</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin/scanner" className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow hover:bg-black font-bold transition flex items-center">
              📸 Buka Scanner
            </Link>
            <Link href="/admin/events/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 font-bold transition">
              + Tambah Acara
            </Link>
            <Link href="/" className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow border hover:bg-gray-50 font-medium">
              Lihat Website
            </Link>
          </div>
        </div>

        {/* KARTU ANALITIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <p className="text-sm font-bold text-gray-500 mb-1">Total Pendapatan</p>
            <h3 className="text-3xl font-black text-gray-900">{formatRupiah(totalRevenue)}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <p className="text-sm font-bold text-gray-500 mb-1">Tiket Terjual</p>
            <h3 className="text-3xl font-black text-gray-900">{ticketsSold} <span className="text-lg font-medium text-gray-500">Lembar</span></h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
            <p className="text-sm font-bold text-gray-500 mb-1">Acara Aktif</p>
            <h3 className="text-3xl font-black text-gray-900">{activeEventsCount} <span className="text-lg font-medium text-gray-500">Acara</span></h3>
          </div>
        </div>

        {/* Tabel Manajemen Acara */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-800">Manajemen Acara Aktif</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="p-4 font-semibold">Judul Acara</th>
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Harga</th>
                  <th className="p-4 font-semibold">Sisa Kuota</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{evt.title}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(evt.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-sm text-gray-800">{formatRupiah(evt.price)}</td>
                    <td className="p-4 font-bold text-blue-600">{evt.quota} Kursi</td>
                    <td className="p-4 text-center space-x-2">
                      <Link href={`/admin/events/${evt.id}/edit`} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded transition text-sm font-bold">
                        Edit
                      </Link>
                      <DeleteEventButton eventId={evt.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {events.length === 0 && <div className="p-8 text-center text-gray-500">Belum ada acara yang didaftarkan.</div>}
        </div>

        {/* Tabel Laporan Transaksi DENGAN PAGINATION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Riwayat Penjualan Tiket Asli</h2>
            <span className="text-xs bg-white border border-gray-300 px-2 py-1 rounded text-gray-500 font-bold">Total: {totalTransactionsCount} Transaksi</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="p-4 font-semibold">ID Transaksi</th>
                  <th className="p-4 font-semibold">Pembeli</th>
                  <th className="p-4 font-semibold">Acara</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-xs font-mono text-gray-500">{trx.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{trx.user.name}</p>
                      <p className="text-xs text-gray-500">{trx.user.email}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{trx.event.title}</td>
                    <td className="p-4 font-bold text-green-600">{formatRupiah(trx.totalAmount)}</td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && <div className="p-8 text-center text-gray-500">Belum ada penjualan tiket di halaman ini.</div>}

          {/* KONTROL PAGINATION */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Halaman <span className="font-bold text-gray-900">{currentPage}</span> dari <span className="font-bold text-gray-900">{totalPages}</span>
              </span>
              
              <div className="flex space-x-2">
                {/* Tombol Mundur */}
                {currentPage > 1 ? (
                  <Link 
                    href={`/admin?page=${currentPage - 1}`}
                    className="px-4 py-2 border border-gray-300 rounded text-sm font-bold bg-white text-gray-700 hover:bg-gray-100 transition"
                  >
                    &larr; Prev
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 border border-gray-200 rounded text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
                    &larr; Prev
                  </button>
                )}

                {/* Tombol Maju */}
                {currentPage < totalPages ? (
                  <Link 
                    href={`/admin?page=${currentPage + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded text-sm font-bold bg-white text-gray-700 hover:bg-gray-100 transition"
                  >
                    Next &rarr;
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 border border-gray-200 rounded text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
                    Next &rarr;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}