import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TicketCard from "@/components/TicketCard"; 

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const myTransactions = await prisma.transaction.findMany({
    where: { userId: currentUser.id },
    include: {
      event: true,
      tickets: true, 
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section yang lebih elegan */}
        <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tiket Saya</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium uppercase tracking-widest">Boarding Pass Digital</p>
          </div>
          <Link href="/" className="bg-white text-slate-700 px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 font-bold transition-all text-sm flex items-center gap-2">
            <span>&larr;</span> Beranda
          </Link>
        </div>

        {/* Empty State (Jika belum beli tiket) - Desain Premium */}
        {myTransactions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center mt-8">
            <div className="w-24 h-24 bg-indigo-50/50 rounded-full flex items-center justify-center mb-6">
              {/* Ikon Tiket SVG */}
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Belum Ada Tiket</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">Kamu belum mengamankan kursi untuk acara apa pun. Yuk, cari jadwal stand-up yang cocok buatmu!</p>
            <Link href="/#katalog" className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
              Cari Acara Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* INI ADALAH KOMPONEN TIKET ASLINYA */}
            {myTransactions.map((trx) => (
              <TicketCard key={trx.id} trx={trx} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}