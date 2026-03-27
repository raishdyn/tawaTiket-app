const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding database...");

  // (Opsional) Hapus data event lama agar tidak menumpuk/ganda jika script dijalankan berkali-kali
  await prisma.event.deleteMany();

 
  const events = await prisma.event.createMany({
    data: [
      {
        title: "Raditya Dika - Cerita Cintaku",
        description: "Tur stand-up comedy spesial membahas problematika cinta masa kini dengan sudut pandang yang absurd namun logis.",
        date: new Date("2026-05-20T19:00:00Z"), // Format ISO (Tahun-Bulan-Tanggal)
        location: "Jakarta, Balai Sarbini",
        price: 250000,
        quota: 100,
      },
      {
        title: "Pandji Pragiwaksono - Mens Rea",
        description: "Stand-up show eksklusif yang membahas niat jahat, komedi gelap, dan realita sosial masyarakat.",
        date: new Date("2026-06-15T20:00:00Z"),
        location: "Bandung, Sabuga",
        price: 200000,
        quota: 50,
      },
      {
        title: "Abdur Arsyad - Pahlawan Perlu Tanda Jasa",
        description: "Kritik sosial tajam dibalut komedi cerdas ala Indonesia Timur yang akan mengocok perut sekaligus pikiran.",
        date: new Date("2026-07-10T19:30:00Z"),
        location: "Surabaya, Dyandra Convention Center",
        price: 150000,
        quota: 150,
      }
    ],
  });

  console.log(`Seeding sukses! Berhasil menambahkan ${events.count} acara stand-up comedy. 🚀`);
}

main()
  .catch((e) => {
    console.error("Terjadi kesalahan saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Menutup koneksi database setelah selesai
    await prisma.$disconnect();
  });