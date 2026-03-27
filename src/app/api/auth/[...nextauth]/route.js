import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; 
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@contoh.com" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Jika user tidak ada
        if (!user) {
          throw new Error("Email tidak terdaftar");
        }

        // 3. Cocokkan password yang diketik dengan password acak (hash) di database
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error("Password salah");
        }

        // 4. Jika sukses, kembalikan data user (ini akan disimpan di Session/Cookie browser)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Penting untuk membedakan Admin dan Pembeli tiket
        };
      }
    })
  ],
  session: {
    strategy: "jwt", // Menggunakan JSON Web Token
  },
  callbacks: {
    // Menyisipkan Role dan ID ke dalam Token agar bisa dibaca di Frontend
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  // Halaman custom jika kita mau buat UI Login sendiri nantinya
  pages: {
    signIn: '/login', 
  }
};

const handler = NextAuth(authOptions);

// Di Next.js App Router, kita wajib meng-export method GET dan POST
export { handler as GET, handler as POST };