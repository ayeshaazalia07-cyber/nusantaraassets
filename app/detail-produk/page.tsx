"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DetailContent() {
  const searchParams = useSearchParams();

  // Ambil data dari URL (seperti logika muatDataProduk di HTML lama)
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
          {/* GANTI TOMBOL LAMA DENGAN INI */}
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
              keranjang.push({ nama, harga }); // Data nama & harga diambil dari URL params tadi
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
              // Cek login dulu sebelum beli langsung
              const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
              if (!isLoggedIn) {
                alert("Ups! Kamu harus login dulu sebelum membeli.");
                window.location.href = "/login";
                return;
              }
              // Langsung pindah ke pembayaran
              window.location.href = "/pembayaran";
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
