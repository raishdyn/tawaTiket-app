import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ZOD SCHEMA: Sang Penjaga Gerbang Anti-Defacement (Versi Edit)
const eventSchema = z.object({
  title: z.string().min(3, "Judul terlalu pendek.")
    .regex(/^[^<>]+$/, "Dilarang menggunakan karakter HTML (< atau >) pada judul!"),
  
  description: z.string().min(10, "Deskripsi terlalu pendek.")
    .regex(/^[^<>]+$/, "Dilarang menggunakan karakter HTML (< atau >) pada deskripsi!"),
  
  date: z.string(),
  
  location: z.string().min(3, "Lokasi terlalu pendek.")
    .regex(/^[^<>]+$/, "Dilarang menggunakan karakter HTML (< atau >) pada lokasi!"),
  
  price: z.preprocess((val) => parseInt(val, 10), z.number().min(0, "Harga tidak valid.")),
  quota: z.preprocess((val) => parseInt(val, 10), z.number().min(1, "Kuota minimal 1.")),
  
  // Menerima update URL gambar
  performerImage: z.string().url("URL gambar tidak valid!").optional().or(z.literal("")),
});

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    await prisma.event.delete({
      where: { id: id },
    });

    revalidatePath("/");

    return NextResponse.json({ message: "Acara berhasil dihapus dari sistem." }, { status: 200 });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    return NextResponse.json({ error: "Gagal menghapus acara. Pastikan tidak ada tiket yang sudah terjual untuk acara ini." }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id: id },
    });

    if (!event) {
      return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data acara" }, { status: 500 });
  }
}

// Fungsi PUT: Memperbarui data acara di database beserta foto
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    
    // Validasi Zod
    const parsedData = eventSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors[0].message }, { status: 400 });
    }

    const { title, description, date, location, price, quota, performerImage } = parsedData.data;

    // Eksekusi Update
    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
        price,
        quota,
        performerImage: performerImage || null, // Perbarui gambar di DB
      },
    });

    revalidatePath("/");

    return NextResponse.json({ message: "Acara berhasil diperbarui!", data: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    return NextResponse.json({ error: "Gagal memperbarui acara." }, { status: 500 });
  }
}