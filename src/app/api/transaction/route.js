import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Definisi schema validasi menggunakan Zod
const transactionSchema = z.object({
  eventId: z.string().min(1, "Event ID wajib diisi."),
  quantity: z.number().int().min(1, "Minimal pembelian 1 tiket.").max(5, "Maksimal pembelian 5 tiket.").default(1),
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const body = await req.json();
    
    // Validasi input menggunakan schema Zod
    const parsedData = transactionSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors[0].message }, { status: 400 });
    }
    
    const { eventId, quantity } = parsedData.data;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const result = await prisma.$transaction(async (tx) => {
      
      const lockedEvent = await tx.$queryRaw`
        SELECT id, price, quota FROM "Event" WHERE id = ${eventId} FOR UPDATE
      `;

      if (!lockedEvent || lockedEvent.length === 0) {
        throw new Error("Acara tidak ditemukan.");
      }
      
      const eventData = lockedEvent[0];

      // VALIDASI QC: Cek apakah sisa kuota cukup untuk jumlah yang dibeli
      if (eventData.quota < quantity) {
        throw new Error(`Maaf, sisa kuota hanya ${eventData.quota} tiket!`);
      }

      // Kalikan harga dengan jumlah tiket
      const newTransaction = await tx.transaction.create({
        data: {
          userId: currentUser.id,
          eventId: eventData.id,
          totalAmount: eventData.price * quantity, 
          status: "SUCCESS", 
        },
      });

      // Cetak tiket sebanyak quantity menggunakan createMany
      const ticketsToCreate = Array.from({ length: quantity }).map(() => ({
        eventId: eventData.id,
        transactionId: newTransaction.id,
      }));

      await tx.ticket.createMany({
        data: ticketsToCreate,
      });

      // Kurangi kuota sesuai jumlah yang dibeli
      await tx.event.update({
        where: { id: eventData.id },
        data: { quota: { decrement: quantity } },
      });

      return { transaction: newTransaction };
    });

    return NextResponse.json({ 
      message: "Pembelian tiket berhasil!", 
      data: result 
    }, { status: 200 });

  } catch (error) {
    console.error("TRANSACTION ERROR:", error.message);
    
    if (error.message.includes("sisa kuota") || error.message.includes("tidak ditemukan")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}