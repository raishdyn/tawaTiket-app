import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 1. Tipografi Utama: Plus Jakarta Sans (Kesan modern, geometris, dan premium)
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap", // Mencegah FOIT (Flash of Invisible Text) saat loading
  variable: "--font-jakarta", 
});

// 2. Tipografi Mono: JetBrains Mono (Memberikan kesan 'techy' dan rapi pada ID Invoice/Tiket)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// 3. Metadata Profesional & SEO (Selamat tinggal "Create Next App")
export const metadata = {
  title: "Standup Ticketing | Exclusive Event Platform",
  description: "Platform pembelian tiket stand-up comedy premium dengan sistem anti-overbooking.",
  keywords: "standup, comedy, tiket, event, booking",

  robots: {
    index: false,    
    follow: false,   
    nocache: true,   
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true, 
    },
  },

};

export const viewport = {
  themeColor: "#4f46e5", // Mengubah warna bingkai browser mobile Chrome menjadi Indigo
};

export default function RootLayout({ children }) {
  return (
    // 'scroll-smooth' agar animasi scroll saat klik link (anchor) terasa elegan
    <html lang="id" className="scroll-smooth">
      <body
        className={`
          ${jakarta.className} 
          antialiased 
          bg-slate-50 
          text-slate-900 
          selection:bg-indigo-500 selection:text-white 
          min-h-screen flex flex-col
        `}
      >
        {children}
      </body>
    </html>
  );
}