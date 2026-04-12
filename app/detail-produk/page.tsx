"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase"; //
import { onAuthStateChanged } from "firebase/auth"; //

function DetailContent() {
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Pantau status login secara real-time dari Firebase agar sinkron dengan Navbar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Ambil data dari URL (logika muatDataProduk)
  const nama = searchParams.get("nama") || "Aset Nusantara";
  const harga = searchParams.get("harga") || "Rp 70k";
  const desc =
    searchParams.get("desc") ||
    "Aset berkualitas tinggi dari kebudayaan Nusantara.";

  return (
    <main
      style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white" }}
    >
      <nav id="navbar">
        <div className="logo-wrapper">
          <div className="logo">
            Nusantara<span>Assets</span>
          </div>
        </div>
        <div className="nav-menu">
          <ul>
            <li>
              <a href="/katalog">Kembali ke Katalog</a>
            </li>
          </ul>
        </div>
      </nav>

      <div
        className="detail-wrapper"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "120px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            aspectRatio: "16/9",
            background: "#1e293b",
            borderRadius: "25px",
            border: "2px solid #ffd700",
            margin: "0 auto 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/img/logo-preview.jpg"
            alt="Preview"
            style={{ width: "100%", borderRadius: "23px" }}
          />
        </div>

        <h1
          style={{ fontSize: "2.5rem", color: "#ffd700", marginBottom: "10px" }}
        >
          {nama}
        </h1>
        <p
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {harga}
        </p>

        <p
          style={{
            color: "#94a3b8",
            lineHeight: "1.6",
            marginBottom: "40px",
            maxWidth: "700px",
            margin: "0 auto 40px",
          }}
        >
          {desc}
        </p>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <button
            className="btn-cart"
            style={{
              padding: "15px 40px",
              background: "transparent",
              border: "2px solid #ffd700",
              color: "#ffd700",
              borderRadius: "15px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => {
              const keranjang = JSON.parse(
                localStorage.getItem("nusantaraCart") || "[]",
              );
              keranjang.push({ nama, harga });
              localStorage.setItem("nusantaraCart", JSON.stringify(keranjang));
              alert("Berhasil masuk keranjang! 🛒");
              window.location.href = "/keranjang";
            }}
          >
            🛒 + Keranjang
          </button>

          <button
            className="btn-buy"
            style={{
              padding: "15px 40px",
              background: "#ffd700",
              color: "#0f172a",
              borderRadius: "15px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => {
              // 1. Cek status login
              if (!isLoggedIn) {
                alert("Ups! Kamu harus login dulu sebelum membeli.");
                window.location.href = "/login";
                return;
              }

              // 2. Jika sudah login, kirim data nama dan harga ke URL pembayaran
              // Menggunakan encodeURIComponent agar karakter seperti spasi atau simbol tetap aman di URL
              window.location.href = `/pembayaran?nama=${encodeURIComponent(nama)}&harga=${encodeURIComponent(harga)}`;
            }}
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </main>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}
