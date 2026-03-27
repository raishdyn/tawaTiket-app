import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// ZOD SCHEMA: Sang Penjaga Gerbang Anti-Defacement
const eventSchema = z.object({
  title: z.string().min(3, "Judul terlalu pendek.")
    .regex(/^[^<>]+$/, "Dilarang menggunakan karakter HTML (< atau >) pada judul!"),
  
  description: z.string().min(10, "Deskripsi terlalu pendek.")
    .regex(/^[^<>]+$/, "Dilarang menggunakan karakter HTML (< atau >) pada deskripsi!"),
  
  date: z.string(),
  
  location: z.string().min(3, "Lokasi terlalu pendek.")
    .regex(/^[^<>]+$/, "Dilarang menggunakan karakter HTML (< atau >) pada lokasi!"),
  
  // Mengubah input string menjadi angka secara otomatis
  price: z.preprocess((val) => parseInt(val, 10), z.number().min(0, "Harga tidak valid.")),
  quota: z.preprocess((val) => parseInt(val, 10), z.number().min(1, "Kuota minimal 1.")),
  
  // Menerima input foto opsional
  performerImage: z.string().url("URL gambar tidak valid!").optional().or(z.literal("")),
});

export async function POST(req) {
  try {
    // 1. Lapis Keamanan 1: Cek apakah user login
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Lapis Keamanan 2 (RBAC): Cek apakah user adalah ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Hanya Admin yang diizinkan." }, { status: 403 });
    }

    // 3. Tangkap data dan Validasi dengan Zod (Lapis 3: Anti-Defacement)
    const body = await req.json();
    const parsedData = eventSchema.safeParse(body);
    
    if (!parsedData.success) {
      return NextResponse.json({ error: parsedData.error.errors[0].message }, { status: 400 });
    }

    const { title, description, date, location, price, quota, performerImage } = parsedData.data;

    // 4. Masukkan data ke PostgreSQL
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date), 
        location,
        price, 
        quota, 
        performerImage: performerImage || null, // Masukkan foto jika ada
      },
    });

    return NextResponse.json({ message: "Acara berhasil ditambahkan!", data: newEvent }, { status: 201 });

  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat menyimpan acara." }, { status: 500 });
  }
}