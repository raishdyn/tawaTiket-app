import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    // 1. Validasi Keamanan: Hanya Admin yang boleh men-scan tiket
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 2. Tangkap ID Tiket dari kamera Scanner
    const body = await req.json();
    const { ticketId } = body;

    if (!ticketId) return NextResponse.json({ error: "ID Tiket tidak valid." }, { status: 400 });

    // 3. Cari data tiket, acara, dan pembelinya di database
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        transaction: {
          include: { user: true }
        }
      }
    });

    // 4. THE GATEKEEPER LOGIC (Logika Validasi Penjaga Pintu)
    if (!ticket) {
      return NextResponse.json({ error: "TIKET PALSU! Data tidak ditemukan di sistem." }, { status: 404 });
    }

    if (ticket.isUsed) {
      return NextResponse.json({ error: "DITOLAK! Tiket ini sudah di-scan sebelumnya." }, { status: 400 });
    }

    if (ticket.transaction.status !== "SUCCESS") {
      return NextResponse.json({ error: "DITOLAK! Transaksi belum lunas." }, { status: 400 });
    }

    // 5. Tandai tiket sebagai TERPAKAI (Sobek tiket secara digital)
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { isUsed: true },
    });

    return NextResponse.json({ 
      message: "TIKET VALID! Silakan masuk.",
      data: {
        eventName: ticket.event.title,
        buyerName: ticket.transaction.user.name
      }
    }, { status: 200 });

  } catch (error) {
    console.error("SCAN ERROR:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}