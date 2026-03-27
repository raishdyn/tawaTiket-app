/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.7'],
  
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, 
    ],
  },

  // SECURITY HEADERS ANTI-DEFACEMENT
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff", 
          },
          {
            key: "X-Frame-Options",
            value: "DENY", 
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", 
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          }
        ],
      },
    ];
  },
};

export default nextConfig;