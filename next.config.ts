import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.8"],

  images: {
    remotePatterns: [
      {
        // 1. Izin untuk Supabase (Katalog Produk)
        protocol: "https",
        hostname: "ecmtooixzruszxbggsas.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // 2. Izin untuk Firebase Storage kamu (Bukti Pembayaran)
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/nusantaraassets-5.firebasestorage.app/**",
      },
    ],
  },
};

export default nextConfig;
