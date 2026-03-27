import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Di Next.js, nama fungsi menentukan HTTP Method (POST, GET, PUT, DELETE)
export async function POST(request) {
  try {
    // 1. Tangkap data dari frontend (mirip $request->all() di Laravel)
    const body = await request.json();
    const { name, email, password } = body;

    // 2. Validasi sederhana
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Semua kolom wajib diisi" }, { status: 400 });
    }

    // 3. Cek apakah email sudah pernah dipakai
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });
    }

    // 4. Acak (Hash) password sebelum disimpan ke PostgreSQL
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Simpan user baru ke database menggunakan Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER" // Default pendaftar adalah pembeli tiket (USER)
      }
    });

    return NextResponse.json({ message: "Registrasi berhasil", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Error Register:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}